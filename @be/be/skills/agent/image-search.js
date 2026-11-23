'use strict';
// "SHOW: emperor penguin": the first SafeSearch-strict Bing picture, as BEefy's "Hey Jibo, show me a picture of ___"
// finds it (BingImageSearchProvider), shown full screen on Jibo's face. Node 6.
const https = require('https'), fs = require('fs'), path = require('path');
const THUMBNAIL = /&quot;turl&quot;:&quot;https?:\/\/([a-z0-9]+\.mm\.bing\.net)\/th\?id=([A-Za-z0-9._-]+)/;
// Bing's page -> a 1280x720 picture URL, or null.
function pick(html) {
    const match = THUMBNAIL.exec(html);
    return match ? 'http://' + match[1] + '/th?id=' + encodeURIComponent(match[2]) + '&w=1280&h=720&c=7&rs=1&pid=1.7' : null;
}
function find(query) {
    return new Promise(resolve => {
        const request = https.get({
            host: 'www.bing.com', path: '/images/search?adlt=strict&form=HDRSC2&first=1&q=' + encodeURIComponent(String(query).slice(0, 100)),
            ca: fs.readFileSync(path.join(__dirname, '../../beacon/certs/mozilla-ca.pem'), 'utf8'),
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
                'Accept-Language': 'en-US', Cookie: 'SRCHHPGUSR=ADLT=STRICT' } // SafeSearch strict needs both
        }, response => {
            let html = '';
            response.setEncoding('utf8');
            response.on('data', chunk => { html += chunk; if (html.length > 3000000) request.abort(); });
            response.on('end', () => resolve(response.statusCode === 200 ? pick(html) : null));
            response.on('error', () => resolve(null));
        });
        request.setTimeout(10000, () => request.abort());
        request.on('error', () => resolve(null));
    });
}
// Fills the face with the picture; returns a function that takes it down again (or null if there is none).
function show(jibo, query) {
    return find(query).then(url => {
        if (!url) return null;
        const views = jibo.face.views;
        const view = views.createView('View', { viewConfig: { type: 'View', id: 'agentImage' }, componentConfigs: [{ id: 'agentImageClip', type: 'Clip',
            position: { x: 0, y: 0 }, assets: [{ id: 'agentImage-' + url.length + '-' + url.slice(-40).replace(/\W/g, ''), src: url, type: 'texture' }] }] }, true);
        return new Promise(resolve => views.changeView({ removeAll: true, addView: view }, () => resolve(), () => resolve()))
            .then(() => () => new Promise(resolve => views.changeView({ removeAll: true, leaveEmpty: false }, () => resolve(), () => resolve())));
    }).catch(() => null);
}
module.exports = { pick: pick, find: find, show: show };
