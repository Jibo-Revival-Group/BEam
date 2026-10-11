'use strict';

const fs = require('fs'), path = require('path'), https = require('https'), querystring = require('querystring');
const paths = require('./paths');
const CLIENT_ID = 'Ov23liRcugb5gNBIZj7z';
function post(endpoint, fields) {
    return new Promise((resolve, reject) => {
        const body = querystring.stringify(fields); let done = false, response;
        const req = https.request({ hostname: 'github.com', path: endpoint, method: 'POST',
            ca: fs.readFileSync(path.join(__dirname, '../certs/mozilla-ca.pem')), rejectUnauthorized: true,
            headers: { Accept: 'application/json', 'User-Agent': 'BEacon', 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) } }, res => {
            response = res; const chunks = []; let size = 0;
            res.on('data', b => { size += b.length; if (size > 65536) { finish(new Error('GitHub sign-in response is too large')); } else { chunks.push(b); } });
            res.on('error', finish); res.on('aborted', () => finish(new Error('GitHub sign-in was interrupted')));
            res.on('end', () => {
                if (res.statusCode !== 200) { finish(new Error('GitHub sign-in returned HTTP ' + res.statusCode)); return; }
                try { finish(null, JSON.parse(Buffer.concat(chunks).toString('utf8'))); } catch (err) { finish(new Error('Invalid GitHub sign-in response')); }
            });
        });
        const timer = setTimeout(() => finish(new Error('GitHub sign-in timed out. Retry.')), 15000);
        function finish(err, data) { if (done) { return; } done = true; clearTimeout(timer); if (err) { req.destroy(); if (response) { response.destroy(); } reject(err); } else { resolve(data); } }
        req.on('error', finish); req.end(body);
    });
}
function create(options) {
    const opts = options || {}, file = path.join(opts.root || path.join(paths.dataDir(), 'github'), 'auth.json');
    const network = opts.post || post, now = opts.now || Date.now;
    let pending = null, working = null, generation = 0, error = null;
    function credential() {
        if (!fs.existsSync(file)) { return null; }
        try {
            const data = JSON.parse(fs.readFileSync(file, 'utf8'));
            return data && typeof data.token === 'string' && /^[A-Za-z0-9_]+$/.test(data.token) ? data : null;
        } catch (err) { error = 'Saved GitHub authorization could not be read. Sign in again.'; return null; }
    }
    function status() {
        if (pending && now() >= pending.expiresAt) { pending = null; error = 'GitHub sign-in code expired. Start again.'; }
        const saved = credential();
        return { connected: !!saved, state: pending ? 'pending' : saved ? 'connected' : 'disconnected', error: error,
            userCode: pending && pending.userCode, verificationUri: pending ? 'https://github.com/login/device' : null,
            expiresAt: pending && pending.expiresAt, interval: pending && pending.interval };
    }
    function start() {
        if (working) { return working; }
        const id = ++generation; error = null;
        working = Promise.resolve().then(() => network('/login/device/code', { client_id: CLIENT_ID })).then(data => {
            if (id !== generation) { return status(); }
            if (data.error) { throw new Error(data.error_description || data.error); }
            if (typeof data.device_code !== 'string' || !data.device_code || typeof data.user_code !== 'string' || !data.user_code ||
                !Number.isFinite(data.expires_in) || data.expires_in <= 0 || data.expires_in > 3600 ||
                (data.interval !== undefined && (!Number.isFinite(data.interval) || data.interval <= 0 || data.interval > 300))) { throw new Error('Invalid GitHub device code response'); }
            const interval = Math.max(5, data.interval || 5);
            pending = { deviceCode: data.device_code, userCode: data.user_code, expiresAt: now() + data.expires_in * 1000, interval: interval, nextPoll: now() + interval * 1000 };
            return status();
        }).catch(err => { if (id === generation) { error = err.message; } throw err; });
        const result = working; return result.then(data => { if (working === result) { working = null; } return data; }, err => { if (working === result) { working = null; } throw err; });
    }
    function poll() {
        status(); if (!pending || now() < pending.nextPoll) { return Promise.resolve(status()); }
        if (working) { return working; }
        const flow = pending, id = generation;
        flow.nextPoll = now() + flow.interval * 1000;
        working = Promise.resolve().then(() => network('/login/oauth/access_token', { client_id: CLIENT_ID, device_code: flow.deviceCode, grant_type: 'urn:ietf:params:oauth:grant-type:device_code' })).then(data => {
            if (id !== generation || pending !== flow) { return status(); }
            if (now() >= flow.expiresAt) { return status(); }
            if (data.error === 'authorization_pending') { return status(); }
            if (data.error === 'slow_down') { flow.interval += 5; flow.nextPoll = now() + flow.interval * 1000; return status(); }
            if (data.error) { pending = null; error = data.error === 'access_denied' ? 'GitHub sign-in was declined.' : data.error === 'expired_token' ? 'GitHub sign-in code expired. Start again.' : data.error_description || data.error; return status(); }
            if (typeof data.access_token !== 'string' || !/^[A-Za-z0-9_]+$/.test(data.access_token) || String(data.token_type).toLowerCase() !== 'bearer') { throw new Error('Invalid GitHub access token response'); }
            paths.ensureDir(path.dirname(file)); fs.chmodSync(path.dirname(file), 0o700);
            const temp = file + '.tmp';
            try { fs.writeFileSync(temp, JSON.stringify({ token: data.access_token }), { mode: 0o600 }); fs.chmodSync(temp, 0o600); fs.renameSync(temp, file); }
            finally { if (fs.existsSync(temp)) { fs.unlinkSync(temp); } }
            pending = null; error = null; return status();
        }).catch(err => { if (id === generation) { error = err.message; } throw err; });
        const result = working; return result.then(data => { if (working === result) { working = null; } return data; }, err => { if (working === result) { working = null; } throw err; });
    }
    function disconnect() { generation++; pending = null; working = null; error = null; if (fs.existsSync(file)) { fs.unlinkSync(file); } return status(); }
    function invalidate(token) { const saved = credential(); if (saved && saved.token === token) { disconnect(); error = 'GitHub authorization expired or was revoked. Sign in again.'; } }
    return { status: status, start: start, poll: poll, disconnect: disconnect, token: () => { const saved = credential(); return saved && saved.token; }, invalidate: invalidate };
}
module.exports = Object.assign(create(), { create: create, CLIENT_ID: CLIENT_ID });
