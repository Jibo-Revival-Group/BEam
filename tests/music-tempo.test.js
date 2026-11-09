'use strict';
// Music tempo tracker: synthetic drums at known tempos, beat phase, silence, and holding through a half-time bar.
const assert = require('assert');
const Tempo = require('../@be/be/skills/music/tempo');
const RATE = 44100;

function drums(bpm, seconds, offset, seed) {
    let state = seed || 1;
    const rand = () => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state / 0x7fffffff * 2 - 1; };
    const out = new Float32Array(Math.round(seconds * RATE)), beat = 60 / bpm;
    for (let i = 0; i < out.length; i++) out[i] = 0.03 * rand();
    for (let k = 0, t = offset; t < seconds; k++, t += beat) {
        const start = Math.round(t * RATE);
        for (let j = 0; j < 0.1 * RATE && start + j < out.length; j++) {
            const decay = Math.exp(-j / RATE * 30);
            out[start + j] += k % 2 ? 0.5 * rand() * decay : 0.8 * Math.sin(2 * Math.PI * 60 * j / RATE) * decay;
        }
        const hat = Math.round((t + beat / 2) * RATE);
        for (let j = 0; j < 0.02 * RATE && hat + j < out.length; j++) out[hat + j] += 0.2 * rand() * Math.exp(-j / RATE * 90);
    }
    return out;
}
// Feeds audio in 2048-sample blocks with a wall clock in ms, estimating once a second like the dancer.
function feed(tempo, samples, clock) {
    let last = null, next = clock.ms + 1000;
    for (let i = 0; i < samples.length; i += 2048) {
        const block = samples.subarray(i, Math.min(samples.length, i + 2048));
        clock.ms += block.length / RATE * 1000; tempo.push(block, clock.ms);
        if (clock.ms >= next) { last = tempo.estimate(); next += 1000; }
    }
    return last;
}
const octaveOf = (got, want) => [0.5, 1, 2].some(f => Math.abs(got - want * f) / (want * f) < 0.02);

for (const bpm of [70, 95, 110, 128, 140, 175]) {
    const clock = { ms: 0 }, offset = 0.137;
    const e = feed(new Tempo(RATE), drums(bpm, 20, offset, bpm), clock);
    assert(e && octaveOf(e.bpm, bpm), bpm + ' BPM read as ' + (e && e.bpm));
    // The reported beat must sit on a real beat (or the off-beat midpoint for a 2x reading) within 40 ms.
    const step = 60000 / e.bpm, real = 60000 / bpm;
    const off = ((e.beat - offset * 1000) % Math.min(step, real) + Math.min(step, real)) % Math.min(step, real);
    assert(Math.min(off, Math.min(step, real) - off) < 40, bpm + ' BPM beat off by ' + off.toFixed(0) + ' ms');
}

assert.strictEqual(feed(new Tempo(RATE), new Float32Array(RATE * 8), { ms: 0 }), null, 'Silence has no tempo');

// 20 s at 120, then 5 s of half-time: the tempo holds (a switch needs 8 straight seconds).
const tempo = new Tempo(48000 === RATE ? 48000 : RATE), clock = { ms: 0 };
feed(tempo, drums(120, 20, 0, 7), clock);
const held = feed(tempo, drums(60, 5, 0, 8), clock);
assert(held && Math.abs(held.bpm - 120) < 3, 'Short half-time bar must not change the tempo: ' + (held && held.bpm));

// A quiet, beatless intro must not hold up the real tempo once the drums come in (within 6 s).
{
    const t = new Tempo(RATE), clock = { ms: 0 };
    let state = 9; const hiss = new Float32Array(RATE * 10).map(() => { state = (state * 1103515245 + 12345) & 0x7fffffff; return 0.05 * (state / 0x7fffffff - 0.5); });
    feed(t, hiss, clock);
    const after = feed(t, drums(116, 6, 0, 4), clock);
    assert(after && octaveOf(after.bpm, 116), 'Tempo after an intro read as ' + (after && after.bpm));
}

// 48 kHz input (AirPlay relay / Web Audio on some robots) reads the same.
const t48 = new Tempo(48000), samples = drums(100, 15, 0, 3), resampled = new Float32Array(Math.round(samples.length * 48000 / RATE));
for (let i = 0; i < resampled.length; i++) resampled[i] = samples[Math.min(samples.length - 1, Math.round(i * RATE / 48000))];
let e48 = null;
for (let i = 0, ms = 0, next = 1000; i < resampled.length; i += 2048) {
    const block = resampled.subarray(i, i + 2048); ms += block.length / 48 ; t48.push(block, ms);
    if (ms >= next) { e48 = t48.estimate(); next += 1000; }
}
assert(e48 && octaveOf(e48.bpm, 100), '48 kHz read as ' + (e48 && e48.bpm));
console.log('Music tempo: 70-175 BPM, beat phase, silence, half-time hold and 48 kHz passed');
