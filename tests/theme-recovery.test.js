'use strict';
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');
const EventEmitter = require('events');
const themes = require('../@be/be/beacon/lib/themes');
const stores = require('../@be/be/beacon/lib/theme-store');
const operations = require('../@be/be/beacon/lib/theme-operation');
const util = require('../@be/be/beacon/lib/http-util');
const fixture = require('./theme-fixtures');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'jibo-theme-recovery-'));
const files = fixture.astra(); const zip = fixture.zip(files);
const entry = { name: 'Astra', type: 'theme', url: 'https://example.com/Astra/manifest.json',
    manifest: JSON.parse(files['manifest.json']), bannerUrl: 'https://example.com/banner.png' };
let downloadMode = 'ok', prepareMode = 'ok', catalogMode = 'ok', bannerMode = 'ok';
let finishDownload, finishPrepare, finishBanner, finishCatalog, active = null;
const runtime = { status: () => ({ live: true }), start() {},
    prepare(theme) {
        if (prepareMode === 'hang') return new Promise(resolve => { finishPrepare = () => resolve({ theme }); });
        if (prepareMode === 'throw') throw new Error('Renderer failure');
        return Promise.resolve({ theme });
    },
    apply(prepared, commit) { if (commit) commit(); active = prepared.theme; return Promise.resolve(); },
    discard(prepared) { prepared.discarded = true; }
};
const store = {
    catalog() {
        if (catalogMode === 'throw') throw new Error('Manifest unavailable');
        if (catalogMode === 'hang') return new Promise(resolve => { finishCatalog = () => resolve([]); });
        return Promise.resolve([entry]);
    },
    download() {
        if (downloadMode === 'throw') throw new Error('Download failed');
        if (downloadMode === 'hang') return new Promise(resolve => { finishDownload = () => resolve({ files }); });
        return Promise.resolve({ files });
    },
    banner() {
        if (bannerMode === 'hang') return new Promise(resolve => { finishBanner = () => resolve(fixture.png()); });
        return Promise.resolve(fixture.png());
    }
};
const manager = themes.create({ root, runtime, store, version: () => '3.1.6',
    operationTimeout: 80, downloadTimeout: 80, refreshTimeout: 80, bannerTimeout: 40 });
