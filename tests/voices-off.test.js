'use strict';
// Custom voices are turned off by default: no routes, no uploads, nothing written.
const assert = require('assert'), fs = require('fs'), os = require('os'), path = require('path'), http = require('http'), createRequire = require('module').createRequire;
const voicesLib = require('../@be/be/beacon/lib/voices'), fixture = require('./theme-fixtures');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'voices-http-'));
const files = { 'manifest.json': Buffer.from('{"name":"HTTP Voice","version":"1.0.0","type":"voice","voice":{"vibrato":0.4,"volume":0.9}}'),
    'breath.mp3': Buffer.concat([Buffer.from('ID3'), Buffer.alloc(32)]), 'banner.png': fixture.png() };
let connected = false; const themeList = { themes: [{ id: 'theme-1', manifest: { name: 'T', version: '1.0.0', voice: 'https://github.com/example/v' } }, { id: 'theme-2', manifest: { name: 'Plain', version: '1.0.0' } }] };
const fromTheme = [];
const voices = voicesLib.create({ root: path.join(temp, 'voices'), compatibility: () => ({ status: 'compatible' }), catalog: () => ({ entries: [] }), store: { download: () => Promise.reject(new Error('offline')) } });
voices.ENABLED = voicesLib.ENABLED;
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
    assert.strictEqual(voicesLib.ENABLED, false, 'Voices are off unless BEACON_VOICES=1');
    connected = true;
    const server = mod.exports.create(); await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    try {
        assert.deepStrictEqual((await request(server, 'GET', '/api/voices')).data, { enabled: false, voices: [], active: null });
        for (const [method, url] of [['POST', '/api/voices/apply'], ['POST', '/api/voices/install'], ['POST', '/api/voices/theme'], ['GET', '/api/voices/asset?id=x&name=breath.mp3']]) {
            const r = await request(server, method, url, method === 'POST' ? {} : undefined); assert.strictEqual(r.status, 404, url); assert(/turned off/.test(r.data.error));
        }
        const up = await request(server, 'PUT', '/api/store/upload?name=v.zip', fixture.zip(files));
        assert.strictEqual(up.status, 400); assert(/turned off/.test(up.data.error));
        assert(!fs.existsSync(path.join(temp, 'voices', 'fx.txt')), 'Nothing written');
        console.log('Voices off: routes and uploads refused');
    } finally { server.close(); }
})().catch(err => { console.error(err); process.exit(1); });
