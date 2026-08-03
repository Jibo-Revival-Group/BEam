(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.beFramework = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const jibo = require("jibo");
const jibo_log_1 = require("jibo-log");
const log_1 = require("./log");
const log = log_1.default.createChild('BeSkill');
// Storing some static properties as global singletons
const _GLOBAL = global;
if (!_GLOBAL._jiboBeSkill) {
    _GLOBAL._jiboBeSkill = {
        plugins: { _deprecated: false },
        openHooks: []
    };
}
/**
 * Base class for skill running inside of Be
 * @class BeSkill
 * @extends EventEmitter
 * @param {Object} [options] Be options for setting up this skill or the assetPack name.
 * @param {String} [options.assetPack=''] Name of the asset pack if running in the context of another skill.
 * @param {String} [options.rootPath=''] The path to this skill's root folder.
 */
class BeSkill extends events_1.EventEmitter {
    constructor(options) {
        super();
        /**
         * Keep track of whether an external factor wants the surprise skill to be skipped.
         * Don't confuse with the noElementsOfSurprise property in ExitOptions which a skill itself can specify.
         * @name BeSkill#skipSurprisesExternal
         * @type {boolean}
         * @public
         */
        this.skipSurprisesExternal = false;
        /**
         * Keep track of whether the skill is interruptible or not
         * @name BeSkill#_isInterruptible
         * @type {boolean}
         * @protected
         */
        this._isInterruptible = true;
        // Backward compatibility where options is assetPack
        if (typeof options === 'string') {
            options = {
                assetPack: options
            };
        }
        // Set default options
        options = Object.assign({
            assetPack: '',
            rootPath: jibo.utils.PathUtils.findRoot()
        }, options || {});
        // Set instance properties
        this.rootPath = options.rootPath;
        this.assetPack = options.assetPack;
        // Initalize the skill's log instance;
        // the log prefix should be assetPack ID
        let logPrefix = this.assetPack;
        if (!logPrefix) {
            // if running stand-alone, then use project name for prefix
            logPrefix = jibo.utils.PathUtils.getProjectName(this.rootPath);
        }
        logPrefix = logPrefix.replace(/^@be\//, '');
        const logParts = logPrefix.split('-');
        logPrefix = logParts.map(part => part.replace(/\w\S*/g, txt => `${txt.charAt(0).toUpperCase()}${txt.substr(1)}`)).join('');
        // new up a log from scratch, since we don't want Framework in the namespace
        this.log = new jibo_log_1.Log(`Be.${logPrefix}`);
        this.log.info("Initializing...");
        // Run in standalone mode
        if (!this.assetPack) {
            // Initialize jibo and the BeSkill plugins
            this.init();
        }
    }
    /**
     * Log an error code
     * @method BeSkill.errorCode
     * @param {String} code The error code
     * @param {String} [message=''] An optional message
     */
    static errorCode(code, message = '') {
        if (!BeSkill._errorCodeLogger) {
            BeSkill._errorCodeLogger = log_1.default.createChild('ErrorCode');
        }
        BeSkill._errorCodeLogger.error(`Code: '${code}', Message: '${message}'`);
    }
    /**
     * Register a plugin
     * @method BeSkill.registerPlugin
     * @param {String} name The name of the property to register
     * @param {Function} plugin The plugin to load
     */
    static registerPlugin(name, plugin) {
        log.debug(`Registering plugin ${name}`);
        this._queuedPlugins.push({ name, plugin });
    }
    /**
     * Register a skill open hook method. Called whenever a skill is being launched.
     * @method BeSkill.registerOpenHook
     * @param {Function} hook The function to call on skill load
     */
    static registerOpenHook(hook) {
        BeSkill.openHooks.push(hook);
    }
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
    static open(lastSkill, nextSkill, results, done) {
        // Gather all installed pre skill launch hooks (See: src/openhooks directory and src/plugins)
        const openHookPr = BeSkill.openHooks.map(hook => {
            return new Promise(hook(lastSkill, nextSkill, results));
        });
        Promise.all(openHookPr).then(() => done()).catch((err) => {
            log.warn(`Error in promise all openhooks`, err);
            done(err);
        });
    }
    /**
     * STATIC Use to statically initialize resources for all BeSkills.
     * Don't confuse with `init()`
     * @method BeSkill.init
     * @param {Function} done Callback when complete
     * @static
     */
    static init(done) {
        let pluginLoadPr = Promise.resolve();
        log.debug('Statically initting BeSkill');
        // We create a chain of plugin promises
        for (let el of BeSkill._queuedPlugins) {
            log.debug('BeSkill plugin', el.name);
            pluginLoadPr = pluginLoadPr
                .then(() => new Promise(el.plugin))
                .then(value => BeSkill.plugins[el.name] = value);
        }
        // Lastly we clear the queue and finish
        pluginLoadPr.then(values => {
            BeSkill._queuedPlugins = [];
            done();
        })
            .catch(done);
    }
    /**
     * Initialize the eye in standalone mode.
     * If you don’t pass in an asset pack, this method will automatically start (call `open`) on your skill.
     * Don't confuse with `init(done)`
     * @method BeSkill#init
     */
    init() {
        jibo.init('face', (err) => {
            if (err) {
                return this.log.error(err);
            }
            // Handle internal exits
            this.on('exit', this.close.bind(this, () => {
                // do nothing
            }));
            BeSkill.init((err) => {
                if (err) {
                    return this.log.error(err);
                }
                // Do a post-init hook
                this.postInit((err) => {
                    if (err) {
                        return this.log.error(err);
                    }
                    // Run any BeSkill open hooks
                    BeSkill.open(null, this.assetPack, {}, (err) => {
                        if (err) {
                            return this.log.error(err);
                        }
                        // Do a pre-open hook
                        this.preload((err) => {
                            if (err) {
                                return this.log.error(err);
                            }
                            // Here we install the two different ways that a skill might be refreshed
                            // 1. By an SSM reload statement
                            // 2. By the action system
                            // This can be important for testing skills that assume they can cause themselves to be refreshed when running in Be
                            jibo.globalEvents.skillRelaunch.on((skillData) => {
                                const skillName = skillData.nlu ? skillData.nlu.skill : '';
                                if (!this.assetPack || (this.assetPack === skillName)) {
                                    this.open(skillData, true);
                                }
                            });
                            jibo.action.setSkillSwitchHandler((skillName, skillData) => {
                                if (!this.assetPack || (this.assetPack === skillName)) {
                                    this.open(skillData, true);
                                    return Promise.resolve(jibo.action.types.Status.SUCCEEDED);
                                }
                                else {
                                    return Promise.resolve(jibo.action.types.Status.FAILED);
                                }
                            });
                            // Handle refresh to the same app
                            this.on('refresh', function () {
                                // we NEED to use an anonymous function here instead of a fat arrow function because fat arrow functions do not bind arguments
                                this.open.call(this, ...arguments, true);
                            }.bind(this));
                            //open with a null opening intent - skills will have to handle that
                            //however they need to, if it is quitting, running a question mim, or
                            //something else
                            this.open(null, false);
                        });
                    });
                });
            });
        });
    }
    /**
     * Overrideable async hook that happens once, upon construction after jibo has initialized.
     * @method BeSkill#postInit
     * @param {Function} done Callback, first argument is an optional error.
     */
    postInit(done) {
        done();
    }
    /**
     * Overrideable async hook that happens everytime before the skill is opened. This does
     * not fire before each refresh.
     * @method BeSkill#preload
     * @param {Function} done Callback, first argument is an optional error.
     */
    preload(done) {
        done();
    }
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
    get isInterruptible() {
        return this._isInterruptible;
    }
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
    open(result, refresh, previousSkillName, previousSkillOptions) {
        this.log.warn('Must override BeSkill.open');
    }
    /**
     * Trigger a refresh
     * @method BeSkill#refresh
     * @param {Object} [result] Parse object from `jibo.gl`
     */
    refresh(result) {
        // Send out the "refresh" event
        this.emit('refresh', result);
    }
    /**
     * Unload a skill, must override
     * @method BeSkill#close
     * @param {Function} done Callback to call when completed.
     * @param {string} pendingSkillName Skill that will be opened when this skill is closed
     */
    close(done, pendingSkillName) {
        this.log.warn('Must override BeSkill.close');
    }
    /**
     * Exit the application. Called internally when the skill is done.
     * @param {ExitOptions} exitOptions Optional exit options for skill.
     * @method BeSkill#exit
     */
    exit(exitOptions) {
        // if a skill is calling exit on itself, the implicit assumption is that it is allowing a lesser
        // priority skill to interrupt it
        this._isInterruptible = true;
        // Done with this
        this.emit('exit', exitOptions);
    }
    /**
     * Redirect to another internal Be skill
     * @method BeSkill#redirect
     * @param {String} skillName E.g. "weather"
     * @param {Object} [options] Additional options for redirect
     */
    redirect(skillName, options) {
        // if a skill is calling redirect on itself, the implicit assumption is that it is allowing a lesser
        // priority skill to interrupt it
        this._isInterruptible = true;
        this.emit('redirect', skillName, options);
    }
    /**
     * Tracks event data for Design/Product via Segment.
     * See https://mixpanel.com/help/questions/articles/what-data-types-does-mixpanel-accept-as-properties
     * for allowed data types.
     * @method BeSkill#track
     * @param {String} event Name of event
     * @param {Object} [data] Dictionary of additional data.
     */
    track(event, data) {
        BeSkill.plugins.analytics.skillEvent(event, data);
    }
    /**
     * Destroy this skill.  This should *probably* only be called from the Be superskill.
     * The intent for this method is to un-allocate / restore state change from the skill constructor or skill init sequence
     * @method BeSkill#destroy
     * @param {Function(String)} done Callback to call when completed.  Assumes an argument of a string error parameter or null
     */
    destroy(done) {
        done(null);
    }
}
/**
 * Current version of the library.
 * @name BeSkill.version
 * @type {String}
 */
BeSkill.version = '11.0.17';
/**
 * The currently installed plugins
 * @name BeSkill.plugins
 * @type {Object}
 */
BeSkill.plugins = _GLOBAL._jiboBeSkill.plugins; // {[id:string]: any} = {};
/**
 * A list of hooks to be called before launching skill
 * @name BeSkill.openHooks
 * @type {Function[]}
 */
BeSkill.openHooks = _GLOBAL._jiboBeSkill.openHooks;
/**
 * The currently registered plugins.
 * @name BeSkill._queuedPlugins
 * @type {Object}
 * @private
 */
BeSkill._queuedPlugins = [];
exports.default = BeSkill;

},{"./log":4,"events":undefined,"jibo":undefined,"jibo-log":undefined}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
function warn(msg) {
    let stack = new Error().stack;
    stack = stack.split('\n').splice(3).join('\n');
    if (console.groupCollapsed) {
        console.groupCollapsed("%cDeprecation Warning: %c%s", "color:#614108;background:#fffbe6", "font-weight:normal;color:#614108;background:#fffbe6", msg);
        console.warn(stack);
        console.groupEnd();
    }
    else {
        console.warn("Deprecation Warning:", msg);
        console.warn(stack);
    }
}
function default_1(plugins) {
    if (plugins._deprecated) {
        return;
    }
    plugins._deprecated = true;
    Object.defineProperties(plugins, {
        identity: {
            get: function () {
                warn("BeSkill.plugins.identity is deprecated. Please use jibo.lps.identity");
                return jibo.lps.identity;
            },
            set: function (value) {
                console.error("Can't set 'identity' plugin");
            }
        },
        animDB: {
            get: function () {
                warn("BeSkill.plugins.animDB is deprecated. Please use jibo.animDB");
                return jibo.animDB;
            },
            set: function (value) {
                console.error("Can't set 'animDB' plugin");
            }
        },
        attention: {
            get: function () {
                warn("BeSkill.plugins.attention is deprecated. Please use jibo.expression");
                return jibo.expression;
            },
            set: function (value) {
                console.error("Can't set 'attention' plugin");
            }
        },
        embodiedDialog: {
            get: function () {
                warn("BeSkill.plugins.embodiedDialog is deprecated. Please use jibo.embodied");
                return jibo.embodied;
            },
            set: function (value) {
                console.error("Can't set 'embodiedDialog' plugin");
            }
        },
        embodiedListen: {
            get: function () {
                warn("BeSkill.plugins.embodiedListen is deprecated. Please use jibo.embodied.listen");
                return jibo.embodied.listen;
            },
            set: function (value) {
                console.error("Can't set 'embodiedListen' plugin");
            }
        },
        embodiedSpeech: {
            get: function () {
                warn("BeSkill.plugins.embodiedSpeech is deprecated. Please use jibo.embodied.speech");
                return jibo.embodied.speech;
            },
            set: function (value) {
                console.error("Can't set 'embodiedSpeech' plugin");
            }
        }
    });
}
exports.default = default_1;

},{"jibo":undefined}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jibo_cai_utils = require("jibo-cai-utils");
exports.jibo_state_machine = require("jibo-state-machine");
exports.jibo_typed_events = require("jibo-typed-events");

},{"jibo-cai-utils":undefined,"jibo-state-machine":undefined,"jibo-typed-events":undefined}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo_log_1 = require("jibo-log");
exports.default = new jibo_log_1.Log('Be.Framework');

},{"jibo-log":undefined}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BeSkill_1 = require("./BeSkill");
exports.BeSkill = BeSkill_1.default;
const libraries = require("./libraries");
exports.libraries = libraries;
// Load the plugins for BeSkill
// Note that these might need to be in a certain order
require('./plugins/onScreenTimer');
require('./plugins/tunable');
require('./plugins/analytics');
require('./plugins/context');
require('./plugins/holiday');
// Load the openhooks for BeSkill
require('./openhooks/embodied');
require('./openhooks/attention');
require('./openhooks/interactionMemory');
/**
 * Utility function mostly for date, time and location.
 * @namespace utils
 */
