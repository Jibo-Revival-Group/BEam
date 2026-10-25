'use strict';
const fs = require('fs');
const path = require('path');
const locations = require('./paths');
const LIMIT = 32768;
function clean(value) {
    return String(value || '').replace(/https?:\/\/[^\s"'<>]+/gi, '[media URL]')
        .replace(/[a-f0-9]{48}/gi, '[token]').replace(/[\x00-\x08\x0b-\x1f\x7f]/g, ' ').slice(0, 1200);
}
function record(source, detail) {
    const line = new Date().toISOString() + ' ' + source + ': ' + clean(detail) + '\n';
    try { console.warn('[music] ' + line.trim()); } catch (_) {}
    try {
        const dir = locations.ensureDirectory(locations.dataRoot()), file = path.join(dir, 'playback.log');
        if (fs.existsSync(file) && fs.statSync(file).size > LIMIT) fs.writeFileSync(file, '', { mode: 384 });
        fs.appendFileSync(file, line, { mode: 384 });
    } catch (_) {}
}
function message(error) {
    const detail = String(error && error.detail || '');
    if (/x_no_cookie|x_refused|x_closed|x_error|ENOENT.*X0/.test(detail)) return 'Cannot open the video display';
    if (/no element|no such element|gst-launch.*not found|Missing decoder/i.test(detail)) return 'A video playback component is missing';
    if (/alsa|audio device|MediaOut|omxaacdec/i.test(detail)) return 'Cannot start video sound';
    if (/403|401|Forbidden|Unauthorized/i.test(detail)) return 'The video stream was refused';
    if (/404|Not Found/i.test(detail)) return 'The video stream is unavailable';
    if (error && error.reason === 'media_4') return 'This video format cannot be played';
    if (error && error.reason === 'media_2') return 'The video stream could not be loaded';
    return 'Playback failed: ' + clean(detail || error && error.reason || 'unknown').slice(0, 150);
}
module.exports = { clean: clean, record: record, message: message };
