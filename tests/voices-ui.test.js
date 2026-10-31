'use strict';
// BEacon Store › Voices and the theme voice pop-up, with a minimal fake DOM (same approach as theme-ui.test.js).
const assert = require('assert'), fs = require('fs'), path = require('path');
class Node {
    constructor(tag) { this.tagName = tag; this.children = []; this.events = {}; this.attrs = {}; this._text = ''; }
    set textContent(text) { this._text = String(text); this.children = []; }
    get textContent() { return this._text + this.children.map(c => c.textContent).join(''); }
    appendChild(node) { this.children.push(node); node.parentNode = this; return node; }
    addEventListener(type, handler) { this.events[type] = handler; }
    removeEventListener() {}
    setAttribute(name, value) { this.attrs[name] = value; }
    removeAttribute(name) { delete this.attrs[name]; }
    focus() { document.activeElement = this; }
    click() { this.clicked = true; }
    contains(node) { return this === node || this.children.some(c => c.contains(node)); }
    querySelectorAll() { return all(this).filter(c => c.tagName === 'button'); }
}
function all(node) { return node.children.reduce((list, c) => list.concat(c, all(c)), []); }
const ids = {}, body = new Node('body');
['store-content', 'store-auth-required', 'store-sign-in', 'themes-summary', 'theme-file', 'edit-main-menu', 'store-skill-list', 'upload-store-zip', 'store-sources', 'store-list',
    'store-switch', 'store-tab-themes', 'store-tab-skills', 'store-themes', 'store-skills', 'store-options', 'store-options-menu', 'store-options-button', 'manage-storefronts',
    'store-management', 'close-store-management', 'theme-details', 'theme-details-title', 'theme-details-meta', 'theme-details-readme',
    'store-tab-voices', 'store-voices', 'store-voice-list', 'voices-summary', 'voice-offer', 'voice-offer-text', 'voice-offer-yes', 'voice-offer-no'].forEach(id => { ids[id] = body.appendChild(new Node('div')); });
ids['voice-offer'].hidden = true;
const document = { body, activeElement: null, createElement: tag => new Node(tag), addEventListener() {}, querySelectorAll: () => [], querySelector: s => ids[s.slice(1)] };
const store = {}; global.localStorage = { getItem: k => store[k] || null, setItem: (k, v) => { store[k] = String(v); } };
const window = { clearInterval() {}, setInterval() { return 1; } };
const calls = [], toasts = [], errors = [];
const voiceRepo = 'https://github.com/example/robo-voice';
const theme = { id: 'theme-id', revision: 'r1', manifest: { name: 'Robo Theme', version: '1.0.0', voice: voiceRepo }, compatibility: { status: 'compatible' }, images: {}, active: false, pending: false, origin: { kind: 'zip' } };
const robo = { id: 'voice-id', revision: 'r2', manifest: { name: 'Robo', version: '1.0.0', type: 'voice', voice: { pitch: 2 } }, compatibility: { status: 'compatible' }, images: {}, active: false, origin: { kind: 'zip' }, readme: 'A robot voice.' };
let themes = { active: null, live: { live: true }, themes: [theme] }, voices = { active: null, voices: [robo] };
const catalog = { sources: [{ id: 'local', url: 'local:added', name: 'Added by themes', local: true, entries: [] }],
    entries: [{ id: 'entry-chorus', type: 'voice', name: 'Chorus', url: 'https://github.com/example/chorus', manifest: { name: 'Chorus', version: '1.0.0', type: 'voice' }, compatibility: { status: 'compatible' }, description: 'Many Jibos.' }] };
