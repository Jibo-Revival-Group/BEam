/// <reference path="../typings/index.d.ts" />

import jibo = require('jibo');
import path = require('path');
import { BeSkill, libraries, utils } from '@be/be-framework';
import { Dataflow } from './common/Types';
import { Utils } from './utils/Utils';
import { IncomingEvents } from './Events';
import { Analytics } from './utils/analytics/Analytics';

import * as moment from 'moment';
import * as states from './states';

import sm = libraries.jibo_state_machine;
import cu = libraries.jibo_cai_utils;

export class Nimbus extends BeSkill {

    public jibo = jibo;
    public skillRoot: string;
    public analytics: Analytics;
    public ownerData: jibo.kb.UserNode;
    public nimbusModel: jibo.kb.Model;
    public nimbusRoot: jibo.kb.Node;

    public eventsIn = new IncomingEvents();

    private core = new sm.StateMachine();
    private coreStates = {
        initialize: new states.InitState(this.core, this, 'Initialize'),
        processCloud: new states.ProcessCloudState(this.core, this, 'Process Cloud'),
        doCloudAction: new states.DoCloudActionState(this.core, this, 'Do Cloud Action'),
        waitForAdditional: new states.WaitForAdditionalState(this.core, this, 'Wait for Additional Actions'),
        done: new states.DoneState(this.core)
    };
    private outer = new sm.StateMachine();
    private outerStates = {
        initialize: new states.OuterInitState(this.outer, this, this.core, 'Start Nimbus'),
        doErrorResponse: new states.DoTechErrorMiMState(this.outer, this, 'Do Error Response'),
        done: new states.DoneState(this.outer)
    };

    private session: cu.SessionManager;
    private updateBinding = this.update.bind(this);

    private nextAction: cu.ExtPromiseWrapper<jibo.jetstream.types.ListenResult>;
    private nextActionTransID: string;
    private localTurnStartBinding = (data) => this.handleLocalTurnStart(data);
    private localTurnResultBinding = (data) => this.handleLocalTurnResult(data);

    constructor(assetPack) {
        super(assetPack);
        this.skillRoot = assetPack.rootPath;
        this.analytics = new Analytics(this);

        // Set up outer SM states
        this.outer.setInitial(this.outerStates.initialize);
        this.outerStates.initialize.installTransitions(this.outerStates.done, this.outerStates.doErrorResponse);
        this.outerStates.doErrorResponse.addDoneTransition(this.outerStates.done);

        // Set up core SM states
        this.core.setInitial(this.coreStates.initialize);
        this.coreStates.initialize.addDoneTransition(this.coreStates.processCloud);
        this.coreStates.processCloud.addDoneTransition(this.coreStates.doCloudAction);
        this.coreStates.doCloudAction.installTransitions(this.coreStates.doCloudAction, this.coreStates.waitForAdditional, this.coreStates.done);
        this.coreStates.waitForAdditional.installTransitions(this.coreStates.done);

        // A function that is used to start a new "session" of Nimbus
        const switchQuery = (data: Dataflow): cu.Activity => {
            return {
                promise: this.outer.start(data),
                stop: () => this.outer.stop(),
                update: () => this.outer.update()
            };
        };

        // We create the session manager
        this.session = new cu.SessionManager(
            switchQuery,
            () => this.exit(),
            this.log);
    }

    /**
     * Called just before skill starts
     * @param done
     */
    preload(done:(err?:any) => void) {
        done();
    }

    postInit(done:(err?:any) => void) : void {

        cu.CacheUtils.initGlobalCache(jibo);

        const thinkingEyeAnim = 'Thinking_Eye_Loop_01';
        const personalReportAudioQuery: jibo.animDB.AnimQuery = {
            categories: ['news', 'music'],
            includeMeta: ['personal-report'],
        };

        this.nimbusModel = jibo.kb.createModel('/nimbus');
        const promises = [
            this.nimbusModel.loadRoot()
                .then((root: jibo.kb.Node) => {
                    this.nimbusRoot = root;
                }).catch(err => {
                    this.log.warn('Error loading KB', err);
                }),
            Utils.loadAnimationIntoCache(jibo, thinkingEyeAnim, cu.CacheUtils.GlobalCacheName)
                .catch(err => {
                    this.log.warn(`Unable to load ${thinkingEyeAnim} into cache ${cu.CacheUtils.GlobalCacheName}`);
                }),
            Utils.loadAnimationIntoCache(jibo, personalReportAudioQuery, cu.CacheUtils.GlobalCacheName)
                .catch(err => {
                    this.log.warn(`Unable to load animations from ${personalReportAudioQuery} into cache ${cu.CacheUtils.GlobalCacheName}`);
                }),
        ];

        Promise.all(promises)
            .then(() => done())
            .catch(done);
    }

