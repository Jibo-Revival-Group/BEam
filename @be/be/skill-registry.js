'use strict';

/**
 * Lazy skill loading + reload-on-open for Be.
 *
 * Be's constructor only constructs jibo.skills (eager/core). Feature skills listed
 * in jibo.lazySkills are require()'d the first time they open, and fully
 * re-required on each later open so rebuilt index.js is picked up without
 * restarting the Be process.
 *
 * Electron 1.4 / Node 6: plain CommonJS, sync require only.
 */

const fs = require('fs');
const path = require('path');

const skillsResolve = require('./skills-resolve');

/** Surprise-element packs Be used to collect at boot for eosSkill.supplyCategories. */
const EOS_BOOTSTRAP = [
    '@be/word-of-the-day',
    '@be/surprises-date',
    '@be/surprises-ota'
];

function log (be) {
    return (be && be.log) || {
        info: function () {},
        warn: function () {},
        error: function () {},
        debug: function () {}
    };
}

function jiboPkg (be) {
    return (be.packageInfo && be.packageInfo.jibo) || {};
}

function eagerIds (be) {
    return jiboPkg(be).skills || [];
}

function lazyIds (be) {
    return jiboPkg(be).lazySkills || [];
}

function isEager (be, id) {
    return eagerIds(be).indexOf(id) !== -1;
}

function isKnown (be, id) {
    return isEager(be, id) || lazyIds(be).indexOf(id) !== -1;
}

