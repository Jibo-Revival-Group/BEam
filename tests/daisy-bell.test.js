'use strict';
// @be/daisy-bell: plays its song, leaves when it ends, and stops on touch or "Hey Jibo" with nothing left playing.
const assert = require('assert');
const Module = require('module');
const path = require('path');

function signal() {
    const handlers = [];
    return { on: fn => handlers.push(fn), off: fn => { const i = handlers.indexOf(fn); if (i >= 0) handlers.splice(i, 1); },
        fire: () => handlers.slice().forEach(fn => fn()), count: () => handlers.length };
}
const jibo = { jetstream: { events: { hjHeard: signal(), globalTurnStarted: signal(), skillSwitch: signal() } },
    system: { events: { touchOn: signal() } }, loader: { activeCache: 'cache' } };
// Sway_01 plays: each play() hands back a stoppable playback whose result settles when that loop ends.
const sways = [];
jibo.animDB = { getAnimByName: name => name !== 'Sway_01' ? null : { play: () => {
    let done;
    const dance = { stopped: false, result: new Promise(resolve => { done = resolve; }) };
    dance.playback = { stop: () => { dance.stopped = true; done('STOPPED'); } };
    dance.finish = () => done('DONE');
    sways.push(dance);
    return dance;
} } };
class BeSkill { exit(options) { this.exited = (this.exited || 0) + 1; this.exitOptions = options; } }
const load = Module._load;
Module._load = function (name) {
    if (name === 'jibo') return jibo;
    if (name === '@be/be-framework') return { BeSkill: BeSkill };
    return load.apply(this, arguments);
};
const audios = [];
global.Audio = class {
    constructor(src) { this.src = src; this.listeners = {}; this.paused = true; audios.push(this); }
    addEventListener(name, fn) { this.listeners[name] = fn; }
    play() { this.paused = false; return Promise.resolve(); }
    pause() { this.paused = true; }
    removeAttribute(name) { if (name === 'src') this.src = ''; }
    load() {}
    fire(name) { this.listeners[name](); }
};
const Skill = require('../@be/be/skills/daisy-bell');
const listening = () => Object.keys(jibo.jetstream.events).map(k => jibo.jetstream.events[k].count())
    .concat(jibo.system.events.touchOn.count()).reduce((a, b) => a + b, 0);

const skill = new Skill();
skill.open();
assert.strictEqual(audios.length, 1);
assert.strictEqual(audios[0].src, 'file://' + path.join(__dirname, '../@be/be/skills/daisy-bell/daisy-bell.ogg'));
assert.ok(!audios[0].paused, 'sings right away');
assert.strictEqual(listening(), 4, 'touch and Hey Jibo stop it');
audios[0].fire('ended');
assert.strictEqual(skill.exited, 1, 'leaves when the song ends');
assert.deepStrictEqual(skill.exitOptions, { noElementsOfSurprise: true });
assert.strictEqual(listening(), 0);

skill.open();
jibo.system.events.touchOn.fire();
assert.ok(audios[1].paused && audios[1].src === '', 'touch stops the song');
assert.strictEqual(skill.exited, 2);
audios[1].fire('ended');
assert.strictEqual(skill.exited, 2, 'a late end event after stopping does nothing');

skill.open();
jibo.jetstream.events.hjHeard.fire();
assert.ok(audios[2].paused && skill.exited === 3, '"Hey Jibo" stops it');

skill.open();
let closed = false;
skill.close(() => { closed = true; });
assert.ok(closed && audios[3].paused && listening() === 0, 'close (another skill took over) stops it');
assert.strictEqual(skill.exited, 3, 'close does not call exit again');
// He sways while he sings: from the first sound, loop after loop, and stops with the song.
skill.open();
assert.strictEqual(sways.length, 0, 'still before the song starts');
audios[4].fire('playing');
audios[4].fire('playing');
assert.strictEqual(sways.length, 1, 'one sway at a time');
sways[0].finish();
setTimeout(() => {
    assert.strictEqual(sways.length, 2, 'sways again when a loop ends');
    jibo.system.events.touchOn.fire();
    assert.ok(sways[1].stopped, 'stopping the song stops the sway');
    setTimeout(() => {
        assert.strictEqual(sways.length, 2, 'no sway after the song');
        audios.splice(4, 1);
        songs();
    }, 0);
}, 0);
function songs() {
// A song BEefy sends is downloaded (the page can't load api.5x1.com's certificate) and played from the file.
const server = require('http').createServer((req, res) => res.end(req.url === '/songs/new-song.mp3' ? 'mp3 bytes' : ''));
server.listen(0, '127.0.0.1', () => {
    const base = 'http://127.0.0.1:' + server.address().port + '/songs/';
    skill.open({ nlu: { entities: { url: base + 'new-song.mp3' } } });
    assert.strictEqual(audios.length, 4, 'waits for the download');
    setTimeout(() => {
        assert.strictEqual(audios.length, 5);
        const file = audios[4].src.replace('file://', '');
        assert.strictEqual(require('fs').readFileSync(file, 'utf8'), 'mp3 bytes', 'plays the downloaded song');
        skill.close(() => {});

        skill.open({ nlu: { entities: { url: base + 'slow.mp3' } } });
        skill.close(() => {});
        skill.open({ nlu: { entities: { url: 'http://127.0.0.1:1/missing.mp3' } } });
        setTimeout(() => {
            assert.strictEqual(audios.length, 5, 'nothing plays after close or a failed download');
            assert.strictEqual(skill.exited, 5, 'a failed download leaves');
            server.close();
            console.log('daisy-bell ok');
        }, 300);
    }, 300);
});
}
