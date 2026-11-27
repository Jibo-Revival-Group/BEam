'use strict';
// 5x1 local-first robots keep their report settings (calendar feeds, commute addresses, news topics) in this file
// instead of the cloud; the face's getContext (node_modules/jibo/lib/jibo.js) sends them to BEefy on every turn.
const fs = require('fs'), os = require('os'), path = require('path'), paths = require('./paths');
const LISTS = ['calendarFeeds', 'commuteAddresses', 'newsTopics'];
// Same rule as ContextProvider.isBetaTester in node_modules/jibo/lib/jibo.js.
function enabled (interfaces) {
    interfaces = interfaces || os.networkInterfaces();
    return Object.keys(interfaces).some(name => interfaces[name].some(a => a.family === 'IPv4' && a.address === '192.168.7.163'));
}
function file () { return path.join(paths.dataDir(), 'report-settings.json'); }
function read () {
    let data = null;
    try { data = JSON.parse(fs.readFileSync(file(), 'utf8')); } catch (_) { /* missing or broken: nothing saved */ }
    const out = {};
    LISTS.forEach(key => { out[key] = data && Array.isArray(data[key]) ? data[key] : []; });
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
    const data = read();
    data[list] = data[list].filter(entry => String(entry.memberId) !== String(memberId)).concat(item ? [item] : []);
    write(data);
    return item;
}
module.exports = { enabled: enabled, file: file, read: read, find: find, put: put };
