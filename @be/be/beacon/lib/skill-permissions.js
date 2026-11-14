'use strict';
// Custom skills run inside Be, so they can reach every Jibo API. This layer makes the private ones need a permission
// the owner agreed to at install ("permissions" in manifest.json) AND the skill's screen being the one open:
//   microphone: listening, transcripts, speaker IDs; camera: photos, camera streams; background: background scripts.
// Calls and event subscriptions are tied to a skill by the skill's files in the JavaScript stack.
// shortcut: this stops casual snooping, not a determined attacker (raw sockets, fs, require internals);
// upgrade by running custom skills in their own sandboxed process with a narrow API.
const path = require('path');

const PERMISSIONS = ['microphone', 'camera', 'background'];
const CALLS = {
    microphone: { jetstream: ['startLocalTurn', 'subscribeGlobal', 'setHJMode', 'setHotwordMode', 'startEnrollmentTurn',
        'startNameLearningTurn', 'initNameLearning', 'createSpeakerModel', 'getEnrolledSpeakers'] },
    camera: { media: ['takePhoto', 'getCameraStream', 'getUserMedia', 'getPreviewUrl', 'setViewfinder', 'getPhoto', 'getUrl', 'getUrlById'] }
};
// Events that carry what people said or who said it.
const EVENTS = { jetstream: ['localTurnResult', 'globalTurnResult', 'speakerID', 'speakerEnrollment', 'untyped'],
    globalEvents: ['skillRelaunch', 'skillLaunch'] };

function create(opts) {
    const dir = path.resolve(opts.skillsDir) + path.sep;   // <skills>/packages/
    // The installed custom skill whose files are on the current call stack, or null for Jibo's own code.
    function owner() {
        const limit = Error.stackTraceLimit; Error.stackTraceLimit = 80;
        const stack = String(new Error().stack); Error.stackTraceLimit = limit;
        const at = stack.indexOf(dir);
        if (at < 0) { return null; }
        const revision = stack.slice(at + dir.length, at + dir.length + 24);
        // An old revision still in memory after an update or removal gets no permissions.
        return opts.skills().filter(s => s.revision === revision)[0] || { packageName: 'unknown', manifest: {} };
    }
    function allowed(item, permission) {
        const be = opts.be(), open = be && be.currentSkill && be.currentSkill.assetPack === item.packageName;
        return open && (item.manifest.permissions || []).indexOf(permission) >= 0;
    }
    function denied(item, permission) {
        return new Error(item.packageName + ' needs the ' + permission + ' permission and its screen open to do this');
    }
    function guardCall(target, name, permissions) {
        const original = target && target[name];
        if (typeof original !== 'function') { return; }
        target[name] = function () {
            const item = owner(), need = typeof permissions === 'function' ? permissions(arguments) : permissions;
            const missing = item && need.filter(p => !allowed(item, p))[0];
            if (missing) { throw denied(item, missing); }
            return original.apply(this, arguments);
        };
    }
    // A custom skill's handler only hears the event while it may use the microphone.
    function guardEvent(event) {
        if (!event || typeof event.on !== 'function') { return; }
        const on = event.on, removeListener = event.removeListener, wrapped = new WeakMap();
        event.on = function (handler) {
            const item = typeof handler === 'function' && owner();
            if (!item) { return on.call(this, handler); }
            const guarded = function () { if (allowed(item, 'microphone')) { return handler.apply(this, arguments); } };
            wrapped.set(handler, guarded);
            return on.call(this, guarded);
        };
        // addListener, once and off all go through on/removeListener.
        event.removeListener = function (handler) { return removeListener.call(this, wrapped.get(handler) || handler); };
    }
    function guard(jibo, navigator) {
        Object.keys(CALLS).forEach(permission => Object.keys(CALLS[permission]).forEach(api =>
            CALLS[permission][api].forEach(name => guardCall(jibo[api], name, [permission]))));
        EVENTS.jetstream.forEach(name => guardEvent(jibo.jetstream && jibo.jetstream.events && jibo.jetstream.events[name]));
        EVENTS.globalEvents.forEach(name => guardEvent(jibo.globalEvents && jibo.globalEvents[name]));
        const media = navigator && navigator.mediaDevices;
        guardCall(media, 'getUserMedia', args => {
            const c = args[0] || {};
            return (c.audio ? ['microphone'] : []).concat(c.video ? ['camera'] : []);
        });
    }
    return { owner: owner, allowed: allowed, guard: guard };
}

module.exports = { PERMISSIONS: PERMISSIONS, create: create };
