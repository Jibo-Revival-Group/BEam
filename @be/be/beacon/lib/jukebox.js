'use strict';

/**
 * Jukebox library management.
 *
 * The library is plain folders on disk — the jukebox skill rescans them every
 * time it opens — so every operation here is a filesystem operation inside
 * music/. Naming and layout rules mirror
 * @be/be/skills/jukebox/src/models/MusicLibrary.ts so BEacon and the skill always
 * agree about what an album is.
 */

const fs = require('fs');
const path = require('path');

const paths = require('./paths');
const u = require('./http-util');

const AUDIO_EXT = /\.(mp3|opus|ogg|oga)$/i;
const IMAGE_EXT = /\.(png|jpe?g)$/i;
const COVER_NAMES = ['cover.png', 'cover.jpg', 'cover.jpeg', 'folder.png', 'folder.jpg'];

function fail (message, status) {
    const err = new Error(message);
    err.status = status || 400;
    return err;
}

function root () {
    return paths.musicDir();
}

function prettify (name) {
    return String(name).replace(/_/g, ' ').trim();
}

function trackTitle (file) {
    return file.replace(AUDIO_EXT, '').replace(/_/g, ' ').trim();
}

function formatLabel (file) {
    const match = file.match(/\.([^.]+)$/);
    if (!match) { return ''; }
    const ext = match[1].toLowerCase();
    return ext === 'oga' ? 'OGG' : ext.toUpperCase();
}

function titlesMatch (a, b) {
    const norm = (s) => String(s || '').toLowerCase().replace(/_+/g, ' ').replace(/\s+/g, ' ').trim();
    const na = norm(a);
    return !!na && na === norm(b);
}

function statOrNull (p) {
    try {
        return fs.statSync(p);
    } catch (err) {
        return null;
    }
}

function findCover (files) {
    for (let c = 0; c < COVER_NAMES.length; c++) {
        for (let f = 0; f < files.length; f++) {
            if (files[f].toLowerCase() === COVER_NAMES[c]) { return files[f]; }
        }
    }
    return null;
}

function readAlbum (dir, rel, albumTitle, artist) {
    let files;
    try {
        files = fs.readdirSync(dir);
    } catch (err) {
        return null;
    }

    // Empty albums stay listed so BEacon can upload into them (unlike the
    // jukebox skill, which ignores folders with no playable audio).
    const audio = files
        .filter((name) => AUDIO_EXT.test(name) && name.charAt(0) !== '.')
        .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

    let bytes = 0;
    const tracks = audio.map((name) => {
        const stat = statOrNull(path.join(dir, name));
        const size = stat ? stat.size : 0;
        bytes += size;
        return {
            file: name,
            rel: rel + '/' + name,
            title: trackTitle(name),
            format: formatLabel(name),
            size: size
        };
    });

    const cover = findCover(files);
    return {
        id: rel,
        rel: rel,
        title: artist ? artist + ' — ' + albumTitle : albumTitle,
        albumTitle: albumTitle,
        artist: artist || '',
        cover: cover,
        coverRel: cover ? rel + '/' + cover : null,
        isSingle: tracks.length === 1 && titlesMatch(tracks[0].title, albumTitle),
        tracks: tracks,
        bytes: bytes
    };
}

