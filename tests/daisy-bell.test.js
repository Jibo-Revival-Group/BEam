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
    system: { events: { touchOn: signal() } } };
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
            assert.strictEqual(skill.exited, 4, 'a failed download leaves');
            server.close();
            console.log('daisy-bell ok');
        }, 300);
    }, 300);
});
