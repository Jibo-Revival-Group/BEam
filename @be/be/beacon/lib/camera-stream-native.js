'use strict';

const EventEmitter = require('events');
const fs = require('fs');
const path = require('path');
const http = require('http');
const homeassistant = require('./homeassistant');
const WebM = require('./camera-stream-webm');
const fail = require('./camera-stream').fail;
const MAX_VIEWERS = 8;

class NativeTransport extends EventEmitter {
    constructor() {
        super();
        this.viewers = new Set();
        this.request = null;
        this.source = null;
        this.parser = null;
        this.nativeStarted = false;
        this.validation = null;
        this.streamTimer = null;
    }
    prepare() {
        // No guessed native request is sent without an on-robot acceptance record.
        const file = path.join(path.dirname(homeassistant.configPath()), 'camera-stream-validation.json');
        try { this.validation = JSON.parse(fs.readFileSync(file, 'utf8')); }
        catch (error) { throw fail('Camera transport requires hardware validation; see BEam/docs/camera-streaming.md'); }
        const v = this.validation;
        if (v.validated !== true || v.width !== 640 || v.height !== 360 ||
            !(v.measuredFps >= 15) || !(v.maxKeyframeIntervalSeconds > 0 && v.maxKeyframeIntervalSeconds <= 2) ||
            v.videoOnly !== true || v.videoTrack !== 1 || v.boundedClusters !== true ||
            (v.camera !== 0 && v.camera !== 1) || v.stillCaptureVerified !== true ||
            v.orientationVerified !== true || v.cleanupVerified !== true || v.restartVerified !== true ||
            v.loopbackOnlyVerified !== true || !v.robotFirmware || !v.testedAt ||
            !v.start || typeof v.start !== 'object' || Array.isArray(v.start) ||
            !v.stop || typeof v.stop !== 'object' || Array.isArray(v.stop)) {
            throw fail('Camera hardware validation record is incomplete');
        }
    }
    post(route, payload) {
        return new Promise((resolve, reject) => {
            const body = JSON.stringify(payload);
            const request = http.request({ host: '127.0.0.1', port: 7979, path: route, method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } }, response => {
                response.resume();
                if (response.statusCode >= 200 && response.statusCode < 300) { resolve(); }
                else { reject(fail('Native camera request failed')); }
            });
            request.on('error', () => reject(fail('Native camera service unavailable')));
            request.setTimeout(5000, () => { request.abort(); reject(fail('Native camera request timed out')); });
            request.end(body);
        });
    }
    start() {
        this.nativeStarted = true; // A timed-out POST may still have started capture.
        return this.post('/media/streaming/start', this.validation.start).then(() => new Promise((resolve, reject) => {
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
            this.parser.on('cluster', (bytes, keyframe) => {
                if (keyframe) { finish(); }
                this.viewers.forEach(viewer => {
                    if (viewer.blocked) { viewer.response.destroy(); return; }
                    let packet = bytes;
                    if (!viewer.started) {
                        if (!keyframe) { return; }
                        viewer.started = true;
                        packet = Buffer.concat([this.parser.init, bytes]);
                    }
                    // A Cluster can exceed Node's high-water mark even on a
                    // fast connection. Give it until the next Cluster to drain.
                    if (!viewer.response.write(packet)) {
                        viewer.blocked = true;
                        viewer.response.once('drain', () => { viewer.blocked = false; });
                    }
                });
            });
            this.request = http.get({ host: '127.0.0.1', port: 7979, path: '/media/streaming/start' }, response => {
                this.source = response;
                if (response.statusCode !== 200 || (response.headers['content-type'] || '').split(';')[0] !== 'video/webm') {
                    response.destroy();
                    finish(fail('Native camera did not return WebM'));
                    return;
                }
                response.on('data', bytes => {
                    clearTimeout(this.streamTimer);
                    this.streamTimer = setTimeout(() => finish(fail('Native camera stalled')), 5000);
                    try { this.parser.push(bytes); }
                    catch (error) { finish(fail('Unsupported native WebM output')); response.destroy(); }
                });
                response.on('error', () => finish(fail('Native camera stream failed')));
                response.on('end', () => finish(fail('Native camera stream ended')));
            });
            this.request.on('error', () => finish(fail('Native camera connection failed')));
        }));
    }
    stream(req, res) {
        if (!this.parser || !this.parser.init) { throw fail('Camera stream unavailable'); }
        if (this.viewers.size >= MAX_VIEWERS) { throw fail('Too many camera viewers', 429); }
        res.writeHead(200, { 'Content-Type': 'video/webm', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
        const viewer = { response: res, started: false, blocked: false };
        this.viewers.add(viewer);
        res.on('close', () => this.viewers.delete(viewer));
    }
    stop() {
        clearTimeout(this.streamTimer);
        this.streamTimer = null;
        this.viewers.forEach(viewer => viewer.response.destroy());
        this.viewers.clear();
        if (this.source) { this.source.removeAllListeners(); this.source.destroy(); this.source = null; }
        if (this.request) { this.request.removeAllListeners('error'); this.request.on('error', () => {}); this.request.abort(); this.request = null; }
        if (this.parser) { this.parser.clear(); this.parser = null; }
        if (!this.nativeStarted) { return Promise.resolve(); }
        return this.post('/media/streaming/control', this.validation.stop).then(() => { this.nativeStarted = false; });
    }
}

module.exports = NativeTransport;
