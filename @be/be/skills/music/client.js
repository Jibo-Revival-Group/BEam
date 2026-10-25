'use strict';

const http = require('http'), url = require('url');
class Client {
    constructor(settings) { this.settings = settings; this.pending = []; this.closed = false; }
    media(pathname) { return this.settings.base + pathname + (pathname.indexOf('?') < 0 ? '?' : '&') + 'token=' + encodeURIComponent(this.settings.token); }
    get(pathname) {
        return new Promise((resolve, reject) => {
            if (this.closed) { reject(Error('cancelled')); return; }
            let done = false, response = null;
            const finish = (error, value) => {
                if (done) return; done = true; clearTimeout(timer);
                this.pending = this.pending.filter(item => item !== cancel);
                if (error) { request.abort(); if (response) response.destroy(); reject(error); } else resolve(value);
            };
            const request = http.get(url.parse(this.media(pathname)), incoming => {
                response = incoming; const chunks = []; let bytes = 0;
                incoming.on('data', chunk => { bytes += chunk.length; if (bytes > 512 * 1024) finish(Error('provider_changed')); else chunks.push(chunk); });
                incoming.on('error', () => finish(Error('network_unavailable')));
                incoming.on('aborted', () => finish(Error('network_unavailable')));
                incoming.on('end', () => {
                    try {
                        const value = JSON.parse(Buffer.concat(chunks).toString('utf8'));
                        if (incoming.statusCode !== 200) finish(Error(value.error || 'provider_unavailable')); else finish(null, value);
                    } catch (_) { finish(Error('provider_changed')); }
                });
            });
            const cancel = () => finish(Error('cancelled'));
            const timer = setTimeout(() => finish(Error('timeout')), 60000);
            this.pending.push(cancel);
            request.on('error', () => finish(Error('network_unavailable')));
        });
    }
    resolve(request) { return this.get('/api/resolve?title=' + encodeURIComponent(request.title) + '&artist=' + encodeURIComponent(request.artist || '')); }
    stream(id, seconds) { return this.get('/api/stream/' + id + '?t=' + Math.max(0, seconds || 0)); }
    close() { this.closed = true; this.pending.slice().forEach(cancel => cancel()); }
}
module.exports = Client;
