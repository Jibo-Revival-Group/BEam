'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
let authorized = false, restricted = false, state = 'ALERT', calls = 0, denied = false;
const jibo = { privacyController: { enabled: false } };
const camera = { fail(message, status) { const error = new Error(message); error.status = status || 503; return error; }, isRestricted: () => restricted };
const dependencies = {
    './camera-stream': camera,
    './camera-stream-http': { authenticate() { if (!authorized) { throw camera.fail('Unauthorized', 401); } } },
    './http-util': { sendJson(res, code, body) { res.code = code; res.body = body; } },
    jibo,
    '../../lib/SkillSwitchData': { default: class { constructor(skill, options) { this.skill = skill; this.options = options; } } },
    '../../lib/SkillLifecycleState': { default: { SKILL_OPENED: 1, LIFECYCLE_ENDED: 2 } }
};
const loaded = { exports: {} };
new Function('require', 'module', 'exports', fs.readFileSync(path.join(__dirname,
    '../@be/be/beacon/lib/sleep-http.js'), 'utf8'))(name => dependencies[name], loaded, loaded.exports);
async function run() {
    const previous = global.be;
    const res = {};
    try {
        const idle = { circadianManager: { getCurrentCircadianState: () => state, goToSleepHandler() { calls++; state = 'ASLEEP'; } } };
        global.be = { idle, currentSkill: idle, redirect(data) {
            assert.strictEqual(data.skill, idle);
            assert.strictEqual(data.options.intent, 'sleep');
            return { skillLifecycleState: denied ? 2 : 1, onState(value, callback) { if (value === 1) { callback(); } } };
        } };
        assert.throws(() => loaded.exports.sleep({}, res), error => error.status === 401);
        authorized = true;
        await loaded.exports.sleep({}, res);
        await loaded.exports.sleep({}, res);
        assert.strictEqual(calls, 1, 'Repeated presses while asleep do not restart sleep');
        assert.deepStrictEqual(res.body, { ok: true });
        global.be.currentSkill = {};
        await loaded.exports.sleep({}, res);
        denied = true;
        await assert.rejects(loaded.exports.sleep({}, res), /denied/);
        restricted = true;
        assert.throws(() => loaded.exports.sleep({}, res), /camera streaming/);
        restricted = false;
        jibo.privacyController.enabled = true;
        assert.throws(() => loaded.exports.sleep({}, res), /privacy mode/);
        jibo.privacyController.enabled = false;
        global.be = null;
        assert.throws(() => loaded.exports.sleep({}, res), /unavailable/);
        console.log('Sleep authentication, idempotence, skill routing, restrictions and unavailable-runtime tests passed');
    } finally { global.be = previous; }
}
run().catch(error => { console.error(error); process.exitCode = 1; });
