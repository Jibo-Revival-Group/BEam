'use strict';
// BEacon commute addresses: home (Etc tab) and each person's job (People tab), geocoded by the cloud.
const assert = require('assert'), fs = require('fs'), path = require('path');
const file = path.resolve(__dirname, '../@be/be/beacon/lib/commute.js');
const calls = []; let cloudDown = false, applied = null;
const stubs = {
    './calendars': {
        robotIdFrom: () => 'Auburn-Motor-Salad-Angora',
        homeTimeZone: () => 'America/New_York',
        callCloud: (op, body, robot) => {
            if (cloudDown) throw new Error('no credentials');
            calls.push({ op, body, robot });
            if (op === 'GetCommuteAddresses') return Promise.resolve({ available: true, addresses: [{ memberId: 'home', address: '1 Main St' }, { memberId: 'zane', address: '2 Work Rd' }, { memberId: 'home:zane', address: '9 Dorm Ln' }] });
            return Promise.resolve({ address: '1 Main St, Tyngsborough, MA', lat: 42.6, lng: -71.4, city: 'Tyngsborough', state: 'Massachusetts', stateAbbr: 'MA' });
        }
    },
    './location': { applyAddress: found => { applied = found; return Promise.resolve({ location: { city: found.city } }); } },
    './people': {
        list: () => Promise.resolve({ members: [{ id: 'zane', firstName: 'Zane', lastName: 'Vincent' }, { id: 'robot', isJibo: true }] }),
        findMember: id => Promise.resolve({ member: id === 'robot' ? { id, isJibo: true } : { id, firstName: 'Zane', lastName: 'Vincent', type: id === 'owner' ? 'owner' : 'member' }, snapshot: {} })
    }
};
const mod = { exports: {} };
new Function('require', 'module', 'exports', fs.readFileSync(file, 'utf8'))(name => stubs[name] || require(name), mod, mod.exports);
const commute = mod.exports;

(async () => {
    const home = await commute.setHome('  1 main st tyngsborough ');
    assert.deepStrictEqual(calls[0], { op: 'SetCommuteAddress', body: { address: '1 main st tyngsborough', timeZone: 'America/New_York' }, robot: 'Auburn-Motor-Salad-Angora' });
    assert.strictEqual(applied.city, 'Tyngsborough', 'the geocoded town and coordinates become Jibo\'s home location');
    assert.deepStrictEqual(home, { address: '1 Main St, Tyngsborough, MA', location: { city: 'Tyngsborough' } });

    await commute.setWork('zane', '2 Work Rd, Boston');
    assert.deepStrictEqual(calls[1].body, { memberId: 'zane', address: '2 Work Rd, Boston', memberName: 'Zane Vincent' });
    await assert.rejects(commute.setWork('robot', 'x'), /robot/);
    assert.throws(() => commute.setHome(' '), /Enter an address/);

    const snapshot = await commute.attach({ members: [{ id: 'zane' }, { id: 'robot', isJibo: true }] });
    assert.strictEqual(snapshot.commuteAvailable, true);
    assert.strictEqual(snapshot.members[0].workAddress, '2 Work Rd');
    assert.strictEqual(snapshot.members[0].homeAddress, '9 Dorm Ln', 'a person\'s own home is kept under home:<id>');
    assert.strictEqual(snapshot.members[1].workAddress, undefined);

    // Personal Reports home address: saved as home:<id>; only the owner's also moves the household home + Jibo's location.
    calls.length = 0; applied = null;
    await commute.setPersonHome('zane', '9 Dorm Ln, Lowell');
    assert.deepStrictEqual(calls.map(c => c.op), ['GetCommuteAddresses', 'SetCommuteAddress']);
    assert.deepStrictEqual(calls[1].body, { memberId: 'home:zane', address: '9 Dorm Ln, Lowell', memberName: 'Zane Vincent' });
    assert.strictEqual(applied, null, 'a member\'s dorm does not move Jibo\'s town and weather');
    calls.length = 0;
    await commute.setPersonHome('owner', '1 Main St');
    assert.deepStrictEqual(calls.map(c => c.op), ['GetCommuteAddresses', 'SetCommuteAddress', 'SetCommuteAddress']);
    assert.deepStrictEqual(calls[2].body, { address: '1 Main St, Tyngsborough, MA', timeZone: 'America/New_York' }, 'the owner\'s home is the household home');
    assert.strictEqual(applied.city, 'Tyngsborough');
    calls.length = 0;
    await commute.clearPersonHome('zane');
    assert.deepStrictEqual(calls[0], { op: 'ClearCommuteAddress', body: { memberId: 'home:zane' }, robot: 'Auburn-Motor-Salad-Angora' });
    await assert.rejects(commute.setPersonHome('robot', 'x'), /robot/);
    assert.deepStrictEqual(await commute.homeAddress(), { available: true, address: '1 Main St' });

    cloudDown = true;
    assert.strictEqual((await commute.attach({ members: [] })).commuteAvailable, false, 'People still loads without the cloud');
    assert.deepStrictEqual(await commute.homeAddress(), { available: false, address: null });
    console.log('Commute addresses: home geocodes and sets the location, jobs save with the person\'s name, People survives cloud errors');
})().catch(err => { console.error(err); process.exitCode = 1; });
