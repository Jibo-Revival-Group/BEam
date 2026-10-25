'use strict';
const assert = require('assert');
const video = require('../video');
class Node {
    constructor(tag) { this.tag = tag; this.style = {}; this.children = []; this.listeners = {}; this.readyState = 0; this.paused = true; this.currentTime = 0; this.videoWidth = 640; this.videoHeight = 480; this.loads = 0; this.plays = 0; this.duration = 60; this.ranges = []; this.playbackRate = 1;
        this.buffered = { get length() { return this.owner.ranges.length; }, start: i => this.ranges[i][0], end: i => this.ranges[i][1], owner: this }; }
    appendChild(child) { child.parentNode = this; this.children.push(child); }
    removeChild(child) { this.children.splice(this.children.indexOf(child), 1); child.parentNode = null; }
    addEventListener(name, handler) { (this.listeners[name] || (this.listeners[name] = [])).push(handler); }
    removeEventListener(name, handler) { const list = this.listeners[name] || []; const at = list.indexOf(handler); if (at >= 0) list.splice(at, 1); }
    fire(name) { (this.listeners[name] || []).slice().forEach(handler => handler()); }
    setAttribute() {} removeAttribute(name) { if (name === 'src') this.src = ''; }
    load() { this.loads++; }
    play() { this.plays++; this.paused = false; this.fire('playing'); return Promise.resolve(); }
    pause() { this.paused = true; }
}
class Container {
    constructor() { this.children = []; }
    addChild(child) { child.parent = this; this.children.push(child); }
    removeChild(child) { this.children.splice(this.children.indexOf(child), 1); child.parent = null; }
    destroy() { this.destroyed = true; }
}
class Graphics { beginFill() {} drawRect() {} endFill() {} }
class VideoBaseTexture { constructor(media) { this.source = media; } update() {} }
class Texture { constructor(base) { this.baseTexture = base; } destroy() { this.destroyed = true; } }
class Sprite { constructor(texture) { this.texture = texture; } }
function signal() { const handlers = []; return { on: fn => handlers.push(fn), off: fn => handlers.splice(handlers.indexOf(fn), 1), fire: () => handlers.slice().forEach(fn => fn()), count: () => handlers.length }; }
module.exports = function () {
    const doc = { body: new Node('body'), createElement: name => new Node(name) };
    const PIXI = { Container: Container, Graphics: Graphics, VideoBaseTexture: VideoBaseTexture, Texture: Texture, Sprite: Sprite };
    const stage = new Container(), interrupt = signal();
    const options = { document: doc, PIXI: PIXI, stage: stage, jibo: { jetstream: { events: { hjHeard: interrupt } } }, url: 'http://127.0.0.1/video', audioUrl: 'http://127.0.0.1/audio', audio: true };
    const session = video.open(options); let stopped, ended = false;
    session.on('error', error => { throw Error(error.detail); });
    session.on('state', event => { if (event.state === 'stopped') stopped = event; if (event.state === 'ended') ended = true; });
    return new Promise(resolve => setTimeout(resolve, 5)).then(() => {
        assert.strictEqual(doc.body.children.length, 1); assert.strictEqual(stage.children.length, 1);
        assert.strictEqual(session.baseTexture.autoPlay, false); assert.strictEqual(session.media.crossOrigin, 'anonymous');
        session.media.readyState = 2; session.media.ranges = [[0, 0.1]]; session.media.fire('loadeddata');
        assert(session.media.paused, 'video waits for the separate audio stream');
        session.audio.readyState = 3; session.audio.ranges = [[0, 10]]; session.audio.fire('loadeddata');
        assert(session.media.paused && session.audio.paused, 'one decoded frame must not start playback');
        session.media.readyState = 3; session.media.ranges = [[0, 0.4]]; session.media.fire('canplay');
        session.sync(); assert.strictEqual(session.media.plays, 0, 'canplay alone does not bypass the initial buffer');
        session.media.ranges = [[0, 3.1]]; session.media.fire('progress');
        assert(!session.media.paused); assert(!session.audio.paused); assert.strictEqual(session.state, 'playing');
        assert.strictEqual(session.sprite.width, 960); assert.strictEqual(session.sprite.x, 160);
        session.media.currentTime = 5; session.audio.currentTime = 7; session.sync(); assert.strictEqual(session.audio.currentTime, 7, 'sync must not seek a sequential audio stream');
        assert.strictEqual(session.audio.playbackRate, 0.95);
        for (let i = 0; i < 10; i++) session.sync();
        assert.strictEqual(session.audio.currentTime, 7); assert.strictEqual(session.audio.loads, 1, 'sync must not reload audio');
        session.media.ranges = [[0, 20]]; session.audio.ranges = [[0, 20]];
        assert.strictEqual(session.position(), 5);
        session.pause(); assert(session.media.paused && session.audio.paused);
        return Promise.resolve();
    }).then(() => {
        session.show(); assert(!session.media.paused && !session.audio.paused);
        session.media.ranges = [[0, 5.1]]; session.audio.ranges = [[0, 7.1]];
        session.media.fire('waiting'); assert(session.media.paused && session.audio.paused); assert.strictEqual(session.state, 'buffering');
        return Promise.resolve();
    }).then(() => {
        const plays = session.media.plays;
        for (let i = 0; i < 10; i++) { session.media.fire('canplay'); session.audio.fire('progress'); session.sync(); }
        session.media.fire('playing');
        assert.strictEqual(session.state, 'buffering', 'late playing event cannot undo buffering');
        assert.strictEqual(session.media.plays, plays, 'small incoming slices must not restart playback');
        assert(session.media.paused && session.audio.paused);
        session.media.ranges = [[0, 15]]; session.media.fire('progress');
        assert(session.media.paused, 'video must wait for audio headroom too');
        session.audio.ranges = [[0, 17]]; session.audio.fire('progress');
        assert(!session.media.paused && !session.audio.paused);
        session.audio.currentTime = 4; session.sync(); assert.strictEqual(session.audio.playbackRate, 1.05);
        assert.strictEqual(session.audio.currentTime, 4);
        session.audio.currentTime = 5.02; session.sync(); assert.strictEqual(session.audio.playbackRate, 1);
        session.media.duration = 6; session.media.ranges = [[0, 6]];
        assert(session.bufferedEnough(session.media), 'fully buffered short remainder may play without five extra seconds');
        session.media.fire('ended'); assert(ended); assert(session.audio.paused);
        const media = session.media, texture = session.texture;
        interrupt.fire(); assert(stopped && /^interrupted:/.test(stopped.reason));
        assert.strictEqual(interrupt.count(), 0); assert.strictEqual(media.src, ''); assert(texture.destroyed);
        assert.strictEqual(stage.children.length, 0); assert.strictEqual(doc.body.children.length, 0); assert.strictEqual(video.current(), null);
        const failed = video.open(options); let error;
        failed.on('error', event => { error = event; });
        return new Promise(resolve => setTimeout(resolve, 5)).then(() => {
            failed.media.error = { code: 4, message: 'Unsupported format' }; failed.media.fire('error');
            assert.strictEqual(error.reason, 'media_4'); assert.strictEqual(failed.state, 'stopped'); assert.strictEqual(doc.body.children.length, 0);
            const early = video.open(options); return early.stop().then(() => assert.strictEqual(doc.body.children.length, 0));
        }).then(() => {
            // The production path uses one HTML video containing both tracks.
            const EventEmitter = require('events');
            class MediaSource extends Node {
                constructor() { super('source'); this.readyState = 'closed'; }
                static isTypeSupported() { return true; }
                addSourceBuffer() { const buffer = new Node('buffer'); buffer.abort = () => {}; return buffer; }
            }
            const requests = [];
            const joined = video.open(Object.assign({}, options, {
                videoMime: 'video/mp4; codecs="avc1.4d401e"', audioMime: 'audio/mp4; codecs="mp4a.40.2"',
                MediaSource: MediaSource, URL: { createObjectURL: () => 'blob:test', revokeObjectURL: () => {} },
                get: () => { const req = new EventEmitter(); req.abort = () => { req.aborted = true; }; requests.push(req); return req; }
            }));
            joined.on('error', error => { throw Error(error.detail); });
            return new Promise(resolve => setTimeout(resolve, 5)).then(() => {
                assert.strictEqual(joined.elements.length, 1); assert(!joined.audio); assert(!joined.media.muted);
                assert.strictEqual(joined.media.src, 'blob:test');
                joined.bufferedMedia.source.readyState = 'open'; joined.bufferedMedia.source.fire('sourceopen'); assert.strictEqual(requests.length, 2);
                joined.media.readyState = 3; joined.media.ranges = [[0.08, 5]]; joined.media.fire('progress');
                assert.strictEqual(joined.media.currentTime, 0.08, 'small initial DASH timestamp gap is handled inside MSE');
                assert.strictEqual(joined.state, 'playing');
                return joined.stop().then(() => { assert(requests.every(req => req.aborted)); assert.strictEqual(doc.body.children.length, 0); });
            });
        });
    }).then(() => watchdogs(options, doc)).then(() => video.shutdown(), error => video.shutdown().then(() => { throw error; }));
};

