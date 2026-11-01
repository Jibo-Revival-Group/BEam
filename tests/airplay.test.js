'use strict';
// AirPlay metadata from shairport-sync drives the Music player: track info, chunked cover art,
// progress, play/pause/end, and opening the player only when Jibo is idle.
const assert = require('assert'), Module = require('module');
const load = Module._load;
// Jibo's volume plugin: 1-10, silent setter, 'change' emitted when a change lands.
const volume = new (require('events'))();
Object.assign(volume, { MIN_VOLUME: 1, MAX_VOLUME: 10, currentVolume: 4, _volumeChanging: false, sets: [],
    _setVolume(cb, silent) { this.sets.push([this.currentVolume, silent]); this._volumeChanging = false; this.emit('change', this.currentVolume); },
    changeVolume(intent, value) { this.currentVolume = value; this._setVolume(null, false); } });
Module._load = function (request) { return request === 'jibo' ? { volume: volume } : load.apply(this, arguments); };
const airplay = require('../@be/be/skills/music/airplay');
// A second module cache (the skill loader) must get the same receiver.
delete require.cache[require.resolve('../@be/be/skills/music/airplay')];
assert.strictEqual(require('../@be/be/skills/music/airplay'), airplay);

const msg = (type, code, data) => Buffer.concat([Buffer.from(type + code, 'latin1'), Buffer.from(data || '')]);
let started = 0;
airplay.events.on('started', () => started++);

airplay.packet(msg('ssnc', 'pbeg'));
assert.strictEqual(airplay.state.active, true); assert.strictEqual(airplay.state.playing, true); assert.strictEqual(started, 1);

airplay.packet(msg('ssnc', 'mdst'));
airplay.packet(msg('core', 'minm', 'Ding Dong Song'));
airplay.packet(msg('core', 'asar', 'Günther'));
airplay.packet(msg('ssnc', 'mden'));
assert.deepStrictEqual([airplay.state.title, airplay.state.artist], ['Ding Dong Song', 'Günther']);

// Cover art split into chunks; an unfinished earlier picture is replaced by the next one.
const art = Buffer.concat([Buffer.from([0xff, 0xd8]), Buffer.alloc(100, 7)]);
const chunk = (index, total, part) => {
    const head = Buffer.alloc(24); head.write('ssncchnk', 0, 'latin1');
    head.writeUInt32BE(index, 8); head.writeUInt32BE(total, 12); head.write('ssncPICT', 16, 'latin1');
    return Buffer.concat([head, part]);
};
airplay.packet(chunk(0, 3, Buffer.from('stale')));
airplay.packet(chunk(0, 2, art.slice(0, 60)));
assert.strictEqual(airplay.state.art, null, 'no art until every chunk is in');
airplay.packet(chunk(1, 2, art.slice(60)));
assert.strictEqual(airplay.state.art, 'data:image/jpeg;base64,' + art.toString('base64'));

// Progress across an RTP wrap: start near 2^32, current 10 s later, end 200 s after start.
const start = 4294967296 - 44100;
airplay.packet(msg('ssnc', 'prgr', start + '/' + ((start + 441000) % 4294967296) + '/' + ((start + 8820000) % 4294967296)));
assert.strictEqual(airplay.state.duration, 200); assert.strictEqual(Math.round(airplay.position()), 10);

// Volume. The phone gets Jibo's volume when the session starts, instead of overriding it.
const sent = [];
airplay.control = command => { sent.push(command); return Promise.resolve(204); };
airplay.watchVolume();
airplay.packet(msg('ssnc', 'pvol', '-20.00,0.00,0.00,0.00'));
assert.deepStrictEqual(sent, [], 'no phone remote yet: nothing to send');
airplay.packet(msg('ssnc', 'daid', 'ABCDEF0123456789'));
airplay.packet(msg('ssnc', 'acre', '1234567'));
airplay.packet(msg('ssnc', 'pvol', '-20.00,0.00,0.00,0.00'));
assert.deepStrictEqual(sent, ['setproperty?dmcp.device-volume=-20.00'], 'first phone volume is answered with Jibo\'s (4 of 10)');
assert.strictEqual(volume.currentVolume, 4);
// Then the phone's slider moves Jibo, silently, without echoing back to the phone.
airplay.packet(msg('ssnc', 'pvol', '0.00,0.00,0.00,0.00'));
assert.strictEqual(volume.currentVolume, 10); assert.deepStrictEqual(volume.sets.pop(), [10, true]);
airplay.packet(msg('ssnc', 'pvol', '-144.00,0.00,0.00,0.00'));
assert.strictEqual(volume.currentVolume, 1);
assert.strictEqual(sent.length, 1, 'slider changes are not sent back');
// A change made on Jibo (voice, buttons, BEacon) moves the phone's slider.
volume.changeVolume('volumeToValue', 7);
volume.emit('change', 7); // the real plugin announces each change twice
assert.deepStrictEqual(sent.slice(1), ['setproperty?dmcp.device-volume=-10.00']);
// While Jibo is still applying one change, the latest slider value waits and then lands.
volume._volumeChanging = true;
airplay.packet(msg('ssnc', 'pvol', '-30.00,0.00,0.00,0.00'));
airplay.packet(msg('ssnc', 'pvol', '-15.00,0.00,0.00,0.00'));
assert.strictEqual(volume.currentVolume, 7);
volume._volumeChanging = false; volume.emit('change', 7);
assert.strictEqual(volume.currentVolume, 6); // -15 dB is 5.5 of 1-10, rounded up

airplay.packet(msg('ssnc', 'pfls'));
assert.strictEqual(airplay.state.playing, false); assert.strictEqual(airplay.state.active, true);
airplay.packet(msg('ssnc', 'prsm'));
assert.strictEqual(airplay.state.playing, true); assert.strictEqual(started, 2);
airplay.packet(msg('ssnc', 'pend'));
assert.strictEqual(airplay.state.active, false); assert.strictEqual(airplay.state.title, '');
assert.strictEqual(airplay.state.synced, false, 'the next session starts at Jibo\'s volume again');

// The player only opens over the idle screen.
const opened = [];
function Data(skill, options) { this.skill = skill; this.options = options; }
const be = { idle: {}, skills: { '@be/music': { name: 'music' } }, redirect: data => opened.push(data) };
be.currentSkill = {};
assert.strictEqual(airplay.show(be, Data), false);
be.currentSkill = be.idle;
assert.strictEqual(airplay.show(be, Data), true);
assert.strictEqual(opened[0].skill, be.skills['@be/music']);
assert.strictEqual(opened[0].options.nlu.entities.airplay, true);

// That launch reaches the Music skill as an AirPlay request.
const MusicSkill = (() => {
    Module._load = function (request) {
        if (request === 'jibo') return {};
        if (request === '@be/be-framework') return { BeSkill: class {} };
        return load.apply(this, arguments);
    };
    return require('../@be/be/skills/music');
})();
assert.strictEqual(MusicSkill.launchRequest(opened[0].options).airplay, true);
assert.strictEqual(MusicSkill.launchRequest({ nlu: { entities: { query: 'x' } } }).airplay, undefined);
console.log('airplay tests passed');
