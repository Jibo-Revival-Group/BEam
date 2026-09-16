'use strict';

/**
 * Remote view + control of Jibo's 1280×720 face from BEacon.
 *
 * While the face is painting, frames are copied from the WebGL canvas (plus
 * video / extra canvas / img layers) into a 640×360 JPEG. That is much faster
 * than Electron capturePage, which is only a fallback. Input prefers Chromium
 * sendInputEvent so DOM click handlers fire; otherwise it dispatches mouse/touch
 * events. Pointer batches keep swipes dense enough for Hammer.
 */

const WIDTH = 1280;
const HEIGHT = 720;
const OUT_W = 640;
const OUT_H = 360;
const JPEG_QUALITY = 42;
const CAPTURE_TIMEOUT_MS = 3000;
const FRESH_MS = 30;
const STREAM_INTERVAL_MS = 32;
const BLIT_STALE_MS = 250;
const BATCH_MAX = 40;

let inflight = null;
let latestJpeg = null;
let latestAt = 0;
let blitCanvas = null;
let blitCtx = null;
let latestBlitAt = 0;
let hooked = false;

function fail (message, status) {
    const err = new Error(message);
    err.status = status || 400;
    return err;
}

function clamp (value, min, max) {
    const n = Number(value);
    if (!isFinite(n)) { return min; }
    return Math.max(min, Math.min(max, Math.round(n)));
}

function getJibo () {
    if (typeof window === 'undefined' && typeof document === 'undefined') {
        return null;
    }
    try {
        return require('jibo');
    } catch (err) {
        return null;
    }
}

function getElectronWindow () {
    try {
        const electron = require('electron');
        const remote = electron && electron.remote;
        if (remote && typeof remote.getCurrentWindow === 'function') {
            return remote.getCurrentWindow();
        }
    } catch (err) {
        /* standalone Node, or electron remote unavailable */
    }
    return null;
}

function jpegFromCanvas (canvas, quality) {
    if (!canvas || typeof canvas.toDataURL !== 'function') {
        throw fail('No canvas to encode', 503);
    }
    const q = Math.max(0.2, Math.min(0.9, (quality || JPEG_QUALITY) / 100));
    const dataUrl = canvas.toDataURL('image/jpeg', q);
    const comma = dataUrl.indexOf(',');
    if (comma === -1) { throw fail('Could not encode the screen as JPEG', 500); }
    return Buffer.from(dataUrl.slice(comma + 1), 'base64');
}

function getBlitCanvas () {
    if (blitCanvas || typeof document === 'undefined') { return blitCanvas; }
    blitCanvas = document.createElement('canvas');
    blitCanvas.width = OUT_W;
    blitCanvas.height = OUT_H;
    try {
        blitCtx = blitCanvas.getContext('2d', { alpha: false });
    } catch (err) {
        blitCtx = blitCanvas.getContext('2d');
    }
    return blitCanvas;
}

function blitDraw (el) {
    if (!el || !blitCtx) { return; }
    const sx = OUT_W / WIDTH;
    const sy = OUT_H / HEIGHT;
    const rect = typeof el.getBoundingClientRect === 'function'
        ? el.getBoundingClientRect()
        : { left: 0, top: 0, width: WIDTH, height: HEIGHT };
    const w = rect.width || el.width || 0;
    const h = rect.height || el.height || 0;
    if (!w || !h) { return; }
    blitCtx.drawImage(el, rect.left * sx, rect.top * sy, w * sx, h * sy);
}

