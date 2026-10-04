'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'jibo-camera-settings-'));
function load() {
    const loaded = { exports: {} };
    new Function('require', 'module', 'exports', fs.readFileSync(path.join(__dirname,
        '../@be/be/beacon/lib/camera-stream-settings.js'), 'utf8'))(
        name => name === './paths' ? { dataDir: () => directory, ensureDir() {} } : require(name), loaded, loaded.exports);
    return loaded.exports;
}
try {
    const settings = load();
    assert.strictEqual(settings.get(), true, 'Existing installations remain enabled');
    settings.set(false);
    assert.strictEqual(load().get(), false, 'Disabled preference survives restart');
    settings.set(true);
    assert.strictEqual(load().get(), true);
    for (const value of [undefined, null, 'false', 0]) {
        assert.throws(() => settings.set(value), error => error.status === 400);
    }
    fs.writeFileSync(path.join(directory, 'camera-stream-settings.json'), 'invalid');
    assert.strictEqual(settings.get(), false, 'Corrupt settings fail closed');
    console.log('Camera stream preference persistence and validation tests passed');
} finally { fs.rmSync(directory, { recursive: true, force: true }); }
