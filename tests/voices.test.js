'use strict';
// Custom voices: package format, Store listing/download, theme voice links, TTS hook and the ALSA fx file.
// Node 6 compatible (promise chains, no async/await).
process.env.BEACON_VOICES = '1'; // voices are off by default
const assert = require('assert'), fs = require('fs'), os = require('os'), path = require('path');
const pkg = require('../@be/be/beacon/lib/theme-package'), stores = require('../@be/be/beacon/lib/theme-store');
const voicesLib = require('../@be/be/beacon/lib/voices'), hook = require('../@be/be/beacon/lib/voice-tts');
const themesLib = require('../@be/be/beacon/lib/themes'), fixture = require('./theme-fixtures');
const mp3 = Buffer.concat([Buffer.from('ID3'), Buffer.alloc(64)]);
function manifest(extra) { return Buffer.from(JSON.stringify(Object.assign({ name: 'Robo', version: '1.0.0', type: 'voice' }, extra))); }
function rejects(p, re) { return p.then(() => { throw new Error('Expected rejection'); }, err => assert(re.test(err.message), err.message)); }
function tmp() { return fs.mkdtempSync(path.join(os.tmpdir(), 'voices-')); }

// 1. Manifest: defaults, ranges, unknown effects; theme voice links.
assert.deepStrictEqual(pkg.manifest(manifest()).voice, { pitch: 0, speed: 1, volume: 1, vibrato: 0, vibratoSpeed: 5, formants: 0 });
assert.deepStrictEqual(pkg.manifest(manifest({ voice: { pitch: -3, vibrato: 0.5, vibratoSpeed: 6 } })).voice.pitch, -3);
assert.throws(() => pkg.manifest(manifest({ voice: { pitch: 13 } })), /voice.pitch must be a number from -12 to 12/);
assert.throws(() => pkg.manifest(manifest({ voice: { speed: '2' } })), /voice.speed/);
assert.throws(() => pkg.manifest(manifest({ voice: { echo: 1 } })), /Unknown voice effect: echo/);
const themeManifest = v => Buffer.from(JSON.stringify({ name: 'T', version: '1.0.0', type: 'theme', voice: v }));
assert.strictEqual(pkg.manifest(themeManifest('https://github.com/Owner/Robo-Voice/')).voice, 'https://github.com/Owner/Robo-Voice');
assert.throws(() => pkg.manifest(themeManifest('https://example.com/voice.zip')), /GitHub repository URL/);
assert.strictEqual(pkg.manifest(Buffer.from(JSON.stringify({ name: 'T', version: '1.0.0', type: 'theme' }))).voice, undefined);

// 2. TTS hook text transforms.
assert.deepStrictEqual(hook.sentences('Hi there. I am <pitch add="2">here. Yes.</pitch> Ok!'), ['Hi there.', ' I am <pitch add="2">here.</pitch>', '<pitch add="2"> Yes.</pitch> Ok!']);
// Jibo's embodied speech: wrapped in STYLE, spaces before punctuation, trailing " ." must not make an empty sentence.
assert.deepStrictEqual(hook.sentences('<STYLE set="NEUTRAL"> hey there ! I am happy . want to play ? </STYLE>'),
    ['<STYLE set="NEUTRAL"> hey there !</STYLE>', '<STYLE set="NEUTRAL"> I am happy .</STYLE>', '<STYLE set="NEUTRAL"> want to play ? </STYLE>']);
assert.deepStrictEqual(hook.sentences('Version 3.1.7 is out'), ['Version 3.1.7 is out']);
const v = { pitch: 2, speed: 1.25, formants: 0.4, breath: '/b.mp3', volume: 1 };
assert.strictEqual(hook.timingText('<speak>One. Two.</speak>', v, 0.5),
    "<speak><pitch halftone='2'><duration stretch='0.8'>One.<break size='0.5'/> Two.<break size='0.5'/></duration></pitch></speak>");
assert.deepStrictEqual(hook.spokenParts('<speak>One. Two.</speak>', v),
    ["<speak><pitch halftone='2'><duration stretch='0.8'>One.</duration></pitch></speak>", "<speak><pitch halftone='2'><duration stretch='0.8'> Two.</duration></pitch></speak>"]);
assert.strictEqual(hook.timingText('Plain', { pitch: 0, speed: 1, formants: 0, breath: null }, 0.5), 'Plain');

