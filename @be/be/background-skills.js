'use strict';

/**
 * Background parts of custom skills.
 *
 * A custom skill can name a script in its package.json (`"jibo": { "background": "background.js" }`).
 * BEam starts that script once Jibo is up and keeps it running with no view, so the skill can wait
 * for something (an incoming call, a message) and then bring its own screen up with `api.open(data)`.
 * The skill's normal `open` gets `result.nlu.intent === 'background'` and `result.nlu.entities === data`.
 *
 * The script exports `start(api)` (or is itself that function) and may export `stop()`, which runs
 * when the skill is removed or updated.
 */

const fs = require('fs');
const path = require('path');

const running = {}; // skill id -> { script, exports }
let host = null;

function customSkills () { return require('./beacon/lib/custom-skills'); }

// The background script of an installed, compatible skill, or null.
function scriptFor (item) {
    if (!item || item.compatibility.status === 'incompatible') { return null; }
    const dir = customSkills().resolve(item.packageName);
    let pkg;
    try { pkg = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8')); } catch (err) { return null; }
    const name = pkg.jibo && pkg.jibo.background;
    if (typeof name !== 'string' || !name) { return null; }
    const script = path.resolve(dir, name);
    return script.indexOf(path.resolve(dir) + path.sep) === 0 && fs.existsSync(script) ? script : null;
}

function apiFor (be, id, script) {
    const tag = '[background ' + id + ']';
    return {
        skillId: id,
        rootPath: path.dirname(script),
        log: {
            info: function () { console.log.apply(console, [tag].concat(Array.prototype.slice.call(arguments))); },
            warn: function () { console.warn.apply(console, [tag].concat(Array.prototype.slice.call(arguments))); },
            error: function () { console.error.apply(console, [tag].concat(Array.prototype.slice.call(arguments))); }
        },
        // Is this skill's screen showing?
        isOpen: function () { return !!(be.currentSkill && be.currentSkill.assetPack === id); },
        // Is Jibo idle (nothing else open)?
        isIdle: function () { return !!be.idle && be.currentSkill === be.idle; },
        // Bring this skill's screen up over whatever is open. False if it is already open or can't load.
        open: function (data) {
            if (this.isOpen()) { return false; }
            try {
                const skill = require('./skill-registry').prepareForOpen(be, id);
                be.redirect(new be.constructor.SkillSwitchData(skill, {
                    asr: { text: '' },
                    nlu: { intent: 'background', entities: data && typeof data === 'object' ? data : {} },
                    match: { skillID: id, onRobot: true, skipSurprises: true }
                }));
                return true;
            } catch (err) {
                console.warn(tag, 'open failed:', err && err.message);
                return false;
            }
        }
    };
}

function startOne (be, item) {
    const script = scriptFor(item);
    if (!script || running[item.packageName]) { return; }
    try {
        delete require.cache[script];
        const exported = require(script);
        const startFn = typeof exported === 'function' ? exported : exported && exported.start;
        if (typeof startFn !== 'function') { throw new Error('the background script must export start(api)'); }
        running[item.packageName] = { script: script, exports: exported };
        startFn(apiFor(be, item.packageName, script));
        console.log('[background] started', item.packageName);
    } catch (err) {
        delete running[item.packageName];
        // One broken skill must never stop Jibo or the other skills from starting.
        console.warn('[background] ' + item.packageName + ' failed to start:', err && err.message);
    }
}

// Start every installed skill's background script (once Jibo can switch skills).
function start (be) {
    host = be;
    let skills = [];
    try { skills = customSkills().inventory().skills; } catch (err) { console.warn('[background] no custom skills:', err.message); }
    skills.forEach(item => startOne(be, item));
    console.log('[background] running:', Object.keys(running).join(', ') || 'none');
}

function stop (id) {
    const entry = running[id];
    if (!entry) { return; }
    delete running[id];
    try { if (entry.exports && typeof entry.exports.stop === 'function') { entry.exports.stop(); } } catch (err) {
        console.warn('[background] ' + id + ' stop failed:', err && err.message);
    }
    delete require.cache[entry.script];
}

// After an install or update: stop the old script and start the new revision's.
function restart (id) {
    stop(id);
    if (!host) { return; }
    const item = customSkills().inventory().skills.filter(s => s.packageName === id)[0];
    if (item) { startOne(host, item); }
}

module.exports = { start: start, stop: stop, restart: restart, running: () => Object.keys(running) };
