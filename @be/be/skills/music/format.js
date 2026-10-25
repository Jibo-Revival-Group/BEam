'use strict';

// Compare a fixed anchor, not just adjacent frames: slow visualizers must not
// accumulate small changes and be mistaken for a still image.
class Detector {
    constructor(format) { this.format = format || 'video'; this.reset(); }
    reset() { this.anchor = null; this.stillSince = null; this.moving = 0; this.lastAt = null; }
    sample(pixels, seconds, playing) {
        if (!playing || !pixels || this.lastAt !== null && (seconds <= this.lastAt || seconds - this.lastAt > 2)) {
            this.reset(); return this.format;
        }
        if (this.format === 'lyrics') return this.format;
        this.lastAt = seconds;
        if (!this.anchor) { this.anchor = new Uint8Array(pixels); this.stillSince = seconds; return this.format; }
        let difference = 0;
        for (let i = 0; i < pixels.length; i += 4) {
            difference += Math.abs(pixels[i] - this.anchor[i]) + Math.abs(pixels[i + 1] - this.anchor[i + 1]) + Math.abs(pixels[i + 2] - this.anchor[i + 2]);
        }
        difference /= pixels.length / 4 * 3;
        if (difference < 6) {
            this.moving = 0;
            if (seconds - this.stillSince >= 12) this.format = 'cover';
        } else {
            this.moving++;
            if (this.moving >= 3) { this.format = 'video'; this.anchor = new Uint8Array(pixels); this.stillSince = seconds; this.moving = 0; }
        }
        return this.format;
    }
}
module.exports = Detector;
