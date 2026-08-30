'use strict';

/**
 * Every on-disk location BEacon touches, resolved once for both the robot
 * (/opt/jibo/Jibo/Skills/...) and a plain repo checkout used for development.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');

const BE_ROOT = path.resolve(__dirname, '..', '..');
const REPO_ROOT = path.resolve(BE_ROOT, '..', '..');
const BEACON_ROOT = path.resolve(__dirname, '..');

const ROBOT_SKILLS = '/opt/jibo/Jibo/Skills';
const ROBOT_KNOWLEDGE = '/opt/jibo/Knowledge';
const ROBOT_PHOTOS = '/opt/jibo/Photos';

function isDir (p) {
    try {
        return !!p && fs.existsSync(p) && fs.statSync(p).isDirectory();
    } catch (err) {
        return false;
    }
}

function isFile (p) {
    try {
        return !!p && fs.existsSync(p) && fs.statSync(p).isFile();
    } catch (err) {
        return false;
    }
}

function firstDir (candidates) {
    for (let i = 0; i < candidates.length; i++) {
        if (isDir(candidates[i])) { return candidates[i]; }
    }
    return null;
}

function firstFile (candidates) {
    for (let i = 0; i < candidates.length; i++) {
        if (isFile(candidates[i])) { return candidates[i]; }
    }
    return null;
}

function onRobot () {
    return isDir(ROBOT_SKILLS);
}

function bePackage () {
    try {
        return JSON.parse(fs.readFileSync(path.join(BE_ROOT, 'package.json'), 'utf8'));
    } catch (err) {
        return {};
    }
}

function skillsRoot () {
    const pkg = bePackage();
    const rel = (pkg.jibo && pkg.jibo.skillsRoot) || './skills';
    return path.isAbsolute(rel) ? rel : path.resolve(BE_ROOT, rel);
}

/**
 * Canonical user library — under Knowledge so OTA of @be/be (and Skills
 * tree swaps) cannot wipe albums. Legacy Skills paths stay as read fallbacks
 * and are migrated once into Knowledge when found.
 */
function musicDirCanonical () {
    return path.join(ROBOT_KNOWLEDGE, 'jukebox', 'music');
}

function musicDirCandidates () {
    return [
        musicDirCanonical(),
        ROBOT_SKILLS + '/@be/Skills/Jukebox/Music',
        ROBOT_SKILLS + '/@be/be/skills/jukebox/music',
        ROBOT_SKILLS + '/@be/skills/jukebox/music',
        ROBOT_SKILLS + '/@be/jukebox/music',
        ROBOT_SKILLS + '/@be/be/node_modules/@be/jukebox/music',
        ROBOT_SKILLS + '/skills/jukebox/music',
        '/opt/tmp/jukebox-music',
        path.join(skillsRoot(), 'jukebox', 'music')
    ];
}

const AUDIO_FILE_RE = /\.(mp3|opus|ogg|oga)$/i;

/** True when dir has at least one playable track (album or Artist/Album layout). */
function musicDirHasAlbums (dir) {
    if (!isDir(dir)) { return false; }
    let entries;
    try {
        entries = fs.readdirSync(dir);
    } catch (err) {
        return false;
    }
    for (let i = 0; i < entries.length; i++) {
        const name = entries[i];
        if (!name || name.charAt(0) === '.' || name === 'README.md') { continue; }
        const full = path.join(dir, name);
        let st;
        try {
            st = fs.statSync(full);
        } catch (err) {
            continue;
        }
        if (st.isFile()) {
            if (AUDIO_FILE_RE.test(name)) { return true; }
            continue;
        }
        if (!st.isDirectory()) { continue; }
        let kids;
        try {
            kids = fs.readdirSync(full);
        } catch (err) {
            continue;
        }
        for (let k = 0; k < kids.length; k++) {
            const kid = kids[k];
            if (!kid || kid.charAt(0) === '.') { continue; }
            if (AUDIO_FILE_RE.test(kid)) { return true; }
            const nested = path.join(full, kid);
            try {
                if (!fs.statSync(nested).isDirectory()) { continue; }
                const grand = fs.readdirSync(nested);
                for (let g = 0; g < grand.length; g++) {
                    if (AUDIO_FILE_RE.test(grand[g])) { return true; }
                }
            } catch (err) { /* try next */ }
        }
    }
    return false;
}

function copyDirRecursive (src, dest) {
    ensureDir(dest);
    const entries = fs.readdirSync(src);
    for (let i = 0; i < entries.length; i++) {
        const name = entries[i];
        const from = path.join(src, name);
        const to = path.join(dest, name);
        const st = fs.statSync(from);
        if (st.isDirectory()) {
            copyDirRecursive(from, to);
        } else {
            fs.writeFileSync(to, fs.readFileSync(from));
        }
    }
}

/**
 * If Knowledge has no albums yet but a legacy Skills/tmp library does, move
 * (or copy) it into Knowledge once so the next OTA cannot wipe it.
 */
function migrateMusicToKnowledge () {
    if (!onRobot()) { return null; }
    const dest = musicDirCanonical();
    if (musicDirHasAlbums(dest)) { return null; }

    const candidates = musicDirCandidates();
    for (let i = 0; i < candidates.length; i++) {
        const src = candidates[i];
        if (!src || src === dest || !musicDirHasAlbums(src)) { continue; }
        try {
            ensureDir(path.dirname(dest));
            if (isDir(dest)) {
                try { fs.rmdirSync(dest); } catch (err) { /* may be non-empty stub */ }
            }
            try {
                fs.renameSync(src, dest);
            } catch (err) {
                copyDirRecursive(src, dest);
            }
            console.log('[beacon] migrated jukebox music from', src, 'to', dest);
            return dest;
        } catch (err) {
            console.warn('[beacon] music migrate failed from', src, ':', err && err.message);
        }
    }
    return null;
}

