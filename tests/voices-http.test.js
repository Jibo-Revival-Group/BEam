'use strict';
// HTTP routes for custom voices: Upload ZIP detects voices, apply/remove/assets, and Store sign-in for downloads.
const assert = require('assert'), fs = require('fs'), os = require('os'), path = require('path'), http = require('http'), createRequire = require('module').createRequire;
const voicesLib = require('../@be/be/beacon/lib/voices'), fixture = require('./theme-fixtures');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'voices-http-'));
const files = { 'manifest.json': Buffer.from('{"name":"HTTP Voice","version":"1.0.0","type":"voice","voice":{"vibrato":0.4,"volume":0.9}}'),
    'breath.mp3': Buffer.concat([Buffer.from('ID3'), Buffer.alloc(32)]), 'banner.png': fixture.png() };
let connected = false; const themeList = { themes: [{ id: 'theme-1', manifest: { name: 'T', version: '1.0.0', voice: 'https://github.com/example/v' } }, { id: 'theme-2', manifest: { name: 'Plain', version: '1.0.0' } }] };
const fromTheme = [];
const voices = voicesLib.create({ root: path.join(temp, 'voices'), compatibility: () => ({ status: 'compatible' }), catalog: () => ({ entries: [] }), store: { download: () => Promise.reject(new Error('offline')) } });
voices.installFromTheme = (url, name) => { fromTheme.push([url, name]); return Promise.resolve(voices.inventory()); };
const serverPath = path.resolve(__dirname, '../@be/be/beacon/server.js'), serverRequire = createRequire(serverPath), mod = { exports: {} };
new Function('require', 'module', 'exports', '__dirname', fs.readFileSync(serverPath, 'utf8'))(name => name === './lib/github-auth' ? { token: () => connected ? 'gho_test' : null } :
    name === './lib/voices' ? voices : name === './lib/themes' ? { inventory: () => themeList, details: () => Promise.resolve({}) } : serverRequire(name), mod, mod.exports, path.dirname(serverPath));
function request(server, method, url, body) { return new Promise((resolve, reject) => {
    const req = http.request({ hostname: '127.0.0.1', port: server.address().port, method, path: url }, res => {
        const parts = []; res.on('data', b => parts.push(b)); res.on('end', () => { const buf = Buffer.concat(parts); let data; try { data = JSON.parse(buf); } catch (err) { data = buf; } resolve({ status: res.statusCode, data, type: res.headers['content-type'] }); });
    }); req.on('error', reject); req.end(body ? Buffer.isBuffer(body) ? body : JSON.stringify(body) : undefined);
}); }
(async () => {
    const server = mod.exports.create(); await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    try {
        for (const url of ['/api/voices/install', '/api/voices/theme']) {
            const blocked = await request(server, 'POST', url, {}); assert.strictEqual(blocked.status, 401, url); assert(blocked.data.error.includes('Sign in to GitHub'));
        }
        connected = true;
        const uploaded = await request(server, 'PUT', '/api/store/upload?name=v.zip', fixture.zip(files));
        assert.strictEqual(uploaded.status, 200, JSON.stringify(uploaded.data)); assert.strictEqual(uploaded.data.type, 'voice', 'Upload ZIP detects a voice');
        const id = uploaded.data.voices[0].id;
        assert.strictEqual((await request(server, 'GET', '/api/voices')).data.voices.length, 1);
        const applied = await request(server, 'POST', '/api/voices/apply', { id }); assert.strictEqual(applied.data.active, id);
        assert.strictEqual(fs.readFileSync(path.join(temp, 'voices', 'fx.txt'), 'utf8').trim(), '0.4 5 0.9');
        const breath = await request(server, 'GET', '/api/voices/asset?id=' + id + '&name=breath.mp3'); assert.strictEqual(breath.status, 200); assert.strictEqual(breath.type, 'audio/mpeg');
        assert.strictEqual((await request(server, 'GET', '/api/voices/asset?id=' + id + '&name=manifest.json')).status, 400);
        assert.strictEqual((await request(server, 'GET', '/api/store/details?id=' + id)).data.manifest.name, 'HTTP Voice');
        assert.strictEqual((await request(server, 'POST', '/api/voices/theme', { themeId: 'theme-2' })).status, 400, 'Theme without a voice');
        assert.strictEqual((await request(server, 'POST', '/api/voices/theme', { themeId: 'theme-1' })).status, 200);
        assert.deepStrictEqual(fromTheme, [['https://github.com/example/v', 'T']], 'Only the installed theme’s own link is downloaded');
        assert.strictEqual((await request(server, 'POST', '/api/voices/apply', { id: 'nope' })).status, 400);
        const removed = await request(server, 'DELETE', '/api/voices?id=' + id); assert.strictEqual(removed.data.active, null);
        assert.strictEqual(fs.readFileSync(path.join(temp, 'voices', 'fx.txt'), 'utf8').trim(), '0 5 1');
        console.log('Voice HTTP routes passed');
    } finally { server.close(); }
})().catch(err => { console.error(err); process.exit(1); });
