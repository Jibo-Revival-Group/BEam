'use strict';

// The streaming client sometimes omits microformat entirely. The watch page
// still supplies a top-level genre meta tag; do not read recommendation JSON.
function parse(html) {
    const tags = String(html || '').match(/<meta\s[^>]*>/gi) || [];
    for (let i = 0; i < tags.length; i++) {
        const attributes = {}, pattern = /([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
        let match;
        while ((match = pattern.exec(tags[i]))) attributes[match[1].toLowerCase()] = match[2] === undefined ? match[3] : match[2];
        if (String(attributes.itemprop || '').toLowerCase() === 'genre' && attributes.content) return attributes.content.slice(0, 80);
    }
    return '';
}
function lookup(id, transport) {
    if (!/^[A-Za-z0-9_-]{11}$/.test(id)) return Promise.reject(Error('bad_video_id'));
    return transport('https://www.youtube.com/watch?v=' + id + '&hl=en', {
        headers: { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36', 'Accept-Encoding': 'gzip' },
        timeoutMs: 6000, maxBytes: 4 * 1024 * 1024
    }).then(response => parse(response.buffer.toString('utf8')));
}
module.exports = { parse: parse, lookup: lookup };
