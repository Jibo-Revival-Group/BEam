'use strict';

/**
 * Host-level actions: overall status, jetstream hub, and OTA credentials endpoint.
 */

const fs = require('fs');
const os = require('os');
const spawnSync = require('child_process').spawnSync;

const paths = require('./paths');
const eye = require('./eye');

/** Preset jetstream hubs offered in the Server panel. */
const KNOWN_HUBS = [
    {
        hostname: 'api.openjibo.com',
        port: 443,
        label: 'OpenJibo (recommended, paid)'
    },
    {
        hostname: 'api.5x1.com',
        port: 80,
        label: '5x1 (free)'
    }
];

/** Preset OTA credential endpoints (host:port → http URL). */
const KNOWN_UPDATE_ENDPOINTS = [
    {
        endpoint: 'http://oat.5x1.com:80',
        label: 'oat.5x1.com:80 (public BEam OTA)'
    },
    {
        endpoint: 'http://joap.5x1.com:80',
        label: 'joap.5x1.com:80'
    }
];

function fail (message, status) {
    const err = new Error(message);
    err.status = status || 500;
    return err;
}

function lanAddresses () {
    const found = [];
    const ifaces = os.networkInterfaces();
    Object.keys(ifaces).forEach((name) => {
        (ifaces[name] || []).forEach((addr) => {
            if (addr.family === 'IPv4' && !addr.internal) {
                found.push({ iface: name, address: addr.address });
            }
        });
    });
    return found;
}

function remountRw () {
    if (!paths.onRobot()) { return; }
    try {
        const result = spawnSync('jibo-mount', ['--rw'], { encoding: 'utf8' });
        if (result.status !== 0 && result.error) {
            console.warn('[beacon] jibo-mount --rw:', result.error.message);
        }
    } catch (err) {
        console.warn('[beacon] jibo-mount --rw failed:', err && err.message);
    }
}

function status () {
    const pkg = paths.bePackage();
    let eyeState = null;
    try {
        const current = eye.state();
        eyeState = { custom: current.custom, applied: current.applied, pending: current.pending };
    } catch (err) {
        eyeState = { custom: false, error: err.message };
    }

    return {
        name: 'BEacon',
        host: {
            name: pkg.name || '@be/be',
            version: pkg.version || null
        },
        robot: paths.onRobot(),
        hostname: os.hostname(),
        platform: process.platform + ' ' + os.release(),
        versions: {
            node: process.versions.node,
            electron: process.versions.electron || null,
            chrome: process.versions.chrome || null
        },
        uptimeSeconds: Math.round(process.uptime()),
        addresses: lanAddresses(),
        paths: {
            beRoot: paths.BE_ROOT,
            skillsRoot: paths.skillsRoot(),
            musicDir: paths.musicDir(),
            musicDirExists: paths.isDir(paths.musicDir()),
            texturesDir: paths.texturesDir(),
            dataDir: paths.dataDir(),
            jetstreamConfig: paths.jetstreamConfig(),
            credentialsPath: paths.credentialsPath()
        },
        eye: eyeState
    };
}

function serverConfig () {
    const file = paths.jetstreamConfig();
    const result = {
        configPath: file,
        available: paths.isFile(file),
        current: null,
        options: KNOWN_HUBS,
        editable: paths.onRobot() && paths.isFile(file),
        note: paths.onRobot()
            ? 'Pick a hub or enter a custom host and port. Saving remounts RW, ' +
              'writes the jetstream config, and restarts the jetstream service.'
            : 'Jetstream editing only works on the robot.'
    };

    if (!result.available) {
        result.error = paths.onRobot()
            ? 'Jetstream config not found at ' + file
            : 'Not running on a robot, so there is no jetstream config to read.';
        return result;
    }

    try {
        const data = JSON.parse(fs.readFileSync(file, 'utf8'));
        const override = (data.HubClient && data.HubClient.override) || {};
        result.current = {
            hostname: override.hub_hostname || null,
            port: override.hub_port || null,
            entrypoint: override.entrypoint_hostname || null
        };
    } catch (err) {
        result.error = 'Could not read ' + file + ': ' + err.message;
        result.editable = false;
    }
    return result;
}

function restartJetstream () {
    try {
        const listed = spawnSync('pgrep', ['-f', 'jibo-jetstream-service'], { encoding: 'utf8' });
        const pids = String(listed.stdout || '')
            .split(/\s+/)
            .map((s) => s.trim())
            .filter(Boolean);
        pids.forEach((pid) => {
            try { process.kill(Number(pid), 'SIGKILL'); } catch (err) { /* already gone */ }
        });
        return { killed: pids.length };
    } catch (err) {
        return { killed: 0, error: err.message };
    }
}

/**
 * Write HubClient.override and restart jetstream (same effect as point-at-server.sh).
 * body: { hostname, port }
 */
