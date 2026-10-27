'use strict';
const assert = require('assert'), fs = require('fs'), os = require('os'), path = require('path');
const root = path.resolve(__dirname, '../@be/be'), paths = require(root + '/beacon/lib/paths');
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-free-settings-'));
paths.dataDir = () => temporary;
const settings = require(root + '/beacon/lib/agent-settings'), provider = require(root + '/beacon/lib/agent-provider');
async function run() {
    settings.save({ provider: 'openai', model: 'old', apiKey: 'must-not-leak' });
    const status = settings.save({ provider: 'free', model: 'ignored', endpoint: 'http://attacker.invalid', apiKey: 'also-ignore' });
    assert.deepStrictEqual(status, { provider: 'free', endpoint: '', model: 'gemma3:4b', hasApiKey: false, ready: true });
    assert.strictEqual(settings.read().apiKey, '');
    assert.strictEqual(settings.resolve({ provider: 'free' }).model, 'gemma3:4b');
    assert(!settings.requiresKey('free')); assert(!settings.local('free'));
    assert.deepStrictEqual(await provider.models({ provider: 'free' }), { models: [{ id: 'gemma3:4b', name: 'gemma3:4b (Free)' }] });
    console.log('Free settings: fixed hosted model, no user key/endpoint, old secret isolation and no-network model discovery passed.');
}
run().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => fs.rmSync(temporary, { recursive: true, force: true }));
