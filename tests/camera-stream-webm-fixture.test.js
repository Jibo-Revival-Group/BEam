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
    ffmpeg(['-f', 'lavfi', '-i', 'testsrc2=size=1280x720:rate=15', '-t', '4',
        '-c:v', 'libvpx', '-g', '15', '-an', '-f', 'webm', '-live', '1', input]);
    const parser = new WebM();
    const parts = [];
    const liveParts = [];
    let keyframes = 0;
    parser.on('cluster', (cluster, key) => {
        if (!liveParts.length) { liveParts.push(parser.init); }
        let sizeLength = 1, marker = 128;
        while (!(cluster[4] & marker)) { sizeLength++; marker >>= 1; }
        liveParts.push(Buffer.concat([Buffer.from('1f43b675ff', 'hex'), cluster.slice(4 + sizeLength)]));
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
    const live = new WebM(), late = [];
    let liveKeys = 0;
    live.on('cluster', (bytes, key, join) => {
        if (key) { liveKeys++; }
        if (liveKeys < 2) { return; }
        if (!late.length) { late.push(live.init, join || bytes); }
        else { late.push(bytes); }
    });
    const liveBytes = Buffer.concat(liveParts);
    for (let offset = 0; offset < liveBytes.length; offset += 37) {
        live.push(liveBytes.slice(offset, offset + 37));
    }
    fs.writeFileSync(joined, Buffer.concat(late));
    const liveProgress = ffmpeg(['-i', joined, '-an', '-progress', 'pipe:1', '-f', 'null', '-']);
    const liveCounts = Array.from(liveProgress.matchAll(/frame=(\d+)/g), match => Number(match[1]));
    assert(liveCounts[liveCounts.length - 1] >= 15, 'Open-ended native clusters must decode for late viewers');
    if (process.env.GSTREAMER_BINARY) {
        const gstInput = path.join(directory, 'gstreamer.webm');
        const generated = spawnSync(process.env.GSTREAMER_BINARY, ['-q', 'videotestsrc', 'num-buffers=45',
            '!', 'video/x-raw,width=640,height=360,framerate=15/1', '!', 'vp8enc', 'keyframe-max-dist=15',
            '!', 'webmmux', 'streamable=true', '!', 'filesink', 'location=' + gstInput], { timeout: 20000 });
        if (generated.error) { throw generated.error; }
        assert.strictEqual(generated.status, 0, String(generated.stderr));
        const gst = new WebM(), gstPackets = [];
        let keys = 0;
        gst.on('cluster', (bytes, key, join) => {
            if (key) { keys++; }
            if (keys < 2) { return; }
            if (!gstPackets.length) { gstPackets.push(gst.init, join || bytes); }
            else { gstPackets.push(bytes); }
        });
        const gstBytes = fs.readFileSync(gstInput);
        for (let offset = 0; offset < gstBytes.length; offset += 37) {
            gst.push(gstBytes.slice(offset, offset + 37));
        }
        assert(keys >= 2, 'GStreamer fixture contains multiple keyframes');
        fs.writeFileSync(joined, Buffer.concat(gstPackets));
        const decoded = ffmpeg(['-i', joined, '-an', '-progress', 'pipe:1', '-f', 'null', '-']);
        const frames = Array.from(decoded.matchAll(/frame=(\d+)/g), match => Number(match[1]));
        assert(frames[frames.length - 1] >= 15, 'Actual GStreamer output supports late-viewer decoding');
        const repeated = new WebM(), continuous = [];
        let waiting = true, resets = 0;
        repeated.on('reset', () => { waiting = true; resets++; });
        repeated.on('cluster', (packet, key, join) => {
            if (waiting) {
                if (!key) { return; }
                continuous.push(repeated.init, join || packet);
                waiting = false;
            } else { continuous.push(packet); }
        });
        const repeatedBytes = Buffer.concat([gstBytes, gstBytes]);
        for (let offset = 0; offset < repeatedBytes.length; offset += 37) {
            repeated.push(repeatedBytes.slice(offset, offset + 37));
        }
        assert.strictEqual(resets, 1);
        fs.writeFileSync(joined, Buffer.concat(continuous));
        const continuousProgress = ffmpeg(['-i', joined, '-an', '-progress', 'pipe:1', '-f', 'null', '-']);
        const continuousFrames = Array.from(continuousProgress.matchAll(/frame=(\d+)/g), match => Number(match[1]));
        assert.strictEqual(continuousFrames[continuousFrames.length - 1], 90,
            'An existing viewer must decode both complete GStreamer segments');
        console.log('Real GStreamer WebM late-join decoding test passed');
    }
    console.log('Real original-resolution VP8/WebM bounded and live late-join decoding tests passed');
} finally {
    fs.rmSync(directory, { recursive: true, force: true });
}
