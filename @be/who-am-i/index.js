(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.bewhoAmI = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
class FlowClass {
    constructor(log) {
        this.log = log;
        this.convTechLog = this.log.createChild('ConvTechSpeakerID');
        this.guessedIDState = null;
        this.sortLoopListOverride = this.sortLoopListOverride.bind(this);
    }
    setGuessedIDState(state) {
        this.guessedIDState = state;
    }
    setLoopMember(looper) {
        return __awaiter(this, void 0, void 0, function* () {
            this.loopMember = yield jibo.kb.loop.getUserNodeById(looper);
            this.log.debug(`set loopMember: ${looper}`);
        });
    }
    setLoopOwner() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let node = yield jibo.kb.loop.loadRoot();
                let ownerID = node.getEdges('owner')[0];
                this.loopOwner = yield jibo.kb.loop.getUserNodeById(ownerID);
                this.log.debug(`got owner: ${ownerID}`);
            }
            catch (err) {
                this.log.error('Error querying the KB:', err);
            }
        });
    }
    showLooperCoin() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.log.info(`showLooperCoin`);
                let view = jibo.face.views.createView('HypothesisView');
                view.sortLoopList = (loop) => {
                    let currentLooper = [];
                    for (let looper of loop) {
                        if (looper.id === this.loopMember.id) {
                            currentLooper.push(looper);
                            this.log.debug(`looper: ${looper.id}`);
                        }
                    }
                    return currentLooper;
                };
                const addViewOptions = {
                    addView: view,
                    remove: true,
                    transitionOpen: jibo.face.views.IN,
                    transitionClose: jibo.face.views.OUT
                };
                const onViewComplete = (view) => {
                    view.list.getComponentByIndex(0).lockInput(true);
                    resolve();
                };
                const onViewLoaded = (view) => {
                    view.id = 'looperCoin';
                    const COIN_SIZE = 500;
                    const CONTACT_BUTTON_SIZE = 330;
                    const BUTTON_OFFSET = (COIN_SIZE - CONTACT_BUTTON_SIZE) / 2;
                    let button = view.list.getComponentByIndex(0);
                    button.display.width = button.display.height = COIN_SIZE;
                    button.display.x -= BUTTON_OFFSET;
                    button.display.y -= BUTTON_OFFSET;
                    let label = view.getComponentById('buttonLabel0');
                    label.display.y += 93;
                    label.text += '?';
                };
                const onViewFailure = (err) => {
                    reject(err);
                };
                view.addAction('mimEnd', null, false, false, jibo.face.views.SWIPE);
                jibo.face.views.changeView(addViewOptions, onViewComplete, onViewFailure, onViewLoaded);
            });
        });
    }
    sortLoopListOverride(loop) {
        this.log.info(`sortLoopListOverride`);
        let notEnrolled = [];
        let alreadyEnrolled = [];
        for (let looper of loop) {
            this.log.debug(`looper: ${looper.id}`);
            if (looper.isJibo) {
                continue;
            }
            if (looper.data.enrolled && looper.data.enrolled.voice && looper.data.enrolled.face) {
                alreadyEnrolled.push(looper);
            }
            else {
                notEnrolled.push(looper);
            }
        }
        return alreadyEnrolled.concat(notEnrolled);
    }
    removeView() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.log.info(`removeView`);
                if (this.menuTimeout) {
                    clearTimeout(this.menuTimeout);
                    this.menuTimeout = null;
                }
                let view = jibo.face.views;
                let removeViewOptions = {
                    removeAll: true,
                };
                let onComplete = () => {
                    resolve();
                };
                if (!view.currentView) {
                    jibo.face.views.forceEyeView(onComplete, null, jibo.face.views.IN, jibo.face.views.DOWN, () => {
                        this.log.error(' failure during forceEyeView, calling complete anyway');
                        onComplete();
                    });
                }
                else {
                    if (view.currentView.id === 'eyeView') {
                        resolve();
                    }
                    else {
                        if (view.currentView.id === 'looperCoin') {
                            removeViewOptions.transitionClose = view.OUT;
                        }
                        jibo.face.views.changeView(removeViewOptions, onComplete, (err) => {
                            this.log.error("removing face view failed");
                            reject(err);
                        });
                    }
                }
            });
        });
    }
    logResults(state, speakerInfo) {
        if (speakerInfo) {
            this.convTechLog.info(`${state} | Speaker ID: ${speakerInfo.id} | accepted: ${speakerInfo.accepted} | is high confidence: ${speakerInfo.highConfidence} | score: ${speakerInfo.score}`);
        }
        else {
            this.convTechLog.info(state);
        }
    }
}
exports.default = FlowClass;

},{"jibo":undefined}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Analytics {
    constructor(skill) {
        this.person_id_successful = 'incomplete_interaction';
        this.person_in_loop = 'incomplete_interaction';
        this.enrollment_offered = false;
        this.skill = skill;
    }
    opened(initial_hypothesis, confidence_rating) {
        this.person_id_successful = 'incomplete_interaction';
        this.person_in_loop = 'incomplete_interaction';
        this.enrollment_offered = false;
        this.skill.track('Who Am I Opened', { initial_hypothesis, confidence_rating });
    }
    response() {
        this.skill.track('Who Am I Response', {
            person_id_successful: this.person_id_successful,
            person_in_loop: this.person_in_loop,
            enrollment_offered: this.enrollment_offered
        });
    }
}
exports.default = Analytics;

},{}],3:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        'meta': {
            'version': 1,
            'name': 'fix',
            'uri': '/Users/jon/Workspace/jibo/buildsdk/skills/who-am-i/src/flows/fix.flow'
        },
        '8414add5-5f8f-4d0b-b3a0-330d645d94bf': function () {
            return {
                'id': '8414add5-5f8f-4d0b-b3a0-330d645d94bf',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '8414add5-5f8f-4d0b-b3a0-330d645d94bf',
                        'to': '180c35ba-4cae-4782-bd94-f58de582fa9c',
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
        '836d6b00-2971-4fd4-9fa0-e7566ed48b9d': function () {
            return {
                'id': '836d6b00-2971-4fd4-9fa0-e7566ed48b9d',
                'name': 'Who Am I_ Collect Name',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '836d6b00-2971-4fd4-9fa0-e7566ed48b9d',
                        'to': 'aaebca12-3664-418d-84d4-707e8fc42f09',
                        'value': 'selected'
                    },
                    {
                        'frm': '836d6b00-2971-4fd4-9fa0-e7566ed48b9d',
                        'to': '6fe8f048-0807-4e78-987e-9de7cb4eab34',
                        'value': 'notInLoop'
                    },
                    {
                        'frm': '836d6b00-2971-4fd4-9fa0-e7566ed48b9d',
                        'to': 'f5d7ee9c-6cae-4149-9fea-a7e8c3e5dada',
                        'value': ''
                    }
                ],
                'exceptions': [{
                        'frm': '836d6b00-2971-4fd4-9fa0-e7566ed48b9d',
                        'to': 'f5d7ee9c-6cae-4149-9fea-a7e8c3e5dada',
                        'value': '~InteractionError'
                    }],
                'class': 'Mim',
                'options': {
                    'getMimPath': () => {
                        let route = this.inTransition === 'true' ? '_GUI.mim' : '.mim';
                        return 'mims/en-us/WhoAmI_CollectName' + route;
                    },
                    'getPromptData': () => {
                        return { sortLoopListOverride: blackboard.flow.sortLoopListOverride };
                    },
                    'onStatus': status => {
                        let mimState = status.state;
                        let asrResults = status.asrResults;
                    },
                    'onSuccess': results => {
                        let mimState = results.state;
                        let asrResult = results.asrResults;
                        let speakerIds = results.speakerIds;
                        if (asrResult && asrResult.entities && asrResult.entities.loopMemberReferent) {
                            blackboard.flow.selectedLooper = asrResult.entities.loopMemberReferent.split(',')[0];
                            blackboard.analytics.person_in_loop = true;
                            return 'selected';
                        } else if (asrResult && asrResult.intent === 'notInLoop') {
                            blackboard.analytics.person_in_loop = false;
                            return 'notInLoop';
                        }
                        return;
                    },
                    'onFailure': results => {
                        let mimState = results.state;
                        let asrResults = results.asrResults;
                        let exception = results.exception;
                        return exception;
                    },
                    'mimPath': '',
                    'checkResult': result => {
                        if (result.intent === 'loopmember' && !result.entities.loopMemberReferent) {
                            result.nlu = null;
                        }
                    }
                }
            };
        },
        'f5d7ee9c-6cae-4149-9fea-a7e8c3e5dada': function () {
            return {
                'id': 'f5d7ee9c-6cae-4149-9fea-a7e8c3e5dada',
                'name': 'RemoveView',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'f5d7ee9c-6cae-4149-9fea-a7e8c3e5dada',
                        'to': '4ca231ac-20fc-48fc-9212-fa5ccb5fc6a4',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        blackboard.flow.logResults(`${ this.inTransition } | Speaker name not collected`);
                        blackboard.flow.removeView().then(done).catch(err => {
                            blackboard.log.warn('error removing view:', err);
                            done();
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '0d810f12-e7a4-426b-87cd-860ed6f71ea2': function () {
            return {
                'id': '0d810f12-e7a4-426b-87cd-860ed6f71ea2',
                'name': 'Who Am I_ Learned',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '0d810f12-e7a4-426b-87cd-860ed6f71ea2',
                        'to': 'f61e3476-e6dd-461c-9835-d691ea9ef5fa',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/WhoAmI_Learned.mim',
                    'getPromptData': () => {
                        return { loopMember: blackboard.flow.loopMember };
                    }
                }
            };
        },
        '5b1de4c8-eaa2-4d3b-af49-c8409b64e7f1': function () {
            return {
                'id': '5b1de4c8-eaa2-4d3b-af49-c8409b64e7f1',
                'name': 'Show Looper Coin',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '5b1de4c8-eaa2-4d3b-af49-c8409b64e7f1',
                        'to': '8759e03e-86e3-4f03-8d17-31138d50b597',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        return blackboard.flow.showLooperCoin().then(done).catch(err => {
                            blackboard.log.error('view load failure', err);
                            done('~error');
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '4ca231ac-20fc-48fc-9212-fa5ccb5fc6a4': function () {
            return {
                'id': '4ca231ac-20fc-48fc-9212-fa5ccb5fc6a4',
                'name': 'Who Am I_ Incomplete',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '4ca231ac-20fc-48fc-9212-fa5ccb5fc6a4',
                        'to': 'f61e3476-e6dd-461c-9835-d691ea9ef5fa',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/WhoAmI_Incomplete.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        'f61e3476-e6dd-461c-9835-d691ea9ef5fa': function () {
            return {
                'id': 'f61e3476-e6dd-461c-9835-d691ea9ef5fa',
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
        'dfcc3469-8523-40e8-b229-484f2945215f': function () {
            return {
                'id': 'dfcc3469-8523-40e8-b229-484f2945215f',
                'name': 'Who Am I_ Not Loop',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'dfcc3469-8523-40e8-b229-484f2945215f',
                        'to': 'f61e3476-e6dd-461c-9835-d691ea9ef5fa',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/WhoAmI_NotLoop.mim',
                    'getPromptData': () => {
                        return { loopOwner: blackboard.flow.loopOwner };
                    }
                }
            };
        },
        '6fe8f048-0807-4e78-987e-9de7cb4eab34': function () {
            return {
                'id': '6fe8f048-0807-4e78-987e-9de7cb4eab34',
                'name': 'RemoveView',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '6fe8f048-0807-4e78-987e-9de7cb4eab34',
                        'to': '73bb3b68-1521-48d1-b9de-d294455229ca',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        blackboard.flow.logResults('Speaker not in loop');
                        blackboard.flow.removeView().then(done).catch(err => {
                            blackboard.log.warn('error removing view:', err);
                            done();
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '8759e03e-86e3-4f03-8d17-31138d50b597': function () {
            return {
                'id': '8759e03e-86e3-4f03-8d17-31138d50b597',
                'name': 'Who Am I_ Confirm',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '8759e03e-86e3-4f03-8d17-31138d50b597',
                        'to': '64306174-4888-4368-bf2b-55a67bf4591c',
                        'value': 'yes'
                    },
                    {
                        'frm': '8759e03e-86e3-4f03-8d17-31138d50b597',
                        'to': '9f5d05cd-45d8-4e44-9ed3-b6fab78a16c1',
                        'value': 'no'
                    },
                    {
                        'frm': '8759e03e-86e3-4f03-8d17-31138d50b597',
                        'to': '801a8cbd-7aa7-4c3f-b162-b01d37291530',
                        'value': ''
                    }
                ],
                'exceptions': [],
                'class': 'Mim.Question',
                'options': {
                    'mimPath': 'mims/en-us/WhoAmI_Confirm.mim',
                    'getPromptData': () => {
                        return { loopMember: blackboard.flow.loopMember };
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
        '4f36fb27-7095-408f-a6c1-3476be9d4ffb': function () {
            return {
                'id': '4f36fb27-7095-408f-a6c1-3476be9d4ffb',
                'name': 'Enrolled?',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '4f36fb27-7095-408f-a6c1-3476be9d4ffb',
                        'to': '0d810f12-e7a4-426b-87cd-860ed6f71ea2',
                        'value': 'true'
                    },
                    {
                        'frm': '4f36fb27-7095-408f-a6c1-3476be9d4ffb',
                        'to': '54edf894-6c89-40c0-a79a-55211b9a8e88',
                        'value': 'false'
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        let enrolled = blackboard.flow.loopMember.data.enrolled;
                        blackboard.log.debug(`enrolled state: ${ enrolled }`);
                        if (!!enrolled.face && !!enrolled.voice) {
                            return true;
                        } else if (!enrolled.face && !enrolled.voice) {
                            blackboard.enrollmentType = 'all';
                        } else if (!enrolled.face) {
                            blackboard.enrollmentType = 'face';
                        } else if (!enrolled.voice) {
                            blackboard.enrollmentType = 'voice';
                        }
                        blackboard.analytics.enrollment_offered = true;
                        return false;
                    }
                }
            };
        },
        '54edf894-6c89-40c0-a79a-55211b9a8e88': function () {
            return {
                'id': '54edf894-6c89-40c0-a79a-55211b9a8e88',
                'name': 'Who Am I_ Want To Enroll',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '54edf894-6c89-40c0-a79a-55211b9a8e88',
                        'to': '1c3ca009-8aed-4961-95e0-84fd56d9a8ec',
                        'value': 'no'
                    },
                    {
                        'frm': '54edf894-6c89-40c0-a79a-55211b9a8e88',
                        'to': '63670be5-a6b6-4600-9f85-413843cf36ff',
                        'value': 'yes'
                    }
                ],
                'exceptions': [],
                'class': 'Mim.Question',
                'options': {
                    'mimPath': 'mims/en-us/WhoAmI_WantToEnroll.mim',
                    'getPromptData': () => {
                        return { wantToEnroll: blackboard.enrollmentType };
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
        '1c3ca009-8aed-4961-95e0-84fd56d9a8ec': function () {
            return {
                'id': '1c3ca009-8aed-4961-95e0-84fd56d9a8ec',
                'name': 'Who Am I_ No Enroll',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '1c3ca009-8aed-4961-95e0-84fd56d9a8ec',
                        'to': 'f61e3476-e6dd-461c-9835-d691ea9ef5fa',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/WhoAmI_NoEnroll.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '63670be5-a6b6-4600-9f85-413843cf36ff': function () {
            return {
                'id': '63670be5-a6b6-4600-9f85-413843cf36ff',
                'name': 'Redirect: Enrollment',
                'asset-pack': 'core',
                'transitions': [],
                'exceptions': [],
                'class': 'Flow.End',
                'options': {
                    'getTransition': () => {
                        return 'enrollment';
                    }
                }
            };
        },
        '9f5d05cd-45d8-4e44-9ed3-b6fab78a16c1': function () {
            return {
                'id': '9f5d05cd-45d8-4e44-9ed3-b6fab78a16c1',
                'name': 'First error?',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '9f5d05cd-45d8-4e44-9ed3-b6fab78a16c1',
                        'to': '836d6b00-2971-4fd4-9fa0-e7566ed48b9d',
                        'value': 'true'
                    },
                    {
                        'frm': '9f5d05cd-45d8-4e44-9ed3-b6fab78a16c1',
                        'to': '6fe8f048-0807-4e78-987e-9de7cb4eab34',
                        'value': 'false'
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        notepad.errorCount++;
                        return notepad.errorCount < 2;
                    }
                }
            };
        },
        'aaebca12-3664-418d-84d4-707e8fc42f09': function () {
            return {
                'id': 'aaebca12-3664-418d-84d4-707e8fc42f09',
                'name': 'loopMember = selected. Made a guess earlier?',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': 'aaebca12-3664-418d-84d4-707e8fc42f09',
                        'to': '5b1de4c8-eaa2-4d3b-af49-c8409b64e7f1',
                        'value': 'true'
                    },
                    {
                        'frm': 'aaebca12-3664-418d-84d4-707e8fc42f09',
                        'to': '64306174-4888-4368-bf2b-55a67bf4591c',
                        'value': 'false'
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        return blackboard.flow.setLoopMember(blackboard.flow.selectedLooper).then(() => {
                            done(!!blackboard.flow.guessedIDState);
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '73bb3b68-1521-48d1-b9de-d294455229ca': function () {
            return {
                'id': '73bb3b68-1521-48d1-b9de-d294455229ca',
                'name': 'Get loopOwner',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '73bb3b68-1521-48d1-b9de-d294455229ca',
                        'to': 'dfcc3469-8523-40e8-b229-484f2945215f',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        return blackboard.flow.setLoopOwner().then(done);
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '64306174-4888-4368-bf2b-55a67bf4591c': function () {
            return {
                'id': '64306174-4888-4368-bf2b-55a67bf4591c',
                'name': 'RemoveView',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '64306174-4888-4368-bf2b-55a67bf4591c',
                        'to': '4f36fb27-7095-408f-a6c1-3476be9d4ffb',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        let correctedID = blackboard.flow.loopMember.id;
                        blackboard.flow.logResults(`Corrected ID: ${ correctedID }`, blackboard.speakerInfo);
                        blackboard.flow.removeView().then(done).catch(err => {
                            blackboard.log.warn('error removing view:', err);
                            done();
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '180c35ba-4cae-4782-bd94-f58de582fa9c': function () {
            return {
                'id': '180c35ba-4cae-4782-bd94-f58de582fa9c',
                'name': 'Made a wrong guess earlier?',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '180c35ba-4cae-4782-bd94-f58de582fa9c',
                        'to': '836d6b00-2971-4fd4-9fa0-e7566ed48b9d',
                        'value': 'true'
                    },
                    {
                        'frm': '180c35ba-4cae-4782-bd94-f58de582fa9c',
                        'to': '836d6b00-2971-4fd4-9fa0-e7566ed48b9d',
                        'value': 'false'
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        notepad.errorCount = 0;
                        return blackboard.flow.guessedIDState === 'incorrect';
                    }
                }
            };
        },
        '19e0ff8d-bb0a-4138-94b4-9963dc982902': {
            'id': '19e0ff8d-bb0a-4138-94b4-9963dc982902',
            'asset-pack': 'core',
            'transitions': [],
            'exceptions': [],
            'class': 'Flow.Comment',
            'options': {}
        },
        '801a8cbd-7aa7-4c3f-b162-b01d37291530': function () {
            return {
                'id': '801a8cbd-7aa7-4c3f-b162-b01d37291530',
                'name': 'RemoveView',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '801a8cbd-7aa7-4c3f-b162-b01d37291530',
                        'to': 'f61e3476-e6dd-461c-9835-d691ea9ef5fa',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        blackboard.flow.logResults('Fixed success', blackboard.flow.loopMember);
                        blackboard.flow.removeView().then(done).catch(err => {
                            blackboard.log.warn('error removing view:', err);
                            done();
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        'a64c62a8-aac9-4988-b516-eb48ba08fb4b': {
            'id': 'a64c62a8-aac9-4988-b516-eb48ba08fb4b',
            'asset-pack': 'core',
            'transitions': [],
            'exceptions': [],
            'class': 'Flow.Comment',
            'options': {}
        }
    };
};
},{}],4:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        'meta': {
            'version': 1,
            'name': 'hypothesis',
            'uri': '/Users/jon/Workspace/jibo/buildsdk/skills/who-am-i/src/flows/hypothesis.flow'
        },
        '943fb90c-8699-4eb6-9de1-a1cddc841c94': function () {
            return {
                'id': '943fb90c-8699-4eb6-9de1-a1cddc841c94',
                'name': 'Begin',
                'transitions': [{
                        'frm': '943fb90c-8699-4eb6-9de1-a1cddc841c94',
                        'to': 'b4871309-58ad-4917-a009-4cf6d9ea21a0',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Begin',
                'options': {
                    'inputParameters': () => {
                        this.log = notepad.params.log;
                        return { looper: '' };
                    }
                }
            };
        },
        '2052e45c-2d10-4dda-9f90-8013d60de749': function () {
            return {
                'id': '2052e45c-2d10-4dda-9f90-8013d60de749',
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
        'b4871309-58ad-4917-a009-4cf6d9ea21a0': function () {
            return {
                'id': 'b4871309-58ad-4917-a009-4cf6d9ea21a0',
                'name': 'Have a guess?',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': 'b4871309-58ad-4917-a009-4cf6d9ea21a0',
                        'to': '59e03313-0e7d-433d-ae44-cd9f27d9d7b1',
                        'value': ''
                    },
                    {
                        'frm': 'b4871309-58ad-4917-a009-4cf6d9ea21a0',
                        'to': '2458418b-801d-47df-9061-6ef6b23ab877',
                        'value': 'true'
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        if (!blackboard.looperGuess) {
                            return false;
                        }
                        return !!blackboard.looperGuess.length && blackboard.looperGuess !== undefined;
                    }
                }
            };
        },
        '59e03313-0e7d-433d-ae44-cd9f27d9d7b1': function () {
            return {
                'id': '59e03313-0e7d-433d-ae44-cd9f27d9d7b1',
                'name': 'Set loopMember.id to null',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '59e03313-0e7d-433d-ae44-cd9f27d9d7b1',
                        'to': '0038f86a-c9e9-4c28-ac5f-d545a10e2b16',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        blackboard.log.info('setting loopMember.id to null');
                        blackboard.analytics.person_id_successful = false;
                        blackboard.flow.loopMember = { id: null };
                        return '';
                    }
                }
            };
        },
        '0038f86a-c9e9-4c28-ac5f-d545a10e2b16': function () {
            return {
                'id': '0038f86a-c9e9-4c28-ac5f-d545a10e2b16',
                'name': 'WhoAmI_DontKnow',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '0038f86a-c9e9-4c28-ac5f-d545a10e2b16',
                        'to': '0a143ae9-565d-4930-b7ee-e8349d95bf10',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/WhoAmI_DontKnow.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '58e4c03e-2d93-48cb-97cc-f7670ca30a53': function () {
            return {
                'id': '58e4c03e-2d93-48cb-97cc-f7670ca30a53',
                'name': 'Who Am I_ Name Is Right',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '58e4c03e-2d93-48cb-97cc-f7670ca30a53',
                        'to': 'ed566f4d-4598-4ff6-a4cf-384f1c1b68f6',
                        'value': 'no'
                    },
                    {
                        'frm': '58e4c03e-2d93-48cb-97cc-f7670ca30a53',
                        'to': 'f000da5c-2e62-473c-bb4b-c2398362316a',
                        'value': 'yes'
                    },
                    {
                        'frm': '58e4c03e-2d93-48cb-97cc-f7670ca30a53',
                        'to': 'c2ae0122-c410-4ddf-b92e-6499f7aff77b',
                        'value': ''
                    }
                ],
                'exceptions': [{
                        'frm': '58e4c03e-2d93-48cb-97cc-f7670ca30a53',
                        'to': 'c2ae0122-c410-4ddf-b92e-6499f7aff77b',
                        'value': '~InteractionError'
                    }],
                'class': 'Mim.Question',
                'options': {
                    'mimPath': 'mims/en-us/WhoAmI_NameIsRight.mim',
                    'getPromptData': () => {
                        return {
                            loopMember: blackboard.flow.loopMember,
                            gender: blackboard.flow.loopMember.gender
                        };
                    },
                    'onStatus': status => {
                        let mimState = status.state;
                        let asrResults = status.asrResults;
                    },
                    'onSuccess': results => {
                        let mimState = results.state;
                        let asrResults = results.asrResults;
                        let transition = results.grammarResults.intent;
                        if (transition === 'yes') {
                            blackboard.analytics.person_id_successful = true;
                            blackboard.analytics.person_in_loop = true;
                        } else if (transition === 'no') {
                            blackboard.analytics.person_id_successful = false;
                        }
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
        '14ba20b4-6d05-40d4-b1ec-1a9e6dcf6fd4': function () {
            return {
                'id': '14ba20b4-6d05-40d4-b1ec-1a9e6dcf6fd4',
                'name': 'Who Am I_ Success',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '14ba20b4-6d05-40d4-b1ec-1a9e6dcf6fd4',
                        'to': '2052e45c-2d10-4dda-9f90-8013d60de749',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/WhoAmI_Success.mim',
                    'getPromptData': () => {
                        jibo.emotion.triggerImpact({
                            valence: jibo.emotion.ImpactSize.MEDIUM_POS,
                            confidence: jibo.emotion.ImpactSize.HIGH_POS
                        });
                        return {};
                    }
                }
            };
        },
        '269fb428-4be7-44f6-a90b-27eb2ae4b084': function () {
            return {
                'id': '269fb428-4be7-44f6-a90b-27eb2ae4b084',
                'name': 'Who Am I_ Fail',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '269fb428-4be7-44f6-a90b-27eb2ae4b084',
                        'to': '0a143ae9-565d-4930-b7ee-e8349d95bf10',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/WhoAmI_Fail.mim',
                    'getPromptData': () => {
                        jibo.emotion.triggerImpact({
                            valence: jibo.emotion.ImpactSize.LOW_NEG,
                            confidence: jibo.emotion.ImpactSize.HIGH_NEG
                        });
                        return {};
                    }
                }
            };
        },
        '28a353d5-2029-490d-9a6f-81ad77c2c613': function () {
            return {
                'id': '28a353d5-2029-490d-9a6f-81ad77c2c613',
                'name': 'Who Am I_ Incomplete',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '28a353d5-2029-490d-9a6f-81ad77c2c613',
                        'to': '2052e45c-2d10-4dda-9f90-8013d60de749',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/WhoAmI_Incomplete.mim',
                    'getPromptData': () => {
                        jibo.emotion.triggerImpact({
                            valence: jibo.emotion.ImpactSize.LOW_NEG,
                            confidence: jibo.emotion.ImpactSize.LOW_NEG
                        });
                        return {};
                    }
                }
            };
        },
        '2458418b-801d-47df-9061-6ef6b23ab877': function () {
            return {
                'id': '2458418b-801d-47df-9061-6ef6b23ab877',
                'name': 'Set loopMember, show looper coin',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '2458418b-801d-47df-9061-6ef6b23ab877',
                        'to': '58e4c03e-2d93-48cb-97cc-f7670ca30a53',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        blackboard.flow.setLoopMember(blackboard.looperGuess).then(() => {
                            return blackboard.flow.showLooperCoin().then(done).catch(err => {
                                blackboard.log.error('view load failure');
                                done('~error');
                            });
                        }).catch(err => {
                            blackboard.log.warn('Error querying the KB:', err);
                            done('~kbError');
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '0a143ae9-565d-4930-b7ee-e8349d95bf10': function () {
            return {
                'id': '0a143ae9-565d-4930-b7ee-e8349d95bf10',
                'name': 'Fix',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '0a143ae9-565d-4930-b7ee-e8349d95bf10',
                        'to': '2052e45c-2d10-4dda-9f90-8013d60de749',
                        'value': ''
                    },
                    {
                        'frm': '0a143ae9-565d-4930-b7ee-e8349d95bf10',
                        'to': '6f4f4588-bf7c-462e-ac7c-b8e177a2bf8a',
                        'value': 'enrollment'
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Subflow',
                'options': {
                    'subflowId': () => {
                        return require('./fix');
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
        '6f4f4588-bf7c-462e-ac7c-b8e177a2bf8a': function () {
            return {
                'id': '6f4f4588-bf7c-462e-ac7c-b8e177a2bf8a',
                'name': 'Redirect: enrollment',
                'asset-pack': 'core',
                'transitions': [],
                'exceptions': [],
                'class': 'Flow.End',
                'options': {
                    'getTransition': () => {
                        return 'enrollment';
                    }
                }
            };
        },
        '64c9a2d8-b42e-4d9d-9b63-bb8c24dd3faf': function () {
            return {
                'id': '64c9a2d8-b42e-4d9d-9b63-bb8c24dd3faf',
                'name': 'Log success, successful name',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '64c9a2d8-b42e-4d9d-9b63-bb8c24dd3faf',
                        'to': '14ba20b4-6d05-40d4-b1ec-1a9e6dcf6fd4',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        blackboard.flow.logResults('Success', blackboard.speakerInfo);
                        blackboard.flow.setGuessedIDState('correct');
                        return '';
                    }
                }
            };
        },
        'ed566f4d-4598-4ff6-a4cf-384f1c1b68f6': function () {
            return {
                'id': 'ed566f4d-4598-4ff6-a4cf-384f1c1b68f6',
                'name': 'Log fail, failed name',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'ed566f4d-4598-4ff6-a4cf-384f1c1b68f6',
                        'to': '269fb428-4be7-44f6-a90b-27eb2ae4b084',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        blackboard.flow.logResults('Failure', blackboard.speakerInfo);
                        blackboard.flow.setGuessedIDState('incorrect');
                        return '';
                    }
                }
            };
        },
        'f000da5c-2e62-473c-bb4b-c2398362316a': function () {
            return {
                'id': 'f000da5c-2e62-473c-bb4b-c2398362316a',
                'name': 'Remove View',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'f000da5c-2e62-473c-bb4b-c2398362316a',
                        'to': '64c9a2d8-b42e-4d9d-9b63-bb8c24dd3faf',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        blackboard.flow.removeView().then(done).catch(err => {
                            blackboard.log.warn('error removing view:', err);
                            done();
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        'c2ae0122-c410-4ddf-b92e-6499f7aff77b': function () {
            return {
                'id': 'c2ae0122-c410-4ddf-b92e-6499f7aff77b',
                'name': 'Remove View',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'c2ae0122-c410-4ddf-b92e-6499f7aff77b',
                        'to': '28a353d5-2029-490d-9a6f-81ad77c2c613',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        blackboard.flow.removeView().then(done).catch(err => {
                            blackboard.log.warn('error removing view:', err);
                            done();
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '3c053937-a0d8-4201-8b2e-93cb24ad26b5': function () {
            return {
                'id': '3c053937-a0d8-4201-8b2e-93cb24ad26b5',
                'name': '~error',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '3c053937-a0d8-4201-8b2e-93cb24ad26b5',
                        'to': '2052e45c-2d10-4dda-9f90-8013d60de749',
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
        '29315410-72e0-436d-9532-36ff652706df': function () {
            return {
                'id': '29315410-72e0-436d-9532-36ff652706df',
                'name': '~kbError',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '29315410-72e0-436d-9532-36ff652706df',
                        'to': '59e03313-0e7d-433d-ae44-cd9f27d9d7b1',
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
        }
    };
};
},{"./fix":3}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
var ActionData = jibo.face.views.ActionData;
class HypothesisView extends jibo.rendering.gui.views.ContactsView {
    constructor() {
        super(...arguments);
        this._type = HypothesisView.DEFAULT_TYPE;
    }
    static get DEFAULT_TYPE() { return 'HypothesisView'; }
    actionEnactor(action) {
        if (this._inputLocked) {
            return false;
        }
        if (action.type === ActionData.VERBAL_COMMAND) {
            if (action.data.intent !== 'close') {
                console.warn('REJECTING NON CLOSE VERBAL COMMAND');
                return false;
            }
        }
        return super.actionEnactor(action);
    }
}
exports.default = HypothesisView;

},{"jibo":undefined}],6:[function(require,module,exports){
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
const FlowClass_1 = require("./FlowClass");
const HypothesisView_1 = require("./gui/HypothesisView");
const Analytics_1 = require("./analytics/Analytics");
const { PromiseUtils } = be_framework_1.libraries.jibo_cai_utils;
let mainFlow = require('./flows/hypothesis');
class WhoAmI extends be_framework_1.BeSkill {
    constructor(assetPack) {
        super(assetPack);
        this.flowOverrides = null;
        this.flow = null;
        this.analytics = new Analytics_1.default(this);
    }
    preload(done) {
        done();
    }
    open(result, refresh) {
        if (refresh) {
            return this.close(() => {
                this.open(result);
            });
        }
        this.log.info('opening skill');
        jibo.face.views.creator.registerClass(HypothesisView_1.default);
        jibo.face.views.forceEyeView();
        if (!result) {
            this.log.debug('no result');
            this.exit();
            return;
        }
        this._open(result)
            .catch((err) => {
            this.log.error(err);
            this.exit();
        });
    }
    _open(result) {
        return __awaiter(this, void 0, void 0, function* () {
            this.blackboard = {
                log: this.log,
                flow: new FlowClass_1.default(this.log),
                analytics: this.analytics,
                looperGuess: "",
                speakerInfo: null,
                enrollmentType: null
            };
            const options = Object.assign({
                assetPack: this.assetPack,
                blackboard: this.blackboard,
                params: {
                    context: result,
                },
                enableLogging: true
            }, this.flowOverrides);
            let confidence_rating = '0';
            let hypothesis = false;
            const speaker = jibo.lps.identity.getActiveSpeaker();
            if (speaker) {
                hypothesis = true;
                const speakerInfo = speaker.idInfo;
                confidence_rating = speakerInfo.highConfidence ? 'HIGH_CONFIDENCE' : 'LOW_CONFIDENCE';
                this.blackboard.speakerInfo = speakerInfo;
                this.blackboard.looperGuess = speakerInfo.id;
            }
            this.blackboard.analytics.opened(hypothesis, confidence_rating);
            this.blackboard.flow.logResults(`Hypothesis: ${hypothesis}`, this.blackboard.speakerInfo);
            const status = yield PromiseUtils.promisify(cb => {
                this.flow = jibo.flow.run(mainFlow, options, cb);
            });
            if (status === jibo.bt.Status.INTERRUPTED || !this.flow) {
                return;
            }
            if (this.flow.result && this.flow.result.transition === 'enrollment') {
                let redirectParams = {
                    nlu: {
                        intent: 'enrollment',
                        entities: {
                            enrollmentType: this.blackboard.enrollmentType,
                            recipient: this.blackboard.flow.loopMember.id
                        }
                    }
                };
                this.log.info(`redirect to enrollment. enrollmentType: ${this.blackboard.enrollmentType}. recipient: ${this.blackboard.flow.loopMember.id}`);
                this.redirect('@be/introductions', redirectParams);
            }
            else {
                this.exit();
            }
        });
    }
    close(done) {
        this.log.debug('closing skill');
        jibo.face.views.creator.unregisterClass('HypothesisView');
        this.blackboard.analytics.response();
        if (this.flow) {
            Promise.all([
                this.flow.stopAndDestroy()
                    .then(() => {
                    this.flow = null;
                }),
                new Promise((resolve) => {
                    if (jibo.face.views.currentView && jibo.face.views.currentView.id !== 'eyeView') {
                        jibo.face.views.changeView({ removeAll: true, leaveEmpty: true }, () => {
                            resolve();
                        }, () => {
                            this.log.error("removing face view failed");
                            resolve();
                        });
                    }
                    else {
                        jibo.face.views.forceEyeView(() => {
                            resolve();
                        }, null, null, null, () => {
                            this.log.error('view failure, continuing anyway');
                            resolve();
                        });
                    }
                })
            ]).then(() => {
                done();
            });
        }
        else {
            done();
        }
    }
}
module.exports = WhoAmI;

},{"./FlowClass":1,"./analytics/Analytics":2,"./flows/hypothesis":4,"./gui/HypothesisView":5,"@be/be-framework":undefined,"jibo":undefined}]},{},[6])(6)
});
//# sourceMappingURL=index.js.map