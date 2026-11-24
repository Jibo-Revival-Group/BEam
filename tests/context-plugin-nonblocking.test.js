'use strict';
// Be's context plugin must not hold up boot while the context service registers (up to ~6 s at boot):
// BeSkill.init finishes before registration does, and a failed registration doesn't stop Be.
var assert = require('assert'), fs = require('fs'), path = require('path');
var src = fs.readFileSync(path.join(__dirname, '../@be/be/skills/be-framework/lib/be-framework.js'), 'utf8');
var start = src.indexOf("BeSkill_1.default.registerPlugin('context',");
var end = src.slice(start).search(/\n\}\)?\);\n/); var body = src.slice(start, start + end + src.slice(start + end).indexOf(';') + 1);
var pending = [], logged = [], registered;
var instance = { name: 'context' };
var ContextService_1 = { ContextService: { instance: instance, createInstance: function () {
    return { init: function (cb) { pending.push(cb); } };
} } };
var BeSkill_1 = { default: { registerPlugin: function (name, plugin) { registered = plugin; } } };
var jibo = { runMode: 'robot', RunMode: { ON_ROBOT: 'robot' } };
var log = { info: function (m) { logged.push(m); }, error: function (m) { logged.push(m); } };
function prify(fn) { return new Promise(function (res, rej) { fn(function (err, v) { if (err) { rej(err); } else { res(v); } }); }); }
new Function('BeSkill_1', 'ContextService_1', 'jibo', 'log', 'prify', '__awaiter', body)(BeSkill_1, ContextService_1, jibo, log, prify,
    function (t, a, P, g) { return new Promise(function (res, rej) { var it = g.call(t); function step(r) { if (r.done) { res(r.value); } else { Promise.resolve(r.value).then(function (v) { step(it.next(v)); }, function (e) { step(it.throw(e)); }); } } step(it.next()); }); });
var result;
new Promise(registered).then(function (v) { result = v; });
setTimeout(function () {
    assert.strictEqual(result, instance, 'plugin is ready before registration finishes');
    assert.strictEqual(pending.length, 1, 'registration still started');
    pending[0](new Error('registry down'));
    setTimeout(function () {
        assert.deepStrictEqual(logged, ['Could not initialize ContextService'], 'a failed registration is only logged');
        console.log('context plugin does not hold up boot');
    }, 10);
}, 10);
