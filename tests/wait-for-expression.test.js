'use strict';
// Be waits for expression's registry record before jibo.init (which fails without it), and gives up after the timeout.
var assert = require('assert'), http = require('http'), fs = require('fs'), path = require('path');
var waitForRecord = require('../@be/be/lib/wait-for-record');
var calls = 0;
var server = http.createServer(function (req, res) {
    calls++;
    if (calls === 1) { res.statusCode = 500; return res.end('busy'); }
    res.end(JSON.stringify({ records: calls >= 3 ? [{ name: 'lps' }, { name: 'expression' }] : [{ name: 'lps' }] }));
});
server.listen(0, '127.0.0.1', function () {
    var url = 'http://127.0.0.1:' + server.address().port + '/registry';
    waitForRecord('expression', { url: url, intervalMs: 10 }, function (err) {
        assert.ifError(err);
        assert.strictEqual(calls, 3, 'polled until expression was registered');
        waitForRecord('nope', { url: url, intervalMs: 10, timeoutMs: 100 }, function (err2) {
            assert(err2 && /timed out/.test(err2.message), 'gives up after the timeout');
            server.close();
            var be = fs.readFileSync(path.join(__dirname, '../@be/be/lib/Be.js'), 'utf8');
            assert(/waitForExpression\(\(\) => jibo\.init\(/.test(be), 'Be waits before jibo.init');
            console.log('Be waits for expression before jibo.init');
        });
    });
});
