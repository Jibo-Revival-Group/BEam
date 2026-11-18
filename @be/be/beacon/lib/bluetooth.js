'use strict';

// Jibo as a Bluetooth speaker. Talks to BEnch's jibo-bluetooth daemon over its local socket (one command line in,
// one JSON line out). While a phone is connected Jibo is in Bluetooth mode (@be/bluetooth), and the phone's volume
// slider and Jibo's volume are kept the same (AVRCP absolute volume, 0-127).
const net = require('net');

const SOCKET = process.env.JIBO_BLUETOOTH_SOCKET || '/tmp/jibo-bluetooth.sock';
const SKILL = '@be/bluetooth';
const WATCH_MS = 1000;

function command (line) {
    return new Promise((resolve, reject) => {
        let data = '';
        const socket = net.connect(SOCKET);
        socket.setTimeout(6000, () => socket.destroy(new Error('Bluetooth didn’t answer.'))); // "on" takes ~3 s
        socket.on('connect', () => socket.write(line + '\n'));
        socket.on('data', (chunk) => { data += chunk; });
        socket.on('error', () => reject(new Error('Bluetooth isn’t available on this robot.')));
        socket.on('end', () => {
            let reply;
            try { reply = JSON.parse(data); } catch (err) { return reject(new Error('Bluetooth gave a bad answer.')); }
            if (reply.error) return reject(new Error(reply.error));
            resolve(reply);
        });
    });
}

const status = () => command('status');
const setEnabled = (on) => command(on ? 'on' : 'off');
const disconnect = () => command('disconnect');

// Jibo's volume (MIN_VOLUME..MAX_VOLUME) <-> AVRCP absolute volume 0-127.
function toPhone (level, v) { return Math.round((level - v.MIN_VOLUME) / (v.MAX_VOLUME - v.MIN_VOLUME) * 127); }
function toJibo (absolute, v) { return Math.round(v.MIN_VOLUME + absolute / 127 * (v.MAX_VOLUME - v.MIN_VOLUME)); }

// One watcher tick, given the daemon's status: enter Bluetooth mode and sync the volume.
// `state` remembers what was already handled between ticks.
function step (s, host, volume, state, Data) {
    if (!s.connected) { state.connected = false; return; }
    if (!state.connected) { // a phone just connected: its slider starts at Jibo's volume
        state.connected = true; state.seq = s.volumeSeq;
        command('volume ' + toPhone(volume.currentVolume, volume)).catch(() => {});
    } else if (s.volumeSeq !== state.seq) { // the phone's slider moved
        state.seq = s.volumeSeq;
        const level = toJibo(s.volume, volume);
        if (level !== volume.currentVolume && !volume._volumeChanging) {
            // The volume plugin's own silent setter (as AirPlay does): no volume beep on every slider step.
            state.fromPhone = level;
            volume._volumeChanging = true; volume.currentVolume = level; volume._setVolume(null, true);
        }
    }
    // Solely a speaker while connected: Bluetooth mode stays on screen (one redirect at a time; a switch takes a moment).
    const now = Date.now();
    if (host.currentSkill && host.currentSkill.assetPack !== SKILL && !(now - (state.redirected || 0) < 5000)) {
        state.redirected = now;
        host.redirect(new Data(host.ensureSkill(SKILL), {}));
    }
}

let timer = null;
function watch (getHost) {
    if (timer) return;
    const state = { connected: false };
    let busy = false, watched = null;
    timer = setInterval(() => {
        const host = getHost(), jibo = require('jibo'), volume = jibo.volume;
        if (busy || !host || !volume) return;
        if (watched !== volume) { // Jibo's volume changed (not by the phone): show it on the phone's slider
            watched = volume;
            volume.on('change', (level) => {
                if (!state.connected || level === state.fromPhone) { state.fromPhone = null; return; }
                command('volume ' + toPhone(level, volume)).catch(() => {});
            });
        }
        busy = true;
        status().then((s) => step(s, host, volume, state, require('../../lib/SkillSwitchData').default), () => {})
            .then(() => { busy = false; });
    }, WATCH_MS);
}

module.exports = { status, setEnabled, disconnect, toPhone, toJibo, step, watch, SKILL };
