'use strict';

/**
 * POST /api/orchestra plays assets/orchestra/Symphony.wav on the robot
 * speakers and covers the face with an oscilloscope until the clip ends.
 * Replace that wav to use a different clip.
 *
 * Playback is a local AudioContext (source -> analyser -> speakers) rather
 * than jibo.sound, which does not expose its graph. Electron 1.4's
 * decodeAudioData is callback-based; a returned promise is accepted too.
 *
 * Before the clip, the body turns to global home (0 degrees) and attention
 * is held off so the robot stays still. The hold is released when playback ends.
 * A POST while a clip is playing stops it.
 * {"prepare":true} turns, freezes, and decodes without starting. A later
 * {"startAt":<unix ms>} on that armed robot schedules the downbeat.
 */

const fs = require('fs');
const path = require('path');

const WAV_PATH = path.join(__dirname, '..', 'assets', 'orchestra', 'Symphony.wav');
const FACE_W = 1280;
const FACE_H = 720;
const SCOPE_ID = 'beacon-orchestra';

const MAX_LEAD_MS = 30000;

let current = null;

function fail (message, status) {
    const err = new Error(message);
    err.status = status || 500;
    return err;
}

function audioContextCtor () {
    if (typeof AudioContext !== 'undefined') { return AudioContext; }
    if (typeof webkitAudioContext !== 'undefined') { return webkitAudioContext; }
    return null;
}

function faceHost () {
    if (typeof document === 'undefined' || typeof document.getElementById !== 'function') {
        return null;
    }
    return document.getElementById('face');
}

function readFile (file) {
    return new Promise((resolve, reject) => {
        fs.readFile(file, (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(data);
        });
    });
}

/** Node Buffers share a pool, and decodeAudioData detaches its input. */
function toArrayBuffer (buf) {
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
}

function decodeAudio (ctx, arrayBuffer) {
    return new Promise((resolve, reject) => {
        let settled = false;
        const ok = (buffer) => {
            if (settled) { return; }
            settled = true;
            resolve(buffer);
        };
        const bad = (err) => {
            if (settled) { return; }
            settled = true;
            reject(err instanceof Error ? err : new Error('Could not decode the wav'));
        };
        let result;
        try {
            result = ctx.decodeAudioData(arrayBuffer, ok, bad);
        } catch (err) {
            bad(err);
            return;
        }
        if (result && typeof result.then === 'function') {
            result.then(ok, bad);
        }
    });
}

function drawScope (ctx2d, bins) {
    ctx2d.fillStyle = '#050805';
    ctx2d.fillRect(0, 0, FACE_W, FACE_H);

    ctx2d.lineWidth = 1;
    ctx2d.strokeStyle = 'rgba(80, 140, 90, 0.35)';
    ctx2d.beginPath();
    const cols = 10;
    const rows = 8;
    let c;
    let r;
    for (c = 1; c < cols; c++) {
        const x = (FACE_W / cols) * c;
        ctx2d.moveTo(x + 0.5, 0);
        ctx2d.lineTo(x + 0.5, FACE_H);
    }
    for (r = 1; r < rows; r++) {
        const y = (FACE_H / rows) * r;
        ctx2d.moveTo(0, y + 0.5);
        ctx2d.lineTo(FACE_W, y + 0.5);
    }
    ctx2d.stroke();

    ctx2d.strokeStyle = 'rgba(124, 255, 107, 0.45)';
    ctx2d.beginPath();
    ctx2d.moveTo(0, FACE_H / 2);
    ctx2d.lineTo(FACE_W, FACE_H / 2);
    ctx2d.stroke();

    const step = Math.max(1, Math.floor(bins.length / FACE_W));
    const mid = FACE_H / 2;
    const amp = FACE_H * 0.42;
    ctx2d.beginPath();
    let started = false;
    let i;
    for (i = 0; i < bins.length; i += step) {
        const x = (i / (bins.length - 1)) * FACE_W;
        const v = (bins[i] - 128) / 128;
        const y = mid - (v * amp);
        if (!started) {
            ctx2d.moveTo(x, y);
            started = true;
        } else {
            ctx2d.lineTo(x, y);
        }
    }
    ctx2d.lineWidth = 7;
    ctx2d.strokeStyle = 'rgba(124, 255, 107, 0.28)';
    ctx2d.stroke();
    ctx2d.lineWidth = 2;
    ctx2d.strokeStyle = '#b6ff9a';
    ctx2d.stroke();
}

