'use strict';

/**
 * Lazy skill loading + reload-on-open for Be.
 *
 * Be's constructor only constructs jibo.skills (eager/core). Feature skills listed
 * in jibo.lazySkills are require()'d on first open and kept warm for fast reopen.
 * On open, prepareForOpen reloads from disk only when index.js mtime changed.
 *
 * Async postInit is tracked via skill._beamPostInitPromise; open waits for it
 * before preload (skills like word-of-the-day need KB roots before open).
 *
 * Electron 1.4 / Node 6: plain CommonJS, sync require only.
 */

const fs = require('fs');
const path = require('path');
const Module = require('module');

const skillsResolve = require('./skills-resolve');

/** Surprise-element packs Be used to collect at boot for eosSkill.supplyCategories. */
const EOS_BOOTSTRAP = [
    '@be/word-of-the-day',
    '@be/surprises-date',
    '@be/surprises-ota'
];

/** Prevent prepareForOpen from unloading a skill mid-redirect stack. */
let preparingId = null;

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

function skillMainPath (id) {
    try {
        return require.resolve(id);
    } catch (err) {
        try {
            const dir = skillDirFor(id);
            const pkg = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'));
            return path.resolve(dir, pkg.main || 'index.js');
        } catch (err2) {
            return path.join(skillDirFor(id), 'index.js');
        }
    }
}

/**
 * Drop every Node cache entry for this skill pack so the next require()
 * re-reads index.js from disk (and re-runs the browserify wrapper).
 */
