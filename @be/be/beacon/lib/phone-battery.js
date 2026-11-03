'use strict';

// BEep reports its phone's battery here (while open, on background refresh, and from its widget);
// @be/phone-battery speaks it when someone asks.
// shortcut: kept in memory only, so a reboot forgets it until each phone next reports.
const readings = {};

function fail (message) { const error = new Error(message); error.status = 400; return error; }

function save (body) {
    const level = body && body.level;
    if (typeof level !== 'number' || !Number.isFinite(level) || level < 0 || level > 100) { throw fail('level must be 0 to 100'); }
    const member = typeof body.member === 'string' ? body.member.slice(0, 64) : '';
    readings[member] = { member: member, level: Math.round(level), charging: body.charging === true, at: Date.now() };
    return readings[member];
}

function name (member, people) {
    const found = ((people && people.members) || []).find(m => m.id === member);
    return found ? (found.nickName || found.firstName || found.writtenName || '') : '';
}

function ago (ms) {
    const minutes = Math.round(ms / 60000);
    if (minutes < 60) { return minutes === 1 ? 'a minute ago' : minutes + ' minutes ago'; }
    const hours = Math.round(minutes / 60);
    return hours === 1 ? 'an hour ago' : hours + ' hours ago';
}

/** What Jibo says, newest phone first. `people` is BEacon's people.list(). */
function sentence (people, now) {
    now = now || Date.now();
    const list = Object.keys(readings).map(k => readings[k]).sort((a, b) => b.at - a.at);
    if (!list.length) { return "I haven't heard from your phone yet. Open BEep on it while it's on my Wi-Fi."; }
    const parts = list.map(r => {
        const who = list.length === 1 ? 'Your phone' : (name(r.member, people) ? name(r.member, people) + "'s phone" : 'One phone');
        let text = who + ' is at ' + r.level + ' percent' + (r.charging ? ' and charging' : '');
        // Phones report only when iOS lets BEep run, so say when an older reading is from.
        if (now - r.at > 10 * 60000) { text += ', as of ' + ago(now - r.at); }
        return text;
    });
    return parts.join('. ') + '.';
}

function reset () { Object.keys(readings).forEach(k => delete readings[k]); }

module.exports = { save: save, sentence: sentence, reset: reset };
