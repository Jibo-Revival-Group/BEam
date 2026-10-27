'use strict';
const assert = require('assert'), http = require('http'), path = require('path');
const provider = require(path.resolve(__dirname, '../@be/be/beacon/lib/agent-provider'));
async function run() {
    const seen = []; let next = { choices: [{ message: { content: 'Hello from Hermes.', reasoning_content: 'Never speak this.' }, finish_reason: 'stop' }] };
    const server = http.createServer((req, res) => {
        let raw = ''; req.on('data', chunk => { raw += chunk; }); req.on('end', () => {
            seen.push({ url: req.url, headers: req.headers, body: raw && JSON.parse(raw) });
            res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(req.url === '/v1/models' ? { data: [{ id: 'hermes-agent' }] } : next));
        });
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const endpoint = 'http://127.0.0.1:' + server.address().port + '/v1';
    const config = { provider: 'hermes', endpoint, model: 'hermes-agent', apiKey: 'fixture-key' };
    try {
        const history = [{ role: 'user', content: 'Hello' }];
        assert.strictEqual(await provider.chat(config, history).promise, 'Hello from Hermes.');
        assert.strictEqual(seen[0].url, '/v1/chat/completions');
        assert.strictEqual(seen[0].headers.authorization, 'Bearer fixture-key');
        const session = seen[0].headers['x-hermes-session-key'];
        assert(/^jibo-[a-f0-9]{32}$/.test(session), 'Hermes needs an isolated random conversation, not an identical-opening fingerprint');
        assert(seen[0].body.messages[0].content.includes('configured tools'), 'Hermes prompt must not falsely disable its tools');
        assert(!seen[0].body.messages[0].content.includes('cannot perform robot or device actions'));
        await provider.chat(config, history.concat([{ role: 'assistant', content: 'Hello from Hermes.' }, { role: 'user', content: 'Again' }])).promise;
        assert.strictEqual(seen[1].headers['x-hermes-session-key'], session);
        assert.strictEqual(seen[1].body.messages[0].content, seen[0].body.messages[0].content);
        const other = { provider: 'hermes', endpoint, model: 'hermes-agent', apiKey: 'fixture-key' };
        await provider.chat(other, history).promise;
        assert.notStrictEqual(seen[2].headers['x-hermes-session-key'], session);
        assert.notStrictEqual(seen[2].body.messages[0].content, seen[0].body.messages[0].content);
        const models = await provider.models(config); assert.deepStrictEqual(models.models, [{ id: 'hermes-agent', name: 'hermes-agent' }]);
        next = { choices: [{ message: { content: 'A failed partial that must not be spoken.' }, finish_reason: 'cancelled' }] };
        await assert.rejects(provider.chat(config, history).promise, /interrupted|cancelled/i);
        next.choices[0].finish_reason = 'error';
        await assert.rejects(provider.chat(config, history).promise, /failed|complete/i);
        next.choices[0].finish_reason = 'length'; next.choices[0].message.content = 'Usable limited answer.';
        assert.strictEqual(await provider.chat(config, history).promise, 'Usable limited answer.');
        console.log('Hermes real loopback HTTP: authentication, model discovery, isolated conversation continuity, tools-aware prompt and terminal failure handling passed.');
    } finally { await new Promise(resolve => server.close(resolve)); }
}
run().catch(error => { console.error(error); process.exitCode = 1; });
