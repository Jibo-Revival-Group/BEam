'use strict';
// Promise-only smoke for the production Node 6 runtime; no robot/providers contacted.
const assert = require('assert'), http = require('http'), path = require('path');
const provider = require(path.resolve(__dirname, '../@be/be/beacon/lib/agent-provider'));
let seen = 0, session;
const server = http.createServer((req, res) => {
    let raw = '';
    req.on('data', chunk => { raw += chunk; });
    req.on('end', () => {
        const body = JSON.parse(raw); seen++;
        assert.strictEqual(req.url, '/v1/chat/completions');
        assert.strictEqual(req.headers.authorization, 'Bearer fixture-token');
        assert.strictEqual(body.model, 'hermes-agent');
        if (session) assert.strictEqual(req.headers['x-hermes-session-key'], session);
        else session = req.headers['x-hermes-session-key'];
        assert(/^jibo-[a-f0-9]{32}$/.test(session));
        res.end(JSON.stringify({ choices: [{ message: { content: 'Native compatibility answer.' }, finish_reason: 'stop' }] }));
    });
});
server.listen(0, '127.0.0.1', () => {
    const config = { provider: 'hermes', endpoint: 'http://127.0.0.1:' + server.address().port + '/v1', model: 'hermes-agent', apiKey: 'fixture-token' };
    provider.chat(config, [{ role: 'user', content: 'Hi' }]).promise.then(reply => {
        assert.strictEqual(reply, 'Native compatibility answer.');
        return provider.chat(config, [{ role: 'user', content: 'Hi' }, { role: 'assistant', content: reply }, { role: 'user', content: 'Again' }]).promise;
    }).then(() => {
        assert.strictEqual(seen, 2);
        console.log('PASS Node 6 Hermes real HTTP, auth, scoped history and spoken-answer extraction');
        server.close();
    }).catch(error => { console.error(error); process.exitCode = 1; server.close(); });
});