const utils = require("./utils");
exports.utils = utils;
/**
 * Expose plugins for testing
 * @namespace plugins
 */
const plugins = require("./plugins");
exports.plugins = plugins;

},{"./BeSkill":1,"./libraries":3,"./openhooks/attention":6,"./openhooks/embodied":7,"./openhooks/interactionMemory":8,"./plugins":17,"./plugins/analytics":11,"./plugins/context":13,"./plugins/holiday":16,"./plugins/onScreenTimer":18,"./plugins/tunable":19,"./utils":21}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
const BeSkill_1 = require("../../BeSkill");
BeSkill_1.default.registerOpenHook((oldSkill, newSkill, result) => {
    return (resolve, reject) => {
        return jibo.expression.setAttentionMode(jibo.expression.AttentionMode.ENGAGED)
            .then(resolve)
            .catch(reject);
    };
});

},{"../../BeSkill":1,"jibo":undefined}],7:[function(require,module,exports){
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
const BeSkill_1 = require("../../BeSkill");
const log_1 = require("../../log");
const log = log_1.default.createChild('OpenHook.Embodied');
BeSkill_1.default.registerOpenHook((oldSkill, newSkill, result) => {
    return (resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        try {
            // This catches issues where skills neglect to take EL out of Active mode (UI or OR)
            if (jibo.embodied.listen.getActiveMode() !== null) {
                log.warn(`${oldSkill} neglected to exit Active Listen Mode -- exitting now`);
                yield jibo.embodied.listen.exitActiveMode();
            }
            const timeout = jibo.timer.setTimeout(() => {
                log.warn(`Timed out while waiting for embodied listen to get to its Idle state`);
                resolve();
            }, 2000);
            yield jibo.embodied.listen.waitForIdle(true);
            jibo.timer.clearTimeout(timeout);
            resolve();
        }
        catch (error) {
            reject(error);
        }
    });
});

},{"../../BeSkill":1,"../../log":4,"jibo":undefined}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BeSkill_1 = require("../../BeSkill");
const log_1 = require("../../log");
const log = log_1.default.createChild('OpenHook.InteractionMemory');
const jibo = require('jibo');
const IDLENAME = `@be/idle`; // is there a way to link to that rather than hard-code?
let currentSpeakerIds = undefined;
BeSkill_1.default.registerOpenHook((oldSkill, newSkill, result) => {
    return (resolve, reject) => {
        const storeSpeakerID = () => {
            // clear speakerID
            currentSpeakerIds = undefined;
            // if we're going into a skill, we want to store the speaker IDs as they
            // come in, so we can note them when the skill exits
            if (newSkill !== IDLENAME) {
                // store the current speakerIds, for noting interaction at end of skill
                if (result.speakerId &&
                    result.speakerId.speakers &&
                    result.speakerId.speakers.length > 0 &&
                    result.speakerId.status === "ACCEPTED") {
                    currentSpeakerIds = result.speakerId.speakers.map(s => {
                        // Guards against different versions of speaker object formats
                        let speaker = s.speaker || s.speaker_id;
                        if (!speaker) {
                            throw Error(`Missing speaker ID info`);
                        }
                        return speaker;
                    });
                }
            }
        };
        // if we're leaving a non-idle skill AND we have user information, we want
        // to note the interaction.
        // (We want to note at the end because the use case is measuring time since
        // last interaction--and that measurement happens inside the skill.
        if (oldSkill !== IDLENAME && currentSpeakerIds) {
            // note the interaction event
            const eventDesc = {
                personIDs: currentSpeakerIds,
                skillName: oldSkill
            };
            jibo.im.noteEvent(eventDesc)
                .then(() => {
                storeSpeakerID();
                resolve();
            })
                .catch((e) => {
                log.warn(`Error when noting skill exit event into the InteractionMemory`, e);
                storeSpeakerID();
                resolve();
            });
        }
        else {
            storeSpeakerID();
            resolve();
        }
    };
});

},{"../../BeSkill":1,"../../log":4,"jibo":undefined}],9:[function(require,module,exports){
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
const SegmentAnalytics = require("@jibo/analytics-node");
const conversion = require("./SkillConversion");
const libraries_1 = require("../../libraries");
const prify = libraries_1.jibo_cai_utils.PromiseUtils.promisify;
const EVENTS = {
    SKILL_ENTRY: 'Skill Entry',
    SKILL_EXIT: 'Skill Exit'
};
class Analytics {
    get currentSkill() {
        return this._currentSkill;
    }
    set currentSkill(currentSkill) {
        this._currentSkill = currentSkill;
    }
    /**
     * Create new Analytics
     * @class Analytics
     * @private
     */
    constructor() {
        this._log = jibo.log.createChild('Analytics');
        //overwritten entirely in set context
        this._context = {
            ssm_version: "",
            be_version: "",
            platform_version: "",
            release_version: ""
        };
        this._currentSkill = 'none';
        this._robotName = null;
        this._loopSize = 0;
    }
    /**
     * Initialize Analytics instance
     * @class Analytics
     * @private
     */
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            // default to 'Jibo Robot Skills - dev' key
            let segmentKey = "Iw6EWJHfEfZqZWUstvcmPFBl752zVqTg";
            try {
                const data = yield prify(h => jibo.systemManager.getMode(h));
                if (data && data !== 'int-developer') {
                    // if not in int-developer mode, then use 'Jibo Robot Skills - prod' key
                    segmentKey = "eKTraeQ8jzBijVo5oIP6fvERY616XexN";
                }
            }
            catch (err) {
                this._log.warn('Unable to retreive current mode from the systemManager.');
            }
            if (jibo.runMode === jibo.RunMode.SIMULATOR) {
                this._segmentAnalytics = {
                    LOG_TO_CONSOLE: false,
                    track: function (data) {
                        if (this.LOG_TO_CONSOLE) {
                            console.log('SegmentAnalytics Debugging: tracked ', data);
                        }
                    },
                    identify: function (data) {
                        if (this.LOG_TO_CONSOLE) {
                            console.log('SegmentAnalytics Debugging: identified ', data);
                        }
                    }
                };
            }
            else {
                this._segmentAnalytics = new SegmentAnalytics(segmentKey);
                //prevent analytics module from actually sending data if unit testing
                if ('sinon' in global) {
                    this._segmentAnalytics.queue.push = function () { };
                }
            }
            console.log("Adding segment instance", segmentKey);
        });
    }
    /**
     * Attempts to immediately send all queued analytics events
     * @method Analytics.flush
     * @private
     */
    flush() {
        if (this._segmentAnalytics && this._segmentAnalytics.flush) {
            this._segmentAnalytics.flush();
        }
    }
    /**
     * Attempts to learn and record the robot's serial name.
     * @method Analytics.fetchRobotName
     * @private
     */
    fetchRobotName() {
        return new Promise((resolve) => {
            jibo.systemManager.getIdentity((err, data) => {
                if (data) {
                    this._robotName = data.name;
                }
                resolve();
            });
        });
    }
    /**
     * Listens for loop changes from the KB
     * @method Analytics.listenForLoopChanges
     * @private
     */
    listenForLoopChanges() {
        jibo.kb.loop.events.loopUpdated.on(() => __awaiter(this, void 0, void 0, function* () {
            const loop = yield jibo.kb.loop.loadLoop();
            this._loopSize = loop.reduce((sum, value) => {
                return sum + (value.isJibo ? 0 : 1);
            }, 0);
        }));
    }
    /**
     * Log an analytics event.
     * @method Analytics.logEvent
     * @param {String} event The event id.
     * @param {Object} properties The properties sent to segment.
     * @private
     */
    logEvent(event, properties) {
        //attach robot name to everything
        properties.robot_name = this._robotName;
        properties.loop_size = this._loopSize;
        const currentSpeaker = jibo.lps.identity.getActiveSpeaker();
        this._log.debug(`Analytics: current user ID is ${currentSpeaker ? currentSpeaker.idInfo.id : 'UNIDENTIFIED'}`);
        if (this._segmentAnalytics) {
            let data = {
                userId: currentSpeaker ? currentSpeaker.idInfo.id : 'UNIDENTIFIED',
                event: event,
                properties: properties,
                context: this._context,
                timestamp: new Date()
            };
            this._segmentAnalytics.track(data);
            this._log.debug(data);
        }
        else {
            throw new Error('Analytics: logEvent requires a valid segmentAnalytics instance.');
        }
    }
    /**
     * A convenience method used whenever an event occurs within a skill.
     * @method Analytics.skillAction
     * @param {string} event The name of the event.
     * @param {string} skill The name of the active skill.
     * @param {Object} properties An object containing any relevant properties.
     */
    skillEvent(event, properties = {}) {
        //attach current skill to all skill events
        properties.skill_name = this._currentSkill;
        //attach hour in 24 hour time to all skill events - can't get it in local time otherwise
        properties.event_hour = new Date().getHours();
        //a couple events are defined to use last_skill - we should standardize the skill names for that
        if (properties.last_skill) {
            properties.last_skill = conversion.renameSkill(properties.last_skill);
        }
        if (properties.next_skill) {
            properties.next_skill = conversion.renameSkill(properties.next_skill);
        }
        this.logEvent(event, properties);
    }
    /**
     * Set the analytics context.
     * @name Analytics.context
     * @type {AnalyticsContext}
     * @private
     */
    set context(context) {
        this._context = context;
    }
    /**
     * Sends a skill entry event and stores the skill name to attach to skill events.
     * @method Analytics.skillEntry
     * @param {string} skillName The name of the now-current skill
     * @param {any} launchData Launch data, like NLU parse results
     * @param {string} oldSkillName The name of the previous skill
     * @private
     */
    skillEntry(skillName, launchData, oldSkillName) {
        //remove @be/ for better readability
        this._currentSkill = skillName.replace('@be/', '');
        //some skills get different names
        this._currentSkill = conversion.SkillRename[this._currentSkill] || this._currentSkill;
        let data = {
            initial_intent: conversion.IntentDefaults[this._currentSkill] || 'n/a',
            domain: '',
            was_hey_jibo_launch: false,
            user_initiated: false,
            last_skill: oldSkillName,
        };
        // Nimbus is just a mouthpiece for Cloud Skills, don't add an Entry event for it.
        if (this._currentSkill === 'nimbus') {
            return;
        }
        //skill was almost definitely user initiated if we have Input from ASR or came from
        //or is the main menu. Also catch that one case where Gallery redirects to Create
        if (skillName === 'main-menu' || oldSkillName === 'main-menu' ||
            (launchData && launchData.asr.text) ||
            (skillName === 'photos' && oldSkillName === 'gallery')) {
            data.user_initiated = true;
        }
        //if we have Input from ASR, pretty safe bet it was a HJ launch, with no known false
        //positives or misses
        if (launchData && launchData.asr && launchData.asr.text) {
            data.was_hey_jibo_launch = true;
        }
        //if we can get launch info from the NLU parse data
        if (launchData && launchData.nlu) {
            const parse = launchData.nlu;
            if (parse.errorId) {
                //handle error skill (which is actually settings)
                data.initial_intent = 'error: ' + parse.errorId;
            }
            else if (parse.intent) {
                data.initial_intent = conversion.getIntent(this._currentSkill, launchData, oldSkillName);
            }
            if (parse.domain) {
                data.domain = parse.domain;
            }
        }
        this.skillEvent(EVENTS.SKILL_ENTRY, data);
    }
    /**
     * Sends a skill exit event and clears the stored skill name.
     * @method Analytics.skillExit
     * @private
     */
    skillExit(newSkillName) {
        let data = {
            next_skill: newSkillName,
        };
        if (this._currentSkill === 'none' || this._currentSkill === 'nimbus') {
            return;
        }
        this.skillEvent(EVENTS.SKILL_EXIT, data);
        this._currentSkill = 'none';
    }
}
exports.default = Analytics;

},{"../../libraries":3,"./SkillConversion":10,"@jibo/analytics-node":undefined,"jibo":undefined}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkillRename = {
    'tutorial': 'bot-basics',
    'friendly-tips': 'what-can-you-do',
    'create': 'photos'
};
exports.IntentDefaults = {
    'idle': 'Jibo independently returns to idle',
    'surprises': 'n/a',
    'surprises-date': 'n/a',
    'surprises-ota': 'n/a',
    'first-contact': 'n/a',
    'main-menu': 'main_menu',
    'restore': 'n/a',
    'bot-basics': 'from_fc'
};
exports.IntentRename = {
    'chitchat': {
        'scripted': 'scripted_response',
        'gqa': 'gqa_response',
        'emotionQuery': 'general_emo_question',
        'specificEmotionQuery': 'specific_emo_question'
    },
    'circuit-saver': {
        'launchGame': 'circuit-saver',
        'menu': 'circuit-saver'
    },
    'clock': {
        'askForTime': 'request_time',
        'askForDay': 'request_day',
        'askForDate': 'request_date',
        'whenIsHoliday': 'when_is_holiday',
        'whenIsBirthday': 'when_is_birthday'
    },
    'photos': {
        'createOnePhoto': 'take_picture',
        'createSomePhotos': 'take_photobooth'
    },
    'what-can-you-do': {
        'whatCanIDo': 'what_can_you_do_neutral',
        'frustrated': 'what_can_you_do_frustrated'
    },
    'gallery': {
        'galleryOpen': 'open_gallery'
    },
    'greetings': {
        'whatsUp': 'whats_up',
        'goodMorning': 'good_morning',
        'goodAfternoon': 'good afternoon',
        'goodEvening': 'good_evening',
        'goodNight': 'good_night',
        'goodBye': 'good_bye',
        'imHome': 'im_home',
        'imBack': 'im_back',
        'selfId': 'im_so_and_so'
    },
    'settings': {
        'battery': 'battery',
        'volumeQuery': 'volume',
        'wifiStatus': 'wifi_status',
        'wifiAddNetwork': 'add_wifi_netowrk',
        'wifiRemoveNetwork': 'remove_wif_network',
        'menu': 'settings'
    },
    'bot-basics': {
        'tutorialOpen': 'bot-basics',
        'menu': 'bot-basics'
    },
    'introductions': {
        'enrollment': 'introductions',
        'menu': 'introductions'
    }
};
function renameSkill(skillName) {
    //remove @be/ for better readability
    skillName = skillName.replace('@be/', '');
    //some skills get different names
    skillName = exports.SkillRename[skillName] || skillName;
    return skillName;
}
exports.renameSkill = renameSkill;
function getIntent(skill, launchData, prevSkill) {
    let intent = null;
    let domain = null;
    if (launchData && launchData.nlu) {
        intent = launchData.nlu.intent;
        domain = launchData.nlu.entities.domain;
    }
    if (skill === 'clock' && (domain === 'alarm' || domain === 'timer')) {
        return intent + '_' + domain;
    }
    if (skill === 'main-menu') {
        if (prevSkill === 'idle' || (launchData && launchData.asr.text)) {
            return 'main_menu_opened';
        }
        else {
            return 'returned_to_main_menu';
        }
    }
    if (exports.IntentRename[skill]) {
        return exports.IntentRename[skill][intent] || intent;
    }
    return intent;
}
exports.getIntent = getIntent;

},{}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BeSkill_1 = require("../../BeSkill");
const Analytics_1 = require("./Analytics");
/*
 * Provides an interface to the analytics (segment) api.
 */
