(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.beifttt = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const JSC = require("@jibo/jibo-server-client");
const jibo = require("jibo");
class ServerController {
    constructor(skillStart, parentLog) {
        this.NO_TRIGGER = 'Corresponding applet not found in IFTTT';
        this.ifttt = null;
        this.log = parentLog.createChild('ServerController');
        this.skillStart = skillStart;
        this.init = new Promise((resolve, reject) => {
            jibo.systemManager.getCredentials((err, credentials) => {
                if (err) {
                    this.log.error('Error initializing credentials!', err);
                    reject(err);
                }
                else {
                    this.ifttt = new JSC.IFTTT(credentials);
                    resolve();
                }
            });
        });
    }
    trigger(trigger) {
        return this.init.then(() => {
            return new Promise((resolve, reject) => {
                const now = Date.now();
                this.log.debug(`Sending IFTTT trigger ${trigger} ${Date.now() - this.skillStart}ms from skill startup`);
                this.ifttt.trigger({ text: trigger }, (err, data) => {
                    if (err) {
                        this.log.warn('Error in IFTTT trigger', err);
                        return reject(err.message);
                    }
                    this.log.debug(`Sent IFTTT response in ${Date.now() - now}ms`);
                    this.successPromise = new Promise((resolve) => {
                        setTimeout(resolve, 2000);
                    });
                    resolve();
                });
            });
        });
    }
    waitForComplete() {
        return this.successPromise || Promise.reject('No Promise');
    }
}
exports.default = ServerController;

},{"@jibo/jibo-server-client":undefined,"jibo":undefined}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Analytics {
    constructor(skill) {
        this.skill = skill;
    }
    recipeTriggered(command) {
        if (command !== 'trigger' && command !== 'abracadabra') {
            console.error(`${command} is an invalid IFTTT trigger command. Not sending Analytics event.`);
            return;
        }
        this.skill.track('IFTTT Trigger', { command });
    }
}
exports.default = Analytics;

},{}],3:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        'meta': {
            'version': 1,
            'name': 'main',
            'uri': '/Users/jon/Workspace/jibo/buildsdk/skills/ifttt/src/flows/main.flow'
        },
        '943fb90c-8699-4eb6-9de1-a1cddc841c94': function () {
            return {
                'id': '943fb90c-8699-4eb6-9de1-a1cddc841c94',
                'name': 'Begin',
                'transitions': [{
                        'frm': '943fb90c-8699-4eb6-9de1-a1cddc841c94',
                        'to': 'ec6d6a76-369d-42e8-8e85-f9f2fd27777b',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Begin',
                'options': {
                    'inputParameters': () => {
                        return {};
                    }
                }
            };
        },
        'a42f06cc-3846-4a21-807f-c75205334c7a': function () {
            return {
                'id': 'a42f06cc-3846-4a21-807f-c75205334c7a',
                'transitions': [],
                'exceptions': [],
                'class': 'Flow.End',
                'options': {
                    'getTransition': () => {
                        return '';
                    }
                }
            };
        },
        '50e93685-cbad-4a50-93e5-d358d29227b5': function () {
            return {
                'id': '50e93685-cbad-4a50-93e5-d358d29227b5',
                'name': 'Failure',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '50e93685-cbad-4a50-93e5-d358d29227b5',
                        'to': 'a42f06cc-3846-4a21-807f-c75205334c7a',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/Failure.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '475581bf-2852-4ebd-a9ff-602bc0e64344': function () {
            return {
                'id': '475581bf-2852-4ebd-a9ff-602bc0e64344',
                'name': 'Success',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '475581bf-2852-4ebd-a9ff-602bc0e64344',
                        'to': 'a42f06cc-3846-4a21-807f-c75205334c7a',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/Success.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        'ec6d6a76-369d-42e8-8e85-f9f2fd27777b': function () {
            return {
                'id': 'ec6d6a76-369d-42e8-8e85-f9f2fd27777b',
                'name': 'send',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': 'ec6d6a76-369d-42e8-8e85-f9f2fd27777b',
                        'to': '50e93685-cbad-4a50-93e5-d358d29227b5',
                        'value': 'failure'
                    },
                    {
                        'frm': 'ec6d6a76-369d-42e8-8e85-f9f2fd27777b',
                        'to': '475581bf-2852-4ebd-a9ff-602bc0e64344',
                        'value': ''
                    },
                    {
                        'frm': 'ec6d6a76-369d-42e8-8e85-f9f2fd27777b',
                        'to': 'b33a5c0f-e94c-474b-853e-c305afa0c769',
                        'value': 'noTrigger'
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Subflow',
                'options': {
                    'inputParameters': () => {
                        return {};
                    },
                    'subflowId': () => {
                        return require('./send');
                    },
                    'getTransition': subflow_result_object => {
                        return subflow_result_object.transition;
                    }
                }
            };
        },
        'b33a5c0f-e94c-474b-853e-c305afa0c769': function () {
            return {
                'id': 'b33a5c0f-e94c-474b-853e-c305afa0c769',
                'name': 'No Trigger',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'b33a5c0f-e94c-474b-853e-c305afa0c769',
                        'to': 'a42f06cc-3846-4a21-807f-c75205334c7a',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/NoTrigger.mim',
                    'getPromptData': () => {
                        return { trigger: blackboard.trigger };
                    }
                }
            };
        }
    };
};
},{"./send":4}],4:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        'meta': {
            'version': 1,
            'name': 'send',
            'uri': '/Users/jon/Workspace/jibo/buildsdk/skills/ifttt/src/flows/send.flow'
        },
        'dec0b94a-b0e1-4186-8b55-d894796356a1': function () {
            return {
                'id': 'dec0b94a-b0e1-4186-8b55-d894796356a1',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'dec0b94a-b0e1-4186-8b55-d894796356a1',
                        'to': '2d2e25da-f394-4d1c-b5e0-c13080443d01',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Begin',
                'options': {
                    'inputParameters': () => {
                        return {};
                    }
                }
            };
        },
        '98220856-283d-4fb7-9fb6-fb22057dbd7d': {
            'id': '98220856-283d-4fb7-9fb6-fb22057dbd7d',
            'asset-pack': 'core',
            'transitions': [{
                    'frm': '98220856-283d-4fb7-9fb6-fb22057dbd7d',
                    'to': 'ec6d6a76-369d-42e8-8e85-f9f2fd27777b',
                    'value': ''
                }],
            'exceptions': [],
            'class': 'Flow.Begin-Parallel',
            'options': {}
        },
        'ec6d6a76-369d-42e8-8e85-f9f2fd27777b': function () {
            return {
                'id': 'ec6d6a76-369d-42e8-8e85-f9f2fd27777b',
                'name': 'Send Trigger',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': 'ec6d6a76-369d-42e8-8e85-f9f2fd27777b',
                        'to': '8357d72f-0f8e-4968-b506-abf51cac2a2c',
                        'value': 'failure'
                    },
                    {
                        'frm': 'ec6d6a76-369d-42e8-8e85-f9f2fd27777b',
                        'to': '84a6c32d-c218-4ac3-9bc9-0f7a3b79f672',
                        'value': 'wait'
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        blackboard.server.trigger(blackboard.trigger).then(() => {
                            done('wait');
                        }, err => {
                            if (err === blackboard.server.NO_TRIGGER) {
                                notepad.failure = 'noTrigger';
                            } else {
                                notepad.failure = 'failure';
                            }
                            done('failure');
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        'd41ba3d9-440c-422c-8208-7d5c051645bc': function () {
            return {
                'id': 'd41ba3d9-440c-422c-8208-7d5c051645bc',
                'asset-pack': 'core',
                'transitions': [],
                'exceptions': [],
                'class': 'Flow.End',
                'options': {
                    'getTransition': () => {
                        return;
                    }
                }
            };
        },
        '34c0eb85-052c-4883-acea-414885a84959': function () {
            return {
                'id': '34c0eb85-052c-4883-acea-414885a84959',
                'name': 'Working',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '34c0eb85-052c-4883-acea-414885a84959',
                        'to': '2d2e25da-f394-4d1c-b5e0-c13080443d01',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/Working.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '8357d72f-0f8e-4968-b506-abf51cac2a2c': function () {
            return {
                'id': '8357d72f-0f8e-4968-b506-abf51cac2a2c',
                'name': '~done',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '8357d72f-0f8e-4968-b506-abf51cac2a2c',
                        'to': 'd41ba3d9-440c-422c-8208-7d5c051645bc',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Interrupt',
                'options': {
                    'getPayload': () => {
                        return {};
                    }
                }
            };
        },
        '2d2e25da-f394-4d1c-b5e0-c13080443d01': function () {
            return {
                'id': '2d2e25da-f394-4d1c-b5e0-c13080443d01',
                'name': 'Wait forever',
                'asset-pack': 'core',
                'transitions': [],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '6fe4c210-86df-44da-95da-2527b2143549': function () {
            return {
                'id': '6fe4c210-86df-44da-95da-2527b2143549',
                'name': '~done',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '6fe4c210-86df-44da-95da-2527b2143549',
                        'to': '7b40106a-ab11-41a0-a0f9-ba3021d5c507',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Catch',
                'options': {
                    'getTransition': (exception, payload) => {
                        return '';
                    }
                }
            };
        },
        '7b40106a-ab11-41a0-a0f9-ba3021d5c507': function () {
            return {
                'id': '7b40106a-ab11-41a0-a0f9-ba3021d5c507',
                'asset-pack': 'core',
                'transitions': [],
                'exceptions': [],
                'class': 'Flow.End',
                'options': {
                    'getTransition': () => {
                        return notepad.failure;
                    }
                }
            };
        },
        '06dcbc9e-327b-459d-9a93-92d348b6a785': function () {
            return {
                'id': '06dcbc9e-327b-459d-9a93-92d348b6a785',
                'name': '~sent',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '06dcbc9e-327b-459d-9a93-92d348b6a785',
                        'to': '34c0eb85-052c-4883-acea-414885a84959',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Catch',
                'options': {
                    'getTransition': (exception, payload) => {
                        return '';
                    }
                }
            };
        },
        '84a6c32d-c218-4ac3-9bc9-0f7a3b79f672': function () {
            return {
                'id': '84a6c32d-c218-4ac3-9bc9-0f7a3b79f672',
                'name': '~sent',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '84a6c32d-c218-4ac3-9bc9-0f7a3b79f672',
                        'to': '2b4ee66e-b786-401a-aa4b-ce48eb335fbe',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Interrupt',
                'options': {
                    'getPayload': () => {
                        return {};
                    }
                }
            };
        },
        '2b4ee66e-b786-401a-aa4b-ce48eb335fbe': function () {
            return {
                'id': '2b4ee66e-b786-401a-aa4b-ce48eb335fbe',
                'name': 'Wait for complete',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '2b4ee66e-b786-401a-aa4b-ce48eb335fbe',
                        'to': '8357d72f-0f8e-4968-b506-abf51cac2a2c',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        blackboard.server.waitForComplete().then(() => {
                            done();
                        }, err => {
                            notepad.failure = 'failure';
                            done();
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        }
    };
};
},{}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const be_framework_1 = require("@be/be-framework");
const jibo = require("jibo");
const ServerController_1 = require("./ServerController");
const Analytics_1 = require("./analytics/Analytics");
let mainFlow = require('./flows/main');
class IFTTT extends be_framework_1.BeSkill {
    constructor(assetPack) {
        super(assetPack);
        this.flow = null;
        this.analytics = new Analytics_1.default(this);
    }
    get allowedInterrupts() {
        return ['@be/idle'];
    }
    preload(done) {
        done();
    }
    open(result) {
        this.server = new ServerController_1.default(Date.now(), this.log);
        let trigger;
        if (result && result.nlu) {
            trigger = result.nlu.entities.slotAction;
        }
        else {
            this.exit();
            return;
        }
        this.analytics.recipeTriggered(result.nlu.entities.command);
        const options = {
            assetPack: this.assetPack,
            enableLogging: false,
            blackboard: {
                server: this.server,
                trigger
            }
        };
        this.flow = jibo.flow.run(mainFlow, options, () => {
            this.exit();
        });
    }
    close(done) {
        if (this.flow) {
            const flow = this.flow;
            this.flow = null;
            flow.stop().then(() => {
                flow.destroy();
                done();
            }, () => {
                done();
            });
        }
        this.server = null;
    }
}
module.exports = IFTTT;

},{"./ServerController":1,"./analytics/Analytics":2,"./flows/main":3,"@be/be-framework":undefined,"jibo":undefined}]},{},[5])(5)
});
//# sourceMappingURL=index.js.map