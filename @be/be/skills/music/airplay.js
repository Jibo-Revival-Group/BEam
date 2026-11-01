'use strict';
// Jibo as an AirPlay speaker: keeps shairport-sync running, reads its track metadata
// (UDP on 127.0.0.1) and opens the Music player when something starts playing.
// Be's page and the skill loader keep separate module caches; share one receiver between them.
module.exports = global.beAirplay || (global.beAirplay = create());

function create() {
    const child = require('child_process'), dgram = require('dgram'), http = require('http');
    const path = require('path'), EventEmitter = require('events');
    const locations = require('./paths');

    const BINARY = path.join(__dirname, 'airplay', 'shairport-sync');
    const CONFIG = path.join(__dirname, 'airplay', 'airplay.conf');
    const PORT = 18702, RATE = 44100;
    const events = new EventEmitter();
    const state = { active: false, playing: false, title: '', artist: '', album: '', art: null, artVersion: 0,
        duration: 0, position: 0, at: 0, remote: null, dacp: null };
    let proc = null, socket = null, restartDelay = 2000, pending = {}, chunks = {};

    function word(buffer, offset) { return buffer.toString('latin1', offset, offset + 4); }
    function changed() { events.emit('change', state); }

    // Position now, advancing from the last progress report while playing.
    function position() {
        if (!state.playing || !state.at) return state.position;
        return Math.min(state.duration || Infinity, state.position + (Date.now() - state.at) / 1000);
    }

    function item(type, code, data) {
        const text = () => data.toString('utf8');
        if (type === 'core') {
            if (code === 'minm') pending.title = text();
            else if (code === 'asar') pending.artist = text();
            else if (code === 'asal') pending.album = text();
            return;
        }
        if (type !== 'ssnc') return;
        switch (code) {
        case 'mdst': pending = {}; return;
        case 'mden':
            ['title', 'artist', 'album'].forEach(key => { if (key in pending) state[key] = pending[key]; });
            pending = {}; changed(); return;
        case 'PICT':
            state.art = data.length ? 'data:' + (data[0] === 0x89 ? 'image/png' : 'image/jpeg') + ';base64,' + data.toString('base64') : null;
            state.artVersion++; changed(); return;
        case 'prgr': {
            // "start/current/end" RTP frame numbers (they wrap at 2^32).
            const parts = text().split('/').map(Number);
            if (parts.length !== 3 || parts.some(isNaN)) return;
            state.duration = ((parts[2] - parts[0]) >>> 0) / RATE;
            state.position = ((parts[1] - parts[0]) >>> 0) / RATE;
            state.at = Date.now(); changed(); return;
        }
        case 'acre': state.remote = text(); return;
        case 'daid': state.dacp = text(); return;
        case 'pbeg': case 'prsm': case 'pres':
            state.position = position(); state.active = state.playing = true; state.at = Date.now();
            changed(); events.emit('started'); return;
        case 'pfls': case 'paus':
            state.position = position(); state.playing = false; changed(); return;
        case 'pend':
            state.position = position(); state.active = state.playing = false; state.title = state.artist = state.album = '';
            state.art = null; state.artVersion++; state.duration = state.position = 0; changed(); return;
        }
    }

    function packet(buffer) {
        if (buffer.length < 8) return;
        const type = word(buffer, 0), code = word(buffer, 4);
        if (type !== 'ssnc' || code !== 'chnk') { item(type, code, buffer.slice(8)); return; }
        // Large items (cover art) arrive as "ssnc chnk index total type code data".
        if (buffer.length < 24) return;
        const index = buffer.readUInt32BE(8), total = buffer.readUInt32BE(12), key = word(buffer, 16) + word(buffer, 20);
        let entry = chunks[key];
        if (!entry || entry.total !== total || index === 0) entry = chunks[key] = { total: total, parts: [], count: 0 };
        if (!entry.parts[index]) { entry.parts[index] = buffer.slice(24); entry.count++; }
        if (entry.count === total) { delete chunks[key]; item(word(buffer, 16), word(buffer, 20), Buffer.concat(entry.parts)); }
    }

    function spawn() {
        if (proc) return;
        const started = Date.now();
        try {
            proc = child.spawn(BINARY, ['-c', CONFIG, '--metadata-pipename', path.join(locations.ensureDirectory(locations.dataRoot()), 'airplay-metadata')],
                { stdio: 'ignore' });
        } catch (error) { proc = null; console.warn('[airplay] could not start:', error.message); return; }
        proc.on('error', error => console.warn('[airplay] receiver error:', error.message));
        proc.on('exit', code => {
            proc = null;
            if (state.active) item('ssnc', 'pend', Buffer.alloc(0));
            // A receiver that ran for a while restarts quickly; one that keeps dying backs off.
            restartDelay = Date.now() - started > 60000 ? 2000 : Math.min(restartDelay * 2, 300000);
            console.warn('[airplay] receiver exited (' + code + '), restarting in ' + restartDelay / 1000 + ' s');
            setTimeout(spawn, restartDelay);
        });
    }

    function start() {
        if (socket) return;
        socket = dgram.createSocket('udp4');
        socket.on('message', packet);
        socket.on('error', error => console.warn('[airplay] metadata socket:', error.message));
        socket.bind(PORT, '127.0.0.1', spawn);
    }

    // Ask the phone to pause/skip, using the DACP remote it announced for this session.
    function control(command) {
        if (!state.dacp || !state.remote) return Promise.reject(Error('no_remote'));
        return new Promise((resolve, reject) => {
            let out = '';
            const browse = child.spawn('/usr/bin/avahi-browse', ['-rpt', '_dacp._tcp'], { stdio: ['ignore', 'pipe', 'ignore'] });
            const timer = setTimeout(() => browse.kill(), 4000);
            browse.stdout.on('data', chunk => { out += chunk; });
            browse.on('error', error => { clearTimeout(timer); reject(error); });
            browse.on('close', () => {
                clearTimeout(timer);
                const lines = out.split('\n').filter(l => l[0] === '=' && l.split(';')[3] === 'iTunes_Ctrl_' + state.dacp);
                const line = lines.filter(l => l.split(';')[2] === 'IPv4')[0] || lines[0];
                if (!line) { reject(Error('remote_not_found')); return; }
                const fields = line.split(';');
                const host = fields[2] === 'IPv6' ? fields[7] + '%' + fields[1] : fields[7];
                const req = http.get({ host: host, port: Number(fields[8]), path: '/ctrl-int/1/' + command,
                    headers: { 'Active-Remote': state.remote }, timeout: 4000 }, res => { res.resume(); resolve(res.statusCode); });
                req.on('error', reject);
                req.on('timeout', () => req.abort());
            });
        });
    }

    // Open the Music player for AirPlay when nothing else is on screen.
    function show(be, Data) {
        if (!be || !be.skills || !be.skills['@be/music'] || be.currentSkill !== be.idle) return false;
        be.redirect(new Data(be.skills['@be/music'], { nlu: { intent: 'airplay', entities: { airplay: true } } }));
        return true;
    }
    events.on('started', () => {
        try { show(global.be, require('../../lib/SkillSwitchData').default); } catch (error) { console.warn('[airplay] show failed:', error.message); }
    });

    return { start: start, state: state, events: events, position: position, control: control, packet: packet, show: show };
}
