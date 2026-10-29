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

function run() {
    const nimbus = require('..');
    Module._load = originalLoad;
    assert.strictEqual(typeof nimbus.ProcessCloudState, 'function', 'loads the compiled Nimbus cloud state');
    const state = new nimbus.ProcessCloudState({}, {
        log: { info() {}, error() {} },
        analytics: { renameSkill: id => id }
    }, 'Process Cloud');
    state.processCloudResponse = function () {};
    state.stopThinkingAnim = function () { return Promise.resolve(); };
    const action = { skill: { id: 'report-skill' }, action: { config: { jcp: { type: 'SLIM' } } } };
    const response = new Promise(resolve => setTimeout(() => resolve(action), 9000));
    const data = { listenResult: { match: { cloudSkill: 'report-skill' }, cloudSkillResponse: response } };
    return state.onEntry(null, data).then(() => {
        assert.strictEqual(data.cloudResponse, action);
        assert.strictEqual(cloudTimeoutMs, 20000, 'personal-report cloud-response deadline must exceed the 9-second repro');
        console.log('Nimbus accepts a personal-report response arriving after 9 seconds (deadline ' + cloudTimeoutMs + ' ms)');
        const otherState = new nimbus.ProcessCloudState({}, {
            log: { info() {}, error() {} },
            analytics: { renameSkill: id => id }
        }, 'Process Cloud');
        otherState.processCloudResponse = function () {};
        otherState.stopThinkingAnim = function () { return Promise.resolve(); };
        const otherAction = { skill: { id: 'weather' }, action: { config: { jcp: { type: 'SLIM' } } } };
        const otherData = { listenResult: { match: { cloudSkill: 'weather' }, cloudSkillResponse: Promise.resolve(otherAction) } };
        return otherState.onEntry(null, otherData).then(() => {
            assert.strictEqual(cloudTimeoutMs, 8000, 'other cloud skills retain the existing deadline');
            const missingMatchState = new nimbus.ProcessCloudState({}, {
                log: { info() {}, error() {} },
                analytics: { renameSkill: id => id }
            }, 'Process Cloud');
            missingMatchState.processCloudResponse = function () {};
            missingMatchState.stopThinkingAnim = function () { return Promise.resolve(); };
            const missingMatchData = { listenResult: { cloudSkillResponse: Promise.resolve(otherAction) } };
            return missingMatchState.onEntry(null, missingMatchData).then(() => {
                assert.strictEqual(cloudTimeoutMs, 8000, 'missing match metadata uses the default deadline safely');
                function assertPersonalReportAlias(skillId) {
                    const aliasState = new nimbus.ProcessCloudState({}, {
                        log: { info() {}, error() {} },
                        analytics: { renameSkill: id => id }
                    }, 'Process Cloud');
                    aliasState.processCloudResponse = function () {};
                    aliasState.stopThinkingAnim = function () { return Promise.resolve(); };
                    const aliasData = { listenResult: { match: { cloudSkill: skillId }, cloudSkillResponse: Promise.resolve(action) } };
                    return aliasState.onEntry(null, aliasData).then(() => {
                        assert.strictEqual(cloudTimeoutMs, 20000, skillId + ' uses the personal-report deadline');
                    });
                }
                return assertPersonalReportAlias('personal-report-skill')
                    .then(() => assertPersonalReportAlias('personal-report'));
            });
        });
    });
}

run().catch(err => { Module._load = originalLoad; console.error(err); process.exitCode = 1; });
