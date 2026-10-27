'use strict';
// Promise-only production-path smoke runnable on the robot's Node 6.
const assert = require('assert');
const Runtime = require('../@be/be/skills/agent/runtime');
function deferred() { let resolve; const promise = new Promise(yes => { resolve = yes; }); return { promise, resolve }; }
function flush(n) { return n ? Promise.resolve().then(() => flush(n - 1)) : Promise.resolve(); }
const turn = deferred(), reply = deferred(), load = deferred(), stop = deferred(), played = deferred(), spoken = deferred(), calls = [];
const playback = { play: () => { calls.push('play'); return played.promise; }, stop: () => { calls.push('stop'); return stop.promise; } };
const jibo = {
    privacyController: { enabled: false },
    face: { eye: {} },
    expression: { setLEDColor: () => {} },
    embodied: { listen: { disableOnce: () => {} } },
    jetstream: { types: { TurnResultType: {} }, startLocalTurn: () => Promise.resolve({ promise: turn.promise, cancel: () => {} }) },
    animDB: { getAnimByName: name => { assert.strictEqual(name, 'Thinking_Eye_Loop_01'); return { createFromConfig: config => { assert.strictEqual(config.loops, 0); return load.promise; } }; } },
    tts: { speak: text => { calls.push('speak:' + text); return spoken.promise; }, stop: () => { spoken.resolve(); } }
};
const runtime = new Runtime(jibo, { filters: { ColorMatrixFilter: class {} } }, {}, { chat: () => ({ promise: reply.promise, cancel: () => {} }) }, () => {});
runtime.active = true; runtime.config = {};
runtime.listen();
flush(10).then(() => {
    turn.resolve({ status: 'OK', result: { text: 'Hello' } }); return flush(20);
}).then(() => {
    load.resolve(playback); return flush(20);
}).then(() => {
    assert.deepStrictEqual(calls, ['play']); reply.resolve('Hello back'); return flush(20);
}).then(() => {
    assert.deepStrictEqual(calls, ['play', 'stop']); stop.resolve(); return flush(20);
}).then(() => {
    assert.deepStrictEqual(calls, ['play', 'stop', 'speak:Hello back']); return runtime.close();
}).then(() => {
    played.resolve(); return flush(20);
}).then(() => {
    assert.strictEqual(runtime.active, false); assert.strictEqual(calls.length, 3);
    console.log('PASS Node 6 native thinking lifecycle: generation, delayed load/play/stop, TTS ordering, close');
}).catch(error => { console.error(error); process.exitCode = 1; runtime.close(); });