/**
 * Resolve the live music library. Prefer a directory that actually contains
 * albums; empty libraries write to Knowledge.
 */
function musicDir () {
    migrateMusicToKnowledge();
    const candidates = musicDirCandidates();
    for (let i = 0; i < candidates.length; i++) {
        if (musicDirHasAlbums(candidates[i])) {
            return candidates[i];
        }
    }
    if (onRobot()) {
        return ensureDir(musicDirCanonical());
    }
    const local = path.join(skillsRoot(), 'jukebox', 'music');
    return firstDir([local]) || local;
}

/** Local photo store used by the Jibo media and media-manager services. */
function photosDir () {
    const override = process.env.BEACON_PHOTOS_DIR;
    return override ? path.resolve(override) : ROBOT_PHOTOS;
}

function texturesDir () {
    return path.join(
        BE_ROOT,
        'node_modules', 'animation-utilities', 'res', 'geometry-config', 'P1.0', 'textures'
    );
}

/**
 * Every on-disk copy of the stock default eye that a custom eye must replace.
 *
 * jibo.js loads Default_Eye.png as DEFAULT_TEXTURES.EYE; geometry-config also
 * ships two byte-identical customizer indices. Animations (headtouch/petting,
 * idles, etc.) almost always keyframe eyeTextureInfixBn_r to White_Eye.png in
 * jibo-anim-db-animations — same 720×720 pixels as Default_Eye — so leaving
 * that file alone makes the face snap back to the stock eye after an anim.
 * A few skills ship their own White_Eye / white-eye copies of the same image.
 *
 * Recipe's White_Eye.png is a different asset and is intentionally omitted.
 */
function eyeAliasCandidates () {
    const skills = skillsRoot();
    return [
        path.join(BE_ROOT, 'node_modules', 'jibo-anim-db-animations',
            'animations', 'textures', 'White_Eye.png'),
        path.join(BE_ROOT, 'node_modules', 'jibo-embodied-dialog',
            'resources', 'animations', 'textures', 'white-eye.png'),
        path.join(skills, 'circuit-saver', 'animations', 'textures', 'White_Eye.png'),
        path.join(skills, 'ifttt', 'animations', 'textures', 'White_Eye.png'),
        path.join(skills, 'introductions', 'animations', 'textures', 'White_Eye.png'),
        path.join(skills, 'introductions', 'animations', 'textures', 'white-eye.png'),
        path.join(skills, 'settings', 'animations', 'textures', 'White_Eye.png'),
        path.join(skills, 'settings', 'animations', 'textures', 'white-eye.png')
    ];
}

function eyeTextures () {
    const dir = texturesDir();
    const list = [
        path.join(dir, 'Default_Eye.png'),
        path.join(dir, 'JiBO_eye_customizer_00.png'),
        path.join(dir, 'JiBO_eye_customizer_38.png')
    ];
    eyeAliasCandidates().forEach((p) => {
        if (isFile(p)) { list.push(p); }
    });
    return list;
}

function pristineEye () {
    return path.join(BEACON_ROOT, 'assets', 'eye-original', 'Default_Eye.png');
}

/**
 * Writable state that must outlive Skills / @be/be OTA updates. Lives under
 * Knowledge (same root jibo-kb uses) instead of /opt/tmp or the Skills tree.
 */
function dataDir () {
    return onRobot()
        ? path.join(ROBOT_KNOWLEDGE, 'beacon')
        : path.join(os.tmpdir(), 'beam-beacon');
}

/** Pre-Knowledge BEacon data location — still checked for eye migration. */
function dataDirLegacy () {
    return '/opt/tmp/beacon';
}

function ensureDir (dir) {
    if (isDir(dir)) { return dir; }
    const parent = path.dirname(dir);
    if (parent && parent !== dir) { ensureDir(parent); }
    try {
        fs.mkdirSync(dir);
    } catch (err) {
        if (err.code !== 'EEXIST') { throw err; }
    }
    return dir;
}

function updateScript () {
    return firstFile([
        ROBOT_SKILLS + '/update-beam.sh',
        path.join(REPO_ROOT, 'update-beam.sh')
    ]);
}

function jetstreamConfig () {
    return '/usr/local/etc/jibo-jetstream-service.json';
}

/** OTA / update-service credentials (keys must never be rewritten by BEacon). */
function credentialsPath () {
    return '/var/jibo/credentials.json';
}

module.exports = {
    BE_ROOT: BE_ROOT,
    REPO_ROOT: REPO_ROOT,
    BEACON_ROOT: BEACON_ROOT,
    ROBOT_SKILLS: ROBOT_SKILLS,
    ROBOT_KNOWLEDGE: ROBOT_KNOWLEDGE,
    ROBOT_PHOTOS: ROBOT_PHOTOS,
    publicDir: path.join(BEACON_ROOT, 'public'),
    onRobot: onRobot,
    isDir: isDir,
    isFile: isFile,
    ensureDir: ensureDir,
    bePackage: bePackage,
    skillsRoot: skillsRoot,
    musicDir: musicDir,
    musicDirCanonical: musicDirCanonical,
    musicDirCandidates: musicDirCandidates,
    musicDirHasAlbums: musicDirHasAlbums,
    migrateMusicToKnowledge: migrateMusicToKnowledge,
    photosDir: photosDir,
    texturesDir: texturesDir,
    eyeTextures: eyeTextures,
    pristineEye: pristineEye,
    dataDir: dataDir,
    dataDirLegacy: dataDirLegacy,
    updateScript: updateScript,
    jetstreamConfig: jetstreamConfig,
    credentialsPath: credentialsPath
};
