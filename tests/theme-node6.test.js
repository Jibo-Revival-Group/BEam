'use strict';
// Deliberately Node 6 syntax/APIs; this exercises the actual target decoder.
const assert = require('assert');
const pkg = require('../@be/be/beacon/lib/theme-package');
const fixture = require('./theme-fixtures');
const themes = require('../@be/be/beacon/lib/themes');
const operations = require('../@be/be/beacon/lib/theme-operation');
const util = require('../@be/be/beacon/lib/http-util');
const EventEmitter = require('events');
const files = fixture.astra();
pkg.unzip(fixture.zip(files)).then(pkg.validate).then(theme => {
    assert.strictEqual(theme.manifest.name, 'Astra');
    assert.strictEqual(theme.menu.textPlacement.y, 45);
    assert.strictEqual(themes.compare('3.1.5', '3.1.6'), -1);
    return pkg.png(fixture.png(5)).then(() => { throw new Error('Invalid PNG accepted'); }, e => { assert.strictEqual(e.status, 400); });
}).then(() => {
    // A dishonest ZIP expansion declaration must be bounded during inflation.
    const zip = fixture.zip({ 'manifest.json': Buffer.alloc(10000, 32) });
    const central = zip.readUInt32LE(zip.length - 6); zip.writeUInt32LE(1, central + 24);
    return pkg.unzip(zip).then(() => { throw new Error('Expansion limit not enforced'); }, e => { assert.strictEqual(e.status, 400); });
}).then(() => {
    let cancelled = false; let operation;
    return operations.run('Test theme download', 5, token => {
        operation = token; token.onCancel(() => { cancelled = true; }); return new Promise(() => {});
    }).then(() => { throw new Error('Stalled operation accepted'); }, err => {
        assert.strictEqual(err.status, 504); assert(cancelled);
        assert.throws(() => operation.check(), /timed out/);
        const req = new EventEmitter(); req.resume = () => {};
        return util.readBody(req, 100, 5).then(() => { throw new Error('Stalled upload accepted'); }, e => { assert.strictEqual(e.status, 408); });
    });
}).then(() => {
    const animationFiles = Object.assign({}, files, { 'atex/blackeye_blur1.png': fixture.png() });
    return pkg.unzip(fixture.zip(animationFiles)).then(pkg.validate).then(theme => {
        const assets = require('../@be/be/beacon/lib/theme-animation-assets');
        assert.strictEqual(assets.plan(theme)[0].target, 'blackeye_blur1.png');
        assert.strictEqual(assets.lookup(assets.plan(theme), 'atex', '/animations/blackeye_blur1.png').name, 'atex/blackeye_blur1.png');
    });
}).then(() => {
    const manyImages = Object.assign({}, files);
    for (let i = 0; i < 68; i++) { manyImages['atex/large-' + i + '.png'] = files['face/eye.png']; }
    return pkg.validate(manyImages).then(theme => {
        assert.strictEqual(theme.images['atex/large-67.png'].width, 500, 'Texture sets above 64 MB validate on Node 6');
    });
}).then(() => {
    require('../@be/be/beacon/server');
    console.log('Node 6 Astra ZIP/PNG decode, bounded inflation, compatibility, cancellation, upload deadlines and server imports passed');
}).catch(e => { console.error(e); process.exitCode = 1; });
