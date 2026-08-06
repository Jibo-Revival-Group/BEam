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
/** Skills constructed synchronously in Be's constructor (needed for face / EoS). */
const SYNC_CONSTRUCT = {
    '@be/idle': true,
    '@be/surprises': true
};
/** Construct ASAP in background after plugins arm (alarms / settings residency). */
const BACKGROUND_CONSTRUCT = {
    '@be/clock': true,
    '@be/settings': true
};
/** Skills whose postInit may run in the background and need not block first launch. */
const BACKGROUND_POSTINIT_IDS = {
    '@be/clock': true,
    '@be/surprises': true
};
class Be {
    constructor() {
        global.be = this;
        this._bootT0 = (typeof window !== 'undefined' && window.__BE_BOOT_T0) ? window.__BE_BOOT_T0 : Date.now();
        this._postInitById = {};
        this._postInitsArmed = false;
        this.log = log_1.default.createChild("Be");
        this.log.info("%c Welcome to: BE SKILL ", 'font-weight:bold;color:white;padding:5px 20px;background-color:purple;border-radius:20px');
        // Prefer splash painted from index.html before require("jibo").
        if (!document.getElementById('splash')) {
            let splash = document.createElement('div');
            splash.id = 'splash';
            document.body.insertBefore(splash, document.getElementById('face'));
        }
        this.skills = {};
        this.packageInfo = require(path.join(jibo.utils.PathUtils.findRoot(), 'package.json'));
        const skillIds = this.packageInfo.jibo.skills || [];
        skillIds.forEach((id) => {
            if (!SYNC_CONSTRUCT[id]) {
                return;
            }
            try {
                this.ensureSkill(id);
            }
            catch (err) {
                this.log.error(`Skill creation for '${id}' failed: ${err}`);
            }
        });
        this._refreshSkillAliases();
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
        this._refreshEosCategories();
        this._bootMark('Be construct done (sync idle+surprises only)');
        this.log.debug('bottom of Be constructor');
    }
    _bootMark(label) {
        this.log.info(`loading - boot ${label} - ${Date.now() - this._bootT0} MS`);
    }
    _refreshSkillAliases() {
        const j = this.packageInfo.jibo;
        this.idle = this.skills[j.defaultSkill];
        this.firstSkill = this.skills[j.firstSkill];
        this.restoreSkill = this.skills[j.restoreSkill];
        this.eosSkill = this.skills[j.eosSkill];
    }
    _wireSkill(skill) {
        const empty = (done) => { done(); };
        skill.on('exit', function () {
            this.exit.call(this, skill, ...arguments);
        }.bind(this));
        skill.on('redirect', function () {
            this.skillRedirect.call(this, skill, ...arguments);
        }.bind(this));
        skill.on('refresh', function () {
            this.skillRedirect.call(this, skill, skill.assetPack, ...arguments);
        }.bind(this));
        if (!skill.postInit) {
            skill.postInit = empty;
        }
        if (!skill.preload) {
            skill.preload = empty;
        }
    }
    _refreshEosCategories() {
        if (!this.eosSkill || typeof this.eosSkill.supplyCategories !== 'function') {
            return;
        }
        const eosCategories = [];
        for (let id in this.skills) {
            const skill = this.skills[id];
            if (skill && skill.isElementOfSurprise) {
                eosCategories.push(skill);
            }
        }
        try {
            this.eosSkill.supplyCategories(eosCategories);
        }
        catch (err) {
            this.log.warn('supplyCategories failed:', err && err.message);
        }
    }
    /**
     * Construct (and optionally postInit) a jibo.skills pack on demand.
     * Sync construct for idle/surprises at boot; deferred packs use this later.
     */
    ensureSkill(id) {
        if (!id) {
            return null;
        }
        if (this.skills[id]) {
            const existing = this.skills[id];
            if (this._postInitsArmed && !this._postInitById[id]) {
                if (existing._beamPostInitPromise) {
                    this._postInitById[id] = existing._beamPostInitPromise;
                }
                else {
                    this._startSkillPostInit(id, existing);
                }
            }
            return existing;
        }
        const startTime = Date.now();
        const SkillExport = require(id);
        let Skill;
        if (typeof SkillExport === 'function') {
            Skill = SkillExport;
        }
        else if (SkillExport && typeof SkillExport.Skill === 'function') {
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
        this._wireSkill(skill);
        this._refreshSkillAliases();
        if (skill.isElementOfSurprise) {
            this._refreshEosCategories();
        }
        this.log.info(`loading - skill construction ${id} - ${Date.now() - startTime} MS` +
            (SYNC_CONSTRUCT[id] ? '' : ' (deferred)'));
        this._bootMark('ensureSkill ' + id);
        if (this._postInitsArmed) {
            this._startSkillPostInit(id, skill);
        }
        return skill;
    }
    _waitPostInits(ids, done) {
        const unique = [];
        ids.forEach((id) => {
            if (id && unique.indexOf(id) === -1) {
                unique.push(id);
            }
        });
        // Ensure deferred packs exist and have postInit started before waiting.
        unique.forEach((id) => {
            try {
                this.ensureSkill(id);
            }
            catch (err) {
                this.log.error(`ensureSkill failed for critical id ${id}:`, err);
            }
        });
        const waitStart = Date.now();
        const tasks = unique.map((id) => {
            const p = this._postInitById[id];
            if (!p) {
                this.log.warn(`no postInit promise for ${id}; continuing`);
                return Promise.resolve();
            }
            return p;
        });
        Promise.all(tasks).then(() => {
            this.log.info(`loading - boot critical postInits [${unique.join(', ')}] - ${Date.now() - waitStart} MS`);
            done();
        }, (err) => {
            this.log.warn('critical postInit wait error (continuing):', err);
            done();
        });
    }
    _startSkillPostInit(id, skill) {
        if (this._postInitById[id]) {
            return this._postInitById[id];
        }
        const startTime = Date.now();
        const background = !!BACKGROUND_POSTINIT_IDS[id];
        this.log.debug(`Calling postInit for skill ${id}${background ? ' (background)' : ''}`);
        const promise = new Promise((resolve) => {
            try {
                skill.postInit.bind(skill)((err) => {
                    if (err) {
                        this.log.error(`error during skill ${skill.assetPack} postinit call:`, err);
                    }
                    this.log.info(`loading - skill ${skill.assetPack} postinit call - ${Date.now() - startTime} MS` +
                        (background ? ' (background)' : ''));
                    resolve();
                });
            }
            catch (err) {
                this.log.error(`skill ${id} postInit threw:`, err);
                resolve();
            }
        });
        this._postInitById[id] = promise;
        if (skill) {
            skill._beamPostInitPromise = promise;
            promise.then(() => {
                skill._beamPostInitReady = true;
            });
        }
        return promise;
    }
    _startBackgroundConstructs() {
        Object.keys(BACKGROUND_CONSTRUCT).forEach((id) => {
            const run = () => {
                try {
                    if (!this.skills[id]) {
                        this.log.info(`loading - boot background construct ${id}`);
                        this.ensureSkill(id);
                    }
                    else if (this._postInitsArmed && !this._postInitById[id]) {
                        this._startSkillPostInit(id, this.skills[id]);
                    }
                }
                catch (err) {
                    this.log.error(`background ensureSkill ${id} failed:`, err);
                }
            };
            setTimeout(run, 0);
        });
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
        const jiboInitStart = Date.now();
        jibo.init({ display: 'face', analytics: new LibraryAnalytics_1.default() }, (err) => {
            if (err) {
                this.log.error(err);
                this.initDoneCallback(err);
                return;
            }
            this.log.info(`loading - boot jibo.init - ${Date.now() - jiboInitStart} MS`);
            this._bootMark('jibo.init done');
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
                const notifStart = Date.now();
                jibo_client_framework_1.NotificationsDispatcher.instance.init(err => {
                    this.log.info(`loading - boot notifications - ${Date.now() - notifStart} MS`);
                    this._bootMark('notifications done');
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
        // Arm postInit for skills already constructed (idle + surprises). First
        // launch waits only for idle + the selected first skill; clock/settings
        // construct + postInit in the background.
        this._postInitsArmed = true;
        for (let id in this.skills) {
            this._startSkillPostInit(id, this.skills[id]);
        }
        this._startBackgroundConstructs();
        this._bootMark('postInits started');
        this.afterPluginsReady();
    }
    afterPluginsReady() {
        this.log.debug('initting analytics');
        this.initAnalyticsContext();
        this.log.info('Jibo is ready... awaiting launch command.');
        jibo.face.views.changeView({ removeAll: true, leaveEmpty: true }, () => {
            this._bootMark('face cleared');
            const selectStart = Date.now();
            this.selectFirstSkill((nextSkill, nextSkillLaunchOptions, currentErrorId, firstTime) => {
                this.log.info(`loading - boot selectFirstSkill - ${Date.now() - selectStart} MS`);
                this._bootMark('selectFirstSkill done');
                if (!nextSkill) {
                    this.log.error('selectFirstSkill returned no skill');
                    this.initDoneCallback(new Error('No first skill available'));
                    return;
                }
                const criticalIds = [this.packageInfo.jibo.defaultSkill, nextSkill.assetPack];
                this._waitPostInits(criticalIds, () => {
                    this._bootMark('critical postInits ready');
                    this.launchFirstSkill(nextSkill, nextSkillLaunchOptions, currentErrorId, firstTime);
                });
            });
        });
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
        // Kept for compatibility; boot now uses afterPluginsReady after starting postInits.
        if (err) {
            this.log.error(err);
            this.initDoneCallback(err);
            return;
        }
        this.afterPluginsReady();
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
                    let nextSkillId = this.packageInfo.jibo.defaultSkill;
                    if (currentErrorId) {
                        nextSkillId = '@be/settings';
                        nextSkillLaunchOptions = { nlu: { entities: { errorId: currentErrorId } } };
                    }
                    else if (firstTime) {
                        if (backupErr && !this.packageInfo.jibo.debug.skipRestore) {
                            setTimeout(this.selectFirstSkill.bind(this, callback), 2000);
                            return;
                        }
                        else if (hasBackupData && !this.packageInfo.jibo.debug.skipRestore) {
                            nextSkillId = this.packageInfo.jibo.restoreSkill;
                        }
                        else {
                            nextSkillId = this.packageInfo.jibo.firstSkill;
                        }
                    }
                    try {
                        nextSkill = this.ensureSkill(nextSkillId);
                    }
                    catch (ensureErr) {
                        this.log.error(`selectFirstSkill: failed to ensure '${nextSkillId}':`, ensureErr);
                        nextSkill = this.idle;
                    }
                    callback(nextSkill, nextSkillLaunchOptions, currentErrorId, firstTime);
                });
            });
        });
    }
    launchFirstSkill(firstSkill, firstSkillLaunchOptions, firstErrorId, firstTime) {
        this.log.debug('launching first skill');
        this._bootMark('launchFirstSkill start');
        const hideSplash = () => {
            const el = document.getElementById('splash');
            if (!el) {
                return;
            }
            if (firstErrorId) {
                el.style.display = 'none';
            }
            else {
                el.remove();
            }
            this._bootMark('splash hidden');
        };
        const firstSkillHasOpened = () => {
            this._bootMark('first skill opened');
            if (!firstErrorId) {
                this.enableSkillSwitching();
            }
            this.initDoneCallback();
        };
        let firstSkillRedirectToken = this.redirect(new SkillSwitchData_1.default(firstSkill, firstSkillLaunchOptions));
        // Hide splash as soon as open begins (preload finished / open starting),
        // so the face appears before SKILL_OPENED finishes wiring.
        firstSkillRedirectToken.onState(SkillLifecycleState_1.default.SKILL_START_OPEN, hideSplash);
        firstSkillRedirectToken.onState(SkillLifecycleState_1.default.SKILL_OPENED, firstSkillHasOpened);
        if (firstErrorId) {
            const onErrorResolved = () => {
                if (firstTime) {
                    const splash = document.getElementById('splash');
                    if (splash) {
                        splash.style.display = 'block';
                    }
                }
                this.selectFirstSkill((nextSkill, nextSkillLaunchOptions, currentErrorId) => {
                    const criticalIds = [this.packageInfo.jibo.defaultSkill, nextSkill && nextSkill.assetPack];
                    this._waitPostInits(criticalIds, () => {
                        let nextSkillRedirectToken = this.redirect(new SkillSwitchData_1.default(nextSkill, nextSkillLaunchOptions));
                        if (currentErrorId) {
                            nextSkillRedirectToken.onState(SkillLifecycleState_1.default.LIFECYCLE_ENDED, onErrorResolved);
                            nextSkillRedirectToken.onState(SkillLifecycleState_1.default.SKILL_START_OPEN, () => {
                                const el = document.getElementById('splash');
                                if (el) {
                                    el.style.display = 'none';
                                }
                            });
                        }
                        else {
                            nextSkillRedirectToken.onState(SkillLifecycleState_1.default.SKILL_START_OPEN, () => {
                                const el = document.getElementById('splash');
                                if (el) {
                                    el.remove();
                                }
                            });
                            nextSkillRedirectToken.onState(SkillLifecycleState_1.default.SKILL_OPENED, () => {
                                this.enableSkillSwitching();
                            });
                        }
                    });
                });
            };
            firstSkillRedirectToken.onState(SkillLifecycleState_1.default.LIFECYCLE_ENDED, onErrorResolved);
        }
    }
    enableSkillSwitching() {
        jibo.globalEvents.skillRelaunch.on(data => {
            const skillName = data.match.skillID;
            let skill;
            try {
                skill = this.ensureSkill(skillName);
            }
            catch (err) {
                this.log.error(`skillRelaunch: failed to ensure '${skillName}':`, err);
                return;
            }
            this.redirect(new SkillSwitchData_1.default(skill, data));
        });
        jibo.action.setSkillSwitchHandler((skillName, skillData) => {
            return new Promise((resolve) => {
                let skill;
                try {
                    skill = this.ensureSkill(skillName);
                }
                catch (err) {
                    this.log.error(`skillSwitch: failed to ensure '${skillName}':`, err);
                    resolve(jibo.action.types.Status.FAILED);
                    return;
                }
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
        let skill;
        try {
            skill = this.ensureSkill(name);
        }
        catch (err) {
            this.log.error(`skillRedirect: failed to ensure '${name}':`, err);
            return;
        }
        if (!skill) {
            this.log.error(`skillRedirect: no loaded skill named '${name}'`);
            return;
        }
        const currentSkill = this._skillSwitchScheduler.currentSkillRedirectToken ? this._skillSwitchScheduler.currentSkillRedirectToken.skillSwitchData.skill : null;
        if (redirectingSkill !== currentSkill) {
            this.log.warn(`Trying to call Be#redirect from non-current skill ${redirectingSkill.assetPack}. Current skill is ${currentSkill && currentSkill.assetPack}`);
            return;
        }
        this.log.info("REDIRECT: skill redirect: ", name, options);
        this.redirect(new SkillSwitchData_1.default(skill, options));
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

