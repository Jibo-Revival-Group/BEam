'use strict';
// AirPlay metadata from shairport-sync drives the Music player: track info, chunked cover art,
// progress, play/pause/end, and opening the player only when Jibo is idle.
const assert = require('assert'), Module = require('module');
const load = Module._load;
Module._load = function (request) { return request === 'jibo' ? {} : load.apply(this, arguments); };
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

airplay.packet(msg('ssnc', 'pfls'));
assert.strictEqual(airplay.state.playing, false); assert.strictEqual(airplay.state.active, true);
airplay.packet(msg('ssnc', 'prsm'));
assert.strictEqual(airplay.state.playing, true); assert.strictEqual(started, 2);
airplay.packet(msg('ssnc', 'pend'));
assert.strictEqual(airplay.state.active, false); assert.strictEqual(airplay.state.title, '');

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
