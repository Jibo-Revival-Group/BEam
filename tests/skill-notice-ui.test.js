'use strict';
// "Just so you know": a skill from another storefront or a ZIP, or one asking for permissions, needs a yes before it installs.
const assert = require('assert');
const fs = require('fs');
const path = require('path');
class Node {
    constructor(tag) { this.tagName = tag; this.children = []; this.events = {}; this.attrs = {}; this._text = ''; }
    set textContent(text) { this._text = String(text); this.children = []; }
    get textContent() { return this._text + this.children.map(c => c.textContent).join(''); }
    appendChild(node) { this.children.push(node); node.parentNode = this; return node; }
    addEventListener(type, handler) { this.events[type] = handler; }
    setAttribute(name, value) { this.attrs[name] = value; }
    removeAttribute(name) { delete this.attrs[name]; }
    focus() { document.activeElement = this; }
    click() {}
    contains(node) { return this === node || this.children.some(c => c.contains(node)); }
    querySelectorAll() { return all(this).filter(c => c.tagName === 'button'); }
}
function all(node) { return node.children.reduce((list, c) => list.concat(c, all(c)), []); }
const ids = {}; const body = new Node('body');
for (const id of ['store-sort-field', 'store-sort-order', 'store-content', 'themes-summary', 'theme-file', 'edit-main-menu', 'store-skill-list', 'upload-store-zip', 'store-sources', 'store-list', 'store-switch', 'store-tab-themes', 'store-tab-skills', 'store-themes', 'store-skills', 'store-options', 'store-options-menu', 'store-options-button', 'manage-storefronts', 'store-management', 'close-store-management', 'theme-details', 'theme-details-title', 'theme-details-meta', 'theme-details-readme', 'theme-details-about', 'store-tab-voices', 'store-voices', 'store-voice-list', 'voices-summary', 'voice-offer', 'voice-offer-text', 'voice-offer-yes', 'voice-offer-no',
    'skill-notice', 'skill-notice-name', 'skill-notice-list', 'skill-notice-yes', 'skill-notice-no']) {
    ids[id] = body.appendChild(new Node('div'));
}
ids['store-sort-field'].value = 'votes';
ids['skill-notice'].hidden = true;
const document = { body, activeElement: body, createElement: tag => new Node(tag), createTextNode: text => Object.assign(new Node('#text'), { textContent: text }),
    addEventListener: () => {}, querySelectorAll: () => [], querySelector: selector => ids[selector.slice(1)] || new Node('div') };
const window = { clearInterval: () => {}, setInterval: () => 1 };
const OFFICIAL = 'https://store.5x1.com/manifest.json';
const skill = (id, name, sourceId, permissions) => ({ id, name, type: 'skill', sourceId, url: 'https://github.com/someone/' + name,
    manifest: { name, type: 'skill', version: '1.0.0', permissions }, compatibility: { status: 'compatible' } });
const catalog = { sources: [{ id: 'official', url: OFFICIAL, refreshedAt: 'x' }, { id: 'other', url: 'https://github.com/someone/Market', refreshedAt: 'x' }],
    entries: [skill('e1', 'Spy', 'other', ['microphone', 'camera']), skill('e2', 'Clock', 'official', undefined), skill('e3', 'Ears', 'official', ['microphone'])] };
const calls = [];
let uploadReplies = [];
const fetch = (url, options) => {
    calls.push({ method: options.method, url });
    const reply = uploadReplies.shift();
    return Promise.resolve({ ok: reply.status === 200, status: reply.status, text: () => Promise.resolve(JSON.stringify(reply.body)) });
};
new Function('window', 'document', 'fetch', 'confirm', fs.readFileSync(path.join(__dirname, '../@be/be/beacon/public/themes.js'), 'utf8'))(window, document, fetch, () => { throw new Error('no confirm() any more'); });
const ui = window.BEaconThemes.create({ api: (method, url, data) => {
    calls.push({ method, url, data });
    if (url === '/api/themes') return Promise.resolve({ active: null, live: { live: true }, themes: [] });
    if (url === '/api/skills/custom') return Promise.resolve({ skills: [] });
    if (url === '/api/voices') return Promise.resolve({ voices: [], active: null });
    if (url === '/api/store') return Promise.resolve(catalog);
    if (url.indexOf('/api/store/details') === 0) return Promise.resolve(url.indexOf('e1') > 0
        ? { url: 'https://github.com/someone/Spy', developer: 'someone', manifest: { type: 'skill', name: 'Spy', permissions: ['camera'] } }
        : { url: 'https://github.com/ZaneThePython/Clock', developer: 'ZaneThePython', manifest: { type: 'skill', name: 'Clock' } });
    if (url.indexOf('/progress') >= 0) return Promise.resolve({ state: 'idle' });
    return Promise.resolve({});
}, progressPollInterval: 5, toast: () => {}, reportError: err => { throw err; }, prompt: () => Promise.resolve(null) });
const installButton = name => all(ids['store-skill-list']).filter(n => n.tagName === 'button' && n.textContent === 'Install')
    .find(n => { let p = n; while (p && !p.textContent.includes(name)) { p = p.parentNode; } return p && p !== ids['store-skill-list']; });