function mountScope (analyser) {
    const host = faceHost();
    if (!host || typeof requestAnimationFrame !== 'function') {
        throw fail('Orchestra only works inside Be on the robot.', 503);
    }

    const existing = document.getElementById(SCOPE_ID);
    if (existing && existing.parentNode) {
        existing.parentNode.removeChild(existing);
    }

    const canvas = document.createElement('canvas');
    canvas.id = SCOPE_ID;
    canvas.width = FACE_W;
    canvas.height = FACE_H;
    canvas.style.position = 'absolute';
    canvas.style.left = '0';
    canvas.style.top = '0';
    canvas.style.width = FACE_W + 'px';
    canvas.style.height = FACE_H + 'px';
    canvas.style.zIndex = '100000';
    canvas.style.pointerEvents = 'none';
    host.appendChild(canvas);

    const ctx2d = canvas.getContext('2d');
    if (!ctx2d) {
        host.removeChild(canvas);
        throw fail('Could not draw the oscilloscope.', 500);
    }

    const bins = new Uint8Array(analyser.fftSize);
    let raf = 0;
    let closed = false;

    const frame = () => {
        if (closed) { return; }
        raf = requestAnimationFrame(frame);
        analyser.getByteTimeDomainData(bins);
        drawScope(ctx2d, bins);
    };
    raf = requestAnimationFrame(frame);

    return {
        close: () => {
            if (closed) { return; }
            closed = true;
            if (raf) {
                cancelAnimationFrame(raf);
                raf = 0;
            }
            if (canvas.parentNode) {
                canvas.parentNode.removeChild(canvas);
            }
        }
    };
}

function stopCurrent () {
    if (!current) { return; }
    const session = current;
    current = null;
    session.stop();
}

/** Options from a POST body. Non-JSON bodies (the old script sent "dog") play now. */
function commandFromBody (buf) {
    const command = { startAt: null, prepare: false, stop: false };
    if (!buf || !buf.length) { return command; }
    const text = buf.toString('utf8').trim();
    if (!text || text.charAt(0) !== '{') { return command; }
    let body;
    try {
        body = JSON.parse(text);
    } catch (err) {
        throw fail('Body is not valid JSON.', 400);
    }
    if (body && body.stop) {
        command.stop = true;
        return command;
    }
    if (body && body.prepare) { command.prepare = true; }
    if (!body || body.startAt == null || body.startAt === '') { return command; }
    const startAt = Number(body.startAt);
    if (!isFinite(startAt)) {
        throw fail('startAt must be a unix time in milliseconds.', 400);
    }
    if (startAt - Date.now() > MAX_LEAD_MS) {
        throw fail('startAt is more than 30 seconds ahead.', 400);
    }
    command.startAt = startAt;
    return command;
}

/** Milliseconds from now until startAt. Zero means start immediately. */
function leadMs (startAt) {
    if (startAt == null) { return 0; }
    const delay = Number(startAt) - Date.now();
    return delay > 0 ? delay : 0;
}

/** Speaker-buffer delay, so the downbeat is when the sound comes out. */
function outputLatencyMs (audioCtx) {
    let seconds = 0;
    if (typeof audioCtx.outputLatency === 'number') {
        seconds = audioCtx.outputLatency;
    } else if (typeof audioCtx.baseLatency === 'number') {
        seconds = audioCtx.baseLatency;
    }
    if (!isFinite(seconds) || seconds < 0) { return 0; }
    return seconds * 1000;
}

function clock () {
    return { now: Date.now() };
}

function getJibo () {
    try {
        return require('jibo');
    } catch (err) {
        return null;
    }
}

/**
 * Turn to the global home pose, which puts the base at 0 degrees, then hold
 * attention off so idle motion cannot move him again.
 */
function faceHomeAndFreeze () {
    const jibo = getJibo();
    const expression = jibo && jibo.expression;
    if (!expression || typeof expression.centerRobot !== 'function' ||
            typeof expression.pushAttentionMode !== 'function') {
        return Promise.reject(fail('Orchestra only works inside Be on the robot.', 503));
    }
    const mode = (expression.AttentionMode && expression.AttentionMode.OFF) || 'OFF';
    return Promise.resolve(expression.centerRobot({ centerGlobally: true })).then(() => {
        return expression.pushAttentionMode(mode);
    });
}

function releaseFreeze (handle) {
    if (!handle || typeof handle.release !== 'function') { return; }
    try {
        const result = handle.release();
        if (result && typeof result.catch === 'function') {
            result.catch(() => {});
        }
    } catch (err) { /* already released */ }
}

function resumeContext (audioCtx) {
    if (!audioCtx || typeof audioCtx.resume !== 'function') { return Promise.resolve(); }
    try {
        const resumed = audioCtx.resume();
        if (resumed && typeof resumed.then === 'function') {
            return resumed.catch(() => {});
        }
    } catch (err) { /* already running */ }
    return Promise.resolve();
}

