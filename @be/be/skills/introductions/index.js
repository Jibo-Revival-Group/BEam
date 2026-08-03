(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.beintroductions = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports={
    "sounds": [{
            "file": "sfx_introductions_voiceenrollment_tone_01",
            "name": "tone"
        }
    ]
}

},{}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
class FaceEnroller {
    constructor(log) {
        this.log = log;
    }
    init(_looper) {
        this.looper = _looper;
        this.trainingParams = {
            name: this.looper._id,
            kind: "face"
        };
    }
    cleanup() {
        this.looper = null;
        this.trainingParams = null;
    }
    destroy() {
        this.cleanup();
        this.log = null;
    }
    getLPSData() {
        let data = jibo.lps.motionData;
        const len = data.entities.length;
        let _hasMovement = false;
        let _faceCount = 0;
        for (let i = 0; i < len; i++) {
            let itr = data.entities[i];
            if (!_hasMovement && (itr.description === "motion")) {
                _hasMovement = true;
            }
            if (itr.description === "person") {
                _faceCount++;
            }
        }
        return {
            hasMovement: _hasMovement,
            faceCount: _faceCount
        };
    }
    createIdentity(cb) {
        jibo.ics.createIdentity(this.trainingParams, (error) => {
            cb(error);
        });
    }
    removeIdentity(cb) {
        jibo.ics.removeIdentity(this.trainingParams, (error) => {
            cb(error);
        });
    }
    trainFace(cb) {
        this._trainHelper((err) => {
            if (err && err === "detect-0") {
                this._trainHelper(cb);
            }
            else {
                cb(err);
            }
        });
    }
    _trainHelper(cb) {
        jibo.ics.sendTrainingRequest(this.trainingParams, (error, data) => {
            if (!this.log) {
                return;
            }
            if (error) {
                this.log.warn('face training attempt failed. ', error, data);
                let errorType = "detect-many";
                if (data && data.detection) {
                    errorType = "detect-1";
                }
                else if (data && data.detections && data.detections.length <= 5) {
                    errorType = "detect-" + data.detections.length;
                }
                cb(errorType);
            }
            else {
                this.log.info('face training attempt succeeded');
                cb(null);
            }
        });
    }
    initFaceEnrollment(cb) {
        if (!this.looper.data.enrolled || (this.looper.data.enrolled.face === undefined)) {
            jibo.kb.loop.setEnrollmentFace(this.looper, false, (err) => {
                cb();
            });
        }
        else {
            cb();
        }
    }
    done(onDoneDone) {
        this.log.info('Looper successfully enrolled face recognition');
        jibo.kb.loop.setEnrollmentFace(this.looper, true, (err) => {
            if (err) {
                this.log.warn('failed to set enrollment status ', err);
            }
            onDoneDone();
        });
    }
}
exports.default = FaceEnroller;

},{"jibo":undefined}],3:[function(require,module,exports){
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
class NameEnroller {
    constructor(log) {
        this.catastrophe = false;
        this.pronunciationsGenerated = false;
        this.timeoutTime = 16000;
        this.log = log;
    }
    init(looperName, looperId, modelExists) {
        this.looperId = looperId;
        this.looperName = looperName;
        this.initPromise = jibo.jetstream.initNameLearning(looperName).then(() => {
            this.pronunciationsGenerated = true;
        }).catch((err) => {
            this.catastrophe = true;
            throw err;
        });
    }
    whoAreYou(callback, timeout) {
        return __awaiter(this, void 0, void 0, function* () {
            this.callback = callback;
            this.timeoutTime = timeout || this.timeoutTime;
            try {
                yield this.initPromise;
                this.listener = yield jibo.jetstream.startNameLearningTurn(this.looperName);
                this.timeout = setTimeout(this._onTimeout.bind(this), this.timeoutTime);
                const result = yield this.listener.promise;
                this._onSuccess(result.message);
            }
            catch (err) {
                if (this.timeout) {
                    this._onError(err);
                }
            }
        });
    }
    _onTimeout() {
        this.log.info('pronunciation listen timed-out');
        this.listener.cancel();
        this._onError();
    }
    _onError(data) {
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
        this.log.info('pronunciation error');
        this.listener.events.removeAllListeners();
        this.callback();
    }
    _onSuccess(pronunciation) {
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
        this.log.info('heard pronunciations');
        this.listener.events.removeAllListeners();
        this.callback(pronunciation);
    }
    cleanup() {
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
        this.callback = null;
        this.pronunciationsGenerated = false;
        this.looperId = null;
        if (this.listener) {
            this.listener.events.removeAllListeners();
            this.listener.cancel();
        }
    }
    destroy() {
        this.cleanup();
        this.log = null;
    }
}
exports.default = NameEnroller;

},{"jibo":undefined}],4:[function(require,module,exports){
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
const jibo_cai_utils_1 = require("jibo-cai-utils");
class VoiceEnroller {
    constructor(log) {
        this.timeoutTime = 6000;
        this.log = log;
    }
    init(looperId, loopId, timeout) {
        this.looperId = looperId;
        this.loopId = loopId;
        this.onRecorded = null;
        if (timeout !== undefined) {
            this.timeoutTime = timeout;
        }
    }
    _onEnrollmentStart() {
        this.log.info('enrollment started');
    }
    _onNeedMoreData(data) {
        this.log.info('NEED INPUT');
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
        this.onRecorded(data);
    }
    startListen(attemptEnrollment, onRecorded) {
        return __awaiter(this, void 0, void 0, function* () {
            this.onRecorded = onRecorded;
            const eSesh = this.enrollmentSession = new jibo_cai_utils_1.CancelTokenSession();
            try {
                this.enroller = yield eSesh.wrap(jibo.jetstream.startEnrollmentTurn(this.looperId, 1));
            }
            catch (err) {
                this.log.error('starting enrollment turn failed', err);
            }
            this.timeout = setTimeout(this.onTimeout.bind(this), this.timeoutTime);
            let result = {
                timeout: false,
                loud: false,
                bad: false,
                noisy: false
            };
            jibo.jetstream.events.speakerEnrollment.once((data) => {
                if (!data.accepted) {
                    let result = {
                        timeout: false,
                        loud: false,
                        bad: false,
                        noisy: false
                    };
                    data.problems.forEach((problem) => {
                        switch (problem) {
                            case 'CLIPPING':
                                result.loud = true;
                                break;
                            case 'POOR_SNR':
                                result.noisy = true;
                                break;
                            case 'NOT_SPEECH_LIKE':
                            case 'NOT_CONSISTENT':
                            case 'BAD_DURATION':
                            case 'NOT_HEY_JIBO':
                            case 'BAND_LIMITED':
                            case 'POOR_QUALITY':
                                result.bad = true;
                                break;
                        }
                    });
                    if (!result.loud && !result.noisy && !result.bad) {
                        result.bad = true;
                    }
                    this.onFailure(result);
                }
            });
            const turnResult = yield eSesh.wrap(this.enroller.promise);
            if (this.timeout) {
                clearTimeout(this.timeout);
                this.timeout = null;
            }
            if (turnResult.status === 'FAILED') {
                this.log.error('enrollment turn failed', turnResult.message);
            }
            else if (attemptEnrollment) {
                try {
                    yield eSesh.wrap(jibo.jetstream.createSpeakerModel(this.looperId));
                    this.log.info('Looper successfully enrolled voice recognition');
                    jibo.kb.loop.setEnrollmentVoice(this.looperId, true, (err) => {
                        if (err) {
                            this.log.warn('failed to set enrollment status ', err);
                        }
                    });
                }
                catch (err) {
                    this.log.error('creating speaker model failed', err);
                    result.bad = true;
                }
            }
            this.onRecorded(result);
        });
    }
    onTimeout() {
        this.log.info('enroller timed-out');
        this.timeout = null;
        this.enrollmentSession.cancel();
        let result = {
            timeout: true,
            loud: false,
            bad: false,
            noisy: false
        };
        this.enroller.cancel().catch(() => false).then((canceled) => {
            if (!canceled) {
                this.log.info('unable to cancel enroller after timeout');
            }
            this.onRecorded(result);
        });
    }
    onFailure(result) {
        this.log.info('enroller failed due to bad result');
        clearTimeout(this.timeout);
        this.timeout = null;
        this.enrollmentSession.cancel();
        this.enroller.cancel().catch(() => false).then((canceled) => {
            if (!canceled) {
                this.log.info('unable to cancel enroller after failure');
            }
            this.onRecorded(result);
        });
    }
    cleanup() {
        if (this.looperId) {
            jibo.jetstream.removePendingSamples(this.looperId)
                .catch((err) => {
                this.log.warn('Unable to remove pending enrollment samples on cleanup', err);
            });
        }
        this.looperId = null;
        if (this.enroller) {
            if (this.timeout) {
                clearTimeout(this.timeout);
                this.timeout = null;
                this.enroller.cancel();
            }
            this.enroller = null;
        }
        jibo.jetstream.events.speakerEnrollment.removeAllListeners();
        if (this.enrollmentSession) {
            this.enrollmentSession.cancel();
            this.enrollmentSession = null;
        }
        this.onRecorded = null;
    }
    destroy() {
        this.cleanup();
        this.log = null;
    }
}
exports.default = VoiceEnroller;

},{"jibo":undefined,"jibo-cai-utils":undefined}],5:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        'meta': {
            'version': 1,
            'name': 'CaptureFace',
            'uri': '/Users/jon/Workspace/jibo/buildsdk/skills/introductions/src/flows/CaptureFace.flow'
        },
        '37f951d2-eb93-485e-98b7-8111df4b83df': function () {
            return {
                'id': '37f951d2-eb93-485e-98b7-8111df4b83df',
                'name': 'Begin',
                'transitions': [{
                        'frm': '37f951d2-eb93-485e-98b7-8111df4b83df',
                        'to': 'e33313f9-4a48-4407-8142-4de3481b58cd',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Begin',
                'options': {
                    'inputParameters': () => {
                        return {
                            looper: null,
                            enroller: null,
                            embodiedListen: null,
                            looperCount: 0,
                            log: null
                        };
                    }
                }
            };
        },
        '8fdedaec-2cb8-4c1c-b502-52fde50fe873': function () {
            return {
                'id': '8fdedaec-2cb8-4c1c-b502-52fde50fe873',
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
        'bb5b66ac-7630-4d00-a9e4-dbd69524c562': {
            'id': 'bb5b66ac-7630-4d00-a9e4-dbd69524c562',
            'transitions': [],
            'exceptions': [],
            'class': 'Flow.Comment',
            'options': {}
        },
        '26244961-a514-49f5-90e7-4cc54a5bd93d': function () {
            return {
                'id': '26244961-a514-49f5-90e7-4cc54a5bd93d',
                'name': 'Face Capture Intro',
                'transitions': [{
                        'frm': '26244961-a514-49f5-90e7-4cc54a5bd93d',
                        'to': 'a350849d-1cce-495f-a5df-cedb5dea3757',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/FaceCapture_Intro.mim',
                    'getPromptData': () => {
                        return {
                            isFirstTime: notepad.params.looperCount === 1,
                            loopMember: notepad.params.looper,
                            partial: notepad.params.partial
                        };
                    }
                }
            };
        },
        'b41e4cce-8cd7-42c6-a0eb-21531f746158': function () {
            return {
                'id': 'b41e4cce-8cd7-42c6-a0eb-21531f746158',
                'name': 'Face Capture Failure',
                'transitions': [{
                        'frm': 'b41e4cce-8cd7-42c6-a0eb-21531f746158',
                        'to': 'dec37707-409e-4e73-ac63-97d0fbe53b09',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/FaceCapture_Failure.mim',
                    'getPromptData': () => {
                        return {
                            declined: notepad.notReady > 1,
                            isFirstTime: notepad.params.looperCount === 1
                        };
                    }
                }
            };
        },
        '5d85f435-ba21-4230-8345-b37c28157cb8': function () {
            return {
                'id': '5d85f435-ba21-4230-8345-b37c28157cb8',
                'name': '~TrainFaceLater',
                'transitions': [{
                        'frm': '5d85f435-ba21-4230-8345-b37c28157cb8',
                        'to': 'b03de63a-207b-4483-af65-617d8571bbf9',
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
        '35b0ef2d-e802-405e-b67b-b3b05a810f2c': function () {
            return {
                'id': '35b0ef2d-e802-405e-b67b-b3b05a810f2c',
                'name': 'cancel',
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
        'a350849d-1cce-495f-a5df-cedb5dea3757': function () {
            return {
                'id': 'a350849d-1cce-495f-a5df-cedb5dea3757',
                'name': 'enable viewfinder',
                'transitions': [{
                        'frm': 'a350849d-1cce-495f-a5df-cedb5dea3757',
                        'to': 'f1d6851c-00b8-4581-8a34-02cac89600be',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        notepad.params.embodiedListen.setAmbientMode('NO_BODY');
                        jibo.media.setViewfinder(true, {
                            x: 0,
                            y: 0,
                            width: 1280,
                            height: 720,
                            camera: 0
                        }, () => {
                            done();
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        'b03de63a-207b-4483-af65-617d8571bbf9': function () {
            return {
                'id': 'b03de63a-207b-4483-af65-617d8571bbf9',
                'name': 'hide viewfinder',
                'transitions': [{
                        'frm': 'b03de63a-207b-4483-af65-617d8571bbf9',
                        'to': 'b41e4cce-8cd7-42c6-a0eb-21531f746158',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        if (blackboard.attentionHandler) {
                            blackboard.attentionHandler.release();
                            blackboard.attentionHandler = null;
                        }
                        notepad.params.embodiedListen.setAmbientMode('NORMAL');
                        notepad.params.enroller.cleanup();
                        jibo.media.setViewfinder(false, () => {
                            done();
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '4c1a7c3b-b702-4194-8b46-34305ade0e88': function () {
            return {
                'id': '4c1a7c3b-b702-4194-8b46-34305ade0e88',
                'name': 'DONE',
                'transitions': [{
                        'frm': '4c1a7c3b-b702-4194-8b46-34305ade0e88',
                        'to': '8fdedaec-2cb8-4c1c-b502-52fde50fe873',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        blackboard.track('Face Training', { success: true });
                        blackboard.analyticsData.face_success++;
                        if (blackboard.attentionHandler) {
                            blackboard.attentionHandler.release();
                            blackboard.attentionHandler = null;
                        }
                        notepad.params.enroller.done(() => {
                            done();
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '917d2697-a671-4c88-a8c4-a58a553e76f1': function () {
            return {
                'id': '917d2697-a671-4c88-a8c4-a58a553e76f1',
                'name': 'Face Capture Ready',
                'transitions': [
                    {
                        'frm': '917d2697-a671-4c88-a8c4-a58a553e76f1',
                        'to': 'b03de63a-207b-4483-af65-617d8571bbf9',
                        'value': 'cancel'
                    },
                    {
                        'frm': '917d2697-a671-4c88-a8c4-a58a553e76f1',
                        'to': 'cb0a0cc0-9d49-4dbf-87cd-9dad83e0b322',
                        'value': ''
                    },
                    {
                        'frm': '917d2697-a671-4c88-a8c4-a58a553e76f1',
                        'to': 'f7652b3f-30d0-4180-a42d-b4a59edb801f',
                        'value': 'no'
                    }
                ],
                'exceptions': [{
                        'frm': '917d2697-a671-4c88-a8c4-a58a553e76f1',
                        'to': 'b03de63a-207b-4483-af65-617d8571bbf9',
                        'value': '~InteractionError'
                    }],
                'class': 'Mim.Question',
                'options': {
                    'mimPath': 'mims/en-us/FaceCapture_Ready.mim',
                    'getPromptData': () => {
                        let data = notepad.params.enroller.getLPSData();
                        notepad.params.log.info('LPS data at FaceCaptureReady: ', data);
                        return {
                            lpsMovement: data.hasMovement,
                            lpsCount: notepad.latestNumber || notepad.detectedFaces.length,
                            loopMember: notepad.params.looper,
                            isFirstTime: notepad.params.looperCount === 1
                        };
                    },
                    'onStatus': status => {
                        let mimState = status.state;
                        let asrResults = status.asrResults;
                        let speakerIds = status.speakerIds;
                    },
                    'onSuccess': results => {
                        let mimState = results.state;
                        let asrResults = results.asrResults;
                        let speakerIds = results.speakerIds;
                        let transition = results.firstGrammarTag;
                        return transition;
                    },
                    'onFailure': results => {
                        let mimState = results.state;
                        let asrResults = results.asrResults;
                        let speakerIds = results.speakerIds;
                        let exception = results.exception;
                        return exception;
                    }
                }
            };
        },
        'cb0a0cc0-9d49-4dbf-87cd-9dad83e0b322': function () {
            return {
                'id': 'cb0a0cc0-9d49-4dbf-87cd-9dad83e0b322',
                'name': 'Face Capture Okay',
                'transitions': [{
                        'frm': 'cb0a0cc0-9d49-4dbf-87cd-9dad83e0b322',
                        'to': 'f96c2d16-b956-4a87-8b2d-e2d88eeea882',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/FaceCapture_Okay.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '7309136b-e94b-43d9-9421-f0ea1094bf5a': function () {
            return {
                'id': '7309136b-e94b-43d9-9421-f0ea1094bf5a',
                'name': 'Face Capture Waste Time',
                'transitions': [{
                        'frm': '7309136b-e94b-43d9-9421-f0ea1094bf5a',
                        'to': '917d2697-a671-4c88-a8c4-a58a553e76f1',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/FaceCapture_WasteTime.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        'f7652b3f-30d0-4180-a42d-b4a59edb801f': function () {
            return {
                'id': 'f7652b3f-30d0-4180-a42d-b4a59edb801f',
                'name': 'not ready count',
                'transitions': [
                    {
                        'frm': 'f7652b3f-30d0-4180-a42d-b4a59edb801f',
                        'to': '7309136b-e94b-43d9-9421-f0ea1094bf5a',
                        'value': '1'
                    },
                    {
                        'frm': 'f7652b3f-30d0-4180-a42d-b4a59edb801f',
                        'to': 'c587c79d-c38d-4ff6-9d4a-964db3a8b04f',
                        'value': ''
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        notepad.notReady++;
                        return notepad.notReady;
                    }
                }
            };
        },
        '2bfdc184-685d-4f6e-bfdc-da39da407ddb': function () {
            return {
                'id': '2bfdc184-685d-4f6e-bfdc-da39da407ddb',
                'name': 'viewfinder->animation',
                'transitions': [{
                        'frm': '2bfdc184-685d-4f6e-bfdc-da39da407ddb',
                        'to': '4a1b275b-bd4b-46d4-873f-f4b9d7fd7b43',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        notepad.currentFace = 1;
                        jibo.face.views.changeView({
                            remove: true,
                            leaveEmpty: true,
                            transitionClose: jibo.face.views.NONE
                        }, () => {
                            jibo.media.setViewfinder(false, () => {
                                jibo.face.views.changeView({
                                    addView: 'assets/enrollment/faceView.json',
                                    transitionClose: jibo.face.views.NONE,
                                    transitionOpen: jibo.face.views.IN
                                }, () => {
                                    done();
                                }, () => {
                                    done('~TrainFaceLater');
                                }, faceView => {
                                    notepad.faceView = faceView;
                                    notepad.faceProgress = faceView.getComponentById('faceClip').movieClip;
                                    notepad.faceProgress.progress.gotoAndStop(0);
                                    notepad.faceProgress.photo1.gotoAndStop(0);
                                    notepad.faceProgress.photo1.visible = false;
                                    notepad.faceProgress.photo2.gotoAndStop(0);
                                    notepad.faceProgress.photo2.visible = false;
                                    notepad.faceProgress.photo3.gotoAndStop(0);
                                    notepad.faceProgress.photo3.visible = false;
                                    notepad.faceProgress.photo4.gotoAndStop(0);
                                    notepad.faceProgress.photo4.visible = false;
                                    notepad.faceProgress.photo5.gotoAndStop(0);
                                    notepad.faceProgress.photo5.visible = false;
                                });
                            });
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        'd4960f8c-9894-4e55-8110-cb0ae9e3f496': function () {
            return {
                'id': 'd4960f8c-9894-4e55-8110-cb0ae9e3f496',
                'name': 'Take pic and evaluate',
                'transitions': [
                    {
                        'frm': 'd4960f8c-9894-4e55-8110-cb0ae9e3f496',
                        'to': '809c26eb-79e1-4dd3-af94-1c4ed5d35e40',
                        'value': ''
                    },
                    {
                        'frm': 'd4960f8c-9894-4e55-8110-cb0ae9e3f496',
                        'to': '044d6fea-fe53-4ef0-8180-6a6d12427c0f',
                        'value': 'success'
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        notepad.params.enroller.trainFace(err => {
                            if (err) {
                                notepad.errorType = err;
                                done(err);
                            } else {
                                notepad.numSuccesses++;
                                notepad.numErrors = 0;
                                done('success');
                            }
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '57012c52-bc58-4231-9a0d-daa8938888c3': function () {
            return {
                'id': '57012c52-bc58-4231-9a0d-daa8938888c3',
                'name': 'viewfinder on',
                'transitions': [{
                        'frm': '57012c52-bc58-4231-9a0d-daa8938888c3',
                        'to': '89a18a60-34e2-4fdf-9ee5-7d3831dc1976',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        jibo.media.setViewfinder(true, {
                            x: 0,
                            y: 0,
                            width: 1280,
                            height: 720,
                            camera: 0
                        }, () => {
                            done();
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '809c26eb-79e1-4dd3-af94-1c4ed5d35e40': function () {
            return {
                'id': '809c26eb-79e1-4dd3-af94-1c4ed5d35e40',
                'name': 'error count',
                'transitions': [
                    {
                        'frm': '809c26eb-79e1-4dd3-af94-1c4ed5d35e40',
                        'to': '57012c52-bc58-4231-9a0d-daa8938888c3',
                        'value': '1'
                    },
                    {
                        'frm': '809c26eb-79e1-4dd3-af94-1c4ed5d35e40',
                        'to': 'c241798c-92b3-49a1-9f16-b7ff45c21450',
                        'value': '2'
                    },
                    {
                        'frm': '809c26eb-79e1-4dd3-af94-1c4ed5d35e40',
                        'to': 'd1eb1110-9ec9-4f09-894a-dfb8285e4840',
                        'value': ''
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        notepad.numErrors++;
                        notepad.params.log.info('Face capture failure; numTries=' + notepad.numSuccesses + ' errorType=' + notepad.errorType + ' and errorCount=' + notepad.numErrors);
                        return notepad.numErrors;
                    }
                }
            };
        },
        'c241798c-92b3-49a1-9f16-b7ff45c21450': function () {
            return {
                'id': 'c241798c-92b3-49a1-9f16-b7ff45c21450',
                'name': 'viewfinder on',
                'transitions': [{
                        'frm': 'c241798c-92b3-49a1-9f16-b7ff45c21450',
                        'to': 'd822f8ff-5ae0-40a1-b234-0aa45d5856ff',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        jibo.media.setViewfinder(true, {
                            x: 0,
                            y: 0,
                            width: 1280,
                            height: 720,
                            camera: 0
                        }, () => {
                            done();
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '77c9b50d-f789-4a41-bac7-fc70a5703365': function () {
            return {
                'id': '77c9b50d-f789-4a41-bac7-fc70a5703365',
                'name': '~TrainFaceLater',
                'transitions': [],
                'exceptions': [],
                'class': 'Flow.Throw',
                'options': {
                    'getPayload': () => {
                        return {};
                    }
                }
            };
        },
        '89a18a60-34e2-4fdf-9ee5-7d3831dc1976': function () {
            return {
                'id': '89a18a60-34e2-4fdf-9ee5-7d3831dc1976',
                'name': 'Face Capture Error 1',
                'transitions': [{
                        'frm': '89a18a60-34e2-4fdf-9ee5-7d3831dc1976',
                        'to': '8dc8ca36-8ab2-4338-a56f-f851cd3e6a0a',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/FaceCapture_Error1.mim',
                    'getPromptData': () => {
                        return {
                            loopMember: notepad.params.looper,
                            errorType: notepad.errorType
                        };
                    }
                }
            };
        },
        'd822f8ff-5ae0-40a1-b234-0aa45d5856ff': function () {
            return {
                'id': 'd822f8ff-5ae0-40a1-b234-0aa45d5856ff',
                'name': 'Face Capture Error 2',
                'transitions': [{
                        'frm': 'd822f8ff-5ae0-40a1-b234-0aa45d5856ff',
                        'to': '8dc8ca36-8ab2-4338-a56f-f851cd3e6a0a',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/FaceCapture_Error2.mim',
                    'getPromptData': () => {
                        return {
                            loopMember: notepad.params.looper,
                            errorType: notepad.errorType
                        };
                    }
                }
            };
        },
        '0d4db7e3-9968-4c5e-8e02-0c1c3b8ed7f4': function () {
            return {
                'id': '0d4db7e3-9968-4c5e-8e02-0c1c3b8ed7f4',
                'name': 'turn on body movt',
                'transitions': [{
                        'frm': '0d4db7e3-9968-4c5e-8e02-0c1c3b8ed7f4',
                        'to': 'a54d1a36-3537-49ee-9272-e06d0ac51842',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        if (blackboard.attentionHandler) {
                            blackboard.attentionHandler.release();
                            blackboard.attentionHandler = null;
                        }
                        notepad.params.embodiedListen.setAmbientMode('NORMAL');
                        done();
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        'c8fc3e60-f849-4bcb-8eef-4ccd31dec878': function () {
            return {
                'id': 'c8fc3e60-f849-4bcb-8eef-4ccd31dec878',
                'name': 'hit our max?',
                'transitions': [
                    {
                        'frm': 'c8fc3e60-f849-4bcb-8eef-4ccd31dec878',
                        'to': '473e18bb-5af5-4859-9883-116021eba184',
                        'value': 'true'
                    },
                    {
                        'frm': 'c8fc3e60-f849-4bcb-8eef-4ccd31dec878',
                        'to': 'de0e4754-53cd-49b7-9441-9128782c9439',
                        'value': 'false'
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        notepad.params.log.info('face capture success; numTries=' + notepad.numSuccesses);
                        return notepad.numSuccesses >= notepad.maxTries;
                    }
                }
            };
        },
        'a54d1a36-3537-49ee-9272-e06d0ac51842': function () {
            return {
                'id': 'a54d1a36-3537-49ee-9272-e06d0ac51842',
                'name': 'Face Capture Success',
                'transitions': [{
                        'frm': 'a54d1a36-3537-49ee-9272-e06d0ac51842',
                        'to': '4c1a7c3b-b702-4194-8b46-34305ade0e88',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/FaceCapture_Success.mim',
                    'getPromptData': () => {
                        return { loopMember: notepad.params.looper };
                    }
                }
            };
        },
        'de0e4754-53cd-49b7-9441-9128782c9439': function () {
            return {
                'id': 'de0e4754-53cd-49b7-9441-9128782c9439',
                'name': 'Face Capture Status',
                'transitions': [{
                        'frm': 'de0e4754-53cd-49b7-9441-9128782c9439',
                        'to': 'd4960f8c-9894-4e55-8110-cb0ae9e3f496',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/FaceCapture_Status.mim',
                    'getPromptData': () => {
                        return {
                            loopMember: notepad.params.looper,
                            numTries: notepad.numSuccesses
                        };
                    }
                }
            };
        },
        'ef247ff1-32ba-4621-9bb3-98100a8745ac': function () {
            return {
                'id': 'ef247ff1-32ba-4621-9bb3-98100a8745ac',
                'name': 'prep vars',
                'transitions': [{
                        'frm': 'ef247ff1-32ba-4621-9bb3-98100a8745ac',
                        'to': '26244961-a514-49f5-90e7-4cc54a5bd93d',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        notepad.isFirstTime = !notepad.params.looper.data.enrolled || notepad.params.looper.data.enrolled.face === false;
                        notepad.notReady = 0;
                        notepad.numErrors = 0;
                        notepad.numSuccesses = 0;
                        notepad.maxTries = 5;
                        notepad.params.enroller.initFaceEnrollment(() => {
                            notepad.otherLooper = null;
                            jibo.kb.loop.loadLoop((err, loop) => {
                                if (err) {
                                    notepad.params.log.warn('loop not loaded', err);
                                    done();
                                    return;
                                }
                                let enrollees = [];
                                for (let looper of loop) {
                                    if (looper.data.enrolled && looper.data.enrolled.face && looper._id != notepad.params.looper._id) {
                                        enrollees.push(looper);
                                    }
                                }
                                if (enrollees.length) {
                                    notepad.otherLooper = enrollees[Math.floor(Math.random() * enrollees.length)];
                                }
                                done();
                            });
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        'c587c79d-c38d-4ff6-9d4a-964db3a8b04f': function () {
            return {
                'id': 'c587c79d-c38d-4ff6-9d4a-964db3a8b04f',
                'name': '~TrainFaceLater',
                'transitions': [],
                'exceptions': [],
                'class': 'Flow.Throw',
                'options': {
                    'getPayload': () => {
                        return {};
                    }
                }
            };
        },
        '473e18bb-5af5-4859-9883-116021eba184': function () {
            return {
                'id': '473e18bb-5af5-4859-9883-116021eba184',
                'name': 'transition back to eye',
                'transitions': [{
                        'frm': '473e18bb-5af5-4859-9883-116021eba184',
                        'to': '0d4db7e3-9968-4c5e-8e02-0c1c3b8ed7f4',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        notepad.faceView = null;
                        notepad.faceProgress = null;
                        jibo.face.views.changeView({
                            remove: true,
                            addView: jibo.face.views.createView('EyeView')
                        }, () => {
                            done();
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        'd1eb1110-9ec9-4f09-894a-dfb8285e4840': function () {
            return {
                'id': 'd1eb1110-9ec9-4f09-894a-dfb8285e4840',
                'name': 'transition back to eye',
                'transitions': [{
                        'frm': 'd1eb1110-9ec9-4f09-894a-dfb8285e4840',
                        'to': '98df5422-e768-4f62-82d1-8176e9653111',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        blackboard.track('Face Training', { success: false });
                        blackboard.analyticsData.face_failure++;
                        notepad.faceView = null;
                        notepad.faceProgress = null;
                        jibo.face.views.changeView({
                            remove: true,
                            addView: jibo.face.views.createView('EyeView')
                        }, () => {
                            done('');
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '98df5422-e768-4f62-82d1-8176e9653111': function () {
            return {
                'id': '98df5422-e768-4f62-82d1-8176e9653111',
                'name': 'Face Capture Error 3',
                'transitions': [{
                        'frm': '98df5422-e768-4f62-82d1-8176e9653111',
                        'to': '2dc58f63-6736-489e-a0a1-6299ff97c1e0',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/FaceCapture_Error3.mim',
                    'getPromptData': () => {
                        return { errorType: notepad.errorType };
                    }
                }
            };
        },
        'e33313f9-4a48-4407-8142-4de3481b58cd': function () {
            return {
                'id': 'e33313f9-4a48-4407-8142-4de3481b58cd',
                'name': 'prep eye',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'e33313f9-4a48-4407-8142-4de3481b58cd',
                        'to': 'ef247ff1-32ba-4621-9bb3-98100a8745ac',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        if (!jibo.face.views.currentView || jibo.face.views.currentView.id != 'eyeView') {
                            jibo.face.views.createView('EyeView', null, true, () => {
                                done();
                            });
                        } else {
                            done();
                        }
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '2dc58f63-6736-489e-a0a1-6299ff97c1e0': function () {
            return {
                'id': '2dc58f63-6736-489e-a0a1-6299ff97c1e0',
                'name': 'remove identity',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '2dc58f63-6736-489e-a0a1-6299ff97c1e0',
                        'to': '77c9b50d-f789-4a41-bac7-fc70a5703365',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        notepad.params.enroller.removeIdentity(() => {
                            done();
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        'f96c2d16-b956-4a87-8b2d-e2d88eeea882': function () {
            return {
                'id': 'f96c2d16-b956-4a87-8b2d-e2d88eeea882',
                'name': 'remove old ID/ create ID',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'f96c2d16-b956-4a87-8b2d-e2d88eeea882',
                        'to': '2bfdc184-685d-4f6e-bfdc-da39da407ddb',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        notepad.params.enroller.removeIdentity(() => {
                            notepad.params.enroller.createIdentity(() => {
                                done();
                            });
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '8dc8ca36-8ab2-4338-a56f-f851cd3e6a0a': function () {
            return {
                'id': '8dc8ca36-8ab2-4338-a56f-f851cd3e6a0a',
                'name': 'viewfinder off',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '8dc8ca36-8ab2-4338-a56f-f851cd3e6a0a',
                        'to': 'd4960f8c-9894-4e55-8110-cb0ae9e3f496',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        jibo.media.setViewfinder(false, () => {
                            done();
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '044d6fea-fe53-4ef0-8180-6a6d12427c0f': function () {
            return {
                'id': '044d6fea-fe53-4ef0-8180-6a6d12427c0f',
                'name': 'show face and progress',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '044d6fea-fe53-4ef0-8180-6a6d12427c0f',
                        'to': 'c8fc3e60-f849-4bcb-8eef-4ccd31dec878',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        let bail = () => {
                            notepad.faceView = null;
                            notepad.faceProgress = null;
                            jibo.face.views.changeView({
                                remove: true,
                                addView: jibo.face.views.createView('EyeView')
                            }, () => {
                                done('~TrainFaceLater');
                            });
                        };
                        let looperId = notepad.params.looper._id;
                        jibo.ics.getIdentityList((err, list) => {
                            if (err || !list || !list.face) {
                                bail();
                                return;
                            }
                            let numExamples = 0;
                            for (let face of list.face) {
                                if (looperId == face.name) {
                                    numExamples = face.examples;
                                }
                            }
                            if (numExamples < 1) {
                                bail();
                                return;
                            }
                            jibo.ics.getTrainingPhotoMetadata(looperId, numExamples - 1, (err, response) => {
                                if (err || !response) {
                                    bail();
                                    return;
                                }
                                let newAssetId = `trainingPhoto_${ notepad.currentFace }`;
                                let newAsset = {
                                    id: newAssetId,
                                    src: jibo.ics.getTrainingPhotoURI(looperId, numExamples - 1),
                                    type: 'texture'
                                };
                                notepad.faceView.addAssets(newAsset, err => {
                                    if (err) {
                                        bail();
                                        return;
                                    }
                                    let currentContainer = notepad.faceProgress['photo' + notepad.currentFace];
                                    let sprite = new PIXI.Sprite(notepad.faceView.assets[newAssetId]);
                                    const CIRCLE_HEIGHT = 360;
                                    const HALF_CIRCLE_HEIGHT = CIRCLE_HEIGHT / 2;
                                    if (!response.chipDetails || !response.chipDetails.rect || !response.chipDetails.rect.hasOwnProperty('left') || !response.chipDetails.rect.hasOwnProperty('right') || !response.chipDetails.rect.hasOwnProperty('top') || !response.chipDetails.rect.hasOwnProperty('bottom')) {
                                        sprite.height = CIRCLE_HEIGHT;
                                        sprite.width = 640;
                                        sprite.y = -1 * HALF_CIRCLE_HEIGHT;
                                        sprite.x = -1 * (640 / 2);
                                    } else {
                                        const TARGET_FACE_HEIGHT = 1 / 1.5 * CIRCLE_HEIGHT;
                                        const FACE_HEIGHT = response.chipDetails.rect.bottom - response.chipDetails.rect.top;
                                        sprite.scale.x = sprite.scale.y = TARGET_FACE_HEIGHT / FACE_HEIGHT;
                                        if (sprite.height < CIRCLE_HEIGHT) {
                                            sprite.height = CIRCLE_HEIGHT;
                                            sprite.scale.x = sprite.scale.y;
                                        }
                                        let faceCenter = {
                                            y: sprite.scale.x * (response.chipDetails.rect.top + response.chipDetails.rect.bottom) / 2,
                                            x: sprite.scale.x * (response.chipDetails.rect.right + response.chipDetails.rect.left) / 2
                                        };
                                        sprite.y = Math.max(HALF_CIRCLE_HEIGHT - sprite.height, Math.min(HALF_CIRCLE_HEIGHT * -1, faceCenter.y * -1));
                                        sprite.x = Math.max(HALF_CIRCLE_HEIGHT - sprite.width, Math.min(HALF_CIRCLE_HEIGHT * -1, faceCenter.x * -1));
                                    }
                                    currentContainer.photoHolder.addChild(sprite);
                                    currentContainer.visible = true;
                                    PIXI.animate.Animator.play(currentContainer, 'newPhoto', () => {
                                        done();
                                    });
                                    PIXI.animate.Animator.play(notepad.faceProgress.progress, 'success' + notepad.currentFace);
                                    notepad.currentFace++;
                                });
                            });
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        'dec37707-409e-4e73-ac63-97d0fbe53b09': function () {
            return {
                'id': 'dec37707-409e-4e73-ac63-97d0fbe53b09',
                'name': 'reset attention',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'dec37707-409e-4e73-ac63-97d0fbe53b09',
                        'to': '35b0ef2d-e802-405e-b67b-b3b05a810f2c',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        if (blackboard.attentionHandler) {
                            blackboard.attentionHandler.release();
                            blackboard.attentionHandler = null;
                        }
                        return '';
                    }
                }
            };
        },
        '4a1b275b-bd4b-46d4-873f-f4b9d7fd7b43': function () {
            return {
                'id': '4a1b275b-bd4b-46d4-873f-f4b9d7fd7b43',
                'name': 'disable attention',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '4a1b275b-bd4b-46d4-873f-f4b9d7fd7b43',
                        'to': 'd4960f8c-9894-4e55-8110-cb0ae9e3f496',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        if (!blackboard.attentionHandler) {
                            jibo.expression.pushAttentionMode(jibo.expression.AttentionMode.OFF).then(attentionHandler => {
                                blackboard.attentionHandler = attentionHandler;
                                done('');
                            });
                        } else {
                            done();
                        }
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '85ce59c6-e43a-4f26-b694-c31841df0ba9': function () {
            return {
                'id': '85ce59c6-e43a-4f26-b694-c31841df0ba9',
                'name': 'Look for short people',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '85ce59c6-e43a-4f26-b694-c31841df0ba9',
                        'to': '2ec232ab-3e5c-4955-998a-2ca682f4ac9d',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        jibo.action.addFindPersonGoal().events.finished.waitFor().then(status => {
                            done(status === jibo.action.types.GoalFinishedStatus.SUCCEEDED);
                        }).catch(() => {
                            done(false);
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        'f1d6851c-00b8-4581-8a34-02cac89600be': function () {
            return {
                'id': 'f1d6851c-00b8-4581-8a34-02cac89600be',
                'name': 'check for faces',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': 'f1d6851c-00b8-4581-8a34-02cac89600be',
                        'to': '85ce59c6-e43a-4f26-b694-c31841df0ba9',
                        'value': '0'
                    },
                    {
                        'frm': 'f1d6851c-00b8-4581-8a34-02cac89600be',
                        'to': '2ec232ab-3e5c-4955-998a-2ca682f4ac9d',
                        'value': ''
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        if (notepad.detectedFaces) {
                            done(notepad.latestFaces.length || notepad.detectedFaces.length);
                            return;
                        }
                        notepad.check4Faces = () => {
                            if (notepad.detectedFaces) {
                                jibo.timer.off('update', notepad.check4Faces);
                                notepad.check4Faces = null;
                                done(notepad.latestFaces.length || notepad.detectedFaces.length);
                            }
                        };
                        jibo.timer.on('update', notepad.check4Faces);
                    },
                    'onStop': () => {
                        if (notepad.check4Faces) {
                            jibo.timer.off('update', notepad.check4Faces);
                        }
                    }
                }
            };
        },
        '2ec232ab-3e5c-4955-998a-2ca682f4ac9d': function () {
            return {
                'id': '2ec232ab-3e5c-4955-998a-2ca682f4ac9d',
                'name': 'look at face',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '2ec232ab-3e5c-4955-998a-2ca682f4ac9d',
                        'to': '917d2697-a671-4c88-a8c4-a58a553e76f1',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        if (notepad.onMotionData) {
                            jibo.lps.events.motion.off(notepad.onMotionData);
                            notepad.onMotionData = null;
                        }
                        let lookAtPoint = jibo.expression.features.head.direction;
                        let dist = (a, b) => {
                            let dX = a.x - b.x;
                            let dY = a.y - b.y;
                            let dZ = a.z - b.z;
                            return Math.sqrt(dX * dX + dY * dY + dZ * dZ);
                        };
                        if (notepad.latestFaces.length) {
                            if (notepad.latestFaces.length == 1) {
                                lookAtPoint = notepad.latestFaces[0];
                            } else {
                                let closestDistance = 9000;
                                let closestPerson = null;
                                let newDist;
                                for (let peep of notepad.latestFaces) {
                                    newDist = dist(peep, lookAtPoint);
                                    if (newDist < closestDistance) {
                                        closestDistance = newDist;
                                        closestPerson = peep;
                                    }
                                }
                                lookAtPoint = closestPerson;
                            }
                        } else if (notepad.detectedFaces.length) {
                            let THREE = require('@jibo/three');
                            if (notepad.detectedFaces.length == 1) {
                                let face = notepad.detectedFaces[0];
                                let origin = new THREE.Vector3().copy(face.ray_origin);
                                let direction = new THREE.Vector3().copy(face.ray_dir);
                                let distance = face.range;
                                lookAtPoint = origin.add(direction.setLength(distance));
                            } else {
                                let closestDistance = 9000;
                                let closestPerson = null;
                                let newDist;
                                for (let face of notepad.detectedFaces) {
                                    let origin = new THREE.Vector3().copy(face.ray_origin);
                                    let direction = new THREE.Vector3().copy(face.ray_dir);
                                    let distance = face.range;
                                    let position = origin.add(direction.setLength(distance));
                                    newDist = dist(position, lookAtPoint);
                                    if (newDist < closestDistance) {
                                        closestDistance = newDist;
                                        closestPerson = position;
                                    }
                                }
                                lookAtPoint = closestPerson;
                            }
                        } else {
                            done();
                            return;
                        }
                        jibo.expression.pushAttentionMode(jibo.expression.AttentionMode.OFF).then(attentionHandler => {
                            blackboard.attentionHandler = attentionHandler;
                            jibo.expression.acquireTarget({ position: lookAtPoint }).then(acquireHandle => {
                                return acquireHandle.promise;
                            }).then(() => {
                                done();
                            }).catch(() => {
                                done();
                            });
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        'be45b8da-dea5-4055-9a6c-01b7184ea55a': function () {
            return {
                'id': 'be45b8da-dea5-4055-9a6c-01b7184ea55a',
                'name': 'watch4faces',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'be45b8da-dea5-4055-9a6c-01b7184ea55a',
                        'to': 'b057ed91-4e6c-49c3-9b5d-942dacb0bf85',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        notepad.detectedFaces = null;
                        jibo.lps.getFaces(jibo.media.CameraID.LEFT, (err, data) => {
                            if (err || !data || !data.details) {
                                notepad.detectedFaces = [];
                            } else {
                                notepad.detectedFaces = data.details;
                            }
                        });
                        notepad.latestFaces = [];
                        notepad.latestNumber = 0;
                        notepad.onMotionData = data => {
                            let faces = [];
                            let numTracks = 0;
                            let numDetects = 0;
                            if (data.entities.length) {
                                for (let ent of data.entities) {
                                    if (ent.description == 'person' && ent.parts && ent.parts.length && ent.parts[0].value && ent.parts[0].value.tracker && ent.parts[0].value.tracker.position) {
                                        faces.push(ent.parts[0].value.tracker.position);
                                        numTracks++;
                                    }
                                }
                            }
                            if (data.detections.length) {
                                for (let detect of data.detections) {
                                    if (detect.kind == 'face' && detect.position) {
                                        faces.push(detect.position);
                                        numDetects++;
                                    }
                                }
                            }
                            if (faces.length) {
                                notepad.latestFaces = faces;
                                notepad.latestNumber = numDetects > numTracks ? numDetects : numTracks;
                            }
                        };
                        jibo.lps.events.motion.on(notepad.onMotionData);
                    },
                    'onStop': () => {
                        if (notepad.onMotionData) {
                            jibo.lps.events.motion.off(notepad.onMotionData);
                            notepad.onMotionData = null;
                        }
                    }
                }
            };
        },
        '935bba7c-edeb-4013-a26b-d01eeb236ba6': {
            'id': '935bba7c-edeb-4013-a26b-d01eeb236ba6',
            'asset-pack': 'core',
            'transitions': [{
                    'frm': '935bba7c-edeb-4013-a26b-d01eeb236ba6',
                    'to': 'be45b8da-dea5-4055-9a6c-01b7184ea55a',
                    'value': ''
                }],
            'exceptions': [],
            'class': 'Flow.Begin-Parallel',
            'options': {}
        },
        'b057ed91-4e6c-49c3-9b5d-942dacb0bf85': function () {
            return {
                'id': 'b057ed91-4e6c-49c3-9b5d-942dacb0bf85',
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
},{"@jibo/three":undefined}],6:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        'meta': {
            'version': 1,
            'name': 'CaptureFirstName',
            'uri': '/Users/jon/Workspace/jibo/buildsdk/skills/introductions/src/flows/CaptureFirstName.flow'
        },
        '37f951d2-eb93-485e-98b7-8111df4b83df': function () {
            return {
                'id': '37f951d2-eb93-485e-98b7-8111df4b83df',
                'name': 'Begin',
                'transitions': [{
                        'frm': '37f951d2-eb93-485e-98b7-8111df4b83df',
                        'to': '24b25c04-d9e7-449c-bfff-2de738b3e90b',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Begin',
                'options': {
                    'inputParameters': () => {
                        return {
                            looper: null,
                            enroller: null,
                            partial: false,
                            log: null
                        };
                    }
                }
            };
        },
        '8fdedaec-2cb8-4c1c-b502-52fde50fe873': function () {
            return {
                'id': '8fdedaec-2cb8-4c1c-b502-52fde50fe873',
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
        'bb5b66ac-7630-4d00-a9e4-dbd69524c562': {
            'id': 'bb5b66ac-7630-4d00-a9e4-dbd69524c562',
            'transitions': [],
            'exceptions': [],
            'class': 'Flow.Comment',
            'options': {}
        },
        '24b25c04-d9e7-449c-bfff-2de738b3e90b': function () {
            return {
                'id': '24b25c04-d9e7-449c-bfff-2de738b3e90b',
                'name': 'prep name display',
                'transitions': [{
                        'frm': '24b25c04-d9e7-449c-bfff-2de738b3e90b',
                        'to': 'fa96e817-83f7-4704-9182-2bebc353c7d5',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        if (jibo.face.views.currentView && jibo.face.views.currentView.id == 'eyeView') {
                            notepad.eyeView = null;
                        } else {
                            notepad.eyeView = jibo.face.views.createView('EyeView');
                        }
                        notepad.params.enroller.init(notepad.params.looper.getWrittenName(), notepad.params.looper._id);
                        notepad.nameViewConfig = {
                            viewConfig: {
                                type: 'View',
                                id: 'nameDisplay',
                                ignoreSwipeDown: true
                            },
                            componentConfigs: [{
                                    id: 'looperName',
                                    type: 'Label',
                                    text: notepad.params.looper.getWrittenName(),
                                    style: {
                                        fontSize: 200,
                                        fontFamily: 'Proxima Nova Soft',
                                        fontStyle: 'bold',
                                        fill: '#FFFFFF',
                                        align: 'center'
                                    },
                                    position: {
                                        x: 640,
                                        y: 360
                                    },
                                    targetAnchor: {
                                        x: 0.5,
                                        y: 0.5
                                    },
                                    bounds: {
                                        width: jibo.face.width - 160,
                                        height: 200
                                    }
                                }]
                        };
                        notepad.showName = callback => {
                            if (!notepad.nameView) {
                                notepad.nameView = jibo.face.views.createView('view', notepad.nameViewConfig, true, callback);
                            } else {
                                callback();
                            }
                        };
                        notepad.hideName = callback => {
                            if (notepad.nameView) {
                                notepad.nameView = null;
                                let viewChanger = { remove: true };
                                if (notepad.eyeView) {
                                    viewChanger.addView = notepad.eyeView;
                                    notepad.eyeView = null;
                                }
                                jibo.face.views.changeView(viewChanger, callback, callback);
                            } else {
                                callback();
                            }
                        };
                        return '';
                    }
                }
            };
        },
        'a3792701-f68f-4786-b1c4-bf45b90be3c6': function () {
            return {
                'id': 'a3792701-f68f-4786-b1c4-bf45b90be3c6',
                'name': 'Did I Pronounce Name Right',
                'transitions': [
                    {
                        'frm': 'a3792701-f68f-4786-b1c4-bf45b90be3c6',
                        'to': '4b6dc247-abe8-4fd0-8cf4-ced5a4ecc226',
                        'value': 'no'
                    },
                    {
                        'frm': 'a3792701-f68f-4786-b1c4-bf45b90be3c6',
                        'to': 'd4ae56e2-4db7-4d81-b5f1-109b2f29adb7',
                        'value': 'cancel'
                    },
                    {
                        'frm': 'a3792701-f68f-4786-b1c4-bf45b90be3c6',
                        'to': 'd9b7d507-81ba-4087-99f0-2ffa6fde64e1',
                        'value': 'yes'
                    }
                ],
                'exceptions': [{
                        'frm': 'a3792701-f68f-4786-b1c4-bf45b90be3c6',
                        'to': 'd4ae56e2-4db7-4d81-b5f1-109b2f29adb7',
                        'value': '~InteractionError'
                    }],
                'class': 'Mim.Question',
                'options': {
                    'mimPath': 'mims/en-us/DidIPronounceNameRight.mim',
                    'getPromptData': () => {
                        return {
                            loopMember: notepad.params.looper,
                            partial: notepad.params.partial
                        };
                    },
                    'onStatus': status => {
                    },
                    'onSuccess': results => {
                        let asrResults = results.asrResults;
                        return asrResults.intent;
                    },
                    'onFailure': results => {
                        let exception = results.exception;
                        return exception;
                    }
                }
            };
        },
        '71b6f06c-b7af-4274-a46e-5ab82ae2864c': function () {
            return {
                'id': '71b6f06c-b7af-4274-a46e-5ab82ae2864c',
                'name': 'Train First Name Later',
                'transitions': [{
                        'frm': '71b6f06c-b7af-4274-a46e-5ab82ae2864c',
                        'to': '0db75fd6-793c-450f-94e0-cbf5462c7d64',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/TrainFirstNameLater.mim',
                    'getPromptData': () => {
                        return { partial: notepad.params.partial };
                    }
                }
            };
        },
        '455da248-8a90-4632-99c7-11597d371c2b': function () {
            return {
                'id': '455da248-8a90-4632-99c7-11597d371c2b',
                'name': 'Glad Name Is Right',
                'transitions': [{
                        'frm': '455da248-8a90-4632-99c7-11597d371c2b',
                        'to': '22e640dc-d902-4120-86d0-b11cc3a5e1ed',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/GladNameIsRight.mim',
                    'getPromptData': () => {
                        return { loopMember: notepad.params.looper };
                    }
                }
            };
        },
        'c7becabb-de10-436d-afca-5cb5da9a9969': function () {
            return {
                'id': 'c7becabb-de10-436d-afca-5cb5da9a9969',
                'name': 'Tell Me Your First Name',
                'transitions': [{
                        'frm': 'c7becabb-de10-436d-afca-5cb5da9a9969',
                        'to': '4199ff47-81d4-49b6-b654-ea4e8265b875',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/TellMeYourFirstName.mim',
                    'getPromptData': () => {
                        return { loopMember: notepad.params.looper };
                    }
                }
            };
        },
        '93008ebd-d515-43bc-b478-d678cb9f1125': function () {
            return {
                'id': '93008ebd-d515-43bc-b478-d678cb9f1125',
                'name': 'TrainFirstName',
                'transitions': [
                    {
                        'frm': '93008ebd-d515-43bc-b478-d678cb9f1125',
                        'to': '5be12363-061d-4b34-b019-254acfeb2f94',
                        'value': 'bad'
                    },
                    {
                        'frm': '93008ebd-d515-43bc-b478-d678cb9f1125',
                        'to': '395ef00c-bf9a-4a1f-803d-0618ebc91010',
                        'value': ''
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        let writtenName = notepad.params.looper.getWrittenName();
                        let spacelessName = writtenName.replace(/\s/g, '');
                        notepad.params.log.info('Starting name pronunciation listener');
                        notepad.params.enroller.whoAreYou(pronunciation => {
                            if (pronunciation) {
                                notepad.pronunciation = `<phoneme ph="${ pronunciation }">${ writtenName }</phoneme>`;
                                notepad.spacelessPronunciation = `<phoneme ph="${ pronunciation }">${ spacelessName }</phoneme>`;
                                done('');
                            } else {
                                done('bad');
                            }
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '9d5ffe90-e082-4ae9-b026-17113d40e4df': function () {
            return {
                'id': '9d5ffe90-e082-4ae9-b026-17113d40e4df',
                'name': 'Tell Me Your First Name Again',
                'transitions': [{
                        'frm': '9d5ffe90-e082-4ae9-b026-17113d40e4df',
                        'to': '5eabfcc1-6f49-427e-8baf-bc13abfa1eb0',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/TellMeYourFirstNameAgain.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        'b0da4a5e-3322-4df9-a645-b97039effa32': function () {
            return {
                'id': 'b0da4a5e-3322-4df9-a645-b97039effa32',
                'name': 'tooBad?',
                'transitions': [
                    {
                        'frm': 'b0da4a5e-3322-4df9-a645-b97039effa32',
                        'to': '9d5ffe90-e082-4ae9-b026-17113d40e4df',
                        'value': 'false'
                    },
                    {
                        'frm': 'b0da4a5e-3322-4df9-a645-b97039effa32',
                        'to': '00369c16-bf51-4cf2-b406-6d05300c8b2f',
                        'value': ''
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        return ++notepad.failedAttempts > 2;
                    }
                }
            };
        },
        '00369c16-bf51-4cf2-b406-6d05300c8b2f': function () {
            return {
                'id': '00369c16-bf51-4cf2-b406-6d05300c8b2f',
                'name': '~FinalFailure',
                'transitions': [],
                'exceptions': [],
                'class': 'Flow.Throw',
                'options': {
                    'getPayload': () => {
                        return {};
                    }
                }
            };
        },
        '9bdab074-0ac2-4dfe-9b5c-dfd89dc6301f': function () {
            return {
                'id': '9bdab074-0ac2-4dfe-9b5c-dfd89dc6301f',
                'name': 'I Heard Pronunciation',
                'transitions': [{
                        'frm': '9bdab074-0ac2-4dfe-9b5c-dfd89dc6301f',
                        'to': 'eb076f53-c435-41bd-a9aa-51c732f08ff8',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/IHeardPronunciation.mim',
                    'getPromptData': () => {
                        return { name: notepad.spacelessPronunciation };
                    }
                }
            };
        },
        'a97f02af-4a4a-419c-ad98-23a9a3cdfdd6': function () {
            return {
                'id': 'a97f02af-4a4a-419c-ad98-23a9a3cdfdd6',
                'name': 'Heard First Name Wrong',
                'transitions': [{
                        'frm': 'a97f02af-4a4a-419c-ad98-23a9a3cdfdd6',
                        'to': '5eabfcc1-6f49-427e-8baf-bc13abfa1eb0',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/HeardFirstNameWrong.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        'd4ae56e2-4db7-4d81-b5f1-109b2f29adb7': function () {
            return {
                'id': 'd4ae56e2-4db7-4d81-b5f1-109b2f29adb7',
                'name': '~cancel',
                'transitions': [],
                'exceptions': [],
                'class': 'Flow.Throw',
                'options': {
                    'getPayload': () => {
                        return {};
                    }
                }
            };
        },
        'dac694ce-28b3-46dc-b7c8-537e4618f6db': function () {
            return {
                'id': 'dac694ce-28b3-46dc-b7c8-537e4618f6db',
                'name': '~cancel',
                'transitions': [{
                        'frm': 'dac694ce-28b3-46dc-b7c8-537e4618f6db',
                        'to': '422bb3da-ad6c-4a41-adf3-774245dc590f',
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
        '31f174eb-a4c0-442f-8b59-4120eaac0efb': function () {
            return {
                'id': '31f174eb-a4c0-442f-8b59-4120eaac0efb',
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
        'eb076f53-c435-41bd-a9aa-51c732f08ff8': function () {
            return {
                'id': 'eb076f53-c435-41bd-a9aa-51c732f08ff8',
                'name': 'Did I Hear Name Right One',
                'transitions': [
                    {
                        'frm': 'eb076f53-c435-41bd-a9aa-51c732f08ff8',
                        'to': '3e0a7bdf-d17b-4cca-88e5-830a7236c968',
                        'value': ''
                    },
                    {
                        'frm': 'eb076f53-c435-41bd-a9aa-51c732f08ff8',
                        'to': '71d0692e-a1fc-4d5e-a8b9-32bfa50a0902',
                        'value': 'yes'
                    },
                    {
                        'frm': 'eb076f53-c435-41bd-a9aa-51c732f08ff8',
                        'to': '7aba4e79-0e50-4e66-a708-d1a79ea61106',
                        'value': 'cancel'
                    }
                ],
                'exceptions': [{
                        'frm': 'eb076f53-c435-41bd-a9aa-51c732f08ff8',
                        'to': '7aba4e79-0e50-4e66-a708-d1a79ea61106',
                        'value': '~InteractionError'
                    }],
                'class': 'Mim.Question',
                'options': {
                    'mimPath': 'mims/en-us/DidIHearNameRightOne.mim',
                    'getPromptData': () => {
                        return {};
                    },
                    'onStatus': status => {
                        let mimState = status.state;
                        let asrResults = status.asrResults;
                        let speakerIds = status.speakerIds;
                    },
                    'onSuccess': results => {
                        let mimState = results.state;
                        let asrResults = results.asrResults;
                        let speakerIds = results.speakerIds;
                        let transition = results.firstGrammarTag;
                        return transition;
                    },
                    'onFailure': results => {
                        let mimState = results.state;
                        let asrResults = results.asrResults;
                        let speakerIds = results.speakerIds;
                        let exception = results.exception;
                        return exception;
                    }
                }
            };
        },
        '3e0a7bdf-d17b-4cca-88e5-830a7236c968': function () {
            return {
                'id': '3e0a7bdf-d17b-4cca-88e5-830a7236c968',
                'name': 'tooBad?',
                'transitions': [
                    {
                        'frm': '3e0a7bdf-d17b-4cca-88e5-830a7236c968',
                        'to': '73587ec2-899e-4b92-b266-80edd44cb531',
                        'value': ''
                    },
                    {
                        'frm': '3e0a7bdf-d17b-4cca-88e5-830a7236c968',
                        'to': 'a97f02af-4a4a-419c-ad98-23a9a3cdfdd6',
                        'value': 'false'
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        return ++notepad.failedAttempts > 2;
                    }
                }
            };
        },
        '7aba4e79-0e50-4e66-a708-d1a79ea61106': function () {
            return {
                'id': '7aba4e79-0e50-4e66-a708-d1a79ea61106',
                'name': '~cancel',
                'transitions': [],
                'exceptions': [],
                'class': 'Flow.Throw',
                'options': {
                    'getPayload': () => {
                        return {};
                    }
                }
            };
        },
        '73587ec2-899e-4b92-b266-80edd44cb531': function () {
            return {
                'id': '73587ec2-899e-4b92-b266-80edd44cb531',
                'name': 'I Will Learn Name Later',
                'transitions': [{
                        'frm': '73587ec2-899e-4b92-b266-80edd44cb531',
                        'to': '02d85152-7c8e-4d77-979f-d29a4045732e',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/IWillLearnNameLater.mim',
                    'getPromptData': () => {
                        return {
                            loopMember: notepad.params.looper,
                            partial: notepad.params.partial
                        };
                    }
                }
            };
        },
        'd8c98a78-fbac-4684-962e-328f706ada93': function () {
            return {
                'id': 'd8c98a78-fbac-4684-962e-328f706ada93',
                'name': '"send audio files for review"',
                'transitions': [],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        done('');
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        'bc05e9d9-fb9f-4fdd-8c28-f47bee32803e': function () {
            return {
                'id': 'bc05e9d9-fb9f-4fdd-8c28-f47bee32803e',
                'name': '~FinalFailure',
                'transitions': [{
                        'frm': 'bc05e9d9-fb9f-4fdd-8c28-f47bee32803e',
                        'to': '73587ec2-899e-4b92-b266-80edd44cb531',
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
        'd9b7d507-81ba-4087-99f0-2ffa6fde64e1': function () {
            return {
                'id': 'd9b7d507-81ba-4087-99f0-2ffa6fde64e1',
                'name': 'hideName',
                'transitions': [{
                        'frm': 'd9b7d507-81ba-4087-99f0-2ffa6fde64e1',
                        'to': '455da248-8a90-4632-99c7-11597d371c2b',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        blackboard.analyticsData.name_initial_success = true;
                        notepad.hideName(done);
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '4b6dc247-abe8-4fd0-8cf4-ced5a4ecc226': function () {
            return {
                'id': '4b6dc247-abe8-4fd0-8cf4-ced5a4ecc226',
                'name': 'hideName',
                'transitions': [{
                        'frm': '4b6dc247-abe8-4fd0-8cf4-ced5a4ecc226',
                        'to': 'c7becabb-de10-436d-afca-5cb5da9a9969',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        notepad.hideName(done);
                        notepad.numFailures = 0;
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '5eabfcc1-6f49-427e-8baf-bc13abfa1eb0': function () {
            return {
                'id': '5eabfcc1-6f49-427e-8baf-bc13abfa1eb0',
                'name': 'ShowName',
                'transitions': [{
                        'frm': '5eabfcc1-6f49-427e-8baf-bc13abfa1eb0',
                        'to': '0e99dfd4-0168-4e93-aa18-1314117f4505',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        notepad.showName(done);
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '4199ff47-81d4-49b6-b654-ea4e8265b875': function () {
            return {
                'id': '4199ff47-81d4-49b6-b654-ea4e8265b875',
                'name': 'isListenerReady?',
                'transitions': [
                    {
                        'frm': '4199ff47-81d4-49b6-b654-ea4e8265b875',
                        'to': '5eabfcc1-6f49-427e-8baf-bc13abfa1eb0',
                        'value': ''
                    },
                    {
                        'frm': '4199ff47-81d4-49b6-b654-ea4e8265b875',
                        'to': 'd4ae56e2-4db7-4d81-b5f1-109b2f29adb7',
                        'value': 'catastrophe'
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        let howManyTimesMustWeFail = 80;
                        let timeout = 100;
                        let failure = 0;
                        let weGood = () => {
                            if (notepad.params.enroller.pronunciationsGenerated) {
                                notepad.failedAttempts = 0;
                                done();
                            } else if (notepad.params.enroller.catastrophe) {
                                done('catastrophe');
                            } else if (++failure < howManyTimesMustWeFail) {
                                setTimeout(weGood, timeout);
                            } else {
                                notepad.params.log.warn('G2P generation took too long - quitting name pronunciation learning');
                                done('catastrophe');
                            }
                        };
                        weGood();
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '71d0692e-a1fc-4d5e-a8b9-32bfa50a0902': function () {
            return {
                'id': '71d0692e-a1fc-4d5e-a8b9-32bfa50a0902',
                'name': 'saveThatShit',
                'transitions': [{
                        'frm': '71d0692e-a1fc-4d5e-a8b9-32bfa50a0902',
                        'to': '455da248-8a90-4632-99c7-11597d371c2b',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        blackboard.track('Name Training', { success: true });
                        blackboard.analyticsData.name_success++;
                        notepad.params.looper.data.phoneticName = notepad.pronunciation;
                        jibo.kb.loop.setPhoneticName(notepad.params.looper, notepad.pronunciation, err => {
                            if (err) {
                                notepad.params.log.error('we couldnt save the pronunciation because ', err);
                            }
                        });
                    }
                }
            };
        },
        '0e99dfd4-0168-4e93-aa18-1314117f4505': {
            'id': '0e99dfd4-0168-4e93-aa18-1314117f4505',
            'name': 'a noise',
            'asset-pack': 'core',
            'transitions': [{
                    'frm': '0e99dfd4-0168-4e93-aa18-1314117f4505',
                    'to': '93008ebd-d515-43bc-b478-d678cb9f1125',
                    'value': ''
                }],
            'exceptions': [],
            'class': 'PlayAudio',
            'options': {
                'audioPath': 'BBF4710_001_dxchange.wav',
                'cache': true
            }
        },
        '5be12363-061d-4b34-b019-254acfeb2f94': function () {
            return {
                'id': '5be12363-061d-4b34-b019-254acfeb2f94',
                'name': 'hideName',
                'transitions': [{
                        'frm': '5be12363-061d-4b34-b019-254acfeb2f94',
                        'to': 'b0da4a5e-3322-4df9-a645-b97039effa32',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        notepad.hideName(done);
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '395ef00c-bf9a-4a1f-803d-0618ebc91010': function () {
            return {
                'id': '395ef00c-bf9a-4a1f-803d-0618ebc91010',
                'name': 'hideName',
                'transitions': [{
                        'frm': '395ef00c-bf9a-4a1f-803d-0618ebc91010',
                        'to': '9bdab074-0ac2-4dfe-9b5c-dfd89dc6301f',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        notepad.hideName(done);
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '422bb3da-ad6c-4a41-adf3-774245dc590f': function () {
            return {
                'id': '422bb3da-ad6c-4a41-adf3-774245dc590f',
                'name': 'hideName',
                'transitions': [{
                        'frm': '422bb3da-ad6c-4a41-adf3-774245dc590f',
                        'to': '71b6f06c-b7af-4274-a46e-5ab82ae2864c',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        notepad.hideName(done);
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        'b2ae0c4a-b252-47ac-88a3-76eba0d9a5a7': {
            'id': 'b2ae0c4a-b252-47ac-88a3-76eba0d9a5a7',
            'transitions': [],
            'exceptions': [],
            'class': 'Flow.Comment',
            'options': {}
        },
        '0db75fd6-793c-450f-94e0-cbf5462c7d64': function () {
            return {
                'id': '0db75fd6-793c-450f-94e0-cbf5462c7d64',
                'name': 'cleanup enroller',
                'transitions': [{
                        'frm': '0db75fd6-793c-450f-94e0-cbf5462c7d64',
                        'to': '31f174eb-a4c0-442f-8b59-4120eaac0efb',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        notepad.params.enroller.cleanup();
                        return '';
                    }
                }
            };
        },
        '22e640dc-d902-4120-86d0-b11cc3a5e1ed': function () {
            return {
                'id': '22e640dc-d902-4120-86d0-b11cc3a5e1ed',
                'name': 'cleanup enroller',
                'transitions': [{
                        'frm': '22e640dc-d902-4120-86d0-b11cc3a5e1ed',
                        'to': '8fdedaec-2cb8-4c1c-b502-52fde50fe873',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        notepad.params.enroller.cleanup();
                        return '';
                    }
                }
            };
        },
        'fa96e817-83f7-4704-9182-2bebc353c7d5': function () {
            return {
                'id': 'fa96e817-83f7-4704-9182-2bebc353c7d5',
                'name': 'ShowName',
                'transitions': [{
                        'frm': 'fa96e817-83f7-4704-9182-2bebc353c7d5',
                        'to': 'a3792701-f68f-4786-b1c4-bf45b90be3c6',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        notepad.showName(done);
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '02d85152-7c8e-4d77-979f-d29a4045732e': function () {
            return {
                'id': '02d85152-7c8e-4d77-979f-d29a4045732e',
                'name': 'record failure',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '02d85152-7c8e-4d77-979f-d29a4045732e',
                        'to': '22e640dc-d902-4120-86d0-b11cc3a5e1ed',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        blackboard.track('Name Training', { success: false });
                        blackboard.analyticsData.name_failure++;
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
            'name': 'CaptureHeyJibo',
            'uri': '/Users/jon/Workspace/jibo/buildsdk/skills/introductions/src/flows/CaptureHeyJibo.flow'
        },
        'dffdc8f7-3398-4616-8e0b-3d5fde0bc6ed': function () {
            return {
                'id': 'dffdc8f7-3398-4616-8e0b-3d5fde0bc6ed',
                'transitions': [{
                        'frm': 'dffdc8f7-3398-4616-8e0b-3d5fde0bc6ed',
                        'to': '83530355-64a7-46ee-b493-c072373480f2',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Begin',
                'options': {
                    'inputParameters': () => {
                        return {
                            looper: null,
                            enroller: null,
                            enrolledBefore: false,
                            root: null,
                            looperCount: 0,
                            embodiedListen: null,
                            partial: false,
                            log: null
                        };
                    }
                }
            };
        },
        'a2ae08b0-9f3f-424d-a4f3-7da982e0afdd': function () {
            return {
                'id': 'a2ae08b0-9f3f-424d-a4f3-7da982e0afdd',
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
        '184a470b-9cc2-4c7e-a19e-8716ab5312b2': function () {
            return {
                'id': '184a470b-9cc2-4c7e-a19e-8716ab5312b2',
                'name': 'Capture H J_ Intro',
                'transitions': [{
                        'frm': '184a470b-9cc2-4c7e-a19e-8716ab5312b2',
                        'to': '03e187ac-e2b7-4922-a4f7-a1239bef281d',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/CaptureHJ_Intro.mim',
                    'getPromptData': () => {
                        return {
                            soundName: notepad.sound.name,
                            isFirstTime: notepad.params.looperCount === 1,
                            partial: notepad.params.partial,
                            loopMember: notepad.params.looper
                        };
                    }
                }
            };
        },
        '1e08b4bc-76c2-45a8-9ab2-5e478003cd5e': function () {
            return {
                'id': '1e08b4bc-76c2-45a8-9ab2-5e478003cd5e',
                'name': 'load sound',
                'transitions': [{
                        'frm': '1e08b4bc-76c2-45a8-9ab2-5e478003cd5e',
                        'to': '184a470b-9cc2-4c7e-a19e-8716ab5312b2',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        let sounds = require('../../assets/enrollment/sounds/soundNames.json').sounds;
                        notepad.sound = sounds[Math.floor(Math.random() * sounds.length)];
                        notepad.sound.play = function (callback) {
                            jibo.sound.play(this.file, callback);
                        }.bind(notepad.sound);
                        notepad.sound.unload = function () {
                            jibo.sound.remove(this.file);
                        }.bind(notepad.sound);
                        jibo.loader.load(`assets/enrollment/sounds/${ notepad.sound.file }.m4a`, done);
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        'b2037dbf-611c-4f6f-9b46-4090f2fd316a': function () {
            return {
                'id': 'b2037dbf-611c-4f6f-9b46-4090f2fd316a',
                'name': 'TrainHeyJibo',
                'transitions': [
                    {
                        'frm': 'b2037dbf-611c-4f6f-9b46-4090f2fd316a',
                        'to': 'b8e6eb36-7d67-4cc7-9e79-231ee508545c',
                        'value': 'bad'
                    },
                    {
                        'frm': 'b2037dbf-611c-4f6f-9b46-4090f2fd316a',
                        'to': 'f9634131-e16c-48b6-ad19-d9449efa7e16',
                        'value': '6'
                    },
                    {
                        'frm': 'b2037dbf-611c-4f6f-9b46-4090f2fd316a',
                        'to': '0630af3a-e3cf-4dba-a2c8-41ce8f864d70',
                        'value': ''
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        jibo.face.views.addView('assets/enrollment/heyJiboView.json', () => {
                            notepad.sound.play(() => {
                                notepad.params.enroller.startListen(notepad.goodTimes >= 5, data => {
                                    notepad.params.log.info('got enroller response:', data);
                                    const removeViewCB = () => {
                                        notepad.whyAreYouSuchAFailure = data;
                                        if (data.timeout) {
                                            notepad.failureTracker.timeout++;
                                        } else {
                                            if (data.noisy) {
                                                notepad.failureTracker.noisy++;
                                            }
                                            if (data.loud) {
                                                notepad.failureTracker.loud++;
                                            }
                                            if (data.bad) {
                                                notepad.failureTracker.bad++;
                                            }
                                        }
                                        if (data.timeout || data.noisy || data.loud || data.bad) {
                                            jibo.face.eye.eye.alpha = 1;
                                            done('bad');
                                        } else {
                                            notepad.badTimes = 0;
                                            done(++notepad.goodTimes);
                                        }
                                    };
                                    jibo.face.views.removeView(removeViewCB, undefined, undefined, removeViewCB);
                                });
                            });
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        'b8e6eb36-7d67-4cc7-9e79-231ee508545c': function () {
            return {
                'id': 'b8e6eb36-7d67-4cc7-9e79-231ee508545c',
                'name': 'badTimes',
                'transitions': [
                    {
                        'frm': 'b8e6eb36-7d67-4cc7-9e79-231ee508545c',
                        'to': '76594acc-6156-4676-b2f2-8c3cc9154bfe',
                        'value': ''
                    },
                    {
                        'frm': 'b8e6eb36-7d67-4cc7-9e79-231ee508545c',
                        'to': 'b282af70-8562-4bb2-822d-2a2957fed168',
                        'value': '0'
                    },
                    {
                        'frm': 'b8e6eb36-7d67-4cc7-9e79-231ee508545c',
                        'to': '354befa6-bf23-4e82-aa07-a6e8fea504c9',
                        'value': '1'
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        return notepad.badTimes++;
                    }
                }
            };
        },
        '03e187ac-e2b7-4922-a4f7-a1239bef281d': function () {
            return {
                'id': '03e187ac-e2b7-4922-a4f7-a1239bef281d',
                'name': 'come on ride the train',
                'transitions': [{
                        'frm': '03e187ac-e2b7-4922-a4f7-a1239bef281d',
                        'to': 'b2037dbf-611c-4f6f-9b46-4090f2fd316a',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        notepad.badTimes = 0;
                        jibo.expression.centerRobot().then(() => {
                            done();
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '76594acc-6156-4676-b2f2-8c3cc9154bfe': function () {
            return {
                'id': '76594acc-6156-4676-b2f2-8c3cc9154bfe',
                'name': 'Capture H J_ Fail',
                'transitions': [{
                        'frm': '76594acc-6156-4676-b2f2-8c3cc9154bfe',
                        'to': '0878dabb-2094-4ef7-aee1-64f3eff69bb0',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/CaptureHJ_Fail.mim',
                    'getPromptData': () => {
                        return {
                            globalBadAudioCount: notepad.failureTracker.bad,
                            globalLoudAudioCount: notepad.failureTracker.loud,
                            globalNoisyAudioCount: notepad.failureTracker.noisy,
                            globalTimeoutCount: notepad.failureTracker.timeout,
                            partial: notepad.params.partial
                        };
                    }
                }
            };
        },
        'b282af70-8562-4bb2-822d-2a2957fed168': function () {
            return {
                'id': 'b282af70-8562-4bb2-822d-2a2957fed168',
                'name': 'Capture H J_ Error1',
                'transitions': [{
                        'frm': 'b282af70-8562-4bb2-822d-2a2957fed168',
                        'to': 'cecc56b1-747b-46a3-970d-34674a2828f3',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/CaptureHJ_Error1.mim',
                    'getPromptData': () => {
                        return {
                            soundName: notepad.sound.name,
                            timeout: notepad.whyAreYouSuchAFailure.timeout,
                            badAudio: notepad.whyAreYouSuchAFailure.bad,
                            noisyAudio: notepad.whyAreYouSuchAFailure.noisy,
                            loudAudio: notepad.whyAreYouSuchAFailure.loud,
                            globalBadAudioCount: notepad.failureTracker.bad,
                            globalLoudAudioCount: notepad.failureTracker.loud,
                            globalNoisyAudioCount: notepad.failureTracker.noisy,
                            globalTimeoutCount: notepad.failureTracker.timeout
                        };
                    }
                }
            };
        },
        '354befa6-bf23-4e82-aa07-a6e8fea504c9': function () {
            return {
                'id': '354befa6-bf23-4e82-aa07-a6e8fea504c9',
                'name': 'Capture H J_ Error2',
                'transitions': [{
                        'frm': '354befa6-bf23-4e82-aa07-a6e8fea504c9',
                        'to': 'cecc56b1-747b-46a3-970d-34674a2828f3',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/CaptureHJ_Error2.mim',
                    'getPromptData': () => {
                        return {
                            soundName: notepad.sound.name,
                            timeout: notepad.whyAreYouSuchAFailure.timeout,
                            badAudio: notepad.whyAreYouSuchAFailure.bad,
                            noisyAudio: notepad.whyAreYouSuchAFailure.noisy,
                            loudAudio: notepad.whyAreYouSuchAFailure.loud,
                            globalBadAudioCount: notepad.failureTracker.bad,
                            globalLoudAudioCount: notepad.failureTracker.loud,
                            globalNoisyAudioCount: notepad.failureTracker.noisy,
                            globalTimeoutCount: notepad.failureTracker.timeout
                        };
                    }
                }
            };
        },
        'f9634131-e16c-48b6-ad19-d9449efa7e16': function () {
            return {
                'id': 'f9634131-e16c-48b6-ad19-d9449efa7e16',
                'name': 'joke calculator',
                'transitions': [
                    {
                        'frm': 'f9634131-e16c-48b6-ad19-d9449efa7e16',
                        'to': 'be2f188f-7a34-4d49-87da-4ba1961d1ce0',
                        'value': 'true'
                    },
                    {
                        'frm': 'f9634131-e16c-48b6-ad19-d9449efa7e16',
                        'to': 'c9f5acd9-7cb4-4bdb-b876-07eae6696222',
                        'value': ''
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        if (!notepad.params.root.data.voiceEnrollerSuccess) {
                            notepad.params.root.data.voiceEnrollerSuccess = 0;
                        }
                        let doJoke = notepad.params.root.data.voiceEnrollerSuccess % 5 == 0;
                        if (doJoke) {
                            let numberOfJokes = 6;
                            notepad.jokeNumber = notepad.params.root.data.voiceEnrollerSuccess % numberOfJokes;
                        }
                        notepad.params.root.data.voiceEnrollerSuccess++;
                        notepad.params.root.save();
                        return doJoke;
                    }
                }
            };
        },
        'be2f188f-7a34-4d49-87da-4ba1961d1ce0': function () {
            return {
                'id': 'be2f188f-7a34-4d49-87da-4ba1961d1ce0',
                'name': 'Capture H J_ Success Joke',
                'transitions': [{
                        'frm': 'be2f188f-7a34-4d49-87da-4ba1961d1ce0',
                        'to': 'c9f5acd9-7cb4-4bdb-b876-07eae6696222',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/CaptureHJ_SuccessJoke.mim',
                    'getPromptData': () => {
                        return {
                            jokeNumber: notepad.jokeNumber,
                            soundName: notepad.sound.name
                        };
                    }
                }
            };
        },
        'd2caefc7-c2b1-4675-a058-e8cb2418331f': function () {
            return {
                'id': 'd2caefc7-c2b1-4675-a058-e8cb2418331f',
                'name': 'Capture H J_ Success',
                'transitions': [{
                        'frm': 'd2caefc7-c2b1-4675-a058-e8cb2418331f',
                        'to': '3361a208-b756-48a0-b36f-101b6b9c4878',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/CaptureHJ_Success.mim',
                    'getPromptData': () => {
                        return {
                            loopMember: notepad.params.looper,
                            firstLoopMember: notepad.otherLooper
                        };
                    }
                }
            };
        },
        '3361a208-b756-48a0-b36f-101b6b9c4878': function () {
            return {
                'id': '3361a208-b756-48a0-b36f-101b6b9c4878',
                'name': 'Capture H J_ Its Tricky',
                'transitions': [{
                        'frm': '3361a208-b756-48a0-b36f-101b6b9c4878',
                        'to': 'a411f9f6-8772-4216-9841-4e34e3321192',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/CaptureHJ_ItsTricky.mim',
                    'getPromptData': () => {
                        return {
                            isFirstTime: notepad.params.looperCount === 1,
                            partial: notepad.params.partial
                        };
                    }
                }
            };
        },
        '0630af3a-e3cf-4dba-a2c8-41ce8f864d70': function () {
            return {
                'id': '0630af3a-e3cf-4dba-a2c8-41ce8f864d70',
                'name': 'Capture H J_ Prompt',
                'transitions': [{
                        'frm': '0630af3a-e3cf-4dba-a2c8-41ce8f864d70',
                        'to': 'b2037dbf-611c-4f6f-9b46-4090f2fd316a',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/CaptureHJ_Prompt.mim',
                    'getPromptData': () => {
                        return {
                            loopMember: notepad.params.looper,
                            collectionCount: notepad.goodTimes,
                            soundName: notepad.sound.name
                        };
                    }
                }
            };
        },
        '1a4eea4a-3c53-41e0-a5ed-24d5a9140988': function () {
            return {
                'id': '1a4eea4a-3c53-41e0-a5ed-24d5a9140988',
                'name': 'get previously-enrolled looper',
                'transitions': [{
                        'frm': '1a4eea4a-3c53-41e0-a5ed-24d5a9140988',
                        'to': '1e08b4bc-76c2-45a8-9ab2-5e478003cd5e',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        notepad.otherLooper = null;
                        jibo.kb.loop.loadLoop((err, loop) => {
                            if (err) {
                                notepad.params.log.warn('loop not loaded', err);
                                done();
                                return;
                            }
                            let enrollees = [];
                            for (let looper of loop) {
                                if (looper.data.enrolled && looper.data.enrolled.voice && looper._id != notepad.params.looper._id) {
                                    enrollees.push(looper);
                                }
                            }
                            if (enrollees.length) {
                                notepad.otherLooper = enrollees[Math.floor(Math.random() * enrollees.length)];
                            }
                            done();
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        'a411f9f6-8772-4216-9841-4e34e3321192': function () {
            return {
                'id': 'a411f9f6-8772-4216-9841-4e34e3321192',
                'name': 'cleanup',
                'transitions': [{
                        'frm': 'a411f9f6-8772-4216-9841-4e34e3321192',
                        'to': 'a2ae08b0-9f3f-424d-a4f3-7da982e0afdd',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        if (blackboard.attentionHandler) {
                            blackboard.attentionHandler.release();
                            blackboard.attentionHandler = null;
                        }
                        notepad.params.enroller.cleanup();
                        notepad.sound.unload();
                        notepad.params.embodiedListen.setAmbientMode('NORMAL');
                    }
                }
            };
        },
        'bdc95b19-ef2e-471d-98d0-71e8a165e724': function () {
            return {
                'id': 'bdc95b19-ef2e-471d-98d0-71e8a165e724',
                'name': 'initshit',
                'transitions': [{
                        'frm': 'bdc95b19-ef2e-471d-98d0-71e8a165e724',
                        'to': '1a4eea4a-3c53-41e0-a5ed-24d5a9140988',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        notepad.goodTimes = 0;
                        notepad.failureTracker = {
                            timeout: 0,
                            noisy: 0,
                            loud: 0,
                            bad: 0
                        };
                        notepad.params.embodiedListen.setAmbientMode('NO_BODY');
                    }
                }
            };
        },
        'cecc56b1-747b-46a3-970d-34674a2828f3': function () {
            return {
                'id': 'cecc56b1-747b-46a3-970d-34674a2828f3',
                'name': '~tryAgain',
                'transitions': [],
                'exceptions': [],
                'class': 'Flow.Throw',
                'options': {
                    'getPayload': () => {
                        return {};
                    }
                }
            };
        },
        'baa07283-d27c-420a-bf99-6668901932a6': function () {
            return {
                'id': 'baa07283-d27c-420a-bf99-6668901932a6',
                'name': '~tryAgain',
                'transitions': [{
                        'frm': 'baa07283-d27c-420a-bf99-6668901932a6',
                        'to': 'b2037dbf-611c-4f6f-9b46-4090f2fd316a',
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
        '83530355-64a7-46ee-b493-c072373480f2': function () {
            return {
                'id': '83530355-64a7-46ee-b493-c072373480f2',
                'name': 'prep eye',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '83530355-64a7-46ee-b493-c072373480f2',
                        'to': 'bdc95b19-ef2e-471d-98d0-71e8a165e724',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        if (blackboard.attentionHandler) {
                            blackboard.attentionHandler.release();
                            blackboard.attentionHandler = null;
                        }
                        jibo.expression.pushAttentionMode('OFF').then(attentionHandler => {
                            blackboard.attentionHandler = attentionHandler;
                            if (blackboard.hjToken) {
                                blackboard.hjToken.release();
                                blackboard.hjToken = null;
                            }
                            blackboard.hjToken = jibo.jetstream.setHotwordMode(jibo.jetstream.types.HotwordListenMode.Disabled);
                            blackboard.hjToken.activated.catch(err => {
                                notepad.params.log.warn('HJ listening pause failure ', err);
                            }).then(() => {
                                if (!jibo.face.views.currentView || jibo.face.views.currentView.id != 'eyeView') {
                                    jibo.face.views.createView('EyeView', null, true, done);
                                } else {
                                    done();
                                }
                            });
                            jibo.action.configure({ orientToHJ: false });
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        'c9f5acd9-7cb4-4bdb-b876-07eae6696222': function () {
            return {
                'id': 'c9f5acd9-7cb4-4bdb-b876-07eae6696222',
                'name': 'reenable global listen',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'c9f5acd9-7cb4-4bdb-b876-07eae6696222',
                        'to': 'd2caefc7-c2b1-4675-a058-e8cb2418331f',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        blackboard.track('Voice Training', { success: true });
                        blackboard.analyticsData.voice_success++;
                        jibo.action.configure({ orientToHJ: true });
                        if (blackboard.hjToken) {
                            blackboard.hjToken.release().catch(err => {
                                notepad.params.log.error('HJ listening failed to resume', err);
                            }).then(() => {
                                done('');
                            });
                            blackboard.hjToken = null;
                        } else {
                            done('');
                        }
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '0878dabb-2094-4ef7-aee1-64f3eff69bb0': function () {
            return {
                'id': '0878dabb-2094-4ef7-aee1-64f3eff69bb0',
                'name': 'reenable global listen',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '0878dabb-2094-4ef7-aee1-64f3eff69bb0',
                        'to': 'a411f9f6-8772-4216-9841-4e34e3321192',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        blackboard.track('Voice Training', { success: false });
                        blackboard.analyticsData.voice_failure++;
                        jibo.action.configure({ orientToHJ: true });
                        if (blackboard.hjToken) {
                            blackboard.hjToken.release().catch(err => {
                                notepad.params.log.error('HJ listening failed to resume', err);
                            }).then(() => {
                                done('');
                            });
                            blackboard.hjToken = null;
                        } else {
                            done('');
                        }
                    },
                    'onStop': () => {
                    }
                }
            };
        }
    };
};
},{"../../assets/enrollment/sounds/soundNames.json":1}],8:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        'meta': {
            'version': 1,
            'name': 'VoiceFaceTraining',
            'uri': '/Users/jon/Workspace/jibo/buildsdk/skills/introductions/src/flows/VoiceFaceTraining.flow'
        },
        'a942808a-4588-43e5-8c7b-e37b92ea04cc': function () {
            return {
                'id': 'a942808a-4588-43e5-8c7b-e37b92ea04cc',
                'name': 'Begin',
                'transitions': [{
                        'frm': 'a942808a-4588-43e5-8c7b-e37b92ea04cc',
                        'to': 'fc34ec32-8cd6-498f-851c-d3bd1ceb9e20',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Begin',
                'options': {
                    'inputParameters': () => {
                        return {
                            looper: null,
                            Enrollment: null,
                            enrolledBefore: false,
                            embodiedListen: null,
                            root: null,
                            enrollmentType: 'unknown',
                            log: null
                        };
                    }
                }
            };
        },
        '8beb5e4a-3836-4a06-9303-75fd778fef36': {
            'id': '8beb5e4a-3836-4a06-9303-75fd778fef36',
            'transitions': [],
            'exceptions': [],
            'class': 'Flow.Comment',
            'options': {}
        },
        '769709ea-2a84-4de4-b5be-8306ec0ff982': function () {
            return {
                'id': '769709ea-2a84-4de4-b5be-8306ec0ff982',
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
        'a1ffd492-e585-4639-a705-1dac16db834a': function () {
            return {
                'id': 'a1ffd492-e585-4639-a705-1dac16db834a',
                'name': 'CaptureFirstName',
                'transitions': [{
                        'frm': 'a1ffd492-e585-4639-a705-1dac16db834a',
                        'to': '3fbdeb05-9581-432d-a6ba-b868d2270a88',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Subflow',
                'options': {
                    'inputParameters': () => {
                        return {
                            looper: notepad.looper,
                            enroller: notepad.params.nameEnroller,
                            partial: false,
                            log: notepad.params.log.createChild('CaptureFirstName')
                        };
                    },
                    'getTransition': subflow_result_object => {
                        return subflow_result_object.transition;
                    },
                    'subflowId': () => {
                        return require('./CaptureFirstName');
                    }
                }
            };
        },
        '3fbdeb05-9581-432d-a6ba-b868d2270a88': function () {
            return {
                'id': '3fbdeb05-9581-432d-a6ba-b868d2270a88',
                'name': 'CaptureHeyJibo',
                'transitions': [{
                        'frm': '3fbdeb05-9581-432d-a6ba-b868d2270a88',
                        'to': 'b18c9e24-46a8-41ed-b12f-215f0a4dd562',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Subflow',
                'options': {
                    'inputParameters': () => {
                        let enroller = notepad.params.voiceEnroller;
                        enroller.init(notepad.looper._id, notepad.looper.data.loopId);
                        return {
                            looper: notepad.looper,
                            enroller: enroller,
                            enrolledBefore: notepad.params.enrolledBefore,
                            root: notepad.params.root,
                            looperCount: notepad.looperCount,
                            embodiedListen: notepad.params.embodiedListen,
                            partial: false,
                            log: notepad.params.log.createChild('CaptureHeyJibo')
                        };
                    },
                    'getTransition': subflow_result_object => {
                        return subflow_result_object.transition;
                    },
                    'subflowId': () => {
                        return require('./CaptureHeyJibo');
                    }
                }
            };
        },
        'b18c9e24-46a8-41ed-b12f-215f0a4dd562': function () {
            return {
                'id': 'b18c9e24-46a8-41ed-b12f-215f0a4dd562',
                'name': 'CaptureFace',
                'transitions': [
                    {
                        'frm': 'b18c9e24-46a8-41ed-b12f-215f0a4dd562',
                        'to': 'e2e106f7-a791-4d35-b483-fd2871193197',
                        'value': 'cancel'
                    },
                    {
                        'frm': 'b18c9e24-46a8-41ed-b12f-215f0a4dd562',
                        'to': '43a0dd71-7328-4360-bf6d-5f1d14bd7ec0',
                        'value': ''
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Subflow',
                'options': {
                    'inputParameters': () => {
                        let enroller = notepad.params.faceEnroller;
                        enroller.init(notepad.looper);
                        return {
                            looper: notepad.looper,
                            enroller: enroller,
                            embodiedListen: notepad.params.embodiedListen,
                            looperCount: notepad.looperCount,
                            partial: false,
                            log: notepad.params.log.createChild('CaptureFace')
                        };
                    },
                    'getTransition': subflow_result_object => {
                        return subflow_result_object.transition;
                    },
                    'subflowId': () => {
                        return require('./CaptureFace');
                    }
                }
            };
        },
        '04330d3c-d451-4e2d-aa46-7f543b7e8fbb': function () {
            return {
                'id': '04330d3c-d451-4e2d-aa46-7f543b7e8fbb',
                'name': 'Intro To Voice And Face Training',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '04330d3c-d451-4e2d-aa46-7f543b7e8fbb',
                        'to': '8b7b8514-ee49-44ff-a5b0-49e048e03389',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'getPromptData': () => {
                        return {
                            zodiacSign: notepad.sunSign,
                            anyMoreIntros: !!notepad.looperCount,
                            name: null
                        };
                    },
                    'onStatus': status => {
                    },
                    'onSuccess': results => {
                    },
                    'onFailure': results => {
                        let mimState = results.state;
                        let asrResults = results.asrResults;
                        let speakerIds = results.speakerIds;
                        let exception = results.exception;
                        return exception;
                    },
                    'getConfig': () => {
                        return { promptData: {} };
                    },
                    'onResults': results => {
                        let mimState = results.state;
                        let asrResults = results.asrResults;
                        let speakerIds = results.speakerIds;
                        let transition = results.firstGrammarTag;
                    },
                    'mimPath': 'mims/en-us/IntroToVoiceAndFaceTraining.mim'
                }
            };
        },
        'fc34ec32-8cd6-498f-851c-d3bd1ceb9e20': function () {
            return {
                'id': 'fc34ec32-8cd6-498f-851c-d3bd1ceb9e20',
                'name': 'Looper Provided',
                'transitions': [
                    {
                        'frm': 'fc34ec32-8cd6-498f-851c-d3bd1ceb9e20',
                        'to': '625af560-2443-4851-a2aa-de215c1990bb',
                        'value': ''
                    },
                    {
                        'frm': 'fc34ec32-8cd6-498f-851c-d3bd1ceb9e20',
                        'to': '3f7c248b-9d89-4eaa-8152-f7e170dbf57f',
                        'value': 'true'
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        notepad.looper = notepad.params.looper;
                        notepad.looperCount = 0;
                        result.cancel = true;
                        notepad.looperProvided = !!notepad.looper;
                        return notepad.looperProvided;
                    }
                }
            };
        },
        'e2e106f7-a791-4d35-b483-fd2871193197': function () {
            return {
                'id': 'e2e106f7-a791-4d35-b483-fd2871193197',
                'name': 'Set Cancel Result',
                'transitions': [{
                        'frm': 'e2e106f7-a791-4d35-b483-fd2871193197',
                        'to': '43a0dd71-7328-4360-bf6d-5f1d14bd7ec0',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        result.cancel = true;
                    }
                }
            };
        },
        'f2648d07-b3b1-4642-a1c2-2003fd80545b': function () {
            return {
                'id': 'f2648d07-b3b1-4642-a1c2-2003fd80545b',
                'name': '~next',
                'transitions': [{
                        'frm': 'f2648d07-b3b1-4642-a1c2-2003fd80545b',
                        'to': '625af560-2443-4851-a2aa-de215c1990bb',
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
        '50528999-c80d-497d-9049-8774874af732': function () {
            return {
                'id': '50528999-c80d-497d-9049-8774874af732',
                'name': '~next',
                'transitions': [],
                'exceptions': [],
                'class': 'Flow.Throw',
                'options': {
                    'getPayload': () => {
                        return {};
                    }
                }
            };
        },
        '3f7c248b-9d89-4eaa-8152-f7e170dbf57f': function () {
            return {
                'id': '3f7c248b-9d89-4eaa-8152-f7e170dbf57f',
                'name': 'what kind of enrollment',
                'transitions': [
                    {
                        'frm': '3f7c248b-9d89-4eaa-8152-f7e170dbf57f',
                        'to': '9fa8c67d-e2ed-4112-b2a8-b73920bdc9ef',
                        'value': 'all'
                    },
                    {
                        'frm': '3f7c248b-9d89-4eaa-8152-f7e170dbf57f',
                        'to': '15ec1b9c-5750-43bb-bfd5-f3f66ca7b988',
                        'value': ''
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        jibo.kb.loop.loadLoop((err, loop) => {
                            for (let looper of loop) {
                                if (notepad.looper == looper._id) {
                                    notepad.looper = looper;
                                    break;
                                }
                            }
                            let enrolled = notepad.looper.data.enrolled;
                            let intent = notepad.params.enrollmentType;
                            notepad.params.enrollmentType = null;
                            if (enrolled && (enrolled.voice || enrolled.face)) {
                                if (intent == 'name' || intent == 'face' || intent == 'voice') {
                                    intent = '~' + intent;
                                }
                                done(intent);
                            } else {
                                done('all');
                            }
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '4df213bc-0e35-4575-9b86-bef981c3f5cb': function () {
            return {
                'id': '4df213bc-0e35-4575-9b86-bef981c3f5cb',
                'name': 'Any More Intros',
                'transitions': [
                    {
                        'frm': '4df213bc-0e35-4575-9b86-bef981c3f5cb',
                        'to': '50528999-c80d-497d-9049-8774874af732',
                        'value': 'yes'
                    },
                    {
                        'frm': '4df213bc-0e35-4575-9b86-bef981c3f5cb',
                        'to': 'f19aca0f-bb26-41af-8f87-7a008e1d4f30',
                        'value': ''
                    }
                ],
                'exceptions': [{
                        'frm': '4df213bc-0e35-4575-9b86-bef981c3f5cb',
                        'to': 'f19aca0f-bb26-41af-8f87-7a008e1d4f30',
                        'value': '~'
                    }],
                'class': 'Mim.Question',
                'options': {
                    'mimPath': 'mims/en-us/AnyMoreIntros.mim',
                    'getPromptData': () => {
                        return {};
                    },
                    'onStatus': status => {
                        let mimState = status.state;
                        let asrResults = status.asrResults;
                        let speakerIds = status.speakerIds;
                    },
                    'onSuccess': results => {
                        let mimState = results.state;
                        let asrResults = results.asrResults;
                        let speakerIds = results.speakerIds;
                        let transition = results.firstGrammarTag;
                        notepad.anyMoreMaxErrors = false;
                        return transition;
                    },
                    'onFailure': results => {
                        let mimState = results.state;
                        let asrResults = results.asrResults;
                        let speakerIds = results.speakerIds;
                        let exception = results.exception;
                        notepad.anyMoreMaxErrors = true;
                        return exception;
                    }
                }
            };
        },
        '43a0dd71-7328-4360-bf6d-5f1d14bd7ec0': function () {
            return {
                'id': '43a0dd71-7328-4360-bf6d-5f1d14bd7ec0',
                'name': 'any unenrolled loopers?',
                'transitions': [
                    {
                        'frm': '43a0dd71-7328-4360-bf6d-5f1d14bd7ec0',
                        'to': '4df213bc-0e35-4575-9b86-bef981c3f5cb',
                        'value': 'true'
                    },
                    {
                        'frm': '43a0dd71-7328-4360-bf6d-5f1d14bd7ec0',
                        'to': '621945ed-9d39-48f7-b749-aeda952432ea',
                        'value': ''
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        jibo.kb.loop.loadLoop((err, loop) => {
                            if (err) {
                                notepad.params.log.warn('Loop not loaded. ', err);
                                done();
                            }
                            let anyUnenrolled = false;
                            for (let looper of loop) {
                                if (!looper.isJibo && (!looper.data.enrolled || !looper.data.enrolled.voice || !looper.data.enrolled.face)) {
                                    anyUnenrolled = true;
                                    break;
                                }
                            }
                            done(String(anyUnenrolled));
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '8b7b8514-ee49-44ff-a5b0-49e048e03389': function () {
            return {
                'id': '8b7b8514-ee49-44ff-a5b0-49e048e03389',
                'name': 'increment looper count',
                'transitions': [{
                        'frm': '8b7b8514-ee49-44ff-a5b0-49e048e03389',
                        'to': 'a1ffd492-e585-4639-a705-1dac16db834a',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        notepad.looperCount++;
                        return '';
                    }
                }
            };
        },
        'ba1df8a7-db80-46a2-86bf-d82487cb190b': function () {
            return {
                'id': 'ba1df8a7-db80-46a2-86bf-d82487cb190b',
                'name': 'get sun sign',
                'transitions': [{
                        'frm': 'ba1df8a7-db80-46a2-86bf-d82487cb190b',
                        'to': '04330d3c-d451-4e2d-aa46-7f543b7e8fbb',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        notepad.sunSign = null;
                        if (notepad.looper.data.birthday) {
                            jibo.loader.load('assets/enrollment/zodiac.json', (err, result) => {
                                let zodiac = result.signs;
                                let birthdate = new Date(notepad.looper.data.birthday);
                                let month = birthdate.getMonth() + 1;
                                let day = birthdate.getDate();
                                for (let sign of zodiac) {
                                    if (sign.start.month == month && sign.start.day <= day || sign.end.month == month && sign.end.day >= day) {
                                        notepad.sunSign = sign.name;
                                        break;
                                    }
                                }
                                done();
                            });
                        } else {
                            notepad.params.log.warn(`no birthday found for looper ${ notepad.looper.id }`);
                            done();
                        }
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        'f19aca0f-bb26-41af-8f87-7a008e1d4f30': function () {
            return {
                'id': 'f19aca0f-bb26-41af-8f87-7a008e1d4f30',
                'name': 'Enroll Wrap More Loopers',
                'transitions': [{
                        'frm': 'f19aca0f-bb26-41af-8f87-7a008e1d4f30',
                        'to': '769709ea-2a84-4de4-b5be-8306ec0ff982',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/EnrollWrapMoreLoopers.mim',
                    'getPromptData': () => {
                        return { anyMoreIntrosMaxErrors: notepad.anyMoreMaxErrors };
                    }
                }
            };
        },
        '621945ed-9d39-48f7-b749-aeda952432ea': function () {
            return {
                'id': '621945ed-9d39-48f7-b749-aeda952432ea',
                'name': 'Enroll Wrap No More Loopers',
                'transitions': [{
                        'frm': '621945ed-9d39-48f7-b749-aeda952432ea',
                        'to': '769709ea-2a84-4de4-b5be-8306ec0ff982',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/EnrollWrapNoMoreLoopers.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '15ec1b9c-5750-43bb-bfd5-f3f66ca7b988': function () {
            return {
                'id': '15ec1b9c-5750-43bb-bfd5-f3f66ca7b988',
                'name': 'Recognition Type Menu',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '15ec1b9c-5750-43bb-bfd5-f3f66ca7b988',
                        'to': '705b6486-31ea-41cb-aac3-4c0672600eab',
                        'value': ''
                    },
                    {
                        'frm': '15ec1b9c-5750-43bb-bfd5-f3f66ca7b988',
                        'to': '8b7b8514-ee49-44ff-a5b0-49e048e03389',
                        'value': 'all'
                    }
                ],
                'exceptions': [
                    {
                        'frm': '15ec1b9c-5750-43bb-bfd5-f3f66ca7b988',
                        'to': '55aed294-202f-40af-b62e-00a94285098b',
                        'value': '~InteractionError.MenuClosed'
                    },
                    {
                        'frm': '15ec1b9c-5750-43bb-bfd5-f3f66ca7b988',
                        'to': '705b6486-31ea-41cb-aac3-4c0672600eab',
                        'value': '~InteractionError'
                    }
                ],
                'class': 'Mim.Question',
                'options': {
                    'mimPath': 'mims/en-us/RecognitionTypeMenu.mim',
                    'getPromptData': () => {
                        return {};
                    },
                    'onStatus': status => {
                        let mimState = status.state;
                        let asrResults = status.asrResults;
                    },
                    'onSuccess': results => {
                        let intent = results.asrResults.intent;
                        if (intent == 'name' || intent == 'face' || intent == 'voice') {
                            intent = '~' + intent;
                        }
                        return intent;
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
        '322c030b-5d5d-4990-a258-e6c4c01888fb': function () {
            return {
                'id': '322c030b-5d5d-4990-a258-e6c4c01888fb',
                'name': 'CaptureFirstName',
                'transitions': [{
                        'frm': '322c030b-5d5d-4990-a258-e6c4c01888fb',
                        'to': '7e195664-dae0-4538-bc34-f9aa7b090fdd',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Subflow',
                'options': {
                    'inputParameters': () => {
                        return {
                            looper: notepad.looper,
                            enroller: notepad.params.nameEnroller,
                            partial: true,
                            log: notepad.params.log.createChild('CaptureFirstName')
                        };
                    },
                    'getTransition': subflow_result_object => {
                        return '';
                    },
                    'subflowId': () => {
                        return require('./CaptureFirstName');
                    }
                }
            };
        },
        '76c56e6d-b06e-455e-8579-540d6378f6f3': function () {
            return {
                'id': '76c56e6d-b06e-455e-8579-540d6378f6f3',
                'name': 'CaptureHeyJibo',
                'transitions': [{
                        'frm': '76c56e6d-b06e-455e-8579-540d6378f6f3',
                        'to': '7e195664-dae0-4538-bc34-f9aa7b090fdd',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Subflow',
                'options': {
                    'inputParameters': () => {
                        let enroller = notepad.params.voiceEnroller;
                        enroller.init(notepad.looper._id, notepad.looper.data.loopId);
                        return {
                            looper: notepad.looper,
                            enroller: enroller,
                            enrolledBefore: notepad.params.enrolledBefore,
                            root: notepad.params.root,
                            looperCount: notepad.looperCount,
                            embodiedListen: notepad.params.embodiedListen,
                            partial: true,
                            log: notepad.params.log.createChild('CaptureHeyJibo')
                        };
                    },
                    'getTransition': subflow_result_object => {
                        return '';
                    },
                    'subflowId': () => {
                        return require('./CaptureHeyJibo');
                    }
                }
            };
        },
        '89e172f6-ba12-483b-bf40-52164d354115': function () {
            return {
                'id': '89e172f6-ba12-483b-bf40-52164d354115',
                'name': 'CaptureFace',
                'transitions': [{
                        'frm': '89e172f6-ba12-483b-bf40-52164d354115',
                        'to': '7e195664-dae0-4538-bc34-f9aa7b090fdd',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Subflow',
                'options': {
                    'inputParameters': () => {
                        let enroller = notepad.params.faceEnroller;
                        enroller.init(notepad.looper);
                        return {
                            looper: notepad.looper,
                            enroller: enroller,
                            embodiedListen: notepad.params.embodiedListen,
                            looperCount: notepad.looperCount,
                            partial: true,
                            log: notepad.params.log.createChild('CaptureFace')
                        };
                    },
                    'getTransition': subflow_result_object => {
                        return '';
                    },
                    'subflowId': () => {
                        return require('./CaptureFace');
                    }
                }
            };
        },
        '625af560-2443-4851-a2aa-de215c1990bb': function () {
            return {
                'id': '625af560-2443-4851-a2aa-de215c1990bb',
                'name': 'Voice Face Training Menu',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '625af560-2443-4851-a2aa-de215c1990bb',
                        'to': '663654ec-cace-42ac-a54d-509def221177',
                        'value': 'cancel'
                    },
                    {
                        'frm': '625af560-2443-4851-a2aa-de215c1990bb',
                        'to': '3f7c248b-9d89-4eaa-8152-f7e170dbf57f',
                        'value': ''
                    }
                ],
                'exceptions': [
                    {
                        'frm': '625af560-2443-4851-a2aa-de215c1990bb',
                        'to': '663654ec-cace-42ac-a54d-509def221177',
                        'value': '~InteractionError.MenuClosed'
                    },
                    {
                        'frm': '625af560-2443-4851-a2aa-de215c1990bb',
                        'to': '72827625-ad2a-43f6-9442-cad0f5e35209',
                        'value': '~'
                    }
                ],
                'class': 'Mim.Question',
                'options': {
                    'mimPath': 'mims/en-us/VoiceFaceTrainingMenu.mim',
                    'getPromptData': () => {
                        return { intent: notepad.params.enrollmentType ? notepad.params.enrollmentType : 'unknown' };
                    },
                    'onStatus': status => {
                        let mimState = status.state;
                        let asrResults = status.asrResults;
                    },
                    'onSuccess': results => {
                        let mimState = results.state;
                        let asrResults = results.asrResults;
                        if (asrResults && asrResults.entities && asrResults.entities.loopMemberReferent) {
                            notepad.looper = asrResults.entities.loopMemberReferent.split(',')[0];
                        }
                        return asrResults.intent || '';
                    },
                    'onFailure': results => {
                        let mimState = results.state;
                        let asrResults = results.asrResults;
                        let exception = results.exception;
                        return exception;
                    },
                    'checkResult': result => {
                        if (result.intent === 'loopmember' && !result.entities.loopMemberReferent) {
                            result.nlu = null;
                        }
                    }
                }
            };
        },
        '55aed294-202f-40af-b62e-00a94285098b': function () {
            return {
                'id': '55aed294-202f-40af-b62e-00a94285098b',
                'name': 'from Looper menu?',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '55aed294-202f-40af-b62e-00a94285098b',
                        'to': '663654ec-cace-42ac-a54d-509def221177',
                        'value': ''
                    },
                    {
                        'frm': '55aed294-202f-40af-b62e-00a94285098b',
                        'to': '625af560-2443-4851-a2aa-de215c1990bb',
                        'value': 'true'
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        return !notepad.looperProvided;
                    }
                }
            };
        },
        'd01d2bde-156e-4900-94c7-16da3fed010f': function () {
            return {
                'id': 'd01d2bde-156e-4900-94c7-16da3fed010f',
                'name': 'back',
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
        '7e195664-dae0-4538-bc34-f9aa7b090fdd': function () {
            return {
                'id': '7e195664-dae0-4538-bc34-f9aa7b090fdd',
                'name': 'Recognition Any More',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '7e195664-dae0-4538-bc34-f9aa7b090fdd',
                        'to': '0de5ac9d-9090-4b6b-81af-36f3a74e1a68',
                        'value': ''
                    },
                    {
                        'frm': '7e195664-dae0-4538-bc34-f9aa7b090fdd',
                        'to': '15ec1b9c-5750-43bb-bfd5-f3f66ca7b988',
                        'value': 'yes'
                    }
                ],
                'exceptions': [{
                        'frm': '7e195664-dae0-4538-bc34-f9aa7b090fdd',
                        'to': '0de5ac9d-9090-4b6b-81af-36f3a74e1a68',
                        'value': '~InteractionError'
                    }],
                'class': 'Mim.Question',
                'options': {
                    'mimPath': 'mims/en-us/RecognitionAnyMore.mim',
                    'getPromptData': () => {
                        return {};
                    },
                    'onStatus': status => {
                        let mimState = status.state;
                        let asrResults = status.asrResults;
                    },
                    'onSuccess': results => {
                        let intent = results.asrResults.intent;
                        if (intent == 'name' || intent == 'face' || intent == 'voice') {
                            intent = '~' + intent;
                        }
                        notepad.anyMoreMaxErrors = false;
                        return intent;
                    },
                    'onFailure': results => {
                        let mimState = results.state;
                        let asrResults = results.asrResults;
                        let exception = results.exception;
                        notepad.anyMoreMaxErrors = !exception.includes('MenuClosed');
                        return exception;
                    }
                }
            };
        },
        '8c1d024d-a600-4f7b-9d4f-c3f721729ba9': function () {
            return {
                'id': '8c1d024d-a600-4f7b-9d4f-c3f721729ba9',
                'name': '~name',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '8c1d024d-a600-4f7b-9d4f-c3f721729ba9',
                        'to': '322c030b-5d5d-4990-a258-e6c4c01888fb',
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
        'dabfbb24-4bf9-42d4-b187-0c11a3685d74': function () {
            return {
                'id': 'dabfbb24-4bf9-42d4-b187-0c11a3685d74',
                'name': '~face',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'dabfbb24-4bf9-42d4-b187-0c11a3685d74',
                        'to': '89e172f6-ba12-483b-bf40-52164d354115',
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
        '6c3758a6-3180-4d4d-b60f-e441e93bb214': function () {
            return {
                'id': '6c3758a6-3180-4d4d-b60f-e441e93bb214',
                'name': '~voice',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '6c3758a6-3180-4d4d-b60f-e441e93bb214',
                        'to': '76c56e6d-b06e-455e-8579-540d6378f6f3',
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
        '0de5ac9d-9090-4b6b-81af-36f3a74e1a68': function () {
            return {
                'id': '0de5ac9d-9090-4b6b-81af-36f3a74e1a68',
                'name': 'Recognition Exit',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '0de5ac9d-9090-4b6b-81af-36f3a74e1a68',
                        'to': '769709ea-2a84-4de4-b5be-8306ec0ff982',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/RecognitionExit.mim',
                    'getPromptData': () => {
                        return { recognitionAnyMoreMaxErrors: notepad.anyMoreMaxErrors };
                    }
                }
            };
        },
        '6188ead4-12ea-4c19-a1de-03e6300e85f3': {
            'id': '6188ead4-12ea-4c19-a1de-03e6300e85f3',
            'asset-pack': 'core',
            'transitions': [],
            'exceptions': [],
            'class': 'Flow.Comment',
            'options': {}
        },
        '9fa8c67d-e2ed-4112-b2a8-b73920bdc9ef': function () {
            return {
                'id': '9fa8c67d-e2ed-4112-b2a8-b73920bdc9ef',
                'name': 'show eye',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '9fa8c67d-e2ed-4112-b2a8-b73920bdc9ef',
                        'to': 'ba1df8a7-db80-46a2-86bf-d82487cb190b',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        if (jibo.face.views.currentView && jibo.face.views.currentView.id == 'eyeView') {
                            done();
                        } else {
                            jibo.face.views.createView('EyeView', null, true, done);
                        }
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '1e2b4ed1-260d-43d6-8a3c-8869c54fcac7': function () {
            return {
                'id': '1e2b4ed1-260d-43d6-8a3c-8869c54fcac7',
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
        '705b6486-31ea-41cb-aac3-4c0672600eab': function () {
            return {
                'id': '705b6486-31ea-41cb-aac3-4c0672600eab',
                'name': 'remove all views',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '705b6486-31ea-41cb-aac3-4c0672600eab',
                        'to': '769709ea-2a84-4de4-b5be-8306ec0ff982',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        jibo.face.views.changeView({
                            removeAll: true,
                            leaveEmpty: true
                        }, done, done);
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '72827625-ad2a-43f6-9442-cad0f5e35209': function () {
            return {
                'id': '72827625-ad2a-43f6-9442-cad0f5e35209',
                'name': 'remove all views',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '72827625-ad2a-43f6-9442-cad0f5e35209',
                        'to': '1e2b4ed1-260d-43d6-8a3c-8869c54fcac7',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        jibo.face.views.changeView({
                            removeAll: true,
                            leaveEmpty: true
                        }, done, done);
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '663654ec-cace-42ac-a54d-509def221177': function () {
            return {
                'id': '663654ec-cace-42ac-a54d-509def221177',
                'name': 'remove one view',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '663654ec-cace-42ac-a54d-509def221177',
                        'to': 'd01d2bde-156e-4900-94c7-16da3fed010f',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        jibo.face.views.changeView({ remove: true }, done, done);
                    },
                    'onStop': () => {
                    }
                }
            };
        }
    };
};
},{"./CaptureFace":5,"./CaptureFirstName":6,"./CaptureHeyJibo":7}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const be_framework_1 = require("@be/be-framework");
const jibo = require("jibo");
const VoiceEnroller_1 = require("./enrollment/VoiceEnroller");
const FaceEnroller_1 = require("./enrollment/FaceEnroller");
const NameEnroller_1 = require("./enrollment/NameEnroller");
class Introductions extends be_framework_1.BeSkill {
    constructor(assetPack) {
        super(assetPack);
        this.setEnrollmentLightRingOn = this.setEnrollmentLightRingOn.bind(this);
        this.setEnrollmentLightRingOff = this.setEnrollmentLightRingOff.bind(this);
    }
    preload(done) {
        done();
    }
    postInit(done) {
        jibo.kb.createModel('/introductions').loadRoot((err, root) => {
            if (err) {
                this.log.error('error loading introductions root from KB', err);
            }
            this.root = root;
            done();
        });
    }
    open(result, refresh, previousSkillName) {
        if (refresh) {
            this.close(this.open.bind(this, result));
            return;
        }
        if (!result) {
            this.log.warn('no launch result. NBD if standalone');
            result = {
                nlu: {}
            };
        }
        let source;
        switch (previousSkillName) {
            case '@be/main-menu':
                source = 'menu';
                break;
            case '@be/who-am-i':
                source = 'who_am_i';
                break;
            case '@be/tutorial':
                source = 'fc';
                break;
            default:
                source = 'hey_jibo';
                break;
        }
        this.track('Introductions Opened', { launch_source: source });
        const entities = result && result.nlu && result.nlu.entities;
        let loopah = entities && entities.loopMemberReferent && entities.loopMemberReferent !== 'null' ? entities.loopMemberReferent.split(',')[0] : null;
        let enrollmentType = entities.enrollmentType;
        let enrolledBefore = false;
        if (!this.root.data.enrollmentRun) {
            this.root.data.enrollmentRun = true;
            this.root.save();
        }
        else {
            enrolledBefore = true;
        }
        this.voiceEnroller = new VoiceEnroller_1.default(this.log.createChild('VoiceEnroller'));
        this.faceEnroller = new FaceEnroller_1.default(this.log.createChild('FaceEnroller'));
        this.nameEnroller = new NameEnroller_1.default(this.log.createChild('NameEnroller'));
        this._blackboard = {
            track: this.track,
            analyticsData: {
                voice_success: 0,
                voice_failure: 0,
                face_success: 0,
                face_failure: 0,
                name_success: 0,
                name_failure: 0,
                name_initial_success: false
            }
        };
        this.flow = jibo.flow.run(require('./flows/VoiceFaceTraining'), {
            params: {
                looper: loopah,
                voiceEnroller: this.voiceEnroller,
                faceEnroller: this.faceEnroller,
                nameEnroller: this.nameEnroller,
                enrolledBefore: enrolledBefore,
                embodiedListen: jibo.embodied.listen,
                root: this.root,
                enrollmentType: enrollmentType,
                log: this.log.createChild('Enrollment')
            },
            enableLogging: true,
            assetPack: this.assetPack,
            blackboard: this._blackboard
        }, (err, status) => {
            if (status !== jibo.bt.Status.INTERRUPTED) {
                this.exit();
            }
        });
    }
    close(done) {
        this.setEnrollmentLightRingOff();
        if (this.voiceEnroller) {
            this.voiceEnroller.destroy();
            this.voiceEnroller = null;
        }
        if (this.faceEnroller) {
            this.faceEnroller.destroy();
            this.faceEnroller = null;
        }
        if (this.nameEnroller) {
            this.nameEnroller.destroy();
            this.nameEnroller = null;
        }
        if (this._blackboard) {
            this.track('Introductions Finished', this._blackboard.analyticsData);
            if (this._blackboard.attentionHandler) {
                this._blackboard.attentionHandler.release();
                this._blackboard.attentionHandler = null;
            }
        }
        this._blackboard = null;
        let reenableGL = () => {
            jibo.action.configure({ orientToHJ: true });
            jibo.jetstream.resetHotwordMode().catch((err) => {
                this.log.error('GL RESUME FAILURE', err);
            }).then(() => {
                done();
            });
        };
        if (this.flow) {
            this.flow.stopAndDestroy().then(() => {
                this.flow = null;
                jibo.media.setViewfinder(false);
                if (jibo.face.views.currentView && jibo.face.views.currentView.id !== 'eyeView') {
                    jibo.face.views.changeView({ removeAll: true, leaveEmpty: true }, () => { reenableGL(); }, () => { reenableGL(); });
                }
                else {
                    jibo.face.views.forceEyeView(() => {
                        reenableGL();
                    }, null, null, null, () => {
                        this.log.error('force eye view error, continuing anyway');
                        reenableGL();
                    });
                }
            });
        }
        else {
            reenableGL();
        }
    }
    setEnrollmentLightRingOn() {
        jibo.embodied.listen.enterActiveMode(jibo.embodied.listen.ActiveListenMode.UI);
    }
    setEnrollmentLightRingOff() {
        jibo.embodied.listen.exitActiveMode();
    }
}
module.exports = Introductions;

},{"./enrollment/FaceEnroller":2,"./enrollment/NameEnroller":3,"./enrollment/VoiceEnroller":4,"./flows/VoiceFaceTraining":8,"@be/be-framework":undefined,"jibo":undefined}]},{},[9])(9)
});
//# sourceMappingURL=index.js.map