'use strict';
// Music must open again after a failed close, and a re-open must not be dropped
// when video teardown errors.
var assert = require('assert');
var fs = require('fs');
var path = require('path');
var vm = require('vm');
var root = path.resolve(__dirname, '../@be/be/skills/music');
function load(file, overrides) {
    var module = { exports: {} };
    var factory = vm.runInThisContext('(function(require,module,exports,__dirname){' + fs.readFileSync(path.join(root, file), 'utf8') + '\n})');
    factory(function (n) { return Object.prototype.hasOwnProperty.call(overrides, n) ? overrides[n] : require(n[0] === '.' ? path.resolve(root, n) : n); },
        module, module.exports, root);
    return module.exports;
}
var created = 0, closeFails = false, videoFails = false, exits = 0;
var views = { createView: function () { created++; return { addAction: function () {} }; }, ActionData: {}, GESTURE: {}, TRANSITION: {}, changeView: function () {} };
var Skill = load('index.js', {
    jibo: { face: { views: views, tween: {} } },
    '@be/be-framework': { BeSkill: class { exit() { exits++; } } },
    './video': { shutdown: function () { return videoFails ? Promise.reject(new Error('decoder failed')) : Promise.resolve(); } },
    './service': { stop: function () { return Promise.resolve(); } },
    './ui': class { config() { return {}; } releaseArtwork() {} },
    './touch-lifecycle': { prepareView: function (v) { return v; },
        closeView: function (a, b, c, d, e, done) { done(closeFails ? new Error('music_view_transition_timeout') : null); } }
});
function later() { return new Promise(function (resolve) { setTimeout(resolve, 20); }); }

var a = new Skill();
a.open({});
closeFails = true;
new Promise(function (resolve) { a.close(resolve); }).then(function (err) {
    assert.strictEqual(err && err.message, 'music_view_transition_timeout');
    closeFails = false;
    a.open({});
    return later();
}).then(function () {
    assert.strictEqual(created, 2, 'open after a failed close creates a fresh view');
    assert(a.view, 'skill has a view');
    created = 0; videoFails = true;
    var b = new Skill();
    b.open({}); b.open({});
    return later().then(function () { return b; });
}).then(function (b) {
    assert.strictEqual(created, 2, 're-open is not dropped when video teardown errors');
    assert(b.view, 're-opened skill has a view');
    created = 0; videoFails = false; closeFails = true;
    var c = new Skill();
    c.open({}); c.open({});
    return later().then(function () { return c; });
}).then(function (c) {
    assert.strictEqual(created, 1);
    assert.strictEqual(exits, 1, 'a re-open whose stale view cannot close exits instead of sitting without UI');
    console.log('PASS music recovers from failed close and video teardown errors');
}).catch(function (err) { console.error(err); process.exit(1); });
