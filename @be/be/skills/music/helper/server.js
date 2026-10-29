'use strict';

const http = require('http'), url = require('url'), crypto = require('crypto');
const config = require('./lib/config'), songs = require('./lib/songs'), stream = require('./lib/stream');
const util = require('./lib/util'), artwork = require('./lib/artwork');
let server = null, busy = false;
const selected = new Map();
function headers(type) {
    return { 'Content-Type': type || 'application/json', 'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'X-BE-Music-Token, Range', 'Cache-Control': 'no-store', Connection: 'close' };
}
function send(response, status, value) {
    if (response.finished || response.destroyed) return;
    response.writeHead(status, headers()); response.end(JSON.stringify(value));
}
function authorized(request, query) {
    const token = String(query.token || request.headers['x-be-music-token'] || '');
    const provided = Buffer.from(token), expected = Buffer.from(config.token);
    if (!expected.length || provided.length !== expected.length) return false;
    if (typeof crypto.timingSafeEqual === 'function') return crypto.timingSafeEqual(provided, expected);
    // The robot's Node 6.5 predates timingSafeEqual (introduced in 6.6).
    let difference = 0;
    for (let i = 0; i < provided.length; i++) difference |= provided[i] ^ expected[i];
    return difference === 0;
}
function image(response, result) {
    if (!result) { response.writeHead(404, headers()); response.end(); return; }
    if (response.finished || response.destroyed) return;
    response.writeHead(200, headers(result.contentType)); response.end(result.buffer);
}
function handle(request, response) {
    const parsed = url.parse(request.url, true), query = parsed.query, pathname = parsed.pathname;
    if (request.method === 'OPTIONS') { response.writeHead(204, headers()); response.end(); return Promise.resolve(); }
    if (pathname === '/health') { send(response, 200, { ok: true, service: 'beam-music' }); return Promise.resolve(); }
    if (!authorized(request, query)) { send(response, 401, { error: 'unauthorized' }); return Promise.resolve(); }
    if (!/^(GET|HEAD)$/.test(request.method)) { send(response, 405, { error: 'method_not_allowed' }); return Promise.resolve(); }
    if (pathname === '/api/resolve') {
        const title = util.cleanText(query.title, 160), artist = util.cleanText(query.artist || '', 120);
        if (!title) { send(response, 400, { error: 'query_required' }); return Promise.resolve(); }
        if (busy) { send(response, 429, { error: 'provider_busy' }); return Promise.resolve(); }
        busy = true;
        let alive = true;
        response.once('close', () => { alive = false; });
        const timer = setTimeout(() => { alive = false; send(response, 504, { error: 'timeout' }); }, 55000);
        return songs.resolve({ title: title, artist: artist }, { alive: () => alive }).then(song => {
            if (!alive) return;
            selected.set(song.id, song);
            if (selected.size > 8) selected.delete(selected.keys().next().value);
            send(response, 200, song);
        }).catch(error => { if (alive) send(response, 502, { error: error.code || 'provider_unavailable' }); })
            .then(() => { busy = false; clearTimeout(timer); });
    }
    const proxy = /^\/stream\/([A-Za-z0-9_-]{11})\/(video|audio)$/.exec(pathname);
    const media = /^\/api\/stream\/([A-Za-z0-9_-]{11})$/.exec(pathname);
    const art = /^\/art\/([A-Za-z0-9_-]{11})$/.exec(pathname);
    const thumb = /^\/thumb\/([A-Za-z0-9_-]{11})\.jpg$/.exec(pathname);
    const id = (proxy || media || art || thumb || [])[1];
    if (!id || !selected.has(id)) { send(response, 404, { error: 'unavailable' }); return Promise.resolve(); }
    if (proxy) return stream.proxy(id, proxy[2], Math.max(0, Number(query.frag) || 0), Math.max(0, Number(query.t) || 0), request, response);
    if (media) return stream.info(id, Math.max(0, Number(query.t) || 0)).then(info => send(response, 200, info));
    if (art) return artwork.lookup(selected.get(id)).then(result => image(response, result));
    return util.fetchBuffer('https://i.ytimg.com/vi/' + id + '/hqdefault.jpg', { timeoutMs: 4000, maxBytes: 512 * 1024 })
        .then(result => image(response, result));
}
module.exports = {
    start: function () {
        server = http.createServer((request, response) => {
            Promise.resolve().then(() => handle(request, response)).catch(error => {
                if (!response.headersSent) send(response, 502, { error: util.safeCode(error) });
                else response.destroy();
            });
        });
        server.timeout = 0; // Node 6 drops sockets idle 120 s; a paused player is idle.
        server.listen(config.port, '127.0.0.1'); return server;
    },
    stop: function () { if (server) server.close(); },
    handle: handle
};
