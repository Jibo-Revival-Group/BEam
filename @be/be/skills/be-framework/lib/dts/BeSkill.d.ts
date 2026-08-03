/// <reference types="node" />
import { EventEmitter } from 'events';
import { Log } from 'jibo-log';
import Holiday from './plugins/holiday/Holiday';
/**
 * @description Options interface
 * @interface BeSkill~Options
 * @prop {string} [assetPack] Asset pack name
 * @prop {string} [rootPath] Path to the aset pack
 */
export interface Options {
    assetPack?: string;
    rootPath?: string;
}
export interface Plugins {
    holiday: Holiday;
    [x: string]: any;
}
/**
 * @description Skill exit method payload
 * @interface BeSkill~ExitOptions
 * @prop {boolean} [noElementsOfSurprise] If true then we bypass Elements of Surprise
 * @prop {boolean} [globalNoMatch] If true then we go directly to Idle which will
 * respond with its globalNoMatch logic
 */
export interface ExitOptions {
    noElementsOfSurprise?: boolean;
    globalNoMatch?: boolean;
}
/**
 * Callback for async events
 * @callback BeSkill~AsyncCallback
 * @param {Error|String} [err] Error, if one occurs.
 */
export declare type AsyncCallback = (err?: Error | string) => void;
/**
 * A generator callback function providing both `resolve` and `reject` functions
 * @callback BeSkill~PromiseGenerator
 * @param {Function} resolve
 * @param {Function} reject
 */
export declare type PromiseGenerator = (resolve: (ret?: any) => void, reject: (err?: any) => void) => void;
/**
 * A function that gets called when switching skills.
 * @callback BeSkill~PreSkillHook
 * @param {string} oldSkill Name of current skill
 * @param {string} newSkill Name of new skill
 * @param {object} results ASR results (might be empty)
 * @returns {Function} PromiseGenerator
 */
export declare type OpenHook = (oldSkill: string, newSkill: string, results: any) => PromiseGenerator;
/**
 * Base class for skill running inside of Be
 * @class BeSkill
 * @extends EventEmitter
 * @param {Object} [options] Be options for setting up this skill or the assetPack name.
 * @param {String} [options.assetPack=''] Name of the asset pack if running in the context of another skill.
 * @param {String} [options.rootPath=''] The path to this skill's root folder.
 */