function blitNow () {
    if (!getBlitCanvas() || !blitCtx || typeof document === 'undefined') { return; }
    blitCtx.fillStyle = '#000';
    blitCtx.fillRect(0, 0, OUT_W, OUT_H);

    const jibo = getJibo();
    const face = jibo && jibo.face;
    const faceView = face && face.view;
    let drew = false;
    if (faceView) {
        try {
            blitDraw(faceView);
            drew = true;
        } catch (err) { /* WebGL buffer may already be gone */ }
    }

    const videos = document.getElementsByTagName('video');
    for (let i = 0; i < videos.length; i++) {
        const video = videos[i];
        if (!video || video.readyState < 2) { continue; }
        try { blitDraw(video); drew = true; } catch (err) { /* skip */ }
    }

    const canvases = document.getElementsByTagName('canvas');
    for (let j = 0; j < canvases.length; j++) {
        const extra = canvases[j];
        if (!extra || extra === faceView || extra === blitCanvas) { continue; }
        if (!extra.width || !extra.height) { continue; }
        try { blitDraw(extra); drew = true; } catch (err) { /* skip */ }
    }

    const imgs = document.getElementsByTagName('img');
    for (let k = 0; k < imgs.length; k++) {
        const image = imgs[k];
        if (!image || !image.naturalWidth) { continue; }
        try { blitDraw(image); drew = true; } catch (err) { /* skip */ }
    }

    if (drew) { latestBlitAt = Date.now(); }
}

function ensureHook () {
    if (hooked) { return true; }
    const jibo = getJibo();
    const face = jibo && jibo.face;
    if (!face || typeof face.render !== 'function') { return false; }
    if (face._beaconScreenHooked) {
        hooked = true;
        return true;
    }
    const orig = face.render.bind(face);
    face.render = function () {
        const result = orig.apply(face, arguments);
        try { blitNow(); } catch (err) { /* keep the face rendering */ }
        return result;
    };
    face._beaconScreenHooked = true;
    hooked = true;
    return true;
}

function encodeBlit (quality) {
    if (!getBlitCanvas()) { throw fail('Screen blit is not ready', 503); }
    return jpegFromCanvas(blitCanvas, quality);
}

function nativeImageToJpeg (image, quality) {
    if (!image) { return null; }
    if (typeof image.isEmpty === 'function' && image.isEmpty()) { return null; }
    const q = clamp(quality || JPEG_QUALITY, 20, 90);
    if (typeof image.toJpeg === 'function') { return image.toJpeg(q); }
    if (typeof image.toJPEG === 'function') { return image.toJPEG(q); }
    if (typeof image.toDataURL === 'function') {
        const dataUrl = image.toDataURL();
        const comma = dataUrl.indexOf(',');
        if (comma === -1) { return null; }
        return Buffer.from(dataUrl.slice(comma + 1), 'base64');
    }
    return null;
}

function captureWindow (win, quality) {
    return new Promise((resolve, reject) => {
        if (!win || typeof win.capturePage !== 'function') {
            reject(fail('Window capture is not available', 503));
            return;
        }
        let settled = false;
        const timer = setTimeout(() => {
            if (settled) { return; }
            settled = true;
            reject(fail('Screen capture timed out', 504));
        }, CAPTURE_TIMEOUT_MS);

        try {
            win.capturePage((image) => {
                if (settled) { return; }
                settled = true;
                clearTimeout(timer);
                try {
                    const jpeg = nativeImageToJpeg(image, quality);
                    if (!jpeg || !jpeg.length) {
                        reject(fail('Captured frame was empty', 503));
                        return;
                    }
                    resolve(jpeg);
                } catch (err) {
                    reject(err);
                }
            });
        } catch (err) {
            if (settled) { return; }
            settled = true;
            clearTimeout(timer);
            reject(err);
        }
    });
}

function drawElement (ctx, el) {
    if (!el) { return; }
    const rect = typeof el.getBoundingClientRect === 'function'
        ? el.getBoundingClientRect()
        : { left: 0, top: 0, width: WIDTH, height: HEIGHT };
    const w = rect.width || el.width || WIDTH;
    const h = rect.height || el.height || HEIGHT;
    if (!w || !h) { return; }
    ctx.drawImage(el, rect.left || 0, rect.top || 0, w, h);
}

