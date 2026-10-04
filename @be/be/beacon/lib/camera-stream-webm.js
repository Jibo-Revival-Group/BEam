'use strict';

// Parse EBML element boundaries rather than scanning compressed payloads for
// Cluster markers. A new viewer starts at a video keyframe with the WebM init.
const EventEmitter = require('events');
const LIMIT = 8 * 1024 * 1024;

function header(bytes, offset) {
    if (offset >= bytes.length) { return null; }
    function vint(at, keepMarker) {
        if (at >= bytes.length || !bytes[at]) { return null; }
        let length = 1, marker = 128;
        while (!(bytes[at] & marker)) { marker >>= 1; length++; }
        if (length > (keepMarker ? 4 : 8)) { throw new Error('Invalid EBML integer'); }
        if (at + length > bytes.length) { return null; }
        let value = keepMarker ? bytes[at] : bytes[at] & (marker - 1);
        let unknown = !keepMarker && value === marker - 1;
        for (let i = 1; i < length; i++) {
            value = value * 256 + bytes[at + i];
            unknown = unknown && bytes[at + i] === 255;
        }
        if (!unknown && value > Number.MAX_SAFE_INTEGER) { throw new Error('Oversized EBML integer'); }
        return { value: value, length: length, unknown: unknown };
    }
    const id = vint(offset, true);
    if (!id) { return null; }
    const size = vint(offset + id.length, false);
    if (!size) { return null; }
    return { id: id.value, size: size.value, unknown: size.unknown,
        length: id.length + size.length, sizeOffset: offset + id.length, sizeLength: size.length };
}

function keyframe(cluster, offset) {
    while (offset < cluster.length) {
        const item = header(cluster, offset);
        if (!item || item.unknown || offset + item.length + item.size > cluster.length) {
            throw new Error('Invalid WebM Cluster');
        }
        if (item.id === 0xA3) { // SimpleBlock; validation requires video-only track 1.
            const start = offset + item.length;
            if (item.size < 4 || cluster[start] !== 0x81) { throw new Error('Expected video-only WebM track 1'); }
            return !!(cluster[start + 3] & 128);
        }
        offset += item.length + item.size;
    }
    return false;
}

function children(bytes, offset) {
    const items = [];
    while (offset < bytes.length) {
        const item = header(bytes, offset);
        if (!item || item.unknown || offset + item.length + item.size > bytes.length) {
            throw new Error('Invalid WebM metadata');
        }
        items.push({ id: item.id, data: bytes.slice(offset + item.length, offset + item.length + item.size) });
        offset += item.length + item.size;
    }
    return items;
}

function tracksValid(bytes, offset) {
    const entries = children(bytes, offset).filter(item => item.id === 0xAE);
    if (entries.length !== 1) { return false; }
    const fields = children(entries[0].data, 0);
    function number(items, id) {
        const item = items.filter(value => value.id === id)[0];
        if (!item || !item.data.length || item.data.length > 4) { return -1; }
        let value = 0;
        for (let i = 0; i < item.data.length; i++) { value = value * 256 + item.data[i]; }
        return value;
    }
    const codec = fields.filter(item => item.id === 0x86)[0];
    const video = fields.filter(item => item.id === 0xE0)[0];
    if (number(fields, 0xD7) !== 1 || number(fields, 0x83) !== 1 ||
        !codec || codec.data.toString('utf8') !== 'V_VP8' || !video) { return false; }
    const dimensions = children(video.data, 0);
    return number(dimensions, 0xB0) === 640 && number(dimensions, 0xBA) === 360;
}

class WebM extends EventEmitter {
    constructor() {
        super();
        this.buffer = Buffer.alloc(0);
        this.initial = [];
        this.initialSize = 0;
        this.init = null;
        this.segment = false;
        this.videoValidated = false;
    }
    push(bytes) {
        if (this.buffer.length + bytes.length > LIMIT) { throw new Error('WebM buffer limit exceeded'); }
        this.buffer = Buffer.concat([this.buffer, bytes]);
        while (this.buffer.length) {
            const item = header(this.buffer, 0);
            if (!item) { return; }
            if (item.id === 0x18538067) {
                if (this.segment) { throw new Error('Multiple WebM segments are unsupported'); }
                this.segment = true;
                const segment = Buffer.from(this.buffer.slice(0, item.length));
                // Unknown size permits an init followed by any future clusters.
                segment[item.sizeOffset] = (1 << (9 - item.sizeLength)) - 1;
                segment.fill(255, item.sizeOffset + 1);
                this.addInitial(segment);
                this.buffer = this.buffer.slice(item.length);
                continue;
            }
            if (item.unknown || item.size > LIMIT) { throw new Error('Expected bounded WebM elements'); }
            const total = item.length + item.size;
            if (this.buffer.length < total) { return; }
            const element = Buffer.from(this.buffer.slice(0, total));
            this.buffer = this.buffer.slice(total);
            if (item.id === 0x1F43B675) {
                if (!this.segment) { throw new Error('Missing WebM Segment'); }
                if (!this.videoValidated) { throw new Error('Expected video-only 640x360 VP8 WebM'); }
                if (!this.init) { this.init = Buffer.concat(this.initial); this.initial = []; }
                this.emit('cluster', element, keyframe(element, item.length));
            } else if (!this.init) {
                if (!this.initial.length && item.id !== 0x1A45DFA3) { throw new Error('Missing EBML header'); }
                if (item.id === 0x1654AE6B) {
                    if (this.videoValidated || !tracksValid(element, item.length)) {
                        throw new Error('Expected video-only 640x360 VP8 WebM');
                    }
                    this.videoValidated = true;
                }
                this.addInitial(element);
            }
        }
    }
    addInitial(bytes) {
        this.initialSize += bytes.length;
        if (this.initialSize > LIMIT) { throw new Error('WebM initialization limit exceeded'); }
        this.initial.push(bytes);
    }
    clear() {
        this.buffer = Buffer.alloc(0);
        this.initial = [];
        this.init = null;
        this.removeAllListeners();
    }
}

module.exports = WebM;
