'use strict';
const assert = require('assert'), fs = require('fs'), os = require('os'), path = require('path');
const root = path.resolve(__dirname, '../@be/be'), paths = require(root + '/beacon/lib/paths');
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-free-settings-'));
paths.dataDir = () => temporary;
const settings = require(root + '/beacon/lib/agent-settings'), provider = require(root + '/beacon/lib/agent-provider');
async function run() {
    settings.save({ provider: 'openai', model: 'old', apiKey: 'must-not-leak' });
    const status = settings.save({ provider: 'free', model: 'ignored', endpoint: 'http://attacker.invalid', apiKey: 'also-ignore' });
    assert.deepStrictEqual(status, { provider: 'free', endpoint: '', model: 'free', hasApiKey: false, ready: true, memory: false, nickname: '' });
    assert.strictEqual(settings.read().apiKey, '');
    assert.strictEqual(settings.resolve({ provider: 'free' }).model, 'free', 'BEefy picks the model');
    assert(!settings.requiresKey('free')); assert(!settings.local('free'));
    // The model list comes from BEefy (agent-free.models), whatever 5x1 runs now.
    const free = require(root + '/beacon/lib/agent-free'); let asked = 0;
    free.models = () => { asked++; return Promise.resolve({ models: [{ id: 'claude-sonnet-5-5', name: 'claude-sonnet-5-5 (Free)' }] }); };
    assert.deepStrictEqual(await provider.models({ provider: 'free' }), { models: [{ id: 'claude-sonnet-5-5', name: 'claude-sonnet-5-5 (Free)' }] });
    assert.strictEqual(asked, 1);
    console.log('Free settings: BEefy-chosen model, no user key/endpoint, old secret isolation and model list from BEefy passed.');
}
run().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => fs.rmSync(temporary, { recursive: true, force: true }));
