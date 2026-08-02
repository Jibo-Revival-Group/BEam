'use strict';

/**
 * BEacon HTTP server: static UI out of public/ plus a small JSON API.
 *
 * Runnable on its own for development against a plain repo checkout:
 *
 *     node @be/be/beacon/server.js [port]
 */

const http = require('http');
const path = require('path');
const querystring = require('querystring');

const paths = require('./lib/paths');
const u = require('./lib/http-util');
const jukebox = require('./lib/jukebox');
const eye = require('./lib/eye');
const skills = require('./lib/skills');
const system = require('./lib/system');

const MAX_UPLOAD = 256 * 1024 * 1024;
const MAX_IMAGE = 16 * 1024 * 1024;

function handleError (res, err) {
    const status = (err && err.status) || 500;
    // Errors we raise deliberately carry a status; anything else is a bug.
    if (!err || !err.status) {
        console.error('[beacon] request failed:', err);
    }
    u.sendError(res, status, u.errorMessage(err), err && err.detail);
}

function fail (message, status) {
    const err = new Error(message);
    err.status = status || 400;
    return err;
}

/** Wrap a handler so thrown errors and rejected promises become JSON errors. */
function guard (fn) {
    return function (req, res, query) {
        try {
            const result = fn(req, res, query);
            if (result && typeof result.then === 'function') {
                result.catch((err) => handleError(res, err));
            }
        } catch (err) {
            handleError(res, err);
        }
    };
}

const routes = {
    'GET /api/status': guard((req, res) => {
        u.sendJson(res, 200, system.status());
    }),

    'GET /api/skills': guard((req, res) => {
        u.sendJson(res, 200, skills.list());
    }),

    'POST /api/skills/install': guard((req, res) => {
        u.sendJson(res, 501, {
            error: 'Installing skills from BEacon is not implemented yet.',
            detail: 'For now, add the pack under @be/skills/ and register it in ' +
                '@be/be/package.json (jibo.skills), then update BEam.'
        });
    }),

    'GET /api/jukebox': guard((req, res) => {
        u.sendJson(res, 200, jukebox.scan());
    }),

    'POST /api/jukebox/album': guard((req, res) => {
        return u.readJson(req).then((body) => {
            u.sendJson(res, 200, jukebox.createAlbum(body.artist, body.album));
        });
    }),

    'PUT /api/jukebox/file': guard((req, res, query) => {
        return u.readBody(req, MAX_UPLOAD).then((buf) => {
            u.sendJson(res, 200, jukebox.saveFile(query.album, query.name, buf));
        });
    }),

    'POST /api/jukebox/rename': guard((req, res) => {
        return u.readJson(req).then((body) => {
            u.sendJson(res, 200, jukebox.rename(body.type, body.path, body.name));
        });
    }),

    'DELETE /api/jukebox/album': guard((req, res, query) => {
        u.sendJson(res, 200, jukebox.removeAlbum(query.path));
    }),

    'DELETE /api/jukebox/track': guard((req, res, query) => {
        u.sendJson(res, 200, jukebox.removeTrack(query.path));
    }),

    'GET /api/jukebox/cover': guard((req, res, query) => {
        const abs = jukebox.resolveFile(query.path);
        u.serveFile(req, res, abs);
    }),

    'GET /api/jukebox/audio': guard((req, res, query) => {
        jukebox.streamAudio(req, res, query.path);
    }),

    'GET /api/eye': guard((req, res) => {
        u.sendJson(res, 200, eye.state());
    }),

    'GET /api/eye/current.png': guard((req, res) => {
        u.serveFile(req, res, eye.currentPath(), { contentType: 'image/png' });
    }),

    'GET /api/eye/original.png': guard((req, res) => {
        u.serveFile(req, res, paths.pristineEye(), { contentType: 'image/png' });
    }),

    'PUT /api/eye': guard((req, res, query) => {
        return u.readBody(req, MAX_IMAGE).then((buf) => {
            u.sendJson(res, 200, eye.apply(buf, query.name));
        });
    }),

    'POST /api/eye/revert': guard((req, res) => {
        u.sendJson(res, 200, eye.revert());
    }),

    'GET /api/server': guard((req, res) => {
        u.sendJson(res, 200, system.serverConfig());
    }),

    'POST /api/beam/restart': guard((req, res) => {
        return system.restartBe().then((result) => u.sendJson(res, 200, result));
    }),

    'POST /api/beam/update': guard((req, res) => {
        system.streamUpdate(res);
    })
};

function serveStatic (req, res, pathname) {
    const rel = pathname === '/' ? 'index.html' : pathname.slice(1);
    const abs = u.safeJoin(paths.publicDir, rel);
    if (!abs) {
        u.sendText(res, 400, 'Bad path');
        return;
    }
    u.serveFile(req, res, abs);
}

function requestHandler (req, res) {
    // Hand-rolled rather than url.parse(): this also has to run on the
    // robot's Node 6, which predates the WHATWG URL parser.
    const raw = req.url || '/';
    const split = raw.indexOf('?');
    const query = split === -1 ? {} : querystring.parse(raw.slice(split + 1));
    let pathname;
    try {
        pathname = decodeURIComponent(split === -1 ? raw : raw.slice(0, split));
    } catch (err) {
        u.sendText(res, 400, 'Bad request path');
        return;
    }

    // LAN-only tool: allow the page to be driven from anywhere on the network.
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const method = req.method === 'HEAD' ? 'GET' : req.method;
    const route = routes[method + ' ' + pathname];
    if (route) {
        route(req, res, query);
        return;
    }

    if (pathname.indexOf('/api/') === 0) {
        handleError(res, fail('Unknown endpoint: ' + method + ' ' + pathname, 404));
        return;
    }

    if (method === 'GET') {
        serveStatic(req, res, pathname);
        return;
    }

    u.sendText(res, 405, 'Method not allowed');
}

function create () {
    const server = http.createServer(requestHandler);
    // Uploads over slow wifi should not be cut short.
    server.timeout = 0;
    return server;
}

module.exports = {
    create: create,
    requestHandler: requestHandler,
    routes: routes
};

if (require.main === module) {
    const port = Number(process.argv[2]) || Number(process.env.BEACON_PORT) || 8123;
    try {
        const healed = eye.selfHeal();
        if (healed) { console.log('[beacon] re-applied custom eye from', healed); }
    } catch (err) {
        console.warn('[beacon] could not re-apply custom eye:', err && err.message);
    }
    create().listen(port, '0.0.0.0', () => {
        console.log('[beacon] listening on http://localhost:' + port);
        console.log('[beacon] be root   :', paths.BE_ROOT);
        console.log('[beacon] music dir :', paths.musicDir());
        console.log('[beacon] data dir  :', paths.dataDir());
        console.log('[beacon] public    :', path.relative(paths.BE_ROOT, paths.publicDir));
    });
}
