'use strict';
// A stream that drops or sticks mid-song resumes where it was (up to 3 times a song)
// instead of ending the song with "Music is unavailable right now".
const assert = require('assert'), Module = require('module');
const load = Module._load;
Module._load = function (request) {
    if (request === 'jibo') return { tts: { speak: () => Promise.resolve() } };
    if (request === '@be/be-framework') return { BeSkill: class {} };
    return load.apply(this, arguments);
};
const MusicSkill = require('../@be/be/skills/music');

function playing(position) {
    const skill = new MusicSkill();
    skill.view = {}; skill.ui = { render() {} };
    skill.state = { phase: 'playing', position: position, song: { id: 'x', duration: 200 } };
    skill.starts = []; skill.startAt = seconds => skill.starts.push(seconds);
    return skill;
}

const skill = playing(175.4);
skill.fail('media_buffer');
assert.deepStrictEqual(skill.starts, [175.4], 'dropped stream: resume at the same point');
assert.strictEqual(skill.state.phase, 'playing');
skill.fail('playback_stalled'); skill.fail('media_buffer');
assert.strictEqual(skill.starts.length, 3);
skill.fail('media_buffer');
assert.strictEqual(skill.starts.length, 3, 'a stream that keeps dying still ends in an error');
assert.strictEqual(skill.state.phase, 'error');

const early = playing(0);
early.fail('media_buffer');
assert.deepStrictEqual(early.starts, [], 'a song that never started reports the error');

const other = playing(50);
other.fail('song_not_found');
assert.deepStrictEqual(other.starts, []);

const airplay = playing(50); airplay.state.airplay = true;
airplay.fail('media_buffer');
assert.deepStrictEqual(airplay.starts, []);
console.log('music recovery tests passed');
