'use strict';
var assert = require('assert');
var fs = require('fs');
var os = require('os');
var path = require('path');
var runtime = require('../@be/be/runtime-state');
var root = fs.mkdtempSync(path.join(os.tmpdir(), 'beam-runtime-'));
function remove(dir) {
    if (fs.statSync(dir).isDirectory()) {
        fs.readdirSync(dir).forEach(function (name) { remove(path.join(dir, name)); });
        fs.rmdirSync(dir);
    } else { fs.unlinkSync(dir); }
}
try {
    var benchHelper = path.resolve(__dirname, '../../BEnch/usr/local/lib/jibo/runtime-state.js');
    if (fs.existsSync(benchHelper)) {
        assert.strictEqual(fs.readFileSync(benchHelper, 'utf8'), fs.readFileSync(path.join(__dirname, '../@be/be/runtime-state.js'), 'utf8'));
    }
    runtime.ensure({ root: root, service: 'beam', credentials: false });
    assert(!fs.existsSync(root + '/var/jibo/credentials.json'));
    var data = root + '/opt/jibo/Knowledge/beacon';
    assert.strictEqual(JSON.parse(fs.readFileSync(data + '/units.json')).temperature, 'fahrenheit');
    assert(!fs.existsSync(data + '/homeassistant.json'));
    assert(!fs.existsSync(data + '/eye/custom.png'), 'Built-in eye remains the fallback');
    assert.deepEqual(fs.readdirSync(root + '/opt/jibo/Knowledge/jukebox/music'), []);
    fs.writeFileSync(data + '/units.json', '{"temperature":"celsius","extra":true}');
    fs.writeFileSync(data + '/eye/custom.png', 'custom eye');
    fs.rmdirSync(data + '/themes');
    runtime.beamData(data);
    assert(fs.statSync(data + '/themes').isDirectory());
    assert.strictEqual(JSON.parse(fs.readFileSync(data + '/units.json')).extra, true);
    assert.strictEqual(fs.readFileSync(data + '/eye/custom.png', 'utf8'), 'custom eye');
    fs.writeFileSync(data + '/units.json', '{bad');
    runtime.beamData(data); // a damaged units.json is left alone and read as the default
    assert.strictEqual(fs.readFileSync(data + '/units.json', 'utf8'), '{bad');
    fs.writeFileSync(root + '/file', 'existing data');
    assert.throws(function () { runtime.directory(root + '/file'); }, /Expected directory/);
    var html = fs.readFileSync(path.join(__dirname, '../@be/be/index.html'), 'utf8');
    assert(html.indexOf("require('./runtime-state')") < html.indexOf("require('./skills-resolve')"));
    var entry = fs.readFileSync(path.join(__dirname, '../@be/be/index.js'), 'utf8');
    assert(entry.indexOf("require('./runtime-state')") < entry.indexOf("require('./lib/Be')"));
    console.log('BEam standalone defaults, repair, preservation and early initialization passed');
} finally { remove(root); }