function captureComposite (quality) {
    if (typeof document === 'undefined') {
        throw fail('Screen capture needs to run inside Be on the robot.', 503);
    }
    const canvas = document.createElement('canvas');
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    const ctx = canvas.getContext('2d');
    if (!ctx) { throw fail('Could not create a 2D canvas', 500); }
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    const jibo = getJibo();
    const face = jibo && jibo.face;
    const faceView = face && face.view;
    let drewPixi = false;

    if (face && face.plugins && face.plugins.extract &&
        typeof face.plugins.extract.canvas === 'function' && face.stage) {
        try {
            const pixiCanvas = face.plugins.extract.canvas(face.stage);
            if (pixiCanvas) {
                ctx.drawImage(pixiCanvas, 0, 0, WIDTH, HEIGHT);
                drewPixi = true;
            }
        } catch (err) { /* try the live canvas next */ }
    }

    if (!drewPixi && faceView) {
        try {
            drawElement(ctx, faceView);
        } catch (err) { /* WebGL buffer may already be gone */ }
    }

    const videos = document.getElementsByTagName('video');
    for (let i = 0; i < videos.length; i++) {
        const video = videos[i];
        if (!video || video.readyState < 2) { continue; }
        try { drawElement(ctx, video); } catch (err) { /* skip */ }
    }

    const canvases = document.getElementsByTagName('canvas');
    for (let j = 0; j < canvases.length; j++) {
        const extra = canvases[j];
        if (!extra || extra === faceView || extra === canvas) { continue; }
        if (!extra.width || !extra.height) { continue; }
        try { drawElement(ctx, extra); } catch (err) { /* skip */ }
    }

    return jpegFromCanvas(canvas, quality);
}

function blitIsFresh () {
    return !!(blitCanvas && latestBlitAt && (Date.now() - latestBlitAt) < BLIT_STALE_MS);
}

function doCapture (quality) {
    ensureHook();
    if (!blitIsFresh()) { blitNow(); }
    if (blitIsFresh()) {
        return Promise.resolve(encodeBlit(quality));
    }
    const win = getElectronWindow();
    if (win) {
        return captureWindow(win, quality).catch(() => captureComposite(quality));
    }
    return Promise.resolve().then(() => captureComposite(quality));
}

function capture (quality) {
    if (!available()) {
        return Promise.reject(fail('Screen capture needs to run inside Be on the robot.', 503));
    }
    if (latestJpeg && (Date.now() - latestAt) < FRESH_MS) {
        return Promise.resolve(latestJpeg);
    }
    if (inflight) { return inflight; }
    inflight = doCapture(quality).then((buf) => {
        inflight = null;
        latestJpeg = buf;
        latestAt = Date.now();
        return buf;
    }, (err) => {
        inflight = null;
        throw err;
    });
    return inflight;
}

function available () {
    return !!(getElectronWindow() || (typeof document !== 'undefined' && getJibo() && getJibo().face));
}

function state () {
    const jibo = getJibo();
    return {
        available: available(),
        width: WIDTH,
        height: HEIGHT,
        method: (blitCanvas && latestBlitAt) ? 'blit' :
            (getElectronWindow() ? 'window' : (jibo && jibo.face ? 'face' : null)),
        control: available()
    };
}

function sendElectronPointer (phase, x, y) {
    const win = getElectronWindow();
    const contents = win && win.webContents;
    if (!contents || typeof contents.sendInputEvent !== 'function') { return false; }
    const types = { down: 'mouseDown', up: 'mouseUp', move: 'mouseMove' };
    const type = types[phase];
    if (!type) { return false; }
    const event = {
        type: type,
        x: x,
        y: y,
        button: 'left',
        modifiers: []
    };
    if (phase === 'down' || phase === 'up') { event.clickCount = 1; }
    contents.sendInputEvent(event);
    return true;
}

