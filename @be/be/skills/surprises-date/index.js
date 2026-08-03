(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.besurprisesDate = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
const surprises_1 = require("@be/surprises");
exports.CU = surprises_1.BeFramework.libraries.jibo_cai_utils;
const TestKeys = {
    today: 'today',
    userID: 'userID',
    PC_DateFact: 'PC_DateFact',
    daysSinceLast: 'daysSinceLast',
    hour: 'hour',
    userHasHeardComment: 'userHasHeardComment',
    userAlreadyOffered: 'userAlreadyOffered',
    alreadyOffered: 'alreadyOffered',
    lastSkill: 'lastSkill',
};
function daysBetween(date1, date2) {
    const exactDays = (date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24);
    if (exactDays <= 1) {
        if (date1.getDate() !== date2.getDate()) {
            return 1;
        }
        else {
            return 0;
        }
    }
    else {
        return Math.round(exactDays);
    }
}
class DateConfiguration extends exports.CU.TestConfiguration {
    constructor(skill) {
        super('@be/surprises-date');
        this.skill = skill;
        this.log = null;
        this.log = skill.log.createChild('DateConfig');
    }
    ;
    getDateFactProbability() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.getNumberFromTestConfig(TestKeys.PC_DateFact, () => Math.random());
        });
    }
    getDaysSinceLastOffered() {
        return __awaiter(this, void 0, void 0, function* () {
            const lastDate = yield this.skill.kbModel.getLastOfferedTime();
            return yield this.getNumberFromTestConfig(TestKeys.daysSinceLast, () => {
                if (lastDate) {
                    const todaysDate = this.skill.dateProvider.getDate();
                    this.log.debug(`days since offered: ${daysBetween(todaysDate, lastDate)}`);
                    return daysBetween(todaysDate, lastDate);
                }
                else {
                    return 10000;
                }
            });
        });
    }
    getHourOfDay() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.getNumberFromTestConfig(TestKeys.hour, () => {
                return this.skill.dateProvider.getDate().getHours();
            });
        });
    }
    getUserID(identityPlugin) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.getStringFromTestConfig(TestKeys.userID, () => {
                const speaker = identityPlugin.getActiveSpeaker();
                return speaker ? speaker.idInfo.id : null;
            });
        });
    }
    getLastSkill(skillFromResults) {
        return __awaiter(this, void 0, void 0, function* () {
            let lastSkill = yield this.getStringFromTestConfig(TestKeys.lastSkill, () => {
                return skillFromResults;
            });
            this.log.debug(`last skill: ${lastSkill}`);
            return lastSkill;
        });
    }
    userHeardComment(userID, dateString) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.getBooleanFromTestConfig(TestKeys.userHasHeardComment, () => {
                return this.skill.kbModel.getUserHeardComment(userID, dateString);
            });
        });
    }
    getDateId() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.getStringFromTestConfig(TestKeys.today, () => {
                const todaysDate = this.skill.dateProvider.getDate();
                let month = todaysDate.getMonth() + 1;
                let day = todaysDate.getDate();
                this.log.debug(`dateID: ${month}-${day}`);
                return `${month}-${day}`;
            });
        });
    }
    getUserLastOffered(userID) {
        return __awaiter(this, void 0, void 0, function* () {
            const dateID = yield this.getDateId();
            const lastOffered = yield this.skill.kbModel.getLastOffered(userID);
            return yield this.getBooleanFromTestConfig(TestKeys.userAlreadyOffered, () => {
                return lastOffered === dateID;
            });
        });
    }
    getLastOffered() {
        return __awaiter(this, void 0, void 0, function* () {
            const dateID = yield this.getDateId();
            const lastOffered = yield this.skill.kbModel.getLastOffered();
            return yield this.getBooleanFromTestConfig(TestKeys.alreadyOffered, () => {
                return lastOffered === dateID;
            });
        });
    }
}
exports.DateConfiguration = DateConfiguration;

},{"@be/surprises":undefined}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const surprises_1 = require("@be/surprises");
const utils = surprises_1.BeFramework.utils;
class DateProvider {
    constructor(log) {
        this.log = log;
        if (!log) {
            this.log = {
                warn(msg) { console.warn(msg); }
            };
        }
    }
    getDate() {
        const dateInOSLocal = new Date();
        var dateUTC = new Date(dateInOSLocal.getUTCFullYear(), dateInOSLocal.getUTCMonth(), dateInOSLocal.getUTCDate(), dateInOSLocal.getUTCHours(), dateInOSLocal.getUTCMinutes(), dateInOSLocal.getUTCSeconds());
        let offset = 0;
        try {
            offset = utils.Location.jiboHome.timezone.offsetUTC;
        }
        catch (e) {
            this.log.warn(`error getting timezone offset (using 0 instead): ${e}`);
            offset = 0;
        }
        return new Date(dateUTC.getTime() + offset);
    }
}
exports.DateProvider = DateProvider;

},{"@be/surprises":undefined}],3:[function(require,module,exports){
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
const surprises_1 = require("@be/surprises");
const { PromiseUtils } = surprises_1.BeFramework.libraries.jibo_cai_utils;
class KBModel {
    constructor(log) {
        this.log = null;
        this.log = log.createChild('kbModel');
    }
    init(name = 'surprises-date-commentary') {
        return __awaiter(this, void 0, void 0, function* () {
            this.model = jibo.kb.createModel('/' + name);
            this.rootNode = yield PromiseUtils.promisify(h => this.model.loadRoot(h));
            if (!this.rootNode.data) {
                this.rootNode.data = {
                    lastDelivered: null,
                    lastOffered: null,
                    lastDeliveredTime: -1,
                    lastOfferedTime: -1
                };
                yield PromiseUtils.promisify(h => this.rootNode.save(h));
            }
            const edges = this.rootNode.getEdges('loop');
            if (edges.length === 0) {
                this.loopNode = this.model.createNode('loop', { description: 'Loop Member Memory' });
                yield PromiseUtils.promisify(h => this.loopNode.save(h));
                this.rootNode.addEdges(this.loopNode);
                yield PromiseUtils.promisify(h => this.rootNode.save(h));
            }
            else if (edges.length === 1) {
                this.loopNode = yield PromiseUtils.promisify(h => this.model.load(edges[0], h));
            }
            else {
                throw new Error('EoS DateCommentary should only have one Loop Member Memory node');
            }
            return null;
        });
    }
    getOrCreateUserNode(userID) {
        return __awaiter(this, void 0, void 0, function* () {
            const userEdges = this.loopNode.getEdges(userID);
            let userNode;
            if (userEdges.length === 0) {
                userNode = this.model.createNode(userID);
                userNode.data = {
                    lastDelivered: null,
                    lastOffered: null,
                    dates: {},
                };
                yield PromiseUtils.promisify(h => userNode.save(h));
                this.loopNode.addEdges(userNode);
                yield PromiseUtils.promisify(h => this.loopNode.save(h));
            }
            else {
                userNode = yield PromiseUtils.promisify(h => this.model.load(userEdges[0], h));
            }
            return userNode;
        });
    }
    markOffered(dateString, date, userID) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userID) {
                const userNode = yield this.getOrCreateUserNode(userID);
                userNode.data.lastOffered = dateString;
                yield PromiseUtils.promisify(h => userNode.save(h));
            }
            this.rootNode.data.lastOfferedTime = date.getTime();
            this.rootNode.data.lastOffered = dateString;
            let idLog = userID || 'none';
            this.log.debug(`mark offered ${dateString} | UserID: ${idLog}`);
            yield PromiseUtils.promisify(h => this.rootNode.save(h));
        });
    }
    getLastOffered(userID) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userID) {
                const userNode = yield this.getOrCreateUserNode(userID);
                this.log.debug(`date last offered to userID '${userID}': ${userNode.data.lastOffered}`);
                return userNode.data.lastOffered;
            }
            else {
                this.log.debug(`date last offered: ${this.rootNode.data.lastOffered}`);
                return this.rootNode.data.lastOffered;
            }
        });
    }
    getLastOfferedTime() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.rootNode.data.lastOfferedTime > 0) {
                this.log.debug(`time last offered: ${new Date(this.rootNode.data.lastOfferedTime)}`);
                return new Date(this.rootNode.data.lastOfferedTime);
            }
            return null;
        });
    }
    markDelivered(dateString, date, userID) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userID) {
                const userNode = yield this.getOrCreateUserNode(userID);
                userNode.data.lastDelivered = dateString;
                yield PromiseUtils.promisify(h => userNode.save(h));
            }
            this.rootNode.data.lastDeliveredTime = date.getTime();
            this.rootNode.data.lastDelivered = dateString;
            let idLog = userID || 'none';
            this.log.debug(`mark delivered ${dateString} | UserID: ${idLog}`);
            yield PromiseUtils.promisify(h => this.rootNode.save(h));
        });
    }
    getLastDelivered(userID) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userID) {
                const userNode = yield this.getOrCreateUserNode(userID);
                this.log.debug(`date last delivered to userID '${userID}': ${userNode.data.lastDelivered}`);
                return userNode.data.lastDelivered;
            }
            else {
                this.log.debug(`date last delivered: ${this.rootNode.data.lastDelivered}`);
                return this.rootNode.data.lastDelivered;
            }
        });
    }
    getLastDeliveredTime() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.rootNode.data.lastDeliveredTime > 0) {
                this.log.debug(`time last delivered: ${new Date(this.rootNode.data.lastDeliveredTime)}`);
                return new Date(this.rootNode.data.lastDeliveredTime);
            }
            return null;
        });
    }
    getUserHeardComment(userID, dateString) {
        return __awaiter(this, void 0, void 0, function* () {
            const userNode = yield this.getOrCreateUserNode(userID);
            this.log.debug(`user has heard comment: ${!!userNode.data.dates[dateString]}`);
            return !!userNode.data.dates[dateString];
        });
    }
}
exports.KBModel = KBModel;

},{"@be/surprises":undefined,"jibo":undefined}],4:[function(require,module,exports){
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
const path = require("path");
const surprises_1 = require("@be/surprises");
const KBModel_1 = require("./KBModel");
const DateConfiguration_1 = require("./DateConfiguration");
const DateProvider_1 = require("./DateProvider");
const Analytics_1 = require("./analytics/Analytics");
const { PromiseUtils } = surprises_1.BeFramework.libraries.jibo_cai_utils;
let mainFlow = require('./flows/main.flow');
function getSpokenName(userID) {
    return __awaiter(this, void 0, void 0, function* () {
        return PromiseUtils.promisify(h => jibo.kb.loop.getSpokenNameById(userID, h));
    });
}
class SurprisesDate extends surprises_1.SurpriseElement {
    constructor(options, kbName) {
        super(options);
        this.kbName = kbName;
        this.kbModel = new KBModel_1.KBModel(this.log);
        this.config = new DateConfiguration_1.DateConfiguration(this);
        this.dateProvider = new DateProvider_1.DateProvider(this.log);
        this.standalone = (this.assetPack.length === 0);
        this.analytics = new Analytics_1.default(this);
    }
    postInit(done) {
        this.identity = surprises_1.SurpriseElement.plugins.identity;
        const testConfigPath = path.join(jibo.utils.PathUtils.findRoot(), 'testConfig.json');
        Promise.all([
            this.kbModel.init(this.kbName),
            this.config.init(testConfigPath)
        ])
            .then(() => done())
            .catch(done);
    }
    getCategoryPriority() {
        return 10;
    }
    getContextualPriority(context) {
        return __awaiter(this, void 0, void 0, function* () {
            this.log.info('Contextual Priority step 1');
            const userID = yield this.config.getUserID(this.identity);
            if (userID) {
                if (yield this.config.getUserLastOffered(userID)) {
                    return 0;
                }
                else {
                    return this.getContextualPriorityStep2(context);
                }
            }
            else {
                if (yield this.config.getLastOffered()) {
                    return 0;
                }
                else {
                    return this.getContextualPriorityStep2(context);
                }
            }
        });
    }
    getContextualPriorityStep2(context) {
        return __awaiter(this, void 0, void 0, function* () {
            this.log.info('Contextual Priority step 2');
            const daysSinceLast = yield this.config.getDaysSinceLastOffered();
            const hour = yield this.config.getHourOfDay();
            if (daysSinceLast < 2 || hour <= 12) {
                return 0;
            }
            if (context.lastSkill === '@be/introductions' || context.lastSkill === '@be/tutorial') {
                return 0;
            }
            if (context.lastSkill !== '@be/clock') {
                return 0.5;
            }
            let priority = 0;
            if (daysSinceLast >= 4) {
                priority += 1;
            }
            const prob = yield this.config.getDateFactProbability();
            if (prob < 0.5) {
                priority += 1;
            }
            this.log.debug(`priority: ${priority}`);
            return priority;
        });
    }
    preload(done) {
        jibo.face.views.forceEyeView();
        done();
    }
    open(result, refresh) {
        if (refresh) {
            return;
        }
        this._open(result)
            .then((status) => {
            if (status === jibo.bt.Status.INTERRUPTED) {
                return;
            }
            this.exit();
        }).catch(e => {
            this.log.error(e);
            this.exit();
        });
    }
    _open(result) {
        return __awaiter(this, void 0, void 0, function* () {
            this.log.info(`Open`);
            result = result || { lastSkill: '@be/jot' };
            this.log.info('Result:', result);
            this.lastSkill = result.lastSkill;
            let [lastSkill, today, speakerID] = yield Promise.all([
                this.config.getLastSkill(result.lastSkill),
                this.config.getDateId(),
                this.config.getUserID(this.identity)
            ]);
            let firstName;
            try {
                firstName = yield getSpokenName(speakerID);
            }
            catch (e) { }
            this.log.info(`Speaker id: '${speakerID}'`);
            this.log.info(`Date: ${today}`);
            const holidayPlugin = surprises_1.BeFramework.BeSkill.plugins.holiday;
            const activeHolidays = yield holidayPlugin.getActiveHolidaySet();
            const celebratesHoliday = (holiday) => {
                const userCelebrates = activeHolidays.has(holiday);
                this.log.info(`Is ${holiday} celebrated? ${userCelebrates}`);
                return userCelebrates;
            };
            let blackboard = {
                skill: this,
                dateId: today,
                lastSkill: (lastSkill === '@be/clock') ? 'clock' : 'non-clock',
                celebratesHoliday,
                firstName
            };
            const options = { assetPack: this.assetPack, blackboard: blackboard };
            return PromiseUtils.promisify((h) => {
                this.flow = jibo.flow.run(mainFlow, options, h);
            }).then((status) => {
                if (status === jibo.bt.Status.INTERRUPTED) {
                    return status;
                }
                this.flow = null;
                return 'FLOW_DONE';
            }).catch(err => {
                this.flow = null;
                throw err;
            });
        });
    }
    markDelivered() {
        return __awaiter(this, void 0, void 0, function* () {
            const date = this.dateProvider.getDate();
            const [dateID, userID] = yield Promise.all([
                this.config.getDateId(),
                this.config.getUserID(this.identity)
            ]);
            return this.kbModel.markDelivered(dateID, date, userID);
        });
    }
    markOffered() {
        return __awaiter(this, void 0, void 0, function* () {
            const date = this.dateProvider.getDate();
            const [dateID, userID] = yield Promise.all([
                this.config.getDateId(),
                this.config.getUserID(this.identity)
            ]);
            return this.kbModel.markOffered(dateID, date, userID);
        });
    }
    close(done) {
        this._close().then(done).catch(done);
    }
    _close() {
        return __awaiter(this, void 0, void 0, function* () {
            this.log.info(`Close`);
            this.analytics.accepted(this.lastSkill);
            if (this.flow) {
                yield this.flow.stop();
                this.flow = null;
            }
        });
    }
}
exports.SurprisesDate = SurprisesDate;

},{"./DateConfiguration":1,"./DateProvider":2,"./KBModel":3,"./analytics/Analytics":5,"./flows/main.flow":6,"@be/surprises":undefined,"jibo":undefined,"path":undefined}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Analytics {
    constructor(skill) {
        this.fact_handled = 'ignored';
        this.skill = skill;
    }
    accepted(last_skill) {
        this.skill.track('Surprises Fact', { fact_offered: true, fact_handled: this.fact_handled, last_skill });
        this.fact_handled = 'ignored';
    }
}
exports.default = Analytics;

},{}],6:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        'meta': {
            'version': 1,
            'name': 'main',
            'uri': '/Users/jon/Workspace/jibo/buildsdk/skills/surprises-date/src/flows/main.flow'
        },
        '598e7151-83d3-46bc-a05f-926a3cb7fe46': function () {
            return {
                'id': '598e7151-83d3-46bc-a05f-926a3cb7fe46',
                'transitions': [{
                        'frm': '598e7151-83d3-46bc-a05f-926a3cb7fe46',
                        'to': '8e4b9290-6104-42f4-bc16-006afdfcfa5c',
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
        'c653bab5-3172-4498-a7b7-b560f5a876f1': function () {
            return {
                'id': 'c653bab5-3172-4498-a7b7-b560f5a876f1',
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
        '09f0aa01-d8e3-4493-80a0-4219af59bf45': function () {
            return {
                'id': '09f0aa01-d8e3-4493-80a0-4219af59bf45',
                'name': 'Dynamic MIM',
                'transitions': [{
                        'frm': '09f0aa01-d8e3-4493-80a0-4219af59bf45',
                        'to': 'cbc17908-0eba-4528-b89f-3d8706586e72',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim',
                'options': {
                    'getMimPath': () => {
                        blackboard.skill.log.info(`playing MIM: ${ blackboard.dateId }`);
                        return 'mims/en-us/date-commentary/new/' + blackboard.dateId + '.mim';
                    },
                    'getPromptData': () => {
                        return {
                            currentYear: new Date().getFullYear(),
                            type: blackboard.lastSkill,
                            celebratesHoliday: blackboard.celebratesHoliday
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
                    },
                    'mimPath': 'mims/en-us/date-commentary/clock/1-1.mim'
                }
            };
        },
        'efe6729f-8f75-4e1f-b91a-33d91a030ef9': function () {
            return {
                'id': 'efe6729f-8f75-4e1f-b91a-33d91a030ef9',
                'name': 'Offer Date Fact',
                'transitions': [
                    {
                        'frm': 'efe6729f-8f75-4e1f-b91a-33d91a030ef9',
                        'to': '09f0aa01-d8e3-4493-80a0-4219af59bf45',
                        'value': 'yes'
                    },
                    {
                        'frm': 'efe6729f-8f75-4e1f-b91a-33d91a030ef9',
                        'to': 'c653bab5-3172-4498-a7b7-b560f5a876f1',
                        'value': ''
                    },
                    {
                        'frm': 'efe6729f-8f75-4e1f-b91a-33d91a030ef9',
                        'to': 'f53dfe78-e885-492f-84e0-dde0203ad9ae',
                        'value': 'no'
                    }
                ],
                'exceptions': [{
                        'frm': 'efe6729f-8f75-4e1f-b91a-33d91a030ef9',
                        'to': 'f53dfe78-e885-492f-84e0-dde0203ad9ae',
                        'value': '~'
                    }],
                'class': 'Mim.Question',
                'options': {
                    'mimPath': 'mims/en-us/date-commentary/OfferDateFact.mim',
                    'getPromptData': () => {
                        blackboard.skill.log.info('Flow: main: Mim: Date Commentary Intro');
                        return { firstName: blackboard.firstName || '' };
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
                        if (transition === 'yes') {
                            blackboard.skill.analytics.fact_handled = 'accepted';
                        } else if (transition === 'no') {
                            blackboard.skill.analytics.fact_handled = 'rejected';
                        }
                        if (!(transition === 'yes' || transition === 'no')) {
                            console.error('Transition not valid: ', transition);
                            transition = 'no';
                        }
                        return transition;
                    },
                    'onFailure': results => {
                        let mimState = results.state;
                        let asrResults = results.asrResults;
                        let speakerIds = results.speakerIds;
                        let exception = results.exception;
                        if (!exception || !exception.startsWith('~')) {
                            console.error('Exception not valid: ', exception);
                            exception = '~';
                        }
                        return exception;
                    }
                }
            };
        },
        'f53dfe78-e885-492f-84e0-dde0203ad9ae': function () {
            return {
                'id': 'f53dfe78-e885-492f-84e0-dde0203ad9ae',
                'name': 'Date Fact- Declined',
                'transitions': [{
                        'frm': 'f53dfe78-e885-492f-84e0-dde0203ad9ae',
                        'to': 'c653bab5-3172-4498-a7b7-b560f5a876f1',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/date-commentary/DateFact-Declined.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        'cbc17908-0eba-4528-b89f-3d8706586e72': function () {
            return {
                'id': 'cbc17908-0eba-4528-b89f-3d8706586e72',
                'name': 'Mark user delivered',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'cbc17908-0eba-4528-b89f-3d8706586e72',
                        'to': 'c653bab5-3172-4498-a7b7-b560f5a876f1',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        blackboard.skill.markDelivered().then(() => done()).catch(done);
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '8e4b9290-6104-42f4-bc16-006afdfcfa5c': function () {
            return {
                'id': '8e4b9290-6104-42f4-bc16-006afdfcfa5c',
                'name': 'Mark user offered',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '8e4b9290-6104-42f4-bc16-006afdfcfa5c',
                        'to': 'efe6729f-8f75-4e1f-b91a-33d91a030ef9',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        blackboard.skill.markOffered().then(() => done()).catch(done);
                    },
                    'onStop': () => {
                    }
                }
            };
        }
    };
};
},{}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SurprisesDate_1 = require("./SurprisesDate");
module.exports = SurprisesDate_1.SurprisesDate;

},{"./SurprisesDate":4}]},{},[7])(7)
});
//# sourceMappingURL=index.js.map