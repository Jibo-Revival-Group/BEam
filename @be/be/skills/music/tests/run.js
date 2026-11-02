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
        constructor() { this.children = []; this.scale = { x: 1, y: 1, set(v) { this.x = this.y = v; } }; this.anchor = { set() {} }; }
        addChild(child) { child.parent = this; this.children.push(child); return child; }
        addChildAt(child, at) { child.parent = this; this.children.splice(at, 0, child); return child; }
        removeChild(child) { this.children.splice(this.children.indexOf(child), 1); child.parent = null; }
        on(name, handler) { (this.handlers = this.handlers || {})[name] = handler; }
        removeChildren() { const old = this.children; this.children = []; return old; }
    }
    class Text extends Container {
        constructor(text, style) { super(); this.text = text; this.style = Object.assign({}, style); }
        get height() { return this.style.fontSize * 1.2; } get width() { return this.text.length * 15; }
        destroy() { this.destroyed = true; }
    }
    class Rectangle { constructor(x, y, width, height) { this.x = x; this.y = y; this.width = width; this.height = height; } }
    class Graphics extends Container {
        constructor() { super(); this.shapes = []; }
        beginFill() { return this; } lineStyle() { return this; } moveTo() { return this; } lineTo() { return this; } arc() { return this; }
        drawRect() { this.shapes.push({ kind: 'rect', args: Array.prototype.slice.call(arguments) }); return this; }
        drawCircle() { this.shapes.push({ kind: 'circle', args: Array.prototype.slice.call(arguments) }); return this; }
        drawPolygon() { return this; } clear() { this.shapes = []; return this; } endFill() { return this; }
    }
    class Texture { destroy() {} }
    class Sprite { destroy() {} }
    class Image { constructor() { this.naturalWidth = this.naturalHeight = 500; } }
    const previousImage = global.Image; global.Image = Image;
    const calls = [];
    const record = name => value => calls.push(value === undefined ? name : [name, value]);
    const ui = new UI({ lyrics: record('lyrics'), toggle: record('toggle'), back: record('back'), forward: record('forward'),
        quieter: record('quieter'), louder: record('louder'), setVolume: record('setVolume') });
    try {
        const configuration = ui.config({ ActionData: { CALLBACK: 'callback' } }), components = {};
        configuration.componentConfigs.forEach(config => { components[config.id] = { config: config, display: new Container(), lockInput: value => { components[config.id].locked = value; } }; });
        const buttons = configuration.componentConfigs.filter(config => config.type === 'ActionButton');
        assert.deepStrictEqual(buttons.map(b => b.id), ['back', 'toggle_pause', 'toggle_play', 'toggle_replay', 'forward'], 'previous, play/pause/replay, next');
        buttons.forEach(config => {
            assert(/^core:\/\/resources\/actionIcons\/|\/assets\/icons\//.test(config.iconSrc), 'stock Jibo or bundled white icons');
            if (config.iconSrc.indexOf('core://') !== 0) assert(fs.existsSync(config.iconSrc), config.iconSrc + ' is bundled');
        });
        const stage = new Container();
        ui.decorate({ stage: stage, getComponentById: id => components[id] },
            { Container: Container, Graphics: Graphics, Text: Text, Rectangle: Rectangle, Texture: Texture, BaseTexture: class {}, Sprite: Sprite });
        const state = { song: { title: 'Stateside', artist: 'PinkPantheress', duration: 200 }, position: 50, phase: 'playing', format: 'video', volume: 0.5 };
        const session = { options: {}, fit: () => {} };
        const shown = id => components[id].display.visible;
        const centre = id => components[id].display.x + 264 * components[id].display.scale.x / 2;

        // Music video: video, volume above, progress below; no controls until tapped.
        ui.render(state, session);
        assert.strictEqual(ui.mode, 'video'); assert.strictEqual(session.options.viewport, UI.VIDEO);
        assert(ui.mediaLayer.visible && !ui.artLayer.visible && ui.volumeRow.visible && ui.progress.visible);
        assert.strictEqual(ui.volumeRow.y, 74); assert.strictEqual(ui.progress.y, 616);
        assert(!ui.title.visible && !shown('toggle_pause'), 'controls hidden');
        assert.strictEqual(ui.progressFraction, 0.25); assert.deepStrictEqual([ui.elapsed.text, ui.length.text], ['0:50', '3:20']);
        ui.tap.handlers.tap();
        assert(ui.controlsUntil > 0 && ui.title.visible && shown('toggle_pause') && !shown('toggle_play'));
        assert.strictEqual(ui.title.text, 'Stateside'); assert.strictEqual(ui.title.y, 223, 'no AirPlay line: title higher');
        assert(!ui.device.visible); assert.strictEqual(components.toggle_pause.display.y + 264 * 0.49 / 2, 450);
        assert.deepStrictEqual(['back', 'toggle_pause', 'forward'].map(centre), [490, 640, 790]);
        assert.strictEqual(calls.indexOf('lyrics'), -1, 'no lyrics from the music video');
        components.toggle_pause.config.action.data.callback(); assert.strictEqual(calls.pop(), 'toggle');
        state.phase = 'paused'; ui.render(state, session); assert(shown('toggle_play') && !shown('toggle_pause') && components.toggle_pause.locked);
        state.phase = 'ended'; ui.render(state, session); assert(shown('toggle_replay')); state.phase = 'playing';
        ui.tap.handlers.click(); assert(!ui.controlsUntil && !shown('toggle_pause'), 'tapping again hides them');
        state.position = 240; ui.render(state, session); assert.strictEqual(ui.progressFraction, 1, 'timeline clamps past the end');
        state.position = 50;

        // Volume: drag the slider, tap the speakers.
        const at = x => ({ data: { getLocalPosition: () => ({ x: x, y: 0 }) } });
        ui.volumeBar.handlers.pointerdown(at(858)); assert.deepStrictEqual(calls.pop(), ['setVolume', 1]);
        ui.volumeBar.handlers.pointermove(at(398 + 460 / 4)); assert.deepStrictEqual(calls.pop(), ['setVolume', 0.25]);
        ui.volumeBar.handlers.pointerup(); const before = calls.length; ui.volumeBar.handlers.pointermove(at(500)); assert.strictEqual(calls.length, before, 'no drag after release');
        const knob = () => ui.volumeBar.shapes.filter(shape => shape.kind === 'circle')[0].args[0];
        state.volume = 1; ui.render(state, session); assert.strictEqual(knob(), 858, 'knob follows Jibo\'s volume');
        ui.volumeRow.children[1].handlers.tap(); assert.strictEqual(calls.pop(), 'quieter');
        ui.volumeRow.children[2].handlers.tap(); assert.strictEqual(calls.pop(), 'louder');

        // AirPlay: cover layout, "Now playing from <device>", controls always there.
        Object.assign(state, { airplay: true, format: 'cover', device: 'Victor’s iPhone' });
        ui.render(state, null);
        assert.strictEqual(ui.mode, 'cover'); assert(ui.artLayer.visible && ui.placeholder.visible, 'artwork placeholder until art arrives');
        assert(ui.device.visible && ui.deviceText.text === 'Now playing from Victor’s iPhone');
        assert.deepStrictEqual([ui.title.x, ui.title.y, ui.artist.y], [905, 210, 265]);
        assert.deepStrictEqual(['back', 'toggle_pause', 'forward'].map(centre), [755, 905, 1055]);
        assert(!components.toggle_pause.locked, 'AirPlay plays without a local session');
        assert.strictEqual(ui.progress.y, 540); assert.strictEqual(ui.volumeRow.y, 619);
        // Not AirPlay: same layout, text and buttons higher.
        Object.assign(state, { airplay: false }); ui.render(state, session);
        assert.strictEqual(ui.mode, 'cover'); assert(!ui.device.visible); assert.strictEqual(ui.title.y, 171);
        assert.strictEqual(components.toggle_pause.display.y + 264 * 0.49 / 2, 360);
        assert.strictEqual(session.options.viewport, UI.COVER, 'no artwork yet: the video fills the cover square');

        // Artwork: stale images never land.
        ui.artwork('http://localhost/art/old', () => { throw Error('stale image must not render'); });
        const stale = ui.image.onload;
        ui.artwork('http://localhost/art/new', () => {});
        stale(); assert.strictEqual(ui.texture, null);
        ui.image.onerror(); ui.render(state, session);

        // Tapping the cover opens lyrics; they fill the screen without controls.
        ui.tap.handlers.tap(); assert.strictEqual(calls.pop(), 'lyrics');
        ui.lyrics({ message: 'Finding lyrics…' });
        assert.strictEqual(ui.mode, 'lyrics');
        assert(ui.lyricsLayer.visible && !ui.artLayer.visible && !ui.mediaLayer.visible && !ui.volumeRow.visible && !ui.progress.visible && !shown('toggle_pause'));
        assert.strictEqual(ui.lyricsNote.text, 'Finding lyrics…'); assert(!ui.lyricsList.visible);
        const sung = [{ t: 1, text: 'one' }, { t: 2, text: 'two' }, { t: 3, text: '' }, { t: 4, text: 'four' }];
        ui.lyrics({ lines: sung, at: 1 });
        const list = ui.lyricsList.children, middle = 346;
        assert.deepStrictEqual(list.map(l => l.text), ['one', 'two', '♪', 'four'], 'every line, an empty one shows a note');
        assert.deepStrictEqual(list.map(l => l.style.fontSize), [48, 78, 48, 48], 'the sung line is larger');
        assert.deepStrictEqual(list.map(l => l.style.fill), ['#C8C8D2', '#FFFFFF', '#C8C8D2', '#C8C8D2']);
        assert.strictEqual(ui.lyricsList.y + list[1].y, middle, 'opening jumps the sung line to the middle');
        ui.lyrics({ lines: sung, at: 3 });
        const start = ui.lyricsList.y;
        for (let frame = 0; frame < 9; frame++) ui.glide(4); // 0.6 s at 15 fps
        const slow = ui.lyricsList.y; ui.lyricsList.y = start;
        for (let frame = 0; frame < 36; frame++) ui.glide(1); // 0.6 s at 60 fps
        assert(Math.abs(slow - ui.lyricsList.y) < 1, 'same speed at any frame rate');
        for (let frame = 0; frame < 60; frame++) ui.glide(1);
        assert(Math.abs(ui.lyricsList.y + list[3].y - middle) < 1, 'and settles on the new line');
        ui.lyrics({ lines: sung.slice(), at: 0 });
        assert(list.every(l => l.destroyed) && ui.lyricsList.children.length === 4, 'a new song replaces (and frees) the old lines');
        // Tap: controls over the lyrics; tap again: back to the artwork.
        ui.tap.handlers.tap();
        assert(ui.title.visible && ui.volumeRow.visible && ui.progress.visible && shown('toggle_pause'));
        assert.strictEqual(ui.volumeRow.y, 74); assert.strictEqual(ui.progress.y, 616);
        ui.tap.handlers.tap(); assert.strictEqual(calls.pop(), 'lyrics', 'second tap asks to close lyrics');
        ui.lyrics(null); assert.strictEqual(ui.mode, 'cover'); assert(!ui.lyricsLayer.visible && !ui.controlsUntil);

        state.phase = 'loading'; ui.render(state, null);
        assert(components.toggle_pause.locked && components.back.locked); assert.strictEqual(components.back.display.alpha, 0.4);
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
