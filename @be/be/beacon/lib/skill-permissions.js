'use strict';
// Custom skills run inside Be, so they can reach everything Jibo can. This layer makes private abilities need a
// permission the owner agreed to at install ("permissions" in manifest.json); without it the skill cannot use them:
//   microphone / camera: listening, transcripts, speaker IDs / photos, camera streams - and only while the skill's own
//     screen is open (so a background script never gets them while it is closed).
//   background: run a background script.
//   local-network: connect to other devices on the home network.   jibo-apis: Jibo's own services on the robot.
//   read-jibo-files / edit-jibo-files: files outside the Knowledge base.
//   read-kb / edit-kb: the Knowledge base outside the skill's own section (/opt/jibo/Knowledge/<skill-name>).
//   run-programs: start programs (child_process). A program gets around every rule here, so this is full access.
// A call is the skill's when the skill's own files are on the JavaScript stack (for fs, network and programs: the
// nearest caller, so Jibo's SDK doing its own work for a skill is not blocked).
// shortcut: this stops casual and accidental access, not a determined attacker (native bindings, async hops through
// Jibo's libraries, DNS names in browser requests); upgrade by running custom skills in their own sandboxed process.
const path = require('path');

const PERMISSIONS = ['microphone', 'camera', 'background', 'local-network', 'jibo-apis',
    'read-jibo-files', 'edit-jibo-files', 'read-kb', 'edit-kb', 'run-programs'];
const CALLS = {
    microphone: { jetstream: ['startLocalTurn', 'subscribeGlobal', 'setHJMode', 'setHotwordMode', 'startEnrollmentTurn',
        'startNameLearningTurn', 'initNameLearning', 'createSpeakerModel', 'getEnrolledSpeakers'] },
    camera: { media: ['takePhoto', 'getCameraStream', 'getUserMedia', 'getPreviewUrl', 'setViewfinder', 'getPhoto', 'getUrl', 'getUrlById'] }
};
// Events that carry what people said or who said it.
const EVENTS = { jetstream: ['localTurnResult', 'globalTurnResult', 'speakerID', 'speakerEnrollment', 'untyped'],
    globalEvents: ['skillRelaunch', 'skillLaunch'] };
const ONLY_WHILE_OPEN = ['microphone', 'camera'];
// fs functions: [path argument, writes?] ('flags' = decided by open()'s flags).
const FS = {
    readFile: [[0, false]], createReadStream: [[0, false]], readdir: [[0, false]], readlink: [[0, false]], open: [[0, 'flags']],
    writeFile: [[0, true]], appendFile: [[0, true]], createWriteStream: [[0, true]], mkdir: [[0, true]], rmdir: [[0, true]],
    unlink: [[0, true]], truncate: [[0, true]], chmod: [[0, true]], chown: [[0, true]], lchown: [[0, true]], utimes: [[0, true]],
    symlink: [[1, true]], link: [[0, false], [1, true]], rename: [[0, true], [1, true]], copyFile: [[0, false], [1, true]]
};
// Stack frames that only pass a call along: Node's own fs/network/process code and common helper libraries.
const PASS_THROUGH = /^node:|(?:^|[\\/])(?:fs|net|tls|dgram|dns|http|https|_http_\w+|_stream_\w+|stream|events|child_process|internal[\\/].*|ELECTRON_ASAR)\.js$|[\\/]node_modules[\\/](?:fs-extra|graceful-fs|jsonfile|mkdirp|rimraf|glob|axios|follow-redirects|request|node-fetch|ws|got|superagent|xmlhttprequest)[\\/]/;

function inside(dir, file) { return file === dir || file.indexOf(dir + path.sep) === 0; }

// Which permission a connection to host needs: 'jibo-apis' (this robot), 'local-network' (home network) or null.
function hostNeeds(host, own) {
    const h = String(host || '').toLowerCase().replace(/^\[|\]$/g, '');
    if (!h || h === 'localhost' || /^127\./.test(h) || /^::ffff:127\./.test(h) || h === '::1' || h === '0.0.0.0' || h === '::' ||
        (own || []).indexOf(h) >= 0) { return 'jibo-apis'; }
    if (/^(10|192\.168|169\.254)\./.test(h) || /^172\.(1[6-9]|2\d|3[01])\./.test(h) || /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./.test(h) ||
        /^f[cd][0-9a-f]{2}:/.test(h) || /^fe[89ab][0-9a-f]:/.test(h) || /\.(local|lan|home|internal)$/.test(h) || !/[.:]/.test(h)) {
        return 'local-network';
    }
    return null;
}

