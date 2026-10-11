'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
class Node {
    constructor(tag) { this.tagName = tag; this.children = []; this.events = {}; this.attrs = {}; this._text = ''; }
    set textContent(text) { this._text = String(text); this.children = []; }
    get textContent() { return this._text + this.children.map(c => c.textContent).join(''); }
    appendChild(node) { this.children.push(node); node.parentNode = this; return node; }
    addEventListener(type, handler) { this.events[type] = handler; }
    focus() { document.activeElement = this; }
    contains(node) { return this === node || this.children.some(c => c.contains(node)); }
    querySelectorAll(selector) { return all(this).filter(c => c.tagName === 'button' || c.tagName === 'a' && c.href); }
}
function all(node) { return node.children.reduce((list, c) => list.concat(c, all(c)), []); }
const ids = {}; const body = new Node('body');
for (const id of ['themes-summary', 'themes-list', 'store-sources', 'store-list', 'theme-details', 'theme-details-title', 'theme-details-meta', 'theme-details-readme']) {
    ids[id] = body.appendChild(new Node('div'));
}
const close = ids['theme-details'].appendChild(new Node('button'));
const document = { body, activeElement: close, createElement: tag => new Node(tag), createTextNode: text => Object.assign(new Node('#text'), { textContent: text }),
    querySelector: selector => selector === '#theme-details [data-action="close-theme-details"]' ? close : ids[selector.slice(1)] };
const window = {}; const calls = [], errors = [], messages = [];
const theme = { id: 'theme-id', revision: 'revision', manifest: { name: 'Astra', version: '1.0.0', supported: '3.1.6' }, compatibility: { status: 'compatible' },
    images: { 'face/eye.png': { width: 500, height: 500 } }, active: false, pending: false, origin: { kind: 'zip' } };
let inventory = { active: null, live: { live: true }, themes: [theme] };
const catalog = { sources: [{ id: 'source-id', url: 'https://example.com/manifest.json', refreshedAt: '2026-10-10T12:00:00Z' }],
    entries: [{ id: 'entry-id', name: 'Astra', description: 'A description', manifest: theme.manifest, compatibility: { status: 'compatible' } }] };
async function api(method, url, data) {
    calls.push({ method, url, data });
    if (url === '/api/themes') return inventory;
    if (url === '/api/store') return catalog;
    if (url.startsWith('/api/store/details')) return { manifest: theme.manifest, readme: '# Astra\n\n<script>alert(1)</script>\n\n[bad](javascript:alert) [safe](https://example.com)\n\n```\n<img onerror=alert(1)>\n```' };
    if (url === '/api/themes/apply') { inventory = Object.assign({}, inventory, { active: data.id }); return inventory; }
    if (url === '/api/store/refresh') return catalog;
    return {};
}
const fetch = (url, options) => { calls.push({ method: options.method, url }); return Promise.resolve({ ok: true, json: () => Promise.resolve({ installed: theme.id }) }); };
new Function('window', 'document', 'fetch', 'confirm', fs.readFileSync(path.join(__dirname, '../@be/be/beacon/public/themes.js'), 'utf8'))(window, document, fetch, () => true);
const ui = window.BEaconThemes.create({ api, toast: text => messages.push(text), reportError: error => errors.push(error), prompt: () => Promise.resolve('https://github.com/ZaneThePython/Astra') });
async function run() {
    await ui.loadStore(false);
    assert.strictEqual(ids['store-list'].children.length, 1); assert.strictEqual(ids['themes-list'].children.length, 2);
    const install = all(ids['store-list']).find(n => n.tagName === 'button' && n.textContent === 'Update');
    await install.onclick(); assert(calls.some(c => c.url === '/api/themes/install' && c.data.entryId === 'entry-id'));
    await ui.upload({ name: 'Astra.zip', size: 100 });
    assert(calls.some(c => c.url.startsWith('/api/themes/upload')));
    assert(!calls.some(c => c.url === '/api/themes/apply'), 'Upload/install must not activate a theme');
    await ui.addSource(); assert(calls.some(c => c.url === '/api/store/sources' && c.data.url === 'https://github.com/ZaneThePython/Astra'));
    const details = all(ids['themes-list']).find(n => n.tagName === 'button' && n.textContent === 'Details');
    await details.onclick();
    assert.strictEqual(ids['theme-details'].hidden, false);
    const nodes = all(ids['theme-details-readme']);
    assert(!nodes.some(n => n.tagName === 'script' || n.tagName === 'img'));
    assert.strictEqual(nodes.filter(n => n.tagName === 'a').length, 1);
    assert.strictEqual(nodes.find(n => n.tagName === 'a').href, 'https://example.com');
    assert(ids['theme-details-readme'].textContent.includes('<script>alert(1)</script>'));
    ids['theme-details'].events.keydown({ key: 'Escape' }); assert.strictEqual(ids['theme-details'].hidden, true);
    const apply = all(ids['themes-list']).find(n => n.tagName === 'button' && n.textContent === 'Apply');
    await apply.onclick(); assert(calls.some(c => c.url === '/api/themes/apply' && c.data.id === theme.id));
    await ui.upload({ name: 'bad.txt', size: 10 }); assert.strictEqual(errors.length, 1);
    await ui.upload({ name: 'big.zip', size: 33 * 1024 * 1024 }); assert.strictEqual(errors.length, 2);
    const html = fs.readFileSync(path.join(__dirname, '../@be/be/beacon/public/index.html'), 'utf8');
    const app = fs.readFileSync(path.join(__dirname, '../@be/be/beacon/public/app.js'), 'utf8');
    assert(html.includes('data-panel="themes"') && html.includes('data-panel="store"'));
    assert(html.indexOf('src="themes.js"') < html.indexOf('src="app.js"'));
    assert(!/panel-eye|eye-file|\/api\/eye/.test(html + app));
    console.log('Theme/store UI flows, separate upload/apply, source input, README sanitization and modal dismissal passed');
}
run().catch(e => { console.error(e); process.exitCode = 1; });
