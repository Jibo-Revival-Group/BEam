'use strict';

/**
 * Full-screen setup message used while /var/jibo/beetle-setup.json is pending.
 * Be still starts underneath so BEacon can use the Knowledge Base, but the
 * eye stays hidden until setup finishes and the robot reboots.
 */

var fs = require('fs');
var os = require('os');

var MARKER = '/var/jibo/beetle-setup.json';

function isPending() {
    try {
        var data = JSON.parse(fs.readFileSync(MARKER, 'utf8'));
        return !!(data && data.pending);
    } catch (err) {
        return false;
    }
}

function lanAddress() {
    var ifaces = os.networkInterfaces();
    var names = Object.keys(ifaces);
    var i;
    var j;
    for (i = 0; i < names.length; i++) {
        var addrs = ifaces[names[i]] || [];
        for (j = 0; j < addrs.length; j++) {
            var addr = addrs[j];
            var family = addr.family;
            var v4 = family === 'IPv4' || family === 4;
            if (v4 && !addr.internal) {
                return addr.address;
            }
        }
    }
    return null;
}

function show() {
    var overlay = document.createElement('div');
    overlay.id = 'beetle-setup';
    overlay.setAttribute('style',
        'position:fixed;left:0;top:0;width:1280px;height:720px;background:#000;color:#ffffff;' +
        'z-index:2147483647;display:flex;align-items:center;justify-content:center;' +
        'text-align:center;font-family:sans-serif;white-space:pre-wrap;');
    var text = document.createElement('div');
    text.setAttribute('style', 'font-size:52px;line-height:1.35;padding:48px;max-width:1100px;');
    overlay.appendChild(text);
    document.body.appendChild(overlay);

    function buryEye() {
        var nodes = document.body.children;
        var i;
        for (i = 0; i < nodes.length; i++) {
            if (nodes[i] !== overlay) {
                nodes[i].style.display = 'none';
            }
        }
        if (overlay.parentNode) {
            overlay.parentNode.appendChild(overlay);
        }
    }

    function render() {
        var ip = lanAddress();
        if (ip) {
            text.textContent = 'Go to http://' + ip + ':8123 to setup';
        } else {
            text.textContent = 'Connecting to Wi-Fi…\nGo to http://<jibo-ip>:8123 to setup';
        }
        buryEye();
    }

    render();
    setInterval(render, 2000);
}

module.exports = {
    isPending: isPending,
    show: show
};
