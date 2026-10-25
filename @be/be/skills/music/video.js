'use strict';
// Recipes-style playback: HTML media decoded by Electron, drawn in the face's
// existing PIXI scene. Controls stay in that scene and the face keeps updating.
const EventEmitter = require('events');
const diagnostics = require('./diagnostics');
const timers = require('timers');
const BufferedMedia = require('./buffered-media');
const videoFrames = require('./video-frames');
let currentSession = null;
const START_BUFFER_SECONDS = 3, REBUFFER_SECONDS = 5;
const START_TIMEOUT_MS = 25000, STALL_TIMEOUT_MS = 15000;
function monotonic() { const t = process.hrtime(); return t[0] * 1000 + t[1] / 1e6; }
const INTERRUPTS = [['jetstream', 'hjHeard'], ['jetstream', 'localTurnStarted'], ['jetstream', 'globalTurnStarted'], ['jetstream', 'skillSwitch'], ['system', 'touchOn'], ['system', 'hatchOpen']];
class Session extends EventEmitter {
    constructor(options) {
        super();
        this.options = options; this.state = 'starting'; this.stopped = false;
        this.detach = []; this.elements = []; this.wantPause = false;
        this.now = options.now || monotonic; this.hasPlayed = false; this.lastPosition = 0; this.lastFrames = null;
        this.startAt = this.lastProgress = this.now();
        this.bufferGoal = START_BUFFER_SECONDS; this.rebuffering = false; this.playAttempt = 0;
        // Defer setup so the owner can subscribe to error/state first.
        this.startTimer = timers.setTimeout(() => this.start(), 0);
    }
    active() { return !this.stopped && currentSession === this; }
    listen(target, name, handler) {
        target.addEventListener(name, handler);
        this.detach.push(() => target.removeEventListener(name, handler));
    }
    stateChanged(state, extra) {
        if (!this.active()) return;
        this.state = state; this.emit('state', Object.assign({ state: state }, extra || {}));
    }
    start() {
        if (!this.active()) return;
        try {
            const doc = this.options.document || document, PIXI = this.options.PIXI || global.PIXI;
            const stage = this.options.stage;
            if (!stage || !PIXI || !PIXI.VideoBaseTexture) throw Error('face_video_unavailable');
            this.mount = doc.createElement('div');
            Object.assign(this.mount.style, { position: 'absolute', opacity: '0', width: '1px', height: '1px', overflow: 'hidden', pointerEvents: 'none' });
            doc.body.appendChild(this.mount);
            this.media = doc.createElement('video');
            this.media.setAttribute('playsinline', ''); this.media.preload = 'auto'; this.media.crossOrigin = 'anonymous';
            this.media.muted = !this.options.audio || (!!this.options.audioUrl && !this.options.videoMime);
            this.media.volume = this.options.volume == null ? 1 : this.options.volume;
            this.elements.push(this.media); this.mount.appendChild(this.media);
            if (this.options.audioUrl && !this.options.videoMime) {
                this.audio = doc.createElement('audio'); this.audio.preload = 'auto'; this.audio.crossOrigin = 'anonymous';
                this.audio.volume = this.media.volume;
                this.elements.push(this.audio); this.mount.appendChild(this.audio);
            }
            this.container = new PIXI.Container(); this.container.interactive = false;
            const black = new PIXI.Graphics(); black.beginFill(0); black.drawRect(0, 0, 1280, 720); black.endFill();
            this.container.addChild(black);
            // Avoid VideoBaseTexture auto-playing video before separate audio is ready.
            this.media.autoplay = false;
            this.baseTexture = new PIXI.VideoBaseTexture(this.media);
            this.baseTexture.autoPlay = false; this.baseTexture.autoUpdate = false;
            this.stopFrames = videoFrames(this.media, this.baseTexture, this.options.frameScheduler);
            this.texture = new PIXI.Texture(this.baseTexture);
            this.sprite = new PIXI.Sprite(this.texture); this.sprite.interactive = false;
            this.container.addChild(this.sprite); stage.addChild(this.container);
            this.stateChanged('starting');
            this.elements.forEach(element => {
                this.listen(element, 'loadeddata', () => { this.fit(); this.tryPlay(); });
                this.listen(element, 'canplay', () => this.tryPlay());
                this.listen(element, 'progress', () => this.tryPlay());
                this.listen(element, 'canplaythrough', () => this.tryPlay());
                this.listen(element, 'waiting', () => {
                    if (!this.active() || this.wantPause) return;
                    this.playAttempt++; this.playPending = false;
                    this.rebuffering = true; this.bufferGoal = REBUFFER_SECONDS;
                    this.elements.forEach(media => media.pause());
                    if (this.audio) this.audio.playbackRate = 1;
                    this.stateChanged('buffering');
                });
                this.listen(element, 'error', () => {
                    const error = element.error;
                    this.fail('media_' + (error && error.code || 'unknown'), error && error.message || 'Media could not be loaded');
                });
            });
            this.listen(this.media, 'playing', () => {
                if (!this.active() || this.wantPause || this.rebuffering) return;
                if (!this.hasPlayed) { this.hasPlayed = true; this.lastProgress = this.now(); }
                this.stateChanged('playing');
            });
            this.listen(this.media, 'ended', () => {
                if (this.audio) this.audio.pause();
                this.wantPause = true; this.stateChanged('ended');
            });
            this.listen(this.media, 'loadedmetadata', () => this.fit());
            if (this.options.interrupts !== false) this.watchInterrupts();
            this.syncTimer = timers.setInterval(() => this.sync(), 500);
            if (this.options.videoMime) {
                this.bufferedMedia = new BufferedMedia(this.media, this.options, (reason, detail) => this.fail(reason, detail));
            } else {
                this.media.src = this.options.url;
                if (this.audio) this.audio.src = this.options.audioUrl;
            }
            this.elements.forEach(element => element.load());
        } catch (error) { this.fail('start_failed', error.message || String(error)); }
    }
    startupTimeout() {
        if (!this.active()) return;
        const states = this.elements.map(element => {
            const ranges = [];
            for (let i = 0; element.buffered && i < element.buffered.length; i++) ranges.push([element.buffered.start(i), element.buffered.end(i)]);
            return { ready: element.readyState, network: element.networkState, time: element.currentTime, ranges: ranges };
        });
        diagnostics.record('startup buffers', JSON.stringify(states));
        this.fail('media_timeout', 'Video did not become playable');
    }
    fit() {
        if (!this.sprite) return;
        const width = this.media.videoWidth || 1280, height = this.media.videoHeight || 720;
        const box = this.options.viewport || { x: 0, y: 0, width: 1280, height: 720 };
        const scale = Math.min(box.width / width, box.height / height);
        this.sprite.width = width * scale; this.sprite.height = height * scale;
        this.sprite.x = box.x + (box.width - this.sprite.width) / 2; this.sprite.y = box.y + (box.height - this.sprite.height) / 2;
    }
    bufferedEnough(element) {
        // HAVE_CURRENT_DATA (2) can be one frame. canplay is also not a promise
        // of enough network buffer; require real time ranges for both tracks.
        if (element.readyState < 3 || !element.buffered) return false;
        const at = Number(element.currentTime) || 0;
        for (let i = 0; i < element.buffered.length; i++) {
            const start = element.buffered.start(i), end = element.buffered.end(i);
            if (start > at + 0.25 || end <= at) continue;
            if (end - at >= this.bufferGoal) return true;
            // Short clips and the final few seconds need no extra headroom
            // once all the remaining data has arrived.
            const expected = Number(this.options.duration);
            const duration = expected > 0 ? Math.min(Number(element.duration) || Infinity, expected) : Number(element.duration);
            if (isFinite(duration) && duration > 0 && end >= duration - 0.1) return true;
        }
        return false;
    }
    tryPlay() {
        if (!this.active() || this.wantPause || this.playPending) return;
        if (this.elements.every(element => !element.paused)) return;
        // DASH video may begin a few milliseconds after zero. With MSE this
        // seek stays inside already downloaded data and cannot restart HTTP.
        if (this.bufferedMedia && this.media.readyState >= 1 && this.media.buffered.length) {
            const first = this.media.buffered.start(0), at = this.media.currentTime || 0;
            if (first > at && first - at <= 0.25) this.media.currentTime = first;
        }
        if (this.elements.some(element => !this.bufferedEnough(element))) return;
        this.rebuffering = false;
        this.playPending = true;
        const attempt = ++this.playAttempt;
        const promise = media => {
            try { return Promise.resolve(media.play()); } catch (error) { return Promise.reject(error); }
        };
        Promise.all(this.elements.map(promise)).then(() => {
            if (attempt === this.playAttempt) this.playPending = false;
        }, error => {
            // waiting/pause can abort a pending play promise; ignore that older
            // attempt instead of undoing the new buffering decision.
            if (attempt !== this.playAttempt) return;
            this.playPending = false;
            if (this.active() && !this.wantPause && (!error || error.name !== 'AbortError')) this.fail('media_play', error && error.message || 'Media play failed');
        });
    }
    watchProgress() {
        if (!this.active() || this.wantPause || this.state === 'ended' || !this.media) return;
        const now = this.now(), position = this.position(), frames = this.media.webkitDecodedFrameCount;
        const advanced = position > this.lastPosition + 0.01 && (typeof frames !== 'number' || this.lastFrames == null || frames > this.lastFrames);
        if (advanced) { this.lastProgress = now; this.lastPosition = position; this.lastFrames = typeof frames === 'number' ? frames : null; }
        if (!this.hasPlayed && now - this.startAt >= START_TIMEOUT_MS) this.startupTimeout();
        else if (this.hasPlayed && now - this.lastProgress >= STALL_TIMEOUT_MS) this.fail('playback_stalled', 'Playback stopped making progress');
    }
    sync() {
        this.watchProgress();
        if (!this.active() || this.wantPause) return;
        if (this.state === 'buffering' || this.state === 'starting' || this.state === 'paused') { this.tryPlay(); return; }
        if (!this.audio || this.state !== 'playing' || this.media.paused || this.audio.paused) return;
        // These proxy URLs are sequential, non-rangeable MP4 streams. Assigning
        // currentTime can restart a download and replay the same audio slice.
        // Gently follow the video clock without seeking or changing that URL.
        const skew = this.audio.currentTime - this.media.currentTime;
        this.audio.playbackRate = Math.abs(skew) < 0.08 ? 1 : Math.max(0.95, Math.min(1.05, 1 - skew * 0.1));
    }
    position() { return this.media && Number(this.media.currentTime) || 0; }
    pause() {
        this.wantPause = true; this.playAttempt++; this.playPending = false;
        this.elements.forEach(element => element.pause());
        if (this.audio) this.audio.playbackRate = 1;
        this.stateChanged('paused'); return this;
    }
    show() { this.wantPause = false; this.startAt = this.lastProgress = this.now(); this.tryPlay(); return this; }
    hide() { return this.pause(); }
    status() { return this; }
    // Existing control sprites already sit above the texture; no X window holes.
    setHoles() { return this; }
    watchInterrupts() {
        const jibo = this.options.jibo || require('jibo');
        INTERRUPTS.forEach(pair => {
            const event = jibo[pair[0]] && jibo[pair[0]].events && jibo[pair[0]].events[pair[1]];
            if (!event || !event.on || !event.off) return;
            const handler = () => { if (this.active()) this.stop('interrupted:' + pair[1]); };
            event.on(handler); this.detach.push(() => event.off(handler));
        });
    }
    fail(reason, detail) {
        if (!this.active()) return;
        this.lastError = { reason: reason, detail: detail };
        diagnostics.record('video ' + reason, detail);
        this.emit('error', this.lastError);
        this.stop('play_error');
    }
    stop(reason) {
        if (this.stopped) return Promise.resolve();
        const position = this.position();
        this.stopped = true;
        timers.clearTimeout(this.startTimer); timers.clearInterval(this.syncTimer);
        this.detach.forEach(off => { try { off(); } catch (_) {} }); this.detach = [];
        if (this.stopFrames) { this.stopFrames(); this.stopFrames = null; }
        if (this.bufferedMedia) { this.bufferedMedia.close(); this.bufferedMedia = null; }
        this.elements.forEach(element => {
            try { element.pause(); element.removeAttribute('src'); element.load(); } catch (_) {}
        });
        this.elements = [];
        if (this.container) {
            if (this.container.parent) this.container.parent.removeChild(this.container);
            try { this.container.destroy({ children: true }); } catch (_) {}
        }
        try { if (this.texture) this.texture.destroy(true); else if (this.baseTexture) this.baseTexture.destroy(); } catch (_) {}
        if (this.mount && this.mount.parentNode) this.mount.parentNode.removeChild(this.mount);
        this.container = this.sprite = this.texture = this.baseTexture = this.mount = this.media = this.audio = null;
        if (currentSession === this) currentSession = null;
        this.state = 'stopped'; this.emit('state', { state: 'stopped', reason: reason || 'request', error: this.lastError || null, position: position });
        return Promise.resolve();
    }
}
function open(options) {
    if (!options || !/^https?:\/\//.test(options.url || '')) throw Error('video_url_required');
    if (currentSession) currentSession.stop('replaced');
    currentSession = new Session(options); return currentSession;
}
function stopAll(reason) { return currentSession ? currentSession.stop(reason || 'request') : Promise.resolve(); }
module.exports = { open: open, current: () => currentSession, stopAll: stopAll, shutdown: () => stopAll('shutdown') };
