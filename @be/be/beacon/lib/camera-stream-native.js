'use strict';

const EventEmitter = require('events');
const fs = require('fs');
const path = require('path');
const http = require('http');
const net = require('net');
const homeassistant = require('./homeassistant');
const WebM = require('./camera-stream-webm');
const fail = require('./camera-stream').fail;
const MAX_VIEWERS = 8;
const MAX_PENDING_BYTES = 1024 * 1024;

function writeViewer(viewer, packet) {
    if (viewer.blocked) {
        viewer.pendingBytes += packet.length;
        if (viewer.pendingBytes > MAX_PENDING_BYTES) { viewer.response.destroy(); return; }
        viewer.pending.push(packet);
        return;
    }
    if (!viewer.response.write(packet)) {
        viewer.blocked = true;
        viewer.response.once('drain', () => {
            viewer.blocked = false;
            if (viewer.pendingBytes) {
                const pending = Buffer.concat(viewer.pending, viewer.pendingBytes);
                viewer.pending = [];
                viewer.pendingBytes = 0;
                writeViewer(viewer, pending);
            }
        });
    }
}

class NativeTransport extends EventEmitter {
    constructor(runtime) {
        super();
        this.runtime = runtime;
        this.service = { host: '127.0.0.1', port: 8486 };
        this.viewers = new Set();
        this.source = null;
        this.parser = null;
        this.nativeStarted = false;
        this.validation = null;
        this.streamTimer = null;
    }
    prepare() {
        // Production embeds MediaService in LPS (8486); the standalone test
        // media service uses 7979. Prefer the same registry record as the SDK.
        const records = this.runtime && this.runtime.records;
        const record = Array.isArray(records) && records.filter(value => value.name === 'media')[0];
        this.service = { host: '127.0.0.1', port: 8486 };
        if (record) {
            const port = Number(record.port);
            if (typeof record.host !== 'string' || !record.host || !Number.isInteger(port) || port < 1 || port > 65535) {
                throw fail('Invalid registered native media service address');
            }
            this.service = { host: record.host === '0.0.0.0' ? '127.0.0.1' : record.host, port: port };
        }
        // Hardware measurements are recorded AFTER testing, not a startup gate.
        this.validation = { camera: 0, port: 5000,
            start: { enable: true, ip: '127.0.0.1', port: '5000' }, stop: {} };
        const file = path.join(path.dirname(homeassistant.configPath()), 'camera-stream-validation.json');
        let saved;
        try { saved = JSON.parse(fs.readFileSync(file, 'utf8')); }
        catch (error) {
            if (error.code === 'ENOENT') { return; }
            throw fail('Cannot read camera stream configuration');
        }
        if (!saved || typeof saved !== 'object' || Array.isArray(saved)) { throw fail('Invalid camera stream configuration'); }
        if (saved.camera !== undefined) { this.validation.camera = saved.camera; }
        if (saved.port !== undefined) { this.validation.port = Number(saved.port); }
        if (this.validation.camera !== 0 || !Number.isInteger(this.validation.port) ||
            this.validation.port < 1024 || this.validation.port > 65535) {
            throw fail('Native streaming uses camera 0 and requires a valid TCP port');
        }
        this.validation.start.port = String(this.validation.port);
    }
    post(route, payload) {
        return new Promise((resolve, reject) => {
            const body = JSON.stringify(payload);
            const request = http.request({ host: this.service.host, port: this.service.port, path: route, method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } }, response => {
                response.resume();
                if (response.statusCode >= 200 && response.statusCode < 300) { resolve(); }
                else { reject(fail('Native camera request failed (HTTP ' + response.statusCode + ')')); }
            });
            request.on('error', cause => {
                const code = cause && cause.code;
                const error = fail('Native camera service unavailable at ' + this.service.host + ':' + this.service.port +
                    (code ? ' (' + code + ')' : ''));
                error.requestNotSent = ['ECONNREFUSED', 'ENOTFOUND', 'EHOSTUNREACH', 'ENETUNREACH', 'EACCES'].indexOf(code) !== -1;
                reject(error);
            });
            request.setTimeout(5000, () => { request.abort(); reject(fail('Native camera request timed out')); });
            request.end(body);
        });
    }
    start() {
        this.nativeStarted = true; // A timed-out POST may still have started capture.
        return this.post('/media/streaming/start', this.validation.start).catch(error => {
            // A refused TCP connection cannot have started capture. A timeout
            // or broken connection may have, so those still require native stop.
            if (error.requestNotSent) { this.nativeStarted = false; }
            throw error;
        }).then(() => new Promise((resolve, reject) => {
            this.parser = new WebM();
            let ready = false;
            const timer = setTimeout(() => finish(fail('Native camera produced no keyframe')), 10000);
            const finish = error => {
                clearTimeout(timer);
                if (!ready) {
                    ready = true;
                    if (error) { reject(error); } else { resolve(); }
                } else if (error) {
                    this.emit('failure');
                }
            };
            this.parser.on('cluster', (bytes, keyframe, joinPacket) => {
                if (keyframe) { finish(); }
                this.viewers.forEach(viewer => {
                    let packet = bytes;
                    if (!viewer.started) {
                        if (!keyframe) { return; }
                        viewer.started = true;
                        packet = Buffer.concat([this.parser.init, joinPacket || bytes]);
                    }
                    writeViewer(viewer, packet);
                });
            });
            const connect = () => {
                const source = net.connect({ host: '127.0.0.1', port: this.validation.port });
                this.source = source;
                source.on('data', bytes => {
                    clearTimeout(this.streamTimer);
                    this.streamTimer = setTimeout(() => finish(fail('Native camera stalled')), 5000);
                    try { this.parser.push(bytes); }
                    catch (error) { finish(fail('Unsupported native WebM output: ' + error.message)); source.destroy(); }
                });
                source.on('error', error => {
                    if (!ready && error.code === 'ECONNREFUSED') {
                        source.removeAllListeners();
                        source.destroy();
                        this.streamTimer = setTimeout(connect, 100);
                    } else { finish(fail('Native camera stream failed')); }
                });
                source.on('end', () => finish(fail('Native camera stream ended')));
            };
            connect();
        }));
    }
    stream(req, res) {
        if (!this.parser || !this.parser.init) { throw fail('Camera stream unavailable'); }
        if (this.viewers.size >= MAX_VIEWERS) { throw fail('Too many camera viewers', 429); }
        res.writeHead(200, { 'Content-Type': 'video/webm', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
        const viewer = { response: res, started: false, blocked: false, pending: [], pendingBytes: 0 };
        this.viewers.add(viewer);
        res.on('close', () => {
            viewer.pending = [];
            viewer.pendingBytes = 0;
            this.viewers.delete(viewer);
        });
    }
    stop() {
        clearTimeout(this.streamTimer);
        this.streamTimer = null;
        this.viewers.forEach(viewer => viewer.response.destroy());
        this.viewers.clear();
        if (this.source) { this.source.removeAllListeners(); this.source.on('error', () => {}); this.source.destroy(); this.source = null; }
        if (this.parser) { this.parser.clear(); this.parser = null; }
        if (!this.nativeStarted) { return Promise.resolve(); }
        return this.post('/media/streaming/control', this.validation.stop).then(() => { this.nativeStarted = false; });
    }
}

module.exports = NativeTransport;
