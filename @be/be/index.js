(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.bebe = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global,__dirname){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
const jibo_log_1 = require("jibo-log");
const path = require("path");
const be_framework_1 = require("@be/be-framework");
const TimerSpy_1 = require("./TimerSpy");
const jibo_client_framework_1 = require("jibo-client-framework");
const log_1 = require("./log");
const SkillSwitchScheduler_1 = require("./SkillSwitchScheduler");
const SkillLifecycleState_1 = require("./SkillLifecycleState");
const SkillLifecycleEndState_1 = require("./SkillLifecycleEndState");
const SkillSwitchData_1 = require("./SkillSwitchData");
const SkillRedirectToken_1 = require("./SkillRedirectToken");
const SkillLifecycle_1 = require("./SkillLifecycle");
const SkillSwitchUtil_1 = require("./SkillSwitchUtil");
const ModuleVersions_1 = require("./ModuleVersions");
const LibraryAnalytics_1 = require("./LibraryAnalytics");
const DateSetter_1 = require("./DateSetter");
const url = require("url");
jibo.utils.LocationUtils.setLocationLookupKey('Ri2CIo95Sa7dlwft5tQPixUtnPo=');
jibo.utils.LocationUtils.setCapitalLookupKey('LLK5HQ-GJ5AULXWH6');
jibo.utils.Timezone.setLocationLookupKey('Ri2CIo95Sa7dlwft5tQPixUtnPo=');
class Be {
    constructor() {
        global.be = this;
        this.log = log_1.default.createChild("Be");
        this.log.info("%c Welcome to: BE SKILL ", 'font-weight:bold;color:white;padding:5px 20px;background-color:purple;border-radius:20px');
        let splash = document.createElement('div');
        splash.id = 'splash';
        document.body.insertBefore(splash, document.getElementById('face'));
        this.skills = {};
        this.packageInfo = require(path.join(jibo.utils.PathUtils.findRoot(), 'package.json'));
        this.packageInfo.jibo.skills.forEach((id) => {
            try {
                const startTime = Date.now();
                const SkillExport = require(id);
                let Skill;
                if (typeof SkillExport === 'function') {
                    Skill = SkillExport;
                }
                else if (typeof SkillExport.Skill === 'function') {
                    Skill = SkillExport.Skill;
                }
                else {
                    throw new Error(`Error loading skill: ${id}. Incorrect exports`);
                }
                const skill = new Skill({
                    assetPack: id,
                    rootPath: path.dirname(jibo.utils.PathUtils.resolve(id))
                });
                if (!this._validateSkill(skill)) {
                    throw new Error('not a valid BeSkill');
                }
                this.skills[id] = skill;
                this.log.info(`loading - skill construction ${id} - ${Date.now() - startTime} MS`);
            }
            catch (err) {
                this.log.error(`Skill creation for '${id}' failed: ${err}`);
                // TEMP DIAGNOSTIC: surface skill load failures on-screen (no logs needed).
                try {
                    var __eb = document.getElementById('skill-load-errors');
                    if (!__eb) {
                        __eb = document.createElement('div');
                        __eb.id = 'skill-load-errors';
                        __eb.setAttribute('style',
                            'position:fixed;left:0;bottom:0;width:1280px;max-height:360px;z-index:1000001;' +
                            'background:#3a0505;color:#fff;font:18px/1.3 monospace;padding:12px 20px;' +
                            'box-sizing:border-box;white-space:pre-wrap;overflow:auto;');
                        (document.body || document.documentElement).appendChild(__eb);
                    }
                    var __probe = '';
                    try {
                        var __fs = require('fs');
                        var __root = jibo.utils.PathUtils.findRoot();
                        var __nm = path.join(__root, 'node_modules', id);
                        // Scoped packages live at node_modules/@be/doom
                        var __dirOk = false, __pkgOk = false, __mainOk = false;
                        try { __dirOk = __fs.existsSync(__nm); } catch (e) { __dirOk = false; }
                        try { __pkgOk = __fs.existsSync(path.join(__nm, 'package.json')); } catch (e) { __pkgOk = false; }
                        try { __mainOk = __fs.existsSync(path.join(__nm, 'index.js')); } catch (e) { __mainOk = false; }
                        var __siblings = '';
                        try {
                            __siblings = __fs.readdirSync(path.join(__root, 'node_modules', '@be')).join(', ');
                        } catch (e) {
                            __siblings = '(cannot readdir @be: ' + e + ')';
                        }
                        __probe =
                            '\n  beRoot=' + __root +
                            '\n  expectDir=' + __nm +
                            '\n  dirExists=' + __dirOk +
                            ' pkgExists=' + __pkgOk +
                            ' indexExists=' + __mainOk +
                            '\n  @be siblings: ' + __siblings;
                    } catch (probeErr) {
                        __probe = '\n  probe failed: ' + probeErr;
                    }
                    __eb.textContent += 'LOAD FAIL ' + id + ': ' +
                        (err && err.message ? err.message : String(err)) +
                        __probe + '\n\n';
                } catch (e) { /* no-op */ }
            }
        });
        this.idle = this.skills[this.packageInfo.jibo.defaultSkill];
        this.firstSkill = this.skills[this.packageInfo.jibo.firstSkill];
        this.restoreSkill = this.skills[this.packageInfo.jibo.restoreSkill];
        this.eosSkill = this.skills[this.packageInfo.jibo.eosSkill];
        this.log.debug('creating skills switch scheduler');
        this._skillSwitchScheduler = new SkillSwitchScheduler_1.default(this.idle);
        const empty = (done) => { done(); };
        const eosCategories = [];
        for (let id in this.skills) {
            this.log.debug('listening for when skill finishes', id);
            const skill = this.skills[id];
            skill.on('exit', function () {
                this.exit.call(this, skill, ...arguments);
            }.bind(this));
            skill.on('redirect', function () {
                this.skillRedirect.call(this, skill, ...arguments);
            }.bind(this));
            skill.on('refresh', function () {
                this.skillRedirect.call(this, skill, skill.assetPack, ...arguments);
            }.bind(this));
            if (skill.isElementOfSurprise) {
                eosCategories.push(skill);
            }
            if (!skill.postInit) {
                skill.postInit = empty;
            }
            if (!skill.preload) {
                skill.preload = empty;
            }
        }
        this.log.debug('calling supplyCategories');
        this.eosSkill.supplyCategories(eosCategories);
        this.log.debug('bottom of Be constructor');
    }
    init(initDoneCallback) {
        this.initDoneCallback = initDoneCallback;
        ModuleVersions_1.default.log(this.log, jibo.utils.PathUtils.findRoot());
        this.log.debug('Initting jibo');
        jibo.init({ display: 'face', analytics: new LibraryAnalytics_1.default() }, (err) => {
            if (err) {
                this.log.error(err);
                this.initDoneCallback(err);
                return;
            }
            this.log.debug('Jibo initted');
            window.Module = null;
            this.log.debug('loading log config');
            log_1.loadLogConfig(err => {
                if (err) {
                    this.log.warn(err);
                }
                this.log.debug('loaded log config');
                const hostUrl = url.parse(jibo.registryHost);
                jibo_client_framework_1.RegistryClient.createInstance(hostUrl.hostname, parseInt(hostUrl.port));
                this.log.debug('Initializing NotificationsDispatcher');
                jibo_client_framework_1.NotificationsDispatcher.instance.init(err => {
                    if (err) {
                        this.log.warn('Problem initializing; notifications disabled', err);
                    }
                    else {
                        this.log.debug('Calling handleLogLevelNotifications');
                        try {
                            jibo_log_1.Log.handleLogLevelNotifications(jibo_client_framework_1.NotificationsDispatcher.instance);
                            this.log.debug('Done setting up listening for log level notifications');
                        }
                        catch (err) {
                            this.log.warn('Error setting up listening for log level notifications', err);
                        }
                    }
                    if (this.packageInfo.jibo.debug.resourceLeak) {
                        TimerSpy_1.default.instance.init(() => {
                            if (this._skillSwitchScheduler.currentSkillRedirectToken) {
                                return this._skillSwitchScheduler.currentSkillRedirectToken.skillSwitchData.skill.assetPack;
                            }
                            else {
                                return "";
                            }
                        });
                    }
                    this._skillSwitchScheduler.run();
                    this.log.info("Indexing...");
                    jibo.expression.indexRobot().then(() => {
                        this.log.info('initialize the BeSkill.plugins');
                        be_framework_1.BeSkill.init(this.initPlugins.bind(this));
                    }).catch(() => {
                        be_framework_1.BeSkill.errorCode('F4-Index_timeout', 'Initial indexing error in Be: ' + err);
                    });
                });
            });
        });
    }
    initPlugins(err) {
        if (err) {
            this.log.error('Error BeSkill plugins: ', err);
            this.initDoneCallback(err);
            return;
        }
        const tasks = [];
        for (let id in this.skills) {
            const skill = this.skills[id];
            this.log.debug(`About to push task for skill ${id}`);
            tasks.push((done) => {
                const startTime = Date.now();
                this.log.debug(`Calling postInit for skill ${id}`);
                skill.postInit.bind(skill)((err) => {
                    if (err) {
                        this.log.error(`error during skill ${skill.assetPack} postinit call:`, err);
                    }
                    this.log.info(`loading - skill ${skill.assetPack} postinit call - ${Date.now() - startTime} MS`);
                    done();
                });
            });
        }
        this.log.debug('calling jibo loader to load the skills');
        jibo.loader.load(tasks, this.postInit.bind(this));
    }
    initAnalyticsContext() {
        let context = {
            ssm_version: "<not set>",
            be_version: "<not set>",
            platform_version: "<not set>",
            release_version: "<not set>"
        };
        this.log.debug('context', JSON.stringify(context));
        this.log.debug('calling jibo.versions');
        const versions = jibo.versions;
        this.log.debug('got jibo.versions', JSON.stringify(versions));
        if (versions) {
            context.platform_version = versions.platform;
            context.ssm_version = versions.ssm;
            context.release_version = versions.release;
        }
        this.log.debug('getting Be version');
        const dir = jibo.utils.PathUtils.findRoot(__dirname);
        const beVersion = require(path.resolve(dir, 'package.json')).version;
        this.log.debug('got version:', beVersion);
        context.be_version = beVersion;
        this.log.debug('version set on context');
        this.log.debug('setting context on BeSkill');
        this.log.debug(!!be_framework_1.BeSkill);
        this.log.debug(!!be_framework_1.BeSkill.plugins);
        this.log.debug(!!be_framework_1.BeSkill.plugins.analytics);
        this.log.debug(!!be_framework_1.BeSkill.plugins.analytics.context);
        be_framework_1.BeSkill.plugins.analytics.context = context;
        this.log.debug('context set on BeSkill analytics plugin');
    }
    postInit(err) {
        this.log.debug('postInit !!');
        if (err) {
            this.log.error(err);
            this.initDoneCallback(err);
            return;
        }
        this.log.debug('initting alalytics');
        this.initAnalyticsContext();
        this.log.info('Jibo is ready... awaiting launch command.');
        jibo.face.views.changeView({ removeAll: true, leaveEmpty: true }, () => {
            this.selectFirstSkill(this.launchFirstSkill.bind(this));
        });
    }
    selectFirstSkill(callback) {
        const kbm = jibo.kb.createModel('/skills-config');
        kbm.loadRoot((loadRootErr, rootNode) => {
            if (loadRootErr) {
                this.log.warn("error loading /skills-config root", loadRootErr);
            }
            jibo.secureTransferService.hasBackupData((backupErr, hasBackupData) => {
                if (backupErr) {
                    this.log.warn("error when checking if backup data exists", backupErr);
                }
                jibo.errors.getCurrentErrorId((err, currentErrorId) => {
                    if (err) {
                        this.log.warn("error when checking for current error id", err);
                    }
                    let nextSkill = this.idle;
                    let nextSkillLaunchOptions = {};
                    let firstTime = false;
                    if (!loadRootErr) {
                        firstTime = !rootNode.data.hasAlreadyLaunchedFirstContact;
                    }
                    else {
                        this.log.info(`error reading the hasAlreadyLaunchedFirstContact property from the KB.  assuming first time is false`);
                    }
                    this.log.info(`selectFirstSkill parameter readout: Skills config load error: ${loadRootErr}, first time: ${firstTime}, has backup data: ${hasBackupData}, skip restore: ${this.packageInfo.jibo.debug.skipRestore}, current error id: ${currentErrorId}`);
                    if (currentErrorId) {
                        nextSkill = this.skills['@be/settings'];
                        nextSkillLaunchOptions = { nlu: { entities: { errorId: currentErrorId } } };
                    }
                    else if (firstTime) {
                        if (backupErr && !this.packageInfo.jibo.debug.skipRestore) {
                            setTimeout(this.selectFirstSkill.bind(this, callback), 2000);
                            return;
                        }
                        else if (hasBackupData && !this.packageInfo.jibo.debug.skipRestore) {
                            nextSkill = this.restoreSkill;
                        }
                        else {
                            nextSkill = this.firstSkill;
                        }
                    }
                    callback(nextSkill, nextSkillLaunchOptions, currentErrorId, firstTime);
                });
            });
        });
    }
    launchFirstSkill(firstSkill, firstSkillLaunchOptions, firstErrorId, firstTime) {
        this.log.debug('launching first skill');
        const firstSkillHasOpened = () => {
            if (firstErrorId) {
                document.getElementById('splash').style.display = 'none';
            }
            else {
                document.getElementById('splash').remove();
                this.enableSkillSwitching();
            }
            this.initDoneCallback();
        };
        let firstSkillRedirectToken = this.redirect(new SkillSwitchData_1.default(firstSkill, firstSkillLaunchOptions));
        firstSkillRedirectToken.onState(SkillLifecycleState_1.default.SKILL_OPENED, firstSkillHasOpened);
        if (firstErrorId) {
            const onErrorResolved = () => {
                if (firstTime) {
                    document.getElementById('splash').style.display = 'block';
                }
                this.selectFirstSkill((nextSkill, nextSkillLaunchOptions, currentErrorId) => {
                    let nextSkillRedirectToken = this.redirect(new SkillSwitchData_1.default(nextSkill, nextSkillLaunchOptions));
                    if (currentErrorId) {
                        nextSkillRedirectToken.onState(SkillLifecycleState_1.default.LIFECYCLE_ENDED, onErrorResolved);
                        nextSkillRedirectToken.onState(SkillLifecycleState_1.default.SKILL_OPENED, () => {
                            document.getElementById('splash').style.display = 'none';
                        });
                    }
                    else {
                        nextSkillRedirectToken.onState(SkillLifecycleState_1.default.SKILL_OPENED, () => {
                            document.getElementById('splash').remove();
                            this.enableSkillSwitching();
                        });
                    }
                });
            };
            firstSkillRedirectToken.onState(SkillLifecycleState_1.default.LIFECYCLE_ENDED, onErrorResolved);
        }
    }
    enableSkillSwitching() {
        jibo.globalEvents.skillRelaunch.on(data => {
            const skillName = data.match.skillID;
            this.redirect(new SkillSwitchData_1.default(this.skills[skillName], data));
        });
        jibo.action.setSkillSwitchHandler((skillName, skillData) => {
            return new Promise((resolve) => {
                const skill = this.skills[skillName];
                let redirectToken = this.redirect(new SkillSwitchData_1.default(skill, skillData));
                let resolved = false;
                redirectToken.onState(SkillLifecycleState_1.default.SKILL_OPENED, () => {
                    resolved = true;
                    resolve(jibo.action.types.Status.SUCCEEDED);
                });
                redirectToken.onState(SkillLifecycleState_1.default.LIFECYCLE_ENDED, () => {
                    if (!resolved) {
                        this.log.warn(`Skill lifecycle ended before skill was opened: ${redirectToken.skillLifecycleEndState}`);
                    }
                    resolved = true;
                    resolve(jibo.action.types.Status.FAILED);
                });
            });
        });
    }
    get currentSkill() {
        return this._skillSwitchScheduler.currentSkillRedirectToken ? this._skillSwitchScheduler.currentSkillRedirectToken.skillSwitchData.skill : null;
    }
    exit(exitingSkill, exitOptions = {}, done = () => { }) {
        const skipEoS = !!(exitOptions.noElementsOfSurprise || exitOptions.globalNoMatch);
        const currentSkill = this._skillSwitchScheduler.currentSkillRedirectToken ? this._skillSwitchScheduler.currentSkillRedirectToken.skillSwitchData.skill : null;
        if (exitingSkill !== currentSkill) {
            this.log.warn(`Trying to call Be#exit from non-current skill ${exitingSkill}. Current skill is ${currentSkill}`);
            return;
        }
        if (!skipEoS &&
            currentSkill !== this.idle &&
            currentSkill !== this.eosSkill &&
            !currentSkill.isElementOfSurprise &&
            !currentSkill.skipSurprisesExternal) {
            let redirectToken = this.redirect(new SkillSwitchData_1.default(this.eosSkill, { lastSkill: currentSkill.assetPack }));
            redirectToken.addOnSkillLifecycleEnd(done);
        }
        else {
            let redirectToken = this.redirect(new SkillSwitchData_1.default(this.idle, { exitOptions }));
            redirectToken.addOnSkillLifecycleEnd(done);
        }
    }
    skillRedirect(redirectingSkill, name, options) {
        const skill = this.skills[name];
        // TEMP DIAGNOSTIC: surface a redirect to an unregistered/unloaded skill.
        if (!skill) {
            try {
                var __rb = document.getElementById('menu-redirect-banner') ||
                    document.createElement('div');
                __rb.id = 'menu-redirect-banner';
                __rb.setAttribute('style',
                    'position:fixed;left:0;top:0;width:1280px;height:200px;z-index:1000000;' +
                    'background:#3a0505;color:#fff;font:24px/1.35 sans-serif;padding:18px 28px;' +
                    'box-sizing:border-box;white-space:pre-wrap;');
                var __loaded = Object.keys(this.skills).filter(function (k) {
                    return k.indexOf('@be/') === 0;
                }).join(', ');
                __rb.textContent = 'REDIRECT FAILED: skill "' + name + '" is NOT loaded.\n' +
                    'Loaded @be skills: ' + __loaded + '\n' +
                    '(see red box at bottom for load errors, if any)';
                (document.body || document.documentElement).appendChild(__rb);
            } catch (e) { /* no-op */ }
            this.log.error(`skillRedirect: no loaded skill named '${name}'`);
            return;
        }
        const currentSkill = this._skillSwitchScheduler.currentSkillRedirectToken ? this._skillSwitchScheduler.currentSkillRedirectToken.skillSwitchData.skill : null;
        if (redirectingSkill !== currentSkill) {
            try {
                var __mb = document.getElementById('menu-redirect-banner') ||
                    document.createElement('div');
                __mb.id = 'menu-redirect-banner';
                __mb.setAttribute('style',
                    'position:fixed;left:0;top:0;width:1280px;height:200px;z-index:1000000;' +
                    'background:#3a2a05;color:#fff;font:24px/1.35 sans-serif;padding:18px 28px;' +
                    'box-sizing:border-box;white-space:pre-wrap;');
                __mb.textContent = 'REDIRECT RACE: menu tried to redirect to ' + name +
                    '\nbut current skill is already ' +
                    (currentSkill ? currentSkill.assetPack : 'null') +
                    '\n(menu exited to idle before redirect finished)';
                (document.body || document.documentElement).appendChild(__mb);
            } catch (e) { /* no-op */ }
            this.log.warn(`Trying to call Be#redirect from non-current skill ${redirectingSkill.assetPack}. Current skill is ${currentSkill && currentSkill.assetPack}`);
            return;
        }
        if (skill) {
            this.log.info("REDIRECT: skill redirect: ", name, options);
            this.redirect(new SkillSwitchData_1.default(skill, options));
        }
        else {
            this.log.error("REDIRECT: skill redirect failed.  cannot find skill: ", name, options);
        }
    }
    redirect(skillSwitchData) {
        return this._skillSwitchScheduler.requestSkillRedirect(skillSwitchData);
    }
    destroy(callback) {
        if (document.getElementById('splash')) {
            document.getElementById('splash').remove();
        }
        jibo.globalEvents.skillRelaunch.removeAllListeners();
        this._skillSwitchScheduler.destroy()
            .then(() => {
            let destroySkillPromises = [];
            Object.keys(this.skills).forEach((skillId) => {
                let destroySkillPromise = new Promise((resolve, reject) => {
                    try {
                        this.skills[skillId].destroy((err) => {
                            jibo.loader.deleteCache(skillId);
                            if (err) {
                                reject(err);
                            }
                            else {
                                resolve();
                            }
                        });
                    }
                    catch (err) {
                        reject(err);
                    }
                });
                destroySkillPromises.push(destroySkillPromise);
            });
            return Promise.all(destroySkillPromises);
        })
            .catch((err) => {
            this.log.error(err);
        })
            .then(() => {
            callback();
        });
    }
    _validateSkill(skill) {
        let valid = true;
        const proto = Object.getPrototypeOf(skill);
        if (proto.hasOwnProperty('refresh')) {
            valid = false;
            this.log.debug(skill.assetPack, " CANNOT override 'refresh'.");
        }
        if (proto.hasOwnProperty('redirect')) {
            valid = false;
            this.log.debug(skill.assetPack, " CANNOT override 'redirect'.");
        }
        if (!proto.hasOwnProperty('open')) {
            valid = false;
            this.log.debug(skill.assetPack, " MUST override 'open'.");
        }
        if (!proto.hasOwnProperty('close')) {
            valid = false;
            this.log.debug(skill.assetPack, " MUST override 'close'.");
        }
        return valid;
    }
}
Be.BeSkill = be_framework_1.BeSkill;
Be.LibraryAnalytics = LibraryAnalytics_1.default;
Be.SkillSwitchScheduler = SkillSwitchScheduler_1.default;
Be.SkillSwitchUtil = SkillSwitchUtil_1.default;
Be.SkillRedirectToken = SkillRedirectToken_1.default;
Be.SkillLifecycle = SkillLifecycle_1.default;
Be.SkillSwitchData = SkillSwitchData_1.default;
Be.SkillLifecycleState = SkillLifecycleState_1.default;
Be.SkillLifecycleEndState = SkillLifecycleEndState_1.default;
Be.ModuleVersions = ModuleVersions_1.default;
Be.jibo = jibo;
Be.TimerSpy = TimerSpy_1.default;
Be.DateSetter = DateSetter_1.default;
exports.default = Be;
be_framework_1.BeSkill.registerOpenHook((oldSkill, newSkill, result) => {
    return (resolve) => {
        jibo.performance.log('BeSkillOpen', JSON.stringify({ newSkill, oldSkill, result }));
        resolve();
    };
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},"/src")

},{"./DateSetter":2,"./LibraryAnalytics":3,"./ModuleVersions":4,"./SkillLifecycle":5,"./SkillLifecycleEndState":6,"./SkillLifecycleState":7,"./SkillRedirectToken":8,"./SkillSwitchData":9,"./SkillSwitchScheduler":10,"./SkillSwitchUtil":11,"./TimerSpy":12,"./log":14,"@be/be-framework":undefined,"jibo":undefined,"jibo-client-framework":undefined,"jibo-log":undefined,"path":undefined,"url":undefined}],2:[function(require,module,exports){
(function (global){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DateSetter {
    static shiftDate(year, month, day, hours = 12, minutes = 0, seconds = 0) {
        if (month <= 0) {
            console.warn(`${month} found for month, replacing with 1. Fake dates are indexed by 1 on input for usability.`);
            month = 1;
        }
        if (this._origDate) {
            global.Date = this._origDate;
        }
        const OrigDate = global.Date;
        this._origDate = OrigDate;
        const fakeDateArgs = [year, month - 1, day, hours, minutes, seconds];
        const fakeDate = Reflect.construct(OrigDate, fakeDateArgs);
        const fakeDateStartTime = OrigDate.now();
        global.Date = function () {
            if (arguments.length === 0) {
                const updatedFakeDateMs = fakeDate.getTime() + (OrigDate.now() - fakeDateStartTime);
                return Reflect.construct(OrigDate, [updatedFakeDateMs]);
            }
            else {
                return Reflect.construct(OrigDate, arguments);
            }
        };
        global.Date.prototype = OrigDate.prototype;
        global.Date.now = function () {
            const timeSinceFakeDateStart = (OrigDate.now() - fakeDateStartTime);
            return fakeDate.getTime() + timeSinceFakeDateStart;
        };
        global.Date.parse = OrigDate.parse;
        global.Date.UTC = OrigDate.UTC;
        console.log(`Setting up fake Date of: ${fakeDate.toString()}.`);
    }
    static restoreDate() {
        if (this._origDate) {
            global.Date = this._origDate;
            this._origDate = null;
            console.info(`Date Restored to: ${(new Date()).toString()}.`);
        }
        else {
            console.warn('No fake Date to restore.');
        }
    }
}
exports.default = DateSetter;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const be_framework_1 = require("@be/be-framework");
class LibraryAnalytics {
    get currentSkill() {
        const plugin = be_framework_1.BeSkill.plugins.analytics;
        if (plugin) {
            return plugin.currentSkill;
        }
        return 'none';
    }
    set LOG_TO_CONSOLE(value) {
        const plugin = be_framework_1.BeSkill.plugins.analytics;
        if (plugin && plugin._segmentAnalytics) {
            plugin._segmentAnalytics.LOG_TO_CONSOLE = value;
        }
    }
    track(event, data) {
        const plugin = be_framework_1.BeSkill.plugins.analytics;
        if (plugin) {
            plugin.skillEvent(event, data);
        }
    }
    flush() {
        const plugin = be_framework_1.BeSkill.plugins.analytics;
        if (plugin) {
            plugin.flush();
        }
    }
}
exports.default = LibraryAnalytics;

},{"@be/be-framework":undefined}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const jibo = require("jibo");
class ModuleVersions {
    static log(log, beRootDir) {
        const bePackageJson = require(path.resolve(beRootDir, "package.json"));
        let packageInfo = {};
        for (let packageName in bePackageJson.dependencies) {
            try {
                const packageJson = require(path.resolve(beRootDir, "node_modules", packageName, "package.json"));
                packageInfo[packageName] = packageJson.version;
            }
            catch (error) {
                packageInfo[packageName] = "Not Installed? (Hoisted?)";
            }
        }
        if (jibo.runMode !== undefined &&
            jibo.runMode !== jibo.RunMode.UNIT_TESTS) {
            log.info('Skill versions:', packageInfo);
        }
    }
}
exports.default = ModuleVersions;

},{"jibo":undefined,"path":undefined}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SkillLifecycleState_1 = require("./SkillLifecycleState");
const SkillLifecycleEndState_1 = require("./SkillLifecycleEndState");
const log_1 = require("./log");
class SkillLifecycle {
    constructor(skillSwitchData) {
        this._skillSwitchData = skillSwitchData;
        this._onSkillLifecycleStateChangeCallbackSet = new Set();
        this._onSkillLifecycleEndCallbackSet = new Set();
        this._prevSkillLifecycleState = null;
        this._setSkillLifecycleState(SkillLifecycleState_1.default.NONE);
        this._skillLifecycleEndState = SkillLifecycleEndState_1.default.NONE;
        this.log = log_1.default.createChild("SkillLifecycle");
    }
    get skillSwitchData() {
        return this._skillSwitchData;
    }
    get skillLifecycleState() {
        return this._skillLifecycleState;
    }
    get skillLifecycleEndState() {
        return this._skillLifecycleEndState;
    }
    addOnSkillLifecycleStateChange(callback) {
        if (this._onSkillLifecycleStateChangeCallbackSet.has(callback)) {
            return false;
        }
        this._onSkillLifecycleStateChangeCallbackSet.add(callback);
        return true;
    }
    addOnSkillLifecycleEnd(callback) {
        let returnValue = false;
        if (!this._onSkillLifecycleEndCallbackSet.has(callback)) {
            this._onSkillLifecycleEndCallbackSet.add(callback);
            returnValue = true;
        }
        if (this._skillLifecycleState === SkillLifecycleState_1.default.LIFECYCLE_ENDED) {
            this._callOnSkillLifecycleEndCallbacks();
        }
        return returnValue;
    }
    skillSwitchRequested() {
        if (this._skillLifecycleState === SkillLifecycleState_1.default.NONE) {
            this._setSkillLifecycleState(SkillLifecycleState_1.default.SKILL_SWITCH_REQUESTED);
            return true;
        }
        return false;
    }
    skillSwitchPending() {
        if (this._skillLifecycleState === SkillLifecycleState_1.default.SKILL_SWITCH_REQUESTED) {
            this._setSkillLifecycleState(SkillLifecycleState_1.default.SKILL_SWITCH_PENDING);
            return true;
        }
        return false;
    }
    startSkillOpen() {
        if (this._skillLifecycleState === SkillLifecycleState_1.default.SKILL_SWITCH_PENDING) {
            this._setSkillLifecycleState(SkillLifecycleState_1.default.SKILL_START_OPEN);
            return true;
        }
        return false;
    }
    skillOpened() {
        if (this._skillLifecycleState === SkillLifecycleState_1.default.SKILL_START_OPEN) {
            this._setSkillLifecycleState(SkillLifecycleState_1.default.SKILL_OPENED);
            return true;
        }
        return false;
    }
    skillLifecycleEnded(skillLifecycleEndState) {
        if (this._skillLifecycleState === SkillLifecycleState_1.default.LIFECYCLE_ENDED) {
            return false;
        }
        this._skillLifecycleEndState = skillLifecycleEndState;
        this._setSkillLifecycleState(SkillLifecycleState_1.default.LIFECYCLE_ENDED);
        this._callOnSkillLifecycleEndCallbacks();
        return true;
    }
    _setSkillLifecycleState(skillLifecycleState) {
        this._prevSkillLifecycleState = this._skillLifecycleState;
        this._skillLifecycleState = skillLifecycleState;
        if (this._prevSkillLifecycleState !== this._skillLifecycleState) {
            if (this._onSkillLifecycleStateChangeCallbackSet.size > 0) {
                this._onSkillLifecycleStateChangeCallbackSet.forEach((lifecycleStateChangeCallback) => {
                    try {
                        lifecycleStateChangeCallback(this._prevSkillLifecycleState, this._skillLifecycleState);
                    }
                    catch (err) {
                        this.log.error("SkillSwitch: caught exception in onSkillLifecycleStateChange callback", err, lifecycleStateChangeCallback);
                    }
                });
            }
        }
    }
    _callOnSkillLifecycleEndCallbacks() {
        if (this._onSkillLifecycleEndCallbackSet.size > 0) {
            this._onSkillLifecycleEndCallbackSet.forEach((lifecycleEndCallback) => {
                try {
                    lifecycleEndCallback(this._skillLifecycleEndState);
                }
                catch (err) {
                    this.log.error("SkillSwitch: caught exception in onSkillLifecycleEnd callback", err);
                }
            });
        }
    }
}
exports.default = SkillLifecycle;

},{"./SkillLifecycleEndState":6,"./SkillLifecycleState":7,"./log":14}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SkillLifecycleEndState;
(function (SkillLifecycleEndState) {
    SkillLifecycleEndState[SkillLifecycleEndState["NONE"] = 0] = "NONE";
    SkillLifecycleEndState[SkillLifecycleEndState["PENDING_SKILL_SWITCH_INTERRUPTED"] = 1] = "PENDING_SKILL_SWITCH_INTERRUPTED";
    SkillLifecycleEndState[SkillLifecycleEndState["SKILL_SWITCH_REQUEST_DENIED"] = 2] = "SKILL_SWITCH_REQUEST_DENIED";
    SkillLifecycleEndState[SkillLifecycleEndState["SKILL_REFRESH_FAILED"] = 3] = "SKILL_REFRESH_FAILED";
    SkillLifecycleEndState[SkillLifecycleEndState["SKILL_OPEN_FAILED"] = 4] = "SKILL_OPEN_FAILED";
    SkillLifecycleEndState[SkillLifecycleEndState["SKILL_CLOSE_FAILED"] = 5] = "SKILL_CLOSE_FAILED";
    SkillLifecycleEndState[SkillLifecycleEndState["SKILL_EXITED"] = 6] = "SKILL_EXITED";
    SkillLifecycleEndState[SkillLifecycleEndState["SKILL_REFRESHED"] = 7] = "SKILL_REFRESHED";
})(SkillLifecycleEndState || (SkillLifecycleEndState = {}));
;
exports.default = SkillLifecycleEndState;

},{}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SkillLifecycleState;
(function (SkillLifecycleState) {
    SkillLifecycleState[SkillLifecycleState["NONE"] = 0] = "NONE";
    SkillLifecycleState[SkillLifecycleState["SKILL_SWITCH_REQUESTED"] = 1] = "SKILL_SWITCH_REQUESTED";
    SkillLifecycleState[SkillLifecycleState["SKILL_SWITCH_PENDING"] = 2] = "SKILL_SWITCH_PENDING";
    SkillLifecycleState[SkillLifecycleState["SKILL_START_OPEN"] = 4] = "SKILL_START_OPEN";
    SkillLifecycleState[SkillLifecycleState["SKILL_OPENED"] = 5] = "SKILL_OPENED";
    SkillLifecycleState[SkillLifecycleState["LIFECYCLE_ENDED"] = 6] = "LIFECYCLE_ENDED";
})(SkillLifecycleState || (SkillLifecycleState = {}));
;
exports.default = SkillLifecycleState;

},{}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SkillRedirectToken {
    constructor(skillLifecycle, skillSwitchData) {
        this._skillLifecycle = skillLifecycle;
        this._skillSwitchData = skillSwitchData;
    }
    get skillLifecycleState() {
        return this._skillLifecycle.skillLifecycleState;
    }
    get skillLifecycleEndState() {
        return this._skillLifecycle.skillLifecycleEndState;
    }
    get skillSwitchData() {
        return this._skillSwitchData;
    }
    addOnSkillLifecycleStateChange(callback) {
        this._skillLifecycle.addOnSkillLifecycleStateChange((prevLifecycleState, currentLifecycleState) => {
            callback(prevLifecycleState, currentLifecycleState);
        });
    }
    addOnSkillLifecycleEnd(callback) {
        this._skillLifecycle.addOnSkillLifecycleEnd((skillLifecycleEndState) => {
            callback(skillLifecycleEndState);
        });
    }
    onState(lifecycleState, callback) {
        if (this._skillLifecycle.skillLifecycleState >= lifecycleState) {
            callback();
        }
        else {
            this._skillLifecycle.addOnSkillLifecycleStateChange((prevLifecycleState, currentLifecycleState) => {
                if (lifecycleState === currentLifecycleState) {
                    callback();
                }
            });
        }
    }
}
exports.default = SkillRedirectToken;

},{}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SkillSwitchData {
    constructor(skill, options) {
        if (!options) {
            options = {};
        }
        if (!options.asr) {
            options.asr = { text: '', confidence: 1 };
        }
        if (options.nlu && !options.nlu.entities) {
            options.nlu.entities = {};
        }
        this._skill = skill;
        this._options = options;
    }
    get skill() {
        return this._skill;
    }
    get name() {
        return this._skill.assetPack;
    }
    get options() {
        return this._options;
    }
    get priority() {
        if (this.name === "@be/restore") {
            return 7;
        }
        else if (this._options.nlu && this.name === "@be/settings") {
            if (this._options.nlu.intent === "wipe") {
                return 6;
            }
            else if (this._options.nlu.entities.errorId) {
                return 5;
            }
        }
        else if (this.name === "@be/tutorial" || this.name === "@be/first-contact") {
            return 4;
        }
        else if (this._options.nlu && this.name === "@be/clock" && this._options.nlu.intent === "finished" &&
            ((this._options.nlu.entities.domain === "alarm") || (this._options.nlu.entities.domain === "timer"))) {
            return 3;
        }
        else if (this._options.match && this._options.match.isProactive) {
            return 1;
        }
        else if (this.name === "@be/idle") {
            return 0;
        }
        return 2;
    }
}
exports.default = SkillSwitchData;

},{}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
const SkillLifecycle_1 = require("./SkillLifecycle");
const SkillSwitchUtil_1 = require("./SkillSwitchUtil");
const SkillLifecycleEndState_1 = require("./SkillLifecycleEndState");
const SkillRedirectToken_1 = require("./SkillRedirectToken");
const SkillSwitchData_1 = require("./SkillSwitchData");
const TimerSpy_1 = require("./TimerSpy");
const log_1 = require("./log");
class SkillSwitchScheduler {
    constructor(idleSkill) {
        this._idleSkill = idleSkill;
        this._currentSkillLifecycle = null;
        this._currentSkillRedirectToken = null;
        this._pendingSkillLifecycle = null;
        this._pendingSkillRedirectToken = null;
        this._updateTimeout = null;
        this._updateMethod = this._update.bind(this);
        this._updateMethod.isGlobalTimer = true;
        this.log = log_1.default.createChild("SkillSwitchScheduler");
        this._destroyed = false;
    }
    run() {
        this._updateMethod();
    }
    get currentSkillRedirectToken() {
        return this._currentSkillRedirectToken;
    }
    requestSkillRedirect(requestedSkillSwitchData) {
        const requestedSkillName = requestedSkillSwitchData.name;
        const requestedSkillOptions = requestedSkillSwitchData.options;
        this.log.info("requested skill switch", requestedSkillName, requestedSkillOptions);
        let reqestedSkillLifecycle = new SkillLifecycle_1.default(requestedSkillSwitchData);
        let skillRedirectToken = new SkillRedirectToken_1.default(reqestedSkillLifecycle, requestedSkillSwitchData);
        reqestedSkillLifecycle.skillSwitchRequested();
        if (!this._pendingSkillLifecycle && !this._currentSkillLifecycle) {
            this.log.info("no current or pending skill. launching into requested skill");
            this._pendingSkillLifecycle = reqestedSkillLifecycle;
            this._pendingSkillLifecycle.skillSwitchPending();
            this._pendingSkillRedirectToken = skillRedirectToken;
        }
        else if (this._currentSkillLifecycle && !this._pendingSkillLifecycle) {
            if (SkillSwitchUtil_1.default.canSkillSwitch(this._currentSkillLifecycle.skillSwitchData, reqestedSkillLifecycle.skillSwitchData)) {
                this.log.info("no pending skill. interrupting current skill");
                this._pendingSkillLifecycle = reqestedSkillLifecycle;
                this._pendingSkillLifecycle.skillSwitchPending();
                this._pendingSkillRedirectToken = skillRedirectToken;
            }
            else {
                this.log.info("no pending skill. cannot interrupt current skill. denying skill switch request");
                reqestedSkillLifecycle.skillLifecycleEnded(SkillLifecycleEndState_1.default.SKILL_SWITCH_REQUEST_DENIED);
            }
        }
        else if (!this._currentSkillLifecycle && this._pendingSkillLifecycle) {
            if (reqestedSkillLifecycle.skillSwitchData.priority >= this._pendingSkillLifecycle.skillSwitchData.priority) {
                this.log.info("no current skill. requested skill is >= to pending skill priority. switching into requested skill");
                this._pendingSkillLifecycle.skillLifecycleEnded(SkillLifecycleEndState_1.default.PENDING_SKILL_SWITCH_INTERRUPTED);
                this._pendingSkillLifecycle = reqestedSkillLifecycle;
                this._pendingSkillRedirectToken = skillRedirectToken;
                this._pendingSkillLifecycle.skillSwitchPending();
            }
            else {
                this.log.info("no current skill. requested skill is < to pending skill priority. denying skill switch request");
                reqestedSkillLifecycle.skillLifecycleEnded(SkillLifecycleEndState_1.default.SKILL_SWITCH_REQUEST_DENIED);
            }
        }
        else {
            if (reqestedSkillLifecycle.skillSwitchData.priority >= this._pendingSkillLifecycle.skillSwitchData.priority &&
                SkillSwitchUtil_1.default.canSkillSwitch(this._currentSkillLifecycle.skillSwitchData, reqestedSkillLifecycle.skillSwitchData)) {
                this.log.info("current skill and pending skill exist. requested skill is >= priority to pending skill and we can switch from current skill");
                this._pendingSkillLifecycle.skillLifecycleEnded(SkillLifecycleEndState_1.default.PENDING_SKILL_SWITCH_INTERRUPTED);
                this._pendingSkillLifecycle = reqestedSkillLifecycle;
                this._pendingSkillRedirectToken = skillRedirectToken;
                this._pendingSkillLifecycle.skillSwitchPending();
            }
            else {
                this.log.info("current skill and pending skill exist. requested skill switch is either < priority than pending skill or cannot switch into current skill. denying skill switch request");
                reqestedSkillLifecycle.skillLifecycleEnded(SkillLifecycleEndState_1.default.SKILL_SWITCH_REQUEST_DENIED);
            }
        }
        return skillRedirectToken;
    }
    _update() {
        if (!this._pendingSkillLifecycle) {
            this._recallUpdate();
            return;
        }
        let currentSkillName = this._currentSkillLifecycle ? this._currentSkillLifecycle.skillSwitchData.name : null;
        let currentSkillOptions = this._currentSkillLifecycle ? this._currentSkillLifecycle.skillSwitchData.options : null;
        let pendingSkillName = this._pendingSkillLifecycle ? this._pendingSkillLifecycle.skillSwitchData.name : null;
        let pendingSkillOptions = this._pendingSkillLifecycle ? this._pendingSkillLifecycle.skillSwitchData.options : null;
        this.log.info('switching skill', currentSkillName, this._pendingSkillLifecycle.skillSwitchData.name);
        if (this._currentSkillLifecycle && this._currentSkillLifecycle.skillSwitchData.skill === this._pendingSkillLifecycle.skillSwitchData.skill) {
            try {
                this.log.info('refreshing skill', currentSkillName, currentSkillOptions, pendingSkillOptions);
                this._pendingSkillLifecycle.startSkillOpen();
                this._pendingSkillLifecycle.skillSwitchData.skill.open(this._pendingSkillLifecycle.skillSwitchData.options, true, currentSkillName, this._currentSkillLifecycle.skillSwitchData.options);
                this.log.info('refreshing skill success', currentSkillName, currentSkillOptions, pendingSkillOptions);
                this._currentSkillLifecycle.skillLifecycleEnded(SkillLifecycleEndState_1.default.SKILL_REFRESHED);
                this._currentSkillRedirectToken = this._pendingSkillRedirectToken;
                this._currentSkillLifecycle = this._pendingSkillLifecycle;
                this._pendingSkillLifecycle = null;
                this._pendingSkillRedirectToken = null;
                this._currentSkillLifecycle.skillOpened();
            }
            catch (err) {
                this._currentSkillLifecycle.skillLifecycleEnded(SkillLifecycleEndState_1.default.SKILL_REFRESH_FAILED);
                this._pendingSkillLifecycle.skillLifecycleEnded(SkillLifecycleEndState_1.default.SKILL_REFRESH_FAILED);
                this._pendingSkillLifecycle = null;
                this._pendingSkillRedirectToken = null;
                this.log.error('refresh skill failed', currentSkillName, currentSkillOptions, err);
                this.requestSkillRedirect(new SkillSwitchData_1.default(this._idleSkill, {}));
            }
            finally {
                this._recallUpdate();
            }
        }
        else {
            this.log.info('starting close skill', currentSkillName);
            const skillToClose = this._currentSkillLifecycle ? this._currentSkillLifecycle.skillSwitchData.skill : null;
            Promise.resolve()
                .then(() => {
                return SkillSwitchUtil_1.default.closeSkill(skillToClose, pendingSkillName);
            })
                .then(() => {
                this.log.info('ending close skill', currentSkillName);
                if (this._currentSkillLifecycle) {
                    this._currentSkillLifecycle.skillLifecycleEnded(SkillLifecycleEndState_1.default.SKILL_EXITED);
                }
                this.log.info('deferring to action system with pending skill:', pendingSkillName, pendingSkillOptions);
                return Promise.resolve()
                    .then(() => {
                    return this._completeAction();
                })
                    .then((pendingSkillLifecycle) => {
                    if (this._pendingSkillLifecycle !== pendingSkillLifecycle) {
                        this.log.info('the pending skill lifecycle which the action system has completed with is not the same as the current pending skill lifecycle', pendingSkillLifecycle.skillSwitchData.name, pendingSkillLifecycle.skillSwitchData.options, this._pendingSkillLifecycle.skillSwitchData.name, this._pendingSkillLifecycle.skillSwitchData.options);
                    }
                }, (err) => {
                    this.log.warn('action system completed with error. Continuing with skill switching', err);
                })
                    .then(() => {
                    pendingSkillName = this._pendingSkillLifecycle ? this._pendingSkillLifecycle.skillSwitchData.name : null;
                    pendingSkillOptions = this._pendingSkillLifecycle ? this._pendingSkillLifecycle.skillSwitchData.options : null;
                    this.log.info('starting skill open', pendingSkillName, pendingSkillOptions);
                    let prevSkillLifecycle = this._currentSkillLifecycle;
                    this._currentSkillLifecycle = this._pendingSkillLifecycle;
                    this._currentSkillRedirectToken = this._pendingSkillRedirectToken;
                    currentSkillName = this._currentSkillLifecycle ? this._currentSkillLifecycle.skillSwitchData.name : null;
                    currentSkillOptions = this._currentSkillLifecycle ? this._currentSkillLifecycle.skillSwitchData.options : null;
                    this._pendingSkillLifecycle = null;
                    this._pendingSkillRedirectToken = null;
                    pendingSkillName = null;
                    pendingSkillOptions = null;
                    TimerSpy_1.default.instance.getCurrentSkillNameCallback = () => {
                        return this._currentSkillLifecycle.skillSwitchData.skill.assetPack;
                    };
                    this._currentSkillLifecycle.startSkillOpen();
                    return Promise.resolve()
                        .then(() => {
                        return SkillSwitchUtil_1.default.openNewSkill(prevSkillLifecycle, this._currentSkillLifecycle);
                    })
                        .then(() => {
                        this._currentSkillLifecycle.skillOpened();
                        this.log.info('skill open success', currentSkillName, currentSkillOptions);
                    }, (err) => {
                        this.log.error('skill open failed', currentSkillName, currentSkillOptions, err);
                        this.requestSkillRedirect(new SkillSwitchData_1.default(this._idleSkill, {}));
                        this._currentSkillLifecycle.skillLifecycleEnded(SkillLifecycleEndState_1.default.SKILL_OPEN_FAILED);
                    });
                });
            }, (err) => {
                if (this._currentSkillLifecycle) {
                    this._currentSkillLifecycle.skillLifecycleEnded(SkillLifecycleEndState_1.default.SKILL_CLOSE_FAILED);
                    this.log.error('error closing skill', currentSkillName, currentSkillOptions, err);
                }
                else if (this._pendingSkillLifecycle) {
                    this._pendingSkillLifecycle.skillLifecycleEnded(SkillLifecycleEndState_1.default.SKILL_OPEN_FAILED);
                    this.log.error('error closing skill', pendingSkillName, pendingSkillOptions, err);
                }
                else {
                    this.log.error('error closing skill', err);
                }
            })
                .then(() => {
                this._recallUpdate();
            });
        }
    }
    _recallUpdate() {
        if (this._updateTimeout) {
            jibo.timer.clearTimeout(this._updateTimeout);
            this._updateTimeout = null;
        }
        if (!this._destroyed) {
            this._updateTimeout = jibo.timer.setTimeout(this._updateMethod, 10);
        }
    }
    _completeAction() {
        return new Promise((resolve, reject) => {
            let currentPendingSkillLifecycle = null;
            let goal = null;
            let actionSystemGoalInterval = jibo.timer.setInterval(() => {
                if (currentPendingSkillLifecycle !== this._pendingSkillLifecycle) {
                    currentPendingSkillLifecycle = this._pendingSkillLifecycle;
                    if (goal) {
                        goal.events.finished.removeAllListeners();
                    }
                    goal = jibo.action.addBeSkillSwitchGoal({
                        skillName: currentPendingSkillLifecycle.skillSwitchData.name,
                        skillOptions: currentPendingSkillLifecycle.skillSwitchData.options,
                        beSkillPriority: currentPendingSkillLifecycle.skillSwitchData.priority,
                        beSkillPreferences: {
                            cancelOrientOnStart: false
                        }
                    });
                    this.log.info("waiting on action system", currentPendingSkillLifecycle.skillSwitchData.name);
                    goal.events.finished.on((status) => {
                        actionSystemGoalInterval.destroy();
                        if (status === jibo.action.types.GoalFinishedStatus.SUCCEEDED) {
                            this.log.info("action system reported accomplished goal", currentPendingSkillLifecycle.skillSwitchData.name);
                            return resolve(currentPendingSkillLifecycle);
                        }
                        else {
                            return reject(new Error(`action system failed to meet goal '${currentPendingSkillLifecycle.skillSwitchData.name}' with status: ${status}`));
                        }
                    });
                }
            }, 10);
        });
    }
    destroy() {
        this._destroyed = true;
        return Promise.resolve()
            .then(() => {
            if (this._updateTimeout) {
                jibo.timer.clearTimeout(this._updateTimeout);
                this._updateTimeout = null;
            }
            if (this._currentSkillRedirectToken) {
                return SkillSwitchUtil_1.default.closeSkill(this._currentSkillLifecycle.skillSwitchData.skill);
            }
        });
    }
}
exports.default = SkillSwitchScheduler;

},{"./SkillLifecycle":5,"./SkillLifecycleEndState":6,"./SkillRedirectToken":8,"./SkillSwitchData":9,"./SkillSwitchUtil":11,"./TimerSpy":12,"./log":14,"jibo":undefined}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
const path = require("path");
const be_framework_1 = require("@be/be-framework");
const TimerSpy_1 = require("./TimerSpy");
const log_1 = require("./log");
const log = log_1.default.createChild("SkillSwitchUtil");
const packageInfo = require(path.join(jibo.utils.PathUtils.findRoot(), 'package.json'));
const closeSkillTimeoutMS = 5000;
const openSkillTimeoutMS = 5000;
class SkillSwitchUtil {
    static canSkillSwitch(currentSkillSwitchData, newSkillSwitchData) {
        if (currentSkillSwitchData.priority > newSkillSwitchData.priority) {
            if (newSkillSwitchData.options && newSkillSwitchData.options.match && newSkillSwitchData.options.match.isProactive) {
                log.info(`proactive skill switch request denied because current skill ${currentSkillSwitchData.name} has higher priority`);
                return false;
            }
            else {
                return currentSkillSwitchData.skill.isInterruptible;
            }
        }
        else {
            return true;
        }
    }
    static closeSkill(skill, pendingSkillName) {
        let closeTimeout = null;
        return new Promise((resolve, reject) => {
            closeTimeout = setTimeout(() => {
                return reject('skill took too long to close. Force closing.');
            }, closeSkillTimeoutMS);
            if (skill) {
                try {
                    log.info("stopping " + skill.assetPack);
                    skill.skipSurprisesExternal = false;
                    skill.close(resolve, pendingSkillName);
                }
                catch (err) {
                    log.error(err);
                    return reject(err);
                }
            }
            else {
                return resolve();
            }
        })
            .catch((err) => {
            return err;
        })
            .then((err) => {
            clearTimeout(closeTimeout);
            if (err) {
                log.error(`Skill closing failed: ${err}.  Cleaning up cache anyway.`);
                jibo.face.reset();
                jibo.loader.assetManager.cancelAll();
            }
            if (skill) {
                if (jibo.loader.activeCache !== skill.assetPack) {
                    log.error(`While closing skill ${skill.assetPack}, expected active cache to be ${skill.assetPack} but is ${jibo.loader.activeCache}.  Something may have changed the default / active cache while the skill was closing.`);
                }
                if (!packageInfo.jibo.debug.noCacheDestroy) {
                    jibo.loader.deleteCache(skill.assetPack);
                }
                jibo.expression.destroyCaches(skill.assetPack);
            }
            jibo.loader.activeCache = null;
            jibo.embodied.speech.setPaths(null);
            if (packageInfo.jibo.debug.resourceLeak && skill) {
                TimerSpy_1.default.instance.checkSkillCleanup();
            }
            be_framework_1.BeSkill.plugins.analytics.skillExit(pendingSkillName);
        });
    }
    static openNewSkill(currentSkillLifecycle, newSkillLifecycle) {
        const newSkillName = newSkillLifecycle.skillSwitchData.name;
        const newSkillOptions = newSkillLifecycle.skillSwitchData.options;
        let openTimeout = null;
        let oldSkillName = null;
        return new Promise((resolve, reject) => {
            openTimeout = setTimeout(() => {
                return reject('skill took too long to open. Force closing.');
            }, openSkillTimeoutMS);
            oldSkillName = currentSkillLifecycle ? currentSkillLifecycle.skillSwitchData.skill.assetPack : '';
            jibo.loader.basePath = newSkillLifecycle.skillSwitchData.skill.rootPath;
            jibo.sound.basePath = newSkillLifecycle.skillSwitchData.skill.rootPath;
            jibo.loader.addCache(newSkillLifecycle.skillSwitchData.skill.assetPack);
            jibo.loader.activeCache = newSkillLifecycle.skillSwitchData.skill.assetPack;
            jibo.embodied.speech.setPaths(newSkillLifecycle.skillSwitchData.skill.assetPack);
            if (newSkillOptions && newSkillOptions.asr.text) {
                jibo.mim.silentMenus = false;
            }
            try {
                log.info("BeSkill open", oldSkillName, newSkillName, newSkillOptions);
                be_framework_1.BeSkill.open(oldSkillName, newSkillLifecycle.skillSwitchData.skill.assetPack, newSkillOptions, (err) => {
                    try {
                        if (err) {
                            log.error(err);
                        }
                        log.info("new skill preload", newSkillName);
                        newSkillLifecycle.skillSwitchData.skill.preload((err) => {
                            return resolve(err);
                        });
                    }
                    catch (err) {
                        return reject(err);
                    }
                });
            }
            catch (err) {
                return reject(err);
            }
        })
            .catch((err) => {
            return err;
        })
            .then((err) => {
            clearTimeout(openTimeout);
            return new Promise((resolve, reject) => {
                if (err) {
                    return reject(err);
                }
                try {
                    log.info("opening new skill", newSkillName);
                    be_framework_1.BeSkill.plugins.analytics.skillEntry(newSkillName, newSkillOptions, oldSkillName);
                    let currentSkillName = currentSkillLifecycle ? currentSkillLifecycle.skillSwitchData.name : null;
                    let currentSkillOptions = currentSkillLifecycle ? currentSkillLifecycle.skillSwitchData.options : null;
                    newSkillLifecycle.skillSwitchData.skill.skipSurprisesExternal = newSkillOptions && newSkillOptions.match && newSkillOptions.match.skipSurprises;
                    newSkillLifecycle.skillSwitchData.skill.open(newSkillOptions, false, currentSkillName, currentSkillOptions);
                    return resolve(newSkillLifecycle.skillSwitchData);
                }
                catch (err) {
                    return reject(err);
                }
            });
        });
    }
}
SkillSwitchUtil.log = log;
exports.default = SkillSwitchUtil;

},{"./TimerSpy":12,"./log":14,"@be/be-framework":undefined,"jibo":undefined,"path":undefined}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
const log_1 = require("./log");
const log = log_1.default.createChild("TimerSpy");
class TimerSpy {
    static get instance() {
        if (!TimerSpy._instance) {
            TimerSpy._instance = new TimerSpy();
        }
        return TimerSpy._instance;
    }
    constructor() {
        this.log = log;
        this._globalTimerSymbol = Symbol("global");
        this._initRan = false;
    }
    set getCurrentSkillNameCallback(value) {
        this._getCurrentSkillNameCallback = value;
    }
    init(getCurrentSkillNameCallback) {
        this._initRan = true;
        this._getCurrentSkillNameCallback = getCurrentSkillNameCallback;
        this._skillTimers = {};
        this._originalOn = jibo.timer.on.bind(jibo.timer);
        this._originalRemoveListener = jibo.timer.removeListener.bind(jibo.timer);
        this._originalSetTimeout = jibo.timer.setTimeout.bind(jibo.timer);
        this._originalClearTimeout = jibo.timer.clearTimeout.bind(jibo.timer);
        this._originalSetInterval = jibo.timer.setInterval.bind(jibo.timer);
        this._originalClearInterval = jibo.timer.clearInterval.bind(jibo.timer);
        jibo.timer.on = this.onOverride.bind(this);
        jibo.timer.off = jibo.timer.removeListener = this.removeListenerOverride.bind(this);
        jibo.timer.setTimeout = this.setTimeoutOverride.bind(this);
        jibo.timer.clearTimeout = this.clearTimeoutOverride.bind(this);
        jibo.timer.setInterval = this.setIntervalOverride.bind(this);
        jibo.timer.clearInterval = this.clearIntervalOverride.bind(this);
    }
    restore() {
        if (this._initRan) {
            jibo.timer.on = this._originalOn;
            jibo.timer.off = jibo.timer.removeListener = this._originalRemoveListener;
            jibo.timer.setTimeout = this._originalSetTimeout;
            jibo.timer.clearTimeout = this._originalClearTimeout;
            jibo.timer.setInterval = this._originalSetInterval;
            jibo.timer.clearInterval = this._originalClearInterval;
        }
    }
    getCurrentSkillTimers(skillName) {
        if (!this._skillTimers[skillName]) {
            this._skillTimers[skillName] = new Map();
        }
        return this._skillTimers[skillName];
    }
    checkSkillCleanup() {
        let skillTimers = this.getCurrentSkillTimers(this._getCurrentSkillNameCallback());
        if (skillTimers.size !== 0) {
            log.error("The current skill has uncleaned up timers!!", this._getCurrentSkillNameCallback(), skillTimers);
            delete this._skillTimers[this._getCurrentSkillNameCallback()];
        }
        else {
            log.info("The current skill cleaned up all timers", this._getCurrentSkillNameCallback());
        }
    }
    onOverride(event, method) {
        const skillName = method.isGlobalTimer ? this._globalTimerSymbol : this._getCurrentSkillNameCallback();
        let skillTimers = this.getCurrentSkillTimers(skillName);
        let eventMethodSet = null;
        if (!skillTimers.has(event)) {
            eventMethodSet = new Set();
            skillTimers.set(event, eventMethodSet);
        }
        else {
            eventMethodSet = skillTimers.get(event);
        }
        if (eventMethodSet.has(method)) {
            log.error("Found timeout being set from skill: ", skillName, method);
            eventMethodSet.delete(method);
        }
        eventMethodSet.add(method);
        return this._originalOn(event, method);
    }
    removeListenerOverride(event, method) {
        const skillName = method.isGlobalTimer ? this._globalTimerSymbol : this._getCurrentSkillNameCallback();
        let skillTimers = this.getCurrentSkillTimers(skillName);
        let eventMethodSet = skillTimers.get(event);
        if (eventMethodSet) {
            eventMethodSet.delete(method);
            if (eventMethodSet.size === 0) {
                skillTimers.delete(event);
            }
        }
        return this._originalRemoveListener(event, method);
    }
    setTimeoutOverride(callback, delay, useFrames, autoDestroy) {
        const skillName = callback.isGlobalTimer ? this._globalTimerSymbol : this._getCurrentSkillNameCallback();
        let skillTimers = this.getCurrentSkillTimers(skillName);
        if (skillTimers.has(callback)) {
            log.error("Found timeout being set from skill: ", skillName, callback);
            skillTimers.delete(callback);
        }
        let delayedCall = this._originalSetTimeout(callback, delay, useFrames, autoDestroy);
        delayedCall.isGlobalTimer = callback.isGlobalTimer;
        let currentSkillTimers = this.getCurrentSkillTimers(this._getCurrentSkillNameCallback());
        if (callback.isGlobalTimer && currentSkillTimers &&
            currentSkillTimers.get("update") &&
            currentSkillTimers.get("update").has(delayedCall._update)) {
            currentSkillTimers.get("update").delete(delayedCall._update);
            if (currentSkillTimers.get("update").size === 0) {
                currentSkillTimers.delete("update");
            }
        }
        skillTimers.set(delayedCall, callback);
        const originalDestroy = delayedCall.destroy.bind(delayedCall);
        delayedCall.destroy = () => {
            originalDestroy();
            this.clearTimeoutOverride(delayedCall);
        };
        return delayedCall;
    }
    clearTimeoutOverride(delayedCall) {
        const skillName = delayedCall.isGlobalTimer ? this._globalTimerSymbol : this._getCurrentSkillNameCallback();
        let skillTimers = this.getCurrentSkillTimers(skillName);
        if (skillTimers.get(delayedCall)) {
            skillTimers.delete(delayedCall);
            return this._originalClearTimeout(delayedCall);
        }
        return;
    }
    setIntervalOverride(callback, delay, useFrames) {
        const skillName = callback.isGlobalTimer ? this._globalTimerSymbol : this._getCurrentSkillNameCallback();
        let skillTimers = this.getCurrentSkillTimers(skillName);
        if (skillTimers.has(callback)) {
            log.error("Found interval being set from skill: ", skillName, callback);
            skillTimers.delete(callback);
        }
        let delayedCall = this._originalSetInterval(callback, delay, useFrames);
        delayedCall.isGlobalTimer = callback.isGlobalTimer;
        let currentSkillTimers = this.getCurrentSkillTimers(this._getCurrentSkillNameCallback());
        if (callback.isGlobalTimer && currentSkillTimers &&
            currentSkillTimers.get("update") &&
            currentSkillTimers.get("update").has(delayedCall._update)) {
            currentSkillTimers.get("update").delete(delayedCall._update);
            if (currentSkillTimers.get("update").size === 0) {
                currentSkillTimers.delete("update");
            }
        }
        skillTimers.set(delayedCall, callback);
        const originalDestroy = delayedCall.destroy.bind(delayedCall);
        delayedCall.destroy = () => {
            originalDestroy();
            this.clearIntervalOverride(delayedCall);
        };
        return delayedCall;
    }
    clearIntervalOverride(delayedCall) {
        const skillName = delayedCall.isGlobalTimer ? this._globalTimerSymbol : this._getCurrentSkillNameCallback();
        let skillTimers = this.getCurrentSkillTimers(skillName);
        if (skillTimers.get(delayedCall)) {
            skillTimers.delete(delayedCall);
            return this._originalClearInterval(delayedCall);
        }
        return;
    }
    destroy() {
        this._initRan = false;
        this._skillTimers = {};
    }
}
exports.default = TimerSpy;

},{"./log":14,"jibo":undefined}],13:[function(require,module,exports){
"use strict";
const Be_1 = require("./Be");
module.exports = Be_1.default;

},{"./Be":1}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo_log_1 = require("jibo-log");
const jibo = require("jibo");
const fs = require("fs");
const path = require("path");
jibo_log_1.Log.processName = "be";
const log = new jibo_log_1.Log('Be');
exports.default = log;
function loadLogConfig(callback) {
    if (jibo.runMode === jibo.RunMode.ON_ROBOT) {
        jibo.systemManager.getMode((err, mode) => {
            const configPath = path.join(jibo.utils.PathUtils.findRoot(), 'config', `be-${mode}.json`);
            if (fs.existsSync(configPath)) {
                let encounteredError = false;
                try {
                    jibo_log_1.Log.loadConfig(JSON.parse(fs.readFileSync(configPath, 'utf-8')));
                    log.info(`Loaded log configuration from '${configPath}'`);
                }
                catch (err) {
                    encounteredError = true;
                    callback(`Error parsing logging config file '${configPath}': ${err.message}`);
                }
                if (!encounteredError) {
                    callback();
                }
            }
            else {
                callback(`No logging configuration found at '${configPath}'`);
            }
        });
    }
    else {
        jibo_log_1.Log.loadConfig({});
        callback();
    }
}
exports.loadLogConfig = loadLogConfig;

},{"fs":undefined,"jibo":undefined,"jibo-log":undefined,"path":undefined}]},{},[13])(13)
});
//# sourceMappingURL=index.js.map