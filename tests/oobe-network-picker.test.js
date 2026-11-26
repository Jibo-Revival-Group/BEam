'use strict';
// 5x1 OOBE: Wi-Fi is picked on screen (no QR code from Jibo Inc's app) and no Jibo Inc account is created.
const assert = require('assert');
const Module = require('module');
const path = require('path');

const load = Module._load;
Module._load = function (request) {
    if (request === 'jibo') return {};
    if (request === '@jibo/jibo-server-client') throw new Error('OOBE must not use the Jibo Inc server client');
    return load.apply(this, arguments);
};
const dir = path.join(__dirname, '../oobe-config/behaviors/oobe');
const picker = require(path.join(dir, 'network-picker'));

// Keyboard: same keys as Settings › New Wi-Fi.
let s = { text: '', shift: false, symbols: false, more: false };
const key = (name) => { s = picker.press(s, name); };
const tap = (r, c) => { s = picker.press(s, picker.keyText(s, r, c)); };
key('shift'); tap(0, 0); tap(1, 0);
key('symbols'); tap(0, 0); key('shift'); tap(1, 6);
assert.strictEqual(s.text, 'Qa1$');
for (let i = 0; i < 80; i++) key('x');
assert.strictEqual(s.text.length, picker.MAX);

// The Wi-Fi subtree runs the on-screen picker, then the original join and result steps; no QR steps.
const reachable = (tree) => {
    const seen = [];
    (function walk(id) { const n = tree[String(id)]; if (!n) return; seen.push(n); (n.children || []).forEach(walk); })(1);
    return seen;
};
const config = reachable(require(path.join(dir, 'config'))({}, {}, {}, null));
const names = config.map((n) => n.name || n.class);
assert.ok(names.indexOf('pick a Wi-Fi network on screen') >= 0, 'network picker is in the Wi-Fi subtree');
assert.ok(names.indexOf('add, set and connect new network') > names.indexOf('pick a Wi-Fi network on screen'));
assert.ok(!config.some((n) => n.class === 'ReadBarcode' || n.name === 'Parse QR data'), 'no QR scanning');

// The picker's choice becomes the network the original join step adds.
global.document = {};
const notepad = {}, blackboard = { timer: { start() {} } };
const tree = require(path.join(dir, 'config'))(blackboard, notepad, {}, null);
picker.pick = (cb) => cb({ ssid: 'Home', password: 'hunter22' });
let picked = false;
tree['5x1-pick-network'].options.exec(() => { picked = true; });
assert.ok(picked);
assert.deepStrictEqual([notepad.ssid, notepad.password, notepad.staticSettings], ['Home', 'hunter22', null]);

// Cloud init no longer creates a Jibo Inc account: the robot counts as authorized (BEnch credentials point at BEaker).
const result = {}, cloudNotepad = { log: { info() {}, iferr() {} } };
const cloud = require(path.join(dir, 'cloud-init'))({ region: 'api' }, cloudNotepad, result, null);
reachable(cloud).forEach((n) => { if (n.options && n.options.exec) n.options.exec(() => {}, () => {}); });
assert.strictEqual(result.cloudAuthorized, true);
assert.ok(!reachable(cloud).some((n) => /create an account/.test(n.name || '')), 'no Jibo Inc account step');

console.log('oobe-network-picker ok');
