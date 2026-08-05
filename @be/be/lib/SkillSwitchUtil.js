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
        const skill = newSkillLifecycle.skillSwitchData.skill;
        // Wait for async postInit (KB roots, etc.) before preload/open — otherwise
        // skills like word-of-the-day throw on undefined _mainRoot and fall back to idle.
        const postInitReady = (skill && skill._beamPostInitPromise)
            ? skill._beamPostInitPromise
            : Promise.resolve();
        return postInitReady
            .then(() => {
            return new Promise((resolve, reject) => {
                openTimeout = setTimeout(() => {
                    return reject('skill took too long to open. Force closing.');
                }, openSkillTimeoutMS);
                oldSkillName = currentSkillLifecycle ? currentSkillLifecycle.skillSwitchData.skill.assetPack : '';
                jibo.loader.basePath = skill.rootPath;
                jibo.sound.basePath = skill.rootPath;
                jibo.loader.addCache(skill.assetPack);
                jibo.loader.activeCache = skill.assetPack;
                jibo.embodied.speech.setPaths(skill.assetPack);
                if (newSkillOptions && newSkillOptions.asr.text) {
                    jibo.mim.silentMenus = false;
                }
                try {
                    log.info("BeSkill open", oldSkillName, newSkillName, newSkillOptions);
                    be_framework_1.BeSkill.open(oldSkillName, skill.assetPack, newSkillOptions, (err) => {
                        try {
                            if (err) {
                                log.error(err);
                            }
                            log.info("new skill preload", newSkillName);
                            skill.preload((err) => {
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
            });
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
                    skill.skipSurprisesExternal = newSkillOptions && newSkillOptions.match && newSkillOptions.match.skipSurprises;
                    skill.open(newSkillOptions, false, currentSkillName, currentSkillOptions);
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

