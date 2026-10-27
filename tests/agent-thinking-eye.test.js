'use strict';
const assert = require('assert');
const fixtures = require('./agent-runtime.test');
function deferred() { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; }
function fixture() {
    const env = fixtures.fixture();
    const calls = env.calls = [], load = env.load = deferred(), stop = env.stop = deferred(), play = env.play = deferred();
    env.playback = { play: options => { calls.push(['play', options]); return play.promise; }, stop: () => { calls.push(['stop']); return stop.promise; } };
    env.jibo.animDB = { getAnimByName: name => { calls.push(['lookup', name]); return { createFromConfig: config => { calls.push(['load', config]); return load.promise; } }; } };
    return env;
}
async function thinking(env) {
    await fixtures.listening(env);
    env.turns[0].pending.resolve({ status: env.types.SUCCEEDED, result: { text: 'Tell me something.' } });
    await fixtures.flush();
}
async function run() {
    const env = fixture();
    try {
        await thinking(env);
        assert.strictEqual(env.runtime.phase, 'thinking');
        assert.deepStrictEqual(env.calls[0], ['lookup', 'Thinking_Eye_Loop_01'], 'Generation must load the native thinking-eye animation');
        assert.strictEqual(env.calls[1][1].loops, 0);
        assert.strictEqual(env.calls[1][1].cache, null, 'Use the native default cache explicitly');
        env.load.resolve(env.playback); await fixtures.flush();
        assert.strictEqual(env.calls[2][0], 'play');
        env.requests[0].pending.resolve('Here is something.'); await fixtures.flush();
        assert.strictEqual(env.calls[3][0], 'stop');
        assert.strictEqual(env.speech.length, 1, 'TTS must wait for native stop');
        env.stop.resolve(); await fixtures.flush();
        assert.strictEqual(env.speech[1].text, 'Here is something.');
        console.log('PASS native thinking eye during generation; stop barrier before TTS');
    } finally { env.stop.resolve(); await env.runtime.close(); }
    const late = fixture();
    try {
        await thinking(late);
        await late.runtime.close();
        late.load.resolve(late.playback); await fixtures.flush();
        assert.strictEqual(late.calls.filter(call => call[0] === 'play').length, 0, 'Late loading must not play after close');
        assert.strictEqual(late.calls.filter(call => call[0] === 'stop').length, 1, 'Release the unused loaded playback');
        console.log('PASS delayed load is disposed without playback after close');
    } finally { late.stop.resolve(); await late.runtime.close(); }
    const stopping = fixture();
    try {
        await thinking(stopping); stopping.load.resolve(stopping.playback); await fixtures.flush();
        stopping.requests[0].pending.resolve('Reply'); await fixtures.flush();
        let closed = false;
        const closing = stopping.runtime.close().then(() => { closed = true; });
        await fixtures.flush();
        assert.strictEqual(closed, false, 'Close must retain an in-flight stop barrier');
        stopping.stop.resolve(); await closing; stopping.play.resolve(); await fixtures.flush();
        assert.strictEqual(stopping.speech.length, 1, 'Late stop/play cannot speak after close');
        assert.strictEqual(stopping.calls.filter(call => call[0] === 'stop').length, 1);
        console.log('PASS close retains pending stop; delayed play/stop cannot resume TTS');
    } finally { stopping.stop.resolve(); await stopping.runtime.close(); }
    const immediate = fixture();
    immediate.runtime.active = true; immediate.runtime.phase = 'thinking';
    immediate.runtime.thinkingEye.start();
    await immediate.runtime.close(); await fixtures.flush();
    assert.deepStrictEqual(immediate.calls, [], 'Queued lookup must not run after close');
    console.log('PASS no queued animation lookup after close');
    for (const loaded of [false, true]) {
        for (const reason of ['reply', 'failure', 'swipe', 'privacy', 'skillSwitch', 'globalTurnStarted']) {
            const race = fixture();
            try {
                await thinking(race);
                if (loaded) { race.load.resolve(race.playback); await fixtures.flush(); }
                const eye = { filters: ['privacy-eye'] }, red = { parent: {} };
                if (reason === 'reply') race.requests[0].pending.resolve('Done');
                if (reason === 'failure') race.requests[0].pending.reject(new Error('private provider details'));
                if (reason === 'swipe') race.jibo.swipe();
                if (reason === 'privacy') {
                    race.jibo.privacyController.enabled = true;
                    race.jibo.face.eye = eye; race.jibo.face.views._waterMark = red;
                    // Exercise the real privacy monitor rather than calling close manually.
                    await new Promise(resolve => setTimeout(resolve, 65));
                }
                if (reason === 'skillSwitch' || reason === 'globalTurnStarted') race.jibo.jetstream.events[reason].emit();
                await fixtures.flush();
                if (!loaded) { race.load.resolve(race.playback); await fixtures.flush(); }
                assert.strictEqual(race.calls.filter(call => call[0] === 'play').length, loaded ? 1 : 0, reason + ' must invalidate pending load');
                assert.strictEqual(race.calls.filter(call => call[0] === 'stop').length, 1, reason + ' must stop native playback');
                assert.strictEqual(race.speech.length, loaded || reason !== 'reply' && reason !== 'failure' ? 1 : 2);
                race.stop.resolve(); race.play.resolve(); await fixtures.flush();
                if (reason === 'failure') assert(!race.speech[1].text.includes('private provider'));
                if (reason === 'privacy') {
                    assert.strictEqual(race.jibo.face.eye, eye);
                    assert.deepStrictEqual(eye.filters, ['privacy-eye']);
                    assert.strictEqual(race.jibo.face.views._waterMark, red);
                }
                if (reason === 'skillSwitch') assert.strictEqual(race.exits(), 0);
            } finally { race.stop.resolve(); await race.runtime.close(); }
        }
    }
    console.log('PASS 12 load/play races: reply, provider failure, swipe, privacy, skill switch, global takeover');
    for (const stage of ['lookup', 'load', 'play', 'stop']) {
        const broken = fixture();
        try {
            if (stage === 'lookup') broken.jibo.animDB.getAnimByName = () => { throw new Error('unavailable'); };
            await thinking(broken);
            if (stage === 'load') broken.load.reject(new Error('load failed'));
            else broken.load.resolve(broken.playback);
            await fixtures.flush();
            if (stage === 'play') broken.play.reject(new Error('play failed'));
            await fixtures.flush(); broken.requests[0].pending.resolve('Still works'); await fixtures.flush();
            if (stage === 'stop') broken.stop.reject(new Error('stop failed')); else broken.stop.resolve();
            await fixtures.flush(); assert.strictEqual(broken.speech[1].text, 'Still works');
        } finally { broken.stop.resolve(); await broken.runtime.close(); }
    }
    console.log('PASS animation lookup/load/play/stop failures do not break conversation');
    const overlap = fixture();
    try {
        await thinking(overlap);
        const firstLoad = overlap.load;
        overlap.requests[0].pending.resolve('First reply'); await fixtures.flush();
        overlap.speech[1].pending.resolve(); await fixtures.flush();
        const nextLoad = deferred();
        overlap.jibo.animDB.getAnimByName = () => ({ createFromConfig: () => nextLoad.promise });
        overlap.turns[1].pending.resolve({ status: overlap.types.SUCCEEDED, result: { text: 'Follow up' } }); await fixtures.flush();
        const oldPlayback = { play: () => { throw new Error('stale generation played'); }, stop: () => Promise.resolve() };
        firstLoad.resolve(oldPlayback); await fixtures.flush();
        nextLoad.resolve(overlap.playback); await fixtures.flush();
        assert.strictEqual(overlap.calls.filter(call => call[0] === 'play').length, 1);
        overlap.stop.resolve(); await overlap.runtime.close();
        assert.strictEqual(overlap.calls.filter(call => call[0] === 'stop').length, 1, 'Stale load cannot replace current playback ownership');
        console.log('PASS stale previous-generation load cannot replace next-generation playback');
    } finally { overlap.stop.resolve(); await overlap.runtime.close(); }
}
run().catch(error => { console.error(error); process.exitCode = 1; });