BeSkill_1.default.registerPlugin('analytics', (resolve, reject) => {
    let analytics = new Analytics_1.default();
    analytics.init()
        .then(() => {
        return analytics.fetchRobotName();
    })
        .then(() => {
        //do power on event
        analytics.skillEvent('Power On');
        //make sure loop size is kept up to date
        analytics.listenForLoopChanges();
    })
        .then(() => {
        return analytics;
    });
    resolve(analytics);
});

},{"../../BeSkill":1,"./Analytics":9}],12:[function(require,module,exports){
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
const jibo_service_framework_1 = require("jibo-service-framework");
class SingletonEnforcer {
}
exports.SingletonEnforcer = SingletonEnforcer;
/**
 * @description
 * Service endpoint which exposes on-robot context data to those outside Be.
 *
 * @class ContextService
 * @extends HTTPService
 */
class ContextService extends jibo_service_framework_1.HTTPService {
    static createInstance(options, rootDir) {
        return new ContextService(new SingletonEnforcer(), options, rootDir);
    }
    static get instance() {
        return ContextService._instance;
    }
    constructor(enforcer, options, rootDir) {
        super('context', options, rootDir);
        if (ContextService._instance) {
            throw new Error('ContextService is a singleton');
        }
        ContextService._instance = this;
    }
    routes(url) {
        super.routes(url);
        url.post('/context', (req, res) => __awaiter(this, void 0, void 0, function* () {
            this.getContext(req, res);
        }));
    }
    getContext(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let speakers = null;
            let omitLoop = false;
            const params = req.body;
            try {
                if (params) {
                    const valid = ((params instanceof Object) && !Array.isArray(params));
                    if (!valid) {
                        return this.sendJson(res, { error: `Supplied parameters are malformed.` }, 500);
                    }
                    if (params.hasOwnProperty('speakers')) {
                        if (Array.isArray(params.speakers.accepted)) {
                            speakers = params.speakers;
                        }
                        else {
                            return this.sendJson(res, { error: `Supplied 'speakers' parameter is invalid.` }, 500);
                        }
                    }
                    if (params.hasOwnProperty('omitLoop')) {
                        if (typeof params.omitLoop === 'boolean') {
                            omitLoop = params.omitLoop;
                        }
                        else {
                            return this.sendJson(res, { error: `Supplied 'omitLoop' parameter is invalid.` }, 500);
                        }
                    }
                }
            }
            catch (e) {
                return this.sendJson(res, { error: `Unable to process supplied parameters: ${e.message}` }, 500);
            }
            try {
                const data = yield jibo.context.getContext(speakers, omitLoop);
                this.sendJson(res, data);
            }
            catch (err) {
                this.sendJson(res, {
                    error: `Unable to retrieve robot context: ${err.message}`
                }, 500);
            }
        });
    }
}
exports.ContextService = ContextService;

},{"jibo":undefined,"jibo-service-framework":undefined}],13:[function(require,module,exports){
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
const BeSkill_1 = require("../../BeSkill");
const ContextService_1 = require("./ContextService");
const log_1 = require("../../log");
const log = log_1.default.createChild('ContextServiceBeSkillPlugin');
const prify = jibo_cai_utils_1.PromiseUtils.promisify;
/*
 * Registers service endpoint which exposes on-robot context data to those outside Be.
 */
BeSkill_1.default.registerPlugin('context', (resolve, reject) => __awaiter(this, void 0, void 0, function* () {
    const port = (jibo.runMode === jibo.RunMode.ON_ROBOT) ? 8588 : 0;
    const contextService = ContextService_1.ContextService.createInstance({ port: port, register: true });
    try {
        yield prify(h => contextService.init(h));
        log.info(`Successfully initialized ContextService`);
        resolve(ContextService_1.ContextService.instance);
    }
    catch (err) {
        log.error(`Could not initialize ContextService`);
        reject(err);
    }
}));

},{"../../BeSkill":1,"../../log":4,"./ContextService":12,"jibo":undefined,"jibo-cai-utils":undefined}],14:[function(require,module,exports){
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
const HolidayNode_1 = require("./HolidayNode");
const log_1 = require("../../log");
const log = log_1.default.createChild('HolidayBeSkillPlugin-Holiday');
class Holiday {
    /**
     * Sets up the jibo server client
     */
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.holidayModel = jibo.kb.createModel('/jibo/holidays');
            // Ask KB to automatically transform json data into appropriate class
            jibo.kb.registerNodeClass('holiday', HolidayNode_1.HolidayNode, 'jibo/holidays');
        });
    }
    /**
     * Fetches the holiday list
     * @return {Promise<HolidayNode[]|null>}
     */
    fetchHolidayList() {
        return __awaiter(this, void 0, void 0, function* () {
            let holidayList;
            try {
                const holidayRootNode = yield this.holidayModel.loadRoot();
                const holidayIds = holidayRootNode.getEdges('holiday');
                holidayList = (yield this.holidayModel.load(holidayIds));
            }
            catch (err) {
                log.warn(`Error fetching holiday data from KB, returning null.`);
                return null;
            }
            if (!holidayList || !holidayList.length) {
                log.warn(`KB returned no holiday list.`);
                return null;
            }
            return holidayList;
        });
    }
    /**
     * Go through the list of holidays and pick out the user-enabled non-birthday days.
     * @param {HolidayNode} holidays list of holidays
     * @return {string[]} list of enabled holiday names
     */
    filterEnabledHolidayNames(holidays) {
        const enabledHolidays = holidays.filter((holiday) => {
            return (holiday.category !== 'birthday' && holiday.isEnabled);
        }).map((holiday) => {
            return holiday.name;
        });
        return enabledHolidays;
    }
    /**
     * Fill a Set with the users active holidays to use in MiMs
     * @return {Set<string>} set of active holidays.
     */
    getActiveHolidaySet() {
        return __awaiter(this, void 0, void 0, function* () {
            const holidays = yield this.fetchHolidayList();
            const activeHolidays = new Set();
            if (!holidays) {
                log.warn("No active holiday data.");
            }
            else {
                // put the holidays into a set for easy access in mims
                this.filterEnabledHolidayNames(holidays).forEach((holidayName) => {
                    activeHolidays.add(holidayName);
                });
            }
            return activeHolidays;
        });
    }
    /**
     * Go through a list of holidays and pick out the names of holidays for a particular date
     * @param {Date} filterDate the date for which to filter holidays
     * @param {boolean} onlyEnabledHolidays whether to only include enabled holidays
     * @return {string[]} list of todays holiday names
     */
    filterHolidayNamesByDate(filterDate, onlyEnabledHolidays) {
        return __awaiter(this, void 0, void 0, function* () {
            let todaysHolidayNames = [];
            const holidays = yield this.fetchHolidayList();
            if (!holidays) {
                return todaysHolidayNames;
            }
            // filter out enabled holidays that occur today
            let daysHolidays = holidays.filter(function (holiday) {
                if (holiday.category !== 'birthday' && holiday.isOnDate(filterDate)) {
                    return !onlyEnabledHolidays || holiday.isEnabled;
                }
            });
            // pull out the holidays names
            return daysHolidays.map((holiday) => {
                return holiday.name;
            });
        });
    }
}
exports.default = Holiday;

},{"../../log":4,"./HolidayNode":15,"jibo":undefined}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
const libraries_1 = require("../../libraries");
const TimeUtils = libraries_1.jibo_cai_utils.TimeUtils;
class HolidayNode extends jibo.kb.Node {
    //provided to make things a little easier
    /**
     * UUID of the holiday.
     * @type {String}
     */
    get id() {
        return this._id;
    }
    /**
     * Date of the holiday
     * @type {String}
     */
    get date() {
        return this.data.date;
    }
    /**
     * End date of the holiday
     */
    get endDate() {
        return this.data.endDate;
    }
    /**
     * Name of the holiday
     * @type {String}
     */
    get name() {
        return this.data.name;
    }
    /**
     * Whether members have enabled this holiday
     * @type {String}
     */
    get isEnabled() {
        return this.data.isEnabled;
    }
    /**
     * The category of the holiday (e.g., birthday, national)
     * @type {String}
     */
    get category() {
        return this.data.category;
    }
    /**
     * @return {String} The loop member's preferred spoken name.
     */
    toString() {
        return `${this.data.name}: ${this.data.date}`;
    }
    /**
     * Check whether the holiday is on the passed in date
     * @param {Date} date to check
     * @return {boolean} indicates whether holiday is on the passed in date
     */
    isOnDate(date) {
        const startDate = TimeUtils.dateFromString(this.data.date);
        const endDate = TimeUtils.dateFromString(this.data.endDate);
        return TimeUtils.dateWithinInterval(startDate, date, endDate);
    }
}
exports.HolidayNode = HolidayNode;

},{"../../libraries":3,"jibo":undefined}],16:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const BeSkill_1 = require("../../BeSkill");
const Holiday_1 = require("./Holiday");
__export(require("./HolidayNode"));
/*
 * Provides an interface to holiday data for all skills.
 */
