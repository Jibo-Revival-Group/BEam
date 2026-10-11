'use strict';
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');
const pkg = require('../@be/be/beacon/lib/theme-package');
const stores = require('../@be/be/beacon/lib/theme-store');
const themes = require('../@be/be/beacon/lib/themes');
const fixture = require('./theme-fixtures');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'jibo-themes-test-'));
const bad = fn => assert.rejects(Promise.resolve().then(fn), e => e.status === 400);
async function run() {
    const files = fixture.astra(); const packed = fixture.zip(files);
    const decoded = await pkg.validate(await pkg.unzip(packed));
    assert.strictEqual(decoded.manifest.name, 'Astra'); assert.strictEqual(decoded.images['face/eye.png'].width, 500);
    assert.deepStrictEqual(decoded.menu.textPlacement, { x: 0, y: 45 });
    assert.strictEqual(decoded.menu.menuType, 'native', 'Existing themes keep native paging');
    const dynamic = await pkg.validate(Object.assign({}, files, { 'menu/menu.json': Buffer.from('{"menuType":"dynamic"}') }));
    assert.strictEqual(dynamic.menu.menuType, 'dynamic');
    for (const menuType of ['paged', 'Dynamic', '', null, true, 1, {}, []]) {
        await bad(() => pkg.validate(Object.assign({}, files, { 'menu/menu.json': Buffer.from(JSON.stringify({ menuType })) })));
    }
    const nested = {}; Object.keys(files).forEach(n => { nested['Astra-main/' + n] = files[n]; });
    assert.strictEqual((await pkg.validate(await pkg.unzip(fixture.zip(nested)))).id, decoded.id);
    await pkg.unzip(fixture.zip(files, { stored: true }));
    for (const name of ['../bad', '/bad', 'C:/bad', 'foo\\bar', 'face/run.js', 'run.sh']) {
        await bad(() => pkg.unzip(fixture.zip(Object.assign({}, files, { [name]: Buffer.from('bad') }))));
    }
    await bad(() => pkg.unzip(fixture.zip(files, { symlink: 'face/eye.png' })));
    await bad(() => pkg.unzip(fixture.zip(Object.assign({}, files, { 'FACE/eye.png': files['face/eye.png'] }))));
    await bad(() => pkg.unzip(Buffer.from('not a zip')));
    const corrupt = Buffer.from(packed); corrupt[40] ^= 128; await bad(() => pkg.unzip(corrupt));
    const oversized = fixture.zip(files); oversized.writeUInt32LE(65 * 1024 * 1024, oversized.readUInt32LE(oversized.length - 6) + 24);
    await bad(() => pkg.unzip(oversized));
    await bad(() => pkg.unzip(fixture.zip(Object.assign({}, files, { 'other/manifest.json': files['manifest.json'] }))));
    for (const face of [{ eyeSize: 0 }, { eyeSize: -1 }, { eyeSize: '100' }, { backgroundColor: 'red' }, { unknown: 1 }]) {
        await bad(() => pkg.validate(Object.assign({}, files, { 'face/face.json': Buffer.from(JSON.stringify(face)) })));
    }
    for (const placement of ['x51 y0', 'x0 y-51', 'x0 x1', 'xNaN y0', 'x0']) {
        await bad(() => pkg.validate(Object.assign({}, files, { 'menu/menu.json': Buffer.from(JSON.stringify({ textPlacement: placement })) })));
    }
    await bad(() => pkg.png(fixture.png(5)));
    const invalidImage = Buffer.from(files['face/eye.png']); invalidImage[50] ^= 1;
    await bad(() => pkg.validate(Object.assign({}, files, { 'face/eye.png': invalidImage })));
    assert.strictEqual((await pkg.validate({ 'manifest.json': files['manifest.json'] })).hasFace, false);
    assert.strictEqual(stores.paragraph('# Heading\n\nFirst **paragraph**\ncontinues.\n\nLater'), 'First paragraph continues.');
    assert.strictEqual(stores.normalize('https://github.com/ZaneThePython/Astra.git/'), 'https://github.com/ZaneThePython/Astra');
    assert.throws(() => stores.normalize('file:///tmp/foo'), /HTTP/);
    assert.throws(() => stores.normalize('https://user:password@example.com'), /credentials/);

    const sha = 'a'.repeat(40); const base = 'https://raw.githubusercontent.com/ZaneThePython/Astra/' + sha + '/';
    const urls = []; const responses = {
        'https://api.github.com/repos/ZaneThePython/Astra': { default_branch: 'a-custom-branch' },
        'https://api.github.com/repos/ZaneThePython/Astra/commits/a-custom-branch': { sha: sha },
        'https://store.example/manifest.json': { themes: ['Astra', { url: 'https://github.com/ZaneThePython/Astra' }, 'None', { url: '.' }], skills: ['Placeholder note', 'APOD', { url: 'https://github.com/TTL/APOD' }] },
        'https://objects.example/manifest.json': { themes: [{ name: 'Astra', url: 'https://github.com/ZaneThePython/Astra' }], skills: [{ name: 'Skill', url: 'https://github.com/owner/skill' }] },
        'https://skill.example/manifest.json': { name: 'Example skill', version: '1.0.0', type: 'skill' }
    };
    Object.keys(files).forEach(n => { responses[base + n] = files[n]; });
    responses['https://codeload.github.com/ZaneThePython/Astra/zip/' + sha] = fixture.zip(nested);
    const store = stores.create((u, limit) => {
        urls.push(u); assert(limit > 0);
        if (responses[u] === undefined) { const e = pkg.fail('Not found'); e.remoteStatus = 404; return Promise.reject(e); }
        return Promise.resolve(Buffer.isBuffer(responses[u]) ? responses[u] : Buffer.from(JSON.stringify(responses[u])));
    });
    const catalog = await store.catalog('https://store.example/manifest.json');
    assert.strictEqual(catalog.length, 2); assert(catalog[1].stock); assert.strictEqual(catalog[0].manifest.type, 'theme');
    assert.strictEqual((await store.catalog('https://objects.example/manifest.json')).length, 1);
    assert.strictEqual((await store.catalog('https://github.com/ZaneThePython/Astra')).length, 1);
    assert.deepStrictEqual(await store.catalog('https://skill.example/manifest.json'), []);
    const downloaded = await store.download('https://github.com/ZaneThePython/Astra');
    assert.strictEqual(downloaded.commit, sha); assert(urls.includes(base + 'README.md'));
    assert(!urls.some(u => /\/main\/|\/master\//.test(u)));

    let version = '3.1.5', active = null, failApply = false, offline = false;
    const runtime = { status: () => ({ live: true }), prepare: (theme, directory) => Promise.resolve({ theme, directory }),
        apply: (p, commit) => { if (failApply) { return Promise.reject(new Error('GPU failure')); } if (commit) commit(); active = p.theme; return Promise.resolve(); }, start() {} };
    const fakeStore = { catalog: u => offline ? Promise.reject(new Error('Offline')) : store.catalog(u), download: store.download };
    const manager = themes.create({ root, version: () => version, runtime, store: fakeStore });
    assert.strictEqual(manager.catalog().sources[0].url, stores.DEFAULT_SOURCE);
    await bad(() => manager.upload(packed)); assert.strictEqual(manager.inventory().themes.length, 0);
    for (version of ['3.1.6', '3.2.0', null]) {
        const result = await manager.upload(packed, 'Astra.zip'); assert.strictEqual(result.installed, decoded.id);
        assert.strictEqual(manager.inventory().themes.length, 1); assert.strictEqual(manager.inventory().active, null);
    }
    assert.strictEqual(manager.inventory().themes[0].compatibility.status, 'unverified');
    version = '3.1.6'; await manager.activate(decoded.id); assert.strictEqual(active.manifest.name, 'Astra');
    const originalRevision = active.revision;
    await manager.upload(packed); assert.strictEqual(active.revision, originalRevision); assert(manager.inventory().themes[0].pending);
    const restart = themes.create({ root, version: () => version, runtime, store: fakeStore });
    assert.strictEqual(restart.inventory().active, decoded.id); assert.strictEqual(restart.inventory().themes[0].pending, true);
    failApply = true; await assert.rejects(manager.activate(decoded.id), /GPU/); assert.strictEqual(active.revision, originalRevision);
    failApply = false; await manager.activate(decoded.id); assert.notStrictEqual(active.revision, originalRevision);
    version = '3.1.5'; await bad(() => manager.activate(decoded.id)); version = '3.1.6';
    await manager.addSource('https://objects.example/manifest.json');
    await manager.addSource('https://objects.example/manifest.json'); assert.strictEqual(manager.catalog().sources.length, 2);
    const source = manager.catalog().sources[1]; assert.strictEqual(manager.catalog().entries.length, 1);
    offline = true; await manager.refresh(source.id); assert.strictEqual(manager.catalog().entries.length, 1); assert.strictEqual(manager.catalog().sources[1].error, 'Offline');
    await manager.removeSource(source.id); assert.strictEqual(manager.inventory().themes.length, 1); offline = false;
    await manager.activate(null); assert.strictEqual(active, null);
    await manager.addSource('https://github.com/ZaneThePython/Astra');
    await manager.install(manager.catalog().entries[0].id); assert.strictEqual(manager.inventory().themes[0].origin.commit, sha);
    await manager.install(null, decoded.id); assert.strictEqual(manager.inventory().active, null);
    await manager.activate(decoded.id); await manager.remove(decoded.id); assert.strictEqual(manager.inventory().active, null); assert.strictEqual(active, null);
    assert.strictEqual(manager.inventory().themes.length, 0);
    assert.strictEqual(themes.compare('3.1.6-beta.2', '3.1.6'), -1); assert.strictEqual(themes.compare('3.1.6-beta.10', '3.1.6-beta.2'), 1);
    assert.strictEqual(themes.tbdVersion(), JSON.parse(fs.readFileSync(path.resolve(__dirname, '../jibo-tbd/package.json'))).version);

    // Real HTTP downloader limits and redirects, without public-network dependency.
    const server = http.createServer((req, res) => {
        if (req.url === '/redirect') { res.writeHead(302, { Location: '/data' }); res.end(); }
        else if (req.url === '/missing') { res.writeHead(404); res.end(); }
        else { res.end('hello'); }
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const address = 'http://127.0.0.1:' + server.address().port;
    try {
        assert.strictEqual((await stores.request(address + '/redirect', 20)).toString(), 'hello');
        await bad(() => stores.request(address + '/data', 2));
        await assert.rejects(stores.request(address + '/missing', 20), e => e.remoteStatus === 404);
    } finally { await new Promise(resolve => server.close(resolve)); }
    const routes = require('../@be/be/beacon/server').routes;
    assert(!Object.keys(routes).some(r => r.includes('/api/eye')));
    assert(routes['PUT /api/themes/upload']);
    console.log('Theme ZIP/PNG validation, storefronts, pinned GitHub downloads, jibo-tbd compatibility, persistence and lifecycle passed');
}
run().catch(e => { console.error(e); process.exitCode = 1; }).finally(() => fs.rmSync(root, { recursive: true, force: true }));