declare class BeSkill extends EventEmitter {
    /**
     * Current version of the library.
     * @name BeSkill.version
     * @type {String}
     */
    static version: string;
    /**
     * The currently installed plugins
     * @name BeSkill.plugins
     * @type {Object}
     */
    static plugins: Plugins;
    /**
     * A list of hooks to be called before launching skill
     * @name BeSkill.openHooks
     * @type {Function[]}
     */
    static openHooks: OpenHook[];
    /**
     * Asset pack name for this skill, if running within Be. Otherwise, this is empty.
     * @name BeSkill#assetPack
     * @type {String}
     */
    assetPack: string;
    /**
     * Root path for skill.
     * @name BeSkill#rootPath
     * @type {String}
     */
    rootPath: string;
    /**
     * Log instance for skill.
     * @name BeSkill#log
     * @type {Object}
     */
    log: Log;
    /**
     * Keep track of whether an external factor wants the surprise skill to be skipped.
     * Don't confuse with the noElementsOfSurprise property in ExitOptions which a skill itself can specify.
     * @name BeSkill#skipSurprisesExternal
     * @type {boolean}
     * @public
     */
    skipSurprisesExternal: boolean;
    /**
     * Keep track of whether the skill is interruptible or not
     * @name BeSkill#_isInterruptible
     * @type {boolean}
     * @protected
     */
    protected _isInterruptible: boolean;
    /**
     * Log an error code
     * @method BeSkill.errorCode
     * @param {String} code The error code
     * @param {String} [message=''] An optional message
     */
    static errorCode(code: string, message?: string): void;
    /**
     * Register a plugin
     * @method BeSkill.registerPlugin
     * @param {String} name The name of the property to register
     * @param {Function} plugin The plugin to load
     */
    static registerPlugin(name: string, plugin: PromiseGenerator): void;
    /**
     * Register a skill open hook method. Called whenever a skill is being launched.
     * @method BeSkill.registerOpenHook
     * @param {Function} hook The function to call on skill load
     */
    static registerOpenHook(hook: OpenHook): void;
    /**
     * Called from Be, and in standalone, before opening any skill.
     * Performs any asynchronous cleanup or preparation.
     * Don't confuse with the instance method `open([result])`.
     * @method BeSkill.open
     * @param {String} lastSkill Name of skill that is stopping (null if no skill is stopping)
     * @param {String} nextSkill Name of skill that is about to open
     * @param {object} results - launch intent: the ASR results for the launch
     * command, usually, but could also be empty or contain launch options from another source
     *
     * @param {Function} done Callback to call when done
     */
    static open(lastSkill: string, nextSkill: string, results: any, done: AsyncCallback): void;
    /**
     * STATIC Use to statically initialize resources for all BeSkills.
     * Don't confuse with `init()`
     * @method BeSkill.init
     * @param {Function} done Callback when complete
     * @static
     */
    static init(done: AsyncCallback): void;
    constructor(options?: Options);
    /**
     * Initialize the eye in standalone mode.
     * If you don’t pass in an asset pack, this method will automatically start (call `open`) on your skill.
     * Don't confuse with `init(done)`
     * @method BeSkill#init
     */
    init(): void;
    /**
     * Overrideable async hook that happens once, upon construction after jibo has initialized.
     * @method BeSkill#postInit
     * @param {Function} done Callback, first argument is an optional error.
     */
    postInit(done: AsyncCallback): void;
    /**
     * Overrideable async hook that happens everytime before the skill is opened. This does
     * not fire before each refresh.
     * @method BeSkill#preload
     * @param {Function} done Callback, first argument is an optional error.
     */
    preload(done: AsyncCallback): void;
    /**
     * Overrideable method for a skill to indicate to Be whether or not it is currently interruptible
     * If a skill is marked as NOT interruptible, skill switching for skills of equal or lower priority
     * will be ignored. Skills of a higher priority will ignore this value and skill switch anyway.
     * If a skill is marked as interruptible, skill switching for skills of any priority will be allowed.
     * NOTE: this assumes a skill's open method has been called. As in, this does not include the time where a skill is pre-loading
     * or in the process of closing.
     * @method BeSkill#isInterruptible
     * @return {boolean} return true is a skill is interruptible. return false otherwise
     *                  By default skills are interruptible
     */
    readonly isInterruptible: boolean;
    /**
     * Open a skill, must override.
     * Don't confuse with the BeSkill static class method `open(lastSkill, nextSkill, results, done)`.
     * @method BeSkill#open
     * @param {Object} [result] launch intent: the parse object from the launch
     * command, usually, but could also be empty or contain launch options from another source
     * @param {boolean} [refresh] Optional flag that denotes we are 'refreshing' the skill (i.e. was opened already)
     * @param {string} [previousSkillName] Optional param which denotes the previous skill name. If there was no previous skill this can be expected to be null
     * @param {Object} [previousSkillOptions] Optional param which denotes the launch options for the  previous skill. If there was no previous skill this can be expected to be null
     */
    open(result?: any, refresh?: boolean, previousSkillName?: string, previousSkillOptions?: any): void;
    /**
     * Trigger a refresh
     * @method BeSkill#refresh
     * @param {Object} [result] Parse object from `jibo.gl`
     */
    refresh(result?: any): void;
    /**
     * Unload a skill, must override
     * @method BeSkill#close
     * @param {Function} done Callback to call when completed.
     * @param {string} pendingSkillName Skill that will be opened when this skill is closed
     */
    close(done: AsyncCallback, pendingSkillName?: string): void;
    /**
     * Exit the application. Called internally when the skill is done.
     * @param {ExitOptions} exitOptions Optional exit options for skill.
     * @method BeSkill#exit
     */
    exit(exitOptions?: ExitOptions): void;
    /**
     * Redirect to another internal Be skill
     * @method BeSkill#redirect
     * @param {String} skillName E.g. "weather"
     * @param {Object} [options] Additional options for redirect
     */
    redirect(skillName: string, options: any): void;
    /**
     * Tracks event data for Design/Product via Segment.
     * See https://mixpanel.com/help/questions/articles/what-data-types-does-mixpanel-accept-as-properties
     * for allowed data types.
     * @method BeSkill#track
     * @param {String} event Name of event
     * @param {Object} [data] Dictionary of additional data.
     */
    track(event: string, data?: any): void;
    /**
     * Destroy this skill.  This should *probably* only be called from the Be superskill.
     * The intent for this method is to un-allocate / restore state change from the skill constructor or skill init sequence
     * @method BeSkill#destroy
     * @param {Function(String)} done Callback to call when completed.  Assumes an argument of a string error parameter or null
     */
    destroy(done: any): void;
}
export default BeSkill;
