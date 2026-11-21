// Jibo Services console: lists the robot's services (from /api/services) and shows each one's own web page.
(function () {
    'use strict';
    var $ = function (id) { return document.getElementById(id); };
    var services = [], current = null;
    function label(s) { return s.title || s.name.replace(/-/g, ' ').replace(/\b[a-z]/g, function (c) { return c.toUpperCase(); }); }
    function pageUrl(s) { return location.protocol + '//' + location.hostname + ':' + s.port + '/index.html'; }
    function show(s) {
        current = s.name;
        Array.prototype.forEach.call($('list').children, function (b) { b.setAttribute('aria-current', String(b.dataset.name === s.name)); });
        $('title').textContent = label(s);
        $('meta').textContent = s.name + ' · port ' + s.port + (s.up ? '' : ' · not answering');
        $('open').hidden = !s.page; $('frame').hidden = !s.page; $('empty').hidden = s.page;
        if (s.page) { $('open').href = pageUrl(s); if ($('frame').src !== pageUrl(s)) { $('frame').src = pageUrl(s); } }
        else { $('frame').removeAttribute('src'); $('empty').textContent = s.up ? 'This service runs, but it has no web page of its own.' : 'This service is registered but did not answer.'; }
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
    $('refresh').onclick = load;
    load();
}());
