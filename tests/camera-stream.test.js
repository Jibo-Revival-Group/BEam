'use strict';

const assert = require('assert');
const EventEmitter = require('events');
const fs = require('fs');
const path = require('path');
const CameraStream = require('../@be/be/beacon/lib/camera-stream').CameraStream;
const WebM = require('../@be/be/beacon/lib/camera-stream-webm');

function fixture() {
    const calls = [];
    const runtime = { private: false, isPrivate() { return this.private; },
        enter() { calls.push('enter'); return Promise.resolve(); },
        leave() { calls.push('leave'); return Promise.resolve(); },
        resume() { calls.push('resume'); } };
    const transport = new EventEmitter();
    Object.assign(transport, {
        prepare() { calls.push('prepare'); },
        start() { calls.push('start'); return Promise.resolve(); },
        stop() { calls.push('stop'); return Promise.resolve(); },
        stream() { calls.push('view'); }
    });
    return { controller: new CameraStream(runtime, transport), runtime, transport, calls };
}

function load(file, dependencies) {
    const module = { exports: {} };
    new Function('require', 'module', 'exports', fs.readFileSync(file, 'utf8'))(
        name => Object.prototype.hasOwnProperty.call(dependencies, name) ? dependencies[name] : require(name), module, module.exports);
    return module.exports;
}

// Small, valid EBML structure sufficient to exercise framing and join behavior.
function element(id, payload) {
    assert(payload.length < 127);
    return Buffer.concat([Buffer.from(id, 'hex'), Buffer.from([128 | payload.length]), payload]);
}
const ebml = element('1a45dfa3', Buffer.alloc(0));
const segment = Buffer.from('18538067ff', 'hex');
const tracks = element('1654ae6b', element('ae', Buffer.concat([
    element('d7', Buffer.from([1])), element('83', Buffer.from([1])),
    element('86', Buffer.from('V_VP8')), element('e0', Buffer.concat([
        element('b0', Buffer.from([2, 128])), element('ba', Buffer.from([1, 104]))
    ]))
])));
function cluster(isKey) {
    return element('1f43b675', element('a3', Buffer.from([0x81, 0, 0, isKey ? 128 : 0, 0])));
}

