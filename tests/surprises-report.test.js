'use strict';
// @be/surprises-report: the morning personal-report Element of Surprise. Bids 5:00-13:59 unless already offered
// or heard today, yes starts the report like the menu's full-report button, and a delivered report counts as heard.
const assert = require('assert'), fs = require('fs'), path = require('path'), Module = require('module');
const be = path.join(__dirname, '../@be/be');

const RealDate = Date;
let clock = new RealDate(2026, 10, 19, 9, 0);
global.Date = class extends RealDate {
    constructor() { if (arguments.length) { super(...arguments); } else { super(clock.getTime()); } }
    static now() { return clock.getTime(); }
};
const at = (day, h, m) => { clock = new RealDate(2026, 10, day, h, m); };

const node = { data: null, saves: 0, save() { this.saves++; return Promise.resolve(); } };
const IN_PROGRESS = 'IN_PROGRESS', SUCCEEDED = 'SUCCEEDED';
const mims = [], ticks = [], calls = [];
let speaker = null;
const jibo = {
    kb: { createModel: p => { assert.strictEqual(p, '/surprises-report'); return { loadRoot: () => Promise.resolve(node) }; },
        loop: { getSpokenNameById: (id, cb) => cb(null, id === 'jake-id' ? 'Jake' : null) } },
    lps: { identity: { getActiveSpeaker: () => speaker } },
    bt: { Status: { IN_PROGRESS, SUCCEEDED }, behaviors: { Mim: class {
        constructor(options) { this.options = options; this.status = IN_PROGRESS; mims.push(this); }
        start() { this.promptData = this.options.getPromptData(); }
        update() { return this.status; }
        stop() { this.stopped = true; return Promise.resolve(); }
        answer(intent) { this.options.onSuccess({ asrResults: { intent } }); this.status = SUCCEEDED; }
    } } },
    timer: { on: (e, f) => ticks.push(f), removeListener: (e, f) => ticks.splice(ticks.indexOf(f), 1) },
    embodied: { listen: { disableOnce: () => calls.push('disableOnce') } },
    jetstream: { mimicGlobalTurn: options => { calls.push(options); return Promise.resolve(); } }
};
class SurpriseElement { constructor(o) { this.assetPack = o && o.assetPack; this.log = { error() {} }; } exit() { this.exited = true; } }
const load = Module._load;
Module._load = function (name) {
    if (name === 'jibo') { return jibo; }
    if (name === '@be/surprises') { return { SurpriseElement }; }
    return load.apply(this, arguments);
};
const Skill = require('../@be/be/skills/surprises-report');
const skill = new Skill({ assetPack: '@be/surprises-report' });
const bid = () => skill.getContextualPriority({});
const settle = () => new Promise(resolve => setImmediate(resolve));
function offer(answer) {
    const before = mims.length;
    skill.exited = false; calls.length = 0;
    skill.open();
    return settle().then(() => {
        const mim = mims[before];
        assert(mim, 'the offer is asked');
        ticks[0]();
        assert.strictEqual(skill.exited, false, 'still asking');
        mim.answer(answer); ticks[0]();
        assert.strictEqual(ticks.length, 0, 'tick listener removed'); assert(mim.stopped);
        return mim;
    });
}

