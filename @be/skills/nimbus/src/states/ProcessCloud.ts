import jibo = require('jibo');
import * as cloud from '@jibo/interfaces';
import { BeSkill, libraries } from '@be/be-framework';
import { PresenceRecord } from 'jibo-common-types';
import { AnimationInstance, AnimationState } from 'jibo-expression-client';
import { Nimbus } from '../Nimbus';
import { Dataflow, MIMConfig, MIMPrompt } from '../common/Types';
import { Utils } from "../utils/Utils";

export import State = libraries.jibo_state_machine.State;
import cu = libraries.jibo_cai_utils;
import StateMachine = libraries.jibo_state_machine.StateMachine;
import Transition = libraries.jibo_state_machine.Transition;
type Animation = jibo.animDB.Animation;
type AnimConfig = jibo.animDB.AnimConfig;
type Playback = jibo.animDB.Playback;
type PlaybackOptions = jibo.animDB.PlaybackOptions;
type AttentionHandle = jibo.expression.AttentionHandle;

const { PromiseUtils } = libraries.jibo_cai_utils;
const timeout = PromiseUtils.timeout;
const prify = PromiseUtils.promisify;
const ATTENTION_TIMEOUT = 2000;
const CLOUD_SKILL_TIMEOUT = 8000;
const CLOUD_SKILL_TIMED_OUT = 'CLOUD_SKILL_TIMED_OUT';
const SKILL_ENTRY = 'Skill Entry';


interface CloudBehaviors {
    slim?: JIBO.v2.behaviors.SLIM;
    slimSequence?: JIBO.v2.behaviors.Sequence;
    setPresentPerson?: JIBO.v2.behaviors.SetPresentPerson;
    impactEmotion?: JIBO.v2.behaviors.ImpactEmotion;
}

/**
 * @internal
 */
export class ProcessCloudState extends State {

    private attnModeHandle: AttentionHandle;

    private loopingAssetName = 'Thinking_Eye_Loop_01';
    private loopingAsset: Animation;

    private _thinkingPlaybackInstance: Playback;
    private _thinkingAnimPr: Promise<AnimationState>;
    private _thinkingAnimActive: boolean;

    private stoppedOrComplete = false;

    static isSlim = (behavior: JIBO.v2.behaviors.Behavior): behavior is JIBO.v2.behaviors.SLIM => { return (behavior.type === 'SLIM'); };
    static isSequence = (behavior: JIBO.v2.behaviors.Behavior): behavior is JIBO.v2.behaviors.Sequence => { return (behavior.type === 'SEQUENCE'); };
    static isParallel = (behavior: JIBO.v2.behaviors.Behavior): behavior is JIBO.v2.behaviors.Parallel => { return (behavior.type === 'PARALLEL'); };
    static isSlimSequence = (sequence: JIBO.v2.behaviors.Sequence) => { return sequence.children.every(behavior => ProcessCloudState.isSlim(behavior)); };
    static isSetPresentPerson = (behavior: JIBO.v2.behaviors.Behavior): behavior is JIBO.v2.behaviors.SetPresentPerson => { return (behavior.type === 'SET_PRESENT_PERSON'); };
    static isImpactEmotion = (behavior: JIBO.v2.behaviors.Behavior): behavior is JIBO.v2.behaviors.ImpactEmotion => { return (behavior.type === 'IMPACT_EMOTION'); };

    constructor(sm: StateMachine, private nimbus: Nimbus, name: string) {
        super(sm, name);

        this.onEntry = async (transition: Transition, data: Dataflow): Promise<Dataflow> => {
            this.stoppedOrComplete = false;
            const isGQA = !!((data.listenResult.match.cloudSkill === 'answer') || (data.listenResult.match.cloudSkill === 'news'));

            if (isGQA) {
                this.loopingAsset = this.nimbus.jibo.animDB.getAnimByName(this.loopingAssetName);
                try {
                    this.doThinkingAnim();
                } catch (e) {
                    this.nimbus.log.error('Cannot play Thinking animations because: ', e);
                }
            }

            try {
                this.nimbus.log.info('Awaiting Cloud Skill response...');
                data.cloudResponse = await timeout<jibo.jetstream.types.SkillActionData>(data.listenResult.cloudSkillResponse, CLOUD_SKILL_TIMEOUT, 'Cloud Skill Response Timeout');
                this.nimbus.log.info('Received Cloud Skill response.');
            } catch (error) {
                await this.stopThinkingAnim();
                throw error;
            }

            if (data.cloudResponse) {
                BeSkill.plugins.analytics.currentSkill = this.nimbus.analytics.renameSkill(data.cloudResponse.skill.id);
                jibo.context.updateSkillContext(data.cloudResponse.skill);
                if (!this.stoppedOrComplete) {
                    this.nimbus.log.info('Processing Cloud Skill response...');
                    this.processCloudResponse(data);
                    this.nimbus.log.info('Processed Cloud Skill response.');
                }
            }
            return data;
        };

        this.onStop = () => {
            this.stoppedOrComplete = true;
        };

        this.onExit = async () => {
            this.stoppedOrComplete = true;
            return await this.stopThinkingAnim();
        };
    }

