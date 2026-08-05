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
            }
        });
        this.idle = this.skills[this.packageInfo.jibo.defaultSkill];
        this.firstSkill = this.skills[this.packageInfo.jibo.firstSkill];
        this.restoreSkill = this.skills[this.packageInfo.jibo.restoreSkill];
        this.eosSkill = this.skills[this.packageInfo.jibo.eosSkill];
        this._coreSkillsMissing = false;
        if (!this.idle) {
            this.log.error(`Core skill missing: defaultSkill '${this.packageInfo.jibo.defaultSkill}' failed to load`);
            this._coreSkillsMissing = true;
        }
        if (!this.eosSkill) {
            this.log.error(`Core skill missing: eosSkill '${this.packageInfo.jibo.eosSkill}' failed to load`);
            this._coreSkillsMissing = true;
        }
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
        if (this.eosSkill && typeof this.eosSkill.supplyCategories === 'function') {
            this.log.debug('calling supplyCategories');
            this.eosSkill.supplyCategories(eosCategories);
        }
        this.log.debug('bottom of Be constructor');
    }
    init(initDoneCallback) {
        this.initDoneCallback = initDoneCallback;
        if (this._coreSkillsMissing) {
            const err = new Error('Be cannot start: required core skills failed to load');
            this.log.error(err.message);
            this.initDoneCallback(err);
            return;
        }
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
                    // Index in the background — do not gate plugin init / splash on it.
                    let indexingSettled = false;
                    jibo.expression.indexRobot()
                        .then(() => {
                            indexingSettled = true;
                            this.log.info('Indexing completed successfully');
                        })
                        .catch((err) => {
                            indexingSettled = true;
                            this.log.warn('Indexing failed, continuing anyway:', err && err.message);
                            be_framework_1.BeSkill.errorCode('F4-Index_timeout', 'Initial indexing error in Be: ' + (err && err.message));
                        });
                    setTimeout(() => {
                        if (!indexingSettled) {
                            this.log.warn('Indexing still running after 10 seconds (boot continued without waiting)');
                            be_framework_1.BeSkill.errorCode('F4-Index_timeout', 'Initial indexing still running after 10 seconds');
                        }
                    }, 10000);
                    this.log.info('initialize the BeSkill.plugins');
                    be_framework_1.BeSkill.init(this.initPlugins.bind(this));
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
        if (!skill) {
            this.log.error(`skillRedirect: no loaded skill named '${name}'`);
            return;
        }
        const currentSkill = this._skillSwitchScheduler.currentSkillRedirectToken ? this._skillSwitchScheduler.currentSkillRedirectToken.skillSwitchData.skill : null;
        if (redirectingSkill !== currentSkill) {
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

