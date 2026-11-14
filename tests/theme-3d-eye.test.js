'use strict';
// The built-in 3D Eye theme: applied like None (no package), saved across restarts, started and stopped with the theme.
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const themes = require('../@be/be/beacon/lib/themes');
const fixture = require('./theme-fixtures');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'jibo-theme-3d-eye-'));
const log = [];
const runtime = { status: () => ({ live: true }), start(restore) { this.restore = restore; },
    prepare(theme) { return Promise.resolve({ theme }); }, apply(prepared, commit) { if (commit) commit(); log.push('apply ' + (prepared.theme ? prepared.theme.manifest.name : 'stock')); return Promise.resolve(); } };
const eye = { ID: '3d-eye', start() { log.push('eye start'); }, stop() { log.push('eye stop'); } };
const store = { catalog: () => Promise.resolve([]) };
function manager() { return themes.create({ root, runtime, store, eye3d: eye, version: () => '3.1.9' }); }
async function run() {
    const m = manager();
    let inv = await m.activate('3d-eye');
    assert.strictEqual(inv.active, '3d-eye');
    assert.deepStrictEqual(log, ['apply stock', 'eye start'], 'the stock look underneath, then the 3D eye');
    assert.deepStrictEqual(JSON.parse(fs.readFileSync(path.join(root, 'state.json'), 'utf8')).active, { id: '3d-eye', builtin: true });

    log.length = 0; manager().start(); await runtime.restore();
    assert.deepStrictEqual(log, ['apply stock', 'eye start'], 'restored after a restart');

    log.length = 0; inv = await m.activate(null);
    assert.strictEqual(inv.active, null); assert.deepStrictEqual(log, ['apply stock', 'eye stop'], 'None turns it off');

    const installed = await m.upload(fixture.zip(fixture.astra()));
    await m.activate('3d-eye'); log.length = 0;
    inv = await m.activate(installed.installed);
    assert.strictEqual(inv.active, installed.installed); assert.deepStrictEqual(log, ['apply Astra', 'eye stop'], 'another theme replaces it');

    await m.activate('3d-eye');
    inv = await m.remove(installed.installed);
    assert.strictEqual(inv.active, '3d-eye', 'removing a package theme leaves the 3D Eye on');
    await assert.rejects(m.activate('3d-eyes'), /Use a theme ID or null for None/);
    console.log('theme-3d-eye ok');
}
run().catch(err => { console.error(err); process.exit(1); });