    /**
     * Process incoming cloud skill response data into actionable data on the robot.
     * @param {Dataflow} data - Current skill data
     * @returns {MIMConfig[]} - Array of MIM Configs
     */
    processCloudResponse(data: Dataflow): void {
        const isError = ('message' in data.cloudResponse);
        if (isError) {
            const message = (data.cloudResponse as cloud.skill.response.SkillErrorData).message;
            throw new Error(`Recieved Error message from Cloud Skill: ${message}`);
        }
        const response = (data.cloudResponse as cloud.skill.response.SkillActionData);
        const cloudBehaviors = this.processAction(response.action);
        data.mims = this.processSlimBehaviors(cloudBehaviors);
        this.processSupplementalBehaviors(cloudBehaviors);
        this.processAnalytics(response.analytics, data.listenResult, data.lastSkill);
    }

    /**
     * Process provided Skill Action into constituent JCP behaviors.
     * @param {cloud.skill.action.Action} action Action provided from the cloud skill
     * @returns {CloudBehaviors} All behaviors
     */
    private processAction(action: cloud.skill.action.Action): CloudBehaviors {
        const cloudBehaviors: CloudBehaviors = {
            slim: null,
            slimSequence: null,
            setPresentPerson: null,
            impactEmotion: null
        };
        this.processBehavior(action.config.jcp, cloudBehaviors);
        return cloudBehaviors;
    }

    /**
     * Process provided JCP Behavior.
     * @param {JIBO.v2.behaviors.Behavior} behavior Behavior provided from the Cloud in the Skill Action.
     * @param {cloudBehaviors} behaviors Running object containing sub-behaviors of the skill behavior.
     */
    private processBehavior(behavior: JIBO.v2.behaviors.Behavior, behaviors: CloudBehaviors): void {
        if (ProcessCloudState.isSlim(behavior)) {
            behaviors.slim = behavior;
        } else if (ProcessCloudState.isSetPresentPerson(behavior)) {
            behaviors.setPresentPerson = behavior;
        } else if (ProcessCloudState.isImpactEmotion(behavior)) {
            behaviors.impactEmotion = behavior;
        } else if (ProcessCloudState.isParallel(behavior)) {
            for (const child of behavior.children) {
                this.processBehavior(child, behaviors);
            }
        } else if (ProcessCloudState.isSequence(behavior)) {
            if (ProcessCloudState.isSlimSequence(behavior)) {
                behaviors.slimSequence = behavior;
            } else {
                for (const child of behavior.children) {
                    this.processBehavior(child, behaviors);
                }
            }
        } else {
            this.nimbus.log.warn(`Unsupported behavior  ${behavior.type}  requested from Cloud Skill; skipping.`);
        }
    }

    /**
     * Process a SLIM or Sequence of SLIMs into an array of MIMs.
     * @param {CloudBehaviors} behaviors Behaviors provided from the cloud skill
     * @returns {MIMConfig[]}
     */
    private processSlimBehaviors(behaviors: CloudBehaviors): MIMConfig[] {

        let configs: JIBO.v2.behaviors.SLIMConfig[] = [];
        if (behaviors.slim) {
            configs.push(behaviors.slim.config);
        } else if (behaviors.slimSequence) {
            const slims = behaviors.slimSequence.children.map(child => (child as JIBO.v2.behaviors.SLIM).config);
            configs.push(...slims);
        }

        return configs.map(config => {
            let rules: string;
            let mim_id: string;
            let prompt_id: string;
            let view: any;
            let prompt: MIMPrompt;
            let prompt_sub_category: string;
            let mim_type: 'question' | 'announcement' | 'optional-response';
            if (config.listen) {
                rules = config.listen.contexts.join(',');
            }
            if (config.display) {
                view = (config.display.view as JIBO.v2.behaviors.SkillDisplay).context;
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
                    prompt_sub_category: (prompt_sub_category && ((prompt_sub_category !== 'NI' && prompt_sub_category !== 'NM'))) ? prompt_sub_category : (rules  ? 'Q' : 'AN'),
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
                gui: view,  // Short term, handle GUI/Views with Mim GUI manager
                es_auto_tagging: true,
                prompts: [prompt]
            };
        }).filter(mim => !!mim);
    }