function dispatchMouse (target, type, x, y) {
    if (!target || typeof document === 'undefined') { return; }
    let evt;
    if (typeof MouseEvent === 'function') {
        try {
            evt = new MouseEvent(type, {
                bubbles: true,
                cancelable: true,
                view: window,
                clientX: x,
                clientY: y,
                screenX: x,
                screenY: y,
                button: 0,
                buttons: type === 'mouseup' ? 0 : 1,
                detail: type === 'click' ? 1 : 0
            });
        } catch (err) {
            evt = null;
        }
    }
    if (!evt && document.createEvent) {
        evt = document.createEvent('MouseEvents');
        evt.initMouseEvent(
            type, true, true, window, type === 'click' ? 1 : 0,
            x, y, x, y, false, false, false, false, 0, null
        );
    }
    if (evt) { target.dispatchEvent(evt); }
}

function dispatchTouch (target, type, x, y) {
    if (!target || typeof document === 'undefined') { return; }
    try {
        if (typeof document.createTouch === 'function' &&
            typeof document.createTouchList === 'function' &&
            typeof document.createEvent === 'function') {
            const touch = document.createTouch(window, target, 1, x, y, x, y);
            const list = document.createTouchList(touch);
            const empty = document.createTouchList();
            const evt = document.createEvent('TouchEvent');
            const ending = type === 'touchend' || type === 'touchcancel';
            if (typeof evt.initTouchEvent === 'function') {
                evt.initTouchEvent(
                    type, true, true, window, 0,
                    false, false, false, false,
                    ending ? empty : list,
                    ending ? empty : list,
                    list
                );
                target.dispatchEvent(evt);
            }
        }
    } catch (err) { /* Chromium 53 TouchEvent is best-effort */ }
}

function targetAt (x, y) {
    let node = null;
    if (typeof document !== 'undefined' && typeof document.elementFromPoint === 'function') {
        node = document.elementFromPoint(x, y);
    }
    const jibo = getJibo();
    return node || (jibo && jibo.face && jibo.face.view) ||
        (typeof document !== 'undefined' ? document.body : null);
}

function dispatchDomPointer (phase, x, y) {
    const target = targetAt(x, y);
    if (!target) { return false; }
    const mouse = { down: 'mousedown', up: 'mouseup', move: 'mousemove' };
    const touch = { down: 'touchstart', up: 'touchend', move: 'touchmove' };
    dispatchTouch(target, touch[phase], x, y);
    dispatchMouse(target, mouse[phase], x, y);
    if (phase === 'up') { dispatchMouse(target, 'click', x, y); }
    return true;
}

function pointer (phase, x, y) {
    const px = clamp(x, 0, WIDTH - 1);
    const py = clamp(y, 0, HEIGHT - 1);
    if (phase !== 'down' && phase !== 'up' && phase !== 'move') {
        throw fail('Pointer phase must be down, move, or up', 400);
    }
    if (sendElectronPointer(phase, px, py)) {
        return { ok: true, method: 'electron', x: px, y: py, phase: phase };
    }
    if (dispatchDomPointer(phase, px, py)) {
        return { ok: true, method: 'dom', x: px, y: py, phase: phase };
    }
    throw fail('Cannot send touch events unless BEacon is running inside Be.', 503);
}