function create(opts) {
    const fs = opts.fs || require('fs');
    const kbRoot = path.resolve(opts.kbRoot || '/opt/jibo/Knowledge');
    const dir = path.resolve(opts.skillsDir || path.join(kbRoot, 'beacon', 'skills', 'packages'));
    const realpath = fs.realpathSync;   // the unguarded original
    const own = () => { try { return opts.ownAddresses ? opts.ownAddresses() : []; } catch (err) { return []; } };
    // File names on the call stack, nearest first. Structured call sites: much cheaper than formatting the text stack,
    // which matters because every fs call Jibo makes passes through here.
    function stack(depth) {
        const limit = Error.stackTraceLimit, prepare = Error.prepareStackTrace, holder = {};
        Error.stackTraceLimit = depth; Error.prepareStackTrace = (e, sites) => sites;
        try { Error.captureStackTrace(holder, stack); var sites = holder.stack; } finally { Error.stackTraceLimit = limit; Error.prepareStackTrace = prepare; }
        return (Array.isArray(sites) ? sites : []).map(s => {
            const f = s.getFileName && s.getFileName();
            return f ? decodeURI(String(f).replace(/^file:\/\//, '')) : '';
        }).filter(f => f && f !== __filename);
    }
    function itemAt(file) {
        if (!inside(dir, file)) { return null; }
        const revision = file.slice(dir.length + 1, dir.length + 25);
        // An old revision still in memory after an update or removal gets no permissions.
        return opts.skills().filter(s => s.revision === revision)[0] || { packageName: '@be/unknown', revision: revision, manifest: {} };
    }
    // The custom skill anywhere on the stack (for Jibo APIs it calls through the SDK), or null.
    function owner() { const f = stack(80).filter(file => inside(dir, file))[0]; return f ? itemAt(f) : null; }
    // The custom skill that is the nearest real caller (for fs, network and programs), or null for Jibo's own code.
    function caller() { const f = stack(24).filter(file => !PASS_THROUGH.test(file))[0]; return f ? itemAt(f) : null; }
    function allowed(item, permission) {
        if ((item.manifest.permissions || []).indexOf(permission) < 0) { return false; }
        if (ONLY_WHILE_OPEN.indexOf(permission) < 0) { return true; }
        const be = opts.be();
        return !!(be && be.currentSkill && be.currentSkill.assetPack === item.packageName);
    }
    function denied(item, permission) {
        return new Error(item.packageName + ' needs the ' + permission + ' permission' +
            (ONLY_WHILE_OPEN.indexOf(permission) >= 0 ? ' and its screen open' : '') + ' to do this');
    }
    function check(item, need) {
        const missing = item && need.filter(p => p && !allowed(item, p))[0];
        if (missing) { throw denied(item, missing); }
    }
    // The permission a file access needs, or null. Symlinks and ".." are resolved first.
    function fileNeeds(item, file, write) {
        let real = path.resolve(String(file));
        try { real = realpath(real); } catch (err) {
            try { real = path.join(realpath(path.dirname(real)), path.basename(real)); } catch (e) { /* a new path */ }
        }
        if (inside(path.join(kbRoot, item.packageName.slice(4)), real)) { return null; }   // its own section
        if (!write && inside(path.join(dir, item.revision), real)) { return null; }        // its own installed files
        if (inside(kbRoot, real)) { return write ? 'edit-kb' : 'read-kb'; }
        return write ? 'edit-jibo-files' : 'read-jibo-files';
    }
    function wrap(target, name, before) {
        const original = target && target[name];
        if (typeof original !== 'function') { return; }
        target[name] = function () { before.call(this, arguments); return original.apply(this, arguments); };
        Object.keys(original).forEach(k => { target[name][k] = original[k]; });
    }
    function guardFs() {
        Object.keys(FS).forEach(name => [name, name + 'Sync'].forEach(fn => wrap(fs, fn, args => {
            const item = caller();
            if (!item) { return; }
            check(item, FS[name].map(spec => {
                const write = spec[1] !== 'flags' ? spec[1] :
                    typeof args[1] === 'number' ? (args[1] & 3) !== 0 : /[wa+]/.test(String(args[1] || 'r'));
                return fileNeeds(item, args[spec[0]], write);
            }));
        })));
    }
    function guardNode() {
        const net = require('net');
        wrap(net.Socket.prototype, 'connect', function (args) {
            const item = caller();
            if (!item) { return; }
            const a = Array.isArray(args[0]) ? args[0] : args;   // Node passes [options, cb] internally
            const o = a[0] && typeof a[0] === 'object' ? a[0] : { port: a[0], host: typeof a[1] === 'string' ? a[1] : 'localhost' };
            if (o.path || (typeof a[0] === 'string' && isNaN(a[0]))) { check(item, ['jibo-apis']); return; }   // a local socket
            check(item, [hostNeeds(o.host || 'localhost', own())]);
            // A DNS name is checked again once it is resolved.
            this.once('lookup', (err, address) => {
                const need = !err && hostNeeds(address, own());
                if (need && !allowed(item, need)) { this.destroy(denied(item, need)); }
            });
        });
        wrap(require('dgram').Socket.prototype, 'send', function (args) {
            const item = caller(), host = Array.prototype.slice.call(args).filter(a => typeof a === 'string')[0];
            if (item) { check(item, [hostNeeds(host || 'localhost', own())]); }
        });
        const cp = require('child_process');
        ['spawn', 'spawnSync', 'exec', 'execSync', 'execFile', 'execFileSync', 'fork'].forEach(fn => wrap(cp, fn, () => {
            const item = caller();
            if (item) { check(item, ['run-programs']); }
        }));
    }
    // Browser-side requests from a skill's page code. file:// URLs are file reads.
    function urlNeeds(item, url, base) {
        let u;
        try { u = new URL(String(url), base || 'file:///'); } catch (err) { return null; }
        if (u.protocol === 'file:') { return fileNeeds(item, decodeURIComponent(u.pathname), false); }
        return /^(https?|wss?):$/.test(u.protocol) ? hostNeeds(u.hostname, own()) : null;
    }
    function guardBrowser(win) {
        if (!win) { return; }
        const base = () => win.location && win.location.href;
        if (typeof win.fetch === 'function') {
            const fetch = win.fetch;
            win.fetch = function (input) {
                const item = caller();
                try { if (item) { check(item, [urlNeeds(item, input && input.url || input, base())]); } } catch (err) { return Promise.reject(err); }
                return fetch.apply(this, arguments);
            };
        }
        if (win.XMLHttpRequest) { wrap(win.XMLHttpRequest.prototype, 'open', args => { const item = caller(); if (item) { check(item, [urlNeeds(item, args[1], base())]); } }); }
        ['WebSocket', 'EventSource'].forEach(name => {
            const Original = win[name];
            if (typeof Original !== 'function') { return; }
            const Guarded = function (url) {
                const item = caller();
                if (item) { check(item, [urlNeeds(item, url, base())]); }
                return new (Function.prototype.bind.apply(Original, [null].concat(Array.prototype.slice.call(arguments))))();
            };
            Guarded.prototype = Original.prototype;
            Object.keys(Original).forEach(k => { Guarded[k] = Original[k]; });
            win[name] = Guarded;
        });
    }
    // Knowledge base API: slices other than the skill's own need read-kb / edit-kb.
    function guardKb(kb) {
        if (!kb) { return; }
        const ownSlice = (item, name) => String(name || '').replace(/^\//, '').split('/')[0] === item.packageName.slice(4);
        const needFor = (db, write) => {
            const item = owner();
            if (item && !ownSlice(item, db.kbName)) { check(item, [write ? 'edit-kb' : 'read-kb']); }
        };
        [kb.KnowledgeDatabase, kb.WebClient].filter(Boolean).forEach(C => {
            ['load', 'loadList', 'loadRoot'].forEach(m => { if (C.prototype.hasOwnProperty(m)) { wrap(C.prototype, m, function () { needFor(this, false); }); } });
            ['save', 'remove'].forEach(m => { if (C.prototype.hasOwnProperty(m)) { wrap(C.prototype, m, function () { needFor(this, true); }); } });
        });
        if (kb.KnowledgeBase) {
            ['createSlice', 'removeSlice', 'removeAll'].forEach(m => wrap(kb.KnowledgeBase.prototype, m, args => {
                const item = owner();
                if (item && (m === 'removeAll' || !ownSlice(item, args[0]))) { check(item, ['edit-kb']); }
            }));
        }
    }
    function guardCall(target, name, permissions) {
        wrap(target, name, args => {
            const item = owner();
            if (item) { check(item, typeof permissions === 'function' ? permissions(args) : permissions); }
        });
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
    // jibo: the SDK; win: the page (window) or null; kb: the jibo-kb module.
    function guard(jibo, win, kb) {
        Object.keys(CALLS).forEach(permission => Object.keys(CALLS[permission]).forEach(api =>
            CALLS[permission][api].forEach(name => guardCall(jibo[api], name, [permission]))));
        EVENTS.jetstream.forEach(name => guardEvent(jibo.jetstream && jibo.jetstream.events && jibo.jetstream.events[name]));
        EVENTS.globalEvents.forEach(name => guardEvent(jibo.globalEvents && jibo.globalEvents[name]));
        guardCall(win && win.navigator && win.navigator.mediaDevices, 'getUserMedia', args => {
            const c = args[0] || {};
            return (c.audio ? ['microphone'] : []).concat(c.video ? ['camera'] : []);
        });
        guardFs(); guardNode(); guardBrowser(win); guardKb(kb);
    }
    return { owner: owner, caller: caller, allowed: allowed, guard: guard, fileNeeds: fileNeeds };
}

module.exports = { PERMISSIONS: PERMISSIONS, hostNeeds: hostNeeds, create: create };
