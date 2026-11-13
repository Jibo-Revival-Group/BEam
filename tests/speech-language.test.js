'use strict';
// Jibo's speech language: with a language chosen in BEacon, speech is swapped for the cloud's translated markup;
// English stays untouched, failures fall back to English, and embodied speech keeps its English word timings.
var assert = require('assert'), fs = require('fs'), os = require('os'), path = require('path');
var paths = require('../@be/be/beacon/lib/paths');
var dir = fs.mkdtempSync(path.join(os.tmpdir(), 'beam-language-'));
paths.dataDir = function () { return dir; };
var language = require('../@be/be/beacon/lib/speech-language');

var EN = '<speak><STYLE set="NEUTRAL"> hey there ! </STYLE></speak>';
var calls = [];
function fakeTts() {
    return {
        speak: function (text, options) { calls.push(['speak', text, options]); return Promise.resolve('spoken'); },
        getWordTimings: function (text, options) {
            calls.push(['timing', text, options]);
            // English: two words over 1 s. Translated parts: 1.5 s each.
            var tokens = /phoneme/.test(text) ? [{ name: 'word', start: 0, end: 1.5 }]
                : [{ name: 'hey', start: 0.1, end: 0.5 }, { name: 'there', start: 0.5, end: 1.1 }];
            return Promise.resolve({ tokentimes: { tokens: tokens } });
        },
        stop: function () { calls.push(['stop']); }
    };
}
var cloud = [];
function translator(parts) { return function (text) { cloud.push(text); return Promise.resolve(parts); }; }
var P1 = "<phoneme ph='o1 l aa0'>word</phoneme>", P2 = "<phoneme ph='k e1'>word</phoneme>?";