// 3. TTS hook behaviour with a fake TTS client and breath player.
const calls = [], played = [];
let voice = null;
const tts = {
    speak(text, options) { calls.push(['speak', text, options]); return Promise.resolve(); },
    getWordTimings(text, options) { calls.push(['timings', text, options]); return Promise.resolve({ tokentimes: { tokens: [] } }); },
    stop() { calls.push(['stop']); return Promise.resolve(); }
};
hook.install(tts, () => voice, { load(file, vol) { played.push(['load', file, vol]); }, play() { played.push(['play']); return Promise.resolve(); }, stop() { played.push(['stop']); } });
hook.install(tts, () => voice); // second install is a no-op
const hooked = tts.speak('Normal.').then(() => {
    assert.deepStrictEqual(calls.pop(), ['speak', 'Normal.', undefined], 'No voice: speech is untouched');
    voice = { pitch: 1, speed: 1, formants: -1, breath: '/v/breath.mp3', volume: 0.5 };
    return tts.speak('<speak>A. B!</speak>', { mode: 'ssml', cached: 'TRUE' });
}).then(() => {
    const speaks = calls.filter(c => c[0] === 'speak');
    assert.strictEqual(speaks.length, 2, 'One TTS request per sentence');
    assert.strictEqual(speaks[0][2].allPass, 0.91, 'Formants map to the engine all-pass constant');
    assert.strictEqual(speaks[0][2].mode, 'ssml');
    assert(!('cached' in speaks[0][2]) && !('cached' in speaks[1][2]), 'Cached audio (whole utterance, no formants) is never replayed per sentence');
    assert.deepStrictEqual(played.filter(p => p[0] === 'play').length, 2, 'Breath after each sentence');
    assert.deepStrictEqual(played[0], ['load', '/v/breath.mp3', 0.5]);
    return tts.getWordTimings('<speak>A. B!</speak>', { mode: 'ssml' });
}).then(() => {
    assert(/A\.<break size='0\.6'\/> B!<break size='0\.6'\/>/.test(calls[calls.length - 1][1]), 'Timing text leaves room for each breath');
    // stop() cancels the remaining sentences.
    calls.length = 0;
    const speaking = tts.speak('One. Two. Three.');
    return Promise.resolve().then(() => tts.stop()).then(() => speaking).then(() => {
        const speaks = calls.filter(c => c[0] === 'speak');
        assert(speaks.length <= 1, 'Stopped speech does not continue with later sentences (' + speaks.length + ')');
        assert(calls.some(c => c[0] === 'stop'));
    });
});

// 4. Voice packages: upload, activate (fx.txt for the ALSA plugin), remove; Store listing; theme links.
const root = tmp();
const voiceFiles = { 'manifest.json': manifest({ voice: { vibrato: 0.5, vibratoSpeed: 6, volume: 0.8, pitch: 2 } }), 'breath.mp3': mp3, 'README.md': Buffer.from('# Robo\n\nA robot voice.') };
const repo = 'https://github.com/example/robo-voice', api = 'https://api.github.com/repos/example/robo-voice', tag = 'v1.0.0';
const base = 'https://raw.githubusercontent.com/example/robo-voice/' + tag + '/', asset = repo + '/releases/download/' + tag + '/robo-voice.zip';
const network = stores.create(function (value) {
    if (value === api) { return Promise.resolve(Buffer.from(JSON.stringify({ owner: { login: 'example' }, stargazers_count: 3 }))); }
    if (value === api + '/releases/latest') { return Promise.resolve(Buffer.from(JSON.stringify({ id: 1, tag_name: tag, draft: false, prerelease: false, zipball_url: api + '/zipball/' + tag, assets: [{ name: 'robo-voice.zip', state: 'uploaded', browser_download_url: asset }] }))); }
    if (value === asset) { return Promise.resolve(fixture.zip(voiceFiles)); }
    if (value.indexOf(base) === 0 && voiceFiles[value.slice(base.length)]) { return Promise.resolve(voiceFiles[value.slice(base.length)]); }
    return Promise.reject(Object.assign(new Error('Unexpected request: ' + value), { remoteStatus: 404 }));
});
const themes = themesLib.create({ root: path.join(root, 'themes'), store: network, version: () => '3.1.8' });
let added = 0;
const voices = voicesLib.create({ root: path.join(root, 'voices'), store: network, catalog: () => themes.catalog(), compatibility: () => ({ status: 'compatible' }),
    addToStore: url => { added++; return themes.addLocalEntry(url); } });
