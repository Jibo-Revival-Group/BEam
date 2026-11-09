'use strict';
// Dancing to the music (YouTube Music and AirPlay): stock dance loops played at a speed that makes one loop span
// 1/2/4/8/16 beats of the song, each round starting on a beat. Loops may be slowed to SLOWEST but never sped up past
// what their animators allowed (meta.speed), which keeps the motors within the motions Jibo was designed for.
// Like stock Radio's dancing: one dance per song (then back to normal), body DOFs only, attention off, no 360 spins.
const FPS = 30, SLOWEST = 0.75, ROUND_MS = 8000, MIN_CONFIDENCE = 0.2;

// Fastest-to-slowest fit of one loop to the tempo: { beats, speed } with speed closest to the animators' 1.
function fit(meta, bpm) {
    const lo = Math.min(meta.speed[0], SLOWEST), hi = Math.max(meta.speed[1], 1);
    let best = null;
    [1, 2, 4, 8, 16].forEach(beats => {
        const speed = meta.duration * bpm / (FPS * 60 * beats);
        if (speed >= lo && speed <= hi && (!best || Math.abs(1 - speed) < Math.abs(1 - best.speed))) best = { beats: beats, speed: speed };
    });
    return best;
}

class Dancer {
    // tempo(): the current Tempo (or null); random() is injectable for tests.
    constructor(jibo, tempo, random) {
        this.jibo = jibo; this.tempo = tempo; this.random = random || Math.random; this.running = false; this.last = null;
    }
    loops() {
        if (!this.dances) {
            this.dances = this.jibo.animDB.query({ hasAudio: 'NO', category: 'dance', includeMeta: ['loop'], excludeMeta: ['360'] }).matching
                .filter(entry => !/^Slideshow/.test(entry.name));
        }
        return this.dances;
    }
    // song: any key for the current song; he dances once per song.
    start(song) {
        if (this.running || song === this.danced) return;
        this.running = true; this.song = song; this.attention = null;
        this.next();
    }
    next() {
        clearTimeout(this.timer);
        if (!this.running) return;
        const tempo = this.tempo(), beat = tempo && tempo.estimate();
        if (!beat || beat.confidence < MIN_CONFIDENCE) { this.timer = setTimeout(() => this.next(), 1000); return; }
        const fitting = this.loops().map(entry => ({ entry: entry, fit: fit(entry.meta, beat.bpm) })).filter(choice => choice.fit);
        const fresh = fitting.filter(choice => choice.entry !== this.last); // a different loop each round when there is one
        const choices = (fresh.length ? fresh : fitting).sort((a, b) => Math.abs(1 - a.fit.speed) - Math.abs(1 - b.fit.speed)).slice(0, 5);
        if (!choices.length) { this.timer = setTimeout(() => this.next(), 1000); return; }
        const choice = choices[Math.floor(this.random() * choices.length)], period = 60000 / beat.bpm;
        const loopMs = choice.fit.beats * period, loops = Math.max(1, Math.round(ROUND_MS / loopMs));
        const wait = ((beat.beat - Date.now()) % period + period) % period; // until the next beat
        this.last = choice.entry;
        this.timer = setTimeout(() => {
            if (!this.running) return;
            const expression = this.jibo.expression; // attention off only once he really dances, like stock Radio
            this.attention = Promise.resolve(expression.pushAttentionMode(expression.AttentionMode.OFF)).catch(() => null);
            // The SDK clamps speed to meta.speed; a view of the entry with the slower bound lets it through.
            const entry = Object.create(choice.entry, { meta: { value: Object.assign({}, choice.entry.meta, {
                speed: [Math.min(choice.entry.meta.speed[0], SLOWEST), Math.max(choice.entry.meta.speed[1], 1)] }) } });
            const dance = this.dance = entry.play({ loops: loops, speed: choice.fit.speed, cache: this.jibo.loader.activeCache, dofs: this.jibo.expression.dofs.BODY });
            Promise.resolve(dance.result).catch(() => {}).then(() => { if (this.dance === dance) { this.dance = null; this.danced = this.song; this.stop(); } });
        }, wait);
    }
    stop() {
        if (!this.running) return Promise.resolve();
        this.running = false; clearTimeout(this.timer);
        const jibo = this.jibo, dance = this.dance, danced = this.attention; this.dance = null;
        return Promise.resolve(dance && dance.playback.stop()).catch(() => {})
            .then(() => danced && jibo.expression.cleanup({ dofs: jibo.expression.dofs.BODY })).catch(() => {})
            .then(() => this.attention).then(handle => { if (handle) return handle.release(); }).catch(() => {});
    }
}
Dancer.fit = fit;
module.exports = Dancer;
