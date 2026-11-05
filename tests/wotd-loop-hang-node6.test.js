'use strict';
// Word of the Day must finish postInit even when the loop never loads. jibo-kb's loadLoop() never settles when the
// loop root lists a user node that is gone, or there is no loop root (both left behind by Knowledge damage), and
// BEam waits for postInit before it opens a skill, so the skill never launched on those robots.
var assert = require('assert');
var fs = require('fs');
var path = require('path');
var source = fs.readFileSync(path.join(__dirname, '../@be/be/skills/word-of-the-day/index.js'), 'utf8');
var start = source.indexOf('"use strict";', source.indexOf('4:[function(require,module,exports){'));
var end = source.indexOf('exports.default = WordOfTheDay;', start) + 'exports.default = WordOfTheDay;'.length;
assert(start > 0 && end > start);

function load(loadLoop) {
    var root = { data: {} };
    var model = { loadRoot: function () { return Promise.resolve(root); }, createModel: function () { return model; } };
    var deps = {
        jibo: { kb: { createModel: function () { return model; }, loop: { loadLoop: loadLoop } } },
        '@be/be-framework': { libraries: { jibo_cai_utils: {} } },
        '@be/surprises': { SurpriseElement: class { constructor() { this.log = { error: function () {}, warn: function () {}, info: function () {} }; } } }
    };
    var mod = { exports: {} };
    new Function('require', 'module', 'exports', source.slice(start, end))(function (n) { return deps[n] || {}; }, mod, mod.exports);
    return new mod.exports.default('word-of-the-day');
}

function postInit(skill, ms) {
    return new Promise(function (resolve) {
        var timer = setTimeout(function () { resolve(false); }, ms);
        skill.postInit(function () { clearTimeout(timer); resolve(true); });
    });
}

(function () {
    var healthy = load(function () { return Promise.resolve([{ isJibo: false }, { isJibo: true, created: 1552837451637 }]); });
    return postInit(healthy, 1000).then(function (done) {
        assert(done, 'postInit finishes with a healthy loop');
        assert.strictEqual(healthy._jiboBirthday, 1552837451637);
        assert(healthy._mainRoot, 'the main KB root is loaded');

        var stuck = load(function () { return new Promise(function () {}); });
        return postInit(stuck, 4000).then(function (doneStuck) {
            assert(doneStuck, 'postInit finishes when the loop never loads');
            assert.strictEqual(stuck._jiboBirthday, 0);
            assert(stuck._mainRoot, 'the main KB root is still loaded, so open() works');

            var noLoop = load(function () { return Promise.resolve(null); });
            return postInit(noLoop, 1000).then(function (doneNull) {
                assert(doneNull, 'postInit finishes when the loop comes back empty');
                console.log('word-of-the-day loop ok');
            });
        });
    });
})().catch(function (err) { console.error(err); process.exit(1); });
