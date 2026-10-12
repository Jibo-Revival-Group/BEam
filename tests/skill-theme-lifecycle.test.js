'use strict';
// Exercise the actual shared host helper with service stubs, including timeouts.
const assert = require('assert'), fs = require('fs'), path = require('path');
let scope = null, timerId = 0, timers = {}, scopes = [];
const themeRuntime = {
    enterSkill(skill, enabled) { scope = { skill, enabled: enabled !== false }; scopes.push(scope); return scope; },
    leaveSkill(ticket) { if (scope === ticket) { scope = null; } }
};
const log = { info() {}, warn() {}, error() {}, createChild() { return this; } };
const jibo = {
    utils: { PathUtils: { findRoot: () => '/fake' } },
    loader: { addCache() {}, deleteCache() {}, assetManager: { cancelAll() {} } },
    sound: {}, expression: { destroyCaches() {} }, face: { reset() {} },
    embodied: { speech: { setPaths() {} } }, mim: {}
};
const framework = { BeSkill: { open: (old, next, options, done) => done(), plugins: { analytics: { skillEntry() {}, skillExit() {} } } } };
const moduleObject = { exports: {} };
new Function('require', 'module', 'exports', 'setTimeout', 'clearTimeout', fs.readFileSync(path.join(__dirname, '../@be/be/lib/SkillSwitchUtil.js'), 'utf8'))(
    name => name === 'jibo' ? jibo : name === 'path' ? path : name === '@be/be-framework' ? framework : name === './log' ? { default: log } : name === './TimerSpy' ? {} : name === '../beacon/lib/theme-runtime' ? themeRuntime : name === '/fake/package.json' ? { jibo: { debug: {} } } : (() => { throw new Error(name); })(),
    moduleObject, moduleObject.exports, fn => { const id = ++timerId; timers[id] = fn; return id; }, id => delete timers[id]);
const util = moduleObject.exports.default;
function skill(enabled) {
    const s = { assetPack: '@be/test', rootPath: '/skill', _beamThemesEnabled: enabled,
        preload(done) { assert.strictEqual(scope.enabled, enabled !== false, 'Scope precedes preload and view creation'); done(); },
        open() { assert.strictEqual(scope.enabled, enabled !== false); },
        close(done) { assert(scope, 'Scope stays active throughout close'); done(); } };
    return s;
}
function open(s) { return util.openNewSkill(null, { skillSwitchData: { skill: s, name: s.assetPack, options: { asr: {} } } }); }
async function run() {
    for (const enabled of [false, true, undefined]) {
        const s = skill(enabled); await open(s); assert(scope); await util.closeSkill(s); assert.strictEqual(scope, null); assert(!s._beamThemeScope);
    }
    for (const failure of ['preload', 'open']) {
        const s = skill(false); s[failure] = () => { throw new Error('failed ' + failure); };
        await assert.rejects(open(s), /failed/); assert.strictEqual(scope, null, 'Failed launch releases its scope');
    }
    const badPreload = skill(false); badPreload.preload = done => done(new Error('bad preload'));
    await assert.rejects(open(badPreload), /bad preload/); assert.strictEqual(scope, null);
    const hung = skill(false); hung.preload = () => {};
    const opening = open(hung); await Promise.resolve(); await Promise.resolve();
    Object.values(timers).forEach(fn => fn()); await assert.rejects(opening, /too long/); assert.strictEqual(scope, null);
    const badClose = skill(false); await open(badClose); badClose.close = () => { throw new Error('close failed'); };
    await util.closeSkill(badClose); assert.strictEqual(scope, null, 'Forced close releases its scope');
    const hungClose = skill(false); await open(hungClose); hungClose.close = () => {};
    const closing = util.closeSkill(hungClose); Object.values(timers).forEach(fn => fn()); await closing; assert.strictEqual(scope, null);
    // Rejected or delayed old operations must not clear a newer scope.
    const old = skill(false); let fail; old.preload = done => fail = done;
    const oldOpen = open(old); await Promise.resolve(); await Promise.resolve();
    const newer = skill(false); await open(newer); fail(new Error('old failed'));
    await assert.rejects(oldOpen, /old failed/); assert.strictEqual(scope.skill, newer);
    await util.closeSkill(newer); assert.strictEqual(scope, null);
    assert.strictEqual(Object.keys(timers).length, 0);
    console.log('Skill theme scopes cover preload, open, close, timeouts, failures, defaults, and stale transitions');
}
run().catch(err => { console.error(err); process.exitCode = 1; });
