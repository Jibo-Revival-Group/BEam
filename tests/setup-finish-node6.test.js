'use strict';
// POST /api/setup/finish only clears the marker and reboots while setup is pending.
var assert = require('assert');
var fs = require('fs');
var cp = require('child_process');
var MARKER = '/var/jibo/beetle-setup.json';
var marker = null, writes = [], spawns = [];
var realRead = fs.readFileSync, realWrite = fs.writeFileSync;
fs.readFileSync = function (file) {
    if (file === MARKER) { if (marker === null) { throw new Error('ENOENT'); } return marker; }
    return realRead.apply(fs, arguments);
};
fs.writeFileSync = function (file, data) {
    if (file === MARKER) { writes.push(data); marker = data; return; }
    return realWrite.apply(fs, arguments);
};
cp.spawn = function (cmd) { spawns.push(cmd); return { on: function () {}, unref: function () {} }; };
var setup = require('../@be/be/beacon/lib/setup');

[null, '{"pending":false}'].forEach(function (value) {
    marker = value;
    assert.throws(function () { setup.finish(); }, function (err) { return err.status === 409; });
    assert.deepStrictEqual(writes, []);
    assert.deepStrictEqual(spawns, []);
});
marker = '{"pending":true}';
assert.strictEqual(setup.finish().pending, false);
assert.strictEqual(JSON.parse(writes[0]).pending, false);
assert.deepStrictEqual(spawns, ['/sbin/reboot']);
assert.throws(function () { setup.finish(); }, /not pending/, 'a second finish does not reboot again');
assert.strictEqual(spawns.length, 1);
console.log('PASS setup finish reboots only while setup is pending');
