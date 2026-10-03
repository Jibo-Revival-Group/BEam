'use strict';

/**
 * Home Assistant pairing for BEefy.
 *
 * HA posts the callback details. The robot shows that machine's IP and waits
 * for Yes or No, then stores a generated password next to the callback.
 * When this robot's LAN address changes, it tells Home Assistant.
 */

const crypto = require('crypto');
const fs = require('fs');
const http = require('http');
const os = require('os');
const path = require('path');

const paths = require('./paths');
const system = require('./system');

const PAIR_TIMEOUT_MS = 80000;
const ANNOUNCE_MS = 15000;
const FIVE_X1_HOST = 'api.5x1.com';
const FIVE_X1_PORT = 443;

let pairing = false;
let announcing = false;
let watcherStarted = false;

function fail (message, status) {
    const err = new Error(message);
    err.status = status || 400;
    return err;
}

function configPath () {
    if (paths.onRobot() || paths.isDir('/opt/jibo') || paths.isDir(paths.ROBOT_KNOWLEDGE)) {
        return path.join(paths.ROBOT_KNOWLEDGE, 'beacon', 'homeassistant.json');
    }
    return path.join(paths.dataDir(), 'homeassistant.json');
}

function readConfig () {
    try {
        if (!paths.isFile(configPath())) { return null; }
        return JSON.parse(fs.readFileSync(configPath(), 'utf8'));
    } catch (err) {
        return null;
    }
}

function writeConfig (data) {
    const file = configPath();
    paths.ensureDir(path.dirname(file));
    fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
}

function normalizeIp (ip) {
    const text = String(ip || '');
    if (text.indexOf('::ffff:') === 0) { return text.slice('::ffff:'.length); }
    return text;
}

function peerIp (req) {
    const socket = req && req.socket;
    return normalizeIp(socket && socket.remoteAddress);
}

function localIp (req) {
    const socket = req && req.socket;
    const fromSocket = normalizeIp(socket && socket.localAddress);
    if (fromSocket && fromSocket !== '127.0.0.1') { return fromSocket; }
    return currentLanIp();
}

function currentLanIp () {
    const ifaces = os.networkInterfaces();
    const names = Object.keys(ifaces);
    for (let i = 0; i < names.length; i++) {
        const addrs = ifaces[names[i]] || [];
        for (let j = 0; j < addrs.length; j++) {
            const addr = addrs[j];
            if (addr && addr.family === 'IPv4' && !addr.internal) {
                return addr.address;
            }
        }
    }
    return '';
}

function getJibo () {
    var candidate = null;
    if (typeof jibo !== 'undefined') {
        candidate = jibo;
    } else if (typeof window !== 'undefined' && window.jibo) {
        candidate = window.jibo;
    }
    if (candidate && candidate.face && candidate.face.views &&
            typeof candidate.face.views.createView === 'function') {
        return candidate;
    }
    return null;
}

function closeView (face, view) {
    if (!view) { return; }
    try {
        if (face && face.views && typeof face.views.removeView === 'function') {
            face.views.removeView(view);
            return;
        }
    } catch (err) { /* fall through */ }
    try {
        if (typeof view.close === 'function') { view.close(); }
    } catch (err2) { /* view already gone */ }
}

function confirmOnScreen (haIp) {
    return new Promise(function (resolve) {
        const faceApi = getJibo();
        if (!faceApi) {
            resolve('no_screen');
            return;
        }

        let settled = false;
        let view = null;
        const timer = setTimeout(function () {
            finish('timeout');
        }, PAIR_TIMEOUT_MS);

        function finish (answer) {
            if (settled) { return; }
            settled = true;
            clearTimeout(timer);
            closeView(faceApi.face, view);
            resolve(answer);
        }

        const config = {
            viewConfig: {
                type: 'MenuView',
                id: 'haPairConfirm',
                title: 'Home Assistant?\n' + haIp,
                ignoreSwipeDown: true,
                listDefault: { menuButtonType: 'ActionButton' },
                elementDimensions: { x: 264, y: 264 },
                elementBuffer: 150,
                list: [
                    {
                        label: 'No',
                        colors: 'cancel',
                        iconSrc: 'jibo://resources/actionIcons/cancel.png',
                        actions: [{
                            type: 'event',
                            data: { event: 'pressed', intent: 'no' }
                        }]
                    },
                    { type: 'Label' },
                    {
                        label: 'Yes',
                        colors: 'confirm',
                        iconSrc: 'jibo://resources/actionIcons/ok.png',
                        actions: [{
                            type: 'event',
                            data: { event: 'pressed', intent: 'yes' }
                        }]
                    }
                ]
            }
        };

        try {
            view = faceApi.face.views.createView('MenuView', config, true);
        } catch (err) {
            finish('no_screen');
            return;
        }

        function onPress (event) {
            const intent = (event && (event.intent || (event.data && event.data.intent))) || '';
            if (intent === 'yes') { finish('yes'); }
            else if (intent === 'no') { finish('no'); }
        }

        view.on('pressed', onPress);
        view.on('yes', function () { finish('yes'); });
        view.on('no', function () { finish('no'); });
    });
}

