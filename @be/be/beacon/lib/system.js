'use strict';

/**
 * Host-level actions: overall status, the jetstream hub the robot talks to,
 * restarting Be through the Skills Service Manager, and running update-beam.sh
 * with its output streamed to the browser.
 */

const fs = require('fs');
const http = require('http');
const os = require('os');
const spawn = require('child_process').spawn;

const paths = require('./paths');
const eye = require('./eye');

const SSM_HOST = '127.0.0.1';
const SSM_PORT = 8779;
const BE_COMMAND = '@be/be';

/** Servers point-at-server.sh offers; the picker itself is not wired up yet. */
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

let updateRunning = false;

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
            updateScript: paths.updateScript()
        },
        eye: eyeState,
        canUpdate: !!paths.updateScript() && paths.onRobot(),
        canRestart: paths.onRobot()
    };
}

function serverConfig () {
    const file = paths.jetstreamConfig();
    const result = {
        configPath: file,
        available: paths.isFile(file),
        current: null,
        options: KNOWN_HUBS,
        editable: false,
        note: 'Changing the server from BEacon is not implemented yet. ' +
            'Run point-at-server.sh over SSH to switch hubs.'
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
    }
    return result;
}

function ssmPost (endpoint) {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify({ command: BE_COMMAND });
        const req = http.request({
            host: SSM_HOST,
            port: SSM_PORT,
            method: 'POST',
            path: endpoint,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(body)
            }
        }, (res) => {
            let text = '';
            res.setEncoding('utf8');
            res.on('data', (chunk) => { text += chunk; });
            res.on('end', () => resolve({ endpoint: endpoint, status: res.statusCode, body: text }));
        });
        req.on('error', (err) => {
            reject(fail('Skills Service Manager (' + SSM_HOST + ':' + SSM_PORT + ') is not ' +
                'reachable: ' + err.message, 503));
        });
        req.setTimeout(10000, () => req.destroy(new Error('timed out')));
        req.end(body);
    });
}

/**
 * Terminate and relaunch Be. This also restarts BEacon, so the browser will
 * lose the connection a moment after the response.
 */
function restartBe () {
    if (!paths.onRobot()) {
        return Promise.reject(fail('Restarting Be only works on the robot.', 503));
    }
    return ssmPost('/terminate')
        .then((terminated) => new Promise((resolve) => {
            setTimeout(() => resolve(terminated), 2000);
        }))
        .then((terminated) => ssmPost('/launch-dev').then((launched) => ({
            ok: true,
            terminate: terminated,
            launch: launched,
            note: 'Be is restarting. BEacon will come back with it in a few seconds.'
        })));
}

/**
 * Run update-beam.sh, streaming its output as it arrives. The script restarts
 * Be at the end, which kills this process mid-stream — the UI treats a dropped
 * connection as "update finished, waiting for BEacon to come back".
 */
function streamUpdate (res) {
    const script = paths.updateScript();

    if (!paths.onRobot()) {
        res.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Updating only works on the robot: /opt/jibo/Jibo/Skills was not found.\n' +
            'update-beam.sh replaces the whole Skills tree, so BEacon will not run it here.\n');
        return;
    }
    if (!script) {
        res.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('update-beam.sh not found at ' + paths.ROBOT_SKILLS + '/update-beam.sh\n');
        return;
    }
    if (updateRunning) {
        res.writeHead(409, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('An update is already running.\n');
        return;
    }

    updateRunning = true;
    res.writeHead(200, {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff'
    });
    res.write('Running ' + script + '\n\n');

    const child = spawn('sh', [script], {
        cwd: paths.ROBOT_SKILLS,
        env: process.env
    });

    child.stdout.on('data', (chunk) => res.write(chunk));
    child.stderr.on('data', (chunk) => res.write(chunk));

    child.on('error', (err) => {
        updateRunning = false;
        res.end('\nCould not run the update script: ' + err.message + '\n');
    });

    child.on('close', (code) => {
        updateRunning = false;
        res.end('\n--- update-beam.sh exited with code ' + code + ' ---\n');
    });

    res.on('close', () => {
        if (updateRunning) {
            // The browser went away (or Be restarted); let the script finish.
            child.stdout.removeAllListeners('data');
            child.stderr.removeAllListeners('data');
        }
    });
}

module.exports = {
    status: status,
    serverConfig: serverConfig,
    restartBe: restartBe,
    streamUpdate: streamUpdate,
    lanAddresses: lanAddresses,
    KNOWN_HUBS: KNOWN_HUBS
};
