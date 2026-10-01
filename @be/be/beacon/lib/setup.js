'use strict';

/**
 * First-boot setup started by BEetle. Endpoints are fixed; the owner only
 * adds household members and applies the BEam / BEnch update.
 */

var fs = require('fs');
var spawn = require('child_process').spawn;

var ota = require('./ota');

var MARKER = '/var/jibo/beetle-setup.json';
var IDENTITY = '/var/jibo/identity.json';
var HUB = 'api.5x1.com:443';
var ENDPOINT = 'https://api.5x1.com';

function fail(message, status) {
    var err = new Error(message);
    err.status = status || 500;
    return err;
}

function readJson(file) {
    try {
        return JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (err) {
        return null;
    }
}

function state() {
    var marker = readJson(MARKER);
    var identity = readJson(IDENTITY) || {};
    return {
        pending: !!(marker && marker.pending),
        robotName: identity.name || null,
        hub: HUB,
        endpoint: ENDPOINT
    };
}

function finish() {
    var marker = readJson(MARKER) || {};
    marker.pending = false;
    marker.finishedUtc = new Date().toISOString();
    try {
        fs.writeFileSync(MARKER, JSON.stringify(marker) + '\n');
    } catch (err) {
        throw fail('Could not clear the setup marker at ' + MARKER, 500);
    }
    var rebooting = false;
    try {
        var child = spawn('/sbin/reboot', [], { detached: true, stdio: 'ignore' });
        child.on('error', function () {});
        child.unref();
        rebooting = true;
    } catch (err) {
        rebooting = false;
    }
    return {
        pending: false,
        rebooting: rebooting,
        note: rebooting
            ? 'Setup is done. Jibo is rebooting into the normal eye.'
            : 'Setup marker cleared. Reboot Jibo to leave the setup screen.'
    };
}

function applyNext(offers, index, log, done) {
    if (index >= offers.length) {
        done(null, log);
        return;
    }
    var offer = offers[index];
    ota.apply(offer, function () {}, function (err, result) {
        if (err) {
            log.push({
                subsystem: offer.subsystem,
                ok: false,
                error: err.message
            });
        } else {
            log.push({
                subsystem: offer.subsystem,
                ok: true,
                toVersion: result && result.toVersion
            });
        }
        applyNext(offers, index + 1, log, done);
    });
}

function update(done) {
    var report;
    try {
        report = ota.check({});
    } catch (err) {
        done(err);
        return;
    }
    var offers = [];
    var results = report.results || [];
    var i;
    for (i = 0; i < results.length; i++) {
        if (results[i] && results[i].offer) {
            offers.push(results[i].offer);
        }
    }
    if (!offers.length) {
        done(null, {
            ok: report.ok,
            checked: report,
            applied: []
        });
        return;
    }
    applyNext(offers, 0, [], function (err, applied) {
        if (err) {
            done(err);
            return;
        }
        done(null, {
            ok: true,
            checked: report,
            applied: applied
        });
    });
}

module.exports = {
    state: state,
    finish: finish,
    update: update
};
