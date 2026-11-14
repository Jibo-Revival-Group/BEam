'use strict';
// Custom skills need a permission (agreed at install) and their screen open for the microphone, camera and transcripts.
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const BE = path.join(__dirname, '../@be/be');
const { Event } = require(path.join(BE, 'node_modules/jibo-typed-events'));
const permissions = require(path.join(BE, 'beacon/lib/skill-permissions'));

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-perms-')), packages = path.join(root, 'beacon', 'skills', 'packages');
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
permissions.create({ kbRoot: root, skills: () => skills, be: () => be }).guard(jibo, { navigator: nav });
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

// Files, network, programs and other skills' KB. Each fake skill's code runs from its installed files.
const kbCode = `const fs = require('fs'), net = require('net'), cp = require('child_process'), path = require('path');
module.exports = (root, kb) => ({
    readOwnCode: () => fs.readFileSync(__filename, 'utf8').length > 0,
    ownSection: () => { fs.mkdirSync(path.join(root, NAME), { recursive: true }); fs.writeFileSync(path.join(root, NAME, 'x'), 'hi'); return fs.readFileSync(path.join(root, NAME, 'x'), 'utf8'); },
    editOwnCode: () => fs.writeFileSync(__filename + '.new', 'x'),
    readOtherKb: () => fs.readFileSync(path.join(root, 'beacon', 'secret.json'), 'utf8'),
    readJibo: () => fs.readFileSync('/etc/hostname', 'utf8'),
    editJibo: file => fs.writeFileSync(file, 'x'),
    sneakyLink: () => { fs.symlinkSync('/etc/hostname', path.join(root, NAME, 'link')); },
    readLink: () => fs.readFileSync(path.join(root, NAME, 'link'), 'utf8'),
    upDir: () => fs.readFileSync(path.join(root, NAME, '..', 'beacon', 'secret.json'), 'utf8'),
    connect: host => { const s = net.connect({ host: host, port: 9 }); s.on('error', () => {}); s.destroy(); },
    run: () => cp.execSync('true'),
    kbLoad: name => new kb.KnowledgeDatabase(name).load('id'),
    kbSave: name => new kb.KnowledgeDatabase(name).save({})
});`;
const kbSkills = { snoop: { rev: 'd'.repeat(24), perms: [] }, trusted: { rev: 'e'.repeat(24), perms: ['read-jibo-files', 'edit-jibo-files', 'read-kb', 'edit-kb', 'jibo-apis', 'local-network', 'run-programs'] } };
const fakeKb = { KnowledgeDatabase: function (name) { this.kbName = name; } };
fakeKb.KnowledgeDatabase.prototype.load = () => 'loaded'; fakeKb.KnowledgeDatabase.prototype.save = () => 'saved';
// One skill list for both guards (production has one guard; this test adds a second one for the fake KB module).
Object.keys(kbSkills).forEach(n => skills.push({ packageName: '@be/' + n, revision: kbSkills[n].rev, manifest: { permissions: kbSkills[n].perms } }));
permissions.create({ kbRoot: root, skills: () => skills, be: () => be }).guard({}, null, fakeKb);
fs.writeFileSync(path.join(root, 'beacon', 'secret.json'), '{"token":"x"}');
const kbApi = {};
Object.keys(kbSkills).forEach(n => {
    const file = path.join(packages, kbSkills[n].rev, n, 'index.js');
    fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, kbCode.replace(/NAME/g, JSON.stringify(n)));
    kbApi[n] = require(file)(root, fakeKb);
});
const tmp = path.join(os.tmpdir(), 'skill-perms-write-' + process.pid);
const snoop = kbApi.snoop, trusted = kbApi.trusted;
assert.strictEqual(snoop.readOwnCode(), true, 'a skill reads its own files');
assert.strictEqual(snoop.ownSection(), 'hi', 'and its own KB section, freely');
assert.throws(() => snoop.editOwnCode(), /edit-kb permission/);
assert.throws(() => snoop.readOtherKb(), /@be\/snoop needs the read-kb permission/);
assert.throws(() => snoop.upDir(), /read-kb/, '".." does not escape its section');
assert.throws(() => snoop.readJibo(), /read-jibo-files/);
assert.throws(() => snoop.editJibo(tmp), /edit-jibo-files/);
snoop.sneakyLink(); assert.throws(() => snoop.readLink(), /read-jibo-files/, 'a symlink out of its section does not help');
assert.throws(() => snoop.connect('127.0.0.1'), /jibo-apis/);
assert.throws(() => snoop.connect('localhost'), /jibo-apis/);
assert.throws(() => snoop.connect('192.168.7.93'), /local-network/);
assert.throws(() => snoop.connect('jibo.local'), /local-network/);
snoop.connect('93.184.216.34');   // the internet needs no permission
assert.throws(() => snoop.run(), /run-programs/);
trusted.run();
assert.throws(() => snoop.kbLoad('beacon'), /read-kb/); assert.throws(() => snoop.kbSave('jibo/loop'), /edit-kb/);
assert.strictEqual(snoop.kbLoad('snoop'), 'loaded'); assert.strictEqual(snoop.kbSave('snoop/sub'), 'saved');
// Declared permissions work; Jibo's own code is never limited.
assert(trusted.readOtherKb()); assert(trusted.readJibo()); trusted.editJibo(tmp); fs.unlinkSync(tmp);
trusted.connect('127.0.0.1'); trusted.connect('192.168.7.93');
assert.strictEqual(trusted.kbSave('jibo'), 'saved');
assert(fs.readFileSync('/etc/hostname', 'utf8'));
assert.strictEqual(permissions.hostNeeds('10.0.0.2'), 'local-network'); assert.strictEqual(permissions.hostNeeds('[::1]'), 'jibo-apis');
assert.strictEqual(permissions.hostNeeds('api.5x1.com'), null); assert.strictEqual(permissions.hostNeeds('fe80::1'), 'local-network');

// Install: asked permissions must be agreed to; an update keeps what was agreed.
const pkg = require(path.join(BE, 'beacon/lib/theme-package'));
const m = p => pkg.manifest(Buffer.from(JSON.stringify(Object.assign({ name: 'X', version: '1.0.0', type: 'skill' }, p))));
assert.deepStrictEqual(m({ permissions: ['microphone', 'camera'] }).permissions, ['microphone', 'camera']);
for (const bad of ['microphone', ['files'], ['camera', 'camera'], [1]]) { assert.throws(() => m({ permissions: bad }), /permissions must list/); }
console.log('skill-permissions ok');
