'use strict';
const path = require('path');
const jibo = require('jibo'), BeSkill = require('@be/be-framework').BeSkill, animate = require('pixi-animate');
const people = require('../../beacon/lib/people'), phoneBattery = require('../../beacon/lib/phone-battery');

const View = jibo.rendering.gui.views.View;
const LOW = 20; // the stock battery screen's low threshold
// Jibo's own battery screen art (settings skill), with the phone's level instead of his.
const VIEW = { viewConfig: { type: 'PhoneBatteryView', id: 'phoneBatteryPanel', category: 'display' },
    componentConfigs: [{ id: 'battery', type: 'Clip', position: { x: '0', y: '0' },
        assets: [{ id: 'battery', type: 'timeline', src: path.join(__dirname, '../settings/assets/battery/battery.js') }] }] };

// Same frames as the settings skill's BatteryView: level, charging bolt, or full.
class PhoneBatteryView extends View {
    loaded() {
        super.loaded();
        const battery = this.getComponentById('battery').movieClip, reading = this.reading;
        battery.charging.visible = reading.charging && reading.level < 100;
        battery.warning.visible = !reading.charging && reading.level < LOW;
        if (reading.charging && reading.level >= 100) { battery.gotoAndStop('fullUp'); battery.juice.gotoAndStop(2); }
        else if (reading.charging) { battery.juice.gotoAndStop(0); animate.Animator.play(battery, 'imChargin'); }
        else { battery.gotoAndStop(reading.level); battery.juice.gotoAndStop(reading.level < LOW ? 1 : 0); }
    }
}

// Launched by BEefy for "how is my phone's battery?": show and say the last reading BEep sent, then leave.
class PhoneBatterySkill extends BeSkill {
    open() {
        const leave = () => this.exit({ noElementsOfSurprise: true });
        // Whoever Jibo recognised by voice for this question (as in "Who am I?"), so they hear their own phone.
        const voice = jibo.lps.identity.getActiveSpeaker();
        const speaker = voice && voice.idInfo && voice.idInfo.accepted !== false ? voice.idInfo.id : null;
        const reading = phoneBattery.shown(speaker);
        if (reading) { this.show(reading); }
        people.list().catch(() => null)
            .then(loop => Promise.resolve(jibo.tts.speak(phoneBattery.sentence(loop, Date.now(), speaker))))
            .then(() => new Promise(resolve => setTimeout(resolve, 1500))) // let the screen linger a moment
            .then(leave, leave);
    }
    show(reading) {
        if (!PhoneBatterySkill.registered) { jibo.face.views.creator.registerClass(PhoneBatteryView, 'PhoneBatteryView'); PhoneBatterySkill.registered = true; }
        const view = this.view = jibo.face.views.createView('PhoneBatteryView', VIEW, false);
        view.reading = reading;
        jibo.face.views.changeView({ addView: view });
    }
    // Be refuses skills that don't define open and close.
    close(done) {
        if (!this.view) { done(); return; }
        this.view = null;
        jibo.face.views.changeView({ removeAll: true, leaveEmpty: true }, () => done(), () => done());
    }
}
module.exports = PhoneBatterySkill;
