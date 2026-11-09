'use strict';
// jibo.media.getUserMedia({ audio, video }) for skills (calls, video chat): resolves a standard MediaStream with the
// live mic and Jibo's right camera as a 640x360 video track, ready for webkitRTCPeerConnection.addStream().
// Video is unfiltered preview photos drawn to a canvas: LPS's native VP8 stream sends no bytes on 3.1.x robots,
// while unfiltered previews arrive at ~13 fps (undistort/colour filters cut that to ~3-5 fps).
// Stop with track.stop(); privacy mode refuses the camera and ends a running video track.
const http = require('http');

const WIDTH = 640, HEIGHT = 360;

function isPrivate(jibo) { return !!(jibo.privacyController && jibo.privacyController.enabled); }

function photo(jibo) {
    return jibo.media.takePhoto({ camera: jibo.media.CameraID.RIGHT, photoType: jibo.media.PhotoType.PREVIEW, store: false,
        undistort: false, flip: false, colorCorrection: false }).then(result => new Promise((resolve, reject) => {
        const record = (jibo.records || []).filter(r => r.name === 'media')[0];
        const host = record && record.host !== '0.0.0.0' ? record.host : '127.0.0.1';
        const request = http.get({ host: host, port: record ? Number(record.port) : 8486,
            path: '/media/photo?id=' + encodeURIComponent(result.id) }, response => {
            const chunks = [];
            response.on('data', chunk => chunks.push(chunk));
            response.on('end', () => {
                const bytes = Buffer.concat(chunks);
                if (response.statusCode !== 200 || bytes[0] !== 0xff || bytes[1] !== 0xd8) { reject(new Error('Camera frame unavailable')); }
                else { resolve(bytes); }
            });
        });
        request.on('error', reject);
        request.setTimeout(5000, () => request.abort());
    }));
}

function draw(win, canvas, bytes) {
    return new Promise((resolve, reject) => {
        // A blob URL keeps the canvas untainted; an http:// image from LPS would block captureStream.
        const url = win.URL.createObjectURL(new win.Blob([bytes], { type: 'image/jpeg' }));
        const image = new win.Image();
        image.onload = () => { canvas.getContext('2d').drawImage(image, 0, 0, WIDTH, HEIGHT); win.URL.revokeObjectURL(url); resolve(); };
        image.onerror = () => { win.URL.revokeObjectURL(url); reject(new Error('Camera frame undecodable')); };
        image.src = url;
    });
}

function getUserMedia(jibo, win, constraints) {
    const want = constraints || {};
    if (!want.audio && !want.video) { return Promise.reject(new TypeError('Request audio, video or both')); }
    if (want.video && isPrivate(jibo)) { return Promise.reject(new Error('Privacy mode is on')); }
    const mic = want.audio ? win.navigator.mediaDevices.getUserMedia({ audio: true }) : Promise.resolve(null);
    return mic.then(audio => {
        if (!want.video) { return audio; }
        const canvas = win.document.createElement('canvas');
        canvas.width = WIDTH; canvas.height = HEIGHT;
        // Chrome 53 emits captureStream frames only from a canvas in the page.
        canvas.style.cssText = 'position:fixed;left:0;top:0;width:1px;height:1px;opacity:0.01;pointer-events:none';
        win.document.body.appendChild(canvas);
        const stream = canvas.captureStream(15);
        if (audio) { audio.getAudioTracks().forEach(track => stream.addTrack(track)); }
        const video = stream.getVideoTracks()[0];
        const next = () => {
            if (isPrivate(jibo)) { video.stop(); }
            if (video.readyState !== 'live') { canvas.remove(); return; }
            // Decode/draw overlaps the next capture: sequential draws cut ~13 fps to ~5.
            photo(jibo).then(bytes => { draw(win, canvas, bytes).catch(() => {}); next(); }, () => setTimeout(next, 500));
        };
        next();
        return stream;
    });
}

module.exports = getUserMedia;
