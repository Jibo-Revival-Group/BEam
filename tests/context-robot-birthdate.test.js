'use strict';
// jibo.context must send the robot's birthdate (loop.jibo) even when the loop's robot member has a name, as
// 5x1 loops do; without it the cloud has no date for "when is your birthday". Runs the real getLoopContext.
var assert = require('assert'), fs = require('fs'), path = require('path');
var src = fs.readFileSync(path.join(__dirname, '../@be/be/node_modules/jibo/lib/jibo.js'), 'utf8');
var start = src.indexOf('    getLoopContext(omitLoop) {'), end = src.indexOf('\nexports.ContextProvider = ContextProvider;', start);
assert(start > 0 && end > start, 'getLoopContext found');
var body = src.slice(start, src.lastIndexOf('}', end)).replace('getLoopContext(omitLoop)', 'function getLoopContext(omitLoop)');
var __awaiter = function (thisArg, args, P, generator) {
    return new Promise(function (resolve, reject) {
        var gen = generator.apply(thisArg, args || []);
        function step(method, value) {
            var r; try { r = gen[method](value); } catch (e) { return reject(e); }
            if (r.done) { resolve(r.value); } else { Promise.resolve(r.value).then(function (v) { step('next', v); }, function (e) { step('throw', e); }); }
        }
        step('next');
    });
};
function node(data, created, id) { return { data: data, created: created, id: id, firstName: data.firstName, get isJibo() { return !this.data.firstName; } }; }
function context(nodes) {
    var Runtime_1 = { default: { instance: { kb: { loop: { loadLoop: function () { return Promise.resolve(nodes); } } } } } };
    var fn = new Function('__awaiter', 'Runtime_1', 'timeout', 'log', 'return ' + body)(__awaiter, Runtime_1, function (p) { return p; }, { warn: function () {} });
    return fn.call({ ownerNode: null, jiboColor: 'white' }, false);
}
var owner = node({ firstName: 'Zane', type: 'owner' }, 5, 'p1');
context([node({ firstName: 'Jibo', type: 'robot', accountId: 'Robot-Id' }, 1544234645598, 'r1'), owner]).then(function (loop) {
    assert.deepStrictEqual(loop.jibo, { color: 'white', birthdate: 1544234645598, id: 'r1' }, 'a named robot member is sent as jibo');
    assert.deepStrictEqual(loop.users.map(function (u) { return u.accountId || u.firstName; }), ['Robot-Id', 'Zane'], 'and stays in users, where the cloud reads the robot id');
    return context([node({ type: 'robot' }, 7, 'r2'), owner]);
}).then(function (loop) {
    assert.strictEqual(loop.jibo.birthdate, 7); assert.deepStrictEqual(loop.users.map(function (u) { return u.firstName; }), ['Zane'], 'stock unnamed robot: unchanged');
    return context([owner]);
}).then(function (loop) {
    assert.strictEqual(loop.jibo, null, 'no robot member: no jibo');
    console.log('jibo.context sends the robot birthdate for named robot members');
}).catch(function (err) { console.error(err); process.exit(1); });