function setServer (body) {
    if (!paths.onRobot()) {
        throw fail('Changing the jetstream hub only works on the robot.', 503);
    }
    const hostname = body && String(body.hostname || '').trim();
    const port = Number(body && body.port);
    if (!hostname) {
        throw fail('hostname is required', 400);
    }
    if (!port || port < 1 || port > 65535 || port !== Math.floor(port)) {
        throw fail('port must be an integer between 1 and 65535', 400);
    }

    const file = paths.jetstreamConfig();
    if (!paths.isFile(file)) {
        throw fail('Jetstream config not found at ' + file, 404);
    }

    remountRw();

    let data;
    try {
        data = JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (err) {
        throw fail('Could not read ' + file + ': ' + err.message, 500);
    }

    if (!data.HubClient || typeof data.HubClient !== 'object') {
        data.HubClient = {};
    }
    data.HubClient.override = {
        hub_port: port,
        hub_hostname: hostname,
        entrypoint_hostname: hostname
    };

    try {
        fs.writeFileSync(file, JSON.stringify(data, null, 4) + '\n');
        try { fs.chmodSync(file, 0o777); } catch (chmodErr) { /* best-effort */ }
    } catch (err) {
        throw fail('Could not write ' + file + ': ' + err.message, 500);
    }

    const restart = restartJetstream();
    return {
        ok: true,
        current: {
            hostname: hostname,
            port: port,
            entrypoint: hostname
        },
        jetstreamRestart: restart,
        note: 'Jetstream hub set to ' + hostname + ':' + port +
            (restart.killed ? ' (service restarted).' : ' (could not find jetstream process to kill).')
    };
}

function credentialsState () {
    const file = paths.credentialsPath();
    const result = {
        path: file,
        available: paths.isFile(file),
        editable: false,
        endpoint: null,
        region: null,
        hasKeys: false,
        options: KNOWN_UPDATE_ENDPOINTS,
        note: 'Only the endpoint is editable. accessKeyId, secretAccessKey, and ' +
            'region (unless it is not "api") are never changed from BEacon.'
    };

    if (!result.available) {
        result.error = paths.onRobot()
            ? 'Credentials file not found at ' + file
            : 'Not running on a robot — /var/jibo/credentials.json is unavailable.';
        return result;
    }

    try {
        const data = JSON.parse(fs.readFileSync(file, 'utf8'));
        result.endpoint = data.endpoint || null;
        result.region = data.region || null;
        result.hasKeys = !!(data.accessKeyId && data.secretAccessKey);
        result.editable = paths.onRobot() && result.hasKeys;
        if (!result.hasKeys) {
            result.error = 'Credentials file is missing accessKeyId or secretAccessKey; ' +
                'BEacon will not invent or overwrite keys.';
            result.editable = false;
        }
    } catch (err) {
        result.error = 'Could not read ' + file + ': ' + err.message;
    }
    return result;
}

/**
 * Normalize user input like "joap.5x1.com:80" or "http://host:80" into an http URL.
 * Never accepts/changes API keys.
 */
function normalizeEndpoint (input) {
    let raw = String(input || '').trim();
    if (!raw) {
        throw fail('endpoint is required', 400);
    }
    if (raw.indexOf('://') === -1) {
        raw = 'http://' + raw;
    }
    // Electron/Node 6 has no URL global in all builds — parse lightly.
    const match = /^https?:\/\/([^\/\s]+)(\/.*)?$/i.exec(raw);
    if (!match) {
        throw fail('endpoint must look like http://host:port', 400);
    }
    const hostPort = match[1];
    if (!hostPort || hostPort.indexOf('.') === -1 && hostPort.indexOf(':') === -1) {
        throw fail('endpoint host looks invalid', 400);
    }
    // Keep path if present, default none; always http for the community updater.
    const pathPart = match[2] && match[2] !== '/' ? match[2] : '';
    const protocol = raw.toLowerCase().indexOf('https://') === 0 ? 'https' : 'http';
    return protocol + '://' + hostPort + pathPart;
}

/**
 * Update only credentials.endpoint. Preserve accessKeyId and secretAccessKey
 * byte-for-byte from disk. Force region to "api" when it is missing or wrong.
 * Rejects any attempt to supply keys in the request body.
 */
function setCredentialsEndpoint (body) {
    if (body && (body.accessKeyId != null || body.secretAccessKey != null || body.region != null)) {
        throw fail(
            'BEacon refuses to accept accessKeyId, secretAccessKey, or region in the request. ' +
            'Only endpoint may be set (region is forced to "api" if needed).',
            400
        );
    }
    if (!paths.onRobot()) {
        throw fail('Editing credentials only works on the robot.', 503);
    }

    const endpoint = normalizeEndpoint(body && body.endpoint);
    const file = paths.credentialsPath();
    if (!paths.isFile(file)) {
        throw fail('Credentials file not found at ' + file, 404);
    }

    remountRw();

    let data;
    try {
        data = JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (err) {
        throw fail('Could not read ' + file + ': ' + err.message, 500);
    }

    if (!data.accessKeyId || !data.secretAccessKey) {
        throw fail('Credentials file is missing keys; refusing to write.', 500);
    }

    // Rebuild object so keys/region/endpoint are explicit; values for keys
    // come only from the file we just read.
    const next = {
        secretAccessKey: data.secretAccessKey,
        region: data.region === 'api' ? data.region : 'api',
        endpoint: endpoint,
        accessKeyId: data.accessKeyId
    };
    const regionFixed = data.region !== 'api';

    try {
        fs.writeFileSync(file, JSON.stringify(next) + '\n');
    } catch (err) {
        throw fail('Could not write ' + file + ': ' + err.message, 500);
    }

    return {
        ok: true,
        path: file,
        endpoint: next.endpoint,
        region: next.region,
        regionForcedToApi: regionFixed,
        note: 'endpoint set to ' + next.endpoint +
            (regionFixed ? ' (region forced to "api")' : '')
    };
}

module.exports = {
    status: status,
    serverConfig: serverConfig,
    setServer: setServer,
    credentialsState: credentialsState,
    setCredentialsEndpoint: setCredentialsEndpoint,
    lanAddresses: lanAddresses,
    KNOWN_HUBS: KNOWN_HUBS,
    KNOWN_UPDATE_ENDPOINTS: KNOWN_UPDATE_ENDPOINTS
};
