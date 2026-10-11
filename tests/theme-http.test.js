'use strict';
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');
const createRequire = require('module').createRequire;
const themes = require('../@be/be/beacon/lib/themes');
const pkg = require('../@be/be/beacon/lib/theme-package');
const fixture = require('./theme-fixtures');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'jibo-theme-http-'));
const sourceFile = path.resolve(__dirname, '../@be/be/beacon/server.js');
const serverRequire = createRequire(sourceFile);
const runtime = { status: () => ({ live: true }), prepare: (theme, dir) => Promise.resolve({ theme, dir }),
    apply: (prepared, commit) => { if (commit) commit(); return Promise.resolve(); }, start() {} };
const store = { catalog: () => Promise.resolve([{ name: 'Astra', type: 'theme', url: 'https://example.com/Astra/manifest.json',
    manifest: JSON.parse(fixture.astra()['manifest.json']), readme: '# Astra\n\nDescription.' }]),
    download: () => Promise.resolve({ files: fixture.astra(), commit: null }) };
const manager = themes.create({ root: path.join(temp, 'http'), runtime, version: () => '3.1.6', store });
const loaded = { exports: {} };
new Function('require', 'module', 'exports', fs.readFileSync(sourceFile, 'utf8'))(
    name => name === './lib/themes' ? manager : serverRequire(name), loaded, loaded.exports);