function wait (ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function emitScreenGesture (name) {
    const jibo = getJibo();
    const shared = jibo && jibo.globalEvents && jibo.globalEvents.shared;
    if (shared && shared.screenGesture && typeof shared.screenGesture.emit === 'function') {
        shared.screenGesture.emit(name);
        return true;
    }
    return false;
}

function spoofHammer (name, x, y) {
    const jibo = getJibo();
    const gestures = jibo && jibo.face && jibo.face.gestures;
    if (gestures && typeof gestures.spoofGesture === 'function') {
        try {
            gestures.spoofGesture(name, x, y);
            return true;
        } catch (err) { /* ignore */ }
    }
    return false;
}

function tap (x, y) {
    const px = clamp(x, 0, WIDTH - 1);
    const py = clamp(y, 0, HEIGHT - 1);
    pointer('move', px, py);
    pointer('down', px, py);
    return wait(40).then(() => {
        const result = pointer('up', px, py);
        spoofHammer('tap', px, py);
        return result;
    });
}

function swipe (direction) {
    const dir = String(direction || '').toLowerCase();
    const names = {
        down: 'swipedown',
        up: 'swipeup',
        left: 'swipeleft',
        right: 'swiperight'
    };
    const name = names[dir];
    if (!name) { throw fail('Swipe direction must be down, up, left, or right', 400); }

    emitScreenGesture(name);
    spoofHammer(name, WIDTH / 2, HEIGHT / 2);

    const midX = WIDTH / 2;
    const midY = HEIGHT / 2;
    const dist = 300;
    let x0 = midX;
    let y0 = midY;
    let x1 = midX;
    let y1 = midY;
    if (dir === 'down') { y0 = 90; y1 = 90 + dist; }
    else if (dir === 'up') { y0 = HEIGHT - 90; y1 = HEIGHT - 90 - dist; }
    else if (dir === 'left') { x0 = WIDTH - 160; x1 = WIDTH - 160 - dist; }
    else { x0 = 160; x1 = 160 + dist; }

    const steps = 6;
    pointer('down', x0, y0);
    let chain = Promise.resolve();
    for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const sx = Math.round(x0 + (x1 - x0) * t);
        const sy = Math.round(y0 + (y1 - y0) * t);
        chain = chain.then(() => wait(20)).then(() => pointer('move', sx, sy));
    }
    return chain.then(() => wait(20)).then(() => pointer('up', x1, y1)).then((result) => {
        result.gesture = name;
        result.direction = dir;
        return result;
    });
}

function input (body) {
    return Promise.resolve().then(() => {
        const payload = body || {};
        const type = String(payload.type || payload.action || '').toLowerCase();
        if (type === 'pointer' || type === 'touch' || type === 'mouse') {
            return pointer(payload.phase || payload.event, payload.x, payload.y);
        }
        if (type === 'batch') {
            const events = payload.events || payload.points || [];
            const limit = Math.min(events.length, BATCH_MAX);
            let last = null;
            for (let i = 0; i < limit; i++) {
                const event = events[i] || {};
                last = pointer(event.phase || event.event, event.x, event.y);
            }
            if (!last) { throw fail('Batch had no pointer events', 400); }
            last.count = limit;
            return last;
        }
        if (type === 'tap' || type === 'click') {
            return tap(payload.x, payload.y);
        }
        if (type === 'swipe') {
            return swipe(payload.direction || payload.dir);
        }
        if (type === 'down' || type === 'up' || type === 'move') {
            return pointer(type, payload.x, payload.y);
        }
        throw fail('Unknown input type. Use pointer, tap, or swipe.', 400);
    });
}

function stream (req, res) {
    if (!available()) {
        throw fail('Screen capture needs to run inside Be on the robot.', 503);
    }
    res.writeHead(200, {
        'Content-Type': 'multipart/x-mixed-replace; boundary=jiboscreen',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Connection': 'close',
        'Pragma': 'no-cache',
        'Access-Control-Allow-Origin': '*'
    });

    let stopped = false;
    const stop = () => { stopped = true; };
    req.on('close', stop);
    req.on('aborted', stop);

    const tick = () => {
        if (stopped) { return; }
        capture(JPEG_QUALITY).then((buf) => {
            if (stopped) { return; }
            try {
                res.write('--jiboscreen\r\n');
                res.write('Content-Type: image/jpeg\r\n');
                res.write('Content-Length: ' + buf.length + '\r\n\r\n');
                res.write(buf);
                res.write('\r\n');
            } catch (err) {
                stopped = true;
                return;
            }
            setTimeout(tick, STREAM_INTERVAL_MS);
        }).catch(() => {
            if (stopped) { return; }
            setTimeout(tick, 600);
        });
    };
    tick();
}

module.exports = {
    WIDTH: WIDTH,
    HEIGHT: HEIGHT,
    JPEG_QUALITY: JPEG_QUALITY,
    available: available,
    state: state,
    capture: capture,
    input: input,
    stream: stream
};
