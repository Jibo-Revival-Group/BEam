'use strict';

const provider = require('./innertube');
const failure = require('./util').failure;
function normalize(value) {
    return String(value || '').toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9\u00c0-\uffff]+/g, ' ').trim().replace(/\s+/g, ' ');
}
function coverage(needle, haystack) {
    const words = normalize(needle).split(' ').filter(Boolean), text = ' ' + normalize(haystack) + ' ';
    return words.length ? words.filter(word => text.indexOf(' ' + word + ' ') >= 0).length / words.length : 0;
}
function cleanTitle(value) {
    return String(value || '').replace(/\([^)]*(?:official|lyrics?|audio|video|visuali[sz]er)[^)]*\)|\[[^\]]*(?:official|lyrics?|audio|video|visuali[sz]er)[^\]]*\]/gi, '')
        .replace(/\s*[-|]\s*(?:official\s+)?(?:music video|lyric video|lyrics|audio|visualizer)\s*$/i, '').trim();
}
function distance(a, b, limit) {
    if (Math.abs(a.length - b.length) > limit) return limit + 1;
    let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
        const row = [i]; let minimum = i;
        for (let j = 1; j <= b.length; j++) {
            row[j] = Math.min(row[j - 1] + 1, previous[j] + 1, previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
            minimum = Math.min(minimum, row[j]);
        }
        if (minimum > limit) return limit + 1;
        previous = row;
    }
    return previous[b.length];
}
function titleSimilarity(requested, actual) {
    const key = value => normalize(value).replace(/^(?:the|a|an)\s+/, '').replace(/\s+/g, '');
    const a = key(requested), b = key(actual);
    if (!a || !b) return 0;
    if (a === b) return 1;
    // Short titles must match the whole title: Bang is not Bang Bang.
    const length = Math.max(a.length, b.length);
    if (Math.min(a.length, b.length) < 5) return 0;
    const limit = Math.min(2, Math.floor(length * 0.15));
    const edits = distance(a, b, limit);
    return edits <= limit ? 1 - edits / length : 0;
}
function artistSimilarity(requested, actual) {
    // ASR often writes an acronym as separate letters or their spoken names.
    const letter = { ay: 'a', bee: 'b', cee: 'c', dee: 'd', ee: 'e', eff: 'f', gee: 'g', aitch: 'h', eye: 'i', jay: 'j', kay: 'k', el: 'l', em: 'm', en: 'n', oh: 'o', pee: 'p', cue: 'q', ar: 'r', ess: 's', tee: 't', you: 'u', vee: 'v', ex: 'x', why: 'y', zee: 'z', zed: 'z' };
    const key = value => {
        const words = normalize(value).replace(/\s*(?:vevo|topic|official(?: music)?)$/, '').trim().split(' ');
        const spelled = words.length > 1 && words.every(word => word.length === 1 || letter[word]);
        return (spelled ? words.map(word => letter[word] || word) : words).join('');
    };
    const a = key(requested), b = key(actual);
    if (!a || !b) return 0;
    if (a === b) return 1;
    if (Math.min(a.length, b.length) < 3 || Math.max(a.length, b.length) < 4) return 0;
    return distance(a, b, 1) <= 1 ? 0.9 : 0;
}
function metadata(video, request) {
    const parts = cleanTitle(video.title).split(/\s+[-–—|]\s+/);
    const channel = String(video.channel || '').replace(/\s*-?\s*Topic$|VEVO$|\s*Official(?: Music)?$/gi, '').trim();
    let artist = channel, title = cleanTitle(video.title);
    if (parts.length > 1) {
        // Providers generally use Artist - Song, but some uploaders reverse it.
        const songAt = coverage(request.title, parts[0]) > coverage(request.title, parts.slice(1).join(' ')) ? 0 : 1;
        title = songAt === 0 ? parts[0] : parts.slice(1).join(' - ');
        artist = songAt === 0 ? parts.slice(1).join(' - ') : parts[0];
    } else if (channel) {
        const prefix = channel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        title = title.replace(new RegExp('^' + prefix + '\\s*[:–—-]?\\s+', 'i'), '');
    }
    return { title: title || request.title, artist: artist || request.artist || 'Unknown artist' };
}
function score(video, request) {
    if (!video || !video.id || video.live || !video.duration) return -1;
    const title = video.title || '', evidence = title + ' ' + (video.channel || '');
    const identified = metadata(video, request), titleMatch = titleSimilarity(request.title, identified.title);
    if (!titleMatch) return -1;
    const artistMatch = request.artist ? artistSimilarity(request.artist, identified.artist) : 0;
    if (request.artist && !artistMatch) return -1;
    const unwanted = ['reaction', 'review', 'tutorial', 'interview', 'podcast', 'challenge', 'explained', 'compilation'];
    if (unwanted.some(word => coverage(word, title) === 1 && coverage(word, request.title) !== 1)) return -1;
    const music = (video.categories || []).some(category => normalize(category) === 'music');
    const identifiedMusic = /(?:-\s*Topic$|VEVO$)/i.test(video.channel || '') || !!video.musicArtist;
    if ((video.categories || []).length && !music) return -1;
    if (!music && !identifiedMusic) return -1;
    let result = titleMatch * 100 + artistMatch * 30;
    if (/official|\bVEVO\b|Topic$/i.test(evidence)) result += 15;
    ['cover', 'remix', 'live', 'karaoke', 'sped up', 'slowed'].forEach(word => {
        if (coverage(word, title) === 1 && coverage(word, request.title) !== 1) result -= 25;
    });
    return result;
}
function format(video) {
    if (/\blyric(?:s| video)?\b/i.test(video.title || '')) return 'lyrics';
    if (/\b(?:official audio|art track|audio only)\b/i.test(video.title || '')) return 'cover';
    return 'video';
}
function resolve(request, options) {
    options = options || {};
    const api = options.provider || provider, seen = new Set();
    const alive = options.alive || (() => true);
    const check = () => { if (!alive()) throw failure('cancelled'); };
    const query = [request.title, request.artist].filter(Boolean).join(' ');
    let providerError = null;
    function search(round) {
        check();
        // Broaden the second search, but still validate the requested artist.
        // This lets the provider recover from a misspelled artist in the query.
        return api.search(round ? request.title + ' official song music audio' : query + ' music', 24).then(items => {
            check();
            const matchTitle = item => Math.max(titleSimilarity(request.title, metadata(item, request).title),
                request.artist ? titleSimilarity(request.title + ' by ' + request.artist, metadata(item, { title: request.title + ' by ' + request.artist }).title) : 0);
            const candidates = items.filter(item => !seen.has(item.id) && matchTitle(item) > 0)
                .sort((a, b) => {
                    const rank = item => matchTitle(item) * 100 + artistSimilarity(request.artist, metadata(item, request).artist) * 30 + (/official|Topic$|VEVO/i.test(item.title + ' ' + item.channel) ? 10 : 0);
                    return rank(b) - rank(a);
                }).slice(0, 5);
            let best = null, bestScore = -1, bestRequest = request;
            return candidates.reduce((chain, candidate) => chain.then(() => {
                check(); seen.add(candidate.id);
                return api.video(candidate.id).then(video => {
                    check();
                    let matchingRequest = request, rank = score(video, request);
                    if (rank < 0 && video.categoryError) providerError = failure(video.categoryError);
                    // "Stand By Me" contains the same separator as "Hello by
                    // Adele". Permit the full phrase only when it actually is
                    // the recording's title; never drop a requested artist to
                    // accept an otherwise different recording.
                    if (rank < 0 && request.artist) {
                        const fullTitle = request.title + ' by ' + request.artist;
                        const inferred = metadata(video, { title: fullTitle });
                        if (normalize(inferred.title) === normalize(fullTitle)) {
                            matchingRequest = { title: fullTitle };
                            rank = score(video, matchingRequest);
                        }
                    }
                    if (rank > bestScore) { best = video; bestScore = rank; bestRequest = matchingRequest; }
                }, error => {
                    if (!/^(unavailable|age_restricted|region|members_only|unsupported_live|unsupported_format|audio_missing|video_too_long)$/.test(error.code || error.message)) providerError = error;
                });
            }), Promise.resolve()).then(() => {
                check();
                if (best) return Object.assign({ id: best.id, duration: best.duration, format: format(best), thumb: best.thumb }, metadata(best, bestRequest));
                if (!round) return search(1);
                if (providerError) throw providerError;
                throw failure('song_not_found');
            });
        });
    }
    return search(0);
}
module.exports = { resolve: resolve, score: score, format: format, metadata: metadata, normalize: normalize, coverage: coverage,
    titleSimilarity: titleSimilarity, artistSimilarity: artistSimilarity };
