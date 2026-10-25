'use strict';

const STOP = /^(stop|stop chatting|exit ai mode|end conversation|cancel|goodbye)$/;
function isStop(text) { return STOP.test(text.toLowerCase().replace(/[.!?,]/g, '').trim()); }
function speechChunks(text) {
    // Escape provider text before giving it to the SLIM-capable TTS engine.
    const words = String(text).replace(/[*`#]/g, '').split(/\s+/), chunks = []; let chunk = '';
    words.forEach(word => {
        // Bound individual tokens as well as sentences for the native TTS limit.
        const safe = word.slice(0, 200).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        if ((chunk + ' ' + safe).length > 450) { chunks.push(chunk); chunk = ''; }
        chunk += (chunk ? ' ' : '') + safe;
    });
    if (chunk) chunks.push(chunk);
    return chunks;
}
class Runtime {
    constructor(jibo, PIXI, settings, provider, exit) {
        this.jibo = jibo; this.PIXI = PIXI; this.settings = settings; this.provider = provider; this.exit = exit;
        this.history = []; this.unwatch = []; this.active = false; this.phase = 'entering';
    }
    private() { return !!(this.jibo.privacyController && this.jibo.privacyController.enabled); }
    watch(event, handler) {
        if (!event || !event.on) return;
        event.on(handler); this.unwatch.push(() => event.off ? event.off(handler) : event.removeListener(handler));
    }
    open() {
        this.active = true;
        const jibo = this.jibo;
        if (this.private()) { this.leave(); return; }
        jibo.agentModeRuntime = this;
        this.monitor = setInterval(() => { if (this.private()) this.leave(); }, 50);
        Promise.resolve().then(() => {
            if (!this.active) return;
            this.config = this.settings.resolve({}, false);
            if (!this.settings.ready(this.config)) throw new Error('Configure Agent Mode in BEacon, under Etc, before we chat.');
            this.hotword = jibo.jetstream.setHotwordMode(jibo.jetstream.types.HotwordListenMode.Disabled);
            return this.hotword.activated;
        }).then(() => {
            if (!this.active) return;
            return jibo.expression.pushAttentionMode(jibo.expression.AttentionMode.OFF).then(handle => {
                if (!this.active) return handle.release();
                this.attention = handle;
            });
        }).then(() => {
            if (!this.active) return;
            const gestures = jibo.face.gestures;
            this.gesture = gestures.addStageGesture(gestures.hammer.Swipe, { event: 'agentSwipeDown', direction: gestures.hammer.DIRECTION_DOWN, threshold: 50, velocity: 0.3 }, () => this.leave());
            this.dot = new this.PIXI.Graphics();
            this.dot.beginFill(0x00ff00).drawCircle(jibo.face.width - 45, jibo.face.height - 45, 15).endFill();
            this.draw = () => this.render(); jibo.timer.on('update', this.draw);
            this.watch(jibo.jetstream.events.eos, () => {
                if (this.phase !== 'listening') return;
                this.phase = 'transcribing';
                // SOS clears the silence timer; bound a missing transcription too.
                clearTimeout(this.silence);
                this.silence = setTimeout(() => this.leave(), 60000);
            });
            this.watch(jibo.jetstream.events.sos, () => { if (this.phase === 'listening') { clearTimeout(this.silence); this.silence = null; } });
            this.watch(jibo.jetstream.events.skillSwitch, () => this.close());
            this.watch(jibo.jetstream.events.globalTurnStarted, () => this.leave());
            this.render();
            return this.speak('Sure. What would you like to talk about?').then(() => this.listen());
        }).catch(error => this.fail(error));
    }
    render() {
        if (!this.active || this.private()) return;
        const jibo = this.jibo, listening = this.phase === 'listening';
        if (this.dot && !this.dot.parent) jibo.face.views.addWatermark(this.dot);
        jibo.expression.setLEDColor(listening ? [0, 0.45, 1] : [0, 1, 0]);
        const eye = jibo.face.eye;
        if (this.eye !== eye) {
            this.removeFilter(); this.eye = eye;
            this.filter = new this.PIXI.filters.ColorMatrixFilter();
        }
        const filters = (eye.filters || []).filter(filter => filter !== this.filter);
        if (listening) {
            this.filter.matrix = [0.64,0,0,0,0, 0,0.85,0,0,0, 0,0,1,0,0, 0,0,0,1,0];
            filters.push(this.filter);
        }
        eye.filters = filters.length ? filters : null;
    }
    removeFilter() {
        if (this.eye && this.filter) {
            const remaining = (this.eye.filters || []).filter(filter => filter !== this.filter);
            this.eye.filters = remaining.length ? remaining : null;
        }
        this.eye = null; this.filter = null;
    }
    speak(text) {
        this.phase = 'speaking';
        return speechChunks(text).reduce((chain, chunk) => chain.then(() => {
            if (!this.active || this.private()) return;
            this.speaking = true;
            return Promise.resolve(this.jibo.tts.speak(chunk)).then(() => { this.speaking = false; });
        }), Promise.resolve());
    }
    listen() {
        if (!this.active || this.private()) return;
        const jibo = this.jibo;
        this.phase = 'listening'; this.render();
        if (!this.listenDeadline) this.listenDeadline = Date.now() + 60000;
        const remaining = this.listenDeadline - Date.now();
        if (remaining <= 0) { this.leave(); return; }
        clearTimeout(this.silence); this.silence = setTimeout(() => this.leave(), remaining);
        jibo.embodied.listen.disableOnce();
        return jibo.jetstream.startLocalTurn({ nluRules: ['agent/conversation'], sosTimeout: remaining / 1000, ignoreGlobalRules: true, ignoreHJ: true }).then(turn => {
            if (!this.active || this.private()) return turn.cancel();
            this.turn = turn;
            return turn.promise.then(result => {
                if (!this.active || this.turn !== turn) return;
                this.turn = null; clearTimeout(this.silence); this.silence = null;
                const types = jibo.jetstream.types.TurnResultType;
                if (result.status === types.INTERRUPTED || result.status === types.CANCELED) { this.leave(); return; }
                const text = result.result && (result.result.text || result.result.asr && result.result.asr.text) || '';
                if (!text.trim()) {
                    if (result.status === types.FAILED) throw new Error('I could not transcribe that. Please try chatting again.');
                    return this.listen();
                }
                this.listenDeadline = null;
                if (isStop(text)) { return this.speak('Okay. Talk to you later!').then(() => this.leave()); }
                this.phase = 'thinking'; this.history.push({ role: 'user', content: text.trim().slice(0, 12000) });
                while (this.history.length > 21 || (this.history.length > 1 && JSON.stringify(this.history).length > 24000)) this.history.splice(0, 2);
                const operation = this.operation = this.provider.chat(this.config, this.history);
                return operation.promise.then(reply => {
                    if (!this.active || this.operation !== operation) return;
                    this.operation = null; this.history.push({ role: 'assistant', content: reply });
                    return this.speak(reply).then(() => this.listen());
                });
            });
        }).catch(error => this.fail(error));
    }
    fail(error) {
        if (!this.active) return;
        // Only our local validation/provider errors may be spoken.
        const message = error && (error.status === 400 || /^Configure Agent Mode|^I could not transcribe/.test(error.message)) ? error.message : 'Conversation is unavailable right now. Please try again.';
        return this.speak(message).catch(() => {}).then(() => this.leave());
    }
    leave() {
        if (!this.active) return;
        this.close(); this.exit();
    }
    close() {
        if (this.closing) return this.closing;
        if (!this.active) return Promise.resolve();
        this.active = false;
        const jibo = this.jibo, cleanup = [];
        clearInterval(this.monitor); clearTimeout(this.silence); this.listenDeadline = null;
        this.unwatch.splice(0).forEach(off => off());
        if (this.draw) jibo.timer.off('update', this.draw);
        if (this.gesture) jibo.face.gestures.removeStageGesture(this.gesture);
        if (this.operation) this.operation.cancel(); this.operation = null;
        if (this.turn) cleanup.push(Promise.resolve(this.turn.cancel())); this.turn = null;
        if (this.speaking) cleanup.push(Promise.resolve(jibo.tts.stop())); this.speaking = false;
        if (this.attention) cleanup.push(Promise.resolve(this.attention.release())); this.attention = null;
        if (this.hotword) cleanup.push(Promise.resolve(this.hotword.release())); this.hotword = null;
        this.removeFilter();
        if (this.dot) {
            // Privacy may already own the watermark slot; never remove its red dot.
            if (jibo.face.views._waterMark === this.dot) jibo.face.views.removeWatermark();
            else if (this.dot.parent) this.dot.parent.removeChild(this.dot);
            this.dot.destroy(); this.dot = null;
        }
        if (!this.private()) jibo.expression.setLEDColor([0, 0, 0]);
        this.history = []; this.config = null;
        if (jibo.agentModeRuntime === this) jibo.agentModeRuntime = null;
        this.closing = Promise.all(cleanup.map(promise => promise.catch(() => {})));
        return this.closing;
    }
}
Runtime.isStop = isStop; Runtime.speechChunks = speechChunks;
module.exports = Runtime;
