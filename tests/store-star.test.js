'use strict';
// Stars from BEacon: sent to BEaker as this robot, remembered per listing, and the count updated straight away.
const assert = require('assert'), fs = require('fs'), os = require('os'), path = require('path');
const themes = require('../@be/be/beacon/lib/themes');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'beacon-star-'));
const votes = [];
let forgotten = 0, answer = null;
const listing = [{ name: 'Astra', type: 'theme', url: 'https://github.com/Zane/Astra', stars: 5 }, { name: 'Other', type: 'theme', url: 'https://example.com/other/manifest.json' }];
const manager = themes.create({ root, version: () => null, runtime: { status: () => ({ live: false }) },
    store: { catalog: () => Promise.resolve(listing), forget: () => { forgotten++; } },
    vote: (repo, starred) => { votes.push([repo, starred]); return answer ? Promise.reject(answer) : Promise.resolve({ stars: starred ? 6 : 5 }); } });
async function run() {
    const data = await manager.refresh();
    const astra = data.entries.filter(e => e.name === 'Astra')[0], other = data.entries.filter(e => e.name === 'Other')[0];
    assert.strictEqual(astra.starred, false);
    let after = await manager.star(astra.id, true);
    assert.deepStrictEqual(votes, [['zane/astra', true]], 'BEaker gets owner/repo');
    let entry = after.entries.filter(e => e.id === astra.id)[0];
    assert.strictEqual(entry.starred, true); assert.strictEqual(entry.stars, 6, 'the new count shows straight away');
    assert.strictEqual(forgotten, 1, 'cached counts are dropped so a refresh does not undo it');
    entry = themes.create({ root, version: () => null, runtime: { status: () => ({ live: false }) }, store: {} }).catalog().entries.filter(e => e.id === astra.id)[0];
    assert.strictEqual(entry.starred, true, 'remembered after a restart');
    after = await manager.star(astra.id, false);
    entry = after.entries.filter(e => e.id === astra.id)[0];
    assert.strictEqual(entry.starred, false); assert.strictEqual(entry.stars, 5);
    await assert.rejects(manager.star(other.id, true), /Only GitHub listings/);
    answer = Object.assign(new Error('x'), { status: 404 });
    await assert.rejects(manager.star(astra.id, true), /Only listings in the 5x1 Store/);
    answer = Object.assign(new Error('x'), { status: 502 });
    await assert.rejects(manager.star(astra.id, true), /Couldn’t save your star/);
    assert.strictEqual(manager.catalog().entries.filter(e => e.id === astra.id)[0].starred, false, 'a failed star changes nothing');
    console.log('store stars ok');
}
run().catch(err => { console.error(err); process.exitCode = 1; });
