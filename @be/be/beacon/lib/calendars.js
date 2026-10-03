'use strict';

/**
 * Personal-report calendars. The browser never sees cloud keys or a saved iCal URL.
 * Requests are AWS signature version 3, matching @jibo/jibo-server-client Signers.V3:
 * SHA-256 the canonical string, then HMAC-SHA256 that digest.
 */

const crypto = require('crypto');
const fs = require('fs');
const http = require('http');
const https = require('https');
const url = require('url');

const paths = require('./paths');
const people = require('./people');

const TARGET_PREFIX = 'Loop_20160324';
const MAX_RESPONSE = 256 * 1024;
const REQUEST_TIMEOUT = 20000;

function fail (message, status) {
    const err = new Error(message);
    err.status = status || 500;
    return err;
}

function credentialsMessage () {
    return 'Calendar setup needs the robot\'s cloud credentials.';
}

function readCredentials () {
    const file = paths.credentialsPath();
    if (!paths.isFile(file)) {
        throw fail(credentialsMessage(), 503);
    }
    let data;
    try {
        data = JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (err) {
        throw fail(credentialsMessage(), 503);
    }
    if (!data || !data.accessKeyId || !data.secretAccessKey || !data.endpoint) {
        throw fail(credentialsMessage(), 503);
    }
    return data;
}

function robotIdFrom (snapshot) {
    const members = (snapshot && snapshot.members) || [];
    for (let i = 0; i < members.length; i++) {
        if (members[i].isJibo && members[i].id) return members[i].id;
    }
    return (snapshot && snapshot.robot) || null;
}

function signedHeaders (method, host, target, body, creds) {
    const headers = {
        Host: host,
        'X-Amz-Date': new Date().toUTCString(),
        'X-Amz-Target': target
    };
    const names = Object.keys(headers).filter(function (name) {
        return name === 'Host' || name === 'Content-Encoding' || /^X-Amz/i.test(name);
    });
    const lines = names.map(function (name) {
        return name.toLowerCase() + ':' + String(headers[name]).trim();
    }).sort();
    const canonical = lines.join('\n') + '\n';
    const stringToSign = [method, '/', '', canonical, body].join('\n');
    const digest = crypto.createHash('sha256').update(stringToSign, 'utf8').digest();
    const signature = crypto.createHmac('sha256', creds.secretAccessKey).update(digest).digest('base64');
    const signed = names.map(function (name) {
        return name.toLowerCase();
    }).sort().join(';');
    headers.Authorization = 'AWS3 AWSAccessKeyId=' + creds.accessKeyId +
        ',Algorithm=HmacSHA256,SignedHeaders=' + signed +
        ',Signature=' + signature;
    headers['Content-Type'] = 'application/json';
    headers['Content-Length'] = Buffer.byteLength(body);
    return headers;
}

function callCloud (operation, body, robotId) {
    const creds = readCredentials();
    const rawEndpoint = String(creds.endpoint).trim();
    const withScheme = rawEndpoint.indexOf('://') === -1 ? ('https://' + rawEndpoint) : rawEndpoint;
    const parsed = url.parse(withScheme);
    const isHttps = parsed.protocol === 'https:';
    const payload = JSON.stringify(body || {});
    const headers = signedHeaders('POST', parsed.host, TARGET_PREFIX + '.' + operation, payload, creds);
    if (robotId) headers['X-Jibo-RobotId'] = String(robotId);

    const client = isHttps ? https : http;
    const options = {
        protocol: parsed.protocol,
        hostname: parsed.hostname,
        port: parsed.port,
        path: parsed.path || '/',
        method: 'POST',
        headers: headers
    };

    return new Promise(function (resolve, reject) {
        const req = client.request(options, function (res) {
            let size = 0;
            let text = '';
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                size += chunk.length;
                if (size > MAX_RESPONSE) {
                    req.destroy();
                    reject(fail('The cloud calendar response was too large.', 502));
                    return;
                }
                text += chunk;
            });
            res.on('error', reject);
            res.on('end', function () {
                let parsedBody = null;
                if (text) {
                    try {
                        parsedBody = JSON.parse(text);
                    } catch (err) {
                        parsedBody = null;
                    }
                }
                if (res.statusCode < 200 || res.statusCode >= 300) {
                    const message = parsedBody && parsedBody.error
                        ? parsedBody.error
                        : ('Cloud calendar request failed (HTTP ' + res.statusCode + ').');
                    reject(fail(message, res.statusCode || 502));
                    return;
                }
                resolve(parsedBody || {});
            });
        });
        req.setTimeout(REQUEST_TIMEOUT, function () {
            req.destroy();
            reject(fail('The cloud calendar request timed out.', 504));
        });
        req.on('error', function (err) {
            reject(fail(
                'Could not reach the cloud for calendars.' +
                (err && err.message ? (' ' + err.message) : ''),
                502
            ));
        });
        req.write(payload);
        req.end();
    });
}

function blankCalendar () {
    return {
        configured: false,
        isEnabled: false,
        host: null,
        lastSuccessUtc: null,
        lastError: null,
        updatedUtc: null
    };
}

function attachStatus (snapshot) {
    if (!snapshot) return Promise.resolve(snapshot);
    return callCloud('GetCalendarFeeds', {}, robotIdFrom(snapshot)).then(function (payload) {
        const byId = {};
        (payload.members || []).forEach(function (item) {
            if (item && item.memberId) byId[String(item.memberId)] = item;
        });
        snapshot.calendarAvailable = true;
        snapshot.calendarError = null;
        (snapshot.members || []).forEach(function (member) {
            if (member.isJibo) return;
            member.calendar = byId[String(member.id)] || blankCalendar();
        });
        return snapshot;
    }).catch(function (err) {
        snapshot.calendarAvailable = false;
        snapshot.calendarError = (err && err.message) ? err.message : credentialsMessage();
        return snapshot;
    });
}

function requireHuman (memberId) {
    if (!memberId) return Promise.reject(fail('memberId is required.', 400));
    return people.findMember(memberId).then(function (found) {
        if (found.member.isJibo) {
            throw fail('The robot does not have a personal calendar.', 400);
        }
        return found.snapshot;
    });
}

function reload () {
    return people.list().then(attachStatus);
}

function save (memberId, icalUrl, isEnabled) {
    return requireHuman(memberId).then(function (snapshot) {
        return callCloud('SetCalendarFeed', {
            memberId: memberId,
            icalUrl: icalUrl,
            isEnabled: isEnabled !== false
        }, robotIdFrom(snapshot));
    }).then(reload);
}

function clear (memberId) {
    return requireHuman(memberId).then(function (snapshot) {
        return callCloud('ClearCalendarFeed', { memberId: memberId }, robotIdFrom(snapshot));
    }).then(reload);
}

function testFeed (memberId, icalUrl) {
    return requireHuman(memberId).then(function (snapshot) {
        const body = { memberId: memberId };
        if (icalUrl) body.icalUrl = icalUrl;
        return callCloud('TestCalendarFeed', body, robotIdFrom(snapshot)).then(function (result) {
            return reload().then(function (snapshotAfter) {
                snapshotAfter.calendarTest = result;
                return snapshotAfter;
            });
        });
    });
}

module.exports = {
    attachStatus: attachStatus,
    save: save,
    clear: clear,
    testFeed: testFeed
};
