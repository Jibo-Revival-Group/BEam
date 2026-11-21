'use strict';
// Services console data: registry records + each service's page title; a dead port is listed as not answering.
const assert = require('assert');
const http = require('http');
const services = require('../@be/be/beacon/lib/services');

function serve(handler) { return new Promise(resolve => { const s = http.createServer(handler); s.listen(0, '127.0.0.1', () => resolve(s)); }); }

(async () => {
    const body = await serve((req, res) => { res.end(req.url === '/index.html' ? '<html><head><title> Body Service </title></head></html>' : 'x'); });
    const kb = await serve((req, res) => { res.statusCode = 404; res.end('<title>Error</title>'); });
    const dead = await serve(() => {}); const deadPort = dead.address().port; await new Promise(r => dead.close(r));
    const records = [{ name: 'kb', port: kb.address().port }, { name: 'body', port: body.address().port }, { name: 'wifi', port: deadPort }, { name: 'bad', port: 'x' }];
    const registry = await serve((req, res) => { assert.strictEqual(req.url, '/registry'); res.end(JSON.stringify({ records })); });
    const list = await services.list(registry.address().port);
    assert.deepStrictEqual(list, [
        { name: 'body', port: body.address().port, page: true, title: 'Body Service', up: true },
        { name: 'kb', port: kb.address().port, page: false, title: null, up: true },
        { name: 'wifi', port: deadPort, page: false, title: null, up: false }]);
    [body, kb, registry].forEach(s => s.close());
    console.log('Services console: registry records, page titles, services without a page and dead ports passed');
})().catch(e => { console.error(e); process.exitCode = 1; });
