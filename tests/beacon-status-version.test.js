'use strict';
// BEacon shows the release the robot is on: the Jibo-TBD version, not Be's package version.
const assert = require('assert');
const themes = require('../@be/be/beacon/lib/themes');
const system = require('../@be/be/beacon/lib/system');
const paths = require('../@be/be/beacon/lib/paths');

const tbd = themes.tbdVersion();
assert.ok(tbd, 'the repo ships jibo-tbd/package.json');
assert.notStrictEqual(tbd, paths.bePackage().version, 'TBD and Be versions differ, so the test can tell them apart');
assert.strictEqual(system.status().host.version, tbd);
console.log('PASS BEacon status reports the Jibo-TBD version ' + tbd);

// Running skill: idle when Be's idle skill is open, else the open skill's name without @be/; null without Be.
global.be = { idle: { assetPack: '@be/idle' } }; global.be.currentSkill = global.be.idle;
assert.strictEqual(system.status().skill, 'idle');
global.be.currentSkill = { assetPack: '@be/clock' };
assert.strictEqual(system.status().skill, 'clock');
delete global.be;
assert.strictEqual(system.status().skill, null);
console.log('PASS BEacon status reports the running skill');
