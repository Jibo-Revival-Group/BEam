'use strict';

const camera = require('./camera-stream');
const authenticate = require('./camera-stream-http').authenticate;
const u = require('./http-util');

function sleep(req, res) {
    authenticate(req);
    if (camera.isRestricted()) { throw camera.fail('Stop camera streaming before putting Jibo to sleep', 409); }
    const jibo = require('jibo');
    if (jibo.privacyController && jibo.privacyController.enabled) {
        throw camera.fail('Turn off privacy mode before putting Jibo to sleep', 409);
    }
    const host = global.be;
    if (!host || !host.idle || !host.currentSkill) { throw camera.fail('Robot sleep control unavailable'); }
    let result;
    if (host.currentSkill === host.idle) {
        const manager = host.idle.circadianManager;
        if (!manager) { throw camera.fail('Robot sleep control unavailable'); }
        if (manager.getCurrentCircadianState() !== 'ASLEEP') { manager.goToSleepHandler(); }
        result = Promise.resolve();
    } else {
        const Data = require('../../lib/SkillSwitchData').default;
        const State = require('../../lib/SkillLifecycleState').default;
        result = new Promise((resolve, reject) => {
            const timer = setTimeout(() => reject(camera.fail('Sleep transition timed out')), 15000);
            let token;
            try { token = host.redirect(new Data(host.idle, { intent: 'sleep' })); }
            catch (error) { clearTimeout(timer); reject(camera.fail('Sleep transition failed')); return; }
            token.onState(State.SKILL_OPENED, () => {
                clearTimeout(timer);
                if (token.skillLifecycleState === State.SKILL_OPENED) { resolve(); }
                else { reject(camera.fail('Sleep transition was denied', 409)); }
            });
            token.onState(State.LIFECYCLE_ENDED, () => {
                clearTimeout(timer);
                reject(camera.fail('Sleep transition was interrupted', 409));
            });
        });
    }
    return result.then(() => u.sendJson(res, 200, { ok: true }));
}

module.exports = { sleep: sleep };