function play (command) {
    const opts = command || {};
    const startAt = opts.startAt == null ? null : opts.startAt;
    const prepareOnly = !!opts.prepare && startAt == null;

    if (opts.stop) {
        if (current) { stopCurrent(); }
        return Promise.resolve({ playing: false, file: WAV_PATH });
    }

    if (current && current.phase === 'armed' && startAt != null && !opts.prepare) {
        return Promise.resolve(current.schedule(startAt));
    }
    if (current) {
        stopCurrent();
        if (!opts.prepare) {
            return Promise.resolve({ playing: false, file: WAV_PATH });
        }
    }

    const Ctor = audioContextCtor();
    if (!Ctor || !faceHost()) {
        return Promise.reject(fail('Orchestra only works inside Be on the robot.', 503));
    }
    const jibo = getJibo();
    if (!jibo || !jibo.expression) {
        return Promise.reject(fail('Orchestra only works inside Be on the robot.', 503));
    }

    let exists = false;
    try {
        exists = fs.existsSync(WAV_PATH) && fs.statSync(WAV_PATH).isFile();
    } catch (err) {
        exists = false;
    }
    if (!exists) {
        return Promise.reject(fail('Placeholder wav is missing. Replace assets/orchestra/Symphony.wav.', 404));
    }

    const audioCtx = new Ctor();
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.65;
    analyser.connect(audioCtx.destination);

    let scope = null;
    let source = null;
    let scopeTimer = null;
    let attention = null;
    let stopped = false;
    let started = false;

    const session = {
        phase: 'preparing',
        schedule: null,
        stop: () => {
            if (stopped) { return; }
            stopped = true;
            session.phase = 'idle';
            const handle = attention;
            attention = null;
            releaseFreeze(handle);
            if (scopeTimer) {
                clearTimeout(scopeTimer);
                scopeTimer = null;
            }
            try {
                if (source) { source.onended = null; }
            } catch (err) { /* source already gone */ }
            try {
                if (source) { source.stop(0); }
            } catch (err) { /* not started yet, or already stopped */ }
            if (scope) {
                scope.close();
                scope = null;
            }
            try {
                if (typeof audioCtx.close === 'function') { audioCtx.close(); }
            } catch (err) { /* already closed */ }
            if (current === session) { current = null; }
        }
    };
    current = session;

    function showScopeAt (delay) {
        const show = () => {
            scopeTimer = null;
            if (stopped) { return; }
            scope = mountScope(analyser);
        };
        if (delay <= 30) {
            show();
            return;
        }
        const target = Date.now() + delay;
        const tick = () => {
            if (stopped) { return; }
            const left = target - Date.now();
            if (left <= 16) {
                scopeTimer = setTimeout(show, Math.max(0, left));
                return;
            }
            scopeTimer = setTimeout(tick, Math.min(left - 16, 50));
        };
        tick();
    }

    function schedule (at) {
        if (stopped || started) {
            return { playing: false, file: WAV_PATH };
        }
        const latency = outputLatencyMs(audioCtx);
        const aimedAt = at == null ? null : Number(at) - latency;
        const delay = leadMs(aimedAt);
        const when = delay > 0 ? audioCtx.currentTime + (delay / 1000) : 0;
        started = true;
        session.phase = 'playing';
        source.start(when);
        showScopeAt(delay);
        return {
            playing: true,
            file: WAV_PATH,
            startAt: delay > 0 ? Number(at) : Date.now()
        };
    }
    session.schedule = schedule;

    const decoded = readFile(WAV_PATH).then((buf) => {
        if (stopped) { throw fail('Playback was stopped.', 409); }
        return decodeAudio(audioCtx, toArrayBuffer(buf));
    });
    const posed = faceHomeAndFreeze().then((handle) => {
        if (stopped) {
            releaseFreeze(handle);
            throw fail('Playback was stopped.', 409);
        }
        attention = handle;
    });

    return Promise.all([decoded, posed, resumeContext(audioCtx)]).then((results) => {
        const buffer = results[0];
        if (stopped) { throw fail('Playback was stopped.', 409); }
        source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(analyser);
        source.onended = () => { session.stop(); };
        session.phase = 'armed';
        if (prepareOnly) {
            return { prepared: true, now: Date.now(), file: WAV_PATH };
        }
        return schedule(startAt);
    }).catch((err) => {
        const cancelled = stopped;
        session.stop();
        if (cancelled) { return { playing: false, file: WAV_PATH }; }
        if (err && err.status) { throw err; }
        throw fail(err && err.message ? err.message : 'Could not play the wav', 500);
    });
}

module.exports = {
    play: play,
    clock: clock,
    commandFromBody: commandFromBody,
    wavPath: WAV_PATH
};
