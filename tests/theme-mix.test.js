'use strict';
// Advanced mode: one theme's eye, another's menus, another's sounds & animation art, applied as one mixed theme.
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const themes = require('../@be/be/beacon/lib/themes');
const fixture = require('./theme-fixtures');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'jibo-theme-mix-'));
let applied = null; const log = [];
const runtime = { status: () => ({ live: true }), start(restore) { this.restore = restore; },
    prepare(theme, dir) { return Promise.resolve({ theme, dir }); },
    apply(prepared, commit) { if (commit) commit(); applied = prepared; return Promise.resolve(); } };
const real = require('../@be/be/beacon/lib/eye3d');
const eye = { ID: '3d-eye', themeOptions: real.themeOptions, start(o) { log.push(o ? 'eye themed' : 'eye builtin'); }, stop() { log.push('eye stop'); } };
const store = { catalog: () => Promise.resolve([]) };
const manager = () => themes.create({ root, runtime, store, eye3d: eye, version: () => '3.1.9' });
const BLOOP = fs.readFileSync(path.resolve(__dirname, '../@be/be/node_modules/jibo-anim-db-animations/audio/device/ds_bloop_01.mp3'));
// A theme whose files say which theme they came from.
function pack(name, face, menu, sound) {
    const files = fixture.astra();
    files['manifest.json'] = Buffer.from(JSON.stringify(Object.assign(JSON.parse(files['manifest.json']), { name })));
    files['face/face.json'] = Buffer.from(JSON.stringify(face));
    files['menu/menu.json'] = Buffer.from(JSON.stringify(menu));
    files['asfx/' + sound] = BLOOP;          // stock sound names: a theme's sounds replace Jibo's own
    return fixture.zip(files);
}
async function run() {
    const m = manager();
    const a = (await m.upload(pack('Eye Theme', { eyeSize: 150 }, { buttonSize: 30 }, 'sfx_blip_01.mp3'))).installed;
    const b = (await m.upload(pack('Menu Theme', { eyeSize: 60 }, { buttonSize: 77 }, 'sfx_tick_01.mp3'))).installed;
    const c = (await m.upload(pack('Sound Theme', { eyeSize: 80 }, { buttonSize: 50 }, 'ds_bloop_01.mp3'))).installed;

    let inv = await m.activate('mix', { eye: a, menu: b, extras: c });
    const t = applied.theme;
    assert.strictEqual(inv.active, 'mix');
    assert.deepStrictEqual(inv.mix, { eye: a, menu: b, extras: c, parts: ['Eye Theme', 'Menu Theme', 'Sound Theme'] });
    assert.strictEqual(t.face.eyeSize, 150, 'eye from Eye Theme'); assert.strictEqual(t.menu.buttonSize, 77, 'menus from Menu Theme');
    assert.deepStrictEqual(t.animationAssets.map(n => n.name || n), ['asfx/ds_bloop_01.mp3'], 'sounds from Sound Theme only');
    const files = [];
    (function walk(d, rel) { fs.readdirSync(d).forEach(n => { const f = path.join(d, n); if (fs.statSync(f).isDirectory()) walk(f, rel + n + '/'); else files.push(rel + n); }); })(applied.dir, '');
    assert.deepStrictEqual(files.sort(), ['asfx/ds_bloop_01.mp3', 'face/eye.png', 'face/eyeClosed.png', 'face/face.json', 'menu/button.png', 'menu/menu.json', 'theme.json']);
    assert.strictEqual(JSON.parse(fs.readFileSync(path.join(applied.dir, 'face/face.json'))).eyeSize, 150, 'the files are the eye theme\'s');
    assert.strictEqual(JSON.parse(fs.readFileSync(path.join(applied.dir, 'menu/menu.json'))).buttonSize, 77);
    const firstDir = applied.dir;

    // Parts can be stock, and the eye can be the built-in 3D Eye.
    log.length = 0; inv = await m.activate('mix', { eye: '3d-eye', menu: null, extras: a });
    assert.strictEqual(applied.theme.hasFace, false); assert.strictEqual(applied.theme.hasMenu, false);
    assert.deepStrictEqual(applied.theme.animationAssets.map(n => n.name || n), ['asfx/sfx_blip_01.mp3']);
    assert.deepStrictEqual(log, ['eye builtin']);
    assert(!fs.existsSync(firstDir), 'the previous mix is cleaned up');

    // Survives a restart; removing a source theme leaves the mix working.
    await m.remove(a); log.length = 0; applied = null;
    manager().start(); await runtime.restore();
    assert.strictEqual(applied.theme.id, 'mix'); assert(fs.existsSync(path.join(applied.dir, 'asfx/sfx_blip_01.mp3')));
    assert.deepStrictEqual(log, ['eye builtin'], 'the 3D Eye comes back with the mix');

    await assert.rejects(m.activate('mix', { eye: 'nope' }), /Theme not found for eye/);
    await assert.rejects(m.activate('mix', { menu: '3d-eye' }), /Theme not found for menu/);
    await assert.rejects(m.activate('mix', { sky: b }), /Choose themes for eye, menu and extras/);
    await assert.rejects(m.activate('mix'), /Choose themes/);
    inv = await m.activate(null); assert.strictEqual(inv.mix, null);
    console.log('theme-mix ok');
}
run().catch(err => { console.error(err); process.exit(1); });