const installs = () => calls.filter(c => c.url === '/api/skills/install');
const tick = () => new Promise(resolve => setTimeout(resolve, 10));

async function run() {
    await ui.loadStore(false);
    // Another storefront + permissions: the notice says so, and nothing downloads until Install.
    let pending = installButton('Spy').onclick(); await tick();
    assert.strictEqual(ids['skill-notice'].hidden, false);
    const text = ids['skill-notice-list'].textContent;
    assert(/isn’t official/.test(text) && text.includes('github.com/someone/Market'), text);
    assert(text.includes('This skill can:') && text.includes('hear you') && text.includes('take photos'), text);
    assert.strictEqual(ids['skill-notice-name'].textContent, 'Before you install Spy');
    assert.strictEqual(installs().length, 0, 'Nothing downloads before the owner says yes');
    ids['skill-notice-no'].onclick(); await pending;
    assert.strictEqual(ids['skill-notice'].hidden, true); assert.strictEqual(installs().length, 0, 'Cancel installs nothing');
    pending = installButton('Spy').onclick(); await tick(); ids['skill-notice-yes'].onclick(); await pending;
    assert.deepStrictEqual(installs()[0].data.accept, ['microphone', 'camera'], 'Install grants what was shown');
    // 5x1 Store skill with no permissions: nothing to say, installs straight away.
    await installButton('Clock').onclick();
    assert.strictEqual(installs().length, 2); assert.strictEqual(ids['skill-notice'].hidden, true);
    // 5x1 Store skill with permissions: only the permissions.
    pending = installButton('Ears').onclick(); await tick();
    assert(!/official/.test(ids['skill-notice-list'].textContent) && ids['skill-notice-list'].textContent.includes('hear you'));
    ids['skill-notice-yes'].onclick(); await pending;
    assert.deepStrictEqual(installs()[2].data.accept, ['microphone']);
    // A skill ZIP: BEacon answers 409 first, the notice says it is unofficial, then the yes uploads it again.
    uploadReplies = [{ status: 409, body: { error: 'Confirm before installing Zippy' } }, { status: 200, body: { type: 'skill' } }];
    pending = ui.upload({ name: 'zippy.zip', size: 100 }); await tick();
    assert.strictEqual(ids['skill-notice-name'].textContent, 'Before you install Zippy');
    assert(ids['skill-notice-list'].textContent.includes('ZIP file') && ids['skill-notice-list'].textContent.includes('doesn’t ask for any special access'));
    ids['skill-notice-yes'].onclick(); await pending;
    const uploads = calls.filter(c => c.method === 'PUT');
    assert.strictEqual(uploads.length, 2); assert(!/accept=/.test(uploads[0].url) && /accept=$/.test(uploads[1].url), uploads.map(u => u.url).join(' '));
    // Details: owner (trusted or not) and what the skill can do.
    const detailsButton = name => all(ids['store-skill-list']).filter(n => n.tagName === 'button' && n.textContent === 'Details')
        .find(n => { let p = n; while (p && !p.textContent.includes(name)) { p = p.parentNode; } return p && p !== ids['store-skill-list']; });
    await detailsButton('Spy').onclick();
    let about = ids['theme-details-about'].textContent;
    assert(about.includes('Developer') && about.includes('someone') && !about.includes('Trusted') && about.includes('take photos'), about);
    await detailsButton('Clock').onclick();
    about = ids['theme-details-about'].textContent;
    assert(about.includes('ZaneThePython') && about.includes('Trusted developer') && about.includes('doesn’t ask for any special access'), about);
    console.log('Skill install notice: unofficial source, permissions, no-op for plain 5x1 Store skills, ZIP confirm passed');
}
run().catch(e => { console.error(e); process.exitCode = 1; });
