'use strict';
const jibo = require('jibo'), BeSkill = require('@be/be-framework').BeSkill;
const people = require('../../beacon/lib/people'), phoneBattery = require('../../beacon/lib/phone-battery');

// Launched by BEefy for "how is my phone's battery?": say the last reading BEep sent, then leave.
class PhoneBatterySkill extends BeSkill {
    open() {
        const leave = () => this.exit({ noElementsOfSurprise: true });
        people.list().catch(() => null)
            .then(loop => Promise.resolve(jibo.tts.speak(phoneBattery.sentence(loop))))
            .then(leave, leave);
    }
    close(done) { done(); } // Be refuses skills that don't define open and close
}
module.exports = PhoneBatterySkill;
