(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.benimbus = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo_typed_events_1 = require("jibo-typed-events");
class IncomingEvents extends jibo_typed_events_1.EventContainer {
    constructor() {
        super();
        this.cloudSkillResult = new jibo_typed_events_1.Event(`Cloud Skill Result`);
    }
}
exports.IncomingEvents = IncomingEvents;

},{"jibo-typed-events":undefined}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
const be_framework_1 = require("@be/be-framework");
const Utils_1 = require("./utils/Utils");
const Events_1 = require("./Events");
const Analytics_1 = require("./utils/analytics/Analytics");
const states = require("./states");
var sm = be_framework_1.libraries.jibo_state_machine;
var cu = be_framework_1.libraries.jibo_cai_utils;
class Nimbus extends be_framework_1.BeSkill {
    constructor(assetPack) {
        super(assetPack);
        this.jibo = jibo;
        this.eventsIn = new Events_1.IncomingEvents();
        this.core = new sm.StateMachine();
        this.coreStates = {
            initialize: new states.InitState(this.core, this, 'Initialize'),
            processCloud: new states.ProcessCloudState(this.core, this, 'Process Cloud'),
            doCloudAction: new states.DoCloudActionState(this.core, this, 'Do Cloud Action'),
            waitForAdditional: new states.WaitForAdditionalState(this.core, this, 'Wait for Additional Actions'),
            done: new states.DoneState(this.core)
        };
        this.outer = new sm.StateMachine();
        this.outerStates = {
            initialize: new states.OuterInitState(this.outer, this, this.core, 'Start Nimbus'),
            doErrorResponse: new states.DoTechErrorMiMState(this.outer, this, 'Do Error Response'),
            done: new states.DoneState(this.outer)
        };
        this.updateBinding = this.update.bind(this);
        this.localTurnStartBinding = (data) => this.handleLocalTurnStart(data);
        this.localTurnResultBinding = (data) => this.handleLocalTurnResult(data);
        this.skillRoot = assetPack.rootPath;
        this.analytics = new Analytics_1.Analytics(this);
        this.outer.setInitial(this.outerStates.initialize);
        this.outerStates.initialize.installTransitions(this.outerStates.done, this.outerStates.doErrorResponse);
        this.outerStates.doErrorResponse.addDoneTransition(this.outerStates.done);
        this.core.setInitial(this.coreStates.initialize);
        this.coreStates.initialize.addDoneTransition(this.coreStates.processCloud);
        this.coreStates.processCloud.addDoneTransition(this.coreStates.doCloudAction);
        this.coreStates.doCloudAction.installTransitions(this.coreStates.doCloudAction, this.coreStates.waitForAdditional, this.coreStates.done);
        this.coreStates.waitForAdditional.installTransitions(this.coreStates.done);
        const switchQuery = (data) => {
            return {
                promise: this.outer.start(data),
                stop: () => this.outer.stop(),
                update: () => this.outer.update()
            };
        };
        this.session = new cu.SessionManager(switchQuery, () => this.exit(), this.log);
    }
    preload(done) {
        done();
    }
    postInit(done) {
        cu.CacheUtils.initGlobalCache(jibo);
        const thinkingEyeAnim = 'Thinking_Eye_Loop_01';
        const personalReportAudioQuery = {
            categories: ['news', 'music'],
            includeMeta: ['personal-report'],
        };
        this.nimbusModel = jibo.kb.createModel('/nimbus');
        const promises = [
            this.nimbusModel.loadRoot()
                .then((root) => {
                this.nimbusRoot = root;
            }).catch(err => {
                this.log.warn('Error loading KB', err);
            }),
            Utils_1.Utils.loadAnimationIntoCache(jibo, thinkingEyeAnim, cu.CacheUtils.GlobalCacheName)
                .catch(err => {
                this.log.warn(`Unable to load ${thinkingEyeAnim} into cache ${cu.CacheUtils.GlobalCacheName}`);
            }),
            Utils_1.Utils.loadAnimationIntoCache(jibo, personalReportAudioQuery, cu.CacheUtils.GlobalCacheName)
                .catch(err => {
                this.log.warn(`Unable to load animations from ${personalReportAudioQuery} into cache ${cu.CacheUtils.GlobalCacheName}`);
            }),
        ];
        Promise.all(promises)
            .then(() => done())
            .catch(done);
    }
    open(listenResult, refresh, lastSkill) {
        this.log.info('Nimbus Opening');
        this.nextAction = null;
        this.nextActionTransID = null;
        if (listenResult && listenResult.cloudSkillResponse) {
            const currentSkill = listenResult.match.cloudSkill;
            be_framework_1.BeSkill.plugins.analytics.currentSkill = this.analytics.renameSkill(currentSkill);
            const skillData = {
                id: currentSkill
            };
            jibo.context.updateSkillContext(skillData);
            const data = {
                listenResult,
                lastSkill
            };
            jibo.face.views.forceEyeView(() => {
                if (refresh) {
                    this.session.replaceSession(data);
                }
                else {
                    jibo.timer.on('update', this.updateBinding);
                    this.session.open(data);
                }
            });
        }
        else {
            throw new Error('Nimbus launched without complete ListenResult; unable to proceed!');
        }
    }
    update() {
        if (this.session.current) {
            this.session.current.update();
        }
    }
    close(done) {
        this.log.info('Nimbus Closing');
        const cleanUp = (err) => {
            jibo.timer.removeListener('update', this.updateBinding);
            this.stopListeningForNextAction();
            if (this.nextAction) {
                this.nextAction.reject('Nimbus was closed.');
            }
            jibo.context.resetSkillContext();
            done(err);
        };
        this.session.close()
            .then(() => cleanUp())
            .catch(cleanUp);
    }
    getNextAction() {
        if (this.nextAction) {
            return this.nextAction.promise;
        }
        else {
            return Promise.reject('No known next action to retrieve.');
        }
    }
    hasNextTurn() {
        return !!this.nextActionTransID;
    }
    startListeningForNextAction() {
        this.nextAction = new cu.ExtPromiseWrapper();
        this.nextAction.promise.catch(result => {
            if (result instanceof Error) {
                this.log.error(result);
            }
            else {
                this.log.debug(result);
            }
        });
        jibo.jetstream.events.localTurnStarted.on(this.localTurnStartBinding);
        jibo.jetstream.events.localTurnResult.on(this.localTurnResultBinding);
    }
    stopListeningForNextAction(reject = false) {
        jibo.jetstream.events.localTurnStarted.removeListener(this.localTurnStartBinding);
        jibo.jetstream.events.localTurnResult.removeListener(this.localTurnResultBinding);
        if (reject && this.nextAction) {
            this.nextAction.reject('Cloud Skill Turn never started.');
        }
    }
    isSuccessResult(result) {
        return result.hasOwnProperty('result');
    }
    handleLocalTurnStart(transID) {
        if (!this.nextActionTransID) {
            this.nextActionTransID = transID;
        }
    }
    handleLocalTurnResult(result) {
        if (this.nextActionTransID && result.transID && (result.transID === this.nextActionTransID)) {
            this.stopListeningForNextAction();
            switch (result.status) {
                case jibo.jetstream.types.TurnResultType.FAILED:
                    this.nextAction.reject(new Error('Local Turn failed.'));
                    break;
                case jibo.jetstream.types.TurnResultType.SUCCEEDED:
                    if (this.isSuccessResult(result)) {
                        this.nextAction.resolve(result.result);
                        break;
                    }
                default:
                    this.nextAction.reject(`Local Turn ${result.status}`);
                    break;
            }
        }
    }
}
exports.Nimbus = Nimbus;
exports.default = Nimbus;

},{"./Events":1,"./states":11,"./utils/Utils":13,"./utils/analytics/Analytics":14,"@be/be-framework":undefined,"jibo":undefined}],3:[function(require,module,exports){
"use strict";
const Nimbus_1 = require("./Nimbus");
const MimRunner_1 = require("./utils/MimRunner");
const ProcessCloud_1 = require("./states/ProcessCloud");
module.exports = {
    Skill: Nimbus_1.default,
    MimRunner: MimRunner_1.MimRunner,
    ProcessCloudState: ProcessCloud_1.ProcessCloudState
};

},{"./Nimbus":2,"./states/ProcessCloud":9,"./utils/MimRunner":12}],4:[function(require,module,exports){
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
const path = require('path');
const be_framework_1 = require("@be/be-framework");
const MimRunner_1 = require("../utils/MimRunner");
var State = be_framework_1.libraries.jibo_state_machine.State;
const { PromiseUtils, RandomUtils } = be_framework_1.libraries.jibo_cai_utils;
class DoCloudActionState extends State {
    constructor(sm, nimbus, name, path, transitionNames = ['Execute Additional', 'WaitForAdditional', 'Complete']) {
        super(sm, name);
        this.nimbus = nimbus;
        this.transitionNames = transitionNames;
        this.onEntry = (trans, data) => __awaiter(this, void 0, void 0, function* () {
            let mim;
            let knownAdditionalMims = false;
            let isQuestion = false;
            let possibleAdditionalActions = false;
            const isError = !!path;
            if (isError) {
                this.nimbus.log.info(`Executing local error MIM: ${path}`);
            }
            else {
                mim = data.mims.shift();
                if (!mim) {
                    this.nimbus.log.warn(`Expected SLIM Action but no valid SLIMs provided. Skipping...`);
                    return this.transitionTo(this._completeState, data);
                }
                knownAdditionalMims = (data.mims.length > 0);
                isQuestion = (mim.mim_type === 'question');
                this.nimbus.log.info(`Executing Cloud Skill SLIM: ${mim.prompts[0].prompt_id}`);
                if (mim.gui && (typeof mim.gui.data === 'object') && (mim.gui.type === 'Javascript')) {
                    mim.gui.data = JSON.stringify(mim.gui.data);
                }
                if (knownAdditionalMims && isQuestion) {
                    this.nimbus.log.error('Sequence of MIMs contains a Question, which cannot be executed in the middle of sequence.');
                    return this.transitionTo(this._completeState, data);
                }
                else if (!knownAdditionalMims && isQuestion) {
                    possibleAdditionalActions = true;
                }
            }
            const options = {
                assetPack: this.nimbus.assetPack,
                mimConfig: mim,
                mimPath: path
            };
            try {
                this.mimRunner = new MimRunner_1.MimRunner();
                this.mimRunner.init(options);
                if (possibleAdditionalActions) {
                    this.nimbus.startListeningForNextAction();
                }
                yield this.mimRunner.run();
            }
            catch (e) {
                throw e;
            }
            finally {
                if (this.mimRunner) {
                    if (!this.nimbus.hasNextTurn()) {
                        this.nimbus.stopListeningForNextAction(true);
                    }
                    this.mimRunner.destroy();
                    this.mimRunner = null;
                }
            }
            if (!isError) {
                if (knownAdditionalMims) {
                    this.transitionTo(this._executeAdditionalState, data);
                }
                else if (possibleAdditionalActions) {
                    this.transitionTo(this._waitForAdditionalState, data);
                }
                else {
                    this.transitionTo(this._completeState, data);
                }
            }
        });
        this.onStop = () => __awaiter(this, void 0, void 0, function* () {
            this.nimbus.stopListeningForNextAction();
            if (this.mimRunner) {
                try {
                    yield this.mimRunner.stop();
                }
                catch (e) {
                    this.nimbus.log.error(e);
                }
                if (this.mimRunner) {
                    this.mimRunner.destroy();
                    this.mimRunner = null;
                }
            }
        });
    }
    installTransitions(executeAdditionalState, waitForAdditionalState, completeState) {
        this._executeAdditionalState = executeAdditionalState;
        this._waitForAdditionalState = waitForAdditionalState;
        this._completeState = completeState;
        this.addInternalTransition(this.transitionNames[0], this._executeAdditionalState);
        this.addInternalTransition(this.transitionNames[1], this._waitForAdditionalState);
        this.addInternalTransition(this.transitionNames[2], this._completeState);
    }
}
exports.DoCloudActionState = DoCloudActionState;

},{"../utils/MimRunner":12,"@be/be-framework":undefined,"path":undefined}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DoCloudAction_1 = require("./DoCloudAction");
const be_framework_1 = require("@be/be-framework");
const { State } = be_framework_1.libraries.jibo_state_machine;
class DoTechErrorMiMState extends DoCloudAction_1.DoCloudActionState {
    constructor(sm, nimbus, name) {
        super(sm, nimbus, name, 'mims/CloudSkillError.mim');
    }
}
exports.DoTechErrorMiMState = DoTechErrorMiMState;

},{"./DoCloudAction":4,"@be/be-framework":undefined}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const be_framework_1 = require("@be/be-framework");
const { State } = be_framework_1.libraries.jibo_state_machine;
const { PromiseUtils, RandomUtils } = be_framework_1.libraries.jibo_cai_utils;
class DoneState extends State {
    constructor(sm) {
        super(sm, 'Done');
        this.onEntry = () => {
            this.sm.stop();
        };
    }
}
exports.DoneState = DoneState;

},{"@be/be-framework":undefined}],7:[function(require,module,exports){
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
exports.State = be_framework_1.libraries.jibo_state_machine.State;
class InitState extends be_framework_1.libraries.jibo_state_machine.State {
    constructor(sm, nimbus, name) {
        super(sm, name);
        this.nimbus = nimbus;
        this.onEntry = (transition, data) => __awaiter(this, void 0, void 0, function* () {
            return data;
        });
    }
}
exports.InitState = InitState;

},{"@be/be-framework":undefined}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const be_framework_1 = require("@be/be-framework");
exports.State = be_framework_1.libraries.jibo_state_machine.State;
const { PromiseUtils, RandomUtils } = be_framework_1.libraries.jibo_cai_utils;
class OuterInitState extends exports.State {
    constructor(sm, nimbus, coreSM, name, transitionNames = ['Success', 'Error']) {
        super(sm, name);
        this.nimbus = nimbus;
        this.coreSM = coreSM;
        this.transitionNames = transitionNames;
        this.onEntry = (transition, data) => {
            this.coreSM.start(data)
                .then(error => {
                if (error) {
                    this.handleError(error, data);
                }
                else {
                    if (this.isCurrent()) {
                        this.transitionTo(this._successState, data);
                    }
                }
            })
                .catch(error => {
                this.handleError(error, data);
            });
        };
        this.onStop = () => {
            return this.coreSM.stop();
        };
    }
    installTransitions(successState, errorState) {
        this._successState = successState;
        this._errorState = errorState;
        this.addInternalTransition(this.transitionNames[0], this._successState);
        this.addInternalTransition(this.transitionNames[1], this._errorState);
    }
    handleError(error, data) {
        this.nimbus.log.warn('Error in Core Nimbus Logic: ', error);
        this.nimbus.log.warn('Proceeding to fallback error MiM');
        this.nimbus.log.debug(this.coreSM.traceToString());
        if (this.isCurrent()) {
            this.transitionTo(this._errorState, data);
        }
    }
}
exports.OuterInitState = OuterInitState;

},{"@be/be-framework":undefined}],9:[function(require,module,exports){
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
const jibo_expression_client_1 = require("jibo-expression-client");
exports.State = be_framework_1.libraries.jibo_state_machine.State;
var cu = be_framework_1.libraries.jibo_cai_utils;
const { PromiseUtils } = be_framework_1.libraries.jibo_cai_utils;
const timeout = PromiseUtils.timeout;
const prify = PromiseUtils.promisify;
const ATTENTION_TIMEOUT = 2000;
const CLOUD_SKILL_TIMEOUT = 8000;
const CLOUD_SKILL_TIMED_OUT = 'CLOUD_SKILL_TIMED_OUT';
const SKILL_ENTRY = 'Skill Entry';
class ProcessCloudState extends exports.State {
    constructor(sm, nimbus, name) {
        super(sm, name);
        this.nimbus = nimbus;
        this.loopingAssetName = 'Thinking_Eye_Loop_01';
        this.stoppedOrComplete = false;
        this.onEntry = (transition, data) => __awaiter(this, void 0, void 0, function* () {
            this.stoppedOrComplete = false;
            const isGQA = !!((data.listenResult.match.cloudSkill === 'answer') || (data.listenResult.match.cloudSkill === 'news'));
            if (isGQA) {
                this.loopingAsset = this.nimbus.jibo.animDB.getAnimByName(this.loopingAssetName);
                try {
                    this.doThinkingAnim();
                }
                catch (e) {
                    this.nimbus.log.error('Cannot play Thinking animations because: ', e);
                }
            }
            try {
                this.nimbus.log.info('Awaiting Cloud Skill response...');
                data.cloudResponse = yield timeout(data.listenResult.cloudSkillResponse, CLOUD_SKILL_TIMEOUT, 'Cloud Skill Response Timeout');
                this.nimbus.log.info('Received Cloud Skill response.');
            }
            catch (error) {
                yield this.stopThinkingAnim();
                throw error;
            }
            if (data.cloudResponse) {
                be_framework_1.BeSkill.plugins.analytics.currentSkill = this.nimbus.analytics.renameSkill(data.cloudResponse.skill.id);
                jibo.context.updateSkillContext(data.cloudResponse.skill);
                if (!this.stoppedOrComplete) {
                    this.nimbus.log.info('Processing Cloud Skill response...');
                    this.processCloudResponse(data);
                    this.nimbus.log.info('Processed Cloud Skill response.');
                }
            }
            return data;
        });
        this.onStop = () => {
            this.stoppedOrComplete = true;
        };
        this.onExit = () => __awaiter(this, void 0, void 0, function* () {
            this.stoppedOrComplete = true;
            return yield this.stopThinkingAnim();
        });
    }
    processCloudResponse(data) {
        const isError = ('message' in data.cloudResponse);
        if (isError) {
            const message = data.cloudResponse.message;
            throw new Error(`Recieved Error message from Cloud Skill: ${message}`);
        }
        const response = data.cloudResponse;
        const cloudBehaviors = this.processAction(response.action);
        data.mims = this.processSlimBehaviors(cloudBehaviors);
        this.processSupplementalBehaviors(cloudBehaviors);
        this.processAnalytics(response.analytics, data.listenResult, data.lastSkill);
    }
    processAction(action) {
        const cloudBehaviors = {
            slim: null,
            slimSequence: null,
            setPresentPerson: null,
            impactEmotion: null
        };
        this.processBehavior(action.config.jcp, cloudBehaviors);
        return cloudBehaviors;
    }
    processBehavior(behavior, behaviors) {
        if (ProcessCloudState.isSlim(behavior)) {
            behaviors.slim = behavior;
        }
        else if (ProcessCloudState.isSetPresentPerson(behavior)) {
            behaviors.setPresentPerson = behavior;
        }
        else if (ProcessCloudState.isImpactEmotion(behavior)) {
            behaviors.impactEmotion = behavior;
        }
        else if (ProcessCloudState.isParallel(behavior)) {
            for (const child of behavior.children) {
                this.processBehavior(child, behaviors);
            }
        }
        else if (ProcessCloudState.isSequence(behavior)) {
            if (ProcessCloudState.isSlimSequence(behavior)) {
                behaviors.slimSequence = behavior;
            }
            else {
                for (const child of behavior.children) {
                    this.processBehavior(child, behaviors);
                }
            }
        }
        else {
            this.nimbus.log.warn(`Unsupported behavior  ${behavior.type}  requested from Cloud Skill; skipping.`);
        }
    }
    processSlimBehaviors(behaviors) {
        let configs = [];
        if (behaviors.slim) {
            configs.push(behaviors.slim.config);
        }
        else if (behaviors.slimSequence) {
            const slims = behaviors.slimSequence.children.map(child => child.config);
            configs.push(...slims);
        }
        return configs.map(config => {
            let rules;
            let mim_id;
            let prompt_id;
            let view;
            let prompt;
            let prompt_sub_category;
            let mim_type;
            if (config.listen) {
                rules = config.listen.contexts.join(',');
            }
            if (config.display) {
                view = config.display.view.context;
            }
            if (config.play) {
                const meta = config.play.meta;
                if (meta) {
                    prompt_sub_category = meta.prompt_sub_category;
                    prompt_id = meta.prompt_id;
                    mim_id = meta.mim_id;
                    mim_type = meta.mim_type;
                }
                prompt = {
                    prompt_category: "Entry-Core",
                    prompt_sub_category: (prompt_sub_category && ((prompt_sub_category !== 'NI' && prompt_sub_category !== 'NM'))) ? prompt_sub_category : (rules ? 'Q' : 'AN'),
                    prompt: config.play.esml,
                    media: "TTS",
                    prompt_id: prompt_id || 'RUNTIME_PROMPT',
                    auto_rule_override: config.play.autoRuleConfig
                };
            }
            return {
                mim_id: mim_id || undefined,
                mim_type: mim_type || (rules ? 'question' : 'announcement'),
                rule_name: rules,
                gui: view,
                es_auto_tagging: true,
                prompts: [prompt]
            };
        }).filter(mim => !!mim);
    }
    processSupplementalBehaviors(behaviors) {
        if (behaviors.setPresentPerson) {
            this.nimbus.log.info('Recieved supplemental SetPresentPerson behavior from cloud skill.');
            jibo.lps.identity.setActiveSpeaker({
                speakers: [{
                        speaker: behaviors.setPresentPerson.looperId,
                        score: behaviors.setPresentPerson.confidence,
                        accepted: true,
                        high_confidence: true,
                    }],
                snr: 1
            }, 'JCP');
        }
        if (behaviors.impactEmotion) {
            this.nimbus.log.info('Recieved supplemental ImpactEmotion behavior from cloud skill.');
            const impact = {
                valence: jibo.emotion.ImpactSize[behaviors.impactEmotion.valence],
                confidence: jibo.emotion.ImpactSize[behaviors.impactEmotion.confidence]
            };
            this.nimbus.jibo.emotion.triggerImpact(impact);
        }
    }
    processAnalytics(analytics, listenResult, lastSkill) {
        if (analytics) {
            this.nimbus.log.info('Recieved analytics from cloud skill.');
            Object.keys(analytics).forEach(cloudSkill => {
                const cachedSkillName = be_framework_1.BeSkill.plugins.analytics.currentSkill;
                be_framework_1.BeSkill.plugins.analytics.currentSkill = this.nimbus.analytics.renameSkill(cloudSkill);
                analytics[cloudSkill].forEach(entry => {
                    if (entry.event === SKILL_ENTRY) {
                        entry.properties.last_skill = lastSkill;
                        entry.properties.initial_intent = listenResult.intent;
                    }
                    this.nimbus.track(entry.event, entry.properties);
                });
                delete analytics[cloudSkill];
                be_framework_1.BeSkill.plugins.analytics.currentSkill = cachedSkillName;
            });
        }
    }
    doThinkingAnim() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.loopingAsset) {
                this.nimbus.log.warn(`Can't find Thinking anim: ${this.loopingAssetName}`);
                return;
            }
            if (!this.stoppedOrComplete) {
                this._thinkingAnimActive = true;
                this.attnModeHandle = yield this.nimbus.jibo.expression.pushAttentionMode(this.nimbus.jibo.expression.AttentionMode.OFF);
                this._thinkingAnimPr = this._configThinkingAssetAndPlay(this.loopingAsset, 0);
            }
        });
    }
    _configThinkingAssetAndPlay(asset, loopIterations) {
        return __awaiter(this, void 0, void 0, function* () {
            const config = {
                loops: loopIterations,
                cache: cu.CacheUtils.GlobalCacheName
            };
            const options = {
                disableSetFaceAnim: false,
                screenCenterOverride: true,
                ownerInformation: 'Behavior'
            };
            if (!this.stoppedOrComplete) {
                const playbackResult = asset.play(config, options);
                this._thinkingPlaybackInstance = playbackResult.playback;
                return playbackResult.result;
            }
            else {
                return Promise.resolve(jibo_expression_client_1.AnimationState.CANCELLED);
            }
        });
    }
    stopThinkingAnim() {
        return __awaiter(this, void 0, void 0, function* () {
            this._thinkingAnimActive = false;
            if (this._thinkingPlaybackInstance) {
                const centerConfig = {
                    requestor: 'Behavior',
                    centerGlobally: false,
                    dofs: this.nimbus.jibo.expression.dofs.EYE
                };
                if (!this._thinkingPlaybackInstance.instance) {
                    this.nimbus.log.warn(`Potential race condition detected. Waiting a bit...`);
                    try {
                        yield PromiseUtils.promisify(h => setTimeout(h, 500));
                    }
                    catch (e) {
                        this.nimbus.log.warn(`Error while waiting for race condition to pass:`, e);
                    }
                }
                let successfulStop = true;
                try {
                    yield this._thinkingPlaybackInstance.stop();
                }
                catch (e) {
                    this.nimbus.log.warn(`Possibly unable to stop Thinking animation:`, e);
                    successfulStop = false;
                }
                finally {
                    this._thinkingPlaybackInstance = null;
                }
                const waitOrSkipPr = successfulStop ? this._thinkingAnimPr : Promise.resolve();
                return waitOrSkipPr
                    .then(() => this.nimbus.jibo.expression.centerRobot(centerConfig))
                    .catch(e => {
                    this.nimbus.log.info(`Could not center Eye DOFs after Thinking animation: `, e);
                })
                    .then(() => timeout(this.attnModeHandle.release(), ATTENTION_TIMEOUT, 'attnModeHandle.release()'));
            }
        });
    }
}
ProcessCloudState.isSlim = (behavior) => { return (behavior.type === 'SLIM'); };
ProcessCloudState.isSequence = (behavior) => { return (behavior.type === 'SEQUENCE'); };
ProcessCloudState.isParallel = (behavior) => { return (behavior.type === 'PARALLEL'); };
ProcessCloudState.isSlimSequence = (sequence) => { return sequence.children.every(behavior => ProcessCloudState.isSlim(behavior)); };
ProcessCloudState.isSetPresentPerson = (behavior) => { return (behavior.type === 'SET_PRESENT_PERSON'); };
ProcessCloudState.isImpactEmotion = (behavior) => { return (behavior.type === 'IMPACT_EMOTION'); };
exports.ProcessCloudState = ProcessCloudState;

},{"@be/be-framework":undefined,"jibo":undefined,"jibo-expression-client":undefined}],10:[function(require,module,exports){
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
exports.State = be_framework_1.libraries.jibo_state_machine.State;
class WaitForAdditionalState extends exports.State {
    constructor(sm, nimbus, name, transitionNames = ['Complete']) {
        super(sm, name);
        this.nimbus = nimbus;
        this.transitionNames = transitionNames;
        this.stopped = false;
        this.onEntry = (transition, data) => __awaiter(this, void 0, void 0, function* () {
            this.stopped = false;
            this.redirectTimer = null;
            try {
                const turnResult = yield this.nimbus.getNextAction();
                if (turnResult && !this.stopped) {
                    this.nimbus.redirect('@be/nimbus', turnResult);
                    this.redirectTimer = this.nimbus.jibo.timer.setTimeout(() => {
                        this.nimbus.log.warn('Nimbus self-redirect likely failed, exit Nimbus');
                        this.transitionTo(this._completeState, data);
                    }, 5000);
                }
                else {
                    this.transitionTo(this._completeState, data);
                }
            }
            catch (error) {
                this.nimbus.log.warn('Next action could not retrieved, abandoning wait', error);
                this.transitionTo(this._completeState, data);
            }
        });
        this.onStop = () => {
            this.stopped = true;
            if (this.redirectTimer) {
                this.nimbus.jibo.timer.clearTimeout(this.redirectTimer);
            }
        };
    }
    installTransitions(completeState) {
        this._completeState = completeState;
        this.addInternalTransition(this.transitionNames[0], this._completeState);
    }
}
exports.WaitForAdditionalState = WaitForAdditionalState;

},{"@be/be-framework":undefined}],11:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./DoCloudAction"));
__export(require("./Done"));
__export(require("./DoTechErrorMiM"));
__export(require("./Init"));
__export(require("./OuterInit"));
__export(require("./ProcessCloud"));
__export(require("./WaitForAdditional"));

},{"./DoCloudAction":4,"./DoTechErrorMiM":5,"./Done":6,"./Init":7,"./OuterInit":8,"./ProcessCloud":9,"./WaitForAdditional":10}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
const be_framework_1 = require("@be/be-framework");
const { ExtPromiseWrapper } = be_framework_1.libraries.jibo_cai_utils;
class MimRunner {
    init(options) {
        options.onFailure = () => true;
        this.mim = new jibo.bt.behaviors.Mim(options);
        this.update = this.update.bind(this);
        this.runStatus = new ExtPromiseWrapper();
        this.initialized = true;
    }
    run() {
        if (!this.initialized) {
            throw new Error('Cannot start un-initialized MimRunner!');
        }
        else {
            this.mim.start();
            jibo.timer.on('update', this.update);
            return this.runStatus.promise;
        }
    }
    stop() {
        jibo.timer.removeListener('update', this.update);
        if (!this.mim) {
            return Promise.resolve();
        }
        return this.mim.stop()
            .then((data) => this.runStatus.resolve(data))
            .catch((err) => this.runStatus.reject(err));
    }
    destroy() {
        this.runStatus = null;
        if (!this.mim) {
            return;
        }
        this.mim.destroy();
        this.mim = null;
    }
    update() {
        const status = this.mim.update();
        if (status !== jibo.bt.Status.IN_PROGRESS) {
            jibo.timer.removeListener('update', this.update);
            this.runStatus.resolve(status);
        }
    }
}
exports.MimRunner = MimRunner;

},{"@be/be-framework":undefined,"jibo":undefined}],13:[function(require,module,exports){
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
class Utils {
    static sample(arr) {
        const min = 0;
        const max = arr.length;
        const choice = Math.floor(Math.random() * (max - min)) + min;
        return arr[choice];
    }
    static loadAnimationIntoCache(jibo, query, cacheName) {
        return __awaiter(this, void 0, void 0, function* () {
            let assets = [];
            if (typeof query === 'string') {
                const asset = jibo.animDB.getAnimByName(query);
                if (!asset) {
                    return Promise.reject(`No animation of name  '${query}'  found in animDB`);
                }
                else {
                    assets.push(asset);
                }
            }
            else {
                const results = jibo.animDB.query(query);
                if (!results.matching.length) {
                    return Promise.reject(`No animation of  ${query}  found in animDB`);
                }
                else {
                    assets.push(...results.matching);
                }
            }
            assets.forEach((asset) => __awaiter(this, void 0, void 0, function* () {
                yield asset.createFromConfig({
                    cache: cacheName
                });
            }));
        });
    }
}
exports.Utils = Utils;

},{}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkillRename = {
    'chitchat-skill': 'chitchat',
    'personal-report-skill': 'personal-report'
};
class Analytics {
    constructor(skill) {
        this.skill = skill;
    }
    renameSkill(skillName) {
        skillName = exports.SkillRename[skillName] || skillName;
        return skillName;
    }
}
exports.Analytics = Analytics;

},{}]},{},[3])(3)
});
//# sourceMappingURL=index.js.map