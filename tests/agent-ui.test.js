'use strict';
const assert = require('assert'), fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '../@be/be/beacon/public'), elements = {}, requests = [];
function element(id) {
    return elements[id] || (elements[id] = { value: '', checked: false, hidden: false, required: false, textContent: '', listeners: {}, children: [],
        addEventListener: function (name, fn) { this.listeners[name] = fn; }, appendChild: function (child) { this.children.push(child); }, querySelectorAll: () => [element('save'), element('agent-load-models')] });
}
const document = { getElementById: element, createElement: () => ({}) }, window = {};
element('agent-provider').value = 'openai';
let next = { provider: 'openai', endpoint: '', model: 'saved-model', hasApiKey: true, ready: true }, ok = true;
const fetch = (url, options) => { requests.push({ url: url, options: options, body: options.body && JSON.parse(options.body) }); return Promise.resolve({ ok: ok, json: () => Promise.resolve(next) }); };
new Function('document', 'window', 'fetch', fs.readFileSync(path.join(root, 'agent.js'), 'utf8'))(document, window, fetch);
async function flush() { for (let i = 0; i < 15; i++) await Promise.resolve(); }
async function run() {
    await window.BEaconAgent.load();
    assert.strictEqual(element('agent-model').value, 'saved-model'); assert.strictEqual(element('agent-key').value, '');
    assert(!element('agent-key').required); assert(element('agent-endpoint-row').hidden);
    element('agent-model').value = 'changed'; next = { models: [{ id: 'new-model', name: 'New Model' }] };
    element('agent-load-models').onclick(); await flush();
    assert.strictEqual(element('agent-model').value, 'changed', 'Discovery must not replace selection');
    assert.strictEqual(element('agent-models').children[0].value, 'new-model');
    element('agent-provider').value = 'ollama'; element('agent-provider').listeners.change();
    element('agent-endpoint').value = 'http://server:11434'; element('agent-model').value = 'local-model'; element('agent-settings').listeners.input();
    assert(!element('agent-endpoint-row').hidden); assert(element('agent-endpoint').required); assert(!element('agent-key').required);
    next = { provider: 'ollama', endpoint: 'http://server:11434', model: 'local-model', hasApiKey: true, ready: true };
    element('agent-key').value = 'entered-secret';
    element('agent-settings').onsubmit({ preventDefault() {} }); await flush();
    assert.strictEqual(requests[requests.length - 1].body.apiKey, 'entered-secret'); assert.strictEqual(element('agent-key').value, '');
    element('agent-clear-key').checked = true; element('agent-settings').listeners.input();
    element('agent-settings').onsubmit({ preventDefault() {} }); await flush(); assert(requests[requests.length - 1].body.clearApiKey);
    ok = false; next = { error: 'Model discovery unavailable.' };
    element('agent-load-models').onclick(); await flush(); assert(/manually/.test(element('agent-status').textContent)); assert.strictEqual(element('agent-model').value, 'local-model');
    element('agent-provider').value = 'openclaw'; element('agent-provider').listeners.change(); assert.strictEqual(element('agent-model-label').textContent, 'Model / agent');
    element('agent-provider').value = 'claude'; element('agent-provider').listeners.change(); assert(element('agent-key').required);
    element('agent-provider').value = 'hermes'; element('agent-provider').listeners.change();
    assert(!element('agent-endpoint-row').hidden, 'Hermes needs the API server endpoint');
    assert(element('agent-key').required, 'Hermes API authentication is required');
    assert.strictEqual(element('agent-model').value, 'hermes-agent');
    assert.strictEqual(element('agent-key-label').textContent, 'API server key');
    assert(/8642/.test(element('agent-endpoint-hint').textContent));
    element('agent-provider').value = 'free'; element('agent-provider').listeners.change();
    assert(element('agent-endpoint-row').hidden); assert(element('agent-key-row').hidden);
    assert(!element('agent-key').required); assert.strictEqual(element('agent-model').value, 'gemma3:4b');
    assert(element('agent-model').readOnly); assert(element('agent-load-models').hidden);
    assert(/BEefyER/.test(element('agent-free-hint').textContent));
    element('agent-provider').value = 'claude'; element('agent-provider').listeners.change();
    assert(!element('agent-key-row').hidden); assert(!element('agent-model').readOnly); assert(!element('agent-load-models').hidden);
    const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
    Object.keys(elements).filter(id => /^agent-/.test(id)).forEach(id => assert(html.includes('id="' + id + '"'), id + ' exists in markup'));
    assert(html.indexOf('src="agent.js"') < html.indexOf('src="app.js"'));
    console.log('Agent UI: provider fields, saved keys, selection preservation, discovery failure, manual models, and secret clearing passed.');
}
run().catch(error => { console.error(error); process.exitCode = 1; });
