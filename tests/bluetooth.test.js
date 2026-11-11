'use strict';
// Bluetooth speaker mode (beacon/lib/bluetooth.js). Node 6: /root/node6/node-v6.17.1-linux-x64/bin/node tests/bluetooth.test.js
const assert = require('assert');
const fs = require('fs');
const net = require('net');
const os = require('os');
const path = require('path');

const sock = path.join(os.tmpdir(), 'jibo-bluetooth-test-' + process.pid + '.sock');
process.env.JIBO_BLUETOOTH_SOCKET = sock;
const bt = require('../@be/be/beacon/lib/bluetooth');

// Volume mapping: Jibo 1-10 <-> AVRCP 0-127, both ends exact and every Jibo level survives a round trip.
const v = { MIN_VOLUME: 1, MAX_VOLUME: 10 };
assert.strictEqual(bt.toPhone(1, v), 0);
assert.strictEqual(bt.toPhone(10, v), 127);
assert.strictEqual(bt.toJibo(0, v), 1);
assert.strictEqual(bt.toJibo(127, v), 10);
for (let level = 1; level <= 10; level++) assert.strictEqual(bt.toJibo(bt.toPhone(level, v), v), level);

const seen = [];
try { fs.unlinkSync(sock); } catch (err) {}
const server = net.createServer((c) => {
    let data = '';
    c.on('data', (chunk) => {
        data += chunk;
        if (data.indexOf('\n') < 0) return;
        seen.push(data.trim());
        c.end('{"ok":true}\n');
    });
});

function fakes () {
    const opened = [];
    const host = { currentSkill: { assetPack: '@be/idle' }, ensureSkill: (name) => ({ assetPack: name }),
        redirect: (data) => { opened.push(data.skill.assetPack); } };
    const volume = { MIN_VOLUME: 1, MAX_VOLUME: 10, currentVolume: 4, set: [],
        _setVolume () { this.set.push(this.currentVolume); this._volumeChanging = false; } };
    function Data (skill) { this.skill = skill; }
    return { host, volume, opened, Data };
}
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

server.listen(sock, () => {
    const f = fakes(), state = { connected: false };
    const status = (extra) => Object.assign({ connected: true, volume: -1, volumeSeq: 0 }, extra);
    Promise.resolve()
        // Not connected: nothing happens.
        .then(() => { bt.step({ connected: false }, f.host, f.volume, state, f.Data); assert.deepStrictEqual(f.opened, []); })
        // A phone connects: Bluetooth mode opens and the phone's slider gets Jibo's volume (4 -> 42).
        .then(() => { bt.step(status(), f.host, f.volume, state, f.Data); assert.deepStrictEqual(f.opened, ['@be/bluetooth']); })
        .then(() => wait(50)).then(() => assert.deepStrictEqual(seen, ['volume 42']))
        // Still switching: no second redirect.
        .then(() => { bt.step(status(), f.host, f.volume, state, f.Data); assert.deepStrictEqual(f.opened, ['@be/bluetooth']); })
        // In Bluetooth mode: stays, nothing redirected.
        .then(() => { f.host.currentSkill = { assetPack: '@be/bluetooth' }; state.redirected = 0; bt.step(status(), f.host, f.volume, state, f.Data); assert.deepStrictEqual(f.opened, ['@be/bluetooth']); })
        // The phone's slider moves to max: Jibo's volume follows, silently through the plugin's setter.
        .then(() => { bt.step(status({ volume: 127, volumeSeq: 1 }), f.host, f.volume, state, f.Data); assert.deepStrictEqual(f.volume.set, [10]); assert.strictEqual(state.fromPhone, 10); })
        // Same report again: nothing new.
        .then(() => { bt.step(status({ volume: 127, volumeSeq: 1 }), f.host, f.volume, state, f.Data); assert.deepStrictEqual(f.volume.set, [10]); })
        // Something else takes the screen while connected: back to Bluetooth mode.
        .then(() => { f.host.currentSkill = { assetPack: '@be/main-menu' }; bt.step(status({ volume: 127, volumeSeq: 1 }), f.host, f.volume, state, f.Data); assert.deepStrictEqual(f.opened, ['@be/bluetooth', '@be/bluetooth']); })
        // Disconnected, then a new phone: its slider is set from Jibo again.
        .then(() => { seen.length = 0; bt.step({ connected: false }, f.host, f.volume, state, f.Data); f.volume.currentVolume = 1; bt.step(status({ volumeSeq: 5 }), f.host, f.volume, state, f.Data); })
        .then(() => wait(50)).then(() => assert.deepStrictEqual(seen, ['volume 0']))
        .then(() => bt.setEnabled(true)).then(() => bt.setEnabled(false)).then(() => bt.disconnect())
        .then(() => assert.deepStrictEqual(seen.slice(1), ['on', 'off', 'disconnect']))
        .then(() => new Promise((resolve) => server.close(resolve)))
        // No daemon: a clear error, not a hang.
        .then(() => bt.status().then(() => assert.fail('should reject'), (err) => assert(/isn’t available/.test(err.message))))
        .then(() => console.log('bluetooth: ok'))
        .catch((err) => { console.error(err); process.exitCode = 1; try { server.close(); } catch (e) {} });
});
