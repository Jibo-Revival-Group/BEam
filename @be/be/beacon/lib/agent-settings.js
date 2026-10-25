'use strict';

const fs = require('fs'), path = require('path'), url = require('url'), paths = require('./paths');
const providers = ['openai', 'claude', 'gemini', 'openrouter', 'ollama', 'openclaw', 'custom'];
function fail(message) { const error = new Error(message); error.status = 400; return error; }
function local(provider) { return ['ollama', 'openclaw', 'custom'].indexOf(provider) !== -1; }
function file() { return path.join(paths.dataDir(), 'agent.json'); }
function read() {
    try { return JSON.parse(fs.readFileSync(file(), 'utf8')); }
    catch (error) { if (error.code !== 'ENOENT') throw fail('Agent settings could not be read.'); }
    return { provider: 'openai', endpoint: '', model: '', apiKey: '' };
}
function resolve(input, requireModel) {
    input = input || {};
    const saved = read(), provider = input.provider === undefined ? saved.provider : input.provider;
    if (providers.indexOf(provider) === -1) throw fail('Choose a supported provider.');
    const endpoint = local(provider) ? String(input.endpoint === undefined ? saved.endpoint || '' : input.endpoint).trim() : '';
    if (local(provider)) {
        const parsed = url.parse(endpoint);
        if (!/^https?:$/.test(parsed.protocol || '') || !parsed.hostname || parsed.auth || parsed.query || parsed.hash) {
            throw fail('Enter an HTTP or HTTPS base URL without credentials, query, or fragment.');
        }
    }
    const same = provider === saved.provider && endpoint === (saved.endpoint || '');
    let apiKey = input.apiKey === undefined || input.apiKey === '' ? (same ? saved.apiKey || '' : '') : String(input.apiKey).trim();
    if (input.clearApiKey === true) apiKey = '';
    if (apiKey.length > 4096 || /[\r\n]/.test(apiKey)) throw fail('Invalid API key.');
    const model = String(input.model === undefined ? (same ? saved.model || '' : '') : input.model).trim();
    if (model.length > 256 || /[\r\n]/.test(model)) throw fail('Invalid model ID.');
    if (requireModel && !model) throw fail('Select or enter a model.');
    return { provider: provider, endpoint: endpoint, model: model, apiKey: apiKey };
}
function ready(config) { return !!config.model && (local(config.provider) ? !!config.endpoint : !!config.apiKey); }
function publicSettings(config) {
    config = config || read();
    return { provider: config.provider, endpoint: config.endpoint, model: config.model, hasApiKey: !!config.apiKey, ready: ready(config) };
}
function save(input) {
    const config = resolve(input, true);
    if (!local(config.provider) && !config.apiKey && !input.clearApiKey) throw fail('Enter an API key.');
    const target = file(), temporary = target + '.tmp';
    try {
        fs.writeFileSync(temporary, JSON.stringify(config), { mode: 0o600 });
        fs.chmodSync(temporary, 0o600);
        fs.renameSync(temporary, target);
    } catch (_) { try { fs.unlinkSync(temporary); } catch (ignored) {} throw fail('Agent settings could not be saved.'); }
    return publicSettings(config);
}
module.exports = { read: read, resolve: resolve, save: save, status: publicSettings, ready: ready, local: local, fail: fail };
