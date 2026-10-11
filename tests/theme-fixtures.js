'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const pkg = require('../@be/be/beacon/lib/theme-package');
function astra() {
    const files = {};
    pkg.FILES.forEach(n => { const p = path.resolve(__dirname, 'fixtures/astra', n); if (fs.existsSync(p)) { files[n] = fs.readFileSync(p); } });
    return files;
}
function zip(files, options) {
    const opts = options || {}; const locals = []; const central = []; let offset = 0;
    Object.keys(files).forEach(name => {
        const content = files[name]; const bytes = Buffer.from(name); const compressed = opts.stored ? content : zlib.deflateRawSync(content);
        const head = Buffer.alloc(30); head.writeUInt32LE(0x04034b50, 0); head.writeUInt16LE(20, 4);
        head.writeUInt16LE(opts.stored ? 0 : 8, 8); head.writeUInt32LE(pkg.crc32(content), 14);
        head.writeUInt32LE(compressed.length, 18); head.writeUInt32LE(content.length, 22); head.writeUInt16LE(bytes.length, 26);
        const entry = Buffer.alloc(46); entry.writeUInt32LE(0x02014b50, 0); entry.writeUInt16LE(0x314, 4); entry.writeUInt16LE(20, 6);
        entry.writeUInt16LE(opts.stored ? 0 : 8, 10); entry.writeUInt32LE(pkg.crc32(content), 16);
        entry.writeUInt32LE(compressed.length, 20); entry.writeUInt32LE(content.length, 24); entry.writeUInt16LE(bytes.length, 28);
        entry.writeUInt32LE(opts.symlink === name ? 0xa1ff0000 : 0x81a40000, 38); entry.writeUInt32LE(offset, 42);
        locals.push(head, bytes, compressed); central.push(entry, bytes); offset += head.length + bytes.length + compressed.length;
    });
    const directory = Buffer.concat(central); const end = Buffer.alloc(22); const count = Object.keys(files).length;
    end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(count, 8); end.writeUInt16LE(count, 10);
    end.writeUInt32LE(directory.length, 12); end.writeUInt32LE(offset, 16);
    return Buffer.concat(locals.concat([directory, end]));
}
function png(filter) {
    function chunk(type, data) { const n = Buffer.from(type); const out = Buffer.alloc(12 + data.length); out.writeUInt32BE(data.length, 0); n.copy(out, 4); data.copy(out, 8); out.writeUInt32BE(pkg.crc32(Buffer.concat([n, data])), 8 + data.length); return out; }
    const header = Buffer.alloc(13); header.writeUInt32BE(1, 0); header.writeUInt32BE(1, 4); header[8] = 8; header[9] = 6;
    return Buffer.concat([Buffer.from('89504e470d0a1a0a', 'hex'), chunk('IHDR', header), chunk('IDAT', zlib.deflateSync(Buffer.from([filter || 0, 255, 255, 255, 255]))), chunk('IEND', Buffer.alloc(0))]);
}
module.exports = { astra: astra, zip: zip, png: png };
