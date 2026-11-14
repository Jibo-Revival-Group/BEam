'use strict';
// Custom skills' launch phrases: matched on the robot against the transcript of every cloud turn result.
const assert = require('assert');
const phrases = require('../@be/be/beacon/lib/launch-phrases');
const pkg = require('../@be/be/beacon/lib/theme-package');

assert.strictEqual(phrases.normalize('Hey Jibo, buy a pizza please!'), 'buy a pizza');
assert.strictEqual(phrases.normalize("Can you order me a pizza?"), 'order me a pizza');
assert.strictEqual(phrases.normalize("jibo, let’s play"), 'lets play');

const skills = [
    { packageName: '@be/pizza', manifest: { phrases: ['Buy a pizza', 'order pizza'] }, compatibility: { status: 'compatible' } },
    { packageName: '@be/other', manifest: { phrases: ['order pizza'] }, compatibility: { status: 'compatible' } },
    { packageName: '@be/plain', manifest: {}, compatibility: { status: 'compatible' } },
    { packageName: '@be/old', manifest: { phrases: ['play old game'] }, compatibility: { status: 'incompatible' } }
];
assert.deepStrictEqual(phrases.match('buy a pizza', skills), { skill: '@be/pizza', entities: {} });
assert.strictEqual(phrases.match('Hey Jibo, ORDER PIZZA.', skills).skill, '@be/pizza', 'first installed wins a tie');
// {slots} take any words and are handed to the skill.
const phone = [{ packageName: '@be/phone', manifest: { phrases: ['call {name}', 'text {name} saying {message}'] } }];
assert.deepStrictEqual(phrases.match('Hey Jibo, call Jackson.', phone), { skill: '@be/phone', entities: { name: 'jackson' } });
assert.deepStrictEqual(phrases.match('call mary ann smith', phone).entities, { name: 'mary ann smith' });
assert.deepStrictEqual(phrases.match('text mom saying im running late', phone).entities, { name: 'mom', message: 'im running late' });
assert.strictEqual(phrases.match('call', phone), null, 'a slot needs at least one word');
assert.strictEqual(phrases.match('recall jackson', phone), null);
assert.strictEqual(phrases.match('buy a pizza oven', skills), null, 'whole phrase only');
assert.strictEqual(phrases.match('', skills), null);

// The SDK's turn-result handler is wrapped: a matching phrase opens the skill on the robot, anything else passes through.
const seen = [];
const jibo = { globalEvents: { eventHandlers: {
    'skill-relaunch': data => seen.push(data.result.match.skillID + ':' + data.result.nlu.intent),
    'skill-launch': data => seen.push('launch ' + data.result.match.skillID),
    'global': () => seen.push('global') } } };
assert.strictEqual(phrases.hook(jibo, () => skills), true);
assert.strictEqual(phrases.hook(jibo, () => skills), false, 'hooked once');
const h = jibo.globalEvents.eventHandlers;
h['skill-relaunch']({ result: { asr: { text: 'buy a pizza' }, nlu: { intent: 'chat' }, match: { skillID: '@be/nimbus', onRobot: false }, transID: 't1' } });
const call = { result: { asr: { text: 'call jackson' }, nlu: { intent: 'chat' }, match: { skillID: '@be/nimbus' } } };
skills.push(phone[0]); phone[0].compatibility = { status: 'compatible' };
h['skill-relaunch'](call); assert.deepStrictEqual(call.result.nlu.entities, { name: 'jackson' });
h['skill-relaunch']({ result: { asr: { text: 'tell me a joke' }, nlu: { intent: 'joke' }, match: { skillID: '@be/nimbus' } } });
h['skill-relaunch']({ result: { asr: { text: 'play old game' }, nlu: { intent: 'chat' }, match: { skillID: '@be/nimbus' } } });
h['skill-launch']({ result: { asr: { text: 'order pizza' }, match: { skillID: '@be/idle' } } });
h['global']({ message: 'global' });
assert.deepStrictEqual(seen, ['@be/pizza:menu', '@be/phone:menu', '@be/nimbus:joke', '@be/nimbus:chat', 'launch @be/pizza', 'global']);

// Manifest validation.
const base = { name: 'Pizza', version: '1.0.0', type: 'skill' };
const m = p => pkg.manifest(Buffer.from(JSON.stringify(Object.assign({}, base, p))));
assert.deepStrictEqual(m({ phrases: [' Buy a pizza '] }).phrases, ['Buy a pizza']);
assert.strictEqual(m({}).phrases, undefined);
assert.deepStrictEqual(m({ phrases: ['call {name}'] }).phrases, ['call {name}']);
for (const bad of ['buy a pizza', [], [''], ['!!!'], [5], new Array(21).fill('x'), ['{name}'], ['call {a}{b}'], ['call {a} {b}'], ['call {na-me}'], ['call {name']]) { assert.throws(() => m({ phrases: bad }), /phrases must/); }
console.log('launch-phrases ok');
