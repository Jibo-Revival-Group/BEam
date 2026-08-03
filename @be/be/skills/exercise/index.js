(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.beexercise = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
const AUDIO_PATH = './resources/music/';
const ASSETS = [
    { id: 'audio00', src: AUDIO_PATH + 'mus_yoga_01.ogg', loop: true },
    { id: 'audio01', src: AUDIO_PATH + 'mus_yoga_02.ogg', loop: true },
    { id: 'audio02', src: AUDIO_PATH + 'mus_yoga_03.ogg', loop: true }
];
class AudioPlayer {
    constructor(log) {
        this.play = () => {
            if (this._audio != null && this._audio.paused === true) {
                this._audio.paused = false;
                return;
            }
            if (!this._loadPromise) {
                this._log.error('Audio Player not initialized');
                return;
            }
            this._loadPromise.then(() => {
                this._audio = jibo.sound.play(this._currentAsset.id);
            });
        };
        this._log = log;
    }
    _preloadAudio() {
        this._loadPromise = new Promise((resolve) => {
            jibo.loader.load(this._currentAsset, {
                complete: function (err, results) {
                    resolve();
                }
            });
        });
        return this._loadPromise;
    }
    init() {
        this._currentAsset = ASSETS[Math.floor(Math.random() * ASSETS.length)];
        return this._preloadAudio();
    }
    pause() {
        this._audio.paused = true;
    }
    stopAndDestroy() {
        if (this._audio) {
            this._audio.destroy();
            this._audio = null;
        }
        this._currentAsset = null;
        this._log = null;
        this._loadPromise = null;
    }
}
exports.default = AudioPlayer;

},{"jibo":undefined}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
const be_framework_1 = require("@be/be-framework");
const CustomView_1 = require("./gui/CustomView");
var PromiseUtils = be_framework_1.libraries.jibo_cai_utils.PromiseUtils;
var CancelTokenSession = be_framework_1.libraries.jibo_cai_utils.CancelTokenSession;
const Audio_1 = require("./Audio");
const Routines_1 = require("./Routines");
const Analytics_1 = require("./analytics/Analytics");
const promisify = PromiseUtils.promisify;
const MainFlow = require('./flows/main.flow');
class Exercise extends be_framework_1.BeSkill {
    constructor(assetPack) {
        super(assetPack);
        this._hjHeard = () => {
            if (this._exerciseView) {
                this._exerciseView.hideImage(false, false)
                    .then(() => {
                    this._exerciseView.unhideEye(false);
                });
            }
        };
        this._listenComplete = () => {
            if (this._exerciseView) {
                this._exerciseView.hideEye(false)
                    .then(() => {
                    this._exerciseView.showImage(false);
                });
            }
        };
        this._runFlow = () => {
            this._exerciseView = jibo.face.views.createView('CustomView');
            this._routinePlayer = new Routines_1.default();
            this._audioPlayer = new Audio_1.default(this.log);
            this._session = null;
            let options = {
                assetPack: this.assetPack,
                blackboard: {
                    log: this.log,
                    skill: this,
                    kbData: this._root.data,
                    intent: this._intent,
                    routine: this._routine,
                    routinePlayer: this._routinePlayer,
                    exerciseView: this._exerciseView,
                    intentions: this._intentions,
                    audioPlayer: this._audioPlayer,
                    Analytics: Analytics_1.default
                }
            };
            this._flow = jibo.flow.run(MainFlow, options, (err, status) => {
                if (status === jibo.bt.Status.INTERRUPTED) {
                    return;
                }
                this.exit();
            });
        };
    }
    preload(done) {
        jibo.face.views.creator.registerClass(CustomView_1.default);
        Promise.all([
            this._kbm.loadRoot().then((root) => {
                this._root = root;
                if (typeof this._root.data.firstTime == "undefined") {
                    this._root.data.firstTime = true;
                }
            }),
            promisify((cb) => {
                jibo.loader.load('resources/yoga-routines.json', cb);
            }).then((routines) => {
                this._routines = routines;
            }).catch((err) => {
                this.log.warn('Routines load failed', err);
                throw err;
            }),
            promisify((cb) => {
                jibo.loader.load('resources/yoga-rounds.json', cb);
            }).then((rounds) => {
                this._rounds = rounds;
            }).catch((err) => {
                this.log.warn('Routines load failed', err);
                throw err;
            }),
            promisify((cb) => {
                jibo.loader.load('resources/DailyIntentions.json', cb);
            }).then((intentions) => {
                this._intentions = intentions;
            }).catch((err) => {
                this.log.warn('Routines load failed', err);
                throw err;
            })
        ]).then(() => { done(); }).catch(done);
    }
    postInit(done) {
        Analytics_1.default.init(this);
        this._kbm = jibo.kb.createModel('/exercise');
        done();
    }
    open(result, refresh, previousSkillName) {
        jibo.mim.silentMenus = false;
        this._intent = 'exerciseDoYoga';
        this._routine = null;
        if (result) {
            if (result.intent && result.intent !== 'menu') {
                this._intent = result.intent;
            }
            if (result.entities && result.entities.routine) {
                this._routine = result.entities.routine;
            }
        }
        let promises = [];
        if (refresh) {
            promises.push(this._cleanup().catch((err) => { this.log.error('cleanup error', err); }).then(() => this.forceEye()));
        }
        else {
            promises.push(this.forceEye());
        }
        this._session = new CancelTokenSession();
        this._session.wrap(this.promiseEvery(promises)).then(this._runFlow, this._runFlow);
    }
    preparePlaying(routineName) {
        this._routinePlayer.init(this._routines.find(routine => routine.name == routineName), this._rounds);
        jibo.jetstream.events.hjHeard.on(this._hjHeard);
        jibo.jetstream.events.globalTurnResult.on(this._listenComplete);
        return new Promise((resolve) => {
            jibo.face.views.changeView({
                addView: this._exerciseView,
                transitionOpen: jibo.face.views.TRANSITION.NONE,
                transitionClose: jibo.face.views.TRANSITION.NONE,
            }, (view) => {
                resolve();
            });
        });
    }
    forceEye(transitionOpen = null, transitionClose = null) {
        return new Promise((resolve) => {
            jibo.face.views.forceEyeView(() => {
                resolve();
            }, null, transitionOpen, transitionClose, (err) => {
                this.log.warn('Failed forceEye', err);
                resolve();
            });
        });
    }
    _cleanup() {
        jibo.jetstream.events.hjHeard.off(this._hjHeard);
        jibo.jetstream.events.globalTurnResult.off(this._listenComplete);
        if (this._audioPlayer) {
            this._audioPlayer.stopAndDestroy();
            this._audioPlayer = null;
        }
        if (this._routinePlayer) {
            this._routinePlayer.destroy();
            this._routinePlayer = null;
        }
        if (this._exerciseView) {
            this._exerciseView.cleanUp();
        }
        let promises = [jibo.expression.setLEDColor([0, 0, 0])];
        if (this._session) {
            promises.push(this._session.cancel());
            this._session = null;
        }
        if (this._flow) {
            promises.push(this._flow.stopAndDestroy());
            this._flow = null;
        }
        return this.promiseEvery(promises);
    }
    close(done) {
        jibo.face.views.creator.unregisterClass('CustomView');
        this._intentions = null;
        this._routine = null;
        let promises = [this._cleanup()];
        if (this._root) {
            this._root.data.firstTime = false;
            promises.push(new Promise((resolve) => {
                promisify(cb => this._root.save(cb))
                    .then(() => resolve())
                    .catch((err) => {
                    this.log.warn('failed to save KB');
                    resolve();
                });
            }));
            this._root = null;
        }
        this.promiseEvery(promises).catch((err) => {
            this.log.error('skill close error caught', err);
        }).then(() => {
            this.cleanupViews()
                .then(() => {
                done();
            });
        });
    }
    cleanupViews() {
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
    promiseEvery(promises) {
        let rejected = false;
        let length = promises.length;
        let allPromises = new Array(length);
        let results = new Array(length);
        for (let i = 0; i < length; i++) {
            allPromises.push(new Promise((resolve) => {
                promises[i]
                    .then((result) => { results[i] = result; })
                    .catch((error) => {
                    results[i] = error;
                    rejected = true;
                })
                    .then(resolve);
            }));
        }
        return new Promise((resolve, reject) => {
            Promise.all(allPromises).then(() => {
                if (rejected) {
                    reject(results);
                }
                else {
                    resolve(results);
                }
            });
        });
    }
}
exports.default = Exercise;

},{"./Audio":1,"./Routines":4,"./analytics/Analytics":5,"./flows/main.flow":7,"./gui/CustomView":8,"@be/be-framework":undefined,"jibo":undefined}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RoundPlayer {
    constructor(name) {
        this._parts = [];
        this._currentPart = -1;
        this.name = name;
    }
    get currentPart() {
        return this._parts[this._currentPart];
    }
    addPart(part) {
        this._parts.push(part);
    }
    addParts(parts) {
        this._parts = parts;
    }
    getNextPart() {
        let nextPart = this._parts[++this._currentPart];
        if (!nextPart) {
            this._currentPart = -1;
        }
        return nextPart;
    }
    destroy() {
        this._parts = null;
        this._currentPart = null;
    }
}
exports.default = RoundPlayer;

},{}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Rounds_1 = require("./Rounds");
class RoutinePlayer {
    constructor() {
        this._rounds = [];
        this._sequence = [];
    }
    init(routine, rounds) {
        this._sequence = routine.sequence;
        this._currentRound = 0;
        this._sequence.forEach((roundName) => {
            let roundPlayer = new Rounds_1.default(roundName);
            let parts = rounds.filter(part => part.name === roundName);
            roundPlayer.addParts(parts);
            this._rounds.push(roundPlayer);
        });
    }
    getNextPart() {
        let part = this.getCurrentRound().getNextPart();
        if (!part) {
            let newRound = this.getNextRound();
            if (!newRound) {
                return;
            }
            else {
                return newRound.getNextPart();
            }
        }
        else {
            return part;
        }
    }
    getCurrentRound(roundIdx = this._currentRound) {
        return this._rounds.find((roundPlayer) => {
            return roundPlayer.name === this._sequence[roundIdx];
            ;
        });
    }
    getNextRound() {
        if (++this._currentRound === this._sequence.length) {
            return null;
        }
        return this.getCurrentRound();
    }
    destroy() {
        for (let round of this._rounds) {
            round.destroy();
        }
        this._rounds = null;
        this._sequence = null;
        this._currentRound = null;
    }
}
exports.default = RoutinePlayer;

},{"./Rounds":3}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Analytics {
    static init(skill) {
        this.skill = skill;
    }
    static routineStarted(routine) {
        this.skill.track('Workout Routine Started', { routine });
    }
    static routineEnded(routine) {
        this.skill.track('Workout Routine Ended', { routine });
    }
}
exports.default = Analytics;

},{}],6:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        'meta': {
            'version': 1,
            'name': 'executeRoutine',
            'uri': '/Users/jon/Workspace/jibo/buildsdk/skills/exercise/src/flows/executeRoutine.flow'
        },
        '75a918a9-7bde-4419-8939-a4d9dd776957': function () {
            return {
                'id': '75a918a9-7bde-4419-8939-a4d9dd776957',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '75a918a9-7bde-4419-8939-a4d9dd776957',
                        'to': '691d9f78-7276-4de4-a246-67272d1718c8',
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
        '4922ff2c-16e8-4923-9ede-d6b51afa93af': function () {
            return {
                'id': '4922ff2c-16e8-4923-9ede-d6b51afa93af',
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
        '26f28d77-2b6e-4893-9515-42bde42e3b29': function () {
            return {
                'id': '26f28d77-2b6e-4893-9515-42bde42e3b29',
                'name': '~loadMenuFailed',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '26f28d77-2b6e-4893-9515-42bde42e3b29',
                        'to': '4922ff2c-16e8-4923-9ede-d6b51afa93af',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Catch',
                'options': {
                    'getTransition': (exception, payload) => {
                        blackboard.log.error('flow caught error', exception, payload);
                        return '';
                    }
                }
            };
        },
        'e904a83a-7687-4671-9f76-4d54d8c8d01a': function () {
            return {
                'id': 'e904a83a-7687-4671-9f76-4d54d8c8d01a',
                'name': 'ExerciseReadyToStart',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': 'e904a83a-7687-4671-9f76-4d54d8c8d01a',
                        'to': 'ce7c0af8-777b-455b-8ceb-55a6e02eff6d',
                        'value': ''
                    },
                    {
                        'frm': 'e904a83a-7687-4671-9f76-4d54d8c8d01a',
                        'to': 'a44e739b-beaa-4aa9-9b24-58c6072fe945',
                        'value': 'imReady'
                    }
                ],
                'exceptions': [],
                'class': 'Mim.Optional-Response',
                'options': {
                    'mimPath': 'mims/en-us/ExerciseReadyToStart.mim',
                    'getPromptData': () => {
                        let alreadyPlayed = false;
                        if (!blackboard.kbData.routines) {
                            blackboard.kbData.routines = {};
                        }
                        if (!blackboard.kbData.routines[blackboard.routine]) {
                            blackboard.kbData.routines[blackboard.routine] = {
                                firstPlay: false,
                                alreadyPlayed: false
                            };
                        } else {
                            alreadyPlayed = !blackboard.kbData.routines[blackboard.routine].firstPlay;
                        }
                        return {
                            routineName: blackboard.routine,
                            alreadyPlayed: alreadyPlayed
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
                    }
                }
            };
        },
        'dc6defd9-7360-47f0-8316-57f532ac7178': function () {
            return {
                'id': 'dc6defd9-7360-47f0-8316-57f532ac7178',
                'name': '~playFailed',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'dc6defd9-7360-47f0-8316-57f532ac7178',
                        'to': '4922ff2c-16e8-4923-9ede-d6b51afa93af',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Catch',
                'options': {
                    'getTransition': (exception, payload) => {
                        blackboard.log.error('flow caught error', exception, payload);
                        return '';
                    }
                }
            };
        },
        '2d3df81c-9793-4076-a717-db21680b81b0': function () {
            return {
                'id': '2d3df81c-9793-4076-a717-db21680b81b0',
                'name': 'ExercisePauseHold',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '2d3df81c-9793-4076-a717-db21680b81b0',
                        'to': '6b3c5996-221a-4eeb-bfd9-492899ca2b41',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/ExercisePauseHold.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        'fecef0bb-5282-4af1-a144-b4cfa0e237e4': function () {
            return {
                'id': 'fecef0bb-5282-4af1-a144-b4cfa0e237e4',
                'name': 'ExercisePauseQuit',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'fecef0bb-5282-4af1-a144-b4cfa0e237e4',
                        'to': '4922ff2c-16e8-4923-9ede-d6b51afa93af',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/ExercisePauseQuit.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '6b3c5996-221a-4eeb-bfd9-492899ca2b41': function () {
            return {
                'id': '6b3c5996-221a-4eeb-bfd9-492899ca2b41',
                'name': 'PauseMachine',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '6b3c5996-221a-4eeb-bfd9-492899ca2b41',
                        'to': '8fcd3a48-7901-4e41-a78f-2df18dc7001e',
                        'value': 'timerFinished'
                    },
                    {
                        'frm': '6b3c5996-221a-4eeb-bfd9-492899ca2b41',
                        'to': '6296fef5-07ea-4134-888d-74ab2a02b2dd',
                        'value': 'stop'
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        done('~playFailed');
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '8fcd3a48-7901-4e41-a78f-2df18dc7001e': function () {
            return {
                'id': '8fcd3a48-7901-4e41-a78f-2df18dc7001e',
                'name': 'ExercisePauseTimeout',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '8fcd3a48-7901-4e41-a78f-2df18dc7001e',
                        'to': '4922ff2c-16e8-4923-9ede-d6b51afa93af',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/ExercisePauseTimeout.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '3064554a-a7b9-4ab5-a79a-93ee773cbf28': function () {
            return {
                'id': '3064554a-a7b9-4ab5-a79a-93ee773cbf28',
                'name': 'preparePlaying',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '3064554a-a7b9-4ab5-a79a-93ee773cbf28',
                        'to': '1d09b4d6-e9c1-42c8-9ed1-72606db0390c',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        blackboard.Analytics.routineStarted(blackboard.routine);
                        blackboard.skill.preparePlaying(blackboard.routine).then(result => {
                            done();
                        }).catch(() => done('~playFailed'));
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '6296fef5-07ea-4134-888d-74ab2a02b2dd': function () {
            return {
                'id': '6296fef5-07ea-4134-888d-74ab2a02b2dd',
                'name': 'ExercisePauseQuit',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '6296fef5-07ea-4134-888d-74ab2a02b2dd',
                        'to': '4922ff2c-16e8-4923-9ede-d6b51afa93af',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/ExercisePauseQuit.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        'e6b13d36-b2fe-4ee0-8616-14fbdfa1a6eb': function () {
            return {
                'id': 'e6b13d36-b2fe-4ee0-8616-14fbdfa1a6eb',
                'name': 'Exercise Daily Intention Intro',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'e6b13d36-b2fe-4ee0-8616-14fbdfa1a6eb',
                        'to': '3711a0e6-5bab-4fcc-9207-e19beef89565',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/ExerciseDailyIntentionIntro.mim',
                    'getPromptData': () => {
                        notepad.intention = blackboard.intentions[Math.floor(Math.random() * blackboard.intentions.length)];
                        return { dailyIntention: notepad.intention };
                    }
                }
            };
        },
        '72773625-59ac-4c58-b2a9-583860bdb127': function () {
            return {
                'id': '72773625-59ac-4c58-b2a9-583860bdb127',
                'name': 'Exercise Daily Intention Outro',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '72773625-59ac-4c58-b2a9-583860bdb127',
                        'to': '4922ff2c-16e8-4923-9ede-d6b51afa93af',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/ExerciseDailyIntentionOutro.mim',
                    'getPromptData': () => {
                        return { dailyIntention: notepad.intention };
                    }
                }
            };
        },
        '9bb7bad0-af7a-49a2-ab28-bbbf1263c092': function () {
            return {
                'id': '9bb7bad0-af7a-49a2-ab28-bbbf1263c092',
                'name': 'ExerciseRoundPart',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '9bb7bad0-af7a-49a2-ab28-bbbf1263c092',
                        'to': '1d09b4d6-e9c1-42c8-9ed1-72606db0390c',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/ExerciseRoundPart.mim',
                    'getPromptData': () => {
                        return { roundPart: blackboard.roundPart || '' };
                    }
                }
            };
        },
        '1d09b4d6-e9c1-42c8-9ed1-72606db0390c': function () {
            return {
                'id': '1d09b4d6-e9c1-42c8-9ed1-72606db0390c',
                'name': 'PlayRouter',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '1d09b4d6-e9c1-42c8-9ed1-72606db0390c',
                        'to': 'fecef0bb-5282-4af1-a144-b4cfa0e237e4',
                        'value': 'stop'
                    },
                    {
                        'frm': '1d09b4d6-e9c1-42c8-9ed1-72606db0390c',
                        'to': '3ce389b4-c8e8-41bd-a625-3eb8dde60510',
                        'value': 'finished'
                    },
                    {
                        'frm': '1d09b4d6-e9c1-42c8-9ed1-72606db0390c',
                        'to': '9bb7bad0-af7a-49a2-ab28-bbbf1263c092',
                        'value': 'continue'
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        let doPart = () => {
                            let part = blackboard.routinePlayer.getNextPart();
                            if (!part) {
                                done('finished');
                            } else if (part.type === 'image') {
                                if (part.value === 'empty' || part.value === '') {
                                    blackboard.exerciseView.unhideEye(true);
                                    blackboard.exerciseView.hideImage(true).catch(() => {
                                        blackboard.log.warn('hideImage error', err);
                                    }).then(doPart);
                                } else {
                                    blackboard.exerciseView.changeImage(part.value).catch(() => {
                                        blackboard.log.warn('hideImage error', err);
                                    }).then(doPart);
                                }
                            } else if (part.type === 'esml') {
                                blackboard.roundPart = part.value;
                                done('continue');
                            } else {
                                blackboard.log.error('invalid round part type', part);
                                done('~playFailed');
                            }
                        };
                        doPart();
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '3711a0e6-5bab-4fcc-9207-e19beef89565': function () {
            return {
                'id': '3711a0e6-5bab-4fcc-9207-e19beef89565',
                'name': 'center robot',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '3711a0e6-5bab-4fcc-9207-e19beef89565',
                        'to': '3064554a-a7b9-4ab5-a79a-93ee773cbf28',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        jibo.expression.centerRobot().catch(err => {
                            blackboard.log.warn('Robot not centered ', err);
                        }).then(done);
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '691d9f78-7276-4de4-a246-67272d1718c8': function () {
            return {
                'id': '691d9f78-7276-4de4-a246-67272d1718c8',
                'name': 'Start music loading and disable attn system',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '691d9f78-7276-4de4-a246-67272d1718c8',
                        'to': 'e904a83a-7687-4671-9f76-4d54d8c8d01a',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        blackboard.audioPlayer.init();
                        jibo.expression.setAttentionMode(jibo.expression.AttentionMode.OFF).catch(err => {
                            blackboard.log.warn('Attention mode not set. ', err);
                        }).then(done);
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        'a44e739b-beaa-4aa9-9b24-58c6072fe945': function () {
            return {
                'id': 'a44e739b-beaa-4aa9-9b24-58c6072fe945',
                'name': 'start music playing',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'a44e739b-beaa-4aa9-9b24-58c6072fe945',
                        'to': 'e6b13d36-b2fe-4ee0-8616-14fbdfa1a6eb',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        blackboard.audioPlayer.play();
                    }
                }
            };
        },
        'ce7c0af8-777b-455b-8ceb-55a6e02eff6d': function () {
            return {
                'id': 'ce7c0af8-777b-455b-8ceb-55a6e02eff6d',
                'name': 'Exercise Ready Now',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': 'ce7c0af8-777b-455b-8ceb-55a6e02eff6d',
                        'to': '058acc43-16a7-4962-b082-d19366330c6f',
                        'value': ''
                    },
                    {
                        'frm': 'ce7c0af8-777b-455b-8ceb-55a6e02eff6d',
                        'to': 'a44e739b-beaa-4aa9-9b24-58c6072fe945',
                        'value': 'yes'
                    }
                ],
                'exceptions': [{
                        'frm': 'ce7c0af8-777b-455b-8ceb-55a6e02eff6d',
                        'to': '058acc43-16a7-4962-b082-d19366330c6f',
                        'value': '~'
                    }],
                'class': 'Mim.Question',
                'options': {
                    'mimPath': 'mims/en-us/ExerciseReadyNow.mim',
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
        '058acc43-16a7-4962-b082-d19366330c6f': function () {
            return {
                'id': '058acc43-16a7-4962-b082-d19366330c6f',
                'name': 'Exercise Not Ready',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '058acc43-16a7-4962-b082-d19366330c6f',
                        'to': '4922ff2c-16e8-4923-9ede-d6b51afa93af',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/ExerciseNotReady.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '3ce389b4-c8e8-41bd-a625-3eb8dde60510': function () {
            return {
                'id': '3ce389b4-c8e8-41bd-a625-3eb8dde60510',
                'name': 'Mark routine as played',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '3ce389b4-c8e8-41bd-a625-3eb8dde60510',
                        'to': '72773625-59ac-4c58-b2a9-583860bdb127',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        blackboard.Analytics.routineEnded(blackboard.routine);
                        blackboard.kbData.routines[blackboard.routine].alreadyPlayed = true;
                        jibo.expression.setLEDColor([
                            0,
                            0,
                            0
                        ]);
                        blackboard.skill.forceEye(jibo.face.views.TRANSITION.NONE, jibo.face.views.TRANSITION.NONE).then(() => {
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
},{}],7:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        'meta': {
            'version': 1,
            'name': 'main',
            'uri': '/Users/jon/Workspace/jibo/buildsdk/skills/exercise/src/flows/main.flow'
        },
        '75a918a9-7bde-4419-8939-a4d9dd776957': function () {
            return {
                'id': '75a918a9-7bde-4419-8939-a4d9dd776957',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '75a918a9-7bde-4419-8939-a4d9dd776957',
                        'to': '588f3f91-f5fe-4c90-8d8a-b0bd65d80812',
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
        '4922ff2c-16e8-4923-9ede-d6b51afa93af': function () {
            return {
                'id': '4922ff2c-16e8-4923-9ede-d6b51afa93af',
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
        '588f3f91-f5fe-4c90-8d8a-b0bd65d80812': function () {
            return {
                'id': '588f3f91-f5fe-4c90-8d8a-b0bd65d80812',
                'name': 'Router',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '588f3f91-f5fe-4c90-8d8a-b0bd65d80812',
                        'to': '0b42332b-deb9-46f0-9e90-c134ed43da85',
                        'value': 'loadExercise'
                    },
                    {
                        'frm': '588f3f91-f5fe-4c90-8d8a-b0bd65d80812',
                        'to': '5309c8ae-91d8-4427-b760-131b75ed6275',
                        'value': 'exerciseLike'
                    },
                    {
                        'frm': '588f3f91-f5fe-4c90-8d8a-b0bd65d80812',
                        'to': '5309c8ae-91d8-4427-b760-131b75ed62753',
                        'value': 'exerciseWantTo'
                    },
                    {
                        'frm': '588f3f91-f5fe-4c90-8d8a-b0bd65d80812',
                        'to': '5309c8ae-91d8-4427-b760-131b75ed62752',
                        'value': 'exerciseYogaTutorial'
                    },
                    {
                        'frm': '588f3f91-f5fe-4c90-8d8a-b0bd65d80812',
                        'to': 'ecc2306b-8bb9-474a-9c27-7f8fa005d4d0',
                        'value': 'exerciseDoYoga'
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        return blackboard.routine ? 'loadExercise' : blackboard.intent;
                    }
                }
            };
        },
        '690d2844-e31a-4637-86e5-c3edfc35524b': function () {
            return {
                'id': '690d2844-e31a-4637-86e5-c3edfc35524b',
                'name': 'Execute Routine',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '690d2844-e31a-4637-86e5-c3edfc35524b',
                        'to': '4922ff2c-16e8-4923-9ede-d6b51afa93af',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Subflow',
                'options': {
                    'subflowId': () => {
                        return require('./executeRoutine');
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
        '5309c8ae-91d8-4427-b760-131b75ed6275': function () {
            return {
                'id': '5309c8ae-91d8-4427-b760-131b75ed6275',
                'name': 'Like Exercise',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '5309c8ae-91d8-4427-b760-131b75ed6275',
                        'to': 'e59f7beb-e9f8-4571-9e27-18267717a295',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/ExerciseLoveIt.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '5309c8ae-91d8-4427-b760-131b75ed62752': function () {
            return {
                'id': '5309c8ae-91d8-4427-b760-131b75ed62752',
                'name': 'Exercise Tutorial',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '5309c8ae-91d8-4427-b760-131b75ed62752',
                        'to': 'e59f7beb-e9f8-4571-9e27-18267717a295',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/ExerciseTutorial.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '5309c8ae-91d8-4427-b760-131b75ed62753': function () {
            return {
                'id': '5309c8ae-91d8-4427-b760-131b75ed62753',
                'name': 'Want to Exercise',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '5309c8ae-91d8-4427-b760-131b75ed62753',
                        'to': 'ecc2306b-8bb9-474a-9c27-7f8fa005d4d0',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/ExerciseJiboLikes.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        'e59f7beb-e9f8-4571-9e27-18267717a295': function () {
            return {
                'id': 'e59f7beb-e9f8-4571-9e27-18267717a295',
                'name': 'Exercise Want To',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': 'e59f7beb-e9f8-4571-9e27-18267717a295',
                        'to': 'ecc2306b-8bb9-474a-9c27-7f8fa005d4d0',
                        'value': 'yes'
                    },
                    {
                        'frm': 'e59f7beb-e9f8-4571-9e27-18267717a295',
                        'to': '4922ff2c-16e8-4923-9ede-d6b51afa93af',
                        'value': 'no'
                    }
                ],
                'exceptions': [{
                        'frm': 'e59f7beb-e9f8-4571-9e27-18267717a295',
                        'to': '4922ff2c-16e8-4923-9ede-d6b51afa93af',
                        'value': '~'
                    }],
                'class': 'Mim.Question',
                'options': {
                    'mimPath': 'mims/en-us/ExerciseWantTo.mim',
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
        '0b42332b-deb9-46f0-9e90-c134ed43da85': function () {
            return {
                'id': '0b42332b-deb9-46f0-9e90-c134ed43da85',
                'name': 'Exercise Welcome Blaster',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '0b42332b-deb9-46f0-9e90-c134ed43da85',
                        'to': '690d2844-e31a-4637-86e5-c3edfc35524b',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/ExerciseWelcomeBlaster.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        'ecc2306b-8bb9-474a-9c27-7f8fa005d4d0': function () {
            return {
                'id': 'ecc2306b-8bb9-474a-9c27-7f8fa005d4d0',
                'name': 'Exercise Welcome Blaster',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'ecc2306b-8bb9-474a-9c27-7f8fa005d4d0',
                        'to': '93d725b6-e4a8-4cb3-b5ea-cdd3c2c09964',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/ExerciseWelcomeBlaster.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '93d725b6-e4a8-4cb3-b5ea-cdd3c2c09964': function () {
            return {
                'id': '93d725b6-e4a8-4cb3-b5ea-cdd3c2c09964',
                'name': 'Exercise Routine Selector',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '93d725b6-e4a8-4cb3-b5ea-cdd3c2c09964',
                        'to': '690d2844-e31a-4637-86e5-c3edfc35524b',
                        'value': ''
                    },
                    {
                        'frm': '93d725b6-e4a8-4cb3-b5ea-cdd3c2c09964',
                        'to': '4fc01d80-7114-44ff-9a59-13f822be23ba',
                        'value': 'noResponse'
                    }
                ],
                'exceptions': [{
                        'frm': '93d725b6-e4a8-4cb3-b5ea-cdd3c2c09964',
                        'to': '4922ff2c-16e8-4923-9ede-d6b51afa93af',
                        'value': '~'
                    }],
                'class': 'Mim.Optional-Response',
                'options': {
                    'mimPath': 'mims/en-us/ExerciseRoutineSelector.mim',
                    'getPromptData': () => {
                        return { firstTime: blackboard.kbData.firstTime };
                    },
                    'onStatus': status => {
                        let mimState = status.state;
                        let asrResults = status.asrResults;
                        let speakerIds = status.speakerIds;
                    },
                    'onSuccess': results => {
                        let asrResults = results.asrResults;
                        if (asrResults && asrResults.intent) {
                            blackboard.routine = asrResults.intent;
                        } else {
                            return 'noResponse';
                        }
                    }
                }
            };
        },
        '4fc01d80-7114-44ff-9a59-13f822be23ba': function () {
            return {
                'id': '4fc01d80-7114-44ff-9a59-13f822be23ba',
                'name': 'Exercise Bailed',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '4fc01d80-7114-44ff-9a59-13f822be23ba',
                        'to': '4922ff2c-16e8-4923-9ede-d6b51afa93af',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/ExerciseBailed.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        }
    };
};
},{"./executeRoutine":6}],8:[function(require,module,exports){
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
const log = jibo.log.createChild('CustomView');
class CustomView extends jibo.rendering.gui.views.EyeView {
    constructor() {
        super();
        this._hasEyeAnimListener = false;
        this._type = CustomView.DEFAULT_TYPE;
        this.id = 'poseView';
        this._category = jibo.face.views.CATEGORY.DISPLAY;
        this.borderNeeded = false;
        this.hideEye = this.hideEye.bind(this);
        this.unhideEye = this.unhideEye.bind(this);
        this.closeOnSwipeDown = false;
    }
    static get DEFAULT_TYPE() { return 'CustomView'; }
    applyData() {
        this._clip = new jibo.rendering.gui.components.Clip();
        super.addComponent(this._clip);
        super.applyData();
    }
    open(callback, transitionType) {
        try {
            this._eyeContainer = jibo.face.eye;
            this._eyeContainer.background.visible = false;
        }
        catch (err) {
            log.warn('Failed to hide background', err);
        }
        this._clipSprite = new PIXI.Sprite();
        this._clip.display.addChild(this._clipSprite);
        this._clip.setTargetPosition(jibo.face.width / 2, jibo.face.height / 2, true);
        super.open(callback, transitionType);
    }
    changeImage(poseName) {
        return __awaiter(this, void 0, void 0, function* () {
            let previousAssetId = (this._currentAsset ? this._currentAsset.id : null);
            if (poseName === previousAssetId) {
                return;
            }
            this._nextAsset = {
                id: poseName,
                type: 'texture',
                src: 'resources/images/poses/' + poseName + '.png'
            };
            return new Promise((resolve) => {
                if (previousAssetId) {
                    this.hideImage(true, true)
                        .then(() => {
                        this.setImage()
                            .then(() => {
                            this.showImage(true)
                                .then(() => {
                                resolve();
                            });
                        });
                    });
                }
                else if (this._eyeContainer.alpha > 0) {
                    this.hideEye(true)
                        .then(() => {
                        this.setImage()
                            .then(() => {
                            this.showImage(true)
                                .then(() => {
                                resolve();
                            });
                        });
                    });
                }
                else {
                    this.setImage()
                        .then(() => {
                        this.showImage(true)
                            .then(() => {
                            resolve();
                        });
                    });
                }
            });
        });
    }
    showImage(fade = true) {
        return __awaiter(this, void 0, void 0, function* () {
            this.addEyeListeners();
            if (fade) {
                return this.fadeInComponent(this._clip.display);
            }
            else {
                this._clip.display.alpha = 1;
            }
        });
    }
    hideImage(fade = true, destroy = true) {
        return __awaiter(this, void 0, void 0, function* () {
            this.removeEyeListeners();
            if (fade) {
                return this.fadeOutComponent(this._clip.display)
                    .then(() => {
                    if (this._currentAsset && destroy) {
                        this._clip.emptyDisplay();
                        this.removeAssets(this._currentAsset);
                        this._currentAsset = null;
                    }
                });
            }
            else {
                this._clip.display.alpha = 0;
                if (this._currentAsset && destroy) {
                    this._clip.emptyDisplay();
                    this.removeAssets(this._currentAsset);
                    this._currentAsset = null;
                }
            }
        });
    }
    hideEye(fade = true) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                if (fade && this._eyeContainer.alpha > 0) {
                    return this.fadeOutComponent(this._eyeContainer)
                        .then(() => {
                        resolve();
                    });
                }
                this._eyeContainer.alpha = 0;
                resolve();
            });
        });
    }
    unhideEye(fade = true) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                if (fade && this._eyeContainer.alpha < 1) {
                    return this.fadeInComponent(this._eyeContainer);
                }
                this._eyeContainer.alpha = 1;
                resolve();
            });
        });
    }
    addEyeListeners() {
        if (this._eyeContainer && !this._hasEyeAnimListener) {
            this._hasEyeAnimListener = true;
            console.log('addEyeListeners : hasEyeAnimListener TRUE');
            this._eyeContainer.on('removeAnimation', this.hideEye);
            this._eyeContainer.on('addAnimation', this.unhideEye);
        }
    }
    removeEyeListeners() {
        if (this._eyeContainer && this._hasEyeAnimListener) {
            this._hasEyeAnimListener = false;
            console.log('addEyeListeners : hasEyeAnimListener FALSE');
            this._eyeContainer.removeAllListeners();
        }
    }
    setImage() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.addAssets(this._nextAsset, () => {
                    this._currentAsset = this._nextAsset;
                    this._clip.emptyDisplay();
                    let texture = this.assets[this._currentAsset.id];
                    this._clipSprite = new PIXI.Sprite(texture);
                    this._clipSprite.anchor.x = this._clipSprite.anchor.y = .5;
                    this._clip.display.addChild(this._clipSprite);
                });
            }
            catch (e) {
                log.error('error loading pose image: ', e);
            }
        });
    }
    fadeOutComponent(display, scaleEase = 'backIn', fadeEase = 'sineInOut', tweenTime = 1000) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                jibo.rendering.tween.TweenManager.stop(display);
                jibo.rendering.tween.TweenManager.play(display, {
                    to: {
                        'scale.x': 1,
                        'scale.y': 1
                    },
                    duration: tweenTime,
                    ease: scaleEase
                }, () => {
                    jibo.rendering.tween.TweenManager.stop(display);
                    display.alpha = 0;
                    resolve();
                });
                jibo.rendering.tween.TweenManager.play(display, {
                    to: { alpha: 0 },
                    duration: tweenTime,
                    ease: fadeEase
                });
            });
        });
    }
    fadeInComponent(display, toAlpha = 1, scaleEase = 'backOut', fadeEase = 'sineInOut', tweenTime = 1000) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                jibo.rendering.tween.TweenManager.stop(display);
                jibo.rendering.tween.TweenManager.play(display, {
                    to: {
                        'scale.x': 1,
                        'scale.y': 1
                    },
                    from: {
                        'scale.x': 1,
                        'scale.y': 1
                    },
                    duration: tweenTime,
                    ease: scaleEase
                }, () => {
                    jibo.rendering.tween.TweenManager.stop(display);
                    display.alpha = toAlpha;
                    resolve();
                });
                jibo.rendering.tween.TweenManager.play(display, {
                    to: { alpha: toAlpha },
                    duration: tweenTime,
                    ease: fadeEase
                });
            });
        });
    }
    cleanUp() {
        if (this._eyeContainer) {
            this.removeEyeListeners();
            this._eyeContainer.background.visible = true;
            this._eyeContainer.alpha = 1;
            jibo.rendering.tween.TweenManager.stop(this._eyeContainer);
        }
        if (this._clip) {
            this._clip.stopChildTweens(true);
        }
    }
    destroy() {
        this.cleanUp();
        this._eyeContainer = null;
        this._clip = null;
        super.destroy();
    }
}
exports.default = CustomView;

},{"jibo":undefined}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Exercise_1 = require("./Exercise");
module.exports = Exercise_1.default;

},{"./Exercise":2}]},{},[9])(9)
});
//# sourceMappingURL=index.js.map