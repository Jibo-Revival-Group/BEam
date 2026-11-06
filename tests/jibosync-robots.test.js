'use strict';
// JiboSync between two simulated robots over real HTTP: robot A (new, placeholder owner) pulls robot B's household.
// Node 6: /root/node6/node-v6.17.1-linux-x64/bin/node tests/jibosync-robots.test.js
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');
const url = require('url');
const jibosync = require('../@be/be/beacon/lib/jibosync');

let clock = 1800000000000;
let nextId = 1;

// One simulated robot: people (KB), face/voice store (BEnch helper), jibo services, BEacon peer endpoints.
function robot (name, members, enrolled) {
    const r = { name: name, members: members, faces: {}, voices: {}, photos: {}, calls: [] };
    Object.keys(enrolled || {}).forEach((id) => {
        if (enrolled[id].face) r.faces[id] = { examples: 5, last: enrolled[id].face, blob: 'face of ' + id };
        if (enrolled[id].voice) r.voices[id] = { stamp: enrolled[id].voice, blob: 'voice of ' + id };
    });
    const find = (id) => r.members.filter((m) => m.id === id)[0];
    r.people = {
        list: () => Promise.resolve({ members: r.members.map((m) => Object.assign({ hasPhoto: !!r.photos[m.id] }, m)) }),
        findMember: (id) => Promise.resolve({ member: find(id) }),
        resolvePhotoFile: (id) => {
            if (!r.photos[id]) return Promise.reject(new Error('no photo'));
            const f = path.join(os.tmpdir(), 'jibosync-photo-' + name + '-' + id);
            fs.writeFileSync(f, r.photos[id]);
            return Promise.resolve(f);
        },
        createMember: (fields) => {
            const id = name + '-new' + (nextId++);
            r.members.push({ id: id, firstName: fields.firstName, lastName: fields.lastName, gender: fields.gender, type: 'member', status: 'accepted', created: clock });
            return Promise.resolve(id);
        },
        setPhoto: (id, buf) => { r.photos[id] = buf.toString(); return Promise.resolve(); },
        updateMember: (id, fields) => { Object.assign(find(id), fields); return Promise.resolve(); },
        setEnrolled: (id, flags) => { r.calls.push(Object.keys(flags).map((k) => k + ' flag ' + id).join()); find(id).enrolled = Object.assign({}, find(id).enrolled, flags); return Promise.resolve(); },
        setOwner: (id) => { r.members.forEach((m) => { if (m.type === 'owner') m.type = 'member'; }); find(id).type = 'owner'; r.calls.push('owner ' + id); return Promise.resolve(); },
        removeMember: (id) => {
            if (find(id).type === 'owner') return Promise.reject(new Error('owner'));
            r.members = r.members.filter((m) => m.id !== id); r.calls.push('remove ' + id); return Promise.resolve();
        }
    };
    r.jibo = {
        jetstream: {
            // Like the real speech service: builds the model but leaves the recordings staged (no voice in the summary yet).
            // .165 answered "File not found" to a build that worked.
            createSpeakerModel: (id) => { r.calls.push('voice model ' + id); r.built[id] = r.staged[id]; r.speakers[id] = true; return Promise.reject('Error executing: /enroll/create_speaker_model reason: File not found'); },
            // .165 once kept a speaker after the first removal.
            removeSpeakerModel: (id) => { r.calls.push('voice removed ' + id); if (r.stubborn[id]) delete r.stubborn[id]; else delete r.speakers[id]; return Promise.resolve(); },
            removePendingSamples: (id) => { r.calls.push('pending removed ' + id); return Promise.resolve({}); },
            getEnrolledSpeakers: () => Promise.resolve(Object.keys(r.speakers))
        },
        ics: { removeIdentity: (data, cb) => { delete r.faces[data.name]; r.calls.push('face removed ' + data.name); cb(); } }
    };
    r.staged = {};
    r.built = {};
    r.speakers = {};
    r.stubborn = {};
    const json = (res, status, body) => { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(body)); };
    r.helper = http.createServer((req, res) => {
        const u = url.parse(req.url, true);
        if (u.pathname === '/summary') {
            const strip = (map) => { const o = {}; Object.keys(map).forEach((k) => { o[k] = { examples: map[k].examples, last: map[k].last, stamp: map[k].stamp }; }); return o; };
            return json(res, 200, { faces: strip(r.faces), voices: strip(r.voices) });
        }
        if (u.pathname === '/export') return json(res, 200, { id: u.query.id, face: r.faces[u.query.id] || null, voice: r.voices[u.query.id] || null });
        if (u.pathname === '/voice-done') { r.calls.push('voice done ' + u.query.id); r.voices[u.query.id] = r.built[u.query.id]; return json(res, 200, { id: u.query.id }); }
        if (u.pathname === '/voice-gone') { r.calls.push('voice gone ' + u.query.id); delete r.voices[u.query.id]; return json(res, 200, { id: u.query.id }); }
        let body = '';
        req.on('data', (d) => { body += d; });
        req.on('end', () => {
            const items = JSON.parse(body).items;
            r.calls.push('import ' + items.map((it) => it.id + '<' + it.from).join(','));
            items.forEach((it) => {
                if (it.face) r.faces[it.id] = it.face;
                if (it.voice) r.staged[it.id] = it.voice;
            });
            json(res, 200, { faceIds: items.filter((it) => it.face).map((it) => it.id), voiceIds: items.filter((it) => it.voice).map((it) => it.id) });
        });
    });
    r.versions = { os: 'Release-13.0.0-20190225', services: 'Release-13.0.5', beam: '13.0.10' };
    return r;
}

