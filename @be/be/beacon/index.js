'use strict';

/**
 * BEacon — BEam's web control panel.
 *
 * Started by the Be host from index.html, so it lives and dies with Be:
 *
 *     require('./beacon').start();
 *
 * Deliberately plain CommonJS with no dependencies: @be/be ships as a prebuilt
 * browserify bundle, and the robot runs Electron 1.4.3 (Node 6).
 */

const os = require('os');

const server = require('./server');
const eye = require('./lib/eye');
const paths = require('./lib/paths');

const DEFAULT_PORT = 8123;
const RETRY_DELAY_MS = 2000;

let instance = null;
let starting = false;

function log () {
    const args = Array.prototype.slice.call(arguments);
    console.log.apply(console, ['[beacon]'].concat(args));
}

function warn () {
    const args = Array.prototype.slice.call(arguments);
    console.warn.apply(console, ['[beacon]'].concat(args));
}

function lanAddresses () {
    const found = [];
    const ifaces = os.networkInterfaces();
    Object.keys(ifaces).forEach((name) => {
        (ifaces[name] || []).forEach((addr) => {
            if (addr.family === 'IPv4' && !addr.internal) { found.push(addr.address); }
        });
    });
    return found;
}

function listen (port, attempt, done) {
    const srv = server.create();

    const onError = (err) => {
        srv.removeListener('error', onError);
        if (err && err.code === 'EADDRINUSE' && attempt === 0) {
            warn('port ' + port + ' busy, retrying in ' + RETRY_DELAY_MS + 'ms');
            setTimeout(() => listen(port, attempt + 1, done), RETRY_DELAY_MS);
            return;
        }
        done(err);
    };

    srv.on('error', onError);
    srv.listen(port, '0.0.0.0', () => {
        srv.removeListener('error', onError);
        srv.on('error', (err) => warn('server error:', err && err.message));
        done(null, srv);
    });
}

/**
 * @param {object} [options] `{ port }` — defaults to 8123.
 * @param {function} [callback] `(err, server)`
 */
function start (options, callback) {
    const opts = options || {};
    const done = callback || function () {};

    if (instance) {
        done(null, instance);
        return instance;
    }
    if (starting) {
        done(null, null);
        return null;
    }
    starting = true;

    // Custom eyes + music live under Knowledge so Skills/@be/be OTA cannot wipe them.
    try {
        paths.ensureDir(paths.dataDir());
        paths.ensureDir(paths.musicDirCanonical());
    } catch (err) {
        warn(
            'cannot create Knowledge data dirs:',
            err && err.message,
            '(need writable /opt/jibo/Knowledge; run: mkdir -p /opt/jibo/Knowledge/beacon /opt/jibo/Knowledge/jukebox/music && chmod -R 777 /opt/jibo/Knowledge)'
        );
    }

    // Migrate legacy libraries (Skills music, /opt/tmp/beacon eye) once.
    try {
        paths.migrateMusicToKnowledge();
    } catch (err) {
        warn('music migrate:', err && err.message);
    }

    // Re-apply a saved custom eye: a BEam update restores the pristine
    // textures, so this heals the face on the first boot afterwards.
    try {
        const healed = eye.selfHeal();
        if (healed) { log('re-applied custom eye from', healed); }
    } catch (err) {
        warn('could not re-apply custom eye:', err && err.message);
    }

    const port = opts.port || Number(process.env.BEACON_PORT) || DEFAULT_PORT;
    listen(port, 0, (err, srv) => {
        starting = false;
        if (err) {
            warn('failed to start on port ' + port + ':', err.message);
            done(err);
            return;
        }
        instance = srv;
        const hosts = lanAddresses();
        log('listening on http://0.0.0.0:' + port);
        hosts.forEach((host) => log('  http://' + host + ':' + port));
        done(null, srv);
    });

    return null;
}

function stop (callback) {
    const done = callback || function () {};
    if (!instance) {
        done();
        return;
    }
    const srv = instance;
    instance = null;
    srv.close(done);
}

function isRunning () {
    return !!instance;
}

module.exports = {
    start: start,
    stop: stop,
    isRunning: isRunning,
    lanAddresses: lanAddresses,
    DEFAULT_PORT: DEFAULT_PORT
};
