// node tests/homeassistant-native.test.js
function runTests(receiverSource, clientSource, assert, Buffer) {
    const start = clientSource.indexOf('                    case types.ServiceEventType.SKILL_ACTION:');
    const end = clientSource.indexOf('                    case types.ServiceEventType.SKILL_REDIRECT:', start);
    assert(start >= 0 && end > start);
    const eventCode = clientSource.slice(start, end);
    function fixture(saved) {
        const requests = [], timers = new Map(), logs = [], resolved = [];
        let id = 0;
        const console = { info: line => logs.push(line), warn: line => logs.push(line), error: line => logs.push(line) };
        const transport = protocol => ({ request(options, callback) {
            const handlers = {};
            const request = { options, callback, handlers, protocol,
                on(event, fn) { handlers[event] = fn; },
                write(body) { this.body = JSON.parse(body); }, end() {},
                destroy() { this.destroyed = true; }
            };
            requests.push(request);
            return request;
        } });
        const dependencies = {
            './homeassistant': { readConfig: () => saved },
            './system': { serverConfig: () => ({ current: { hostname: 'hub.example', port: 443 } }) },
            http: transport('http'), https: transport('https')
        };
        const module = { exports: {} };
        new Function('require', 'module', 'console', 'Buffer', 'setTimeout', 'clearTimeout', receiverSource)(
            name => dependencies[name], module, console, Buffer,
            (fn, ms) => { timers.set(++id, { fn, ms }); return id; }, key => timers.delete(key));
        const handler = new Function('event', 'types', 'require', 'console',
            'let shouldPassToRequest = true; switch(event.type) {' + eventCode + '} return shouldPassToRequest;');
        const client = { cloudSkillResponseRegistry: { resolve: (tid, data) => resolved.push({ tid, data }) } };
        return { requests, timers, logs, resolved, emit(data) {
            return handler.call(client, { type: 'SKILL_ACTION', data, transID: 'turn-1' },
                { ServiceEventType: { SKILL_ACTION: 'SKILL_ACTION' } }, name => {
                    assert.strictEqual(name, '../../../../beacon/lib/homeassistant-command');
                    return module.exports;
                }, console);
        } };
    }
    const command = { skill: { id: '@be/homeassistant' }, action: {
        command: 'lights_off_current_room', requestId: 'request-1', callbackToken: 'private-token'
    } };
    const saved = { haIp: '192.0.2.20', haPort: 8123, webhookId: 'private-hook', password: 'private-password' };
    const respond = (request, body, statusCode) => {
        const handlers = {};
        request.callback({ statusCode, on: (event, fn) => { handlers[event] = fn; }, resume() {} });
        if (handlers.data) { handlers.data(Buffer.from(JSON.stringify(body))); handlers.end(); }
    };
    let passed = 0;
    {
        const f = fixture(saved);
        assert.strictEqual(f.emit(command), false);
        assert.strictEqual(f.resolved.length, 0); // Native action must not play as a cloud skill.
        assert.strictEqual(f.requests.length, 1);
        assert.strictEqual(f.requests[0].options.host, saved.haIp);
        assert.strictEqual(f.requests[0].body.password, saved.password);
        respond(f.requests[0], { status: 'ok', requestId: 'request-1' }, 200);
        assert.strictEqual(f.requests.length, 2);
        assert.strictEqual(f.requests[1].protocol, 'https');
        assert.strictEqual(f.requests[1].options.host, 'hub.example');
        assert.strictEqual(f.requests[1].body.callbackToken, 'private-token');
        respond(f.requests[1], {}, 200);
        assert.strictEqual(f.timers.size, 0);
        const speech = { skill: { id: 'chitchat-skill' }, action: { text: 'Okay, turning off the lights.' } };
        f.emit(speech);
        assert.strictEqual(f.resolved.length, 1);
        assert.strictEqual(f.resolved[0].data, speech);
        assert(!f.logs.join(' ').includes('private-'));
        passed++;
    }
    {
        const f = fixture(null);
        f.emit(command);
        assert.strictEqual(f.requests[0].body.message, 'pairing_required');
        assert.strictEqual(f.resolved.length, 0);
        passed++;
    }
    {
        const f = fixture(saved);
        f.emit(command);
        f.requests[0].handlers.error({ code: 'ECONNREFUSED' });
        assert.strictEqual(f.requests[1].body.message, 'disconnected');
        assert.strictEqual(f.resolved.length, 0);
        passed++;
    }
    {
        const f = fixture(saved);
        f.emit(command);
        Array.from(f.timers.values())[0].fn();
        assert.strictEqual(f.requests[1].body.message, 'timeout');
        assert(f.requests[0].destroyed);
        passed++;
    }
    {
        const f = fixture(saved);
        f.emit(command);
        respond(f.requests[0], { status: 'error', message: 'auth_failed' }, 401);
        assert.strictEqual(f.requests[1].body.message, 'auth_failed');
        passed++;
    }
    return passed;
}
if (typeof module !== 'undefined') { module.exports = runTests; }
if (typeof require !== 'undefined' && require.main === module) {
    const fs = require('fs'), path = require('path');
    const root = path.join(__dirname, '../@be/be');
    console.log(runTests(fs.readFileSync(path.join(root, 'beacon/lib/homeassistant-command.js'), 'utf8'),
        fs.readFileSync(path.join(root, 'node_modules/@jibo/jetstream-client/lib/jetstream-client.js'), 'utf8'),
        require('assert'), Buffer) + ' native robot relay tests passed');
}
