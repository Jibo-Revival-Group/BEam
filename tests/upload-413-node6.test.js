'use strict';
// An oversized upload gets the 413 "larger than N MB" JSON error, not a connection reset.
var assert = require('assert');
var http = require('http');
var server = require('../@be/be/beacon/server').create();
server.listen(0, '127.0.0.1', function () {
    var req = http.request({ host: '127.0.0.1', port: server.address().port, path: '/api/menu/icon', method: 'PUT',
        headers: { 'Content-Type': 'image/png' } }, function (res) {
        var body = ''; res.on('data', function (c) { body += c; });
        res.on('end', function () {
            assert.strictEqual(res.statusCode, 413);
            assert(/larger than the 2 MB limit/.test(JSON.parse(body).error), body);
            console.log('PASS oversized upload answers 413 with the size limit');
            server.close();
        });
    });
    req.on('error', function (err) { console.error('client error:', err.code || err.message); process.exit(1); });
    var chunk = new Buffer(256 * 1024), n = 0;
    (function write() {
        while (n < 12) { n++; if (!req.write(chunk)) { req.once('drain', write); return; } }
        req.end();
    })();
});