async function run() {
    {
        const f = fixture();
        await f.controller.command('start');
        await f.controller.command('start');
        assert.strictEqual(f.controller.status().streaming, true);
        assert.deepStrictEqual(f.calls, ['prepare', 'enter', 'start']);
        await f.controller.command('stop');
        await f.controller.command('stop');
        assert.deepStrictEqual(f.calls, ['prepare', 'enter', 'start', 'stop', 'leave', 'resume']);
        assert.strictEqual(f.controller.state, 'off');
    }
    {
        const f = fixture();
        f.runtime.private = true;
        await assert.rejects(f.controller.command('start'), /privacy/);
        assert.deepStrictEqual(f.calls, []);
        f.runtime.private = false;
        f.transport.prepare = () => { throw new Error('Hardware unvalidated'); };
        await assert.rejects(f.controller.command('start'), /unvalidated/);
        assert.deepStrictEqual(f.calls, []);
        assert.strictEqual(f.controller.state, 'off');
    }
    {
        const f = fixture();
        f.transport.start = () => Promise.reject(new Error('Capture failed'));
        await assert.rejects(f.controller.command('start'), /Capture failed/);
        assert.strictEqual(f.controller.state, 'off');
        assert.deepStrictEqual(f.calls, ['prepare', 'enter', 'stop', 'leave', 'resume']);
        f.transport.start = () => Promise.resolve();
        await f.controller.command('start'); // A rejection must not poison the queue.
        await f.controller.command('stop');
    }
    {
        const f = fixture();
        f.runtime.enter = () => Promise.reject(new Error('Hotword disable failed'));
        await assert.rejects(f.controller.command('start'), /Hotword disable/);
        assert.strictEqual(f.controller.state, 'off');
        assert.deepStrictEqual(f.calls, ['prepare', 'stop', 'leave', 'resume']);
        assert.strictEqual(f.calls.indexOf('start'), -1);
    }
    {
        const f = fixture();
        await f.controller.command('start');
        await f.controller.command('stop', { skipResume: true });
        assert.strictEqual(f.calls.indexOf('resume'), -1);
    }
    {
        const f = fixture();
        let release;
        f.transport.start = () => new Promise(resolve => { release = resolve; });
        const start = f.controller.command('start');
        const stop = f.controller.command('stop');
        while (!release) { await Promise.resolve(); }
        assert.strictEqual(f.controller.state, 'starting');
        release();
        await Promise.all([start, stop]);
        assert.strictEqual(f.controller.state, 'off');
        assert.deepStrictEqual(f.calls, ['prepare', 'enter', 'stop', 'leave', 'resume']);
    }
    {
        const f = fixture();
        await Promise.all([f.controller.command('toggle'), f.controller.command('toggle')]);
        assert.strictEqual(f.controller.state, 'off');
        await f.controller.command('start');
        f.transport.stop = () => Promise.reject(new Error('Cleanup failed'));
        await assert.rejects(f.controller.command('stop'), /retry Stop/);
        assert.strictEqual(f.controller.state, 'stopping');
        assert.strictEqual(f.calls.indexOf('leave'), 4); // Only the earlier successful toggle stop.
        await assert.rejects(f.controller.command('start'), /Finish stopping/);
        f.transport.stop = () => Promise.resolve();
        await f.controller.command('stop');
        assert.strictEqual(f.controller.state, 'off');
    }
    {
        const f = fixture();
        assert.throws(() => f.controller.stream({}, {}), /inactive/);
        await assert.rejects(f.controller.command('unknown'), /Invalid/);
        await f.controller.command('start');
        f.controller.stream({}, {});
        assert.strictEqual(f.controller.state, 'streaming');
        f.transport.emit('failure');
        await f.controller.queue;
        assert.strictEqual(f.controller.state, 'off');
        assert.strictEqual(f.controller.status().error, 'Native camera stream interrupted');
    }
    {
        const parser = new WebM();
        const emitted = [];
        parser.on('cluster', (bytes, key) => emitted.push({ bytes, key }));
        const data = Buffer.concat([ebml, segment, tracks, cluster(true), cluster(false)]);
        for (let i = 0; i < data.length; i++) { parser.push(data.slice(i, i + 1)); }
        assert.deepStrictEqual(emitted.map(item => item.key), [true, false]);
        assert.deepStrictEqual(parser.init, Buffer.concat([ebml, segment, tracks]));
        parser.clear();
        assert.strictEqual(parser.init, null);
        assert.strictEqual(parser.buffer.length, 0);
        const malformed = new WebM();
        assert.throws(() => malformed.push(Buffer.from('1a45dfa3ff', 'hex')), /bounded/);
        const wrongTracks = new WebM();
        assert.throws(() => wrongTracks.push(Buffer.concat([
            ebml, segment, element('1654ae6b', element('ae', element('83', Buffer.from([2])))), cluster(true)
        ])), /video-only/);
    }
    {
        const directory = path.resolve(__dirname, '../@be/be/beacon/lib');
        const auth = load(path.join(directory, 'camera-stream-http.js'), {
            './homeassistant': { readConfig: () => ({ password: 'secret' }) },
            './camera-stream': require(path.join(directory, 'camera-stream')),
            './http-util': {}
        });
        auth.authenticate({ headers: { authorization: 'Bearer secret' } });
        assert.throws(() => auth.authenticate({ headers: {} }), error => error.status === 401);
        assert.throws(() => auth.authenticate({ headers: { authorization: 'Bearer wrong' } }), error => error.status === 401);
    }
    {
        const directory = path.resolve(__dirname, '../@be/be/beacon/lib');
        const crypto = require('crypto');
        const status = { state: 'off', streaming: false };
        const auth = load(path.join(directory, 'camera-stream-http.js'), {
            crypto: { createHash: crypto.createHash }, // Jibo's older crypto API.
            './homeassistant': { readConfig: () => ({ password: 'secret' }) },
            './camera-stream': {
                fail: require(path.join(directory, 'camera-stream')).fail,
                getController: () => ({ status: () => status })
            },
            './http-util': { sendJson(res, code, body) { res.code = code; res.body = body; } }
        });
        const response = { setHeader() {} };
        auth.status({ headers: { authorization: 'Bearer secret' } }, response);
        assert.strictEqual(response.code, 200);
        assert.deepStrictEqual(response.body, status);
        ['', 'Bearer wrong', 'Bearer secreu', 'Bearer secre', 'Bearer secret-extra', 'Basic secret'].forEach(value => {
            assert.throws(() => auth.authenticate({ headers: { authorization: value } }), error => error.status === 401);
        });
        assert.throws(() => auth.authenticate({ headers: {} }), error => error.status === 401);
    }
    {
        const directory = path.resolve(__dirname, '../@be/be/beacon/lib');
        const Native = load(path.join(directory, 'camera-stream-native.js'), {
            './homeassistant': { configPath: () => '/tmp/pairing.json' },
            './camera-stream-webm': WebM,
            './camera-stream': require(path.join(directory, 'camera-stream')),
            fs: { readFileSync() { throw new Error('missing'); } }
        });
        assert.throws(() => new Native().prepare(), /hardware validation/);
        const capture = new Native();
        capture.parser = new WebM();
        capture.parser.push(Buffer.concat([ebml, segment, tracks, cluster(true)]));
        const response = new EventEmitter();
        response.writeHead = () => {};
        response.destroy = () => response.emit('close');
        capture.stream({}, response);
        assert.strictEqual(capture.viewers.size, 1);
        response.emit('close');
        assert.strictEqual(capture.viewers.size, 0);
        assert(capture.parser); // Closing a viewer does not stop capture.
        capture.stream({}, response);
        await capture.stop();
        assert.strictEqual(capture.viewers.size, 0);
        assert.strictEqual(capture.parser, null);
    }
    {
        const directory = path.resolve(__dirname, '../@be/be/beacon/lib');
        const posts = [];
        let gets = 0;
        let source;
        const http = {
            request(options, callback) {
                const request = new EventEmitter();
                request.setTimeout = () => {};
                request.abort = () => {};
                request.end = body => {
                    posts.push({ path: options.path, body: JSON.parse(body) });
                    process.nextTick(() => callback({ statusCode: 200, resume() {} }));
                };
                return request;
            },
            get(options, callback) {
                gets++;
                const request = new EventEmitter();
                request.abort = () => {};
                source = new EventEmitter();
                Object.assign(source, { statusCode: 200, headers: { 'content-type': 'video/webm' }, destroy() {} });
                process.nextTick(() => {
                    callback(source);
                    source.emit('data', Buffer.concat([ebml, segment, tracks, cluster(true)]));
                });
                return request;
            }
        };
        const Native = load(path.join(directory, 'camera-stream-native.js'), {
            http: http, './homeassistant': { configPath: () => '/tmp/pairing.json' },
            './camera-stream-webm': WebM, './camera-stream': require(path.join(directory, 'camera-stream'))
        });
        const native = new Native();
        native.validation = { start: { tested: 'start' }, stop: { tested: 'stop' } };
        await native.start();
        function viewer() {
            const response = new EventEmitter();
            response.packets = [];
            response.writeHead = () => {};
            response.write = data => { response.packets.push(data); return false; };
            response.destroy = () => { response.destroyed = true; response.emit('close'); };
            return response;
        }
        const first = viewer(), second = viewer();
        native.stream({}, first);
        native.stream({}, second);
        source.emit('data', cluster(false));
        assert.strictEqual(first.packets.length, 0, 'New viewers wait for a keyframe');
        source.emit('data', cluster(true));
        assert.strictEqual(first.packets.length, 1);
        assert.strictEqual(second.packets.length, 1);
        assert(!first.destroyed, 'Normal high-water-mark backpressure must not disconnect immediately');
        assert.deepStrictEqual(first.packets[0], Buffer.concat([native.parser.init, cluster(true)]));
        first.emit('drain');
        source.emit('data', cluster(false));
        assert.strictEqual(first.packets.length, 2);
        assert(second.destroyed, 'A viewer still blocked at the next cluster is too slow');
        assert.strictEqual(gets, 1, 'Viewers share the same capture connection');
        await native.stop();
        assert(first.destroyed);
        assert.deepStrictEqual(posts, [
            { path: '/media/streaming/start', body: { tested: 'start' } },
            { path: '/media/streaming/control', body: { tested: 'stop' } }
        ]);
    }
    {
        const api = require('../@be/be/beacon/lib/camera-stream-http');
        const server = require('../@be/be/beacon/server');
        const previous = api.isRestricted;
        api.isRestricted = () => true;
        const response = { setHeader() {}, writeHead(status) { this.status = status; }, end(body) { this.body = body; } };
        try {
            server.requestHandler({ method: 'POST', url: '/api/orchestra', headers: {} }, response);
            assert.strictEqual(response.status, 409);
            assert.match(response.body, /Stop camera streaming/);
            server.requestHandler({ method: 'GET', url: '/api/camera-stream/status', headers: {} }, response);
            assert.strictEqual(response.status, 401, 'Camera endpoints remain available with authentication');
        } finally { api.isRestricted = previous; }
    }
    console.log('Camera stream lifecycle, authentication, framing and viewer tests passed');
}

run().catch(error => { console.error(error); process.exitCode = 1; });
