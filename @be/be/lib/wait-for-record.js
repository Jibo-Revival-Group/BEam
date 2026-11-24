'use strict';
// Wait (up to timeoutMs) until a service is in Jibo's service registry, then call back either way.
// Be's jibo.init fails outright ("Registry record missing for 'expression'") if expression isn't registered yet,
// and at boot Be can now start before expression (which waits ~11 s for lps) is up.
const http = require('http');

module.exports = function waitForRecord(name, options, callback) {
    const url = options.url || 'http://127.0.0.1:8181/registry';
    const deadline = Date.now() + (options.timeoutMs || 60000);
    const interval = options.intervalMs || 250;
    const check = () => {
        const retry = () => (Date.now() >= deadline ? callback(new Error('timed out waiting for ' + name)) : setTimeout(check, interval));
        const req = http.get(url, (res) => {
            let body = '';
            res.on('data', (chunk) => { body += chunk; });
            res.on('end', () => {
                let found = false;
                try { found = (JSON.parse(body).records || []).some(record => record.name === name); } catch (e) { }
                return found ? callback(null) : retry();
            });
        });
        req.setTimeout(1000, () => req.abort());
        req.on('error', retry);
    };
    check();
};
