/* Theme/store UI. All remote text is rendered through textContent and DOM nodes. */
(function () {
    'use strict';
    function $(selector) { return document.querySelector(selector); }
    function el(tag, css, text) {
        var n = document.createElement(tag); if (css) { n.className = css; }
        if (text !== undefined) { n.textContent = String(text); } return n;
    }
    function imageUrl(value, options) {
        var target = value.trim().replace(/^<([^<>]+)>$/, '$1');
        if (/[\u0000-\u0020\u007f]/.test(target)) { return null; }
        var local = target.replace(/^(?:\.\/)+/, '');
        if (options.assetBase && options.images && options.images[local]) {
            return options.assetBase + encodeURIComponent(local);
        }
        try {
            var resolved = options.baseUrl ? new URL(target, options.baseUrl) : new URL(target);
            return /^https?:$/.test(resolved.protocol) && !resolved.username && !resolved.password ? resolved.href : null;
        } catch (err) { return null; }
    }
    function inline(node, text, options) {
        var pattern = /(!?)\[([^\]]*)\]\(([^)]+)\)|\*\*([^*]+)\*\*|`([^`]+)`|\*([^*]+)\*/g;
        var match, end = 0;
        while ((match = pattern.exec(text))) {
            node.appendChild(document.createTextNode(text.slice(end, match.index)));
            if (match[3] !== undefined) {
                if (match[1] === '!') {
                    var src = imageUrl(match[3], options);
                    if (src) {
                        var image = el('img', 'theme-readme-image'); image.src = src; image.alt = match[2];
                        image.loading = 'lazy'; image.referrerPolicy = 'no-referrer';
                        image.onerror = function () { this.hidden = true; };
                        node.appendChild(image);
                    } else { node.appendChild(document.createTextNode(match[2])); }
                } else if (/^https?:\/\//i.test(match[3])) {
                    var a = el('a', null, match[2]); a.href = match[3]; a.target = '_blank'; a.rel = 'noopener noreferrer'; node.appendChild(a);
                } else { node.appendChild(document.createTextNode(match[2])); }
            } else { node.appendChild(el(match[4] ? 'strong' : match[5] ? 'code' : 'em', null, match[4] || match[5] || match[6])); }
            end = pattern.lastIndex;
        }
        node.appendChild(document.createTextNode(text.slice(end)));
    }
    function markdown(node, text, options) {
        options = options || {};
        node.textContent = '';
        var lines = String(text || '').split(/\r?\n/), paragraph = [], code = null, list = null;
        function flush() {
            if (paragraph.length) { var p = el('p'); inline(p, paragraph.join(' '), options); node.appendChild(p); paragraph = []; }
        }
        lines.forEach(function (line) {
            if (/^```|^~~~/.test(line)) {
                flush(); list = null;
                if (code) { node.appendChild(el('pre', null, code.join('\n'))); code = null; } else { code = []; } return;
            }
            if (code) { code.push(line); return; }
            var h = line.match(/^(#{1,6})\s+(.+)$/), item = line.match(/^\s*(?:[-*+] |\d+\. )(.+)$/);
            if (h) { flush(); list = null; var heading = el('h' + h[1].length); inline(heading, h[2], options); node.appendChild(heading); }
            else if (item) { flush(); if (!list) { list = el('ul'); node.appendChild(list); } var li = el('li'); inline(li, item[1], options); list.appendChild(li); }
            else if (!line.trim()) { flush(); list = null; }
            else { list = null; paragraph.push(line); }
        });
        flush(); if (code) { node.appendChild(el('pre', null, code.join('\n'))); }
    }
    function create(options) {
        var toast = options.toast, reportError = options.reportError;
        function request(work, label, timeout) {
            return new Promise(function (resolve, reject) {
                var done = false, controller = window.AbortController ? new window.AbortController() : null;
                var timer = setTimeout(function () {
                    if (done) { return; } done = true;
                    reject(new Error(label + ' timed out. You can retry; check the Store for the current theme state.'));
                    if (controller) { controller.abort(); }
                }, timeout || options.requestTimeout || 150000);
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
            var label = path.indexOf('/api/skills/install') === 0 ? 'Skill download/install' : path.indexOf('/api/themes/install') === 0 ? 'Theme download/install' :
                path.indexOf('/api/voices/install') === 0 || path.indexOf('/api/voices/theme') === 0 ? 'Voice download/install' : path.indexOf('/api/voices/apply') === 0 ? 'Changing voice' :
                path.indexOf('/api/themes/apply') === 0 ? 'Applying theme' :
                method === 'DELETE' ? 'Removal' : path.indexOf('/api/store/refresh') === 0 ? 'Storefront refresh' : 'Theme/store request';
            return request(function (signal) { return options.api(method, path, body, { signal: signal }); }, label,
                /\/api\/(?:themes|skills|voices)\/progress/.test(path) ? Math.min(options.requestTimeout || 5000, 5000) : null).catch(function (err) {
                    if (err.status === 401) { setStoreAuth({ connected: false }); }
                    throw err;
                });
        }
        function storeErrors(data) {
            var errors = (data.sources || []).concat(data.entries || []).filter(function (item) { return item.error; });
            if (errors.length) { reportError(new Error('Storefront refresh failed: ' + errors[0].error +
                (errors.length > 1 ? ' (' + errors.length + ' errors)' : '') + '. Cached themes are still available.')); }
        }
        var opener = null, managementOpener = null, refreshing = null, refreshTimer = null, uploading = false, inventory = { themes: [], active: null, live: { live: false } };
        var skillInventory = { skills: [] }, voiceInventory = { voices: [], active: null };
        // Per-category API names: themes, skills (custom skills) and voices.
        var KIND = { theme: 'themes', skill: 'skills', voice: 'voices' };
        function setStoreAuth(data) {
            var connected = !!data.connected;
            $('#store-auth-required').hidden = connected; $('#store-content').hidden = !connected;
            ['store-tab-themes', 'store-tab-skills', 'store-tab-voices', 'upload-store-zip'].forEach(function (id) { $('#' + id).disabled = !connected; });
            Array.prototype.forEach.call(document.querySelectorAll('[data-action="add-store"]'), function (button) { button.disabled = !connected; });
            if (!connected) {
                if (refreshTimer !== null) { window.clearInterval(refreshTimer); refreshTimer = null; }
                $('#store-list').textContent = ''; $('#store-skill-list').textContent = ''; $('#store-voice-list').textContent = ''; $('#store-sources').textContent = '';
                $('#theme-details').hidden = true;
            }
            return connected;
        }
        var githubUI = window.BEaconGithub ? window.BEaconGithub.create({ api: api, reportError: reportError, toast: toast, refresh: refreshStore, onChange: setStoreAuth }) : null;
        setStoreAuth({ connected: false });
        var downloads = Object.create(null);
        function downloadFor(entry) {
            return Object.keys(downloads).map(function (id) { return downloads[id]; }).filter(function (item) {
                return (entry.id && item.entryId === entry.id) || (entry.local && item.themeId === entry.local.id);
            })[0];
        }
        function updateProgress(item) {
            var data = item.data, percent = data.percent;
            item.nodes.forEach(function (node) {
                if (typeof percent === 'number') { node.bar.value = percent; }
                else { node.bar.removeAttribute('value'); }
                var label = data.state === 'resolving' ? 'Preparing download…' : data.state === 'validating' ? 'Validating theme…' :
                    data.state === 'installing' ? 'Installing theme…' : data.state === 'complete' ? 'Installed' :
                    data.state === 'failed' ? 'Download failed: ' + data.error : 'Downloading…';
                if (data.state === 'downloading') {
                    if (typeof percent === 'number') { label += ' ' + Math.floor(percent) + '%'; }
                    else if (data.received) { label += ' ' + (data.received / (1024 * 1024)).toFixed(1) + ' MB'; }
                }
                node.label.textContent = label;
                node.box.className = 'theme-download-progress' + (data.state === 'failed' ? ' is-failed' : '');
            });
            item.buttons.forEach(function (button) { button.node.disabled = !item.stopped || button.disabled; });
        }
        function attachProgress(content, item) {
            var box = el('div', 'theme-download-progress'), label = el('p', 'hint'), bar = el('progress');
            bar.max = 100; bar.setAttribute('aria-label', 'Theme download progress'); label.setAttribute('aria-live', 'polite');
            box.appendChild(label); box.appendChild(bar); content.appendChild(box);
            item.nodes.push({ box: box, label: label, bar: bar }); updateProgress(item);
        }
        function installTheme(entry, existing, content, button) {
            var isSkill = entry.type === 'skill', kind = entry.type === 'voice' ? 'voice' : isSkill ? 'skill' : 'theme';
            var item = { kind: kind, id: kind + '-' + Date.now() + '-' + Math.random().toString(16).slice(2),
                entryId: entry.id, themeId: existing && existing.id, nodes: [], buttons: [{ node: button, disabled: false }], stopped: false, timer: null, data: { state: 'resolving', percent: null } };
            Object.keys(downloads).forEach(function (id) {
                var prior = downloads[id];
                if (prior.stopped && (prior.entryId === item.entryId || (item.themeId && prior.themeId === item.themeId))) {
                    prior.nodes.forEach(function (node) { node.box.hidden = true; }); delete downloads[id];
                }
            });
            downloads[item.id] = item; attachProgress(content, item); toast('Downloading ' + kind + '…');
            function poll() {
                if (item.stopped) { return; }
                api('GET', '/api/' + KIND[kind] + '/progress?id=' + encodeURIComponent(item.id)).then(function (data) {
                    if (!item.stopped && data.id === item.id && data.state !== 'idle') { item.data = data; updateProgress(item); }
                }).catch(function () { /* The install request reports failures; retry progress independently. */ }).then(function () {
                    if (!item.stopped) { item.timer = setTimeout(poll, options.progressPollInterval || 500); }
                });
            }
            item.timer = setTimeout(poll, options.progressPollInterval || 500);
            function stop(data) { item.stopped = true; clearTimeout(item.timer); item.data = data; updateProgress(item); }
            return api('POST', '/api/' + KIND[kind] + '/install', { entryId: entry.id, requestId: item.id }).then(function () {
                stop({ state: 'complete', percent: 100 }); toast(isSkill ? 'Skill installed. It is now first in the main menu.' : kind === 'voice' ? 'Voice installed. Choose Use to give it to Jibo.' : 'Theme installed. Choose Apply to use it.', 'ok');
                delete downloads[item.id]; return loadStore(false);
            }, function (err) { stop({ state: 'failed', percent: item.data.percent, error: err.message }); throw err; });
        }
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
            if (githubUI) { githubUI.load(); }
        };
        $('#store-sign-in').onclick = function () { $('#manage-storefronts').onclick(); };
        function closeManagement() {
            $('#store-management').hidden = true;
            if (managementOpener && document.body.contains(managementOpener)) { managementOpener.focus(); }
        }
        $('#close-store-management').onclick = closeManagement;
        $('#upload-store-zip').onclick = function () { closeOptions(); $('#theme-file').click(); };
        $('#edit-main-menu').onclick = function () { closeOptions(); window.location.hash = 'menu'; };
        function startStoreRefresh() {
            if (refreshTimer !== null) { return; }
            refreshTimer = window.setInterval(function () { return refreshStore(null, true).catch(reportError); }, 60 * 60 * 1000);
        }
        var TABS = ['themes', 'skills', 'voices'];
        function selectStoreTab(category, focus) {
            $('#store-switch').className = 'store-switch' + (category === 'themes' ? '' : ' is-' + category);
            TABS.forEach(function (name) {
                var selected = name === category, tab = $('#store-tab-' + name);
                tab.setAttribute('aria-selected', String(selected)); tab.tabIndex = selected ? 0 : -1;
                $('#store-' + name).hidden = !selected;
                if (selected && focus) { tab.focus(); }
            });
        }
        TABS.forEach(function (name, i) {
            var tab = $('#store-tab-' + name);
            tab.onclick = function () { selectStoreTab(name); };
            tab.addEventListener('keydown', function (event) {
                if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].indexOf(event.key) === -1) { return; }
                event.preventDefault();
                var tabs = TABS.filter(function (t) { return !$('#store-tab-' + t).hidden; }), j = tabs.indexOf(name);
                var next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (j + (event.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length;
                selectStoreTab(tabs[next], true);
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
                if (path === '/api/themes/apply') { toast(data.live.live ? 'Theme applied.' : 'Theme saved for Jibo’s next start.', 'ok'); offerThemeVoice(body && body.id); }
                else if (path === '/api/voices/apply') { toast(data.active ? 'Voice changed. Jibo will say hi in it.' : 'Jibo’s normal voice is back.', 'ok'); }
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
                markdown($('#theme-details-readme'), data.readme || 'No README is available.', {
                    baseUrl: data.readmeUrl || (data.origin && data.origin.readmeUrl) || data.bannerUrl, images: data.images,
                    assetBase: data.revision ? '/api/' + (KIND[m.type] || 'themes') + '/asset?id=' + encodeURIComponent(data.id) + '&name=' : null
                });
                $('#theme-details').hidden = false;
                $('#theme-details [data-action="close-theme-details"]').focus();
            });
        }
        function loadThemes() {
            return Promise.all([api('GET', '/api/themes'), api('GET', '/api/skills/custom'), api('GET', '/api/voices')]).then(function (values) {
                var data = values[0]; skillInventory = values[1] && values[1].skills ? values[1] : { skills: [] };
                voiceInventory = values[2] && values[2].voices ? values[2] : { voices: [], active: null };
                $('#store-tab-voices').hidden = !voiceInventory.enabled; // voices are turned off unless BEacon says otherwise
                var activeVoice = voiceInventory.voices.filter(function (v) { return v.active; })[0];
                $('#voices-summary').textContent = 'Jibo’s voice: ' + (activeVoice ? activeVoice.manifest.name : 'Normal');
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
            Object.keys(downloads).forEach(function (id) { downloads[id].nodes = []; downloads[id].buttons = []; });
            var sources = $('#store-sources'); sources.textContent = '';
            data.sources.forEach(function (source) {
                var row = el('div', 'card store-source'); row.appendChild(el('p', null, source.name || source.url));
                row.appendChild(el('p', 'hint', source.local ? 'Voices downloaded from themes' : source.error ? source.error + ' · Showing cached entries' : source.refreshedAt ?
                    'Last refreshed ' + new Date(source.refreshedAt).toLocaleString() : 'Refresh to load themes'));
                if (!source.local) { button(row, 'Refresh', function () { return refreshStore(source.id); }); }
                button(row, 'Remove', function () { return action('DELETE', '/api/store/sources?id=' + encodeURIComponent(source.id)); });
                sources.appendChild(row);
            });
            ['theme', 'skill', 'voice'].forEach(function (category) {
            var isSkill = category === 'skill', isVoice = category === 'voice';
            var remoteEntries = data.entries.filter(function (entry) { return (entry.type || 'theme') === category; });
            var list = $(isSkill ? '#store-skill-list' : isVoice ? '#store-voice-list' : '#store-list'); list.textContent = '';
            var entries = isSkill ? [] : [{ name: isVoice ? 'Jibo' : 'None', stock: true }], seen = Object.create(null);
            (isSkill ? skillInventory.skills : isVoice ? voiceInventory.voices : inventory.themes).forEach(function (theme) {
                var matches = remoteEntries.filter(function (entry) { return (entry.name || '').toLowerCase() === theme.manifest.name.toLowerCase(); });
                var remote = theme.origin && theme.origin.url ? matches.filter(function (entry) { return entry.url === theme.origin.url; })[0] : matches[0];
                var entry = Object.assign({}, remote || { name: theme.manifest.name, manifest: theme.manifest });
                entry.local = theme; entry.type = category;
                if (!entry.developer && theme.origin) { var owner = /^https:\/\/github\.com\/([^/]+)\//.exec(theme.origin.url || ''); entry.developer = theme.origin.developer || (owner && owner[1]); entry.stars = theme.origin.stars == null ? entry.stars : theme.origin.stars; }
                if (!entry.description) {
                    entry.description = theme.readme ? theme.readme.split(/\r?\n\s*\r?\n/).filter(function (text) { return text.trim() && !/^\s*#/.test(text); })[0] : '';
                    entry.description = (entry.description || (isSkill ? 'Installed skill. Launch it from Jibo’s main menu.' : isVoice ? 'Installed voice. Choose Use to give it to Jibo.' : 'Installed theme. Choose Apply to use it.')).replace(/[*_`]/g, '');
                }
                entries.push(entry); seen[theme.manifest.name.toLowerCase()] = true;
            });
            remoteEntries.forEach(function (entry) {
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
                    var stockIcon = el('img', 'store-none-icon'); stockIcon.src = 'theme-none.svg'; stockIcon.alt = isVoice ? 'Jibo’s normal voice' : 'Stock appearance'; media.appendChild(stockIcon);
                } else if (entry.bannerUrl || (entry.local && entry.local.images['banner.png'])) {
                    var image = el('img', 'store-banner-image'); image.alt = (entry.name || 'Theme') + ' banner'; image.loading = 'lazy';
                    image.onload = function () { fallback.hidden = true; };
                    image.onerror = function () { image.hidden = true; fallback.hidden = false; };
                    image.src = entry.local && entry.local.images['banner.png'] ? '/api/' + KIND[category] + '/asset?id=' + encodeURIComponent(entry.local.id) + '&name=banner.png&t=' + entry.local.revision :
                        '/api/store/banner?id=' + encodeURIComponent(entry.id) + '&v=' + encodeURIComponent(entry.release && entry.release.tag || entry.commit || data.sources.filter(function (s) { return s.id === entry.sourceId; }).map(function (s) { return s.refreshedAt; })[0] || '');
                    media.appendChild(image);
                }
                card.appendChild(media);
                var content = el('div', 'store-card-content'); content.appendChild(el('h3', 'store-card-name', entry.name || entry.url));
                if (!entry.stock) {
                    var publisher = el('p', 'store-publisher'); publisher.appendChild(el('span', null, entry.developer || 'Local package')); publisher.appendChild(el('span', null, '★ ' + (typeof entry.stars === 'number' ? entry.stars.toLocaleString() : '—'))); content.appendChild(publisher);
                }
                content.appendChild(el('p', 'store-description', entry.stock ? (isVoice ? 'Jibo’s own, normal voice.' : 'Jibo’s stock face and menus.') : entry.description || entry.error || (isSkill ? 'A new skill for Jibo.' : isVoice ? 'A new voice for Jibo.' : 'A new look for Jibo.')));
                if (entry.compatibility && entry.compatibility.status === 'incompatible') {
                    content.appendChild(el('p', 'hint', 'Needs version ' + entry.manifest.supported + ' or newer'));
                }
                var actions = el('div', 'theme-actions'), existing = entry.local, download = downloadFor(entry);
                if (download) { attachProgress(content, download); }
                if (entry.stock) {
                    var stockActive = isVoice ? !voiceInventory.active : !inventory.active && inventory.live.live;
                    var stockApply = button(actions, stockActive ? (isVoice ? 'In use' : 'Active') : (isVoice ? 'Use' : 'Apply'), function () { return action('POST', '/api/' + (isVoice ? 'voices' : 'themes') + '/apply', { id: null }); }, stockActive);
                    stockApply.className = 'btn btn-primary store-install';
                    content.appendChild(actions); card.appendChild(content); list.appendChild(card); return;
                }
                if (existing) {
                    var active = isVoice ? existing.active : existing.active && !existing.pending && inventory.live.live;
                    var apply = !isSkill && button(actions, active ? (isVoice ? 'In use' : 'Active') : (isVoice ? 'Use' : 'Apply'), function () { return action('POST', '/api/' + KIND[category] + '/apply', { id: existing.id }); }, active || existing.compatibility.status === 'incompatible');
                    if (apply) { apply.className = 'btn btn-primary store-apply'; }
                    content.appendChild(el('p', 'hint', 'Installed v' + existing.manifest.version + (existing.pending ? ' · New version ready to apply' : '')));
                    if (existing.compatibility.status === 'unverified') { content.appendChild(el('p', 'hint', 'Compatibility unverified')); }
                    if (existing.compatibility.status === 'incompatible' && (!entry.compatibility || entry.compatibility.status !== 'incompatible')) {
                        content.appendChild(el('p', 'hint', 'Needs version ' + existing.manifest.supported + ' or newer'));
                    }
                }
                var installedRelease = existing && existing.origin && existing.origin.release;
                var different = existing && entry.manifest && (existing.manifest.version !== entry.manifest.version ||
                    (entry.release && (!installedRelease || installedRelease.tag !== entry.release.tag || installedRelease.id !== entry.release.id)));
                var remove = existing && !different;
                var install = button(actions, remove ? 'Remove' : existing ? 'Update' : 'Install', function () {
                    if (remove) {
                        if (!confirm('Remove ' + existing.manifest.name + '?')) { return; }
                        return action('DELETE', '/api/' + KIND[category] + '?id=' + encodeURIComponent(existing.id));
                    }
                    return installTheme(entry, existing, content, install);
                }, !remove && (!!entry.error || (entry.compatibility && entry.compatibility.status === 'incompatible')));
                install.className = 'btn btn-primary store-install';
                if (download && !remove) {
                    download.buttons.push({ node: install, disabled: !!entry.error || !!(entry.compatibility && entry.compatibility.status === 'incompatible') });
                    if (!download.stopped) { install.disabled = true; }
                }
                var detailButton = button(actions, 'Details', function () { return details(existing ? existing.id : entry.id); }, !existing && !!entry.error);
                detailButton.className = 'btn store-details';
                content.appendChild(actions); card.appendChild(content); list.appendChild(card);
            });
            if (!entries.length) { list.appendChild(el('p', 'hint', 'No skills are listed yet. Add a storefront or upload a ZIP.')); }
            if (isVoice && entries.length === 1) { list.appendChild(el('p', 'hint', 'No custom voices yet. Upload a voice ZIP or add a storefront that lists voices.')); }
            });
        }
        function refreshStore(id, silent) {
            if (refreshing) { return refreshing; }
            if (!silent) { toast('Refreshing storefront…'); }
            refreshing = api('GET', '/api/github/auth').then(function (auth) {
                if (!setStoreAuth(auth)) { return null; }
                return api('POST', '/api/store/refresh', silent ? { id: id || undefined, automatic: true } : id ? { id: id } : {});
            }).then(function (data) {
                if (!data) { refreshing = null; return; }
                return loadStore(false).then(function () {
                    refreshing = null; storeErrors(data);
                    if (!silent && !(data.sources || []).concat(data.entries || []).some(function (item) { return item.error; })) { toast('Storefront refreshed.', 'ok'); }
                    return data;
                });
            }, function (err) { refreshing = null; throw err; });
            refreshing = refreshing.catch(function (err) { refreshing = null; throw err; });
            return refreshing;
        }
        function loadStore(autoRefresh) {
            return api('GET', '/api/github/auth').then(function (auth) {
                if (!setStoreAuth(auth)) { return null; }
                startStoreRefresh();
                return loadThemes().then(function () { return api('GET', '/api/store'); });
            }).then(function (data) {
                if (!data) { return; }
                renderStore(data);
                if (autoRefresh !== false && (data.catalogVersion === 1 || data.sources.some(function (s) { return !s.refreshedAt && !s.error; }))) { return refreshStore(); }
                return data;
            });
        }
        function upload(file) {
            if (uploading) { return; }
            if (!/\.zip$/i.test(file.name) || file.size > 32 * 1024 * 1024) { reportError(new Error('Choose a theme, skill or voice ZIP up to 32 MB')); return; }
            uploading = true; toast('Validating and installing ZIP…');
            return request(function (signal) {
                var uploadOptions = { method: 'PUT', headers: { 'Content-Type': 'application/zip' }, body: file };
                if (signal) { uploadOptions.signal = signal; }
                return fetch('/api/store/upload?name=' + encodeURIComponent(file.name), uploadOptions).then(function (res) {
                    return res.text().then(function (text) {
                        var data;
                        try { data = JSON.parse(text); } catch (err) { throw new Error('BEacon returned an invalid upload response (HTTP ' + res.status + ')'); }
                        if (!res.ok) { throw new Error(data.error || 'Upload failed (HTTP ' + res.status + ')'); } return data;
                    });
                });
            }, 'ZIP upload')
                .then(function (data) { uploading = false; toast(data && data.type === 'skill' ? 'Skill installed. It is now first in the main menu.' : data && data.type === 'voice' ? 'Voice installed. Choose Use in Store › Voices.' : 'Theme installed. Choose Apply to test it.', 'ok'); return loadStore(false); })
                .catch(function (err) { uploading = false; reportError(err); });
        }
        function addSource() {
            return options.prompt({ title: 'Add storefront', placeholder: 'https://github.com/ZaneThePython/Astra', hint: 'A manifest URL or a single GitHub repository' })
                .then(function (value) { if (value) { return action('POST', '/api/store/sources', { url: value }); } });
        }
        // After a theme is applied: if it links its own voice that Jibo is not using yet, ask once per theme version.
        function offerThemeVoice(themeId) {
            var theme = inventory.themes.filter(function (t) { return t.id === themeId; })[0];
            if (!theme || !theme.manifest.voice || !voiceInventory.enabled) { return; }
            var url = theme.manifest.voice, using = voiceInventory.voices.filter(function (v) { return v.active && v.origin && v.origin.url === url; })[0];
            var key = 'beacon.voiceOffer.' + theme.id + '.' + theme.manifest.version;
            if (using || localStorage.getItem(key)) { return; }
            var box = $('#voice-offer'), previous = document.activeElement;
            $('#voice-offer-text').textContent = theme.manifest.name + ' comes with a matching voice for Jibo (' + url.replace('https://github.com/', '') + '). Download it and use it now? You can switch back to Jibo’s normal voice in Store › Voices.';
            function close(remember) { box.hidden = true; if (remember) { localStorage.setItem(key, '1'); } if (previous && document.body.contains(previous)) { previous.focus(); } }
            $('#voice-offer-no').onclick = function () { close(true); };
            $('#voice-offer-yes').onclick = function () {
                close(true); toast('Downloading voice…');
                return api('POST', '/api/voices/theme', { themeId: theme.id }).then(function () { toast('Voice installed. Jibo will say hi in it.', 'ok'); return loadStore(false); }).catch(function (err) { localStorage.removeItem(key); reportError(err); }); // failed (e.g. signed out): ask again next time
            };
            box.onkeydown = function (event) { if (event.key === 'Escape') { close(false); } };
            box.hidden = false; $('#voice-offer-yes').focus();
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