const tick = () => new Promise(resolve => setImmediate(resolve));
async function run() {
    const installed = await manager.upload(zip); await manager.activate(installed.installed);
    await manager.refresh(); const id = manager.catalog().entries[0].id;
    downloadMode = 'hang'; const failed = assert.rejects(manager.install(id), /Theme download timed out/);
    await tick(); const prior = manager.inventory().themes[0].revision;
    await manager.activate(null); await manager.upload(zip);
    const replacement = manager.inventory().themes[0].revision;
    assert.notStrictEqual(prior, replacement, 'Stalled downloads do not block local actions');
    await failed; finishDownload(); await tick(); await tick();
    assert.strictEqual(manager.inventory().themes[0].revision, replacement, 'Late downloads cannot replace packages');
    downloadMode = 'throw'; await assert.rejects(manager.install(id), /Download failed/);
    downloadMode = 'ok'; await manager.install(id); await manager.activate(installed.installed);
    const selected = active;
    prepareMode = 'hang'; await assert.rejects(manager.activate(null), /Theme operation timed out/);
    finishPrepare(); await tick(); await tick(); assert.strictEqual(active, selected, 'Late renderer preparation cannot activate');
    assert.strictEqual(manager.inventory().active, installed.installed);
    prepareMode = 'throw'; await assert.rejects(manager.activate(null), /Renderer failure/);
    prepareMode = 'ok'; await manager.activate(null); assert.strictEqual(active, null);
    catalogMode = 'hang'; await manager.refresh();
    assert(manager.catalog().sources[0].error.includes('timed out'));
    assert.strictEqual(manager.catalog().entries.length, 1, 'Refresh failure retains cached browsing');
    finishCatalog(); await tick(); assert.strictEqual(manager.catalog().entries.length, 1);
    catalogMode = 'throw'; await manager.refresh(); assert.strictEqual(manager.catalog().sources[0].error, 'Manifest unavailable');
    catalogMode = 'ok'; await manager.refresh(); assert.strictEqual(manager.catalog().sources[0].error, null);
    bannerMode = 'hang'; await assert.rejects(manager.banner(id), /timed out/);
    finishBanner(); await tick(); assert(!fs.existsSync(path.join(root, 'banners')), 'Late banners cannot write cache');
    bannerMode = 'ok'; assert(fs.existsSync(await manager.banner(id)), 'Banner retries release pending keys and queue');
    await assert.rejects(manager.upload(Buffer.from('invalid')), /ZIP/); await manager.upload(zip);
    const revision = manager.inventory().themes[0].revision;
    const write = fs.writeFileSync;
    try {
        fs.writeFileSync = function(file) {
            if (String(file).indexOf('/packages/') >= 0 && String(file).endsWith('/manifest.json')) throw new Error('Disk full');
            return write.apply(fs, arguments);
        };
        await assert.rejects(manager.upload(zip), /Disk full/);
    } finally { fs.writeFileSync = write; }
    assert.strictEqual(manager.inventory().themes[0].revision, revision, 'Disk failure preserves the prior package');
    await manager.upload(zip);
    // Unreadable state also leaves the mutation queue usable after recovery.
    const state = path.join(root, 'state.json'); fs.renameSync(state, state + '.saved'); fs.mkdirSync(state);
    await assert.rejects(manager.upload(zip), /unreadable/);
    fs.rmdirSync(state); fs.renameSync(state + '.saved', state); await manager.upload(zip);
    await manager.remove(installed.installed); assert.strictEqual(manager.inventory().themes.length, 0);

    const server = http.createServer((req, res) => {
        if (req.url === '/manifest.json' || req.url === '/unknown-manifest.json') {
            res.end(JSON.stringify(Object.assign({}, JSON.parse(files['manifest.json']), { download: req.url === '/manifest.json' ? '/package.zip' : '/unknown.zip' }))); return;
        }
        if (req.url === '/package.zip' || req.url === '/unknown.zip') {
            if (req.url === '/package.zip') res.setHeader('Content-Length', zip.length);
            const split = Math.floor(zip.length / 2); res.write(zip.slice(0, split));
            setTimeout(() => res.end(zip.slice(split)), 15); return;
        }
        if (req.url === '/stall') return;
        if (req.url === '/broken') {
            res.writeHead(200, { 'Content-Length': 100 }); res.write('partial'); setImmediate(() => res.destroy()); return;
        }
        if (req.url === '/redirect') { res.writeHead(302, { Location: '/stall' }); res.end(); return; }
        res.end('ok');
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const base = 'http://127.0.0.1:' + server.address().port;
    try {
        for (const manifest of ['/manifest.json', '/unknown-manifest.json']) {
            const updates = [];
            await operations.run('Test download', 1000, token => {
                token.progress = data => updates.push(Object.assign({}, data));
                return stores.create().download(base + manifest, token);
            });
            const bytes = updates.filter(p => p.state === 'downloading' && p.received > 0);
            assert(bytes.length >= 2, 'Streamed package bytes produce progress updates');
            if (manifest === '/manifest.json') {
                assert(bytes.some(p => p.percent > 0 && p.percent < 100));
                assert.strictEqual(bytes[bytes.length - 1].received, zip.length);
            } else { assert(bytes.every(p => p.percent === null && p.total === null), 'Missing Content-Length stays indeterminate'); }
            assert(updates.some(p => p.state === 'validating'));
        }
        await assert.rejects(stores.request(base + '/broken', 1000), /interrupted|closed|aborted/i);
        for (const route of ['/stall', '/redirect']) {
            await assert.rejects(operations.run('Theme download', 40, operation => stores.request(base + route, 1000, 0, operation)), /timed out/);
        }
        assert.strictEqual((await stores.request(base + '/ok', 100)).toString(), 'ok', 'HTTP retries work after abort/timeout');
    } finally { await new Promise(resolve => server.close(resolve)); }
    const upload = new EventEmitter(); upload.resume = () => {};
    const interrupted = assert.rejects(util.readBody(upload, 100, 40), /interrupted/);
    upload.emit('data', Buffer.from('partial')); upload.emit('aborted'); await interrupted;
    const closed = new EventEmitter(); closed.resume = () => {};
    const disconnected = assert.rejects(util.readBody(closed, 100, 40), /closed/); closed.emit('close'); await disconnected;
    const stalled = new EventEmitter(); stalled.resume = () => {};
    await assert.rejects(util.readBody(stalled, 100, 40), /timed out/);
    const good = new EventEmitter(); good.resume = () => {};
    const body = util.readBody(good, 100, 40); good.emit('data', Buffer.from('ok')); good.emit('end');
    assert.strictEqual((await body).toString(), 'ok');
    console.log('Theme failure recovery, deadlines, unblocked local actions, late-write protection, network interruption and upload retries passed');
}
run().catch(err => { console.error(err); process.exitCode = 1; }).finally(() => fs.rmSync(root, { recursive: true, force: true }));
