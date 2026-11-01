'use strict';
// Timed lyrics: LRC parsing, picking the line being sung, and the LRCLIB lookup
// (exact match, then search by closest length), against a stand-in for lrclib.net.
const assert = require('assert'), https = require('https'), EventEmitter = require('events');

const asked = [];
let replies = {};
https.get = (options, callback) => {
    asked.push(options.path);
    const req = new EventEmitter(); req.setTimeout = () => {}; req.abort = () => {};
    const route = options.path.split('?')[0], reply = replies[route] || [404, ''];
    setImmediate(() => {
        const res = new EventEmitter(); res.statusCode = reply[0]; res.setEncoding = () => {};
        callback(res); res.emit('data', typeof reply[1] === 'string' ? reply[1] : JSON.stringify(reply[1])); res.emit('end');
    });
    return req;
};
const lyrics = require('../@be/be/skills/music/lyrics');

// LRC: several tags on one line, an empty instrumental line, unsorted input, junk lines.
const lines = lyrics.parse('[ar:Toto]\n[00:31.62]I hear the drums\n[00:03.89][01:10.5]Come on up\n[00:10.01]\nnot a lyric');
assert.deepStrictEqual(lines, [
    { t: 3.89, text: 'Come on up' }, { t: 10.01, text: '' }, { t: 31.62, text: 'I hear the drums' }, { t: 70.5, text: 'Come on up' }
]);
assert.strictEqual(lyrics.current(lines, 0), -1, 'before the first line');
assert.strictEqual(lyrics.current(lines, 3.89), 0);
assert.strictEqual(lyrics.current(lines, 31), 1);
assert.strictEqual(lyrics.current(lines, 999), 3);

const synced = '[00:01.00]one\n[00:02.00]two';
replies = { '/api/get': [200, { syncedLyrics: synced }] };
lyrics.find({ title: 'Africa', artist: 'Toto', duration: 295.4 }).then(found => {
    assert.deepStrictEqual(found.map(l => l.text), ['one', 'two']);
    assert.ok(/track_name=Africa/.test(asked[0]) && /artist_name=Toto/.test(asked[0]) && /duration=295/.test(asked[0]));
    // Cached: no second request for the same song.
    return lyrics.find({ title: 'africa', artist: 'TOTO', duration: 295 }).then(() => assert.strictEqual(asked.length, 1));
}).then(() => {
    // No exact match: search, skip results without timing, take the closest length.
    asked.length = 0;
    replies = { '/api/search': [200, [
        { duration: 200, syncedLyrics: '[00:01.00]far' },
        { duration: 241, plainLyrics: 'untimed' },
        { duration: 238, syncedLyrics: '[00:01.00]close' }
    ]] };
    return lyrics.find({ title: 'Mr. Brightside', artist: 'The Killers', duration: 240 });
}).then(found => {
    assert.deepStrictEqual(asked.map(p => p.split('?')[0]), ['/api/get', '/api/search']);
    assert.strictEqual(found[0].text, 'close');
    // Only untimed or wrong-length lyrics: no lyrics rather than the wrong song's.
    replies = { '/api/search': [200, [{ duration: 400, syncedLyrics: '[00:01.00]other song' }, { duration: 180, plainLyrics: 'x' }]] };
    return lyrics.find({ title: 'Some Song', artist: 'Someone', duration: 180 });
}).then(found => {
    assert.strictEqual(found, null);
    // A failed request isn't cached: the next tap tries again.
    replies = { '/api/get': [500, ''], '/api/search': [500, ''] };
    return lyrics.find({ title: 'Flaky', artist: 'Net', duration: 100 }).then(() => assert.fail('should fail'), () => {});
}).then(() => {
    replies = { '/api/get': [200, { syncedLyrics: synced }] };
    return lyrics.find({ title: 'Flaky', artist: 'Net', duration: 100 });
}).then(found => {
    assert.strictEqual(found.length, 2);
    console.log('lyrics tests passed');
}).catch(error => { console.error(error); process.exit(1); });
