'use strict';
// Explicit fragmented-MP4 buffering. One media element and MediaSource own both
// tracks, so the browser uses one playback clock and no cross-element seeking.
const http = require('http');
const https = require('https');
const url = require('url');
const timers = require('timers');
const MAX_QUEUE = 2 * 1024 * 1024, RESUME_QUEUE = 512 * 1024, AHEAD = 20;
class BufferedMedia {
    constructor(media, options, fail) {
        this.media = media; this.options = options; this.fail = fail;
        this.tracks = []; this.closed = false; this.listeners = [];
        const browser = typeof window !== 'undefined' ? window : global;
        this.MediaSource = options.MediaSource || browser.MediaSource;
        this.URL = options.URL || browser.URL;
        if (!this.MediaSource || !this.URL || !this.URL.createObjectURL) throw Error('buffered_media_unavailable');
        const formats = [{ url: options.url, mime: options.videoMime }];
        if (options.audioUrl) formats.push({ url: options.audioUrl, mime: options.audioMime });
        formats.forEach(format => {
            if (!format.mime || !this.MediaSource.isTypeSupported(format.mime)) throw Error('unsupported_stream_codec');
        });
        this.source = new this.MediaSource();
        this.listen(this.source, 'sourceopen', () => {
            if (this.closed || this.started) return; this.started = true;
            try {
                formats.forEach(format => {
                    const track = { format: format, buffer: this.source.addSourceBuffer(format.mime), queue: [], bytes: 0, ended: false, paused: false };
                    this.tracks.push(track);
                    this.listen(track.buffer, 'updateend', () => this.pump(track));
                    this.listen(track.buffer, 'error', () => this.error('Media buffer rejected a fragment'));
                    this.fetch(track);
                });
            } catch (error) { this.error(error.message || String(error)); }
        });
        this.objectURL = this.URL.createObjectURL(this.source);
        media.src = this.objectURL;
        this.tick = timers.setInterval(() => this.tracks.forEach(track => this.pump(track)), 500);
    }
    listen(target, name, handler) {
        target.addEventListener(name, handler);
        this.listeners.push(() => target.removeEventListener(name, handler));
    }
    error(message) { if (!this.closed) this.fail('media_buffer', message); }
    fetch(track) {
        const get = this.options.get || (target => (url.parse(target).protocol === 'https:' ? https : http).get(target));
        try {
            const request = track.request = get(track.format.url);
            request.on('response', response => {
                if (this.closed) { response.destroy(); return; }
                track.response = response;
                if (response.statusCode !== 200) { this.error('Stream returned HTTP ' + response.statusCode); return; }
                response.on('data', chunk => {
                    if (this.closed) return;
                    track.queue.push(chunk); track.bytes += chunk.length;
                    this.pump(track);
                });
                response.on('end', () => { if (!this.closed) { track.ended = true; this.pump(track); } });
                response.on('aborted', () => this.error('Stream download was interrupted'));
                response.on('error', error => this.error(error.message || String(error)));
            });
            request.on('error', error => this.error(error.message || String(error)));
        } catch (error) { this.error(error.message || String(error)); }
    }
    ahead(track) {
        const ranges = track.buffer.buffered, at = this.media.currentTime || 0;
        for (let i = 0; i < ranges.length; i++) {
            if (ranges.start(i) <= at + 0.25 && ranges.end(i) > at) return ranges.end(i) - at;
        }
        return 0;
    }
    pump(track) {
        if (this.closed || this.source.readyState !== 'open') return;
        const ahead = this.ahead(track), response = track.response;
        if (response && !track.ended) {
            if (!track.paused && (track.bytes >= MAX_QUEUE || ahead >= AHEAD)) { response.pause(); track.paused = true; }
            else if (track.paused && track.bytes < RESUME_QUEUE && ahead < AHEAD) { track.paused = false; response.resume(); }
        }
        if (track.buffer.updating) return;
        // Keep only a small played tail in memory on the robot.
        const ranges = track.buffer.buffered, removeTo = (this.media.currentTime || 0) - 5;
        try {
            if (removeTo > 5 && ranges.length && ranges.start(0) < removeTo - 5) {
                track.buffer.remove(0, removeTo); return;
            }
            if (track.queue.length && ahead < AHEAD) {
                const chunks = []; let size = 0;
                while (track.queue.length && size < 256 * 1024) {
                    const chunk = track.queue.shift(); chunks.push(chunk); size += chunk.length;
                }
                track.bytes -= size;
                // Copy only the queued slices; Buffer slabs can contain other bytes.
                const bytes = new Uint8Array(size); let offset = 0;
                chunks.forEach(chunk => { bytes.set(chunk, offset); offset += chunk.length; });
                track.buffer.appendBuffer(bytes); return;
            }
            if (this.tracks.length && this.tracks.every(t => t.ended && !t.queue.length && !t.buffer.updating)) this.source.endOfStream();
        } catch (error) { this.error(error.message || String(error)); }
    }
    close() {
        if (this.closed) return;
        this.closed = true; timers.clearInterval(this.tick);
        this.listeners.forEach(off => { try { off(); } catch (_) {} }); this.listeners = [];
        this.tracks.forEach(track => {
            try { if (track.request) track.request.abort(); } catch (_) {}
            try { if (track.response) track.response.destroy(); } catch (_) {}
            track.queue = []; track.bytes = 0;
            try { if (this.source.readyState === 'open' && track.buffer.updating) track.buffer.abort(); } catch (_) {}
        });
        if (this.objectURL) this.URL.revokeObjectURL(this.objectURL);
        this.objectURL = null;
    }
}
module.exports = BufferedMedia;
