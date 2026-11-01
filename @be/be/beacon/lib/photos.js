'use strict';

/**
 * Access to photos saved by the Jibo media service.
 *
 * The media service stores JPEGs in /opt/jibo/Photos; the KB media model
 * (the same list Jibo's Gallery shows) decides which photos exist.
 */

const fs = require('fs');
const http = require('http');

const paths = require('./paths');
const u = require('./http-util');

const PHOTO_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function fail (message, status) {
    const err = new Error(message);
    err.status = status || 400;
    return err;
}

function getJibo () {
    try {
        // Requiring jibo is safe off-robot; its media model simply will not
        // be initialized when BEacon is run as a standalone server.
        return require('jibo');
    } catch (err) {
        return null;
    }
}

function mediaModel () {
    const jibo = getJibo();
    return jibo && jibo.kb && jibo.kb.media ? jibo.kb.media : null;
}

function normalizeId (id) {
    const value = String(id === undefined || id === null ? '' : id).trim();
    if (!PHOTO_ID_RE.test(value)) {
        throw fail('Invalid photo id: ' + value);
    }
    return value.toLowerCase();
}

function photoDirectories () {
    const root = paths.photosDir();
    const dirs = [root];

    // Media service versions have used both the store root and one of its
    // staging/cache directories. Never recurse beyond this single level.
    let entries;
    try {
        entries = fs.readdirSync(root).sort();
    } catch (err) {
        entries = [];
    }
    entries.forEach((name) => {
        const dir = u.safeJoin(root, name);
        const stat = dir && statOrNull(dir);
        if (stat && stat.isDirectory()) { dirs.push(dir); }
    });
    return dirs;
}

function photoCandidates (id) {
    const normalized = normalizeId(id);
    const candidates = [];
    photoDirectories().forEach((dir) => {
        const candidate = u.safeJoin(dir, normalized + '.jpg');
        if (candidate) { candidates.push(candidate); }
    });
    return candidates;
}

function statOrNull (file) {
    try {
        return fs.statSync(file);
    } catch (err) {
        return null;
    }
}

function findPhotoFile (id) {
    const candidates = photoCandidates(id);
    for (let i = 0; i < candidates.length; i++) {
        const stat = statOrNull(candidates[i]);
        if (stat && stat.isFile()) { return candidates[i]; }
    }
    return null;
}

function photoId (item) {
    return item && (item.id || item._id);
}

function itemCreated (item) {
    const data = item && item.data ? item.data : item;
    const value = Number(data && data.created);
    return isNaN(value) ? 0 : value;
}

function buildPhoto (item) {
    const id = normalizeId(photoId(item));
    const file = findPhotoFile(id);
    const stat = statOrNull(file);
    return {
        id: id,
        file: id + '.jpg',
        created: itemCreated(item),
        size: stat && stat.isFile() ? stat.size : 0,
        available: !!(stat && stat.isFile())
    };
}

function unavailable (message) {
    return {
        available: false,
        dir: paths.photosDir(),
        count: 0,
        photos: [],
        error: message
    };
}

function available (photos) {
    return {
        available: true,
        dir: paths.photosDir(),
        count: photos.length,
        photos: photos
    };
}

/**
 * List photos exactly as Jibo's Gallery does: KB media nodes that are still
 * linked (have edges) and are full images, newest first.
 */
function scan () {
    const model = mediaModel();
    if (!model || typeof model.loadMedia !== 'function') {
        return Promise.resolve(unavailable('The Jibo media library is unavailable. Run BEacon from Be on a robot.'));
    }
    const type = model.MediaType && model.MediaType.image ? model.MediaType.image : 'image';
    return Promise.resolve(model.loadMedia()).then((items) => {
        const photos = [];
        (items || []).forEach((item) => {
            if (!item || !item.edges || !item.data || item.data.type !== type) { return; }
            try {
                photos.push(buildPhoto(item));
            } catch (err) {
                // Ignore malformed KB entries rather than exposing an
                // arbitrary path through the file endpoint.
            }
        });
        photos.sort((a, b) => b.created - a.created);
        return available(photos);
    });
}

/** Stream a photo from the media service, as the Gallery does (new photos are root-only on disk). */
function serve (req, res, id, download) {
    const normalized = normalizeId(id);
    const jibo = getJibo();
    if (!jibo || !jibo.media || typeof jibo.media.getUrl !== 'function') {
        throw fail('The Jibo media library is unavailable. Run BEacon from Be on a robot.', 503);
    }
    http.get(jibo.media.getUrl(normalized), (upstream) => {
        if (upstream.statusCode !== 200) {
            upstream.resume();
            u.sendText(res, 404, 'Photo not found: ' + normalized);
            return;
        }
        const headers = { 'Content-Type': 'image/jpeg' };
        if (upstream.headers['content-length']) { headers['Content-Length'] = upstream.headers['content-length']; }
        if (download) { headers['Content-Disposition'] = 'attachment; filename="' + normalized + '.jpg"'; }
        u.noCache(res);
        res.writeHead(200, headers);
        if (req.method === 'HEAD') {
            upstream.resume();
            res.end();
            return;
        }
        upstream.on('error', () => res.destroy());
        upstream.pipe(res);
    }).on('error', () => u.sendText(res, 502, 'The Jibo media service did not answer.'));
}

function remove (id) {
    const normalized = normalizeId(id);
    const jibo = getJibo();
    const media = jibo && jibo.media;
    if (!media || typeof media.deletePhoto !== 'function') {
        return Promise.reject(fail(
            'The Jibo media library is unavailable. Photo deletion only works on a robot.',
            503
        ));
    }

    return scan().then((data) => {
        if (!data.available) {
            throw fail(data.error || 'The Jibo media library is unavailable.', 503);
        }
        const found = data.photos.some((photo) => photo.id === normalized);
        if (!found) { throw fail('Photo not found: ' + normalized, 404); }
        return Promise.resolve(media.deletePhoto(normalized)).then(() => ({
            ok: true,
            removed: normalized
        }));
    });
}

module.exports = {
    scan: scan,
    serve: serve,
    remove: remove,
    normalizeId: normalizeId
};
