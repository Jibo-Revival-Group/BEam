'use strict';

/**
 * Jibo's speech language (BEacon Settings). He still listens in English; with a language chosen, what he is about
 * to say is sent to the cloud, which translates it and returns markup that makes his own voice say it.
 *
 * All speech goes through jibo.tts.speak / getWordTimings, so wrapping those two calls covers every skill.
 * If the cloud is slow, unreachable or does not offer the language, he says the English as before.
 */
const fs = require('fs');
const path = require('path');

const paths = require('./paths');

const LANGUAGES = [
    { id: 'en', name: 'English' },
    { id: 'es', name: 'Español' },
    { id: 'ro', name: 'Română' }
];
const TRANSLATE_TIMEOUT = 4000; // longer than this and the pause before he speaks is worse than English
const CACHE_MAX = 500;

function fail (message, status) { const err = new Error(message); err.status = status || 500; return err; }
function settingPath () { return path.join(paths.dataDir(), 'language.json'); }
function cachePath (language) { return path.join(paths.dataDir(), 'speech-' + language + '.json'); }
function valid (id) { return LANGUAGES.some(function (l) { return l.id === id; }); }

let current; // read once; BEacon is the only writer
function get () {
    if (current === undefined) {
        try { current = JSON.parse(fs.readFileSync(settingPath(), 'utf8')).language; } catch (err) { current = 'en'; }
        if (!valid(current)) { current = 'en'; }
    }
    return { language: current, languages: LANGUAGES };
}
function set (language) {
    if (!valid(language)) { throw fail('language must be one of: ' + LANGUAGES.map(function (l) { return l.id; }).join(', '), 400); }
    paths.ensureDir(paths.dataDir());
    fs.writeFileSync(settingPath() + '.tmp', JSON.stringify({ language: language }) + '\n');
    fs.renameSync(settingPath() + '.tmp', settingPath());
    current = language;
    return get();
}
/** The language to translate into, or null for English. */
function active () { const language = get().language; return language === 'en' ? null : language; }

// What he has said before, per language, so repeated lines need no cloud call. Oldest entries drop first.
const caches = {};
function cache (language) {
    if (!caches[language]) {
        let entries = [];
        try { entries = JSON.parse(fs.readFileSync(cachePath(language), 'utf8')); } catch (err) { /* none yet */ }
        caches[language] = { map: new Map(Array.isArray(entries) ? entries : []), timer: null };
    }
    return caches[language];
}
function remember (language, text, parts) {
    const c = cache(language);
    c.map.delete(text); c.map.set(text, parts);
    while (c.map.size > CACHE_MAX) { c.map.delete(c.map.keys().next().value); }
    if (c.timer) { return; }
    c.timer = setTimeout(function () {
        c.timer = null;
        try {
            fs.writeFileSync(cachePath(language) + '.tmp', JSON.stringify(Array.from(c.map.entries())));
            fs.renameSync(cachePath(language) + '.tmp', cachePath(language));
        } catch (err) { /* the cache is only a speed-up */ }
    }, 5000);
    if (c.timer.unref) { c.timer.unref(); }
}

/** Resolves the markup pieces to speak for text, or null to speak the English. Never rejects. */
function translate (text, callCloud) {
    const language = active();
    if (!language || !/[A-Za-z]/.test(text.replace(/<[^>]*>/g, ''))) { return Promise.resolve(null); }
    const known = cache(language).map.get(text);
    if (known) { return Promise.resolve(known); }
    const call = callCloud || function (body) {
        const calendars = require('./calendars');
        return calendars.callCloud('TranslateSpeech', body, calendars.robotIdFrom(null));
    };
    let timer;
    const timeout = new Promise(function (resolve) { timer = setTimeout(resolve, TRANSLATE_TIMEOUT, null); });
    const request = Promise.resolve().then(function () { return call({ language: language, text: text }); }).then(function (result) {
        const parts = result && Array.isArray(result.parts) ? result.parts.filter(function (p) { return typeof p === 'string' && p; }) : [];
        if (!parts.length) { return null; }
        remember(language, text, parts); // also when it arrived too late for this sentence: next time it is instant
        return parts;
    }).catch(function () { return null; });
    return Promise.race([request, timeout]).then(function (parts) { clearTimeout(timer); return parts; });
}

