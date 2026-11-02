'use strict';
const assert = require('assert');
const Runtime = require('../@be/be/skills/agent/runtime');
const { fixture, flush, listening } = require('./agent-runtime.test');
async function reply(env, text) {
    env.turns[0].pending.resolve({ status: env.types.SUCCEEDED, result: { text: 'Can you dance?' } }); await flush();
    env.requests[0].pending.resolve(text); await flush();
}
async function run() {
    const paid = fixture('claude'); await listening(paid);
    await reply(paid, 'Sure, watch this!\nDO: do a dance');
    assert.strictEqual(paid.speech[1].text, 'Sure, watch this!', 'the DO line is not spoken');
    paid.speech[1].pending.resolve(); await flush();
    assert.deepStrictEqual(paid.acts, ['do a dance']); assert(!paid.runtime.active, 'chat closed before the command runs');
    assert.strictEqual(paid.turns.length, 1, 'no more listening'); assert.strictEqual(paid.exits(), 0, 'the launched skill replaces Agent Mode');

    const free = fixture('free'); await listening(free);
    await reply(free, 'Okay!\nDO: do a dance');
    assert.strictEqual(free.speech[1].text, 'Okay!'); free.speech[1].pending.resolve(); await flush();
    assert.deepStrictEqual(free.acts, [], 'Free mode never acts'); assert.strictEqual(free.turns.length, 2, 'Free keeps chatting');
    await free.runtime.close();

    const skills = [{ packageName: '@be/soundmachine', manifest: { name: 'Sound Machine' } }];
    assert.strictEqual(Runtime.storeSkill('open the Sound Machine', skills), '@be/soundmachine');
    assert.strictEqual(Runtime.storeSkill('open sound-machine', skills), '@be/soundmachine');
    assert.strictEqual(Runtime.storeSkill('tell me about the weather', skills), null);
    console.log('Agent actions: paid models run DO commands after speaking; Free never does; Store skills match by name.');
}
run().catch(error => { console.error(error); process.exitCode = 1; });
