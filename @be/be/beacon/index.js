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

require('../runtime-state').ensureBeam();
const os = require('os');

const server = require('./server');
const system = require('./lib/system');
const themes = require('./lib/themes');
const paths = require('./lib/paths');
const homeassistant = require('./lib/homeassistant');

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

    try {
        if (system.rewriteLegacyEndpoint()) {
            log('credentials.endpoint pointed directly at http://joap.5x1.com:80');
        }
    } catch (err) {
        warn('endpoint rewrite:', err && err.message);
    }

    // Themes live under Knowledge so Skills/@be/be OTA cannot wipe them.
    try {
        paths.ensureDir(paths.dataDir());
    } catch (err) {
        warn(
            'cannot create Knowledge data dirs:',
            err && err.message,
            '(need writable /opt/jibo/Knowledge; run: mkdir -p /opt/jibo/Knowledge/beacon && chmod -R 777 /opt/jibo/Knowledge)'
        );
    }

    // Theme texture loading is deferred so Be construct and splash paint
    // are not blocked on the critical path.
    setImmediate(() => {
        try {
            themes.start();
        } catch (err) {
            warn('could not restore theme:', err && err.message);
        }
        // New (e.g. OOBE) robots start with an empty loop: add a placeholder owner to rename in BEacon.
        try {
            require('./lib/people').ensureOwner()
                .then((added) => { if (added) warn('loop was empty: added placeholder owner FirstName LastName'); })
                .catch((err) => warn('could not check the loop owner:', err && err.message));
        } catch (err) {
            warn('could not check the loop owner:', err && err.message);
        }
        // At boot the KB may not have loaded the loop yet (null): try again every 30 s for 10 minutes.
        const robotMember = (tries) => {
            try {
                require('./lib/people').ensureRobotMember(require('os').hostname())
                    .then((added) => {
                        if (added) warn('loop had no robot member with its id: added it');
                        else if (added === null && tries > 1) setTimeout(() => robotMember(tries - 1), 30000);
                    })
                    .catch((err) => warn('could not check the loop robot member:', err && err.message));
            } catch (err) {
                warn('could not check the loop robot member:', err && err.message);
            }
        };
        robotMember(20);
        // The Store no longer signs in to GitHub: remove the token older versions saved.
        try { require('fs').unlinkSync(require('path').join(paths.dataDir(), 'github', 'auth.json')); } catch (err) { /* none saved */ }
        // Keep Store listings current with no BEacon tab open. refresh(.., true) skips storefronts tried in the last 30 minutes.
        const refreshStore = () => {
            themes.refresh(null, true).catch(err => warn('background store refresh:', err && err.message))
                .then(() => require('./lib/auto-update').run())
                .then(updated => { if (updated && updated.length) { log('updated automatically:', updated.join(', ')); } })
                .catch(err => warn('automatic updates:', err && err.message));
        };
        setTimeout(refreshStore, 2 * 60 * 1000);
        setInterval(refreshStore, themes.REFRESH_MS);
        try {
            const voices = require('./lib/voices');
            if (voices.ENABLED) {
                require('./lib/voice-tts').install(require('jibo').tts, voices.current);
                voices.start();
            } else {
                // No settings file: BEnch's launcher keeps the voice-effects plugin out of TTS.
                try { require('fs').unlinkSync(voices.fxFile()); } catch (err) { /* already gone */ }
            }
        } catch (err) {
            warn('could not start custom voices:', err && err.message);
        }
    });

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
        try {
            require('./lib/jibosync').start();
        } catch (syncErr) {
            warn('jibosync:', syncErr && syncErr.message);
        }
        try {
            require('./lib/bluetooth').watch(() => global.be);
        } catch (btErr) {
            warn('bluetooth:', btErr && btErr.message);
        }
        try {
            homeassistant.startWatcher();
        } catch (watchErr) {
            warn('home assistant watcher:', watchErr && watchErr.message);
        }
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
    const jibo = typeof window !== 'undefined' ? require('jibo') : null;
    const camera = jibo && jibo.cameraStreamController;
    if (camera) {
        camera.command('stop').then(() => { instance = null; srv.close(done); }, err => done(err));
    } else {
        instance = null;
        srv.close(done);
    }
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
