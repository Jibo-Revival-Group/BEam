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

// The download step runs without Jibo Inc account keys (it crashed on notepad.accessKey.accessKeyId).
const otaNotepad = { accessKey: null, log: { error() {} }, maskUpdater: { updateMask() {} },
    oobeMC: { icons: { loadingIcon: { gotoAndStop() {} }, loadingText: { textfield: {} } } } };
let downloaded = false;
const ota = require(path.join(dir, 'ota-download'))({ loaderIcons: [], app: { animator: { play() {} } },
    updater: { download(creds, status, done) { downloaded = true; done(true); } } }, otaNotepad, {}, null);
Object.keys(ota).forEach((k) => { if (ota[k].name === 'progress bar and download') ota[k].options.exec(() => {}, () => {}); });
assert.ok(downloaded && otaNotepad.otaComplete, 'OTA download step completes without account keys');

// Already on Wi-Fi (PM leaves the owner's network): no picker, and the join step doesn't drop the network.
(function () {
    const removed = [];
    const wifi = { getCurrentNetwork(cb) { cb(null, { ssid: 'Home', strength: 80 }); },
        removeAllNetworks(cb) { removed.push('all'); cb(); }, addNetwork(d, t, cb) { removed.push('add'); cb(); } };
    const fake = Module._load;
    Module._load = function (request) { return request === 'jibo' ? { wifi: wifi } : fake.apply(this, arguments); };
    delete require.cache[require.resolve(path.join(dir, 'config'))];
    const np = { log: { info() {}, iferr() {} } }, bb = { timer: { start() {} }, unbungler: { isItBroke() {}, notBroke() {} } };
    const t = require(path.join(dir, 'config'))(bb, np, {}, null);
    Module._load = fake;
    const realPick = picker.pick;
    picker.pick = () => { throw new Error('picker must not open when Jibo is already on Wi-Fi'); };
    t['1536421699826126'].options.exec();
    let ok = 0;
    t['5x1-pick-network'].options.exec(() => ok++);
    t['45123520-be0f-45fb-859b-4cd532c3a274'].options.exec(() => ok++);
    assert.strictEqual(ok, 2);
    assert.deepStrictEqual(removed, [], 'no removeAllNetworks/addNetwork');
    assert.strictEqual(np.ssid, 'Home');
    assert.strictEqual(np.networkConnected, true);
    // Not connected (or the call fails): the picker opens.
    let opened = 0;
    picker.pick = () => { opened++; };
    wifi.getCurrentNetwork = (cb) => cb(new Error('Not Connected'));
    t['1536421699826126'].options.exec();
    t['5x1-pick-network'].options.exec(() => {});
    assert.strictEqual(opened, 1);
    assert.strictEqual(np.alreadyConnected, false);
    picker.pick = realPick;
})();

// No network list (stock services have no /get_scan_results): type the name, then a password or No password.
(function () {
    function node() {
        return { style: {}, dataset: {}, children: [], textContent: '', listeners: {},
            get firstChild() { return this.children[0]; },
            appendChild(c) { this.children.push(c); c.parent = this; return c; },
            removeChild(c) { this.children.splice(this.children.indexOf(c), 1); },
            addEventListener(n, f) { (this.listeners[n] = this.listeners[n] || []).push(f); } };
    }
    const body = node();
    global.document = { body: body, createElement: node };
    global.XMLHttpRequest = function () {
        this.open = () => {};
        this.send = () => { this.responseText = '<html>404</html>'; this.onload(); };
    };
    const root = () => body.children[0];
    const tap = (text) => {
        const hit = root().children.find((c) => c.textContent === text && c.listeners.click);
        assert.ok(hit, 'no button "' + text + '" on screen: ' + root().children.map((c) => c.textContent).join('|'));
        hit.listeners.click[0]();
    };
    const type = (text) => text.split('').forEach((ch) => {
        const hit = root().children.find((c) => c.textContent === ch && c.listeners.click);
        hit.listeners.click[0]();
    });
    delete require.cache[require.resolve(path.join(dir, 'network-picker'))];
    const fresh = require(path.join(dir, 'network-picker'));  // the earlier steps stubbed pick()
    const chosen = [];
    fresh.pick((choice) => chosen.push(choice));
    assert.ok(root().children.some((c) => c.textContent === 'No Wi-Fi networks found'));
    tap('Type a name'); type('home'); tap('Next');
    type('secret'); tap('Join');
    assert.strictEqual(chosen.length, 0, 'Join waits for 8 characters');
    type('xy'); tap('Join');
    assert.deepStrictEqual(chosen, [{ ssid: 'home', password: 'secretxy' }]);
    fresh.pick((choice) => chosen.push(choice));
    tap('Type a name'); type('cafe'); tap('Next'); tap('No password');
    assert.deepStrictEqual(chosen[1], { ssid: 'cafe', password: '' });
    assert.strictEqual(body.children.length, 0, 'the picker layer is removed');
})();

console.log('oobe-network-picker ok');
