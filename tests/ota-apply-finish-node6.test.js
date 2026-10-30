'use strict';
// ota.apply must call its callback exactly once and release the in-flight lock.
var assert = require('assert');
var paths = require('../@be/be/beacon/lib/paths');
paths.onRobot = function () { return true; };
var ota = require('../@be/be/beacon/lib/ota');
var request = { id: 'x', url: 'http://h/x.tar', shaHash: 'ab', subsystem: '@nope/missing' };
var calls = [];
ota.apply(request, null, function (err) { calls.push(err); });
ota.apply(request, null, function (err) { calls.push(err); });
setTimeout(function () {
    assert.strictEqual(calls.length, 2, 'each apply calls back exactly once');
    calls.forEach(function (err) { assert(err && err.status !== 409, 'lock released: ' + (err && err.message)); });
    console.log('PASS ota.apply calls back once and releases its lock');
}, 50);
