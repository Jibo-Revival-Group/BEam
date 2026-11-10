'use strict';
const path = require('path');
const jibo = require('jibo'), BeSkill = require('@be/be-framework').BeSkill;

// Launched by BEefy for "sing Daisy Bell": Jibo sings the chorus (his own voice, Super Mario World piano), as the
// IBM 7094 did in 1961, then leaves. Touching him or "Hey Jibo" stops it, as in the Music skill.
class DaisyBellSkill extends BeSkill {
    open() {
        this.stop();
        const leave = () => { if (this.audio) { this.stop(); this.exit({ noElementsOfSurprise: true }); } };
        this.events = [];
        const watch = (owner, name) => {
            const event = owner && owner.events && owner.events[name];
            if (!event || !event.on || !event.off) return;
            event.on(leave); this.events.push(() => event.off(leave));
        };
        ['hjHeard', 'globalTurnStarted', 'skillSwitch'].forEach(name => watch(jibo.jetstream, name));
        watch(jibo.system, 'touchOn');
        const audio = this.audio = new Audio('file://' + path.join(__dirname, 'daisy-bell.ogg'));
        audio.addEventListener('ended', leave);
        audio.addEventListener('error', leave);
        Promise.resolve(audio.play()).catch(leave);
    }
    stop() {
        (this.events || []).forEach(off => off());
        this.events = [];
        const audio = this.audio;
        this.audio = null;
        if (audio) { audio.pause(); audio.removeAttribute('src'); audio.load(); }
    }
    // Be refuses skills that don't define open and close.
    close(done) { this.stop(); done(); }
}
module.exports = DaisyBellSkill;
