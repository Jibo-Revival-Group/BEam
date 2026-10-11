'use strict';
// Node 6-compatible: exercise real TLS rather than merely inspecting options.
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const https = require('https');
const child = require('child_process');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'beacon-theme-tls-'));
const storePath = require.resolve('../@be/be/beacon/lib/theme-store');
const bundlePath = path.resolve(__dirname, '../@be/be/beacon/certs/mozilla-ca.pem');
const readFile = fs.readFileSync;
const bundle = readFile(bundlePath, 'utf8');
let server;
function openssl(args) { child.execFileSync('openssl', args, { cwd: root, stdio: 'ignore' }); }
function rejected(promise, pattern) {
    return promise.then(() => { throw new Error('Invalid certificate was accepted'); }, e => { assert(pattern.test(e.code + ' ' + e.message), e.message); });
}
function removeTree(dir) {
    fs.readdirSync(dir).forEach(name => {
        const p = path.join(dir, name);
        if (fs.statSync(p).isDirectory()) { removeTree(p); } else { fs.unlinkSync(p); }
    });
    fs.rmdirSync(dir);
}
function finish() { fs.readFileSync = readFile; delete require.cache[storePath]; if (server) { server.close(); } removeTree(root); }
function run() {
    assert(bundle.match(/-----BEGIN CERTIFICATE-----/g).length > 100, 'Ship public Mozilla roots');
    const pack = JSON.parse(readFile(path.resolve(__dirname, '../@be/be/package.json'), 'utf8'));
    assert(pack.files.indexOf('beacon') >= 0, 'CA assets ship in BEam');
    openssl(['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-keyout', 'ca.key', '-out', 'ca.pem', '-days', '1', '-subj', '/CN=Theme test CA']);
    openssl(['req', '-newkey', 'rsa:2048', '-nodes', '-keyout', 'server.key', '-out', 'server.csr', '-subj', '/CN=localhost']);
    fs.writeFileSync(path.join(root, 'extensions'), 'subjectAltName=DNS:localhost\nbasicConstraints=CA:FALSE\nkeyUsage=digitalSignature,keyEncipherment\nextendedKeyUsage=serverAuth\n');
    openssl(['x509', '-req', '-in', 'server.csr', '-CA', 'ca.pem', '-CAkey', 'ca.key', '-CAcreateserial', '-out', 'server.pem', '-days', '1', '-extfile', 'extensions']);
    server = https.createServer({ key: readFile(path.join(root, 'server.key')), cert: readFile(path.join(root, 'server.pem')) }, (req, res) => {
        if (req.url === '/redirect') { res.writeHead(302, { Location: '/manifest.json' }); }
        else { res.writeHead(200); res.write('{"name":"TLS theme"}'); }
        res.end();
    });
    return new Promise(resolve => server.listen(0, resolve)).then(() => {
        const store = require(storePath);
        return rejected(store.request('https://localhost:' + server.address().port + '/manifest.json', 1024), /UNABLE_TO_VERIFY|SELF_SIGNED|LOCAL_ISSUER/);
    }).then(() => {
        // Substitute a controlled trust bundle for this isolated test process.
        // The downloader must use it on initial requests AND redirect hops.
        const testBundle = bundle + '\n' + readFile(path.join(root, 'ca.pem'), 'utf8');
        fs.readFileSync = function(filename, encoding) { return filename === bundlePath ? testBundle : readFile.apply(fs, arguments); };
        delete require.cache[storePath];
        const store = require(storePath);
        const pending = store.request('https://localhost:' + server.address().port + '/redirect', 1024);
        fs.readFileSync = readFile;
        return pending.then(buf => {
            assert.strictEqual(JSON.parse(buf.toString()).name, 'TLS theme');
            return rejected(store.request('https://127.0.0.1:' + server.address().port + '/manifest.json', 1024), /ALTNAME|Hostname\/IP/);
        });
    }).then(() => { console.log('Theme TLS: bundled roots, verified HTTPS redirects, untrusted CA rejection, hostname rejection and packaging passed'); });
}
Promise.resolve().then(run).then(finish, e => { console.error(e); process.exitCode = 1; finish(); });
