'use strict';
const assert = require('assert'), fs = require('fs'), path = require('path'), os = require('os');
const custom = require('../@be/be/beacon/lib/custom-skills');
const menu = require('../@be/be/beacon/lib/menu-layout');
const themes = require('../@be/be/beacon/lib/themes');
const stores = require('../@be/be/beacon/lib/theme-store');
const pkg = require('../@be/be/beacon/lib/theme-package');
const fixture = require('./theme-fixtures');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'beam-custom-skills-'));
const files = { 'manifest.json': Buffer.from(JSON.stringify({ name: 'Test Skill', version: '1.0.0', supported: '3.1.6', type: 'skill', buttonColor: '#58586D #282735' })),
    'README.md': Buffer.from('# Test\n\nA skill for testing.'), 'icon.png': fixture.png(), 'banner.png': fixture.png(),
    'test-skill/package.json': Buffer.from(JSON.stringify({ name: '@be/test-skill', main: 'index.js', jibo: { type: 'asset-pack' } })),
    'test-skill/index.js': Buffer.from('module.exports = function Skill() {};') };
let version = '3.1.6', downloadMode = 'success', finish;
const compatibility = m => ({ status: !version ? 'unverified' : themes.compare(version, m.supported) < 0 ? 'incompatible' : 'compatible', minimum: m.supported, current: version });
const options = { root: path.join(root, 'skills'), compatibility, onChange() {}, timeout: 80, catalog: () => ({ entries: [{ id: 'entry', type: 'skill', url: 'https://example.com/manifest.json' }] }),
    store: { download(url, op) { op.progress({ state: 'downloading', percent: 50 }); return downloadMode === 'hang' ? new Promise(resolve => { finish = resolve; }) : downloadMode === 'error' ? Promise.reject(new Error('Download failed')) : Promise.resolve({ files, commit: 'a'.repeat(40) }); } } };
