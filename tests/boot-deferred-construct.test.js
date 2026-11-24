'use strict';
// Building clock and settings (~1.9 s on Jibo) must not hold up the first skill: Be starts them after the first
// skill has opened (or after a fallback delay), only once, and still builds asked-for skills on demand.
var assert = require('assert'), fs = require('fs'), path = require('path');
var src = fs.readFileSync(path.join(__dirname, '../@be/be/lib/Be.js'), 'utf8');
function method(name) {
    var start = src.indexOf('\n    ' + name + '(');
    assert(start >= 0, name);
    var end = src.indexOf('\n    }\n', start);
    return src.slice(start, end);
}
var initPlugins = method('initPlugins');
assert(!/^\s*this\._startBackgroundConstructs\(\);/m.test(initPlugins), 'initPlugins no longer builds clock/settings right away');
assert(/setTimeout\(\(\) => this\._startBackgroundConstructs\(\), BACKGROUND_CONSTRUCT_FALLBACK_MS\)/.test(initPlugins), 'fallback timer');
assert(/first skill opened'\);\s*setTimeout\(\(\) => this\._startBackgroundConstructs\(\)/.test(method('launchFirstSkill')), 'built after the first skill opened');

// Run _startBackgroundConstructs for real: once only, and skills that already exist are not rebuilt.
var body = method('_startBackgroundConstructs').replace(/^\s*_startBackgroundConstructs\(\) \{/, '');
var built = [], timers = [];
var fake = { skills: { '@be/clock': {} }, _postInitById: { '@be/clock': 1 }, _postInitsArmed: true,
    log: { info: function () {}, error: function (m, e) { throw e; } },
    ensureSkill: function (id) { built.push(id); this.skills[id] = {}; }, _startSkillPostInit: function () {} };
var run = new Function('BACKGROUND_CONSTRUCT', 'setTimeout', body).bind(fake,
    { '@be/clock': true, '@be/settings': true }, function (f) { timers.push(f); });
run(); run();
timers.forEach(function (f) { f(); });
assert.deepStrictEqual(built, ['@be/settings']);
assert.strictEqual(timers.length, 2, 'second call did nothing');
console.log('clock/settings are built after the first skill opens, once');