/** List every album, plus enough diagnostics to explain an empty library. */
function scan () {
    const dir = root();
    const result = {
        dir: dir,
        candidates: paths.musicDirCandidates(),
        exists: paths.isDir(dir),
        albums: [],
        skipped: [],
        error: null
    };

    if (!result.exists) {
        result.error = 'music/ folder not found at ' + dir;
        return result;
    }

    let entries;
    try {
        entries = fs.readdirSync(dir);
    } catch (err) {
        result.error = 'Could not read ' + dir + ': ' + u.errorMessage(err);
        return result;
    }

    entries.forEach((name) => {
        if (name.charAt(0) === '.' || name === 'README.md') { return; }
        const abs = path.join(dir, name);
        const stat = statOrNull(abs);
        if (!stat || !stat.isDirectory()) { return; }

        // One nesting level: music/Artist/Album/ — prefer flat album if it has
        // tracks (matches jukebox skill); only nest when flat has no audio.
        let kids = [];
        try {
            kids = fs.readdirSync(abs);
        } catch (err) {
            result.skipped.push(name + ' (unreadable)');
            return;
        }

        const flat = readAlbum(abs, name, prettify(name), '');
        if (flat) {
            result.albums.push(flat);
            return;
        }

        const nestedDirs = kids.filter((kid) => {
            if (kid.charAt(0) === '.') { return false; }
            const kidStat = statOrNull(path.join(abs, kid));
            return !!(kidStat && kidStat.isDirectory());
        });

        let nestedFound = 0;
        nestedDirs.forEach((kid) => {
            const album = readAlbum(
                path.join(abs, kid),
                name + '/' + kid,
                prettify(kid),
                prettify(name)
            );
            if (album) {
                result.albums.push(album);
                nestedFound++;
            }
        });

        if (!nestedFound && nestedDirs.length) {
            result.skipped.push(name + ' (no .mp3/.opus/.ogg in nested albums)');
        }
    });

    result.albums.sort((a, b) => a.title.toLowerCase().localeCompare(b.title.toLowerCase()));
    return result;
}

/** Resolve a caller-supplied path inside music/, or throw. */
function resolveRel (rel, what) {
    const abs = u.safeJoin(root(), rel);
    if (!abs || abs === path.resolve(root())) {
        throw fail('Invalid ' + (what || 'path') + ': ' + String(rel));
    }
    return abs;
}

function requireDir (rel) {
    const abs = resolveRel(rel, 'album');
    const stat = statOrNull(abs);
    if (!stat || !stat.isDirectory()) { throw fail('No such album: ' + rel, 404); }
    return abs;
}

function requireFile (rel) {
    const abs = resolveRel(rel, 'file');
    const stat = statOrNull(abs);
    if (!stat || !stat.isFile()) { throw fail('No such file: ' + rel, 404); }
    return abs;
}

function createAlbum (artist, album) {
    if (!album || !String(album).trim()) { throw fail('An album name is required'); }
    const albumName = u.safeName(album);
    if (!albumName) {
        throw fail('"' + album + '" is not a usable folder name — no slashes, and it cannot start with a dot');
    }
    const artistName = artist ? u.safeName(artist) : null;
    if (artist && !artistName) {
        throw fail('"' + artist + '" is not a usable folder name — no slashes, and it cannot start with a dot');
    }

    const dir = root();
    paths.ensureDir(dir);

    const rel = artistName ? artistName + '/' + albumName : albumName;
    const abs = path.join(dir, rel);
    if (paths.isDir(abs)) { throw fail('That album folder already exists', 409); }

    paths.ensureDir(abs);
    return { ok: true, rel: rel, path: abs };
}

/**
 * Store one uploaded file in an album folder. Uploads arrive as raw PUT
 * bodies, so there is no multipart parsing to do.
 */
function saveFile (albumRel, name, buffer) {
    if (!buffer || !buffer.length) { throw fail('Upload was empty'); }

    const fileName = u.safeName(name);
    if (!fileName) { throw fail('Invalid file name: ' + String(name)); }

    const isAudio = AUDIO_EXT.test(fileName);
    const isImage = IMAGE_EXT.test(fileName);
    if (!isAudio && !isImage) {
        throw fail('Only .mp3, .opus, .ogg, .oga audio and .png/.jpg cover images are accepted');
    }

    const albumDir = requireDir(albumRel);
    const abs = path.join(albumDir, fileName);
    fs.writeFileSync(abs, buffer);

    return {
        ok: true,
        rel: String(albumRel).replace(/\/+$/, '') + '/' + fileName,
        kind: isAudio ? 'audio' : 'cover',
        size: buffer.length
    };
}

