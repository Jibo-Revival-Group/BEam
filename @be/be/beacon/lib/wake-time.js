'use strict';

/**
 * When Jibo wakes up from overnight sleep (BEacon Etc tab). Unset means the stock 6:45 wake-up.
 * The idle skill reads it in the same process; BEacon is the only writer.
 */
const fs = require('fs');
const path = require('path');

const paths = require('./paths');

const DEFAULT = '06:45';
const NIGHT_START = 22 * 60; // nightStarts stays at the stock 22:00

function fail (message, status) { const err = new Error(message); err.status = status || 500; return err; }
function settingPath () { return path.join(paths.dataDir(), 'wake-time.json'); }
function toMinutes (time) {
    const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time);
    const minutes = m ? Number(m[1]) * 60 + Number(m[2]) : -1;
    return minutes >= 2 * 60 && minutes <= 11 * 60 ? minutes : null;
}

let current; // read once; null when unset
function load () {
    if (current === undefined) {
        try { current = JSON.parse(fs.readFileSync(settingPath(), 'utf8')).time; } catch (err) { current = null; }
        if (typeof current !== 'string' || toMinutes(current) === null) { current = null; }
    }
    return current;
}
function get () { const time = load(); return { time: time || DEFAULT, isDefault: !time }; }
function set (time) {
    if (typeof time !== 'string' || toMinutes(time) === null) { throw fail('time must be HH:MM between 02:00 and 11:00', 400); }
    paths.ensureDir(paths.dataDir());
    fs.writeFileSync(settingPath() + '.tmp', JSON.stringify({ time: time }) + '\n');
    fs.renameSync(settingPath() + '.tmp', settingPath());
    current = time;
    return get();
}
/** The set wake time in minutes after midnight, or null when unset (stock behaviour). */
function minutes () { const time = load(); return time ? toMinutes(time) : null; }
/** Whether date is overnight for the set wake time, or null when unset. */
function isNight (date) {
    const wake = minutes();
    if (wake === null) { return null; }
    const now = date.getHours() * 60 + date.getMinutes();
    return now >= NIGHT_START || now < wake;
}
/** Whether the clock went from before the set wake time to at or after it. False when unset. */
function crossed (prevMinutes, nowMinutes) {
    const wake = minutes();
    return wake !== null && prevMinutes < wake && nowMinutes >= wake;
}

module.exports = { get: get, set: set, minutes: minutes, isNight: isNight, crossed: crossed,
    settingPath: settingPath, _reset: function () { current = undefined; } };
