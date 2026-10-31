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
    setAttribute(name, value) { this.attrs[name] = value; }
    removeAttribute(name) { delete this.attrs[name]; if (name === 'value') delete this.value; }
    focus() { document.activeElement = this; }
    click() { this.clicked = true; }
    contains(node) { return this === node || this.children.some(c => c.contains(node)); }
    querySelectorAll(selector) { return all(this).filter(c => c.tagName === 'button' || c.tagName === 'a' && c.href); }
}
function all(node) { return node.children.reduce((list, c) => list.concat(c, all(c)), []); }
const ids = {}; const body = new Node('body');
for (const id of ['store-content', 'store-auth-required', 'store-sign-in', 'themes-summary', 'theme-file', 'edit-main-menu', 'store-skill-list', 'upload-store-zip', 'store-sources', 'store-list', 'store-switch', 'store-tab-themes', 'store-tab-skills', 'store-themes', 'store-skills', 'store-options', 'store-options-menu', 'store-options-button', 'manage-storefronts', 'store-management', 'close-store-management', 'theme-details', 'theme-details-title', 'theme-details-meta', 'theme-details-readme', 'store-tab-voices', 'store-voices', 'store-voice-list', 'voices-summary', 'voice-offer', 'voice-offer-text', 'voice-offer-yes', 'voice-offer-no']) {
    ids[id] = body.appendChild(new Node('div'));
}
const close = ids['theme-details'].appendChild(new Node('button'));
ids['store-options-menu'].hidden = true; ids['store-management'].hidden = true;
ids['store-options'].appendChild(ids['store-options-button']); ids['store-options'].appendChild(ids['store-options-menu']);
ids['store-options-menu'].appendChild(ids['manage-storefronts']); ids['store-management'].appendChild(ids['close-store-management']);
const documentEvents = {};
const document = { body, activeElement: close, createElement: tag => new Node(tag), createTextNode: text => Object.assign(new Node('#text'), { textContent: text }),
    addEventListener: (type, handler) => documentEvents[type] = handler,
    querySelectorAll: () => [],
    querySelector: selector => selector === '#theme-details [data-action="close-theme-details"]' ? close : ids[selector.slice(1)] };
const timers = []; const window = { clearInterval: () => {}, setInterval: (fn, delay) => { timers.push({ fn, delay }); return timers.length; } }; const calls = [], errors = [], messages = [];
const theme = { id: 'theme-id', revision: 'revision', manifest: { name: 'Astra', version: '1.0.0', supported: '3.1.6' }, compatibility: { status: 'compatible' },
    images: { 'face/eye.png': { width: 500, height: 500 } }, active: false, pending: false, origin: { kind: 'zip' } };
let connected = false, inventory = { active: null, live: { live: true }, themes: [theme] };
const catalog = { sources: [{ id: 'source-id', url: 'https://example.com/manifest.json', refreshedAt: '2026-10-10T12:00:00Z' }],
    entries: [{ id: 'entry-id', name: 'Astra', description: 'A description', bannerUrl: 'https://example.com/banner.png', manifest: theme.manifest, compatibility: { status: 'compatible' } }] };
