(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.bewordOfTheDay = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
class QuestionSelector {
    constructor(log) {
        this._log = log.createChild('WordSelector');
    }
    ;
    init(playedModel, mainRoot, thisTime) {
        this._thisTime = thisTime;
        this._mainRoot = mainRoot;
        return playedModel.loadRoot()
            .then((root) => {
            this._playedRoot = root;
        })
            .then(() => {
            return new Promise((resolve, reject) => {
                jibo.loader.load('assets/words.json', (err, result) => {
                    if (err || !result) {
                        return reject(err);
                    }
                    this._questions = result;
                    resolve();
                });
            });
        });
    }
    selectQuestion() {
        this._lastPlayed = this._mainRoot.data.lastPlayed;
        const selectedQuestion = this._selectQuestion();
        selectedQuestion.answers = this._shuffle(selectedQuestion.answers);
        for (let answer of selectedQuestion.answers) {
            if (!answer.spokenAnswer) {
                answer.spokenAnswer = answer.answer;
            }
        }
        if (!selectedQuestion.spokenQuestion) {
            selectedQuestion.spokenQuestion = selectedQuestion.question;
        }
        this._playedRoot.data[selectedQuestion.id] = new Date(this._thisTime).toDateString();
        this._mainRoot.data.lastPlayed = this._thisTime;
        return this._playedRoot.save()
            .catch((err) => {
            this._log.warn('failed to save word', err);
        })
            .then(() => {
            return selectedQuestion;
        });
    }
    _selectQuestion() {
        const nowDate = new Date(this._thisTime).toDateString();
        const lastDate = new Date(this._lastPlayed).toDateString();
        if (nowDate === lastDate) {
            for (let id in this._playedRoot.data) {
                if (this._playedRoot.data[id] === nowDate) {
                    return this._getQuestionById(id);
                }
            }
        }
        let validQuestions = [];
        let rangedQuestions = [];
        let nonRangedQuestions = [];
        for (let question of this._questions) {
            if (!this._playedRoot.data[question.id]) {
                if (question.dateRange) {
                    const dateTime = new jibo.utils.DateTime(this._thisTime, jibo.utils.Location.jiboHome.timezone);
                    if (dateTime.isInRange(question.dateRange.start, question.dateRange.end)) {
                        validQuestions.push(question);
                    }
                    else {
                        rangedQuestions.push(question);
                    }
                }
                else {
                    nonRangedQuestions.push(question);
                }
            }
        }
        if (validQuestions.length) {
            return validQuestions[Math.floor(Math.random() * validQuestions.length)];
        }
        if (nonRangedQuestions.length) {
            return nonRangedQuestions[Math.floor(Math.random() * nonRangedQuestions.length)];
        }
        if (rangedQuestions.length) {
            return rangedQuestions[Math.floor(Math.random() * rangedQuestions.length)];
        }
        return this._questions[Math.floor(Math.random() * this._questions.length)];
    }
    _getQuestionById(id) {
        let theQuestion;
        for (let question of this._questions) {
            if (question.id == id) {
                theQuestion = question;
                break;
            }
        }
        return theQuestion;
    }
    destroy() {
        this._log = null;
        this._playedRoot = null;
        this._questions = null;
        this._lastPlayed = null;
        this._thisTime = null;
    }
    _shuffle(arr) {
        for (var j, x, i = arr.length; i; j = Math.floor(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x)
            ;
        return arr;
    }
}
exports.default = QuestionSelector;

},{"jibo":undefined}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RIGHT_WORD = 'WOTD_DYNAMIC_RIGHT_ANSWER';
const DECOY_ONE = 'WOTD_DYNAMIC_DECOY_ONE';
const DECOY_TWO = 'WOTD_DYNAMIC_DECOY_TWO';
const SUFFIXES = '(?:d|s|ed|es|\'s|ing)?';
class Rule {
    constructor(right, decoys) {
        this.right = right;
        this.decoys = decoys;
    }
    parse(input) {
        if (this.right.test(input)) {
            return 'right';
        }
        for (let i = 0; i < this.decoys.length; ++i) {
            if (this.decoys[i].test(input)) {
                return `decoy${i + 1}`;
            }
        }
        return 'noMatch';
    }
}
exports.Rule = Rule;
class RuleGenerator {
    generateRule(question) {
        let rightAnswer;
        let decoys = [];
        for (let answer of question.answers) {
            if (answer.correct) {
                rightAnswer = answer;
            }
            else {
                decoys.push(answer);
            }
        }
        return new Rule(this._buildRegex(rightAnswer), decoys.map(decoy => this._buildRegex(decoy)));
    }
    _buildRegex(answer) {
        return new RegExp(`\\b(?:${this._buildWordList(answer)})${SUFFIXES}\\b`, 'i');
    }
    _buildWordList(answer) {
        let result = answer.answer;
        if (answer.homophones && answer.homophones.length) {
            for (let phrase of answer.homophones) {
                result += `|${phrase}`;
            }
        }
        return result;
    }
}
exports.default = RuleGenerator;

},{}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
var ActionData = jibo.rendering.gui.actions.ActionData;
var View = jibo.rendering.gui.views.View;
class VerticalListView extends View {
    constructor(viewState) {
        super(viewState);
    }
    actionEnactor(action) {
        if (action.type === ActionData.VERBAL_COMMAND && action.data.intent === 'selectItem') {
            let buttonId = null;
            switch (action.data.entities.itemPosition) {
                case 'first':
                case 'top':
                    buttonId = 'answerButton1';
                    break;
                case 'middle':
                case 'second':
                    buttonId = 'answerButton2';
                    break;
                case 'last':
                case 'third':
                case 'bottom':
                    buttonId = 'answerButton3';
                    break;
            }
            if (buttonId) {
                let buttonToPress = this.getComponentById(buttonId);
                if (buttonToPress) {
                    buttonToPress.activate();
                    buttonToPress.triggerActions(jibo.face.views.GESTURE.TAP);
                    return true;
                }
            }
        }
        return super.actionEnactor(action);
    }
}
exports.default = VerticalListView;

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
const be_framework_1 = require("@be/be-framework");
var CancelTokenSession = be_framework_1.libraries.jibo_cai_utils.CancelTokenSession;
const surprises_1 = require("@be/surprises");
const QuestionSelector_1 = require("./QuestionSelector");
const RuleGenerator_1 = require("./RuleGenerator");
const VerticalListView_1 = require("./VerticalListView");
const Analytics_1 = require("./analytics/Analytics");
const MainFlow = require('./flows/Main.flow');
const MINUTES_TO_MS = 60 * 1000;
const HOURS_TO_MS = 60 * MINUTES_TO_MS;
const MIN_LOOP_AGE_FOR_OFFER = 18;
class WordOfTheDay extends surprises_1.SurpriseElement {
    constructor(assetPack) {
        super(assetPack);
        this._runFlow = () => {
            this._session = null;
            const playedToday = new Date(this._mainRoot.data.lastPlayed).toDateString() === new Date(this._thisTime).toDateString();
            let options = {
                assetPack: this.assetPack,
                blackboard: {
                    Analytics: Analytics_1.default,
                    questionSelector: this._questionSelector,
                    ruleGenerator: this._ruleGenerator,
                    playedToday,
                    forceEye: this._forceEye,
                    intent: this._launchIntent,
                    log: this.log
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
    getCategoryPriority() {
        return 5;
    }
    getContextualPriority(context) {
        return __awaiter(this, void 0, void 0, function* () {
            let currentDate = new Date();
            let currentHour = currentDate.getHours();
            if (currentHour >= 22 || currentHour < 12) {
                return 0;
            }
            let today = currentDate.toDateString();
            let lastOffered = new Date(this._mainRoot.data.lastOffered || 0).toDateString();
            let lastPlayed = new Date(this._mainRoot.data.lastPlayed || 0).toDateString();
            if (lastOffered === today || lastPlayed === today) {
                return 0;
            }
            if ((currentDate.getTime() - this._jiboBirthday) / HOURS_TO_MS < MIN_LOOP_AGE_FOR_OFFER) {
                return 0;
            }
            return 1;
        });
    }
    postInit(done) {
        this._mainModel = jibo.kb.createModel('/word-of-the-day');
        this._playedModel = this._mainModel.createModel('played-words');
        this._mainModel.loadRoot().then((root) => { this._mainRoot = root; })
            .catch((err) => { this.log.error('failed to load main root node', err); })
            .then(() => {
            return jibo.kb.loop.loadLoop()
                .then((loop) => {
                for (let user of loop) {
                    if (user.isJibo) {
                        this._jiboBirthday = user.created;
                        break;
                    }
                }
            })
                .catch((err) => {
                this.log.error('Error creating loop in Surprise Element', err);
                this._jiboBirthday = 0;
            });
        })
            .then(done);
    }
    preload(done) {
        jibo.face.views.creator.registerClass(VerticalListView_1.default, 'VerticalListView');
        this._thisTime = Date.now();
        this._ruleGenerator = new RuleGenerator_1.default();
        this._questionSelector = new QuestionSelector_1.default(this.log);
        this._questionSelector.init(this._playedModel, this._mainRoot, this._thisTime)
            .catch((err) => {
            this.log.error('preload failed', err);
        })
            .then(() => { done(); });
    }
    open(result, refresh, previousSkillName) {
        jibo.mim.silentMenus = false;
        if (result && result.nlu && result.nlu.intent) {
            this._launchIntent = result.nlu.intent;
            if (this._launchIntent === 'menu') {
                this._launchIntent = 'play';
            }
        }
        else {
            this._launchIntent = 'surprise';
        }
        Analytics_1.default.init(this);
        this._mainRoot.data.lastOffered = this._thisTime;
        let promises = [this._forceEye()];
        if (this._flow) {
            promises.push(this._flow.stopAndDestroy().then(() => { this._flow = null; }));
        }
        this._session = new CancelTokenSession();
        this._session.wrap(this.promiseEvery(promises)).then(this._runFlow, this._runFlow);
    }
    _forceEye() {
        return new Promise((resolve) => {
            jibo.face.views.forceEyeView(() => {
                resolve();
            }, null, null, null, (err) => {
                this.log.warn('Failed reseting view', err);
                resolve();
            });
        });
    }
    close(done) {
        jibo.face.views.creator.unregisterClass('VerticalListView');
        let promises = [];
        if (this._session) {
            promises.push(this._session.cancel());
            this._session = null;
        }
        if (this._questionSelector) {
            this._questionSelector.destroy();
            this._questionSelector = null;
        }
        if (this._flow) {
            promises.push(this._flow.stopAndDestroy());
            this._flow = null;
        }
        promises.push(this._mainRoot.save());
        this.promiseEvery(promises).then(() => { done(); }, done);
    }
    promiseEvery(promises) {
        let rejected = false;
        let allPromises = new Array(promises.length);
        let results = new Array(promises.length);
        for (let i = 0; i < promises.length; i++) {
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
exports.default = WordOfTheDay;

},{"./QuestionSelector":1,"./RuleGenerator":2,"./VerticalListView":3,"./analytics/Analytics":5,"./flows/Main.flow":9,"@be/be-framework":undefined,"@be/surprises":undefined,"jibo":undefined}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
const YEAR_IN_MS = 31536000000;
class Analytics {
    static init(skill) {
        this._track = skill.track;
        this._playerAge = -1;
        this._playerGender = 'unknown';
        let speaker = jibo.lps.identity.getActiveSpeaker();
        if (speaker && speaker.idInfo && speaker.idInfo.id) {
            jibo.kb.loop.getUserNodeById(speaker.idInfo.id, (err, looper) => {
                if (!err && looper && looper.data) {
                    if (typeof looper.data.birthday === 'number') {
                        this._playerAge = Math.floor((Date.now() - looper.data.birthday) / YEAR_IN_MS);
                    }
                    if (looper.gender) {
                        this._playerGender = looper.gender;
                    }
                }
            });
        }
    }
    static surpriseOffer(response) {
        this._track('WotD Surprise Offer', { response, playerAge: this._playerAge, playerGender: this._playerGender });
    }
    static definition(entryId) {
        this._track('WotD Definition', { entryId, playerAge: this._playerAge, playerGender: this._playerGender });
    }
    static guess(entryId, outcome) {
        this._track('WotD Guess', { entryId, outcome, playerAge: this._playerAge, playerGender: this._playerGender });
    }
    static repeat(entryId) {
        this._track('WotD Repeat', { entryId, playerAge: this._playerAge, playerGender: this._playerGender });
    }
    static funFact(entryId, response = 'noResponse') {
        this._track('WotD Fun Fact', { entryId, response, playerAge: this._playerAge, playerGender: this._playerGender });
    }
}
Analytics._playerAge = -1;
Analytics._playerGender = '';
exports.default = Analytics;

},{"jibo":undefined}],6:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        'meta': {
            'version': 1,
            'name': 'Gameplay',
            'uri': '/Users/jon/Workspace/jibo/buildsdk/skills/word-of-the-day/src/flows/Gameplay.flow'
        },
        '57d5b235-dfe8-4d20-bc0f-250e537e730a': function () {
            return {
                'id': '57d5b235-dfe8-4d20-bc0f-250e537e730a',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '57d5b235-dfe8-4d20-bc0f-250e537e730a',
                        'to': 'a22b8e67-e25f-4b17-8559-7634e67c3d9f',
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
        '33b1c76b-fbca-4a57-baf0-b88b6fe851a2': function () {
            return {
                'id': '33b1c76b-fbca-4a57-baf0-b88b6fe851a2',
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
        '9cbc81c7-18d7-4dd4-801d-5ce087fc0360': function () {
            return {
                'id': '9cbc81c7-18d7-4dd4-801d-5ce087fc0360',
                'name': 'Wot D Definition',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '9cbc81c7-18d7-4dd4-801d-5ce087fc0360',
                        'to': '0e2b8337-674a-40e6-9df5-b7f4a1407647',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/WotDDefinition.mim',
                    'getPromptData': () => {
                        return {
                            question: notepad.question.question,
                            spokenQuestion: notepad.question.spokenQuestion
                        };
                    }
                }
            };
        },
        '0e2b8337-674a-40e6-9df5-b7f4a1407647': function () {
            return {
                'id': '0e2b8337-674a-40e6-9df5-b7f4a1407647',
                'name': 'Wot D Puzzle',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '0e2b8337-674a-40e6-9df5-b7f4a1407647',
                        'to': '0222747c-c55c-45ac-bcf8-886dd73c7c6a',
                        'value': ''
                    },
                    {
                        'frm': '0e2b8337-674a-40e6-9df5-b7f4a1407647',
                        'to': 'abe1cbf1-c9f0-420f-a8eb-6a75f45c5296',
                        'value': 'redefine'
                    }
                ],
                'exceptions': [
                    {
                        'frm': '0e2b8337-674a-40e6-9df5-b7f4a1407647',
                        'to': '4212d506-d6b8-47b2-8533-3d63ca1c66ad',
                        'value': '~InteractionError.noInput'
                    },
                    {
                        'frm': '0e2b8337-674a-40e6-9df5-b7f4a1407647',
                        'to': '10f20f28-0170-43d7-a5a7-b2e5a5321def',
                        'value': '~InteractionError.noMatch'
                    }
                ],
                'class': 'Mim.Question',
                'options': {
                    'mimPath': 'mims/en-us/WotDPuzzle.mim',
                    'getPromptData': () => {
                        return {
                            answer1: notepad.question.answers[0].answer,
                            answer2: notepad.question.answers[1].answer,
                            answer3: notepad.question.answers[2].answer,
                            spokenAnswer1: notepad.question.answers[0].spokenAnswer,
                            spokenAnswer2: notepad.question.answers[1].spokenAnswer,
                            spokenAnswer3: notepad.question.answers[2].spokenAnswer,
                            noMatches: notepad.noMatchCount
                        };
                    },
                    'onStatus': status => {
                        let mimState = status.state;
                        let asrResults = status.asrResults;
                    },
                    'onSuccess': results => {
                        let mimState = results.state;
                        let asrResults = results.asrResults;
                        let transition = asrResults.intent;
                        if (transition !== 'redefine') {
                            if (transition === 'decoy1' || transition === 'decoy2') {
                                transition = 'wrong';
                            }
                            blackboard.Analytics.guess(notepad.question.id, transition);
                        }
                        return transition;
                    },
                    'onFailure': results => {
                        let mimState = results.state;
                        let asrResults = results.asrResults;
                        let exception = results.exception;
                        return exception;
                    },
                    'checkResult': result => {
                        if (result.intent === 'guess') {
                            let intent = notepad.rule.parse(result.entities.guess);
                            if (intent === 'noMatch') {
                                result.nlu = null;
                            } else {
                                result.intent = intent;
                            }
                        }
                    }
                }
            };
        },
        '0222747c-c55c-45ac-bcf8-886dd73c7c6a': function () {
            return {
                'id': '0222747c-c55c-45ac-bcf8-886dd73c7c6a',
                'name': 'Wot D Response',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '0222747c-c55c-45ac-bcf8-886dd73c7c6a',
                        'to': '713d9af5-e82f-4b4f-8174-b1716c9aee89',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/WotDResponse.mim',
                    'getPromptData': () => {
                        return { response: this.inTransition };
                    }
                }
            };
        },
        '713d9af5-e82f-4b4f-8174-b1716c9aee89': function () {
            return {
                'id': '713d9af5-e82f-4b4f-8174-b1716c9aee89',
                'name': 'Wot D Right Word',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '713d9af5-e82f-4b4f-8174-b1716c9aee89',
                        'to': 'fedd8e73-89e1-42fd-9543-23bb4cf6dff3',
                        'value': ''
                    },
                    {
                        'frm': '713d9af5-e82f-4b4f-8174-b1716c9aee89',
                        'to': '80b16f86-dd12-400f-acce-cf4810f9602c',
                        'value': 'noResponse'
                    }
                ],
                'exceptions': [],
                'class': 'Mim.Optional-Response',
                'options': {
                    'mimPath': 'mims/en-us/WotDRightWord.mim',
                    'getPromptData': () => {
                        let right;
                        for (let answer of notepad.question.answers) {
                            if (answer.correct) {
                                right = answer;
                                break;
                            }
                        }
                        return {
                            rightWord: right.answer,
                            spokenRightWord: right.spokenAnswer,
                            definition: notepad.question.spokenQuestion
                        };
                    },
                    'onSuccess': results => {
                        let mimState = results.state;
                        let asrResults = results.asrResults;
                        let transition = results.firstGrammarTag;
                        notepad.rightWordResponse = transition;
                        return transition || 'noResponse';
                    },
                    'onStatus': status => {
                        let mimState = status.state;
                        let asrResults = status.asrResults;
                    }
                }
            };
        },
        'fedd8e73-89e1-42fd-9543-23bb4cf6dff3': function () {
            return {
                'id': 'fedd8e73-89e1-42fd-9543-23bb4cf6dff3',
                'name': 'Wot D Comment',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'fedd8e73-89e1-42fd-9543-23bb4cf6dff3',
                        'to': '80b16f86-dd12-400f-acce-cf4810f9602c',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/WotDComment.mim',
                    'getPromptData': () => {
                        return { response: notepad.rightWordResponse };
                    }
                }
            };
        },
        '7651610f-82e8-470a-8ca1-014103ea5876': function () {
            return {
                'id': '7651610f-82e8-470a-8ca1-014103ea5876',
                'name': 'Wot D Fun Fact',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '7651610f-82e8-470a-8ca1-014103ea5876',
                        'to': '297ff1ae-afdb-4e1d-a7a7-e61596dca09d',
                        'value': ''
                    },
                    {
                        'frm': '7651610f-82e8-470a-8ca1-014103ea5876',
                        'to': 'd0f361b8-512d-494e-9826-3b731875fa88',
                        'value': 'noResponse'
                    }
                ],
                'exceptions': [],
                'class': 'Mim.Optional-Response',
                'options': {
                    'mimPath': 'mims/en-us/WotDFunFact.mim',
                    'getPromptData': () => {
                        return { funFact: notepad.question.followup };
                    },
                    'onStatus': status => {
                        let mimState = status.state;
                        let asrResults = status.asrResults;
                    },
                    'onSuccess': results => {
                        let mimState = results.state;
                        let asrResults = results.asrResults;
                        let transition = results.firstGrammarTag;
                        blackboard.Analytics.funFact(notepad.question.id, transition);
                        return transition || 'noResponse';
                    }
                }
            };
        },
        '80b16f86-dd12-400f-acce-cf4810f9602c': function () {
            return {
                'id': '80b16f86-dd12-400f-acce-cf4810f9602c',
                'name': 'fun fact?',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '80b16f86-dd12-400f-acce-cf4810f9602c',
                        'to': '7651610f-82e8-470a-8ca1-014103ea5876',
                        'value': 'true'
                    },
                    {
                        'frm': '80b16f86-dd12-400f-acce-cf4810f9602c',
                        'to': 'd0f361b8-512d-494e-9826-3b731875fa88',
                        'value': ''
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        return !!(notepad.question.followup && notepad.question.followup.length);
                    }
                }
            };
        },
        'd0f361b8-512d-494e-9826-3b731875fa88': function () {
            return {
                'id': 'd0f361b8-512d-494e-9826-3b731875fa88',
                'name': 'Happy SSA',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'd0f361b8-512d-494e-9826-3b731875fa88',
                        'to': '33b1c76b-fbca-4a57-baf0-b88b6fe851a2',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'PlayAnimation',
                'options': {
                    'animSelector': 4,
                    'animPath': '',
                    'upload': true,
                    'config': animation => {
                    },
                    'animName': '',
                    'creationOptions': () => {
                        return {};
                    },
                    'playbackOptions': () => {
                        return {};
                    },
                    'queryParams': () => ({
                        category: 'happy',
                        includeMeta: ['ssa-only']
                    }),
                    'queryResultSelector': results => {
                        return results.matching[0];
                    }
                }
            };
        },
        '297ff1ae-afdb-4e1d-a7a7-e61596dca09d': function () {
            return {
                'id': '297ff1ae-afdb-4e1d-a7a7-e61596dca09d',
                'name': 'Wot D Fun Fact Response',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '297ff1ae-afdb-4e1d-a7a7-e61596dca09d',
                        'to': 'd0f361b8-512d-494e-9826-3b731875fa88',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/WotDFunFactResponse.mim',
                    'getPromptData': () => {
                        return { response: this.inTransition };
                    }
                }
            };
        },
        '4212d506-d6b8-47b2-8533-3d63ca1c66ad': function () {
            return {
                'id': '4212d506-d6b8-47b2-8533-3d63ca1c66ad',
                'name': 'Max NoInput?',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '4212d506-d6b8-47b2-8533-3d63ca1c66ad',
                        'to': '0222747c-c55c-45ac-bcf8-886dd73c7c6a',
                        'value': 'surrender'
                    },
                    {
                        'frm': '4212d506-d6b8-47b2-8533-3d63ca1c66ad',
                        'to': '7b6c7426-f10e-489e-832d-e4f2a52053bb',
                        'value': ''
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        const maxNoInput = ++notepad.noInputCount >= 3;
                        if (maxNoInput) {
                            blackboard.Analytics.guess(notepad.question.id, 'maxNoInput');
                        }
                        return maxNoInput ? 'surrender' : 'redefine';
                    }
                }
            };
        },
        'a22b8e67-e25f-4b17-8559-7634e67c3d9f': function () {
            return {
                'id': 'a22b8e67-e25f-4b17-8559-7634e67c3d9f',
                'name': 'get question data',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'a22b8e67-e25f-4b17-8559-7634e67c3d9f',
                        'to': '7b6c7426-f10e-489e-832d-e4f2a52053bb',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        notepad.noInputCount = 0;
                        notepad.noMatchCount = 0;
                        notepad.redefineCount = 0;
                        blackboard.questionSelector.selectQuestion().then(question => {
                            notepad.question = question;
                            notepad.rule = blackboard.ruleGenerator.generateRule(question);
                            blackboard.Analytics.definition(notepad.question.id);
                            done();
                        }).catch(err => {
                            blackboard.log.error('question selection failed', err);
                            done('~failed');
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '10f20f28-0170-43d7-a5a7-b2e5a5321def': function () {
            return {
                'id': '10f20f28-0170-43d7-a5a7-b2e5a5321def',
                'name': 'Max NoMatch?',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '10f20f28-0170-43d7-a5a7-b2e5a5321def',
                        'to': '7b6c7426-f10e-489e-832d-e4f2a52053bb',
                        'value': ''
                    },
                    {
                        'frm': '10f20f28-0170-43d7-a5a7-b2e5a5321def',
                        'to': '0222747c-c55c-45ac-bcf8-886dd73c7c6a',
                        'value': 'wrong'
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        const maxNoMatch = ++notepad.noMatchCount >= 3;
                        if (maxNoMatch) {
                            blackboard.Analytics.guess(notepad.question.id, 'maxNoMatch');
                        }
                        return maxNoMatch ? 'wrong' : 'redefine';
                    }
                }
            };
        },
        '7b6c7426-f10e-489e-832d-e4f2a52053bb': function () {
            return {
                'id': '7b6c7426-f10e-489e-832d-e4f2a52053bb',
                'name': 'Wot D Intro',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '7b6c7426-f10e-489e-832d-e4f2a52053bb',
                        'to': '9cbc81c7-18d7-4dd4-801d-5ce087fc0360',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/WotDIntro.mim',
                    'getPromptData': () => {
                        return { repeat: this.inTransition === 'redefine' };
                    }
                }
            };
        },
        'abe1cbf1-c9f0-420f-a8eb-6a75f45c5296': function () {
            return {
                'id': 'abe1cbf1-c9f0-420f-a8eb-6a75f45c5296',
                'name': 'Max Redefine?',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': 'abe1cbf1-c9f0-420f-a8eb-6a75f45c5296',
                        'to': '7b6c7426-f10e-489e-832d-e4f2a52053bb',
                        'value': ''
                    },
                    {
                        'frm': 'abe1cbf1-c9f0-420f-a8eb-6a75f45c5296',
                        'to': '0222747c-c55c-45ac-bcf8-886dd73c7c6a',
                        'value': 'surrender'
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        blackboard.Analytics.repeat(notepad.question.id);
                        const maxRedefine = ++notepad.redefineCount >= 3;
                        if (maxRedefine) {
                            blackboard.Analytics.guess(notepad.question.id, 'maxRepeat');
                        }
                        return maxRedefine ? 'surrender' : 'redefine';
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
            'name': 'HowWotD',
            'uri': '/Users/jon/Workspace/jibo/buildsdk/skills/word-of-the-day/src/flows/HowWotD.flow'
        },
        '57d5b235-dfe8-4d20-bc0f-250e537e730a': function () {
            return {
                'id': '57d5b235-dfe8-4d20-bc0f-250e537e730a',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '57d5b235-dfe8-4d20-bc0f-250e537e730a',
                        'to': '4da958fb-1a5a-4119-9b6d-7d03e706cd87',
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
        '33b1c76b-fbca-4a57-baf0-b88b6fe851a2': function () {
            return {
                'id': '33b1c76b-fbca-4a57-baf0-b88b6fe851a2',
                'name': 'Wot D Play Declined',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '33b1c76b-fbca-4a57-baf0-b88b6fe851a2',
                        'to': 'bfc5c4a0-a1a2-4932-aaf1-f1076e4b3136',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/WotDPlayDeclined.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '4da958fb-1a5a-4119-9b6d-7d03e706cd87': function () {
            return {
                'id': '4da958fb-1a5a-4119-9b6d-7d03e706cd87',
                'name': 'Wot D How To Play',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '4da958fb-1a5a-4119-9b6d-7d03e706cd87',
                        'to': '7b12d56c-047f-44ed-ab77-ec0078f8fe30',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/WotDHowToPlay.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '7b12d56c-047f-44ed-ab77-ec0078f8fe30': function () {
            return {
                'id': '7b12d56c-047f-44ed-ab77-ec0078f8fe30',
                'name': 'Wot D How Offer',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '7b12d56c-047f-44ed-ab77-ec0078f8fe30',
                        'to': '4da958fb-1a5a-4119-9b6d-7d03e706cd87',
                        'value': 'repeat'
                    },
                    {
                        'frm': '7b12d56c-047f-44ed-ab77-ec0078f8fe30',
                        'to': '33b1c76b-fbca-4a57-baf0-b88b6fe851a2',
                        'value': ''
                    },
                    {
                        'frm': '7b12d56c-047f-44ed-ab77-ec0078f8fe30',
                        'to': '6c2b3b16-a436-47ca-9161-5cfce0082cc2',
                        'value': 'yes'
                    }
                ],
                'exceptions': [{
                        'frm': '7b12d56c-047f-44ed-ab77-ec0078f8fe30',
                        'to': '33b1c76b-fbca-4a57-baf0-b88b6fe851a2',
                        'value': '~InteractionError'
                    }],
                'class': 'Mim.Question',
                'options': {
                    'mimPath': 'mims/en-us/WotDHowOffer.mim',
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
        'bfc5c4a0-a1a2-4932-aaf1-f1076e4b3136': function () {
            return {
                'id': 'bfc5c4a0-a1a2-4932-aaf1-f1076e4b3136',
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
        '6c2b3b16-a436-47ca-9161-5cfce0082cc2': function () {
            return {
                'id': '6c2b3b16-a436-47ca-9161-5cfce0082cc2',
                'name': 'play',
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
            'name': 'LikeWotD',
            'uri': '/Users/jon/Workspace/jibo/buildsdk/skills/word-of-the-day/src/flows/LikeWotD.flow'
        },
        '57d5b235-dfe8-4d20-bc0f-250e537e730a': function () {
            return {
                'id': '57d5b235-dfe8-4d20-bc0f-250e537e730a',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '57d5b235-dfe8-4d20-bc0f-250e537e730a',
                        'to': 'b832c316-614e-41fc-9f76-ac19b8cdad60',
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
        '33b1c76b-fbca-4a57-baf0-b88b6fe851a2': function () {
            return {
                'id': '33b1c76b-fbca-4a57-baf0-b88b6fe851a2',
                'name': 'Wot D Play Declined',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '33b1c76b-fbca-4a57-baf0-b88b6fe851a2',
                        'to': '4f48f49f-d123-41ac-8f1a-1f0a3d3b78eb',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/WotDPlayDeclined.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        'b832c316-614e-41fc-9f76-ac19b8cdad60': function () {
            return {
                'id': 'b832c316-614e-41fc-9f76-ac19b8cdad60',
                'name': 'Wot D Like Offer',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': 'b832c316-614e-41fc-9f76-ac19b8cdad60',
                        'to': '33b1c76b-fbca-4a57-baf0-b88b6fe851a2',
                        'value': ''
                    },
                    {
                        'frm': 'b832c316-614e-41fc-9f76-ac19b8cdad60',
                        'to': '08742dc3-26c7-4f86-a0a2-e8bfb0a8dbef',
                        'value': 'yes'
                    }
                ],
                'exceptions': [{
                        'frm': 'b832c316-614e-41fc-9f76-ac19b8cdad60',
                        'to': '33b1c76b-fbca-4a57-baf0-b88b6fe851a2',
                        'value': '~InteractionError'
                    }],
                'class': 'Mim.Question',
                'options': {
                    'mimPath': 'mims/en-us/WotDLikeOffer.mim',
                    'getPromptData': () => {
                        return { playedToday: blackboard.playedToday };
                    },
                    'onSuccess': results => {
                        let mimState = results.state;
                        let asrResults = results.asrResults;
                        let transition = results.firstGrammarTag;
                        return transition;
                    },
                    'onStatus': status => {
                        let mimState = status.state;
                        let asrResults = status.asrResults;
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
        '08742dc3-26c7-4f86-a0a2-e8bfb0a8dbef': function () {
            return {
                'id': '08742dc3-26c7-4f86-a0a2-e8bfb0a8dbef',
                'name': 'play',
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
        '4f48f49f-d123-41ac-8f1a-1f0a3d3b78eb': function () {
            return {
                'id': '4f48f49f-d123-41ac-8f1a-1f0a3d3b78eb',
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
},{}],9:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        'meta': {
            'version': 1,
            'name': 'Main',
            'uri': '/Users/jon/Workspace/jibo/buildsdk/skills/word-of-the-day/src/flows/Main.flow'
        },
        'd70522b9-359e-467b-b518-0692bc663e57': function () {
            return {
                'id': 'd70522b9-359e-467b-b518-0692bc663e57',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'd70522b9-359e-467b-b518-0692bc663e57',
                        'to': '8f80598d-bb1d-433d-886b-d4cdf0379b91',
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
        '413ae959-6f03-4f47-ab19-daa6b9ced818': function () {
            return {
                'id': '413ae959-6f03-4f47-ab19-daa6b9ced818',
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
        '8f80598d-bb1d-433d-886b-d4cdf0379b91': function () {
            return {
                'id': '8f80598d-bb1d-433d-886b-d4cdf0379b91',
                'name': 'intent',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '8f80598d-bb1d-433d-886b-d4cdf0379b91',
                        'to': '808eaf29-3148-4608-8ba3-b90b3264826f',
                        'value': ''
                    },
                    {
                        'frm': '8f80598d-bb1d-433d-886b-d4cdf0379b91',
                        'to': '176c8cf8-93bf-4629-be2c-a2166629cef6',
                        'value': 'tutorial'
                    },
                    {
                        'frm': '8f80598d-bb1d-433d-886b-d4cdf0379b91',
                        'to': '5dd18186-585b-400b-8d7f-7eea3465a061',
                        'value': 'like'
                    },
                    {
                        'frm': '8f80598d-bb1d-433d-886b-d4cdf0379b91',
                        'to': '891448c9-2cf3-41e7-a7e5-0b13f86baa46',
                        'value': 'surprise'
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        return blackboard.intent;
                    }
                }
            };
        },
        '808eaf29-3148-4608-8ba3-b90b3264826f': function () {
            return {
                'id': '808eaf29-3148-4608-8ba3-b90b3264826f',
                'name': 'Gameplay',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '808eaf29-3148-4608-8ba3-b90b3264826f',
                        'to': '413ae959-6f03-4f47-ab19-daa6b9ced818',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Subflow',
                'options': {
                    'subflowId': () => {
                        return require('./Gameplay');
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
        '176c8cf8-93bf-4629-be2c-a2166629cef6': function () {
            return {
                'id': '176c8cf8-93bf-4629-be2c-a2166629cef6',
                'name': 'HowWotD',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '176c8cf8-93bf-4629-be2c-a2166629cef6',
                        'to': '808eaf29-3148-4608-8ba3-b90b3264826f',
                        'value': 'play'
                    },
                    {
                        'frm': '176c8cf8-93bf-4629-be2c-a2166629cef6',
                        'to': '413ae959-6f03-4f47-ab19-daa6b9ced818',
                        'value': ''
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Subflow',
                'options': {
                    'subflowId': () => {
                        return require('./HowWotD');
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
        '5dd18186-585b-400b-8d7f-7eea3465a061': function () {
            return {
                'id': '5dd18186-585b-400b-8d7f-7eea3465a061',
                'name': 'LikeWotD',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '5dd18186-585b-400b-8d7f-7eea3465a061',
                        'to': '808eaf29-3148-4608-8ba3-b90b3264826f',
                        'value': 'play'
                    },
                    {
                        'frm': '5dd18186-585b-400b-8d7f-7eea3465a061',
                        'to': '413ae959-6f03-4f47-ab19-daa6b9ced818',
                        'value': ''
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Subflow',
                'options': {
                    'subflowId': () => {
                        return require('./LikeWotD');
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
        '891448c9-2cf3-41e7-a7e5-0b13f86baa46': function () {
            return {
                'id': '891448c9-2cf3-41e7-a7e5-0b13f86baa46',
                'name': 'Surprise',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '891448c9-2cf3-41e7-a7e5-0b13f86baa46',
                        'to': '413ae959-6f03-4f47-ab19-daa6b9ced818',
                        'value': ''
                    },
                    {
                        'frm': '891448c9-2cf3-41e7-a7e5-0b13f86baa46',
                        'to': '176c8cf8-93bf-4629-be2c-a2166629cef6',
                        'value': 'tutorial'
                    },
                    {
                        'frm': '891448c9-2cf3-41e7-a7e5-0b13f86baa46',
                        'to': '808eaf29-3148-4608-8ba3-b90b3264826f',
                        'value': 'play'
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Subflow',
                'options': {
                    'subflowId': () => {
                        return require('./Surprise');
                    },
                    'inputParameters': () => {
                        return {};
                    },
                    'getTransition': subflow_result_object => {
                        return subflow_result_object.transition;
                    }
                }
            };
        }
    };
};
},{"./Gameplay":6,"./HowWotD":7,"./LikeWotD":8,"./Surprise":10}],10:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        'meta': {
            'version': 1,
            'name': 'Surprise',
            'uri': '/Users/jon/Workspace/jibo/buildsdk/skills/word-of-the-day/src/flows/Surprise.flow'
        },
        '57d5b235-dfe8-4d20-bc0f-250e537e730a': function () {
            return {
                'id': '57d5b235-dfe8-4d20-bc0f-250e537e730a',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '57d5b235-dfe8-4d20-bc0f-250e537e730a',
                        'to': 'a0355dae-7704-47f2-a72d-d66de1316eef',
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
        '33b1c76b-fbca-4a57-baf0-b88b6fe851a2': function () {
            return {
                'id': '33b1c76b-fbca-4a57-baf0-b88b6fe851a2',
                'asset-pack': 'core',
                'transitions': [],
                'exceptions': [],
                'class': 'Flow.End',
                'options': {
                    'mimPath': 'mims/en-us/WotDResponse.mim',
                    'getPromptData': () => {
                        return {};
                    },
                    'getTransition': () => {
                        return;
                    }
                }
            };
        },
        'a0355dae-7704-47f2-a72d-d66de1316eef': function () {
            return {
                'id': 'a0355dae-7704-47f2-a72d-d66de1316eef',
                'name': 'Wot D Surprise',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': 'a0355dae-7704-47f2-a72d-d66de1316eef',
                        'to': '33b1c76b-fbca-4a57-baf0-b88b6fe851a2',
                        'value': ''
                    },
                    {
                        'frm': 'a0355dae-7704-47f2-a72d-d66de1316eef',
                        'to': 'a377ff2f-17bf-4592-b8eb-84a9c92eb13f',
                        'value': 'whatsThat'
                    },
                    {
                        'frm': 'a0355dae-7704-47f2-a72d-d66de1316eef',
                        'to': '961f1381-60f1-44f3-a9d6-70c9b73356e5',
                        'value': 'yes'
                    }
                ],
                'exceptions': [{
                        'frm': 'a0355dae-7704-47f2-a72d-d66de1316eef',
                        'to': '33b1c76b-fbca-4a57-baf0-b88b6fe851a2',
                        'value': '~InteractionError'
                    }],
                'class': 'Mim.Question',
                'options': {
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
                        blackboard.Analytics.surpriseOffer(transition);
                        return transition;
                    },
                    'onFailure': results => {
                        let mimState = results.state;
                        let asrResults = results.asrResults;
                        let exception = results.exception;
                        blackboard.Analytics.surpriseOffer(exception);
                        return exception;
                    },
                    'mimPath': 'mims/en-us/WotDSurprise.mim'
                }
            };
        },
        '961f1381-60f1-44f3-a9d6-70c9b73356e5': function () {
            return {
                'id': '961f1381-60f1-44f3-a9d6-70c9b73356e5',
                'name': 'play',
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
        'a377ff2f-17bf-4592-b8eb-84a9c92eb13f': function () {
            return {
                'id': 'a377ff2f-17bf-4592-b8eb-84a9c92eb13f',
                'name': 'tutorial',
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
},{}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WordOfTheDay_1 = require("./WordOfTheDay");
module.exports = WordOfTheDay_1.default;

},{"./WordOfTheDay":4}]},{},[11])(11)
});
//# sourceMappingURL=index.js.map