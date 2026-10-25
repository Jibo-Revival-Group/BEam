'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');

// Stable across installed package revisions and BEam updates.
function dataRoot() {
    if (process.env.BE_MUSIC_DATA_DIR) return path.resolve(process.env.BE_MUSIC_DATA_DIR);
    return fs.existsSync('/opt/jibo/Jibo/Skills')
        ? '/opt/jibo/Knowledge/music'
        : path.join(os.tmpdir(), 'beam-music');
}
function ensureDirectory(dir) {
    try { fs.mkdirSync(dir, 448); }
    catch (error) {
        if (error.code === 'ENOENT') {
            ensureDirectory(path.dirname(dir));
            ensureDirectory(dir);
        } else if (error.code !== 'EEXIST' || !fs.statSync(dir).isDirectory()) throw error;
    }
    return dir;
}
module.exports = { dataRoot: dataRoot, ensureDirectory: ensureDirectory };
