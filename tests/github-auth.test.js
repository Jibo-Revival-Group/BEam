'use strict';
const assert = require('assert'), fs = require('fs'), path = require('path'), os = require('os'), EventEmitter = require('events');
const auth = require('../@be/be/beacon/lib/github-auth');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'github-device-auth-'));
let time = 0, response = { error: 'authorization_pending' }, fail = false, late;
const calls = [];
const service = auth.create({ root, now: () => time, post: (endpoint, fields) => {
    calls.push({ endpoint, fields }); if (fail) { throw new Error('Disconnected'); }
    if (endpoint === '/login/device/code') return Promise.resolve({ device_code: 'private_device_code', user_code: 'ABCD-EFGH', expires_in: 900, interval: 5 });
    return response === 'late' ? new Promise(resolve => { late = resolve; }) : Promise.resolve(response);
} });
(async () => {
    try {
        assert.strictEqual(service.status().connected, false);
        const code = await service.start(); assert.strictEqual(code.userCode, 'ABCD-EFGH'); assert(!JSON.stringify(code).includes('private_device_code'));
        assert.deepStrictEqual(calls[0].fields, { client_id: 'Ov23liRcugb5gNBIZj7z' });
        await service.poll(); assert.strictEqual(calls.length, 1, 'Early polling does not contact GitHub');
        time = 5000; await service.poll(); assert.strictEqual(calls.length, 2); assert.strictEqual(calls[1].fields.grant_type, 'urn:ietf:params:oauth:grant-type:device_code');
        time = 10000; response = { error: 'slow_down' }; assert.strictEqual((await service.poll()).interval, 10);
        time = 15000; await service.poll(); assert.strictEqual(calls.length, 3);
        time = 20000; response = { access_token: 'gho_test_token', token_type: 'bearer' }; const connected = await service.poll();
        assert(connected.connected); assert(!JSON.stringify(connected).includes('gho_test_token')); assert.strictEqual(service.token(), 'gho_test_token');
        assert.strictEqual(fs.statSync(path.join(root, 'auth.json')).mode & 0o777, 0o600); assert.strictEqual(fs.statSync(root).mode & 0o777, 0o700);
        assert.strictEqual(auth.create({ root }).token(), 'gho_test_token', 'Token survives restarts');
        service.invalidate('different_token'); assert(service.status().connected); service.invalidate('gho_test_token'); assert(!service.status().connected);
        await service.start(); time += 900001; assert.strictEqual(service.status().state, 'disconnected'); assert(/expired/.test(service.status().error));
        await service.start(); time += 5000; response = { error: 'access_denied' }; assert(/declined/.test((await service.poll()).error));
        await service.start(); time += 5000; response = 'late'; const pending = service.poll(); await new Promise(resolve => setImmediate(resolve)); service.disconnect(); late({ access_token: 'gho_late_token', token_type: 'bearer' }); await pending; assert.strictEqual(service.token(), null);
        fail = true; await assert.rejects(() => service.start(), /Disconnected/); fail = false; await service.start(); assert.strictEqual(service.status().state, 'pending'); service.disconnect();
        fs.writeFileSync(path.join(root, 'auth.json'), 'bad JSON'); assert.strictEqual(service.token(), null); service.disconnect();
        // Exercise actual downloader headers and redirects without transmitting a token.
        const sourcePath = require.resolve('../@be/be/beacon/lib/theme-store'), mod = { exports: {} }, requests = [];
        let token = 'gho_private', rejected = false;
        const fakeAuth = { token: () => token, invalidate: () => { token = null; rejected = true; } };
        const transport = { get(options, callback) {
            requests.push(options); const req = new EventEmitter(); req.destroy = () => {};
            setImmediate(() => { const res = new EventEmitter(); res.destroy = () => {}; res.resume = () => {};
                res.headers = {}; res.statusCode = options.pathname === '/redirect' ? 302 : options.pathname === '/revoked' && !rejected ? 401 : 200;
                if (res.statusCode === 302) { res.headers.location = 'https://example.com/package.zip'; }
                callback(res); if (res.statusCode === 200) { res.emit('data', Buffer.from('{}')); } res.emit('end');
            }); return req;
        } };
        new Function('require', 'module', 'exports', '__dirname', fs.readFileSync(sourcePath, 'utf8'))(name => name === 'https' || name === 'http' ? transport : name === './github-auth' ? fakeAuth : name === './theme-package' ? require('../@be/be/beacon/lib/theme-package') : require(name), mod, mod.exports, path.dirname(sourcePath));
        await mod.exports.request('https://api.github.com/redirect', 1024); assert.strictEqual(requests[0].headers.Authorization, 'Bearer gho_private'); assert.strictEqual(requests[1].headers.Authorization, undefined);
        await assert.rejects(mod.exports.request('http://api.github.com/no-tls', 1024), e => e.status === 401);
        assert.strictEqual(requests.length, 2, 'No unauthenticated or plaintext GitHub API requests');
        await assert.rejects(mod.exports.request('https://api.github.com/revoked', 1024), e => e.status === 401);
        assert(rejected); assert.strictEqual(requests.length, 3, 'Revoked tokens do not retry anonymously');
        await assert.rejects(mod.exports.request('https://api.github.com/no-auth', 1024), e => e.status === 401);
        assert.strictEqual(requests.length, 3, 'Missing credentials cannot use the API');
        console.log('GitHub device flow, bounded polling/backoff, cancellation, persistence, credential recovery and host-only authentication passed');
    } finally { fs.rmSync(root, { recursive: true, force: true }); }
})().catch(err => { console.error(err); process.exitCode = 1; });
