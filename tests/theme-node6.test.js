'use strict';
// Deliberately Node 6 syntax/APIs; this exercises the actual target decoder.
const assert = require('assert');
const pkg = require('../@be/be/beacon/lib/theme-package');
const fixture = require('./theme-fixtures');
const themes = require('../@be/be/beacon/lib/themes');
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
    require('../@be/be/beacon/server');
    console.log('Node 6 Astra ZIP/PNG decode, bounded inflation, compatibility and server imports passed');
}).catch(e => { console.error(e); process.exitCode = 1; });
