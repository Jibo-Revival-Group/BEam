'use strict';
// A corrupt or empty units.json falls back to defaults instead of stopping Be at boot,
// and units.set publishes the file atomically (temp file + rename).
var assert = require('assert');
var fs = require('fs');
var os = require('os');
var path = require('path');
var runtime = require('../@be/be/runtime-state');
var paths = require('../@be/be/beacon/lib/paths');
var dir = fs.mkdtempSync(path.join(os.tmpdir(), 'beam-units-'));
paths.dataDir = function () { return dir; };
var units = require('../@be/be/beacon/lib/units');
var file = path.join(dir, 'units.json');

['', '{"temperature":', '[]', '{"temperature":"kelvin"}'].forEach(function (bad) {
    fs.writeFileSync(file, bad);
    runtime.beamData(dir);
    assert.strictEqual(units.get().temperature, 'fahrenheit', 'falls back for ' + JSON.stringify(bad));
});

var writes = [], renames = [], realWrite = fs.writeFileSync, realRename = fs.renameSync;
fs.writeFileSync = function (target) { writes.push(target); return realWrite.apply(fs, arguments); };
fs.renameSync = function (from, to) { renames.push([from, to]); return realRename.apply(fs, arguments); };
units.set('celsius');
fs.writeFileSync = realWrite; fs.renameSync = realRename;
assert.strictEqual(writes.indexOf(file), -1, 'units.json is never written in place');
assert.deepStrictEqual(renames, [[writes[0], file]]);
assert.strictEqual(units.get().temperature, 'celsius');
assert.deepStrictEqual(fs.readdirSync(dir).filter(function (n) { return /^units/.test(n); }), ['units.json']);
console.log('PASS corrupt units.json falls back at boot; units.set writes atomically');