BeSkill_1.default.registerPlugin('holiday', (resolve, reject) => {
    const holiday = new Holiday_1.default();
    holiday.init()
        .then(() => resolve(holiday))
        .catch((error) => reject(error));
});

},{"../../BeSkill":1,"./Holiday":14,"./HolidayNode":15}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const holiday = require("./holiday");
exports.holiday = holiday;

},{"./holiday":16}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BeSkill_1 = require("../../BeSkill");
const PackageUtils_1 = require("../../utils/PackageUtils");
const jibo = require("jibo");
/**
 * Class for the on-screen timer.
 * @class Timer
 */
class Timer {
    constructor() {
        this._updateBind = this.update.bind(this);
        this._running = false;
        this._text = new PIXI.Text('', {
            fontFamily: 'Lucida Grande',
            fontSize: 80,
            fontWeight: 'bold',
            fill: '#AA0404',
            align: 'right'
        });
    }
    /**
     * `true` if timer is running.
     * @method Timer.isRunning
     * @type {boolean}
     */
    isRunning() {
        return this._running;
    }
    /**
     * Start the timer.
     * @method Timer.start
     */
    start() {
        if (!this._running) {
            this._running = true;
            jibo.timer.on('update', this._updateBind);
            jibo.face.stage.addChild(this._text);
        }
    }
    /**
     * Stop the timer.
     * @method Timer.stop
     */
    stop() {
        if (this._running) {
            this._running = false;
            jibo.timer.removeListener('update', this._updateBind);
            jibo.face.stage.removeChild(this._text);
        }
    }
    /**
     * Update the timer.
     * @method Timer.update
     * @param delta {number}
     */
    update(delta) {
        let date = new Date(Date.now());
        let formattedDate = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}:${date.getMilliseconds()}`;
        this._text.text = formattedDate;
    }
}
BeSkill_1.default.registerPlugin('onScreenTimer', (resolve, reject) => {
    try {
        const timer = new Timer();
        if (PackageUtils_1.default.debugMode('showTimer')) {
            timer.start();
        }
        resolve(timer);
    }
    catch (error) {
        reject(`Error when loading OnScreenTimer plugin: ${error}`);
    }
});

},{"../../BeSkill":1,"../../utils/PackageUtils":20,"jibo":undefined}],19:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BeSkill_1 = require("../../BeSkill");
const PackageUtils_1 = require("../../utils/PackageUtils");
const jibo = require("jibo");
let tunable = null;
try {
    tunable = require('jibo-tunable');
}
catch (e) {
    // No tunable library found, disabling debug
}
function isSuccessResult(result) {
    return result.hasOwnProperty('result');
}
if (tunable) {
    const Tunable = tunable.Tunable;
    BeSkill_1.default.registerPlugin('tunable', (resolve, reject) => {
        // If `jibo.debug.asr === true`
        if (PackageUtils_1.default.debugMode('asr')) {
            console.log(`ASR: In debug mode`);
            const lhData = Tunable.getStringField('Last heard (data)', '', 'Be Debug');
            const lhTimestamp = Tunable.getStringField('Last heard (timestamp)', '', 'Be Debug');
            jibo.jetstream.events.globalTurnResult.on(data => {
                if (data.status === jibo.jetstream.types.TurnResultType.SUCCEEDED) {
                    lhData.current = data.result.asr.text;
                    lhTimestamp.current = new Date().toTimeString();
                    console.log(`Received cloud response: `, data);
                }
            });
            jibo.jetstream.events.localTurnResult.on(data => {
                if (data.status === jibo.jetstream.types.TurnResultType.SUCCEEDED && isSuccessResult(data)) {
                    lhData.current = data.result.asr.text;
                    lhTimestamp.current = new Date().toTimeString();
                    console.log(`Received cloud response: `, data);
                }
            });
        }
        resolve(Tunable);
    });
}

},{"../../BeSkill":1,"../../utils/PackageUtils":20,"jibo":undefined,"jibo-tunable":undefined}],20:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const pack = require(path.join(process.cwd(), 'package.json'));
/**
 * @class PackageUtils
 * @memberof utils
 */
class PackageUtils {
    /**
     * Checks wheather `jibo.debug[.namespace]` in `package.json` is set to `true`.
     * If no namespace is provided and `jibo.debug: true` then return `true`;
     * If no namespace is provided and `jibo.debug: {}` is object then return `false`;
     * @method utils.PackageUtils.debugMode
     * @param {string} [debugNamespace] Namespace to debug.
     * @returns {boolean} `true` if `jibo.debug[.namespace]` in `package.json` is `true`.
     */
    static debugMode(debugNamespace) {
        return PackageUtils._debugMode(pack, debugNamespace);
    }
    /**
     * Checks wheather `jibo.debug[.namespace]` in `package.json` is set to `true`.
     * If no namespace is provided and `jibo.debug: true` then return `true`;
     * If no namespace is provided and `jibo.debug: {}` is object then return `false`;
     * @method utils.PackageUtils._debugMode
     * @param {object} packageObj `package.json` object.
     * @param {string} [debugNamespace] Namespace to debug.
     * @returns {boolean} `true` if `jibo.debug[.namespace]` in `package.json` is `true`.
     */
    static _debugMode(packageObj, debugNamespace) {
        if (packageObj.jibo) {
            const debug = packageObj.jibo.debug;
            if (!debug) {
                return false;
            }
            else if (typeof debug === 'boolean') {
                return debug;
            }
            else if (typeof debug === 'string') {
                return (debug.toLowerCase() === 'true');
            }
            else if (typeof packageObj.jibo === 'object') {
                if (!debugNamespace) {
                    return true;
                }
                else if (debug[debugNamespace]) {
                    if (typeof debug[debugNamespace] === 'boolean') {
                        return debug[debugNamespace];
                    }
                    else if (typeof debug[debugNamespace] === 'string') {
                        return (debug[debugNamespace].toLowerCase() === 'true');
                    }
                }
                else {
                    return false;
                }
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }
    }
}
exports.default = PackageUtils;

},{"path":undefined}],21:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
var Location = jibo.utils.Location;
exports.Location = Location;
var DateTime = jibo.utils.DateTime;
exports.DateTime = DateTime;
var DateTimeUtils = jibo.utils.DateTimeUtils;
exports.DateTimeUtils = DateTimeUtils;
var Timezone = jibo.utils.Timezone;
exports.Timezone = Timezone;
var PackageUtils_1 = require("./PackageUtils");
exports.PackageUtils = PackageUtils_1.default;

},{"./PackageUtils":20,"jibo":undefined}],22:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const deprecation_1 = require("./deprecation");
// Splitting up index.ts and main.ts for dts reasons
// This way only index points to the above references
// but the dts for this module points to main
let utils = require('./main');
deprecation_1.default(utils.BeSkill.plugins);
module.exports = utils;

},{"./deprecation":2,"./main":5}]},{},[22])(22)
});

//# sourceMappingURL=be-framework.js.map
