'use strict';
// JiboSync between two simulated robots over real HTTP: robot A (new, placeholder owner) adds robot B to its cluster
// and pulls B's household and report settings; a robot whose loop is cleared doesn't empty the other.
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
    const r = { name: name, members: members, faces: {}, voices: {}, photos: {}, calls: [], settings: {}, cloudDown: false };
    Object.keys(enrolled || {}).forEach((id) => {
        if (enrolled[id].face) r.faces[id] = { examples: 5, last: enrolled[id].face, blob: 'face of ' + id };
        if (enrolled[id].voice) r.voices[id] = { stamp: enrolled[id].voice, blob: 'voice of ' + id };
    });
    const find = (id) => r.members.filter((m) => m.id === id)[0];
    r.people = {
        list: () => Promise.resolve({ members: r.members.map((m) => Object.assign({ hasPhoto: !!r.photos[m.id] }, m)) }),
        findMember: (id) => Promise.resolve({ member: find(id) }),
        readPhoto: (id) => (r.photos[id] ? Promise.resolve(Buffer.from(r.photos[id])) : Promise.reject(new Error('no photo'))),
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
    // Report settings as BEefy keeps them per robot (BEacon's calendars/commute/news-topics modules).
    r.settingsDep = {
        read: () => (r.cloudDown ? Promise.reject(new Error('cloud down')) : Promise.resolve(JSON.parse(JSON.stringify(r.settings)))),
        write: (id, field, v) => { r.calls.push('setting ' + field + ' ' + id); r.settings[id] = r.settings[id] || {}; r.settings[id][field] = v; return Promise.resolve(); }
    };
    return r;
}

function listen (server) { return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server.address().port))); }

