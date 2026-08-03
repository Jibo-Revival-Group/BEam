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
 * Canonical user library path on the robot. Prefer this when it has albums;
 * otherwise fall back to legacy locations that still hold music.
 */
function musicDirCanonical () {
    return ROBOT_SKILLS + '/@be/Skills/Jukebox/Music';
}

function musicDirCandidates () {
    return [
        musicDirCanonical(),
        // Pack-local library (skills now ship inside @be/be)
        ROBOT_SKILLS + '/@be/be/skills/jukebox/music',
        // Pre-move sibling layout
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

/**
 * Resolve the live music library. Prefer a directory that actually contains
 * albums — never an empty Skills/Jukebox/Music we mkdir'd over a populated
 * legacy path.
 */
function musicDir () {
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
 * Writable state that must outlive an update: update-beam.sh moves the whole
 * Skills tree into old-BEer/, so nothing under BE_ROOT survives.
 */
function dataDir () {
    return onRobot()
        ? '/opt/tmp/beacon'
        : path.join(os.tmpdir(), 'beam-beacon');
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

module.exports = {
    BE_ROOT: BE_ROOT,
    REPO_ROOT: REPO_ROOT,
    BEACON_ROOT: BEACON_ROOT,
    ROBOT_SKILLS: ROBOT_SKILLS,
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
    texturesDir: texturesDir,
    eyeTextures: eyeTextures,
    pristineEye: pristineEye,
    dataDir: dataDir,
    updateScript: updateScript,
    jetstreamConfig: jetstreamConfig
};
