'use strict';

const fs = require('fs');
const path = require('path');

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.ico': 'image/x-icon',
    '.txt': 'text/plain; charset=utf-8',
    '.mp3': 'audio/mpeg',
    '.ogg': 'audio/ogg',
    '.oga': 'audio/ogg',
    '.opus': 'audio/ogg'
};

function contentType (file) {
    return MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
}

function noCache (res) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
}

function sendJson (res, status, body) {
    const payload = JSON.stringify(body === undefined ? null : body);
    noCache(res);
    res.writeHead(status, {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(payload)
    });
    res.end(payload);
}

function sendText (res, status, text) {
    noCache(res);
    res.writeHead(status, {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Length': Buffer.byteLength(text)
    });
    res.end(text);
}

function sendError (res, status, message, detail) {
    const body = { error: message || 'Request failed' };
    if (detail) { body.detail = String(detail); }
    sendJson(res, status, body);
}

/** Turn a thrown value into something safe to show in the UI. */
function errorMessage (err) {
    if (!err) { return 'Unknown error'; }
    if (typeof err === 'string') { return err; }
    return err.message || String(err);
}

/** Collect a raw request body (uploads are sent as plain PUT bodies). */
function readBody (req, maxBytes) {
    const limit = maxBytes || 64 * 1024 * 1024;
    return new Promise((resolve, reject) => {
        const chunks = [];
        let size = 0;
        let done = false;

        const fail = (err) => {
            if (done) { return; }
            done = true;
            reject(err);
        };

        req.on('data', (chunk) => {
            if (done) { return; }
            size += chunk.length;
            if (size > limit) {
                const err = new Error('Upload is larger than the ' +
                    Math.round(limit / (1024 * 1024)) + ' MB limit');
                err.status = 413;
                req.destroy();
                fail(err);
                return;
            }
            chunks.push(chunk);
        });
        req.on('error', fail);
        req.on('end', () => {
            if (done) { return; }
            done = true;
            resolve(Buffer.concat(chunks, size));
        });
    });
}

function readJson (req, maxBytes) {
    return readBody(req, maxBytes || 1024 * 1024).then((buf) => {
        if (!buf.length) { return {}; }
        try {
            return JSON.parse(buf.toString('utf8'));
        } catch (err) {
            const bad = new Error('Body is not valid JSON');
            bad.status = 400;
            throw bad;
        }
    });
}

/**
 * Resolve `rel` inside `root`, refusing anything that escapes it (`..`,
 * absolute paths, symlinks pointing elsewhere). Returns null when unsafe.
 */
function safeJoin (root, rel) {
    if (rel === undefined || rel === null) { return null; }
    const cleaned = String(rel).replace(/\\/g, '/').replace(/^\/+/, '');
    if (!cleaned) { return path.resolve(root); }
    if (cleaned.split('/').indexOf('..') !== -1) { return null; }

    const rootAbs = path.resolve(root);
    const abs = path.resolve(rootAbs, cleaned);
    if (abs !== rootAbs && abs.indexOf(rootAbs + path.sep) !== 0) { return null; }

    try {
        if (fs.existsSync(abs)) {
            const realRoot = fs.realpathSync(rootAbs);
            const real = fs.realpathSync(abs);
            if (real !== realRoot && real.indexOf(realRoot + path.sep) !== 0) { return null; }
        }
    } catch (err) {
        return null;
    }
    return abs;
}

/** Reject file names that would break out of a folder or confuse the scanner. */
function safeName (name) {
    const value = String(name === undefined || name === null ? '' : name).trim();
    if (!value) { return null; }
    if (value === '.' || value === '..') { return null; }
    if (/[\\/]/.test(value)) { return null; }
    if (/[\u0000-\u001f]/.test(value)) { return null; }
    if (value.charAt(0) === '.') { return null; }
    if (value.length > 180) { return null; }
    return value;
}

function serveFile (req, res, abs, options) {
    const opts = options || {};
    fs.stat(abs, (err, stat) => {
        if (err || !stat.isFile()) {
            sendText(res, 404, 'Not found');
            return;
        }
        const headers = {
            'Content-Type': opts.contentType || contentType(abs),
            'Content-Length': stat.size
        };
        if (opts.download) {
            headers['Content-Disposition'] = 'attachment; filename="' +
                path.basename(abs).replace(/"/g, '') + '"';
        }
        if (opts.noCache !== false) { noCache(res); }
        res.writeHead(200, headers);
        if (req.method === 'HEAD') {
            res.end();
            return;
        }
        const stream = fs.createReadStream(abs);
        stream.on('error', () => res.destroy());
        stream.pipe(res);
    });
}

module.exports = {
    contentType: contentType,
    noCache: noCache,
    sendJson: sendJson,
    sendText: sendText,
    sendError: sendError,
    errorMessage: errorMessage,
    readBody: readBody,
    readJson: readJson,
    safeJoin: safeJoin,
    safeName: safeName,
    serveFile: serveFile
};