(function run() {
    return Promise.resolve()
        .then(() => { at(19, 13, 59); return bid(); }).then(p => assert.strictEqual(p, 1, '13:59 bids'))
        .then(() => { at(19, 14, 0); return bid(); }).then(p => assert.strictEqual(p, 0, '14:00 does not'))
        .then(() => { at(19, 4, 59); return bid(); }).then(p => assert.strictEqual(p, 0, 'not overnight'))
        .then(() => { at(19, 5, 0); return bid(); }).then(p => assert.strictEqual(p, 1, '5:00 bids'))
        .then(() => assert.strictEqual(skill.getCategoryPriority(), 10, 'ties or beats the date fact and OTA (10), beats WOTD (5)'))
        // "No": offered today, so no second offer; nothing is started.
        .then(() => { at(19, 9, 0); return offer('no'); }).then(mim => {
            assert.deepStrictEqual(mim.promptData, { speaker: '' });
            assert.strictEqual(mim.options.mimPath, 'mims/en-us/OfferPersonalReport.mim');
            assert.strictEqual(skill.exited, true); assert.deepStrictEqual(calls, []);
            return bid();
        }).then(p => assert.strictEqual(p, 0, 'already offered today'))
        // Next day: offered again, to the known speaker by name; yes starts the cloud report.
        .then(() => { at(20, 9, 0); return bid(); }).then(p => assert.strictEqual(p, 1, 'next day bids again'))
        .then(() => { speaker = { idInfo: { id: 'jake-id' } }; return offer('yes'); }).then(mim => {
            assert.deepStrictEqual(mim.promptData, { speaker: 'Jake' });
            assert.deepStrictEqual(calls, ['disableOnce', { clientASR: 'personal report' }]);
            assert.strictEqual(skill.exited, false, 'the cloud turn takes over');
        })
        // Heard today (any path) blocks the offer; the next day it is back.
        .then(() => { at(21, 8, 0); return Skill.markHeard(); }).then(() => bid()).then(p => assert.strictEqual(p, 0, 'already heard today'))
        .then(() => { at(22, 8, 0); return bid(); }).then(p => assert.strictEqual(p, 1, 'heard yesterday bids'))
        .then(() => {
            // The stock offer lines, on the generic yes/no rule BEefy answers locally.
            const mim = JSON.parse(fs.readFileSync(path.join(be, 'skills/surprises-report/mims/en-us/OfferPersonalReport.mim'), 'utf8'));
            assert.strictEqual(mim.rule_name, 'shared/yes_no');
            assert.deepStrictEqual(mim.prompts.map(p => p.prompt), ['${speaker} do you want your personal report now?', 'Oh hey, do you want your personal report?']);
            // Registered as a lazy skill and warmed with the other EoS packs, so the surprises skill sees it.
            assert(require(path.join(be, 'package.json')).jibo.lazySkills.indexOf('@be/surprises-report') !== -1);
            assert(/EOS_BOOTSTRAP = \[[^\]]*'@be\/surprises-report'/.test(fs.readFileSync(path.join(be, 'skill-registry.js'), 'utf8')));

            // jetstream-client: a delivered personal report (spoken, menu button or this offer) stamps heard today.
            const source = fs.readFileSync(path.join(be, 'node_modules/@jibo/jetstream-client/lib/jetstream-client.js'), 'utf8');
            const start = source.indexOf('                    case types.ServiceEventType.SKILL_ACTION:');
            const code = source.slice(start, source.indexOf('                    case types.ServiceEventType.SKILL_REDIRECT:', start));
            const handler = new Function('event', 'types', 'require', 'console', 'switch(event.type) {' + code + '}');
            let heard = 0; const resolved = [];
            const emit = data => handler.call({ cloudSkillResponseRegistry: { resolve: (t, d) => resolved.push(d) } },
                { type: 'SKILL_ACTION', data, transID: 't' }, { ServiceEventType: { SKILL_ACTION: 'SKILL_ACTION' } },
                name => { assert.strictEqual(name, '../../../../skills/surprises-report'); return { markHeard: () => { heard++; return Promise.resolve(); } }; },
                console);
            emit({ skill: { id: 'chitchat-skill' }, action: { config: { jcp: { config: { play: { meta: { mim_id: 'runtime-chat' } } } } } } });
            assert.strictEqual(heard, 0);
            emit({ skill: { id: 'report-skill' }, action: { config: { jcp: { config: { children: [{ play: { meta: { mim_id: 'runtime-personal-report' } } }] } } } } });
            assert.strictEqual(heard, 1); assert.strictEqual(resolved.length, 2, 'still plays as a cloud skill');
            console.log('surprises-report ok');
        });
})().then(() => { global.Date = RealDate; }, err => { global.Date = RealDate; console.error(err); process.exit(1); });