    /**
     * Process non-SLIM supplemental behaviors provided from the Cloud Skill
     * @param {CloudBehaviors} behaviors - Behaviors provided from the Cloud Skill
     */
    private processSupplementalBehaviors(behaviors: CloudBehaviors): void {
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
            const impact: jibo.emotion.EmotionImpact = {
                valence: jibo.emotion.ImpactSize[behaviors.impactEmotion.valence],
                confidence: jibo.emotion.ImpactSize[behaviors.impactEmotion.confidence]
            };
            this.nimbus.jibo.emotion.triggerImpact(impact);
        }
    }

    /**
     * Process provided cloud skill analytics data and shepard the events to the on-robot Analytics system.
     * @param {cloud.skill.analytics.AnalyticsData} analytics
     * @param {jibo.jetstream.types.ListenResult} listenResult
     * @param {string} lastSkill
     */
    private processAnalytics(analytics: cloud.skill.analytics.AnalyticsData, listenResult: jibo.jetstream.types.ListenResult, lastSkill: string) {
        if (analytics) {
            this.nimbus.log.info('Recieved analytics from cloud skill.');
            Object.keys(analytics).forEach(cloudSkill => {
                const cachedSkillName = BeSkill.plugins.analytics.currentSkill;
                BeSkill.plugins.analytics.currentSkill = this.nimbus.analytics.renameSkill(cloudSkill);
                analytics[cloudSkill].forEach(entry => {
                    if (entry.event === SKILL_ENTRY) {
                        entry.properties.last_skill = lastSkill;  // TODO: Revisit for Milestone 2 with re-directs
                        entry.properties.initial_intent = listenResult.intent;
                    }
                    this.nimbus.track(entry.event, entry.properties);
                });
                delete analytics[cloudSkill];
                BeSkill.plugins.analytics.currentSkill = cachedSkillName;
            });
        }
    }

    /**
     * --------------------------
     * Thinking Animation Helpers
     * --------------------------
     */

    /**
     * Start the Thinking animations
     */
    private async doThinkingAnim(): Promise<void> {
        if (!this.loopingAsset) {
            this.nimbus.log.warn(`Can't find Thinking anim: ${this.loopingAssetName}`);
            return;
        }
        if (!this.stoppedOrComplete) {
            this._thinkingAnimActive = true;
            this.attnModeHandle = await this.nimbus.jibo.expression.pushAttentionMode(this.nimbus.jibo.expression.AttentionMode.OFF);
            this._thinkingAnimPr = this._configThinkingAssetAndPlay(this.loopingAsset, 0);
        }
    }

    /**
     * Config a retreived AnimDB asset and play it with an optional number of loops and Playback handler function
     *
     * @param {Animation} asset AnimDB asset to play
     * @param {number} [loopIterations] Number of iterations to loop the animation
     */
    private async _configThinkingAssetAndPlay(asset: Animation, loopIterations?: number): Promise<AnimationState> {
        const config: AnimConfig = {
            loops: loopIterations,
            cache: cu.CacheUtils.GlobalCacheName
        };
        const options: PlaybackOptions = {
            disableSetFaceAnim: false,
            screenCenterOverride: true,
            ownerInformation: 'Behavior'
        };
        if (!this.stoppedOrComplete) {
            const playbackResult = asset.play(config, options);
            this._thinkingPlaybackInstance = playbackResult.playback;
            return playbackResult.result;
        } else {
            return Promise.resolve(AnimationState.CANCELLED);
        }
    }

    /**
     * Stop the Thinking animations
     */
    private async stopThinkingAnim(): Promise<any> {
        this._thinkingAnimActive = false;
        if (this._thinkingPlaybackInstance) {
            const centerConfig = {
                requestor: 'Behavior',
                centerGlobally: false,
                dofs: this.nimbus.jibo.expression.dofs.EYE
            };

            if (!this._thinkingPlaybackInstance.instance) {
                this.nimbus.log.warn(`Potential race condition detected. Waiting a bit...`, );
                try {
                    await PromiseUtils.promisify(h => setTimeout(h, 500));
                } catch (e) {
                    this.nimbus.log.warn(`Error while waiting for race condition to pass:`, e);
                }
            }

            let successfulStop = true;
            try {
                await this._thinkingPlaybackInstance.stop();
            } catch (e) {
                this.nimbus.log.warn(`Possibly unable to stop Thinking animation:`, e);
                successfulStop = false;
            } finally {
                this._thinkingPlaybackInstance = null;
            }

            const waitOrSkipPr: Promise<any> = successfulStop ? this._thinkingAnimPr : Promise.resolve();
            return waitOrSkipPr
                .then(() => this.nimbus.jibo.expression.centerRobot(centerConfig))
                .catch(e => {
                    this.nimbus.log.info(`Could not center Eye DOFs after Thinking animation: `, e);
                })
                .then(() => timeout(this.attnModeHandle.release(), ATTENTION_TIMEOUT, 'attnModeHandle.release()'));
        }
    }

}