    /**
     * @override
     * @param {jibo.jetstream.types.ListenResult} listenResult - Skill switch launch data
     * @param {boolean} [refresh] - flag to denote if we are just re-opening skill (not closed prior)
     * @param {string} [lastSkill]
     */
    open(listenResult: jibo.jetstream.types.ListenResult, refresh?: boolean, lastSkill?: string): void {
        this.log.info('Nimbus Opening');

        this.nextAction = null;
        this.nextActionTransID = null;

        if (listenResult && listenResult.cloudSkillResponse) {
            // Update Analytics and Context service with initial information about the currently active Cloud Skill
            const currentSkill = listenResult.match.cloudSkill;
            BeSkill.plugins.analytics.currentSkill = this.analytics.renameSkill(currentSkill);
            const skillData = {
                id: currentSkill
            };
            jibo.context.updateSkillContext(skillData);

            const data: Dataflow = {
                listenResult,
                lastSkill
            };

            // No matter what was on the screen when launched, switch back to eye
            jibo.face.views.forceEyeView(() => {
                if (refresh) {
                    this.session.replaceSession(data);
                } else {
                    // Subscribe our update method to jibo's timer
                    jibo.timer.on('update', this.updateBinding);
                    this.session.open(data);
                }
            });
        } else {
            throw new Error('Nimbus launched without complete ListenResult; unable to proceed!');
        }
    }

    /**
     * Called on every timer tick when in skill
     */
    update() {
        // Update state machine
        if (this.session.current) {
            this.session.current.update();
        }
    }

    /**
     * Called when the skill closes
     * @param {Function} done
     */
    close(done: (err?: any) => void): void {
        this.log.info('Nimbus Closing');

        const cleanUp = (err?: any) => {
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

    /**
     * Retrieve the NextAction Promise
     * @returns {Promise<jibo.jetstream.types.ListenResult>}
     */
    getNextAction(): Promise<jibo.jetstream.types.ListenResult> {
        if (this.nextAction) {
            return this.nextAction.promise;
        } else {
            return Promise.reject('No known next action to retrieve.');
        }
    }

    /**
     * Retrieve whether or not another Local Turn has been started by Nimbus
     * @returns {boolean} `true` if the next LocalTurn has been started
     */
    hasNextTurn() {
        return !!this.nextActionTransID;
    }

    /**
     * Begin listening for LocalTurn Started and Result events
     */
    startListeningForNextAction() {
        this.nextAction = new cu.ExtPromiseWrapper<jibo.jetstream.types.ListenResult>();
        this.nextAction.promise.catch(result => {
            if (result instanceof Error) {
                this.log.error(result);
            } else {
                this.log.debug(result);
            }
        });
        jibo.jetstream.events.localTurnStarted.on(this.localTurnStartBinding);
        jibo.jetstream.events.localTurnResult.on(this.localTurnResultBinding);
    }

    /**
     * Stop listening for LocalTurn Started and Result events
     */
    stopListeningForNextAction(reject=false) {
        jibo.jetstream.events.localTurnStarted.removeListener(this.localTurnStartBinding);
        jibo.jetstream.events.localTurnResult.removeListener(this.localTurnResultBinding);
        if (reject && this.nextAction) {
            this.nextAction.reject('Cloud Skill Turn never started.');
        }
    }

    /**
     * Type-gaurd function to verify successful LocalTurns
     * @param {jibo.jetstream.types.TurnResult} result - Result of the LocalTurn
     * @returns {boolean} `true` if the LocalTurn was successful
     */
    private isSuccessResult(result: jibo.jetstream.types.TurnResult): result is jibo.jetstream.types.SuccessTurnResult {
        return result.hasOwnProperty('result');
    }

    /**
     * Handler for LocalTurnStarted events
     * @param {string} transID Transaction ID for the LocalTurn
     */
    private handleLocalTurnStart(transID: string) {
        if (!this.nextActionTransID) {
            this.nextActionTransID = transID;
        }
    }

    /**
     * Handler for LocalTurnResult events
     * @param {jibo.jetstream.types.TurnResult} result Result of the LocalTurn
     */
    private handleLocalTurnResult(result: jibo.jetstream.types.TurnResult) {
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

export default Nimbus;
