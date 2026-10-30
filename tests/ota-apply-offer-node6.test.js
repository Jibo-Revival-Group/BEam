'use strict';
// /api/ota/apply must install only the offer BEacon gets from the update service itself,
// with that offer's URL/hash and the subsystem's own destination — never client-supplied values.
var assert = require('assert');
var fs = require('fs');
var os = require('os');
var path = require('path');
var http = require('http');
var cp = require('child_process');
var EventEmitter = require('events');

var skills = fs.mkdtempSync(path.join(os.tmpdir(), 'beam-ota-'));
fs.mkdirSync(path.join(skills, '@be'));
fs.mkdirSync(path.join(skills, '@be', 'be'));
fs.writeFileSync(path.join(skills, '@be', 'be', 'package.json'), JSON.stringify({ name: '@be/be', version: '3.1.6' }));

var realExists = fs.existsSync;
fs.existsSync = function (p) {
    if (/^\/usr\/local\/bin\/jibo-(get|download|apply)-update$|^\/usr\/local\/bin\/jibo-mount$/.test(p) || p === '/opt/ota') { return true; }
    if (/^\/usr\/local\/bin\//.test(p)) { return false; }
    return realExists(p);
};
var spawned = [];
cp.spawn = function (cmd, args) {
    spawned.push([path.basename(cmd)].concat(args));
    var child = new EventEmitter(); child.stdout = new EventEmitter(); child.stderr = new EventEmitter();
    setTimeout(function () { child.emit('close', 0); }, 5);
    return child;
};
cp.spawnSync = function (cmd) {
    if (/jibo-get-update$/.test(cmd)) {
        return { status: 0, stdout: JSON.stringify({ _id: 'srv-1', url: 'http://joap.5x1.com/real.tar', shaHash: 'realsha',
            fromVersion: '3.1.6', toVersion: '3.1.7', subsystem: '@be/be' }), stderr: '' };
    }
    return { status: 0, stdout: '', stderr: '' };
};
var paths = require('../@be/be/beacon/lib/paths');
paths.onRobot = function () { return true; };
paths.ROBOT_SKILLS = skills;
paths.ensureDir = function (d) { return d; };
var server = require('../@be/be/beacon/server').create();

function post(body) {
    return new Promise(function (resolve, reject) {
        var req = http.request({ port: server.address().port, path: '/api/ota/apply', method: 'POST',
            headers: { 'Content-Type': 'application/json' } }, function (res) {
            var text = ''; res.on('data', function (c) { text += c; });
            res.on('end', function () { resolve(text.trim().split('\n').map(function (l) { return JSON.parse(l); })); });
        });
        req.on('error', reject); req.end(JSON.stringify(body));
    });
}
function arg(call, name) { return call[call.indexOf(name) + 1]; }

server.listen(0, '127.0.0.1', function () {
    post({ offer: { id: 'x', url: 'http://evil.example/payload.tar', shaHash: 'deadbeef', subsystem: '@be/be',
        destination: '/etc', filter: 'evil', toVersion: '3.1.7' } }).then(function (lines) {
        assert.strictEqual(lines[lines.length - 1].phase, 'done', JSON.stringify(lines));
        var download = spawned[0], apply = spawned[1];
        assert.strictEqual(download[0], 'jibo-download-update');
        assert.strictEqual(arg(download, '--url'), 'http://joap.5x1.com/real.tar');
        assert.strictEqual(arg(download, '--shasum'), 'realsha');
        assert.strictEqual(arg(download, '--id'), 'srv-1');
        assert.strictEqual(apply[0], 'jibo-apply-update');
        assert.strictEqual(arg(apply, '--destination'), path.join(skills, '@be', 'be'));
        assert.strictEqual(arg(apply, '--filter'), 'fcs');
        assert.strictEqual(arg(apply, '--to'), '3.1.7');
        spawned = [];
        return post({ subsystem: '@be/be', toVersion: '9.9.9' });
    }).then(function (lines) {
        assert.strictEqual(lines[lines.length - 1].phase, 'error', 'stale version is refused');
        assert.deepStrictEqual(spawned, []);
        return new Promise(function (resolve, reject) {
            require('../@be/be/beacon/lib/setup').update(function (err, report) { if (err) { reject(err); } else { resolve(report); } });
        });
    }).then(function (report) {
        assert.deepStrictEqual(report.applied, [{ subsystem: '@be/be', ok: true, toVersion: '3.1.7' }], '/api/setup/update applies and answers');
        assert.strictEqual(arg(spawned[0], '--url'), 'http://joap.5x1.com/real.tar');
        console.log('PASS ota apply uses only the update service offer and the fixed destination');
        server.close();
    }).catch(function (err) { console.error(err); process.exit(1); });
});
