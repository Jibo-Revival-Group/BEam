'use strict';

/**
 * Official OTA via jibo-get-update / download-update / apply-update for every
 * installable pack under /opt/jibo/Jibo/Skills (top-level + scoped @org/name).
 *
 * Catalog host = credentials.endpoint (preset http://oat.5x1.com:80).
 * UPDATE_NOT_FOUND means already up to date — not an error.
 * Knowledge music/eyes are outside Skills packs and are not replaced.
 */

const fs = require('fs');
const path = require('path');
const spawn = require('child_process').spawn;
const spawnSync = require('child_process').spawnSync;

const paths = require('./paths');

const FILTER = 'fcs';
const OTA_DIR = '/opt/ota';
const SKIP_NAMES = {
    'old-BEer': true,
    'Beam-master': true,
    'BEam-master': true,
    'node_modules': true
};

function fail (message, status, detail) {
    const err = new Error(message);
    err.status = status || 500;
    if (detail) { err.detail = detail; }
    return err;
}

function remountRw () {
    try {
        spawnSync('jibo-mount', ['--rw'], { encoding: 'utf8' });
    } catch (err) {
        console.warn('[beacon] jibo-mount --rw failed:', err && err.message);
    }
}

function commandExists (name) {
    try {
        const result = spawnSync('which', [name], { encoding: 'utf8' });
        return result.status === 0;
    } catch (err) {
        return false;
    }
}

function readPkg (pkgPath) {
    try {
        return JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    } catch (err) {
        return null;
    }
}

function isDir (p) {
    try {
        return fs.existsSync(p) && fs.statSync(p).isDirectory();
    } catch (err) {
        return false;
    }
}

function shouldSkipName (name) {
    return !name || name.charAt(0) === '.' || !!SKIP_NAMES[name];
}