// Keeps the original's <speak> and, when it wraps everything, its <STYLE ...> (how embodied speech sends text).
function wrap (original, part) {
    const m = /^\s*<speak[^>]*>\s*(<(style)\b[^>]*>)/i.exec(original);
    const style = m && new RegExp('</' + m[2] + '>\\s*</speak>\\s*$', 'i').test(original) ? m : null;
    return '<speak>' + (style ? style[1] : '') + part + (style ? '</' + style[2] + '>' : '') + '</speak>';
}
function optionsAndCallback (a1, a2) {
    if (typeof a1 === 'function') { return { options: {}, callback: a1 }; }
    return { options: a1 || {}, callback: typeof a2 === 'function' ? a2 : null };
}
function settle (promise, callback) {
    if (!callback) { return promise; }
    promise.then(function (result) { callback(null, result); }, function (err) { callback(err); });
    return undefined;
}
function tokens (timing) { return (timing && timing.tokentimes && timing.tokentimes.tokens) || []; }
function length (timing) { const t = tokens(timing); return t.length ? t[t.length - 1].end - t[0].start : 0; }

function install (tts, translator) {
    if (!tts || tts.__languageHook) { return; }
    const orig = { speak: tts.speak, getWordTimings: tts.getWordTimings, stop: tts.stop };
    const getParts = translator || translate;
    let generation = 0;
    // Embodied speech asks for word timings, then speaks the same text: both must get the same answer.
    const pending = new Map();
    function partsFor (text) {
        if (!active()) { return null; }
        let p = pending.get(text);
        if (!p) {
            p = getParts(text); pending.set(text, p);
            const t = setTimeout(function () { if (pending.get(text) === p) { pending.delete(text); } }, 30000);
            if (t.unref) { t.unref(); }
        }
        return p;
    }
    function spokenOptions (options) {
        // "cached" would replay the last timing request's audio; earlyStopTime belongs to the English timings.
        const o = Object.assign({}, options, { mode: 'ssml' }); delete o.cached; delete o.earlyStopTime;
        return o;
    }
    tts.getWordTimings = function (text, a1, a2) {
        const wanted = typeof text === 'string' ? partsFor(text) : null;
        if (!wanted) { return orig.getWordTimings.apply(tts, arguments); }
        const oc = optionsAndCallback(a1, a2);
        return settle(wanted.then(function (parts) {
            if (!parts) { return orig.getWordTimings.call(tts, text, oc.options); }
            // Body and eye animation are placed on the English words, so those words keep their order and
            // share of the time; only the total is stretched to how long the translated speech really takes.
            let total = 0;
            const measured = parts.reduce(function (chain, part) {
                return chain.then(function () { return orig.getWordTimings.call(tts, wrap(text, part), spokenOptions(oc.options)); })
                    .then(function (timing) { total += length(timing); });
            }, Promise.resolve());
            return measured.then(function () { return orig.getWordTimings.call(tts, text, oc.options); }).then(function (english) {
                const list = tokens(english), was = length(english);
                if (!list.length || !(was > 0) || !(total > 0)) { return english; }
                const base = list[0].start, scale = total / was;
                list.forEach(function (token) {
                    token.start = base + (token.start - base) * scale; token.end = base + (token.end - base) * scale;
                });
                return english;
            });
        }), oc.callback);
    };
    tts.speak = function (text, a1, a2) {
        const wanted = typeof text === 'string' ? partsFor(text) : null;
        if (!wanted) { return orig.speak.apply(tts, arguments); }
        const oc = optionsAndCallback(a1, a2), gen = ++generation;
        return settle(wanted.then(function (parts) {
            if (!parts) { return orig.speak.call(tts, text, oc.options); }
            const options = spokenOptions(oc.options);
            return parts.reduce(function (chain, part) {
                return chain.then(function (result) { return gen === generation ? orig.speak.call(tts, wrap(text, part), options) : result; });
            }, Promise.resolve());
        }), oc.callback);
    };
    tts.stop = function () { generation++; return orig.stop.apply(tts, arguments); };
    tts.__languageHook = { orig: orig };
}

module.exports = { LANGUAGES: LANGUAGES, get: get, set: set, active: active, translate: translate, install: install, wrap: wrap,
    settingPath: settingPath, cachePath: cachePath, _reset: function () { current = undefined; Object.keys(caches).forEach(function (k) { delete caches[k]; }); } };
