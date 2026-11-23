'use strict';
const ThinkingEye = require('./thinking-eye'), esml = require('./esml'), image = require('./image-search');
const BYE = /^\s*BYE\W*$/im, LOOK = /^\s*LOOK\W*$/i, LOOKED = ' [You looked: Jibo took a photo for this message and you answered from it.]';

const STOP = new Set(['stop', 'stop chatting', 'exit ai mode', 'end conversation', 'cancel', 'goodbye', 'good bye', 'bye', 'bye bye']);
function isStop(text) {
    if (typeof text !== 'string') return false;
    let normalized = text.toLowerCase().replace(/[’']/g, '').replace(/[-_]/g, ' ')
        .replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
    normalized = normalized.replace(/^(?:okay|ok|alright) /, '').replace(/^(?:hey )?jibo /, '').replace(/ jibo$/, '');
    return STOP.has(normalized);
}
class Runtime {
    constructor(jibo, PIXI, settings, provider, exit, act) {
        this.jibo = jibo; this.PIXI = PIXI; this.settings = settings; this.provider = provider; this.exit = exit; this.act = act;
        this.history = []; this.unwatch = []; this.active = false; this.phase = 'entering';
        this.thinkingEye = new ThinkingEye(jibo, () => this.active && !this.private() && this.phase === 'thinking');
    }
    private() { return !!(this.jibo.privacyController && this.jibo.privacyController.enabled); }
    watch(event, handler) {
        if (!event || !event.on) return;
        event.on(handler); this.unwatch.push(() => event.off ? event.off(handler) : event.removeListener(handler));
    }
    // resume: the conversation to carry on after a quick action (comeback.js); no greeting, straight to listening.
    open(resume) {
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
            if (resume) { this.history = resume; return this.listen(); }
            return this.speak('Sure. What would you like to talk about?').then(() => this.listen());
        }).catch(error => this.fail(error));
    }
    render() {
        if (!this.active || this.private()) return;
        const jibo = this.jibo;
        if (this.dot && !this.dot.parent) jibo.face.views.addWatermark(this.dot);
        // While listening, Jibo's own listening eye and light ring show (embodied listen); otherwise green.
        if (this.phase !== 'listening') jibo.expression.setLEDColor([0, 1, 0]);
    }
    speak(text) {
        this.phase = 'speaking';
        // Embodied speech plays the reply's ESML (emojis, dances, animations); plain TTS would skip it.
        return esml.chunks(text).reduce((chain, chunk) => chain.then(() => {
            if (!this.active || this.private()) return;
            this.speaking = true;
            return Promise.resolve(this.jibo.embodied.speech.speak(chunk)).then(() => { this.speaking = false; });
        }), this.thinkingEye.stop());
    }
    listen() {
        if (!this.active || this.private()) return;
        const jibo = this.jibo;
        this.phase = 'listening'; this.render();
        if (!this.listenDeadline) this.listenDeadline = Date.now() + 60000;
        const remaining = this.listenDeadline - Date.now();
        if (remaining <= 0) { this.leave(); return; }
        clearTimeout(this.silence); this.silence = setTimeout(() => this.leave(), remaining);
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
                this.thinkingEye.start();
                while (this.history.length > 21 || (this.history.length > 1 && JSON.stringify(this.history).length > 24000)) this.history.splice(0, 2);
                const ask = image => {
                    const operation = this.operation = this.provider.chat(this.config, this.history, image);
                    return operation.promise.then(reply => this.active && this.operation === operation ? reply : null);
                };
                // "LOOK": the AI wants to see. One photo, sent only with this request (later turns don't resend it).
                const asked = this.history[this.history.length - 1];
                return ask().then(reply => !reply || !LOOK.test(reply) ? reply : this.look().then(image =>
                    image ? ask(image).then(again => {
                        if (!again || LOOK.test(again)) return again && "Sorry, I couldn't make that out.";
                        asked.content += LOOKED; // so later turns know it really saw (the photo itself isn't kept)
                        return again;
                    }) : "Sorry, I couldn't take a picture.")).then(reply => {
                    if (!reply || !this.active) return;
                    this.operation = null; this.history.push({ role: 'assistant', content: reply });
                    const match = /^\s*DO:\s*(.+?)\s*$/im.exec(reply), bye = BYE.test(reply), picture = /^\s*SHOW:\s*(.+?)\s*$/im.exec(reply);
                    const spoken = reply.replace(/^\s*(DO|SHOW):.*$/gim, '').replace(BYE, '').trim();
                    const command = match && this.act ? match[1] : null, dance = esml.danceFor(command);
                    // SHOW: the picture fills his face while he talks, then goes away.
                    return (picture && !this.private() ? image.show(this.jibo, picture[1]) : Promise.resolve(null)).then(hide => {
                        if (hide && !this.active) return hide();
                        this.hide = hide;
                        return spoken ? this.speak(spoken) : null;
                    }).then(() => this.unshow(2000)).then(() => {
                        // A dance plays here, not through the cloud's dance (no "Watch this"), then he listens again.
                        if (dance) return this.speak(dance).then(() => bye ? this.leave() : this.listen());
                        if (!command) return bye ? this.leave() : this.listen(); // BYE: the AI ended the chat
                        if (!this.active || this.private()) return;
                        const history = this.history.slice();
                        return this.close().then(() => this.act(command, history));
                    });
                });
            });
        }).catch(error => this.fail(error));
    }
    // The shutter sound and a 640-px photo (about 300 tokens) as base64 JPEG; null if there is none (or privacy is on).
    look() {
        const jibo = this.jibo;
        if (this.private()) return Promise.resolve(null);
        const shutter = Promise.resolve(jibo.embodied.speech.speak("<anim name='ds_shutter_release_01' />")).catch(() => {});
        const photo = new Promise(resolve => jibo.media.takePhoto((error, taken) => {
            if (error || !taken || !this.active || this.private()) return resolve(null);
            const image = new Image();
            image.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = 640; canvas.height = Math.round(image.height * 640 / image.width);
                canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg', 0.7).split(',')[1]);
            };
            image.onerror = () => resolve(null);
            image.src = taken.url;
        }));
        return Promise.all([photo, shutter]).then(results => results[0]);
    }
    unshow(delay) {
        const hide = this.hide; this.hide = null;
        return hide ? new Promise(resolve => setTimeout(resolve, delay)).then(hide) : Promise.resolve();
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
        cleanup.push(this.thinkingEye.stop());
        clearInterval(this.monitor); clearTimeout(this.silence); this.listenDeadline = null;
        this.unwatch.splice(0).forEach(off => off());
        if (this.draw) jibo.timer.off('update', this.draw);
        if (this.gesture) jibo.face.gestures.removeStageGesture(this.gesture);
        if (this.operation) this.operation.cancel(); this.operation = null;
        if (this.turn) {
            cleanup.push(Promise.resolve(this.turn.cancel()));
            // A cancelled turn sends no result, so Jibo's listening eye and ring would linger; end them as a result does.
            const listen = jibo.embodied._embodied && jibo.embodied._embodied.listen;
            if (listen) listen.eventsIn.cloudFinished.emit();
        }
        this.turn = null;
        if (this.speaking) cleanup.push(Promise.resolve(jibo.embodied.speech.stop())); this.speaking = false;
        cleanup.push(this.unshow(0));
        if (this.attention) cleanup.push(Promise.resolve(this.attention.release())); this.attention = null;
        if (this.hotword) cleanup.push(Promise.resolve(this.hotword.release())); this.hotword = null;
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
// "open <name>" for an installed Store skill (they have no voice intent) → its package name.
Runtime.storeSkill = (command, skills) => {
    const name = String(command).toLowerCase().replace(/^(open|launch|start|run)\s+(the\s+)?/, '').replace(/[^a-z0-9]+/g, ' ').trim();
    const skill = skills.filter(s => String(s.manifest && s.manifest.name).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim() === name)[0];
    return skill ? skill.packageName : null;
};
// The conversation to resume after a quick action, with what Jibo said during it added to the AI's last reply.
Runtime.resumeHistory = (history, said) => {
    const copy = history.map(message => Object.assign({}, message)), last = copy[copy.length - 1];
    const note = '(' + (said ? 'Jibo then said: "' + said + '"' : 'Jibo did it.') + ')';
    if (last && last.role === 'assistant') last.content += '\n' + note;
    else copy.push({ role: 'assistant', content: note });
    return copy;
};
Runtime.isStop = isStop; Runtime.speechChunks = text => esml.chunks(text);
module.exports = Runtime;
