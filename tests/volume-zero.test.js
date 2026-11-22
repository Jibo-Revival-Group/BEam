'use strict';
// Volume 0 (silent): Jibo's VolumePlugin goes 0-10. 0 sets the hardware to 0; 1-10 keep the original
// 0.25-1 hardware levels; voice, sliders and the saved KB value all clamp to 0-10. Runs the real plugin.
var assert = require('assert'), fs = require('fs'), path = require('path'), events = require('events');
var src = fs.readFileSync(path.join(__dirname, '../@be/be/node_modules/jibo/lib/jibo.js'), 'utf8');
var start = src.indexOf('const END_OF_BOUNDS'), end = src.indexOf('Runtime_1.default.registerPlugin(VolumePlugin', start);
assert(start > 0 && end > start, 'VolumePlugin found');
var hw = [], played = [], saved = [];
var Runtime_1 = { default: { instance: {
    runMode: 'robot', RunMode: { UNIT_TESTS: 'tests', ON_ROBOT: 'robot' },
    system: { setMasterVolume: function (v, cb) { hw.push(v); cb(); } },
    sound: { play: function (s) { played.push(s); } },
    globalEvents: { volume: { on: function () {} }, shared: { nonInterruptingGlobal: { emit: function () {} } } }
} } };
var VolumePlugin = new Function('events_1', 'Runtime_1', 'log', src.slice(start, end) + '\nreturn VolumePlugin;')(
    events, Runtime_1, { warn: function () {}, error: function () {} });
var v = new VolumePlugin();
v._root = { data: {}, save: function (cb) { saved.push(this.data.volume); cb(); } };
v._lastVolume = v.currentVolume = 7;

v.changeVolume('volumeToValue', '0');
assert.strictEqual(v.currentVolume, 0, '"volume 0" is allowed');
assert.strictEqual(hw.pop(), 0, 'and silences the speaker');
assert.strictEqual(saved.pop(), 0, 'and is remembered');
v.changeVolume('volumeToValue', '-3');
assert.strictEqual(v.currentVolume, 0, 'below 0 clamps to 0');
assert.strictEqual(played.pop(), 'SFX_EndofBounds', 'with the end-of-range sound');
v.changeVolume('volumeToValue', '1');
assert.strictEqual(hw.pop(), 0.25, '1 is still the original quietest level');
v.changeVolume('volumeToValue', '10');
assert.strictEqual(hw.pop(), 1, '10 is still full volume');
v.changeVolume('volumeToValue', '7');
assert.strictEqual(hw.pop(), 0.25 + 6 / 9 * 0.75, '7 is unchanged');
v.changeVolume('volumeToValue', '1');
v.changeVolume('volumeDown');
assert.strictEqual(v.currentVolume, 0, 'volume down from 1 reaches 0');
console.log('volume-zero ok');
