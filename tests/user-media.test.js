'use strict';
// jibo.media.getUserMedia: mic + camera MediaStream for skills, with photo frames drawn to a canvas.
const assert = require('assert');
const http = require('http');
const net = require('net');
const getUserMedia = require('../@be/be/lib/user-media');

const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3]);
const posts = [];
let startStatus = 204;
const server = http.createServer((req, res) => {
    if (req.method === 'POST') { posts.push(req.url); res.writeHead(req.url === '/media/streaming/start' ? startStatus : 204); res.end(); return; }
    assert(/^\/media\/photo\?id=p\d+$/.test(req.url), req.url);
    res.writeHead(200); res.end(jpeg);
});

function track(kind) { return { kind: kind, readyState: 'live', stop() { this.readyState = 'ended'; } }; }
function fixture(port) {
    const drawn = [], photos = [], attached = [];
    const jibo = { records: [{ name: 'media', host: '0.0.0.0', port: port }], privacyController: { enabled: false },
        media: { CameraID: { RIGHT: 1 }, PhotoType: { PREVIEW: 1 },
            takePhoto(options) { photos.push(options); return Promise.resolve({ id: 'p' + photos.length }); } } };
    const mic = { getAudioTracks: () => [track('audio')] };
    const win = {
        navigator: { mediaDevices: { getUserMedia: c => { assert.deepStrictEqual(c, { audio: true }); return Promise.resolve(mic); } } },
        document: { body: { appendChild: c => attached.push(c) }, createElement: () => ({ style: {}, remove() { attached.splice(attached.indexOf(this), 1); }, getContext: () => ({ drawImage: (img, x, y, w, h) => drawn.push([img.src, w, h]) }),
            captureStream(fps) { assert.strictEqual(fps, 15); const tracks = [track('video')];
                return { tracks: tracks, getVideoTracks: () => tracks.filter(t => t.kind === 'video'), addTrack: t => tracks.push(t) }; } }) },
        Blob: function (parts, options) { assert.strictEqual(options.type, 'image/jpeg'); assert(parts[0].equals(jpeg)); },
        URL: { createObjectURL: () => 'blob:frame', revokeObjectURL() {} },
        Image: function () { const img = this; Object.defineProperty(img, 'src', { set(v) { img._src = v; setImmediate(img.onload); }, get() { return img._src; } }); }
    };
    return { jibo, win, mic, drawn, photos, attached };
}
const wait = ms => new Promise(r => setTimeout(r, ms));

server.listen(0, '127.0.0.1', () => {
    const port = server.address().port;
    (async () => {
        let f = fixture(port);
        assert.strictEqual(await getUserMedia(f.jibo, f.win, { audio: true }), f.mic, 'Audio only is the live mic');
        await assert.rejects(getUserMedia(f.jibo, f.win, {}), /audio, video or both/);

        const stream = await getUserMedia(f.jibo, f.win, { audio: true, video: true });
        assert.deepStrictEqual(stream.tracks.map(t => t.kind), ['video', 'audio'], 'One stream carries camera and mic');
        await wait(100);
        assert(f.drawn.length >= 3, 'Frames keep coming: ' + f.drawn.length);
        assert.deepStrictEqual(f.drawn[0], ['blob:frame', 640, 360]);
        assert.deepStrictEqual(f.photos[0], { camera: 1, photoType: 1, store: false, undistort: false, flip: false, colorCorrection: false });
        stream.getVideoTracks()[0].stop(); await wait(30); const after = f.photos.length; await wait(60);
        assert.strictEqual(f.photos.length, after, 'Stopping the track stops the camera');
        assert.strictEqual(f.attached.length, 0, 'The hidden canvas leaves the page when the track stops');

        f = fixture(port); f.jibo.privacyController.enabled = true;
        await assert.rejects(getUserMedia(f.jibo, f.win, { video: true }), /Privacy/);
        f.jibo.privacyController.enabled = false;
        const live = await getUserMedia(f.jibo, f.win, { video: true });
        assert.strictEqual(f.attached.length, 1, 'Chrome 53 needs the canvas in the page to emit frames');
        await wait(30); f.jibo.privacyController.enabled = true; await wait(60);
        assert.strictEqual(live.getVideoTracks()[0].readyState, 'ended', 'Privacy mode ends a running camera');

        // getCameraStream: LPS's hardware WebM, passed through untouched.
        const sockets = [];
        const camera = net.createServer(socket => { sockets.push(socket); socket.on('error', () => {}); socket.write(Buffer.from([0x1a, 0x45, 0xdf, 0xa3])); setTimeout(() => socket.write(Buffer.from([1, 2])), 20); });
        await new Promise(r => camera.listen(0, '127.0.0.1', r));
        getUserMedia.getCameraStream.PORT = camera.address().port;
        const camStream = getUserMedia.getCameraStream;
        f = fixture(port);
        const got = [];
        const cam = await camStream(f.jibo, bytes => got.push(bytes));
        assert.strictEqual(cam.mimeType, 'video/webm; codecs="vp8"');
        await wait(60);
        assert.deepStrictEqual(Buffer.concat(got), Buffer.from([0x1a, 0x45, 0xdf, 0xa3, 1, 2]), 'Bytes arrive in order, header first');
        await assert.rejects(camStream(f.jibo, () => {}), /in use/, 'LPS has one pipeline; a second stream would cut off the first');
        cam.stop(); await wait(40);
        assert.deepStrictEqual(posts, ['/media/streaming/start', '/media/streaming/control'], 'Stop ends the LPS pipeline');
        assert(sockets[0].destroyed || await new Promise(r => sockets[0].on('close', () => r(true))));

        f.jibo.cameraStreamController = { enabled: true };
        await assert.rejects(camStream(f.jibo, () => {}), /in use/, 'The Home Assistant camera stream holds the pipeline');
        f.jibo.cameraStreamController = { enabled: false };
        const priv = await camStream(f.jibo, () => {});
        f.jibo.privacyController.enabled = true; await wait(600);
        assert.strictEqual(posts.length, 4, 'Privacy mode stops a running stream');
        await assert.rejects(camStream(f.jibo, () => {}), /Privacy/);
        f.jibo.privacyController.enabled = false;
        priv.stop();

        startStatus = 500; posts.length = 0;
        await assert.rejects(camStream(f.jibo, () => {}), /HTTP 500/);
        await wait(30);
        assert.deepStrictEqual(posts, ['/media/streaming/start', '/media/streaming/control'], 'A failed start is cleaned up');
        startStatus = 204;
        (await camStream(f.jibo, () => {})).stop();
        camera.close(); sockets.forEach(x => x.destroy());
        console.log('getUserMedia + getCameraStream: mic, camera frames, hardware stream, stop and privacy passed');
    })().catch(e => { console.error(e); process.exitCode = 1; }).then(() => server.close());
});
