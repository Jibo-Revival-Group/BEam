'use strict';
// Custom skills need a permission (agreed at install) and their screen open for the microphone, camera and transcripts.
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const BE = path.join(__dirname, '../@be/be');
const { Event } = require(path.join(BE, 'node_modules/jibo-typed-events'));
const permissions = require(path.join(BE, 'beacon/lib/skill-permissions'));

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-perms-')), packages = path.join(root, 'packages');
const REV = { spy: 'a'.repeat(24), mic: 'b'.repeat(24), gone: 'c'.repeat(24) };
// Each fake skill's code runs from its own installed files, like a real custom skill.
const code = `module.exports = jibo => ({
    listen: () => jibo.jetstream.startLocalTurn({}),
    photo: () => jibo.media.takePhoto(),
    subscribe: (heard) => { const h = d => heard.push(d.text); jibo.jetstream.events.globalTurnResult.on(h); return h; },
    once: (heard) => jibo.globalEvents.skillRelaunch.once(d => heard.push('relaunch ' + d.text)),
    unsubscribe: h => jibo.jetstream.events.globalTurnResult.off(h),
    record: nav => nav.mediaDevices.getUserMedia({ audio: true })
});`;
const load = {};
Object.keys(REV).forEach(name => {
    const file = path.join(packages, REV[name], name, 'index.js');
    fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, code); load[name] = require(file);
});
const skills = [
    { packageName: '@be/spy', revision: REV.spy, manifest: {} },
    { packageName: '@be/mic', revision: REV.mic, manifest: { permissions: ['microphone'] } }
];   // '@be/gone' was removed but its code is still loaded

const jibo = {
    jetstream: { startLocalTurn: () => 'listening', events: { globalTurnResult: new Event('globalTurnResult'), hjHeard: new Event('hjHeard') } },
    media: { takePhoto: () => 'photo' },
    globalEvents: { skillRelaunch: new Event('skill-relaunch') }
};
const nav = { mediaDevices: { getUserMedia: () => 'stream' } };
const be = { currentSkill: { assetPack: '@be/idle' } };
permissions.create({ skillsDir: packages, skills: () => skills, be: () => be }).guard(jibo, nav);
const spy = load.spy(jibo), mic = load.mic(jibo), gone = load.gone(jibo);

// Jibo's own code is untouched.
assert.strictEqual(jibo.jetstream.startLocalTurn(), 'listening');
assert.strictEqual(jibo.media.takePhoto(), 'photo');

// No permission: nothing, even with its screen open.
be.currentSkill = { assetPack: '@be/spy' };
assert.throws(() => spy.listen(), /@be\/spy needs the microphone permission/);
assert.throws(() => spy.photo(), /camera permission/);
assert.throws(() => spy.record(nav), /microphone permission/);
const spyHeard = [], mineHeard = [];
spy.subscribe(spyHeard); spy.once(spyHeard);
const handler = mic.subscribe(mineHeard);
jibo.jetstream.events.globalTurnResult.emit({ text: 'while spy is open' });
jibo.globalEvents.skillRelaunch.emit({ text: 'open spy' });

// Microphone permission: only while its own screen is open, and never the camera.
be.currentSkill = { assetPack: '@be/mic' };
assert.strictEqual(mic.listen(), 'listening'); assert.strictEqual(mic.record(nav), 'stream');
assert.throws(() => mic.photo(), /camera permission/);
jibo.jetstream.events.globalTurnResult.emit({ text: 'while mic is open' });
be.currentSkill = { assetPack: '@be/idle' };
assert.throws(() => mic.listen(), /its screen open/);
jibo.jetstream.events.globalTurnResult.emit({ text: 'private evening chat' });
assert.deepStrictEqual(spyHeard, [], 'the skill without permission heard nothing');
assert.deepStrictEqual(mineHeard, ['while mic is open'], 'nothing while another skill (or idle) is up');

// off() still works on the guarded handler; removed skills' leftover code gets nothing.
mic.unsubscribe(handler); be.currentSkill = { assetPack: '@be/mic' };
jibo.jetstream.events.globalTurnResult.emit({ text: 'after off' });
assert.deepStrictEqual(mineHeard, ['while mic is open']);
be.currentSkill = { assetPack: 'unknown' };
assert.throws(() => gone.listen(), /needs the microphone/);

// Install: asked permissions must be agreed to; an update keeps what was agreed.
const pkg = require(path.join(BE, 'beacon/lib/theme-package'));
const m = p => pkg.manifest(Buffer.from(JSON.stringify(Object.assign({ name: 'X', version: '1.0.0', type: 'skill' }, p))));
assert.deepStrictEqual(m({ permissions: ['microphone', 'camera'] }).permissions, ['microphone', 'camera']);
for (const bad of ['microphone', ['files'], ['camera', 'camera'], [1]]) { assert.throws(() => m({ permissions: bad }), /permissions must list/); }
console.log('skill-permissions ok');
