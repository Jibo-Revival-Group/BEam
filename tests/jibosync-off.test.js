'use strict';
// JiboSync is hidden by default: nothing runs in the background, BEacon's Etc section stays hidden, and the
// routes are refused. BEACON_JIBOSYNC=1 turns it back on.
const assert = require('assert'), fs = require('fs'), path = require('path'), http = require('http'), childProcess = require('child_process');
const createRequire = require('module').createRequire;
delete process.env.BEACON_JIBOSYNC;
const jibosync = require('../@be/be/beacon/lib/jibosync');
const serverPath = path.resolve(__dirname, '../@be/be/beacon/server.js'), serverRequire = createRequire(serverPath), mod = { exports: {} };
new Function('require', 'module', 'exports', '__dirname', fs.readFileSync(serverPath, 'utf8'))(serverRequire, mod, mod.exports, path.dirname(serverPath));

function request(server, method, url) { return new Promise((resolve, reject) => {
    const req = http.request({ hostname: '127.0.0.1', port: server.address().port, method, path: url }, res => {
        const parts = []; res.on('data', b => parts.push(b)); res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(Buffer.concat(parts)) }));
    }); req.on('error', reject); req.end(method === 'POST' ? '{}' : undefined);
}); }

(async () => {
    assert.strictEqual(jibosync.ENABLED, false, 'JiboSync is off unless BEACON_JIBOSYNC=1');
    const handles = process._getActiveHandles().length;
    jibosync.start();
    assert.strictEqual(process._getActiveHandles().length, handles, 'start() opens no UDP socket or timer');

    const server = mod.exports.create(); await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    try {
        assert.deepStrictEqual((await request(server, 'GET', '/api/jibosync/status')).data, { enabled: false });
        for (const [method, url] of [['POST', '/api/jibosync/sync'], ['GET', '/api/jibosync/info'], ['GET', '/api/jibosync/person?id=x']]) {
            const r = await request(server, method, url); assert.strictEqual(r.status, 404, url); assert(/turned off/.test(r.data.error), url);
        }
    } finally { server.close(); }

    const html = fs.readFileSync(path.join(__dirname, '../@be/be/beacon/public/index.html'), 'utf8');
    assert(/<p class="section-header" id="jibosync-header" hidden>JiboSync<\/p>/.test(html) && /<div class="setting-block" id="jibosync" hidden>/.test(html), 'Etc section hidden in the page');
    const on = childProcess.execFileSync(process.execPath, ['-e', 'console.log(require("./@be/be/beacon/lib/jibosync").ENABLED)'],
        { cwd: path.join(__dirname, '..'), env: Object.assign({}, process.env, { BEACON_JIBOSYNC: '1' }) }).toString().trim();
    assert.strictEqual(on, 'true', 'BEACON_JIBOSYNC=1 turns it on');
    console.log('PASS JiboSync off: no background sync, section hidden, routes refused; BEACON_JIBOSYNC=1 turns it on');
})().catch(err => { console.error(err); process.exit(1); });