async function api(method, url, data) {
    calls.push({ method, url, data });
    if (url === '/api/github/auth') return { connected: connected };
    if (url === '/api/themes') return inventory;
    if (url === '/api/store') return catalog;
    if (url.startsWith('/api/store/details')) return { manifest: theme.manifest, readmeUrl: 'https://raw.githubusercontent.com/owner/Astra/commit/README.md',
        readme: '# Astra\n\n<script>alert(1)</script>\n\n[bad](javascript:alert) [safe](https://example.com)\n\n![Preview](https://example.com/preview.png)\n\n![Relative](images/preview.png)\n\n```\n<img onerror=alert(1)>\n```' };
    if (url === '/api/themes/apply') { inventory = Object.assign({}, inventory, { active: data.id, themes: inventory.themes.map(t => Object.assign({}, t, { active: t.id === data.id })) }); return inventory; }
    if (url === '/api/store/refresh') return catalog;
    return {};
}
let fetchMode = 'ok'; let apiMode = 'ok'; let installResolve, installReject, progressData;
const fetch = (url, options) => {
    calls.push({ method: options.method, url });
    if (fetchMode === 'throw') throw new Error('Connection failed');
    if (fetchMode === 'hang') return new Promise(() => {});
    return Promise.resolve({ ok: fetchMode !== 'error', status: fetchMode === 'error' ? 500 : 200,
        text: () => Promise.resolve(fetchMode === 'invalid' ? '<html>bad gateway</html>' : JSON.stringify(fetchMode === 'error' ? { error: 'Disk full' } : { installed: theme.id })) });
};
new Function('window', 'document', 'fetch', 'confirm', fs.readFileSync(path.join(__dirname, '../@be/be/beacon/public/themes.js'), 'utf8'))(window, document, fetch, () => true);
const ui = window.BEaconThemes.create({ api: (method, url, data) => {
    if (apiMode === 'progress' && url === '/api/themes/install') {
        progressData = { id: data.requestId, state: 'downloading', received: 5120, total: 10240, percent: 50 };
        return new Promise((resolve, reject) => { installResolve = resolve; installReject = reject; });
    }
    if (url.startsWith('/api/themes/progress')) return Promise.resolve(progressData || { state: 'idle' });
    if (apiMode === 'hang') return new Promise(() => {});
    if (apiMode === 'error') return Promise.reject(new Error('Connection lost'));
    return api(method, url, data);
}, requestTimeout: 100, progressPollInterval: 5, toast: text => messages.push(text), reportError: error => errors.push(error), prompt: () => Promise.resolve('https://github.com/ZaneThePython/Astra') });
async function run() {
    await ui.loadStore(false); await ui.refreshStore(null, true);
    assert.strictEqual(ids['store-content'].hidden, true);
    assert.strictEqual(ids['store-auth-required'].hidden, false);
    assert(ids['upload-store-zip'].disabled && ids['store-tab-skills'].disabled);
    assert(!calls.some(call => call.url.indexOf('/api/store') === 0), 'Signed-out Store never fetches or refreshes the catalog');
    assert.strictEqual(timers.length, 0, 'No automatic refresh timer before authentication');
    connected = true;
    await ui.loadStore(false);
    assert.strictEqual(ids['store-content'].hidden, false);
    assert.strictEqual(timers.length, 1); assert.strictEqual(timers[0].delay, 3600000, 'Refresh every hour');
    assert.strictEqual(ids['store-list'].children.length, 2, 'Installed/catalog matches appear once, alongside None');
    const stock = ids['store-list'].children[0]; assert(stock.textContent.includes('None'));
    assert.strictEqual(all(stock).find(n => n.tagName === 'img').src, 'theme-none.svg');
    assert(all(stock).find(n => n.tagName === 'button').disabled, 'None is initially active');
    assert.strictEqual(ids['store-skills'].hidden, true); assert.strictEqual(ids['store-tab-themes'].attrs['aria-selected'], 'true');
    const card = ids['store-list'].children[1]; assert.strictEqual(card.className, 'store-card');
    assert(all(card).some(n => n.tagName === 'h3' && n.textContent === 'Astra'));
    const banner = all(card).find(n => n.tagName === 'img'); assert(banner.src.startsWith('/api/store/banner?id=entry-id'));
    banner.onerror(); assert.strictEqual(banner.hidden, true, 'Missing or invalid banners retain a fallback');
    const beforeSwitch = calls.length; ids['store-tab-skills'].onclick();
    assert(ids['store-switch'].className.includes('is-skills')); assert.strictEqual(ids['store-themes'].hidden, true);
    assert.strictEqual(ids['store-skills'].hidden, false); assert.strictEqual(calls.length, beforeSwitch, 'Skills tab has no install API calls');
    await ui.loadStore(false); assert.strictEqual(ids['store-skills'].hidden, false, 'Refresh preserves the selected tab');
    ids['store-tab-skills'].events.keydown({ key: 'ArrowLeft', preventDefault() {} });
    assert.strictEqual(ids['store-themes'].hidden, false); assert.strictEqual(document.activeElement, ids['store-tab-themes']);
    const remove = all(ids['store-list']).find(n => n.tagName === 'button' && n.textContent === 'Remove');
    assert(remove && !remove.disabled, 'Matching installed version offers Remove');
    await remove.onclick(); assert(calls.some(c => c.method === 'DELETE' && c.url === '/api/themes?id=theme-id'));
    catalog.entries[0].release = { id: 20, tag: 'v2.0.0' };
    theme.origin = Object.assign({}, theme.origin, { release: { id: 10, tag: 'v1.0.0' } });
    await ui.loadStore(false);
    assert(all(ids['store-list']).some(n => n.textContent === 'Update'), 'New release offers Update without a manifest-version change');
    theme.origin.release = { id: 20, tag: 'v2.0.0' };
    await ui.loadStore(false);
    assert(all(ids['store-list']).some(n => n.textContent === 'Remove'), 'Current installed release does not offer Update');
    delete catalog.entries[0].release;
    catalog.entries[0].manifest = Object.assign({}, theme.manifest, { version: '1.1.0' });
    await ui.loadStore(false);
    const install = all(ids['store-list']).find(n => n.tagName === 'button' && n.textContent === 'Update');
    await install.onclick(); assert(calls.some(c => c.url === '/api/themes/install' && c.data.entryId === 'entry-id'));
    const messagesBeforeRefresh = messages.length;
    await timers[0].fn(); assert(calls.some(c => c.url === '/api/store/refresh'));
    assert.strictEqual(messages.length, messagesBeforeRefresh, 'Periodic refresh is quiet');
    assert.strictEqual(timers.length, 1, 'Only one refresh timer across reloads');
    ids['store-options-button'].onclick(); assert.strictEqual(ids['store-options-menu'].hidden, false);
    assert.strictEqual(ids['store-options-button'].attrs['aria-expanded'], 'true');
    documentEvents.click({ target: body }); assert.strictEqual(ids['store-options-menu'].hidden, true);
    ids['store-options-button'].onclick(); ids['manage-storefronts'].onclick();
    assert.strictEqual(ids['store-management'].hidden, false); assert.strictEqual(ids['store-options-menu'].hidden, true);
    ids['store-management'].events.click({ target: ids['close-store-management'] });
    assert.strictEqual(ids['store-management'].hidden, false, 'Clicks inside management do not dismiss it');
    ids['store-management'].events.click({ target: ids['store-management'] });
    assert.strictEqual(ids['store-management'].hidden, true, 'Backdrop dismisses management');
    assert.strictEqual(document.activeElement, ids['store-options-button']);
    ids['store-options-button'].onclick(); ids['upload-store-zip'].onclick();
    assert(ids['theme-file'].clicked); assert.strictEqual(ids['store-options-menu'].hidden, true);
    await ui.upload({ name: 'Astra.zip', size: 100 });
    assert(calls.some(c => c.url.startsWith('/api/store/upload')));
    assert(!calls.some(c => c.url === '/api/themes/apply'), 'Upload/install must not activate a theme');
    await ui.addSource(); assert(calls.some(c => c.url === '/api/store/sources' && c.data.url === 'https://github.com/ZaneThePython/Astra'));
    const details = all(ids['store-list']).find(n => n.tagName === 'button' && n.textContent === 'Details');
    await details.onclick();
    assert.strictEqual(ids['theme-details'].hidden, false);
    assert(ids['theme-details-meta'].textContent.includes('Needs version 3.1.6 or newer'));
    assert(!ids['theme-details-meta'].textContent.includes('jibo-tbd'));
    ids['theme-details'].events.click({ target: close }); assert.strictEqual(ids['theme-details'].hidden, false);
    ids['theme-details'].events.click({ target: ids['theme-details'] }); assert.strictEqual(ids['theme-details'].hidden, true);
    await details.onclick();
    const nodes = all(ids['theme-details-readme']);
    assert(!nodes.some(n => n.tagName === 'script'));
    const readmeImages = nodes.filter(n => n.tagName === 'img'); assert.strictEqual(readmeImages.length, 2);
    assert.strictEqual(readmeImages[0].src, 'https://example.com/preview.png'); assert.strictEqual(readmeImages[0].alt, 'Preview');
    assert.strictEqual(readmeImages[1].src, 'https://raw.githubusercontent.com/owner/Astra/commit/images/preview.png');
    assert.strictEqual(readmeImages[0].loading, 'lazy'); readmeImages[0].onerror(); assert(readmeImages[0].hidden);
    assert.strictEqual(nodes.filter(n => n.tagName === 'a').length, 1);
    assert.strictEqual(nodes.find(n => n.tagName === 'a').href, 'https://example.com');
    assert(ids['theme-details-readme'].textContent.includes('<script>alert(1)</script>'));
    ids['theme-details'].events.keydown({ key: 'Escape' }); assert.strictEqual(ids['theme-details'].hidden, true);
    const apply = all(ids['store-list']).find(n => n.className === 'btn btn-primary store-apply');
    await apply.onclick(); assert(calls.some(c => c.url === '/api/themes/apply' && c.data.id === theme.id));
    assert(all(ids['store-list']).some(n => n.className === 'btn btn-primary store-apply' && n.textContent === 'Active' && n.disabled));
    const noneApply = all(ids['store-list'].children[0]).find(n => n.tagName === 'button' && n.textContent === 'Apply');
    await noneApply.onclick(); assert(calls.some(c => c.url === '/api/themes/apply' && c.data.id === null));
    const entries = catalog.entries; catalog.entries = [];
    inventory = Object.assign({}, inventory, { themes: [theme, Object.assign({}, theme, { id: 'local-zip', manifest: { name: 'ZIP Only', version: '1.0.0' }, images: { 'banner.png': {} }, readme: '# ZIP Only\n\nLocal description.' })] });
    await ui.loadStore(false);
    assert.strictEqual(ids['store-list'].children.length, 3, 'Installed themes remain without their storefront');
    const localCard = ids['store-list'].children[2]; assert(localCard.textContent.includes('ZIP Only') && localCard.textContent.includes('Local description.'));
    assert(all(localCard).find(n => n.tagName === 'img').src.includes('/api/themes/asset?id=local-zip&name=banner.png'));
    assert(all(localCard).some(n => n.textContent === 'Remove') && all(localCard).some(n => n.textContent === 'Apply'));
    catalog.entries = entries;
    await ui.upload({ name: 'bad.txt', size: 10 }); assert.strictEqual(errors.length, 1);
    await ui.upload({ name: 'big.zip', size: 33 * 1024 * 1024 }); assert.strictEqual(errors.length, 2);
    for (fetchMode of ['throw', 'error', 'invalid', 'hang']) {
        const before = errors.length;
        await ui.upload({ name: 'Astra.zip', size: 100 });
        assert.strictEqual(errors.length, before + 1, 'Upload failure is reported: ' + fetchMode);
        assert(/ZIP upload (failed|timed out)/.test(errors[errors.length - 1].message));
        fetchMode = 'ok'; const callsBefore = calls.length;
        await ui.upload({ name: 'Astra.zip', size: 100 });
        assert(calls.length > callsBefore, 'Upload unlocks after failure');
    }
    apiMode = 'hang'; await assert.rejects(ui.refreshStore(), /timed out/);
    apiMode = 'ok'; await ui.refreshStore();
    apiMode = 'error'; await assert.rejects(ui.refreshStore(), /Connection lost/);
    apiMode = 'ok'; await ui.refreshStore();
    const retryButton = all(ids['store-list']).find(n => n.className === 'btn btn-primary store-apply' && !n.disabled);
    apiMode = 'hang'; await retryButton.onclick(); assert.strictEqual(retryButton.disabled, false, 'Failed actions release buttons');
    apiMode = 'ok'; await retryButton.onclick();
    catalog.sources[0].error = 'Unable to download manifest';
    const beforeStoreError = errors.length; await ui.refreshStore();
    assert.strictEqual(errors.length, beforeStoreError + 1, 'Source errors returned with cached entries are reported');
    assert(errors[errors.length - 1].message.includes('Unable to download manifest'));
    delete catalog.sources[0].error;
    apiMode = 'progress'; await ui.loadStore(false);
    let progressButton = all(ids['store-list']).find(n => n.textContent === 'Update' && n.tagName === 'button');
    const runningInstall = progressButton.onclick();
    await new Promise(resolve => setTimeout(resolve, 15));
    let progressBar = all(ids['store-list']).find(n => n.tagName === 'progress');
    assert.strictEqual(progressBar.value, 50, 'Download bytes update the card progress bar');
    assert(ids['store-list'].textContent.includes('Downloading… 50%'));
    await ui.loadStore(false);
    progressButton = all(ids['store-list']).find(n => n.textContent === 'Update' && n.tagName === 'button');
    assert(progressButton.disabled, 'Refresh preserves the in-progress button state');
    progressData = Object.assign({}, progressData, { total: null, percent: null, received: 1024 * 1024 });
    await new Promise(resolve => setTimeout(resolve, 15));
    progressBar = all(ids['store-list']).find(n => n.tagName === 'progress');
    assert.strictEqual(progressBar.value, undefined, 'Unknown totals use indeterminate progress');
    assert(ids['store-list'].textContent.includes('1.0 MB'));
    installReject(new Error('Download interrupted')); await runningInstall;
    assert(!progressButton.disabled, 'Interrupted downloads release refreshed buttons');
    assert(ids['store-list'].textContent.includes('Download failed'));
    const retryInstall = progressButton.onclick(); await new Promise(resolve => setTimeout(resolve, 10));
    installResolve({ installed: theme.id }); await retryInstall;
    assert(!all(ids['store-list']).some(n => n.tagName === 'progress'), 'Successful installation clears download progress');
    apiMode = 'ok';
    const imageTest = new Node('div');
    window.BEaconThemes.markdown(imageTest, 'Before ![](https://example.com/empty.png) after\n\n' +
        '- ![Local eye](./face/eye.png)\n\n![Unsafe](javascript:alert) ![Data](data:image/png;base64,test) ![File](file:///tmp/x.png)\n\n' +
        '![Unresolved](missing.png)\n\n`![Code](https://example.com/code.png)`\n\n```\n![Fenced](https://example.com/fenced.png)\n```',
        { images: { 'face/eye.png': {} }, assetBase: '/api/themes/asset?id=theme-id&name=' });
    const safeImages = all(imageTest).filter(n => n.tagName === 'img'); assert.strictEqual(safeImages.length, 2);
    assert.strictEqual(safeImages[0].alt, '');
    assert.strictEqual(safeImages[1].src, '/api/themes/asset?id=theme-id&name=face%2Feye.png');
    assert(imageTest.textContent.includes('Unsafe') && imageTest.textContent.includes('Unresolved'));
    const html = fs.readFileSync(path.join(__dirname, '../@be/be/beacon/public/index.html'), 'utf8');
    const app = fs.readFileSync(path.join(__dirname, '../@be/be/beacon/public/app.js'), 'utf8');
    assert(html.includes('data-panel="store"'));
    assert(!/data-panel="(?:themes|skills)"|panel-themes|panel-skills|themes-list|skills-list|theme-drop/.test(html + app));
    assert(html.includes('Upload ZIP') && app.includes("name === 'themes' || name === 'skills'"));
    assert(html.indexOf('src="themes.js"') < html.indexOf('src="app.js"'));
    assert(!/panel-eye|eye-file|\/api\/eye/.test(html + app));
    assert(html.includes('potential malware') && html.includes('store-skill-list') && html.includes('role="tablist"'));
    const css = fs.readFileSync(path.join(__dirname, '../@be/be/beacon/public/app.css'), 'utf8');
    assert(css.includes('transform: translateX(100%)') && css.includes('prefers-reduced-motion'));
    assert(css.includes('main.is-store { max-width: none') && app.includes("classList.toggle('is-store', name === 'store')"));
    console.log('Theme/store UI flows, separate upload/apply, source input, README sanitization and modal dismissal passed');
}
run().catch(e => { console.error(e); process.exitCode = 1; });
