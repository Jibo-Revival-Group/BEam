'use strict';
// Use AnimDB's two-stage API: asset.play() can start inside a late load.
class ThinkingEye {
    constructor(jibo, allowed) { this.jibo = jibo; this.allowed = allowed; }
    start() {
        if (!this.allowed() || !this.jibo.animDB) return;
        const token = this.token = {};
        Promise.resolve().then(() => {
            if (this.token !== token || !this.allowed()) return;
            const asset = this.jibo.animDB.getAnimByName('Thinking_Eye_Loop_01');
            if (!asset) return;
            return asset.createFromConfig({ loops: 0, cache: null });
        }).then(playback => {
            if (!playback) return;
            if (this.token !== token || !this.allowed()) return playback.stop();
            this.playback = playback;
            return playback.play({ disableSetFaceAnim: false, screenCenterOverride: true, ownerInformation: 'Behavior' });
        }).catch(() => {});
    }
    stop() {
        this.token = null;
        const playback = this.playback; this.playback = null;
        if (playback) this.stopping = Promise.resolve().then(() => playback.stop()).catch(() => {});
        return this.stopping || Promise.resolve();
    }
}
module.exports = ThinkingEye;