function pair (req, body) {
    if (pairing) {
        return Promise.resolve({
            status: 409,
            body: { ok: false, error: 'busy' }
        });
    }

    const haIp = peerIp(req);
    const haPort = Number(body && body.haPort);
    const webhookId = body && String(body.webhookId || '').trim();
    const instanceId = body && String(body.instanceId || '').trim();
    const mode = body && String(body.mode || '').trim();

    if (!haIp) {
        return Promise.resolve({ status: 400, body: { ok: false, error: 'no_peer' } });
    }
    if (!webhookId || !instanceId) {
        return Promise.resolve({ status: 400, body: { ok: false, error: 'missing_fields' } });
    }
    if (!haPort || haPort < 1 || haPort > 65535) {
        return Promise.resolve({ status: 400, body: { ok: false, error: 'bad_port' } });
    }

    pairing = true;
    return confirmOnScreen(haIp).then(function (answer) {
        pairing = false;
        if (answer === 'no') {
            return { status: 403, body: { ok: false, error: 'rejected' } };
        }
        if (answer === 'timeout') {
            return { status: 408, body: { ok: false, error: 'timeout' } };
        }
        if (answer !== 'yes') {
            return { status: 503, body: { ok: false, error: 'no_screen' } };
        }

        const password = crypto.randomBytes(24).toString('hex');
        const robotIp = localIp(req);
        const record = {
            haIp: haIp,
            haPort: haPort,
            webhookId: webhookId,
            instanceId: instanceId,
            password: password,
            mode: mode,
            lastAnnouncedIp: robotIp
        };
        writeConfig(record);

        let server = null;
        if (mode === '5x1') {
            try {
                server = system.setServer({ hostname: FIVE_X1_HOST, port: FIVE_X1_PORT });
            } catch (err) {
                server = { ok: false, error: err && err.message };
            }
        }

        return {
            status: 200,
            body: {
                ok: true,
                password: password,
                robotIp: robotIp,
                server: server
            }
        };
    }, function (err) {
        pairing = false;
        throw err;
    });
}

function postJson (host, port, urlPath, payload, callback) {
    const body = JSON.stringify(payload);
    let finished = false;
    function finish (err) {
        if (finished) { return; }
        finished = true;
        callback(err);
    }
    const req = http.request({
        host: host,
        port: port || 8123,
        path: urlPath,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body)
        }
    }, function (res) {
        res.resume();
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            finish(null);
            return;
        }
        finish(fail('Home Assistant returned ' + res.statusCode, res.statusCode || 500));
    });
    req.on('error', finish);
    req.setTimeout(8000, function () {
        req.abort();
        finish(fail('Home Assistant announce timed out', 408));
    });
    req.write(body);
    req.end();
}

function announceIfNeeded () {
    if (announcing) { return; }
    const saved = readConfig();
    if (!saved || !saved.password || !saved.haIp || !saved.webhookId) { return; }
    const ip = currentLanIp();
    if (!ip || ip === saved.lastAnnouncedIp) { return; }

    announcing = true;
    postJson(saved.haIp, saved.haPort || 8123, '/api/webhook/' + saved.webhookId, {
        type: 'ip_update',
        ip: ip,
        password: saved.password
    }, function (err) {
        announcing = false;
        if (err) {
            console.warn('[beacon] home assistant ip announce failed:', err.message);
            return;
        }
        const latest = readConfig() || saved;
        latest.lastAnnouncedIp = ip;
        try {
            writeConfig(latest);
        } catch (writeErr) {
            console.warn('[beacon] could not store announced ip:', writeErr && writeErr.message);
        }
    });
}

function startWatcher () {
    if (watcherStarted) { return; }
    watcherStarted = true;
    setTimeout(announceIfNeeded, 2000);
    setInterval(announceIfNeeded, ANNOUNCE_MS);
}

module.exports = {
    pair: pair,
    startWatcher: startWatcher,
    configPath: configPath,
    readConfig: readConfig
};
