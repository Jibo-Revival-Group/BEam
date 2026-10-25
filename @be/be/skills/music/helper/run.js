'use strict';
require('./vendor/regenerator-runtime');
var service = require('./server');
// The inherited pipe is the ownership lease. A dead BE closes it immediately.
process.stdin.resume();
process.stdin.on('end', shutdown);
process.stdin.on('error', shutdown);
var closing = false;
function shutdown() {
    if (closing) return;
    closing = true;
    try { service.stop(); } catch (_) {}
    setTimeout(function () { process.exit(0); }, 100);
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
process.on('SIGHUP', shutdown);
var server = service.start();
server.once('listening', function () { process.stdout.write('BE_MUSIC_READY\n'); });
server.once('error', function () { shutdown(); });
process.stdout.on('error', shutdown);
