'use strict';
// Factory reset: a failed loop suspend (5x1 robots have no Jibo Inc loop) must not stop the wipe.
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const src = fs.readFileSync(path.join(__dirname, '../@be/be/node_modules/jibo/lib/jibo.js'), 'utf8');
const start = src.indexOf('function run(parentLog, forceWithoutWifi = false)');
const body = src.slice(src.lastIndexOf('"use strict";', start), src.indexOf('},{"../Runtime":1}]', start));
const calls = [];
const runtime = { instance: {
    systemManager: {
        getMode: (cb) => cb(null, 'normal'),
        setMode: (m, cb) => { calls.push('setMode ' + m); cb(); },
        wipe: (cb) => { calls.push('wipe'); cb(); },
        forceLogs: (cb) => cb(),
        setCredentials: (c, cb) => { calls.push('credentials'); cb(); }
    },
    kb: { loop: { suspend: (cb) => cb(new Error('MissingRequiredParameter: Missing required key loopId in params')) } },
    wifi: { isConnected: () => true, removeAllNetworks: (cb) => { calls.push('wifi'); cb(); } }
} };
const mod = { exports: {} };
new Function('require', 'module', 'exports', body)(() => ({ default: runtime }), mod, mod.exports);
const log = { createChild: () => log, info() {}, warn() {}, error() {} };
mod.exports.default.run(log, false).then(() => {
    assert.deepStrictEqual(calls, ['setMode oobe', 'wipe', 'credentials', 'wifi']);
    console.log('wipe-util ok');
}, (err) => { console.error('wipe rejected:', err.message, calls); process.exit(1); });
