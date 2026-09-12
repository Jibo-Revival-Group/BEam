'use strict';

/**
 * Local temperature-unit preference for weather (BEacon Etc tab).
 *
 * Stored under Knowledge so Skills / @be/be OTA cannot wipe it. Nimbus reads
 * the same file when rewriting Fahrenheit cloud weather copy to Celsius.
 */

const fs = require('fs');
const path = require('path');

const paths = require('./paths');

const VALID = { fahrenheit: true, celsius: true };

function fail (message, status) {
    const err = new Error(message);
    err.status = status || 500;
    return err;
}

function unitsPath () {
    return path.join(paths.dataDir(), 'units.json');
}

function normalizeTemperature (value) {
    if (value === undefined || value === null) { return null; }
    const key = String(value).trim().toLowerCase();
    return VALID[key] ? key : null;
}

function readFile () {
    try {
        if (!paths.isFile(unitsPath())) { return null; }
        return JSON.parse(fs.readFileSync(unitsPath(), 'utf8'));
    } catch (err) {
        return null;
    }
}

function get () {
    const data = readFile();
    const temperature = normalizeTemperature(data && data.temperature) || 'fahrenheit';
    return {
        temperature: temperature,
        path: unitsPath()
    };
}

function set (temperature) {
    const next = normalizeTemperature(temperature);
    if (!next) {
        throw fail('temperature must be "fahrenheit" or "celsius"', 400);
    }
    paths.ensureDir(paths.dataDir());
    const payload = { temperature: next };
    fs.writeFileSync(unitsPath(), JSON.stringify(payload, null, 2) + '\n');
    return {
        ok: true,
        temperature: next,
        path: unitsPath()
    };
}

module.exports = {
    get: get,
    set: set,
    unitsPath: unitsPath,
    normalizeTemperature: normalizeTemperature
};
