// Jibo Services console: lists the robot's services (from /api/services) and shows each one's own web page.
(function () {
    'use strict';
    var $ = function (id) { return document.getElementById(id); };
    var services = [], current = null, frames = {}, recordings = null, pausedAt = 0;
    function label(s) { return s.title || s.name.replace(/-/g, ' ').replace(/\b[a-z]/g, function (c) { return c.toUpperCase(); }); }
    function pageUrl(s) { return location.protocol + '//' + location.hostname + ':' + s.port + '/index.html'; }
    function show(s) {
        current = s.name;
        Array.prototype.forEach.call($('list').children, function (b) { b.setAttribute('aria-current', String(b.dataset.name === s.name)); });
        $('title').textContent = label(s);
        $('meta').textContent = s.name + ' · port ' + s.port + (s.up ? '' : ' · not answering');
        $('open').hidden = !s.page; $('empty').hidden = s.page;
        // One frame per opened page, kept loaded so it keeps recording its last minute.
        if (s.page && !frames[s.port]) { var f = document.createElement('iframe'); f.title = label(s); f.src = pageUrl(s); $('frames').appendChild(f); frames[s.port] = f; }
        Object.keys(frames).forEach(function (port) { frames[port].classList.toggle('behind', Number(port) !== s.port || !!recordings); });
        if (s.page) { $('open').href = pageUrl(s); }
        else { $('empty').textContent = s.up ? 'This service runs, but it has no web page of its own.' : 'This service is registered but did not answer.'; }
        if (recordings) { scrub(); }
        history.replaceState(null, '', '#' + s.name);
    }
    function render() {
        var list = $('list'); list.textContent = '';
        services.forEach(function (s) {
            var b = document.createElement('button');
            b.type = 'button'; b.dataset.name = s.name;
            b.className = (s.up ? '' : 'down ') + (s.page ? '' : 'nopage');
            b.title = s.page ? 'Show its page' : 'No web page';
            [['dot', ''], ['name', label(s)], ['port', String(s.port)]].forEach(function (p) {
                var span = document.createElement('span'); span.className = p[0]; span.textContent = p[1]; b.appendChild(span);
            });
            b.onclick = function () { show(s); };
            list.appendChild(b);
        });
        var up = services.filter(function (s) { return s.up; }).length;
        $('summary').textContent = services.length + ' services · ' + up + ' answering · checked ' + new Date().toLocaleTimeString();
        var wanted = services.filter(function (s) { return s.name === (current || decodeURIComponent(location.hash.slice(1))); })[0];
        if (wanted) { show(wanted); }
    }
    function load() {
        $('summary').textContent = 'Checking…';
        return fetch('/api/services').then(function (r) {
            return r.json().then(function (data) { if (!r.ok) { throw new Error(data.error || 'Request failed'); } return data; });
        }).then(function (data) { services = data.services; render(); }, function (err) {
            $('summary').textContent = 'Could not read the service list: ' + err.message;
        });
    }
    // Pause: every opened page sends its last minute of pictures; the slider shows one moment, without scripts.
    function selected() { return services.filter(function (s) { return s.name === current; })[0]; }
    function scrub() {
        var t = pausedAt - (60 - Number($('scrub').value)) * 1000, s = selected();
        var list = s && recordings[s.port] || [], frame = null;
        list.forEach(function (f) { if (f.t <= t + 500) { frame = f; } });
        frame = frame || list[0];
        var shown = frame ? frame.t : t, ago = Math.round((pausedAt - shown) / 1000);   // label the picture actually shown
        $('when').textContent = (ago ? '−' + ago + ' s' : 'when paused') + ' · ' + new Date(shown).toLocaleTimeString() +
            (frame && frame.t > t + 1500 ? ' (oldest kept)' : '');
        $('still').hidden = !frame;
        if (frame && $('still').srcdoc !== frame.html) { $('still').srcdoc = frame.html; }
        if (s && s.page && !frame) { $('empty').hidden = false; $('empty').textContent = 'No recording for this page: open a page before pausing and it records its last minute.'; }
        else if (s && s.page) { $('empty').hidden = true; }
    }
    window.addEventListener('message', function (event) {
        var m = event.data;
        if (recordings && m && m.type === 'beacon-recording' && event.origin === location.protocol + '//' + location.hostname + ':' + m.port && frames[m.port]) {
            recordings[m.port] = m.frames; scrub();
        }
    });
    // Like a cassette: Pause freezes and lets the slider rewind, Resume plays the recording forward from there and
    // goes live when it catches up, Cancel throws the recording away and goes live at once.
    var playing = null;
    function stopPlaying() { clearInterval(playing); playing = null; }
    function goLive(clear) {
        stopPlaying(); recordings = null;
        $('timeline').hidden = true; $('still').hidden = true; $('still').removeAttribute('srcdoc');
        $('pause').textContent = 'Pause'; $('cancel').hidden = true;
        Object.keys(frames).forEach(function (port) {
            if (clear) { frames[port].contentWindow.postMessage({ type: 'beacon-recording-clear' }, location.protocol + '//' + location.hostname + ':' + port); }
        });
        var s = selected(); if (s) { show(s); }
    }
    function pause() {
        stopPlaying(); $('state').textContent = 'PAUSED'; $('pause').textContent = 'Resume';
        if (recordings) { return; }
        recordings = {}; pausedAt = Date.now(); $('scrub').value = 60;
        $('timeline').hidden = false; $('cancel').hidden = false;
        Object.keys(frames).forEach(function (port) {
            frames[port].classList.add('behind');
            frames[port].contentWindow.postMessage({ type: 'beacon-recording' }, location.protocol + '//' + location.hostname + ':' + port);
        });
        scrub();
    }
    function resume() {
        $('state').textContent = 'PLAYING'; $('pause').textContent = 'Pause';
        var last = Date.now();
        playing = setInterval(function () {
            var now = Date.now(), at = Number($('scrub').value) + (now - last) / 1000; last = now;
            if (at >= 60) { goLive(false); return; }   // caught up with the moment of pausing: back to the live pages
            $('scrub').value = at; scrub();
        }, 100);
    }
    $('pause').onclick = function () { if (!recordings || playing) { pause(); } else { resume(); } };
    $('cancel').onclick = function () { goLive(true); };
    $('scrub').addEventListener('pointerdown', function () { if (playing) { pause(); } });
    $('scrub').oninput = scrub;
    // Two warnings in a row before anything loads; Back to BEacon (or Escape) leaves.
    function warn(id) {
        return new Promise(function (resolve) {
            var d = $(id);
            d.querySelector('button').onclick = function () { d.close(); resolve(); };
            d.oncancel = function (event) { event.preventDefault(); location.href = '/#etc'; };
            d.showModal();
        });
    }
    $('refresh').onclick = load;
    warn('warn-1').then(function () { return warn('warn-2'); }).then(load);
}());
