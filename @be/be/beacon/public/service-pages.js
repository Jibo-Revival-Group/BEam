// Loaded first by every Jibo service page (BEnch adds it to each index.html), but it only acts inside BEacon's
// Services console:
// - Live pages record what they receive (WebSocket messages and HTTP replies) for the last minute.
// - A replay copy of the page (?beaconReplay=...) gets that recording instead of the robot: the real page runs on
//   recorded data at a chosen moment, and nothing it sends reaches Jibo.
// - In the live Skills Manager, stopping @be/be (or launching a skill, which stops it) asks first, because Be runs
//   BEacon and the console the user is on goes dark.
(function () {
    'use strict';
    if (window.self === window.top) { return; }
    var CONSOLE = location.protocol + '//' + location.hostname + ':8123', KEEP = 60000;
    var REPLAY = /[?&]beaconReplay=/.test(location.search);
    function keyOf(url) { var u = new URL(String(url), location.href); return u.pathname + u.search; }

    if (!REPLAY) { record(); if (location.port === '8779') { guardBe(); } } else { replay(); }

    function record() {
        var log = [], first = {};
        function add(entry) { entry.t = Date.now(); log.push(entry); }
        function keepFirst(entry) { if (!first[entry.url]) { first[entry.url] = entry; } }   // startup replies, for replays
        var NativeSocket = window.WebSocket;
        window.WebSocket = function (url, protocols) {
            var ws = protocols === undefined ? new NativeSocket(url) : new NativeSocket(url, protocols), key = keyOf(url);
            ws.addEventListener('message', function (event) { add({ kind: 'ws', url: key, data: event.data }); });
            return ws;
        };
        window.WebSocket.prototype = NativeSocket.prototype;
        ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'].forEach(function (k) { window.WebSocket[k] = NativeSocket[k]; });
        var open = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function (method, url) {
            var xhr = this, key = String(method).toUpperCase() + ' ' + keyOf(url);
            xhr.addEventListener('loadend', function () {
                if (!xhr.status) { return; }
                var text = xhr.responseType === '' || xhr.responseType === 'text';
                var entry = { kind: 'http', url: key, status: xhr.status, type: xhr.getResponseHeader('Content-Type') || '',
                    body: text ? xhr.responseText : xhr.response };
                add(entry); keepFirst(entry);
            });
            return open.apply(this, arguments);
        };
        if (window.fetch) {
            var nativeFetch = window.fetch;
            window.fetch = function (input, init) {
                var key = ((init && init.method) || (input && input.method) || 'GET').toUpperCase() + ' ' + keyOf(input && input.url || input);
                return nativeFetch.apply(this, arguments).then(function (response) {
                    response.clone().text().then(function (body) {
                        var entry = { kind: 'http', url: key, status: response.status, type: response.headers.get('Content-Type') || '', body: body };
                        add(entry); keepFirst(entry);
                    }, function () {});
                    return response;
                });
            };
        }
        setInterval(function () { var cut = Date.now() - KEEP; while (log.length && log[0].t < cut) { log.shift(); } }, 2000);
        window.addEventListener('message', function (event) {
            var m = event.data;
            if (event.origin !== CONSOLE || !m) { return; }
            if (m.type === 'beacon-recording') {
                var cut = Date.now() - KEEP;
                event.source.postMessage({ type: 'beacon-recording', port: location.port, recording: {
                    log: log.filter(function (e) { return e.t >= cut; }),
                    first: Object.keys(first).map(function (k) { return first[k]; }) } }, CONSOLE);
            }
            if (m.type === 'beacon-recording-clear') { log = []; }
        });
    }

    function replay() {
        var data = null, waiting = [], base = 0, realBase = 0, playing = false, sockets = [];
        var realNow = Date.now.bind(Date);
        function now() { return playing ? base + (realNow() - realBase) : base; }
        Date.now = function () { return data ? now() : realNow(); };   // the page's own clock follows the recording
        function whenReady(fn) { if (data) { setTimeout(fn, 0); } else { waiting.push(fn); } }
        function reply(key) {   // newest recorded reply at the replay moment, else the one from page startup
            var found = null, t = now();
            data.log.forEach(function (e) { if (e.kind === 'http' && e.url === key && e.t <= t) { found = e; } });
            return found || data.first.filter(function (e) { return e.url === key; })[0] || null;
        }

        function FakeSocket(url) {
            this.url = String(url); this.key = keyOf(url); this.readyState = 0; this.binaryType = 'blob';
            this.bufferedAmount = 0; this.protocol = ''; this.extensions = ''; this.cursor = 0; this.listeners = {};
            var self = this; sockets.push(this);
            whenReady(function () { self.readyState = 1; self.emit('open', new Event('open')); });
        }
        FakeSocket.CONNECTING = 0; FakeSocket.OPEN = 1; FakeSocket.CLOSING = 2; FakeSocket.CLOSED = 3;
        FakeSocket.prototype = {
            CONNECTING: 0, OPEN: 1, CLOSING: 2, CLOSED: 3,
            addEventListener: function (type, fn) { (this.listeners[type] = this.listeners[type] || []).push(fn); },
            removeEventListener: function (type, fn) { this.listeners[type] = (this.listeners[type] || []).filter(function (f) { return f !== fn; }); },
            emit: function (type, event) {
                var self = this;
                if (typeof this['on' + type] === 'function') { this['on' + type](event); }
                (this.listeners[type] || []).slice().forEach(function (fn) { fn.call(self, event); });
            },
            send: function () {},   // a replay never talks to Jibo
            close: function () { if (this.readyState < 2) { this.readyState = 3; this.emit('close', new CloseEvent('close', { code: 1000 })); } }
        };
        window.WebSocket = FakeSocket;

        function FakeXHR() { this.readyState = 0; this.status = 0; this.statusText = ''; this.responseText = ''; this.response = ''; this.responseType = ''; this.listeners = {}; }
        FakeXHR.UNSENT = 0; FakeXHR.OPENED = 1; FakeXHR.HEADERS_RECEIVED = 2; FakeXHR.LOADING = 3; FakeXHR.DONE = 4;
        FakeXHR.prototype = {
            addEventListener: FakeSocket.prototype.addEventListener, removeEventListener: FakeSocket.prototype.removeEventListener, emit: FakeSocket.prototype.emit,
            open: function (method, url) { this.method = String(method).toUpperCase(); this.key = this.method + ' ' + keyOf(url); this.readyState = 1; },
            setRequestHeader: function () {}, overrideMimeType: function () {}, abort: function () { this.aborted = true; },
            getResponseHeader: function (name) { return /content-type/i.test(name) ? this.type || null : null; },
            getAllResponseHeaders: function () { return this.type ? 'content-type: ' + this.type + '\r\n' : ''; },
            send: function () {
                var xhr = this;
                whenReady(function () {
                    if (xhr.aborted) { return; }
                    var r = xhr.method === 'GET' ? reply(xhr.key) : { status: 204, body: '', type: '' };   // actions are never sent
                    r = r || { status: 404, body: '', type: '' };
                    xhr.status = r.status; xhr.statusText = r.status === 200 ? 'OK' : ''; xhr.type = r.type;
                    xhr.response = r.body; xhr.responseText = typeof r.body === 'string' ? r.body : '';
                    if (xhr.responseType === 'json' && typeof r.body === 'string') { try { xhr.response = JSON.parse(r.body); } catch (e) { xhr.response = null; } }
                    xhr.readyState = 4;
                    ['readystatechange', 'load', 'loadend'].forEach(function (t) { xhr.emit(t, new Event(t)); });
                });
            }
        };
        window.XMLHttpRequest = FakeXHR;
        window.fetch = function (input, init) {
            var method = ((init && init.method) || (input && input.method) || 'GET').toUpperCase(), key = method + ' ' + keyOf(input && input.url || input);
            return new Promise(function (resolve) {
                whenReady(function () {
                    var r = method === 'GET' ? reply(key) || { status: 404, body: '', type: '' } : { status: 204, body: null, type: '' };
                    resolve(new Response(r.status === 204 ? null : r.body, { status: r.status, headers: r.type ? { 'Content-Type': r.type } : {} }));
                });
            });
        };

        setInterval(function () {   // hand each socket the recorded messages whose time has come
            if (!data) { return; }
            var t = now();
            sockets.forEach(function (s) {
                if (s.readyState !== 1) { return; }
                while (s.cursor < data.log.length && data.log[s.cursor].t <= t) {
                    var e = data.log[s.cursor++];
                    if (e.kind === 'ws' && e.url === s.key) { s.emit('message', new MessageEvent('message', { data: e.data })); }
                }
            });
        }, 50);
        window.addEventListener('message', function (event) {
            var m = event.data;
            if (event.origin !== CONSOLE || !m || m.type !== 'beacon-replay') { return; }
            if (m.recording) { data = m.recording; }
            base = m.at; realBase = realNow(); playing = !!m.play;
            waiting.splice(0).forEach(function (fn) { setTimeout(fn, 0); });
        });
        parent.postMessage({ type: 'beacon-replay-ready', port: location.port }, CONSOLE);
    }

    function guardBe() {
        var confirmed = false;
        function skillName(button) {
            var row = button.closest('.list-group-item'), title = row && row.querySelector('h4');
            return title ? title.firstChild.textContent.trim() : '';
        }
        window.addEventListener('click', function (event) {
            var button = !confirmed && event.target.closest && event.target.closest('button.btn-danger, button.btn-success');
            if (!button) { return; }
            var stopsBe = button.classList.contains('btn-danger') ? skillName(button) === '@be/be'
                : Array.prototype.some.call(document.querySelectorAll('.running'), function (r) { return skillName(r) === '@be/be'; });
            if (!stopsBe) { return; }
            event.preventDefault(); event.stopImmediatePropagation();
            var what = button.classList.contains('btn-danger') ? 'Stopping @be/be' : 'Launching ' + skillName(button) + ' stops @be/be, and that';
            if (window.confirm(what + ' shuts down BEacon, including this very page.\n\nJibo\'s face, voice and skills stop too, and this console stops answering until Be is started again (or Jibo restarts).\n\nStop Be anyway?')) {
                confirmed = true;
                try { button.click(); } finally { confirmed = false; }
            }
        }, true);
    }
}());