const fx = () => fs.readFileSync(path.join(root, 'voices', 'fx.txt'), 'utf8').trim();
const packages = hooked.then(() => rejects(voices.upload(fixture.zip(Object.assign({}, voiceFiles, { 'run.sh': Buffer.from('x') }))), /Executable theme content/))
    .then(() => rejects(voices.upload(fixture.zip({ 'manifest.json': manifest(), 'breath.mp3': Buffer.from('not audio at all') })), /Invalid animation sound format: breath.mp3/))
    .then(() => voices.upload(fixture.zip(voiceFiles), 'robo.zip')).then(inv => {
        assert.strictEqual(inv.voices.length, 1); assert.strictEqual(inv.active, null); assert(inv.voices[0].hasBreath);
        return voices.activate(inv.installed);
    }).then(inv => {
        assert.strictEqual(fx(), '0.5 6 0.8', 'fx.txt: vibrato semitones, vibrato Hz, volume');
        const cur = voices.current(); assert.strictEqual(cur.pitch, 2); assert(/breath\.mp3$/.test(cur.breath));
        return voices.remove(inv.active);
    }).then(inv => {
        assert.strictEqual(inv.active, null); assert.strictEqual(fx(), '0 5 1', 'Removing the active voice restores the normal voice');
        assert.strictEqual(voices.current(), null);
        // Store: a storefront manifest can list voices.
        return network.catalog('https://store.example/manifest.json').catch(() => null);
    }).then(() => {
        const entries = stores.entries({ voices: ['Robo', { url: repo }] }, 'voices', 'https://store.example/manifest.json');
        assert.deepStrictEqual(entries, [{ name: 'Robo', type: 'voice', url: repo }]);
        return network.catalog(repo);
    }).then(items => {
        assert.strictEqual(items[0].type, 'voice'); assert.strictEqual(items[0].manifest.voice.vibrato, 0.5);
        // A theme's voice link: download, use it, and list it in the Store under "Added by themes".
        return voices.installFromTheme(repo + '/', 'Robo Theme');
    }).then(inv => {
        assert.strictEqual(inv.voices[0].origin.kind, 'theme'); assert.strictEqual(inv.voices[0].origin.theme, 'Robo Theme');
        assert.strictEqual(inv.active, inv.voices[0].id); assert.strictEqual(added, 1);
        const cat = themes.catalog(), local = cat.sources.filter(s => s.local)[0];
        assert(local && local.name === 'Added by themes');
        assert.strictEqual(cat.entries.filter(e => e.url === repo && e.type === 'voice').length, 1);
        return themes.addLocalEntry(repo).then(() => themes.refresh(local.id));
    }).then(cat => {
        assert.strictEqual(cat.entries.filter(e => e.url === repo).length, 1, 'Listed once; local listing is not refreshed over the network');
        // Installing the Store entry now goes through the same path.
        const entry = cat.entries.filter(e => e.url === repo)[0];
        return voices.install(entry.id);
    }).then(inv => {
        assert.strictEqual(inv.voices.length, 1);
        return rejects(voices.installFromTheme('https://example.com/voice'), /GitHub repositories/);
    });

// stop() during a breath: pause() fires no event, so speak() must still resolve promptly (default HTML audio player).
const breathStop = packages.then(() => {
    global.Audio = function () { this.listeners = {}; };
    Audio.prototype.addEventListener = function (t, f) { this.listeners[t] = f; };
    Audio.prototype.removeEventListener = function () {};
    Audio.prototype.play = function () { return Promise.resolve(); }; // never ends on its own
    Audio.prototype.pause = function () {};
    const t2 = { speak: () => Promise.resolve(), getWordTimings: () => Promise.resolve({}), stop: () => Promise.resolve() };
    hook.install(t2, () => ({ pitch: 0, speed: 1, formants: 0, breath: '/b.mp3', volume: 1 }));
    const t0 = Date.now(), speaking = t2.speak('One. Two.');
    setTimeout(() => t2.stop(), 50);
    return speaking.then(() => { delete global.Audio; assert(Date.now() - t0 < 1000, 'stop() ends a playing breath (' + (Date.now() - t0) + ' ms)'); });
});
breathStop.then(() => { console.log('voices tests passed'); }, err => { console.error(err); process.exit(1); });
