'use strict';
// Idle animations that end with the eye turned (the eclipse jiboji ends at -90°) must turn it back upright,
// or every later blink looks sideways. Loads the shipped idle module with stubbed jibo.
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const source = fs.readFileSync(path.join(__dirname, '../@be/be/skills/idle/index.js'), 'utf8');
const start = source.indexOf('"use strict";', source.indexOf('}],17:[function'));
const end = source.indexOf('exports.CircadianExpression = CircadianExpression;', start);
assert(start >= 0 && end > start);

const centered = [];
const anims = {
    eclipse: { name: 'jiboji_eclipse_01', endsNeutral: false },
    wiggle: { name: 'happy_wiggle', endsNeutral: true }
};
const jibo = {
    animDB: { getAnimByName: name => ({
        name: anims[name].name,
        meta: { endsNeutral: anims[name].endsNeutral },
        createFromConfig: () => Promise.resolve({ play: () => (name === 'fail' ? Promise.reject(new Error('x')) : Promise.resolve('done')), stop() {} })
    }) },
    expression: { dofs: { EYE_ROTATE: 'EYE_ROTATE' }, centerRobot: options => { centered.push(options.dofs); return Promise.resolve(); } }
};
const deps = {
    jibo,
    '@be/be-framework': { libraries: { jibo_cai_utils: { CacheUtils: { GlobalCacheName: 'global' }, PromiseUtils: { promisify: f => f } } } },
    './CancelableQueue': { CancelableQueue: class { add() {} } },
    'lodash/lodash.min': {}
};
const loaded = { exports: {} };
new Function('require', 'module', 'exports', source.slice(start, end) + '\nexports.CircadianExpression = CircadianExpression;')(
    name => deps[name] || {}, loaded, loaded.exports);
const C = loaded.exports.CircadianExpression;
const expression = Object.create(C.prototype);
expression.skill = { log: { debug() {}, info() {}, warn() {}, error() {} } };

(async () => {
    let handle = await expression.playAnimDBAnimation({ name: 'eclipse' });
    assert.strictEqual(await handle.promise, 'done');
    await new Promise(r => setImmediate(r));
    assert.deepStrictEqual(centered, ['EYE_ROTATE'], 'the eye is turned back upright after the eclipse');
    handle = await expression.playAnimDBAnimation({ name: 'wiggle' });
    await handle.promise;
    assert.deepStrictEqual(centered, ['EYE_ROTATE'], 'animations that end neutral are left alone');
    console.log('idle eye upright passed');
})().catch(err => { console.error(err); process.exit(1); });