function start (r, peers) {
    return listen(r.helper).then((helperPort) => {
        r.sync = jibosync.create({
            people: r.people, jibo: () => r.jibo, helperPort: helperPort, udpPort: 0, robotId: r.name, now: () => clock,
            statePath: path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'jibosync-state-')), 'jibosync.json'),
            versions: () => r.versions, discover: () => Promise.resolve(peers()), settings: r.settingsDep
        });
        // BEacon's peer routes (server.js): reads need this robot's cluster id.
        r.beacon = http.createServer((req, res) => {
            const u = url.parse(req.url, true);
            let body = '';
            req.on('data', (d) => { body += d; });
            req.on('end', () => {
                const cluster = req.headers[jibosync.CLUSTER_HEADER];
                const p = Promise.resolve().then(() => {
                    if (u.pathname === '/api/jibosync/join') return r.sync.join(JSON.parse(body));
                    if (u.pathname === '/api/jibosync/leave') return r.sync.leave();
                    r.sync.requireCluster(cluster);
                    return u.pathname === '/api/jibosync/info' ? r.sync.info() : r.sync.person(u.query.id);
                });
                p.then((d) => { res.writeHead(200); res.end(JSON.stringify(d)); }, (e) => { res.writeHead(e.status || 500); res.end(JSON.stringify({ error: e.message })); });
            });
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
B.settings['zane-b'] = { calendar: { url: 'https://calendar.example/zane.ics', enabled: true }, work: '1 Main St, Boston, MA', news: ['sports'] };
const peerB = () => [{ robotId: 'B', address: '127.0.0.1', port: B.port }];
const peerA = () => [{ robotId: 'A', address: '127.0.0.1', port: A.port }];
const get = (r, p, cluster) => new Promise((resolve) => http.get({ host: '127.0.0.1', port: r.port, path: p, headers: cluster ? { [jibosync.CLUSTER_HEADER]: cluster } : {} },
    (res) => { res.resume(); resolve(res.statusCode); }));

Promise.all([start(A, peerB), start(B, peerA)]).then(() => A.sync.sync('before a cluster')).then((last) => {
    // Not in a cluster: B is listed to add, nothing syncs, and B's people can't be read.
    assert.deepStrictEqual(last.robots.map((x) => [x.robotId, x.status]), [['B', 'not in cluster']]);
    assert.ok(A.members.some((m) => m.id === 'ph') && !A.members.some((m) => m.firstName === 'Zane'), 'nothing synced');
    return get(B, '/api/jibosync/info').then((code) => { assert.strictEqual(code, 403, 'B refuses reads from outside its cluster'); });
}).then(() => A.sync.add('B')).then(() => {
    assert.ok(A.sync._state().cluster && B.sync._state().cluster.id === A.sync._state().cluster.id, 'Add sends A\'s new cluster id to B');
    return get(B, '/api/jibosync/info', 'f'.repeat(32)).then((code) => assert.strictEqual(code, 403, 'a different cluster id is refused'));
}).then(() => A.sync.sync('test')).then((last) => {
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
    assert.deepStrictEqual(A.settings[zane.id], { calendar: { url: 'https://calendar.example/zane.ics', enabled: true }, work: '1 Main St, Boston, MA', news: ['sports'] },
        "Zane's calendar, work address and news topics came along");
    assert.strictEqual(last.settings, 3);

    // Nothing changed: the next sync does nothing.
    A.calls = [];
    clock += 4 * 3600 * 1000 + 1;
    return A.sync.sync('again');
}).then((last) => {
    assert.deepStrictEqual([last.imported, last.removed, A.calls], [0, 0, []]);

    // Zane changes jobs on A: A's newer address wins on B.
    const zaneA = A.members.filter((m) => m.firstName === 'Zane')[0].id;
    A.settings[zaneA].work = '2 Park Ave, Boston, MA';
    clock += 60000;
    return A.sync.check().then(() => { clock += 60000; return B.sync.sync('A changed'); });
}).then((last) => {
    assert.deepStrictEqual(last.errors, []);
    assert.strictEqual(B.settings['zane-b'].work, '2 Park Ave, Boston, MA', 'the newest change wins');
    assert.strictEqual(B.settings['zane-b'].calendar.url, 'https://calendar.example/zane.ics', 'nothing else changed');
    // B's cloud is unreachable: its settings aren't read as "all empty", so A clears nothing.
    B.cloudDown = true;
    clock += 60000;
    return A.sync.sync('B cloud down');
}).then((last) => {
    B.cloudDown = false;
    const zaneA = A.members.filter((m) => m.firstName === 'Zane')[0].id;
    assert.deepStrictEqual([last.errors, A.settings[zaneA].work], [[], '2 Park Ave, Boston, MA'], 'A keeps its own newer address');

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

    // B's loop is cleared (everyone removed at once): B passes on no removals, A keeps its people,
    // and B gets them back from A.
    const before = A.members.map((m) => m.firstName).sort();
    const saved = B.members.filter((m) => !m.isJibo);
    B.members = B.members.filter((m) => m.isJibo);
    clock += 1000;
    return B.sync.check().then(() => {
        assert.deepStrictEqual(Object.keys(B.sync._state().tombstones).filter((k) => k !== 'mom v'), [], 'clearing the loop is not a removal');
        clock += 60000;
        return A.sync.sync('B cleared');
    }).then((last) => {
        assert.deepStrictEqual(A.members.map((m) => m.firstName).sort(), before, 'A keeps everyone');
        assert.strictEqual(last.removed, 0);
        clock += 60000;
        return B.sync.sync('refill');
    }).then(() => {
        assert.ok(B.members.some((m) => m.firstName === 'Zane'), 'B gets its people back from A');
        assert.ok(saved.length);
    });
}).then(() => {
    // A different version on B: A lists it but syncs nothing.
    B.versions = { os: 'Release-13.0.0-20190225', services: 'Release-13.0.6', beam: '13.0.10' };
    B.members.push({ id: 'new-b', firstName: 'New', lastName: 'Person', type: 'member', status: 'accepted', created: clock });
    return A.sync.sync('versions');
}).then((last) => {
    assert.deepStrictEqual(last.robots.map((x) => [x.robotId, x.status]), [['B', 'different version']]);
    assert.ok(!A.members.some((m) => m.firstName === 'New'));
    assert.strictEqual(last.imported, 0);
    // B leaves the cluster: A lists it as a robot to add again.
    return B.sync.leave();
}).then(() => A.sync.sync('B left')).then((last) => {
    assert.deepStrictEqual(last.robots.map((x) => [x.robotId, x.status]), [['B', 'not in cluster']]);
    [A, B].forEach((r) => { r.helper.close(); r.beacon.close(); });
    console.log('jibosync two robots ok: cluster, people, report settings, empty loop');
}).catch((err) => { console.error(err); process.exit(1); });
