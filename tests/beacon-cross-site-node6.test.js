'use strict';
// BEacon must not be drivable cross-site: no ACAO *, no approved preflights, and a
// non-GET/HEAD request whose Origin (or Referer) names another host gets 403.
var assert = require('assert');
var http = require('http');
var server = require('../@be/be/beacon/server').create();

function send(method, headers) {
    return new Promise(function (resolve, reject) {
        var req = http.request({ host: '127.0.0.1', port: server.address().port, path: '/api/no-such-endpoint', method: method, headers: headers },
            function (res) { res.resume(); res.on('end', function () { resolve(res); }); });
        req.on('error', reject); req.end();
    });
}

server.listen(0, '127.0.0.1', function () {
    var host = '127.0.0.1:' + server.address().port, self = 'http://' + host;
    var cases = [
        ['POST', { Origin: 'http://evil.example' }, 403],
        ['DELETE', { Origin: 'http://evil.example' }, 403],
        ['POST', { Origin: 'null' }, 403],
        ['POST', { Referer: 'http://evil.example/page' }, 403],
        ['POST', { Origin: 'http://' + host + '.evil.example' }, 403],
        ['OPTIONS', { Origin: 'http://evil.example', 'Access-Control-Request-Method': 'POST' }, 403],
        ['POST', { Origin: self }, 404],
        ['POST', { Referer: self + '/' }, 404],
        ['POST', {}, 404],
        ['GET', { Origin: 'http://evil.example' }, 404]
    ];
    cases.reduce(function (chain, c) {
        return chain.then(function () { return send(c[0], c[1]); }).then(function (res) {
            assert.strictEqual(res.statusCode, c[2], c[0] + ' ' + JSON.stringify(c[1]));
            assert.strictEqual(res.headers['access-control-allow-origin'], undefined, 'no ACAO header');
        });
    }, Promise.resolve()).then(function () {
        console.log('PASS cross-site requests are refused; same-origin and non-browser clients still work');
        server.close();
    }).catch(function (err) { console.error(err); process.exit(1); });
});
