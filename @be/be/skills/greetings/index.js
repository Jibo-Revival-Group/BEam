(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.begreetings = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const be_framework_1 = require("@be/be-framework");
const Types_1 = require("./Types");
const DoMiMState_1 = require("./states/primitives/DoMiMState");
const DoneState_1 = require("./states/primitives/DoneState");
const IntentSplit_1 = require("./states/IntentSplit");
const PartOfDayState_1 = require("./states/PartOfDayState");
const SelfIdState_1 = require("./states/SelfIdState");
const ProactiveProbabilityState_1 = require("./states/ProactiveProbabilityState");
const ProactiveOptionalResponseState_1 = require("./states/ProactiveOptionalResponseState");
const ProactiveGreetingState_1 = require("./states/ProactiveGreetingState");
const IsProactiveState_1 = require("./states/IsProactiveState");
const VerbalGreetedMiMState_1 = require("./states/VerbalGreetedMiMState");
const HeyJiboIntentState_1 = require("./states/HeyJiboIntentState");
const SelectWhatsUpState_1 = require("./states/SelectWhatsUpState");
const ShouldDoBirthdayState_1 = require("./states/ShouldDoBirthdayState");
const ShouldDoHolidayState_1 = require("./states/ShouldDoHolidayState");
const HolidayMiMState_1 = require("./states/HolidayMiMState");
const ReactiveHolidayState_1 = require("./states/ReactiveHolidayState");
const ShouldDoMorningGreetingState_1 = require("./states/ShouldDoMorningGreetingState");
const ChooseMorningGreetingState_1 = require("./states/ChooseMorningGreetingState");
const HelloState_1 = require("./states/HelloState");
const ShouldDoSleepEmpathy_1 = require("./states/ShouldDoSleepEmpathy");
const SleepEmpathyQuestionState_1 = require("./states/SleepEmpathyQuestionState");
const SleepEmpathyResponseState_1 = require("./states/SleepEmpathyResponseState");
const ShouldDoBedtimeReminderState_1 = require("./states/ShouldDoBedtimeReminderState");
const BedtimeReminderState_1 = require("./states/BedtimeReminderState");
const BedtimeReminderResponseState_1 = require("./states/BedtimeReminderResponseState");
const ShouldDoDayEmpathyState_1 = require("./states/ShouldDoDayEmpathyState");
const DayEmpathyQuestionState_1 = require("./states/DayEmpathyQuestionState");
const DayEmpathyResponseState_1 = require("./states/DayEmpathyResponseState");
var sm = be_framework_1.libraries.jibo_state_machine;
class GreetingsSM extends sm.StateMachine {
    constructor(skill) {
        super();
        this.skill = skill;
        this.intentSplitState = new IntentSplit_1.IntentSplit(this);
        this.doneState = new DoneState_1.DoneState(this);
        this.variableMIMNoListenState = new DoMiMState_1.DoMIMState(this, this.skill, 'Variable MIM (no listen)');
        this.goodbyeState = new VerbalGreetedMiMState_1.VerbalGreetedMIMState(this, this.skill, 'Goodbye MIM', () => 'GoodbyeRespCM');
        this.goodnightState = new VerbalGreetedMiMState_1.VerbalGreetedMIMState(this, this.skill, 'Good night MIM', () => 'GoodnightResponse');
        this.imHomeState = new VerbalGreetedMiMState_1.VerbalGreetedMIMState(this, this.skill, `I'm home MIM`, () => 'IAmHome');
        this.imBackState = new VerbalGreetedMiMState_1.VerbalGreetedMIMState(this, this.skill, `I'm back MIM`, () => 'IAmBack');
        this.heyJiboState = new HeyJiboIntentState_1.HeyJiboIntentState(this);
        this.proactiveGreetingState = new ProactiveGreetingState_1.ProactiveGreetingState(this);
        this.selfIDState = new SelfIdState_1.SelfIdState(this);
        this.partOfDayState = new PartOfDayState_1.PartOfDayState(this);
        this.helloState = new HelloState_1.HelloState(this);
        this.whatsUpState = new SelectWhatsUpState_1.SelectWhatsUpState(this);
        this.shouldDoBirthdayState = new ShouldDoBirthdayState_1.ShouldDoBirthdayState(this, this.skill, `Should Do Birthday?`);
        this.shouldDoHolidayState1 = new ShouldDoHolidayState_1.ShouldDoHolidayState(this, this.skill, `Should Do Holiday? (no Bday)`);
        this.shouldDoHolidayState2 = new ShouldDoHolidayState_1.ShouldDoHolidayState(this, this.skill, `Should Do Holiday? (with Bday)`);
        this.birthdayMiMState = new HolidayMiMState_1.HolidayMIMState(this, this.skill, 'Happy Birthday MiM', Types_1.SpecialDayType.BIRTHDAY, () => 'HappyBirthdayToYou');
        this.holidayMiMState = new HolidayMiMState_1.HolidayMIMState(this, this.skill, 'Holiday MiM', Types_1.SpecialDayType.HOLIDAY, () => 'Holiday');
        this.alsoHolidayMimState = new DoMiMState_1.DoMIMState(this, this.skill, 'Also Holiday', () => 'AlsoHoliday');
        this.reactiveHolidayState = new ReactiveHolidayState_1.ReactiveHolidayState(this);
        this.shouldDoMorningGreetingState = new ShouldDoMorningGreetingState_1.ShouldDoMorningGreetingState(this);
        this.chooseMorningGreetingState = new ChooseMorningGreetingState_1.ChooseMorningGreetingState(this);
        this.setInitial(this.intentSplitState);
        this.intentSplitState.init();
        this.heyJiboState.addDoneTransition(this.variableMIMNoListenState);
        this.selfIDState.addDoneTransition(this.variableMIMNoListenState);
        this.reactiveHolidayState.addDoneTransition(this.variableMIMNoListenState);
        this.goodbyeState.addDoneTransition(this.doneState);
        this.goodnightState.addDoneTransition(this.doneState);
        this.imHomeState.addDoneTransition(this.doneState);
        this.imBackState.addDoneTransition(this.doneState);
        this.helloState.addDoneTransition(this.shouldDoBirthdayState);
        this.whatsUpState.addDoneTransition(this.shouldDoBirthdayState);
        this.proactiveGreetingState.init(this.shouldDoBirthdayState, this.variableMIMNoListenState, ['Verbal', 'Nonverbal']);
        this.partOfDayState.init(this.shouldDoBirthdayState, this.variableMIMNoListenState, ['Normal', 'WrongToD']);
        this.shouldDoBirthdayState.init(this.birthdayMiMState, this.shouldDoHolidayState1);
        this.birthdayMiMState.addDoneTransition(this.shouldDoHolidayState2);
        this.shouldDoHolidayState1.init(this.holidayMiMState, this.shouldDoMorningGreetingState);
        this.shouldDoHolidayState2.init(this.alsoHolidayMimState, this.doneState);
        this.alsoHolidayMimState.addDoneTransition(this.holidayMiMState);
        if (this.skill.ALLOW_OPTIONAL_RESPONSE) {
            this.skill.log.info("Setup allowing optional responses.");
            this.initWithOptionalResponses();
        }
        else {
            this.skill.log.info("Setup prohibiting optional responses.");
            this.initWithoutOptionalResponses();
        }
    }
    initWithOptionalResponses() {
        this.isProactiveState = new IsProactiveState_1.IsProactiveState(this);
        this.proactiveVariableMIMState = new ProactiveProbabilityState_1.ProactiveProbabilityState(this, this.skill, 'Variable Random Proactive MiM');
        this.proactiveOptionalResponseState = new ProactiveOptionalResponseState_1.ProactiveOptionalResponseState(this, this.skill, 'Optional Response MiM');
        if (this.skill.ALLOW_SLEEP_EMPATHY) {
            this.shouldDoSleepEmpathyState = new ShouldDoSleepEmpathy_1.ShouldDoSleepEmpathy(this);
            this.sleepEmpathyQuestionState = new SleepEmpathyQuestionState_1.SleepEmpathyQuestionState(this);
            this.sleepEmpathyResponseState = new SleepEmpathyResponseState_1.SleepEmpathyResponseState(this, this.skill);
            this.shouldDoBedtimeReminderState = new ShouldDoBedtimeReminderState_1.ShouldDoBedtimeReminderState(this);
            this.bedtimeReminderState = new BedtimeReminderState_1.BedtimeReminderState(this, this.skill);
            this.bedtimeReminderResponseState = new BedtimeReminderResponseState_1.BedtimeReminderResponseState(this, this.skill);
            this.shouldDoDayEmpathyState = new ShouldDoDayEmpathyState_1.ShouldDoDayEmpathyState(this);
            this.dayEmpathyQuestionState = new DayEmpathyQuestionState_1.DayEmpathyQuestionState(this);
            this.dayEmpathyResponseState = new DayEmpathyResponseState_1.DayEmpathyResponseState(this, this.skill);
            this.shouldDoMorningGreetingState.init(this.chooseMorningGreetingState, this.shouldDoBedtimeReminderState);
            this.chooseMorningGreetingState.addDoneTransition(this.shouldDoSleepEmpathyState);
            this.shouldDoBedtimeReminderState.init(this.bedtimeReminderState, this.shouldDoDayEmpathyState);
            this.shouldDoDayEmpathyState.init(this.dayEmpathyQuestionState, this.isProactiveState);
            this.shouldDoSleepEmpathyState.init(this.sleepEmpathyQuestionState, this.isProactiveState);
            this.sleepEmpathyQuestionState.addDoneTransition(this.sleepEmpathyResponseState);
            this.sleepEmpathyResponseState.addDoneTransition(this.doneState);
            this.bedtimeReminderState.addDoneTransition(this.bedtimeReminderResponseState);
            this.bedtimeReminderResponseState.addDoneTransition(this.doneState);
            this.dayEmpathyQuestionState.addDoneTransition(this.dayEmpathyResponseState);
            this.dayEmpathyResponseState.addDoneTransition(this.doneState);
        }
        else {
            this.shouldDoMorningGreetingState.init(this.chooseMorningGreetingState, this.isProactiveState);
            this.chooseMorningGreetingState.addDoneTransition(this.isProactiveState);
        }
        this.isProactiveState.init(this.proactiveVariableMIMState, this.variableMIMNoListenState);
        this.proactiveVariableMIMState.addDoneTransition(this.proactiveOptionalResponseState);
        this.proactiveOptionalResponseState.addDoneTransition(this.doneState);
        this.holidayMiMState.addDoneTransition(this.doneState);
        this.variableMIMNoListenState.addDoneTransition(this.doneState);
    }
    initWithoutOptionalResponses() {
        if (this.skill.ALLOW_SLEEP_EMPATHY) {
            this.shouldDoSleepEmpathyState = new ShouldDoSleepEmpathy_1.ShouldDoSleepEmpathy(this);
            this.sleepEmpathyQuestionState = new SleepEmpathyQuestionState_1.SleepEmpathyQuestionState(this);
            this.sleepEmpathyResponseState = new SleepEmpathyResponseState_1.SleepEmpathyResponseState(this, this.skill);
            this.shouldDoBedtimeReminderState = new ShouldDoBedtimeReminderState_1.ShouldDoBedtimeReminderState(this);
            this.bedtimeReminderState = new BedtimeReminderState_1.BedtimeReminderState(this, this.skill);
            this.bedtimeReminderResponseState = new BedtimeReminderResponseState_1.BedtimeReminderResponseState(this, this.skill);
            this.shouldDoDayEmpathyState = new ShouldDoDayEmpathyState_1.ShouldDoDayEmpathyState(this);
            this.dayEmpathyQuestionState = new DayEmpathyQuestionState_1.DayEmpathyQuestionState(this);
            this.dayEmpathyResponseState = new DayEmpathyResponseState_1.DayEmpathyResponseState(this, this.skill);
            this.shouldDoMorningGreetingState.init(this.chooseMorningGreetingState, this.shouldDoBedtimeReminderState);
            this.chooseMorningGreetingState.addDoneTransition(this.shouldDoSleepEmpathyState);
            this.shouldDoSleepEmpathyState.init(this.sleepEmpathyQuestionState, this.variableMIMNoListenState);
            this.shouldDoBedtimeReminderState.init(this.bedtimeReminderState, this.variableMIMNoListenState);
            this.shouldDoDayEmpathyState.init(this.dayEmpathyQuestionState, this.variableMIMNoListenState);
            this.sleepEmpathyQuestionState.addDoneTransition(this.sleepEmpathyResponseState);
            this.sleepEmpathyResponseState.addDoneTransition(this.doneState);
            this.bedtimeReminderState.addDoneTransition(this.bedtimeReminderResponseState);
            this.bedtimeReminderResponseState.addDoneTransition(this.doneState);
            this.dayEmpathyQuestionState.addDoneTransition(this.dayEmpathyResponseState);
            this.dayEmpathyResponseState.addDoneTransition(this.doneState);
        }
        else {
            this.shouldDoMorningGreetingState.init(this.chooseMorningGreetingState, this.variableMIMNoListenState);
            this.chooseMorningGreetingState.addDoneTransition(this.variableMIMNoListenState);
        }
        this.holidayMiMState.addDoneTransition(this.doneState);
        this.variableMIMNoListenState.addDoneTransition(this.doneState);
    }
}
exports.GreetingsSM = GreetingsSM;

},{"./Types":3,"./states/BedtimeReminderResponseState":6,"./states/BedtimeReminderState":7,"./states/ChooseMorningGreetingState":8,"./states/DayEmpathyQuestionState":9,"./states/DayEmpathyResponseState":10,"./states/HelloState":11,"./states/HeyJiboIntentState":12,"./states/HolidayMiMState":13,"./states/IntentSplit":14,"./states/IsProactiveState":15,"./states/PartOfDayState":16,"./states/ProactiveGreetingState":17,"./states/ProactiveOptionalResponseState":18,"./states/ProactiveProbabilityState":19,"./states/ReactiveHolidayState":20,"./states/SelectWhatsUpState":21,"./states/SelfIdState":22,"./states/ShouldDoBedtimeReminderState":23,"./states/ShouldDoBirthdayState":24,"./states/ShouldDoDayEmpathyState":25,"./states/ShouldDoHolidayState":26,"./states/ShouldDoMorningGreetingState":27,"./states/ShouldDoSleepEmpathy":28,"./states/SleepEmpathyQuestionState":29,"./states/SleepEmpathyResponseState":30,"./states/VerbalGreetedMiMState":31,"./states/primitives/DoMiMState":32,"./states/primitives/DoneState":33,"@be/be-framework":undefined}],2:[function(require,module,exports){
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
var cu = be_framework_1.libraries.jibo_cai_utils;
const Types_1 = require("./Types");
const Utils_1 = require("./utils/Utils");
const LoopUtils_1 = require("./utils/LoopUtils");
const GreetingsSM_1 = require("./GreetingsSM");
const _ = require("lodash/lodash.min");
const { PromiseUtils, TimeUtils } = be_framework_1.libraries.jibo_cai_utils;
const sm = be_framework_1.libraries.jibo_state_machine;
class GreetingsSkill extends be_framework_1.BeSkill {
    constructor(data, unitTestMode = false) {
        super(data);
        this.unitTestMode = unitTestMode;
        this.dateProvider = null;
        this.loopUtils = new LoopUtils_1.LoopUtils(this);
        this.blackboard = null;
        this.ALLOW_OPTIONAL_RESPONSE = true;
        this.ALLOW_SLEEP_EMPATHY = true;
        this.EMPATHY_RESET_HOURS = 36;
        this.sm = new GreetingsSM_1.GreetingsSM(this);
        this.convTechLog = null;
        const sessionCreate = (options = {}) => {
            return {
                promise: this._open(options),
                stop: () => this.sm.stop()
            };
        };
        this.session = new cu.SessionManager(sessionCreate, () => this.exit(), this.log);
    }
    postInit(done) {
        let offset = 0;
        try {
            offset = be_framework_1.utils.Location.jiboHome.timezone.offsetUTC;
        }
        catch (e) {
            this.log.warn(`error getting timezone offset (using 0 instead): ${e}`);
        }
        this.dateProvider = new Types_1.DateProvider(offset);
        this.convTechLog = this.log.createChild('ConvTechSpeakerID');
        if (!this.unitTestMode) {
            this.greetingsModel = jibo.kb.createModel('/skills/greetings');
            this.greetingsModel.loadRoot((err, root) => {
                if (root) {
                    this.greetingsRoot = root;
                }
            });
        }
        done();
    }
    preload(done) {
        jibo.face.views.forceEyeView();
        done();
    }
    open(options, refresh) {
        if (refresh) {
            this.session.replaceSession(options);
        }
        else {
            this.session.open(options);
        }
    }
    close(done) {
        this.session.close()
            .then(() => done())
            .catch(e => done(e));
    }
    _open(options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.sm.start(options);
            }
            catch (e) {
                this.log.error(`Error running greetings state machine: `, e);
            }
            if (this.blackboard && this.blackboard.greeted) {
                let eventDesc = {
                    skillName: this.assetPack,
                    verbal: this.blackboard.verbal,
                    proactive: this.blackboard.proactive
                };
                if (this.blackboard.user) {
                    eventDesc.personIDs = [this.blackboard.user.uuid];
                }
                this.log.debug('recording greeting in interaction memory');
                jibo.im.noteEvent(eventDesc);
            }
            else {
                this.log.warn(`conditions not met for recording greeting in interaction memory`);
            }
            if (this.blackboard && this.blackboard.greeted && this.blackboard.verbal) {
                let socialDriveValueBefore = jibo.action.getMotivationalDriveValue(jibo.action.types.DriveName.SOCIAL);
                jibo.action.applyMotivationalEffect(jibo.action.types.DriveName.SOCIAL, -0.4);
                let socialDriveValueAfter = jibo.action.getMotivationalDriveValue(jibo.action.types.DriveName.SOCIAL);
                this.log.info(`Greetings applied motivational effect on SOCIAL: ${socialDriveValueBefore} -> ${socialDriveValueAfter}`);
            }
            else {
                this.log.warn(`conditions not met for applying motivational effect on SOCIAL`);
            }
            if (this.blackboard) {
                this.analyticsEvents(this.blackboard);
            }
            this.log.debug(`SM trace: ${this.sm.traceToString()}`);
            let logBlackboard = _.cloneDeep(this.blackboard);
            if (logBlackboard && logBlackboard.user && logBlackboard.user.spokenName) {
                logBlackboard.user.spokenName = '[REDACTED]';
            }
            if (logBlackboard && logBlackboard.lastMiMResults && logBlackboard.lastMiMResults.mimResult &&
                logBlackboard.lastMiMResults.mimResult.asrResults) {
                logBlackboard.lastMiMResults.mimResult.asrResults.text = '[REDACTED]';
            }
            this.log.debug('blackboard: ', logBlackboard);
        });
    }
    initializeBlackboard(options) {
        return __awaiter(this, void 0, void 0, function* () {
            let activeHolidays = yield be_framework_1.BeSkill.plugins.holiday.getActiveHolidaySet();
            if (!this.greetingsRoot.data.sleepEmpathy || !this.greetingsRoot.data.dayEmpathy) {
                yield this.initializeEmpathyFields();
            }
            let data = {
                intent: this.extractIntent(options),
                greeted: false,
                verbal: false,
                proactive: false,
                user: undefined,
                useName: true,
                PODclaim: undefined,
                holiday: undefined,
                holidayClaim: this.extractHolidayClaim(options),
                mimId: undefined,
                selfid: this.extractSelfID(options),
                isBday: false,
                lastMiMResults: undefined,
                userResponse: false,
                activeHolidays: activeHolidays,
                ORQuestion: false,
                kbRoot: this.greetingsRoot
            };
            let uuid = this.pollIdentityForUser(data);
            if (uuid) {
                let spoken = yield this.loopUtils.spokenNameFromUUID(uuid);
                if (spoken) {
                    data.user = { uuid: uuid, spokenName: spoken };
                }
            }
            return data;
        });
    }
    shouldUseName(data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!data.user) {
                return false;
            }
            let eventDesc = { personIDs: [data.user.uuid] };
            let res = yield jibo.im.getTimeSinceLast(eventDesc);
            return ((res === null) || (res > Utils_1.Utils.hoursToMs(96)) || (Math.random() > 0.5));
        });
    }
    extractIntent(options) {
        if (options && options.nlu) {
            if (options.nlu.intent === Types_1.Intents.proactiveGreetingCloud) {
                options.nlu.intent = Types_1.Intents.proactiveGreeting;
            }
            return options.nlu.intent;
        }
        this.log.warn(`No intent found. Doing a heyJibo.`);
        return Types_1.Intents.heyJibo;
    }
    extractSelfID(options) {
        if (options && options.nlu && options.nlu.entities.selfid) {
            return options.nlu.entities.selfid;
        }
    }
    extractHolidayClaim(options) {
        if (options && options.nlu && options.nlu.entities.holiday) {
            return options.nlu.entities.holiday;
        }
    }
    pollIdentityForUser(data) {
        if (data.intent !== Types_1.Intents.proactiveGreeting) {
            const person = jibo.lps.identity.getActiveSpeaker();
            if (person) {
                const speakerInfo = person.idInfo;
                if (speakerInfo) {
                    this.convTechLog.info(`Speaker ID: ${speakerInfo.id} | accepted: ${speakerInfo.accepted} | is high confidence: ${speakerInfo.highConfidence} | score: ${speakerInfo.score}`);
                    return speakerInfo.id;
                }
            }
        }
        else {
            const persons = jibo.lps.identity.getPresentPersons();
            const idPerson = persons.find(person => (person.id && person.id !== "UNKNOWN" && person.id !== "NOT_TRAINED"));
            if (idPerson) {
                this.log.info(`lps.identity.getPresentPersons found id: id: ${idPerson.id}, type: ${idPerson.type}, confidence: ${idPerson.confidence}`);
                return idPerson.id;
            }
        }
        return null;
    }
    initializeEmpathyFields() {
        return __awaiter(this, void 0, void 0, function* () {
            this.greetingsRoot.data.sleepEmpathy = {};
            this.greetingsRoot.data.dayEmpathy = {};
            this.greetingsRoot.save().catch((error) => this.log.error('Could not initialize kb.'));
        });
    }
    getPartOfDay() {
        return TimeUtils.getPartOfDay(this.dateProvider.getDate()).basic;
    }
    analyticsEvents(blackboard) {
        if (blackboard.greeted) {
            this.log.debug('analytic logging: Greeting Type', { proactive_greeting: blackboard.proactive });
            this.track('Greeting Type', { proactive_greeting: blackboard.proactive });
            if (blackboard.proactive) {
                this.log.debug('analytic logging: Proactive Greeting', {
                    verbal_proactive_greeting: blackboard.verbal,
                    loop_member_known: !!blackboard.user,
                    user_response: blackboard.userResponse
                });
                this.track('Proactive Greeting', {
                    verbal_proactive_greeting: blackboard.verbal,
                    loop_member_known: !!blackboard.user,
                    user_response: blackboard.userResponse
                });
            }
            else {
                this.log.debug('analytic logging: Reactive Greeting', {
                    verbal_reactive_greeting: blackboard.verbal,
                    loop_member_known: !!blackboard.user,
                    user_response: blackboard.userResponse
                });
                this.track('Reactive Greeting', {
                    verbal_reactive_greeting: blackboard.verbal,
                    loop_member_known: !!blackboard.user,
                    user_response: blackboard.userResponse
                });
            }
        }
        else {
            this.log.warn(`Greetings tried to log analytic events, but blackboard.greeted was false, which was unexpected.`);
        }
    }
    track(event, data) {
        if (jibo.runMode === jibo.RunMode.ON_ROBOT) {
            super.track(event, data);
        }
    }
}
exports.GreetingsSkill = GreetingsSkill;

},{"./GreetingsSM":1,"./Types":3,"./utils/LoopUtils":35,"./utils/Utils":36,"@be/be-framework":undefined,"jibo":undefined,"lodash/lodash.min":undefined}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Intents = {
    hello: 'hello',
    heyJibo: 'heyJibo',
    whatsUp: 'whatsUp',
    goodBye: 'goodBye',
    goodNight: 'goodNight',
    goodMorning: 'goodMorning',
    goodAfternoon: 'goodAfternoon',
    goodEvening: 'goodEvening',
    selfID: 'selfID',
    proactiveGreeting: 'proactiveGreeting',
    proactiveGreetingCloud: '',
    imHome: 'imHome',
    imBack: 'imBack',
    happyHoliday: 'happyHoliday'
};
var EmpathyResponse;
(function (EmpathyResponse) {
    EmpathyResponse.UNKNOWN = 'UNKNOWN';
    EmpathyResponse.GOOD = 'GOOD';
    EmpathyResponse.BAD = 'BAD';
})(EmpathyResponse = exports.EmpathyResponse || (exports.EmpathyResponse = {}));
class DateProvider {
    constructor(offset = 0) {
        this.offset = offset;
    }
    getDate() {
        const dateInOSLocal = new Date();
        var dateUTC = new Date(dateInOSLocal.getUTCFullYear(), dateInOSLocal.getUTCMonth(), dateInOSLocal.getUTCDate(), dateInOSLocal.getUTCHours(), dateInOSLocal.getUTCMinutes(), dateInOSLocal.getUTCSeconds());
        return new Date(dateUTC.getTime() + this.offset);
    }
}
exports.DateProvider = DateProvider;
var SpecialDayType;
(function (SpecialDayType) {
    SpecialDayType["HOLIDAY"] = "HOLIDAY";
    SpecialDayType["BIRTHDAY"] = "BIRTHDAY";
})(SpecialDayType = exports.SpecialDayType || (exports.SpecialDayType = {}));
var ProactiveGreetingType;
(function (ProactiveGreetingType) {
    ProactiveGreetingType["MORNING"] = "MORNING";
    ProactiveGreetingType["PLAYFUL"] = "PLAYFUL";
    ProactiveGreetingType["REGULAR"] = "REGULAR";
})(ProactiveGreetingType = exports.ProactiveGreetingType || (exports.ProactiveGreetingType = {}));
var SimpleResponseIntent;
(function (SimpleResponseIntent) {
    SimpleResponseIntent.yes = 'yes';
    SimpleResponseIntent.no = 'no';
    SimpleResponseIntent.noInput = 'noInput';
    SimpleResponseIntent.noMatch = 'noMatch';
})(SimpleResponseIntent = exports.SimpleResponseIntent || (exports.SimpleResponseIntent = {}));
var OptionalResponseIntent;
(function (OptionalResponseIntent) {
    OptionalResponseIntent.returned = 'returned';
    OptionalResponseIntent.wildcard = 'wildcard';
    OptionalResponseIntent.frustrated = 'frustrated';
    OptionalResponseIntent.noInput = SimpleResponseIntent.noInput;
    OptionalResponseIntent.noMatch = SimpleResponseIntent.noMatch;
    OptionalResponseIntent.playfulResponse = 'playfulResponse';
    OptionalResponseIntent.yes = SimpleResponseIntent.yes;
    OptionalResponseIntent.no = SimpleResponseIntent.no;
    OptionalResponseIntent.good = 'good';
    OptionalResponseIntent.bad = 'bad';
    OptionalResponseIntent.soSo = 'soSo';
    OptionalResponseIntent.counterQuestion = 'counterQuestion';
    OptionalResponseIntent.whatsUp = 'whatsUp';
})(OptionalResponseIntent = exports.OptionalResponseIntent || (exports.OptionalResponseIntent = {}));
var BedtimeReminderIntent;
(function (BedtimeReminderIntent) {
    BedtimeReminderIntent.iWill = 'iWill';
    BedtimeReminderIntent.reRemind = 'reRemind';
    BedtimeReminderIntent.thanks = 'thanks';
    BedtimeReminderIntent.wildcard = 'wildcard';
    BedtimeReminderIntent.frustrated = 'frustrated';
})(BedtimeReminderIntent = exports.BedtimeReminderIntent || (exports.BedtimeReminderIntent = {}));

},{}],4:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        'meta': {
            'version': 1,
            'name': 'Greeting',
            'uri': '/Users/jon/Workspace/jibo/buildsdk/skills/greetings/src/flows/Greeting.flow'
        },
        '4ad28cd0-9428-4047-b2a9-27288fe81da9': function () {
            return {
                'id': '4ad28cd0-9428-4047-b2a9-27288fe81da9',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '4ad28cd0-9428-4047-b2a9-27288fe81da9',
                        'to': '7c46fc22-9438-4e7c-9761-c09619af6187',
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
        '9dbd4f6e-1d67-4bfb-a251-a7f0317e40d1': function () {
            return {
                'id': '9dbd4f6e-1d67-4bfb-a251-a7f0317e40d1',
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
        '7c46fc22-9438-4e7c-9761-c09619af6187': function () {
            return {
                'id': '7c46fc22-9438-4e7c-9761-c09619af6187',
                'name': 'Greeting',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '7c46fc22-9438-4e7c-9761-c09619af6187',
                        'to': '9dbd4f6e-1d67-4bfb-a251-a7f0317e40d1',
                        'value': ''
                    }],
                'exceptions': [{
                        'frm': '7c46fc22-9438-4e7c-9761-c09619af6187',
                        'to': '9dbd4f6e-1d67-4bfb-a251-a7f0317e40d1',
                        'value': '~InteractionError'
                    }],
                'class': 'Mim',
                'options': {
                    'getMimPath': () => {
                        return blackboard.mimPath;
                    },
                    'getPromptData': () => {
                        return blackboard.promptData;
                    },
                    'onStatus': status => {
                        let mimState = status.state;
                        let asrResults = status.asrResults;
                    },
                    'onSuccess': _results => {
                        blackboard.result = _results;
                    },
                    'onFailure': _results => {
                        blackboard.result = _results;
                    }
                }
            };
        }
    };
};
},{}],5:[function(require,module,exports){
"use strict";
const GreetingsSkill_1 = require("./GreetingsSkill");
const Utils_1 = require("./utils/Utils");
module.exports = {
    Skill: GreetingsSkill_1.GreetingsSkill,
    Utils: Utils_1.Utils
};

},{"./GreetingsSkill":2,"./utils/Utils":36}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Types_1 = require("../Types");
const DoMiMState_1 = require("./primitives/DoMiMState");
const Utils_1 = require("../utils/Utils");
class BedtimeReminderResponseState extends DoMiMState_1.DoMIMState {
    constructor(statemachine, skill) {
        super(statemachine, skill, 'Bedtime Reminder Response', (sm, data) => {
            const intentString = Utils_1.Utils.extractIntentFromMIMResults(data.lastMiMResults);
            this.skill.log.info(`User responded to bedtime reminder with intent ${intentString}.`);
            const intent = Types_1.BedtimeReminderIntent[intentString] || Types_1.SimpleResponseIntent.noInput;
            data.intentResponse = intent;
            const user = data.user.uuid;
            const now_ms = skill.dateProvider.getDate().getTime();
            if (data.kbRoot.data.sleepEmpathy && data.kbRoot.data.sleepEmpathy[user]) {
                data.kbRoot.data.sleepEmpathy[user].reminderTimestamp = now_ms;
                data.kbRoot.save().catch(error => this.skill.log.error('Could not save bedtime reminder interaction in kb: ', error));
            }
            else {
                this.skill.log.error('Bedtime reminder offered without record of users sleep.');
            }
            const mim = (intent !== Types_1.SimpleResponseIntent.noInput) ? "BedtimeReminderResponse" : null;
            this.trackBedtimeReminderResponse(data);
            return mim;
        });
    }
    trackBedtimeReminderResponse(data) {
        const results = {
            person_in_loop: ((data.user && data.user.spokenName && data.useName) ? 'true' : 'false'),
            user_response: data.intentResponse
        };
        this.skill.track('Bedtime Reminder', results);
    }
    getMIMs() {
        return ["BedtimeReminder", "BedtimeReminderResponse"];
    }
}
exports.BedtimeReminderResponseState = BedtimeReminderResponseState;

},{"../Types":3,"../utils/Utils":36,"./primitives/DoMiMState":32}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DoMiMState_1 = require("./primitives/DoMiMState");
class BedtimeReminderState extends DoMiMState_1.DoMIMState {
    constructor(statemachine, skill) {
        super(statemachine, skill, 'Bedtime Reminder', (sm, data) => {
            const mim = 'BedtimeReminder';
            skill.log.info(`Offering bedtime reminder with mim: ${mim}`);
            return mim;
        });
    }
}
exports.BedtimeReminderState = BedtimeReminderState;

},{"./primitives/DoMiMState":32}],8:[function(require,module,exports){
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
const Types_1 = require("../Types");
var sm = be_framework_1.libraries.jibo_state_machine;
class ChooseMorningGreetingState extends sm.State {
    constructor(statemachine) {
        super(statemachine, `Choose Morning Greeting`);
        this.statemachine = statemachine;
        this.onEntry = this._onEntry.bind(this);
    }
    _onEntry(trans, data) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (data.intent) {
                case Types_1.Intents.proactiveGreeting:
                    data.mimId = 'GoodMorningProactive';
                    break;
                case Types_1.Intents.goodMorning:
                    data.mimId = 'GoodMorningEcho';
                    break;
                case Types_1.Intents.hello:
                case Types_1.Intents.whatsUp:
                default:
                    data.mimId = 'GoodMorningReactive';
            }
            data.greeted = true;
            data.verbal = true;
            data.proactiveGreetingType = Types_1.ProactiveGreetingType.MORNING;
            return data;
        });
    }
}
exports.ChooseMorningGreetingState = ChooseMorningGreetingState;

},{"../Types":3,"@be/be-framework":undefined}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Types_1 = require("../Types");
const DoMiMState_1 = require("./primitives/DoMiMState");
const DAY_QUALITY_GOOD = 'DayQualityGoodAgain';
const DAY_QUALITY_BAD = 'DayQualityBetter';
const DAY_QUALITY_UNKNOWN = 'DayQualityUnknown';
class DayEmpathyQuestionState extends DoMiMState_1.DoMIMState {
    constructor(statemachine) {
        super(statemachine, statemachine.skill, `Day Empathy Question`, (sm, data) => {
            const skill = statemachine.skill;
            let previousDayEmpathyResponse = Types_1.EmpathyResponse.UNKNOWN;
            try {
                previousDayEmpathyResponse = Types_1.EmpathyResponse[data.kbRoot.data.dayEmpathy[data.user.uuid].dayQuality];
            }
            catch (error) {
                skill.log.error('GreetingsRunVariable is incompatible with DayEmpathyQuestionState: ', error);
            }
            let mim = DAY_QUALITY_UNKNOWN;
            switch (previousDayEmpathyResponse) {
                case Types_1.EmpathyResponse.BAD:
                    mim = DAY_QUALITY_BAD;
                    break;
                case Types_1.EmpathyResponse.GOOD:
                    mim = DAY_QUALITY_GOOD;
                    break;
                case Types_1.EmpathyResponse.UNKNOWN:
                    mim = DAY_QUALITY_UNKNOWN;
                    break;
                default:
                    skill.log.error('Invalid day empathy response. Defaulting to UNKNOWN.');
                    break;
            }
            skill.log.info(`Inquiring about day quality with mim: ${mim}`);
            return mim;
        });
        this.statemachine = statemachine;
    }
    getMIMs() {
        return [DAY_QUALITY_BAD, DAY_QUALITY_GOOD, DAY_QUALITY_UNKNOWN];
    }
}
exports.DayEmpathyQuestionState = DayEmpathyQuestionState;

},{"../Types":3,"./primitives/DoMiMState":32}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Types_1 = require("../Types");
const DoMiMState_1 = require("./primitives/DoMiMState");
const Utils_1 = require("../utils/Utils");
const DQBadAgain = 'DQBadBad';
const DQBadNowGood = 'DQBadGood';
const DQGoodAgain = 'DQGoodGood';
const DQGoodNowBad = 'DQGoodBad';
const DQError = 'DQError';
const DQFirstGood = 'DQUnknownGood';
const DQFirstBad = 'DQUnknownBad';
const badDayIntentMap = new Map([
    [Types_1.SimpleResponseIntent.yes, DQBadNowGood],
    [Types_1.SimpleResponseIntent.no, DQBadAgain],
    [Types_1.SimpleResponseIntent.noInput, DQError],
    [Types_1.SimpleResponseIntent.noMatch, DQError]
]);
const goodDayIntentMap = new Map([
    [Types_1.SimpleResponseIntent.yes, DQGoodAgain],
    [Types_1.SimpleResponseIntent.no, DQGoodNowBad],
    [Types_1.SimpleResponseIntent.noInput, DQError],
    [Types_1.SimpleResponseIntent.noMatch, DQError]
]);
const unknownDayIntentMap = new Map([
    [Types_1.SimpleResponseIntent.yes, DQFirstGood],
    [Types_1.SimpleResponseIntent.no, DQFirstBad],
    [Types_1.SimpleResponseIntent.noInput, DQError],
    [Types_1.SimpleResponseIntent.noMatch, DQError]
]);
class DayEmpathyResponseState extends DoMiMState_1.DoMIMState {
    constructor(statemachine, skill) {
        super(statemachine, skill, 'Day Empathy Response', (sm, data) => {
            let intentString = Utils_1.Utils.extractIntentFromMIMResults(data.lastMiMResults);
            let intent = Types_1.SimpleResponseIntent[intentString];
            if (!intent) {
                skill.log.error(`Unexpected null intent string for day empathy response: ${intentString}. Replacing with noInput.`);
                intent = Types_1.SimpleResponseIntent.noInput;
            }
            else {
                skill.log.info(`User responded with intent: ${intent}.`);
            }
            let newEmpathyResponse;
            switch (intent) {
                case Types_1.SimpleResponseIntent.yes:
                    newEmpathyResponse = Types_1.EmpathyResponse.GOOD;
                    break;
                case Types_1.SimpleResponseIntent.no:
                    newEmpathyResponse = Types_1.EmpathyResponse.BAD;
                    break;
                default:
                    newEmpathyResponse = Types_1.EmpathyResponse.UNKNOWN;
                    break;
            }
            const uuid = data.user.uuid;
            const now = skill.dateProvider.getDate().getTime();
            const userDayEmpathy = data.kbRoot.data.dayEmpathy && data.kbRoot.data.dayEmpathy[uuid];
            let previousResponse = Types_1.EmpathyResponse.UNKNOWN;
            if (!userDayEmpathy) {
                this.skill.log.warn("Initiaizing knowledge base fields in DayEmpathyResponseState, this should've happened earlier");
            }
            else {
                previousResponse = userDayEmpathy.dayQuality;
            }
            let mimIdToUse = DQError;
            switch (previousResponse) {
                case Types_1.EmpathyResponse.BAD:
                    mimIdToUse = badDayIntentMap.get(intent);
                    break;
                case Types_1.EmpathyResponse.GOOD:
                    mimIdToUse = goodDayIntentMap.get(intent);
                    break;
                case Types_1.EmpathyResponse.UNKNOWN:
                    mimIdToUse = unknownDayIntentMap.get(intent);
                    break;
                default:
                    skill.log.error(`Unrecognized sleep empathy response greeting type ${previousResponse}`);
                    break;
            }
            if (data.kbRoot.data.dayEmpathy) {
                data.kbRoot.data.dayEmpathy[uuid] = {
                    dayQuality: newEmpathyResponse,
                    qualityTimestamp: now
                };
            }
            else {
                data.kbRoot.data.dayEmpathy = {
                    [uuid]: {
                        dayQuality: newEmpathyResponse,
                        qualityTimestamp: now
                    }
                };
            }
            data.kbRoot.save().catch(error => this.skill.log.error('Could not save day empathy interaction in kb: ', error));
            skill.log.info(`${mimIdToUse} chosen for intent:${intent} and day response:${previousResponse}.`);
            this.trackEmpathyResponseResult(data, previousResponse, intent);
            return mimIdToUse;
        });
    }
    trackEmpathyResponseResult(data, previousResponse, intent) {
        const results = {
            previous_day_state: previousResponse,
            person_in_loop: ((data.user && data.user.spokenName && data.useName) ? 'true' : 'false'),
            user_response: intent
        };
        if (previousResponse === Types_1.EmpathyResponse.UNKNOWN) {
            this.skill.track('Day Empathy Question', results);
        }
        else {
            this.skill.track('Day Empathy Follow-up', results);
        }
    }
    getMIMs() {
        return [DQBadAgain, DQBadNowGood, DQGoodAgain, DQGoodNowBad, DQError, DQFirstGood, DQFirstBad];
    }
}
exports.DayEmpathyResponseState = DayEmpathyResponseState;

},{"../Types":3,"../utils/Utils":36,"./primitives/DoMiMState":32}],11:[function(require,module,exports){
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
var sm = be_framework_1.libraries.jibo_state_machine;
const BRIEF_GREETING = 'BriefGreeting';
class HelloState extends sm.State {
    constructor(statemachine) {
        super(statemachine, `Hello`);
        this.statemachine = statemachine;
        this.onEntry = this._onEntry.bind(this);
    }
    _onEntry(trans, data) {
        return __awaiter(this, void 0, void 0, function* () {
            data.mimId = BRIEF_GREETING;
            data.greeted = true;
            data.verbal = true;
            return data;
        });
    }
}
exports.HelloState = HelloState;

},{"@be/be-framework":undefined}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const be_framework_1 = require("@be/be-framework");
var sm = be_framework_1.libraries.jibo_state_machine;
class HeyJiboIntentState extends sm.State {
    constructor(statemachine) {
        super(statemachine, `Hey Jibo Intent`);
        this.statemachine = statemachine;
        const skill = this.statemachine.skill;
        this.onEntry = (trans, data) => {
            data.greeted = true;
            data.verbal = false;
            data.mimId = 'FriendlyGesture';
            return data;
        };
    }
}
exports.HeyJiboIntentState = HeyJiboIntentState;

},{"@be/be-framework":undefined}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
const VerbalGreetedMiMState_1 = require("./VerbalGreetedMiMState");
class HolidayMIMState extends VerbalGreetedMiMState_1.VerbalGreetedMIMState {
    constructor(statemachine, skill, name, specialDayType, mimIdSelector) {
        super(statemachine, skill, name, mimIdSelector);
        const superOnEntry = this.onEntry.bind(this);
        this.onEntry = (trans, data) => {
            const skill = this.skill;
            let eventDesc = {
                skillName: skill.assetPack,
            };
            eventDesc[specialDayType] = true;
            if (data.user) {
                eventDesc.personIDs = [data.user.uuid];
            }
            if (data.holiday) {
                eventDesc.holiday = data.holiday;
            }
            jibo.im.noteEvent(eventDesc);
            return superOnEntry(trans, data);
        };
    }
}
exports.HolidayMIMState = HolidayMIMState;

},{"./VerbalGreetedMiMState":31,"jibo":undefined}],14:[function(require,module,exports){
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
const Types_1 = require("../Types");
var sm = be_framework_1.libraries.jibo_state_machine;
class IntentSplit extends sm.State {
    constructor(statemachine) {
        super(statemachine, 'Intent split');
        this.statemachine = statemachine;
        this.onEntry = (trans, options) => __awaiter(this, void 0, void 0, function* () {
            const skill = this.statemachine.skill;
            const log = skill.log;
            const data = yield skill.initializeBlackboard(options);
            skill.blackboard = data;
            log.info(`choosing response based on intent ${data.intent}`);
            let nextState;
            switch (data.intent) {
                case Types_1.Intents.heyJibo:
                    nextState = this.statemachine.heyJiboState;
                    break;
                case Types_1.Intents.hello:
                    nextState = this.statemachine.helloState;
                    break;
                case Types_1.Intents.whatsUp:
                    nextState = this.statemachine.whatsUpState;
                    break;
                case Types_1.Intents.goodBye:
                    nextState = this.statemachine.goodbyeState;
                    break;
                case Types_1.Intents.goodNight:
                    nextState = this.statemachine.goodnightState;
                    break;
                case Types_1.Intents.goodMorning:
                case Types_1.Intents.goodAfternoon:
                case Types_1.Intents.goodEvening:
                    nextState = this.statemachine.partOfDayState;
                    break;
                case Types_1.Intents.selfID:
                    nextState = this.statemachine.selfIDState;
                    break;
                case Types_1.Intents.proactiveGreeting:
                    nextState = this.statemachine.proactiveGreetingState;
                    break;
                case Types_1.Intents.imHome:
                    nextState = this.statemachine.imHomeState;
                    break;
                case Types_1.Intents.imBack:
                    nextState = this.statemachine.imBackState;
                    break;
                case Types_1.Intents.happyHoliday:
                    nextState = this.statemachine.reactiveHolidayState;
                    break;
                default:
                    throw new Error(`No match for '${data.intent}'`);
            }
            if (this.isCurrent()) {
                return this.transitionTo(nextState, data);
            }
        });
    }
    init() {
        this.addInternalTransition('', this.statemachine.heyJiboState);
        this.addInternalTransition('', this.statemachine.helloState);
        this.addInternalTransition('', this.statemachine.whatsUpState);
        this.addInternalTransition('', this.statemachine.goodbyeState);
        this.addInternalTransition('', this.statemachine.goodnightState);
        this.addInternalTransition('', this.statemachine.partOfDayState);
        this.addInternalTransition('', this.statemachine.selfIDState);
        this.addInternalTransition('', this.statemachine.proactiveGreetingState);
        this.addInternalTransition('', this.statemachine.imHomeState);
        this.addInternalTransition('', this.statemachine.imBackState);
        this.addInternalTransition('', this.statemachine.reactiveHolidayState);
    }
}
exports.IntentSplit = IntentSplit;

},{"../Types":3,"@be/be-framework":undefined}],15:[function(require,module,exports){
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
const YesNoState_1 = require("./primitives/YesNoState");
class IsProactiveState extends YesNoState_1.YesNoState {
    constructor(statemachine) {
        super(statemachine, 'Is Proactive?');
        this.onEntry = (trans, data) => {
            this._onEntry(trans, data);
        };
    }
    _onEntry(trans, data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (data.proactive) {
                this.transitionToYesState(data);
            }
            else {
                this.transitionToNoState(data);
            }
        });
    }
}
exports.IsProactiveState = IsProactiveState;

},{"./primitives/YesNoState":34}],16:[function(require,module,exports){
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
const YesNoState_1 = require("./primitives/YesNoState");
const BRIEF_GREETING = 'BriefGreeting';
class PartOfDayState extends YesNoState_1.YesNoState {
    constructor(statemachine) {
        super(statemachine, `Part of day Intent`);
        this.statemachine = statemachine;
        this.onEntry = this._onEntry.bind(this);
    }
    _onEntry(trans, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const skill = this.statemachine.skill;
            skill.log.debug(`partOfDay`);
            let podClaim = data.intent.substr(4).toUpperCase();
            data.greeted = true;
            data.verbal = true;
            if (skill.getPartOfDay() === podClaim) {
                data.mimId = BRIEF_GREETING;
                return this.transitionToYesState(data);
            }
            else {
                data.PODclaim = podClaim.toLowerCase();
                data.mimId = 'PartOfDayCorrection';
                return this.transitionToNoState(data);
            }
        });
    }
}
exports.PartOfDayState = PartOfDayState;

},{"./primitives/YesNoState":34}],17:[function(require,module,exports){
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
const Types_1 = require("../Types");
const be_framework_1 = require("@be/be-framework");
const YesNoState_1 = require("./primitives/YesNoState");
var cu = be_framework_1.libraries.jibo_cai_utils;
var DriveName = jibo.action.types.DriveName;
class ProactiveGreetingState extends YesNoState_1.YesNoState {
    constructor(statemachine) {
        super(statemachine, `Proactive Greeting`);
        this.statemachine = statemachine;
        this.onEntry = this._onEntry.bind(this);
    }
    _onEntry(trans, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const skill = this.statemachine.skill;
            data.proactive = true;
            let eventDesc = {
                skillName: skill.assetPack,
                verbal: true
            };
            if (data.user) {
                skill.log.info(`proactiveGreeting with an identity!: ${data.user.uuid}`);
                data.useName = true;
                eventDesc.personIDs = [data.user.uuid];
            }
            else {
                skill.log.info(`proactiveGreeting without an identity.`);
                data.useName = false;
            }
            const drives = [DriveName.PLAYFUL];
            let weighted = drives.map(d => {
                return { data: d, weight: jibo.action.getMotivationalDriveValue(d) };
            });
            weighted.push({ data: null, weight: 0.5 });
            skill.log.debug(`doing weighted sample from: `, weighted);
            let driveChoice = cu.RandomUtils.weightedRandomSample(weighted);
            if (driveChoice) {
                let motivationalFlavor = driveChoice;
                let flavorDriveValueBefore = jibo.action.getMotivationalDriveValue(motivationalFlavor);
                jibo.action.applyMotivationalEffect(motivationalFlavor, -1.0);
                let flavorDriveValueAfter = jibo.action.getMotivationalDriveValue(motivationalFlavor);
                skill.log.info(`Greetings applied motivational effect on ${motivationalFlavor}: ${flavorDriveValueBefore} -> ${flavorDriveValueAfter}`);
            }
            if (this.isPlayful(driveChoice)) {
                data.mimId = 'ProactiveVerbalGreetingPlayful';
                data.proactiveGreetingType = Types_1.ProactiveGreetingType.PLAYFUL;
            }
            else {
                data.mimId = 'ProactiveVerbalGreetingDefault';
                data.proactiveGreetingType = Types_1.ProactiveGreetingType.REGULAR;
            }
            data.greeted = true;
            data.verbal = true;
            return this.transitionToYesState(data);
        });
    }
    isPlayful(driveChoice) {
        return (driveChoice && driveChoice === jibo.action.types.DriveName.PLAYFUL);
    }
    randomUseName() {
        return Math.random();
    }
    randomFriendlyGesture() {
        return Math.random();
    }
}
exports.ProactiveGreetingState = ProactiveGreetingState;

},{"../Types":3,"./primitives/YesNoState":34,"@be/be-framework":undefined,"jibo":undefined}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Types_1 = require("../Types");
const DoMiMState_1 = require("./primitives/DoMiMState");
const Utils_1 = require("../utils/Utils");
const PUZZLED = 'PuzzledGesture';
const FRUSTRATED_RESPONSE = 'FrustratedResponse';
const HAPPY_GESTURE = 'HappyGesture';
const FRIENDLY_RESPONSE_PLAYFUL = 'FriendlyResponsePlayful';
const FRIENDLY_RESPONSE_MORNING = 'FriendlyResponseMorning';
const FRIENDLY_RESPONSE_GENERAL = 'FriendlyResponseGeneral';
const GENERAL_COUNTER_QUESTION = 'ProactiveGeneralCounter';
const PLAYFUL_COUNTER_QUESTION = 'ProactivePlayfulCounter';
const WHATS_UP_RESPONSE = 'WhatsUpResp';
const morningStatementIntentMap = new Map([
    [Types_1.OptionalResponseIntent.returned, FRIENDLY_RESPONSE_MORNING],
    [Types_1.OptionalResponseIntent.wildcard, PUZZLED],
    [Types_1.OptionalResponseIntent.frustrated, FRUSTRATED_RESPONSE],
    [Types_1.OptionalResponseIntent.playfulResponse, HAPPY_GESTURE],
    [Types_1.OptionalResponseIntent.counterQuestion, GENERAL_COUNTER_QUESTION],
    [Types_1.OptionalResponseIntent.whatsUp, WHATS_UP_RESPONSE],
]);
const playfulStatementIntentMap = new Map([
    [Types_1.OptionalResponseIntent.returned, FRIENDLY_RESPONSE_PLAYFUL],
    [Types_1.OptionalResponseIntent.wildcard, PUZZLED],
    [Types_1.OptionalResponseIntent.frustrated, FRUSTRATED_RESPONSE],
    [Types_1.OptionalResponseIntent.playfulResponse, HAPPY_GESTURE],
    [Types_1.OptionalResponseIntent.counterQuestion, PLAYFUL_COUNTER_QUESTION],
    [Types_1.OptionalResponseIntent.whatsUp, WHATS_UP_RESPONSE],
]);
const generalStatementIntentMap = new Map([
    [Types_1.OptionalResponseIntent.returned, FRIENDLY_RESPONSE_GENERAL],
    [Types_1.OptionalResponseIntent.wildcard, PUZZLED],
    [Types_1.OptionalResponseIntent.frustrated, FRUSTRATED_RESPONSE],
    [Types_1.OptionalResponseIntent.counterQuestion, GENERAL_COUNTER_QUESTION],
    [Types_1.OptionalResponseIntent.whatsUp, WHATS_UP_RESPONSE],
]);
const morningQuestionIntentMap = new Map([
    [Types_1.OptionalResponseIntent.yes, 'ProactiveMorningYes'],
    [Types_1.OptionalResponseIntent.no, 'ProactiveMorningNo'],
    [Types_1.OptionalResponseIntent.counterQuestion, 'ProactiveMorningCounter'],
    [Types_1.OptionalResponseIntent.noMatch, PUZZLED],
    [Types_1.OptionalResponseIntent.frustrated, FRUSTRATED_RESPONSE],
    [Types_1.OptionalResponseIntent.returned, FRIENDLY_RESPONSE_MORNING],
    [Types_1.OptionalResponseIntent.whatsUp, WHATS_UP_RESPONSE],
]);
const playfulQuestionIntentMap = new Map([
    [Types_1.OptionalResponseIntent.good, 'ProactivePlayfulGood'],
    [Types_1.OptionalResponseIntent.bad, 'ProactivePlayfulBad'],
    [Types_1.OptionalResponseIntent.counterQuestion, PLAYFUL_COUNTER_QUESTION],
    [Types_1.OptionalResponseIntent.noMatch, PUZZLED],
    [Types_1.OptionalResponseIntent.frustrated, FRUSTRATED_RESPONSE],
    [Types_1.OptionalResponseIntent.soSo, 'ProactivePlayfulSoSo'],
    [Types_1.OptionalResponseIntent.returned, FRIENDLY_RESPONSE_PLAYFUL],
    [Types_1.OptionalResponseIntent.whatsUp, WHATS_UP_RESPONSE],
]);
const generalQuestionIntentMap = new Map([
    [Types_1.OptionalResponseIntent.good, 'ProactiveGeneralGood'],
    [Types_1.OptionalResponseIntent.bad, 'ProactiveGeneralBad'],
    [Types_1.OptionalResponseIntent.counterQuestion, GENERAL_COUNTER_QUESTION],
    [Types_1.OptionalResponseIntent.noMatch, PUZZLED],
    [Types_1.OptionalResponseIntent.frustrated, FRUSTRATED_RESPONSE],
    [Types_1.OptionalResponseIntent.soSo, 'ProactiveGeneralSoSo'],
    [Types_1.OptionalResponseIntent.returned, FRIENDLY_RESPONSE_GENERAL],
    [Types_1.OptionalResponseIntent.whatsUp, WHATS_UP_RESPONSE],
]);
class ProactiveOptionalResponseState extends DoMiMState_1.DoMIMState {
    constructor(statemachine, skill, name) {
        super(statemachine, skill, name, (sm, data) => {
            let intentString = Utils_1.Utils.extractIntentFromMIMResults(data.lastMiMResults);
            let intent = Types_1.OptionalResponseIntent[intentString];
            if (!intent) {
                skill.log.error(`Unexpected null intent string for optional response: ${intentString}. Replacing with noInput.`);
                intent = Types_1.OptionalResponseIntent.noInput;
            }
            else {
                skill.log.info(`User responded with intent: ${intent}.`);
            }
            const question = data.ORQuestion;
            const proactiveType = data.proactiveGreetingType;
            let mimIdToUse = null;
            switch (proactiveType) {
                case Types_1.ProactiveGreetingType.MORNING:
                    mimIdToUse = (question) ? morningQuestionIntentMap.get(intent) : morningStatementIntentMap.get(intent);
                    break;
                case Types_1.ProactiveGreetingType.PLAYFUL:
                    mimIdToUse = (question) ? playfulQuestionIntentMap.get(intent) : playfulStatementIntentMap.get(intent);
                    break;
                case Types_1.ProactiveGreetingType.REGULAR:
                    mimIdToUse = (question) ? generalQuestionIntentMap.get(intent) : generalStatementIntentMap.get(intent);
                    break;
                default:
                    skill.log.error(`Unrecognized proactive greeting type ${proactiveType}`);
                    break;
            }
            skill.log.info(`${(mimIdToUse) ? mimIdToUse : 'No MiM'} chosen for ${(question) ? 'question' : 'statement'} with intent:${intent} and proactiveType:${proactiveType}.`);
            data.userResponse = !!mimIdToUse;
            this.trackProactiveOptionalResponseResult(data, intent);
            return mimIdToUse;
        });
    }
    trackProactiveOptionalResponseResult(data, intent) {
        const results = {
            proactive_sentence_type: (data.ORQuestion ? 'QUESTION' : 'STATEMENT'),
            proactive_greeting_type: data.proactiveGreetingType,
            person_in_loop: ((data.user && data.user.spokenName && data.useName) ? 'true' : 'false'),
            user_response: intent
        };
        this.skill.track('Proactive Results', results);
    }
    getMIMs() {
        return [PUZZLED, FRUSTRATED_RESPONSE, HAPPY_GESTURE, FRIENDLY_RESPONSE_PLAYFUL, FRIENDLY_RESPONSE_MORNING, FRIENDLY_RESPONSE_GENERAL, GENERAL_COUNTER_QUESTION, PLAYFUL_COUNTER_QUESTION];
    }
}
exports.ProactiveOptionalResponseState = ProactiveOptionalResponseState;

},{"../Types":3,"../utils/Utils":36,"./primitives/DoMiMState":32}],19:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DoMiMState_1 = require("./primitives/DoMiMState");
const Types_1 = require("../Types");
const MORNING_QUESTION = 'ProactiveMorningQuestion';
const MORNING_STATEMENT = 'ProactiveMorningStatement';
const PLAYFUL_QUESTION = 'ProactivePlayfulQuestion';
const PLAYFUL_STATEMENT = 'ProactivePlayfulStatement';
const REGULAR_QUESTION = 'ProactiveGeneralQuestion';
const REGULAR_STATEMENT = 'ProactiveGeneralStatement';
class ProactiveProbabilityState extends DoMiMState_1.DoMIMState {
    constructor(statemachine, skill, name) {
        super(statemachine, skill, name, (sm, data) => {
            const userKnown = (data.user && data.user.uuid);
            const question = (userKnown) ? true : false;
            if (!data.proactiveGreetingType) {
                skill.log.error('Proactive greeting type is not set in proactive greeting type state.');
                data.proactiveGreetingType = Types_1.ProactiveGreetingType.REGULAR;
            }
            let greetingsType = data.proactiveGreetingType;
            let mim = REGULAR_STATEMENT;
            switch (greetingsType) {
                case Types_1.ProactiveGreetingType.MORNING:
                    mim = (question) ? MORNING_QUESTION : MORNING_STATEMENT;
                    break;
                case Types_1.ProactiveGreetingType.PLAYFUL:
                    mim = (question) ? PLAYFUL_QUESTION : PLAYFUL_STATEMENT;
                    break;
                case Types_1.ProactiveGreetingType.REGULAR:
                    mim = (question) ? REGULAR_QUESTION : REGULAR_STATEMENT;
                    break;
                default:
                    skill.log.error(`Unrecognized proactive greetings type ${greetingsType}.`);
                    break;
            }
            data.ORQuestion = question;
            if (!mim) {
                skill.log.error('No MiM chosen for proactive greetings.');
            }
            return mim;
        });
        this.PROBABILITY_OF_STATEMENT = 0.69;
    }
    getMIMs() {
        return [MORNING_QUESTION, MORNING_STATEMENT, PLAYFUL_QUESTION, PLAYFUL_STATEMENT, REGULAR_QUESTION, REGULAR_STATEMENT];
    }
}
exports.ProactiveProbabilityState = ProactiveProbabilityState;

},{"../Types":3,"./primitives/DoMiMState":32}],20:[function(require,module,exports){
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
var sm = be_framework_1.libraries.jibo_state_machine;
class ReactiveHolidayState extends sm.State {
    constructor(statemachine) {
        super(statemachine, 'Reactive Holiday');
        this.statemachine = statemachine;
        this.onEntry = this._onEntry.bind(this);
    }
    _onEntry(trans, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const skill = this.statemachine.skill;
            const holiday = be_framework_1.BeSkill.plugins.holiday;
            const todaysHolidays = yield holiday.filterHolidayNamesByDate(this.statemachine.skill.dateProvider.getDate(), false);
            if (!todaysHolidays || todaysHolidays.length === 0 || todaysHolidays.indexOf(data.holidayClaim) === -1) {
                data.mimId = 'NotHoliday';
            }
            else {
                data.mimId = 'HolidayResponse';
                data.holiday = data.holidayClaim;
            }
            return data;
        });
    }
}
exports.ReactiveHolidayState = ReactiveHolidayState;

},{"@be/be-framework":undefined}],21:[function(require,module,exports){
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
const Utils_1 = require("../utils/Utils");
const be_framework_1 = require("@be/be-framework");
var sm = be_framework_1.libraries.jibo_state_machine;
class SelectWhatsUpState extends sm.State {
    constructor(statemachine) {
        super(statemachine, `What's Up`);
        this.statemachine = statemachine;
        this.onEntry = this._onEntry.bind(this);
    }
    _onEntry(trans, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const skill = this.statemachine.skill;
            let timeSinceLastSeen = 0;
            if (data.user) {
                const eventDesc = { personIDs: [data.user.uuid] };
                try {
                    timeSinceLastSeen = yield jibo.im.getTimeSinceLast(eventDesc);
                }
                catch (error) {
                    skill.log.warn("Couldn't get time since last: ", error);
                }
            }
            if (timeSinceLastSeen > Utils_1.Utils.hoursToMs(96)) {
                data.mimId = 'LongTimeWhatsUpResp';
            }
            else {
                data.mimId = 'WhatsUpResp';
            }
            data.greeted = true;
            data.verbal = true;
            return data;
        });
    }
}
exports.SelectWhatsUpState = SelectWhatsUpState;

},{"../utils/Utils":36,"@be/be-framework":undefined,"jibo":undefined}],22:[function(require,module,exports){
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
var sm = be_framework_1.libraries.jibo_state_machine;
class SelfIdState extends sm.State {
    constructor(statemachine) {
        super(statemachine, `Self ID`);
        this.statemachine = statemachine;
        this.onEntry = this._onEntry.bind(this);
    }
    _onEntry(trans, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const skill = this.statemachine.skill;
            data.greeted = true;
            data.verbal = true;
            skill.log.debug(`selfID`);
            if (data.user) {
                data.useName = true;
                if (data.selfid !== data.user.uuid) {
                    data.mimId = 'NameIDConflict';
                }
                else {
                    data.mimId = 'BriefGreeting';
                }
            }
            else {
                skill.log.info('selfID with no robot ID');
                data.mimId = 'BriefGreeting';
            }
            return data;
        });
    }
}
exports.SelfIdState = SelfIdState;

},{"@be/be-framework":undefined}],23:[function(require,module,exports){
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
const Types_1 = require("../Types");
const YesNoState_1 = require("./primitives/YesNoState");
const be_framework_1 = require("@be/be-framework");
var cu = be_framework_1.libraries.jibo_cai_utils;
class ShouldDoBedtimeReminderState extends YesNoState_1.YesNoState {
    constructor(statemachine) {
        super(statemachine, `Should Do Bedtime Reminder?`);
        this.statemachine = statemachine;
        this.onEntry = this._onEntry.bind(this);
    }
    _onEntry(trans, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const skill = this.statemachine.skill;
            if (data.intent === Types_1.Intents.whatsUp) {
                return this.transitionToNoState(data);
            }
            let uuid;
            if (data.user) {
                uuid = data.user.uuid;
            }
            else {
                return this.transitionToNoState(data);
            }
            const today = skill.dateProvider.getDate();
            const hours = today.getHours();
            if (hours < 20 || 21 < hours) {
                return this.transitionToNoState(data);
            }
            const sleepEmpathy = this.extractSleepEmpathyForUser(data.kbRoot, uuid);
            const now = today.getTime();
            if (sleepEmpathy.sleepQuality !== Types_1.EmpathyResponse.BAD ||
                ((now - sleepEmpathy.qualityTimestamp > ShouldDoBedtimeReminderState.REMINDER_WINDOW_MS))) {
                return this.transitionToNoState(data);
            }
            if (cu.TimeUtils.sameDay(sleepEmpathy.reminderTimestamp, now)) {
                return this.transitionToNoState(data);
            }
            return this.transitionToYesState(data);
        });
    }
    extractSleepEmpathyForUser(kbRoot, uuid) {
        const sleepEmpathy = {
            sleepQuality: Types_1.EmpathyResponse.UNKNOWN,
            qualityTimestamp: 0,
            reminderTimestamp: 0
        };
        const kbData = kbRoot.data;
        try {
            sleepEmpathy.reminderTimestamp = kbData.sleepEmpathy[uuid].reminderTimestamp;
            sleepEmpathy.qualityTimestamp = kbData.sleepEmpathy[uuid].qualityTimestamp;
            sleepEmpathy.sleepQuality = kbData.sleepEmpathy[uuid].sleepQuality;
        }
        catch (_a) {
            sleepEmpathy.reminderTimestamp = 0;
            sleepEmpathy.qualityTimestamp = 0;
            sleepEmpathy.sleepQuality = Types_1.EmpathyResponse.UNKNOWN;
        }
        return sleepEmpathy;
    }
}
ShouldDoBedtimeReminderState.REMINDER_WINDOW_MS = cu.TimeUtils.hoursToMs(64);
exports.ShouldDoBedtimeReminderState = ShouldDoBedtimeReminderState;

},{"../Types":3,"./primitives/YesNoState":34,"@be/be-framework":undefined}],24:[function(require,module,exports){
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
const Utils_1 = require("../utils/Utils");
const Types_1 = require("../Types");
const YesNoState_1 = require("./primitives/YesNoState");
class ShouldDoBirthdayState extends YesNoState_1.YesNoState {
    constructor(statemachine, skill, name) {
        super(statemachine, name);
        this.skill = skill;
        this.onEntry = (trans, data) => {
            this._onEntry(trans, data);
        };
    }
    _onEntry(trans, data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (data.user) {
                let eventQuery = {
                    skillName: this.skill.assetPack,
                    personIDs: [data.user.uuid]
                };
                eventQuery[Types_1.SpecialDayType.BIRTHDAY] = true;
                const dpDate = this.skill.dateProvider.getDate();
                const startDate = new Date(dpDate.getFullYear(), dpDate.getMonth(), dpDate.getDate());
                let timeSince = 0;
                try {
                    timeSince = yield jibo.im.getTimeSinceLast(eventQuery, jibo.im.compareQueryFields, startDate);
                }
                catch (error) {
                    this.skill.log.warn("Couldn't get time since last: ", error);
                }
                if (timeSince < Utils_1.Utils.hoursToMs(24)) {
                    return this.transitionToNoState(data);
                }
                data.isBday = yield this.skill.loopUtils.isLoopMemberBday(data.user.uuid);
                if (data.isBday) {
                    return this.transitionToYesState(data);
                }
                else {
                    return this.transitionToNoState(data);
                }
            }
            else {
                return this.transitionToNoState(data);
            }
        });
    }
}
exports.ShouldDoBirthdayState = ShouldDoBirthdayState;

},{"../Types":3,"../utils/Utils":36,"./primitives/YesNoState":34,"jibo":undefined}],25:[function(require,module,exports){
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
const Types_1 = require("../Types");
const YesNoState_1 = require("./primitives/YesNoState");
const be_framework_1 = require("@be/be-framework");
var cu = be_framework_1.libraries.jibo_cai_utils;
class ShouldDoDayEmpathyState extends YesNoState_1.YesNoState {
    constructor(statemachine) {
        super(statemachine, `Should Do Day Empathy?`);
        this.statemachine = statemachine;
        this.PROBABILITY_OF_UNKNOWN_DAY_EMPATHY = 0.80;
        this.onEntry = this._onEntry.bind(this);
    }
    _onEntry(trans, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const skill = this.statemachine.skill;
            if (data.intent === Types_1.Intents.whatsUp) {
                return this.transitionToNoState(data);
            }
            const today = skill.dateProvider.getDate();
            const hours = today.getHours();
            if (hours < 16) {
                return this.transitionToNoState(data);
            }
            let uuid;
            if (data.user) {
                uuid = data.user.uuid;
            }
            else {
                return this.transitionToNoState(data);
            }
            let userDayEmpathy = data.kbRoot.data.dayEmpathy && data.kbRoot.data.dayEmpathy[uuid];
            let previousResponse = Types_1.EmpathyResponse.UNKNOWN;
            if (userDayEmpathy && userDayEmpathy.dayQuality && userDayEmpathy.qualityTimestamp) {
                const dayQuality = userDayEmpathy.dayQuality;
                let qualityTimestamp = userDayEmpathy.qualityTimestamp;
                const now = skill.dateProvider.getDate().getTime();
                if (cu.TimeUtils.sameDay(now, qualityTimestamp)) {
                    return this.transitionToNoState(data);
                }
                if ((now - qualityTimestamp) < cu.TimeUtils.hoursToMs(skill.EMPATHY_RESET_HOURS)) {
                    const response = Types_1.EmpathyResponse[dayQuality];
                    if (response) {
                        previousResponse = response;
                    }
                    else {
                        skill.log.error(`Invalid day response in kb ${dayQuality}. Defaulting to ${previousResponse}.`);
                    }
                }
                else {
                    data.kbRoot.data.dayEmpathy[uuid].dayQuality = Types_1.EmpathyResponse.UNKNOWN;
                    try {
                        yield data.kbRoot.save();
                    }
                    catch (error) {
                        skill.log.error("Couldn't invalidate day quality: ", error);
                    }
                }
            }
            else {
                try {
                    yield this.initializeAndSaveDayEmpathy(data, uuid);
                }
                catch (error) {
                    skill.log.error("Couldn't initialize kbroot fields: ", error);
                }
            }
            if ((previousResponse === Types_1.EmpathyResponse.UNKNOWN) && (Math.random() > this.PROBABILITY_OF_UNKNOWN_DAY_EMPATHY)) {
                this.transitionToNoState(data);
            }
            return this.transitionToYesState(data);
        });
    }
    initializeAndSaveDayEmpathy(data, uuid) {
        if (data.kbRoot.data.dayEmpathy) {
            data.kbRoot.data.dayEmpathy[uuid] = {
                dayQuality: Types_1.EmpathyResponse.UNKNOWN,
                qualityTimestamp: this.statemachine.skill.dateProvider.getDate().getTime()
            };
        }
        else {
            data.kbRoot.data.dayEmpathy = {
                [uuid]: {
                    dayQuality: Types_1.EmpathyResponse.UNKNOWN,
                    qualityTimestamp: this.statemachine.skill.dateProvider.getDate().getTime()
                }
            };
        }
        return data.kbRoot.save().catch((error) => this.statemachine.skill.log.error("Could not initialize and save day empathy."));
    }
}
exports.ShouldDoDayEmpathyState = ShouldDoDayEmpathyState;
;

},{"../Types":3,"./primitives/YesNoState":34,"@be/be-framework":undefined}],26:[function(require,module,exports){
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
const Types_1 = require("../Types");
const be_framework_1 = require("@be/be-framework");
const YesNoState_1 = require("./primitives/YesNoState");
const _ = require("lodash/lodash.min");
var cu = be_framework_1.libraries.jibo_cai_utils;
class ShouldDoHolidayState extends YesNoState_1.YesNoState {
    constructor(statemachine, skill, name) {
        super(statemachine, name);
        this.skill = skill;
        this.onEntry = (trans, data) => {
            this._onEntry(trans, data);
        };
    }
    _onEntry(trans, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const todaysHolidays = yield be_framework_1.BeSkill.plugins.holiday.filterHolidayNamesByDate(this.skill.dateProvider.getDate(), true);
            if (todaysHolidays.length > 0) {
                data.holiday = _.sample(todaysHolidays);
            }
            else {
                return this.transitionToNoState(data);
            }
            const eventQuery = {
                skillName: this.skill.assetPack
            };
            eventQuery[Types_1.SpecialDayType.HOLIDAY] = true;
            if (data.user) {
                eventQuery['personIDs'] = [data.user.uuid];
            }
            const dpDate = this.skill.dateProvider.getDate();
            const startDate = new Date(dpDate.getFullYear(), dpDate.getMonth(), dpDate.getDate());
            const holidayEventQuery = _.cloneDeep(eventQuery);
            holidayEventQuery['holiday'] = data.holiday;
            const msBetweenSpecificHoliday = cu.TimeUtils.hoursToMs(24 * ShouldDoHolidayState.MINIMUM_DAYS_BETWEEN_SPECIFIC_HOLIDAY_GREETING);
            const startDateSpecificHoliday = new Date(dpDate.getTime() - msBetweenSpecificHoliday);
            let timeSinceMs = 0;
            let timeSinceSpecificHolidayMs = 0;
            try {
                timeSinceMs = yield jibo.im.getTimeSinceLast(eventQuery, jibo.im.compareQueryFields, startDate);
                timeSinceSpecificHolidayMs = yield jibo.im.getTimeSinceLast(holidayEventQuery, jibo.im.compareQueryFields, startDateSpecificHoliday);
                this.skill.log.info(`holiday: ${data.holiday} timeSince: ${cu.TimeUtils.msToHours(timeSinceMs)} timeSinceHoliday: ${cu.TimeUtils.msToHours(timeSinceSpecificHolidayMs)}`);
            }
            catch (error) {
                this.skill.log.warn("Couldn't get time since last: ", error);
            }
            if (timeSinceMs < cu.TimeUtils.hoursToMs(24)) {
                this.skill.log.debug(`Already did special day greeting for this user in the last 24 hours.`);
                return this.transitionToNoState(data);
            }
            else if (timeSinceSpecificHolidayMs < msBetweenSpecificHoliday) {
                this.skill.log.debug(`Already did special day greeting for this user for this multi-day holiday in the last ${ShouldDoHolidayState.MINIMUM_DAYS_BETWEEN_SPECIFIC_HOLIDAY_GREETING} days.`);
                return this.transitionToNoState(data);
            }
            if (data.holiday) {
                return this.transitionToYesState(data);
            }
            else {
                return this.transitionToNoState(data);
            }
        });
    }
}
ShouldDoHolidayState.MINIMUM_DAYS_BETWEEN_SPECIFIC_HOLIDAY_GREETING = 6;
exports.ShouldDoHolidayState = ShouldDoHolidayState;

},{"../Types":3,"./primitives/YesNoState":34,"@be/be-framework":undefined,"jibo":undefined,"lodash/lodash.min":undefined}],27:[function(require,module,exports){
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
const Types_1 = require("../Types");
const YesNoState_1 = require("./primitives/YesNoState");
class ShouldDoMorningGreetingState extends YesNoState_1.YesNoState {
    constructor(statemachine) {
        super(statemachine, `Should Do Morning Greeting?`);
        this.statemachine = statemachine;
        this.onEntry = this._onEntry.bind(this);
    }
    _onEntry(trans, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const skill = this.statemachine.skill;
            let pod = skill.getPartOfDay();
            if (pod !== 'MORNING') {
                return this.transitionToNoState(data);
            }
            if (data.intent === Types_1.Intents.goodMorning) {
                return this.transitionToYesState(data);
            }
            let evtDesc;
            if (data.user) {
                evtDesc = {
                    personIDs: [data.user.uuid],
                };
            }
            else {
                evtDesc = {
                    skillName: skill.assetPack,
                    verbal: true
                };
            }
            const today = skill.dateProvider.getDate();
            const morningStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 5);
            let timeSince = 0;
            try {
                timeSince = yield jibo.im.getTimeSinceLast(evtDesc, jibo.im.compareQueryFields, morningStart);
            }
            catch (error) {
                this.statemachine.skill.log.warn("Couldn't get time since last: ", error);
            }
            if (timeSince < Number.POSITIVE_INFINITY) {
                return this.transitionToNoState(data);
            }
            else {
                return this.transitionToYesState(data);
            }
        });
    }
}
exports.ShouldDoMorningGreetingState = ShouldDoMorningGreetingState;

},{"../Types":3,"./primitives/YesNoState":34,"jibo":undefined}],28:[function(require,module,exports){
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
const Types_1 = require("../Types");
const YesNoState_1 = require("./primitives/YesNoState");
const be_framework_1 = require("@be/be-framework");
var cu = be_framework_1.libraries.jibo_cai_utils;
class ShouldDoSleepEmpathy extends YesNoState_1.YesNoState {
    constructor(statemachine) {
        super(statemachine, `Should Do Sleep Empathy?`);
        this.statemachine = statemachine;
        this.PROBABILITY_OF_UNKNOWN_SLEEP_EMPATHY = 0.80;
        this.onEntry = this._onEntry.bind(this);
    }
    _onEntry(trans, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const skill = this.statemachine.skill;
            if (data.intent === Types_1.Intents.whatsUp) {
                return this.transitionToNoState(data);
            }
            let uuid;
            if (data.user) {
                uuid = data.user.uuid;
            }
            else {
                return this.transitionToNoState(data);
            }
            let userSleepEmpathy = data.kbRoot.data.sleepEmpathy && data.kbRoot.data.sleepEmpathy[uuid];
            let previousResponse = Types_1.EmpathyResponse.UNKNOWN;
            if (userSleepEmpathy && userSleepEmpathy.sleepQuality && userSleepEmpathy.qualityTimestamp) {
                const sleepQuality = userSleepEmpathy.sleepQuality;
                let qualityTimestamp = userSleepEmpathy.qualityTimestamp;
                const now = skill.dateProvider.getDate().getTime();
                if (cu.TimeUtils.sameDay(now, qualityTimestamp)) {
                    return this.transitionToNoState(data);
                }
                if ((now - qualityTimestamp) < cu.TimeUtils.hoursToMs(skill.EMPATHY_RESET_HOURS)) {
                    const response = Types_1.EmpathyResponse[sleepQuality];
                    if (response) {
                        previousResponse = response;
                    }
                    else {
                        skill.log.error(`Invalid sleep response in kb ${sleepQuality}. Defaulting to ${previousResponse}.`);
                    }
                }
                else {
                    data.kbRoot.data.sleepEmpathy[uuid].sleepQuality = Types_1.EmpathyResponse.UNKNOWN;
                    try {
                        yield data.kbRoot.save();
                    }
                    catch (error) {
                        skill.log.error("Couldn't invalidate sleep quality: ", error);
                    }
                }
            }
            else {
                try {
                    yield this.initializeAndSaveSleepEmpathy(data, uuid);
                }
                catch (error) {
                    skill.log.error("Couldn't initialize kbroot fields: ", error);
                }
            }
            if ((previousResponse === Types_1.EmpathyResponse.UNKNOWN) && (Math.random() > this.PROBABILITY_OF_UNKNOWN_SLEEP_EMPATHY)) {
                this.transitionToNoState(data);
            }
            return this.transitionToYesState(data);
        });
    }
    initializeAndSaveSleepEmpathy(data, uuid) {
        if (data.kbRoot.data.sleepEmpathy) {
            data.kbRoot.data.sleepEmpathy[uuid] = {
                sleepQuality: Types_1.EmpathyResponse.UNKNOWN,
                qualityTimestamp: this.statemachine.skill.dateProvider.getDate().getTime()
            };
        }
        else {
            data.kbRoot.data.sleepEmpathy = {
                [uuid]: {
                    sleepQuality: Types_1.EmpathyResponse.UNKNOWN,
                    qualityTimestamp: this.statemachine.skill.dateProvider.getDate().getTime()
                }
            };
        }
        return data.kbRoot.save().catch((error) => this.statemachine.skill.log.error("Could not initialize and save sleep empathy."));
    }
}
exports.ShouldDoSleepEmpathy = ShouldDoSleepEmpathy;

},{"../Types":3,"./primitives/YesNoState":34,"@be/be-framework":undefined}],29:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Types_1 = require("../Types");
const DoMiMState_1 = require("./primitives/DoMiMState");
const SLEEP_QUALITY_GOOD = 'SleepQualityGoodAgain';
const SLEEP_QUALITY_BAD = 'SleepQualityBetter';
const SLEEP_QUALITY_UNKNOWN = 'SleepQualityUnknown';
class SleepEmpathyQuestionState extends DoMiMState_1.DoMIMState {
    constructor(statemachine) {
        super(statemachine, statemachine.skill, `Sleep Empathy Question`, (sm, data) => {
            const skill = statemachine.skill;
            let previousSleepEmpathyResponse = Types_1.EmpathyResponse.UNKNOWN;
            try {
                previousSleepEmpathyResponse = Types_1.EmpathyResponse[data.kbRoot.data.sleepEmpathy[data.user.uuid].sleepQuality];
            }
            catch (error) {
                skill.log.error('GreetingsRunVariable is incompatible with SleepEmpathyQuestionState: ', error);
            }
            let mim = SLEEP_QUALITY_UNKNOWN;
            switch (previousSleepEmpathyResponse) {
                case Types_1.EmpathyResponse.BAD:
                    mim = SLEEP_QUALITY_BAD;
                    break;
                case Types_1.EmpathyResponse.GOOD:
                    mim = SLEEP_QUALITY_GOOD;
                    break;
                case Types_1.EmpathyResponse.UNKNOWN:
                    mim = SLEEP_QUALITY_UNKNOWN;
                    break;
                default:
                    skill.log.error('Invalid sleep empathy response. Defaulting to UNKNOWN.');
                    break;
            }
            statemachine.skill.log.info(`Inquiring about sleep quality with mim: ${mim}`);
            return mim;
        });
        this.statemachine = statemachine;
    }
    getMIMs() {
        return [SLEEP_QUALITY_BAD, SLEEP_QUALITY_GOOD, SLEEP_QUALITY_UNKNOWN];
    }
}
exports.SleepEmpathyQuestionState = SleepEmpathyQuestionState;

},{"../Types":3,"./primitives/DoMiMState":32}],30:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Types_1 = require("../Types");
const DoMiMState_1 = require("./primitives/DoMiMState");
const Utils_1 = require("../utils/Utils");
const SQBadAgain = 'SQBadBad';
const SQBadNowGood = 'SQBadGood';
const SQGoodAgain = 'SQGoodGood';
const SQGoodNowBad = 'SQGoodBad';
const SQError = 'SQError';
const SQFirstGood = 'SQUnknownGood';
const SQFirstBad = 'SQUnknownBad';
const badSleepIntentMap = new Map([
    [Types_1.SimpleResponseIntent.yes, SQBadNowGood],
    [Types_1.SimpleResponseIntent.no, SQBadAgain],
    [Types_1.SimpleResponseIntent.noInput, SQError],
    [Types_1.SimpleResponseIntent.noMatch, SQError]
]);
const goodSleepIntentMap = new Map([
    [Types_1.SimpleResponseIntent.yes, SQGoodAgain],
    [Types_1.SimpleResponseIntent.no, SQGoodNowBad],
    [Types_1.SimpleResponseIntent.noInput, SQError],
    [Types_1.SimpleResponseIntent.noMatch, SQError]
]);
const unknownSleepIntentMap = new Map([
    [Types_1.SimpleResponseIntent.yes, SQFirstGood],
    [Types_1.SimpleResponseIntent.no, SQFirstBad],
    [Types_1.SimpleResponseIntent.noInput, SQError],
    [Types_1.SimpleResponseIntent.noMatch, SQError]
]);
class SleepEmpathyResponseState extends DoMiMState_1.DoMIMState {
    constructor(statemachine, skill) {
        super(statemachine, skill, 'Sleep Empathy Response', (sm, data) => {
            let intentString = Utils_1.Utils.extractIntentFromMIMResults(data.lastMiMResults);
            let intent = Types_1.SimpleResponseIntent[intentString];
            if (!intent) {
                skill.log.error(`Unexpected null intent for sleep empathy response: ${intentString}. Replacing with noInput.`);
                intent = Types_1.SimpleResponseIntent.noInput;
            }
            else {
                skill.log.info(`User responded with intent: ${intent}.`);
            }
            let newEmpathyResponse;
            switch (intent) {
                case Types_1.SimpleResponseIntent.yes:
                    newEmpathyResponse = Types_1.EmpathyResponse.GOOD;
                    break;
                case Types_1.SimpleResponseIntent.no:
                    newEmpathyResponse = Types_1.EmpathyResponse.BAD;
                    break;
                default:
                    newEmpathyResponse = Types_1.EmpathyResponse.UNKNOWN;
                    break;
            }
            const uuid = data.user.uuid;
            const now = skill.dateProvider.getDate().getTime();
            const userSleepEmpathy = data.kbRoot.data.sleepEmpathy && data.kbRoot.data.sleepEmpathy[uuid];
            let previousResponse = Types_1.EmpathyResponse.UNKNOWN;
            if (!userSleepEmpathy) {
                this.skill.log.warn("Initiaizing knowledge base fields in SleepEmpathyResponseState, this should've happened earlier");
            }
            else {
                previousResponse = userSleepEmpathy.sleepQuality;
            }
            let mimIdToUse = SQError;
            switch (previousResponse) {
                case Types_1.EmpathyResponse.BAD:
                    mimIdToUse = badSleepIntentMap.get(intent);
                    break;
                case Types_1.EmpathyResponse.GOOD:
                    mimIdToUse = goodSleepIntentMap.get(intent);
                    break;
                case Types_1.EmpathyResponse.UNKNOWN:
                    mimIdToUse = unknownSleepIntentMap.get(intent);
                    break;
                default:
                    skill.log.error(`Unrecognized sleep empathy response greeting type ${previousResponse}`);
                    break;
            }
            if (data.kbRoot.data.sleepEmpathy) {
                data.kbRoot.data.sleepEmpathy[uuid] = {
                    sleepQuality: newEmpathyResponse,
                    qualityTimestamp: now
                };
            }
            else {
                data.kbRoot.data.sleepEmpathy = {
                    [uuid]: {
                        sleepQuality: newEmpathyResponse,
                        qualityTimestamp: now
                    }
                };
            }
            data.kbRoot.save().catch(error => this.skill.log.error('Could not save sleep empathy interaction in kb: ', error));
            skill.log.info(`${mimIdToUse} chosen for intent:${intent} and sleep response:${previousResponse}.`);
            this.trackEmpathyResponseResult(data, previousResponse, intent);
            return mimIdToUse;
        });
    }
    trackEmpathyResponseResult(data, previousResponse, intent) {
        const results = {
            previous_sleep_state: previousResponse,
            person_in_loop: ((data.user && data.user.spokenName && data.useName) ? 'true' : 'false'),
            user_response: intent
        };
        if (previousResponse === Types_1.EmpathyResponse.UNKNOWN) {
            this.skill.track('Sleep Empathy Question', results);
        }
        else {
            this.skill.track('Sleep Empathy Follow-up', results);
        }
    }
    getMIMs() {
        return [SQBadAgain, SQBadNowGood, SQGoodAgain, SQGoodNowBad, SQError, SQFirstGood, SQFirstBad];
    }
}
exports.SleepEmpathyResponseState = SleepEmpathyResponseState;

},{"../Types":3,"../utils/Utils":36,"./primitives/DoMiMState":32}],31:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DoMiMState_1 = require("./primitives/DoMiMState");
class VerbalGreetedMIMState extends DoMiMState_1.DoMIMState {
    constructor(statemachine, skill, name, selector) {
        super(statemachine, skill, name, selector);
        const superOnEntry = this.onEntry.bind(this);
        this.onEntry = (trans, data) => {
            data.verbal = true;
            data.greeted = true;
            return superOnEntry(trans, data);
        };
    }
}
exports.VerbalGreetedMIMState = VerbalGreetedMIMState;

},{"./primitives/DoMiMState":32}],32:[function(require,module,exports){
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
const path = require('path');
var sm = be_framework_1.libraries.jibo_state_machine;
var cu = be_framework_1.libraries.jibo_cai_utils;
const GreetingsMiMFlow = require('../../flows/Greeting');
class DoMIMState extends sm.State {
    constructor(statemachine, skill, name, mimIdSelector) {
        super(statemachine, name);
        this.skill = skill;
        this.mimIdSelector = mimIdSelector;
        this.onEntry = this._onEntry.bind(this);
        this.onStop = () => {
            if (this._flowHandle) {
                this._flowHandle.stop();
                this._flowHandle = null;
            }
        };
    }
    _onEntry(trans, data) {
        return __awaiter(this, void 0, void 0, function* () {
            let mimId = data.mimId;
            let mimIds = [];
            if (this.mimIdSelector) {
                const selectedMims = yield this.mimIdSelector(this.skill, data);
                if (Array.isArray(selectedMims)) {
                    mimIds.push(...selectedMims);
                }
                else if (selectedMims) {
                    mimIds.push(selectedMims);
                }
                else {
                    this.skill.log.info(`mimIdSelector returned falsey value`);
                    return data;
                }
            }
            else if (!mimId) {
                this.skill.log.error(`No mimId present`);
                return data;
            }
            else {
                mimIds.push(mimId);
            }
            let loopMember = '';
            if (data.user && data.user.spokenName) {
                this.skill.log.info(`loopMember: ${data.user.uuid}; useName: ${data.useName}`);
                if (data.useName) {
                    loopMember = data.user.spokenName;
                }
            }
            else {
                this.skill.log.info('no loopMember info');
            }
            let now = this.skill.dateProvider.getDate();
            let day = now.toLocaleDateString('en-us', { weekday: 'long' });
            const options = {
                assetPack: this.skill.assetPack,
                enableLogging: false,
                blackboard: {
                    promptData: {
                        loopMember: loopMember,
                        POD: this.skill.getPartOfDay().toLowerCase(),
                        PODclaim: data.PODclaim,
                        holiday: data.holiday,
                        holidayClaim: data.holidayClaim,
                        day: day,
                        activeHolidays: data.activeHolidays
                    },
                    result: {}
                },
            };
            for (let i = 0; i < mimIds.length; ++i) {
                mimId = mimIds[i];
                this.skill.log.info(`doing mim ${mimId}`);
                options.blackboard['mimPath'] = path.join('mims', mimId + '.mim');
                try {
                    yield cu.PromiseUtils.promisify(h => {
                        this._flowHandle = jibo.flow.run(GreetingsMiMFlow, options, h);
                    });
                }
                catch (e) {
                    throw e;
                }
                finally {
                    this._flowHandle = null;
                }
            }
            data.lastMiMResults = { mimId: mimId, mimResult: options.blackboard.result };
            return data;
        });
    }
    getMIMs() {
        return [];
    }
}
exports.DoMIMState = DoMIMState;

},{"../../flows/Greeting":4,"@be/be-framework":undefined,"jibo":undefined,"path":undefined}],33:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const be_framework_1 = require("@be/be-framework");
var sm = be_framework_1.libraries.jibo_state_machine;
class DoneState extends sm.State {
    constructor(stateMachine, name = 'Done') {
        super(stateMachine, name);
        this.onEntry = (trans, data) => {
            stateMachine.stop(data);
        };
    }
}
exports.DoneState = DoneState;

},{"@be/be-framework":undefined}],34:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const be_framework_1 = require("@be/be-framework");
const { PromiseUtils, RandomUtils } = be_framework_1.libraries.jibo_cai_utils;
var sm = be_framework_1.libraries.jibo_state_machine;
class YesNoState extends sm.State {
    constructor(statemachine, name = 'Yes/No') {
        super(statemachine, name);
    }
    init(yesState, noState, transitionNames = ['yes', 'no']) {
        this.yesState = yesState;
        this.noState = noState;
        this.addInternalTransition(transitionNames[0], this.yesState);
        this.addInternalTransition(transitionNames[1], this.noState);
    }
    transitionToYesState(data) {
        if (this.isCurrent()) {
            return this.transitionTo(this.yesState, data);
        }
    }
    transitionToNoState(data) {
        if (this.isCurrent()) {
            return this.transitionTo(this.noState, data);
        }
    }
}
exports.YesNoState = YesNoState;

},{"@be/be-framework":undefined}],35:[function(require,module,exports){
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
const { PromiseUtils } = be_framework_1.libraries.jibo_cai_utils;
class LoopUtils {
    constructor(skill) {
        this.skill = skill;
    }
    spokenNameFromUUID(uuid) {
        return __awaiter(this, void 0, void 0, function* () {
            this.skill.log.debug(`accessing loopManager...`);
            let loop = undefined;
            try {
                loop = yield this.fetchLoopMemberList();
            }
            catch (e) {
                this.skill.log.error(`error populating loop info: `, e);
                return null;
            }
            this.skill.log.debug(`got loop info`);
            let loopMemberNode = loop.find((element) => element.id === uuid);
            if (!loopMemberNode) {
                this.skill.log.warn(`${uuid} not found in loop`);
                return null;
            }
            else {
                let name = loopMemberNode.toString();
                this.skill.log.info(`loopMemberNode found for: ${uuid}`);
                return name;
            }
        });
    }
    isLoopMemberBday(loopMemberUUID) {
        return __awaiter(this, void 0, void 0, function* () {
            const loopMemberList = yield this.fetchLoopMemberList();
            if (!loopMemberList || !loopMemberList.length) {
                this.skill.log.warn('no loop member list when checking loop member birthday');
                return false;
            }
            for (const member of loopMemberList) {
                if (member.id === loopMemberUUID && member.data.birthday) {
                    const bdayValue = member.data.birthday;
                    const bday = new Date(bdayValue);
                    const dpDate = this.skill.dateProvider.getDate();
                    if (bday.getUTCDate() === dpDate.getDate() &&
                        bday.getUTCMonth() === dpDate.getMonth()) {
                        return true;
                    }
                }
            }
            return false;
        });
    }
    fetchLoopMemberList() {
        return __awaiter(this, void 0, void 0, function* () {
            let loopMemberList;
            try {
                loopMemberList = yield jibo.kb.loop.loadLoop();
            }
            catch (err) {
                this.skill.log.error(`Error loading loop from KB. Returning null.`);
                return null;
            }
            if (!loopMemberList) {
                this.skill.log.warn(`KB returned no loop.`);
                return null;
            }
            return loopMemberList;
        });
    }
}
exports.LoopUtils = LoopUtils;

},{"@be/be-framework":undefined,"jibo":undefined}],36:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo_1 = require("jibo");
const MINS_TO_MS = 60 * 1000;
const HOURS_TO_MS = 60 * MINS_TO_MS;
class Utils {
    static minutesToMs(minutes) {
        return minutes * MINS_TO_MS;
    }
    static hoursToMs(hours) {
        return hours * HOURS_TO_MS;
    }
    static extractIntentFromMIMResults(mimResults) {
        const mimResult = mimResults.mimResult;
        let intent = '';
        if (mimResult && mimResult.asrResults) {
            let resultState = jibo_1.jetstream.types.ListenResultState[mimResult.asrResults.state];
            if (resultState === jibo_1.jetstream.types.ListenResultState.match) {
                intent = mimResult.asrResults.intent;
            }
            else {
                intent = resultState;
            }
        }
        return intent;
    }
}
exports.Utils = Utils;

},{"jibo":undefined}]},{},[5])(5)
});
//# sourceMappingURL=index.js.map