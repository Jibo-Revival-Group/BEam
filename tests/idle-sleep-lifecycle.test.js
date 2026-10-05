'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const source = fs.readFileSync(path.join(__dirname, '../@be/be/skills/idle/index.js'), 'utf8');
// Load the shipped browserify state module with the same event/state interfaces,
// avoiding hardware dependencies while exercising its actual asynchronous entry.
const start = source.indexOf('"use strict";', source.indexOf('}],19:[function'));
const end = source.indexOf('\n}).call(this', start);
assert(start >= 0 && end > start);
class State {
    constructor(parent, name) { this.parent = parent; this.name = name; }
    transitionTo(next) {
        this.onExit();
        this.parent.current = next;
        this.parent.transitions.push(next);
    }
}
const circadian = {};
for (const name of ['SELECT_INTENT', 'ALERT', 'RELAXED', 'DAYTIME_NAP', 'FALLING_ASLEEP', 'ASLEEP', 'WAKING_UP']) circadian[name] = name;
const dependencies = {
    jibo: { jetstream: { resetHotwordMode: () => Promise.resolve() } },
    'jibo-common-types': { CircadianState: circadian },
    '@be/be-framework': { libraries: {
        jibo_state_machine: { State, StateMachine: class {} },
        jibo_typed_events: { EventContainer: class {}, Event: class {} },
        jibo_cai_utils: {}
    } }
};
const loaded = { exports: {} };
new Function('require', 'module', 'exports', source.slice(start, end))(
    name => dependencies[name] || {}, loaded, loaded.exports);

function deferred() {
    let resolve, reject;
    const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
    return { promise, resolve, reject };
}
const flush = () => new Promise(resolve => setImmediate(resolve));
function setup() {
    const eye = deferred();
    const skill = { log: { info() {}, warn() {}, error() {} },
        forceEyeView: () => eye.promise, getIntent: options => options.intent };
    const machine = { parent: { parent: skill }, getCurrentState() { return this.current; },
        asleep: {}, alert: {}, transitions: [] };
    const entry = new loaded.exports.EntryState(machine);
    machine.current = entry;
    return { eye, machine, entry, skill };
}

async function run() {
    {
        const { eye, machine, entry } = setup();
        entry.onEntry({}, { intent: 'sleep' });
        eye.resolve();
        await flush();
        assert.deepStrictEqual(machine.transitions, [machine.asleep]);
    }
    for (const failure of [false, true]) {
        const { eye, machine, entry } = setup();
        entry.onEntry({}, {});
        // Global sleep wins before resetHotwordMode/forceEyeView finishes.
        entry.onExit();
        machine.current = machine.asleep;
        if (failure) eye.reject(new Error('Late eye cancellation'));
        else eye.resolve();
        await flush();
        assert.strictEqual(machine.current, machine.asleep);
        assert.deepStrictEqual(machine.transitions, [], 'Late completion must not wake Jibo');
    }
    {
        const { eye, machine, entry, skill } = setup();
        entry.onEntry({}, {});
        entry.onExit();
        const replacement = deferred();
        skill.forceEyeView = () => replacement.promise;
        entry.onEntry({}, { intent: 'sleep' });
        eye.resolve();
        await flush();
        assert.deepStrictEqual(machine.transitions, [], 'Superseded entry must not select ALERT');
        replacement.resolve();
        await flush();
        assert.deepStrictEqual(machine.transitions, [machine.asleep]);
    }
    const method = source.match(/goToSleepHandler\(\) \{([\s\S]*?)\n    \}\n    headTouchHandler/);
    assert(method);
    const sleep = new Function('jibo_common_types_1', 'return function() {' + method[1] + '}')({ CircadianState: circadian });
    let state = 'ALERT', transitions = 0;
    const manager = { getCurrentCircadianState: () => state,
        circadianSM: { events: { goToSleep: { emit() { transitions++; state = 'ASLEEP'; } } } } };
    sleep.call(manager);
    sleep.call(manager);
    assert.strictEqual(transitions, 1, 'Sleep while already asleep must not replay its transition');
    const openMethod = source.match(/    open\(result, refresh\) \{([\s\S]*?)\n    \}\n    _readQR/);
    assert(openMethod);
    const open = new Function('jibo', 'jibo_common_types_1', 'return function(result, refresh) {' + openMethod[1] + '}')(
        { mim: {} }, { CircadianState: circadian });
    let replacements = 0;
    open.call({ getIntent: options => options.intent, circadianManager: manager,
        session: { current: true, replaceSession() { replacements++; } }, _readQR() {} }, { intent: 'sleep' }, true);
    assert.strictEqual(replacements, 0, 'Refreshing the same sleep request must not restart SELECT_INTENT');
    console.log('Idle sleep entry, stale completion, cancellation, refresh and idempotence tests passed');
}
run().catch(error => { console.error(error); process.exitCode = 1; });
