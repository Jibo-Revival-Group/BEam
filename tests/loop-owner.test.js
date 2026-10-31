'use strict';
// Empty loop (new / OOBE robot) -> BEacon adds placeholder owner "FirstName LastName"; existing people are left alone.
const assert = require('assert'), Module = require('module');

function node(data, extra) {
    return Object.assign({ data: data, edges: {}, saved: 0, save(cb) { this.saved++; cb(null); },
        addEdges(target, kind) { (this.edges[kind] = this.edges[kind] || []).push(target); },
        clearEdges(kind) { this.edges[kind] = []; }, getEdges(kind) { return this.edges[kind] || []; } }, extra);
}
let root, loop, created;
const fakeJibo = { kb: { onInit: () => Promise.resolve(), loop: {
    loadRoot: cb => cb(null, root), loadLoop: cb => cb(null, loop),
    createNode: () => { created = node(null); created.data = undefined; return created; } } } };
const load = Module._load;
Module._load = function (request) { return request === 'jibo' ? fakeJibo : load.apply(this, arguments); };
const people = require('../@be/be/beacon/lib/people');

function setup(members) { root = node({}); loop = members; created = null; }

setup([node({ type: 'robot' }, { isJibo: true })]);
people.ensureOwner().then(added => {
    assert.strictEqual(added, true, 'Only the robot in the loop: owner is added');
    assert.deepStrictEqual([created.data.firstName, created.data.lastName, created.data.type, created.data.status],
        ['FirstName', 'LastName', 'owner', 'accepted']);
    assert.strictEqual(root.getEdges('user')[0], created); assert.strictEqual(root.getEdges('owner')[0], created);
    assert.strictEqual(created.saved, 1); assert.strictEqual(root.saved, 1);

    setup([]);
    return people.ensureOwner();
}).then(added => {
    assert.strictEqual(added, true, 'Completely empty loop: owner is added');

    setup([node({ firstName: 'Old', type: 'member', status: 'removed' })]);
    return people.ensureOwner();
}).then(added => {
    assert.strictEqual(added, true, 'Only removed people: owner is added');

    setup([node({ type: 'robot' }, { isJibo: true }), node({ firstName: 'Zane', type: 'owner', status: 'accepted' })]);
    return people.ensureOwner();
}).then(added => {
    assert.strictEqual(added, false, 'A loop with a person is left alone');
    assert.strictEqual(created, null); assert.strictEqual(root.saved, 0);

    root = null; loop = []; created = null;
    return people.ensureOwner();
}).then(added => {
    assert.strictEqual(added, false, 'No loop root yet: nothing is created');
    console.log('Empty loop gets placeholder owner FirstName LastName passed');
}).catch(err => { console.error(err); process.exit(1); });
