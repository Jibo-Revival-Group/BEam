'use strict';
// After calendar, commute, weather, news, the full report, a joke, a dance or a surprise, Agent Mode comes back with
// the conversation and what Jibo said during the action; other actions still end the chat.
const assert = require('assert');
const Runtime = require('../@be/be/skills/agent/runtime');
const comeback = require('../@be/be/skills/agent/comeback');
const { fixture, flush, listening } = require('./agent-runtime.test');

function event() {
    const handlers = [];
    return { on: fn => handlers.push(fn), off: fn => handlers.splice(handlers.indexOf(fn), 1), emit: () => handlers.slice().forEach(fn => fn()), count: () => handlers.length };
}
function clock() {
    const c = { t: 0, fn: null, now: () => c.t, setInterval: fn => { c.fn = fn; return 1; }, clearInterval: () => { c.fn = null; } };
    c.advance = ms => { for (let i = 0; i < ms / 250 && c.fn; i++) { c.t += 250; c.fn(); } };
    return c;
}

async function run() {
    // Which actions come back (the 8 Zane listed, as the prompt phrases them) and which still end the chat.
    ['tell me about my calendar', 'what does my commute look like', 'tell me about the weather', 'tell me about the news',
        'personal report', 'tell me a joke', 'do a dance', 'surprise me'].forEach(c => assert(comeback.RETURNS.test(c), c));
    ['set a timer for 5 minutes', 'open the clock', 'play some jazz radio', 'take a picture', 'open settings', 'play Hello by Adele']
        .forEach(c => assert(!comeback.RETURNS.test(c), c));
    assert.strictEqual(comeback.plain('<speak><STYLE set="NEUTRAL"> <SPEAK> <BREAK size="0.75"/> for your commute , it should take about 19 minutes . </SPEAK> </STYLE></speak>'),
        'for your commute, it should take about 19 minutes.');

    // A DO action hands the conversation to act().
    const env = fixture('claude'); await listening(env);
    let handed = null; env.runtime.act = (command, history) => { handed = { command, history }; };
    env.turns[0].pending.resolve({ status: env.types.SUCCEEDED, result: { text: 'How long is my commute?' } }); await flush();
    env.requests[0].pending.resolve('Let me check.\nDO: what does my commute look like'); await flush();
    env.speech[1].pending.resolve(); await flush();
    assert.strictEqual(handed.command, 'what does my commute look like');
    assert.deepStrictEqual(handed.history.map(m => m.role), ['user', 'assistant'], 'history survives close()');

    // The watcher records Jibo's lines until he is back on idle and quiet, then calls back once.
    const spoken = [], be = { currentSkill: { assetPack: '@be/agent' } }, c = clock(), hjHeard = event();
    const jibo = { tts: { isTalking: false, speak: text => { spoken.push(text); return Promise.resolve(); } }, jetstream: { events: { hjHeard } } };
    const original = jibo.tts.speak; let said = null;
    comeback.watch(jibo, be, s => { said = s; }, c);
    c.advance(2000); assert.strictEqual(said, null, 'not back before the action starts');
    hjHeard.emit(); // the action's own turn
    be.currentSkill.assetPack = '@be/nimbus';
    jibo.tts.speak('<speak><SPEAK> for your commute , it should take about 19 minutes . </SPEAK></speak>');
    assert.strictEqual(spoken.length, 1, 'speech still reaches the TTS');
    c.advance(4000);
    be.currentSkill.assetPack = '@be/idle'; jibo.tts.isTalking = true; c.advance(3000);
    assert.strictEqual(said, null, 'waits while he is still talking');
    jibo.tts.isTalking = false; c.advance(1000); assert.strictEqual(said, null, 'waits for a quiet moment');
    c.advance(1000);
    assert.strictEqual(said, 'for your commute, it should take about 19 minutes.');
    assert.strictEqual(jibo.tts.speak, original, 'TTS restored'); assert.strictEqual(hjHeard.count(), 0);

    // "Hey Jibo" during the action (a new request) or a 3-minute timeout: no comeback.
    const be2 = { currentSkill: { assetPack: '@be/nimbus' } }, c2 = clock(), hj2 = event(); let back2 = false;
    const jibo2 = { tts: { speak: () => Promise.resolve() }, jetstream: { events: { hjHeard: hj2 } } }, orig2 = jibo2.tts.speak;
    comeback.watch(jibo2, be2, () => { back2 = true; }, c2);
    c2.advance(1000); be2.currentSkill.assetPack = '@be/idle'; c2.advance(500); hj2.emit(); c2.advance(5000);
    assert(!back2 && jibo2.tts.speak === orig2, 'Hey Jibo cancels');
    const c3 = clock(); let back3 = false; const be3 = { currentSkill: { assetPack: '@be/music' } };
    comeback.watch({ tts: { speak() {} }, jetstream: { events: {} } }, be3, () => { back3 = true; }, c3);
    c3.advance(181000); be3.currentSkill.assetPack = '@be/idle'; c3.advance(5000);
    assert(!back3, 'gives up after 3 minutes');

    // The real timers work when the clock is the default (Electron rejects window.setInterval called on another object).
    const realTimers = { setInterval: global.setInterval, clearInterval: global.clearInterval };
    global.setInterval = function (fn, ms) { if (this !== undefined && this !== global) throw new TypeError('Illegal invocation'); return realTimers.setInterval(fn, ms); };
    global.clearInterval = function (id) { if (this !== undefined && this !== global) throw new TypeError('Illegal invocation'); return realTimers.clearInterval(id); };
    try { comeback.watch({ tts: { speak() {} }, jetstream: { events: {} } }, { currentSkill: null }, () => {}).cancel(); }
    finally { global.setInterval = realTimers.setInterval; global.clearInterval = realTimers.clearInterval; }

    // Reopening carries on: no greeting, straight to listening, and the AI sees what Jibo said.
    const history = Runtime.resumeHistory(handed.history, 'for your commute, it should take about 19 minutes.');
    assert.strictEqual(history[1].content, 'Let me check.\nDO: what does my commute look like\n(Jibo then said: "for your commute, it should take about 19 minutes.")');
    assert.deepStrictEqual(handed.history[1].content, 'Let me check.\nDO: what does my commute look like', 'original not changed');
    const again = fixture('claude'); again.runtime.open(history); await flush();
    assert.strictEqual(again.speech.length, 0, 'no "What would you like to talk about?"');
    assert.strictEqual(again.turns.length, 1, 'listening');
    again.turns[0].pending.resolve({ status: again.types.SUCCEEDED, result: { text: 'Is that a lot?' } }); await flush();
    assert.deepStrictEqual(again.requests[0].history.map(m => m.role), ['user', 'assistant', 'user']);
    assert(/19 minutes/.test(again.requests[0].history[1].content));
    await again.runtime.close();
    assert.strictEqual(Runtime.resumeHistory([], '')[0].content, '(Jibo did it.)');
    console.log('PASS Agent Mode comes back after the 8 quick actions with what Jibo said; other actions still end the chat');
}
run().catch(error => { console.error(error); process.exitCode = 1; });
