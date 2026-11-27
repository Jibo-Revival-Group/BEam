'use strict';
// 5x1 local-first: BEacon keeps the report settings (calendar feeds, commute addresses, news topics) in this file
// instead of the cloud; the face's getContext (node_modules/jibo/lib/jibo.js) sends them to BEefy on every turn once
// the file exists. On start, the settings the cloud already held are copied here once (importFromCloud).
const fs = require('fs'), path = require('path'), paths = require('./paths');
const LISTS = ['calendarFeeds', 'commuteAddresses', 'newsTopics'];
// On once the cloud's copy is imported; until then the robot keeps using the cloud as before.
function enabled () { return load().imported === true; }
function file () { return path.join(paths.dataDir(), 'report-settings.json'); }
function load () {
    try { return JSON.parse(fs.readFileSync(file(), 'utf8')) || {}; } catch (_) { return {}; /* missing or broken: nothing saved */ }
}
function read () {
    const data = load(), out = {};
    LISTS.forEach(key => { out[key] = Array.isArray(data[key]) ? data[key] : []; });
    return out;
}
function write (data) {
    const target = file(), temporary = target + '.tmp';
    fs.writeFileSync(temporary, JSON.stringify(data), { mode: 0o600 });
    fs.renameSync(temporary, target);
}
function find (list, memberId) { return read()[list].filter(item => String(item.memberId) === String(memberId))[0] || null; }
// Replaces (item given) or removes (item null) the member's entry in one list.
function put (list, memberId, item) {
    const data = Object.assign(load(), read());
    data[list] = data[list].filter(entry => String(entry.memberId) !== String(memberId)).concat(item ? [item] : []);
    write(data);
    return item;
}
// One-time copy of what the cloud stored before local-first; entries already saved here win. A failure leaves
// `imported` unset, so the next start tries again.
function importFromCloud (callCloud, robot) {
    if (load().imported) return Promise.resolve(false);
    return Promise.all([
        callCloud('GetCalendarFeeds', { includeUrls: true }, robot),
        callCloud('GetCommuteAddresses', { includeDetails: true }, robot),
        callCloud('GetNewsTopics', {}, robot)
    ]).then(r => {
        const cloud = {
            calendarFeeds: (r[0].members || []).filter(f => f.memberId && f.icalUrl).map(f => ({
                memberId: String(f.memberId), icalUrl: f.icalUrl, isEnabled: f.isEnabled !== false,
                memberName: f.memberName || null, timeZone: f.timeZone || null })),
            commuteAddresses: (r[1].addresses || []).filter(a => a.memberId && a.address).map(a => ({
                memberId: String(a.memberId), address: a.address, lat: a.lat, lng: a.lng, city: a.city || null,
                mode: a.mode || null, memberName: a.memberName || null, timeZone: a.timeZone || null })),
            newsTopics: (r[2].people || []).filter(p => p.memberId).map(p => ({
                memberId: String(p.memberId), memberName: p.memberName || null, disabledTopics: p.disabledTopics || [] }))
        };
        const local = read(), data = { imported: true };
        LISTS.forEach(key => {
            const mine = {};
            local[key].forEach(item => { mine[String(item.memberId)] = true; });
            data[key] = local[key].concat(cloud[key].filter(item => !mine[item.memberId]));
        });
        write(data);
        return true;
    });
}
module.exports = { enabled: enabled, file: file, read: read, find: find, put: put, importFromCloud: importFromCloud };
