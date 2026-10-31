'use strict';

// Applies the active custom voice to everything Jibo says. All speech (embodied speech, skills)
// goes through jibo.tts.speak / getWordTimings, so wrapping those two calls covers every caller.
// - pitch/speed: Jibo TTS markup around the text (<pitch halftone>, <duration stretch>)
// - formants: the engine's all-pass constant (allPass request field; 0.76 is Jibo's normal voice)
// - breath: each sentence is spoken separately with breath.mp3 after it; the timing text gets a
//   matching <break> so embodied speech keeps body/eye animation in sync.
const NORMAL_ALL_PASS = 0.76;

function splitSsml(text) {
    const m = /^(\s*<speak[^>]*>)([\s\S]*)(<\/speak>\s*)$/.exec(text);
    return m ? { open: m[1], inner: m[2], close: m[3] } : { open: '', inner: text, close: '' };
}
// Sentence ends outside any markup tag: . ! ? (plus closing quotes) followed by space or the end.
function sentences(inner) {
    // Splits inside wrapping tags too (Jibo's speech arrives as <STYLE ...>text</STYLE>): close them per sentence, reopen in the next.
    const parts = [], open = []; let start = 0, i = 0, prefix = '';
    const closers = () => open.slice().reverse().map(t => '</' + t.match(/^<([^\s>\/]+)/)[1] + '>').join('');
    while (i < inner.length) {
        const c = inner[i];
        if (c === '<') {
            const j = inner.indexOf('>', i); if (j < 0) { break; }
            const tag = inner.slice(i, j + 1);
            if (/^<\//.test(tag)) { open.pop(); } else if (!/\/>$/.test(tag)) { open.push(tag); }
            i = j + 1; continue;
        }
        if (c === '.' || c === '!' || c === '?') {
            let k = i + 1; while (k < inner.length && /[.!?"'”’)]/.test(inner[k])) { k++; }
            const rest = inner.slice(k).replace(/<\/[^>]*>/g, '');
            if ((k >= inner.length || /\s/.test(inner[k])) && /[^\s.!?]/.test(rest.replace(/<[^>]*>/g, ''))) {
                parts.push(prefix + inner.slice(start, k) + closers()); prefix = open.join(''); start = k; i = k; continue;
            }
        }
        i++;
    }
    if (inner.slice(start).trim()) { parts.push(prefix + inner.slice(start)); }
    return parts.length ? parts : [inner];
}
function round(x) { return Math.round(x * 1000) / 1000; }
function wrap(inner, v) {
    let t = inner;
    if (v.speed !== 1) { t = "<duration stretch='" + round(1 / v.speed) + "'>" + t + '</duration>'; }
    if (v.pitch !== 0) { t = "<pitch halftone='" + round(v.pitch) + "'>" + t + '</pitch>'; }
    return t;
}
// Text used for word timings: same as spoken, plus a pause where each breath plays.
function timingText(text, v, breathSeconds) {
    const s = splitSsml(text);
    const inner = v.breath ? sentences(s.inner).map(p => p + "<break size='" + round(breathSeconds) + "'/>").join('') : s.inner;
    return s.open + wrap(inner, v) + s.close;
}
// The pieces actually spoken, one per sentence when a breath follows each sentence.
function spokenParts(text, v) {
    const s = splitSsml(text);
    return (v.breath ? sentences(s.inner) : [s.inner]).map(p => s.open + wrap(p, v) + s.close);
}
function optionsAndCallback(a1, a2) {
    if (typeof a1 === 'function') { return { options: {}, callback: a1 }; }
    return { options: a1 || {}, callback: typeof a2 === 'function' ? a2 : null };
}
function install(tts, getVoice, player) {
    if (!tts || tts.__voiceHook) { return; }
    const orig = { speak: tts.speak, getWordTimings: tts.getWordTimings, stop: tts.stop };
    let generation = 0, breathSeconds = 0.6;
    const play = player || defaultPlayer(seconds => { breathSeconds = seconds; });
    function requestOptions(options, v) {
        // "cached" replays the audio from the last word-timings call (whole utterance, no allPass), so each sentence is synthesized fresh.
        const o = Object.assign({}, options); delete o.cached;
        if (v.formants) { o.allPass = round(NORMAL_ALL_PASS - 0.15 * v.formants); }
        return o;
    }
    tts.speak = function (text, a1, a2) {
        const v = typeof text === 'string' ? getVoice() : null;
        if (!v) { return orig.speak.apply(tts, arguments); }
        const oc = optionsAndCallback(a1, a2), options = requestOptions(oc.options, v), gen = ++generation;
        if (v.breath) { play.load(v.breath, v.volume); }
        const parts = spokenParts(text, v);
        const done = parts.reduce((chain, part) => chain.then(() => {
            if (gen !== generation) { return; }
            return orig.speak.call(tts, part, options).then(() => (v.breath && gen === generation ? play.play() : null));
        }), Promise.resolve());
        if (oc.callback) { done.then(() => oc.callback(null), err => oc.callback(err)); return undefined; }
        return done;
    };
    tts.getWordTimings = function (text, a1, a2) {
        const v = typeof text === 'string' ? getVoice() : null;
        if (!v) { return orig.getWordTimings.apply(tts, arguments); }
        const oc = optionsAndCallback(a1, a2), t = timingText(text, v, breathSeconds), options = requestOptions(oc.options, v);
        return oc.callback ? orig.getWordTimings.call(tts, t, options, oc.callback) : orig.getWordTimings.call(tts, t, options);
    };
    tts.stop = function () { generation++; play.stop(); return orig.stop.apply(tts, arguments); };
    tts.__voiceHook = { orig: orig, breathSeconds: () => breathSeconds };
}
// HTML audio in Be's renderer; resolves when the breath finishes (or fails to play).
function defaultPlayer(onDuration) {
    let audio = null, src = null, finish = null;
    return {
        load(file, volume) {
            if (typeof Audio === 'undefined') { return; }
            if (src !== file) {
                src = file; audio = new Audio('file://' + file); audio.preload = 'auto';
                audio.addEventListener('loadedmetadata', () => { if (isFinite(audio.duration) && audio.duration > 0) { onDuration(Math.min(5, audio.duration)); } });
            }
            audio.volume = Math.max(0, Math.min(1, volume));
        },
        play() {
            if (!audio) { return Promise.resolve(); }
            const a = audio;
            const t0 = Date.now();
            return new Promise(resolve => {
                finish = () => end();
                // Old Chromium misreports some MP3 durations, so the breath pause uses the measured play time.
                const end = (event) => {
                    if (event && event.type === 'ended') { onDuration(Math.min(5, (Date.now() - t0) / 1000)); }
                    a.removeEventListener('ended', end); a.removeEventListener('error', end); clearTimeout(t); resolve(); };
                const t = setTimeout(end, 6000);
                a.addEventListener('ended', end); a.addEventListener('error', end);
                try { a.currentTime = 0; const p = a.play(); if (p && p.catch) { p.catch(end); } } catch (err) { end(); }
            });
        },
        // pause() fires neither ended nor error, so resolve the pending breath here.
        stop() { if (audio) { try { audio.pause(); audio.currentTime = 0; } catch (err) { /* nothing playing */ } } if (finish) { finish(); } }
    };
}
module.exports = { install: install, sentences: sentences, timingText: timingText, spokenParts: spokenParts, wrap: wrap, NORMAL_ALL_PASS: NORMAL_ALL_PASS };
