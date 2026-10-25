'use strict';

const util = require('./util');
const normalize = require('./songs').normalize;
const cache = new Map();
let queue = Promise.resolve(), lastRequest = 0;
const USER_AGENT = 'BEam-Music/1.0 (https://5x1.com)';
function json(target) {
    return util.fetchBuffer(target, { timeoutMs: 4000, maxBytes: 512 * 1024, headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' } })
        .then(response => JSON.parse(response.buffer.toString('utf8')));
}
function lookup(song) {
    const key = normalize(song.title) + '|' + normalize(song.artist), hit = cache.get(key);
    if (hit && Date.now() - hit.at < 86400000) return Promise.resolve(hit.value);
    // Escape Lucene syntax; all requests are serialized with at least 1 s spacing.
    const quoted = value => '"' + String(value).replace(/["\\]/g, ' ').slice(0, 160) + '"';
    const work = queue.then(() => new Promise(resolve => setTimeout(resolve, Math.max(0, lastRequest + 1100 - Date.now()))))
        .then(() => {
            lastRequest = Date.now();
            const query = 'recording:' + quoted(song.title) + ' AND artist:' + quoted(song.artist);
            return json('https://musicbrainz.org/ws/2/recording/?fmt=json&limit=5&query=' + encodeURIComponent(query));
        }).then(data => {
            const recording = (data.recordings || []).filter(item => normalize(item.title) === normalize(song.title) &&
                (item['artist-credit'] || []).some(credit => normalize(credit.name || credit.artist && credit.artist.name) === normalize(song.artist)))[0];
            const release = recording && (recording.releases || [])[0];
            if (!release || !/^[a-f0-9-]{36}$/.test(release.id)) return null;
            return util.fetchBuffer('https://coverartarchive.org/release/' + release.id + '/front-500', {
                timeoutMs: 4000, maxBytes: 1024 * 1024, headers: { 'User-Agent': USER_AGENT }
            }).then(result => /^image\/(jpeg|png|webp)/i.test(result.contentType || '') ? result : null);
        }).catch(() => null).then(value => {
            cache.set(key, { at: Date.now(), value: value });
            if (cache.size > 16) cache.delete(cache.keys().next().value);
            return value;
        });
    queue = work.then(() => {}, () => {});
    return work;
}
module.exports = { lookup: lookup };
