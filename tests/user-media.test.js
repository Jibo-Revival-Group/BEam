'use strict';
// jibo.media.getUserMedia: mic + camera MediaStream for skills, with photo frames drawn to a canvas.
const assert = require('assert');
const http = require('http');
const getUserMedia = require('../@be/be/lib/user-media');

const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3]);
const server = http.createServer((req, res) => {
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
        console.log('getUserMedia: mic, camera frames, stop and privacy passed');
    })().catch(e => { console.error(e); process.exitCode = 1; }).then(() => server.close());
});
