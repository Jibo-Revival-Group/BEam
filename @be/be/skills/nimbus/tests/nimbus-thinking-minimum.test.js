'use strict';
const assert = require('assert');
const Module = require('module');
const originalLoad = Module._load;
let cloudTimeoutMs = null;

class State { constructor() {} }
class StateMachine {}
class EventContainer {}
class Event {}
class BeSkill {}
BeSkill.plugins = { analytics: { currentSkill: null } };

function timeout(promise, duration, message) {
    cloudTimeoutMs = duration;
    return new Promise((resolve, reject) => {
        let settled = false;
        const timer = setTimeout(() => {
            settled = true;
            reject(new Error(message));
        }, duration);
        Promise.resolve(promise).then(value => {
            if (!settled) { clearTimeout(timer); resolve(value); }
        }, error => {
            if (!settled) { clearTimeout(timer); reject(error); }
        });
    });
}

const framework = {
    BeSkill,
    libraries: {
        jibo_state_machine: { State, StateMachine },
        jibo_cai_utils: { PromiseUtils: { timeout }, RandomUtils: {}, ExtPromiseWrapper: function () {} }
    }
};
const jibo = { context: { updateSkillContext() {} } };
const typedEvents = { EventContainer, Event };
Module._load = function (request, parent, isMain) {
    if (request === '@be/be-framework') return framework;
    if (request === 'jibo') return jibo;
    if (request === 'jibo-typed-events') return typedEvents;
    try { return originalLoad.call(this, request, parent, isMain); }
    catch (err) {
        if (err.code === 'MODULE_NOT_FOUND' && request.charAt(0) !== '.') return {};
        throw err;
    }
};

// Lookup answers can arrive before the thinking eye's first frame; the eye must still show for about a second.
function run() {
    const nimbus = require('..');
    Module._load = originalLoad;
    function entry(cloudSkill) {
        const state = new nimbus.ProcessCloudState({}, { log: { info() {}, error() {} }, analytics: { renameSkill: id => id } }, 'Process Cloud');
        state.processCloudResponse = function () {};
        state.stopThinkingAnim = function () { return Promise.resolve(); };
        state.doThinkingAnim = function () {};
        state.nimbus.jibo = { animDB: { getAnimByName: () => ({}) } };
        const action = { skill: { id: cloudSkill }, action: { config: { jcp: { type: 'SLIM' } } } };
        const started = Date.now();
        return state.onEntry(null, { listenResult: { match: { cloudSkill }, cloudSkillResponse: Promise.resolve(action) } })
            .then(() => Date.now() - started);
    }
    return entry('answer').then(ms => {
        assert(ms >= 950, 'instant lookup answer waited only ' + ms + ' ms');
        return entry('chitchat-skill');
    }).then(ms => {
        assert(ms < 300, 'non-lookup replies are not delayed (' + ms + ' ms)');
        console.log('Nimbus shows the thinking eye for at least a second on fast lookups only');
    });
}

run().catch(err => { Module._load = originalLoad; console.error(err); process.exitCode = 1; });
