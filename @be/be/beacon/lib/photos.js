'use strict';

/**
 * Access to photos saved by the Jibo media service.
 *
 * The media service stores JPEGs in /opt/jibo/Photos, while the KB media
 * model is the source of truth for which files are full photos versus
 * generated thumbnails.
 */

const fs = require('fs');

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

/** Read JPEG dimensions without loading the whole image into memory. */
function jpegSize (file) {
    let fd;
    try {
        fd = fs.openSync(file, 'r');
        const buffer = Buffer.alloc(64 * 1024);
        const length = fs.readSync(fd, buffer, 0, buffer.length, 0);
        fs.closeSync(fd);
        fd = null;
        if (length < 10 || buffer[0] !== 0xff || buffer[1] !== 0xd8) { return null; }

        let offset = 2;
        while (offset + 9 < length) {
            if (buffer[offset] !== 0xff) {
                offset++;
                continue;
            }
            const marker = buffer[offset + 1];
            offset += 2;
            if (marker === 0xd8 || marker === 0xd9 || marker === 0x01) { continue; }
            if (offset + 2 > length) { break; }
            const segmentLength = buffer.readUInt16BE(offset);
            if (segmentLength < 2 || offset + segmentLength > length) { break; }
            const isFrame = (marker >= 0xc0 && marker <= 0xc3) ||
                (marker >= 0xc5 && marker <= 0xc7) ||
                (marker >= 0xc9 && marker <= 0xcb) ||
                (marker >= 0xcd && marker <= 0xcf);
            if (isFrame && offset + 7 < length) {
                return {
                    width: buffer.readUInt16BE(offset + 5),
                    height: buffer.readUInt16BE(offset + 3)
                };
            }
            offset += segmentLength;
        }
    } catch (err) {
        if (fd !== undefined && fd !== null) {
            try { fs.closeSync(fd); } catch (closeErr) { /* best effort */ }
        }
    }
    return null;
}

function isGeneratedThumbnail (file) {
    const size = jpegSize(file);
    return !!(size && (
        (size.width === 330 && size.height === 330) ||
        (size.width === 720 && size.height === 405)
    ));
}

/**
 * Fallback for robots whose media KB is unavailable or has not populated its
 * root edges yet. Full photos are the non-thumbnail JPEGs in the media store.
 */
function scanFiles () {
    const byId = {};
    photoDirectories().forEach((dir) => {
        let entries;
        try {
            entries = fs.readdirSync(dir);
        } catch (err) {
            entries = [];
        }
        entries.forEach((name) => {
            if (!/\.jpg$/i.test(name)) { return; }
            const file = u.safeJoin(dir, name);
            const stat = file && statOrNull(file);
            if (!stat || !stat.isFile() || isGeneratedThumbnail(file)) { return; }
            const id = name.replace(/\.jpg$/i, '');
            try {
                const normalized = normalizeId(id);
                if (byId[normalized]) { return; }
                byId[normalized] = {
                    id: normalized,
                    file: normalized + '.jpg',
                    created: stat.mtime.getTime(),
                    size: stat.size,
                    available: true
                };
            } catch (err) {
                // Ignore non-photo JPEGs in the media directory.
            }
        });
    });
    return Object.keys(byId).map((id) => byId[id])
        .sort((a, b) => b.created - a.created);
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

function available (photos, source) {
    const result = {
        available: true,
        dir: paths.photosDir(),
        count: photos.length,
        photos: photos
    };
    if (source) { result.source = source; }
    return result;
}

/**
 * Load saved full-photo nodes from the KB, excluding thumbnail nodes.
 * This intentionally returns a response object so a development checkout
 * without a running Jibo media runtime can show a useful empty state.
 */
function scan () {
    const model = mediaModel();
    if (!model || typeof model.loadMedia !== 'function') {
        const files = scanFiles();
        return Promise.resolve(files.length
            ? available(files, 'filesystem')
            : unavailable('The Jibo media library is unavailable. Run BEacon from Be on a robot.'));
    }

    const type = model.MediaType && model.MediaType.image
        ? model.MediaType.image
        : 'image';
    let loading;
    try {
        loading = model.loadMedia();
    } catch (err) {
        const files = scanFiles();
        if (files.length) { return Promise.resolve(available(files, 'filesystem')); }
        return Promise.reject(err);
    }

    return Promise.resolve(loading).then((items) => {
        const dir = paths.photosDir();
        if (!paths.isDir(dir)) {
            return unavailable('Photo store not found at ' + dir + '.');
        }
        const photos = [];
        (items || []).forEach((item) => {
            const data = item && item.data;
            if (!data || data.type !== type) { return; }
            try {
                photos.push(buildPhoto(item));
            } catch (err) {
                // Ignore malformed KB entries rather than exposing an
                // arbitrary path through the file endpoint.
            }
        });
        if (!photos.length) {
            const files = scanFiles();
            if (files.length) { return available(files, 'filesystem'); }
        }
        photos.sort((a, b) => b.created - a.created);
        return available(photos);
    });
}

function resolveFile (id) {
    const file = findPhotoFile(id);
    const stat = statOrNull(file);
    if (!stat || !stat.isFile()) {
        throw fail('Photo not found: ' + id, 404);
    }
    return file;
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
    resolveFile: resolveFile,
    remove: remove,
    normalizeId: normalizeId
};
