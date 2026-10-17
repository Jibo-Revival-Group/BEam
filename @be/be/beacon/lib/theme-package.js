'use strict';

// Bounded ZIP/PNG decoding using only Node 6 built-ins. No archive tools or code execution.
const zlib = require('zlib');
const crypto = require('crypto');
const MAX_ZIP = 32 * 1024 * 1024;
const MAX_EXPANDED = 64 * 1024 * 1024;
// PNG files can be small on disk while a full set of animation textures exceeds 64 MB in RGBA.
const MAX_DECODED_IMAGES = 256 * 1024 * 1024;
const FILES = ['manifest.json', 'README.md', 'banner.png', 'face/face.json', 'face/eye.png',
    'face/eyeClosed.png', 'face/eyeListening.png', 'face/background.png', 'menu/menu.json', 'menu/button.png'];
function assetPath(name) {
    return typeof name === 'string' && name.length <= 512 && !/[\\:\u0000-\u001f]/.test(name) &&
        name.split('/').every(p => p && p !== '.' && p !== '..') &&
        (/^icons\/[^/]+\.(png|svg)$/.test(name) || /^atex\/.+\.png$/.test(name) || /^asfx\/.+\.(wav|mp3|m4a|ogg|oga|aif)$/i.test(name));
}
function accepted(name) { return FILES.indexOf(name) !== -1 || assetPath(name); }
function audio(buf, name) {
    if (!Buffer.isBuffer(buf) || buf.length < 12 || buf.length > 16 * 1024 * 1024) { throw fail('Invalid or oversized animation sound: ' + name); }
    const ext = name.split('.').pop().toLowerCase();
    const tag = buf.toString('ascii', 0, 4);
    const valid = ext === 'wav' ? tag === 'RIFF' && buf.toString('ascii', 8, 12) === 'WAVE' && buf.readUInt32LE(4) + 8 === buf.length :
        ext === 'aif' ? tag === 'FORM' && /^(AIFF|AIFC)$/.test(buf.toString('ascii', 8, 12)) :
        ext === 'ogg' || ext === 'oga' ? tag === 'OggS' && buf[4] === 0 :
        ext === 'm4a' ? buf.toString('ascii', 4, 8) === 'ftyp' && buf.readUInt32BE(0) >= 12 && buf.readUInt32BE(0) <= buf.length :
        ext === 'mp3' ? buf.toString('ascii', 0, 3) === 'ID3' || (buf[0] === 255 && (buf[1] & 0xe0) === 0xe0) : false;
    if (!valid) { throw fail('Invalid animation sound format: ' + name); }
}

