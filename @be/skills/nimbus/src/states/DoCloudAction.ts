const path = require('path');
import { libraries } from '@be/be-framework';
import * as cloud from '@jibo/interfaces';
import { Nimbus } from '../Nimbus';
import { Dataflow, MIMConfig } from '../common/Types';
import { MimRunner } from '../utils/MimRunner';
import { WaitForAdditionalState } from './WaitForAdditional';
import { DoneState } from './Done';

import State = libraries.jibo_state_machine.State;
import StateMachine = libraries.jibo_state_machine.StateMachine;
import Transition = libraries.jibo_state_machine.Transition;
const { PromiseUtils, RandomUtils } = libraries.jibo_cai_utils;


/**
 * A state that handles reacting by playing a executing a cloud-specified action
 * @internal
 */
export class DoCloudActionState extends State {

    protected _executeAdditionalState: DoCloudActionState;
    protected _waitForAdditionalState: WaitForAdditionalState;
    protected _completeState: DoneState;

    private mimRunner: MimRunner;
    private cloudSkillAnalytics: cloud.skill.analytics.AnalyticsData;

    constructor(sm: StateMachine, private nimbus: Nimbus, name: string, path?: string, private transitionNames = ['Execute Additional', 'WaitForAdditional', 'Complete']) {
        super(sm, name);

        this.onEntry = async (trans, data: Dataflow) => {
            let mim: MIMConfig;
            let knownAdditionalMims = false;
            let isQuestion = false;
            let possibleAdditionalActions = false;
            const isError = !!path;

            if (isError) {
                this.nimbus.log.info(`Executing local error MIM: ${path}`);
            } else {
                mim = data.mims.shift();
                if (!mim) {
                    // TODO: Say some error MIM?
                    this.nimbus.log.warn(`Expected SLIM Action but no valid SLIMs provided. Skipping...`);
                    return this.transitionTo(this._completeState, data);
                }
                knownAdditionalMims = (data.mims.length > 0);
                isQuestion = (mim.mim_type === 'question');
                this.nimbus.log.info(`Executing Cloud Skill SLIM: ${mim.prompts[0].prompt_id}`);
                // Mim.ts expects a string if type is 'Javascript'.
                if (mim.gui && (typeof mim.gui.data === 'object') && (mim.gui.type === 'Javascript')) {
                    mim.gui.data = JSON.stringify(mim.gui.data);
                }

                if (knownAdditionalMims && isQuestion) {
                    this.nimbus.log.error('Sequence of MIMs contains a Question, which cannot be executed in the middle of sequence.');
                    return this.transitionTo(this._completeState, data);
                } else if (!knownAdditionalMims && isQuestion) {
                    possibleAdditionalActions = true;
                }
            }

            const options = {
                assetPack: this.nimbus.assetPack,
                mimConfig: mim,
                mimPath: path
            };
            try {
                this.mimRunner = new MimRunner();
                this.mimRunner.init(options);
                if (possibleAdditionalActions) {
                    this.nimbus.startListeningForNextAction();
                }
                await this.mimRunner.run();
            } catch (e) {
                throw e;
            } finally {
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
                } else if (possibleAdditionalActions) {
                    this.transitionTo(this._waitForAdditionalState, data);
                } else {
                    this.transitionTo(this._completeState, data);
                }
            }
        };

        this.onStop = async () => {
            this.nimbus.stopListeningForNextAction();
            if (this.mimRunner) {
                try {
                    await this.mimRunner.stop();
                } catch (e) {
                    this.nimbus.log.error(e);
                }
                if (this.mimRunner) {
                    this.mimRunner.destroy();
                    this.mimRunner = null;
                }
            }
        };
    }

    installTransitions(executeAdditionalState: DoCloudActionState, waitForAdditionalState: WaitForAdditionalState, completeState: DoneState) {
        this._executeAdditionalState = executeAdditionalState;
        this._waitForAdditionalState = waitForAdditionalState;
        this._completeState = completeState;
        this.addInternalTransition(this.transitionNames[0], this._executeAdditionalState);
        this.addInternalTransition(this.transitionNames[1], this._waitForAdditionalState);
        this.addInternalTransition(this.transitionNames[2], this._completeState);
    }

}