function rename (type, rel, newName) {
    if (!newName || !String(newName).trim()) { throw fail('A new name is required'); }
    const name = u.safeName(newName);
    if (!name) {
        throw fail('"' + newName + '" is not a usable name — no slashes, and it cannot start with a dot');
    }

    if (type === 'album') {
        const abs = requireDir(rel);
        const target = path.join(path.dirname(abs), name);
        if (paths.isDir(target)) { throw fail('A folder with that name already exists', 409); }
        fs.renameSync(abs, target);
        return { ok: true, rel: path.relative(root(), target).replace(/\\/g, '/') };
    }

    if (type === 'track') {
        const abs = requireFile(rel);
        if (!AUDIO_EXT.test(name)) {
            throw fail('Track names must keep an audio extension (.mp3, .opus, .ogg, .oga)');
        }
        const target = path.join(path.dirname(abs), name);
        if (paths.isFile(target)) { throw fail('A file with that name already exists', 409); }
        fs.renameSync(abs, target);
        return { ok: true, rel: path.relative(root(), target).replace(/\\/g, '/') };
    }

    throw fail('Unknown rename type: ' + String(type));
}

/** Recursive delete, refusing to step outside music/. */
function removeTree (abs) {
    const rootAbs = path.resolve(root());
    if (abs === rootAbs || abs.indexOf(rootAbs + path.sep) !== 0) {
        throw fail('Refusing to delete outside the music library', 403);
    }
    const stat = statOrNull(abs);
    if (!stat) { return; }
    if (stat.isDirectory()) {
        fs.readdirSync(abs).forEach((child) => removeTree(path.join(abs, child)));
        fs.rmdirSync(abs);
        return;
    }
    fs.unlinkSync(abs);
}

function removeAlbum (rel) {
    const abs = requireDir(rel);
    removeTree(abs);

    // Drop the artist folder too once its last album is gone.
    const parent = path.dirname(abs);
    if (parent !== path.resolve(root())) {
        try {
            if (!fs.readdirSync(parent).length) { fs.rmdirSync(parent); }
        } catch (err) { /* keep the folder if anything is still in it */ }
    }
    return { ok: true, removed: rel };
}

function removeTrack (rel) {
    const abs = requireFile(rel);
    if (!AUDIO_EXT.test(abs)) { throw fail('That file is not a track'); }
    fs.unlinkSync(abs);
    return { ok: true, removed: rel };
}

/** Absolute path for a cover image, for serving back to the browser. */
function resolveFile (rel) {
    const abs = requireFile(rel);
    if (!IMAGE_EXT.test(abs)) { throw fail('Not an image', 415); }
    return abs;
}

/** Audio preview with Range support so the browser can seek. */
function streamAudio (req, res, rel) {
    const abs = requireFile(rel);
    if (!AUDIO_EXT.test(abs)) { throw fail('Not an audio file', 415); }

    const size = fs.statSync(abs).size;
    const type = u.contentType(abs);
    const range = req.headers.range;
    const match = range ? /^bytes=(\d*)-(\d*)$/.exec(range.trim()) : null;

    if (!match) {
        res.writeHead(200, {
            'Content-Type': type,
            'Content-Length': size,
            'Accept-Ranges': 'bytes'
        });
        if (req.method === 'HEAD') {
            res.end();
            return;
        }
        fs.createReadStream(abs).pipe(res);
        return;
    }

    let start = match[1] ? parseInt(match[1], 10) : 0;
    let end = match[2] ? parseInt(match[2], 10) : size - 1;
    if (isNaN(start) || start < 0) { start = 0; }
    if (isNaN(end) || end >= size) { end = size - 1; }
    if (start > end) {
        res.writeHead(416, { 'Content-Range': 'bytes */' + size });
        res.end();
        return;
    }

    res.writeHead(206, {
        'Content-Type': type,
        'Content-Length': (end - start) + 1,
        'Content-Range': 'bytes ' + start + '-' + end + '/' + size,
        'Accept-Ranges': 'bytes'
    });
    fs.createReadStream(abs, { start: start, end: end }).pipe(res);
}

module.exports = {
    scan: scan,
    createAlbum: createAlbum,
    saveFile: saveFile,
    rename: rename,
    removeAlbum: removeAlbum,
    removeTrack: removeTrack,
    resolveFile: resolveFile,
    streamAudio: streamAudio
};
