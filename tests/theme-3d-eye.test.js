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
const real = require('../@be/be/beacon/lib/eye3d');
const eye = { ID: '3d-eye', themeOptions: real.themeOptions,
    start(opts) { log.push(opts ? 'eye start ' + Object.keys(opts).filter(k => opts[k]).map(k => k + '=' + path.basename(opts[k])).join(' ') : 'eye start'); },
    stop() { log.push('eye stop'); } };
// A binary glTF 2.0 header with an empty JSON chunk: enough for package validation.
function glb() {
    const json = Buffer.from('{"asset":{"version":"2.0"}}  '), out = Buffer.alloc(20 + json.length);
    out.writeUInt32LE(0x46546c67, 0); out.writeUInt32LE(2, 4); out.writeUInt32LE(out.length, 8);
    out.writeUInt32LE(json.length, 12); out.writeUInt32LE(0x4e4f534a, 16); json.copy(out, 20); return out;
}
function themed(name, face, extra) {
    const files = Object.assign(fixture.astra(), extra || {});
    files['manifest.json'] = Buffer.from(JSON.stringify(Object.assign(JSON.parse(files['manifest.json']), { name: name })));
    files['face/face.json'] = Buffer.from(JSON.stringify(face));
    return fixture.zip(files);
}
const store = { catalog: () => Promise.resolve([]) };
function manager() { return themes.create({ root, runtime, store, eye3d: eye, version: () => '3.1.9' }); }
const installed2 = r => r.installed;
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

    // Themes can turn on 3D mode: their eye picture on the ball, or on their own model.
    const sphere = await m.upload(themed('Sphere Pic', { eye3d: true }));
    log.length = 0; await m.activate(sphere.installed);
    assert.deepStrictEqual(log, ['apply Sphere Pic', 'eye start texture=eye.png'], 'eye3d theme: its eye.png on the ball');
    const modelled = await m.upload(themed('Model Pic', { eye3d: true }, { 'face/eye.glb': glb() }));
    log.length = 0; await m.activate(modelled.installed);
    assert.deepStrictEqual(log, ['apply Model Pic', 'eye start texture=eye.png model=eye.glb'], 'eye3d theme with a model');
    log.length = 0; manager().start(); await runtime.restore();
    assert.deepStrictEqual(log, ['apply Model Pic', 'eye start texture=eye.png model=eye.glb'], 'themed 3D restored after a restart');
    log.length = 0; await m.activate(installed2(await m.upload(themed('Flat Pic', {}))));
    assert.deepStrictEqual(log, ['apply Flat Pic', 'eye stop'], 'themes without eye3d stay flat');

    await assert.rejects(m.upload(themed('Bad Model', {}, { 'face/eye.glb': glb() })), /needs "eye3d": true/);
    await assert.rejects(m.upload(themed('Bad Flag', { eye3d: 'yes' })), /eye3d must be true or false/);
    await assert.rejects(m.upload(themed('Not GLB', { eye3d: true }, { 'face/eye.glb': Buffer.from('solid obj file, not a glb.') })), /binary glTF 2.0/);
    console.log('theme-3d-eye ok');
}
run().catch(err => { console.error(err); process.exit(1); });
