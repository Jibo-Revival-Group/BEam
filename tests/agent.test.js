'use strict';

const assert = require('assert'), fs = require('fs'), path = require('path'), os = require('os'), EventEmitter = require('events');
const root = path.resolve(__dirname, '../@be/be'), paths = require(root + '/beacon/lib/paths');
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-test-')), originalDataDir = paths.dataDir;
paths.dataDir = () => temporary;
const settings = require(root + '/beacon/lib/agent-settings');
function load(file, dependencies) {
    const loaded = { exports: {} };
    new Function('require', 'module', 'exports', '__dirname', fs.readFileSync(file, 'utf8'))(
        id => Object.prototype.hasOwnProperty.call(dependencies, id) ? dependencies[id] : require(id), loaded, loaded.exports, path.dirname(file));
    return loaded.exports;
}
function providerTest() {
    let requests = [], next = {}, status = 200, pending = false;
    const transport = { request: options => {
        const req = new EventEmitter(); req.destroy = () => { req.destroyed = true; };
        req.end = body => {
            requests.push({ options: options, body: body && JSON.parse(body), req: req });
            if (!pending) process.nextTick(() => {
                const response = new EventEmitter(); response.statusCode = status; response.destroy = () => {};
                req.callback(response);
                response.emit('data', Buffer.from(typeof next === 'string' ? next : JSON.stringify(next))); response.emit('end');
            });
        };
        return req;
    } };
    const wrapped = { request: (options, callback) => { const req = transport.request(options); req.callback = callback; return req; } };
    const provider = load(root + '/beacon/lib/agent-provider.js', { http: wrapped, https: wrapped, './agent-settings': settings });
    const fixtures = {
        openai: { output: [{ type: 'reasoning', content: [{ text: 'hidden' }] }, { type: 'message', content: [{ type: 'output_text', text: 'Hello.' }] }] },
        claude: { content: [{ type: 'thinking', text: 'hidden' }, { type: 'text', text: 'Hello.' }] },
        gemini: { candidates: [{ content: { parts: [{ thought: true, text: 'hidden' }, { text: 'Hello.' }] } }] },
        ollama: { message: { content: 'Hello.' } },
        openrouter: { choices: [{ message: { content: 'Hello.' } }] },
        openclaw: { choices: [{ message: { content: 'Hello.' } }] },
        custom: { choices: [{ message: { content: 'Hello.' } }] }
    };
    return Object.keys(fixtures).reduce((chain, name) => chain.then(() => {
        next = fixtures[name];
        return provider.chat({ provider: name, model: 'example', endpoint: 'http://test/v1', apiKey: 'private-key' }, [{ role: 'user', content: 'Hi' }]).promise.then(text => {
            assert.strictEqual(text, 'Hello.');
            const sent = requests[requests.length - 1];
            assert.strictEqual(sent.body.stream, name === 'openai' || name === 'gemini' ? undefined : false);
            assert(!sent.options.path.includes('private-key'));
            assert(JSON.stringify(sent.body).includes('1–2 sentences'));
            assert.strictEqual(sent.options.headers[name === 'claude' ? 'x-api-key' : name === 'gemini' ? 'x-goog-api-key' : 'Authorization'], name === 'claude' || name === 'gemini' ? 'private-key' : 'Bearer private-key');
            if (name === 'openai') assert.strictEqual(sent.body.store, false);
        });
    }), Promise.resolve()).then(() => {
        next = { models: [{ name: 'models/chat', supportedGenerationMethods: ['generateContent'] }, { name: 'models/embed', supportedGenerationMethods: ['embedContent'] }] };
        return provider.models({ provider: 'gemini', apiKey: 'test' });
    }).then(data => {
        assert.deepStrictEqual(data.models.map(model => model.id), ['chat']);
        next = { models: [{ name: 'local:latest' }] };
        return provider.models({ provider: 'ollama', endpoint: 'http://test' });
    }).then(data => {
        assert.strictEqual(data.models[0].id, 'local:latest');
        assert.strictEqual(requests[requests.length - 1].options.path, '/api/tags');
        status = 401; next = { error: 'private-key' };
        return provider.chat({ provider: 'custom', endpoint: 'http://test', model: 'test' }, []).promise.then(() => assert.fail('must reject'), error => {
            assert(!error.message.includes('private-key')); assert(/key/.test(error.message));
        });
    }).then(() => {
        status = 200; next = 'invalid';
        return provider.chat({ provider: 'custom', endpoint: 'http://test', model: 'test' }, []).promise.then(() => assert.fail('must reject'), error => assert(/invalid/.test(error.message)));
    }).then(() => {
        next = {}; return provider.chat({ provider: 'custom', endpoint: 'http://test', model: 'test' }, []).promise.then(() => assert.fail('must reject'), error => assert(/no spoken/.test(error.message)));
    }).then(() => {
        pending = true;
        const operation = provider.chat({ provider: 'custom', endpoint: 'http://test', model: 'test' }, []);
        operation.cancel(); assert(requests[requests.length - 1].req.destroyed);
        return operation.promise.then(() => assert.fail('must reject'), error => assert(/cancelled/.test(error.message)));
    });
}
async function run() {
    assert.strictEqual(settings.status().hasApiKey, false);
    const saved = settings.save({ provider: 'openai', model: 'chosen', apiKey: 'secret' });
    assert(saved.hasApiKey); assert(!JSON.stringify(saved).includes('secret'));
    assert.strictEqual(fs.statSync(path.join(temporary, 'agent.json')).mode & 0o777, 0o600);
    settings.save({ provider: 'openai', model: 'new' }); assert.strictEqual(settings.read().apiKey, 'secret');
    assert.strictEqual(settings.resolve({ provider: 'custom', endpoint: 'http://test/v1' }).apiKey, '');
    assert.throws(() => settings.save({ provider: 'gemini', model: 'test' }), /key/);
    assert.throws(() => settings.save({ provider: 'custom', endpoint: 'http://key@test', model: 'test' }), /base URL/);
    assert.throws(() => settings.save({ provider: 'custom', endpoint: 'ftp://test', model: 'test' }), /base URL/);
    assert.throws(() => settings.save({ provider: 'openai', model: '' }), /model/);
    settings.save({ provider: 'openai', model: 'new', clearApiKey: true }); assert(!settings.status().ready);
    settings.save({ provider: 'custom', endpoint: 'http://first/v1', model: 'chosen', apiKey: 'local-secret' });
    assert.strictEqual(settings.resolve({ endpoint: 'http://second/v1' }).apiKey, '');
    assert(settings.save({ provider: 'ollama', endpoint: 'http://test', model: 'chosen' }).ready);
    const Runtime = require(root + '/skills/agent/runtime');
    assert(Runtime.isStop('Stop chatting!')); assert(!Runtime.isStop('Do not stop chatting'));
    assert(Runtime.isStop('good bye')); assert(Runtime.isStop('Good-bye, Jibo!'));
    assert(Runtime.isStop('Okay, goodbye.')); assert(Runtime.isStop('Bye!'));
    assert(!Runtime.isStop('I said goodbye'));
    const chunks = Runtime.speechChunks('<mark name="x"/> & hello ' + 'word '.repeat(300));
    assert(chunks.every(chunk => chunk.length <= 450 && !chunk.includes('<')));
    await providerTest();
    const acorn = require(root + '/node_modules/acorn');
    ['beacon/lib/agent-settings.js', 'beacon/lib/agent-provider.js', 'beacon/public/agent.js', 'skills/agent/index.js', 'skills/agent/runtime.js'].forEach(name => acorn.parse(fs.readFileSync(path.join(root, name), 'utf8'), { ecmaVersion: 6 }));
    console.log('Agent settings, seven provider adapters, model discovery, errors, cancellation, speech escaping, and Node 6 syntax passed.');
}
run().catch(error => { console.error(error); process.exitCode = 1; }).then(() => {
    paths.dataDir = originalDataDir; fs.rmSync(temporary, { recursive: true, force: true });
});
