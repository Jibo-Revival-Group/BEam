'use strict';

/**
 * Jibo eye customization.
 *
 * The stock default eye exists as several byte-identical 720x720 PNGs:
 * Default_Eye.png + JiBO_eye_customizer_{00,38}.png under animation-utilities,
 * plus White_Eye.png / white-eye.png aliases that animations (e.g. headtouch /
 * petting) keyframe through eyeTextureInfixBn_r. A custom eye has to be
 * written to every one of those, or the face snaps back to the original after
 * an animation finishes.
 *
 * The uploaded image is also kept in BEacon's data directory, which sits
 * outside the Skills tree that update-beam.sh replaces, so selfHeal() can put
 * it back after an update. Reverting copies the pristine PNG that ships in
 * beacon/assets/eye-original/, so the original eye is always recoverable.
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const paths = require('./paths');

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const MIN_SIZE = 64;
const MAX_SIZE = 2048;

function fail (message, status) {
    const err = new Error(message);
    err.status = status || 400;
    return err;
}

function eyeDir () {
    return path.join(paths.dataDir(), 'eye');
}

function customPath () {
    return path.join(eyeDir(), 'custom.png');
}

function statePath () {
    return path.join(eyeDir(), 'state.json');
}

/** Copy of the stock texture taken before the first change, as a last resort. */
function backupPath () {
    return path.join(eyeDir(), 'original-backup.png');
}

function readState () {
    try {
        return JSON.parse(fs.readFileSync(statePath(), 'utf8'));
    } catch (err) {
        return { custom: false };
    }
}

function writeState (state) {
    paths.ensureDir(eyeDir());
    fs.writeFileSync(statePath(), JSON.stringify(state, null, 2));
}

function sha1 (buf) {
    return crypto.createHash('sha1').update(buf).digest('hex');
}

function sha1File (file) {
    try {
        return sha1(fs.readFileSync(file));
    } catch (err) {
        return null;
    }
}

/** Read width/height straight out of the PNG IHDR chunk. */
function pngSize (buf) {
    if (!buf || buf.length < 24) { return null; }
    for (let i = 0; i < PNG_SIGNATURE.length; i++) {
        if (buf[i] !== PNG_SIGNATURE[i]) { return null; }
    }
    return {
        width: buf.readUInt32BE(16),
        height: buf.readUInt32BE(20)
    };
}

function pristineSource () {
    const shipped = paths.pristineEye();
    if (paths.isFile(shipped)) { return shipped; }
    const backup = backupPath();
    if (paths.isFile(backup)) { return backup; }
    return null;
}

/** Snapshot the stock texture once, before anything overwrites it. */
function ensureBackup () {
    const backup = backupPath();
    if (paths.isFile(backup)) { return; }
    const textures = paths.eyeTextures();
    const source = paths.isFile(textures[0]) ? textures[0] : pristineSource();
    if (!source) { return; }
    paths.ensureDir(eyeDir());
    fs.writeFileSync(backup, fs.readFileSync(source));
}

function writeTextures (buf) {
    const targets = paths.eyeTextures();
    const written = [];
    const failed = [];
    targets.forEach((target) => {
        try {
            paths.ensureDir(path.dirname(target));
            // Stock textures often land as root-owned 644; open them up when we can.
            try { fs.chmodSync(target, 0o666); } catch (chmodErr) { /* may not exist yet */ }
            fs.writeFileSync(target, buf);
            written.push(target);
        } catch (err) {
            failed.push({ path: target, error: err.message });
        }
    });
    // All stock eye copies (Default_Eye, customizer indices, White_Eye aliases)
    // must match or animations like petting flip back to the original.
    if (failed.length || written.length !== targets.length) {
        const detail = failed.length
            ? failed.map((f) => path.basename(f.path) + ': ' + f.error).join('; ')
            : 'unexpected write count';
        throw fail(
            'Could not write all eye textures (' + written.length + '/' + targets.length + '). ' +
            detail,
            500
        );
    }
    return { written: written, failed: failed };
}