function safeTarName (subsystem) {
    return String(subsystem || 'update')
        .replace(/^@/, '')
        .replace(/\//g, '-')
        .replace(/[^A-Za-z0-9._-]+/g, '-') + '.tar';
}

function tarPathFor (subsystem) {
    return path.join(OTA_DIR, safeTarName(subsystem));
}

/**
 * Discover OTA-able packs under Skills root.
 * - Skills/foo/package.json → subsystem foo
 * - Skills/@org/name/package.json → subsystem @org/name
 * Nested packs (e.g. @be/be/skills/jukebox) are intentionally ignored.
 */
function listPackages () {
    const root = paths.onRobot()
        ? paths.ROBOT_SKILLS
        : paths.REPO_ROOT;

    const found = [];
    if (!isDir(root)) { return found; }

    let top;
    try {
        top = fs.readdirSync(root);
    } catch (err) {
        return found;
    }

    top.forEach((name) => {
        if (shouldSkipName(name)) { return; }
        const full = path.join(root, name);

        if (name.charAt(0) === '@') {
            let scoped;
            try {
                scoped = fs.readdirSync(full);
            } catch (err) {
                return;
            }
            scoped.forEach((child) => {
                if (shouldSkipName(child)) { return; }
                const dest = path.join(full, child);
                const pkgFile = path.join(dest, 'package.json');
                if (!isDir(dest) || !paths.isFile(pkgFile)) { return; }
                const pkg = readPkg(pkgFile);
                if (!pkg) { return; }
                const subsystem = pkg.name || ('@' + name.slice(1) + '/' + child);
                found.push({
                    subsystem: subsystem,
                    version: pkg.version || '0.0.0',
                    destination: dest,
                    description: pkg.description || ''
                });
            });
            return;
        }

        const pkgFile = path.join(full, 'package.json');
        if (!isDir(full) || !paths.isFile(pkgFile)) { return; }
        const pkg = readPkg(pkgFile);
        if (!pkg) { return; }
        found.push({
            subsystem: pkg.name || name,
            version: pkg.version || '0.0.0',
            destination: full,
            description: pkg.description || ''
        });
    });

    found.sort((a, b) => {
        if (a.subsystem === '@be/be') { return -1; }
        if (b.subsystem === '@be/be') { return 1; }
        return a.subsystem < b.subsystem ? -1 : (a.subsystem > b.subsystem ? 1 : 0);
    });
    return found;
}

function findPackage (subsystem) {
    const name = String(subsystem || '').trim();
    if (!name) { return null; }
    const all = listPackages();
    for (let i = 0; i < all.length; i++) {
        if (all[i].subsystem === name) { return all[i]; }
    }
    return null;
}

function parseJsonBlob (text) {
    const raw = String(text || '').trim();
    if (!raw) { return null; }
    try {
        return JSON.parse(raw);
    } catch (err) {
        const lines = raw.split(/\r?\n/);
        for (let i = lines.length - 1; i >= 0; i--) {
            const line = lines[i].trim();
            if (!line || line.charAt(0) !== '{') { continue; }
            try {
                return JSON.parse(line);
            } catch (e) { /* try earlier */ }
        }
    }
    return null;
}

function isUpdateNotFound (blob, stdout, stderr) {
    if (blob && blob.error) {
        const code = blob.error.code || blob.code;
        const status = blob.error.statusCode || blob.statusCode;
        const message = String(blob.error.message || blob.message || '');
        if (code === 'UPDATE_NOT_FOUND' || status === 404) { return true; }
        if (/update not found/i.test(message)) { return true; }
    }
    const combined = String(stdout || '') + '\n' + String(stderr || '');
    return /UPDATE_NOT_FOUND/.test(combined) ||
        /"statusCode"\s*:\s*404/.test(combined) && /Update not found/i.test(combined);
}

function toolsState () {
    return {
        'jibo-mount': commandExists('jibo-mount'),
        'jibo-get-update': commandExists('jibo-get-update'),
        'jibo-download-update': commandExists('jibo-download-update'),
        'jibo-apply-update': commandExists('jibo-apply-update')
    };
}

function state () {
    const onRobot = paths.onRobot();
    const tools = toolsState();
    const ready = onRobot &&
        tools['jibo-get-update'] &&
        tools['jibo-download-update'] &&
        tools['jibo-apply-update'];

    return {
        robot: onRobot,
        ready: ready,
        filter: FILTER,
        credentialsPath: paths.credentialsPath(),
        otaDir: OTA_DIR,
        packages: listPackages(),
        tools: tools,
        note: onRobot
            ? (ready
                ? 'Checks each Skills-root pack against the credentials endpoint ' +
                  '(public: http://oat.5x1.com:80). UPDATE_NOT_FOUND means up to date.'
                : 'Missing jibo-*-update tools on PATH.')
            : 'OTA only runs on the robot. Dev checkout lists repo-root packs.'
    };
}

function normalizeOffer (offer, pkg) {
    return {
        id: offer._id || offer.id,
        accountId: offer.accountId,
        fromVersion: offer.fromVersion,
        toVersion: offer.toVersion,
        changes: offer.changes,
        url: offer.url,
        shaHash: offer.shaHash,
        length: offer.length,
        subsystem: offer.subsystem || pkg.subsystem,
        filter: offer.filter || FILTER,
        destination: pkg.destination
    };
}

/**
 * Check one subsystem. UPDATE_NOT_FOUND → upToDate:true (HTTP 200 from BEacon).
 */
function checkOne (subsystem) {
    if (!paths.onRobot()) {
        throw fail('Checking for OTA updates only works on the robot.', 503);
    }
    if (!commandExists('jibo-get-update')) {
        throw fail('jibo-get-update not found on PATH', 500);
    }

    const pkg = findPackage(subsystem);
    if (!pkg) {
        throw fail('Unknown subsystem: ' + subsystem, 404);
    }

    remountRw();

    const args = [
        '--credentials', paths.credentialsPath(),
        '--subsystem', pkg.subsystem,
        '--version', pkg.version,
        '--filter', FILTER
    ];
    const result = spawnSync('jibo-get-update', args, {
        encoding: 'utf8',
        maxBuffer: 8 * 1024 * 1024
    });
    const stdout = String(result.stdout || '');
    const stderr = String(result.stderr || '');
    if (result.error) {
        throw fail('jibo-get-update failed to start', 500, result.error.message);
    }

    const blob = parseJsonBlob(stdout) || parseJsonBlob(stderr);

    if (isUpdateNotFound(blob, stdout, stderr)) {
        return {
            ok: true,
            upToDate: true,
            subsystem: pkg.subsystem,
            currentVersion: pkg.version,
            destination: pkg.destination,
            offer: null,
            message: pkg.subsystem + ' ' + pkg.version + ' is up to date'
        };
    }

    if (result.status !== 0) {
        throw fail(
            'jibo-get-update exited ' + result.status + ' for ' + pkg.subsystem,
            500,
            (stderr || stdout || '').trim() || 'no output'
        );
    }

    if (!blob || !blob.url) {
        throw fail(
            'No update offer returned for ' + pkg.subsystem,
            500,
            (stdout || stderr || 'empty response').trim()
        );
    }

    return {
        ok: true,
        upToDate: false,
        subsystem: pkg.subsystem,
        currentVersion: pkg.version,
        destination: pkg.destination,
        offer: normalizeOffer(blob, pkg),
        message: 'Update available: ' + pkg.version + ' → ' + (blob.toVersion || '?')
    };
}

/** Check every discovered pack (or the listed subsystem names). */
function check (body) {
    const wanted = body && body.subsystem
        ? [String(body.subsystem)]
        : (body && Array.isArray(body.subsystems) ? body.subsystems.map(String) : null);

    const packages = listPackages().filter((pkg) => {
        if (!wanted || !wanted.length) { return true; }
        return wanted.indexOf(pkg.subsystem) !== -1;
    });

    if (!packages.length) {
        throw fail(
            wanted && wanted.length
                ? 'No matching subsystems: ' + wanted.join(', ')
                : 'No Skills-root packages found to check',
            404
        );
    }

    remountRw();

    const results = packages.map((pkg) => {
        try {
            return checkOne(pkg.subsystem);
        } catch (err) {
            return {
                ok: false,
                upToDate: false,
                subsystem: pkg.subsystem,
                currentVersion: pkg.version,
                destination: pkg.destination,
                offer: null,
                error: err.message,
                detail: err.detail || null
            };
        }
    });

    const available = results.filter((r) => r.offer).length;
    const current = results.filter((r) => r.upToDate).length;
    const failed = results.filter((r) => !r.ok).length;

    return {
        ok: failed === 0,
        filter: FILTER,
        checked: results.length,
        available: available,
        upToDate: current,
        failed: failed,
        results: results
    };
}

function ensureOtaDir () {
    try {
        if (!fs.existsSync(OTA_DIR)) {
            fs.mkdirSync(OTA_DIR);
        }
    } catch (err) {
        throw fail('Could not create ' + OTA_DIR, 500, err.message);
    }
}

function spawnLines (cmd, args, onLine, done) {
    let child;
    try {
        child = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    } catch (err) {
        done(fail(cmd + ' failed to start', 500, err.message));
        return null;
    }

    let stdout = '';
    let stderr = '';
    let bufOut = '';
    let bufErr = '';

    function flush (chunk, which) {
        const text = String(chunk || '');
        if (which === 'out') { stdout += text; bufOut += text; }
        else { stderr += text; bufErr += text; }

        let buf = which === 'out' ? bufOut : bufErr;
        let idx;
        while ((idx = buf.indexOf('\n')) !== -1) {
            const line = buf.slice(0, idx).replace(/\r$/, '');
            buf = buf.slice(idx + 1);
            if (line) { onLine(line, which); }
        }
        if (which === 'out') { bufOut = buf; }
        else { bufErr = buf; }
    }

    child.stdout.on('data', (chunk) => flush(chunk, 'out'));
    child.stderr.on('data', (chunk) => flush(chunk, 'err'));
    child.on('error', (err) => {
        done(fail(cmd + ' failed', 500, err.message));
    });
    child.on('close', (code) => {
        if (bufOut.trim()) { onLine(bufOut.replace(/\r$/, ''), 'out'); }
        if (bufErr.trim()) { onLine(bufErr.replace(/\r$/, ''), 'err'); }
        done(null, { code: code, stdout: stdout, stderr: stderr });
    });
    return child;
}

/**
 * Download then apply one offer.
 * onEvent({ phase, percent?, message?, subsystem? })
 */
function apply (offer, onEvent, done) {
    if (typeof onEvent !== 'function') { onEvent = function () {}; }
    if (typeof done !== 'function') { done = function () {}; }

    if (!paths.onRobot()) {
        done(fail('Applying OTA updates only works on the robot.', 503));
        return;
    }
    if (!offer || !offer.url || !(offer.id || offer._id) || !offer.shaHash) {
        done(fail('offer must include id, url, and shaHash', 400));
        return;
    }
    if (!commandExists('jibo-download-update') || !commandExists('jibo-apply-update')) {
        done(fail('jibo-download-update / jibo-apply-update not found on PATH', 500));
        return;
    }

    const subsystem = offer.subsystem || '@be/be';
    const pkg = findPackage(subsystem);
    const dest = offer.destination || (pkg && pkg.destination);
    if (!dest) {
        done(fail('Could not resolve destination for ' + subsystem, 404));
        return;
    }

    const id = offer.id || offer._id;
    const toVersion = offer.toVersion || (pkg && pkg.version) || '0.0.0';
    const fromVersion = offer.fromVersion || (pkg && pkg.version) || '0.0.0';
    const filter = offer.filter || FILTER;
    const tarPath = tarPathFor(subsystem);

    remountRw();
    try {
        ensureOtaDir();
    } catch (err) {
        done(err);
        return;
    }

    onEvent({
        phase: 'download',
        percent: 0,
        subsystem: subsystem,
        message: 'Downloading ' + subsystem + ' from ' + offer.url
    });

    const downloadArgs = [
        '--id', String(id),
        '--url', String(offer.url),
        '--destination', tarPath,
        '--shasum', String(offer.shaHash)
    ];

    spawnLines('jibo-download-update', downloadArgs, (line) => {
        const obj = parseJsonBlob(line);
        if (obj && (obj.percent != null || obj.status)) {
            onEvent({
                phase: 'download',
                subsystem: subsystem,
                percent: obj.percent != null ? Number(obj.percent) : undefined,
                status: obj.status,
                received: obj.received,
                length: obj.length,
                message: obj.status === 'finished'
                    ? 'Download finished'
                    : ('Downloading… ' +
                        (obj.percent != null ? Math.floor(obj.percent) + '%' : ''))
            });
            return;
        }
        if (line && line.trim()) {
            onEvent({
                phase: 'download',
                subsystem: subsystem,
                message: line.trim(),
                raw: true
            });
        }
    }, (err, result) => {
        if (err) {
            done(err);
            return;
        }
        if (result.code !== 0) {
            done(fail(
                'jibo-download-update exited ' + result.code,
                500,
                (result.stderr || result.stdout || '').trim()
            ));
            return;
        }

        onEvent({
            phase: 'apply',
            percent: 100,
            subsystem: subsystem,
            message: 'Applying ' + subsystem + ' to ' + dest
        });

        const applyArgs = [
            '--source', tarPath,
            '--subsystem', subsystem,
            '--from', String(fromVersion),
            '--to', String(toVersion),
            '--destination', dest,
            '--filter', filter
        ];

        spawnLines('jibo-apply-update', applyArgs, (line) => {
            if (line && line.trim()) {
                onEvent({
                    phase: 'apply',
                    subsystem: subsystem,
                    message: line.trim(),
                    raw: true
                });
            }
        }, (applyErr, applyResult) => {
            if (applyErr) {
                done(applyErr);
                return;
            }
            if (applyResult.code !== 0) {
                done(fail(
                    'jibo-apply-update exited ' + applyResult.code,
                    500,
                    (applyResult.stderr || applyResult.stdout || '').trim()
                ));
                return;
            }

            if (subsystem === '@be/be') {
                try {
                    paths.ensureDir(paths.musicDirCanonical());
                    paths.ensureDir(paths.dataDir());
                } catch (mkdirErr) {
                    console.warn('[beacon] Knowledge mkdir after OTA:', mkdirErr.message);
                }
            }

            const note = subsystem === '@be/be'
                ? 'Update applied. Be should restart to finish.'
                : ('Update applied for ' + subsystem + '.');

            onEvent({ phase: 'done', subsystem: subsystem, message: note });
            done(null, {
                ok: true,
                id: id,
                subsystem: subsystem,
                fromVersion: fromVersion,
                toVersion: toVersion,
                destination: dest,
                tarPath: tarPath,
                note: note
            });
        });
    });
}

module.exports = {
    FILTER: FILTER,
    OTA_DIR: OTA_DIR,
    state: state,
    listPackages: listPackages,
    check: check,
    checkOne: checkOne,
    apply: apply,
    tarPathFor: tarPathFor
};
