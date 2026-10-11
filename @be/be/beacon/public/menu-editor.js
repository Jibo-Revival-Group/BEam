/* Saved menu data drives both this editor and the robot's shared MenuView. */
(function () {
    'use strict';
    function $(id) { return document.getElementById(id); }
    function el(tag, css, text) { var n = document.createElement(tag); if (css) { n.className = css; } if (text !== undefined) { n.textContent = text; } return n; }
    function resizeIcon(file) {
        return new Promise(function (resolve, reject) {
            var url = URL.createObjectURL(file), image = new Image(), done = false;
            var timer = setTimeout(function () { finish(new Error('Folder icon decoding timed out. Try another PNG.')); }, 15000);
            function finish(err, blob) {
                if (done) { return; } done = true; clearTimeout(timer); URL.revokeObjectURL(url);
                image.onload = image.onerror = null;
                if (err) { reject(err); } else { resolve(blob); }
            }
            image.onerror = function () { finish(new Error('Could not read folder icon. Choose a valid PNG.')); };
            image.onload = function () {
                try {
                    var width = image.naturalWidth, height = image.naturalHeight;
                    if (!width || !height) { throw new Error('Folder icon has invalid dimensions'); }
                    var scale = Math.min(1, 330 / width, 330 / height);
                    if (scale === 1) { finish(null, file); return; }
                    var canvas = document.createElement('canvas');
                    canvas.width = Math.max(1, Math.round(width * scale)); canvas.height = Math.max(1, Math.round(height * scale));
                    var context = canvas.getContext('2d');
                    if (!context) { throw new Error('Could not resize folder icon'); }
                    context.imageSmoothingEnabled = true; context.imageSmoothingQuality = 'high';
                    context.drawImage(image, 0, 0, canvas.width, canvas.height);
                    canvas.toBlob(function (blob) { finish(blob ? null : new Error('Could not encode folder icon'), blob); }, 'image/png');
                } catch (err) { finish(err); }
            };
            image.src = url;
        });
    }
    function create(options) {
        function request(work) {
            return new Promise(function (resolve, reject) {
                var controller = window.AbortController ? new window.AbortController() : null, done = false;
                var timer = setTimeout(function () { if (done) { return; } done = true; if (controller) { controller.abort(); } reject(new Error('Menu request timed out. You can retry.')); }, 30000);
                Promise.resolve().then(function () { return work(controller && controller.signal); }).then(function (data) { if (!done) { done = true; clearTimeout(timer); resolve(data); } }, function (err) { if (!done) { done = true; clearTimeout(timer); reject(err); } });
            });
        }
        function api(method, path, body) { return request(function (signal) { return options.api(method, path, body, { signal: signal }); }); }
        var tree = [], skills = {}, icons = [], expanded = {}, dirty = false, drag = null, hoverTimer = null, previewTimer = null, editing = null, editOpener = null, saving = false;
        var autosaveTimer = null, changeVersion = 0;
        function reducedMotion() { return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
        function cancelAutosave() { clearTimeout(autosaveTimer); autosaveTimer = null; }
        function autosave() {
            autosaveTimer = null;
            if (!dirty) { return; }
            // Finish the gesture or folder dialog before saving its final layout.
            if (saving || drag || editing) { autosaveTimer = setTimeout(autosave, 500); return; }
            saveMenu(true);
        }
        function changed() {
            dirty = true; changeVersion++; cancelAutosave();
            $('menu-editor-status').textContent = 'Unsaved changes. Saving automatically in 5 seconds…';
            autosaveTimer = setTimeout(autosave, 5000); render();
        }
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
            if (drag && drag.active && !drag.merged && node.id === drag.id) { wrapper.classList.add('is-dragging'); }
            if (drag && drag.drop && drag.drop.target === node.id && node.type === 'folder') {
                wrapper.classList.add(drag.drop.inside ? 'menu-hover-target' : drag.drop.after ? 'menu-insert-after' : 'menu-insert-before');
            }
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
                var edit = el('button', 'menu-folder-edit'); edit.type = 'button'; edit.title = 'Edit folder'; edit.setAttribute('aria-label', 'Edit folder ' + node.name);
                var folderIcon = el('span', 'menu-folder-edit-icon'); folderIcon.setAttribute('aria-hidden', 'true'); edit.appendChild(folderIcon);
                edit.onclick = function () { editFolder(node, edit); }; wrapper.appendChild(edit);
                if (expanded[node.id]) {
                    wrapper.classList.add('is-expanded');
                    var contents = el('div', 'menu-folder-expanded'); contents.dataset.folder = node.id;
                    contents.appendChild(grid(node.children, node.id)); wrapper.appendChild(contents);
                }
            }
            return wrapper;
        }
        function grid(list, parent) {
            var container = el('div', parent ? 'menu-folder-contents' : 'menu-editor-grid'); container.dataset.container = parent || 'root';
            if (parent) { container.setAttribute('aria-label', 'Folder contents. Drop skills here'); }
            list.forEach(function (node) { container.appendChild(button(node)); });
            return container;
        }
        function positionFolders() {
            var container = $('menu-editor').querySelector('.menu-editor-grid');
            if (!container || !container.offsetWidth) { return; }
            // Remove old spans before measuring, so a narrower viewport cannot create implicit columns.
            Array.prototype.forEach.call(container.children, function (item) { if (item.classList.contains('is-expanded')) { item.style.gridColumn = 'span 1'; } });
            var tracks = window.getComputedStyle(container).gridTemplateColumns.match(/\S+/g) || [], columns = tracks.length || 1;
            function layout(list, available) {
                Array.prototype.forEach.call(list.children, function (item) {
                    if (!item.classList.contains('is-expanded')) { return; }
                    var contents = item.querySelector('.menu-folder-contents');
                    var span = Math.min(available, Math.max(2, contents.children.length + 1));
                    item.style.gridColumn = 'span ' + span; item.style.setProperty('--folder-columns', span);
                    layout(contents, span);
                });
            }
            layout(container, columns);
        }
        window.addEventListener('resize', positionFolders);
        function render(preview) {
            var editor = $('menu-editor'), previous = {}, nextRects = {};
            Array.prototype.forEach.call(editor.querySelectorAll('[data-item]'), function (item) { previous[item.dataset.item] = item.getBoundingClientRect(); });
            editor.textContent = ''; editor.appendChild(grid(preview || tree, null));
            positionFolders();
            if (reducedMotion()) { return; }
            Array.prototype.forEach.call(editor.querySelectorAll('[data-item]'), function (item) { nextRects[item.dataset.item] = item.getBoundingClientRect(); });
            // Start each newly laid-out item at its previous visible position, then slide into its slot.
            Array.prototype.forEach.call(editor.querySelectorAll('[data-item]'), function (item) {
                var old = previous[item.dataset.item]; if (!old || !item.animate) { return; }
                var next = nextRects[item.dataset.item], x = old.left - next.left, y = old.top - next.top;
                var parent = item.parentNode.closest('[data-item]');
                if (parent && previous[parent.dataset.item]) { x -= previous[parent.dataset.item].left - nextRects[parent.dataset.item].left; y -= previous[parent.dataset.item].top - nextRects[parent.dataset.item].top; }
                var growth = Math.max(0, next.width - old.width);
                if (Math.abs(x) + Math.abs(y) + growth < 1) { return; }
                item.animate([{ transform: 'translate(' + x + 'px,' + y + 'px)', clipPath: 'inset(0 ' + growth + 'px 0 0)' }, { transform: 'translate(0,0)', clipPath: 'inset(0)' }],
                    { duration: 220, easing: 'cubic-bezier(.2,.8,.2,1)' });
            });
        }
        function load() {
            if (dirty) { positionFolders(); return Promise.resolve(); }
            return api('GET', '/api/menu').then(function (data) {
                tree = data.tree; icons = data.icons; skills = {}; data.skills.forEach(function (s) { skills[s.id] = s; });
                dirty = false; $('menu-editor-status').textContent = ''; render();
            }).catch(options.reportError);
        }
        function ancestor(node, id) { return node.id === id || !!node.children && node.children.some(function (child) { return ancestor(child, id); }); }
        function relocate(listTree, id, targetId, containerId, after, inside) {
            var source = find(id, listTree), target = targetId && find(targetId, listTree), parent = containerId && containerId !== 'root' ? find(containerId, listTree) : null;
            if (!source || targetId === id || parent && ancestor(source.node, parent.node.id) || target && ancestor(source.node, target.node.id)) { return false; }
            var list = parent ? parent.node.children : listTree;
            if (target && target.node.type === 'folder' && inside) { list = target.node.children; target = null; }
            else if (target) { list = target.list; }
            var node = source.node; source.list.splice(source.index, 1);
            var index = target ? list.indexOf(target.node) + (after ? 1 : 0) : list.length;
            list.splice(index, 0, node); return true;
        }
        function move(id, targetId, containerId, after, inside) {
            if (!relocate(tree, id, targetId, containerId, after, inside)) { return false; }
            var target = targetId && find(targetId);
            if (target && target.node.type === 'folder' && inside) { expanded[targetId] = true; }
            prune(tree); changed(); return true;
        }
        function previewDrop(current) {
            if (drag !== current || !current.drop || current.merged) { return; }
            var drop = current.drop, preview = JSON.parse(JSON.stringify(tree));
            if (!relocate(preview, current.id, drop.target, drop.container, drop.after, drop.inside)) { render(); return; }
            var target = drop.target && find(drop.target);
            if (target && target.node.type === 'folder' && drop.inside) { expanded[drop.target] = true; }
            render(preview);
        }
        function merge(id, targetId) {
            var source = find(id), target = find(targetId);
            if (!source || !target || source.node.type !== 'skill' || target.node.type !== 'skill' || id === targetId) { return; }
            var a = source.node, b = target.node, list = target.list;
            source.list.splice(source.index, 1); var index = list.indexOf(b);
            var folder = { type: 'folder', id: 'folder-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8), name: 'New folder',
                colors: ['#58BCEB', '#246487'], icon: 'resources/icons/fun-stuff.png', children: [b, a] };
            list.splice(index, 1, folder); prune(tree); expanded[folder.id] = true; drag.merged = true; changed();
            options.toast('Folder created. Click its folder icon to change its name, icon and colors.', 'ok');
        }
        function clearHover() {
            clearTimeout(hoverTimer); hoverTimer = null;
            clearTimeout(previewTimer); previewTimer = null;
            document.querySelectorAll('.menu-hover-target, .menu-insert-before, .menu-insert-after').forEach(function (n) { n.classList.remove('menu-hover-target', 'menu-insert-before', 'menu-insert-after'); });
        }
        $('menu-editor').addEventListener('pointerdown', function (event) {
            if (saving) { return; }
            var b = event.target.closest('[data-drag]'); if (!b || event.button !== 0) { return; }
            var rect = b.getBoundingClientRect();
            drag = { id: b.dataset.drag, x: event.clientX, y: event.clientY, gripX: event.clientX - rect.left, gripY: event.clientY - rect.top,
                pointerId: event.pointerId, active: false, ghost: null, hover: null, merged: false, drop: null, lastX: null, lastY: null };
        });
        document.addEventListener('pointermove', function (event) {
            if (!drag || event.pointerId !== drag.pointerId || drag.merged) { return; }
            if (!drag.active && Math.hypot(event.clientX - drag.x, event.clientY - drag.y) < 7) { return; }
            event.preventDefault();
            if (!drag.active) {
                drag.active = true; var original = $('menu-editor').querySelector('[data-drag="' + drag.id + '"]');
                drag.ghost = original.cloneNode(true); drag.ghost.classList.add('menu-drag-ghost'); drag.ghost.setAttribute('aria-hidden', 'true'); document.body.appendChild(drag.ghost);
                var originalRect = original.getBoundingClientRect(); drag.ghost.style.width = originalRect.width + 'px'; drag.ghost.style.height = originalRect.height + 'px';
                drag.ghost.removeAttribute('data-drag'); drag.ghost.tabIndex = -1;
                original.parentNode.classList.add('is-dragging');
            }
            drag.ghost.style.left = (event.clientX - drag.gripX) + 'px'; drag.ghost.style.top = (event.clientY - drag.gripY) + 'px';
            // Ignore stationary events caused by reflow underneath the pointer.
            if (drag.lastX !== null && Math.hypot(event.clientX - drag.lastX, event.clientY - drag.lastY) < 4) { return; }
            drag.lastX = event.clientX; drag.lastY = event.clientY;
            var element = document.elementFromPoint(event.clientX, event.clientY), item = element && element.closest('[data-item]'), target = item && item.dataset.item;
            var container = element && element.closest('[data-container]');
            if (item && item.parentNode !== container) { item = null; target = null; }
            var rect = item && item.querySelector('[data-drag]').getBoundingClientRect();
            // Keep the current slot when the pointer reaches the dragged item's placeholder.
            if (target === drag.id) { return; }
            var inside = !!rect && event.clientX > rect.left + rect.width * .25 && event.clientX < rect.left + rect.width * .75;
            if (item && item.classList.contains('is-expanded') && event.clientX > rect.right + 4) { inside = true; }
            var drop = container && $('menu-editor').contains(container) ? { target: target, container: container.dataset.container, after: !!rect && event.clientX > rect.left + rect.width / 2, inside: inside } : null;
            var key = drop && [drop.target, drop.container, drop.after, drop.inside].join(':');
            if (drag.dropKey !== key) {
                clearHover(); drag.hover = target;
                drag.drop = drop; drag.dropKey = key;
                var a = find(drag.id), b = target && find(target);
                if (a && b && a.node.type === 'skill' && b.node.type === 'skill' && target !== drag.id) {
                    item.classList.add('menu-hover-target'); var current = drag;
                    hoverTimer = setTimeout(function () { if (drag === current && drag.hover === target) { merge(drag.id, target); clearHover(); } }, 1000);
                } else if (b && b.node.type === 'folder' && target !== drag.id) { item.classList.add(inside ? 'menu-hover-target' : drop.after ? 'menu-insert-after' : 'menu-insert-before'); }
                if (drop) { var previewDrag = drag; previewTimer = setTimeout(function () { previewDrop(previewDrag); }, 140); }
                else { render(); }
            }
            // Keep drag movement usable in menus taller than the viewport.
            if (event.clientY < 100) { window.scrollBy(0, -12); } else if (event.clientY > window.innerHeight - 110) { window.scrollBy(0, 12); }
        }, { passive: false });
        function stop(event, cancelled) {
            if (!drag || event.pointerId !== drag.pointerId) { return; }
            var current = drag; clearHover();
            drag = null;
            if (current.active && !current.merged && !cancelled) {
                if (!current.drop || !move(current.id, current.drop.target, current.drop.container, current.drop.after, current.drop.inside)) { render(); }
            } else if (current.active) { render(); }
            if (current.ghost) {
                var target = $('menu-editor').querySelector('[data-drag="' + current.id + '"]'), rect = target && target.getBoundingClientRect();
                if (rect && !reducedMotion() && current.ghost.animate) {
                    var from = current.ghost.getBoundingClientRect();
                    current.ghost.animate([{ transform: 'translate(0,0) rotate(3deg)', opacity: .9 },
                        { transform: 'translate(' + (rect.left - from.left) + 'px,' + (rect.top - from.top) + 'px) rotate(0)', opacity: 0 }],
                        { duration: 180, easing: 'ease-out', fill: 'forwards' });
                    setTimeout(function () { current.ghost.remove(); }, 180);
                } else { current.ghost.remove(); }
            }
        }
        document.addEventListener('pointerup', function (event) { stop(event, false); });
        document.addEventListener('pointercancel', function (event) { stop(event, true); });
        document.addEventListener('keydown', function (event) { if (drag && event.key === 'Escape') { stop({ pointerId: drag.pointerId }, true); } });
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
            var upload = file ? (file.size > 2 * 1024 * 1024 ? Promise.reject(new Error('Choose a PNG up to 2 MB')) : request(function (signal) { return resizeIcon(file).then(function (blob) {
                if (signal && signal.aborted) { throw new Error('Folder icon upload cancelled'); }
                return fetch('/api/menu/icon', { method: 'PUT', headers: { 'Content-Type': 'image/png' }, body: blob, signal: signal }).then(function (res) { return res.json().then(function (data) { if (!res.ok) { throw new Error(data.error || 'Icon upload failed'); } return data.icon; }); });
            }); })) : Promise.resolve($('folder-icon').value);
            upload.then(function (icon) { node.name = $('folder-name').value.trim(); node.colors = [$('folder-color').value, $('folder-shadow').value]; node.icon = icon; closeFolder(); changed(); }).catch(options.reportError).then(function () { saving = false; });
        };
        function saveMenu(automatic) {
            if (saving || drag) { return; } cancelAutosave(); saving = true; $('menu-save').disabled = true;
            var version = changeVersion, snapshot = JSON.parse(JSON.stringify(tree));
            $('menu-editor-status').textContent = automatic ? 'Saving automatically…' : 'Saving…';
            return api('POST', '/api/menu', { tree: snapshot }).then(function (data) {
                skills = {}; data.skills.forEach(function (s) { skills[s.id] = s; });
                if (version === changeVersion) {
                    tree = data.tree; dirty = false; render();
                    $('menu-editor-status').textContent = (automatic ? 'Saved automatically.' : 'Saved.') + ' Jibo will use this layout when the main menu opens.';
                }
                if (!automatic) { options.toast('Main menu saved.', 'ok'); }
            }).catch(function (err) {
                dirty = true; $('menu-editor-status').textContent = 'Save failed. Changes are still unsaved; use Save to retry.';
                options.reportError(err);
            }).then(function () { saving = false; $('menu-save').disabled = false; });
        }
        $('menu-save').onclick = function () { return saveMenu(false); };
        $('menu-reset').onclick = function () { if (saving || drag) { return; } cancelAutosave(); changeVersion++; dirty = false; return load(); };
        return { load: load };
    }
    window.BEaconMenuEditor = { create: create };
}());
