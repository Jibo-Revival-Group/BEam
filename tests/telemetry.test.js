'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');
let allowed = false, hatch = 0, sockets = [], failFan = false, cpu = 50;
class Socket extends EventEmitter {
    constructor(url) {
        super();
        assert.strictEqual(url, 'ws://127.0.0.1:8282/misc');
        sockets.push(this);
        process.nextTick(() => this.emit('message', JSON.stringify({ hatch_open: hatch })));
    }
    terminate() { this.terminated = true; }
}
const dependencies = {
    './camera-stream-http': { authenticate() { if (!allowed) { throw new Error('Unauthorized'); } } },
    './http-util': { sendJson(res, status, body) { res.body = body; res.status = status; } },
    ws: Socket,
    jibo: { records: [{ name: 'body', host: '0.0.0.0', port: 8282 }], system: {
        pluggedIn: false, getBatteryLevel: () => 75, getBatteryTemperature: () => 30,
        getMainBoardTemperature: () => 40, getCPUTemperature: () => cpu, getSystemVoltage: () => 12.1,
        getFanSpeed(callback) { callback(failFan ? new Error('Fan offline') : null, 0.25); },
        getMasterVolume(callback) { callback(null, 0.6); }
    } }
};
const loaded = { exports: {} };
new Function('require', 'module', 'exports', fs.readFileSync(path.join(__dirname,
    '../@be/be/beacon/lib/telemetry-http.js'), 'utf8'))(name => dependencies[name], loaded, loaded.exports);
async function run() {
    const res = { setHeader() {} };
    assert.throws(() => loaded.exports.status({}, res), /Unauthorized/);
    assert.strictEqual(sockets.length, 0);
    allowed = true;
    await loaded.exports.status({}, res);
    assert.deepStrictEqual(res.body, { battery: 75, battery_temperature: 30, main_board_temperature: 40,
        cpu_temperature: 50, system_voltage: 12.1, plugged_in: false, fan_speed: 25,
        speaker_volume: 60, hatch_open: false });
    assert(sockets.every(socket => socket.terminated));
    hatch = 1; failFan = true; cpu = NaN;
    await loaded.exports.status({}, res);
    assert.strictEqual(res.body.hatch_open, true);
    assert.strictEqual(res.body.fan_speed, null);
    assert.strictEqual(res.body.cpu_temperature, null);
    assert.strictEqual(res.body.speaker_volume, 60);
    assert(sockets.every(socket => socket.terminated));
    console.log('Telemetry authentication, units, hatch initialization, partial failures and cleanup tests passed');
}
run().catch(error => { console.error(error); process.exitCode = 1; });
