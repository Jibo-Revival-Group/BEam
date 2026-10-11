/* Saved menu data drives both this editor and the robot's shared MenuView. */
(function () {
    'use strict';
    function $(id) { return document.getElementById(id); }
    function el(tag, css, text) { var n = document.createElement(tag); if (css) { n.className = css; } if (text !== undefined) { n.textContent = text; } return n; }
    function create(options) {
        function request(work) {
            return new Promise(function (resolve, reject) {
                var controller = window.AbortController ? new window.AbortController() : null, done = false;
                var timer = setTimeout(function () { if (done) { return; } done = true; if (controller) { controller.abort(); } reject(new Error('Menu request timed out. You can retry.')); }, 30000);
                Promise.resolve().then(function () { return work(controller && controller.signal); }).then(function (data) { if (!done) { done = true; clearTimeout(timer); resolve(data); } }, function (err) { if (!done) { done = true; clearTimeout(timer); reject(err); } });
            });
        }
        function api(method, path, body) { return request(function (signal) { return options.api(method, path, body, { signal: signal }); }); }
        var tree = [], skills = {}, icons = [], expanded = {}, dirty = false, drag = null, hoverTimer = null, editing = null, editOpener = null, saving = false;
        function changed() { dirty = true; $('menu-editor-status').textContent = 'Unsaved changes'; render(); }
        function find(id, list) {
            list = list || tree;
            for (var i = 0; i < list.length; i++) {
                if (list[i].id === id) { return { node: list[i], list: list, index: i }; }
                if (list[i].children) { var child = find(id, list[i].children); if (child) { return child; } }
            } return null;
        }
        function prune(list) { for (var i = list.length - 1; i >= 0; i--) { if (list[i].children) { prune(list[i].children); if (!list[i].children.length) { list.splice(i, 1); } } } }
        function iconUrl(icon) { return '/api/menu/icon?name=' + encodeURIComponent(icon); }
        function button(node) {
            var s = node.type === 'folder' ? { label: node.name, colors: node.colors, iconUrl: iconUrl(node.icon) } : skills[node.id];
            var wrapper = el('div', 'menu-editor-item'); wrapper.dataset.item = node.id;
            var b = el('button', 'menu-skill-button'); b.type = 'button'; b.dataset.drag = node.id;
            b.style.background = 'linear-gradient(155deg, ' + s.colors[0] + ', ' + s.colors[1] + ')';
            b.setAttribute('aria-label', s.label + (node.type === 'folder' ? ', folder. Double-click to expand' : '. Drag to move; use Alt and arrow keys to reorder'));
            var image = el('img'); image.src = s.iconUrl; image.alt = ''; image.draggable = false; b.appendChild(image);
            b.appendChild(el('span', 'menu-skill-label', s.label));
            b.ondblclick = function () { if (node.type === 'folder') { expanded[node.id] = !expanded[node.id]; render(); } };
            b.onkeydown = function (event) {
                if (node.type === 'folder' && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); expanded[node.id] = !expanded[node.id]; render(); return; }
                if (event.altKey && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].indexOf(event.key) >= 0) {
                    event.preventDefault(); var source = find(node.id), next = source.index + (event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1);
                    if (next >= 0 && next < source.list.length) { source.list.splice(source.index, 1); source.list.splice(next, 0, node); changed(); $('menu-editor').querySelector('[data-drag="' + node.id + '"]').focus(); }
                }
            };
            wrapper.appendChild(b);
            if (node.type === 'folder') {
                b.setAttribute('aria-expanded', String(!!expanded[node.id]));
                var edit = el('button', 'menu-folder-edit', 'Edit folder'); edit.type = 'button'; edit.onclick = function () { editFolder(node, edit); }; wrapper.appendChild(edit);
            }
            return wrapper;
        }
        function grid(list, parent) {
            var container = el('div', 'menu-editor-grid'); container.dataset.container = parent || 'root';
            list.forEach(function (node) {
                container.appendChild(button(node));
                if (node.type === 'folder' && expanded[node.id]) {
                    var box = el('section', 'menu-folder-expanded'); box.dataset.folder = node.id;
                    box.appendChild(el('h3', null, node.name)); box.appendChild(grid(node.children, node.id)); container.appendChild(box);
                }
            });
            if (parent) { container.appendChild(el('p', 'menu-drop-hint', 'Drop skills here')); }
            return container;
        }
        function render() { $('menu-editor').textContent = ''; $('menu-editor').appendChild(grid(tree, null)); }
        function load() {
            if (dirty) { return Promise.resolve(); }
            return api('GET', '/api/menu').then(function (data) {
                tree = data.tree; icons = data.icons; skills = {}; data.skills.forEach(function (s) { skills[s.id] = s; });
                dirty = false; $('menu-editor-status').textContent = ''; render();
            }).catch(options.reportError);
        }
        function ancestor(node, id) { return node.id === id || !!node.children && node.children.some(function (child) { return ancestor(child, id); }); }
        function move(id, targetId, containerId, after) {
            var source = find(id), target = targetId && find(targetId), parent = containerId && containerId !== 'root' ? find(containerId) : null;
            if (!source || targetId === id || parent && ancestor(source.node, parent.node.id) || target && ancestor(source.node, target.node.id)) { return; }
            var list = parent ? parent.node.children : tree;
            if (target && target.node.type === 'folder') { list = target.node.children; target = null; expanded[targetId] = true; }
            else if (target) { list = target.list; }
            var node = source.node; source.list.splice(source.index, 1);
            var index = target ? list.indexOf(target.node) + (after ? 1 : 0) : list.length;
            list.splice(index, 0, node); prune(tree); changed();
        }
        function merge(id, targetId) {
            var source = find(id), target = find(targetId);
            if (!source || !target || source.node.type !== 'skill' || target.node.type !== 'skill' || id === targetId) { return; }
            var a = source.node, b = target.node, list = target.list;
            source.list.splice(source.index, 1); var index = list.indexOf(b);
            var folder = { type: 'folder', id: 'folder-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8), name: 'New folder',
                colors: ['#58BCEB', '#246487'], icon: 'resources/icons/fun-stuff.png', children: [b, a] };
            list.splice(index, 1, folder); prune(tree); expanded[folder.id] = true; drag.merged = true; changed();
            options.toast('Folder created. Use Edit folder to name it and choose its icon and colors.', 'ok');
        }
        function clearHover() {
            clearTimeout(hoverTimer); hoverTimer = null;
            document.querySelectorAll('.menu-hover-target').forEach(function (n) { n.classList.remove('menu-hover-target'); });
        }
        $('menu-editor').addEventListener('pointerdown', function (event) {
            if (saving) { return; }
            var b = event.target.closest('[data-drag]'); if (!b || event.button !== 0) { return; }
            drag = { id: b.dataset.drag, x: event.clientX, y: event.clientY, pointerId: event.pointerId, active: false, ghost: null, hover: null, merged: false };
        });
        document.addEventListener('pointermove', function (event) {
            if (!drag || event.pointerId !== drag.pointerId || drag.merged) { return; }
            if (!drag.active && Math.hypot(event.clientX - drag.x, event.clientY - drag.y) < 7) { return; }
            event.preventDefault();
            if (!drag.active) {
                drag.active = true; var original = $('menu-editor').querySelector('[data-drag="' + drag.id + '"]');
                drag.ghost = original.cloneNode(true); drag.ghost.classList.add('menu-drag-ghost'); drag.ghost.setAttribute('aria-hidden', 'true'); document.body.appendChild(drag.ghost);
            }
            drag.ghost.style.left = (event.clientX + 12) + 'px'; drag.ghost.style.top = (event.clientY + 12) + 'px';
            var element = document.elementFromPoint(event.clientX, event.clientY), item = element && element.closest('[data-item]'), target = item && item.dataset.item;
            if (drag.hover !== target) {
                clearHover(); drag.hover = target;
                var a = find(drag.id), b = target && find(target);
                if (a && b && a.node.type === 'skill' && b.node.type === 'skill' && target !== drag.id) {
                    item.classList.add('menu-hover-target'); var current = drag;
                    hoverTimer = setTimeout(function () { if (drag === current && drag.hover === target) { merge(drag.id, target); clearHover(); } }, 1000);
                } else if (b && b.node.type === 'folder' && target !== drag.id) { item.classList.add('menu-hover-target'); }
            }
            // Keep drag movement usable in menus taller than the viewport.
            if (event.clientY < 100) { window.scrollBy(0, -12); } else if (event.clientY > window.innerHeight - 110) { window.scrollBy(0, 12); }
        }, { passive: false });
        function stop(event, cancelled) {
            if (!drag || event.pointerId !== drag.pointerId) { return; }
            var current = drag; clearHover();
            if (current.active && !current.merged && !cancelled) {
                var element = document.elementFromPoint(event.clientX, event.clientY), item = element && element.closest('[data-item]'), container = element && element.closest('[data-container]');
                if (container && $('menu-editor').contains(container)) { var rect = item && item.getBoundingClientRect(); move(current.id, item && item.dataset.item, container.dataset.container, !!rect && event.clientX > rect.left + rect.width / 2); }
            }
            if (current.ghost) { current.ghost.remove(); } drag = null;
        }
        document.addEventListener('pointerup', function (event) { stop(event, false); });
        document.addEventListener('pointercancel', function (event) { stop(event, true); });
        function editFolder(node, opener) {
            editing = node; editOpener = opener; $('folder-name').value = node.name; $('folder-color').value = node.colors[0]; $('folder-shadow').value = node.colors[1];
            $('folder-icon-file').value = ''; $('folder-icon').textContent = '';
            icons.concat(node.icon.indexOf('custom-') === 0 ? [node.icon] : []).forEach(function (icon) { var option = el('option', null, icon.replace('resources/icons/', '').replace(/\.png$/, '').replace(/-/g, ' ')); option.value = icon; $('folder-icon').appendChild(option); });
            $('folder-icon').value = node.icon; $('folder-details').hidden = false; $('folder-name').focus();
        }
        function closeFolder() { $('folder-details').hidden = true; editing = null; if (editOpener && document.body.contains(editOpener)) { editOpener.focus(); } }
        $('folder-cancel').onclick = closeFolder;
        $('folder-details').onclick = function (event) { if (event.target === $('folder-details')) { closeFolder(); } };
        $('folder-details').onkeydown = function (event) {
            if (event.key === 'Escape') { closeFolder(); }
            if (event.key === 'Tab') { var fields = $('folder-form').querySelectorAll('input, select, button'); var first = fields[0], last = fields[fields.length - 1]; if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); } }
        };
        $('folder-form').onsubmit = function (event) {
            event.preventDefault(); if (!editing || saving) { return; } var file = $('folder-icon-file').files[0], node = editing;
            if (!$('folder-name').value.trim()) { return; }
            saving = true;
            var upload = file ? (file.size > 2 * 1024 * 1024 ? Promise.reject(new Error('Choose a PNG up to 2 MB')) : request(function (signal) { return fetch('/api/menu/icon', { method: 'PUT', headers: { 'Content-Type': 'image/png' }, body: file, signal: signal }).then(function (res) { return res.json().then(function (data) { if (!res.ok) { throw new Error(data.error || 'Icon upload failed'); } return data.icon; }); }); })) : Promise.resolve($('folder-icon').value);
            upload.then(function (icon) { node.name = $('folder-name').value.trim(); node.colors = [$('folder-color').value, $('folder-shadow').value]; node.icon = icon; closeFolder(); changed(); }).catch(options.reportError).then(function () { saving = false; });
        };
        $('menu-save').onclick = function () {
            if (saving) { return; } saving = true; $('menu-save').disabled = true;
            return api('POST', '/api/menu', { tree: tree }).then(function (data) { tree = data.tree; skills = {}; data.skills.forEach(function (s) { skills[s.id] = s; }); dirty = false; render(); $('menu-editor-status').textContent = 'Saved. Jibo will use this layout when the main menu opens.'; options.toast('Main menu saved.', 'ok'); }).catch(options.reportError).then(function () { saving = false; $('menu-save').disabled = false; });
        };
        $('menu-reset').onclick = function () { dirty = false; return load(); };
        return { load: load };
    }
    window.BEaconMenuEditor = { create: create };
}());