function fail(message) { const e = new Error(message); e.status = 400; return e; }
const crcTable = [];
for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) { c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; }
    crcTable[n] = c >>> 0;
}
function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) { c = crcTable[(c ^ buf[i]) & 255] ^ (c >>> 8); }
    return (c ^ 0xffffffff) >>> 0;
}
function inflate(buf, limit, raw, name) {
    return new Promise((resolve, reject) => {
        // Larger output chunks reduce worker/event-loop round trips on Jibo.
        const options = { chunkSize: 256 * 1024 };
        const stream = raw ? zlib.createInflateRaw(options) : zlib.createInflate(options);
        const chunks = []; let size = 0; let done = false;
        let timer;
        function watch() {
            clearTimeout(timer);
            timer = setTimeout(() => abort(fail('Package decoding stalled for 30 seconds. You can retry.')), 30000);
        }
        function abort(err) { if (!done) { done = true; clearTimeout(timer); chunks.length = 0; stream.close(); reject(fail((name ? name + ': ' : '') + err.message)); } }
        watch();
        stream.on('error', abort);
        stream.on('close', () => { if (!done) { abort(fail('Theme image/archive decoding was interrupted')); } });
        stream.on('data', chunk => {
            if (done) { return; }
            size += chunk.length;
            if (size > limit) { abort(fail('Expanded data exceeds the theme limit')); }
            else { chunks.push(chunk); watch(); }
        });
        stream.on('end', () => { if (!done) { done = true; clearTimeout(timer); resolve(Buffer.concat(chunks, size)); } });
        stream.end(buf);
    });
}
function unzip(buf, options) {
    const skill = !!(options && options.skill);
    if (!Buffer.isBuffer(buf) || buf.length < 22 || buf.length > MAX_ZIP) {
        return Promise.reject(fail('Theme ZIP must be at most 32 MB'));
    }
    try {
        let end = -1;
        for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65557); i--) {
            if (buf.readUInt32LE(i) === 0x06054b50 && i + 22 + buf.readUInt16LE(i + 20) === buf.length) { end = i; break; }
        }
        if (end < 0 || buf.readUInt16LE(end + 4) || buf.readUInt16LE(end + 6)) { throw fail('Invalid or multi-volume ZIP'); }
        const count = buf.readUInt16LE(end + 10);
        const centralSize = buf.readUInt32LE(end + 12);
        const centralStart = buf.readUInt32LE(end + 16);
        if (!count || count > 1024 || count !== buf.readUInt16LE(end + 8) || centralStart + centralSize !== end) {
            throw fail('Invalid ZIP directory or too many files');
        }
        const records = []; const names = Object.create(null); let pos = centralStart; let total = 0;
        for (let i = 0; i < count; i++) {
            if (pos + 46 > end || buf.readUInt32LE(pos) !== 0x02014b50) { throw fail('Invalid ZIP entry'); }
            const flags = buf.readUInt16LE(pos + 8); const method = buf.readUInt16LE(pos + 10);
            const crc = buf.readUInt32LE(pos + 16); const packed = buf.readUInt32LE(pos + 20);
            const size = buf.readUInt32LE(pos + 24); const len = buf.readUInt16LE(pos + 28);
            const extra = buf.readUInt16LE(pos + 30); const comment = buf.readUInt16LE(pos + 32);
            const local = buf.readUInt32LE(pos + 42);
            if (pos + 46 + len + extra + comment > end || flags & 1 || (method !== 0 && method !== 8) || buf.readUInt16LE(pos + 34)) {
                throw fail('Unsupported ZIP encoding');
            }
            const name = buf.slice(pos + 46, pos + 46 + len).toString('utf8');
            const pieces = name.split('/');
            if (!name || name.length > 512 || /[\\:\u0000-\u001f\ufffd]/.test(name) || name[0] === '/' ||
                pieces.some((p, j) => p === '..' || p === '.' || (!p && j !== pieces.length - 1))) { throw fail('Unsafe ZIP path'); }
            const canonical = name.replace(/\/$/, '').toLowerCase();
            if (names[canonical]) { throw fail('Duplicate ZIP path'); }
            const kind = (buf.readUInt32LE(pos + 38) >>> 16) & 0xf000;
            if (kind && kind !== 0x8000 && kind !== 0x4000) { throw fail('ZIP links and special files are not allowed'); }
            const directory = kind === 0x4000 || name.endsWith('/') || !!(buf.readUInt32LE(pos + 38) & 16);
            names[canonical] = { directory: directory };
            if (!skill && /\.(js|mjs|cjs|sh|bash|bat|cmd|exe|dll|so|py|php|html)$/i.test(name)) { throw fail('Executable theme content is not allowed'); }
            total += size;
            if (total > MAX_EXPANDED || local + 30 > centralStart || buf.readUInt32LE(local) !== 0x04034b50) { throw fail('Invalid or oversized ZIP'); }
            const localLen = buf.readUInt16LE(local + 26); const localExtra = buf.readUInt16LE(local + 28);
            const start = local + 30 + localLen + localExtra;
            if (buf.readUInt16LE(local + 6) !== flags || buf.readUInt16LE(local + 8) !== method ||
                buf.slice(local + 30, local + 30 + localLen).toString('utf8') !== name || start + packed > centralStart) { throw fail('Inconsistent ZIP entry'); }
            records.push({ name: name, directory: directory, start: start, end: start + packed, local: local, size: size, crc: crc, method: method });
            pos += 46 + len + extra + comment;
        }
        if (pos !== end) { throw fail('Invalid ZIP directory size'); }
        Object.keys(names).forEach(name => {
            const pieces = name.split('/');
            for (let i = 1; i < pieces.length; i++) {
                const parent = names[pieces.slice(0, i).join('/')];
                if (parent && !parent.directory) { throw fail('ZIP file conflicts with a directory'); }
            }
        });
        const ordered = records.slice().sort((a, b) => a.local - b.local);
        for (let i = 1; i < ordered.length; i++) { if (ordered[i].local < ordered[i - 1].end) { throw fail('Overlapping ZIP entries'); } }
        const roots = records.filter(r => !r.directory && (r.name === 'manifest.json' || /^[^/]+\/manifest\.json$/.test(r.name)));
        if (roots.length !== 1) { throw fail('ZIP needs one root manifest.json, optionally inside one folder'); }
        const prefix = roots[0].name.slice(0, -'manifest.json'.length);
        if (!skill && records.some(r => /\.svg$/i.test(r.name) && (r.name.indexOf(prefix) !== 0 || !/^icons\/[^/]+\.svg$/.test(r.name.slice(prefix.length))))) { throw fail('SVGs are only supported in icons/'); }
        const out = Object.create(null);
        return records.reduce((chain, r) => chain.then(() => {
            const packed = buf.slice(r.start, r.end);
            return (r.method === 8 ? inflate(packed, r.size, true, r.name) : Promise.resolve(packed)).then(data => {
                if (data.length !== r.size || crc32(data) !== r.crc) { throw fail('ZIP checksum or size mismatch'); }
                const rel = r.name.slice(prefix.length);
                if (!skill && r.name.indexOf(prefix) === 0 && /^(atex|asfx|icons)\//.test(rel) && !rel.endsWith('/') && !assetPath(rel)) { throw fail('Unsupported animation asset: ' + rel); }
                if (r.name.indexOf(prefix) === 0 && rel && !r.directory && (skill || accepted(rel))) { out[rel] = data; }
            });
        }), Promise.resolve()).then(() => out);
    } catch (err) { return Promise.reject(err.status ? err : fail('Malformed ZIP')); }
}
function json(buf, name) {
    try {
        if (!buf || buf.length > 65536) { throw new Error(); }
        const data = JSON.parse(buf.toString('utf8'));
        if (!data || typeof data !== 'object' || Array.isArray(data)) { throw new Error(); }
        return data;
    } catch (err) { throw fail('Invalid ' + name); }
}
function version(value) { return typeof value === 'string' && /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(value); }
function manifest(buf) {
    const m = json(buf, 'manifest.json');
    if (typeof m.name !== 'string' || !m.name.trim() || m.name.length > 120 || /[\u0000-\u001f]/.test(m.name) ||
        !version(m.version) || (m.supported !== undefined && !version(m.supported)) || ['theme', 'skill'].indexOf(m.type) < 0) {
        throw fail('Manifest requires name, semantic version, type, and an optional supported minimum jibo-tbd version');
    }
    const out = { name: m.name.trim(), version: m.version, supported: m.supported || null, type: m.type };
    if (m.type === 'skill') {
        if (m.themes !== undefined && typeof m.themes !== 'boolean') { throw fail('themes must be true or false'); }
        out.themes = m.themes !== false;
        const colors = m.buttonColor === undefined ? ['#58BCEB', '#246487'] : typeof m.buttonColor === 'string' ? m.buttonColor.trim().split(/\s+/) : m.buttonColor;
        if (!Array.isArray(colors) || colors.length < 1 || colors.length > 2 || colors.some(c => typeof c !== 'string' || !/^#[0-9a-f]{6}$/i.test(c))) { throw fail('buttonColor needs one or two #RRGGBB colors'); }
        out.buttonColor = colors.length === 1 ? [colors[0], colors[0]] : colors;
    }
    return out;
}
function placement(value) {
    if (typeof value !== 'string') { throw fail('Placement must look like x0 y45'); }
    const tokens = value.trim().split(/\s+/); const out = {};
    tokens.forEach(t => {
        const m = t.match(/^([xy])(-?\d+(?:\.\d+)?)$/i);
        if (!m || out[m[1].toLowerCase()] !== undefined || Math.abs(Number(m[2])) > 50) { throw fail('Placement coordinates must be between -50 and 50'); }
        out[m[1].toLowerCase()] = Number(m[2]);
    });
    if (tokens.length !== 2 || out.x === undefined || out.y === undefined) { throw fail('Placement requires x and y'); }
    return out;
}
function config(buf, name, defaults) {
    const c = buf ? json(buf, name) : {};
    Object.keys(c).forEach(k => { if (!Object.prototype.hasOwnProperty.call(defaults, k)) { throw fail('Unknown ' + name + ' field: ' + k); } });
    const out = Object.assign({}, defaults, c);
    Object.keys(out).forEach(k => {
        if (!Object.prototype.hasOwnProperty.call(defaults, k)) { throw fail('Unknown ' + name + ' field: ' + k); }
        if (/Size$/.test(k) && (typeof out[k] !== 'number' || !isFinite(out[k]) || out[k] <= 0 || out[k] > 1000)) { throw fail(k + ' must be greater than 0 and at most 1000'); }
        if (/Placement$/.test(k)) { out[k] = placement(out[k]); }
        if (k === 'backgroundColor' && !/^#[0-9a-f]{6}$/i.test(out[k])) { throw fail('backgroundColor must be #RRGGBB'); }
        if (k === 'menuType' && out[k] !== 'native' && out[k] !== 'dynamic') { throw fail('menuType must be native or dynamic'); }
        if (k === 'buttonColors' && typeof out[k] !== 'boolean') { throw fail('buttonColors must be true or false'); }
    });
    return out;
}
function png(buf, name) {
    try {
        if (!buf || buf.length < 45 || buf.length > 16 * 1024 * 1024 || buf.slice(0, 8).toString('hex') !== '89504e470d0a1a0a') { throw fail('Invalid PNG'); }
        let p = 8; let header = null; let palette = 0; let ended = false; const data = []; let idatEnded = false;
        while (p + 12 <= buf.length) {
            const len = buf.readUInt32BE(p); const type = buf.slice(p + 4, p + 8).toString('ascii');
            if (p + 12 + len > buf.length || crc32(buf.slice(p + 4, p + 8 + len)) !== buf.readUInt32BE(p + 8 + len)) { throw fail('Invalid PNG checksum'); }
            const chunk = buf.slice(p + 8, p + 8 + len);
            if (!header && type !== 'IHDR') { throw fail('PNG header is missing'); }
            if (type === 'IHDR') {
                if (header || len !== 13) { throw fail('Invalid PNG header'); }
                header = { width: chunk.readUInt32BE(0), height: chunk.readUInt32BE(4), depth: chunk[8], color: chunk[9], interlace: chunk[12] };
                const depths = { 0: [1, 2, 4, 8, 16], 2: [8, 16], 3: [1, 2, 4, 8], 4: [8, 16], 6: [8, 16] };
                if (!header.width || !header.height || header.width > 4096 || header.height > 4096 || !depths[header.color] ||
                    depths[header.color].indexOf(header.depth) < 0 || chunk[10] || chunk[11] || header.interlace > 1) { throw fail('Unsupported PNG dimensions or encoding'); }
            } else if (type === 'PLTE') {
                if (palette || data.length || !len || len > 768 || len % 3) { throw fail('Invalid PNG palette'); } palette = len / 3;
            } else if (type === 'IDAT') {
                if (idatEnded) { throw fail('Invalid PNG data order'); } data.push(chunk);
            } else if (type === 'IEND') {
                if (len) { throw fail('Invalid PNG end'); } ended = true; p += 12; break;
            } else {
                if (data.length) { idatEnded = true; }
                if (type[0] === type[0].toUpperCase()) { throw fail('Unsupported PNG critical chunk'); }
            }
            p += 12 + len;
        }
        if (!ended || p !== buf.length || !data.length || (header.color === 3 && !palette)) { throw fail('Incomplete PNG'); }
        const channels = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[header.color]; const rows = [];
        const passes = header.interlace ? [[0,0,8,8], [4,0,8,8], [0,4,4,8], [2,0,4,4], [0,2,2,4], [1,0,2,2], [0,1,1,2]] : [[0,0,1,1]];
        let expected = 0;
        passes.forEach(pass => {
            const w = Math.max(0, Math.ceil((header.width - pass[0]) / pass[2])); const h = Math.max(0, Math.ceil((header.height - pass[1]) / pass[3]));
            if (w && h) { const stride = Math.ceil(w * channels * header.depth / 8) + 1; rows.push({ stride: stride, count: h, width: w }); expected += stride * h; }
        });
        if (expected > MAX_EXPANDED) { throw fail('Decoded image exceeds 64 MB'); }
        return inflate(Buffer.concat(data), expected, false, name).then(raw => {
            if (raw.length !== expected) { throw fail('Invalid decoded PNG size'); }
            let offset = 0;
            const bpp = Math.max(1, Math.ceil(channels * header.depth / 8));
            rows.forEach(pass => {
                let previous = header.color === 3 ? Buffer.alloc(pass.stride - 1) : null;
                for (let i = 0; i < pass.count; i++) {
                    const filter = raw[offset++]; if (filter > 4) { throw fail('Invalid PNG filter'); }
                    // Only palette images need reconstructed pixels to validate
                    // their indices. Truecolor/grayscale samples cannot be invalid.
                    if (header.color !== 3) { offset += pass.stride - 1; continue; }
                    const row = Buffer.alloc(pass.stride - 1);
                    for (let x = 0; x < row.length; x++) {
                        const left = x >= bpp ? row[x - bpp] : 0; const above = previous[x]; const corner = x >= bpp ? previous[x - bpp] : 0;
                        let prediction = 0;
                        if (filter === 1) { prediction = left; } else if (filter === 2) { prediction = above; }
                        else if (filter === 3) { prediction = Math.floor((left + above) / 2); }
                        else if (filter === 4) {
                            const p = left + above - corner; const a = Math.abs(p - left); const b = Math.abs(p - above); const c = Math.abs(p - corner);
                            prediction = a <= b && a <= c ? left : b <= c ? above : corner;
                        }
                        row[x] = (raw[offset++] + prediction) & 255;
                    }
                    if (header.color === 3) {
                        const mask = (1 << header.depth) - 1;
                        for (let x = 0; x < pass.width; x++) {
                            const bit = x * header.depth; const index = (row[bit >>> 3] >>> (8 - header.depth - bit % 8)) & mask;
                            if (index >= palette) { throw fail('PNG references a missing palette color'); }
                        }
                    }
                    previous = row;
                }
            });
            return { width: header.width, height: header.height };
        });
    } catch (err) { return Promise.reject(err.status ? err : fail('Malformed PNG')); }
}
function validate(files) {
    if (Object.keys(files).length > 1024) { throw fail('Theme has too many files'); }
    Object.keys(files).forEach(name => { if (!accepted(name)) { throw fail('Unsupported theme file: ' + name); } });
    if (Object.keys(files).reduce((total, name) => total + files[name].length, 0) > MAX_EXPANDED) { return Promise.reject(fail('Theme exceeds 64 MB expanded')); }
    const m = manifest(files['manifest.json']);
    if (m.type !== 'theme') { throw fail('Custom skill installation is not available yet'); }
    const face = config(files['face/face.json'], 'face.json', { backgroundColor: '#000000', eyeSize: 100 });
    const menu = config(files['menu/menu.json'], 'menu.json', { menuType: 'native', buttonColors: false, backgroundColor: '#000000', buttonSize: 42, iconSize: 70, textSize: 15, iconPlacement: 'x0 y0', textPlacement: 'x0 y-40' });
    const images = {}; let decodedSize = 0;
    const animationAssets = Object.keys(files).filter(n => assetPath(n) && !n.startsWith('icons/'));
    const icons = Object.keys(files).filter(n => n.startsWith('icons/'));
    const targets = Object.create(null);
    icons.forEach(n => {
        const target = n.slice(6).replace(/\.(png|svg)$/, '');
        if (targets[target]) { throw fail('Duplicate icon target: ' + n); } targets[target] = true;
    });
    animationAssets.filter(n => n.indexOf('asfx/') === 0).forEach(n => audio(files[n], n));
    return Object.keys(files).filter(n => /\.(png|svg)$/.test(n)).reduce((chain, n) => chain.then(() => Promise.resolve().then(() => /\.svg$/.test(n) ? require('./theme-svg')(files[n], n) : png(files[n], n)).then(size => {
        const raster = /\.svg$/.test(n) ? require('./theme-svg').rasterSize(size) : size;
        decodedSize += raster.width * raster.height * 4;
        if (decodedSize > MAX_DECODED_IMAGES) {
            throw fail('Decoded theme images exceed the 256 MB limit (' + Math.ceil(decodedSize / (1024 * 1024)) + ' MB at ' + n + '). Reduce image dimensions or remove unused textures.');
        }
        images[n] = size;
    })), Promise.resolve()).then(() => ({
        id: crypto.createHash('sha256').update(m.name.toLowerCase()).digest('hex').slice(0, 24),
        manifest: m, face: face, menu: menu, images: images, animationAssets: animationAssets, icons: icons,
        hasFace: Object.keys(files).some(n => n.indexOf('face/') === 0),
        hasMenu: Object.keys(files).some(n => n.indexOf('menu/') === 0),
        readme: files['README.md'] ? files['README.md'].toString('utf8').slice(0, 256 * 1024) : ''
    }));
}
module.exports = { MAX_ZIP: MAX_ZIP, FILES: FILES, unzip: unzip, validate: validate,
    accepted: accepted, assetPath: assetPath, audio: audio,
    manifest: manifest, png: png, crc32: crc32, placement: placement, fail: fail };
