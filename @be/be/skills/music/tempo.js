'use strict';
// Live tempo from audio, for dancing to the music (YouTube Music via Web Audio, AirPlay via airplay/beat-relay.js).
// Onsets are spectral flux (rises in the log spectrum) at ~12 kHz every 10 ms. The last 8 s are autocorrelated over
// 60-200 BPM; each period is scored with its double (true beats repeat at 2x, 3:2 look-alikes don't) and a mild
// preference for ~120 BPM. A 2x error is harmless because the dancer fits 1/2/4/8/16 beats per loop.
const HOP_MS = 10, WINDOW = 800, MIN_LAG = 30, MAX_LAG = 100, SIZE = 512; // 200 and 60 BPM in 10 ms frames

function fftMagnitudes(re, im) { // in-place radix-2; returns |X| for bins 0..N/2
    const n = re.length;
    for (let i = 1, j = 0; i < n; i++) {
        let bit = n >> 1;
        for (; j & bit; bit >>= 1) j ^= bit;
        j ^= bit;
        if (i < j) { let t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; }
    }
    for (let len = 2; len <= n; len <<= 1) {
        const angle = -2 * Math.PI / len, wr = Math.cos(angle), wi = Math.sin(angle);
        for (let i = 0; i < n; i += len) {
            let cr = 1, ci = 0;
            for (let k = 0; k < len / 2; k++) {
                const a = i + k, b = a + len / 2;
                const tr = re[b] * cr - im[b] * ci, ti = re[b] * ci + im[b] * cr;
                re[b] = re[a] - tr; im[b] = im[a] - ti; re[a] += tr; im[a] += ti;
                const next = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = next;
            }
        }
    }
    const out = new Float32Array(n / 2 + 1);
    for (let k = 0; k <= n / 2; k++) out[k] = Math.sqrt(re[k] * re[k] + im[k] * im[k]);
    return out;
}

class Tempo {
    constructor(rate) {
        this.down = Math.max(1, Math.floor(rate / 11025)); // 44.1/48 kHz -> 11-12 kHz
        this.hop = Math.max(1, Math.round(rate / this.down * HOP_MS / 1000));
        this.window = new Float32Array(SIZE).map((_, i) => 0.5 - 0.5 * Math.cos(2 * Math.PI * i / SIZE));
        this.ring = new Float32Array(SIZE); this.pos = 0; this.sinceHop = 0; this.acc = 0; this.accN = 0;
        this.prev = null; this.env = []; this.at = 0; this.locked = null; this.pending = null;
    }
    // samples: mono floats in -1..1; now: wall-clock ms of the end of this block (defaults to Date.now()).
    push(samples, now) {
        for (let i = 0; i < samples.length; i++) {
            this.acc += samples[i];
            if (++this.accN < this.down) continue;
            this.ring[this.pos] = this.acc / this.down; this.pos = (this.pos + 1) % SIZE; this.acc = 0; this.accN = 0;
            if (++this.sinceHop >= this.hop) { this.sinceHop = 0; this.frame(); }
        }
        this.at = now === undefined ? Date.now() : now;
    }
    frame() {
        const re = new Float32Array(SIZE), im = new Float32Array(SIZE);
        for (let i = 0; i < SIZE; i++) re[i] = this.ring[(this.pos + i) % SIZE] * this.window[i];
        const mag = fftMagnitudes(re, im);
        let flux = 0;
        for (let k = 1; k < mag.length; k++) {
            mag[k] = Math.log(1 + 100 * mag[k]);
            if (this.prev) flux += Math.max(0, mag[k] - this.prev[k]);
        }
        this.prev = mag;
        this.env.push(flux);
        if (this.env.length > WINDOW) this.env.shift();
    }
    reset() { this.env = []; this.prev = null; this.locked = null; this.lockedConfidence = 0; this.pending = null; }
    // { bpm, confidence 0-1, beat: wall-clock ms of the most recent beat } or null until ~4 s of music.
    estimate() {
        const env = this.env, n = env.length;
        if (n < 400) return null;
        let mean = 0;
        for (let i = 0; i < n; i++) mean += env[i];
        mean /= n;
        const x = env.map(v => v - mean);
        let energy = 0;
        for (let i = 0; i < n; i++) energy += x[i] * x[i];
        if (energy <= 1e-9) return null;
        const ac = lag => { let s = 0; for (let i = lag; i < n; i++) s += x[i] * x[i - lag]; return s / energy; };
        const raw = [];
        for (let lag = MIN_LAG - 1; lag <= 2 * MAX_LAG + 2; lag++) raw[lag] = ac(lag);
        const score = lag => {
            const octaves = Math.log(lag / 50) / Math.LN2; // 50 frames = 120 BPM
            return (raw[lag] + 0.5 * raw[2 * lag]) * Math.exp(-0.5 * octaves * octaves);
        };
        let best = MIN_LAG;
        for (let lag = MIN_LAG; lag <= MAX_LAG; lag++) if (score(lag) > score(best)) best = lag;
        const a = raw[best - 1], b = raw[best], c = raw[best + 1];
        const shift = a - 2 * b + c ? 0.5 * (a - c) / (a - 2 * b + c) : 0;
        const period = best + Math.max(-0.5, Math.min(0.5, shift));
        let bpm = 6000 / period;
        // Hold a confident tempo through brief disagreements (fills, half-time bars): switch only after 8 matching estimates
        // in a row. An unconfident one (song intro) is replaced straight away.
        const near = (p, q) => Math.abs(p - q) / q < 0.04;
        const confidence = raw[best];
        if (!this.locked || near(bpm, this.locked) || this.lockedConfidence < 0.2) { this.locked = bpm; this.lockedConfidence = confidence; this.pending = null; }
        else if (this.pending && near(bpm, this.pending.bpm) && ++this.pending.count >= 8) { this.locked = bpm; this.lockedConfidence = confidence; this.pending = null; }
        else if (!this.pending || !near(bpm, this.pending.bpm)) this.pending = { bpm: bpm, count: 1 };
        bpm = this.locked;
        const step = 6000 / bpm;
        // Phase: the offset whose comb of beats lands on the most onset strength.
        let phase = 0, top = -Infinity;
        for (let p = 0; p < step; p++) {
            let s = 0;
            for (let t = n - 1 - p; t >= 0; t -= step) s += env[Math.round(t)];
            if (s > top) { top = s; phase = p; }
        }
        return { bpm: bpm, confidence: Math.max(0, Math.min(1, raw[Math.round(step)] || 0)), beat: this.at - phase * HOP_MS };
    }
}

module.exports = Tempo;
