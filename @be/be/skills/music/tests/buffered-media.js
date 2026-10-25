'use strict';
const assert = require('assert'), EventEmitter = require('events');
const BufferedMedia = require('../buffered-media');
class Events {
    constructor() { this.events = {}; }
    addEventListener(name, fn) { (this.events[name] || (this.events[name] = [])).push(fn); }
    removeEventListener(name, fn) { const list = this.events[name] || []; const i = list.indexOf(fn); if (i >= 0) list.splice(i, 1); }
    fire(name) { (this.events[name] || []).slice().forEach(fn => fn()); }
}
class SourceBuffer extends Events {
    constructor() { super(); this.parts = []; this.updating = false; this.ranges = []; this.removals = [];
        this.buffered = { owner: this, get length() { return this.owner.ranges.length; }, start: i => this.ranges[i][0], end: i => this.ranges[i][1] }; }
    appendBuffer(bytes) { assert(!this.updating); this.parts.push(Buffer.from(bytes)); this.updating = true; }
    remove(start, end) { this.removals.push([start, end]); this.ranges = [[end, this.ranges[0][1]]]; this.updating = true; }
    complete() { this.updating = false; this.fire('updateend'); }
    abort() { this.aborted = true; this.updating = false; }
}
class MediaSource extends Events {
    constructor() { super(); this.readyState = 'closed'; this.buffers = []; }
    static isTypeSupported(mime) { return /avc1|mp4a/.test(mime); }
    addSourceBuffer(mime) { const b = new SourceBuffer(); b.mime = mime; this.buffers.push(b); return b; }
    endOfStream() { this.readyState = 'ended'; }
}
module.exports = function () {
    const requests = [], responses = [], media = { currentTime: 0 };
    let revoked = false;
    const options = { MediaSource: MediaSource, URL: { createObjectURL: () => 'blob:test', revokeObjectURL: value => { assert.strictEqual(value, 'blob:test'); revoked = true; } },
        url: 'http://localhost/video', audioUrl: 'http://localhost/audio', videoMime: 'video/mp4; codecs="avc1.4d401e"', audioMime: 'audio/mp4; codecs="mp4a.40.2"',
        get: () => { const request = new EventEmitter(); request.abort = () => { request.aborted = true; }; requests.push(request); return request; } };
    const errors = [], stream = new BufferedMedia(media, options, (reason, detail) => errors.push({ reason: reason, detail: detail }));
    try {
        assert.strictEqual(media.src, 'blob:test'); assert.strictEqual(requests.length, 0);
        stream.source.readyState = 'open'; stream.source.fire('sourceopen'); assert.strictEqual(stream.source.buffers.length, 2);
        requests.forEach(request => {
            const response = new EventEmitter(); response.statusCode = 200;
            response.pause = () => { response.paused = true; }; response.resume = () => { response.paused = false; };
            response.destroy = () => { response.destroyed = true; };
            responses.push(response); request.emit('response', response);
        });
        // Data keeps being appended while playback is paused at zero, unlike
        // automatic <video src> preload. Preserve order across updating states.
        const input = Buffer.from([1, 2, 3, 4, 5]);
        responses[0].emit('data', input.slice(1, 4)); responses[0].emit('data', Buffer.from([6, 7]));
        const video = stream.source.buffers[0]; assert.strictEqual(video.parts.length, 1);
        assert.deepEqual(Array.from(video.parts[0]), [2, 3, 4], 'copy only the Buffer slice, not its whole backing slab');
        video.complete(); assert.strictEqual(video.parts.length, 2); assert.deepEqual(Array.from(video.parts[1]), [6, 7]); video.complete();
        responses[1].emit('data', Buffer.from([8])); stream.source.buffers[1].complete();
        // Slow consumers cannot accumulate unbounded pending network data.
        responses[0].emit('data', Buffer.alloc(100));
        responses[0].emit('data', Buffer.alloc(2 * 1024 * 1024)); assert(responses[0].paused);
        video.complete(); video.complete(); assert(!responses[0].paused);
        video.ranges = [[0, 25]]; stream.pump(stream.tracks[0]); assert(responses[0].paused);
        media.currentTime = 10; stream.pump(stream.tracks[0]); assert(!responses[0].paused);
        media.currentTime = 20; stream.pump(stream.tracks[0]); assert.deepEqual(video.removals[0], [0, 15]); video.complete();
        responses[0].emit('end'); responses[1].emit('end'); assert.strictEqual(stream.source.readyState, 'ended');
        assert.strictEqual(errors.length, 0);
    } finally { stream.close(); }
    assert(revoked); assert(requests.every(r => r.aborted)); assert(responses.every(r => r.destroyed));
    const failed = new BufferedMedia(media, options, (reason, detail) => errors.push({ reason: reason, detail: detail }));
    try { failed.source.readyState = 'open'; failed.source.fire('sourceopen'); requests[2].emit('error', Error('connection lost')); assert.strictEqual(errors[0].reason, 'media_buffer'); }
    finally { failed.close(); }
};
