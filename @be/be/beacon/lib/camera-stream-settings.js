'use strict';

const fs = require('fs');
const path = require('path');
const paths = require('./paths');

function file() { return path.join(paths.dataDir(), 'camera-stream-settings.json'); }
function get() {
    try { return JSON.parse(fs.readFileSync(file(), 'utf8')).enabled === true; }
    catch (error) {
        // Keep existing installations enabled; malformed settings fail closed.
        return error.code === 'ENOENT';
    }
}
function set(enabled) {
    if (typeof enabled !== 'boolean') {
        const error = new Error('Camera streaming enabled must be true or false');
        error.status = 400;
        throw error;
    }
    paths.ensureDir(paths.dataDir());
    const destination = file();
    fs.writeFileSync(destination + '.tmp', JSON.stringify({ enabled: enabled }) + '\n');
    fs.renameSync(destination + '.tmp', destination);
    return enabled;
}
module.exports = { get: get, set: set };
