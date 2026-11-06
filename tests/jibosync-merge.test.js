'use strict';
// JiboSync merge rules. Node 6: /root/node6/node-v6.17.1-linux-x64/bin/node tests/jibosync-merge.test.js
const assert = require('assert');
const merge = require('../@be/be/beacon/lib/jibosync-merge');

const DAY = 86400000;
const NOW = 1800000000000;
function person (id, first, last, extra) {
    return Object.assign({ id: id, firstName: first, lastName: last, created: NOW - 100 * DAY, face: null, voice: null, hasPhoto: false, phoneticName: null, owner: false }, extra);
}
const face = (t) => ({ examples: 5, last: t });
const voice = (t) => ({ stamp: t });

// Placeholder owner on a new robot: removed, the real people come in, the other robot's owner becomes owner.
let r = merge.plan({ people: [person('ph', 'FirstName', 'LastName', { owner: true })] },
    [{ people: [person('z1', 'Zane', 'V', { owner: true, face: face(NOW - DAY), voice: voice(NOW - DAY) }), person('m1', 'Mom', 'V')] }], NOW);
assert.deepStrictEqual(r.removes, ['ph']);
assert.deepStrictEqual(r.setOwner, { key: 'zane v' });
assert.deepStrictEqual(r.imports.map((i) => [i.localId, i.remoteId, i.face, i.voice]), [[null, 'z1', true, true], [null, 'm1', false, false]]);
assert.deepStrictEqual(r.imports[0].fields, { firstName: 'Zane', lastName: 'V', gender: null });

// A placeholder stays while nobody real exists anywhere.
r = merge.plan({ people: [person('ph', 'FirstName', 'LastName', { owner: true })] }, [{ people: [person('ph2', 'FirstName', 'LastName')] }], NOW);
assert.deepStrictEqual([r.removes, r.imports, r.setOwner], [[], [], null]);

// Duplicates on this robot: face + voice beats voice only, even when the voice-only copy is newer.
r = merge.plan({ people: [person('a', 'Ann', 'Lee', { voice: voice(NOW - DAY) }), person('b', 'ann', 'LEE', { face: face(NOW - 9 * DAY), voice: voice(NOW - 9 * DAY) })] }, [], NOW);
assert.deepStrictEqual(r.removes, ['a']);
// Equally complete: the newer one wins.
r = merge.plan({ people: [person('a', 'Ann', 'Lee', { voice: voice(NOW - 5 * DAY) }), person('b', 'Ann', 'Lee', { voice: voice(NOW - DAY) })] }, [], NOW);
assert.deepStrictEqual(r.removes, ['a']);
// The owner node is the copy that stays (it can't be removed).
r = merge.plan({ people: [person('o', 'Ann', 'Lee', { owner: true }), person('b', 'Ann', 'Lee', { face: face(NOW) })] }, [], NOW);
assert.deepStrictEqual(r.removes, ['b']);

// Another robot has a newer face, this robot a newer voice: only the face comes over, into the local id.
r = merge.plan({ people: [person('l', 'Ann', 'Lee', { face: face(NOW - 9 * DAY), voice: voice(NOW - DAY) })] },
    [{ people: [person('x', 'Ann', 'Lee', { face: face(NOW - 2 * DAY), voice: voice(NOW - 8 * DAY) })] }], NOW);
assert.deepStrictEqual(r.imports.map((i) => [i.localId, i.remoteId, i.face, i.voice]), [['l', 'x', true, false]]);

// Same data on both robots: nothing to do (no ping-pong every 4 hours).
r = merge.plan({ people: [person('l', 'Ann', 'Lee', { face: face(NOW - 2 * DAY), voice: voice(NOW - DAY), hasPhoto: true })] },
    [{ people: [person('x', 'Ann', 'Lee', { face: face(NOW - 2 * DAY), voice: voice(NOW - DAY), hasPhoto: true })] }], NOW);
assert.deepStrictEqual([r.imports, r.removes], [[], []]);

// Two robots: newest face from one, newest voice from the other, photo and phonetic name fill gaps.
r = merge.plan({ people: [] }, [
    { people: [person('p0', 'Ann', 'Lee', { face: face(NOW - DAY), voice: voice(NOW - 9 * DAY), hasPhoto: true })] },
    { people: [person('p1', 'Ann', 'Lee', { face: face(NOW - 9 * DAY), voice: voice(NOW - 2 * DAY), phoneticName: 'an lee' })] }], NOW);
assert.deepStrictEqual(r.imports.map((i) => [i.peer, i.remoteId, i.face, i.voice, i.photo, i.phoneticName]),
    [[0, 'p0', true, false, true, null], [1, 'p1', false, true, false, 'an lee']]);
assert.ok(r.imports.every((i) => i.localId === null && i.key === 'ann lee'));

// Removed on another robot after this robot's copy was last enrolled: removed here too, and not imported back.
r = merge.plan({ people: [person('l', 'Ann', 'Lee', { voice: voice(NOW - 9 * DAY) })] },
    [{ people: [], tombstones: { 'ann lee': NOW - DAY } }], NOW);
assert.deepStrictEqual(r.removes, ['l']);
assert.strictEqual(r.tombstones['ann lee'], NOW - DAY, 'tombstones are passed on');
r = merge.plan({ people: [], tombstones: { 'ann lee': NOW - DAY } }, [{ people: [person('x', 'Ann', 'Lee', { voice: voice(NOW - 9 * DAY) })] }], NOW);
assert.deepStrictEqual(r.imports, [], 'this robot removed her: she is not added back');
// Enrolled again after the removal: she comes back.
r = merge.plan({ people: [], tombstones: { 'ann lee': NOW - 5 * DAY } }, [{ people: [person('x', 'Ann', 'Lee', { voice: voice(NOW - DAY) })] }], NOW);
assert.strictEqual(r.imports.length, 1);
// Tombstones expire after 30 days.
r = merge.plan({ people: [], tombstones: { 'ann lee': NOW - 31 * DAY } }, [], NOW);
assert.deepStrictEqual(r.tombstones, {});

console.log('jibosync merge ok');