function skillDirFor (id) {
    const root = skillsResolve.getSkillsRoot();
    if (!root) {
        throw new Error('skills-resolve is not installed');
    }
    return path.join(root, id.replace(/^@be\//, ''));
}

function purgeSkillModules (id) {
    let skillDir;
    try {
        skillDir = fs.realpathSync(skillDirFor(id));
    } catch (err) {
        skillDir = path.resolve(skillDirFor(id));
    }
    const prefix = skillDir.endsWith(path.sep) ? skillDir : skillDir + path.sep;
    Object.keys(require.cache).forEach((key) => {
        let resolved = key;
        try {
            resolved = fs.realpathSync(key);
        } catch (err) { /* use key as-is */ }
        if (resolved === skillDir || resolved.indexOf(prefix) === 0) {
            delete require.cache[key];
        }
    });
}

function resolveSkillClass (SkillExport, id) {
    if (typeof SkillExport === 'function') {
        return SkillExport;
    }
    if (SkillExport && typeof SkillExport.Skill === 'function') {
        return SkillExport.Skill;
    }
    throw new Error('Error loading skill: ' + id + '. Incorrect exports');
}

function wireSkill (be, skill) {
    const empty = (done) => { done(); };
    skill.on('exit', function () {
        be.exit.apply(be, [skill].concat(Array.prototype.slice.call(arguments)));
    });
    skill.on('redirect', function () {
        be.skillRedirect.apply(be, [skill].concat(Array.prototype.slice.call(arguments)));
    });
    skill.on('refresh', function () {
        const args = Array.prototype.slice.call(arguments);
        be.skillRedirect.apply(be, [skill, skill.assetPack].concat(args));
    });
    if (!skill.postInit) {
        skill.postInit = empty;
    }
    if (!skill.preload) {
        skill.preload = empty;
    }
}

function unwireSkill (skill) {
    if (skill && typeof skill.removeAllListeners === 'function') {
        skill.removeAllListeners('exit');
        skill.removeAllListeners('redirect');
        skill.removeAllListeners('refresh');
    }
}

function refreshEosCategories (be) {
    if (!be.eosSkill || typeof be.eosSkill.supplyCategories !== 'function') {
        return;
    }
    const cats = [];
    Object.keys(be.skills || {}).forEach((id) => {
        const skill = be.skills[id];
        if (skill && skill.isElementOfSurprise) {
            cats.push(skill);
        }
    });
    try {
        be.eosSkill.supplyCategories(cats);
    } catch (err) {
        log(be).warn('supplyCategories failed:', err && err.message);
    }
}

function runPostInit (be, skill, id) {
    let finished = false;
    let sync = true;
    try {
        skill.postInit((err) => {
            finished = true;
            if (err) {
                log(be).error('error during skill ' + id + ' postinit call:', err);
            }
            if (!sync) {
                log(be).debug('lazy skill postInit finished asynchronously:', id);
            }
        });
    } catch (err) {
        log(be).error('skill ' + id + ' postInit threw:', err);
        finished = true;
    }
    sync = false;
    if (!finished) {
        log(be).warn(
            'skill postInit did not complete synchronously; continuing anyway:',
            id
        );
    }
}

function loadSkill (be, id) {
    if (be.skills[id]) {
        return be.skills[id];
    }
    const startTime = Date.now();
    const SkillExport = require(id);
    const Skill = resolveSkillClass(SkillExport, id);
    const jibo = require('jibo');
    const skill = new Skill({
        assetPack: id,
        rootPath: path.dirname(jibo.utils.PathUtils.resolve(id))
    });
    if (typeof be._validateSkill === 'function' && !be._validateSkill(skill)) {
        throw new Error('not a valid BeSkill');
    }
    wireSkill(be, skill);
    runPostInit(be, skill, id);
    be.skills[id] = skill;
    log(be).info('loading - skill construction ' + id + ' - ' + (Date.now() - startTime) + ' MS');
    if (skill.isElementOfSurprise) {
        refreshEosCategories(be);
    }
    return skill;
}

function unloadSkill (be, id) {
    const skill = be.skills[id];
    if (!skill) {
        purgeSkillModules(id);
        return;
    }
    const wasEos = !!skill.isElementOfSurprise;
    unwireSkill(skill);
    try {
        if (typeof skill.destroy === 'function') {
            skill.destroy(function () {});
        }
    } catch (err) {
        log(be).warn('skill destroy failed for ' + id + ':', err && err.message);
    }
    try {
        const jibo = require('jibo');
        if (jibo.loader && typeof jibo.loader.deleteCache === 'function') {
            jibo.loader.deleteCache(id);
        }
        if (jibo.expression && typeof jibo.expression.destroyCaches === 'function') {
            jibo.expression.destroyCaches(id);
        }
    } catch (err) {
        log(be).warn('asset cache clear failed for ' + id + ':', err && err.message);
    }
    delete be.skills[id];
    purgeSkillModules(id);
    log(be).info('unloaded skill', id);
    if (wasEos) {
        refreshEosCategories(be);
    }
}

function currentSkillId (be) {
    try {
        const cur = be.currentSkill;
        return cur && cur.assetPack ? cur.assetPack : null;
    } catch (err) {
        return null;
    }
}

/**
 * Ensure a skill instance is ready to open.
 * Lazy skills are destroyed and re-required every open (except same-skill refresh).
 */
function prepareForOpen (be, id) {
    if (!id) {
        throw new Error('prepareForOpen: missing skill id');
    }
    if (!isKnown(be, id)) {
        // Still try — menu/voice may race ahead of package.json edits.
        log(be).warn('skill id not in jibo.skills or jibo.lazySkills:', id);
    }
    if (isEager(be, id)) {
        if (!be.skills[id]) {
            return loadSkill(be, id);
        }
        return be.skills[id];
    }
    if (currentSkillId(be) === id && be.skills[id]) {
        return be.skills[id];
    }
    if (be.skills[id]) {
        unloadSkill(be, id);
    }
    return loadSkill(be, id);
}

function skillSwitchData (be, skill, options) {
    const Ctor = be.constructor && be.constructor.SkillSwitchData;
    if (!Ctor) {
        throw new Error('Be.SkillSwitchData is not available');
    }
    return new Ctor(skill, options);
}

function install (be) {
    if (!be || be._beamSkillRegistryInstalled) {
        return be;
    }
    be._beamSkillRegistryInstalled = true;

    // Bootstrap EoS category skills so surprises.supplyCategories is populated
    // (Be's constructor only saw eager skills).
    EOS_BOOTSTRAP.forEach((id) => {
        if (lazyIds(be).indexOf(id) === -1 && eagerIds(be).indexOf(id) === -1) {
            return;
        }
        try {
            if (!be.skills[id]) {
                loadSkill(be, id);
            }
        } catch (err) {
            log(be).error('EoS bootstrap failed for ' + id + ':', err);
        }
    });
    refreshEosCategories(be);

    const origSkillRedirect = be.skillRedirect.bind(be);
    be.skillRedirect = function (redirectingSkill, name, options) {
        try {
            prepareForOpen(be, name);
        } catch (err) {
            log(be).error('skillRedirect: failed to load \'' + name + '\':', err);
            return;
        }
        return origSkillRedirect(redirectingSkill, name, options);
    };

    const origEnable = be.enableSkillSwitching.bind(be);
    be.enableSkillSwitching = function () {
        const jibo = require('jibo');
        const SkillLifecycleState = be.constructor.SkillLifecycleState;

        jibo.globalEvents.skillRelaunch.removeAllListeners();
        jibo.globalEvents.skillRelaunch.on((data) => {
            const skillName = data.match.skillID;
            let skill;
            try {
                skill = prepareForOpen(be, skillName);
            } catch (err) {
                log(be).error('skillRelaunch: failed to load \'' + skillName + '\':', err);
                return;
            }
            be.redirect(skillSwitchData(be, skill, data));
        });

        jibo.action.setSkillSwitchHandler((skillName, skillData) => {
            return new Promise((resolve) => {
                let skill;
                try {
                    skill = prepareForOpen(be, skillName);
                } catch (err) {
                    log(be).error('skillSwitch: failed to load \'' + skillName + '\':', err);
                    resolve(jibo.action.types.Status.FAILED);
                    return;
                }
                const redirectToken = be.redirect(skillSwitchData(be, skill, skillData));
                let resolved = false;
                const opened = (SkillLifecycleState && SkillLifecycleState.SKILL_OPENED != null)
                    ? SkillLifecycleState.SKILL_OPENED
                    : 5;
                const ended = (SkillLifecycleState && SkillLifecycleState.LIFECYCLE_ENDED != null)
                    ? SkillLifecycleState.LIFECYCLE_ENDED
                    : 6;
                redirectToken.onState(opened, () => {
                    resolved = true;
                    resolve(jibo.action.types.Status.SUCCEEDED);
                });
                redirectToken.onState(ended, () => {
                    if (!resolved) {
                        log(be).warn(
                            'Skill lifecycle ended before skill was opened: ' +
                            redirectToken.skillLifecycleEndState
                        );
                    }
                    resolved = true;
                    resolve(jibo.action.types.Status.FAILED);
                });
            });
        });

        // Replaced rather than chained — origEnable would double-bind listeners.
        void origEnable;
    };

    const origRedirect = be.redirect.bind(be);
    be.redirect = function (switchData) {
        if (!switchData || !switchData.skill) {
            log(be).error('redirect: missing skill on SkillSwitchData');
            return origRedirect(switchData);
        }
        return origRedirect(switchData);
    };

    log(be).info(
        'skill-registry installed — eager:',
        eagerIds(be).length,
        'lazy:',
        lazyIds(be).length
    );
    return be;
}

module.exports = {
    install: install,
    loadSkill: loadSkill,
    unloadSkill: unloadSkill,
    prepareForOpen: prepareForOpen,
    purgeSkillModules: purgeSkillModules,
    refreshEosCategories: refreshEosCategories,
    EOS_BOOTSTRAP: EOS_BOOTSTRAP
};
