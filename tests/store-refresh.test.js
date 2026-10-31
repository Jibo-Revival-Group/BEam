'use strict';
const assert = require('assert'), fs = require('fs'), os = require('os'), path = require('path');
const themes = require('../@be/be/beacon/lib/themes');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'beacon-refresh-'));
let calls = 0, fail = false, resolveFetch;
const options = { root, version: () => null, runtime: { status: () => ({ live: false }) },
    store: { catalog: () => { calls++; if (resolveFetch) { return new Promise(resolve => { resolveFetch = resolve; }); } return fail ? Promise.reject(new Error('Offline')) : Promise.resolve([]); } } };
async function run() {
    let manager = themes.create(options);
    await manager.refresh(undefined, true); assert.strictEqual(calls, 1);
    await manager.refresh(undefined, true); assert.strictEqual(calls, 1, 'Automatic refresh respects the 30-minute interval');
    { const file = path.join(root, 'state.json'), state = JSON.parse(fs.readFileSync(file)); state.sources[0].attemptedAt = new Date(Date.now() - 20 * 60000).toISOString(); fs.writeFileSync(file, JSON.stringify(state));
      await manager.refresh(undefined, true); assert.strictEqual(calls, 1, 'Not again after 20 minutes');
      state.sources[0].attemptedAt = new Date(Date.now() - 30 * 60000).toISOString(); fs.writeFileSync(file, JSON.stringify(state));
      await manager.refresh(undefined, true); assert.strictEqual(calls, 2, 'Again after 30 minutes'); calls = 1; }
    manager = themes.create(options);
    await manager.refresh(undefined, true); assert.strictEqual(calls, 1, 'Restart retains refresh timestamps');
    await manager.refresh(); assert.strictEqual(calls, 2, 'Manual refresh bypasses the interval');
    const file = path.join(root, 'state.json');
    function age() { const state = JSON.parse(fs.readFileSync(file)); state.sources[0].attemptedAt = new Date(Date.now() - 3600001).toISOString(); fs.writeFileSync(file, JSON.stringify(state)); }
    age(); fail = true;
    const result = await manager.refresh(undefined, true); assert.strictEqual(result.sources[0].error, 'Offline');
    await manager.refresh(undefined, true); assert.strictEqual(calls, 3, 'Failed attempts are throttled too');
    age(); fail = false; resolveFetch = true;
    const first = manager.refresh(undefined, true);
    await new Promise(resolve => setImmediate(resolve));
    await manager.refresh(undefined, true); assert.strictEqual(calls, 4, 'Concurrent tabs share the automatic refresh');
    resolveFetch([]); await first;
    // A slow request from another tab must not roll back a completed refresh.
    const pending = [];
    options.store.catalog = () => new Promise((resolve, reject) => pending.push({ resolve, reject }));
    const older = manager.refresh();
    await new Promise(resolve => setImmediate(resolve));
    const newer = manager.refresh();
    await new Promise(resolve => setImmediate(resolve));
    const latestEntries = [{ name: 'Latest theme', url: 'https://example.com/latest/manifest.json' }];
    pending[1].resolve(latestEntries); await newer;
    pending[0].resolve([{ name: 'Old theme', url: 'https://example.com/old/manifest.json' }]); await older;
    assert.strictEqual(manager.catalog().entries[0].name, 'Latest theme', 'An older refresh must not replace newer catalog entries');
    const olderFailure = manager.refresh();
    await new Promise(resolve => setImmediate(resolve));
    const recovered = manager.refresh();
    await new Promise(resolve => setImmediate(resolve));
    pending[3].resolve(latestEntries); await recovered;
    pending[2].reject(new Error('Old offline failure')); await olderFailure;
    assert.strictEqual(manager.catalog().sources[0].error, null, 'An older failure must not replace a recovered source status');
    console.log('Hourly automatic refresh, manual override, restart, failures, concurrent tabs and out-of-order refresh recovery passed');
}
run().catch(err => { console.error(err); process.exitCode = 1; }).finally(() => fs.rmSync(root, { recursive: true, force: true }));
