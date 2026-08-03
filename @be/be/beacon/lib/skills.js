'use strict';

/**
 * Skill inventory: what Be is configured to load (jibo.skills + jibo.lazySkills
 * in @be/be/package.json) versus what is actually on disk under @be/be/skills/.
 */

const fs = require('fs');
const path = require('path');

const paths = require('./paths');

function readPack (dir) {
    try {
        return JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'));
    } catch (err) {
        return null;
    }
}

function registeredIds (jibo) {
    const eager = jibo.skills || [];
    const lazy = jibo.lazySkills || [];
    const seen = {};
    const out = [];
    eager.concat(lazy).forEach((id) => {
        if (!seen[id]) {
            seen[id] = true;
            out.push(id);
        }
    });
    return out;
}

function list () {
    const bePkg = paths.bePackage();
    const jibo = bePkg.jibo || {};
    const registered = registeredIds(jibo);
    const eagerSet = {};
    (jibo.skills || []).forEach((id) => { eagerSet[id] = true; });
    const lazySet = {};
    (jibo.lazySkills || []).forEach((id) => { lazySet[id] = true; });
    const root = paths.skillsRoot();

    const roles = {};
    const addRole = (key, label) => {
        if (jibo[key]) { roles[jibo[key]] = (roles[jibo[key]] || []).concat(label); }
    };
    addRole('defaultSkill', 'default');
    addRole('firstSkill', 'first contact');
    addRole('restoreSkill', 'restore');
    addRole('eosSkill', 'end of session');

    let onDisk = [];
    try {
        onDisk = fs.readdirSync(root).filter((name) => {
            return name.charAt(0) !== '.' && paths.isDir(path.join(root, name));
        });
    } catch (err) { /* reported through installed below */ }

    const byName = {};
    const entries = [];

    const record = (name) => {
        if (byName[name]) { return byName[name]; }
        const dir = path.join(root, name.replace(/^@be\//, ''));
        const pkg = readPack(dir);
        const meta = (pkg && pkg.jibo) || {};
        const entry = {
            name: name,
            dir: dir,
            installed: !!pkg,
            version: pkg ? pkg.version : null,
            description: pkg ? pkg.description || '' : '',
            prompt: meta.prompt || '',
            displayName: meta['display-name'] || '',
            type: meta.type || '',
            registered: false,
            load: eagerSet[name] ? 'eager' : (lazySet[name] ? 'lazy' : null),
            roles: roles['@be/' + name.replace(/^@be\//, '')] || [],
            hasLaunchRule: paths.isFile(path.join(dir, meta.launchRule || 'launch.rule'))
        };
        byName[name] = entry;
        entries.push(entry);
        return entry;
    };

    registered.forEach((name) => { record(name).registered = true; });
    onDisk.forEach((name) => { record('@be/' + name); });

    entries.sort((a, b) => {
        if (a.registered !== b.registered) { return a.registered ? -1 : 1; }
        return a.name.localeCompare(b.name);
    });

    return {
        skillsRoot: root,
        host: {
            name: bePkg.name || '@be/be',
            version: bePkg.version || null
        },
        counts: {
            registered: entries.filter((e) => e.registered).length,
            eager: entries.filter((e) => e.load === 'eager').length,
            lazy: entries.filter((e) => e.load === 'lazy').length,
            onDisk: entries.filter((e) => e.installed).length,
            unregistered: entries.filter((e) => e.installed && !e.registered).length
        },
        skills: entries
    };
}

module.exports = {
    list: list
};