Promise.resolve().then(function () {
    // Setting: English by default, saved atomically, bad values refused.
    assert.strictEqual(language.get().language, 'en'); assert.strictEqual(language.active(), null);
    assert.deepStrictEqual(language.get().languages.map(function (l) { return l.id; }), ['en', 'es', 'ro']);
    assert.throws(function () { language.set('xx'); }, /language must be/);
    assert.strictEqual(language.set('ro').language, 'ro');
    assert.strictEqual(JSON.parse(fs.readFileSync(path.join(dir, 'language.json'), 'utf8')).language, 'ro');
    language._reset(); assert.strictEqual(language.active(), 'ro', 'survives a restart');
    language.set('en');

    // English: both calls pass through byte-for-byte and the cloud is never asked.
    var tts = fakeTts(); language.install(tts, translator([P1]));
    return tts.speak(EN, { cached: 'TRUE' }).then(function () { return tts.getWordTimings(EN, { a: 1 }); }).then(function () {
        assert.deepStrictEqual(calls, [['speak', EN, { cached: 'TRUE' }], ['timing', EN, { a: 1 }]]);
        assert.deepStrictEqual(cloud, []);
    });
}).then(function () {
    // Spanish, the way embodied speech does it: timings first, then speak the same text with "cached".
    language.set('es'); calls = []; cloud = [];
    var tts = fakeTts(); language.install(tts, translator([P1, P2]));
    return tts.getWordTimings(EN, { mode: 'ssml' }).then(function (timing) {
        var t = timing.tokentimes.tokens;
        assert.deepStrictEqual(t.map(function (x) { return x.name; }), ['hey', 'there'], 'the English words stay for animation');
        assert.ok(Math.abs(t[0].start - 0.1) < 1e-9 && Math.abs(t[1].end - 3.1) < 1e-9, 'stretched to the 3 s the translation takes: ' + JSON.stringify(t));
        assert.ok(Math.abs(t[0].end - 1.3) < 1e-9, 'each word keeps its share of the time');
        return tts.speak(EN, { cached: 'TRUE', earlyStopTime: 1, mode: 'ssml' });
    }).then(function (result) {
        assert.strictEqual(result, 'spoken');
        assert.deepStrictEqual(cloud, [EN], 'one cloud request for the timing + speak pair');
        var spoken = calls.filter(function (c) { return c[0] === 'speak'; });
        assert.deepStrictEqual(spoken.map(function (c) { return c[1]; }), [
            '<speak><STYLE set="NEUTRAL">' + P1 + '</STYLE></speak>', '<speak><STYLE set="NEUTRAL">' + P2 + '</STYLE></speak>'
        ], 'each piece spoken in order inside the original wrapper');
        spoken.forEach(function (c) { assert.deepStrictEqual(c[2], { mode: 'ssml' }, 'no "cached" replay and no English stop time'); });
        // Plain text callers (no <speak>) and the callback form.
        calls = [];
        return new Promise(function (resolve, reject) { tts.speak('hello', function (err) { return err ? reject(err) : resolve(); }); });
    }).then(function () {
        assert.strictEqual(calls[0][1], '<speak>' + P1 + '</speak>'); assert.strictEqual(calls[0][2].mode, 'ssml');
    });
}).then(function () {
    // The cloud cannot translate: he says the English, exactly as if the feature were off.
    calls = [];
    var tts = fakeTts(); language.install(tts, function () { return Promise.resolve(null); });
    return tts.getWordTimings(EN, { mode: 'ssml' }).then(function (timing) {
        assert.strictEqual(timing.tokentimes.tokens[1].end, 1.1);
        return tts.speak(EN, { cached: 'TRUE' });
    }).then(function () {
        assert.deepStrictEqual(calls, [['timing', EN, { mode: 'ssml' }], ['speak', EN, { cached: 'TRUE' }]]);
    });
}).then(function () {
    // stop() during a long reply: the remaining pieces are not spoken.
    calls = [];
    var tts = fakeTts(), release, gate = new Promise(function (resolve) { release = resolve; });
    tts.speak = function (text) { calls.push(['speak', text]); return gate; };
    language.install(tts, translator([P1, P2]));
    var speaking = tts.speak('two pieces');
    return Promise.resolve().then(function () { return new Promise(function (r) { setTimeout(r, 10); }); }).then(function () {
        tts.stop(); release(); return speaking;
    }).then(function () { assert.strictEqual(calls.filter(function (c) { return c[0] === 'speak'; }).length, 1); });
}).then(function () {
    // translate(): asks the cloud once per sentence, remembers it across restarts, never rejects.
    var asked = [];
    function call(body) { asked.push(body); return Promise.resolve({ parts: [P1] }); }
    return language.translate('hello', call).then(function (parts) {
        assert.deepStrictEqual(parts, [P1]); assert.deepStrictEqual(asked, [{ language: 'es', text: 'hello' }]);
        return language.translate('hello', call);
    }).then(function (parts) {
        assert.deepStrictEqual(parts, [P1]); assert.strictEqual(asked.length, 1, 'second time comes from the cache');
        return language.translate('<break size="1"/>', call);
    }).then(function (parts) {
        assert.strictEqual(parts, null, 'nothing to translate in markup alone'); assert.strictEqual(asked.length, 1);
        return language.translate('boom', function () { return Promise.reject(new Error('offline')); });
    }).then(function (parts) {
        assert.strictEqual(parts, null, 'cloud failure means English');
        return language.translate('empty', function () { return Promise.resolve({ parts: [] }); });
    }).then(function (parts) { assert.strictEqual(parts, null); });
}).then(function () {
    assert.strictEqual(language.wrap('<speak>hi</speak>', 'X'), '<speak>X</speak>');
    assert.strictEqual(language.wrap('<speak><style set="a">hi</style> more</speak>', 'X'), '<speak>X</speak>', 'a style that does not wrap everything is dropped');
    language.set('en');
    console.log('PASS speech language: setting, pass-through in English, translated speech with English timings, fallback, stop and cache');
}).catch(function (err) { console.error(err); process.exit(1); });
