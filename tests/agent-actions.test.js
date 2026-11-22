'use strict';
const assert = require('assert');
const Runtime = require('../@be/be/skills/agent/runtime');
const { fixture, flush, listening } = require('./agent-runtime.test');
async function reply(env, text) {
    env.turns[0].pending.resolve({ status: env.types.SUCCEEDED, result: { text: 'Can you help?' } }); await flush();
    env.requests[0].pending.resolve(text); await flush();
}
async function run() {
    const paid = fixture('claude'); await listening(paid);
    await reply(paid, "Sure, here's the weather!\nDO: what's the weather");
    assert.strictEqual(paid.speech[1].text, "Sure, here's the weather!", 'the DO line is not spoken');
    paid.speech[1].pending.resolve(); await flush();
    assert.deepStrictEqual(paid.acts, ["what's the weather"]); assert(!paid.runtime.active, 'chat closed before the command runs');
    assert.strictEqual(paid.turns.length, 1, 'no more listening'); assert.strictEqual(paid.exits(), 0, 'the launched skill replaces Agent Mode');

    const free = fixture('free'); await listening(free);
    await reply(free, 'Okay!\nDO: open the clock');
    assert.strictEqual(free.speech[1].text, 'Okay!'); free.speech[1].pending.resolve(); await flush();
    assert.deepStrictEqual(free.acts, ['open the clock'], 'Free acts like paid models (3.2.0)'); assert.strictEqual(free.turns.length, 1, 'the launched skill takes over');
    await free.runtime.close();

    // A dance plays right in Agent Mode (no cloud "Watch this"), in the style asked for, then he listens again.
    const dancer = fixture('free'); await listening(dancer);
    await reply(dancer, 'Here I go!\nDO: do a silly dance');
    assert.strictEqual(dancer.speech[1].text, 'Here I go!'); dancer.speech[1].pending.resolve(); await flush();
    assert.strictEqual(dancer.speech[2].text, "<anim cat='dance' filter='music, rom-silly' />", 'a Hey Jibo, dance style');
    assert.deepStrictEqual(dancer.acts, [], 'no command leaves Agent Mode'); assert(dancer.runtime.active);
    dancer.speech[2].pending.resolve(); await flush();
    assert.strictEqual(dancer.turns.length, 2, 'listening again after the dance');
    await dancer.runtime.close();

    // "LOOK": shutter, one 640-px photo sent with the same history, the answer is spoken; later turns carry no photo.
    const photos = [];
    global.Image = class { set src(url) { photos.push(url); setImmediate(() => this.onload()); } get width() { return 1280; } get height() { return 720; } };
    global.document = { createElement: () => ({ getContext: () => ({ drawImage() {} }), toDataURL: (type, quality) => 'data:' + type + ';base64,UEhPVE8=' }) };
    const looker = fixture('free'); await listening(looker);
    looker.jibo.media = { takePhoto: done => done(null, { url: 'http://127.0.0.1:8486/media/photo?id=1' }) };
    await reply(looker, 'LOOK');
    assert.strictEqual(looker.speech[1].text, "<anim name='ds_shutter_release_01' />", 'the shutter sound'); looker.speech[1].pending.resolve(); await new Promise(r => setTimeout(r, 20)); await flush();
    assert.strictEqual(looker.requests.length, 2); assert.strictEqual(looker.requests[1].image, 'UEhPVE8=');
    assert.deepStrictEqual(looker.requests[1].history, looker.requests[0].history, 'same question, now with the photo');
    looker.requests[1].pending.resolve("You're holding up three fingers."); await flush();
    assert.strictEqual(looker.speech[2].text, "You're holding up three fingers."); looker.speech[2].pending.resolve(); await flush();
    assert.deepStrictEqual(looker.runtime.history.map(m => m.content), ['Can you help? [You looked: Jibo took a photo for this message and you answered from it.]',
        "You're holding up three fingers."], 'LOOK is not kept, but that it looked is');
    assert.strictEqual(looker.requests[1].history[0].content, 'Can you help?', 'the question went out as asked');
    assert.strictEqual(looker.turns.length, 2, 'listening again');
    await looker.runtime.close();
    // Privacy mode: no photo.
    const shy = fixture('free'); await listening(shy);
    shy.jibo.media = { takePhoto: () => assert.fail('no photo in privacy mode') }; shy.jibo.privacyController = { enabled: false };
    shy.turns[0].pending.resolve({ status: shy.types.SUCCEEDED, result: { text: 'What do you see?' } }); await flush();
    shy.jibo.privacyController.enabled = true; shy.requests[0].pending.resolve('LOOK'); await new Promise(r => setTimeout(r, 20)); await flush();
    assert.strictEqual(shy.requests.length, 1); assert.strictEqual(photos.length, 1);
    await shy.runtime.close();

    const skills = [{ packageName: '@be/soundmachine', manifest: { name: 'Sound Machine' } }];
    assert.strictEqual(Runtime.storeSkill('open the Sound Machine', skills), '@be/soundmachine');
    assert.strictEqual(Runtime.storeSkill('open sound-machine', skills), '@be/soundmachine');
    assert.strictEqual(Runtime.storeSkill('tell me about the weather', skills), null);
    console.log('Agent actions: DO commands run after speaking (paid and Free); dances play in Agent Mode and he keeps listening; Store skills match by name; LOOK takes one photo.');
}
run().catch(error => { console.error(error); process.exitCode = 1; });
