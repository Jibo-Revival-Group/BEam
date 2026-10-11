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
    await manager.refresh(undefined, true); assert.strictEqual(calls, 1, 'Automatic refresh respects the hour');
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
    console.log('Hourly automatic refresh, manual override, restart, failures and concurrent tabs passed');
}
run().catch(err => { console.error(err); process.exitCode = 1; }).finally(() => fs.rmSync(root, { recursive: true, force: true }));
