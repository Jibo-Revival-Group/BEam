'use strict';
const assert = require('assert'), fs = require('fs'), os = require('os'), path = require('path'), http = require('http'), createRequire = require('module').createRequire;
const custom = require('../@be/be/beacon/lib/custom-skills'), menus = require('../@be/be/beacon/lib/menu-layout'), fixture = require('./theme-fixtures');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'skills-http-'));
const files = { 'manifest.json': Buffer.from('{"name":"HTTP Skill","version":"1.0.0","type":"skill"}'), 'icon.png': fixture.png(),
    'package.json': Buffer.from('{"name":"@be/http-test","jibo":{"type":"asset-pack"}}'), 'index.js': Buffer.from('module.exports=function() {};') };
const entry = { id: 'store-skill', type: 'skill', url: 'https://example.com/manifest.json', manifest: JSON.parse(files['manifest.json']) };
let layout, connected = false;
const skills = custom.create({ root: path.join(temp, 'skills'), compatibility: () => ({ status: 'compatible' }), catalog: () => ({ entries: [entry] }),
    store: { download: () => Promise.resolve({ files }) }, onChange: () => layout.sync() });
layout = menus.create({ root: path.join(temp, 'menu'), skills });
const serverPath = path.resolve(__dirname, '../@be/be/beacon/server.js'), serverRequire = createRequire(serverPath), mod = { exports: {} };
new Function('require', 'module', 'exports', '__dirname', fs.readFileSync(serverPath, 'utf8'))(name => name === './lib/github-auth' ? { token: () => connected ? 'gho_test' : null } : name === './lib/custom-skills' ? skills : name === './lib/menu-layout' ? layout : name === './lib/themes' ? { details: () => Promise.resolve(entry) } : serverRequire(name), mod, mod.exports, path.dirname(serverPath));
function request(server, method, url, body) { return new Promise((resolve, reject) => {
    const req = http.request({ hostname: '127.0.0.1', port: server.address().port, method, path: url }, res => {
        const parts = []; res.on('data', b => parts.push(b)); res.on('end', () => { const buf = Buffer.concat(parts); let data; try { data = JSON.parse(buf); } catch (err) { data = buf; } resolve({ status: res.statusCode, data }); });
    }); req.on('error', reject); req.end(body ? Buffer.isBuffer(body) ? body : JSON.stringify(body) : undefined);
}); }
(async () => {
    const server = mod.exports.create(); await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    try {
        for (const [method, url] of [['GET', '/api/store'], ['POST', '/api/store/refresh'], ['GET', '/api/store/sources'], ['POST', '/api/store/sources'], ['DELETE', '/api/store/sources?id=x'], ['GET', '/api/store/details?id=x'], ['GET', '/api/store/banner?id=x'], ['POST', '/api/skills/install'], ['POST', '/api/themes/install']]) {
            const blocked = await request(server, method, url, method === 'POST' ? {} : undefined); assert.strictEqual(blocked.status, 401, url); assert(blocked.data.error.includes('Sign in to GitHub'));
        }
        connected = true;
        assert.strictEqual((await request(server, 'PUT', '/api/skills/upload', Buffer.from('bad'))).status, 400);
        const uploaded = await request(server, 'PUT', '/api/store/upload?name=test.zip', fixture.zip(files)); assert.strictEqual(uploaded.status, 200);
        assert.strictEqual(uploaded.data.type, 'skill', 'Upload ZIP detects a skill from its manifest');
        assert.strictEqual((await request(server, 'PUT', '/api/store/upload', Buffer.from('bad'))).status, 400);
        const id = uploaded.data.skills[0].id;
        const inventory = await request(server, 'GET', '/api/skills/custom'); assert.strictEqual(inventory.data.skills[0].id, id);
        const asset = await request(server, 'GET', '/api/skills/asset?id=' + id + '&name=icon.png'); assert.deepStrictEqual(asset.data, fixture.png());
        assert.strictEqual((await request(server, 'GET', '/api/skills/asset?id=' + id + '&name=..%2Findex.js')).status, 400);
        assert.strictEqual((await request(server, 'GET', '/api/store/details?id=' + id)).data.manifest.name, 'HTTP Skill');
        const menu = (await request(server, 'GET', '/api/menu')).data; assert.strictEqual(menu.tree[0].id, '@be/http-test');
        const icon = await request(server, 'PUT', '/api/menu/icon', fixture.png()); assert.strictEqual(icon.status, 200);
        const folder = { type: 'folder', id: 'folder-http', name: 'Apps', colors: ['#123456', '#234567'], icon: icon.data.icon, children: [menu.tree.shift()] }; menu.tree.unshift(folder);
        assert.strictEqual((await request(server, 'POST', '/api/menu', { tree: menu.tree })).status, 200);
        assert.strictEqual((await request(server, 'POST', '/api/menu', { tree: menu.tree.concat(folder) })).status, 400);
        assert.strictEqual((await request(server, 'POST', '/api/skills/install', { entryId: entry.id, requestId: 'download' })).status, 200);
        assert.strictEqual((await request(server, 'GET', '/api/skills/progress?id=download')).data.state, 'complete');
        assert.strictEqual((await request(server, 'POST', '/api/skills/install', { entryId: entry.id, requestId: {} })).status, 400);
        assert.strictEqual((await request(server, 'DELETE', '/api/skills?id=' + id)).status, 200);
        assert.strictEqual((await request(server, 'GET', '/api/menu')).data.tree.some(n => n.id === folder.id), false);
        console.log('Custom skill HTTP install/upload/progress/details/assets/removal and menu save/icon validation passed');
    } finally { await new Promise(resolve => server.close(resolve)); fs.rmSync(temp, { recursive: true, force: true }); }
})().catch(err => { console.error(err); process.exitCode = 1; });
