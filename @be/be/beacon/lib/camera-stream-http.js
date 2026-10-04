'use strict';

const crypto = require('crypto');
const http = require('http');
const homeassistant = require('./homeassistant');
const camera = require('./camera-stream');
const u = require('./http-util');

function authenticate(req) {
    const saved = homeassistant.readConfig();
    const supplied = req.headers.authorization || '';
    if (!saved || !saved.password || typeof supplied !== 'string') {
        throw camera.fail('Camera authentication failed', 401);
    }
    // Compare fixed-size digests, including when the password length is wrong.
    const expected = crypto.createHash('sha256').update('Bearer ' + saved.password).digest();
    const actual = crypto.createHash('sha256').update(supplied).digest();
    if (!crypto.timingSafeEqual(expected, actual)) { throw camera.fail('Camera authentication failed', 401); }
}

function status(req, res) {
    authenticate(req);
    res.setHeader('Cache-Control', 'no-store');
    u.sendJson(res, 200, camera.getController().status());
}

function command(req, res) {
    authenticate(req);
    return u.readJson(req, 4096).then(body => {
        if (!body || typeof body !== 'object' || Array.isArray(body)) { throw camera.fail('Invalid camera command', 400); }
        return camera.getController().command(body.action);
    }).then(result => {
        res.setHeader('Cache-Control', 'no-store');
        u.sendJson(res, 200, result);
    });
}

function stream(req, res) {
    authenticate(req);
    return camera.getController().stream(req, res);
}

// Single still requests use the existing in-memory media API. Video always uses
// the native VP8 pipeline, never a polling loop of takePhoto calls.
function image(req, res) {
    authenticate(req);
    const controller = camera.getController();
    if (controller.state !== 'streaming') { throw camera.fail('Camera stream is inactive', 409); }
    const session = controller.transport.parser;
    const jibo = require('jibo');
    return jibo.media.takePhoto({ camera: controller.transport.validation.camera,
        photoType: jibo.media.PhotoType.PREVIEW, store: false }).then(photo => {
        return new Promise((resolve, reject) => {
            const request = http.get({ host: '127.0.0.1', port: 7979,
                path: '/media/photo?id=' + encodeURIComponent(photo.id) }, response => {
                const chunks = [];
                let size = 0;
                if (response.statusCode !== 200) { response.resume(); reject(camera.fail('Camera image unavailable')); return; }
                response.on('data', chunk => {
                    size += chunk.length;
                    if (size > 4 * 1024 * 1024) { response.destroy(); reject(camera.fail('Camera image too large')); return; }
                    chunks.push(chunk);
                });
                response.on('error', () => reject(camera.fail('Camera image unavailable')));
                response.on('end', () => resolve(Buffer.concat(chunks)));
            });
            request.on('error', () => reject(camera.fail('Camera image unavailable')));
            request.setTimeout(5000, () => { request.abort(); reject(camera.fail('Camera image timed out')); });
        });
    }).then(bytes => {
        // Never deliver a photo that completed after stop or a different session.
        if (controller.state !== 'streaming' || controller.transport.parser !== session) {
            throw camera.fail('Camera stream is inactive', 409);
        }
        if (bytes[0] !== 255 || bytes[1] !== 216) { throw camera.fail('Camera returned an invalid image'); }
        res.writeHead(200, { 'Content-Type': 'image/jpeg', 'Cache-Control': 'no-store' });
        res.end(bytes);
    });
}

module.exports = { authenticate: authenticate, status: status, command: command, stream: stream, image: image,
    isRestricted: camera.isRestricted };
