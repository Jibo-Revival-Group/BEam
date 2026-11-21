'use strict';
/**
 * Jibo's own services for BEacon's Services console: the robot's service registry (port 8181) plus, for each
 * service, the title of its built-in web page when it has one. Asked only when the console loads or refreshes.
 */
const http = require('http');

function get(port, path, limit) {
    return new Promise((resolve, reject) => {
        const request = http.get({ host: '127.0.0.1', port: port, path: path }, response => {
            let body = '';
            response.setEncoding('utf8');
            response.on('data', chunk => { body += chunk; if (body.length > limit) { response.destroy(); } });
            response.on('end', () => resolve({ status: response.statusCode, body: body }));
            response.on('error', reject);
        });
        request.setTimeout(2000, () => request.abort());
        request.on('error', reject);
    });
}

function list(registryPort) {
    return get(registryPort || 8181, '/registry', 256 * 1024).then(r => {
        const records = (JSON.parse(r.body).records || []).filter(s => s && typeof s.name === 'string' && Number.isInteger(s.port));
        return Promise.all(records.map(s => get(s.port, '/index.html', 64 * 1024).then(page => {
            const title = page.status === 200 && /<title>([^<]{1,80})<\/title>/i.exec(page.body);
            return { name: s.name, port: s.port, page: page.status === 200, title: title ? title[1].trim() : null, up: true };
        }, () => ({ name: s.name, port: s.port, page: false, title: null, up: false }))));
    }).then(services => services.sort((a, b) => a.name.localeCompare(b.name)));
}

module.exports = { list: list };