function listen (server) { return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server.address().port))); }

function start (r, peers) {
    return listen(r.helper).then((helperPort) => {
        r.sync = jibosync.create({
            people: r.people, jibo: () => r.jibo, helperPort: helperPort, udpPort: 0, robotId: r.name, now: () => clock,
            statePath: path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'jibosync-state-')), 'jibosync.json'),
            versions: () => r.versions, discover: () => Promise.resolve(peers())
        });
        r.beacon = http.createServer((req, res) => {
            const u = url.parse(req.url, true);
            const p = u.pathname === '/api/jibosync/info' ? r.sync.info() : r.sync.person(u.query.id);
            p.then((d) => { res.writeHead(200); res.end(JSON.stringify(d)); }, (e) => { res.writeHead(500); res.end(JSON.stringify({ error: e.message })); });
        });
        return listen(r.beacon).then((port) => { r.port = port; });
    });
}

const DAY = 86400000;
const A = robot('A', [{ id: 'jibo', isJibo: true }, { id: 'ph', firstName: 'FirstName', lastName: 'LastName', type: 'owner', status: 'accepted', created: clock - DAY }]);
const B = robot('B', [
    { id: 'jibo', isJibo: true },
    { id: 'zane-b', firstName: 'Zane', lastName: 'V', gender: 'other', type: 'owner', status: 'accepted', phoneticName: 'zayn', created: clock - 90 * DAY },
    { id: 'mom-b', firstName: 'Mom', lastName: 'V', type: 'member', status: 'accepted', created: clock - 90 * DAY }
], { 'zane-b': { face: clock - 10 * DAY, voice: clock - 9 * DAY } });
B.photos['zane-b'] = 'jpeg bytes';
const peerB = () => [{ robotId: 'B', address: '127.0.0.1', port: B.port }];

