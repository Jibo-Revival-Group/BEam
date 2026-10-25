'use strict';

// Real owned-process/authentication smoke test. --online also resolves the
// example song and prepares its stream without playing or downloading it.
const fs = require('fs'), os = require('os'), path = require('path'), http = require('http'), assert = require('assert');
const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'beam-music-helper-'));
process.env.BE_MUSIC_DATA_DIR = directory;
const service = require('../service'), Client = require('../client');
const settings = service.settings(), client = new Client(settings);
function get(route) {
    return new Promise((resolve, reject) => {
        const request = http.get(settings.base + route, response => { response.resume(); response.on('end', () => resolve(response.statusCode)); });
        request.on('error', reject);
    });
}
service.ensure().then(ok => {
    assert(ok, 'helper should start');
    assert.strictEqual(fs.statSync(path.join(directory, 'token')).mode & 511, 384);
    return get('/api/resolve?title=Hello');
}).then(status => {
    assert.strictEqual(status, 401); return get('/unknown?token=' + settings.token);
}).then(status => {
    assert.strictEqual(status, 404); return service.stop();
}).then(() => service.ensure()).then(ok => {
    assert(ok, 'helper should restart');
    console.log('PASS helper startup, authentication, shutdown and restart');
    if (process.argv.indexOf('--online') < 0) return;
    return client.resolve({ title: "Yes I'm A Mess" }).then(song => {
        assert(/\bAJR\b/i.test(song.artist), 'title-only request should identify AJR');
        console.log('PASS title-only request identifies AJR');
        return client.resolve({ title: "Yes I'm A Mess", artist: 'AJR' });
    }).then(song => {
        console.log('Resolved: ' + song.title + ' by ' + song.artist + ' (' + song.format + ')');
        return client.stream(song.id, 0);
    }).then(info => {
        assert(info.video && info.audio); console.log('PASS online song resolution and AVC/AAC stream preparation');
        const requests = [
            { title: 'The Big Goodbye' }, { title: 'Bang!' }, { title: 'Bang!', artist: 'A J R' }, { title: 'The Big Goodbye', artist: 'A jar' }
        ];
        return requests.reduce((chain, request) => chain.then(() => client.resolve(request)).then(song => {
            assert(/\bAJR\b/i.test(song.artist), 'example request should identify AJR');
            console.log('PASS online ' + JSON.stringify(request) + ' resolves to ' + song.title + ' by ' + song.artist);
            return client.stream(song.id, 0).then(stream => assert(stream.video && stream.audio));
        }), Promise.resolve());
    });
}).then(() => { client.close(); return service.stop(); }).catch(error => {
    client.close(); console.error(error.message); process.exitCode = 1; return service.stop();
}).then(() => {
    // Only our generated token/cache directory is removed.
    function remove(directory) {
        fs.readdirSync(directory).forEach(name => {
            const file = path.join(directory, name);
            if (fs.statSync(file).isDirectory()) remove(file); else fs.unlinkSync(file);
        });
        fs.rmdirSync(directory);
    }
    remove(directory);
});
