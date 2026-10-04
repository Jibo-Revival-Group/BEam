'use strict';

const path = require('path');
const fail = require('./camera-stream').fail;

class CameraStreamRuntime {
    constructor(jibo, host) {
        this.jibo = jibo;
        this.host = host;
        this.token = null;
        this.attention = null;
        this.overlay = null;
        this.loader = null;
        this.remoteDisabled = false;
        this.pulse = this.pulse.bind(this);
        this.stopLocal = () => {
            this.controller.command('stop').catch(() => {
                if (this.label) { this.label.text = 'Stop failed. Tap to retry.'; }
            });
        };
    }
    isPrivate() {
        return !!(this.jibo.privacyController && this.jibo.privacyController.enabled);
    }
    switchSkill(skill) {
        const Data = require('../../lib/SkillSwitchData').default;
        const State = require('../../lib/SkillLifecycleState').default;
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => reject(fail('Camera skill transition timed out')), 15000);
            const token = this.host.redirect(new Data(skill, {}));
            token.onState(State.SKILL_OPENED, () => {
                clearTimeout(timer);
                // onState also fires immediately for a token already ENDED.
                if (token.skillLifecycleState !== State.SKILL_OPENED) {
                    reject(fail('Camera skill transition was denied'));
                } else { resolve(); }
            });
            token.onState(State.LIFECYCLE_ENDED, () => {
                clearTimeout(timer);
                reject(fail('Camera skill transition was interrupted'));
            });
        });
    }
    enter(controller) {
        this.controller = controller;
        const jibo = this.jibo;
        const Skill = require('../../skills/camera-stream');
        if (!this.host.skills['@be/camera-stream']) {
            const skill = new Skill({ assetPack: '@be/camera-stream', rootPath: path.resolve(__dirname, '../../skills/camera-stream') });
            this.host.skills['@be/camera-stream'] = skill;
            this.host._wireSkill(skill);
        }
        return this.switchSkill(this.host.skills['@be/camera-stream']).then(() => {
            this.token = jibo.jetstream.setHotwordMode(jibo.jetstream.types.HotwordListenMode.Disabled);
            jibo.tts.stop();
            if (jibo.remote && jibo.remote.setRemoteDisabled) {
                jibo.remote.setRemoteDisabled(true);
                this.remoteDisabled = true;
            }
            return Promise.all([this.token.activated, jibo.embodied.listen.exitActiveMode(),
                jibo.jetstream.cancelAnyTurn(), jibo.media.setViewfinder(false)]);
        }).then(() => jibo.expression.setAttentionMode(jibo.expression.AttentionMode.OFF))
            .then(() => jibo.expression.pushAttentionMode(jibo.expression.AttentionMode.OFF))
            .then(handle => {
                this.attention = handle;
                return this.showCamera();
            }).then(() => {
                jibo.action.events.secondHandTouchStop.on(this.stopLocal);
                jibo.timer.on('update', this.pulse);
                this.pulse(0);
            });
    }
    showCamera() {
        const jibo = this.jibo;
        const PIXI = global.PIXI || (typeof window !== 'undefined' && window.PIXI);
        if (!PIXI || !PIXI.animate) { return Promise.reject(fail('Camera emoji renderer unavailable')); }
        this.overlay = new PIXI.Container();
        const black = new PIXI.Graphics();
        black.beginFill(0x000000).drawRect(0, 0, jibo.face.width, jibo.face.height).endFill();
        this.overlay.addChild(black);
        jibo.face.views.addWatermark(this.overlay);
        this.indicator = new PIXI.Graphics();
        this.indicator.beginFill(0x00FF00).drawCircle(jibo.face.width - 45, jibo.face.height - 45, 15).endFill();
        this.label = new PIXI.Text('Stop streaming', { font: '32px Arial', fill: '#00ff00' });
        this.label.position.set(40, jibo.face.height - 80);
        this.label.interactive = true;
        this.label.on('pointertap', this.stopLocal);
        this.label.on('tap', this.stopLocal);
        this.label.on('click', this.stopLocal);
        this.overlay.addChild(this.indicator);
        this.overlay.addChild(this.label);
        return new Promise((resolve, reject) => {
            const file = require.resolve('jibo-anim-db-animations/timelines/emoji_camera.js');
            const exported = require(file);
            const timer = setTimeout(() => reject(fail('Camera emoji loading timed out')), 8000);
            this.loader = PIXI.animate.load({ stage: exported.stage,
                parent: this.overlay, basePath: path.dirname(file),
                complete: clip => {
                    clearTimeout(timer);
                    clip.gotoAndStop(26);
                    clip.scale.set(jibo.face.width / 1280, jibo.face.height / 720);
                    // Keep the stop control and indicator above the emoji.
                    this.overlay.addChild(this.indicator);
                    this.overlay.addChild(this.label);
                    resolve();
                } });
            this.loader.on('error', () => { clearTimeout(timer); reject(fail('Camera emoji loading failed')); });
        });
    }
    pulse(elapsed) {
        this.elapsed = (this.elapsed || 0) + elapsed;
        const phase = (this.elapsed / 2000) % 2;
        const brightness = 0.2 + 0.8 * (phase <= 1 ? phase : 2 - phase);
        if (this.overlay && !this.overlay.parent) { this.jibo.face.views.addWatermark(this.overlay); }
        if (this.indicator) { this.indicator.alpha = brightness; }
        this.jibo.expression.setLEDColor([0, brightness, 0]);
    }
    leave() {
        const jibo = this.jibo;
        return Promise.resolve().then(() => {
            return this.attention ? this.attention.release() : null;
        }).then(() => {
            this.attention = null;
            return jibo.expression.setAttentionMode(jibo.expression.AttentionMode.IDLE);
        }).then(() => {
            if (this.remoteDisabled) {
                jibo.remote.setRemoteDisabled(false);
                this.remoteDisabled = false;
            }
            return this.token ? this.token.release() : null;
        }).then(() => {
            this.token = null;
            // Keep local retry controls until resource restoration succeeds.
            jibo.action.events.secondHandTouchStop.removeListener(this.stopLocal);
            jibo.timer.off('update', this.pulse);
            if (this.loader) { this.loader.reset(); this.loader = null; }
            if (this.overlay) {
                jibo.face.views.removeWatermark();
                this.overlay.destroy({ children: true });
                this.overlay = null;
            }
            this.indicator = null;
            this.label = null;
            this.elapsed = 0;
            jibo.expression.setLEDColor([0, 0, 0]);
        });
    }
    resume() {
        // Use idle rather than restarting an interrupted action or utterance.
        this.switchSkill(this.host.idle).catch(() => {});
    }
}

module.exports = CameraStreamRuntime;
