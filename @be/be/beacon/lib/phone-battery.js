'use strict';

// BEep reports its phone's battery here (while open, on background refresh, and from its widget);
// @be/phone-battery speaks it when someone asks.
// shortcut: kept in memory only, so a reboot forgets it until each phone next reports.
const readings = {};
const LATELY = 3 * 3600000; // older than this: "I haven't heard from your phone lately"

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

/** Sends a reading to BEefy (with the robot's cloud credentials, like calendars) for the personal report. */
function forward (reading) {
    if (!reading.member) { return Promise.resolve(); } // the report says it only to the phone's owner
    const people = require('./people'), calendars = require('./calendars');
    return people.list().then(snapshot => {
        const m = ((snapshot && snapshot.members) || []).find(x => x.id === reading.member);
        return calendars.callCloud('SetPhoneBattery', {
            memberId: reading.member,
            memberName: m ? ([m.firstName, m.lastName].filter(Boolean).join(' ') || m.writtenName || null) : null,
            level: reading.level,
            charging: reading.charging
        }, calendars.robotIdFrom(snapshot));
    }).catch(() => {});
}

function ago (ms) {
    const minutes = Math.round(ms / 60000);
    if (minutes < 60) { return minutes === 1 ? 'a minute ago' : minutes + ' minutes ago'; }
    const hours = Math.floor(minutes / 60); // under the 3-hour cutoff, so at most "2 hours ago"
    return hours === 1 ? 'an hour ago' : hours + ' hours ago';
}

/**
 * What Jibo says. `people` is BEacon's people.list(); `speaker` is the loop member Jibo recognised
 * by voice, if any: then only their phone. Otherwise every phone, newest first.
 */
function sentence (people, now, speaker) {
    now = now || Date.now();
    if (speaker && !readings[speaker]) {
        const who = name(speaker, people);
        return "I haven't heard from your phone yet" + (who ? ', ' + who : '') + ". Open BEep on it while it's on my Wi-Fi.";
    }
    const list = (speaker ? [readings[speaker]] : Object.keys(readings).map(k => readings[k])).sort((a, b) => b.at - a.at);
    if (!list.length) { return "I haven't heard from your phone yet. Open BEep on it while it's on my Wi-Fi."; }
    const parts = list.map(r => {
        const who = list.length === 1 ? 'your phone' : (name(r.member, people) ? name(r.member, people) + "'s phone" : 'one phone');
        const age = now - r.at, charging = r.charging ? ' and charging' : '';
        if (age >= LATELY) { return "I haven't heard from " + who + ' lately'; }
        // Phones report only when iOS lets BEep run, so say when an older reading is from.
        if (age >= 2 * 60000) { return 'As of ' + ago(age) + ', ' + who + ' was at ' + r.level + ' percent' + charging; }
        return who.charAt(0).toUpperCase() + who.slice(1) + ' is at ' + r.level + ' percent' + charging;
    });
    return parts.join('. ') + '.';
}

/** The reading the battery screen shows: the speaker's phone, else the newest one (null: none recent). */
function shown (speaker, now) {
    const reading = speaker ? readings[speaker] : Object.keys(readings).map(k => readings[k]).sort((a, b) => b.at - a.at)[0];
    return reading && (now || Date.now()) - reading.at < LATELY ? reading : null;
}

function reset () { Object.keys(readings).forEach(k => delete readings[k]); }

module.exports = { save: save, forward: forward, sentence: sentence, shown: shown, reset: reset };