function watchdogs(options, doc) {
    let clock = 0, error;
    const start = video.open(Object.assign({}, options, { now: () => clock }));
    start.on('error', event => { error = event; });
    return new Promise(resolve => setTimeout(resolve, 5)).then(() => {
        clock = 25001; start.sync();
        assert.strictEqual(error.reason, 'media_timeout'); assert.strictEqual(start.state, 'stopped');
        assert.strictEqual(doc.body.children.length, 0);
        clock = 0; error = null;
        const stalled = video.open(Object.assign({}, options, { now: () => clock }));
        stalled.on('error', event => { error = event; });
        return new Promise(resolve => setTimeout(resolve, 5)).then(() => {
            stalled.elements.forEach(element => { element.readyState = 3; element.ranges = [[0, 60]]; });
            stalled.media.webkitDecodedFrameCount = 1; stalled.media.fire('progress');
            assert.strictEqual(stalled.state, 'playing');
            clock = 1000; stalled.media.currentTime = 1; stalled.sync();
            stalled.pause(); clock = 50000; stalled.sync(); assert(!error, 'pause never trips the stall watchdog');
            stalled.show(); clock += 14000; stalled.sync(); assert(!error, 'resume gets a fresh stall deadline');
            stalled.media.currentTime = 2; stalled.media.webkitDecodedFrameCount = 2; stalled.sync();
            clock += 14000; stalled.sync(); assert(!error, 'decoded progress extends the deadline');
            // An advancing media clock with a frozen decoder is still a stall.
            stalled.media.currentTime = 30; clock += 1001; stalled.sync();
            assert.strictEqual(error.reason, 'playback_stalled'); assert.strictEqual(stalled.state, 'stopped');
            assert.strictEqual(doc.body.children.length, 0);
            clock = 0; error = null;
            const rebuffer = video.open(Object.assign({}, options, { now: () => clock }));
            rebuffer.on('error', event => { error = event; });
            return new Promise(resolve => setTimeout(resolve, 5)).then(() => {
                rebuffer.elements.forEach(element => { element.readyState = 3; element.ranges = [[0, 10]]; });
                rebuffer.media.fire('progress'); rebuffer.media.fire('waiting');
                clock = 15001; rebuffer.sync();
                assert.strictEqual(error.reason, 'playback_stalled', 'rebuffering has a bounded wait');
                assert.strictEqual(doc.body.children.length, 0);
                console.log('PASS startup deadline, paused watchdog, resume grace, frozen decoder and rebuffer deadline');
            });
        });
    });
}
