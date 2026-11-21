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
        if (s.page && !frames[s.port]) { var f = document.createElement('iframe'); f.title = label(s); f.src = pageUrl(s); $('frames').appendChild(f); frames[s.port] = f; opened[s.port] = Date.now(); }
        Object.keys(frames).forEach(function (port) { frames[port].classList.toggle('behind', Number(port) !== s.port || !!recordings); });
        if (s.page) { $('open').href = pageUrl(s); }
        else { $('empty').textContent = s.up ? 'This service runs, but it has no web page of its own.' : 'This service is registered but did not answer.'; }
        if (recordings) { timeLabel(); loadReplay(); }
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
    // Pause: every opened page hands over what it received in the last minute, and a replay copy of the real page
    // runs on that recording at the slider's moment (nothing it sends reaches Jibo). Like a cassette: drag to rewind,
    // Resume plays forward and goes live when it catches up, Cancel throws the recording away and goes live.
    var opened = {}, playing = null, seekTimer = null, replayAt = 0;
    var origin = function (port) { return location.protocol + '//' + location.hostname + ':' + port; };
    function selected() { return services.filter(function (s) { return s.name === current; })[0]; }
    function sliderTime() { return pausedAt - (60 - Number($('scrub').value)) * 1000; }
    function timeLabel() {
        var s = selected(), t = sliderTime(), ago = Math.round((pausedAt - t) / 1000);
        $('when').textContent = (ago ? '−' + ago + ' s' : 'when paused') + ' · ' + new Date(t).toLocaleTimeString() +
            (s && opened[s.port] > t ? ' · not recorded' : '');
    }
    function loadReplay() {   // a fresh copy of the page, so it rebuilds its state from the recording up to that moment
        var s = selected(), rec = s && recordings[s.port];
        $('still').hidden = !rec;
        if (s && s.page && !rec) { $('empty').hidden = false; $('empty').textContent = frames[s.port] ? 'Getting the recording…' : 'No recording for this page: open a page before pausing and it records its last minute.'; return; }
        if (!rec) { return; }
        $('empty').hidden = true; replayAt = sliderTime();
        $('still').src = pageUrl(s) + '?beaconReplay=' + Date.now();
    }
    function control(play) {
        var s = selected();
        if (s && recordings[s.port] && $('still').contentWindow) { $('still').contentWindow.postMessage({ type: 'beacon-replay', at: sliderTime(), play: play }, origin(s.port)); }
    }
    function scrub() { timeLabel(); clearTimeout(seekTimer); seekTimer = setTimeout(loadReplay, 200); }
    window.addEventListener('message', function (event) {
        var m = event.data, s = selected();
        if (!recordings || !m || event.origin !== origin(m.port)) { return; }
        if (m.type === 'beacon-recording' && frames[m.port]) { recordings[m.port] = m.recording; if (s && s.port === Number(m.port)) { loadReplay(); } }
        if (m.type === 'beacon-replay-ready' && event.source === $('still').contentWindow && recordings[m.port]) {
            event.source.postMessage({ type: 'beacon-replay', recording: recordings[m.port], at: replayAt, play: !!playing }, origin(m.port));
        }
    });
    function stopPlaying() { clearInterval(playing); playing = null; }
    function goLive(clear) {
        stopPlaying(); recordings = null; clearTimeout(seekTimer);
        $('timeline').hidden = true; $('still').hidden = true; $('still').src = 'about:blank';
        $('pause').textContent = 'Pause'; $('cancel').hidden = true;
        if (clear) { Object.keys(frames).forEach(function (port) { frames[port].contentWindow.postMessage({ type: 'beacon-recording-clear' }, origin(port)); }); }
        var s = selected(); if (s) { show(s); }
    }
    function pause() {
        var wasPlaying = !!playing;
        stopPlaying(); $('state').textContent = 'PAUSED'; $('pause').textContent = 'Resume';
        if (recordings) { if (wasPlaying) { control(false); } return; }
        recordings = {}; pausedAt = Date.now(); $('scrub').value = 60;
        $('timeline').hidden = false; $('cancel').hidden = false;
        Object.keys(frames).forEach(function (port) {
            frames[port].classList.add('behind');
            frames[port].contentWindow.postMessage({ type: 'beacon-recording' }, origin(port));
        });
        timeLabel(); loadReplay();
    }
    function resume() {
        $('state').textContent = 'PLAYING'; $('pause').textContent = 'Pause';
        control(true);
        var last = Date.now();
        playing = setInterval(function () {
            var now = Date.now(), at = Number($('scrub').value) + (now - last) / 1000; last = now;
            if (at >= 60) { goLive(false); return; }   // caught up with the moment of pausing: back to the live pages
            $('scrub').value = at; timeLabel();
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