function request(server, method, url, body) {
    const bytes = Buffer.isBuffer(body) ? body : body === undefined ? null : Buffer.from(JSON.stringify(body));
    return new Promise((resolve, reject) => {
        const req = http.request({ hostname: '127.0.0.1', port: server.address().port, method, path: url }, res => {
            const parts = []; res.on('data', p => parts.push(p)); res.on('error', reject);
            res.on('end', () => { const buf = Buffer.concat(parts); let data; try { data = JSON.parse(buf); } catch (err) { data = buf; } resolve({ status: res.statusCode, data }); });
        });
        req.on('error', reject); req.end(bytes);
    });
}
async function run() {
    const server = loaded.exports.create(); await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    try {
        const initial = await request(server, 'GET', '/api/themes'); assert.strictEqual(initial.status, 200); assert.strictEqual(initial.data.active, null);
        const upload = await request(server, 'PUT', '/api/themes/upload?name=Astra.zip', fixture.zip(fixture.astra()));
        assert.strictEqual(upload.status, 200); const id = upload.data.installed; assert.strictEqual(upload.data.themes.active, null);
        const image = await request(server, 'GET', '/api/themes/asset?id=' + id + '&name=face%2Feye.png');
        assert.strictEqual(image.status, 200); assert.strictEqual(image.data.slice(0, 8).toString('hex'), '89504e470d0a1a0a');
        assert.strictEqual((await request(server, 'GET', '/api/themes/asset?id=' + id + '&name=..%2Fmanifest.json')).status, 400);
        assert.strictEqual((await request(server, 'POST', '/api/themes/apply', { id: 0 })).status, 400);
        assert.strictEqual((await request(server, 'POST', '/api/themes/apply', { id })).data.active, id);
        assert.strictEqual((await request(server, 'PUT', '/api/themes/upload', Buffer.from('broken'))).status, 400);
        assert.strictEqual((await request(server, 'GET', '/api/themes')).data.active, id);
        assert.strictEqual((await request(server, 'GET', '/api/eye')).status, 404);
        assert.strictEqual((await request(server, 'POST', '/api/store/sources', { url: 'file:///tmp/manifest.json' })).status, 400);
        const sources = await request(server, 'POST', '/api/store/sources', { url: 'https://example.com/manifest.json' });
        assert.strictEqual(sources.status, 200); const entry = sources.data.entries[0];
        assert.strictEqual((await request(server, 'GET', '/api/store/details?id=' + entry.id)).data.readme, '# Astra\n\nDescription.');
        assert.strictEqual((await request(server, 'POST', '/api/themes/install', { entryId: entry.id })).status, 200);
        const source = sources.data.sources[1]; await request(server, 'DELETE', '/api/store/sources?id=' + source.id);
        assert.strictEqual((await request(server, 'GET', '/api/themes')).data.themes.length, 1);
        const removed = await request(server, 'DELETE', '/api/themes?id=' + id); assert.strictEqual(removed.status, 200);
        assert.strictEqual(removed.data.active, null); assert.strictEqual(removed.data.themes.length, 0);
    } finally { await new Promise(resolve => server.close(resolve)); }

    // Upgrade migration runs once; retained eye uploads can never overwrite themes.
    const data = path.join(temp, 'data'); const legacy = path.join(temp, 'legacy');
    const alias = path.join(temp, 'Default_Eye.png'); const original = path.join(temp, 'original.png');
    fs.mkdirSync(path.join(data, 'eye'), { recursive: true }); fs.mkdirSync(path.join(legacy, 'eye'), { recursive: true });
    fs.writeFileSync(original, fixture.png()); fs.writeFileSync(alias, fixture.astra()['face/eye.png']);
    fs.writeFileSync(path.join(data, 'eye/custom.png'), fixture.astra()['face/eye.png']);
    const paths = { dataDir: () => data, dataDirLegacy: () => legacy, pristineEye: () => original, eyeTextures: () => [alias],
        isFile: p => fs.existsSync(p) && fs.statSync(p).isFile(), ensureDir: p => fs.mkdirSync(p, { recursive: true }), onRobot: () => false };
    let restore, restored;
    const bootRuntime = { status: () => ({ live: true }), start: callback => { restore = callback; },
        prepare: theme => Promise.resolve(theme), apply: (theme, commit) => { if (commit) commit(); restored = theme; return Promise.resolve(); } };
    const themeModule = { exports: {} }; const themeRequire = createRequire(path.resolve(__dirname, '../@be/be/beacon/lib/themes.js'));
    new Function('require', 'module', 'exports', fs.readFileSync(path.resolve(__dirname, '../@be/be/beacon/lib/themes.js'), 'utf8'))(
        name => name === './paths' ? paths : themeRequire(name), themeModule, themeModule.exports);
    const boot = themeModule.exports.create({ root: path.join(data, 'themes'), version: () => '3.1.6', runtime: bootRuntime });
    boot.start(); assert.deepStrictEqual(fs.readFileSync(alias), fs.readFileSync(original));
    assert(fs.existsSync(path.join(data, 'eye/custom.png')), 'Old uploads remain inactive'); await restore();
    const installed = await boot.upload(fixture.zip(fixture.astra())); await boot.activate(installed.installed);
    const selected = restored.revision;
    fs.writeFileSync(alias, 'future stock asset'); boot.start(); await restore();
    assert.strictEqual(restored.revision, selected, 'Startup restores the selected installed revision');
    assert.strictEqual(fs.readFileSync(alias, 'utf8'), 'future stock asset', 'Inactive custom eyes do not self-heal');
    fs.unlinkSync(path.join(data, 'eye/custom.png')); fs.writeFileSync(path.join(data, 'eye/state.json'), JSON.stringify({ custom: true }));
    const recovery = themeModule.exports.create({ root: path.join(temp, 'recovery'), version: () => '3.1.6', runtime: bootRuntime });
    recovery.start(); assert.deepStrictEqual(fs.readFileSync(alias), fs.readFileSync(original), 'State-only legacy eyes still migrate');
    const pack = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../@be/be/package.json')));
    assert(pack.files.includes('beacon'), 'Theme runtime and UI ship with the existing package directory');
    console.log('Theme HTTP APIs, raw ZIP upload, assets, errors, source removal, active removal, upgrade migration, restart and package inclusion passed');
}
run().catch(e => { console.error(e); process.exitCode = 1; }).finally(() => fs.rmSync(temp, { recursive: true, force: true }));
