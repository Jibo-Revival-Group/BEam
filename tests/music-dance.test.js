'use strict';
// Music dancing: stock loops fitted to the song's tempo, started on a beat, never sped past the animators' limit.
const assert = require('assert');
const Dancer = require('../@be/be/skills/music/dance');

// Real loop metadata (frames at 30 fps, allowed speed) from a 3.1.8 robot's animDB.
const loops = [['Back_Stepper_01', 73, [1, 1]], ['Carlton_01', 66, [0.7, 1]], ['Doughkneader_01', 81, [0.9, 1]],
    ['Footstomper_01', 41, [0.9, 1.1]], ['Pigeon_01', 54, [1, 1]], ['Spinner_01', 60, [1, 1], ['360']], ['SlideshowDance_01', 120, [1, 1]]];

for (const bpm of [60, 75, 92, 110, 128, 150, 174, 200]) {
    const fits = loops.map(([name, duration, speed]) => Dancer.fit({ duration: duration, speed: speed }, bpm)).filter(Boolean);
    assert(fits.length, 'some loop fits ' + bpm + ' BPM');
    loops.forEach(([name, duration, speed]) => {
        const fit = Dancer.fit({ duration: duration, speed: speed }, bpm);
        if (!fit) return;
        assert(fit.speed <= Math.max(speed[1], 1) + 1e-9 && fit.speed >= Math.min(speed[0], 0.75) - 1e-9, name + ' speed out of range');
        const loopMs = duration / 30 / fit.speed * 1000;
        assert(Math.abs(loopMs - fit.beats * 60000 / bpm) < 1, name + ' loop is a whole number of beats');
    });
}

function fakeJibo() {
    const log = [];
    const entry = ([name, duration, speed, terms]) => ({ name: name, meta: { duration: duration, speed: speed, metaTerms: ['loop'].concat(terms || []) },
        play(config) {
            const transform = Math.max(this.meta.speed[0], Math.min(this.meta.speed[1], config.speed)); // the SDK clamp
            let finish; const result = new Promise(resolve => { finish = resolve; });
            const dance = { name: this.name, config: config, speed: transform, at: Date.now(), result: result, playback: { stop: () => { log.push('stop ' + this.name); finish(); } } };
            log.push(dance); setTimeout(finish, 30); return dance;
        } });
    const jibo = { log: log, attention: [],
        animDB: { query: q => { assert.deepStrictEqual(q.excludeMeta, ['360']); return { matching: loops.filter(l => !(l[3] || []).includes('360')).map(entry) }; } },
        loader: { activeCache: 'cache' },
        expression: { AttentionMode: { OFF: 'off' }, dofs: { BODY: 'body' },
            pushAttentionMode: mode => { jibo.attention.push(mode); return Promise.resolve({ release: () => jibo.attention.push('released') }); },
            cleanup: options => { log.push('cleanup ' + options.dofs); return Promise.resolve(); } } };
    return jibo;
}
const wait = ms => new Promise(r => setTimeout(r, ms));

(async () => {
    // Dances at 120 BPM, each round starting on the predicted beat, slowed past the animators' range when needed.
    let jibo = fakeJibo(), beatAt = Date.now() + 40;
    const tempo = { estimate: () => ({ bpm: 120, confidence: 0.6, beat: beatAt }) };
    let dancer = new Dancer(jibo, () => tempo, () => 0.99);
    dancer.start('song A'); await wait(1300);
    const dances = jibo.log.filter(x => typeof x === 'object');
    // Like stock Radio: one dance per song, then back to normal (attention restored).
    assert.strictEqual(dances.length, 1, 'one dance per song, not nonstop');
    assert.strictEqual(dancer.running, false);
    assert(dances.every(d => d.config.dofs === 'body' && d.config.cache === 'cache'));
    assert(dances.every(d => !/^Slideshow/.test(d.name)), 'slideshow loops are not dances');
    assert(dances.every(d => d.speed === d.config.speed), 'the speed reaches the animation (no SDK clamp)');
    assert(dances.every(d => d.config.speed <= 1.1 + 1e-9), 'never faster than the animators allowed');
    const first = dances[0];
    assert(Math.abs(((first.at - beatAt) % 500 + 500) % 500) < 25 || Math.abs(((first.at - beatAt) % 500 + 500) % 500 - 500) < 25, 'starts on a beat');
    assert(dances.every(d => d.name === 'Pigeon_01'), 'only Pigeon fits 120 here');
    assert.deepStrictEqual(jibo.attention, ['off', 'released'], 'attention off while dancing, back after');
    assert(jibo.log.includes('cleanup body'));
    dancer.start('song A'); await wait(200);
    assert.strictEqual(jibo.log.filter(x => typeof x === 'object').length, 1, 'resuming the same song: no second dance');
    dancer.start('song B'); await wait(1300);
    assert.strictEqual(jibo.log.filter(x => typeof x === 'object').length, 2, 'the next song gets its dance');

    // Paused mid-dance: stops at once, nothing plays after.
    jibo = fakeJibo(); dancer = new Dancer(jibo, () => tempo);
    dancer.start('song C'); await wait(1000); await dancer.stop();
    const count = jibo.log.filter(x => typeof x === 'object').length; await wait(1100);
    assert.strictEqual(jibo.log.filter(x => typeof x === 'object').length, count, 'nothing plays after stop');

    // With several loops fitting (92 BPM), never the same one twice in a row.
    jibo = fakeJibo(); beatAt = Date.now();
    dancer = new Dancer(jibo, () => ({ estimate: () => ({ bpm: 92, confidence: 0.6, beat: beatAt }) }), Math.random);
    for (let song = 0; song < 4; song++) { dancer.start(song); await wait(900); }
    const varied = jibo.log.filter(x => typeof x === 'object');
    assert(varied.length >= 3 && new Set(varied.map(d => d.name)).size >= 2);
    for (let i = 1; i < varied.length; i++) assert.notStrictEqual(varied[i].name, varied[i - 1].name, 'no dance twice in a row');

    // No tempo yet, or a beatless track: he waits instead of dancing off the beat.
    for (const estimate of [null, { bpm: 100, confidence: 0.05, beat: Date.now() }]) {
        jibo = fakeJibo(); dancer = new Dancer(jibo, () => ({ estimate: () => estimate }));
        dancer.start(); await wait(60);
        assert.strictEqual(jibo.log.filter(x => typeof x === 'object').length, 0, 'no dancing without a confident tempo');
        await dancer.stop();
    }
    jibo = fakeJibo(); dancer = new Dancer(jibo, () => null); dancer.start(); await wait(30); await dancer.stop();
    assert.strictEqual(jibo.log.filter(x => typeof x === 'object').length, 0, 'no tracker yet');
    console.log('Music dancing: tempo fits, beat start, speed limits, waiting and stop passed');
})().catch(error => { console.error(error); process.exitCode = 1; });
