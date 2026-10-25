'use strict';
// Upload only a new decoded frame. PIXI's default video ticker uploads the same
// picture repeatedly when the renderer runs faster than the source video.
const timers = require('timers');
module.exports = function frames(media, texture, options) {
    const browser = options || (typeof window !== 'undefined' ? window : {});
    const request = browser.requestAnimationFrame ? fn => browser.requestAnimationFrame(fn) : fn => timers.setTimeout(fn, 33);
    const cancel = browser.cancelAnimationFrame ? id => browser.cancelAnimationFrame(id) : id => timers.clearTimeout(id);
    let handle = null, stopped = false, last = null;
    function tick() {
        if (stopped) return;
        if (!media.paused && media.readyState >= 2) {
            const decoded = media.webkitDecodedFrameCount;
            const frame = typeof decoded === 'number' ? decoded : Math.floor(media.currentTime * 30);
            if (frame !== last) { last = frame; texture.update(); }
        }
        handle = request(tick);
    }
    handle = request(tick);
    return () => { stopped = true; if (handle !== null) cancel(handle); };
};
