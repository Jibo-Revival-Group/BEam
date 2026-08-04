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

function eyeDirLegacy () {
    return path.join(paths.dataDirLegacy(), 'eye');
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

/**
 * Move a prior /opt/tmp/beacon/eye library into Knowledge once so OTA cannot
 * drop the custom eye with a Skills replacement.
 */
function migrateEyeFromLegacy () {
    if (!paths.onRobot()) { return; }
    const destCustom = customPath();
    if (paths.isFile(destCustom)) { return; }
    const legacyDir = eyeDirLegacy();
    const legacyCustom = path.join(legacyDir, 'custom.png');
    if (!paths.isFile(legacyCustom)) { return; }
    try {
        paths.ensureDir(eyeDir());
        ['custom.png', 'state.json', 'original-backup.png'].forEach((name) => {
            const from = path.join(legacyDir, name);
            const to = path.join(eyeDir(), name);
            if (paths.isFile(from) && !paths.isFile(to)) {
                fs.writeFileSync(to, fs.readFileSync(from));
            }
        });
        console.log('[beacon] migrated custom eye from', legacyDir, 'to', eyeDir());
    } catch (err) {
        console.warn('[beacon] eye migrate failed:', err && err.message);
    }
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

/**
 * Drop the face's cached default eye textures and re-load them from disk so a
 * newly written PNG shows without restarting Be. BEacon shares Be's Electron
 * process, so require('jibo') reaches the live FaceRenderer.
 *
 * Animations keyframe White_Eye.png and keep stock PIXI textures on KeysData.
 * getTexture() returns those during/after anims, which used to snap the face
 * back to stock until a full Be restart. We hook getTexture so stock eye paths
 * always resolve to the live custom default, and rewrite matching BaseTextures.
 */
function isStockEyeTexturePath (value) {
    if (!value || typeof value !== 'string') { return false; }
    const base = value.split(/[/\\]/).pop().toLowerCase();
    return base === 'default_eye.png' ||
        base === 'white_eye.png' ||
        base === 'white-eye.png' ||
        base === 'jibo_eye_customizer_00.png' ||
        base === 'jibo_eye_customizer_38.png';
}

function installEyeTextureHook (container) {
    if (!container || container._beamEyeHooked) { return; }
    const origGetTexture = container.getTexture.bind(container);
    container.getTexture = function (value) {
        if (isStockEyeTexturePath(value) &&
            container.eye &&
            container.eye._defaultTexture) {
            return container.eye._defaultTexture;
        }
        return origGetTexture(value);
    };

    // Treat White_Eye / aliases as "the default eye" so texturePath falls back
    // to _defaultTexture instead of keeping a separately loaded stock copy.
    ['eye', 'eyeOverlay'].forEach((name) => {
        const layer = container[name];
        if (!layer || typeof layer._isDefaultTexture !== 'function' || layer._beamEyeIsDefaultHooked) {
            return;
        }
        const origIsDefault = layer._isDefaultTexture.bind(layer);
        layer._isDefaultTexture = function (texture, value) {
            if (isStockEyeTexturePath(value)) { return true; }
            return origIsDefault(texture, value);
        };
        layer._beamEyeIsDefaultHooked = true;
    });

    container._beamEyeHooked = true;
}

function rewriteCachedEyeBaseTextures (jibo, face, customTexture) {
    const base = customTexture && customTexture.baseTexture;
    const source = base && base.source;
    if (!source) { return 0; }

    let pixi = null;
    try {
        pixi = require('pixi.js');
    } catch (err) {
        try { pixi = global.PIXI; } catch (err2) { /* none */ }
    }
    if (!pixi || !pixi.utils || !pixi.utils.BaseTextureCache) { return 0; }

    let updated = 0;
    const cache = pixi.utils.BaseTextureCache;
    Object.keys(cache).forEach((key) => {
        if (!isStockEyeTexturePath(key)) { return; }
        const bt = cache[key];
        if (!bt || bt === base) { return; }
        try {
            bt.source = source;
            if (typeof bt.update === 'function') { bt.update(); }
            if (face.textureManager && typeof face.textureManager.updateTexture === 'function') {
                face.textureManager.updateTexture(bt);
            }
            updated += 1;
        } catch (err) { /* keep going */ }
    });
    return updated;
}

function reloadFace () {
    let jibo;
    try {
        jibo = require('jibo');
    } catch (err) {
        return Promise.resolve({ live: false, reason: 'jibo not available' });
    }
    const face = jibo.face;
    if (!face || !face.eye) {
        return Promise.resolve({ live: false, reason: 'face not ready yet' });
    }
    if (!jibo.loader || typeof jibo.loader.load !== 'function') {
        return Promise.resolve({ live: false, reason: 'jibo.loader not available' });
    }

    const container = face.eye;
    const cacheId = container.CACHE_ID || 'global-eye';
    const dir = paths.texturesDir();
    const assets = [
        {
            id: 'eye',
            src: path.join(dir, 'Default_Eye.png'),
            type: 'texture',
            cache: cacheId
        },
        {
            id: 'eyeOverlay',
            src: path.join(dir, 'JiBO_eye_customizer_44.png'),
            type: 'texture',
            cache: cacheId
        },
        {
            id: 'background',
            src: path.join(dir, 'JiBO_BG_00.png'),
            type: 'texture',
            cache: cacheId
        }
    ];

    // Also re-cache the primary White_Eye alias so any _loadTexture fallback
    // that misses the getTexture hook still reads the custom PNG from disk.
    const whiteEye = path.join(
        paths.BE_ROOT,
        'node_modules', 'jibo-anim-db-animations',
        'animations', 'textures', 'White_Eye.png'
    );
    if (paths.isFile(whiteEye)) {
        assets.push({
            id: whiteEye,
            src: whiteEye,
            type: 'texture',
            cache: cacheId
        });
    }

    try {
        if (typeof jibo.loader.deleteCache === 'function') {
            jibo.loader.deleteCache(cacheId);
        }
        if (typeof jibo.loader.addCache === 'function') {
            jibo.loader.addCache(cacheId);
        }
    } catch (err) {
        return Promise.resolve({ live: false, reason: err.message || String(err) });
    }

    return new Promise((resolve) => {
        try {
            jibo.loader.load(assets, {
                complete: (err, results) => {
                    if (err || !results || !results.eye) {
                        resolve({
                            live: false,
                            reason: (err && (err.message || String(err))) || 'texture load failed'
                        });
                        return;
                    }
                    try {
                        installEyeTextureHook(container);

                        const applyDefault = (layer, texture) => {
                            if (!layer || !texture) { return; }
                            layer._defaultTexture = texture;
                            if (typeof layer.setTexture === 'function') {
                                layer.setTexture(texture);
                            }
                            if (texture.baseTexture && texture.baseTexture.imageUrl) {
                                layer._texturePath = texture.baseTexture.imageUrl;
                            }
                        };
                        applyDefault(container.eye, results.eye);
                        applyDefault(container.eyeOverlay, results.eyeOverlay);
                        applyDefault(container.background, results.background);

                        const rewritten = rewriteCachedEyeBaseTextures(jibo, face, results.eye);

                        if (typeof container.reset === 'function') {
                            container.reset();
                        }
                        try {
                            if (face.textureManager && typeof face.textureManager.updateTexture === 'function') {
                                const baseTex = results.eye.baseTexture || results.eye;
                                face.textureManager.updateTexture(baseTex);
                            }
                        } catch (gpuErr) { /* still applied to the sprite */ }

                        resolve({
                            live: true,
                            rewrittenBaseTextures: rewritten
                        });
                    } catch (applyErr) {
                        resolve({ live: false, reason: applyErr.message || String(applyErr) });
                    }
                }
            });
        } catch (loadErr) {
            resolve({ live: false, reason: loadErr.message || String(loadErr) });
        }
    });
}

function attachLive (current, disk, live) {
    if (disk) {
        current.written = disk.written;
        current.failed = disk.failed;
    }
    current.live = !!(live && live.live);
    current.liveReason = (live && live.reason) || null;
    if (live && live.rewrittenBaseTextures != null) {
        current.rewrittenBaseTextures = live.rewrittenBaseTextures;
    }
    return current;
}

function state () {
    migrateEyeFromLegacy();
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
    migrateEyeFromLegacy();
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

    const disk = writeTextures(buf);
    writeState({
        custom: true,
        name: name || 'custom.png',
        appliedAt: new Date().toISOString(),
        width: size.width,
        height: size.height,
        sha1: sha1(buf)
    });

    return reloadFace().then((live) => attachLive(state(), disk, live));
}

function revert () {
    const source = pristineSource();
    if (!source) {
        throw fail('The original eye texture is missing from ' + paths.pristineEye() +
            ' and no backup was found.', 500);
    }
    const buf = fs.readFileSync(source);
    const disk = writeTextures(buf);

    try {
        if (paths.isFile(customPath())) { fs.unlinkSync(customPath()); }
    } catch (err) { /* the state file below is what matters */ }
    writeState({ custom: false, revertedAt: new Date().toISOString() });

    return reloadFace().then((live) => attachLive(state(), disk, live));
}

/**
 * Re-write the saved custom eye onto every stock texture path, then reload the
 * live face so the user sees it without restarting Be.
 */
function refresh () {
    migrateEyeFromLegacy();
    let disk = null;
    if (paths.isFile(customPath())) {
        disk = writeTextures(fs.readFileSync(customPath()));
        const saved = readState();
        writeState({
            custom: true,
            name: saved.name || 'custom.png',
            appliedAt: new Date().toISOString(),
            width: saved.width || null,
            height: saved.height || null,
            sha1: sha1File(customPath())
        });
    } else if (pristineSource()) {
        disk = writeTextures(fs.readFileSync(pristineSource()));
    } else {
        return Promise.reject(fail('No custom eye or original texture to refresh.', 404));
    }

    return reloadFace().then((live) => attachLive(state(), disk, live));
}

/**
 * Put a saved custom eye back if the textures no longer carry it — this is how
 * the eye survives a BEam update, which restores the stock PNGs.
 * Returns the source path when it re-applied, otherwise null.
 */
function selfHeal () {
    migrateEyeFromLegacy();
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
    refresh: refresh,
    reloadFace: reloadFace,
    selfHeal: selfHeal,
    currentPath: currentPath,
    customPath: customPath,
    pngSize: pngSize
};