Promise.all([start(A, peerB), start(B, () => [])]).then(() => A.sync.sync('test')).then((last) => {
    assert.deepStrictEqual(last.errors, [], 'a build that worked counts, whatever the reply');
    assert.deepStrictEqual(last.robots.map((x) => [x.robotId, x.status]), [['B', 'synced']]);
    const zane = A.members.filter((m) => m.firstName === 'Zane')[0];
    assert.ok(zane && A.members.some((m) => m.firstName === 'Mom'), 'both people added');
    assert.ok(!A.members.some((m) => m.id === 'ph'), 'placeholder removed');
    assert.strictEqual(zane.type, 'owner', "B's owner is A's owner");
    assert.strictEqual(zane.phoneticName, 'zayn');
    assert.deepStrictEqual(zane.enrolled, { face: true, voice: true }, 'enrollment shows in People');
    assert.strictEqual(A.photos[zane.id], 'jpeg bytes');
    assert.strictEqual(A.faces[zane.id].blob, 'face of zane-b');
    assert.strictEqual(A.voices[zane.id].blob, 'voice of zane-b', 'voice model built from the staged recordings');
    assert.deepStrictEqual(A.calls.filter((c) => /^(import|voice model|face flag|voice flag|owner|remove)/.test(c)).sort(),
        ['import ' + zane.id + '<zane-b', 'face flag ' + zane.id, 'voice model ' + zane.id, 'voice flag ' + zane.id, 'owner ' + zane.id, 'remove ph'].sort());
    assert.ok(A.calls.indexOf('owner ' + zane.id) < A.calls.indexOf('remove ph'), 'the placeholder hands over ownership before it is removed');
    assert.ok(A.calls.indexOf('voice model ' + zane.id) < A.calls.indexOf('voice done ' + zane.id), 'recordings are kept once the model is built');
    assert.strictEqual(last.imported, 2);

    // Nothing changed: the next sync does nothing.
    A.calls = [];
    clock += 4 * 3600 * 1000 + 1;
    return A.sync.sync('again');
}).then((last) => {
    assert.deepStrictEqual([last.imported, last.removed, A.calls], [0, 0, []]);

    // Mom enrolls her face and voice on B: A picks them up into its own Mom.
    B.faces['mom-b'] = { examples: 5, last: clock, blob: 'face of mom-b' };
    B.voices['mom-b'] = { stamp: clock, blob: 'voice of mom-b' };
    clock += 1000;
    return A.sync.sync('mom enrolled');
}).then((last) => {
    assert.deepStrictEqual(last.errors, []);
    const momA = A.members.filter((m) => m.firstName === 'Mom')[0].id;
    assert.strictEqual(A.faces[momA].blob, 'face of mom-b');
    assert.strictEqual(A.voices[momA].blob, 'voice of mom-b');
    // Mom is removed on B; B notices, and A removes her on its next sync: face, voice and KB.
    A.stubborn[momA] = true;
    A.calls = [];
    B.members = B.members.filter((m) => m.id !== 'mom-b');
    delete B.faces['mom-b']; delete B.voices['mom-b'];
    clock += 1000;
    return B.sync.check();
}).then(() => {
    assert.ok(B.sync._state().tombstones['mom v'], 'B remembers the removal');
    clock += 60000;
    return A.sync.sync('after removal');
}).then((last) => {
    assert.ok(!A.members.some((m) => m.firstName === 'Mom'), 'removed on A too');
    assert.deepStrictEqual(last.errors, []);
    const momId = A.calls.filter((c) => /^face removed /.test(c))[0].slice('face removed '.length);
    assert.ok(!A.speakers[momId] && !A.voices[momId] && !A.faces[momId], 'face and voice gone too');
    assert.deepStrictEqual(A.calls.filter((c) => /voice removed|pending removed|voice gone/.test(c)),
        ['voice removed ' + momId, 'voice removed ' + momId, 'pending removed ' + momId, 'voice gone ' + momId], 'a stubborn removal is retried, then cleaned up');
    assert.strictEqual(last.removed, 1);

    // A different version on B: A lists it but syncs nothing.
    B.versions = { os: 'Release-13.0.0-20190225', services: 'Release-13.0.6', beam: '13.0.10' };
    B.members.push({ id: 'new-b', firstName: 'New', lastName: 'Person', type: 'member', status: 'accepted', created: clock });
    return A.sync.sync('versions');
}).then((last) => {
    assert.deepStrictEqual(last.robots.map((x) => [x.robotId, x.status]), [['B', 'different version']]);
    assert.ok(!A.members.some((m) => m.firstName === 'New'));
    assert.strictEqual(last.imported, 0);
    [A, B].forEach((r) => { r.helper.close(); r.beacon.close(); });
    console.log('jibosync two robots ok');
}).catch((err) => { console.error(err); process.exit(1); });
