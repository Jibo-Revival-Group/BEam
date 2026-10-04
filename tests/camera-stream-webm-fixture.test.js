'use strict';

// Optional real codec check: FFMPEG_BINARY=/path/to/ffmpeg node this-file.js
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const spawnSync = require('child_process').spawnSync;
const WebM = require('../@be/be/beacon/lib/camera-stream-webm');
const binary = process.env.FFMPEG_BINARY || 'ffmpeg';
const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'jibo-webm-test-'));

function ffmpeg(args) {
    const result = spawnSync(binary, ['-hide_banner', '-loglevel', 'error'].concat(args), { timeout: 20000 });
    if (result.error) { throw result.error; }
    assert.strictEqual(result.status, 0, String(result.stderr));
    return String(result.stdout);
}

try {
    const input = path.join(directory, 'source.webm');
    const joined = path.join(directory, 'joined.webm');
    ffmpeg(['-f', 'lavfi', '-i', 'testsrc2=size=640x360:rate=15', '-t', '4',
        '-c:v', 'libvpx', '-g', '15', '-an', '-f', 'webm', '-live', '1', input]);
    const parser = new WebM();
    const parts = [];
    let keyframes = 0;
    parser.on('cluster', (cluster, key) => {
        if (key) { keyframes++; }
        if (keyframes < 2) { return; }
        if (!parts.length) { parts.push(parser.init); }
        parts.push(cluster);
    });
    const bytes = fs.readFileSync(input);
    for (let offset = 0; offset < bytes.length; offset += 37) {
        parser.push(bytes.slice(offset, offset + 37));
    }
    assert(keyframes >= 2, 'Fixture must contain multiple keyframe clusters');
    assert.strictEqual(parser.buffer.length, 0, 'All EBML elements must be consumed');
    fs.writeFileSync(joined, Buffer.concat(parts));
    const progress = ffmpeg(['-i', joined, '-an', '-progress', 'pipe:1', '-f', 'null', '-']);
    const counts = Array.from(progress.matchAll(/frame=(\d+)/g), match => Number(match[1]));
    assert(counts[counts.length - 1] >= 15, 'A late viewer must decode actual video frames');
    console.log('Real VP8/WebM late-join decoding test passed');
} finally {
    fs.rmSync(directory, { recursive: true, force: true });
}