function purgeSkillModules (id) {
    let skillDir;
    try {
        skillDir = fs.realpathSync(skillDirFor(id));
    } catch (err) {
        skillDir = path.resolve(skillDirFor(id));
    }
    const prefix = skillDir.endsWith(path.sep) ? skillDir : skillDir + path.sep;
    const main = skillMainPath(id);
    let mainReal = main;
    try {
        mainReal = fs.realpathSync(main);
    } catch (err) { /* keep main */ }

    const dropKey = (key) => {
        if (!key || typeof key !== 'string') { return false; }
        let resolved = key;
        try {
            resolved = fs.realpathSync(key);
        } catch (err) { /* use key */ }
        return resolved === skillDir ||
            resolved === mainReal ||
            resolved === main ||
            resolved.indexOf(prefix) === 0 ||
            key === main ||
            key.indexOf(prefix) === 0;
    };

    Object.keys(require.cache).forEach((key) => {
        if (dropKey(key)) {
            delete require.cache[key];
        }
    });

    // Node/Electron also memoize resolved paths; clear those or require() can
    // skip a disk re-read in some Electron 1.4 builds.
    [Module._pathCache, Module._realpathCache].forEach((cache) => {
        if (!cache) { return; }
        Object.keys(cache).forEach((key) => {
            if (key.indexOf(id) !== -1 ||
                key.indexOf(skillDir) !== -1 ||
                key.indexOf(prefix) !== -1 ||
                (main && key.indexOf(main) !== -1)) {
                delete cache[key];
            }
        });
    });

    // Browserify UMD also assigns a global (e.g. bejukebox, bemainMenu).
    try {
        const short = id.replace(/^@be\//, '');
        const candidates = [
            'be' + short.replace(/-/g, ''),
            'be' + short.replace(/-([a-z])/g, (_, c) => c.toUpperCase()),
            'be' + short
        ];
        candidates.forEach((name) => {
            try { delete global[name]; } catch (err) { /* ignore */ }
        });
    } catch (err) { /* ignore */ }
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
    skill._beamPostInitReady = false;
    const promise = new Promise((resolve) => {
        let settled = false;
        const finish = (err) => {
            if (settled) { return; }
            settled = true;
            if (err) {
                log(be).error('error during skill ' + id + ' postinit call:', err);
            }
            skill._beamPostInitReady = true;
            resolve();
        };
        try {
            skill.postInit(finish);
        } catch (err) {
            log(be).error('skill ' + id + ' postInit threw:', err);
            finish(err);
        }
    });
    skill._beamPostInitPromise = promise;
    return promise;
}

function sourceMtime (id) {
    try {
        return fs.statSync(skillMainPath(id)).mtime.getTime();
    } catch (err) {
        return null;
    }
}

function loadSkill (be, id) {
    if (be.skills[id]) {
        return be.skills[id];
    }
    // Always purge before require so we never revive a stale cache entry.
    purgeSkillModules(id);

    const startTime = Date.now();
    const main = skillMainPath(id);
    const mtime = sourceMtime(id);

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
    // Reserve the slot before async postInit so concurrent prepare/bootstrap
    // cannot double-construct the same id.
    be.skills[id] = skill;
    skill._beamSourceMtime = mtime;
    skill._beamSourceMain = main;
    wireSkill(be, skill);
    runPostInit(be, skill, id);
    log(be).info(
        'loading - skill construction ' + id + ' - ' + (Date.now() - startTime) + ' MS' +
        (mtime != null ? (' (mtime ' + mtime + ')') : '')
    );
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
 * Lazy skills stay warm after first load; reload only when index.js mtime changes.
 */
function prepareForOpen (be, id) {
    if (!id) {
        throw new Error('prepareForOpen: missing skill id');
    }
    if (!isKnown(be, id)) {
        log(be).warn('skill id not in jibo.skills or jibo.lazySkills:', id);
    }

    if (preparingId === id && be.skills[id]) {
        return be.skills[id];
    }

    if (isEager(be, id)) {
        if (typeof be.ensureSkill === 'function') {
            return be.ensureSkill(id);
        }
        if (!be.skills[id]) {
            return loadSkill(be, id);
        }
        return be.skills[id];
    }

    // Never unload the skill that is currently open — that would tear down the
    // live instance mid-lifecycle. Leave → edit → reopen is what reloads.
    if (currentSkillId(be) === id && be.skills[id]) {
        return be.skills[id];
    }

    const existing = be.skills[id];
    if (existing) {
        const mtime = sourceMtime(id);
        // Fast path: same on-disk bundle — reuse instance (postInit may still be in flight).
        if (mtime != null && existing._beamSourceMtime === mtime) {
            return existing;
        }
    }

    preparingId = id;
    try {
        if (be.skills[id]) {
            unloadSkill(be, id);
        } else {
            purgeSkillModules(id);
        }
        return loadSkill(be, id);
    } finally {
        preparingId = null;
    }
}

function skillSwitchData (be, skill, options) {
    const Ctor = be.constructor && be.constructor.SkillSwitchData;
    if (!Ctor) {
        throw new Error('Be.SkillSwitchData is not available');
    }
    return new Ctor(skill, options);
}

function bootstrapEosCategories (be) {
    if (be._beamEosBootstrapped) {
        return;
    }
    be._beamEosBootstrapped = true;
    log(be).info('Deferred EoS bootstrap starting');
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
}

function install (be) {
    if (!be || be._beamSkillRegistryInstalled) {
        return be;
    }
    be._beamSkillRegistryInstalled = true;

    // EoS packs (word-of-the-day, surprises-date, surprises-ota) used to load
    // sync here and delayed splash. Defer until after first skill opens.
    // Fallback timeout covers error paths that never call enableSkillSwitching.
    setTimeout(() => {
        bootstrapEosCategories(be);
    }, 15000);

    // Keep lazy skills warm after close for fast reopen. prepareForOpen reloads
    // from disk only when index.js mtime changes (live-edit still works).
    const SSU = be.constructor.SkillSwitchUtil;
    if (SSU && typeof SSU.closeSkill === 'function' && !SSU._beamCloseWrapped) {
        const origClose = SSU.closeSkill.bind(SSU);
        SSU.closeSkill = function (skill, pendingSkillName) {
            // Asset-cache cleanup still happens in origClose; we no longer destroy
            // the skill instance / purge require.cache on every leave.
            return Promise.resolve(origClose(skill, pendingSkillName));
        };
        SSU._beamCloseWrapped = true;
    }

    // Re-implement skillRedirect so the SkillSwitchData always holds the freshly
    // prepared instance (do not trust a stale this.skills lookup after unload).
    be.skillRedirect = function (redirectingSkill, name, options) {
        let skill;
        try {
            skill = prepareForOpen(be, name);
        } catch (err) {
            log(be).error('skillRedirect: failed to load \'' + name + '\':', err);
            return;
        }
        const currentSkill = be.currentSkill;
        if (redirectingSkill !== currentSkill) {
            log(be).warn(
                'Trying to call Be#redirect from non-current skill ' +
                (redirectingSkill && redirectingSkill.assetPack) +
                '. Current skill is ' + (currentSkill && currentSkill.assetPack)
            );
            return;
        }
        log(be).info('REDIRECT: skill redirect: ', name, options);
        return be.redirect(skillSwitchData(be, skill, options || {}));
    };

    be.enableSkillSwitching = function () {
        const jibo = require('jibo');
        const SkillLifecycleState = be.constructor.SkillLifecycleState || {};
        const opened = SkillLifecycleState.SKILL_OPENED != null
            ? SkillLifecycleState.SKILL_OPENED
            : 5;
        const ended = SkillLifecycleState.LIFECYCLE_ENDED != null
            ? SkillLifecycleState.LIFECYCLE_ENDED
            : 6;

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

        // First skill is open / splash is clearing — load EoS packs now.
        setTimeout(() => {
            bootstrapEosCategories(be);
        }, 0);
    };

    const origRedirect = be.redirect.bind(be);
    be.redirect = function (switchData) {
        if (!switchData || !switchData.skill) {
            log(be).error('redirect: missing skill on SkillSwitchData');
            return origRedirect(switchData);
        }
        // If something held a stale instance, prefer the live registry entry.
        const id = switchData.skill.assetPack;
        if (id && be.skills[id] && be.skills[id] !== switchData.skill) {
            log(be).info('redirect: replacing stale skill instance for', id);
            if (Object.prototype.hasOwnProperty.call(switchData, '_skill')) {
                switchData._skill = be.skills[id];
            } else {
                switchData = skillSwitchData(be, be.skills[id], switchData.options);
            }
        }
        return origRedirect(switchData);
    };

    log(be).info(
        'skill-registry installed — eager:',
        eagerIds(be).length,
        'lazy:',
        lazyIds(be).length,
            '(lazy skills stay warm; reload when index.js mtime changes)'
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
