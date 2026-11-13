'use strict';
// In Be the loop KB lives behind the robot's KB service, so a person's photo asset is an http://127.0.0.1 URL.
// BEacon (and JiboSync, which sends photos to other robots) must read it from there, not look for a file.
const assert = require('assert');
const http = require('http');
const Module = require('module');

const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3]);
const server = http.createServer((req, res) => {
    if (req.url === '/v1/kb/jibo%2Floop/asset/zane.photo.jpg') { res.writeHead(200, { 'Content-Type': 'image/jpeg' }); res.end(jpeg); }
    else { res.writeHead(404); res.end(); }
});
server.listen(0, '127.0.0.1', () => {
    const base = 'http://127.0.0.1:' + server.address().port + '/v1/kb/jibo%2Floop/asset/';
    const person = (id, file) => ({ id: id, data: { firstName: id, type: 'member' },
        getAssets: () => (file ? [{ fullFilenameOrURL: () => base + file }] : []) });
    const nodes = { zane: person('zane', 'zane.photo.jpg'), gone: person('gone', 'gone.photo.jpg'), none: person('none', null) };
    const fakeJibo = { kb: { onInit: () => Promise.resolve(), loop: {
        getUserNodeById: (id, cb) => cb(null, nodes[id] || null),
        loadRoot: (cb) => cb(null, { data: { id: 'loop' } }),
        loadLoop: (cb) => cb(null, Object.keys(nodes).map((k) => nodes[k]))
    } } };
    const load = Module._load;
    Module._load = function (request) { return request === 'jibo' ? fakeJibo : load.apply(this, arguments); };
    const people = require('../@be/be/beacon/lib/people');

    people.readPhoto('zane').then((buf) => {
        assert.ok(buf.equals(jpeg), 'the photo comes from the KB service');
        return people.readPhoto('gone').then(() => assert.fail('a missing photo was returned'), (err) => assert.strictEqual(err.status, 404));
    }).then(() => people.readPhoto('none').then(() => assert.fail('no photo was returned'), (err) => assert.strictEqual(err.status, 404)))
    .then(() => people.list()).then((snapshot) => {
        assert.deepStrictEqual(snapshot.members.map((m) => m.hasPhoto), [true, true, false]);
        console.log('PASS People reads photos from the KB service');
        server.close();
    }).catch((err) => { console.error(err); process.exit(1); });
});
