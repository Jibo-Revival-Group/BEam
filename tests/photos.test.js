'use strict';
// BEacon's photo list must be exactly what Jibo's Gallery shows (KB media list), not whatever JPEGs are on disk.
const assert = require('assert'), fs = require('fs'), os = require('os'), path = require('path'), Module = require('module');

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'beacon-photos-'));
const id = (n) => n + '0000000-0000-4000-8000-000000000000';
[1, 2, 3, 4].forEach((n) => fs.writeFileSync(path.join(dir, id(n) + '.jpg'), 'x'));
process.env.BEACON_PHOTOS_DIR = dir;

const node = (n, type, created, edges) => ({ _id: id(n), edges: edges, data: { type: type, created: created } });
const fakeJibo = { kb: { media: { MediaType: { image: 'image' }, loadMedia: () => Promise.resolve([
    node(1, 'image', 10, {}),
    node(2, 'image', 30, {}),
    node(3, 'thumb', 20, {}),
    node(4, 'image', 40, undefined)   // dropped from the Gallery (no edges)
]) } } };
const load = Module._load;
Module._load = function (request) { return request === 'jibo' ? fakeJibo : load.apply(this, arguments); };
const paths = require('../@be/be/beacon/lib/paths');
if (paths.photosDir() !== dir) { paths.photosDir = () => dir; }
const photos = require('../@be/be/beacon/lib/photos');

photos.scan().then((result) => {
    assert.deepStrictEqual(result.photos.map((p) => p.id), [id(2), id(1)],
        'only Gallery photos, newest first; thumbnails and unlinked files on disk are left out');
    assert(result.photos.every((p) => p.available));
    fakeJibo.kb.media.loadMedia = () => Promise.resolve([]);
    return photos.scan();
}).then((result) => {
    assert.deepStrictEqual(result.photos, [], 'an empty Gallery means no photos, even with JPEGs on disk');
    // Images come from the media service URL the Gallery uses, not the (root-only) file on disk.
    return new Promise((resolve) => {
        const http = require('http');
        const media = http.createServer((req, res) => {
            if (req.url === '/photo?id=' + id(1)) { res.writeHead(200); res.end('JPEGBYTES'); } else { res.writeHead(404); res.end(); }
        }).listen(0, '127.0.0.1', () => {
            fakeJibo.media = { getUrl: (pid) => 'http://127.0.0.1:' + media.address().port + '/photo?id=' + pid };
            const beacon = http.createServer((req, res) => photos.serve(req, res, req.url.slice(1), false)).listen(0, '127.0.0.1', () => {
                const get = (pid) => new Promise((done) => http.get('http://127.0.0.1:' + beacon.address().port + '/' + pid, (r) => {
                    let body = ''; r.on('data', (c) => { body += c; }); r.on('end', () => done([r.statusCode, r.headers['content-type'], body]));
                }));
                get(id(1)).then((ok) => {
                    assert.deepStrictEqual(ok, [200, 'image/jpeg', 'JPEGBYTES']);
                    return get(id(2));
                }).then((missing) => {
                    assert.strictEqual(missing[0], 404);
                    media.close(); beacon.close(); resolve();
                });
            });
        });
    });
}).then(() => {
    console.log('photos tests passed');
});
