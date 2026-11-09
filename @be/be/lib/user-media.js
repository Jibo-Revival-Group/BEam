'use strict';
// Camera and mic for skills (calls, video chat).
// jibo.media.getUserMedia({ audio, video }): a standard MediaStream with the live mic and a 640x360 video track
// (unfiltered preview photos drawn to a canvas, ~6-7 fps through WebRTC: Chrome 53 can't push canvas frames faster).
// jibo.media.getCameraStream(onData): smooth 1280x720 VP8 WebM (~25 fps) straight from LPS's hardware encoder, with no
// decode or re-encode on Jibo. Send the bytes over an RTCDataChannel and play them with MediaSource on the other end.
// Privacy mode refuses the camera and ends running video.
const http = require('http');
const net = require('net');

const WIDTH = 640, HEIGHT = 360;
let pipelineBusy = false; // LPS runs one media pipeline; starting another silently stops the first.

function isPrivate(jibo) { return !!(jibo.privacyController && jibo.privacyController.enabled); }

function request(jibo, method, path, body) {
    return new Promise((resolve, reject) => {
        const record = (jibo.records || []).filter(r => r.name === 'media')[0];
        const req = http.request({ host: record && record.host !== '0.0.0.0' ? record.host : '127.0.0.1', port: record ? Number(record.port) : 8486,
            path: path, method: method, headers: body ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } : {} }, response => {
            const chunks = [];
            response.on('data', chunk => chunks.push(chunk));
            response.on('end', () => response.statusCode < 300 ? resolve(Buffer.concat(chunks)) : reject(new Error('Camera service HTTP ' + response.statusCode)));
        });
        req.on('error', reject);
        req.setTimeout(5000, () => req.abort());
        req.end(body);
    });
}

function photo(jibo) {
    return jibo.media.takePhoto({ camera: jibo.media.CameraID.RIGHT, photoType: jibo.media.PhotoType.PREVIEW, store: false,
        undistort: false, flip: false, colorCorrection: false })
        .then(result => request(jibo, 'GET', '/media/photo?id=' + encodeURIComponent(result.id)))
        .then(bytes => { if (bytes[0] !== 0xff || bytes[1] !== 0xd8) { throw new Error('Camera frame unavailable'); } return bytes; });
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

// Resolves { mimeType, stop } once LPS's encoder is connected; onData(Buffer) then receives the WebM byte stream in
// order, starting with its header, until stop(), privacy mode, or the stream ends.
function getCameraStream(jibo, onData) {
    if (isPrivate(jibo)) { return Promise.reject(new Error('Privacy mode is on')); }
    if (pipelineBusy || (jibo.cameraStreamController && jibo.cameraStreamController.enabled)) { return Promise.reject(new Error('Camera is in use')); }
    pipelineBusy = true;
    let socket = null, stopped = false;
    const privacy = setInterval(() => { if (isPrivate(jibo)) { stop(); } }, 500);
    const stop = () => {
        if (stopped) { return; }
        stopped = true;
        clearInterval(privacy);
        if (socket) { socket.destroy(); }
        request(jibo, 'POST', '/media/streaming/control', '{}').catch(() => {}).then(() => { pipelineBusy = false; });
    };
    return request(jibo, 'POST', '/media/streaming/start', '{"enable":true}').then(() => new Promise((resolve, reject) => {
        let tries = 0;
        const connect = () => {
            if (stopped) { return; }
            socket = net.connect({ host: '127.0.0.1', port: getCameraStream.PORT });
            socket.on('connect', () => resolve({ mimeType: 'video/webm; codecs="vp8"', stop: stop }));
            socket.on('data', bytes => { if (!stopped) { onData(bytes); } });
            socket.on('end', stop);
            socket.on('error', error => {
                if (error.code === 'ECONNREFUSED' && ++tries < 30) { setTimeout(connect, 100); return; }
                stop(); reject(error);
            });
        };
        connect();
    })).catch(error => { stop(); throw error; });
}
getCameraStream.PORT = 5000; // hard-coded in LPS's StreamingStartHandler; AirPlay is moved off it in music/airplay/airplay.conf

module.exports = getUserMedia;
module.exports.getCameraStream = getCameraStream;