async function run() {
    const service = custom.create(options);
    const manifest = JSON.parse(files['manifest.json']);
    assert.strictEqual(pkg.manifest(files['manifest.json']).themes, true, 'Missing themes defaults to true');
    for (const themes of [false, true]) {
        const validated = await service.validate(Object.assign({}, files, { 'manifest.json': Buffer.from(JSON.stringify(Object.assign({}, manifest, { themes }))) }));
        assert.strictEqual(validated.manifest.themes, themes);
    }
    for (const themes of ['false', 0, null, [], {}]) {
        assert.throws(() => pkg.manifest(Buffer.from(JSON.stringify(Object.assign({}, manifest, { themes })))), /themes must/);
    }

    await assert.rejects(() => pkg.unzip(fixture.zip(files)), /Executable/);
    for (const name of ['../escape', '/escape', 'x\\escape']) { await assert.rejects(() => service.upload(fixture.zip(Object.assign({}, files, { [name]: Buffer.from('x') }))), /Unsafe/); }
    await assert.rejects(() => service.upload(fixture.zip(files, { symlink: 'test-skill/index.js' })), /links/);
    const duplicate = Object.assign({}, files, { 'ICON.png': files['icon.png'] }); await assert.rejects(() => service.upload(fixture.zip(duplicate)), /Duplicate/);
    for (const colors of ['red', '#123', '#123456 #ffffff #000000', false]) { await assert.rejects(() => service.upload(fixture.zip(Object.assign({}, files, { 'manifest.json': Buffer.from(JSON.stringify({ name: 'Bad', type: 'skill', version: '1.0.0', buttonColor: colors })) }))), /buttonColor/); }
    version = '3.1.5'; await assert.rejects(() => service.upload(fixture.zip(files)), /needs version/); assert.strictEqual(service.ids().length, 0);
    for (const v of ['3.1.6', '3.2.0', null]) { version = v; await service.upload(fixture.zip(files)); assert.strictEqual(service.inventory().skills[0].compatibility.status, v ? 'compatible' : 'unverified'); }
    version = '3.1.6';
    const item = service.inventory().skills[0], old = item.revision;
    assert.deepStrictEqual(item.manifest.buttonColor, ['#58586D', '#282735']);
    assert.strictEqual(fs.readFileSync(service.asset(item.id, 'icon.png')).toString('hex'), fixture.png().toString('hex'));
    assert(service.resolve('@be/test-skill').endsWith('test-skill/'));
    await assert.rejects(() => service.upload(fixture.zip(Object.assign({}, files, { 'icon.png': Buffer.from('broken') }))), /PNG/);
    assert.strictEqual(service.inventory().skills[0].revision, old);
    await assert.rejects(() => service.upload(fixture.zip(Object.assign({}, files, { 'test-skill/package.json': Buffer.from('{"name":"@be/clock","jibo":{"type":"asset-pack"}}') }))), /built-in/);
    const layout = menu.create({ root: path.join(root, 'menu'), skills: service });
    assert.strictEqual(layout.inventory().tree[0].id, '@be/test-skill');
    let tree = layout.inventory().tree;
    const one = tree.shift(), two = tree.shift();
    tree.unshift({ type: 'folder', id: 'folder-test', name: 'My folder', colors: ['#123456', '#234567'], icon: 'resources/icons/fun-stuff.png', children: [one, two] });
    layout.save(tree); assert.strictEqual(layout.view(null).viewConfig.list[0].id, '__folder:folder-test');
    const folder = layout.view('folder-test'); assert.strictEqual(folder.viewConfig.list[0].id, '__back'); assert.strictEqual(folder.viewConfig.list[1].id, '@be/test-skill');
    assert.deepStrictEqual(folder.viewConfig.list[1].colors, ['0x58586D', '0x282735']);
    const skill = {}; assert.strictEqual(layout.choose(skill, '__folder:folder-test'), '__menu'); assert.deepStrictEqual(skill._beamMenuStack, ['folder-test']);
    assert.strictEqual(layout.choose(skill, '__back'), '__menu'); assert.deepStrictEqual(skill._beamMenuStack, []);
    assert.strictEqual(layout.choose(skill, '@be/test-skill'), '@be/test-skill');
    const uploaded = await layout.uploadIcon(fixture.png()); tree[0].icon = uploaded.icon; layout.save(tree); assert(fs.existsSync(layout.icon(uploaded.icon)));
    assert.throws(() => layout.save(tree.concat([one])), /Duplicate/); assert.throws(() => layout.icon('../escape'), /Unknown/);
    assert.deepStrictEqual(menu.create({ root: path.join(root, 'menu'), skills: service }).inventory().tree, tree, 'Menu survives restart');
    assert.strictEqual(custom.create(options).inventory().skills[0].revision, old, 'Skills survive restart');
    downloadMode = 'error'; await assert.rejects(() => service.install('entry', 'error'), /Download failed/); assert.strictEqual(service.progress('error').state, 'failed');
    downloadMode = 'hang'; await assert.rejects(() => service.install('entry', 'timeout'), /timed out/); finish({ files }); await new Promise(r => setImmediate(r)); assert.strictEqual(service.inventory().skills[0].revision, old, 'Late results cannot commit');
    downloadMode = 'success'; await service.install('entry', 'retry'); assert.strictEqual(service.progress('retry').state, 'complete');
    await service.remove(item.id); layout.sync(); assert(!JSON.stringify(layout.inventory().tree).includes('@be/test-skill'));
    tree = layout.inventory().tree; const empty = { type: 'folder', id: 'folder-empty', name: 'Empty', colors: ['#123456', '#234567'], icon: 'resources/icons/fun-stuff.png', children: [] };
    layout.save(tree.concat(empty)); assert(!layout.inventory().tree.some(n => n.id === empty.id));
    const real = {}; const appleRoot = path.resolve(__dirname, '../../BadApple');
    function collect(dir, rel) { fs.readdirSync(dir).forEach(n => { const file = path.join(dir, n), name = rel + n; if (fs.statSync(file).isDirectory()) { collect(file, name + '/'); } else { real[name] = fs.readFileSync(file); } }); }
    collect(appleRoot, ''); const apple = custom.create(Object.assign({}, options, { timeout: 120000 }));
    const nested = {}; Object.keys(real).forEach(n => { nested['BadApple-main/' + n] = real[n]; });
    await apple.upload(fixture.zip(nested), 'BadApple.zip'); assert.strictEqual(apple.ids()[0], '@be/bad-apple');
    assert(fs.existsSync(path.join(apple.resolve('@be/bad-apple'), 'video/BadApple.mp4')) || fs.readdirSync(path.join(apple.resolve('@be/bad-apple'), 'video')).length > 0);
    apple.cleanup();
    const responses = { 'https://example.com/manifest.json': files['manifest.json'], 'https://example.com/README.md': files['README.md'] };
    const store = stores.create(url => responses[url] ? Promise.resolve(responses[url]) : Promise.reject(Object.assign(new Error('Missing'), { remoteStatus: 404 })));
    const catalog = await store.catalog('https://example.com/manifest.json'); assert.strictEqual(catalog[0].type, 'skill');
    const sha = 'b'.repeat(40), base = 'https://raw.githubusercontent.com/example/skill/' + sha + '/';
    const requested = [];
    const rateLimited = stores.create(url => {
        requested.push(url);
        return Promise.reject(Object.assign(new Error('Rate limit'), { remoteStatus: 403 }));
    });
    await assert.rejects(rateLimited.catalog('https://github.com/example/skill'), /Rate limit/);
    await assert.rejects(rateLimited.download('https://github.com/example/skill'), /Rate limit/);
    assert(requested.every(url => url.indexOf('https://api.github.com/') === 0), 'Rate limits never fall back to anonymous Git requests');
    const metadata = stores.create(url => url.indexOf('/commits/') > 0 ? Promise.resolve(Buffer.from(JSON.stringify({ sha }))) :
        url.indexOf('https://api.github.com/') === 0 ? Promise.resolve(Buffer.from(JSON.stringify({ default_branch: 'custom-branch', owner: { login: 'example' }, stargazers_count: 42 }))) :
        Promise.resolve(url.endsWith('/manifest.json') ? files['manifest.json'] : files['README.md']));
    const popular = await metadata.catalog('https://github.com/example/skill'); assert.strictEqual(popular[0].stars, 42); assert.strictEqual(popular[0].developer, 'example');
    console.log('Custom skill ZIPs (including real Bad Apple), compatibility, recovery, revision persistence, menu folders and runtime configs passed');
}
run().catch(err => { console.error(err); process.exitCode = 1; }).finally(() => fs.rmSync(root, { recursive: true, force: true }));
