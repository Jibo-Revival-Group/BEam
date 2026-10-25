'use strict';

const jibo = require('jibo'), BeSkill = require('@be/be-framework').BeSkill;
const service = require('./service'), Client = require('./client'), video = require('./video');
const lifecycle = require('./touch-lifecycle'), UI = require('./ui'), Detector = require('./format');
function launchRequest(result) {
    const entities = result && result.nlu && result.nlu.entities || {};
    return { title: typeof entities.query === 'string' ? entities.query.trim().slice(0, 160) : '',
        artist: typeof entities.artist === 'string' ? entities.artist.trim().slice(0, 120) : '' };
}
class MusicSkill extends BeSkill {
    constructor() {
        super(...arguments); this.generation = 0; this.view = null; this.events = []; this.session = null; this.closing = null;
    }
    open(result) {
        if (this.view) {
            this.close(error => { if (!error) this.open(result); }); return;
        }
        const request = launchRequest(result), generation = ++this.generation;
        this.closing = null; this.leaving = false;
        this.state = { phase: 'loading', position: 0, song: null, format: 'video', message: request.title ? 'Finding ' + request.title + '…' : 'Ask me to play a song by name.' };
        const actions = { toggle: () => this.toggle(), back: () => this.seek(-15), forward: () => this.seek(15),
            quieter: () => this.volume(-1), louder: () => this.volume(1), stop: () => this.leave() };
        const views = jibo.face.views;
        this.ui = new UI(actions);
        const view = this.view = lifecycle.prepareView(views.createView('View', this.ui.config(views)));
        view.addAction(views.ActionData.CALLBACK, { callback: () => this.leave() }, true, false, views.GESTURE.SWIPE_DOWN);
        const current = () => this.current(generation);
        const ready = () => {
            if (!current()) return;
            ['hjHeard', 'localTurnStarted', 'globalTurnStarted', 'skillSwitch'].forEach(name => this.watch(jibo.jetstream, name));
            ['touchOn', 'hatchOpen'].forEach(name => this.watch(jibo.system, name));
            this.timer = setInterval(() => this.tick(), 1000);
            if (!request.title) return;
            try { this.client = new Client(service.settings()); }
            catch (_) { this.fail('storage_unavailable'); return; }
            service.ensure().then(ok => {
                if (!current()) return;
                if (!ok) throw Error('service_unavailable');
                return this.client.resolve(request).then(song => {
                    if (!current()) return;
                    this.state.song = song; this.state.format = song.format; this.detector = new Detector(song.format);
                    this.ui.artwork(this.client.media('/art/' + song.id), () => { if (current()) this.render(); });
                    return this.startAt(0);
                });
            }).catch(error => { if (current()) this.fail(error.message); });
        };
        views.changeView({ addView: view, transitionOpen: views.TRANSITION.IN, transitionClose: views.TRANSITION.OUT }, ready,
            () => { if (current()) this.leave(); }, () => {
                if (!current()) return;
                this.ui.decorate(view, global.PIXI); this.render();
            });
    }
    current(generation) { return generation === this.generation && !this.leaving && !!this.view; }
    watch(owner, name) {
        const event = owner && owner.events && owner.events[name];
        if (!event || !event.on || !event.off) return;
        const handler = () => this.leave(); event.on(handler); this.events.push(() => event.off(handler));
    }
    render() { if (this.ui) this.ui.render(this.state, this.session); }
    startAt(seconds) {
        const generation = this.generation, ticket = this.playTicket = (this.playTicket || 0) + 1;
        const current = () => this.current(generation) && ticket === this.playTicket;
        const stop = this.session ? this.session.stop('seek') : Promise.resolve(); this.session = null;
        this.state.phase = 'loading'; this.state.message = 'Getting the song ready…'; this.render();
        if (this.detector) this.detector.reset();
        return stop.then(() => this.client.stream(this.state.song.id, seconds)).then(info => {
            if (!current()) return;
            this.offset = info.start || 0;
            const session = this.session = video.open({ url: this.client.media(info.video), audioUrl: this.client.media(info.audio),
                videoMime: info.videoMime, audioMime: info.audioMime, audio: true, duration: this.state.song.duration - this.offset,
                stage: this.ui.mediaLayer, jibo: jibo, interrupts: false });
            session.on('error', error => { if (current()) this.fail(error.reason); });
            session.on('state', event => {
                if (!current() || this.session !== session || event.state === 'stopped') return;
                this.state.phase = event.state;
                this.state.message = { starting: 'Starting music…', buffering: 'Buffering…', paused: 'Paused', ended: 'Song finished' }[event.state] || '';
                if (event.state !== 'playing') this.detector.reset();
                this.render();
            });
            this.render();
        }).catch(error => { if (current()) this.fail(error.message); });
    }
    tick() {
        if (!this.session || !this.state.song) return;
        this.state.position = Math.min(this.state.song.duration, this.offset + this.session.position());
        const media = this.session.media;
        if (media && media.readyState >= 2 && this.state.phase === 'playing') {
            try {
                if (!this.canvas) { this.canvas = document.createElement('canvas'); this.canvas.width = 32; this.canvas.height = 18; }
                const context = this.canvas.getContext('2d'); context.drawImage(media, 0, 0, 32, 18);
                this.state.format = this.detector.sample(context.getImageData(0, 0, 32, 18).data, this.state.position, !media.paused && !media.seeking);
            } catch (_) { this.detector.reset(); }
        }
        this.render();
    }
    toggle() {
        if (!this.session) return;
        if (this.state.phase === 'ended') { this.startAt(0); return; }
        if (this.state.phase === 'paused') this.session.show(); else this.session.pause();
    }
    seek(delta) {
        if (!this.state.song || !/^(playing|paused|ended)$/.test(this.state.phase)) return;
        this.startAt(Math.max(0, Math.min(this.state.song.duration - 1, this.state.position + delta)));
    }
    volume(delta) {
        try { const volume = jibo.volume; const level = Math.max(volume.MIN_VOLUME, Math.min(volume.MAX_VOLUME, volume.currentVolume + delta)); volume.changeVolume('volumeToValue', level); } catch (_) {}
    }
    fail(code) {
        if (this.leaving) return;
        if (this.session) this.session.stop('error'); this.session = null;
        this.state.phase = 'error';
        this.state.message = code === 'song_not_found' ? 'I couldn’t find that song.' : /network|timeout/.test(code) ? 'I couldn’t connect to the music service. Try again.' : 'Music is unavailable right now. Try again.';
        this.render();
        if (code === 'song_not_found') {
            try { this.speaking = true; Promise.resolve(jibo.tts.speak("I couldn't find that song.")).catch(() => {}).then(() => { this.speaking = false; }); } catch (_) { this.speaking = false; }
        }
    }
    leave() { if (this.leaving) return; this.leaving = true; this.exit({ noElementsOfSurprise: true }); }
    close(done) {
        done = done || (() => {});
        if (this.closing) {
            if (this.closing.finished) done(this.closing.error); else this.closing.callbacks.push(done);
            return;
        }
        const closing = this.closing = { finished: false, error: null, callbacks: [done] };
        ++this.generation; this.leaving = true; clearInterval(this.timer); this.timer = null;
        this.events.forEach(off => { try { off(); } catch (_) {} }); this.events = [];
        if (this.client) this.client.close(); this.client = null;
        if (this.speaking) { try { Promise.resolve(jibo.tts.stop()).catch(() => {}); } catch (_) {} this.speaking = false; }
        const errors = [], attempt = action => Promise.resolve().then(action).catch(error => errors.push(error));
        const finish = error => {
            closing.finished = true; closing.error = errors[0] || error || null;
            if (!error) { this.view = null; this.ui = null; }
            closing.callbacks.splice(0).forEach(callback => callback(closing.error));
        };
        Promise.all([attempt(() => video.shutdown()), attempt(() => service.stop()), attempt(() => { if (this.ui) this.ui.releaseArtwork(); })]).then(() => {
            this.session = null; this.canvas = null;
            lifecycle.closeView(jibo.face.views, jibo.face.tween, this.view, require('timers'), 'music', finish);
        }).catch(finish);
    }
    destroy(done) { this.close(error => super.destroy(baseError => done(error || baseError))); }
}
MusicSkill.launchRequest = launchRequest;
module.exports = MusicSkill;
