'use strict';
const assert = require('assert'), EventEmitter = require('events');
const Runtime = require('../@be/be/skills/agent/runtime');
function deferred() { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; }
function event() {
    const emitter = new EventEmitter();
    return { on: fn => emitter.on('event', fn), off: fn => emitter.removeListener('event', fn), emit: value => emitter.emit('event', value), count: () => emitter.listenerCount('event') };
}
function fixture() {
    const turns = [], speech = [], requests = [], colors = [], releases = [], timers = new EventEmitter();
    const parent = { removeChild: child => { child.parent = null; } };
    class Graphics {
        beginFill() { return this; } drawCircle() { return this; } endFill() { return this; } destroy() { this.destroyed = true; }
    }
    const PIXI = { Graphics, filters: { ColorMatrixFilter: class {} } }, types = { SUCCEEDED: 'SUCCEEDED', FAILED: 'FAILED', INTERRUPTED: 'INTERRUPTED', CANCELED: 'CANCELED', TIMEOUT: 'TIMEOUT' };
    const jibo = {
        privacyController: { enabled: false }, timer: timers,
        face: { width: 1280, height: 720, eye: {},
            gestures: { hammer: { Swipe: function () {}, DIRECTION_DOWN: 1 }, addStageGesture: (type, options, fn) => { jibo.swipe = fn; return options; }, removeStageGesture: () => { jibo.swipe = null; } },
            views: { addWatermark(dot) { this._waterMark = dot; dot.parent = parent; }, removeWatermark() { this._waterMark.parent = null; this._waterMark = null; } } },
        expression: { AttentionMode: { OFF: 'OFF' }, pushAttentionMode: () => Promise.resolve({ release: () => { releases.push('attention'); return Promise.resolve(); } }), setLEDColor: color => colors.push(color) },
        tts: { speak: text => { const pending = deferred(); speech.push({ text, pending }); return pending.promise; }, stop: () => { speech.forEach(item => item.pending.resolve()); releases.push('speech'); return Promise.resolve(); } },
        embodied: { listen: { disableOnce() {} } },
        jetstream: { types: { TurnResultType: types, HotwordListenMode: { Disabled: 0 } }, events: { sos: event(), eos: event(), skillSwitch: event(), globalTurnStarted: event() },
            setHotwordMode: () => ({ activated: Promise.resolve(), release: () => { releases.push('hotword'); return Promise.resolve(); } }),
            startLocalTurn: options => { const pending = deferred(); const turn = { promise: pending.promise, options, pending, cancel: () => { turn.cancelled = true; pending.resolve({ status: types.CANCELED }); return Promise.resolve(); } }; turns.push(turn); return Promise.resolve(turn); }
        }
    };
    const settings = { resolve: () => ({ provider: 'custom', model: 'test' }), ready: () => true };
    const provider = { chat: (config, history) => {
        const pending = deferred(), operation = { promise: pending.promise, cancel: () => { operation.cancelled = true; pending.reject(new Error('cancelled')); }, pending, history: JSON.parse(JSON.stringify(history)) };
        requests.push(operation); return operation;
    } };
    let exits = 0;
    const runtime = new Runtime(jibo, PIXI, settings, provider, () => { exits++; });
    return { runtime, jibo, turns, speech, requests, colors, releases, types, exits: () => exits };
}
async function flush() { for (let i = 0; i < 25; i++) await Promise.resolve(); }
async function listening(env) { env.runtime.open(); await flush(); assert.strictEqual(env.speech.length, 1); env.speech[0].pending.resolve(); await flush(); }
async function run() {
    const env = fixture(); await listening(env);
    const { runtime, jibo, turns, speech, requests, types } = env;
    assert.strictEqual(turns[0].options.nluRules[0], 'agent/conversation');
    assert(turns[0].options.ignoreGlobalRules); assert.strictEqual(runtime.phase, 'listening');
    assert.deepStrictEqual(env.colors[env.colors.length - 1], [0, 0.45, 1]);
    assert(runtime.dot.parent); assert.strictEqual(jibo.face.eye.filters.length, 1);
    jibo.jetstream.events.sos.emit(); assert.strictEqual(runtime.silence, null);
    jibo.jetstream.events.eos.emit(); runtime.render(); assert.deepStrictEqual(env.colors[env.colors.length - 1], [0, 1, 0]);
    turns[0].pending.resolve({ status: types.SUCCEEDED, result: { asr: { text: 'My name is Alex.' } } }); await flush();
    assert.strictEqual(requests.length, 1); assert.strictEqual(turns.length, 1);
    requests[0].pending.resolve('Hi Alex.'); await flush();
    assert.strictEqual(speech[1].text, 'Hi Alex.'); assert.strictEqual(turns.length, 1, 'Do not listen during TTS');
    speech[1].pending.resolve(); await flush(); assert.strictEqual(turns.length, 2);
    turns[1].pending.resolve({ status: types.SUCCEEDED, result: { text: 'What is my name?' } }); await flush();
    assert.deepStrictEqual(requests[1].history.map(item => item.role), ['user', 'assistant', 'user']);
    assert.strictEqual(requests[1].history[0].content, 'My name is Alex.');
    await runtime.close(); assert(requests[1].cancelled); await flush();
    assert.strictEqual(speech.length, 2); assert.deepStrictEqual(runtime.history, []); assert(!runtime.dot); assert(!jibo.face.eye.filters);
    assert(env.releases.includes('hotword')); assert(env.releases.includes('attention')); assert.strictEqual(jibo.jetstream.events.eos.count(), 0); assert.strictEqual(jibo.timer.listenerCount('update'), 0);
    const stopping = fixture(); await listening(stopping);
    stopping.turns[0].pending.resolve({ status: types.SUCCEEDED, result: { text: 'stop chatting' } }); await flush();
    assert.strictEqual(stopping.requests.length, 0); stopping.speech[1].pending.resolve(); await flush(); assert.strictEqual(stopping.exits(), 1);
    const goodbye = fixture(); await listening(goodbye);
    goodbye.turns[0].pending.resolve({ status: types.SUCCEEDED, result: { text: 'Good-bye, Jibo!' } }); await flush();
    assert.strictEqual(goodbye.requests.length, 0, 'Common ASR variants of goodbye should not be sent to the model');
    assert.strictEqual(goodbye.speech[1].text, 'Okay. Talk to you later!');
    goodbye.speech[1].pending.resolve(); await flush(); assert.strictEqual(goodbye.exits(), 1);
    const privacy = fixture(); await listening(privacy);
    privacy.jibo.privacyController.enabled = true;
    const red = { parent: {} }; privacy.jibo.face.views._waterMark = red;
    await privacy.runtime.close(); assert.strictEqual(privacy.jibo.face.views._waterMark, red); assert(privacy.turns[0].cancelled);
    const swipe = fixture(); await listening(swipe); swipe.jibo.swipe(); await flush(); assert.strictEqual(swipe.exits(), 1); assert(swipe.turns[0].cancelled);
    const failure = fixture(); await listening(failure); failure.turns[0].pending.reject(new Error('raw secret error')); await flush();
    assert(!failure.speech[1].text.includes('secret')); failure.speech[1].pending.resolve(); await flush(); assert.strictEqual(failure.exits(), 1);
    const immediatelyClosed = fixture(); immediatelyClosed.runtime.open(); await immediatelyClosed.runtime.close(); await flush();
    assert.strictEqual(immediatelyClosed.speech.length, 0); assert(!immediatelyClosed.runtime.hotword);
    const takeover = fixture(); await listening(takeover); takeover.jibo.jetstream.events.skillSwitch.emit(); await flush();
    assert(takeover.turns[0].cancelled); assert.strictEqual(takeover.exits(), 0, 'Do not redirect over the requested next skill');
    // Speech can end even when the transcription response never arrives.
    const transcribing = fixture();
    const realSetTimeout = global.setTimeout, realClearTimeout = global.clearTimeout;
    const pendingTimers = new Map(); let timerId = 0;
    global.setTimeout = (callback, delay) => { const id = ++timerId; pendingTimers.set(id, { callback, delay }); return id; };
    global.clearTimeout = id => pendingTimers.delete(id);
    try {
        await listening(transcribing);
        transcribing.jibo.jetstream.events.sos.emit();
        transcribing.jibo.jetstream.events.eos.emit();
        assert.strictEqual(transcribing.runtime.phase, 'transcribing');
        pendingTimers.forEach(timer => { if (timer.delay <= 60000) timer.callback(); });
        await flush();
        assert.strictEqual(transcribing.exits(), 1, 'A stalled transcription must return control within 60 seconds');
        assert(transcribing.turns[0].cancelled, 'Cancel the stalled turn');
        assert(transcribing.releases.includes('hotword'));
        assert(transcribing.releases.includes('attention'));
        assert.strictEqual(transcribing.requests.length, 0);
        assert.strictEqual(transcribing.jibo.jetstream.events.eos.count(), 0);
    } finally {
        await transcribing.runtime.close();
        global.setTimeout = realSetTimeout; global.clearTimeout = realClearTimeout;
    }
    // Listening/transcription watchdogs must not survive into a long generation.
    const longGeneration = fixture();
    const generationTimers = new Map(); let generationTimerId = 0;
    global.setTimeout = (callback, delay) => { const id = ++generationTimerId; generationTimers.set(id, { callback, delay }); return id; };
    global.clearTimeout = id => generationTimers.delete(id);
    try {
        await listening(longGeneration);
        longGeneration.jibo.jetstream.events.sos.emit();
        longGeneration.jibo.jetstream.events.eos.emit();
        longGeneration.turns[0].pending.resolve({ status: longGeneration.types.SUCCEEDED, result: { text: 'Hello' } });
        await flush();
        assert.strictEqual(longGeneration.runtime.phase, 'thinking');
        assert.strictEqual(generationTimers.size, 0, 'Listening watchdog must be cleared during generation');
        longGeneration.requests[0].pending.resolve('A delayed response'); await flush();
        assert.strictEqual(longGeneration.speech[1].text, 'A delayed response');
        assert.strictEqual(longGeneration.exits(), 0);
    } finally {
        await longGeneration.runtime.close();
        global.setTimeout = realSetTimeout; global.clearTimeout = realClearTimeout;
    }
    console.log('Agent runtime: follow-ups, conversation history, colors, TTS sequencing, cancellation, privacy, swipe, failures and stalled transcription recovery passed.');
}
module.exports = { fixture, flush, listening };
if (require.main === module) run().catch(error => { console.error(error); process.exitCode = 1; });
