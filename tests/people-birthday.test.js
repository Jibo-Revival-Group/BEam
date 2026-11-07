'use strict';
// BEacon People saves a birthday on the loop node as data.birthday (epoch ms, noon UTC). That is what
// jibo.context sends to BEefy as loop.users[].birthdate, so Jibo can wish them happy birthday.
const assert = require('assert');
const Module = require('module');

const zane = { id: 'zane', data: { firstName: 'Zane', type: 'member' }, saved: 0, save(cb) { this.saved++; cb(null); } };
const fakeJibo = { kb: { onInit: () => Promise.resolve(), loop: {
    getUserNodeById: (id, cb) => cb(null, id === 'zane' ? zane : null),
    loadRoot: cb => cb(null, { data: { id: 'loop' } }),
    loadLoop: cb => cb(null, [zane]),
    // Like the robot's loop service: the phonetic-name update rewrites the node from its own copy.
    setPhoneticName: (id, name, cb) => { zane.data = { firstName: zane.data.firstName, type: 'member', phoneticName: name }; cb(null); }
} } };
const load = Module._load;
Module._load = function (request) { return request === 'jibo' ? fakeJibo : load.apply(this, arguments); };
const people = require('../@be/be/beacon/lib/people');

people.updateMember('zane', { birthday: '1990-05-21' }).then((snapshot) => {
    assert.strictEqual(zane.data.birthday, Date.UTC(1990, 4, 21, 12));
    assert.strictEqual(snapshot.members.filter(m => m.id === 'zane')[0].birthday, '1990-05-21');
    return people.updateMember('zane', { birthday: '1990-02-30' }).then(() => assert.fail('Feb 30 was saved'), (err) => {
        assert.strictEqual(err.status, 400);
        assert.strictEqual(zane.data.birthday, Date.UTC(1990, 4, 21, 12), 'a bad date leaves the old one');
    });
}).then(() => people.updateMember('zane', { firstName: 'Zane', phoneticName: '' })).then(() => {
    assert.strictEqual(zane.data.birthday, Date.UTC(1990, 4, 21, 12), 'saving the person (with phonetic name) keeps it');
    return people.updateMember('zane', { firstName: 'Zane', phoneticName: '', birthday: '1991-06-02' });
}).then(() => {
    assert.strictEqual(zane.data.birthday, Date.UTC(1991, 5, 2, 12), 'the Save button sends everything at once');
    return people.updateMember('zane', { birthday: '' });
}).then((snapshot) => {
    assert.ok(!('birthday' in zane.data), 'clearing the field removes it');
    assert.strictEqual(snapshot.members.filter(m => m.id === 'zane')[0].birthday, null);
    console.log('PASS People saves, validates, keeps and clears a birthday');
}).catch((err) => { console.error(err); process.exit(1); });
