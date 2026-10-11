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
        var toast = options.toast, reportError = options.reportError;
        function request(work, label) {
            return new Promise(function (resolve, reject) {
                var done = false, controller = window.AbortController ? new window.AbortController() : null;
                var timer = setTimeout(function () {
                    if (done) { return; } done = true;
                    reject(new Error(label + ' timed out. You can retry; check the Store for the current theme state.'));
                    if (controller) { controller.abort(); }
                }, options.requestTimeout || 150000);
                Promise.resolve().then(function () { return work(controller && controller.signal); }).then(function (data) {
                    if (done) { return; } done = true; clearTimeout(timer); resolve(data);
                }, function (err) {
                    if (done) { return; } done = true; clearTimeout(timer);
                    var error = new Error(label + ' failed: ' + (err.message || String(err)));
                    error.detail = err.detail; error.status = err.status; reject(error);
                });
            });
        }
        function api(method, path, body) {
            var label = path.indexOf('/api/themes/install') === 0 ? 'Theme download/install' :
                path.indexOf('/api/themes/apply') === 0 ? 'Applying theme' :
                method === 'DELETE' ? 'Removal' : path.indexOf('/api/store/refresh') === 0 ? 'Storefront refresh' : 'Theme/store request';
            return request(function (signal) { return options.api(method, path, body, { signal: signal }); }, label);
        }
        function storeErrors(data) {
            var errors = (data.sources || []).concat(data.entries || []).filter(function (item) { return item.error; });
            if (errors.length) { reportError(new Error('Storefront refresh failed: ' + errors[0].error +
                (errors.length > 1 ? ' (' + errors.length + ' errors)' : '') + '. Cached themes are still available.')); }
        }
        var opener = null, managementOpener = null, refreshing = null, refreshTimer = null, uploading = false, inventory = { themes: [], active: null, live: { live: false } };
        function closeOptions(focus) {
            $('#store-options-menu').hidden = true;
            $('#store-options-button').setAttribute('aria-expanded', 'false');
            if (focus) { $('#store-options-button').focus(); }
        }
        $('#store-options-button').onclick = function () {
            var open = $('#store-options-menu').hidden;
            $('#store-options-menu').hidden = !open;
            $('#store-options-button').setAttribute('aria-expanded', String(open));
            if (open) { $('#manage-storefronts').focus(); }
        };
        $('#store-options').addEventListener('keydown', function (event) {
            if (event.key === 'Escape') { event.preventDefault(); closeOptions(true); }
        });
        document.addEventListener('click', function (event) {
            if (!$('#store-options').contains(event.target)) { closeOptions(); }
        });
        $('#manage-storefronts').onclick = function () {
            managementOpener = $('#store-options-button'); closeOptions();
            $('#store-management').hidden = false; $('#close-store-management').focus();
        };
        function closeManagement() {
            $('#store-management').hidden = true;
            if (managementOpener && document.body.contains(managementOpener)) { managementOpener.focus(); }
        }
        $('#close-store-management').onclick = closeManagement;
        $('#upload-store-theme').onclick = function () { closeOptions(); $('#theme-file').click(); };
        function startStoreRefresh() {
            if (refreshTimer !== null) { return; }
            refreshTimer = window.setInterval(function () { return refreshStore(null, true).catch(reportError); }, 5 * 60 * 1000);
        }
        function selectStoreTab(category, focus) {
            var skills = category === 'skills';
            $('#store-switch').className = 'store-switch' + (skills ? ' is-skills' : '');
            ['themes', 'skills'].forEach(function (name) {
                var selected = name === category, tab = $('#store-tab-' + name);
                tab.setAttribute('aria-selected', String(selected)); tab.tabIndex = selected ? 0 : -1;
                $('#store-' + name).hidden = !selected;
                if (selected && focus) { tab.focus(); }
            });
        }
        ['themes', 'skills'].forEach(function (name) {
            var tab = $('#store-tab-' + name);
            tab.onclick = function () { selectStoreTab(name); };
            tab.addEventListener('keydown', function (event) {
                if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].indexOf(event.key) === -1) { return; }
                event.preventDefault();
                selectStoreTab(event.key === 'Home' ? 'themes' : event.key === 'End' ? 'skills' : name === 'themes' ? 'skills' : 'themes', true);
            });
        });
        selectStoreTab('themes');
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
                if (path === '/api/store/sources' && method === 'POST') { storeErrors(data); }
                return loadStore(false);
            });
        }
        function details(id) {
            return api('GET', '/api/store/details?id=' + encodeURIComponent(id)).then(function (data) {
                opener = document.activeElement;
                var m = data.manifest || {};
                $('#theme-details-title').textContent = m.name || data.name || 'Theme';
                $('#theme-details-meta').textContent = (m.version ? 'Version ' + m.version + ' · ' : '') +
                    (m.supported ? 'Needs version ' + m.supported + ' or newer' : 'No minimum version declared');
                markdown($('#theme-details-readme'), data.readme || 'No README is available.');
                $('#theme-details').hidden = false;
                $('#theme-details [data-action="close-theme-details"]').focus();
            });
        }
        function loadThemes() {
            return api('GET', '/api/themes').then(function (data) {
                var summary = 'Active theme: None';
                data.themes.forEach(function (t) {
                    if (t.active) { summary = 'Active theme: ' + t.manifest.name + (t.pending ? ' (new version ready to apply)' : ''); }
                });
                if (!data.live.live) { summary += ' · ' + data.live.reason; }
                $('#themes-summary').textContent = summary;
                inventory = data;
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
            var entries = [{ name: 'None', stock: true }], seen = Object.create(null);
            inventory.themes.forEach(function (theme) {
                var matches = data.entries.filter(function (entry) { return (entry.name || '').toLowerCase() === theme.manifest.name.toLowerCase(); });
                var remote = theme.origin && theme.origin.url ? matches.filter(function (entry) { return entry.url === theme.origin.url; })[0] : matches[0];
                var entry = Object.assign({}, remote || { name: theme.manifest.name, manifest: theme.manifest });
                entry.local = theme;
                if (!entry.description) {
                    entry.description = theme.readme ? theme.readme.split(/\r?\n\s*\r?\n/).filter(function (text) { return text.trim() && !/^\s*#/.test(text); })[0] : '';
                    entry.description = (entry.description || 'Installed theme. Choose Apply to use it.').replace(/[*_`]/g, '');
                }
                entries.push(entry); seen[theme.manifest.name.toLowerCase()] = true;
            });
            data.entries.forEach(function (entry) {
                var key = (entry.name || entry.url).toLowerCase();
                if (!seen[key]) { entries.push(entry); seen[key] = true; }
            });
            entries.forEach(function (entry) {
                var card = el('article', 'store-card'), media = el('div', 'store-card-banner');
                var fallback = el('span', 'store-banner-fallback', (entry.name || 'J').charAt(0).toUpperCase());
                fallback.setAttribute('aria-hidden', 'true'); media.appendChild(fallback);
                if (entry.stock) {
                    media.className += ' store-none-banner';
                    fallback.hidden = true;
                    var stockIcon = el('img', 'store-none-icon'); stockIcon.src = 'theme-none.svg'; stockIcon.alt = 'Stock appearance'; media.appendChild(stockIcon);
                } else if (entry.bannerUrl || (entry.local && entry.local.images['banner.png'])) {
                    var image = el('img', 'store-banner-image'); image.alt = (entry.name || 'Theme') + ' banner'; image.loading = 'lazy';
                    image.onload = function () { fallback.hidden = true; };
                    image.onerror = function () { image.hidden = true; fallback.hidden = false; };
                    image.src = entry.local && entry.local.images['banner.png'] ? '/api/themes/asset?id=' + encodeURIComponent(entry.local.id) + '&name=banner.png&t=' + entry.local.revision :
                        '/api/store/banner?id=' + encodeURIComponent(entry.id) + '&v=' + encodeURIComponent(entry.commit || data.sources.filter(function (s) { return s.id === entry.sourceId; }).map(function (s) { return s.refreshedAt; })[0] || '');
                    media.appendChild(image);
                }
                card.appendChild(media);
                var content = el('div', 'store-card-content'); content.appendChild(el('h3', 'store-card-name', entry.name || entry.url));
                content.appendChild(el('p', 'store-description', entry.stock ? 'Jibo’s stock face and menus.' : entry.description || entry.error || 'A new look for Jibo.'));
                if (entry.compatibility && entry.compatibility.status === 'incompatible') {
                    content.appendChild(el('p', 'hint', 'Needs version ' + entry.manifest.supported + ' or newer'));
                }
                var actions = el('div', 'theme-actions'), existing = entry.local;
                if (entry.stock) {
                    var stockActive = !inventory.active && inventory.live.live;
                    var stockApply = button(actions, stockActive ? 'Active' : 'Apply', function () { return action('POST', '/api/themes/apply', { id: null }); }, stockActive);
                    stockApply.className = 'btn btn-primary store-install';
                    content.appendChild(actions); card.appendChild(content); list.appendChild(card); return;
                }
                if (existing) {
                    var active = existing.active && !existing.pending && inventory.live.live;
                    var apply = button(actions, active ? 'Active' : 'Apply', function () { return action('POST', '/api/themes/apply', { id: existing.id }); }, active || existing.compatibility.status === 'incompatible');
                    apply.className = 'btn btn-primary store-apply';
                    content.appendChild(el('p', 'hint', 'Installed v' + existing.manifest.version + (existing.pending ? ' · New version ready to apply' : '')));
                    if (existing.compatibility.status === 'unverified') { content.appendChild(el('p', 'hint', 'Compatibility unverified')); }
                    if (existing.compatibility.status === 'incompatible' && (!entry.compatibility || entry.compatibility.status !== 'incompatible')) {
                        content.appendChild(el('p', 'hint', 'Needs version ' + existing.manifest.supported + ' or newer'));
                    }
                }
                var different = existing && entry.manifest && existing.manifest.version !== entry.manifest.version;
                var remove = existing && !different;
                var install = button(actions, remove ? 'Remove' : existing ? 'Update' : 'Install', function () {
                    if (remove) {
                        if (!confirm('Remove ' + existing.manifest.name + '?')) { return; }
                        return action('DELETE', '/api/themes?id=' + encodeURIComponent(existing.id));
                    }
                    return action('POST', '/api/themes/install', { entryId: entry.id });
                }, !remove && (!!entry.error || (entry.compatibility && entry.compatibility.status === 'incompatible')));
                install.className = 'btn btn-primary store-install';
                var detailButton = button(actions, 'Details', function () { return details(existing ? existing.id : entry.id); }, !existing && !!entry.error);
                detailButton.className = 'btn store-details';
                content.appendChild(actions); card.appendChild(content); list.appendChild(card);
            });
        }
        function refreshStore(id, silent) {
            if (refreshing) { return refreshing; }
            if (!silent) { toast('Refreshing storefront…'); }
            refreshing = api('POST', '/api/store/refresh', id ? { id: id } : {}).then(function (data) {
                return loadThemes().then(function () {
                    refreshing = null; renderStore(data); storeErrors(data);
                    if (!silent && !(data.sources || []).concat(data.entries || []).some(function (item) { return item.error; })) { toast('Storefront refreshed.', 'ok'); }
                    return data;
                });
            }, function (err) { refreshing = null; throw err; });
            refreshing = refreshing.catch(function (err) { refreshing = null; throw err; });
            return refreshing;
        }
        function loadStore(autoRefresh) {
            startStoreRefresh();
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
            return request(function (signal) {
                var uploadOptions = { method: 'PUT', headers: { 'Content-Type': 'application/zip' }, body: file };
                if (signal) { uploadOptions.signal = signal; }
                return fetch('/api/themes/upload?name=' + encodeURIComponent(file.name), uploadOptions).then(function (res) {
                    return res.text().then(function (text) {
                        var data;
                        try { data = JSON.parse(text); } catch (err) { throw new Error('BEacon returned an invalid upload response (HTTP ' + res.status + ')'); }
                        if (!res.ok) { throw new Error(data.error || 'Upload failed (HTTP ' + res.status + ')'); } return data;
                    });
                });
            }, 'Theme upload')
                .then(function () { uploading = false; toast('Theme installed. Choose Apply to test it.', 'ok'); return loadStore(false); })
                .catch(function (err) { uploading = false; reportError(err); });
        }
        function addSource() {
            return options.prompt({ title: 'Add storefront', placeholder: 'https://github.com/ZaneThePython/Astra', hint: 'A manifest URL or a single GitHub repository' })
                .then(function (value) { if (value) { return action('POST', '/api/store/sources', { url: value }); } });
        }
        function closeDetails() { $('#theme-details').hidden = true; if (opener && document.body.contains(opener)) { opener.focus(); } }
        function setupDialog(selector, closeDialog) {
            $(selector).addEventListener('click', function (event) { if (event.target === $(selector)) { closeDialog(); } });
            $(selector).addEventListener('keydown', function (event) {
                if (event.key === 'Escape') { closeDialog(); }
                if (event.key === 'Tab') {
                    var focusable = $(selector).querySelectorAll('button, a[href]');
                    var first = focusable[0], last = focusable[focusable.length - 1];
                    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
                    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
                }
            });
        }
        setupDialog('#theme-details', closeDetails);
        setupDialog('#store-management', closeManagement);
        return { loadStore: loadStore, refreshStore: refreshStore, upload: upload, addSource: addSource, closeDetails: closeDetails };
    }
    window.BEaconThemes = { create: create, markdown: markdown };
}());
