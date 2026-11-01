'use strict';
// Timed lyrics from LRCLIB (lrclib.net, free, no key). find() resolves to
// [{ t: seconds, text }] sorted by time, or null when there are no timed lyrics.
const https = require('https');
const querystring = require('querystring');

const HOST = 'lrclib.net', AGENT = 'BEam Music (https://github.com/Jibo-Revival-Group/BEam)';
const cache = new Map();

function parse(lrc) {
    const lines = [];
    String(lrc || '').split(/\r?\n/).forEach(row => {
        const tags = [], re = /\[(\d+):(\d+(?:\.\d+)?)\]/g;
        let match, end = 0;
        while ((match = re.exec(row)) && match.index === end) { tags.push(Number(match[1]) * 60 + Number(match[2])); end = re.lastIndex; }
        const text = row.slice(end).trim();
        tags.forEach(t => lines.push({ t: t, text: text }));
    });
    return lines.sort((a, b) => a.t - b.t);
}

function get(path, query) {
    return new Promise((resolve, reject) => {
        const req = https.get({ host: HOST, path: path + '?' + querystring.stringify(query), headers: { 'User-Agent': AGENT } }, res => {
            let body = '';
            res.setEncoding('utf8');
            res.on('data', chunk => { body += chunk; if (body.length > 2e6) req.abort(); });
            res.on('end', () => {
                if (res.statusCode === 404) { resolve(null); return; }
                if (res.statusCode !== 200) { reject(Error('lyrics_http_' + res.statusCode)); return; }
                try { resolve(JSON.parse(body)); } catch (error) { reject(error); }
            });
        });
        req.setTimeout(8000, () => req.abort());
        req.on('error', reject);
    });
}

// Exact match first; otherwise search and take the timed result closest in length.
function lookup(title, artist, duration) {
    const exact = { track_name: title, artist_name: artist };
    if (duration > 0) exact.duration = Math.round(duration);
    return (artist ? get('/api/get', exact) : Promise.resolve(null)).catch(() => null).then(hit => {
        if (hit && hit.syncedLyrics) return hit.syncedLyrics;
        const search = artist ? { track_name: title, artist_name: artist } : { q: title };
        return get('/api/search', search).then(results => {
            const timed = (results || []).filter(r => r && r.syncedLyrics);
            if (duration > 0) timed.sort((a, b) => Math.abs(a.duration - duration) - Math.abs(b.duration - duration));
            const best = timed[0];
            return best && (!(duration > 0) || Math.abs(best.duration - duration) <= 15) ? best.syncedLyrics : null;
        });
    });
}

function find(song) {
    const title = String(song && song.title || '').trim(), artist = String(song && song.artist || '').trim();
    if (!title) return Promise.resolve(null);
    const key = title.toLowerCase() + '\n' + artist.toLowerCase();
    if (!cache.has(key)) {
        const pending = lookup(title, artist, Number(song.duration) || 0).then(lrc => {
            const lines = parse(lrc);
            return lines.length ? lines : null;
        });
        pending.catch(() => cache.delete(key)); // a network error can be retried
        cache.set(key, pending);
        if (cache.size > 20) cache.delete(cache.keys().next().value);
    }
    return cache.get(key);
}

// Index of the line being sung at `seconds` (-1 before the first line).
function current(lines, seconds) {
    let lo = 0, hi = lines.length - 1, at = -1;
    while (lo <= hi) { const mid = (lo + hi) >> 1; if (lines[mid].t <= seconds) { at = mid; lo = mid + 1; } else hi = mid - 1; }
    return at;
}

module.exports = { find: find, parse: parse, current: current };
