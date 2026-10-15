'use strict';
const assert = require('assert'), zlib = require('zlib');
const pkg = require('../@be/be/beacon/lib/theme-package');
function chunk(type, data) {
    const tag = Buffer.from(type), out = Buffer.alloc(data.length + 12);
    out.writeUInt32BE(data.length, 0); tag.copy(out, 4); data.copy(out, 8);
    out.writeUInt32BE(pkg.crc32(Buffer.concat([tag, data])), data.length + 8); return out;
}
// Each compact grayscale PNG represents 16 MiB when expanded to RGBA by the renderer.
function image() {
    const header = Buffer.alloc(13); header.writeUInt32BE(2048, 0); header.writeUInt32BE(2048, 4); header[8] = 8;
    return Buffer.concat([Buffer.from('89504e470d0a1a0a', 'hex'), chunk('IHDR', header),
        chunk('IDAT', zlib.deflateSync(Buffer.alloc(2048 * 2049))), chunk('IEND', Buffer.alloc(0))]);
}
async function run() {
    const png = image(), files = { 'manifest.json': Buffer.from('{"name":"Large texture set","version":"1.0.0","type":"theme"}') };
    for (let i = 0; i < 16; i++) { files['atex/image-' + i + '.png'] = png; }
    assert.strictEqual(Object.keys((await pkg.validate(files)).images).length, 16, 'Exactly 256 MiB of pixels is accepted');
    files['atex/over-budget.png'] = png;
    await assert.rejects(pkg.validate(files), err => err.status === 400 && /256 MB limit.*272 MB at atex\/over-budget.png/.test(err.message));
    delete files['atex/over-budget.png'];
    assert.strictEqual(Object.keys((await pkg.validate(files)).images).length, 16, 'Validation succeeds after a failed attempt');
    console.log('Decoded theme image budget accepts sets above 64 MiB and exactly 256 MiB, rejects over-budget sets with details, and recovers for retry');
}
run().catch(err => { console.error(err); process.exitCode = 1; });
