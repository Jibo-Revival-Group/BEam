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
    const rel = (pkg.jibo && pkg.jibo.skillsRoot) || '..';
    return path.isAbsolute(rel) ? rel : path.resolve(BE_ROOT, rel);
}

/**
 * Same candidate order as the jukebox skill's MusicLibrary.resolveMusicDir so
 * BEacon always writes to the folder the skill will read back. The canonical
 * @be/skills path used by update-beam.sh is checked too, and the repo-relative
 * path keeps development off-robot working.
 */
function musicDirCandidates () {
    return [
        ROBOT_SKILLS + '/@be/be/node_modules/@be/jukebox/music',
        ROBOT_SKILLS + '/@be/skills/jukebox/music',
        '/opt/tmp/jukebox-music',
        path.join(skillsRoot(), 'jukebox', 'music')
    ];
}

function musicDir () {
    const candidates = musicDirCandidates();
    return firstDir(candidates) || candidates[candidates.length - 1];
}

function texturesDir () {
    return path.join(
        BE_ROOT,
        'node_modules', 'animation-utilities', 'res', 'geometry-config', 'P1.0', 'textures'
    );
}

/**
 * The three byte-identical 720x720 PNGs that make up Jibo's default eye.
 * jibo.js hardcodes Default_Eye.png as DEFAULT_TEXTURES.EYE while animations
 * address the same image through the customizer indices, so a custom eye has
 * to be written to all three.
 */
function eyeTextures () {
    const dir = texturesDir();
    return [
        path.join(dir, 'Default_Eye.png'),
        path.join(dir, 'JiBO_eye_customizer_00.png'),
        path.join(dir, 'JiBO_eye_customizer_38.png')
    ];
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
    musicDirCandidates: musicDirCandidates,
    texturesDir: texturesDir,
    eyeTextures: eyeTextures,
    pristineEye: pristineEye,
    dataDir: dataDir,
    updateScript: updateScript,
    jetstreamConfig: jetstreamConfig
};
