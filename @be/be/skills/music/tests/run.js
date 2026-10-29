'use strict';

const assert = require('assert'), fs = require('fs'), path = require('path'), vm = require('vm');
process.env.BE_MUSIC_TOKEN = 'a'.repeat(48);
const root = path.resolve(__dirname, '..'), songs = require('../helper/lib/songs'), Detector = require('../format');
const tests = [];
function test(name, work) { tests.push([name, work]); }
function video(id, title, channel, category) {
    return { id: id, title: title, channel: channel || 'AJR', categories: [category || 'Music'], duration: 180, thumb: '/thumb/' + id + '.jpg' };
}
function load(file, overrides) {
    const module = { exports: {} };
    const factory = vm.runInThisContext('(function(require,module,exports,__dirname){' + fs.readFileSync(path.join(root, file), 'utf8') + '\n})');
    factory(name => overrides && Object.prototype.hasOwnProperty.call(overrides, name) ? overrides[name] : require(name[0] === '.' ? path.resolve(root, name) : name), module, module.exports, root);
    return module.exports;
}
test('best song match, official preference and artist constraint', () => {
    const request = { title: 'Yes I’m A Mess', artist: 'AJR' };
    assert(songs.score(video('official001', "AJR - Yes I'm A Mess (Official Video)"), request) > songs.score(video('cover000001', "Yes I'm A Mess cover", 'AJR fan'), request));
    assert.strictEqual(songs.score(video('wrong000001', "Yes I'm A Mess", 'Other artist'), request), -1);
    assert.deepStrictEqual(songs.metadata(video('official001', "AJR - Yes I'm A Mess (Official Video)"), request), { title: "Yes I'm A Mess", artist: 'AJR' });
    assert.strictEqual(songs.format(video('lyric000001', 'Yes I’m A Mess (Lyrics)')), 'lyrics');
});
test('reject non-music, refine once, exclude rejected IDs', () => {
    let searches = 0; const checked = [];
    const bad = video('mrbeast0001', "Yes I'm A Mess challenge", 'MrBeast', 'Entertainment');
    const good = video('official001', "AJR - Yes I'm A Mess (Official Video)");
    return songs.resolve({ title: "Yes I'm A Mess" }, { provider: {
        search: () => Promise.resolve(++searches === 1 ? [bad] : [bad, good]),
        video: id => { checked.push(id); return Promise.resolve(id === bad.id ? bad : good); }
    } }).then(result => { assert.strictEqual(result.id, good.id); assert.strictEqual(searches, 2); assert.deepStrictEqual(checked, [good.id]); });
});
test('official metadata recovers missing streaming category from watch page and caches it', () => {
    const realUtil = require('../helper/lib/util'); let pages = 0;
    const formats = [
        { url: 'https://example.test/video', height: 480, fps: 30, mimeType: 'video/mp4; codecs="avc1.4d401e"', initRange: { start: '0', end: '99' }, indexRange: { start: '100', end: '199' } },
        { url: 'https://example.test/audio', mimeType: 'audio/mp4; codecs="mp4a.40.2"', initRange: { start: '0', end: '99' }, indexRange: { start: '100', end: '199' } }
    ];
    const api = load('helper/lib/innertube.js', {
        './config': { maxHeight: 480, maxFps: 30 },
        './format-selection': require('../helper/lib/format-selection'), './music-category': require('../helper/lib/music-category'),
        './util': Object.assign({}, realUtil, { requestBuffer: target => {
            let body;
            if (/sw\.js_data$/.test(target)) body = '"Cg1234567890abc"';
            else if (/watch\?/.test(target)) { pages++; body = '<meta itemprop="genre" content="Music">'; }
            else body = JSON.stringify({ playabilityStatus: { status: 'OK' }, videoDetails: { title: 'AJR - BANG! (Official Video)', author: 'AJR', lengthSeconds: '180' }, streamingData: { adaptiveFormats: formats } });
            return Promise.resolve({ buffer: Buffer.from(body) });
        } })
    });
    return api.video('4THFRpw68oQ').then(result => {
        assert.deepStrictEqual(result.categories, ['Music']);
        assert(songs.score(result, { title: 'Bang!', artist: 'AJR' }) > 0);
        return api.video('4THFRpw68oQ');
    }).then(() => assert.strictEqual(pages, 1));
});
test('watch-page category parser ignores recommendation JSON and handles attribute order', () => {
    const parse = require('../helper/lib/music-category').parse;
    assert.strictEqual(parse("<META content='Music' itemprop='genre'>"), 'Music');
    assert.strictEqual(parse('<meta itemprop="genre" content="Entertainment"><script>{"category":"Music"}</script>'), 'Entertainment');
    assert.strictEqual(parse('<script>{"category":"Music"}</script>'), '');
    assert.strictEqual(songs.score(video('mrbeast0001', 'MrBeast - Bang! (Official Video)', 'MrBeast', 'Entertainment'), { title: 'Bang!' }), -1);
});
test('title matching handles articles, punctuation and small transcription differences', () => {
    const good = video('Pukp9nKozE8', 'AJR - The Big Goodbye (Official Video)');
    ['The Big Goodbye', 'Big Goodbye', 'The Big Good Bye', 'The Big Goodby'].forEach(title => assert(songs.score(good, { title: title }) > 0, title));
    assert(songs.score(video('4THFRpw68oQ', 'AJR - BANG! (Official Video)'), { title: 'Bang' }) > 0);
    assert.strictEqual(songs.score(video('wrong000001', 'Jessie J - Bang Bang'), { title: 'Bang!' }), -1);
    assert.strictEqual(songs.score(video('wrong000002', 'AJR - Goodbye'), { title: 'The Big Goodbye' }), -1);
});
test('spelled artist acronyms and small errors retain artist validation', () => {
    const bang = video('4THFRpw68oQ', 'AJR - BANG! (Official Video)');
    ['AJR', 'A J R', 'A.J.R.', 'ay jay ar', 'A jar'].forEach(artist => assert(songs.score(bang, { title: 'Bang!', artist: artist }) > 0, artist));
    assert.strictEqual(songs.score(bang, { title: 'Bang!', artist: 'Taylor Swift' }), -1);
});
test('artist typo search broadens once but never drops the artist constraint', () => {
    const queries = [], good = video('4THFRpw68oQ', 'AJR - BANG! (Official Video)');
    return songs.resolve({ title: 'Bang!', artist: 'A jar' }, { provider: {
        search: query => { queries.push(query); return Promise.resolve(queries.length === 1 ? [] : [good]); },
        video: () => Promise.resolve(good)
    } }).then(result => {
        assert.strictEqual(result.artist, 'AJR'); assert.strictEqual(queries.length, 2);
        assert(queries[0].indexOf('A jar') >= 0); assert(queries[1].indexOf('A jar') < 0);
    });
});
test('exhaustion produces song_not_found with bounded candidate lookups', () => {
    let searches = 0, details = 0;
    return songs.resolve({ title: 'Hello' }, { provider: {
        search: () => { searches++; return Promise.resolve(Array.from({ length: 12 }, (_, i) => video(String(i), 'Hello', 'MrBeast', 'Entertainment'))); },
        video: id => { details++; return Promise.resolve(video(id, 'Hello', 'MrBeast', 'Entertainment')); }
    } }).then(() => { throw Error('should reject'); }, error => {
        assert.strictEqual(error.code, 'song_not_found'); assert.strictEqual(searches, 2); assert.strictEqual(details, 10);
    });
});
test('provider failure remains distinct from no song', () => songs.resolve({ title: 'Hello' }, { provider: {
    search: () => Promise.reject(Object.assign(Error('offline'), { code: 'network_unavailable' }))
} }).then(() => { throw Error('should reject'); }, error => assert.strictEqual(error.code, 'network_unavailable')));
test('by inside a title is not mistaken for an artist requirement', () => songs.resolve({ title: 'Stand', artist: 'Me' }, { provider: {
    search: () => Promise.resolve([video('standbyme01', 'Ben E. King - Stand By Me')]),
    video: () => Promise.resolve(video('standbyme01', 'Ben E. King - Stand By Me', 'Ben E. King'))
} }).then(result => { assert.strictEqual(result.title, 'Stand By Me'); assert.strictEqual(result.artist, 'Ben E. King'); }));
test('cancelled resolution never returns a song', () => {
    let alive = true;
    return songs.resolve({ title: 'Hello' }, { alive: () => alive, provider: {
        search: () => { alive = false; return Promise.resolve([video('hello000001', 'Hello')]); }
    } }).then(() => { throw Error('should cancel'); }, error => assert.strictEqual(error.code, 'cancelled'));
});
test('12 s still image, then sustained motion; lyric classification is stable', () => {
    const detector = new Detector(), pixels = new Uint8Array(32 * 18 * 4);
    for (let seconds = 0; seconds <= 12; seconds++) detector.sample(pixels, seconds, true);
    assert.strictEqual(detector.format, 'cover');
    pixels.fill(128);
    for (let seconds = 13; seconds <= 15; seconds++) detector.sample(pixels, seconds, true);
    assert.strictEqual(detector.format, 'video');
    const lyrics = new Detector('lyrics'); lyrics.sample(pixels, 20, true); assert.strictEqual(lyrics.format, 'lyrics');
});
test('buffering, pauses and seeks reset still-image evidence', () => {
    const detector = new Detector(), pixels = new Uint8Array(16);
    for (let seconds = 0; seconds <= 8; seconds++) detector.sample(pixels, seconds, true);
    detector.sample(pixels, 8, false);
    for (let seconds = 9; seconds <= 15; seconds++) detector.sample(pixels, seconds, true);
    assert.strictEqual(detector.format, 'video');
    detector.sample(pixels, 70, true); detector.sample(pixels, 71, true);
    assert.strictEqual(detector.format, 'video');
});
test('launch payload, interruption, stale playback and volume controls', () => {
    let volume;
    class Base {}
    const jibo = { volume: { currentVolume: 7, MIN_VOLUME: 0, MAX_VOLUME: 10, changeVolume: (intent, level) => { volume = level; } } };
    const Skill = load('index.js', { jibo: jibo, '@be/be-framework': { BeSkill: Base } });
    assert.deepStrictEqual(Skill.launchRequest({ nlu: { entities: { query: "Yes I'm A Mess", artist: 'AJR' } } }), { title: "Yes I'm A Mess", artist: 'AJR' });
    const skill = new Skill(); skill.volume(1); assert.strictEqual(volume, 8);
    let complete;
    skill.view = {}; skill.state = { song: { id: 'hello000001' } }; skill.render = () => {};
    skill.client = { stream: () => new Promise(resolve => { complete = resolve; }) };
    const play = skill.startAt(0);
    return Promise.resolve().then(() => {
        skill.generation++;
        complete({ start: 0, video: '/stream/video', audio: '/stream/audio' });
        return play;
    }).then(() => { assert.strictEqual(skill.session, null); });
});
test('adaptive layouts, artwork failures and stale image callbacks', () => {
    const UI = require('../ui');
    class Container {
        constructor() { this.children = []; }
        addChild(child) { child.parent = this; this.children.push(child); }
        addChildAt(child, at) { child.parent = this; this.children.splice(at, 0, child); }
        removeChild(child) { this.children.splice(this.children.indexOf(child), 1); child.parent = null; }
    }
    class Graphics extends Container {
        constructor() { super(); this.shapes = []; }
        beginFill() { return this; } lineStyle() { return this; }
        drawRect() { this.shapes.push({ kind: 'rect' }); return this; }
        drawRoundedRect() { this.shapes.push({ kind: 'roundedRect', args: Array.prototype.slice.call(arguments) }); return this; }
        drawCircle() { this.shapes.push({ kind: 'circle' }); return this; }
        clear() { this.shapes = []; return this; } endFill() { return this; }
    }
    class Texture { destroy() {} }
    class Sprite { destroy() {} }
    class Image { constructor() { this.naturalWidth = this.naturalHeight = 500; } }
    const previousImage = global.Image; global.Image = Image;
    const ui = new UI({});
    try {
        const configuration = ui.config({ ActionData: { CALLBACK: 'callback' } }), components = {};
        configuration.componentConfigs.forEach(config => { components[config.id] = { display: new Container(), style: {}, lockInput: value => { components[config.id].locked = value; } }; });
        const buttons = configuration.componentConfigs.filter(config => config.type === 'ActionButton');
        assert.strictEqual(buttons.length, 8, 'native ActionButtons for each control (three toggle faces)');
        buttons.forEach(config => {
            assert(/^core:\/\/resources\/actionIcons\/|\/assets\/icons\//.test(config.iconSrc), 'stock Jibo or bundled white icons');
            if (config.iconSrc.indexOf('core://') !== 0) assert(fs.existsSync(config.iconSrc), config.iconSrc + ' is bundled');
            const size = 264 * config.transform.scaleX;
            assert(config.position.x >= 0 && config.position.x + size <= 1280 && config.position.y + size <= 720);
        });
        ui.decorate({ stage: new Container(), getComponentById: id => components[id] },
            { Container: Container, Graphics: Graphics, Text: class {}, Texture: Texture, BaseTexture: class {}, Sprite: Sprite });
        const state = { song: { title: 'Hello', artist: 'Adele', duration: 200 }, position: 50, phase: 'playing', format: 'video' };
        const session = { options: {}, fit: () => {} };
        const shown = id => components[id].display.visible;
        ui.render(state, session); assert.strictEqual(session.options.viewport.width, 700); assert(!ui.artLayer.visible);
        assert(shown('toggle_pause') && !shown('toggle_play') && !shown('toggle_replay'));
        assert.strictEqual(ui.progressFraction, 0.25, 'timeline reflects the current song position');
        state.phase = 'paused'; ui.render(state, session); assert(shown('toggle_play') && !shown('toggle_pause'));
        assert(components.toggle_pause.locked, 'hidden toggle faces never take touches');
        state.phase = 'ended'; ui.render(state, session); assert(shown('toggle_replay')); state.phase = 'playing';
        state.position = 240; ui.render(state, session); assert.strictEqual(ui.progressFraction, 1, 'timeline clamps past the end');
        state.position = -20; ui.render(state, session); assert.strictEqual(ui.progressFraction, 0, 'timeline clamps before the start');
        state.position = 50; ui.render(state, session);
        state.format = 'cover'; ui.render(state, session); assert.strictEqual(session.options.viewport.width, 390);
        state.format = 'lyrics'; ui.render(state, session); assert(ui.artLayer.visible, 'missing lyric artwork uses placeholder');
        ui.artwork('http://localhost/art/old', () => { throw Error('stale image must not render'); });
        const stale = ui.image.onload;
        ui.artwork('http://localhost/art/new', () => {});
        stale(); assert.strictEqual(ui.texture, null);
        ui.image.onerror(); ui.render(state, session); assert(ui.artLayer.visible);
        state.phase = 'loading'; ui.render(state, null);
        assert(components.toggle_pause.locked && components.back.locked); assert(!components.stop.locked);
        assert.strictEqual(components.back.display.alpha, 0.4); assert.strictEqual(components.stop.display.alpha, 1);
    } finally { ui.releaseArtwork(); global.Image = previousImage; }
});
test('close always releases all resources and completes every callback', () => {
    const cleaned = [];
    const Skill = load('index.js', {
        jibo: { face: { views: {}, tween: {} } }, '@be/be-framework': { BeSkill: class {} },
        './video': { shutdown: () => { cleaned.push('video'); return Promise.reject(Error('decoder failed')); } },
        './service': { stop: () => { cleaned.push('helper'); return Promise.resolve(); } },
        './touch-lifecycle': { closeView: (views, tween, view, timers, prefix, done) => { cleaned.push('view'); done(); } }
    });
    const skill = new Skill(); skill.ui = { releaseArtwork: () => cleaned.push('artwork') };
    skill.client = { close: () => cleaned.push('requests') };
    const first = new Promise(resolve => skill.close(resolve)), second = new Promise(resolve => skill.close(resolve));
    return Promise.all([first, second]).then(errors => {
        assert(errors.every(error => error.message === 'decoder failed'));
        ['video', 'helper', 'view', 'artwork', 'requests'].forEach(name => assert.strictEqual(cleaned.filter(value => value === name).length, 1));
    });
});
test('ported native playback lifecycle', require('./video'));
test('ported media buffering transport', require('./buffered-media'));
test('all shipped JavaScript parses as ES2016 (robot Node 6)', () => {
    const acorn = require(path.resolve(root, '../../node_modules/acorn'));
    const visit = directory => fs.readdirSync(directory).forEach(name => {
        const file = path.join(directory, name);
        if (fs.statSync(file).isDirectory()) { if (name !== 'tests') visit(file); }
        else if (/\.js$/.test(name)) acorn.parse(fs.readFileSync(file, 'utf8'), { ecmaVersion: 7, allowReserved: true });
    });
    visit(root);
    assert(require('../../../package.json').jibo.lazySkills.indexOf('@be/music') >= 0);
});
tests.reduce((chain, item) => chain.then(item[1]).then(() => console.log('PASS ' + item[0])), Promise.resolve())
    .catch(error => { console.error(error.stack || error); process.exitCode = 1; });
