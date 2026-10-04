'use strict';

const auth = require('./camera-stream-http').authenticate;
const u = require('./http-util');

function status(req, res) {
    auth(req);
    let level;
    try { level = require('jibo').system.getBatteryLevel(); }
    catch (error) { level = null; }
    if (typeof level !== 'number' || !Number.isFinite(level) || level < 0 || level > 100) {
        const error = new Error('Battery reading unavailable');
        error.status = 503;
        throw error;
    }
    res.setHeader('Cache-Control', 'no-store');
    u.sendJson(res, 200, { battery: Math.round(level * 10) / 10 });
}

module.exports = { status: status };
