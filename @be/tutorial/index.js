(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.betutorial = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Analytics {
    constructor(skill) {
        this._eventHeader = 'BB ';
        this._skill = skill;
    }
    reset(launchSource) {
        this._launchSource = launchSource;
    }
    started() {
        this._skill.track(this._eventHeader + 'Started', {
            launch_source: this._launchSource
        });
    }
    completed(didComplete) {
        this._skill.track(this._eventHeader + 'Completed', {
            launch_source: this._launchSource,
            completed: didComplete
        });
    }
    stepComplete(event, didComplete, failedFirst) {
        this._skill.track(this._eventHeader + event, {
            launch_source: this._launchSource,
            completed: didComplete,
            attempt: this.getAttempt(this.makeBoolean(didComplete), this.makeBoolean(failedFirst))
        });
    }
    responseComplete(didComplete = false, liked = false) {
        this._skill.track(this._eventHeader + 'Response Step', {
            launch_source: this._launchSource,
            completed: didComplete,
            liked_dance: liked
        });
    }
    photoQuestionComplete(didComplete = false, saved = true) {
        this._skill.track(this._eventHeader + 'Photo Question Step', {
            launch_source: this._launchSource,
            completed: didComplete,
            saved_photo: saved
        });
    }
    choseEnrollment(didComplete = false, choseEnroll = false) {
        this._skill.track(this._eventHeader + 'Chose Enrollment', {
            completed: didComplete,
            chose_to_enroll: choseEnroll
        });
    }
    getAttempt(didComplete, failedFirst) {
        if (didComplete) {
            return (failedFirst) ? 'second' : 'first';
        }
        else {
            return 'na';
        }
    }
    makeBoolean(value) {
        if (typeof value === 'string') {
            return (value === 'true');
        }
        else {
            return value;
        }
    }
}
exports.default = Analytics;

},{}],2:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        'meta': {
            'version': 1,
            'name': 'main',
            'uri': '/Users/jon/Workspace/jibo/buildsdk/skills/tutorial/src/flows/main.flow'
        },
        '943fb90c-8699-4eb6-9de1-a1cddc841c94': function () {
            return {
                'id': '943fb90c-8699-4eb6-9de1-a1cddc841c94',
                'name': 'Begin',
                'transitions': [{
                        'frm': '943fb90c-8699-4eb6-9de1-a1cddc841c94',
                        'to': 'ac36f055-4318-43c0-b9a1-5c949f96dbe9',
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
        '63dcf7b7-c71b-4f1d-ad27-1d34eebb3389': function () {
            return {
                'id': '63dcf7b7-c71b-4f1d-ad27-1d34eebb3389',
                'name': '01-listen',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '63dcf7b7-c71b-4f1d-ad27-1d34eebb3389',
                        'to': 'aed12fc5-29c5-41f0-8673-bcdbba10843c',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Subflow',
                'options': {
                    'subflowId': () => {
                        return require('./sub-flows/01-listen');
                    },
                    'inputParameters': () => {
                        return {};
                    },
                    'getTransition': subflow_result_object => {
                        return subflow_result_object.transition;
                    }
                }
            };
        },
        'aed12fc5-29c5-41f0-8673-bcdbba10843c': function () {
            return {
                'id': 'aed12fc5-29c5-41f0-8673-bcdbba10843c',
                'name': '02-command',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'aed12fc5-29c5-41f0-8673-bcdbba10843c',
                        'to': '32e95c36-b787-4ce3-9e1c-b975ce61ea6f',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Subflow',
                'options': {
                    'subflowId': () => {
                        return require('./sub-flows/02-command');
                    },
                    'inputParameters': () => {
                        return {};
                    },
                    'getTransition': subflow_result_object => {
                        return subflow_result_object.transition;
                    }
                }
            };
        },
        '32e95c36-b787-4ce3-9e1c-b975ce61ea6f': function () {
            return {
                'id': '32e95c36-b787-4ce3-9e1c-b975ce61ea6f',
                'name': '03-question',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '32e95c36-b787-4ce3-9e1c-b975ce61ea6f',
                        'to': '295b47c9-21fe-45dc-b5ff-e25787c47932',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Subflow',
                'options': {
                    'subflowId': () => {
                        return require('./sub-flows/03-question');
                    },
                    'inputParameters': () => {
                        return {};
                    },
                    'getTransition': subflow_result_object => {
                        return subflow_result_object.transition;
                    }
                }
            };
        },
        '295b47c9-21fe-45dc-b5ff-e25787c47932': function () {
            return {
                'id': '295b47c9-21fe-45dc-b5ff-e25787c47932',
                'name': '04-gui',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '295b47c9-21fe-45dc-b5ff-e25787c47932',
                        'to': '46742dcc-830d-4bb2-84be-86e2edc041c9',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Subflow',
                'options': {
                    'subflowId': () => {
                        return require('./sub-flows/04-gui');
                    },
                    'inputParameters': () => {
                        return {};
                    },
                    'getTransition': subflow_result_object => {
                        return subflow_result_object.transition;
                    }
                }
            };
        },
        'ac36f055-4318-43c0-b9a1-5c949f96dbe9': function () {
            return {
                'id': 'ac36f055-4318-43c0-b9a1-5c949f96dbe9',
                'name': 'Skip to Flow',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': 'ac36f055-4318-43c0-b9a1-5c949f96dbe9',
                        'to': '63dcf7b7-c71b-4f1d-ad27-1d34eebb3389',
                        'value': '1'
                    },
                    {
                        'frm': 'ac36f055-4318-43c0-b9a1-5c949f96dbe9',
                        'to': 'aed12fc5-29c5-41f0-8673-bcdbba10843c',
                        'value': '2'
                    },
                    {
                        'frm': 'ac36f055-4318-43c0-b9a1-5c949f96dbe9',
                        'to': '32e95c36-b787-4ce3-9e1c-b975ce61ea6f',
                        'value': '3'
                    },
                    {
                        'frm': 'ac36f055-4318-43c0-b9a1-5c949f96dbe9',
                        'to': '295b47c9-21fe-45dc-b5ff-e25787c47932',
                        'value': '4'
                    },
                    {
                        'frm': 'ac36f055-4318-43c0-b9a1-5c949f96dbe9',
                        'to': '46742dcc-830d-4bb2-84be-86e2edc041c9',
                        'value': '5'
                    },
                    {
                        'frm': 'ac36f055-4318-43c0-b9a1-5c949f96dbe9',
                        'to': 'f31f7ffb-238c-483e-96db-90a769db8357',
                        'value': ''
                    },
                    {
                        'frm': 'ac36f055-4318-43c0-b9a1-5c949f96dbe9',
                        'to': '09b8db8b-1d3b-4114-8cb5-cc9ac95a988e',
                        'value': '6'
                    },
                    {
                        'frm': 'ac36f055-4318-43c0-b9a1-5c949f96dbe9',
                        'to': 'f636bd15-c4d9-4bc4-b419-a5f9146e80e5',
                        'value': '7'
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        return blackboard.step;
                    }
                }
            };
        },
        '59a63dc1-7a04-4264-a2a4-2416bbd31c5e': {
            'id': '59a63dc1-7a04-4264-a2a4-2416bbd31c5e',
            'asset-pack': 'core',
            'transitions': [],
            'exceptions': [],
            'class': 'Flow.Comment',
            'options': {}
        },
        'f31f7ffb-238c-483e-96db-90a769db8357': function () {
            return {
                'id': 'f31f7ffb-238c-483e-96db-90a769db8357',
                'name': 'Intro',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'f31f7ffb-238c-483e-96db-90a769db8357',
                        'to': '63dcf7b7-c71b-4f1d-ad27-1d34eebb3389',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/Tut_Intro.mim',
                    'getPromptData': () => {
                        return { oobe: blackboard.oobe };
                    }
                }
            };
        },
        '38b93945-d328-4f4f-ad42-95024ad31300': {
            'id': '38b93945-d328-4f4f-ad42-95024ad31300',
            'asset-pack': 'core',
            'transitions': [],
            'exceptions': [],
            'class': 'Flow.Comment',
            'options': {}
        },
        'bdfbfb5c-fa4b-42c1-ba45-4527490ac7ce': {
            'id': 'bdfbfb5c-fa4b-42c1-ba45-4527490ac7ce',
            'asset-pack': 'core',
            'transitions': [],
            'exceptions': [],
            'class': 'Flow.Comment',
            'options': {}
        },
        '09b8db8b-1d3b-4114-8cb5-cc9ac95a988e': function () {
            return {
                'id': '09b8db8b-1d3b-4114-8cb5-cc9ac95a988e',
                'name': '06-photo',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '09b8db8b-1d3b-4114-8cb5-cc9ac95a988e',
                        'to': 'f636bd15-c4d9-4bc4-b419-a5f9146e80e5',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Subflow',
                'options': {
                    'subflowId': () => {
                        return require('./sub-flows/06-photo');
                    },
                    'inputParameters': () => {
                        return {};
                    },
                    'getTransition': subflow_result_object => {
                        return subflow_result_object.transition;
                    }
                }
            };
        },
        '46742dcc-830d-4bb2-84be-86e2edc041c9': function () {
            return {
                'id': '46742dcc-830d-4bb2-84be-86e2edc041c9',
                'name': '05-stop',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '46742dcc-830d-4bb2-84be-86e2edc041c9',
                        'to': '09b8db8b-1d3b-4114-8cb5-cc9ac95a988e',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Subflow',
                'options': {
                    'subflowId': () => {
                        return require('./sub-flows/05-stop');
                    },
                    'inputParameters': () => {
                        return {};
                    },
                    'getTransition': subflow_result_object => {
                        return subflow_result_object.transition;
                    }
                }
            };
        },
        'f636bd15-c4d9-4bc4-b419-a5f9146e80e5': function () {
            return {
                'id': 'f636bd15-c4d9-4bc4-b419-a5f9146e80e5',
                'name': '07-outro',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': 'f636bd15-c4d9-4bc4-b419-a5f9146e80e5',
                        'to': 'a42f06cc-3846-4a21-807f-c75205334c7a',
                        'value': ''
                    },
                    {
                        'frm': 'f636bd15-c4d9-4bc4-b419-a5f9146e80e5',
                        'to': '18f81559-f632-40c4-a6ce-88f40103512e',
                        'value': 'enrollment'
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Subflow',
                'options': {
                    'subflowId': () => {
                        return require('./sub-flows/07-outro');
                    },
                    'inputParameters': () => {
                        return {};
                    },
                    'getTransition': subflow_result_object => {
                        return subflow_result_object.transition;
                    }
                }
            };
        },
        '18f81559-f632-40c4-a6ce-88f40103512e': function () {
            return {
                'id': '18f81559-f632-40c4-a6ce-88f40103512e',
                'name': 'enrollment',
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
        }
    };
};
},{"./sub-flows/01-listen":3,"./sub-flows/02-command":5,"./sub-flows/03-question":7,"./sub-flows/04-gui":8,"./sub-flows/05-stop":12,"./sub-flows/06-photo":14,"./sub-flows/07-outro":20}],3:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        'meta': {
            'version': 1,
            'name': '01-listen',
            'uri': '/Users/jon/Workspace/jibo/buildsdk/skills/tutorial/src/flows/sub-flows/01-listen.flow'
        },
        '882a802f-3e67-49d6-92d4-215d370ad2ce': function () {
            return {
                'id': '882a802f-3e67-49d6-92d4-215d370ad2ce',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '882a802f-3e67-49d6-92d4-215d370ad2ce',
                        'to': 'f94ec977-1936-4560-a91e-4e2a6db95262',
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
        'af469b41-5636-490e-bec6-7e3b6f6ff2df': function () {
            return {
                'id': 'af469b41-5636-490e-bec6-7e3b6f6ff2df',
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
        'f94ec977-1936-4560-a91e-4e2a6db95262': function () {
            return {
                'id': 'f94ec977-1936-4560-a91e-4e2a6db95262',
                'name': 'HJ Intro',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'f94ec977-1936-4560-a91e-4e2a6db95262',
                        'to': '3fc1781d-6eb2-4693-85ac-599341589fe0',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/Tut_HJIntro.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '12fbe51a-c5f7-4f32-94c6-18b691a87d6e': function () {
            return {
                'id': '12fbe51a-c5f7-4f32-94c6-18b691a87d6e',
                'name': 'HJ Oops',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '12fbe51a-c5f7-4f32-94c6-18b691a87d6e',
                        'to': '3f944f00-2ee4-4eba-bf5d-41cb10fee04d',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/Tut_HJOops.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '3fc1781d-6eb2-4693-85ac-599341589fe0': function () {
            return {
                'id': '3fc1781d-6eb2-4693-85ac-599341589fe0',
                'name': 'Engaged ON',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '3fc1781d-6eb2-4693-85ac-599341589fe0',
                        'to': '12fbe51a-c5f7-4f32-94c6-18b691a87d6e',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        blackboard.skill.setEngaged(true);
                    }
                }
            };
        },
        '1ba93699-03a6-4bdb-b317-19eb8fa38a53': function () {
            return {
                'id': '1ba93699-03a6-4bdb-b317-19eb8fa38a53',
                'name': 'HJ Fail 2',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '1ba93699-03a6-4bdb-b317-19eb8fa38a53',
                        'to': 'af469b41-5636-490e-bec6-7e3b6f6ff2df',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/Tut_HJFail_2.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        'b7827670-9f1e-48ed-87c6-6799a2518627': function () {
            return {
                'id': 'b7827670-9f1e-48ed-87c6-6799a2518627',
                'name': 'HJ Success',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'b7827670-9f1e-48ed-87c6-6799a2518627',
                        'to': 'af469b41-5636-490e-bec6-7e3b6f6ff2df',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/Tut_HJSuccess.mim',
                    'getPromptData': () => {
                        return { oobe: blackboard.oobe };
                    }
                }
            };
        },
        '3f944f00-2ee4-4eba-bf5d-41cb10fee04d': function () {
            return {
                'id': '3f944f00-2ee4-4eba-bf5d-41cb10fee04d',
                'name': 'Engaged OFF',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '3f944f00-2ee4-4eba-bf5d-41cb10fee04d',
                        'to': 'e4818638-0b41-4e3b-ab25-035c6759e7ea',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        blackboard.skill.setEngaged(false);
                        return '';
                    }
                }
            };
        },
        'e4818638-0b41-4e3b-ab25-035c6759e7ea': function () {
            return {
                'id': 'e4818638-0b41-4e3b-ab25-035c6759e7ea',
                'name': '01A-listen',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': 'e4818638-0b41-4e3b-ab25-035c6759e7ea',
                        'to': '1ba93699-03a6-4bdb-b317-19eb8fa38a53',
                        'value': ''
                    },
                    {
                        'frm': 'e4818638-0b41-4e3b-ab25-035c6759e7ea',
                        'to': '0219f990-72e4-4b1a-bd42-d154ae67f930',
                        'value': 'true'
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Subflow',
                'options': {
                    'subflowId': () => {
                        return require('./01A-listen');
                    },
                    'inputParameters': () => {
                        return {};
                    },
                    'getTransition': subflow_result_object => {
                        return subflow_result_object.heard;
                    }
                }
            };
        },
        '8841301d-0376-4383-93b0-544213e38fcf': function () {
            return {
                'id': '8841301d-0376-4383-93b0-544213e38fcf',
                'name': 'End Listen',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '8841301d-0376-4383-93b0-544213e38fcf',
                        'to': 'b7827670-9f1e-48ed-87c6-6799a2518627',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        jibo.jetstream.events.globalTurnResult.emit({ status: jibo.jetstream.types.TurnResultType.TIMEOUT });
                    }
                }
            };
        },
        '0219f990-72e4-4b1a-bd42-d154ae67f930': function () {
            return {
                'id': '0219f990-72e4-4b1a-bd42-d154ae67f930',
                'name': 'Delay',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '0219f990-72e4-4b1a-bd42-d154ae67f930',
                        'to': '8841301d-0376-4383-93b0-544213e38fcf',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'TimeoutJs',
                'options': {
                    'getTime': () => {
                        return 1500;
                    }
                }
            };
        }
    };
};
},{"./01A-listen":4}],4:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        'meta': {
            'version': 1,
            'name': '01A-listen',
            'uri': '/Users/jon/Workspace/jibo/buildsdk/skills/tutorial/src/flows/sub-flows/01A-listen.flow'
        },
        '9114f526-a5e0-4c10-85f5-34aa24d03215': function () {
            return {
                'id': '9114f526-a5e0-4c10-85f5-34aa24d03215',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '9114f526-a5e0-4c10-85f5-34aa24d03215',
                        'to': 'cebb20b3-c162-4643-b09a-7c653869abee',
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
        '7b53af8b-9934-48fe-b3e7-b8efe99c9ee1': {
            'id': '7b53af8b-9934-48fe-b3e7-b8efe99c9ee1',
            'asset-pack': 'core',
            'transitions': [{
                    'frm': '7b53af8b-9934-48fe-b3e7-b8efe99c9ee1',
                    'to': '25ede70f-8c39-4a4d-a41f-a17d4cbd5008',
                    'value': ''
                }],
            'exceptions': [],
            'class': 'Flow.Begin-Parallel',
            'options': {}
        },
        'cebb20b3-c162-4643-b09a-7c653869abee': function () {
            return {
                'id': 'cebb20b3-c162-4643-b09a-7c653869abee',
                'name': 'HJ Try Now',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'cebb20b3-c162-4643-b09a-7c653869abee',
                        'to': 'caa2cf77-3e70-46f9-b4f4-f4324114310b',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/Tut_HJTryNow.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '44a8b571-bd52-4e01-b1b8-7772f47d9753': function () {
            return {
                'id': '44a8b571-bd52-4e01-b1b8-7772f47d9753',
                'name': 'HJ Fail 1',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '44a8b571-bd52-4e01-b1b8-7772f47d9753',
                        'to': '112c720a-a059-4d2a-8139-67ccf2851aa5',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/Tut_HJFail_1.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '25ede70f-8c39-4a4d-a41f-a17d4cbd5008': function () {
            return {
                'id': '25ede70f-8c39-4a4d-a41f-a17d4cbd5008',
                'name': 'Wait for HJ',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '25ede70f-8c39-4a4d-a41f-a17d4cbd5008',
                        'to': 'd3c0f5df-20fe-439b-97fa-3e2209451a72',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        blackboard.skill.waitForHJ(done);
                    },
                    'onStop': () => {
                        blackboard.skill.cleanUpHJ();
                    }
                }
            };
        },
        '4502f53d-3295-4684-974a-1070677e7b9c': function () {
            return {
                'id': '4502f53d-3295-4684-974a-1070677e7b9c',
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
        'caa2cf77-3e70-46f9-b4f4-f4324114310b': function () {
            return {
                'id': 'caa2cf77-3e70-46f9-b4f4-f4324114310b',
                'name': 'Wait',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'caa2cf77-3e70-46f9-b4f4-f4324114310b',
                        'to': '87ac1aaf-e523-4b37-87fe-2aeacdd467b9',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'TimeoutJs',
                'options': {
                    'getTime': () => {
                        return blackboard.waitTime;
                    }
                }
            };
        },
        'f743f1b2-8ba9-4b75-86a9-c249f0aa7ca4': function () {
            return {
                'id': 'f743f1b2-8ba9-4b75-86a9-c249f0aa7ca4',
                'name': 'Wait',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'f743f1b2-8ba9-4b75-86a9-c249f0aa7ca4',
                        'to': 'c3dfdb6e-9c2c-4988-9cbd-b155a9380cd7',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'TimeoutJs',
                'options': {
                    'getTime': () => {
                        return blackboard.waitTime;
                    }
                }
            };
        },
        '112c720a-a059-4d2a-8139-67ccf2851aa5': function () {
            return {
                'id': '112c720a-a059-4d2a-8139-67ccf2851aa5',
                'name': 'Show \'Hey Jibo\'',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '112c720a-a059-4d2a-8139-67ccf2851aa5',
                        'to': 'f743f1b2-8ba9-4b75-86a9-c249f0aa7ca4',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        jibo.face.views.changeView({
                            removeAll: true,
                            addView: 'assets/views/hey-jibo-view.json'
                        }, () => {
                            done();
                        }, () => {
                            done();
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        'd3c0f5df-20fe-439b-97fa-3e2209451a72': function () {
            return {
                'id': 'd3c0f5df-20fe-439b-97fa-3e2209451a72',
                'name': '~heardHJ',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'd3c0f5df-20fe-439b-97fa-3e2209451a72',
                        'to': '4a1698ab-e37f-4d07-90ea-156df906751f',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Interrupt',
                'options': {
                    'getPayload': () => {
                        return { heard: 'true' };
                    }
                }
            };
        },
        'af8ab4c7-a709-4d8a-b561-e43e04da9215': function () {
            return {
                'id': 'af8ab4c7-a709-4d8a-b561-e43e04da9215',
                'name': '~heardHJ',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'af8ab4c7-a709-4d8a-b561-e43e04da9215',
                        'to': 'c9dfef6b-be91-498b-8ca4-ce190c1ee878',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Catch',
                'options': {
                    'getTransition': (exception, payload) => {
                        return payload.heard;
                    }
                }
            };
        },
        'c3dfdb6e-9c2c-4988-9cbd-b155a9380cd7': function () {
            return {
                'id': 'c3dfdb6e-9c2c-4988-9cbd-b155a9380cd7',
                'name': 'No HJ',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'c3dfdb6e-9c2c-4988-9cbd-b155a9380cd7',
                        'to': 'c9dfef6b-be91-498b-8ca4-ce190c1ee878',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        return 'false';
                    }
                }
            };
        },
        '4a1698ab-e37f-4d07-90ea-156df906751f': function () {
            return {
                'id': '4a1698ab-e37f-4d07-90ea-156df906751f',
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
        'c9dfef6b-be91-498b-8ca4-ce190c1ee878': function () {
            return {
                'id': 'c9dfef6b-be91-498b-8ca4-ce190c1ee878',
                'name': 'Uninterrupt HJ',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'c9dfef6b-be91-498b-8ca4-ce190c1ee878',
                        'to': '4502f53d-3295-4684-974a-1070677e7b9c',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        result.heard = this.inTransition;
                        blackboard.tracker.stepComplete('HJ Step', result.heard, notepad.failedFirst);
                        blackboard.skill.cleanUpHJ().then(() => {
                            jibo.globalEvents.shared.nonInterruptingGlobal.emit();
                            jibo.face.views.forceEyeView(() => {
                                done();
                            });
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '87ac1aaf-e523-4b37-87fe-2aeacdd467b9': function () {
            return {
                'id': '87ac1aaf-e523-4b37-87fe-2aeacdd467b9',
                'name': 'Tracking Fail',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '87ac1aaf-e523-4b37-87fe-2aeacdd467b9',
                        'to': '44a8b571-bd52-4e01-b1b8-7772f47d9753',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        notepad.failedFirst = true;
                    }
                }
            };
        }
    };
};
},{}],5:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        'meta': {
            'version': 1,
            'name': '02-command',
            'uri': '/Users/jon/Workspace/jibo/buildsdk/skills/tutorial/src/flows/sub-flows/02-command.flow'
        },
        '882a802f-3e67-49d6-92d4-215d370ad2ce': function () {
            return {
                'id': '882a802f-3e67-49d6-92d4-215d370ad2ce',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '882a802f-3e67-49d6-92d4-215d370ad2ce',
                        'to': 'e4818638-0b41-4e3b-ab25-035c6759e7ea',
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
        'af469b41-5636-490e-bec6-7e3b6f6ff2df': function () {
            return {
                'id': 'af469b41-5636-490e-bec6-7e3b6f6ff2df',
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
        '75879fe7-fc90-4f86-b5f4-dbeca454979d': function () {
            return {
                'id': '75879fe7-fc90-4f86-b5f4-dbeca454979d',
                'name': 'HJ Cmd Fail 2',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '75879fe7-fc90-4f86-b5f4-dbeca454979d',
                        'to': 'e7101790-5f9a-4435-84ef-aa200ec7ccb9',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/Tut_HJCmdFail_2.mim',
                    'getPromptData': () => {
                        return { oobe: blackboard.oobe };
                    }
                }
            };
        },
        '490761f7-03d6-4232-b4a0-869956c5792a': function () {
            return {
                'id': '490761f7-03d6-4232-b4a0-869956c5792a',
                'name': 'HJ Cmd Success',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '490761f7-03d6-4232-b4a0-869956c5792a',
                        'to': 'e7101790-5f9a-4435-84ef-aa200ec7ccb9',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/Tut_HJCmdSuccess.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '27b12155-b9e2-42da-b776-ce6f503c5daa': function () {
            return {
                'id': '27b12155-b9e2-42da-b776-ce6f503c5daa',
                'name': 'HJ Cmd Do Dance',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '27b12155-b9e2-42da-b776-ce6f503c5daa',
                        'to': 'af469b41-5636-490e-bec6-7e3b6f6ff2df',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/Tut_HJCmdDoDance.mim',
                    'getPromptData': () => {
                        return { oobe: blackboard.oobe };
                    }
                }
            };
        },
        'e7101790-5f9a-4435-84ef-aa200ec7ccb9': function () {
            return {
                'id': 'e7101790-5f9a-4435-84ef-aa200ec7ccb9',
                'name': 'center robot',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'e7101790-5f9a-4435-84ef-aa200ec7ccb9',
                        'to': '27b12155-b9e2-42da-b776-ce6f503c5daa',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        jibo.expression.centerRobot({ dofs: jibo.expression.dofs.BODY }).then(() => {
                            done('');
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        'e4818638-0b41-4e3b-ab25-035c6759e7ea': function () {
            return {
                'id': 'e4818638-0b41-4e3b-ab25-035c6759e7ea',
                'name': '02A-command',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': 'e4818638-0b41-4e3b-ab25-035c6759e7ea',
                        'to': '490761f7-03d6-4232-b4a0-869956c5792a',
                        'value': 'true'
                    },
                    {
                        'frm': 'e4818638-0b41-4e3b-ab25-035c6759e7ea',
                        'to': '75879fe7-fc90-4f86-b5f4-dbeca454979d',
                        'value': ''
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Subflow',
                'options': {
                    'subflowId': () => {
                        return require('./02A-command');
                    },
                    'inputParameters': () => {
                        return {};
                    },
                    'getTransition': subflow_result_object => {
                        return subflow_result_object.heard;
                    }
                }
            };
        }
    };
};
},{"./02A-command":6}],6:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        'meta': {
            'version': 1,
            'name': '02A-command',
            'uri': '/Users/jon/Workspace/jibo/buildsdk/skills/tutorial/src/flows/sub-flows/02A-command.flow'
        },
        'cfb5149c-f802-4986-8c8b-e1876c211e55': function () {
            return {
                'id': 'cfb5149c-f802-4986-8c8b-e1876c211e55',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'cfb5149c-f802-4986-8c8b-e1876c211e55',
                        'to': 'bca4e484-d39a-4aae-bf72-1accc77e1fe1',
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
        '7b332dfc-0438-441e-a40c-c01643dacef9': {
            'id': '7b332dfc-0438-441e-a40c-c01643dacef9',
            'asset-pack': 'core',
            'transitions': [{
                    'frm': '7b332dfc-0438-441e-a40c-c01643dacef9',
                    'to': '83aa7464-f5e3-43cf-b4d4-df5f95ae5cd7',
                    'value': ''
                }],
            'exceptions': [],
            'class': 'Flow.Begin-Parallel',
            'options': {}
        },
        '83aa7464-f5e3-43cf-b4d4-df5f95ae5cd7': function () {
            return {
                'id': '83aa7464-f5e3-43cf-b4d4-df5f95ae5cd7',
                'name': 'Wait for Skill Relaunch',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '83aa7464-f5e3-43cf-b4d4-df5f95ae5cd7',
                        'to': '0acd30a6-7fe5-441c-811c-10e82af84325',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        blackboard.skill.waitForHJCommand('dance', () => {
                            done();
                        });
                    },
                    'onStop': () => {
                        blackboard.skill.cleanUpHJCommand();
                    }
                }
            };
        },
        '0acd30a6-7fe5-441c-811c-10e82af84325': function () {
            return {
                'id': '0acd30a6-7fe5-441c-811c-10e82af84325',
                'name': '~skillRelaunch',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '0acd30a6-7fe5-441c-811c-10e82af84325',
                        'to': '32a6c3db-4465-48d7-99a8-c4b22b73099b',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Interrupt',
                'options': {
                    'getPayload': () => {
                        return { heard: 'true' };
                    }
                }
            };
        },
        '32a6c3db-4465-48d7-99a8-c4b22b73099b': function () {
            return {
                'id': '32a6c3db-4465-48d7-99a8-c4b22b73099b',
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
        '756d948d-f28f-4d68-a015-ed2fa67315cf': function () {
            return {
                'id': '756d948d-f28f-4d68-a015-ed2fa67315cf',
                'name': 'Show \'Hey Jibo Dance\'',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '756d948d-f28f-4d68-a015-ed2fa67315cf',
                        'to': '61e7c5c9-2125-4442-9d32-0666fa739210',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        blackboard.skill.showCommandView('dance', done);
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        'efcab9c1-4174-4bb5-ac94-381f4538ab72': function () {
            return {
                'id': 'efcab9c1-4174-4bb5-ac94-381f4538ab72',
                'name': 'No Skill Relaunch',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'efcab9c1-4174-4bb5-ac94-381f4538ab72',
                        'to': 'c9dfef6b-be91-498b-8ca4-ce190c1ee878',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'getPayload': () => {
                        return {};
                    },
                    'Script': () => {
                        return '';
                    }
                }
            };
        },
        '42d055f0-c24d-4127-a315-ff784b3fe16d': function () {
            return {
                'id': '42d055f0-c24d-4127-a315-ff784b3fe16d',
                'name': '~skillRelaunch',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '42d055f0-c24d-4127-a315-ff784b3fe16d',
                        'to': 'c9dfef6b-be91-498b-8ca4-ce190c1ee878',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Catch',
                'options': {
                    'getTransition': (exception, payload) => {
                        return payload.heard;
                    }
                }
            };
        },
        '71aded23-5d8b-4eba-880d-a052b58b1117': function () {
            return {
                'id': '71aded23-5d8b-4eba-880d-a052b58b1117',
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
        'bca4e484-d39a-4aae-bf72-1accc77e1fe1': function () {
            return {
                'id': 'bca4e484-d39a-4aae-bf72-1accc77e1fe1',
                'name': 'HJ Cmd Intro',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'bca4e484-d39a-4aae-bf72-1accc77e1fe1',
                        'to': '37d24c17-dc85-4af1-9b09-f9f22cdaafc9',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/Tut_HJCmdIntro.mim',
                    'getPromptData': () => {
                        return { oobe: blackboard.oobe };
                    }
                }
            };
        },
        'b73baf7f-a384-4657-b244-b4093d7dc19f': function () {
            return {
                'id': 'b73baf7f-a384-4657-b244-b4093d7dc19f',
                'name': 'HJ Cmd Nothing',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'b73baf7f-a384-4657-b244-b4093d7dc19f',
                        'to': '756d948d-f28f-4d68-a015-ed2fa67315cf',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/Tut_HJCmdFail_Nothing.mim',
                    'getPromptData': () => {
                        return { oobe: blackboard.oobe };
                    }
                }
            };
        },
        'c9dfef6b-be91-498b-8ca4-ce190c1ee878': function () {
            return {
                'id': 'c9dfef6b-be91-498b-8ca4-ce190c1ee878',
                'name': 'Uninterrupt HJ Command',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'c9dfef6b-be91-498b-8ca4-ce190c1ee878',
                        'to': '71aded23-5d8b-4eba-880d-a052b58b1117',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        result.heard = this.inTransition;
                        blackboard.tracker.stepComplete('HJ Command Step', result.heard, notepad.failedFirst);
                        blackboard.skill.cleanUpHJCommand().then(() => {
                            jibo.globalEvents.shared.nonInterruptingGlobal.emit();
                            jibo.face.views.forceEyeView(() => {
                                done();
                            });
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '37d24c17-dc85-4af1-9b09-f9f22cdaafc9': function () {
            return {
                'id': '37d24c17-dc85-4af1-9b09-f9f22cdaafc9',
                'name': 'handleHJ',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '37d24c17-dc85-4af1-9b09-f9f22cdaafc9',
                        'to': 'b73baf7f-a384-4657-b244-b4093d7dc19f',
                        'value': 'wait'
                    },
                    {
                        'frm': '37d24c17-dc85-4af1-9b09-f9f22cdaafc9',
                        'to': 'c8b6d540-873f-4467-b554-1a8bd185f141',
                        'value': 'hjOnly'
                    },
                    {
                        'frm': '37d24c17-dc85-4af1-9b09-f9f22cdaafc9',
                        'to': '572c37c8-5558-4438-b461-34771f2ad7aa',
                        'value': 'noMatch'
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        blackboard.skill.handleHJ(done);
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        'c8b6d540-873f-4467-b554-1a8bd185f141': function () {
            return {
                'id': 'c8b6d540-873f-4467-b554-1a8bd185f141',
                'name': 'HJ Cmd Fail HJOnly',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'c8b6d540-873f-4467-b554-1a8bd185f141',
                        'to': '756d948d-f28f-4d68-a015-ed2fa67315cf',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/Tut_HJCmdFail_HJOnly.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '61e7c5c9-2125-4442-9d32-0666fa739210': function () {
            return {
                'id': '61e7c5c9-2125-4442-9d32-0666fa739210',
                'name': 'handleHJ',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '61e7c5c9-2125-4442-9d32-0666fa739210',
                        'to': 'efcab9c1-4174-4bb5-ac94-381f4538ab72',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        blackboard.skill.handleHJ(done);
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '572c37c8-5558-4438-b461-34771f2ad7aa': function () {
            return {
                'id': '572c37c8-5558-4438-b461-34771f2ad7aa',
                'name': 'HJ Cmd Fail NoMatch',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '572c37c8-5558-4438-b461-34771f2ad7aa',
                        'to': '756d948d-f28f-4d68-a015-ed2fa67315cf',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/Tut_HJCmdFail_HJNoMatch.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        }
    };
};
},{}],7:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        'meta': {
            'version': 1,
            'name': '03-question',
            'uri': '/Users/jon/Workspace/jibo/buildsdk/skills/tutorial/src/flows/sub-flows/03-question.flow'
        },
        '882a802f-3e67-49d6-92d4-215d370ad2ce': function () {
            return {
                'id': '882a802f-3e67-49d6-92d4-215d370ad2ce',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '882a802f-3e67-49d6-92d4-215d370ad2ce',
                        'to': '639a5487-481b-42a8-87fc-853ab408d27b',
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
        '639a5487-481b-42a8-87fc-853ab408d27b': function () {
            return {
                'id': '639a5487-481b-42a8-87fc-853ab408d27b',
                'name': 'Question For You',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '639a5487-481b-42a8-87fc-853ab408d27b',
                        'to': '14aeb3e4-20df-468c-9a60-b22577809167',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/Tut_QuestionForYou.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '14aeb3e4-20df-468c-9a60-b22577809167': function () {
            return {
                'id': '14aeb3e4-20df-468c-9a60-b22577809167',
                'name': 'Question Liked Dance',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '14aeb3e4-20df-468c-9a60-b22577809167',
                        'to': '25907ec4-59c8-4cf5-a57a-7098c9f4bd7f',
                        'value': ''
                    }],
                'exceptions': [{
                        'frm': '14aeb3e4-20df-468c-9a60-b22577809167',
                        'to': '25907ec4-59c8-4cf5-a57a-7098c9f4bd7f',
                        'value': '~InteractionError'
                    }],
                'class': 'Mim.Question',
                'options': {
                    'mimPath': 'mims/en-us/Tut_QuestionLikedDance.mim',
                    'getPromptData': () => {
                        return { oobe: blackboard.oobe };
                    },
                    'onStatus': status => {
                        let mimState = status.state;
                        let asrResults = status.asrResults;
                    },
                    'onSuccess': results => {
                        let mimState = results.state;
                        let asrResults = results.asrResults;
                        let transition = results.firstGrammarTag;
                        return transition;
                    },
                    'onFailure': results => {
                        let mimState = results.state;
                        let asrResults = results.asrResults;
                        let exception = results.exception;
                        return exception;
                    }
                }
            };
        },
        '1a680341-3b15-4275-b973-dbad3178e55b': function () {
            return {
                'id': '1a680341-3b15-4275-b973-dbad3178e55b',
                'name': 'Question Yes',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '1a680341-3b15-4275-b973-dbad3178e55b',
                        'to': '0dcdc194-0433-43e0-9b65-4873aa6481f6',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/Tut_QuestionYes.mim',
                    'getPromptData': () => {
                        return { oobe: blackboard.oobe };
                    }
                }
            };
        },
        'e2c3727a-a67a-4cc2-a19c-10b81d57a724': function () {
            return {
                'id': 'e2c3727a-a67a-4cc2-a19c-10b81d57a724',
                'name': 'Question No',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'e2c3727a-a67a-4cc2-a19c-10b81d57a724',
                        'to': '0dcdc194-0433-43e0-9b65-4873aa6481f6',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/Tut_QuestionNo.mim',
                    'getPromptData': () => {
                        return { oobe: blackboard.oobe };
                    }
                }
            };
        },
        'a84d326b-417c-4338-821a-5f75f861993b': function () {
            return {
                'id': 'a84d326b-417c-4338-821a-5f75f861993b',
                'name': 'Question Max Errors',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'a84d326b-417c-4338-821a-5f75f861993b',
                        'to': '0dcdc194-0433-43e0-9b65-4873aa6481f6',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/Tut_QuestionMaxErrors.mim',
                    'getPromptData': () => {
                        return { oobe: blackboard.oobe };
                    }
                }
            };
        },
        '25907ec4-59c8-4cf5-a57a-7098c9f4bd7f': function () {
            return {
                'id': '25907ec4-59c8-4cf5-a57a-7098c9f4bd7f',
                'name': 'Track Choice',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '25907ec4-59c8-4cf5-a57a-7098c9f4bd7f',
                        'to': '1a680341-3b15-4275-b973-dbad3178e55b',
                        'value': 'yes'
                    },
                    {
                        'frm': '25907ec4-59c8-4cf5-a57a-7098c9f4bd7f',
                        'to': 'e2c3727a-a67a-4cc2-a19c-10b81d57a724',
                        'value': 'no'
                    },
                    {
                        'frm': '25907ec4-59c8-4cf5-a57a-7098c9f4bd7f',
                        'to': 'a84d326b-417c-4338-821a-5f75f861993b',
                        'value': ''
                    }
                ],
                'exceptions': [{
                        'frm': '25907ec4-59c8-4cf5-a57a-7098c9f4bd7f',
                        'to': 'a84d326b-417c-4338-821a-5f75f861993b',
                        'value': '~'
                    }],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        let inTrans = this.inTransition;
                        if (inTrans === 'yes') {
                            blackboard.tracker.responseComplete(true, true);
                        } else if (inTrans === 'no') {
                            blackboard.tracker.responseComplete(true, false);
                        } else {
                            blackboard.tracker.responseComplete(false, false);
                        }
                        return this.inTransition;
                    }
                }
            };
        },
        '0dcdc194-0433-43e0-9b65-4873aa6481f6': function () {
            return {
                'id': '0dcdc194-0433-43e0-9b65-4873aa6481f6',
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
        }
    };
};
},{}],8:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        'meta': {
            'version': 1,
            'name': '04-gui',
            'uri': '/Users/jon/Workspace/jibo/buildsdk/skills/tutorial/src/flows/sub-flows/04-gui.flow'
        },
        '882a802f-3e67-49d6-92d4-215d370ad2ce': function () {
            return {
                'id': '882a802f-3e67-49d6-92d4-215d370ad2ce',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '882a802f-3e67-49d6-92d4-215d370ad2ce',
                        'to': '3188bddf-0027-4006-98d2-aebcffe05ded',
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
        'af469b41-5636-490e-bec6-7e3b6f6ff2df': function () {
            return {
                'id': 'af469b41-5636-490e-bec6-7e3b6f6ff2df',
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
        '3188bddf-0027-4006-98d2-aebcffe05ded': function () {
            return {
                'id': '3188bddf-0027-4006-98d2-aebcffe05ded',
                'name': 'Touch Intro',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '3188bddf-0027-4006-98d2-aebcffe05ded',
                        'to': '0fbab295-7570-4561-b10b-09eba9c72c12',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/Tut_TouchIntro.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '039fb89a-915f-41fd-b338-155af2d11a3a': function () {
            return {
                'id': '039fb89a-915f-41fd-b338-155af2d11a3a',
                'name': 'Touch Outro',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '039fb89a-915f-41fd-b338-155af2d11a3a',
                        'to': '3cae14dd-6776-47f6-bbb8-e45cc922daee',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/Tut_TouchOutro.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '7d74c59b-81d4-4d3e-957b-ab08a732983e': function () {
            return {
                'id': '7d74c59b-81d4-4d3e-957b-ab08a732983e',
                'name': 'Touch Pan Success',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '7d74c59b-81d4-4d3e-957b-ab08a732983e',
                        'to': 'e34b35f8-cd39-498d-9ac2-eac7b6067ab4',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/Tut_TouchPanSuccess.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '2596cce1-0eba-4d0f-9862-5faa2ded3383': function () {
            return {
                'id': '2596cce1-0eba-4d0f-9862-5faa2ded3383',
                'name': 'Touch Tap Proceed',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '2596cce1-0eba-4d0f-9862-5faa2ded3383',
                        'to': 'e7e29904-003d-4a4c-ad8a-7f73d2926b80',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/Tut_TouchTapProceed.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '690c9dea-b6bb-4acd-9aff-339564ef231d': function () {
            return {
                'id': '690c9dea-b6bb-4acd-9aff-339564ef231d',
                'name': 'Touch Pan Proceed',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '690c9dea-b6bb-4acd-9aff-339564ef231d',
                        'to': 'e34b35f8-cd39-498d-9ac2-eac7b6067ab4',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/Tut_TouchPanProceed.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        'cd31d742-b438-47b3-88a3-4bb6330d3bbe': function () {
            return {
                'id': 'cd31d742-b438-47b3-88a3-4bb6330d3bbe',
                'name': 'Touch Tap Success',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'cd31d742-b438-47b3-88a3-4bb6330d3bbe',
                        'to': 'df700a3f-c9a4-4fae-8002-3054df90de85',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/Tut_TouchTapSuccess.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '4f7e2c17-f8f5-41d3-9da3-c79307fb84a1': function () {
            return {
                'id': '4f7e2c17-f8f5-41d3-9da3-c79307fb84a1',
                'name': 'Touch Swipe Proceed',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '4f7e2c17-f8f5-41d3-9da3-c79307fb84a1',
                        'to': 'f5fc86fe-0873-4bad-8665-96cbd0a3a6aa',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/Tut_TouchSwipeProceed.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '921d52ad-6db4-4808-86c5-a6e17329134b': function () {
            return {
                'id': '921d52ad-6db4-4808-86c5-a6e17329134b',
                'name': '04A-tap',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '921d52ad-6db4-4808-86c5-a6e17329134b',
                        'to': '2596cce1-0eba-4d0f-9862-5faa2ded3383',
                        'value': 'false'
                    },
                    {
                        'frm': '921d52ad-6db4-4808-86c5-a6e17329134b',
                        'to': 'f5bbecfb-5932-4023-ab22-88ecc1fff875',
                        'value': ''
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Subflow',
                'options': {
                    'subflowId': () => {
                        return require('./04A-tap');
                    },
                    'inputParameters': () => {
                        return {};
                    },
                    'getTransition': subflow_result_object => {
                        blackboard.log.debug('Tap returning', subflow_result_object);
                        return subflow_result_object.madeGesture;
                    }
                }
            };
        },
        'df700a3f-c9a4-4fae-8002-3054df90de85': function () {
            return {
                'id': 'df700a3f-c9a4-4fae-8002-3054df90de85',
                'name': '04B-pan',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': 'df700a3f-c9a4-4fae-8002-3054df90de85',
                        'to': '690c9dea-b6bb-4acd-9aff-339564ef231d',
                        'value': 'false'
                    },
                    {
                        'frm': 'df700a3f-c9a4-4fae-8002-3054df90de85',
                        'to': '7d74c59b-81d4-4d3e-957b-ab08a732983e',
                        'value': ''
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Subflow',
                'options': {
                    'subflowId': () => {
                        return require('./04B-pan');
                    },
                    'inputParameters': () => {
                        return {};
                    },
                    'getTransition': subflow_result_object => {
                        blackboard.log.debug('Pan returning' + subflow_result_object.madeGesture);
                        return subflow_result_object.madeGesture;
                    }
                }
            };
        },
        'e34b35f8-cd39-498d-9ac2-eac7b6067ab4': function () {
            return {
                'id': 'e34b35f8-cd39-498d-9ac2-eac7b6067ab4',
                'name': '04C-swipe',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': 'e34b35f8-cd39-498d-9ac2-eac7b6067ab4',
                        'to': '4f7e2c17-f8f5-41d3-9da3-c79307fb84a1',
                        'value': 'false'
                    },
                    {
                        'frm': 'e34b35f8-cd39-498d-9ac2-eac7b6067ab4',
                        'to': '039fb89a-915f-41fd-b338-155af2d11a3a',
                        'value': ''
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Subflow',
                'options': {
                    'subflowId': () => {
                        return require('./04C-swipe');
                    },
                    'inputParameters': () => {
                        return {};
                    },
                    'getTransition': subflow_result_object => {
                        blackboard.log.debug('Swipe returning' + subflow_result_object.madeGesture);
                        return subflow_result_object.madeGesture;
                    }
                }
            };
        },
        'f5bbecfb-5932-4023-ab22-88ecc1fff875': function () {
            return {
                'id': 'f5bbecfb-5932-4023-ab22-88ecc1fff875',
                'name': 'Open Menu',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'f5bbecfb-5932-4023-ab22-88ecc1fff875',
                        'to': 'cd31d742-b438-47b3-88a3-4bb6330d3bbe',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        jibo.face.views.changeView({ addView: 'assets/views/main-menu.json' }, () => {
                            done();
                        }, view => {
                            blackboard.log.error('Error loading menu view');
                            done();
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        'e7e29904-003d-4a4c-ad8a-7f73d2926b80': function () {
            return {
                'id': 'e7e29904-003d-4a4c-ad8a-7f73d2926b80',
                'name': 'Open Menu',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'e7e29904-003d-4a4c-ad8a-7f73d2926b80',
                        'to': 'df700a3f-c9a4-4fae-8002-3054df90de85',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        jibo.face.views.changeView({ addView: 'assets/views/main-menu.json' }, () => {
                            done();
                        }, view => {
                            blackboard.log.error('Error loading menu view');
                            done();
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        'f5fc86fe-0873-4bad-8665-96cbd0a3a6aa': function () {
            return {
                'id': 'f5fc86fe-0873-4bad-8665-96cbd0a3a6aa',
                'name': 'Close Menu',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'f5fc86fe-0873-4bad-8665-96cbd0a3a6aa',
                        'to': '3cae14dd-6776-47f6-bbb8-e45cc922daee',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        jibo.face.views.changeView({ remove: true }, () => {
                            done();
                        }, view => {
                            blackboard.log.error('Error closing menu view');
                        });
                        done();
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '0fbab295-7570-4561-b10b-09eba9c72c12': function () {
            return {
                'id': '0fbab295-7570-4561-b10b-09eba9c72c12',
                'name': 'Menu Mode',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '0fbab295-7570-4561-b10b-09eba9c72c12',
                        'to': '921d52ad-6db4-4808-86c5-a6e17329134b',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        blackboard.skill.setMode(jibo.expression.AttentionMode.MENU);
                        return '';
                    }
                }
            };
        },
        '3cae14dd-6776-47f6-bbb8-e45cc922daee': function () {
            return {
                'id': '3cae14dd-6776-47f6-bbb8-e45cc922daee',
                'name': 'Release Mode',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '3cae14dd-6776-47f6-bbb8-e45cc922daee',
                        'to': 'af469b41-5636-490e-bec6-7e3b6f6ff2df',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        jibo.mim.shouldShowGUI = false;
                        blackboard.skill.releaseMode();
                        return '';
                    }
                }
            };
        }
    };
};
},{"./04A-tap":9,"./04B-pan":10,"./04C-swipe":11}],9:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        'meta': {
            'version': 1,
            'name': '04A-tap',
            'uri': '/Users/jon/Workspace/jibo/buildsdk/skills/tutorial/src/flows/sub-flows/04A-tap.flow'
        },
        'df805c8b-4f74-4e8d-bad9-c36e127eb9af': function () {
            return {
                'id': 'df805c8b-4f74-4e8d-bad9-c36e127eb9af',
                'name': 'Await Gesture',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'df805c8b-4f74-4e8d-bad9-c36e127eb9af',
                        'to': '89c08e34-b25d-44ef-95d0-52b2559067fc',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        blackboard.skill.waitForGesture(done, 'tap');
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        'e1076e09-d5a0-429f-96c5-accbb6012755': function () {
            return {
                'id': 'e1076e09-d5a0-429f-96c5-accbb6012755',
                'name': 'Wait a Bit',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'e1076e09-d5a0-429f-96c5-accbb6012755',
                        'to': 'c3dfdb6e-9c2c-4988-9cbd-b155a9380cd7',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'TimeoutJs',
                'options': {
                    'getTime': () => {
                        return blackboard.waitTime;
                    }
                }
            };
        },
        '8fb3c608-e832-4296-88e9-ad29f83eb7f6': function () {
            return {
                'id': '8fb3c608-e832-4296-88e9-ad29f83eb7f6',
                'name': 'Touch Intro Fail',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '8fb3c608-e832-4296-88e9-ad29f83eb7f6',
                        'to': 'e1076e09-d5a0-429f-96c5-accbb6012755',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/Tut_TouchIntroFail.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '4d8cae33-ce31-4ee8-8942-789390093b15': function () {
            return {
                'id': '4d8cae33-ce31-4ee8-8942-789390093b15',
                'name': '~gesture',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '4d8cae33-ce31-4ee8-8942-789390093b15',
                        'to': '5e4b6c1d-d22e-461a-965b-ebacf981f1ea',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Catch',
                'options': {
                    'getTransition': (exception, payload) => {
                        return payload.touched;
                    }
                }
            };
        },
        '7a03b6de-502b-4baa-8286-c432575ac94c': function () {
            return {
                'id': '7a03b6de-502b-4baa-8286-c432575ac94c',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '7a03b6de-502b-4baa-8286-c432575ac94c',
                        'to': '668c950d-8f82-415d-828c-c24fc0211d38',
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
        'bda3cd82-537c-443c-bd9a-47d8d51f2e02': {
            'id': 'bda3cd82-537c-443c-bd9a-47d8d51f2e02',
            'asset-pack': 'core',
            'transitions': [{
                    'frm': 'bda3cd82-537c-443c-bd9a-47d8d51f2e02',
                    'to': 'df805c8b-4f74-4e8d-bad9-c36e127eb9af',
                    'value': ''
                }],
            'exceptions': [],
            'class': 'Flow.Begin-Parallel',
            'options': {}
        },
        '89c08e34-b25d-44ef-95d0-52b2559067fc': function () {
            return {
                'id': '89c08e34-b25d-44ef-95d0-52b2559067fc',
                'name': '~gesture',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '89c08e34-b25d-44ef-95d0-52b2559067fc',
                        'to': 'e731f44a-8f4a-4acf-8f9a-6172374295ff',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Interrupt',
                'options': {
                    'getPayload': () => {
                        return { touched: 'true' };
                    }
                }
            };
        },
        'e731f44a-8f4a-4acf-8f9a-6172374295ff': function () {
            return {
                'id': 'e731f44a-8f4a-4acf-8f9a-6172374295ff',
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
        '19e8e55e-6b1a-4fd1-8615-63a8fd64fac7': function () {
            return {
                'id': '19e8e55e-6b1a-4fd1-8615-63a8fd64fac7',
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
        'c3dfdb6e-9c2c-4988-9cbd-b155a9380cd7': function () {
            return {
                'id': 'c3dfdb6e-9c2c-4988-9cbd-b155a9380cd7',
                'name': 'Gesture not Made',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'c3dfdb6e-9c2c-4988-9cbd-b155a9380cd7',
                        'to': '5e4b6c1d-d22e-461a-965b-ebacf981f1ea',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        return 'false';
                    }
                }
            };
        },
        '5e4b6c1d-d22e-461a-965b-ebacf981f1ea': function () {
            return {
                'id': '5e4b6c1d-d22e-461a-965b-ebacf981f1ea',
                'name': 'Clean Up',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '5e4b6c1d-d22e-461a-965b-ebacf981f1ea',
                        'to': '19e8e55e-6b1a-4fd1-8615-63a8fd64fac7',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        result.madeGesture = this.inTransition;
                        blackboard.tracker.stepComplete('Tap Step', result.madeGesture, notepad.failedFirst);
                        blackboard.skill.cleanUpGesture('tap');
                        blackboard.skill.stopClip('tap', done);
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        'f3969998-0293-4b65-a5f6-f31c63830b23': function () {
            return {
                'id': 'f3969998-0293-4b65-a5f6-f31c63830b23',
                'name': 'Play Clip',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'f3969998-0293-4b65-a5f6-f31c63830b23',
                        'to': '87ac1aaf-e523-4b37-87fe-2aeacdd467b9',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        blackboard.skill.playClip('tap');
                        done();
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '668c950d-8f82-415d-828c-c24fc0211d38': function () {
            return {
                'id': '668c950d-8f82-415d-828c-c24fc0211d38',
                'name': 'Touch Tap Now',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '668c950d-8f82-415d-828c-c24fc0211d38',
                        'to': 'f3969998-0293-4b65-a5f6-f31c63830b23',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/Tut_TouchTapNow.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '624e6b44-bca6-4db0-8886-e3ac6089caae': {
            'id': '624e6b44-bca6-4db0-8886-e3ac6089caae',
            'asset-pack': 'core',
            'transitions': [],
            'exceptions': [],
            'class': 'Flow.Comment',
            'options': {}
        },
        '87ac1aaf-e523-4b37-87fe-2aeacdd467b9': function () {
            return {
                'id': '87ac1aaf-e523-4b37-87fe-2aeacdd467b9',
                'name': 'Tracking Fail',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '87ac1aaf-e523-4b37-87fe-2aeacdd467b9',
                        'to': '8fb3c608-e832-4296-88e9-ad29f83eb7f6',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        notepad.failedFirst = true;
                    }
                }
            };
        }
    };
};
},{}],10:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        'meta': {
            'version': 1,
            'name': '04B-pan',
            'uri': '/Users/jon/Workspace/jibo/buildsdk/skills/tutorial/src/flows/sub-flows/04B-pan.flow'
        },
        'df805c8b-4f74-4e8d-bad9-c36e127eb9af': function () {
            return {
                'id': 'df805c8b-4f74-4e8d-bad9-c36e127eb9af',
                'name': 'Await Gesture',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'df805c8b-4f74-4e8d-bad9-c36e127eb9af',
                        'to': '89c08e34-b25d-44ef-95d0-52b2559067fc',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        blackboard.skill.waitForGesture(done, 'pan');
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        'e1076e09-d5a0-429f-96c5-accbb6012755': function () {
            return {
                'id': 'e1076e09-d5a0-429f-96c5-accbb6012755',
                'name': 'Wait a Bit',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'e1076e09-d5a0-429f-96c5-accbb6012755',
                        'to': 'c3dfdb6e-9c2c-4988-9cbd-b155a9380cd7',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'TimeoutJs',
                'options': {
                    'getTime': () => {
                        return blackboard.waitTime;
                    }
                }
            };
        },
        '4d8cae33-ce31-4ee8-8942-789390093b15': function () {
            return {
                'id': '4d8cae33-ce31-4ee8-8942-789390093b15',
                'name': '~gesture',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '4d8cae33-ce31-4ee8-8942-789390093b15',
                        'to': '5e4b6c1d-d22e-461a-965b-ebacf981f1ea',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Catch',
                'options': {
                    'getTransition': (exception, payload) => {
                        return payload.touched;
                    }
                }
            };
        },
        '7a03b6de-502b-4baa-8286-c432575ac94c': function () {
            return {
                'id': '7a03b6de-502b-4baa-8286-c432575ac94c',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '7a03b6de-502b-4baa-8286-c432575ac94c',
                        'to': 'c008cb78-00f3-4074-b049-a66dd03d3d29',
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
        'bda3cd82-537c-443c-bd9a-47d8d51f2e02': {
            'id': 'bda3cd82-537c-443c-bd9a-47d8d51f2e02',
            'asset-pack': 'core',
            'transitions': [{
                    'frm': 'bda3cd82-537c-443c-bd9a-47d8d51f2e02',
                    'to': 'df805c8b-4f74-4e8d-bad9-c36e127eb9af',
                    'value': ''
                }],
            'exceptions': [],
            'class': 'Flow.Begin-Parallel',
            'options': {}
        },
        '89c08e34-b25d-44ef-95d0-52b2559067fc': function () {
            return {
                'id': '89c08e34-b25d-44ef-95d0-52b2559067fc',
                'name': '~gesture',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '89c08e34-b25d-44ef-95d0-52b2559067fc',
                        'to': 'e731f44a-8f4a-4acf-8f9a-6172374295ff',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Interrupt',
                'options': {
                    'getPayload': () => {
                        return { touched: 'true' };
                    }
                }
            };
        },
        'e731f44a-8f4a-4acf-8f9a-6172374295ff': function () {
            return {
                'id': 'e731f44a-8f4a-4acf-8f9a-6172374295ff',
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
        '19e8e55e-6b1a-4fd1-8615-63a8fd64fac7': function () {
            return {
                'id': '19e8e55e-6b1a-4fd1-8615-63a8fd64fac7',
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
        'c3dfdb6e-9c2c-4988-9cbd-b155a9380cd7': function () {
            return {
                'id': 'c3dfdb6e-9c2c-4988-9cbd-b155a9380cd7',
                'name': 'Gesture not Made',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'c3dfdb6e-9c2c-4988-9cbd-b155a9380cd7',
                        'to': '5e4b6c1d-d22e-461a-965b-ebacf981f1ea',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        return 'false';
                    }
                }
            };
        },
        '5e4b6c1d-d22e-461a-965b-ebacf981f1ea': function () {
            return {
                'id': '5e4b6c1d-d22e-461a-965b-ebacf981f1ea',
                'name': 'Clean Up',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '5e4b6c1d-d22e-461a-965b-ebacf981f1ea',
                        'to': '19e8e55e-6b1a-4fd1-8615-63a8fd64fac7',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        result.madeGesture = this.inTransition;
                        blackboard.tracker.stepComplete('Left Right Nav Step', result.madeGesture, notepad.failedFirst);
                        blackboard.skill.cleanUpGesture('pan');
                        blackboard.skill.stopClip('pan', done);
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        'f3969998-0293-4b65-a5f6-f31c63830b23': function () {
            return {
                'id': 'f3969998-0293-4b65-a5f6-f31c63830b23',
                'name': 'Play Clip',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'f3969998-0293-4b65-a5f6-f31c63830b23',
                        'to': '87ac1aaf-e523-4b37-87fe-2aeacdd467b9',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        blackboard.skill.playClip('pan', done);
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        'c008cb78-00f3-4074-b049-a66dd03d3d29': function () {
            return {
                'id': 'c008cb78-00f3-4074-b049-a66dd03d3d29',
                'name': 'Touch Try Pan',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'c008cb78-00f3-4074-b049-a66dd03d3d29',
                        'to': 'f3969998-0293-4b65-a5f6-f31c63830b23',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/Tut_TouchTryPan.mim',
                    'getPromptData': () => {
                        return { version: blackboard.version };
                    }
                }
            };
        },
        '87ac1aaf-e523-4b37-87fe-2aeacdd467b9': function () {
            return {
                'id': '87ac1aaf-e523-4b37-87fe-2aeacdd467b9',
                'name': 'Tracking Fail',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '87ac1aaf-e523-4b37-87fe-2aeacdd467b9',
                        'to': 'e1076e09-d5a0-429f-96c5-accbb6012755',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        notepad.failedFirst = true;
                    }
                }
            };
        }
    };
};
},{}],11:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        'meta': {
            'version': 1,
            'name': '04C-swipe',
            'uri': '/Users/jon/Workspace/jibo/buildsdk/skills/tutorial/src/flows/sub-flows/04C-swipe.flow'
        },
        'df805c8b-4f74-4e8d-bad9-c36e127eb9af': function () {
            return {
                'id': 'df805c8b-4f74-4e8d-bad9-c36e127eb9af',
                'name': 'Await Gesture',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'df805c8b-4f74-4e8d-bad9-c36e127eb9af',
                        'to': '89c08e34-b25d-44ef-95d0-52b2559067fc',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        blackboard.skill.waitForGesture(done, 'swipe');
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        'e1076e09-d5a0-429f-96c5-accbb6012755': function () {
            return {
                'id': 'e1076e09-d5a0-429f-96c5-accbb6012755',
                'name': 'Wait a Bit',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'e1076e09-d5a0-429f-96c5-accbb6012755',
                        'to': 'c3dfdb6e-9c2c-4988-9cbd-b155a9380cd7',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'TimeoutJs',
                'options': {
                    'getTime': () => {
                        return blackboard.waitTime;
                    }
                }
            };
        },
        '4d8cae33-ce31-4ee8-8942-789390093b15': function () {
            return {
                'id': '4d8cae33-ce31-4ee8-8942-789390093b15',
                'name': '~gesture',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '4d8cae33-ce31-4ee8-8942-789390093b15',
                        'to': '5e4b6c1d-d22e-461a-965b-ebacf981f1ea',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Catch',
                'options': {
                    'getTransition': (exception, payload) => {
                        return payload.touched;
                    }
                }
            };
        },
        '7a03b6de-502b-4baa-8286-c432575ac94c': function () {
            return {
                'id': '7a03b6de-502b-4baa-8286-c432575ac94c',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '7a03b6de-502b-4baa-8286-c432575ac94c',
                        'to': '7fed3de9-7113-444b-9bd8-a2a05eca1387',
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
        'bda3cd82-537c-443c-bd9a-47d8d51f2e02': {
            'id': 'bda3cd82-537c-443c-bd9a-47d8d51f2e02',
            'asset-pack': 'core',
            'transitions': [{
                    'frm': 'bda3cd82-537c-443c-bd9a-47d8d51f2e02',
                    'to': 'df805c8b-4f74-4e8d-bad9-c36e127eb9af',
                    'value': ''
                }],
            'exceptions': [],
            'class': 'Flow.Begin-Parallel',
            'options': {}
        },
        '89c08e34-b25d-44ef-95d0-52b2559067fc': function () {
            return {
                'id': '89c08e34-b25d-44ef-95d0-52b2559067fc',
                'name': '~gesture',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '89c08e34-b25d-44ef-95d0-52b2559067fc',
                        'to': 'e731f44a-8f4a-4acf-8f9a-6172374295ff',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Interrupt',
                'options': {
                    'getPayload': () => {
                        return { touched: 'true' };
                    }
                }
            };
        },
        'e731f44a-8f4a-4acf-8f9a-6172374295ff': function () {
            return {
                'id': 'e731f44a-8f4a-4acf-8f9a-6172374295ff',
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
        '19e8e55e-6b1a-4fd1-8615-63a8fd64fac7': function () {
            return {
                'id': '19e8e55e-6b1a-4fd1-8615-63a8fd64fac7',
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
        'c3dfdb6e-9c2c-4988-9cbd-b155a9380cd7': function () {
            return {
                'id': 'c3dfdb6e-9c2c-4988-9cbd-b155a9380cd7',
                'name': 'Gesture not Made',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'c3dfdb6e-9c2c-4988-9cbd-b155a9380cd7',
                        'to': '5e4b6c1d-d22e-461a-965b-ebacf981f1ea',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        return 'false';
                    }
                }
            };
        },
        '5e4b6c1d-d22e-461a-965b-ebacf981f1ea': function () {
            return {
                'id': '5e4b6c1d-d22e-461a-965b-ebacf981f1ea',
                'name': 'Clean Up',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '5e4b6c1d-d22e-461a-965b-ebacf981f1ea',
                        'to': '19e8e55e-6b1a-4fd1-8615-63a8fd64fac7',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        result.madeGesture = this.inTransition;
                        blackboard.tracker.stepComplete('Swipe Down Step', result.madeGesture, notepad.failedFirst);
                        blackboard.skill.cleanUpGesture('swipe');
                        blackboard.skill.stopClip('swipe', done);
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        'f3969998-0293-4b65-a5f6-f31c63830b23': function () {
            return {
                'id': 'f3969998-0293-4b65-a5f6-f31c63830b23',
                'name': 'Play Clip',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'f3969998-0293-4b65-a5f6-f31c63830b23',
                        'to': '87ac1aaf-e523-4b37-87fe-2aeacdd467b9',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        blackboard.skill.stopClip('pan', () => {
                            blackboard.skill.playClip('swipe', done, 'main-menu');
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '7fed3de9-7113-444b-9bd8-a2a05eca1387': function () {
            return {
                'id': '7fed3de9-7113-444b-9bd8-a2a05eca1387',
                'name': 'Touch Swipe Down',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '7fed3de9-7113-444b-9bd8-a2a05eca1387',
                        'to': 'f3969998-0293-4b65-a5f6-f31c63830b23',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/Tut_TouchSwipeDown.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '87ac1aaf-e523-4b37-87fe-2aeacdd467b9': function () {
            return {
                'id': '87ac1aaf-e523-4b37-87fe-2aeacdd467b9',
                'name': 'Tracking Fail',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '87ac1aaf-e523-4b37-87fe-2aeacdd467b9',
                        'to': 'e1076e09-d5a0-429f-96c5-accbb6012755',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        notepad.failedFirst = true;
                    }
                }
            };
        }
    };
};
},{}],12:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        'meta': {
            'version': 1,
            'name': '05-stop',
            'uri': '/Users/jon/Workspace/jibo/buildsdk/skills/tutorial/src/flows/sub-flows/05-stop.flow'
        },
        '882a802f-3e67-49d6-92d4-215d370ad2ce': function () {
            return {
                'id': '882a802f-3e67-49d6-92d4-215d370ad2ce',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '882a802f-3e67-49d6-92d4-215d370ad2ce',
                        'to': 'a7fe3cb3-e9c8-4147-8e6a-723d46dc78b4',
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
        'af469b41-5636-490e-bec6-7e3b6f6ff2df': function () {
            return {
                'id': 'af469b41-5636-490e-bec6-7e3b6f6ff2df',
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
        '478a1322-d7f4-43a0-88f4-edf3df1702fa': function () {
            return {
                'id': '478a1322-d7f4-43a0-88f4-edf3df1702fa',
                'name': 'Head Silence',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '478a1322-d7f4-43a0-88f4-edf3df1702fa',
                        'to': 'af469b41-5636-490e-bec6-7e3b6f6ff2df',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/Tut_HeadSilence.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '30ac5bd1-45e9-4393-9109-0241a4eee018': {
            'id': '30ac5bd1-45e9-4393-9109-0241a4eee018',
            'asset-pack': 'core',
            'transitions': [],
            'exceptions': [],
            'class': 'Flow.Comment',
            'options': {}
        },
        'a7fe3cb3-e9c8-4147-8e6a-723d46dc78b4': function () {
            return {
                'id': 'a7fe3cb3-e9c8-4147-8e6a-723d46dc78b4',
                'name': '05A-head-touch',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': 'a7fe3cb3-e9c8-4147-8e6a-723d46dc78b4',
                        'to': '8fb3c608-e832-4296-88e9-ad29f83eb7f6',
                        'value': ''
                    },
                    {
                        'frm': 'a7fe3cb3-e9c8-4147-8e6a-723d46dc78b4',
                        'to': '478a1322-d7f4-43a0-88f4-edf3df1702fa',
                        'value': 'true'
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Subflow',
                'options': {
                    'subflowId': () => {
                        return require('./05A-head-touch');
                    },
                    'inputParameters': () => {
                        return {};
                    },
                    'getTransition': subflow_result_object => {
                        blackboard.log.debug('Head Touch returning', subflow_result_object);
                        return subflow_result_object.touched;
                    }
                }
            };
        },
        '8fb3c608-e832-4296-88e9-ad29f83eb7f6': function () {
            return {
                'id': '8fb3c608-e832-4296-88e9-ad29f83eb7f6',
                'name': 'Head Talk Forever',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '8fb3c608-e832-4296-88e9-ad29f83eb7f6',
                        'to': 'af469b41-5636-490e-bec6-7e3b6f6ff2df',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/Tut_HeadTalkForever.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        }
    };
};
},{"./05A-head-touch":13}],13:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        'meta': {
            'version': 1,
            'name': '05A-head-touch',
            'uri': '/Users/jon/Workspace/jibo/buildsdk/skills/tutorial/src/flows/sub-flows/05A-head-touch.flow'
        },
        '7a03b6de-502b-4baa-8286-c432575ac94c': function () {
            return {
                'id': '7a03b6de-502b-4baa-8286-c432575ac94c',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '7a03b6de-502b-4baa-8286-c432575ac94c',
                        'to': '86b412e6-d571-4f20-98a6-994666597a78',
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
        '668c950d-8f82-415d-828c-c24fc0211d38': function () {
            return {
                'id': '668c950d-8f82-415d-828c-c24fc0211d38',
                'name': 'Head Talk 2',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '668c950d-8f82-415d-828c-c24fc0211d38',
                        'to': 'c3dfdb6e-9c2c-4988-9cbd-b155a9380cd7',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/Tut_HeadTalk2.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        'c3dfdb6e-9c2c-4988-9cbd-b155a9380cd7': function () {
            return {
                'id': 'c3dfdb6e-9c2c-4988-9cbd-b155a9380cd7',
                'name': 'Head Touch not Made',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'c3dfdb6e-9c2c-4988-9cbd-b155a9380cd7',
                        'to': '5e4b6c1d-d22e-461a-965b-ebacf981f1ea',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        return 'false';
                    }
                }
            };
        },
        '5e4b6c1d-d22e-461a-965b-ebacf981f1ea': function () {
            return {
                'id': '5e4b6c1d-d22e-461a-965b-ebacf981f1ea',
                'name': 'Clean Up',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '5e4b6c1d-d22e-461a-965b-ebacf981f1ea',
                        'to': '19e8e55e-6b1a-4fd1-8615-63a8fd64fac7',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        result.touched = this.inTransition;
                        blackboard.tracker.stepComplete('Head Barge In Step', result.touched, notepad.failedFirst);
                        blackboard.skill.cleanUpHeadTouch();
                        blackboard.skill.interruptHeadTouch(false);
                        done();
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '19e8e55e-6b1a-4fd1-8615-63a8fd64fac7': function () {
            return {
                'id': '19e8e55e-6b1a-4fd1-8615-63a8fd64fac7',
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
        '4d8cae33-ce31-4ee8-8942-789390093b15': function () {
            return {
                'id': '4d8cae33-ce31-4ee8-8942-789390093b15',
                'name': '~touch',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '4d8cae33-ce31-4ee8-8942-789390093b15',
                        'to': '5e4b6c1d-d22e-461a-965b-ebacf981f1ea',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Catch',
                'options': {
                    'getTransition': (exception, payload) => {
                        return payload.touched;
                    }
                }
            };
        },
        'e731f44a-8f4a-4acf-8f9a-6172374295ff': function () {
            return {
                'id': 'e731f44a-8f4a-4acf-8f9a-6172374295ff',
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
        '89c08e34-b25d-44ef-95d0-52b2559067fc': function () {
            return {
                'id': '89c08e34-b25d-44ef-95d0-52b2559067fc',
                'name': '~touch',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '89c08e34-b25d-44ef-95d0-52b2559067fc',
                        'to': 'e731f44a-8f4a-4acf-8f9a-6172374295ff',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Interrupt',
                'options': {
                    'getPayload': () => {
                        return { touched: 'true' };
                    }
                }
            };
        },
        'df805c8b-4f74-4e8d-bad9-c36e127eb9af': function () {
            return {
                'id': 'df805c8b-4f74-4e8d-bad9-c36e127eb9af',
                'name': 'Await Head Touch',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'df805c8b-4f74-4e8d-bad9-c36e127eb9af',
                        'to': '89c08e34-b25d-44ef-95d0-52b2559067fc',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        blackboard.skill.waitForHeadTouch(() => {
                            blackboard.skill.cleanUpHeadTouch();
                            done();
                        });
                    },
                    'onStop': () => {
                        blackboard.skill.cleanUpHeadTouch();
                    }
                }
            };
        },
        'bda3cd82-537c-443c-bd9a-47d8d51f2e02': {
            'id': 'bda3cd82-537c-443c-bd9a-47d8d51f2e02',
            'asset-pack': 'core',
            'transitions': [{
                    'frm': 'bda3cd82-537c-443c-bd9a-47d8d51f2e02',
                    'to': 'df805c8b-4f74-4e8d-bad9-c36e127eb9af',
                    'value': ''
                }],
            'exceptions': [],
            'class': 'Flow.Begin-Parallel',
            'options': {}
        },
        '86b412e6-d571-4f20-98a6-994666597a78': function () {
            return {
                'id': '86b412e6-d571-4f20-98a6-994666597a78',
                'name': 'Head Talk',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '86b412e6-d571-4f20-98a6-994666597a78',
                        'to': '87ac1aaf-e523-4b37-87fe-2aeacdd467b9',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/Tut_HeadTalk.mim',
                    'getPromptData': () => {
                        return { oobe: blackboard.oobe };
                    }
                }
            };
        },
        '87ac1aaf-e523-4b37-87fe-2aeacdd467b9': function () {
            return {
                'id': '87ac1aaf-e523-4b37-87fe-2aeacdd467b9',
                'name': 'Tracking Fail',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '87ac1aaf-e523-4b37-87fe-2aeacdd467b9',
                        'to': '668c950d-8f82-415d-828c-c24fc0211d38',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        notepad.failedFirst = true;
                    }
                }
            };
        }
    };
};
},{}],14:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        'meta': {
            'version': 1,
            'name': '06-photo',
            'uri': '/Users/jon/Workspace/jibo/buildsdk/skills/tutorial/src/flows/sub-flows/06-photo.flow'
        },
        '136507d0-9e93-49b7-a1db-8d5f8a5a91f7': function () {
            return {
                'id': '136507d0-9e93-49b7-a1db-8d5f8a5a91f7',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '136507d0-9e93-49b7-a1db-8d5f8a5a91f7',
                        'to': '935d2466-9877-4a7c-af41-16b4b9961811',
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
        'c3731c6d-0a43-4d95-a80d-b2537ba73c9f': function () {
            return {
                'id': 'c3731c6d-0a43-4d95-a80d-b2537ba73c9f',
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
        'f94e39fc-4cf9-4ae1-9edd-e7122097fcbd': function () {
            return {
                'id': 'f94e39fc-4cf9-4ae1-9edd-e7122097fcbd',
                'name': '06B-take-photo',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'f94e39fc-4cf9-4ae1-9edd-e7122097fcbd',
                        'to': '5ad100e2-0c37-4287-897b-d5c2f08c3c23',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Subflow',
                'options': {
                    'subflowId': () => {
                        return require('./06B-take-photo');
                    },
                    'inputParameters': () => {
                        return {};
                    },
                    'getTransition': subflow_result_object => {
                        return subflow_result_object.transition;
                    }
                }
            };
        },
        '935d2466-9877-4a7c-af41-16b4b9961811': function () {
            return {
                'id': '935d2466-9877-4a7c-af41-16b4b9961811',
                'name': 'All Intro',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '935d2466-9877-4a7c-af41-16b4b9961811',
                        'to': 'f8956c9b-7d74-47e0-af0d-dd51ab032f18',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/Tut_AllIntro.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '490761f7-03d6-4232-b4a0-869956c5792a': function () {
            return {
                'id': '490761f7-03d6-4232-b4a0-869956c5792a',
                'name': 'All Cmd Success',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '490761f7-03d6-4232-b4a0-869956c5792a',
                        'to': '92dde353-b81b-48e7-a282-f45c2e22f1d2',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/Tut_AllCmdSuccess.mim',
                    'getPromptData': () => {
                        return { oobe: blackboard.oobe };
                    }
                }
            };
        },
        '5ad100e2-0c37-4287-897b-d5c2f08c3c23': function () {
            return {
                'id': '5ad100e2-0c37-4287-897b-d5c2f08c3c23',
                'name': '06C-save-photo',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '5ad100e2-0c37-4287-897b-d5c2f08c3c23',
                        'to': 'c3731c6d-0a43-4d95-a80d-b2537ba73c9f',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Subflow',
                'options': {
                    'subflowId': () => {
                        return require('./06C-save-photo');
                    },
                    'inputParameters': () => {
                        return {};
                    },
                    'getTransition': subflow_result_object => {
                        return subflow_result_object.transition;
                    }
                }
            };
        },
        '92dde353-b81b-48e7-a282-f45c2e22f1d2': function () {
            return {
                'id': '92dde353-b81b-48e7-a282-f45c2e22f1d2',
                'name': 'Photo Head1',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '92dde353-b81b-48e7-a282-f45c2e22f1d2',
                        'to': 'f94e39fc-4cf9-4ae1-9edd-e7122097fcbd',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/Tut_PhotoHead1.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        'f8956c9b-7d74-47e0-af0d-dd51ab032f18': function () {
            return {
                'id': 'f8956c9b-7d74-47e0-af0d-dd51ab032f18',
                'name': '06A-command',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': 'f8956c9b-7d74-47e0-af0d-dd51ab032f18',
                        'to': '490761f7-03d6-4232-b4a0-869956c5792a',
                        'value': 'true'
                    },
                    {
                        'frm': 'f8956c9b-7d74-47e0-af0d-dd51ab032f18',
                        'to': '9a919c4d-bc2a-414a-aeaa-c9e6be05772c',
                        'value': ''
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Subflow',
                'options': {
                    'subflowId': () => {
                        return require('./06A-command');
                    },
                    'inputParameters': () => {
                        return {};
                    },
                    'getTransition': subflow_result_object => {
                        return subflow_result_object.heard;
                    }
                }
            };
        },
        '318f0278-982b-4d3e-928f-2551e5cc8ff3': function () {
            return {
                'id': '318f0278-982b-4d3e-928f-2551e5cc8ff3',
                'name': '~photoError',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '318f0278-982b-4d3e-928f-2551e5cc8ff3',
                        'to': 'b034436d-94ca-45df-af6b-d965c8ac8cd6',
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
        'b034436d-94ca-45df-af6b-d965c8ac8cd6': function () {
            return {
                'id': 'b034436d-94ca-45df-af6b-d965c8ac8cd6',
                'name': 'where da photos?',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'b034436d-94ca-45df-af6b-d965c8ac8cd6',
                        'to': 'c3731c6d-0a43-4d95-a80d-b2537ba73c9f',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'TextToSpeech',
                'options': {
                    'words': 'Oops, something went wrong.',
                    'onWord': word => {
                    }
                }
            };
        },
        '9a919c4d-bc2a-414a-aeaa-c9e6be05772c': function () {
            return {
                'id': '9a919c4d-bc2a-414a-aeaa-c9e6be05772c',
                'name': 'All Cmd Fail_2',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '9a919c4d-bc2a-414a-aeaa-c9e6be05772c',
                        'to': 'a2576f04-8faa-4cd8-9a6d-c234bab00ec7',
                        'value': 'yes'
                    },
                    {
                        'frm': '9a919c4d-bc2a-414a-aeaa-c9e6be05772c',
                        'to': '2830a7ed-5e75-43cb-84fe-23b72af28f49',
                        'value': ''
                    }
                ],
                'exceptions': [{
                        'frm': '9a919c4d-bc2a-414a-aeaa-c9e6be05772c',
                        'to': '2830a7ed-5e75-43cb-84fe-23b72af28f49',
                        'value': '~'
                    }],
                'class': 'Mim.Question',
                'options': {
                    'mimPath': 'mims/en-us/Tut_AllCmdFail_2.mim',
                    'getPromptData': () => {
                        return {};
                    },
                    'onStatus': status => {
                        let mimState = status.state;
                        let asrResults = status.asrResults;
                    },
                    'onSuccess': results => {
                        let mimState = results.state;
                        let asrResults = results.asrResults;
                        let transition = results.firstGrammarTag;
                        return transition;
                    },
                    'onFailure': results => {
                        let mimState = results.state;
                        let asrResults = results.asrResults;
                        let exception = results.exception;
                        return exception;
                    }
                }
            };
        },
        '2830a7ed-5e75-43cb-84fe-23b72af28f49': function () {
            return {
                'id': '2830a7ed-5e75-43cb-84fe-23b72af28f49',
                'name': 'All Cmd Decline',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '2830a7ed-5e75-43cb-84fe-23b72af28f49',
                        'to': 'c3731c6d-0a43-4d95-a80d-b2537ba73c9f',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/Tut_AllCmdDecline.mim',
                    'getPromptData': () => {
                        return { oobe: blackboard.oobe };
                    }
                }
            };
        },
        'a2576f04-8faa-4cd8-9a6d-c234bab00ec7': function () {
            return {
                'id': 'a2576f04-8faa-4cd8-9a6d-c234bab00ec7',
                'name': 'All Cmd Yes',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'a2576f04-8faa-4cd8-9a6d-c234bab00ec7',
                        'to': '92dde353-b81b-48e7-a282-f45c2e22f1d2',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/Tut_AllCmdYes.mim',
                    'getPromptData': () => {
                        return { oobe: blackboard.oobe };
                    }
                }
            };
        }
    };
};
},{"./06A-command":15,"./06B-take-photo":16,"./06C-save-photo":19}],15:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        'meta': {
            'version': 1,
            'name': '06A-command',
            'uri': '/Users/jon/Workspace/jibo/buildsdk/skills/tutorial/src/flows/sub-flows/06A-command.flow'
        },
        'cfb5149c-f802-4986-8c8b-e1876c211e55': function () {
            return {
                'id': 'cfb5149c-f802-4986-8c8b-e1876c211e55',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'cfb5149c-f802-4986-8c8b-e1876c211e55',
                        'to': 'ad96dd03-3d44-4554-8bf7-8aea5163efe4',
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
        '7b332dfc-0438-441e-a40c-c01643dacef9': {
            'id': '7b332dfc-0438-441e-a40c-c01643dacef9',
            'asset-pack': 'core',
            'transitions': [{
                    'frm': '7b332dfc-0438-441e-a40c-c01643dacef9',
                    'to': '83aa7464-f5e3-43cf-b4d4-df5f95ae5cd7',
                    'value': ''
                }],
            'exceptions': [],
            'class': 'Flow.Begin-Parallel',
            'options': {}
        },
        '83aa7464-f5e3-43cf-b4d4-df5f95ae5cd7': function () {
            return {
                'id': '83aa7464-f5e3-43cf-b4d4-df5f95ae5cd7',
                'name': 'Wait for HJ Command',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '83aa7464-f5e3-43cf-b4d4-df5f95ae5cd7',
                        'to': '0acd30a6-7fe5-441c-811c-10e82af84325',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        blackboard.skill.waitForHJCommand('photo', () => {
                            done();
                        });
                    },
                    'onStop': () => {
                        blackboard.skill.cleanUpHJCommand();
                    }
                }
            };
        },
        '0acd30a6-7fe5-441c-811c-10e82af84325': function () {
            return {
                'id': '0acd30a6-7fe5-441c-811c-10e82af84325',
                'name': '~skillRelaunch',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '0acd30a6-7fe5-441c-811c-10e82af84325',
                        'to': '32a6c3db-4465-48d7-99a8-c4b22b73099b',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Interrupt',
                'options': {
                    'getPayload': () => {
                        return { heard: 'true' };
                    }
                }
            };
        },
        '32a6c3db-4465-48d7-99a8-c4b22b73099b': function () {
            return {
                'id': '32a6c3db-4465-48d7-99a8-c4b22b73099b',
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
        '756d948d-f28f-4d68-a015-ed2fa67315cf': function () {
            return {
                'id': '756d948d-f28f-4d68-a015-ed2fa67315cf',
                'name': 'Show \'Hey Jibo Photo\'',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '756d948d-f28f-4d68-a015-ed2fa67315cf',
                        'to': '23a80a8f-76aa-4a6e-ab18-f06c2ad7311d',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        blackboard.skill.showCommandView('photo', done);
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        'efcab9c1-4174-4bb5-ac94-381f4538ab72': function () {
            return {
                'id': 'efcab9c1-4174-4bb5-ac94-381f4538ab72',
                'name': 'No Skill Relaunch',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'efcab9c1-4174-4bb5-ac94-381f4538ab72',
                        'to': 'e2514e0e-9c0a-4dea-a3d8-c3d51330d0e7',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        return 'false';
                    }
                }
            };
        },
        '42d055f0-c24d-4127-a315-ff784b3fe16d': function () {
            return {
                'id': '42d055f0-c24d-4127-a315-ff784b3fe16d',
                'name': '~skillRelaunch',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '42d055f0-c24d-4127-a315-ff784b3fe16d',
                        'to': 'e2514e0e-9c0a-4dea-a3d8-c3d51330d0e7',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Catch',
                'options': {
                    'getTransition': (exception, payload) => {
                        return payload.heard;
                    }
                }
            };
        },
        '71aded23-5d8b-4eba-880d-a052b58b1117': function () {
            return {
                'id': '71aded23-5d8b-4eba-880d-a052b58b1117',
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
        'ad96dd03-3d44-4554-8bf7-8aea5163efe4': function () {
            return {
                'id': 'ad96dd03-3d44-4554-8bf7-8aea5163efe4',
                'name': 'All Cmd Intro',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'ad96dd03-3d44-4554-8bf7-8aea5163efe4',
                        'to': '37d24c17-dc85-4af1-9b09-f9f22cdaafc9',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/Tut_AllCmdIntro.mim',
                    'getPromptData': () => {
                        return { oobe: blackboard.oobe };
                    }
                }
            };
        },
        '8ab592c6-8d2e-46ee-8ae9-2b85428c8eeb': function () {
            return {
                'id': '8ab592c6-8d2e-46ee-8ae9-2b85428c8eeb',
                'name': 'All Cmd Fail Nothing',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '8ab592c6-8d2e-46ee-8ae9-2b85428c8eeb',
                        'to': '756d948d-f28f-4d68-a015-ed2fa67315cf',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/Tut_AllCmdFail_Nothing.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        'e2514e0e-9c0a-4dea-a3d8-c3d51330d0e7': function () {
            return {
                'id': 'e2514e0e-9c0a-4dea-a3d8-c3d51330d0e7',
                'name': 'Uninterrupt HJ Command',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'e2514e0e-9c0a-4dea-a3d8-c3d51330d0e7',
                        'to': '71aded23-5d8b-4eba-880d-a052b58b1117',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        result.heard = this.inTransition;
                        blackboard.tracker.stepComplete('Photo Command Step', result.heard, notepad.failedFirst);
                        blackboard.skill.cleanUpHJCommand().then(() => {
                            jibo.globalEvents.shared.nonInterruptingGlobal.emit();
                            jibo.face.views.forceEyeView(() => {
                                done();
                            });
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '37d24c17-dc85-4af1-9b09-f9f22cdaafc9': function () {
            return {
                'id': '37d24c17-dc85-4af1-9b09-f9f22cdaafc9',
                'name': 'handleHJ',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '37d24c17-dc85-4af1-9b09-f9f22cdaafc9',
                        'to': '8ab592c6-8d2e-46ee-8ae9-2b85428c8eeb',
                        'value': 'wait'
                    },
                    {
                        'frm': '37d24c17-dc85-4af1-9b09-f9f22cdaafc9',
                        'to': '1927e912-189f-4b8d-a6d7-384e7b64257e',
                        'value': 'hjOnly'
                    },
                    {
                        'frm': '37d24c17-dc85-4af1-9b09-f9f22cdaafc9',
                        'to': '7cba2ac8-b056-4906-bb65-30a528d2e0f0',
                        'value': 'noMatch'
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        blackboard.skill.handleHJ(done);
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '1927e912-189f-4b8d-a6d7-384e7b64257e': function () {
            return {
                'id': '1927e912-189f-4b8d-a6d7-384e7b64257e',
                'name': 'All Cmd Fail HJOnly',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '1927e912-189f-4b8d-a6d7-384e7b64257e',
                        'to': '756d948d-f28f-4d68-a015-ed2fa67315cf',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/Tut_AllCmdFail_HJOnly.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '7cba2ac8-b056-4906-bb65-30a528d2e0f0': function () {
            return {
                'id': '7cba2ac8-b056-4906-bb65-30a528d2e0f0',
                'name': 'All Cmd Fail NoMatch',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '7cba2ac8-b056-4906-bb65-30a528d2e0f0',
                        'to': '756d948d-f28f-4d68-a015-ed2fa67315cf',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/Tut_AllCmdFail_HJNoMatch.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '23a80a8f-76aa-4a6e-ab18-f06c2ad7311d': function () {
            return {
                'id': '23a80a8f-76aa-4a6e-ab18-f06c2ad7311d',
                'name': 'handleHJ',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '23a80a8f-76aa-4a6e-ab18-f06c2ad7311d',
                        'to': 'efcab9c1-4174-4bb5-ac94-381f4538ab72',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        blackboard.skill.handleHJ(done);
                    },
                    'onStop': () => {
                    }
                }
            };
        }
    };
};
},{}],16:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        'meta': {
            'version': 1,
            'name': '06B-take-photo',
            'uri': '/Users/jon/Workspace/jibo/buildsdk/skills/tutorial/src/flows/sub-flows/06B-take-photo.flow'
        },
        'b3b57232-af1a-4edf-82c8-64238ad7ef0c': function () {
            return {
                'id': 'b3b57232-af1a-4edf-82c8-64238ad7ef0c',
                'name': 'Show Camera',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'b3b57232-af1a-4edf-82c8-64238ad7ef0c',
                        'to': '8c453647-8205-44c6-b5ac-5e1d29b9f79f',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        notepad.view = jibo.face.views.createView('CameraView');
                        jibo.face.views.changeView({ addView: notepad.view }, null, view => {
                            blackboard.log.error('Error loading camera view');
                        });
                    }
                }
            };
        },
        '1800951a-c420-4761-9e31-70daf92a2572': function () {
            return {
                'id': '1800951a-c420-4761-9e31-70daf92a2572',
                'name': 'Camera View Opened',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '1800951a-c420-4761-9e31-70daf92a2572',
                        'to': 'cd81f213-91bb-4b2d-8842-b4c193902883',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        if (notepad.view.state === jibo.face.views.STATE.OPENED) {
                            notepad.view.storeDefaultValues();
                            done();
                        } else {
                            notepad.view.on(jibo.face.views.STATE.OPENED, () => {
                                notepad.view.storeDefaultValues();
                                done();
                            });
                        }
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        'ccb8a0f6-c517-4728-88c6-ef7ffc71526f': function () {
            return {
                'id': 'ccb8a0f6-c517-4728-88c6-ef7ffc71526f',
                'name': 'Begin',
                'transitions': [{
                        'frm': 'ccb8a0f6-c517-4728-88c6-ef7ffc71526f',
                        'to': 'b3b57232-af1a-4edf-82c8-64238ad7ef0c',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Begin',
                'options': {
                    'inputParameters': () => {
                        return { numPhotos: 1 };
                    }
                }
            };
        },
        '0c351594-f4b1-46a0-9f91-3b43a033ce4e': function () {
            return {
                'id': '0c351594-f4b1-46a0-9f91-3b43a033ce4e',
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
        '0a55d57a-a229-428b-8132-8ab548d36359': function () {
            return {
                'id': '0a55d57a-a229-428b-8132-8ab548d36359',
                'name': 'Photo Get Ready',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '0a55d57a-a229-428b-8132-8ab548d36359',
                        'to': '922509aa-792e-43df-b2cd-1e14ae4131b0',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/Tut_PhotoGetReady.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        'cd4c8f1f-e2b7-4af5-bf30-90858b305a9f': function () {
            return {
                'id': 'cd4c8f1f-e2b7-4af5-bf30-90858b305a9f',
                'name': 'Hide Viewfinder',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'cd4c8f1f-e2b7-4af5-bf30-90858b305a9f',
                        'to': '1e976be5-6820-42a2-8b98-29bae156b840',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        jibo.media.setViewfinder(false, {}, error => {
                            if (error) {
                                blackboard.log.error('viewfinder disable error: ', error);
                                if (jibo.runMode === jibo.RunMode.ON_ROBOT) {
                                    done('~photoError');
                                } else {
                                    done();
                                }
                            } else {
                                blackboard.log.info('viewfinder disabled');
                                done();
                            }
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '922509aa-792e-43df-b2cd-1e14ae4131b0': function () {
            return {
                'id': '922509aa-792e-43df-b2cd-1e14ae4131b0',
                'name': 'takePhoto',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '922509aa-792e-43df-b2cd-1e14ae4131b0',
                        'to': 'cd4c8f1f-e2b7-4af5-bf30-90858b305a9f',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        jibo.sound.play('camera-shutter');
                        jibo.media.takePhoto((err, data) => {
                            if (!err && data) {
                                blackboard.skill.storePhoto(data);
                                done();
                            } else {
                                blackboard.log.error('photo taking error:', err);
                                done('~photoError');
                            }
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        'a6aec869-07b0-4e62-babe-1d99e3c62c0f': function () {
            return {
                'id': 'a6aec869-07b0-4e62-babe-1d99e3c62c0f',
                'name': 'Photo No Find',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'a6aec869-07b0-4e62-babe-1d99e3c62c0f',
                        'to': '9386f327-17a3-4ed1-8917-167a31f475a7',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/Tut_PhotoNoFind.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '9386f327-17a3-4ed1-8917-167a31f475a7': function () {
            return {
                'id': '9386f327-17a3-4ed1-8917-167a31f475a7',
                'name': 'Create Flash View',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '9386f327-17a3-4ed1-8917-167a31f475a7',
                        'to': '0a55d57a-a229-428b-8132-8ab548d36359',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        notepad.view = jibo.face.views.createView('FlashView');
                        notepad.view.transitionStageOnly = true;
                        jibo.face.views.changeView({
                            remove: true,
                            addView: notepad.view,
                            transitionOpen: jibo.face.views.TRANSITION.NONE,
                            transitionClose: jibo.face.views.TRANSITION.NONE
                        }, null, () => {
                            blackboard.log.error('Error loading white');
                        });
                    }
                }
            };
        },
        'e2c07171-4521-413e-aa34-190347201e49': function () {
            return {
                'id': 'e2c07171-4521-413e-aa34-190347201e49',
                'name': 'Attention OFF',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'e2c07171-4521-413e-aa34-190347201e49',
                        'to': '9386f327-17a3-4ed1-8917-167a31f475a7',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        jibo.expression.setAttentionMode('OFF').then(() => {
                            done();
                        }).catch(err => {
                            blackboard.log.error('Error setting attention mode to OFF', err);
                            done();
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '5b9d18f5-348f-4769-b576-798c031d2560': function () {
            return {
                'id': '5b9d18f5-348f-4769-b576-798c031d2560',
                'name': 'View Only Lens',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '5b9d18f5-348f-4769-b576-798c031d2560',
                        'to': '6e2219e3-d03b-4ecb-97e2-9f19bec6b120',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        notepad.view.expandToLens();
                    }
                }
            };
        },
        '3ad1a8e8-442b-4489-85f3-f7f690f903cb': function () {
            return {
                'id': '3ad1a8e8-442b-4489-85f3-f7f690f903cb',
                'name': 'Flash White',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '3ad1a8e8-442b-4489-85f3-f7f690f903cb',
                        'to': '0c351594-f4b1-46a0-9f91-3b43a033ce4e',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        notepad.view = jibo.face.views.currentView;
                        if (notepad.view.id === 'flashView') {
                            notepad.view.startLoader();
                            notepad.view.flashWhite(done);
                        } else {
                            blackboard.log.error('currentView should be flash view');
                            done('~photoError');
                        }
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        'a2809092-a2b3-452d-915d-0c0a16f72572': function () {
            return {
                'id': 'a2809092-a2b3-452d-915d-0c0a16f72572',
                'name': 'Photo Head2',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'a2809092-a2b3-452d-915d-0c0a16f72572',
                        'to': '1800951a-c420-4761-9e31-70daf92a2572',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/Tut_PhotoHead2.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        'e9f39b3f-2d42-461f-b6ee-b70d2017e535': function () {
            return {
                'id': 'e9f39b3f-2d42-461f-b6ee-b70d2017e535',
                'name': 'SurfaceViewfinder',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'e9f39b3f-2d42-461f-b6ee-b70d2017e535',
                        'to': 'a6aec869-07b0-4e62-babe-1d99e3c62c0f',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        jibo.media.setViewfinder(true, {
                            enable: true,
                            x: 0,
                            y: 0,
                            width: 1280,
                            height: 720,
                            camera: 1
                        }, error => {
                            if (error) {
                                blackboard.log.error('Viewfinder error: ', error);
                                if (jibo.runMode === jibo.RunMode.ON_ROBOT) {
                                    done('~photoError');
                                } else {
                                    done();
                                }
                            } else {
                                done();
                            }
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '0bf72155-1a0b-4123-be45-45e9265f2f46': function () {
            return {
                'id': '0bf72155-1a0b-4123-be45-45e9265f2f46',
                'name': 'Attention OFF',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '0bf72155-1a0b-4123-be45-45e9265f2f46',
                        'to': '3f798dda-2ea0-48fe-ad62-d0aeff43fdbc',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        jibo.expression.setAttentionMode('OFF').then(() => {
                            done();
                        }).catch(err => {
                            blackboard.log.error('Error setting attention mode to OFF', err);
                            done();
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '3f798dda-2ea0-48fe-ad62-d0aeff43fdbc': function () {
            return {
                'id': '3f798dda-2ea0-48fe-ad62-d0aeff43fdbc',
                'name': 'View Corners & Camera',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '3f798dda-2ea0-48fe-ad62-d0aeff43fdbc',
                        'to': '6e970f66-9699-4b16-bf7a-54f3d7fa074c',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        notepad.view.showCorners();
                        notepad.view.shrinkLens();
                    }
                }
            };
        },
        '5303cfbc-6854-41c7-ac0b-fe26d2916d22': function () {
            return {
                'id': '5303cfbc-6854-41c7-ac0b-fe26d2916d22',
                'name': 'Here Goes Nothing',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '5303cfbc-6854-41c7-ac0b-fe26d2916d22',
                        'to': 'e1f8dd8e-c12a-401a-8401-b037f02ce11c',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/photo/HereGoesNothing.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        'e1f8dd8e-c12a-401a-8401-b037f02ce11c': function () {
            return {
                'id': 'e1f8dd8e-c12a-401a-8401-b037f02ce11c',
                'name': 'SurfaceViewfinder',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'e1f8dd8e-c12a-401a-8401-b037f02ce11c',
                        'to': 'e2c07171-4521-413e-aa34-190347201e49',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        jibo.media.setViewfinder(true, {
                            enable: true,
                            x: 0,
                            y: 0,
                            width: 1280,
                            height: 720,
                            camera: 1
                        }, error => {
                            if (error) {
                                blackboard.log.error('Viewfinder error: ', error);
                                if (jibo.runMode === jibo.RunMode.ON_ROBOT) {
                                    done('~photoError');
                                } else {
                                    done();
                                }
                            } else {
                                blackboard.log.info('viewfinder enabled');
                                done();
                            }
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '1e976be5-6820-42a2-8b98-29bae156b840': function () {
            return {
                'id': '1e976be5-6820-42a2-8b98-29bae156b840',
                'name': 'Check Flash View',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '1e976be5-6820-42a2-8b98-29bae156b840',
                        'to': '3ad1a8e8-442b-4489-85f3-f7f690f903cb',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        if (notepad.view.state === jibo.face.views.STATE.OPENED) {
                            done();
                        } else {
                            blackboard.log.error('Error with flash view');
                            done('~photoError');
                        }
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '6e2219e3-d03b-4ecb-97e2-9f19bec6b120': function () {
            return {
                'id': '6e2219e3-d03b-4ecb-97e2-9f19bec6b120',
                'name': 'Find Face',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '6e2219e3-d03b-4ecb-97e2-9f19bec6b120',
                        'to': '3f798dda-2ea0-48fe-ad62-d0aeff43fdbc',
                        'value': 'found'
                    },
                    {
                        'frm': '6e2219e3-d03b-4ecb-97e2-9f19bec6b120',
                        'to': 'c7179ff1-86e0-499a-b673-e6992165fab4',
                        'value': ''
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Subflow',
                'options': {
                    'subflowId': () => {
                        return require('./06B1-find-face');
                    },
                    'inputParameters': () => {
                        return { duration: 8000 };
                    },
                    'getTransition': subflow_result_object => {
                        return subflow_result_object.transition;
                    }
                }
            };
        },
        '6e970f66-9699-4b16-bf7a-54f3d7fa074c': function () {
            return {
                'id': '6e970f66-9699-4b16-bf7a-54f3d7fa074c',
                'name': 'Frame Faces',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '6e970f66-9699-4b16-bf7a-54f3d7fa074c',
                        'to': '5303cfbc-6854-41c7-ac0b-fe26d2916d22',
                        'value': ''
                    },
                    {
                        'frm': '6e970f66-9699-4b16-bf7a-54f3d7fa074c',
                        'to': 'e1f8dd8e-c12a-401a-8401-b037f02ce11c',
                        'value': 'found'
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Subflow',
                'options': {
                    'subflowId': () => {
                        return require('./06B2-frame-faces');
                    },
                    'inputParameters': () => {
                        return {};
                    },
                    'getTransition': subflow_result_object => {
                        return subflow_result_object.transition;
                    }
                }
            };
        },
        'c71581ab-165e-4c1e-9bca-8592b5608864': function () {
            return {
                'id': 'c71581ab-165e-4c1e-9bca-8592b5608864',
                'name': 'Set Search',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'c71581ab-165e-4c1e-9bca-8592b5608864',
                        'to': '5b9d18f5-348f-4769-b576-798c031d2560',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        blackboard.didSearch = true;
                    }
                }
            };
        },
        'c7179ff1-86e0-499a-b673-e6992165fab4': function () {
            return {
                'id': 'c7179ff1-86e0-499a-b673-e6992165fab4',
                'name': 'Attention OFF',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'c7179ff1-86e0-499a-b673-e6992165fab4',
                        'to': 'e9f39b3f-2d42-461f-b6ee-b70d2017e535',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        jibo.expression.setAttentionMode('OFF').then(() => {
                            done();
                        }).catch(err => {
                            blackboard.log.error('Error setting attention mode to OFF', err);
                            done();
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '8c453647-8205-44c6-b5ac-5e1d29b9f79f': function () {
            return {
                'id': '8c453647-8205-44c6-b5ac-5e1d29b9f79f',
                'name': 'Start Face Search',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '8c453647-8205-44c6-b5ac-5e1d29b9f79f',
                        'to': 'a2809092-a2b3-452d-915d-0c0a16f72572',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        blackboard.log.info('Starting active search, will search until stopped');
                        blackboard.faceFinder.startSearch();
                    }
                }
            };
        },
        'cd81f213-91bb-4b2d-8842-b4c193902883': function () {
            return {
                'id': 'cd81f213-91bb-4b2d-8842-b4c193902883',
                'name': 'Check Faces Search Result',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': 'cd81f213-91bb-4b2d-8842-b4c193902883',
                        'to': '0bf72155-1a0b-4123-be45-45e9265f2f46',
                        'value': 'true'
                    },
                    {
                        'frm': 'cd81f213-91bb-4b2d-8842-b4c193902883',
                        'to': 'c71581ab-165e-4c1e-9bca-8592b5608864',
                        'value': 'false'
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        blackboard.log.info('Best score: ' + blackboard.faceFinder.faceSearcher.bestScore.toString());
                        const faceFound = blackboard.faceFinder.checkBest(blackboard.faceFinder.lowScore);
                        blackboard.log.info('Face found: ' + faceFound);
                        if (!faceFound) {
                            blackboard.faceFinder.stopSearch();
                        }
                        return faceFound;
                    }
                }
            };
        }
    };
};
},{"./06B1-find-face":17,"./06B2-frame-faces":18}],17:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        'meta': {
            'version': 1,
            'name': '06B1-find-face',
            'uri': '/Users/jon/Workspace/jibo/buildsdk/skills/tutorial/src/flows/sub-flows/06B1-find-face.flow'
        },
        'c206d94f-ed3c-4071-8589-0c7974f3bda7': function () {
            return {
                'id': 'c206d94f-ed3c-4071-8589-0c7974f3bda7',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'c206d94f-ed3c-4071-8589-0c7974f3bda7',
                        'to': '3b1458ee-92fa-45cb-a2d0-a9b6095a076a',
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
        '2b648b45-ab2b-43e6-bbc0-93857f9732e2': {
            'id': '2b648b45-ab2b-43e6-bbc0-93857f9732e2',
            'asset-pack': 'core',
            'transitions': [{
                    'frm': '2b648b45-ab2b-43e6-bbc0-93857f9732e2',
                    'to': '766877df-d097-4953-b748-a259ae6563ec',
                    'value': ''
                }],
            'exceptions': [],
            'class': 'Flow.Begin-Parallel',
            'options': {}
        },
        '608f7805-9f82-45df-b2a2-ed6884f2ed6a': function () {
            return {
                'id': '608f7805-9f82-45df-b2a2-ed6884f2ed6a',
                'name': 'found',
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
        'ed38f72c-4497-46df-a1c0-5f1394942d17': function () {
            return {
                'id': 'ed38f72c-4497-46df-a1c0-5f1394942d17',
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
        '766877df-d097-4953-b748-a259ae6563ec': function () {
            return {
                'id': '766877df-d097-4953-b748-a259ae6563ec',
                'name': 'Start Search',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '766877df-d097-4953-b748-a259ae6563ec',
                        'to': 'e717cb64-986c-4b08-ab9d-4eebb7a519b5',
                        'value': 'true'
                    },
                    {
                        'frm': '766877df-d097-4953-b748-a259ae6563ec',
                        'to': '211a47d3-6253-43fd-a623-0deab828d098',
                        'value': 'false'
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        blackboard.log.info('Starting active search, will search until stopped');
                        blackboard.faceFinder.startSearch(found => {
                            blackboard.log.info('Result of search for faces during looking for you MIM: ' + found);
                            if (found) {
                                blackboard.tracker.found = 'attractable';
                            }
                            done(found);
                        }, blackboard.faceFinder.lowScore);
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        'e717cb64-986c-4b08-ab9d-4eebb7a519b5': function () {
            return {
                'id': 'e717cb64-986c-4b08-ab9d-4eebb7a519b5',
                'name': '~found',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'e717cb64-986c-4b08-ab9d-4eebb7a519b5',
                        'to': '211a47d3-6253-43fd-a623-0deab828d098',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Interrupt',
                'options': {
                    'getPayload': () => {
                        return { found: this.inTransition };
                    }
                }
            };
        },
        'd5eeb405-5268-478c-8783-7b19d1ef4236': function () {
            return {
                'id': 'd5eeb405-5268-478c-8783-7b19d1ef4236',
                'name': '~found',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'd5eeb405-5268-478c-8783-7b19d1ef4236',
                        'to': '98af535f-41b4-41fd-9ad3-1da712603ea0',
                        'value': 'true'
                    }],
                'exceptions': [],
                'class': 'Flow.Catch',
                'options': {
                    'getTransition': (exception, payload) => {
                        return true;
                    }
                }
            };
        },
        '98af535f-41b4-41fd-9ad3-1da712603ea0': function () {
            return {
                'id': '98af535f-41b4-41fd-9ad3-1da712603ea0',
                'name': 'Clean Up',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '98af535f-41b4-41fd-9ad3-1da712603ea0',
                        'to': 'ed38f72c-4497-46df-a1c0-5f1394942d17',
                        'value': 'false'
                    },
                    {
                        'frm': '98af535f-41b4-41fd-9ad3-1da712603ea0',
                        'to': '608f7805-9f82-45df-b2a2-ed6884f2ed6a',
                        'value': 'true'
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        blackboard.lightRing(false);
                        blackboard.skill.releaseMode().then(() => {
                            jibo.expression.setAttentionMode('OFF').then(() => {
                                done(this.inTransition);
                            });
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '3b1458ee-92fa-45cb-a2d0-a9b6095a076a': function () {
            return {
                'id': '3b1458ee-92fa-45cb-a2d0-a9b6095a076a',
                'name': 'Looking For You',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '3b1458ee-92fa-45cb-a2d0-a9b6095a076a',
                        'to': '7ef96365-7b17-41a2-ad72-28f73cb5299b',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/photo/LookingForYou.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '211a47d3-6253-43fd-a623-0deab828d098': function () {
            return {
                'id': '211a47d3-6253-43fd-a623-0deab828d098',
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
        'a7033ede-c4bc-4984-9b8d-4ef75ab43924': function () {
            return {
                'id': 'a7033ede-c4bc-4984-9b8d-4ef75ab43924',
                'name': 'Start Attractable Search',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': 'a7033ede-c4bc-4984-9b8d-4ef75ab43924',
                        'to': '98af535f-41b4-41fd-9ad3-1da712603ea0',
                        'value': 'true'
                    },
                    {
                        'frm': 'a7033ede-c4bc-4984-9b8d-4ef75ab43924',
                        'to': '98af535f-41b4-41fd-9ad3-1da712603ea0',
                        'value': 'false'
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        let searchDuration = jibo.runMode === jibo.RunMode.SIMULATOR ? 1 : notepad.params.duration;
                        blackboard.log.info('Starting attractable search, will search for ' + searchDuration + ' milliseconds');
                        blackboard.skill.setMode(jibo.expression.AttentionMode.ATTRACTABLE).then(() => {
                            blackboard.faceFinder.startSearch(found => {
                                blackboard.log.info('Result of attractable search for faces: ' + found);
                                done(found);
                            }, blackboard.faceFinder.lowScore, searchDuration);
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '7ef96365-7b17-41a2-ad72-28f73cb5299b': function () {
            return {
                'id': '7ef96365-7b17-41a2-ad72-28f73cb5299b',
                'name': 'Stop Search',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '7ef96365-7b17-41a2-ad72-28f73cb5299b',
                        'to': 'a7033ede-c4bc-4984-9b8d-4ef75ab43924',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        blackboard.faceFinder.stopSearch();
                        blackboard.lightRing(true);
                        return this.inTransition;
                    }
                }
            };
        }
    };
};
},{}],18:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        'meta': {
            'version': 1,
            'name': '06B2-frame-faces',
            'uri': '/Users/jon/Workspace/jibo/buildsdk/skills/tutorial/src/flows/sub-flows/06B2-frame-faces.flow'
        },
        '8650d67d-da69-49a4-b336-1bc90ea24b3a': function () {
            return {
                'id': '8650d67d-da69-49a4-b336-1bc90ea24b3a',
                'name': 'Hold Still',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '8650d67d-da69-49a4-b336-1bc90ea24b3a',
                        'to': '2fa7e7a3-335e-4ccd-9e01-b9ec0062705d',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/photo/HoldStill.mim',
                    'getPromptData': () => {
                        return { didSearch: blackboard.didSearch };
                    }
                }
            };
        },
        '158a73de-5f80-489b-bb00-69020b77d6ca': function () {
            return {
                'id': '158a73de-5f80-489b-bb00-69020b77d6ca',
                'name': 'Face Center Result',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '158a73de-5f80-489b-bb00-69020b77d6ca',
                        'to': '1c9c9ca5-a1cb-4458-95fc-88526a315c11',
                        'value': 'true'
                    },
                    {
                        'frm': '158a73de-5f80-489b-bb00-69020b77d6ca',
                        'to': 'cfb87ed9-08c0-424a-ac28-3869ad1911c6',
                        'value': 'false'
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        blackboard.log.info('Attempt to calculate photo center target');
                        let cameraTracking = 0;
                        let cameraPhoto = 1;
                        let fovSafeRegion = 0.9;
                        blackboard.faceFinder.findCenterFromFrame(point => {
                            if (point) {
                                blackboard.log.info('Found a center target using getFaces');
                                this.out = point;
                                blackboard.faceFinder.stopSearch();
                                done(true);
                                return;
                            }
                            let targets;
                            targets = blackboard.faceFinder.getTargetsFromMotionData(jibo.lps.motionData);
                            point = blackboard.faceFinder.getCenterFromTargets(targets, cameraTracking, cameraPhoto, blackboard.headRatio, fovSafeRegion);
                            if (point) {
                                blackboard.log.info('Found a center target using current tracks');
                                this.out = point;
                                blackboard.faceFinder.stopSearch();
                                done(true);
                                return;
                            }
                            targets = blackboard.faceFinder.getTargetsFromMotionData(blackboard.faceFinder.faceSearcher.bestScore.motionData);
                            point = blackboard.faceFinder.getCenterFromTargets(targets, cameraTracking, cameraPhoto, blackboard.headRatio, fovSafeRegion);
                            if (point) {
                                blackboard.log.info('Created a center target using best motion data');
                                this.out = point;
                                blackboard.faceFinder.stopSearch();
                                done(true);
                                return;
                            }
                            blackboard.log.warn('Failed get a center target, this should not happen');
                            blackboard.faceFinder.stopSearch();
                            done(false);
                        }, cameraTracking, cameraPhoto, blackboard.headRatio, fovSafeRegion);
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '1c9c9ca5-a1cb-4458-95fc-88526a315c11': function () {
            return {
                'id': '1c9c9ca5-a1cb-4458-95fc-88526a315c11',
                'name': 'Look At Center Point',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '1c9c9ca5-a1cb-4458-95fc-88526a315c11',
                        'to': '5906aec8-05a4-4909-ba1a-3b1052df4564',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        jibo.expression.acquireTarget({ position: this.in }).then(handle => {
                            return handle.promise;
                        }).then(() => {
                            done();
                        }).catch(err => {
                            blackboard.log.warn('Error during attend to target', err);
                            done('~photoError');
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '44634ce6-2a61-4d3a-af6a-1aa8733bf763': function () {
            return {
                'id': '44634ce6-2a61-4d3a-af6a-1aa8733bf763',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '44634ce6-2a61-4d3a-af6a-1aa8733bf763',
                        'to': '158a73de-5f80-489b-bb00-69020b77d6ca',
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
        'c6204860-e3a9-4134-8781-f7bc6d8fd779': {
            'id': 'c6204860-e3a9-4134-8781-f7bc6d8fd779',
            'asset-pack': 'core',
            'transitions': [{
                    'frm': 'c6204860-e3a9-4134-8781-f7bc6d8fd779',
                    'to': '8650d67d-da69-49a4-b336-1bc90ea24b3a',
                    'value': ''
                }],
            'exceptions': [],
            'class': 'Flow.Begin-Parallel',
            'options': {}
        },
        'cfb87ed9-08c0-424a-ac28-3869ad1911c6': function () {
            return {
                'id': 'cfb87ed9-08c0-424a-ac28-3869ad1911c6',
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
        '5906aec8-05a4-4909-ba1a-3b1052df4564': function () {
            return {
                'id': '5906aec8-05a4-4909-ba1a-3b1052df4564',
                'name': 'found',
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
        '2fa7e7a3-335e-4ccd-9e01-b9ec0062705d': function () {
            return {
                'id': '2fa7e7a3-335e-4ccd-9e01-b9ec0062705d',
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
        }
    };
};
},{}],19:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        'meta': {
            'version': 1,
            'name': '06C-save-photo',
            'uri': '/Users/jon/Workspace/jibo/buildsdk/skills/tutorial/src/flows/sub-flows/06C-save-photo.flow'
        },
        'f1c0e709-b0f7-4b3e-9a8f-4ad9a016003b': function () {
            return {
                'id': 'f1c0e709-b0f7-4b3e-9a8f-4ad9a016003b',
                'name': 'Photo Keep?',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'f1c0e709-b0f7-4b3e-9a8f-4ad9a016003b',
                        'to': '25907ec4-59c8-4cf5-a57a-7098c9f4bd7f',
                        'value': ''
                    }],
                'exceptions': [{
                        'frm': 'f1c0e709-b0f7-4b3e-9a8f-4ad9a016003b',
                        'to': '25907ec4-59c8-4cf5-a57a-7098c9f4bd7f',
                        'value': '~InteractionError'
                    }],
                'class': 'Mim.Question',
                'options': {
                    'mimPath': 'mims/en-us/Tut_PhotoKeep.mim',
                    'getPromptData': () => {
                        return { oobe: blackboard.oobe };
                    },
                    'onStatus': status => {
                        let mimState = status.state;
                        let asrResults = status.asrResults;
                    },
                    'onSuccess': results => {
                        notepad.view.removeActionsByType('mimShowGUI', 'tap');
                        result.rollupResult = results.asrResults.intent;
                        return result.rollupResult;
                    },
                    'onFailure': results => {
                        notepad.view.removeActionsByType('mimShowGUI', 'tap');
                        let mimState = results.state;
                        let asrResults = results.asrResults;
                        let exception = results.exception;
                        return exception;
                    }
                }
            };
        },
        '8c4f53c6-17f8-45be-9770-a1066b22c7c9': function () {
            return {
                'id': '8c4f53c6-17f8-45be-9770-a1066b22c7c9',
                'name': 'SaveCurrentPhoto',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '8c4f53c6-17f8-45be-9770-a1066b22c7c9',
                        'to': '3cac36d6-d29a-4659-a934-3ff15ff10227',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        jibo.media.storePhoto(blackboard.skill.getPhoto().id, (err, result) => {
                            if (err) {
                                blackboard.log.error('error saving photobooth: ', err);
                                done('~photoError');
                            } else {
                                done();
                            }
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '9eebff61-d65c-4777-9473-b6e4cc81cc0c': function () {
            return {
                'id': '9eebff61-d65c-4777-9473-b6e4cc81cc0c',
                'name': 'cleanup view(delete)',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '9eebff61-d65c-4777-9473-b6e4cc81cc0c',
                        'to': '5baa0b69-f7f2-437d-98b0-d22f5acf09c6',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        notepad.view.showChoice(false, jibo.face.views.forceEyeView(done, null, jibo.face.views.IN, jibo.face.views.OUT, () => {
                            done('~photoError');
                        }));
                        notepad.view = null;
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '3cac36d6-d29a-4659-a934-3ff15ff10227': function () {
            return {
                'id': '3cac36d6-d29a-4659-a934-3ff15ff10227',
                'name': 'cleanup view(save)',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '3cac36d6-d29a-4659-a934-3ff15ff10227',
                        'to': '5adb332d-61af-4c25-99a6-db62d71c7025',
                        'value': 'yes'
                    },
                    {
                        'frm': '3cac36d6-d29a-4659-a934-3ff15ff10227',
                        'to': '1545b0a4-8bf3-4b5b-a98b-a6b25d878bc3',
                        'value': ''
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        notepad.view.showChoice(true, jibo.face.views.forceEyeView(() => {
                            done(result.rollupResult);
                        }, null, jibo.face.views.IN, jibo.face.views.UP, () => {
                            done('~photoError');
                        }));
                        notepad.view = null;
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '5adb332d-61af-4c25-99a6-db62d71c7025': function () {
            return {
                'id': '5adb332d-61af-4c25-99a6-db62d71c7025',
                'name': 'Photo Save',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '5adb332d-61af-4c25-99a6-db62d71c7025',
                        'to': '87f96847-ab66-42f1-983e-ad92d8a51156',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/Tut_PhotoSave.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '1545b0a4-8bf3-4b5b-a98b-a6b25d878bc3': function () {
            return {
                'id': '1545b0a4-8bf3-4b5b-a98b-a6b25d878bc3',
                'name': 'Photo Save Default',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '1545b0a4-8bf3-4b5b-a98b-a6b25d878bc3',
                        'to': '87f96847-ab66-42f1-983e-ad92d8a51156',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/Tut_PhotoSaveDefault.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        'fa9bd718-ca25-4349-9ec8-589db232342e': function () {
            return {
                'id': 'fa9bd718-ca25-4349-9ec8-589db232342e',
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
        '8e36aa47-015b-49e2-8ea4-45652bdb92d4': {
            'id': '8e36aa47-015b-49e2-8ea4-45652bdb92d4',
            'asset-pack': 'core',
            'transitions': [],
            'exceptions': [],
            'class': 'Flow.Comment',
            'options': {}
        },
        '5baa0b69-f7f2-437d-98b0-d22f5acf09c6': function () {
            return {
                'id': '5baa0b69-f7f2-437d-98b0-d22f5acf09c6',
                'name': 'Photo Delete',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '5baa0b69-f7f2-437d-98b0-d22f5acf09c6',
                        'to': '87f96847-ab66-42f1-983e-ad92d8a51156',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/Tut_PhotoDelete.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        'b7f18a06-3b27-428c-9953-51957699e2a2': function () {
            return {
                'id': 'b7f18a06-3b27-428c-9953-51957699e2a2',
                'name': 'setup view listeners',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'b7f18a06-3b27-428c-9953-51957699e2a2',
                        'to': 'f1c0e709-b0f7-4b3e-9a8f-4ad9a016003b',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        notepad.view.addAction('mimShowGUI');
                    }
                }
            };
        },
        '87f96847-ab66-42f1-983e-ad92d8a51156': function () {
            return {
                'id': '87f96847-ab66-42f1-983e-ad92d8a51156',
                'name': 'Photo Wrap',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '87f96847-ab66-42f1-983e-ad92d8a51156',
                        'to': '353a1098-afd6-4b16-aed5-afd9e53631ca',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/Tut_PhotoWrap.mim',
                    'getPromptData': () => {
                        return { oobe: blackboard.oobe };
                    }
                }
            };
        },
        '353a1098-afd6-4b16-aed5-afd9e53631ca': function () {
            return {
                'id': '353a1098-afd6-4b16-aed5-afd9e53631ca',
                'name': 'Is OOBE',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '353a1098-afd6-4b16-aed5-afd9e53631ca',
                        'to': 'fa9bd718-ca25-4349-9ec8-589db232342e',
                        'value': 'true'
                    },
                    {
                        'frm': '353a1098-afd6-4b16-aed5-afd9e53631ca',
                        'to': 'a0675984-4587-4a9e-a532-abbc6ac38263',
                        'value': 'false'
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        return blackboard.oobe;
                    }
                }
            };
        },
        'a0675984-4587-4a9e-a532-abbc6ac38263': function () {
            return {
                'id': 'a0675984-4587-4a9e-a532-abbc6ac38263',
                'name': 'Photo Wrap2',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'a0675984-4587-4a9e-a532-abbc6ac38263',
                        'to': 'fa9bd718-ca25-4349-9ec8-589db232342e',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/Tut_PhotoWrap2.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '1a8ef76e-a1db-42be-9607-a32ef5595576': function () {
            return {
                'id': '1a8ef76e-a1db-42be-9607-a32ef5595576',
                'name': 'present',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '1a8ef76e-a1db-42be-9607-a32ef5595576',
                        'to': 'b7f18a06-3b27-428c-9953-51957699e2a2',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        notepad.view = jibo.face.views.createView('PhotoView', null, false);
                        notepad.view.transitionStageOnly = true;
                        notepad.view.addPhotoToLoad(blackboard.skill.getPhoto().url);
                        jibo.face.views.changeView({
                            remove: true,
                            addView: notepad.view,
                            transitionClose: jibo.face.views.OUT,
                            transitionOpen: jibo.face.views.UP
                        }, done, () => {
                            blackboard.log.error('PhotoView failed to load');
                            done('~photoError');
                        }, view => {
                            view.displayPhoto();
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        'e761ccaa-87ef-4d22-94ea-8e2ab50fb0bb': function () {
            return {
                'id': 'e761ccaa-87ef-4d22-94ea-8e2ab50fb0bb',
                'name': 'Attention Mode MENU',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'e761ccaa-87ef-4d22-94ea-8e2ab50fb0bb',
                        'to': '1a8ef76e-a1db-42be-9607-a32ef5595576',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        jibo.expression.setAttentionMode('MENU').then(() => {
                            done();
                        }).catch(err => {
                            blackboard.log.error('Error setting attention mode to MENU', err);
                            done();
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        'b34bda92-7658-49ac-8d9e-d30b86fe7cb5': function () {
            return {
                'id': 'b34bda92-7658-49ac-8d9e-d30b86fe7cb5',
                'name': 'flash white',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'b34bda92-7658-49ac-8d9e-d30b86fe7cb5',
                        'to': 'e761ccaa-87ef-4d22-94ea-8e2ab50fb0bb',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        notepad.view = jibo.face.views.currentView;
                        if (notepad.view.id === 'flashView') {
                            notepad.view.startLoader();
                            notepad.view.flashWhite();
                            done();
                        } else {
                            blackboard.log.error('currentView should be flash view');
                            done('~photoError');
                        }
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        'd7a8f25f-c880-4cd2-9276-894c5245ae81': function () {
            return {
                'id': 'd7a8f25f-c880-4cd2-9276-894c5245ae81',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'd7a8f25f-c880-4cd2-9276-894c5245ae81',
                        'to': 'b34bda92-7658-49ac-8d9e-d30b86fe7cb5',
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
        '25907ec4-59c8-4cf5-a57a-7098c9f4bd7f': function () {
            return {
                'id': '25907ec4-59c8-4cf5-a57a-7098c9f4bd7f',
                'name': 'Track Choice',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '25907ec4-59c8-4cf5-a57a-7098c9f4bd7f',
                        'to': '8c4f53c6-17f8-45be-9770-a1066b22c7c9',
                        'value': 'yes'
                    },
                    {
                        'frm': '25907ec4-59c8-4cf5-a57a-7098c9f4bd7f',
                        'to': '8c4f53c6-17f8-45be-9770-a1066b22c7c9',
                        'value': ''
                    },
                    {
                        'frm': '25907ec4-59c8-4cf5-a57a-7098c9f4bd7f',
                        'to': '9eebff61-d65c-4777-9473-b6e4cc81cc0c',
                        'value': 'no'
                    }
                ],
                'exceptions': [{
                        'frm': '25907ec4-59c8-4cf5-a57a-7098c9f4bd7f',
                        'to': '8c4f53c6-17f8-45be-9770-a1066b22c7c9',
                        'value': '~'
                    }],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        let inTrans = this.inTransition;
                        if (inTrans === 'yes') {
                            blackboard.tracker.photoQuestionComplete(true, true);
                        } else if (inTrans === 'no') {
                            blackboard.tracker.photoQuestionComplete(true, false);
                        } else {
                            blackboard.tracker.photoQuestionComplete(false, false);
                        }
                        return this.inTransition;
                    }
                }
            };
        }
    };
};
},{}],20:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        'meta': {
            'version': 1,
            'name': '07-outro',
            'uri': '/Users/jon/Workspace/jibo/buildsdk/skills/tutorial/src/flows/sub-flows/07-outro.flow'
        },
        '882a802f-3e67-49d6-92d4-215d370ad2ce': function () {
            return {
                'id': '882a802f-3e67-49d6-92d4-215d370ad2ce',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '882a802f-3e67-49d6-92d4-215d370ad2ce',
                        'to': 'fe01ff3c-37d0-458b-8314-4e5c9ad35961',
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
        'af469b41-5636-490e-bec6-7e3b6f6ff2df': function () {
            return {
                'id': 'af469b41-5636-490e-bec6-7e3b6f6ff2df',
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
        'fe01ff3c-37d0-458b-8314-4e5c9ad35961': function () {
            return {
                'id': 'fe01ff3c-37d0-458b-8314-4e5c9ad35961',
                'name': 'From OOBE',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': 'fe01ff3c-37d0-458b-8314-4e5c9ad35961',
                        'to': '48d585b7-4eac-4e5a-b076-519803b92612',
                        'value': 'true'
                    },
                    {
                        'frm': 'fe01ff3c-37d0-458b-8314-4e5c9ad35961',
                        'to': 'af469b41-5636-490e-bec6-7e3b6f6ff2df',
                        'value': 'false'
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        done(!!blackboard.oobe);
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '48d585b7-4eac-4e5a-b076-519803b92612': function () {
            return {
                'id': '48d585b7-4eac-4e5a-b076-519803b92612',
                'name': 'KB Available',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '48d585b7-4eac-4e5a-b076-519803b92612',
                        'to': '4eee4e0c-c71f-428c-8ff2-f1b9824e4b7b',
                        'value': 'true'
                    },
                    {
                        'frm': '48d585b7-4eac-4e5a-b076-519803b92612',
                        'to': '1cdeccfd-8afe-4ce0-81b8-fc82655bb423',
                        'value': 'false'
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        blackboard.skill.hasLoopers(done);
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        'feda6991-a8ae-4c4f-a4d1-c4355ac0bcd3': function () {
            return {
                'id': 'feda6991-a8ae-4c4f-a4d1-c4355ac0bcd3',
                'name': 'Enroll No Thanks',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'feda6991-a8ae-4c4f-a4d1-c4355ac0bcd3',
                        'to': '1cdeccfd-8afe-4ce0-81b8-fc82655bb423',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/Tut_EnrollNoThanks.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '27b8c252-f9e9-4f42-9167-4133a8ca80e0': function () {
            return {
                'id': '27b8c252-f9e9-4f42-9167-4133a8ca80e0',
                'name': 'Enroll Yes',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '27b8c252-f9e9-4f42-9167-4133a8ca80e0',
                        'to': '54460c53-aaa8-4f3f-9baf-8ae53caa3f41',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/Tut_EnrollYes.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        'a7206291-c01b-4519-9218-c4e77fc01016': function () {
            return {
                'id': 'a7206291-c01b-4519-9218-c4e77fc01016',
                'name': 'Enroll Now',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'a7206291-c01b-4519-9218-c4e77fc01016',
                        'to': '25907ec4-59c8-4cf5-a57a-7098c9f4bd7f',
                        'value': ''
                    }],
                'exceptions': [{
                        'frm': 'a7206291-c01b-4519-9218-c4e77fc01016',
                        'to': '25907ec4-59c8-4cf5-a57a-7098c9f4bd7f',
                        'value': '~InteractionError'
                    }],
                'class': 'Mim.Question',
                'options': {
                    'mimPath': 'mims/en-us/Tut_EnrollNow.mim',
                    'getPromptData': () => {
                        return {};
                    },
                    'onStatus': status => {
                        let mimState = status.state;
                        let asrResults = status.asrResults;
                    },
                    'onSuccess': results => {
                        let mimState = results.state;
                        let asrResults = results.asrResults;
                        let transition = results.firstGrammarTag;
                        return transition;
                    },
                    'onFailure': results => {
                        let mimState = results.state;
                        let asrResults = results.asrResults;
                        let exception = results.exception;
                        return exception;
                    }
                }
            };
        },
        '4eee4e0c-c71f-428c-8ff2-f1b9824e4b7b': function () {
            return {
                'id': '4eee4e0c-c71f-428c-8ff2-f1b9824e4b7b',
                'name': 'Enroll Why',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '4eee4e0c-c71f-428c-8ff2-f1b9824e4b7b',
                        'to': 'a7206291-c01b-4519-9218-c4e77fc01016',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/Tut_EnrollWhy.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '3de162ea-13a9-4d21-9508-ea46a0c14eb0': {
            'id': '3de162ea-13a9-4d21-9508-ea46a0c14eb0',
            'asset-pack': 'core',
            'transitions': [],
            'exceptions': [],
            'class': 'Flow.Comment',
            'options': {}
        },
        '1cdeccfd-8afe-4ce0-81b8-fc82655bb423': function () {
            return {
                'id': '1cdeccfd-8afe-4ce0-81b8-fc82655bb423',
                'name': 'Wrap',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '1cdeccfd-8afe-4ce0-81b8-fc82655bb423',
                        'to': 'af469b41-5636-490e-bec6-7e3b6f6ff2df',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/Tut_Wrap.mim',
                    'getPromptData': () => {
                        return { oobe: blackboard.oobe };
                    }
                }
            };
        },
        '54460c53-aaa8-4f3f-9baf-8ae53caa3f41': function () {
            return {
                'id': '54460c53-aaa8-4f3f-9baf-8ae53caa3f41',
                'name': 'enrollment',
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
        '25907ec4-59c8-4cf5-a57a-7098c9f4bd7f': function () {
            return {
                'id': '25907ec4-59c8-4cf5-a57a-7098c9f4bd7f',
                'name': 'Track Choice',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '25907ec4-59c8-4cf5-a57a-7098c9f4bd7f',
                        'to': '27b8c252-f9e9-4f42-9167-4133a8ca80e0',
                        'value': 'yes'
                    },
                    {
                        'frm': '25907ec4-59c8-4cf5-a57a-7098c9f4bd7f',
                        'to': 'feda6991-a8ae-4c4f-a4d1-c4355ac0bcd3',
                        'value': ''
                    }
                ],
                'exceptions': [{
                        'frm': '25907ec4-59c8-4cf5-a57a-7098c9f4bd7f',
                        'to': 'feda6991-a8ae-4c4f-a4d1-c4355ac0bcd3',
                        'value': '~'
                    }],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        let inTrans = this.inTransition;
                        if (inTrans === 'yes') {
                            blackboard.tracker.choseEnrollment(true, true);
                        } else if (inTrans === 'no') {
                            blackboard.tracker.choseEnrollment(true, false);
                        } else {
                            blackboard.tracker.choseEnrollment(false, false);
                        }
                        return this.inTransition;
                    }
                }
            };
        }
    };
};
},{}],21:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const be_framework_1 = require("@be/be-framework");
const jibo = require("jibo");
const CameraView_1 = require("./views/CameraView");
const FlashView_1 = require("./views/FlashView");
const PhotoView_1 = require("./views/PhotoView");
const Analytics_1 = require("./Analytics");
const FaceSearcher_1 = require("./photo/FaceSearcher");
const FrameHelper_1 = require("./photo/FrameHelper");
let mainFlow = require('./flows/main');
const FaceFinder = require('./photo/FaceFinder');
const DANCE_RULE = 'tutorial/dance';
const PHOTO_RULE = 'tutorial/take_photo';
class Tutorial extends be_framework_1.BeSkill {
    constructor(assetPack) {
        super(assetPack);
        this.flow = null;
        this.endOfListen = false;
        this._fromOOBE = false;
        this._blockingHeadTouch = false;
        this._tracker = null;
        this.WAIT_TIME = 6000;
        this.SECONDS_TO_HOLD_TOUCH = 1;
        this.onHJHeard = this.onHJHeard.bind(this);
        this.blockSkillSwitch = this.blockSkillSwitch.bind(this);
        this.blockHeadTouchOn = this.blockHeadTouchOn.bind(this);
        this.blockHeadTouchOff = this.blockHeadTouchOff.bind(this);
        this.blockHeadTouch = this.blockHeadTouch.bind(this);
        this.onHJOnly = this.onHJOnly.bind(this);
        this.onNoGlobalMatch = this.onNoGlobalMatch.bind(this);
        this.handleHJ = this.handleHJ.bind(this);
        FaceSearcher_1.default.log = this.log.createChild('FaceSearcher');
        FrameHelper_1.default.log = this.log.createChild('FrameHelper');
        FaceFinder.log = this.log.createChild('FaceFinder');
        CameraView_1.default.log = this.log.createChild('CameraView');
        FlashView_1.default.log = this.log.createChild('FlashView');
        PhotoView_1.default.log = this.log.createChild('PhotoView');
    }
    preload(done) {
        done();
    }
    open(result, refresh, previousSkillName, previousSkillOptions) {
        if (refresh) {
            this.log.debug('open () refresh');
            if (this._fromOOBE) {
                jibo.globalEvents.shared.nonInterruptingGlobal.emit();
            }
            else {
                this.cleanup(this.open.bind(this, result, false, previousSkillName, previousSkillOptions));
            }
        }
        else {
            const start_step = 0;
            jibo.face.views.creator.registerClass(CameraView_1.default);
            jibo.face.views.creator.registerClass(FlashView_1.default);
            jibo.face.views.creator.registerClass(PhotoView_1.default);
            const load = jibo.loader.load([
                'audio/camera-shutter.m4a',
                'audio/screen-swipedown.m4a',
                'audio/screen-tap.m4a',
            ], {
                cacheAll: jibo.loader.activeCache
            });
            this._assetTokens = load.tokens;
            jibo.face.views.forceEyeView();
            this._fromOOBE = previousSkillName === '@be/first-contact';
            this.log.debug('open() previousSkillName: ' + previousSkillName);
            if (this._fromOOBE) {
                this.log.debug('open() coming from First Contact, setting OOBE flag to true');
                jibo.globalEvents.touchStop.on(this.blockHeadTouch);
                this._blockingHeadTouch = false;
                this.disableHJ();
                this._isInterruptible = false;
                jibo.globalEvents.skillRelaunch.on(this.blockSkillSwitch);
            }
            else {
                this._blockingHeadTouch = false;
                this._isInterruptible = true;
            }
            let launchSource;
            if (this._fromOOBE) {
                launchSource = 'from_fc';
            }
            else {
                launchSource = (previousSkillName === '@be/main-menu') ? 'menu' : 'speech';
            }
            if (!this._tracker) {
                this._tracker = new Analytics_1.default(this);
            }
            this._tracker.reset(launchSource);
            this._tracker.started();
            const options = {
                assetPack: this.assetPack,
                enableLogging: true,
                blackboard: {
                    skill: this,
                    step: start_step,
                    waitTime: this.WAIT_TIME,
                    version: 'mainMenu',
                    oobe: this._fromOOBE,
                    faceFinder: new FaceFinder(),
                    tracker: this._tracker,
                    log: this.log,
                    lightRing: this.setLightRing,
                    headRatio: .56
                }
            };
            this.flow = jibo.flow.run(mainFlow, options, (err, status) => {
                this.log.debug('flow ended');
                if (status !== jibo.bt.Status.INTERRUPTED) {
                    this._tracker.completed(true);
                    this._isInterruptible = true;
                    jibo.globalEvents.skillRelaunch.removeListener(this.blockSkillSwitch);
                    if (this.flow.context.result.transition === 'enrollment') {
                        this.log.info('redirecting to enrollment');
                        this.redirect('@be/introductions', { nlu: { entities: { domain: 'introductions' }, intent: 'enrollment' } });
                    }
                    else {
                        this.exit();
                    }
                }
                else {
                    this._tracker.completed(false);
                }
            });
        }
    }
    setLightRing(turnOn) {
        if (turnOn) {
            jibo.embodied.listen.enterActiveMode(jibo.embodied.listen.ActiveListenMode.UI);
        }
        else {
            jibo.embodied.listen.exitActiveMode();
        }
    }
    setMode(mode) {
        return __awaiter(this, void 0, void 0, function* () {
            this._pmHandle = yield jibo.expression.pushAttentionMode(mode);
            return this._pmHandle;
        });
    }
    releaseMode() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._pmHandle) {
                yield this._pmHandle.release();
                this._pmHandle = null;
            }
        });
    }
    hasLoopers(done) {
        jibo.kb.loop.loadLoop((err, userNodes) => {
            if (err || !userNodes) {
                done(false);
                return;
            }
            for (let looper of userNodes) {
                if (!looper.isJibo) {
                    done(true);
                    return;
                }
            }
            done(false);
        });
    }
    setEngaged(bool) {
        jibo.embodied.listen.demoEngaged(bool);
    }
    storePhoto(photo) {
        this._photo = photo;
    }
    getPhoto() {
        return this._photo;
    }
    waitForHJ(done) {
        return __awaiter(this, void 0, void 0, function* () {
            this._onHJ = done;
            jibo.jetstream.events.hjHeard.on(this.onHJHeard);
            yield this.releaseHJToken();
            this._hjModeToken = jibo.jetstream.setHotwordMode(jibo.jetstream.types.HotwordListenMode.HJ_Only);
        });
    }
    cleanUpHJ() {
        return __awaiter(this, void 0, void 0, function* () {
            this._onHJ = null;
            jibo.jetstream.events.hjHeard.off(this.onHJHeard);
            yield this.releaseHJToken();
            if (this._fromOOBE) {
                yield this.disableHJ();
            }
        });
    }
    showCommandView(type, done) {
        let viewPath = type === 'dance' ? 'assets/views/hey-jibo-dance.json' : 'assets/views/hey-jibo-take-photo.json';
        jibo.face.views.changeView({
            removeAll: true,
            addView: viewPath
        }, () => { done(); }, () => {
            this.log.warn('showCommandView() failed to create view ' + type);
            done();
        });
    }
    waitForHJCommand(command, done) {
        return __awaiter(this, void 0, void 0, function* () {
            this._onHJCommand = done;
            yield this.releaseHJToken();
            const rules = ['globals/global_commands_launch', command === 'dance' ? DANCE_RULE : PHOTO_RULE];
            this._hjModeToken = jibo.jetstream.setHotwordMode(jibo.jetstream.types.HotwordListenMode.Custom_NLU_Only, rules);
            this._hjModeToken.match.on((match) => {
                const targetIntent = command === 'dance' ? 'dance' : /photo/i;
                if (match.result.nlu && match.result.nlu.intent.match(targetIntent)) {
                    if (this._onHJCommand) {
                        this._onHJCommand();
                    }
                    return;
                }
                if (!this._fromOOBE) {
                    this.onNoGlobalMatch();
                }
            });
        });
    }
    cleanUpHJCommand() {
        return __awaiter(this, void 0, void 0, function* () {
            this._onHJCommand = null;
            yield this.releaseHJToken();
            if (this._fromOOBE) {
                yield this.disableHJ();
            }
        });
    }
    cleanUpHjHandle() {
        this._onHjOnlyCommand = null;
        jibo.globalEvents.shared.hjOnly.off(this.onHJOnly);
        this._onHjHeard = null;
        jibo.jetstream.events.hjHeard.off(this.onHJHeard);
        this._onNoMatchCommand = null;
        jibo.globalEvents.shared.noGlobalMatch.off(this.onNoGlobalMatch);
        clearTimeout(this._hjTimer);
        this._hjTimer = null;
    }
    handleHJ(done) {
        this.cleanUpHjHandle();
        this._hjTimer = setTimeout(() => {
            this.cleanUpHjHandle();
            done('wait');
        }, this.WAIT_TIME);
        this.waitForHjHeard(() => {
            clearTimeout(this._hjTimer);
        });
        this.waitForHjOnly(() => {
            this.cleanUpHjHandle();
            done('hjOnly');
        });
        this.waitForNoMatch(() => {
            this.cleanUpHjHandle();
            done('noMatch');
        });
    }
    waitForHeadTouch(done) {
        this.interruptHeadTouch(true);
        this._onHeadTouch = done;
    }
    interruptHeadTouch(block) {
        if (this._blockingHeadTouch !== block) {
            this._blockingHeadTouch = block;
            if (block) {
                if (this._fromOOBE) {
                    jibo.globalEvents.touchStop.removeListener(this.blockHeadTouch);
                }
                else {
                    this._isInterruptible = false;
                    jibo.globalEvents.skillRelaunch.on(this.blockSkillSwitch);
                }
                jibo.system.events.touchOn.on(this.blockHeadTouchOn);
                jibo.system.events.touchOff.on(this.blockHeadTouchOff);
            }
            else {
                jibo.system.events.touchOn.removeListener(this.blockHeadTouchOn);
                jibo.system.events.touchOff.removeListener(this.blockHeadTouchOff);
                if (this._fromOOBE) {
                    jibo.globalEvents.touchStop.on(this.blockHeadTouch);
                }
                else {
                    this._isInterruptible = true;
                    jibo.globalEvents.skillRelaunch.removeListener(this.blockSkillSwitch);
                }
            }
        }
    }
    cleanUpHeadTouch() {
        this._onHeadTouch = null;
    }
    waitForGesture(done, id) {
        switch (id) {
            case 'tap': {
                jibo.face.views.currentView.addAction('callback', {
                    callback: () => {
                        if (jibo.sound.exists('screen-tap')) {
                            jibo.sound.play('screen-tap');
                        }
                        jibo.face.views.currentView.removeActionsByType('callback');
                        done(true);
                    }
                });
                break;
            }
            case 'pan': {
                let onPaged = (data) => {
                    jibo.face.views.currentView.removeListener('paged', onPaged);
                    done(true);
                };
                jibo.face.views.currentView.on('paged', onPaged);
                break;
            }
            case 'swipe': {
                this.addSwipeClose();
                let onClosed = (data) => {
                    if (jibo.sound.exists('screen-swipedown')) {
                        jibo.sound.play('screen-swipedown');
                    }
                    done(true);
                };
                jibo.face.views.currentView.on(jibo.face.views.CLOSED, onClosed);
                break;
            }
            default: {
                console.warn('Tutorial :: waitForGesture : Invalid gesture id');
                break;
            }
        }
    }
    cleanUpGesture(id) {
        switch (id) {
            case 'tap': {
                jibo.face.views.currentView.removeActionsByType('callback');
                break;
            }
            case 'pan': {
                jibo.face.views.currentView.removeAllListeners('paged');
                break;
            }
            case 'swipe': {
                break;
            }
            default: {
                this.log.warn('cleanUpGesture() invalid gesture id: ' + id);
                break;
            }
        }
    }
    addSwipeClose() {
        jibo.face.views.currentView.addAction(jibo.face.views.ActionData.EVENT, { event: jibo.face.views.BACK }, false, false, jibo.face.views.SWIPE);
        jibo.face.views.currentView.addAction(jibo.face.views.ActionData.CLOSE_VIEW, null, false, false, jibo.face.views.SWIPE);
    }
    playClip(clipId, done, withinView) {
        let view = jibo.face.views.currentView;
        let asset = view.assets[clipId];
        let assetDescriptor = {
            id: clipId,
            type: 'timeline',
            src: 'assets/timelines/' + clipId + '/' + clipId + '.js',
            instance: true
        };
        if (withinView && withinView !== view.id) {
            return;
        }
        if (asset) {
            let config = { id: clipId, assets: [assetDescriptor] };
            let clip = jibo.rendering.gui.components.Clip.createFromConfig(config);
            view.addComponent(clip, clipId);
            clip.createDisplay(view.stage, view.assets);
            clip.movieClip.gotoAndStop(0);
            jibo.rendering.tween.TweenManager.play(clip.display, {
                to: { 'alpha': 1 },
                from: { 'alpha': 0 },
                duration: 500,
                ease: 'sineOut'
            }, () => {
                clip.movieClip.gotoAndPlay(0);
            });
            if (done) {
                done();
            }
        }
        else {
            view.addAssets(assetDescriptor, (err) => {
                if (err) {
                    this.log.error('failed to load asset, exiting skill');
                    this.exit();
                }
                else {
                    this.playClip(clipId, done);
                }
            });
        }
    }
    stopClip(clipId, done) {
        let view = jibo.face.views.currentView;
        let clip = view.getComponentById(clipId);
        if (clip) {
            jibo.rendering.tween.TweenManager.play(clip.display, {
                to: { 'alpha': 0 },
                duration: 200,
                ease: 'sineIn'
            }, () => {
                clip.movieClip.stop();
                if (done) {
                    done();
                }
            });
        }
        else {
            this.log.warn('stopClip() current view did not have clip id: ' + clipId);
            if (done) {
                done();
            }
        }
    }
    close(done) {
        jibo.loader.unload(this._assetTokens);
        this._assetTokens = null;
        jibo.face.views.creator.unregisterClass('CameraView');
        jibo.face.views.creator.unregisterClass('FlashView');
        jibo.face.views.creator.unregisterClass('PhotoView');
        this.cleanup(done);
    }
    cleanup(done) {
        const cleanup = [];
        if (this.flow) {
            cleanup.push(this.flow.stop()
                .catch((err) => {
                this.log.debug('Error when stopping flow: ', err);
            })
                .then(() => {
                this.flow.destroy();
                this.flow = null;
            }));
        }
        cleanup.push(this.releaseMode(), this.releaseHJToken(), this.disableViewFinder()
            .catch((err) => {
            this.log.debug('cleanup() setViewfinder disable error: ', err);
        }), this.cleanupViews()
            .catch((err) => {
            this.log.debug('Eror when closing views: ', err);
        }));
        Promise.all(cleanup).then(() => {
            this.cleanupHandlers();
            done();
        });
    }
    cleanupHandlers() {
        jibo.embodied.listen.demoEngaged(false);
        jibo.jetstream.events.hjHeard.removeListener(this.onHJHeard);
        jibo.globalEvents.shared.hjOnly.removeListener(this.onHJOnly);
        jibo.globalEvents.skillRelaunch.removeListener(this.blockSkillSwitch);
        jibo.system.events.touchOn.removeListener(this.blockHeadTouchOn);
        jibo.system.events.touchOff.removeListener(this.blockHeadTouchOff);
        jibo.globalEvents.touchStop.removeListener(this.blockHeadTouch);
        this._onHJ = null;
        this._onHJCommand = null;
        this._onHeadTouch = null;
        this._photo = null;
        this._blockingHeadTouch = false;
        if (this._headTimer) {
            clearTimeout(this._headTimer);
            this._headTimer = null;
        }
        if (this._hjTimer) {
            clearTimeout(this._hjTimer);
            this._hjTimer = null;
        }
    }
    disableViewFinder() {
        return new Promise((resolve) => {
            jibo.media.setViewfinder({ enable: false }, (error) => {
                if (error) {
                    this.log.error('cleanup() setViewfinder disable error: ', error);
                }
                resolve();
            });
        });
    }
    cleanupViews() {
        let view = jibo.face.views.currentView;
        if (view && view.category === jibo.face.views.CATEGORY_EYE) {
            const tapComponent = view.getComponentById('tap');
            if (tapComponent) {
                view.removeComponent(tapComponent);
                tapComponent.emptyDisplay();
                tapComponent.destroy();
                view.removeAssets(view.assetManifest);
            }
        }
        return new Promise((resolve) => {
            jibo.face.views.viewStackCleanup()
                .then(() => {
                resolve();
            })
                .catch(() => {
                this.log.debug('cleanupViews() failed to remove all views, calling done anyway');
                resolve();
            });
        });
    }
    onHJHeard() {
        if (this._onHJ) {
            this._onHJ('true');
            this._onHJ = null;
        }
        else if (this._onHjHeard) {
            this._onHjHeard();
            this._onHjHeard = null;
        }
    }
    onNoGlobalMatch() {
        if (this._onNoMatchCommand) {
            this._onNoMatchCommand();
            this._onNoMatchCommand = null;
        }
    }
    onHJOnly() {
        if (this._onHjOnlyCommand) {
            this._onHjOnlyCommand();
            this._onHjOnlyCommand = null;
        }
    }
    waitForNoMatch(done) {
        this._onNoMatchCommand = done;
        jibo.globalEvents.shared.noGlobalMatch.on(this.onNoGlobalMatch);
    }
    waitForHjOnly(done) {
        this._onHjOnlyCommand = done;
        jibo.globalEvents.shared.hjOnly.on(this.onHJOnly);
    }
    waitForHjHeard(done) {
        this._onHjHeard = done;
        jibo.jetstream.events.hjHeard.on(this.onHJHeard);
    }
    blockSkillSwitch(data) {
        let skillName;
        let input;
        if (data && data.nlu) {
            skillName = data.nlu.entities.skill;
            input = data.asr.text;
            this.log.info('blockSkillSwitch() received HJ Command for skill ${skillName} with input ${input}');
        }
        if (this._onHJCommand) {
            this._onHJCommand(skillName, input);
            this._onHJCommand = null;
        }
        jibo.globalEvents.shared.nonInterruptingGlobal.emit();
    }
    blockHeadTouchOn() {
        if (this._onHeadTouch) {
            this._headTimer = setTimeout(() => {
                if (this._onHeadTouch) {
                    this._onHeadTouch('true');
                    this._onHeadTouch = null;
                }
            }, this.SECONDS_TO_HOLD_TOUCH * 1000);
        }
    }
    blockHeadTouchOff() {
        if (!this._fromOOBE && !this._onHeadTouch) {
            this.redirect("@be/idle", {});
        }
        if (this._headTimer) {
            clearTimeout(this._headTimer);
            this._headTimer = null;
        }
    }
    blockHeadTouch() {
    }
    disableHJ() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._hjModeToken) {
                return;
            }
            this._hjModeToken = jibo.jetstream.setHotwordMode(jibo.jetstream.types.HotwordListenMode.Disabled);
            yield this._hjModeToken.activated;
        });
    }
    releaseHJToken() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._hjModeToken) {
                const token = this._hjModeToken;
                this._hjModeToken = null;
                return token.release();
            }
        });
    }
}
module.exports = Tutorial;

},{"./Analytics":1,"./flows/main":2,"./photo/FaceFinder":22,"./photo/FaceSearcher":24,"./photo/FrameHelper":25,"./views/CameraView":26,"./views/FlashView":27,"./views/PhotoView":28,"@be/be-framework":undefined,"jibo":undefined}],22:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
const THREE = require("@jibo/three");
const FaceScore_1 = require("./FaceScore");
const FaceSearcher_1 = require("./FaceSearcher");
const FrameHelper_1 = require("./FrameHelper");
const GoalFinishedStatus = jibo.action.types.GoalFinishedStatus;
class FaceFinder {
    constructor() {
        this.safeZone = { left: 230, right: 1115, top: 100, bottom: 590 };
        this.onSearchResult = this.onSearchResult.bind(this);
        this._faceSearcher = new FaceSearcher_1.default();
        this.highScore = new FaceScore_1.default();
        this.highScore.peopleTotal = 1;
        this.highScore.peopleConfidenceTotal = .2;
        this.highScore.generateHeuristic();
        this.mediumScore = new FaceScore_1.default();
        this.mediumScore.peopleTotal = 1;
        this.mediumScore.peopleConfidenceTotal = 0;
        this.mediumScore.generateHeuristic();
        this.lowScore = new FaceScore_1.default();
        this.lowScore.faceDetectTotal = 1;
        this.lowScore.faceDetectConfidence = .2;
        this.lowScore.generateHeuristic();
    }
    get faceSearcher() {
        return this._faceSearcher;
    }
    destroy() {
        this.stopSearch();
    }
    reset(done) {
        this._searchResult = null;
        this._awaitingResult = false;
        this._resultCallback = null;
    }
    resetSearch(done) {
        FaceFinder.log.info('FaceFinder.resetSearch()');
        this._searchResult = null;
        this._awaitingResult = true;
        this._resultCallback = null;
        this.checkSearch(done);
    }
    checkSearch(done) {
        if (done) {
            if (this._awaitingResult) {
                FaceFinder.log.info('FaceFinder.checkSearch() is awaiting results');
                if (this._resultCallback) {
                    FaceFinder.log.info('FaceFinder.checkSearch() overiding previous callback: ' + this._resultCallback + ' with: ' + done);
                }
                this._resultCallback = done;
            }
            else {
                FaceFinder.log.info('FaceFinder.checkSearch() results are available: ' + this._searchResult);
                done(this._searchResult);
            }
        }
    }
    get isAwaitingResults() {
        return this._awaitingResult;
    }
    onSearchResult(result) {
        FaceFinder.log.info('onSearchResult() search result: ' + result);
        this._awaitingResult = false;
        this._searchResult = result;
        if (this._resultCallback) {
            this._resultCallback(result);
            this._resultCallback = null;
        }
    }
    checkForFaces(score = this.highScore) {
        this._awaitingResult = false;
        this._searchResult = score.checkForEqualBetter(new FaceScore_1.default(jibo.lps.motionData));
        return this._searchResult;
    }
    detectForFaces(done, score = this.lowScore) {
        this.resetSearch(done);
        jibo.lps.demandDetect(0, false, (err) => {
            if (err) {
                FaceFinder.log.info('FaceFinder.detectForFaces() encountered error from jibo.lps.demandDetect' + err);
                this.onSearchResult(false);
            }
            else {
                FaceFinder.log.info('FaceFinder.detectForFaces() completed');
                this.onSearchResult(score.checkForEqualBetter(new FaceScore_1.default(jibo.lps.motionData)));
            }
        });
    }
    searchForFaces(done) {
        this.resetSearch(done);
        jibo.action.addFindPersonGoal().events.finished.waitFor()
            .then(status => {
            if (status === GoalFinishedStatus.SUCCEEDED) {
                this.onSearchResult(true);
            }
            else {
                this.onSearchResult(false);
            }
        });
    }
    startSearch(done, minScore, duration = 0) {
        FaceFinder.log.info('FaceFinder.startSearch() minScore', minScore, ' duration', duration);
        this.resetSearch(done);
        this._faceSearcher.search(this.onSearchResult, minScore, duration);
    }
    checkBest(minScore = this.lowScore) {
        return this._faceSearcher.checkAgainstBest(minScore);
    }
    stopSearch(clearCallback = true) {
        this._faceSearcher.stopSearch(clearCallback);
    }
    findCenterFromFrame(done, cameraTracking = 0, cameraPhoto = 0, headHeightRatio = 0.5, fovSafeRegion = 0.9) {
        this.resetSearch(done);
        FaceFinder.log.info('FaceFinder.findCenterFromFrame() Starting a getFaces request to LPS');
        jibo.lps.getFaces(cameraTracking, (err, result) => {
            FaceFinder.log.info("FaceFinder.findCenterFromFrame() got a getFaces result" + (err ? (" ERR:" + err) : ""));
            if (result && result.details && result.details.length) {
                try {
                    FaceFinder.log.info('FaceFinder.findCenterFromFrame() getFaces found ' + result.details.length + ' faces');
                    let targetPositions = [];
                    let allDetails = result.details;
                    for (let i = 0; i < allDetails.length; i++) {
                        let aDetail = allDetails[i];
                        let origin = new THREE.Vector3().copy(aDetail.ray_origin);
                        let direction = new THREE.Vector3().copy(aDetail.ray_dir);
                        let distance = aDetail.range;
                        let position = origin.add(direction.setLength(distance));
                        targetPositions.push(position);
                    }
                    let lookAt = this.getCenterFromTargets(targetPositions, cameraTracking, cameraPhoto, headHeightRatio, fovSafeRegion);
                    this.onSearchResult(lookAt);
                }
                catch (err) {
                    FaceFinder.log.warn('FaceFinder.findCenterFromFrame() got error computing lookat:' + err);
                    this.onSearchResult(null);
                }
            }
            else {
                FaceFinder.log.info('FaceFinder.findCenterFromFrame() getFaces found NO faces');
                this.onSearchResult(null);
            }
        }, 'faces', false);
    }
    getCenterFromTargets(targetPositions, cameraTracking = 0, cameraPhoto = 0, headHeightRatio = 0.5, fovSafeRegion = 0.9) {
        if (!targetPositions || targetPositions.length === 0) {
            return null;
        }
        try {
            let cameraPosInFaceXY;
            if (cameraPhoto === 0) {
                cameraPosInFaceXY = [-0.041, 0.058];
            }
            else if (cameraPhoto === 1) {
                cameraPosInFaceXY = [0.041, 0.058];
            }
            else {
                FaceFinder.log.warn('FaceFinder.getCenterFromTargets() unknown camera id:' + cameraPhoto + ', using no offset');
                cameraPosInFaceXY = [0, 0];
            }
            let features = jibo.expression.features;
            let headFeature = features.head;
            let currentDirection = new THREE.Vector3().copy(headFeature.direction);
            let currentOrigin = new THREE.Vector3().copy(headFeature.position);
            let FoV = jibo.lps.motionData.cameras[cameraPhoto].fov;
            let fovX = FoV.x * fovSafeRegion;
            let fovY = FoV.y * fovSafeRegion;
            let lookAt = FrameHelper_1.default.getFramingTarget(fovX, fovY, headHeightRatio, targetPositions, currentDirection, currentOrigin, cameraPosInFaceXY[0], cameraPosInFaceXY[1]);
            if (lookAt) {
                FaceFinder.log.debug("FaceFinder.getCenterFromTargets() generated look-at target " + JSON.stringify(lookAt)
                    + " from face locations " + JSON.stringify(targetPositions)
                    + " using tracking camera " + cameraTracking + ", photo camera " + cameraPhoto + ","
                    + " headHeightRatio " + headHeightRatio + ", fovSafeRegion " + fovSafeRegion + ","
                    + " current position " + JSON.stringify(currentOrigin) + ", direction " + JSON.stringify(currentDirection) + ","
                    + " and camera data " + JSON.stringify(jibo.lps.motionData.cameras));
            }
            return lookAt;
        }
        catch (err) {
            FaceFinder.log.warn('FaceFinder.getCenterFromTargets() Got error computing lookat:' + err);
            return null;
        }
    }
    getTargetsFromMotionData(motionData, includeFaceDetects = true, requiredConfidence = 0) {
        let targetPositions = [];
        if (motionData.entities && motionData.entities.length) {
            let inFOV;
            let part;
            for (let entity of motionData.entities) {
                if (entity.description === 'person') {
                    inFOV = true;
                    if (entity.parts.length > 0) {
                        part = entity.parts[0];
                        if (part.value.trackers.length > requiredConfidence) {
                            inFOV = part.value.trackers[0].inFOV;
                        }
                    }
                    if (inFOV && entity.confidence >= 0) {
                        targetPositions.push(new THREE.Vector3().copy(entity.position));
                    }
                }
            }
            FaceFinder.log.debug('FaceFinder.getBestTargets() found ' + targetPositions.length + ' valid faces out of ' + motionData.entities.length + ' faces from current LPS');
        }
        if (includeFaceDetects) {
            if (motionData.detections && motionData.detections.length) {
                for (let detection of motionData.detections) {
                    if (detection.kind === 'face') {
                        if (detection.confidence >= requiredConfidence) {
                            targetPositions.push(new THREE.Vector3().copy(detection.position));
                        }
                    }
                }
            }
        }
        return targetPositions;
    }
    get screenLookAt() {
        const features = jibo.expression.features;
        const screenInfo = features.head;
        const screenPosition = screenInfo.position;
        const screenDirection = screenInfo.direction;
        const lookAt = screenDirection
            .clone()
            .normalize()
            .add(screenPosition);
        return lookAt;
    }
}
FaceFinder.log = null;
module.exports = FaceFinder;

},{"./FaceScore":23,"./FaceSearcher":24,"./FrameHelper":25,"@jibo/three":undefined,"jibo":undefined}],23:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class FaceScore {
    constructor(motionData) {
        this.peopleTotal = 0;
        this.peopleConfidenceTotal = 0;
        this.faceDetectTotal = 0;
        this.faceDetectConfidence = 0;
        this.entityTotal = 0;
        this.detectionTotal = 0;
        this._heuristicScore = 0;
        if (motionData) {
            this.createScore(motionData);
        }
    }
    get heuristicScore() {
        return this._heuristicScore;
    }
    static createScoreManual(totalPeople = 0, personConfidence = 0, totalFaceDetect = 0, faceDetectConfidence = 0) {
        const score = new FaceScore();
        score.peopleTotal = totalPeople;
        score.peopleConfidenceTotal = personConfidence;
        score.faceDetectTotal = totalFaceDetect;
        score.faceDetectConfidence = faceDetectConfidence;
        score.generateHeuristic();
        return score;
    }
    reset() {
        this.motionData = null;
        this.peopleTotal = 0;
        this.peopleConfidenceTotal = 0;
        this.faceDetectTotal = 0;
        this.faceDetectConfidence = 0;
        this.entityTotal = 0;
        this.detectionTotal = 0;
        this._heuristicScore = 0;
    }
    applyScore(score) {
        this.motionData = score.motionData;
        this.peopleTotal = score.peopleTotal;
        this.peopleConfidenceTotal = score.peopleConfidenceTotal;
        this.faceDetectTotal = score.faceDetectTotal;
        this.faceDetectConfidence = score.faceDetectConfidence;
        this.entityTotal = score.entityTotal;
        this.detectionTotal = score.detectionTotal;
        this.generateHeuristic();
    }
    createScore(motionData) {
        this.reset();
        this.motionData = motionData;
        if (motionData.entities && motionData.entities.length) {
            for (let entity of motionData.entities) {
                if (entity.in_fov) {
                    if (entity.description == 'person') {
                        this.peopleTotal++;
                        this.peopleConfidenceTotal += entity.confidence;
                    }
                    this.entityTotal++;
                }
            }
        }
        if (motionData.detections && motionData.detections.length) {
            for (let detection of motionData.detections) {
                if (detection.kind == 'face') {
                    this.faceDetectTotal++;
                    this.faceDetectConfidence += detection.confidence;
                }
                this.detectionTotal++;
            }
        }
        this.generateHeuristic();
    }
    checkForBetter(score, useHeuristicScore = false) {
        if (useHeuristicScore) {
            return score.heuristicScore > this.heuristicScore;
        }
        else {
            if (score.peopleTotal > 0) {
                if (score.peopleTotal > this.peopleTotal) {
                    return true;
                }
                else if (score.peopleTotal === this.peopleTotal) {
                    if (score.peopleConfidenceTotal > this.peopleConfidenceTotal) {
                        return true;
                    }
                }
            }
            else if (this.peopleTotal === 0) {
                if (score.faceDetectTotal && score.faceDetectTotal !== this.faceDetectTotal) {
                    if (score.faceDetectTotal > this.faceDetectTotal) {
                        return true;
                    }
                    else if (score.faceDetectTotal === this.faceDetectTotal) {
                        if (score.faceDetectConfidence > this.faceDetectConfidence) {
                            return true;
                        }
                    }
                }
                else if (score.entityTotal && score.entityTotal !== this.entityTotal) {
                    if (score.entityTotal > this.entityTotal) {
                        return true;
                    }
                }
                else if (score.detectionTotal && score.detectionTotal !== this.detectionTotal) {
                    if (score.detectionTotal > this.detectionTotal) {
                        return true;
                    }
                }
            }
            return false;
        }
    }
    checkForEqualBetter(score, useHeuristicScore = false) {
        if (useHeuristicScore) {
            return score.heuristicScore >= this.heuristicScore;
        }
        else {
            if (score.peopleTotal > 0) {
                if (score.peopleTotal > this.peopleTotal) {
                    return true;
                }
                else if (score.peopleTotal === this.peopleTotal) {
                    if (score.peopleConfidenceTotal >= this.peopleConfidenceTotal) {
                        return true;
                    }
                }
            }
            else if (this.peopleTotal === 0) {
                if (score.faceDetectTotal > 0) {
                    if (score.faceDetectTotal > this.faceDetectTotal) {
                        return true;
                    }
                    else if (score.faceDetectTotal === this.faceDetectTotal) {
                        if (score.faceDetectConfidence >= this.faceDetectConfidence) {
                            return true;
                        }
                    }
                }
                else if (this.faceDetectTotal === 0) {
                    if (score.entityTotal && score.entityTotal >= this.entityTotal) {
                        return true;
                    }
                    else if (score.detectionTotal && score.detectionTotal >= this.detectionTotal) {
                        return true;
                    }
                }
            }
            return false;
        }
    }
    toString() {
        let str = '\n';
        str += 'People: ' + this.peopleTotal + '\n';
        str += 'Confidence: : ' + this.peopleConfidenceTotal + '\n';
        str += 'Entities: ' + this.entityTotal + '\n';
        str += 'Face Detections: ' + this.faceDetectTotal + '\n';
        str += 'Detections: ' + this.detectionTotal + '\n';
        str += 'Heuristic Score: ' + this.heuristicScore + '\n';
        return str;
    }
    toStringCompare(score) {
        let str = '\n';
        str += 'People: ' + this.peopleTotal + ' vs ' + score.peopleTotal + '\n';
        str += 'Confidence: : ' + this.peopleConfidenceTotal + ' vs ' + score.peopleConfidenceTotal + '\n';
        str += 'Entities: ' + this.entityTotal + ' vs ' + score.entityTotal + '\n';
        str += 'Face Detections: ' + this.faceDetectTotal + ' vs ' + score.faceDetectTotal + '\n';
        str += 'Detections: ' + this.detectionTotal + ' vs ' + score.detectionTotal + '\n';
        str += 'Heuristic Score: ' + this.heuristicScore + '\n';
        return str;
    }
    generateHeuristic() {
        this._heuristicScore = this.peopleTotal + this.faceDetectTotal + (this.peopleConfidenceTotal * .5) + (this.faceDetectConfidence * .5);
    }
}
FaceScore.log = null;
exports.default = FaceScore;

},{}],24:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
const FaceScore_1 = require("./FaceScore");
const GoalFinishedStatus = jibo.action.types.GoalFinishedStatus;
require('./FaceScore');
class FaceSearcher {
    constructor() {
        this.DEFAULT_DURATION = 6000;
        this.onMotion = this.onMotion.bind(this);
        this._nextScore = new FaceScore_1.default();
    }
    set minScore(score) {
        this._minScore = score;
        this._minScore.generateHeuristic();
    }
    get bestScore() {
        return this._bestScore;
    }
    reset() {
        this._callback = null;
        this._minScore = null;
        this._bestScore = null;
        clearTimeout(this._searchTimer);
        this._searchTimer = null;
        jibo.lps.events.motion.removeListener(this.onMotion);
    }
    search(done, minScore, duration = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            this.reset();
            this._callback = done;
            this._minScore = minScore;
            if (this._minScore) {
                this._minScore.generateHeuristic();
            }
            if (duration > 0) {
                this.setupTimer(duration);
            }
            this._bestScore = new FaceScore_1.default();
            jibo.lps.events.motion.on(this.onMotion);
        });
    }
    stopSearch(clearCallback = true) {
        if (clearCallback) {
            this._callback = null;
        }
        this.searchComplete(false);
    }
    checkAgainstBest(minScore) {
        if (minScore) {
            minScore.generateHeuristic();
            if (this._bestScore && minScore) {
                return minScore.checkForEqualBetter(this._bestScore);
            }
        }
        return false;
    }
    onMotion(data) {
        this._nextScore.createScore(jibo.lps.motionData);
        if (this._bestScore.checkForEqualBetter(this._nextScore)) {
            this._bestScore.applyScore(this._nextScore);
            this.checkAgainstMin();
        }
    }
    checkAgainstMin() {
        if (this._minScore && this._minScore.checkForEqualBetter(this._bestScore)) {
            this.searchComplete(true, false);
        }
    }
    searchComplete(found, stopSearch = true) {
        FaceSearcher.log.debug('searchComplete() with result: ' + found + ', will stop search:' + stopSearch);
        clearTimeout(this._searchTimer);
        this._searchTimer = null;
        if (stopSearch) {
            jibo.lps.events.motion.removeListener(this.onMotion);
        }
        if (this._callback) {
            this._callback(found);
            this._callback = null;
        }
    }
    setupTimer(duration) {
        this._searchTimer = setTimeout(() => {
            FaceSearcher.log.debug('timed out');
            this.searchComplete(false);
            return;
        }, duration);
    }
}
FaceSearcher.log = null;
exports.default = FaceSearcher;

},{"./FaceScore":23,"jibo":undefined}],25:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const THREE = require("@jibo/three");
class FrameHelper {
    static computeLocalBases(currentOrientationDir) {
        let worldUp = new THREE.Vector3(0, 0, 1);
        let localLeft = worldUp.cross(currentOrientationDir);
        worldUp = null;
        if (localLeft.lengthSq() < 0.0001) {
            FrameHelper.log.debug("Singularity error computing look target, forwardDir = (" + currentOrientationDir.x + ", " + currentOrientationDir.y + ", " + currentOrientationDir.z + ")");
            return null;
        }
        localLeft.normalize();
        let localUp = currentOrientationDir.clone().cross(localLeft).normalize();
        return [localLeft, localUp];
    }
    static convertToSortedXYAngles(fovX, fovY, localLeft, localUp, targetDirs, forward) {
        let targetsXY = [];
        for (let i = 0; i < targetDirs.length; i++) {
            let targetDir = targetDirs[i];
            let targetOnHorizontalPlane = targetDir.clone().projectOnPlane(localUp);
            let xAngle = forward.angleTo(targetOnHorizontalPlane);
            if (targetOnHorizontalPlane.dot(localLeft) < 0) {
                xAngle = -xAngle;
            }
            let targetOnVerticalPlane = targetDir.clone().projectOnPlane(localLeft);
            let yAngle = forward.angleTo(targetOnVerticalPlane);
            if (targetOnVerticalPlane.dot(localUp) < 0) {
                yAngle = -yAngle;
            }
            targetsXY.push([
                xAngle, yAngle
            ]);
        }
        let angleDistanceFromCenter = function (xAngle, yAngle, fovXRadius, fovYRadius) {
            let xRatioDistanceFromCenter = xAngle / fovXRadius;
            let yRatioDistanceFromCenter = yAngle / fovYRadius;
            return Math.sqrt(xRatioDistanceFromCenter * xRatioDistanceFromCenter + yRatioDistanceFromCenter * yRatioDistanceFromCenter);
        };
        let fovXRadius = fovX / 2;
        let fovYRadius = fovY / 2;
        targetsXY.sort((a, b) => {
            return angleDistanceFromCenter(a[0], a[1], fovXRadius, fovYRadius) - angleDistanceFromCenter(b[0], b[1], fovXRadius, fovYRadius);
        });
        return targetsXY;
    }
    static filterTargetListToFOVPossible(fovX, fovY, targetsXY) {
        let canBeFramed = function (targetsXY, fov) {
            let min = [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY];
            let max = [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY];
            let countOfTargetsWhichFit = 0;
            for (let i = 0; i < targetsXY.length; i++) {
                let iFits = true;
                for (let j = 0; j < 2; j++) {
                    let t = targetsXY[i];
                    if (t[j] < min[j]) {
                        min[j] = t[j];
                    }
                    if (t[j] > max[j]) {
                        max[j] = t[j];
                    }
                    if (max[j] - min[j] > fov[j]) {
                        iFits = false;
                    }
                }
                if (iFits) {
                    countOfTargetsWhichFit = i + 1;
                }
                else {
                    break;
                }
            }
            return countOfTargetsWhichFit;
        };
        let numCanBeFramed = canBeFramed(targetsXY, [fovX, fovY]);
        if (numCanBeFramed < targetsXY.length) {
            targetsXY.splice(numCanBeFramed, targetsXY.length - numCanBeFramed);
        }
        return targetsXY;
    }
    static getFramingXY(fovX, fovY, targetsXY, headHeightRatio) {
        let min = [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY];
        let max = [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY];
        for (let i = 0; i < targetsXY.length; i++) {
            for (let j = 0; j < 2; j++) {
                let t = targetsXY[i];
                if (t[j] < min[j]) {
                    min[j] = t[j];
                }
                if (t[j] > max[j]) {
                    max[j] = t[j];
                }
            }
        }
        let framingX = (max[0] + min[0]) / 2;
        let fovYRadius = fovY / 2;
        let useHeadAngleFromBottom = fovY * headHeightRatio;
        if (useHeadAngleFromBottom < max[1] - min[1]) {
            useHeadAngleFromBottom = max[1] - min[1];
        }
        let yAngleAboveCenter = useHeadAngleFromBottom - fovYRadius;
        let framingY = max[1] - yAngleAboveCenter;
        return [framingX, framingY];
    }
    static getFramingTarget(fovX, fovY, headHeightRatio, targetPositions, currentOrientationDir, currentOrientationOrigin, cameraLocalLeft, cameraLocalUp) {
        let basesDir = this.computeLocalBases(currentOrientationDir);
        if (basesDir === null) {
            return null;
        }
        let localLeft = basesDir[0];
        let localUp = basesDir[1];
        let targetDirs = [];
        for (var i = 0; i < targetPositions.length; i++) {
            var t = targetPositions[i];
            t = t.clone().sub(localUp.clone().setLength(cameraLocalUp));
            t = t.sub(localLeft.clone().setLength(cameraLocalLeft));
            targetDirs.push(t.clone().sub(currentOrientationOrigin).normalize());
        }
        let targetsXY = this.convertToSortedXYAngles(fovX, fovY, localLeft, localUp, targetDirs, currentOrientationDir);
        targetsXY = this.filterTargetListToFOVPossible(fovX, fovY, targetsXY);
        FrameHelper.log.debug("getFramingTarget() chose to frame " + targetsXY.length + " faces out of " + targetPositions.length + " provided");
        if (targetsXY.length > 0) {
            let xyAngles = this.getFramingXY(fovX, fovY, targetsXY, headHeightRatio);
            let xProj = Math.sin(xyAngles[0]);
            let yProj = Math.sin(xyAngles[1]);
            let dirVec = localLeft.clone().multiplyScalar(xProj);
            dirVec.add(localUp.clone().multiplyScalar(yProj));
            let zProj = Math.sqrt(1 - xProj * xProj - yProj * yProj);
            dirVec.add(currentOrientationDir.clone().multiplyScalar(zProj));
            let targetPos = currentOrientationOrigin.clone().add(dirVec.multiplyScalar(2));
            return targetPos;
        }
        else {
            return null;
        }
    }
}
FrameHelper.log = null;
exports.default = FrameHelper;

},{"@jibo/three":undefined}],26:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
class CameraView extends jibo.rendering.gui.views.View {
    constructor() {
        super();
        this._lensZoomed = false;
        this._type = CameraView.DEFAULT_TYPE;
        this.id = 'cameraView';
        this.transitionStageOnly = true;
        this.closeOnSwipeDown = false;
        this._category = jibo.face.views.CATEGORY.DISPLAY;
        this.addTransition(jibo.rendering.gui.views.EyeView.DEFAULT_TYPE, true, this.openFromEye, jibo.face.views.TRANSITION.NONE);
        this.lensSearch = this.lensSearch.bind(this);
        this.startLensSearch = this.startLensSearch.bind(this);
    }
    static get DEFAULT_TYPE() { return 'CameraView'; }
    ready() {
        this._cameraClip.movieClip.gotoAndStop('open_stop');
        let clip = this._cameraClip.movieClip;
        this._corners = clip['corners'];
        this._ring = clip['ring'];
        this._body = clip['body'];
        this._light = this._body['light'];
        this._lens = clip['lens'];
        this._lensRing = this._lens['lensCase']['ring'];
        this._iris = this._lens['lensFront']['iris'];
        this._body.gotoAndStop('open_stop');
        this._lens.gotoAndStop('open_stop');
        this._ring.gotoAndStop('open_stop');
        this.setLight('black');
        clip.visible = true;
        clip.alpha = 1;
        this._ring.visible = false;
        this._ring.alpha = 1;
        this._body.visible = true;
        this._body.alpha = 1;
        this._lens.visible = true;
        this._lens.alpha = 1;
        this._corners.visible = false;
        this._corners.alpha = 1;
        super.ready();
    }
    applyData() {
        this.addAssetDescriptorObject({
            id: 'camera-sfx',
            type: 'sound',
            src: 'audio/camera-open.m4a'
        });
        this._cameraClip = new jibo.rendering.gui.components.Clip();
        this._cameraClip.addAssetDescriptorObject({
            id: 'camera',
            type: 'timeline',
            src: 'assets/camera/camera.js',
            upload: true
        });
        this.addComponent(this._cameraClip, 'cameraClip');
        super.applyData();
    }
    openFromEye(callback) {
        this._cameraClip.display.visible = false;
        const eye = jibo.face.eye;
        this._stage.addChild(eye);
        eye.active = false;
        eye.visible = true;
        const duration = 550 * .7;
        super.transitionFadeOutTo(() => {
            this._stage.removeChild(eye);
            eye.active = false;
            let action = new jibo.rendering.gui.actions.ActionData('sound', { id: 'camera-sfx' });
            this._inputLocked = false;
            super.actionHandler(action);
            this._inputLocked = true;
            this._ring.visible = true;
            PIXI.animate.Animator.play(this._body, 'open');
            PIXI.animate.Animator.play(this._lens, 'open');
            PIXI.animate.Animator.play(this._ring, 'open');
            this._cameraClip.display.visible = true;
            callback();
        }, 1.1, .8, .6, duration);
    }
    destroy() {
        this._lensZoomed = false;
        if (this._timer) {
            this._timer.destroy();
            this._timer = null;
        }
        if (this._body) {
            jibo.rendering.tween.TweenManager.stop(this._body);
            this._body = null;
        }
        if (this._lens) {
            jibo.rendering.tween.TweenManager.stop(this._lens);
            this._lens = null;
        }
        if (this._lensRing) {
            jibo.rendering.tween.TweenManager.stop(this._lensRing);
            this._lensRing = null;
        }
        if (this._iris) {
            jibo.rendering.tween.TweenManager.stop(this._iris);
            this._iris = null;
        }
        if (this._corners) {
            jibo.rendering.tween.TweenManager.stop(this._corners);
            this._corners = null;
        }
        this._cameraClip = null;
        this._light = null;
        this._ring = null;
        this._corners = null;
        this._lensPosition = null;
        this._bodyPosition = null;
        super.destroy();
    }
    storeDefaultValues() {
        this._lensScale = this._lens.scale.x;
        this._bodyScale = this._body.scale.x;
        this._irisScale = this._iris.scale.x;
        this._lensPosition = new PIXI.Point(this._lens.x, this._lens.y);
        this._bodyPosition = new PIXI.Point(this._body.x, this._body.y);
        this._ring.visible = false;
    }
    expandToLens(callback, duration = 600) {
        this._lensZoomed = true;
        this.setLight('red');
        let centerX = jibo.face.width * .5;
        let centerY = jibo.face.height * .55;
        const bodyScale = this._bodyScale * .96;
        jibo.rendering.tween.TweenManager.stop(this._body);
        jibo.rendering.tween.TweenManager.play(this._body, {
            to: {
                'scale.x': bodyScale,
                'scale.y': bodyScale,
            },
            duration: duration,
            ease: 'backOut'
        });
        const lensScale = this._lensScale * CameraView.MAX_LENS_SCALE;
        jibo.rendering.tween.TweenManager.stop(this._lens);
        jibo.rendering.tween.TweenManager.play(this._lens, {
            to: {
                'scale.x': lensScale,
                'scale.y': lensScale,
                'x': centerX,
                'y': centerY
            },
            duration: duration,
            ease: 'backOut'
        }, () => {
            this.startLensSearch();
            if (callback) {
                callback();
            }
        });
        const irisScale = this._irisScale * CameraView.MAX_IRIS_SCALE;
        jibo.rendering.tween.TweenManager.stop(this._iris);
        jibo.rendering.tween.TweenManager.play(this._iris, {
            to: {
                'scale.x': irisScale,
                'scale.y': irisScale
            },
            duration: duration,
            ease: 'backOut'
        });
        jibo.rendering.tween.TweenManager.stop(this._lensRing);
        jibo.rendering.tween.TweenManager.play(this._lensRing, {
            to: {
                rotation: Math.PI / 4
            },
            duration: duration,
            ease: 'backOut'
        });
    }
    shrinkLens(callback, duration = 500) {
        if (this._lensZoomed) {
            this.registerUpdate(false);
            this._lensZoomed = false;
            if (this._timer) {
                this._timer.destroy();
                this._timer = null;
            }
            jibo.rendering.tween.TweenManager.stop(this._body);
            jibo.rendering.tween.TweenManager.play(this._body, {
                to: {
                    'scale.x': this._bodyScale,
                    'scale.y': this._bodyScale,
                    'x': this._lensPosition.x,
                    'y': this._lensPosition.y
                },
                duration: duration,
                ease: 'backIn'
            });
            jibo.rendering.tween.TweenManager.stop(this._lens);
            jibo.rendering.tween.TweenManager.play(this._lens, {
                to: {
                    'scale.x': this._lensScale,
                    'scale.y': this._lensScale,
                    'x': this._lensPosition.x,
                    'y': this._lensPosition.y
                },
                duration: duration,
                ease: 'backIn'
            }, callback);
            jibo.rendering.tween.TweenManager.stop(this._iris);
            jibo.rendering.tween.TweenManager.play(this._iris, {
                to: {
                    'scale.x': this._irisScale,
                    'scale.y': this._irisScale
                },
                duration: duration,
                ease: 'backIn'
            });
            jibo.rendering.tween.TweenManager.stop(this._lensRing);
            jibo.rendering.tween.TweenManager.play(this._lensRing, {
                to: {
                    rotation: 0
                },
                duration: duration,
                ease: 'backIn'
            });
        }
    }
    showCorners(callback) {
        this.setLight('green');
        this._corners.visible = true;
        this._corners.alpha = 0;
        const cornerDuration = 300;
        jibo.rendering.tween.TweenManager.play(this._corners, {
            to: {
                'scale.x': 1,
                'scale.y': 1,
            },
            from: {
                'scale.x': 1.2,
                'scale.y': 1.2,
            },
            duration: cornerDuration,
            ease: 'backOut'
        });
        jibo.rendering.tween.TweenManager.play(this._corners, {
            to: {
                'alpha': 1,
            },
            duration: cornerDuration,
            ease: 'sineOut'
        }, callback);
    }
    hideCorners(callback) {
        if (this._corners.visible) {
            let cornerDuration = 300;
            jibo.rendering.tween.TweenManager.play(this._corners, {
                to: {
                    'scale.x': 1.2,
                    'scale.y': 1.2,
                },
                duration: cornerDuration,
                ease: 'backIn'
            }, () => {
                this._corners.visible = false;
            });
            jibo.rendering.tween.TweenManager.play(this._corners, {
                to: {
                    'alpha': 0,
                },
                duration: cornerDuration,
                ease: 'sineOut'
            }, callback);
        }
        else if (callback) {
            callback();
        }
    }
    setLight(color) {
        if (this._light) {
            switch (color) {
                case 'red': { }
                case 'green': { }
                case 'black': {
                    this._light.gotoAndStop(color);
                    break;
                }
                default: {
                    this._light.gotoAndStop('black');
                }
            }
        }
    }
    startLensSearch() {
        const lapse = 500 + Math.random() * 400;
        if (this._timer) {
            this._timer.destroy();
        }
        this._timer = jibo.timer.setTimeout(this.lensSearch, lapse);
    }
    lensSearch() {
        if (this._lensZoomed) {
            let centerX = jibo.face.width * .5;
            let centerY = jibo.face.height * .5;
            let seed = Math.sqrt(Math.random());
            let radians = 2 * Math.PI * Math.random();
            let targetX = centerX + seed * CameraView.MAX_RADIUS_X * Math.cos(radians);
            let targetY = centerY + seed * CameraView.MAX_RADIUS_Y * Math.sin(radians);
            let moveDistance = Math.abs(this.getDistance(this._lens.x, this._lens.y, targetX, targetY));
            let centerDistance = Math.abs(this.getDistance(centerX, centerY, targetX, targetY));
            let duration = CameraView.MIN_DURATION + CameraView.MAX_DURATION * (moveDistance / (CameraView.MAX_RADIUS_X * 2));
            let distanceDelta = centerDistance / CameraView.MAX_RADIUS_X;
            let lensScale = this._lensScale * (CameraView.MAX_LENS_SCALE - distanceDelta * .2);
            let irisScale = this._irisScale * (CameraView.MAX_IRIS_SCALE - distanceDelta * .4);
            let rotationDelta = lensScale - this._lens.scale.x;
            let rotation = rotationDelta * CameraView.MAX_ROTATION;
            jibo.rendering.tween.TweenManager.stop(this._lens);
            jibo.rendering.tween.TweenManager.play(this._lens, {
                to: {
                    'scale.x': lensScale,
                    'scale.y': lensScale,
                    x: targetX,
                    y: targetY
                },
                duration: duration,
                ease: 'backInOut'
            }, this.startLensSearch);
            jibo.rendering.tween.TweenManager.stop(this._body);
            jibo.rendering.tween.TweenManager.play(this._body, {
                to: {
                    x: targetX,
                    y: targetY
                },
                duration: duration,
                ease: 'backInOut'
            });
            jibo.rendering.tween.TweenManager.stop(this._iris);
            jibo.rendering.tween.TweenManager.play(this._iris, {
                to: {
                    'scale.x': irisScale,
                    'scale.y': irisScale
                },
                duration: duration,
                ease: 'backInOut'
            });
            jibo.rendering.tween.TweenManager.stop(this._lensRing);
            jibo.rendering.tween.TweenManager.play(this._lensRing, {
                to: {
                    rotation: rotation
                },
                duration: duration,
                ease: 'backInOut'
            });
        }
    }
    getDistance(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
    }
}
CameraView.log = null;
CameraView.MAX_RADIUS_X = 120;
CameraView.MAX_RADIUS_Y = 60;
CameraView.MIN_DURATION = 200;
CameraView.MAX_DURATION = 1200;
CameraView.MAX_ROTATION = Math.PI / 2;
CameraView.MAX_LENS_SCALE = 1.4;
CameraView.MAX_IRIS_SCALE = 1.6;
exports.default = CameraView;

},{"jibo":undefined}],27:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
class FlashView extends jibo.rendering.gui.views.View {
    constructor() {
        super();
        this._type = FlashView.DEFAULT_TYPE;
        this.id = 'flashView';
        this.transitionStageOnly = true;
        this.closeOnSwipeDown = false;
        this._category = jibo.face.views.CATEGORY_DISPLAY;
    }
    static get DEFAULT_TYPE() { return 'FlashView'; }
    flashWhite(done) {
        jibo.rendering.tween.TweenManager.play(this._whiteClip.display, {
            to: { alpha: 0 },
            duration: 500,
            ease: 'sineOut'
        }, () => {
            if (done) {
                done();
            }
        });
    }
    startLoader() {
        this._loaderClip.movieClip.play();
    }
    applyData() {
        this._loaderClip = new jibo.rendering.gui.components.Clip();
        this._loaderClip.addAssetDescriptorObject({
            id: 'loader',
            type: 'timeline',
            src: 'core://resources/buttons/loader.js'
        });
        this._loaderClip.setTargetPosition(jibo.face.width / 2, jibo.face.height / 2);
        super.addComponent(this._loaderClip, 'loader');
        super.applyData();
    }
    ready() {
        this.addWhite();
        this._loaderClip.movieClip.stop();
        super.ready();
    }
    addWhite() {
        let graphics = new PIXI.Graphics();
        graphics.beginFill(0xFFFFFF);
        graphics.drawRect(0, 0, jibo.face.width, jibo.face.height);
        graphics.endFill();
        this._whiteClip = super.addComponent(jibo.rendering.gui.components.Clip.createFromDisplayObject(graphics, this.stage), 'whiteClip');
    }
}
FlashView.log = null;
exports.default = FlashView;

},{"jibo":undefined}],28:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
class PhotoView extends jibo.rendering.gui.views.View {
    constructor() {
        super();
        this._type = PhotoView.DEFAULT_TYPE;
        this.id = 'photoView';
        this.transitionStageOnly = true;
        this.closeOnSwipeDown = false;
        this._category = jibo.face.views.CATEGORY_DISPLAY;
    }
    static get DEFAULT_TYPE() { return 'PhotoView'; }
    applyData() {
        this.addAssetDescriptorObject({
            id: 'save-sfx',
            type: 'sound',
            src: 'audio/save.m4a'
        });
        this.addAssetDescriptorObject({
            id: 'delete-sfx',
            type: 'sound',
            src: 'audio/delete.m4a'
        });
        this._choiceBtn = new jibo.rendering.gui.components.MenuButton();
        this._choiceBtn.addAssetDescriptorObject({
            id: 'ok',
            type: 'texture',
            src: 'core://resources/actionIcons/ok.png',
            cache: 'global-gui'
        });
        this._choiceBtn.addAssetDescriptorObject({
            id: 'delete',
            type: 'texture',
            src: 'core://resources/actionIcons/delete.png',
            cache: 'global-gui'
        });
        this._choiceBtn.interactable = false;
        this._choiceBtn.applyButtonType(jibo.rendering.gui.components.MenuButton.ACTION);
        this.addComponent(this._choiceBtn, 'choiceBtn');
        super.applyData();
    }
    ready() {
        this._choiceBtn.display.visible = false;
        super.ready();
    }
    addPhoto(photoSrc) {
        let image = new Image();
        image.src = photoSrc;
        let bt = new PIXI.BaseTexture(image);
        let tex = new PIXI.Texture(bt);
        let sprite = new PIXI.Sprite(tex);
        if (!this._photoClip) {
            jibo.rendering.gui.components.Clip.createFromDisplayObject(sprite);
            this.stage.addChildAt(sprite, 0);
        }
        else {
            this._photoClip.display.removeChildren();
            this._photoClip.display.addChild(sprite);
        }
    }
    addPhotoToLoad(url) {
        this.addAssetDescriptorObject({
            id: 'photoImage',
            type: 'texture',
            src: url
        });
    }
    displayPhoto() {
        let sprite = new PIXI.Sprite(this.assets['photoImage']);
        if (!this._photoClip) {
            jibo.rendering.gui.components.Clip.createFromDisplayObject(sprite);
            this.stage.addChildAt(sprite, 0);
        }
        else {
            this._photoClip.display.removeChildren();
            this._photoClip.display.addChild(sprite);
        }
    }
    showChoice(save, done) {
        let action = new jibo.rendering.gui.actions.ActionData('sound', { id: '' });
        if (save) {
            this._choiceBtn.setIcon(new PIXI.Sprite(this.assets['ok']));
            this._choiceBtn.colors = 'confirm';
            action.data.id = 'save-sfx';
        }
        else {
            this._choiceBtn.setIcon(new PIXI.Sprite(this.assets['delete']));
            this._choiceBtn.colors = 'cancel';
            action.data.id = 'delete-sfx';
        }
        let choiceDisplay = this._choiceBtn.display;
        let btnDisplay = this._choiceBtn.buttonDisplay;
        this._choiceBtn.setTargetPosition(jibo.face.width / 2 - choiceDisplay.width / 2, jibo.face.height / 2 - choiceDisplay.height / 2, true);
        choiceDisplay.visible = true;
        this.stage.setChildIndex(choiceDisplay, this.stage.children.length - 1);
        this._inputLocked = false;
        super.actionHandler(action);
        this._inputLocked = true;
        jibo.rendering.tween.TweenManager.play(btnDisplay, {
            to: {
                'scale.x': 1,
                'scale.y': 1
            },
            from: {
                'scale.x': 0,
                'scale.y': 0
            },
            duration: 750,
            ease: 'backOut'
        }, () => {
            if (done) {
                done();
            }
        });
        jibo.rendering.tween.TweenManager.play(btnDisplay, {
            to: { alpha: 1 },
            from: { alpha: 0 },
            duration: 500,
            ease: 'sineIn'
        });
    }
}
PhotoView.log = null;
exports.default = PhotoView;

},{"jibo":undefined}]},{},[21])(21)
});
//# sourceMappingURL=index.js.map