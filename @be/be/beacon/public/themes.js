/* Theme/store UI. All remote text is rendered through textContent and DOM nodes. */
(function () {
    'use strict';
    function $(selector) { return document.querySelector(selector); }
    function el(tag, css, text) {
        var n = document.createElement(tag); if (css) { n.className = css; }
        if (text !== undefined) { n.textContent = String(text); } return n;
    }
    function inline(node, text) {
        var pattern = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|`([^`]+)`|\*([^*]+)\*/g;
        var match, end = 0;
        while ((match = pattern.exec(text))) {
            node.appendChild(document.createTextNode(text.slice(end, match.index)));
            if (match[1]) {
                if (/^https?:\/\//i.test(match[2])) {
                    var a = el('a', null, match[1]); a.href = match[2]; a.target = '_blank'; a.rel = 'noopener noreferrer'; node.appendChild(a);
                } else { node.appendChild(document.createTextNode(match[1])); }
            } else { node.appendChild(el(match[3] ? 'strong' : match[4] ? 'code' : 'em', null, match[3] || match[4] || match[5])); }
            end = pattern.lastIndex;
        }
        node.appendChild(document.createTextNode(text.slice(end)));
    }
    function markdown(node, text) {
        node.textContent = '';
        var lines = String(text || '').split(/\r?\n/), paragraph = [], code = null, list = null;
        function flush() {
            if (paragraph.length) { var p = el('p'); inline(p, paragraph.join(' ')); node.appendChild(p); paragraph = []; }
        }
        lines.forEach(function (line) {
            if (/^```|^~~~/.test(line)) {
                flush(); list = null;
                if (code) { node.appendChild(el('pre', null, code.join('\n'))); code = null; } else { code = []; } return;
            }
            if (code) { code.push(line); return; }
            var h = line.match(/^(#{1,6})\s+(.+)$/), item = line.match(/^\s*(?:[-*+] |\d+\. )(.+)$/);
            if (h) { flush(); list = null; var heading = el('h' + h[1].length); inline(heading, h[2]); node.appendChild(heading); }
            else if (item) { flush(); if (!list) { list = el('ul'); node.appendChild(list); } var li = el('li'); inline(li, item[1]); list.appendChild(li); }
            else if (!line.trim()) { flush(); list = null; }
            else { list = null; paragraph.push(line); }
        });
        flush(); if (code) { node.appendChild(el('pre', null, code.join('\n'))); }
    }
    function create(options) {
        var api = options.api, toast = options.toast, reportError = options.reportError;
        var opener = null, refreshing = null, uploading = false, installed = {};
        function button(parent, text, fn, disabled) {
            var b = el('button', 'btn', text); b.disabled = !!disabled;
            b.onclick = function () {
                b.disabled = true;
                return Promise.resolve().then(fn).then(function () { b.disabled = !!disabled; }, function (err) { b.disabled = !!disabled; reportError(err); });
            };
            parent.appendChild(b); return b;
        }
        function action(method, path, body) {
            toast('Working…');
            return api(method, path, body).then(function (data) {
                if (path === '/api/themes/apply') { toast(data.live.live ? 'Theme applied.' : 'Theme saved for Jibo’s next start.', 'ok'); }
                else { toast('Saved.', 'ok'); }
                return loadStore(false);
            });
        }
        function details(id) {
            return api('GET', '/api/store/details?id=' + encodeURIComponent(id)).then(function (data) {
                opener = document.activeElement;
                var m = data.manifest || {};
                $('#theme-details-title').textContent = m.name || data.name || 'Theme';
                $('#theme-details-meta').textContent = (m.version ? 'Version ' + m.version + ' · ' : '') +
                    (m.supported ? 'Requires jibo-tbd ' + m.supported + ' or newer' : 'No minimum jibo-tbd version declared');
                markdown($('#theme-details-readme'), data.readme || 'No README is available.');
                $('#theme-details').hidden = false;
                $('#theme-details [data-action="close-theme-details"]').focus();
            });
        }
        function loadThemes() {
            return api('GET', '/api/themes').then(function (data) {
                installed = {}; var summary = 'Active theme: None';
                data.themes.forEach(function (t) {
                    installed[t.manifest.name.toLowerCase()] = t;
                    if (t.active) { summary = 'Active theme: ' + t.manifest.name + (t.pending ? ' (new version ready to apply)' : ''); }
                });
                if (!data.live.live) { summary += ' · ' + data.live.reason; }
                $('#themes-summary').textContent = summary;
                var list = $('#themes-list'); list.textContent = '';
                var stock = el('article', 'skill'); stock.appendChild(el('div', 'skill-name', 'None'));
                stock.appendChild(el('p', 'skill-desc', 'Jibo’s stock face and menus.'));
                button(stock, data.active ? 'Apply' : 'Active', function () { return action('POST', '/api/themes/apply', { id: null }); }, !data.active && data.live.live);
                list.appendChild(stock);
                data.themes.forEach(function (t) {
                    var card = el('article', 'skill'); card.appendChild(el('div', 'skill-name', t.manifest.name));
                    card.appendChild(el('p', 'hint', 'v' + t.manifest.version + ' · Compatibility: ' + t.compatibility.status));
                    if (t.images['face/eye.png']) {
                        var image = el('img', 'theme-preview'); image.alt = t.manifest.name + ' eye';
                        image.src = '/api/themes/asset?id=' + encodeURIComponent(t.id) + '&name=face%2Feye.png&t=' + t.revision; card.appendChild(image);
                    }
                    var actions = el('div', 'theme-actions');
                    button(actions, 'Details', function () { return details(t.id); });
                    button(actions, t.active && !t.pending ? 'Active' : 'Apply', function () { return action('POST', '/api/themes/apply', { id: t.id }); },
                        t.compatibility.status === 'incompatible' || (t.active && !t.pending && data.live.live));
                    if (t.origin && t.origin.url) { button(actions, 'Update', function () { return action('POST', '/api/themes/install', { themeId: t.id }); }); }
                    button(actions, 'Remove', function () {
                        if (!confirm('Remove ' + t.manifest.name + '?')) { return; }
                        return action('DELETE', '/api/themes?id=' + encodeURIComponent(t.id));
                    });
                    card.appendChild(actions); list.appendChild(card);
                });
                return data;
            });
        }
        function renderStore(data) {
            var sources = $('#store-sources'); sources.textContent = '';
            data.sources.forEach(function (source) {
                var row = el('div', 'card store-source'); row.appendChild(el('p', null, source.url));
                row.appendChild(el('p', 'hint', source.error ? source.error + ' · Showing cached entries' : source.refreshedAt ?
                    'Last refreshed ' + new Date(source.refreshedAt).toLocaleString() : 'Refresh to load themes'));
                button(row, 'Refresh', function () { return refreshStore(source.id); });
                button(row, 'Remove', function () { return action('DELETE', '/api/store/sources?id=' + encodeURIComponent(source.id)); });
                sources.appendChild(row);
            });
            var list = $('#store-list'); list.textContent = '';
            if (!data.entries.length) { list.appendChild(el('p', 'hint', 'No themes loaded. Refresh a storefront or add a theme repository.')); }
            data.entries.forEach(function (entry) {
                var card = el('article', 'skill'); card.appendChild(el('div', 'skill-name', entry.name || entry.url));
                card.appendChild(el('p', 'store-description', entry.description || entry.error || ''));
                if (entry.manifest) { card.appendChild(el('p', 'hint', 'v' + entry.manifest.version + ' · Compatibility: ' + entry.compatibility.status)); }
                var actions = el('div', 'theme-actions'), existing = installed[(entry.name || '').toLowerCase()];
                button(actions, 'Details', function () { return details(entry.id); }, !!entry.error);
                button(actions, existing ? 'Update' : 'Install', function () { return action('POST', '/api/themes/install', { entryId: entry.id }); },
                    !!entry.error || (entry.compatibility && entry.compatibility.status === 'incompatible'));
                card.appendChild(actions); list.appendChild(card);
            });
        }
        function refreshStore(id) {
            if (refreshing) { return refreshing; }
            toast('Refreshing storefront…');
            refreshing = api('POST', '/api/store/refresh', id ? { id: id } : {}).then(function (data) {
                refreshing = null; renderStore(data); return data;
            }, function (err) { refreshing = null; throw err; });
            return refreshing;
        }
        function loadStore(autoRefresh) {
            return loadThemes().then(function () { return api('GET', '/api/store'); }).then(function (data) {
                renderStore(data);
                if (autoRefresh !== false && data.sources.some(function (s) { return !s.refreshedAt && !s.error; })) { return refreshStore(); }
                return data;
            });
        }
        function upload(file) {
            if (uploading) { return; }
            if (!/\.zip$/i.test(file.name) || file.size > 32 * 1024 * 1024) { reportError(new Error('Choose a theme ZIP up to 32 MB')); return; }
            uploading = true; toast('Validating and installing theme…');
            return fetch('/api/themes/upload?name=' + encodeURIComponent(file.name), { method: 'PUT', headers: { 'Content-Type': 'application/zip' }, body: file })
                .then(function (res) { return res.json().then(function (data) { if (!res.ok) { throw new Error(data.error || 'Upload failed'); } return data; }); })
                .then(function () { uploading = false; toast('Theme installed. Choose Apply to test it.', 'ok'); return loadThemes(); })
                .catch(function (err) { uploading = false; reportError(err); });
        }
        function addSource() {
            return options.prompt({ title: 'Add storefront', placeholder: 'https://github.com/ZaneThePython/Astra', hint: 'A manifest URL or a single GitHub repository' })
                .then(function (value) { if (value) { return action('POST', '/api/store/sources', { url: value }); } });
        }
        function closeDetails() { $('#theme-details').hidden = true; if (opener && document.body.contains(opener)) { opener.focus(); } }
        $('#theme-details').addEventListener('keydown', function (event) {
            if (event.key === 'Escape') { closeDetails(); }
            if (event.key === 'Tab') {
                var focusable = $('#theme-details').querySelectorAll('button, a[href]');
                var first = focusable[0], last = focusable[focusable.length - 1];
                if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
                else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
            }
        });
        return { loadThemes: loadThemes, loadStore: loadStore, refreshStore: refreshStore, upload: upload, addSource: addSource, closeDetails: closeDetails };
    }
    window.BEaconThemes = { create: create, markdown: markdown };
}());
