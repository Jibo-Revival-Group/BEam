/* BEacon UI — vanilla ES5-ish so it also runs in older robot-adjacent browsers. */
(function () {
    'use strict';

    var EYE_SIZE = 720;
    var AUDIO_RE = /\.(mp3|opus|ogg|oga)$/i;
    var IMAGE_RE = /\.(png|jpe?g|gif|webp|bmp)$/i;

    var state = {
        panel: 'status',
        jukebox: null,
        audio: null,
        playing: null
    };

    /* ------------------------------------------------------------ helpers */

    function $ (selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function el (tag, className, text) {
        var node = document.createElement(tag);
        if (className) { node.className = className; }
        if (text !== undefined && text !== null) { node.textContent = String(text); }
        return node;
    }

    function bytes (value) {
        if (!value) { return '0 B'; }
        var units = ['B', 'KB', 'MB', 'GB'];
        var i = 0;
        var n = value;
        while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
        return (n >= 10 || i === 0 ? Math.round(n) : n.toFixed(1)) + ' ' + units[i];
    }

    function duration (seconds) {
        if (!seconds && seconds !== 0) { return '—'; }
        var d = Math.floor(seconds / 86400);
        var h = Math.floor((seconds % 86400) / 3600);
        var m = Math.floor((seconds % 3600) / 60);
        if (d) { return d + 'd ' + h + 'h'; }
        if (h) { return h + 'h ' + m + 'm'; }
        return m + 'm ' + (seconds % 60) + 's';
    }

    function toast (message, kind) {
        var node = el('div', 'toast' + (kind ? ' is-' + kind : ''), message);
        $('#toasts').appendChild(node);
        setTimeout(function () {
            node.style.opacity = '0';
            node.style.transition = 'opacity 0.25s';
            setTimeout(function () {
                if (node.parentNode) { node.parentNode.removeChild(node); }
            }, 260);
        }, kind === 'error' ? 7000 : 3800);
    }

    function api (method, path, body) {
        var options = { method: method, headers: {} };
        if (body !== undefined) {
            options.headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify(body);
        }
        return fetch(path, options).then(function (res) {
            return res.text().then(function (text) {
                var data = null;
                try { data = text ? JSON.parse(text) : null; } catch (err) { data = { error: text }; }
                if (!res.ok) {
                    var message = (data && data.error) || ('Request failed (' + res.status + ')');
                    var error = new Error(message);
                    error.detail = data && data.detail;
                    error.status = res.status;
                    throw error;
                }
                return data;
            });
        });
    }

    function reportError (err) {
        toast(err.detail ? err.message + ' — ' + err.detail : err.message, 'error');
    }

    function setLive (up) {
        $('#live-dot').classList.toggle('is-down', !up);
    }

    /** Small prompt dialog; resolves with the entered value(s) or null. */
    function prompt2 (options) {
        return new Promise(function (resolve) {
            var modal = $('#modal');
            var input = $('#modal-input');
            var input2 = $('#modal-input-2');

            $('#modal-title').textContent = options.title;
            $('#modal-hint').textContent = options.hint || '';
            input.placeholder = options.placeholder || '';
            input.value = options.value || '';
            input2.hidden = !options.placeholder2;
            input2.placeholder = options.placeholder2 || '';
            input2.value = options.value2 || '';
            modal.hidden = false;
            setTimeout(function () { input.focus(); input.select(); }, 30);

            function close (result) {
                modal.hidden = true;
                $('#modal-ok').onclick = null;
                $('#modal-cancel').onclick = null;
                modal.onkeydown = null;
                resolve(result);
            }

            function submit () {
                var value = input.value.trim();
                if (!value) { return; }
                close(options.placeholder2 ? [value, input2.value.trim()] : value);
            }

            $('#modal-ok').onclick = submit;
            $('#modal-cancel').onclick = function () { close(null); };
            modal.onkeydown = function (event) {
                if (event.key === 'Enter') { submit(); }
                if (event.key === 'Escape') { close(null); }
            };
        });
    }

    /* ------------------------------------------------------------- status */

    function stat (label, value, isNode) {
        var card = el('div', 'stat');
        card.appendChild(el('div', 'label', label));
        var box = el('div', 'value');
        if (isNode) { box.appendChild(value); } else { box.textContent = value; }
        card.appendChild(box);
        return card;
    }

    function loadStatus () {
        return api('GET', '/api/status').then(function (data) {
            setLive(true);
            $('#brand-version').textContent = 'BEam ' + (data.host.version || '?');

            var cards = $('#status-cards');
            cards.innerHTML = '';
            cards.appendChild(stat('Host', data.host.name + ' ' + (data.host.version || '')));
            cards.appendChild(stat('Running on', data.robot ? 'Jibo (' + data.hostname + ')' : 'Development (' + data.hostname + ')'));
            cards.appendChild(stat('BEacon uptime', duration(data.uptimeSeconds)));
            cards.appendChild(stat('Custom eye', data.eye && data.eye.custom ? (data.eye.applied ? 'Yes' : 'Saved, pending restart') : 'No'));

            var links = el('div');
            (data.addresses || []).forEach(function (addr) {
                var a = el('a', null, addr.address + ':' + location.port);
                a.href = location.protocol + '//' + addr.address + ':' + location.port + '/';
                links.appendChild(a);
                links.appendChild(document.createElement('br'));
            });
            if (!links.childNodes.length) { links.textContent = 'No LAN address found'; }
            cards.appendChild(stat('Reachable at', links, true));

            var dl = $('#status-paths');
            dl.innerHTML = '';
            var rows = [
                ['Be root', data.paths.beRoot],
                ['Skills', data.paths.skillsRoot],
                ['Music', data.paths.musicDir + (data.paths.musicDirExists ? '' : '  (missing)')],
                ['Eye textures', data.paths.texturesDir],
                ['BEacon data', data.paths.dataDir],
                ['Update script', data.paths.updateScript || 'not found']
            ];
            rows.forEach(function (row) {
                dl.appendChild(el('dt', null, row[0]));
                dl.appendChild(el('dd', null, row[1]));
            });
            return data;
        }).catch(function (err) {
            setLive(false);
            throw err;
        });
    }

    /* ------------------------------------------------------------ jukebox */

    function uploadFile (albumRel, name, file, onProgress) {
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open('PUT', '/api/jukebox/file?album=' + encodeURIComponent(albumRel) +
                '&name=' + encodeURIComponent(name));
            xhr.upload.onprogress = function (event) {
                if (onProgress && event.lengthComputable) { onProgress(event.loaded / event.total); }
            };
            xhr.onload = function () {
                var data = null;
                try { data = JSON.parse(xhr.responseText); } catch (err) { /* non-JSON error */ }
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(data);
                    return;
                }
                reject(new Error((data && data.error) || ('Upload failed (' + xhr.status + ')')));
            };
            xhr.onerror = function () { reject(new Error('Upload failed: connection lost')); };
            xhr.send(file);
        });
    }

    function coverName (file) {
        var match = /\.(png|jpe?g)$/i.exec(file.name);
        var ext = match ? match[1].toLowerCase() : 'png';
        return 'cover.' + (ext === 'jpeg' ? 'jpg' : ext);
    }

    function uploadToAlbum (albumRel, files, progress) {
        var bar = progress ? progress.firstChild : null;
        var list = Array.prototype.slice.call(files);
        var accepted = list.filter(function (file) {
            return AUDIO_RE.test(file.name) || /\.(png|jpe?g)$/i.test(file.name);
        });
        var rejected = list.length - accepted.length;
        if (rejected) {
            toast(rejected + ' file(s) skipped — only .mp3/.opus/.ogg audio and .png/.jpg covers are accepted', 'error');
        }
        if (!accepted.length) { return Promise.resolve(); }

        if (progress) {
            progress.hidden = false;
            bar.style.width = '0%';
        }

        var index = 0;
        function next () {
            if (index >= accepted.length) { return Promise.resolve(); }
            var file = accepted[index++];
            var isAudio = AUDIO_RE.test(file.name);
            var name = isAudio ? file.name : coverName(file);
            return uploadFile(albumRel, name, file, function (fraction) {
                if (!bar) { return; }
                var overall = ((index - 1) + fraction) / accepted.length;
                bar.style.width = Math.round(overall * 100) + '%';
            }).then(next);
        }

        return next().then(function () {
            toast('Uploaded ' + accepted.length + ' file(s) to ' + albumRel, 'ok');
            return loadJukebox();
        }).catch(function (err) {
            reportError(err);
            return loadJukebox();
        }).then(function () {
            if (progress) { progress.hidden = true; }
        });
    }

    function playTrack (rel, button) {
        if (state.playing === rel && state.audio) {
            state.audio.pause();
            state.audio = null;
            state.playing = null;
            button.textContent = 'Play';
            return;
        }
        if (state.audio) { state.audio.pause(); }
        var audio = new Audio('/api/jukebox/audio?path=' + encodeURIComponent(rel));
        audio.play().catch(function (err) { toast('Cannot play that track: ' + err.message, 'error'); });
        audio.onended = function () {
            state.audio = null;
            state.playing = null;
            renderJukebox();
        };
        state.audio = audio;
        state.playing = rel;
        renderJukebox();
    }

    function deleteAlbum (album) {
        var message = album.tracks.length
            ? 'Delete "' + album.rel + '" and its ' + album.tracks.length +
                ' track' + (album.tracks.length === 1 ? '' : 's') + '?'
            : 'Delete the empty album "' + album.rel + '"?';
        if (!confirm(message)) { return; }
        api('DELETE', '/api/jukebox/album?path=' + encodeURIComponent(album.rel))
            .then(function () { toast('Deleted ' + album.rel, 'ok'); return loadJukebox(); })
            .catch(reportError);
    }

    function albumCard (album) {
        var card = el('div', 'album');
        var head = el('div', 'album-head');

        if (album.coverRel) {
            var img = el('img', 'album-cover');
            img.src = '/api/jukebox/cover?path=' + encodeURIComponent(album.coverRel);
            img.alt = album.title;
            head.appendChild(img);
        } else {
            head.appendChild(el('div', 'album-cover is-empty', '♪'));
        }

        var meta = el('div');
        var title = el('div', 'album-title', album.albumTitle);
        if (album.isSingle) { title.appendChild(el('span', 'badge', 'single')); }
        meta.appendChild(title);
        meta.appendChild(el('div', 'album-sub',
            (album.artist ? album.artist + ' · ' : '') +
            album.tracks.length + ' track' + (album.tracks.length === 1 ? '' : 's') +
            ' · ' + bytes(album.bytes)));
        head.appendChild(meta);
        card.appendChild(head);

        var bar = el('span');
        var progress = el('div', 'progress');
        progress.hidden = true;
        progress.appendChild(bar);
        card.appendChild(progress);

        var tracks = el('ul', 'album-tracks');
        if (!album.tracks.length) {
            var empty = el('li', 'track-empty');
            var emptyMain = el('div', 'track-main');
            emptyMain.appendChild(el('span', 'track-title', 'No tracks yet — drop audio here or use Add files'));
            empty.appendChild(emptyMain);
            var emptyActions = el('div', 'track-actions');
            var emptyDelete = el('button', 'btn btn-icon btn-danger', 'Delete album');
            emptyDelete.onclick = function () { deleteAlbum(album); };
            emptyActions.appendChild(emptyDelete);
            empty.appendChild(emptyActions);
            tracks.appendChild(empty);
        }
        album.tracks.forEach(function (track) {
            var li = el('li');
            var main = el('div', 'track-main');
            main.appendChild(el('span', 'track-title', track.title));
            main.appendChild(el('span', 'track-meta', track.format + ' · ' + bytes(track.size)));
            li.appendChild(main);

            var row = el('div', 'track-actions');
            var play = el('button', 'btn btn-icon', state.playing === track.rel ? 'Pause' : 'Play');
            play.onclick = function () { playTrack(track.rel, play); };
            row.appendChild(play);

            var rename = el('button', 'btn btn-icon', 'Rename');
            rename.onclick = function () {
                prompt2({
                    title: 'Rename track',
                    hint: 'Keep the file extension.',
                    value: track.file
                }).then(function (name) {
                    if (!name) { return null; }
                    return api('POST', '/api/jukebox/rename', { type: 'track', path: track.rel, name: name })
                        .then(function () { toast('Renamed', 'ok'); return loadJukebox(); });
                }).catch(reportError);
            };
            row.appendChild(rename);

            var del = el('button', 'btn btn-icon btn-danger', 'Delete');
            del.onclick = function () {
                if (!confirm('Delete "' + track.file + '"?')) { return; }
                api('DELETE', '/api/jukebox/track?path=' + encodeURIComponent(track.rel))
                    .then(function () { toast('Deleted ' + track.file, 'ok'); return loadJukebox(); })
                    .catch(reportError);
            };
            row.appendChild(del);
            li.appendChild(row);
            tracks.appendChild(li);
        });
        card.appendChild(tracks);

        var foot = el('div', 'album-foot');

        var addFiles = el('button', 'btn btn-icon', 'Add files');
        var picker = el('input');
        picker.type = 'file';
        picker.multiple = true;
        picker.accept = '.mp3,.opus,.ogg,.oga,.png,.jpg,.jpeg';
        picker.hidden = true;
        picker.onchange = function () {
            if (picker.files.length) { uploadToAlbum(album.rel, picker.files, progress); }
        };
        addFiles.onclick = function () { picker.click(); };
        foot.appendChild(addFiles);
        foot.appendChild(picker);

        var setCover = el('button', 'btn btn-icon', album.coverRel ? 'Replace cover' : 'Add cover');
        var coverPicker = el('input');
        coverPicker.type = 'file';
        coverPicker.accept = '.png,.jpg,.jpeg';
        coverPicker.hidden = true;
        coverPicker.onchange = function () {
            if (coverPicker.files.length) { uploadToAlbum(album.rel, coverPicker.files, progress); }
        };
        setCover.onclick = function () { coverPicker.click(); };
        foot.appendChild(setCover);
        foot.appendChild(coverPicker);

        var renameAlbum = el('button', 'btn btn-icon', 'Rename');
        renameAlbum.onclick = function () {
            prompt2({
                title: 'Rename album folder',
                hint: 'Underscores show up as spaces on the robot.',
                value: album.rel.split('/').pop()
            }).then(function (name) {
                if (!name) { return null; }
                return api('POST', '/api/jukebox/rename', { type: 'album', path: album.rel, name: name })
                    .then(function () { toast('Renamed', 'ok'); return loadJukebox(); });
            }).catch(reportError);
        };
        foot.appendChild(renameAlbum);

        var delAlbum = el('button', 'btn btn-icon btn-danger', 'Delete album');
        delAlbum.onclick = function () { deleteAlbum(album); };
        foot.appendChild(delAlbum);
        card.appendChild(foot);

        card.addEventListener('dragover', function (event) {
            event.preventDefault();
            card.classList.add('is-drop');
        });
        card.addEventListener('dragleave', function () { card.classList.remove('is-drop'); });
        card.addEventListener('drop', function (event) {
            event.preventDefault();
            card.classList.remove('is-drop');
            if (event.dataTransfer.files.length) {
                uploadToAlbum(album.rel, event.dataTransfer.files, progress);
            }
        });

        return card;
    }

    function renderJukebox () {
        var data = state.jukebox;
        if (!data) { return; }

        $('#jukebox-dir').textContent = data.albums.length
            ? data.albums.length + ' album(s) in ' + data.dir
            : 'Library folder: ' + data.dir;

        var list = $('#jukebox-albums');
        list.innerHTML = '';
        if (data.error) {
            var problem = el('div', 'empty', data.error);
            list.appendChild(problem);
        } else if (!data.albums.length) {
            list.appendChild(el('div', 'empty',
                'No albums yet. Create one with "New album", then drop .mp3/.opus files onto it.'));
        } else {
            data.albums.forEach(function (album) { list.appendChild(albumCard(album)); });
        }

        var skipped = $('#jukebox-skipped');
        skipped.innerHTML = '';
        if (data.skipped && data.skipped.length) {
            var card = el('div', 'card');
            card.appendChild(el('h3', null, 'Folders the jukebox ignores'));
            var ul = el('ul', 'list');
            data.skipped.forEach(function (line) { ul.appendChild(el('li', null, line)); });
            card.appendChild(ul);
            skipped.appendChild(card);
        }
    }

    function loadJukebox () {
        return api('GET', '/api/jukebox').then(function (data) {
            state.jukebox = data;
            renderJukebox();
            return data;
        });
    }

    function newAlbum () {
        prompt2({
            title: 'New album',
            hint: 'An artist is optional — with one you get music/Artist/Album/.',
            placeholder: 'Album name',
            placeholder2: 'Artist (optional)'
        }).then(function (values) {
            if (!values) { return null; }
            return api('POST', '/api/jukebox/album', { album: values[0], artist: values[1] })
                .then(function (result) {
                    toast('Created ' + result.rel, 'ok');
                    return loadJukebox();
                });
        }).catch(reportError);
    }

    /* ---------------------------------------------------------------- eye */

    /** Centre-crop to a square and redraw at the texture size the face wants. */
    function toEyePng (file) {
        return new Promise(function (resolve, reject) {
            var url = URL.createObjectURL(file);
            var image = new Image();
            image.onload = function () {
                URL.revokeObjectURL(url);
                var side = Math.min(image.width, image.height);
                var canvas = document.createElement('canvas');
                canvas.width = EYE_SIZE;
                canvas.height = EYE_SIZE;
                var ctx = canvas.getContext('2d');
                ctx.drawImage(
                    image,
                    (image.width - side) / 2, (image.height - side) / 2, side, side,
                    0, 0, EYE_SIZE, EYE_SIZE
                );
                canvas.toBlob(function (blob) {
                    if (blob) { resolve(blob); } else { reject(new Error('Could not convert that image')); }
                }, 'image/png');
            };
            image.onerror = function () {
                URL.revokeObjectURL(url);
                reject(new Error('That file could not be read as an image'));
            };
            image.src = url;
        });
    }

    function applyEye (file) {
        if (!IMAGE_RE.test(file.name) && file.type.indexOf('image/') !== 0) {
            toast('Pick an image file', 'error');
            return;
        }
        toast('Converting ' + file.name + '…');
        toEyePng(file).then(function (blob) {
            return fetch('/api/eye?name=' + encodeURIComponent(file.name), {
                method: 'PUT',
                headers: { 'Content-Type': 'image/png' },
                body: blob
            }).then(function (res) {
                return res.json().then(function (data) {
                    if (!res.ok) { throw new Error(data.error || 'Upload failed'); }
                    return data;
                });
            });
        }).then(function () {
            toast('New eye saved. Restart Be to see it on the face.', 'ok');
            return loadEye();
        }).catch(reportError);
    }

    function loadEye () {
        return api('GET', '/api/eye').then(function (data) {
            var stamp = '?t=' + Date.now();
            $('#eye-current').src = '/api/eye/current.png' + stamp;
            $('#eye-original').src = '/api/eye/original.png' + stamp;

            var list = $('#eye-textures');
            list.innerHTML = '';
            data.textures.forEach(function (texture) {
                var li = el('li');
                var mark = texture.matchesCustom ? 'custom' : (texture.matchesOriginal ? 'original' : 'unknown');
                li.appendChild(el('span', 'chip' + (texture.matchesCustom ? ' is-role' : ' is-on'), mark));
                li.appendChild(el('span', null, texture.name));
                if (!texture.writable) { li.appendChild(el('span', 'chip', 'read-only')); }
                list.appendChild(li);
            });

            if (data.pending) {
                list.appendChild(el('li', null,
                    'A custom eye is saved but not on the textures yet — restart Be.'));
            }
            return data;
        });
    }

    /* ------------------------------------------------------------- skills */

    function loadSkills () {
        return api('GET', '/api/skills').then(function (data) {
            $('#skills-summary').textContent = data.counts.registered + ' registered with ' +
                data.host.name + ', ' + data.counts.onDisk + ' on disk under ' + data.skillsRoot;

            var list = $('#skills-list');
            list.innerHTML = '';
            data.skills.forEach(function (skill) {
                var card = el('div', 'skill' + (skill.registered ? '' : ' is-off'));
                var name = el('div', 'skill-name', skill.name);
                if (skill.version) { name.appendChild(el('span', 'chip', 'v' + skill.version)); }
                card.appendChild(name);
                if (skill.description) { card.appendChild(el('div', 'skill-desc', skill.description)); }

                var chips = el('div', 'chips');
                chips.appendChild(el('span', 'chip' + (skill.registered ? ' is-on' : ''),
                    skill.registered ? 'loaded by Be' : 'not registered'));
                if (!skill.installed) { chips.appendChild(el('span', 'chip', 'missing on disk')); }
                if (skill.hasLaunchRule) { chips.appendChild(el('span', 'chip', 'voice')); }
                (skill.roles || []).forEach(function (role) {
                    chips.appendChild(el('span', 'chip is-role', role));
                });
                card.appendChild(chips);
                list.appendChild(card);
            });
            return data;
        });
    }

    function installSkill () {
        api('POST', '/api/skills/install', {})
            .then(function () { toast('Installed', 'ok'); })
            .catch(function (err) { toast(err.detail ? err.message + ' ' + err.detail : err.message); });
    }

    /* ------------------------------------------------------------- server */

    function loadServer () {
        return api('GET', '/api/server').then(function (data) {
            var dl = $('#server-current');
            dl.innerHTML = '';
            var rows = [['Config', data.configPath]];
            if (data.current) {
                rows.push(['Hub', (data.current.hostname || '—') + ':' + (data.current.port || '—')]);
                rows.push(['Entrypoint', data.current.entrypoint || '—']);
            }
            if (data.error) { rows.push(['Status', data.error]); }
            rows.forEach(function (row) {
                dl.appendChild(el('dt', null, row[0]));
                dl.appendChild(el('dd', null, row[1]));
            });

            $('#server-note').textContent = data.note;
            var options = $('#server-options');
            options.innerHTML = '';
            data.options.forEach(function (option) {
                var current = data.current && data.current.hostname === option.hostname;
                var row = el('div', 'option' + (current ? ' is-current' : ''));
                row.appendChild(el('strong', null, option.hostname));
                row.appendChild(el('span', 'hint', option.label));
                if (current) { row.appendChild(el('span', 'chip is-role', 'in use')); }
                options.appendChild(row);
            });
            return data;
        });
    }

    /* ------------------------------------------------------------- update */

    function appendLog (text) {
        var log = $('#update-log');
        log.textContent = text;
        log.scrollTop = log.scrollHeight;
    }

    function runUpdate () {
        if (!confirm('Update BEam now? Jibo will restart and your jukebox music is kept.')) { return; }
        var button = $('[data-action="run-update"]');
        button.disabled = true;
        appendLog('Starting update…\n');

        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/beam/update');
        xhr.onprogress = function () { appendLog(xhr.responseText); };
        xhr.onload = function () {
            appendLog(xhr.responseText + '\n');
            button.disabled = false;
            waitForBeacon();
        };
        xhr.onerror = function () {
            appendLog(xhr.responseText + '\n\nConnection closed — Be is probably restarting.\n');
            button.disabled = false;
            waitForBeacon();
        };
        xhr.send();
    }

    function waitForBeacon () {
        setLive(false);
        var attempts = 0;
        var timer = setInterval(function () {
            attempts++;
            api('GET', '/api/status').then(function () {
                clearInterval(timer);
                setLive(true);
                toast('BEacon is back', 'ok');
                refreshPanel(state.panel);
            }).catch(function () {
                if (attempts > 60) {
                    clearInterval(timer);
                    toast('BEacon did not come back — reload the page once Jibo is up', 'error');
                }
            });
        }, 3000);
    }

    function restartBe () {
        if (!confirm('Restart Be? The face will go dark for a few seconds.')) { return; }
        api('POST', '/api/beam/restart')
            .then(function () {
                toast('Restarting Be…', 'ok');
                waitForBeacon();
            })
            .catch(reportError);
    }

    /* --------------------------------------------------------------- wire */

    var loaders = {
        status: loadStatus,
        jukebox: loadJukebox,
        eye: loadEye,
        skills: loadSkills,
        server: loadServer,
        update: function () { return Promise.resolve(); }
    };

    function refreshPanel (name) {
        var loader = loaders[name];
        if (!loader) { return; }
        loader().catch(reportError);
    }

    function showPanel (name) {
        state.panel = name;
        var tabs = document.querySelectorAll('.tab');
        for (var i = 0; i < tabs.length; i++) {
            tabs[i].classList.toggle('is-active', tabs[i].getAttribute('data-panel') === name);
        }
        var panels = document.querySelectorAll('.panel');
        for (var p = 0; p < panels.length; p++) {
            panels[p].classList.toggle('is-active', panels[p].id === 'panel-' + name);
        }
        if (location.hash.slice(1) !== name) { location.hash = name; }
        refreshPanel(name);
    }

    var actions = {
        'refresh-status': loadStatus,
        'refresh-jukebox': loadJukebox,
        'refresh-eye': loadEye,
        'refresh-skills': loadSkills,
        'refresh-server': loadServer,
        'new-album': newAlbum,
        'install-skill': installSkill,
        'pick-eye': function () { $('#eye-file').click(); },
        'revert-eye': function () {
            if (!confirm('Put the original Jibo eye back?')) { return; }
            api('POST', '/api/eye/revert')
                .then(function () {
                    toast('Original eye restored. Restart Be to see it.', 'ok');
                    return loadEye();
                })
                .catch(reportError);
        },
        'restart-be': restartBe,
        'run-update': runUpdate
    };

    document.addEventListener('click', function (event) {
        var target = event.target.closest ? event.target.closest('[data-action]') : null;
        if (!target) { return; }
        var action = actions[target.getAttribute('data-action')];
        if (!action) { return; }
        var result = action();
        if (result && result.catch) { result.catch(reportError); }
    });

    $('#tabs').addEventListener('click', function (event) {
        var tab = event.target.closest('.tab');
        if (tab) { showPanel(tab.getAttribute('data-panel')); }
    });

    $('#eye-file').addEventListener('change', function (event) {
        if (event.target.files.length) { applyEye(event.target.files[0]); }
        event.target.value = '';
    });

    var drop = $('#eye-drop');
    drop.addEventListener('dragover', function (event) {
        event.preventDefault();
        drop.classList.add('is-drop');
    });
    drop.addEventListener('dragleave', function () { drop.classList.remove('is-drop'); });
    drop.addEventListener('drop', function (event) {
        event.preventDefault();
        drop.classList.remove('is-drop');
        if (event.dataTransfer.files.length) { applyEye(event.dataTransfer.files[0]); }
    });

    // Dropping a file anywhere else should not navigate away from the page.
    window.addEventListener('dragover', function (event) { event.preventDefault(); });
    window.addEventListener('drop', function (event) { event.preventDefault(); });

    window.addEventListener('hashchange', function () {
        var name = location.hash.slice(1);
        if (loaders[name] && name !== state.panel) { showPanel(name); }
    });

    setInterval(function () {
        api('GET', '/api/status').then(function () { setLive(true); }).catch(function () { setLive(false); });
    }, 15000);

    showPanel(loaders[location.hash.slice(1)] ? location.hash.slice(1) : 'status');
}());
