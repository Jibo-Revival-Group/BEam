'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const moduleUnderTest = { exports: {} };
let level = 72.56, authenticated = false;
const dependencies = {
    './camera-stream-http': { authenticate() {
        if (!authenticated) { const error = new Error('Unauthorized'); error.status = 401; throw error; }
    } },
    './http-util': { sendJson(res, status, body) { res.status = status; res.body = body; } },
    jibo: { system: { pluggedIn: false, getBatteryLevel() { if (level === 'throw') { throw new Error('No hardware'); } return level; } } }
};
new Function('require', 'module', 'exports', fs.readFileSync(path.join(__dirname,
    '../@be/be/beacon/lib/battery-http.js'), 'utf8'))(name => dependencies[name], moduleUnderTest, moduleUnderTest.exports);
const res = { setHeader(name, value) { this[name] = value; } };
assert.throws(() => moduleUnderTest.exports.status({}, res), error => error.status === 401);
authenticated = true;
for (const value of [72.56, 0, 100]) {
    level = value;
    moduleUnderTest.exports.status({}, res);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.battery, Math.round(value * 10) / 10);
    assert.strictEqual(res['Cache-Control'], 'no-store');
}
for (const value of [null, undefined, NaN, Infinity, -1, 101, '50', 'throw']) {
    level = value;
    assert.throws(() => moduleUnderTest.exports.status({}, res), error => error.status === 503);
}
level = 18.6;
assert.deepStrictEqual(moduleUnderTest.exports.summary(), { level: 19, pluggedIn: false });
for (const value of [null, 101, 'throw']) {
    level = value;
    assert.strictEqual(moduleUnderTest.exports.summary(), null);
}
console.log('Battery authentication, percentage, unavailable-hardware and status-summary tests passed');
