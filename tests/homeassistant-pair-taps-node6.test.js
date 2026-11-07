'use strict';
// While Jibo asks "Home Assistant?", BEacon's remote screen taps are refused, so whoever started the
// pairing can't press Yes for the person standing at the robot.
var assert = require('assert');
var http = require('http');
var EventEmitter = require('events');

var view = new EventEmitter();
global.jibo = { face: { views: { createView: function () { return view; }, removeView: function () {} } } };
var server = require('../@be/be/beacon/server').create();

function post(path, body) {
    return new Promise(function (resolve, reject) {
        var req = http.request({ host: '127.0.0.1', port: server.address().port, path: path, method: 'POST',
            headers: { 'Content-Type': 'application/json' } }, function (res) {
            var data = '';
            res.on('data', function (d) { data += d; });
            res.on('end', function () { resolve({ status: res.statusCode, body: data }); });
        });
        req.on('error', reject);
        req.end(JSON.stringify(body));
    });
}

var tap = { type: 'tap', x: 900, y: 360 };
server.listen(0, '127.0.0.1', function () {
    var pairing = post('/api/homeassistant/pair', { haPort: 8123, webhookId: 'w', instanceId: 'i', mode: 'self' });
    setTimeout(function () {
        post('/api/screen/input', tap).then(function (res) {
            assert.strictEqual(res.status, 409, 'tap during pairing: ' + res.status + ' ' + res.body);
            view.emit('no');
            return pairing;
        }).then(function (res) {
            assert.strictEqual(res.status, 403, 'the robot answered No');
            return post('/api/screen/input', tap);
        }).then(function (res) {
            assert.notStrictEqual(res.status, 409, 'taps work again after the prompt');
            console.log('PASS screen taps are refused while a Home Assistant pairing prompt is open');
            server.close();
        }).catch(function (err) { console.error(err); process.exit(1); });
    }, 100);
});
