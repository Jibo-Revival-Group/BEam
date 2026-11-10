'use strict';

// More › Automatic updates: after each background Store refresh, install newer releases of
// Store-installed skills and themes (on unless turned off). Uploaded ZIPs are never touched.

const fs = require('fs');
const path = require('path');
const paths = require('./paths');

function file() { return path.join(paths.dataDir(), 'auto-update.json'); }
function get() {
    try { return JSON.parse(fs.readFileSync(file(), 'utf8')).enabled !== false; }
    catch (error) { return true; }
}
function set(enabled) {
    if (typeof enabled !== 'boolean') {
        const error = new Error('Automatic updates must be true or false');
        error.status = 400;
        throw error;
    }
    paths.ensureDir(paths.dataDir());
    fs.writeFileSync(file() + '.tmp', JSON.stringify({ enabled: enabled }) + '\n');
    fs.renameSync(file() + '.tmp', file());
    return enabled;
}

// The Store card's "Update" rule (public/themes.js): a newer GitHub release, else a different version.
function newer(installed, entry) {
    if (!entry || entry.error || !entry.manifest || (entry.compatibility && entry.compatibility.status === 'incompatible')) { return false; }
    const release = installed.origin && installed.origin.release;
    return entry.release && release ? entry.release.id > release.id : installed.manifest.version !== entry.manifest.version || !!entry.release;
}

// Update everything with a newer listing, one at a time. Resolves to the names updated.
function run(options) {
    const o = options || {};
    if (!get()) { return Promise.resolve([]); }
    const themes = o.themes || require('./themes'), skills = o.skills || require('./custom-skills');
    const entries = themes.catalog().entries;
    const find = (item, type) => entries.filter(e => (e.type || 'theme') === type && item.origin && item.origin.kind === 'store' && e.url === item.origin.url)[0];
    const jobs = [];
    skills.inventory().skills.forEach(skill => {
        const entry = find(skill, 'skill');
        if (newer(skill, entry)) { jobs.push({ name: skill.manifest.name, go: () => skills.install(entry.id) }); }
    });
    const themeState = themes.inventory();
    themeState.themes.forEach(theme => {
        const entry = find(theme, 'theme');
        if (!newer(theme, entry)) { return; }
        // The theme in use is applied again so the new version shows, as the Store's Apply would.
        jobs.push({ name: theme.manifest.name, go: () => themes.install(entry.id).then(() => theme.active ? themes.activate(theme.id) : null) });
    });
    const updated = [];
    return jobs.reduce((chain, job) => chain.then(() => job.go().then(() => { updated.push(job.name); },
        err => console.warn('[beacon] automatic update of ' + job.name + ' failed:', err && err.message))), Promise.resolve())
        .then(() => updated);
}

module.exports = { get: get, set: set, run: run, newer: newer };
