'use strict';

/**
 * Storage breakdown for the Settings › Storage screen: one bar over the robot's partitions.
 * Skills can't run df/du (BusyBox is root-only), so sizes come from the root-run system
 * manager (/storage/mounts, /storage/semantic); custom skills and themes are measured here.
 */

const fs = require('fs');
const http = require('http');
const path = require('path');

const PARTITIONS = ['/', '/usr/local', '/var', '/opt'];
const KNOWLEDGE = '/opt/jibo/Knowledge';
const SKILLS_AND_THEMES = ['skills', 'custom-skills', 'themes', 'voices'].map((d) => KNOWLEDGE + '/beacon/' + d);

function getJSON (pathname, callback) {
    let done = false;
    const finish = (err, data) => { if (!done) { done = true; callback(err, data); } };
    const req = http.get({ host: '127.0.0.1', port: 8585, path: pathname }, (res) => {
        let body = '';
        res.on('data', (d) => { body += d; });
        res.on('end', () => {
            try { finish(null, JSON.parse(body)); } catch (err) { finish(err); }
        });
    });
    // The system manager adds up folder sizes on request: ~15 s on a robot with a big Knowledge Base.
    req.setTimeout(60000, () => { req.abort(); finish(new Error('system manager timed out')); });
    req.on('error', finish);
}

// Disk space a folder takes, like du (allocated blocks); unreadable entries are skipped.
function folderBytes (dir) {
    let stat;
    try { stat = fs.lstatSync(dir); } catch (err) { return 0; }
    let total = (stat.blocks || 0) * 512;
    if (!stat.isDirectory()) { return total; }
    let names = [];
    try { names = fs.readdirSync(dir); } catch (err) { return total; }
    names.forEach((name) => { total += folderBytes(path.join(dir, name)); });
    return total;
}

function categorize (mounts, semantic, skills) {
    const seen = {};
    let used = 0, free = 0;
    (mounts || []).forEach((m) => {
        if (m.type !== 'ext4' || PARTITIONS.indexOf(m.path) < 0 || seen[m.path]) { return; }
        seen[m.path] = true;
        used += m.used || 0;
        free += m.free || 0;
    });
    const size = (type) => ((semantic || []).filter((u) => u.type === type)[0] || {}).size || 0;
    const photos = size('photos') + size('recordings');
    // shortcut: 5x1 release backups inside Knowledge are root-only and stay counted as Knowledge Base.
    const knowledge = Math.max(0, size('knowledge') - skills);
    const system = Math.max(0, used - photos - skills - knowledge);
    // ext4's reserved ~5% is unusable, so the bar is used + free.
    return { total: used + free, used, free, system, photos, skills, knowledge };
}

function usage (callback) {
    getJSON('/storage/mounts', (err, mounts) => {
        if (err || !mounts) { callback(err || new Error('no storage information')); return; }
        getJSON('/storage/semantic', (err2, semantic) => {
            // Without folder sizes everything would show as System; say it's unavailable instead.
            if (err2 || !semantic || !semantic.usage) { callback(err2 || new Error('no folder sizes')); return; }
            const skills = SKILLS_AND_THEMES.reduce((n, dir) => n + folderBytes(dir), 0);
            callback(null, categorize(mounts.mounts, semantic && semantic.usage, skills));
        });
    });
}

function formatBytes (bytes) {
    const gb = bytes / (1024 * 1024 * 1024);
    if (gb >= 1) { return (gb >= 10 ? gb.toFixed(0) : gb.toFixed(1)) + ' GB'; }
    const mb = bytes / (1024 * 1024);
    return (mb >= 10 ? mb.toFixed(0) : mb.toFixed(1)) + ' MB';
}

module.exports = { usage, categorize, folderBytes, formatBytes };
