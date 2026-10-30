'use strict';

// Standalone on purpose: runs before any service/skill dependencies (Node 6).
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');

function directory(dir, mode) {
    var created = false;
    try {
        fs.mkdirSync(dir, mode === undefined ? 0o777 : mode);
        created = true;
    } catch (err) {
        if (err.code === 'ENOENT') {
            directory(path.dirname(dir), mode);
            return directory(dir, mode);
        }
        if (err.code !== 'EEXIST') { throw err; }
    }
    if (!fs.statSync(dir).isDirectory()) { throw new Error('Expected directory: ' + dir); }
    if (created) { fs.chmodSync(dir, mode === undefined ? 0o777 : mode); }
    fs.accessSync(dir, fs.constants.R_OK | fs.constants.W_OK | fs.constants.X_OK);
    return dir;
}

function readObject(file) {
    var data;
    try { data = JSON.parse(fs.readFileSync(file, 'utf8')); }
    catch (err) {
        if (err.code === 'ENOENT') { return null; }
        throw new Error('Cannot read valid JSON at ' + file);
    }
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw new Error('Expected JSON object at ' + file);
    }
    return data;
}

// Publish a complete file without overwriting a concurrent creator's data.
function createObject(file, data, mode) {
    var tmp = file + '.bootstrap-' + process.pid + '-' + crypto.randomBytes(8).toString('hex');
    try {
        fs.writeFileSync(tmp, JSON.stringify(data, null, 2) + '\n', { flag: 'wx', mode: mode || 0o666 });
        fs.chmodSync(tmp, mode || 0o666);
        try { fs.linkSync(tmp, file); }
        catch (err) { if (err.code !== 'EEXIST') { throw err; } }
    } finally {
        if (fs.existsSync(tmp)) { fs.unlinkSync(tmp); }
    }
    return readObject(file);
}

function defaultObject(file, data, validate, mode) {
    var current = readObject(file);
    if (current === null) { current = createObject(file, data, mode); }
    if (validate && !validate(current)) { throw new Error('Invalid settings at ' + file); }
    return current;
}

function beamData(dir) {
    directory(dir);
    ['eye', 'themes', 'custom-skills'].forEach(function (name) { directory(path.join(dir, name)); });
    try {
        defaultObject(path.join(dir, 'units.json'), { temperature: 'fahrenheit' }, function (v) {
            return v.temperature === 'fahrenheit' || v.temperature === 'celsius';
        });
    } catch (err) {
        // units.js already reads a damaged file as Fahrenheit; a unit preference must not stop Be booting.
        if (!/JSON|Invalid settings/.test(err.message)) { throw err; }
    }
    defaultObject(path.join(dir, 'camera-stream-settings.json'), { enabled: true }, function (v) {
        return typeof v.enabled === 'boolean';
    });
    return dir;
}

var common = ['/opt/jibo/Knowledge', '/opt/tmp'];
var beam = ['/opt/jibo/Knowledge/jukebox/music', '/opt/jibo/Knowledge/beacon', '/opt/tmp/beacon'];
var groups = {
    beam: beam,
    ssm: beam.concat(['/opt/jibo/Photos', '/opt/jibo/Recordings', '/opt/jibo/Media']),
    asr: ['/var/jibo/asr', '/var/jibo/asr/namelearning_temp', '/var/jibo/asr/sensory_data_td',
        '/var/jibo/asr/sensory_data_td/audio', '/var/jibo/asr/sensory_auth_logs', '/var/jibo/asr/sensory_enroller_logs'],
    identity: ['/var/jibo/identity/faces', '/var/jibo/identity/deepid', '/var/jibo/identity/resnet'],
    lps: ['/opt/jibo/Photos', '/opt/jibo/Recordings', '/opt/jibo/data/recorder', '/opt/jibo/data/player'],
    media: ['/opt/jibo/Photos', '/opt/jibo/Photos/upload', '/opt/jibo/Photos/cache', '/opt/jibo/Recordings', '/opt/jibo/Media'],
    'secure-transfer': ['/var/jibo/keys']
};
['recorder', 'player'].forEach(function (kind) {
    ['audio/detections', 'body/axis', 'capture/frames', 'lps/visual-awareness', 'lps/audio-awareness'].forEach(function (part) {
        groups.lps.push('/opt/jibo/data/' + kind + '/' + part);
    });
});

function credentials(root) {
    directory(root + '/var/jibo', 0o755);
    return defaultObject(root + '/var/jibo/credentials.json', {
        accessKeyId: 'local-' + crypto.randomBytes(16).toString('hex'),
        secretAccessKey: crypto.randomBytes(32).toString('hex'),
        region: 'api', endpoint: 'http://joap.5x1.com:80'
    }, function (v) {
        return typeof v.accessKeyId === 'string' && !!v.accessKeyId.trim() &&
            typeof v.secretAccessKey === 'string' && !!v.secretAccessKey.trim();
    }, 0o600);
}

function ensure(options) {
    var opts = options || {};
    var root = opts.root ? path.resolve(opts.root) : '';
    var service = opts.service || 'all';
    var dirs = common.slice();
    if (service === 'all') {
        Object.keys(groups).forEach(function (key) { dirs = dirs.concat(groups[key]); });
    } else {
        dirs = dirs.concat(groups[service] || []);
        if (service === 'jetstream') { dirs = dirs.concat(groups.asr); }
    }
    if (opts.credentials !== false) { directory(root + '/var/jibo', 0o755); }
    dirs.forEach(function (dir) { directory(root + dir, dir === '/var/jibo/keys' ? 0o700 : undefined); });
    if (opts.credentials !== false) {
        try { credentials(root); }
        catch (err) {
            // Only cloud clients read credentials; a damaged file must not stop body, audio or SSM from starting.
            if (!/JSON|Invalid settings/.test(err.message)) { throw err; }
            console.error('[bootstrap] warning: ' + err.message + ' (left unchanged)');
        }
    }
    if (service === 'all' || service === 'beam' || service === 'ssm') {
        beamData(root + '/opt/jibo/Knowledge/beacon');
    }
}

function ensureBeam() {
    if ((process.platform === 'linux' && process.arch === 'arm') || fs.existsSync('/opt/jibo/Jibo/Skills')) {
        ensure({ service: 'beam', credentials: false });
    }
}

module.exports = { ensure: ensure, ensureBeam: ensureBeam, beamData: beamData,
    directory: directory, credentials: credentials };
