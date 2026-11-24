'use strict';
// Agent Mode memory and nickname: the AI saves "REMEMBER:" notes and gets them back only while memory is on;
// turning it off keeps them; BEacon lists, deletes and clears them. Also Jibo's personality and SHOW: in the prompt.
const assert = require('assert'), fs = require('fs'), os = require('os'), path = require('path');
const root = path.resolve(__dirname, '../@be/be'), paths = require(root + '/beacon/lib/paths');
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-memory-'));
paths.dataDir = () => temporary;
const settings = require(root + '/beacon/lib/agent-settings'), provider = require(root + '/beacon/lib/agent-provider');
const memory = require(root + '/beacon/lib/agent-memory'), free = require(root + '/beacon/lib/agent-free');
let reply = '', system = '';
free.chat = (history, prompt, image, context) => { system = prompt + (context || ''); return { promise: Promise.resolve(reply), cancel() {} }; };
async function say(text) { reply = text; return provider.chat(settings.resolve({}), [{ role: 'user', content: 'hi' }]).promise; }
async function run() {
    let status = settings.save({ provider: 'free', memory: true, nickname: 'Jeebs' });
    assert.strictEqual(status.memory, true); assert.strictEqual(status.nickname, 'Jeebs');
    assert.throws(() => settings.save({ provider: 'free', nickname: '<script>' }), /nickname/);
    assert.strictEqual(settings.save({ provider: 'openai', model: 'm', apiKey: 'k' }).nickname, 'Jeebs', 'kept across providers');
    settings.save({ provider: 'free' });

    assert.strictEqual(await say('Nice to meet you, Sam!\nREMEMBER: The user is named Sam and loves pizza.'), 'Nice to meet you, Sam!', 'the note is not spoken');
    assert.deepStrictEqual(memory.list().map(e => e.text), ['The user is named Sam and loves pizza.']);
    assert.strictEqual(await say('REMEMBER: Sam has a cat named Cupcake.'), 'Okay.', 'a reply that was only a note still answers');
    await say('Hi!'); 
    assert(/People may call you Jeebs/.test(system) && /Sam has a cat named Cupcake/.test(system) && /REMEMBER:/.test(system), 'memory and nickname in the prompt');
    assert(/It is now \w+day, \w+ \d+, 20\d\d/.test(system), 'the current date and time: ' + system.slice(0, 0));
    const at = provider.now(new Date(2026, 10, 22, 19, 5));
    assert(/Sunday, November 22, 2026/.test(at) && /7:05\s?PM/.test(at) && / where you are\.$/.test(at), at);
    assert(/penguins/.test(system) && /scared of water/.test(system) && /SHOW:/.test(system), 'Jibo\'s personality and pictures');

    settings.save({ provider: 'free', memory: false });
    assert.strictEqual(await say('Okay!\nREMEMBER: Something new.'), 'Okay!');
    assert.strictEqual(memory.list().length, 2, 'memory off: nothing new is saved, nothing is lost');
    await say('Hi!');
    assert(!/Cupcake/.test(system) && !/REMEMBER:/.test(system), 'memory off: the AI cannot read it');

    const first = memory.list()[0].id;
    assert.deepStrictEqual(memory.remove(first).map(e => e.text), ['Sam has a cat named Cupcake.']);
    memory.add('x'.repeat(500)); assert.strictEqual(memory.list()[1].text.length, memory.MAX_LENGTH);
    assert.deepStrictEqual(memory.clear(), []); assert.deepStrictEqual(memory.list(), []);
    console.log('Agent memory: REMEMBER notes saved and read only while on, kept while off, delete/clear; nickname and personality in the prompt.');
}
run().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => fs.rmSync(temporary, { recursive: true, force: true }));
