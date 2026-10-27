'use strict';
const assert = require('assert'), fs = require('fs'), os = require('os'), path = require('path');
const root = path.resolve(__dirname, '../@be/be'), paths = require(root + '/beacon/lib/paths');
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-hermes-'));
paths.dataDir = () => temporary;
const settings = require(root + '/beacon/lib/agent-settings');
async function run() {
    const config = settings.save({ provider: 'hermes', endpoint: 'http://hermes-host:8642/v1', model: 'hermes-agent', apiKey: 'fixture-key' });
    assert.strictEqual(config.provider, 'hermes'); assert(config.ready); assert(config.hasApiKey);
    assert(!JSON.stringify(config).includes('fixture-key'));
    assert.throws(() => settings.save({ provider: 'hermes', endpoint: 'http://different:8642/v1', model: 'hermes-agent' }), /key/i);
    settings.save({ provider: 'custom', endpoint: 'http://custom/v1', model: 'model', apiKey: 'old-key' });
    assert.strictEqual(settings.resolve({ provider: 'hermes', endpoint: 'http://hermes-host:8642/v1', model: 'hermes-agent' }).apiKey, '');
    console.log('Hermes settings: endpoint validation, mandatory API key and key isolation passed.');
}
run().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => fs.rmSync(temporary, { recursive: true, force: true }));
