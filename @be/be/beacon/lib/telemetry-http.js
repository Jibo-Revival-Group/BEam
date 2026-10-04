'use strict';

const authenticate = require('./camera-stream-http').authenticate;
const u = require('./http-util');
const WebSocket = require('ws');

function reading(getter, scale) {
    try {
        const value = getter();
        return typeof value === 'number' && Number.isFinite(value) ? value * (scale || 1) : null;
    } catch (error) { return null; }
}

function callbackReading(system, method) {
    return new Promise(resolve => {
        const timer = setTimeout(() => resolve(null), 2000);
        try {
            system[method]((error, value) => {
                clearTimeout(timer);
                resolve(!error && typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1 ? value * 100 : null);
            });
        } catch (error) { clearTimeout(timer); resolve(null); }
    });
}

function hatch(jibo) {
    return new Promise(resolve => {
        let socket, timer, finished = false;
        function finish(value) {
            if (finished) { return; }
            finished = true;
            clearTimeout(timer);
            if (socket) { socket.terminate(); }
            resolve(value);
        }
        timer = setTimeout(() => finish(null), 2000);
        try {
            const record = (jibo.records || []).filter(value => value.name === 'body')[0];
            let host = record && record.host || '127.0.0.1';
            if (host === '0.0.0.0') { host = '127.0.0.1'; }
            if (host.indexOf(':') !== -1 && host[0] !== '[') { host = '[' + host + ']'; }
            socket = new WebSocket('ws://' + host + ':' + (record && record.port || 8282) + '/misc');
            socket.on('error', () => finish(null));
            socket.on('close', () => finish(null));
            socket.on('message', bytes => {
                try {
                    const state = JSON.parse(String(bytes));
                    if (typeof state.hatch_open === 'boolean' || state.hatch_open === 0 || state.hatch_open === 1) {
                        finish(Boolean(state.hatch_open));
                    }
                } catch (error) { finish(null); }
            });
        } catch (error) { finish(null); }
    });
}

function status(req, res) {
    authenticate(req);
    const jibo = require('jibo');
    const system = jibo.system;
    const data = {
        battery: reading(() => system.getBatteryLevel()),
        battery_temperature: reading(() => system.getBatteryTemperature()),
        main_board_temperature: reading(() => system.getMainBoardTemperature()),
        cpu_temperature: reading(() => system.getCPUTemperature()),
        system_voltage: reading(() => system.getSystemVoltage()),
        plugged_in: null
    };
    try { if (typeof system.pluggedIn === 'boolean') { data.plugged_in = system.pluggedIn; } } catch (error) { /* unavailable */ }
    return Promise.all([callbackReading(system, 'getFanSpeed'), callbackReading(system, 'getMasterVolume'), hatch(jibo)])
        .then(values => {
            data.fan_speed = values[0];
            data.speaker_volume = values[1];
            data.hatch_open = values[2];
            res.setHeader('Cache-Control', 'no-store');
            u.sendJson(res, 200, data);
        });
}

module.exports = { status: status };