function api(method, url, data) {
    calls.push({ method, url, data });
    if (url === '/api/github/auth') { return Promise.resolve({ connected: true }); }
    if (url === '/api/themes') { return Promise.resolve(themes); }
    if (url === '/api/skills/custom') { return Promise.resolve({ skills: [] }); }
    if (url === '/api/voices') { return Promise.resolve(voices); }
    if (url === '/api/store') { return Promise.resolve(catalog); }
    if (url === '/api/themes/apply') { themes = Object.assign({}, themes, { active: data.id, themes: themes.themes.map(t => Object.assign({}, t, { active: t.id === data.id })) }); return Promise.resolve(themes); }
    if (url === '/api/voices/apply') { voices = { active: data.id, voices: voices.voices.map(v => Object.assign({}, v, { active: v.id === data.id })) }; return Promise.resolve(voices); }
    if (url === '/api/voices/theme') {
        const v = Object.assign({}, robo, { id: 'theme-voice', active: true, origin: { kind: 'theme', url: voiceRepo } });
        voices = { active: v.id, voices: voices.voices.map(x => Object.assign({}, x, { active: false })).concat(v) }; return Promise.resolve(voices);
    }
    return Promise.resolve({});
}
new Function('window', 'document', 'fetch', 'confirm', fs.readFileSync(path.join(__dirname, '../@be/be/beacon/public/themes.js'), 'utf8'))(window, document, () => Promise.reject(new Error('no fetch')), () => true);
const ui = window.BEaconThemes.create({ api: api, toast: (m) => toasts.push(m), reportError: e => errors.push(e), prompt: () => Promise.resolve(null) });
const card = name => ids['store-voice-list'].children.find(c => all(c).some(n => n.tagName === 'h3' && n.textContent === name));
const buttonIn = (node, text) => all(node).find(n => n.tagName === 'button' && n.textContent === text);
ui.loadStore(false).then(() => {
    ids['store-tab-voices'].onclick();
    assert(ids['store-switch'].className.includes('is-voices')); assert.strictEqual(ids['store-voices'].hidden, false); assert.strictEqual(ids['store-themes'].hidden, true);
    assert.strictEqual(ids['voices-summary'].textContent, 'Jibo’s voice: Normal');
    const stock = card('Jibo'); assert(stock && buttonIn(stock, 'In use').disabled, 'Jibo’s normal voice is the stock entry and in use');
    assert(buttonIn(card('Chorus'), 'Install'), 'Store voices can be installed');
    assert(!ids['store-list'].children.some(c => all(c).some(n => n.textContent === 'Chorus')), 'Voices are not listed with themes');
    assert.strictEqual(all(ids['store-sources']).filter(n => n.textContent === 'Refresh').length, 0, 'The local “Added by themes” listing has nothing to refresh');
    return buttonIn(card('Robo'), 'Use').onclick();
}).then(() => {
    assert(calls.some(c => c.method === 'POST' && c.url === '/api/voices/apply' && c.data.id === 'voice-id'));
    assert.strictEqual(ids['voices-summary'].textContent, 'Jibo’s voice: Robo'); assert(buttonIn(card('Robo'), 'In use'));
    // Applying a theme that links a voice asks once.
    ids['store-tab-themes'].onclick();
    return buttonIn(ids['store-list'].children.find(c => all(c).some(n => n.textContent === 'Robo Theme')), 'Apply').onclick();
}).then(() => {
    assert.strictEqual(ids['voice-offer'].hidden, false, 'Theme voice pop-up is shown');
    assert(/Robo Theme comes with a matching voice/.test(ids['voice-offer-text'].textContent) && /example\/robo-voice/.test(ids['voice-offer-text'].textContent));
    return ids['voice-offer-yes'].onclick();
}).then(() => {
    assert.strictEqual(ids['voice-offer'].hidden, true);
    assert(calls.some(c => c.method === 'POST' && c.url === '/api/voices/theme' && c.data.themeId === 'theme-id'));
    assert.strictEqual(voices.active, 'theme-voice');
    // Re-applying the theme does not ask again.
    voices = { active: null, voices: voices.voices.map(v => Object.assign({}, v, { active: false })) };
    return buttonIn(card('Jibo'), 'Use').onclick().then(() => buttonIn(ids['store-list'].children.find(c => all(c).some(n => n.textContent === 'None')), 'Apply').onclick())
        .then(() => buttonIn(ids['store-list'].children.find(c => all(c).some(n => n.textContent === 'Robo Theme')), 'Apply').onclick());
}).then(() => {
    assert.strictEqual(ids['voice-offer'].hidden, true, 'Answered once per theme version: no second pop-up');
    assert.deepStrictEqual(errors, []);
    console.log('Store › Voices, voice switching and theme voice pop-up passed');
}).catch(err => { console.error(err); process.exit(1); });
