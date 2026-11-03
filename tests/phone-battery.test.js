'use strict';
const assert = require('assert');
const phone = require('../@be/be/beacon/lib/phone-battery');

const loop = { members: [{ id: 'z1', firstName: 'Zane' }, { id: 's1', nickName: 'Sam', firstName: 'Samantha' }] };
const now = Date.now();

assert.strictEqual(phone.sentence(loop, now), "I haven't heard from your phone yet. Open BEep on it while it's on my Wi-Fi.");

phone.save({ member: 'z1', level: 84.6, charging: true });
assert.strictEqual(phone.sentence(loop, now), 'Your phone is at 85 percent and charging.');
assert.strictEqual(phone.sentence(loop, now + 25 * 60000), 'As of 25 minutes ago, your phone was at 85 percent and charging.');
assert.strictEqual(phone.sentence(loop, now + 150 * 60000), 'As of 2 hours ago, your phone was at 85 percent and charging.');
assert.strictEqual(phone.sentence(loop, now + 3 * 3600000 + 1000), "I haven't heard from your phone lately.");
assert.strictEqual(phone.shown('z1', now + 3 * 3600000 + 1000), null, 'no battery screen for a stale reading');

phone.save({ member: 's1', level: 40 });
const both = phone.sentence(loop, now);
assert.ok(both.includes("Sam's phone is at 40 percent") && both.includes("Zane's phone is at 85 percent and charging"), both);

// Recognised by voice: only their phone, even with others reported.
assert.strictEqual(phone.sentence(loop, now, 's1'), 'Your phone is at 40 percent.');
assert.strictEqual(phone.sentence(loop, now, 'z1'), 'Your phone is at 85 percent and charging.');
assert.strictEqual(phone.sentence(loop, now, 'nobody'), "I haven't heard from your phone yet. Open BEep on it while it's on my Wi-Fi.");
assert.strictEqual(phone.sentence({ members: [{ id: 'k1', firstName: 'Kai' }] }, now, 'k1'), "I haven't heard from your phone yet, Kai. Open BEep on it while it's on my Wi-Fi.");

assert.strictEqual(phone.shown('s1').level, 40);
assert.strictEqual(phone.shown('nobody'), null);
assert.ok(phone.shown(null), 'with no speaker, the newest reading');

for (const bad of [{}, { level: -1 }, { level: 101 }, { level: '50' }, null]) {
    assert.throws(() => phone.save(bad), /level must be 0 to 100/);
}
phone.reset();
console.log('phone-battery ok');
