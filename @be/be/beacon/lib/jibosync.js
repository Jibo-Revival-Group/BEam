'use strict';
/**
 * JiboSync (BEacon › Etc): share the people Jibo knows — names, photos, phonetic names, faces and
 * voices — with the other 5x1 robots on this Wi-Fi that run exactly the same os, services and BEam.
 *
 * Every robot only changes itself: it finds the others (UDP broadcast on 8124), reads their people
 * (GET /api/jibosync/info), plans a merge (jibosync-merge.js) and pulls what it needs
 * (GET /api/jibosync/person). Face and voice files are root-only, so BEnch's jibo-sync-helper
 * (127.0.0.1:8494) reads and installs them. Runs on "Sync now", every 4 hours, and a minute after
 * people change here (other robots are told to sync too).
 */
const fs = require('fs');
const http = require('http');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const merge = require('./jibosync-merge');

const PROTOCOL = 1;
const UDP_PORT = 8124;
const HELPER_PORT = 8494;
const EVERY_MS = 4 * 3600 * 1000;
const CHECK_MS = 60 * 1000;
const DISCOVER_MS = 2500;

function fail (message, status) {
    const err = new Error(message);
    err.status = status || 500;
    return err;
}

function requestJson (opts, body) {
    return new Promise((resolve, reject) => {
        const data = body === undefined ? null : Buffer.from(JSON.stringify(body));
        const req = http.request({
            host: opts.host, port: opts.port, path: opts.path, method: opts.method || 'GET',
            headers: data ? { 'Content-Type': 'application/json', 'Content-Length': data.length } : {}
        }, (res) => {
            const chunks = [];
            res.on('data', (d) => chunks.push(d));
            res.on('end', () => {
                let json = null;
                try { json = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch (err) { /* not JSON */ }
                if (res.statusCode >= 200 && res.statusCode < 300 && json) return resolve(json);
                reject(fail((json && json.error) || ('HTTP ' + res.statusCode + ' from ' + opts.host + opts.path), 502));
            });
        });
        req.setTimeout(opts.timeout || 60000, () => req.abort());
        req.on('error', (err) => reject(fail(opts.host + ': ' + err.message, 502)));
        req.end(data);
    });
}

function errorText (err) {
    return (err && err.message) || (err && typeof err === 'object' ? JSON.stringify(err) : String(err));
}

function cb2p (fn) {
    return new Promise((resolve, reject) => fn((err, v) => (err ? reject(err instanceof Error ? err : new Error(String(err))) : resolve(v))));
}

function defaultVersions () {
    const ota = require('./ota');
    const pkgs = ota.listPackages();
    const find = (name) => (pkgs.filter((p) => p.subsystem === name)[0] || {}).version || null;
    let osVersion = null;
    try {
        const out = require('child_process').spawnSync('/usr/bin/jibo-version', [], { encoding: 'utf8', timeout: 8000 });
        const m = /Release-[0-9][0-9A-Za-z._-]*/.exec(String(out.stdout || '') + String(out.stderr || ''));
        osVersion = m ? m[0] : null;
    } catch (err) { /* not on a robot */ }
    return { os: osVersion, services: find('services'), beam: find('@be/be') };
}

function sameVersions (a, b) {
    return !!(a && b && a.os && a.os === b.os && a.services === b.services && a.beam === b.beam);
}

function create (deps) {
    deps = deps || {};
    const people = deps.people || require('./people');
    const jibo = deps.jibo || (() => require('jibo'));
    const now = deps.now || Date.now;
    const helperPort = deps.helperPort || HELPER_PORT;
    const udpPort = deps.udpPort === undefined ? UDP_PORT : deps.udpPort;
    const robotId = deps.robotId || os.hostname();
    const beaconPort = () => deps.httpPort || Number(process.env.BEACON_PORT) || 8123;
    const statePath = deps.statePath || path.join(require('./paths').dataDir(), 'jibosync.json');
    const versions = deps.versions || (() => { cachedVersions = cachedVersions || defaultVersions(); return cachedVersions; });
    let cachedVersions = null;
    let state = loadState();
    let running = null;
    let socket = null;
    let collector = null;
    let changeTimer = null;

    function loadState () {
        try { return Object.assign({ tombstones: {}, keys: null, signature: null, synced: null, last: null }, JSON.parse(fs.readFileSync(statePath, 'utf8'))); } catch (err) {
            return { tombstones: {}, keys: null, signature: null, synced: null, last: null };
        }
    }
    function saveState () {
        const tmp = statePath + '.tmp';
        fs.writeFileSync(tmp, JSON.stringify(state));
        fs.renameSync(tmp, statePath);
    }
    const helper = (method, p, body) => requestJson({ host: '127.0.0.1', port: helperPort, path: p, method: method, timeout: 120000 }, body);

    /** This robot's people with their face/voice enrollment (robot member, removed and declined left out). */
    function snapshot () {
        return Promise.all([people.list(), helper('GET', '/summary')]).then((r) => {
            const sum = r[1];
            return (r[0].members || []).filter((m) => !m.isJibo && m.status !== 'removed' && m.status !== 'declined').map((m) => ({
                id: m.id, firstName: m.firstName, lastName: m.lastName, gender: m.gender, phoneticName: m.phoneticName || null,
                hasPhoto: !!m.hasPhoto, owner: m.type === 'owner', created: m.created || 0,
                face: sum.faces[m.id] || null, voice: sum.voices[m.id] || null
            }));
        });
    }

    // Removed here = gone from the snapshot: remember the name so other robots remove them too.
    function noteChanges (list) {
        const keys = {};
        list.forEach((p) => { if (!merge.isPlaceholder(p)) keys[merge.personKey(p)] = true; });
        if (state.keys) Object.keys(state.keys).forEach((k) => { if (!keys[k] && k) state.tombstones[k] = now(); });
        Object.keys(keys).forEach((k) => {
            if (state.tombstones[k] && list.some((p) => merge.personKey(p) === k && Math.max(p.created || 0, p.face ? p.face.last : 0, p.voice ? p.voice.stamp : 0) > state.tombstones[k])) {
                delete state.tombstones[k];
            }
        });
        state.keys = keys;
        state.signature = crypto.createHash('sha1').update(JSON.stringify(list.map((p) => [p.id, merge.personKey(p), p.face, p.voice, p.phoneticName, p.hasPhoto, p.owner]))).digest('hex');
    }

    function info () {
        return snapshot().then((list) => {
            noteChanges(list);
            saveState();
            return { jibosync: PROTOCOL, robotId: robotId, versions: versions(), people: list, tombstones: state.tombstones };
        });
    }

    /** One person's full data for another robot. */
    function person (id) {
        return Promise.all([people.findMember(id), helper('GET', '/export?id=' + encodeURIComponent(id))]).then((r) => {
            const m = r[0].member;
            return Promise.resolve().then(() => people.resolvePhotoFile(id)).then((file) => fs.readFileSync(file).toString('base64'), () => null).then((photo) => ({
                id: id, firstName: m.firstName, lastName: m.lastName, gender: m.gender, phoneticName: m.phoneticName || null,
                photo: photo, face: r[1].face, voice: r[1].voice
            }));
        });
    }

    // --- discovery: {"jibosync":"hello"} broadcast; robots answer {"jibosync":"here"}; "changed" asks them to sync.
    function message (type) { return Buffer.from(JSON.stringify({ jibosync: type, robotId: robotId, port: beaconPort(), protocol: PROTOCOL })); }
    function broadcastAddresses () {
        const out = ['255.255.255.255'];
        const nets = os.networkInterfaces();
        Object.keys(nets).forEach((n) => nets[n].forEach((a) => {
            if (a.family !== 'IPv4' || a.internal || !a.netmask) return;
            const ip = a.address.split('.').map(Number);
            const mask = a.netmask.split('.').map(Number);
            out.push(ip.map((v, i) => (v & mask[i]) | (~mask[i] & 255)).join('.'));
        }));
        return out.filter((v, i, all) => all.indexOf(v) === i);
    }
    function send (type, address, port) {
        if (!socket) return;
        try { socket.send(message(type), port || udpPort, address); } catch (err) { /* network down */ }
    }
    function onMessage (buf, rinfo) {
        let msg;
        try { msg = JSON.parse(String(buf)); } catch (err) { return; }
        if (!msg || msg.robotId === robotId || msg.protocol !== PROTOCOL) return;
        if (msg.jibosync === 'hello') send('here', rinfo.address, rinfo.port);
        if ((msg.jibosync === 'here' || msg.jibosync === 'hello') && collector) collector[msg.robotId] = { robotId: msg.robotId, address: rinfo.address, port: Number(msg.port) || 8123 };
        if (msg.jibosync === 'changed') scheduleSync('another robot changed', 30000);
    }
    function discover () {
        if (deps.discover) return deps.discover();
        if (!socket) return Promise.resolve([]);
        collector = {};
        broadcastAddresses().forEach((a) => send('hello', a));
        return new Promise((resolve) => setTimeout(() => {
            const found = Object.keys(collector).map((k) => collector[k]);
            collector = null;
            resolve(found);
        }, DISCOVER_MS));
    }

    // --- voices. The speech service's replies don't match what it did (on .165 a build that worked answered
    // "File not found", and one removal left the speaker enrolled), so both check the enrolled list.
    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    function enrolled (id) {
        return Promise.resolve(jibo().jetstream.getEnrolledSpeakers()).then((list) => (list || []).indexOf(id) >= 0);
    }
    function buildVoice (id) {
        let reply = null;
        return Promise.resolve().then(() => jibo().jetstream.createSpeakerModel(id)).catch((err) => { reply = err; })
            .then(() => enrolled(id)).then((ok) => { if (!ok) throw reply || new Error('the voice model was not built'); });
    }
    function dropVoice (id) {
        const js = jibo().jetstream;
        const remove = () => Promise.resolve().then(() => js.removeSpeakerModel(id)).catch(() => null).then(() => enrolled(id));
        return remove()
            .then((still) => (still ? wait(3000).then(remove) : false))
            .then((still) => { if (still) throw new Error('the voice model still has ' + id); })
            .then(() => Promise.resolve().then(() => js.removePendingSamples(id)).catch(() => null))
            .then(() => helper('POST', '/voice-gone?id=' + encodeURIComponent(id)));
    }

    // --- applying a plan
    function apply (plan, peers) {
        const done = { imported: 0, removed: 0, errors: [] };
        const byKey = {};
        const items = [];
        const extras = [];
        let chain = Promise.resolve();
        plan.imports.forEach((it) => {
            chain = chain.then(() => {
                const peer = peers[it.peer];
                const needData = it.face || it.voice || it.photo;
                const data = needData ? requestJson({ host: peer.address, port: peer.port, path: '/api/jibosync/person?id=' + encodeURIComponent(it.remoteId), timeout: 120000 }) : Promise.resolve(null);
                return data.then((remote) => {
                    const id = it.localId || byKey[it.key];
                    const created = id ? Promise.resolve(id) : people.createMember(it.fields).then((newId) => { byKey[it.key] = newId; return newId; });
                    return created.then((localId) => {
                        if (remote && (it.face || it.voice)) items.push({ id: localId, from: it.remoteId, face: it.face ? remote.face : null, voice: it.voice ? remote.voice : null });
                        extras.push({ id: localId, photo: it.photo && remote ? remote.photo : null, phoneticName: it.phoneticName });
                        done.imported++;
                    });
                });
            }).catch((err) => done.errors.push(it.key + ': ' + err.message));
        });
        chain = chain.then(() => {
            if (!items.length) return null;
            return helper('POST', '/import', { items: items }).then((res) => {
                // One person at a time: these all save the same KB nodes.
                let steps = Promise.resolve();
                res.faceIds.forEach((id) => {
                    steps = steps.then(() => people.setEnrolled(id, { face: true })).catch((err) => done.errors.push('face: ' + errorText(err)));
                });
                // The helper staged the recordings; the speech service builds this person's voice model from them.
                res.voiceIds.forEach((id) => {
                    steps = steps.then(() => buildVoice(id))
                        .then(() => helper('POST', '/voice-done?id=' + encodeURIComponent(id)))
                        .then(() => people.setEnrolled(id, { voice: true }))
                        .catch((err) => done.errors.push('voice: ' + errorText(err)));
                });
                return steps;
            }).catch((err) => done.errors.push('faces/voices: ' + errorText(err)));
        });
        chain = chain.then(() => Promise.all(extras.map((x) => Promise.resolve()
            .then(() => (x.photo ? people.setPhoto(x.id, Buffer.from(x.photo, 'base64')) : null))
            .then(() => (x.phoneticName ? people.updateMember(x.id, { phoneticName: x.phoneticName }) : null))
            .catch((err) => done.errors.push('photo/name: ' + err.message)))));
        chain = chain.then(() => {
            const owner = plan.setOwner && (plan.setOwner.id || byKey[plan.setOwner.key]);
            return owner ? people.setOwner(owner).catch((err) => done.errors.push('owner: ' + err.message)) : null;
        });
        chain = chain.then(() => snapshot()).then((list) => {
            let rm = Promise.resolve();
            plan.removes.forEach((id) => {
                const p = list.filter((x) => x.id === id)[0];
                if (!p) return;
                const j = jibo();
                rm = rm.then(() => (p.face ? cb2p((cb) => j.ics.removeIdentity({ name: id, kind: 'face' }, cb)) : null))
                    .then(() => (p.voice ? dropVoice(id) : null))
                    .then(() => people.removeMember(id))
                    .then(() => { done.removed++; }, (err) => done.errors.push('remove: ' + err.message));
            });
            return rm;
        });
        return chain.then(() => done);
    }

    function sync (reason) {
        if (running) return running;
        const started = now();
        running = discover().then((found) => Promise.all(found.map((peer) =>
            requestJson({ host: peer.address, port: peer.port, path: '/api/jibosync/info', timeout: 20000 })
                .then((data) => Object.assign({}, peer, { info: data }), (err) => Object.assign({}, peer, { error: err.message })))))
            .then((found) => info().then((local) => {
                const usable = [];
                const report = found.map((peer) => {
                    if (peer.error) return { robotId: peer.robotId, address: peer.address, status: 'unreachable', detail: peer.error };
                    if (!sameVersions(local.versions, peer.info.versions)) {
                        return { robotId: peer.robotId, address: peer.address, status: 'different version', detail: 'needs os ' + local.versions.os + ', services ' + local.versions.services + ', BEam ' + local.versions.beam, versions: peer.info.versions };
                    }
                    usable.push({ robotId: peer.robotId, address: peer.address, port: peer.port, people: peer.info.people, tombstones: peer.info.tombstones });
                    return { robotId: peer.robotId, address: peer.address, status: 'synced', people: (peer.info.people || []).length };
                });
                const plan = merge.plan({ people: local.people, tombstones: state.tombstones }, usable, now());
                state.tombstones = plan.tombstones;
                return apply(plan, usable).then((done) => ({ report: report, done: done }));
            }))
            .then((r) => snapshot().then((list) => {
                // Our own removals of tombstoned names are already tombstoned; nothing new to record.
                noteChanges(list);
                state.synced = state.signature;
                state.last = { at: started, finished: now(), reason: reason || 'manual', ok: !r.done.errors.length, robots: r.report,
                    imported: r.done.imported, removed: r.done.removed, errors: r.done.errors.slice(0, 20) };
                saveState();
                return state.last;
            }))
            .catch((err) => {
                state.last = { at: started, finished: now(), reason: reason || 'manual', ok: false, robots: [], imported: 0, removed: 0, errors: [err.message] };
                try { saveState(); } catch (e) { /* data dir missing */ }
                return state.last;
            })
            .then((last) => { running = null; return last; });
        return running;
    }

    function scheduleSync (reason, delay) {
        if (changeTimer) return;
        changeTimer = setTimeout(() => { changeTimer = null; sync(reason); }, delay);
    }

    /** Once a minute: people changed here → tell the other robots and sync; otherwise every 4 hours. */
    function check () {
        if (running) return Promise.resolve();
        return snapshot().then((list) => {
            noteChanges(list);
            saveState();
            if (state.synced && state.signature !== state.synced) {
                broadcastAddresses().forEach((a) => send('changed', a));
                return sync('people changed');
            }
            if (!state.last || now() - state.last.at > EVERY_MS) return sync('every 4 hours');
            return null;
        }).catch(() => null);
    }

    function start () {
        if (socket || !udpPort) return;
        const dgram = require('dgram');
        socket = dgram.createSocket({ type: 'udp4', reuseAddr: true });
        socket.on('message', onMessage);
        socket.on('error', () => { try { socket.close(); } catch (err) { /* closed */ } socket = null; });
        socket.bind(udpPort, () => { try { socket.setBroadcast(true); } catch (err) { /* no broadcast */ } });
        setTimeout(check, 2 * 60 * 1000);
        setInterval(check, CHECK_MS);
    }

    function status () {
        return { syncing: !!running, last: state.last, versions: versions(), robotId: robotId };
    }

    return { start: start, sync: sync, check: check, status: status, info: info, person: person, onMessage: onMessage, _state: () => state };
}

let instance = null;
function get () { instance = instance || create(); return instance; }

/** Peer endpoints answer only to this Wi-Fi (private and link-local addresses). */
function isLanAddress (address) {
    const a = String(address || '').replace(/^::ffff:/, '');
    return /^(10\.|192\.168\.|169\.254\.|127\.)/.test(a) || /^172\.(1[6-9]|2\d|3[01])\./.test(a) || a === '::1' || /^f[cde]/i.test(a);
}

// JiboSync is hidden for now (code kept for later). Set BEACON_JIBOSYNC=1 to turn it on (the tests do).
const ENABLED = process.env.BEACON_JIBOSYNC === '1';

module.exports = {
    ENABLED: ENABLED,
    create: create,
    sameVersions: sameVersions,
    isLanAddress: isLanAddress,
    start: () => { if (ENABLED) get().start(); },
    sync: (reason) => get().sync(reason),
    status: () => ENABLED ? get().status() : { enabled: false },
    info: () => get().info(),
    person: (id) => get().person(id)
};