function state () {
    const saved = readState();
    const custom = paths.isFile(customPath());
    const customHash = custom ? sha1File(customPath()) : null;
    const pristine = pristineSource();
    const pristineHash = pristine ? sha1File(pristine) : null;

    const textures = paths.eyeTextures().map((file) => {
        const hash = sha1File(file);
        return {
            path: file,
            name: path.basename(file),
            exists: paths.isFile(file),
            writable: (function () {
                try {
                    fs.accessSync(file, fs.W_OK);
                    return true;
                } catch (err) {
                    return false;
                }
            })(),
            matchesCustom: !!(hash && customHash && hash === customHash),
            matchesOriginal: !!(hash && pristineHash && hash === pristineHash)
        };
    });

    // Applied only when every stock texture carries the custom image.
    const applied = custom && textures.length > 0 && textures.every((t) => t.matchesCustom);
    return {
        custom: !!custom,
        applied: applied,
        pending: !!custom && !applied,
        name: saved.name || null,
        appliedAt: saved.appliedAt || null,
        width: saved.width || null,
        height: saved.height || null,
        customPath: custom ? customPath() : null,
        originalAvailable: !!pristine,
        originalPath: pristine,
        texturesDir: paths.texturesDir(),
        textures: textures
    };
}

/** Path used for the "current eye" preview in the UI. */
function currentPath () {
    if (paths.isFile(customPath())) { return customPath(); }
    const textures = paths.eyeTextures();
    if (paths.isFile(textures[0])) { return textures[0]; }
    return pristineSource();
}

function apply (buf, name) {
    const size = pngSize(buf);
    if (!size) {
        throw fail('That file is not a PNG. Upload a PNG or JPG through BEacon and ' +
            'it will be converted for you.');
    }
    if (size.width !== size.height) {
        throw fail('The eye texture must be square (got ' + size.width + 'x' + size.height + ').');
    }
    if (size.width < MIN_SIZE || size.width > MAX_SIZE) {
        throw fail('The eye texture must be between ' + MIN_SIZE + 'x' + MIN_SIZE +
            ' and ' + MAX_SIZE + 'x' + MAX_SIZE + ' (720x720 is the stock size).');
    }

    ensureBackup();
    paths.ensureDir(eyeDir());
    fs.writeFileSync(customPath(), buf);

    const result = writeTextures(buf);
    writeState({
        custom: true,
        name: name || 'custom.png',
        appliedAt: new Date().toISOString(),
        width: size.width,
        height: size.height,
        sha1: sha1(buf)
    });

    const current = state();
    current.written = result.written;
    current.failed = result.failed;
    return current;
}

function revert () {
    const source = pristineSource();
    if (!source) {
        throw fail('The original eye texture is missing from ' + paths.pristineEye() +
            ' and no backup was found.', 500);
    }
    const buf = fs.readFileSync(source);
    const result = writeTextures(buf);

    try {
        if (paths.isFile(customPath())) { fs.unlinkSync(customPath()); }
    } catch (err) { /* the state file below is what matters */ }
    writeState({ custom: false, revertedAt: new Date().toISOString() });

    const current = state();
    current.written = result.written;
    current.failed = result.failed;
    return current;
}

/**
 * Put a saved custom eye back if the textures no longer carry it — this is how
 * the eye survives a BEam update, which restores the stock PNGs.
 * Returns the source path when it re-applied, otherwise null.
 */
function selfHeal () {
    const saved = readState();
    if (!saved || !saved.custom) { return null; }
    const custom = customPath();
    if (!paths.isFile(custom)) { return null; }

    const wanted = sha1File(custom);
    const stale = paths.eyeTextures().filter((file) => sha1File(file) !== wanted);
    if (!stale.length) { return null; }

    const buf = fs.readFileSync(custom);
    writeTextures(buf);
    return custom;
}

module.exports = {
    state: state,
    apply: apply,
    revert: revert,
    selfHeal: selfHeal,
    currentPath: currentPath,
    customPath: customPath,
    pngSize: pngSize
};
