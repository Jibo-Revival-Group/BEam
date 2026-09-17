/* BEacon UI — vanilla ES5-ish so it also runs in older robot-adjacent browsers. */
(function () {
    'use strict';

    var EYE_SIZE = 720;
    var PEOPLE_PHOTO_SIZE = 384;
    var SCREEN_W = 1280;
    var SCREEN_H = 720;
    var SCREEN_MOVE_MS = 16;
    var SCREEN_FLICK_DIST = 120;
    var SCREEN_FLICK_MS = 900;
    var AUDIO_RE = /\.(mp3|opus|ogg|oga)$/i;
    var IMAGE_RE = /\.(png|jpe?g|gif|webp|bmp)$/i;

    var state = {
        panel: 'status',
        jukebox: null,
        photos: null,
        location: {
            current: null,
            detected: null,
            source: null
        },
        units: {
            temperature: 'fahrenheit'
        },
        audio: null,
        playing: null,
        screen: {
            live: false,
            pulling: false,
            timer: null,
            objectUrl: null,
            pointer: null,
            pointerStart: null,
            lastMove: 0,
            queue: [],
            flushTimer: null
        }
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
            var versionEl = $('#brand-version');
            if (versionEl) { versionEl.textContent = 'BEam ' + (data.host.version || '?'); }

            var cards = $('#status-cards');
            cards.innerHTML = '';
            cards.appendChild(stat('Version', data.host.name + ' ' + (data.host.version || '')));
            cards.appendChild(stat('This Jibo', data.robot ? data.hostname : 'Development (' + data.hostname + ')'));
            cards.appendChild(stat('Uptime', duration(data.uptimeSeconds)));
            cards.appendChild(stat('Custom eye', data.eye && data.eye.custom
                ? (data.eye.applied ? 'On' : 'Saved — tap Apply')
                : 'Off'));

            var links = el('div');
            (data.addresses || []).forEach(function (addr) {
                var a = el('a', null, addr.address + ':' + location.port);
                a.href = location.protocol + '//' + addr.address + ':' + location.port + '/';
                links.appendChild(a);
                links.appendChild(document.createElement('br'));
            });
            if (!links.childNodes.length) { links.textContent = 'No address found on this network'; }
            cards.appendChild(stat('Open BEacon at', links, true));

            var dl = $('#status-paths');
            dl.innerHTML = '';
            var rows = [
                ['App folder', data.paths.beRoot],
                ['Skills folder', data.paths.skillsRoot],
                ['Music folder', data.paths.musicDir + (data.paths.musicDirExists ? '' : '  (missing)')],
                ['Photos folder', data.paths.photosDir + (data.paths.photosDirExists ? '' : '  (missing)')],
                ['Eye images', data.paths.texturesDir],
                ['BEacon data', data.paths.dataDir]
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
            toast(rejected + ' file(s) skipped — use audio (.mp3/.opus/.ogg) or cover images (.png/.jpg)', 'error');
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
            toast('Added ' + accepted.length + ' file' + (accepted.length === 1 ? '' : 's') + '.', 'ok');
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
        audio.play().catch(function (err) { toast('Could not play that track.', 'error'); });
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
        var label = album.albumTitle || album.rel;
        var message = album.tracks.length
            ? 'Delete "' + label + '" and its ' + album.tracks.length +
                ' track' + (album.tracks.length === 1 ? '' : 's') + '?'
            : 'Delete the empty album "' + label + '"?';
        if (!confirm(message)) { return; }
        api('DELETE', '/api/jukebox/album?path=' + encodeURIComponent(album.rel))
            .then(function () { toast('Album deleted.', 'ok'); return loadJukebox(); })
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
            emptyMain.appendChild(el('span', 'track-title', 'No songs yet — drop audio here or tap Add files'));
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
                    title: 'Rename song',
                    hint: 'Keep the file extension (for example .mp3).',
                    value: track.file
                }).then(function (name) {
                    if (!name) { return null; }
                    return api('POST', '/api/jukebox/rename', { type: 'track', path: track.rel, name: name })
                        .then(function () { toast('Renamed.', 'ok'); return loadJukebox(); });
                }).catch(reportError);
            };
            row.appendChild(rename);

            var del = el('button', 'btn btn-icon btn-danger', 'Delete');
            del.onclick = function () {
                if (!confirm('Delete "' + track.title + '"?')) { return; }
                api('DELETE', '/api/jukebox/track?path=' + encodeURIComponent(track.rel))
                    .then(function () { toast('Song deleted.', 'ok'); return loadJukebox(); })
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
                title: 'Rename album',
                hint: 'Underscores become spaces when Jibo shows the name.',
                value: album.rel.split('/').pop()
            }).then(function (name) {
                if (!name) { return null; }
                return api('POST', '/api/jukebox/rename', { type: 'album', path: album.rel, name: name })
                    .then(function () { toast('Renamed.', 'ok'); return loadJukebox(); });
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
            ? data.albums.length + ' album' + (data.albums.length === 1 ? '' : 's')
            : 'No albums yet';

        var list = $('#jukebox-albums');
        list.innerHTML = '';
        if (data.error) {
            var problem = el('div', 'empty', data.error);
            list.appendChild(problem);
        } else if (!data.albums.length) {
            list.appendChild(el('div', 'empty',
                'No albums yet. Tap New album, then add songs.'));
        } else {
            data.albums.forEach(function (album) { list.appendChild(albumCard(album)); });
        }

        var skipped = $('#jukebox-skipped');
        skipped.innerHTML = '';
        if (data.skipped && data.skipped.length) {
            var wrap = el('details', 'advanced');
            wrap.appendChild(el('summary', null, 'Skipped folders'));
            var card = el('div', 'card');
            var ul = el('ul', 'list');
            data.skipped.forEach(function (line) { ul.appendChild(el('li', null, line)); });
            card.appendChild(ul);
            wrap.appendChild(card);
            skipped.appendChild(wrap);
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
            hint: 'Artist is optional.',
            placeholder: 'Album name',
            placeholder2: 'Artist (optional)'
        }).then(function (values) {
            if (!values) { return null; }
            return api('POST', '/api/jukebox/album', { album: values[0], artist: values[1] })
                .then(function () {
                    toast('Album created.', 'ok');
                    return loadJukebox();
                });
        }).catch(reportError);
    }

    /* ---------------------------------------------------------------- photos */

    function photoUrl (id, download) {
        return '/api/photos/file?id=' + encodeURIComponent(id) +
            (download ? '&download=1' : '');
    }

    function photoDate (timestamp) {
        if (!timestamp) { return 'Date unavailable'; }
        var date = new Date(timestamp);
        return isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleString();
    }

    function deletePhoto (photo) {
        if (!confirm('Delete this photo?')) { return; }
        api('DELETE', '/api/photos?id=' + encodeURIComponent(photo.id))
            .then(function () {
                toast('Photo deleted.', 'ok');
                return loadPhotos();
            })
            .catch(reportError);
    }

    function photoCard (photo) {
        var card = el('article', 'photo-card' + (photo.available ? '' : ' is-unavailable'));
        var media = el('div', 'photo-media');

        if (photo.available) {
            var link = el('a', 'photo-link');
            link.href = photoUrl(photo.id, false);
            link.target = '_blank';
            link.rel = 'noopener';
            var img = el('img', 'photo-image');
            img.src = photoUrl(photo.id, false) + '&t=' + Date.now();
            img.alt = 'Photo taken ' + photoDate(photo.created);
            link.appendChild(img);
            media.appendChild(link);
        } else {
            media.appendChild(el('div', 'photo-missing', 'This photo is not available'));
        }
        card.appendChild(media);

        var details = el('div', 'photo-details');
        details.appendChild(el('div', 'photo-date', photoDate(photo.created)));
        details.appendChild(el('div', 'photo-meta', photo.available ? bytes(photo.size) : 'Unavailable'));
        card.appendChild(details);

        var actions = el('div', 'photo-actions');
        if (photo.available) {
            var download = el('a', 'btn btn-icon', 'Download');
            download.href = photoUrl(photo.id, true);
            download.setAttribute('download', photo.file);
            actions.appendChild(download);
        }
        var remove = el('button', 'btn btn-icon btn-danger', 'Delete');
        remove.onclick = function () { deletePhoto(photo); };
        actions.appendChild(remove);
        card.appendChild(actions);
        return card;
    }

    function renderPhotos () {
        var data = state.photos;
        if (!data) { return; }

        var summary = $('#photos-summary');
        if (!data.available) {
            summary.textContent = data.error || 'Photos are unavailable right now';
        } else {
            summary.textContent = data.count + ' photo' + (data.count === 1 ? '' : 's');
        }

        var grid = $('#photos-grid');
        grid.innerHTML = '';
        if (!data.available) {
            grid.appendChild(el('div', 'empty', data.error || 'Photos are unavailable right now'));
        } else if (!data.photos.length) {
            grid.appendChild(el('div', 'empty',
                'No saved photos yet. Ask Jibo to take a picture and save it.'));
        } else {
            data.photos.forEach(function (photo) { grid.appendChild(photoCard(photo)); });
        }
    }

    function loadPhotos () {
        return api('GET', '/api/photos').then(function (data) {
            state.photos = data;
            renderPhotos();
            return data;
        });
    }

    /* ---------------------------------------------------------------- eye */

    /** Centre-crop to a square and redraw at the size Jibo's eye uses. */
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
            toast('Pick a picture file', 'error');
            return;
        }
        toast('Preparing picture…');
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
        }).then(function (data) {
            if (data.live) {
                toast('Eye updated.', 'ok');
            } else {
                toast('Eye saved. Tap Apply if it still looks old.', 'ok');
            }
            return loadEye();
        }).catch(reportError);
    }

    function refreshEye () {
        toast('Updating Jibo\'s eye…');
        return api('POST', '/api/eye/refresh')
            .then(function (data) {
                if (data.live) {
                    toast('Eye updated.', 'ok');
                } else {
                    toast('Could not refresh the eye on his face right now.', 'error');
                }
                return loadEye();
            })
            .catch(reportError);
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
                var mark = texture.matchesCustom ? 'custom' : (texture.matchesOriginal ? 'original' : 'other');
                li.appendChild(el('span', 'chip' + (texture.matchesCustom ? ' is-role' : ' is-on'), mark));
                li.appendChild(el('span', null, texture.name));
                if (!texture.writable) { li.appendChild(el('span', 'chip', 'locked')); }
                list.appendChild(li);
            });

            if (data.pending) {
                list.appendChild(el('li', null, 'Tap Apply to finish showing the new eye.'));
            }
            return data;
        });
    }

    /* ------------------------------------------------------------- skills */

    function loadSkills () {
        return api('GET', '/api/skills').then(function (data) {
            var ready = data.counts.registered || 0;
            $('#skills-summary').textContent = ready === 1
                ? '1 skill ready on Jibo'
                : ready + ' skills ready on Jibo';

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
                    skill.registered ? 'On' : 'Off'));
                if (!skill.installed) { chips.appendChild(el('span', 'chip', 'Missing')); }
                else if (!skill.registered) { chips.appendChild(el('span', 'chip', 'On disk')); }
                if (skill.hasLaunchRule) { chips.appendChild(el('span', 'chip is-role', 'Voice')); }
                (skill.roles || []).forEach(function (role) {
                    chips.appendChild(el('span', 'chip is-role', role));
                });
                card.appendChild(chips);
                list.appendChild(card);
            });
            return data;
        });
    }

    /* ------------------------------------------------------------ location */

    function locationValue (value) {
        return value === undefined || value === null || value === '' ? '—' : String(value);
    }

    function locationSummary (location) {
        if (!location) { return 'No location set'; }
        var parts = [];
        if (location.city) { parts.push(location.city); }
        if (location.state || location.stateAbbr) { parts.push(location.state || location.stateAbbr); }
        if (location.country || location.countryCode) {
            parts.push(location.country || location.countryCode);
        }
        return parts.length ? parts.join(', ') : 'Location set';
    }

    function renderLocationList (selector, location) {
        var list = $(selector);
        list.innerHTML = '';
        if (!location) {
            list.appendChild(el('dd', null, 'No location set'));
            return;
        }

        var timezone = location.timezone || {};
        var rows = [
            ['City', location.city],
            ['State / region', location.state || location.stateAbbr],
            ['Country', location.country || location.countryCode],
            ['Timezone', timezone.id]
        ];
        rows.forEach(function (row) {
            list.appendChild(el('dt', null, row[0]));
            list.appendChild(el('dd', null, locationValue(row[1])));
        });
    }

    function renderLocation () {
        renderLocationList('#location-current', state.location.current);
        renderLocationList('#location-detected', state.location.detected);

        var summary = $('#location-current-summary');
        if (summary) { summary.textContent = locationSummary(state.location.current); }

        var cityInput = $('#location-city-input');
        if (cityInput && document.activeElement !== cityInput) {
            cityInput.value = state.location.current && state.location.current.city
                ? state.location.current.city
                : '';
        }

        var card = $('#location-detected-card');
        var apply = $('#location-apply');
        var hasDetected = !!state.location.detected;
        card.hidden = !hasDetected;
        apply.disabled = !hasDetected;
        var note = '';
        if (hasDetected) {
            note = 'This is based on your network and may not be exact.';
        }
        $('#location-note').textContent = note;
    }

    function loadLocation () {
        return api('GET', '/api/location').then(function (data) {
            state.location.current = data.location || null;
            renderLocation();
            return data;
        });
    }

    function detectLocation () {
        var button = $('[data-action="detect-location"]');
        if (button) { button.disabled = true; }
        toast('Looking up your area…');
        return api('POST', '/api/location/detect').then(function (data) {
            state.location.detected = data.location || null;
            state.location.source = 'ip';
            renderLocation();
            toast('Location found. Review it before saving.', 'ok');
            return data;
        }).catch(function (err) {
            renderLocation();
            reportError(err);
        }).then(function (data) {
            if (button) { button.disabled = false; }
            return data;
        });
    }

    function applyLocation () {
        if (!state.location.detected) { return null; }
        if (!confirm('Use this as Jibo\'s home location?')) { return null; }
        var button = $('#location-apply');
        button.disabled = true;
        return api('POST', '/api/location', { location: state.location.detected })
            .then(function (data) {
                state.location.current = data.location || state.location.detected;
                state.location.detected = null;
                state.location.source = null;
                renderLocation();
                toast('Location saved.', 'ok');
                return data;
            }).catch(function (err) {
                renderLocation();
                reportError(err);
            });
    }

    function saveLocationCity () {
        var input = $('#location-city-input');
        var city = input ? String(input.value || '').trim() : '';
        if (!city) {
            toast('Enter a town or city name.', 'error');
            return null;
        }
        var button = $('[data-action="save-location-city"]');
        if (button) { button.disabled = true; }
        return api('POST', '/api/location', { location: { city: city } })
            .then(function (data) {
                state.location.current = data.location || state.location.current;
                renderLocation();
                toast('Town saved.', 'ok');
                return data;
            }).catch(function (err) {
                reportError(err);
            }).then(function (data) {
                if (button) { button.disabled = false; }
                return data;
            });
    }

    /* --------------------------------------------------------------- units */

    function renderUnits () {
        var value = state.units.temperature === 'celsius' ? 'celsius' : 'fahrenheit';
        var inputs = document.querySelectorAll('input[name="temperature-unit"]');
        for (var i = 0; i < inputs.length; i++) {
            inputs[i].checked = inputs[i].value === value;
            var label = inputs[i].parentNode;
            if (label && label.classList) {
                label.classList.toggle('is-selected', inputs[i].checked);
            }
        }
    }

    function selectedTemperatureUnit () {
        var checked = $('input[name="temperature-unit"]:checked');
        return checked ? checked.value : 'fahrenheit';
    }

    function loadUnits () {
        return api('GET', '/api/units').then(function (data) {
            state.units.temperature = data.temperature === 'celsius' ? 'celsius' : 'fahrenheit';
            renderUnits();
            return data;
        });
    }

    function saveUnits () {
        var temperature = selectedTemperatureUnit();
        var button = $('[data-action="save-units"]');
        if (button) { button.disabled = true; }
        return api('POST', '/api/units', { temperature: temperature })
            .then(function (data) {
                state.units.temperature = data.temperature === 'celsius' ? 'celsius' : 'fahrenheit';
                renderUnits();
                toast('Weather units saved.', 'ok');
                return data;
            }).catch(function (err) {
                renderUnits();
                reportError(err);
            }).then(function (data) {
                if (button) { button.disabled = false; }
                return data;
            });
    }

    function loadEtc () {
        return Promise.all([loadLocation(), loadUnits()]);
    }

    function renderPeople (data) {
        var sync = $('#people-sync');
        var list = $('#people-list');
        if (!data) {
            sync.textContent = 'Loop roster unavailable.';
            list.innerHTML = '';
            return;
        }
        var parts = [];
        if (data.lastFullSyncTimestamp) {
            parts.push('Last cloud sync: ' + new Date(data.lastFullSyncTimestamp).toLocaleString());
        } else {
            parts.push('No successful cloud loop sync yet (lastFullSyncTimestamp is empty).');
        }
        if (data.lastSyncAttemptTimestamp) {
            parts.push('Last attempt: ' + new Date(data.lastSyncAttemptTimestamp).toLocaleString());
        }
        if (typeof data.lastCloudMemberCount === 'number') {
            parts.push('Cloud seed members: ' + data.lastCloudMemberCount);
        }
        if (data.lastSyncErrorMessage) {
            parts.push('Error: ' + data.lastSyncErrorMessage);
        }
        if (data.loopId) {
            parts.push('Loop ' + data.loopId);
        }
        sync.textContent = parts.join(' · ');
        if (data.lastSyncErrorMessage) {
            sync.classList.add('error');
        } else {
            sync.classList.remove('error');
        }

        var members = (data.members || []).filter(function (member) {
            return !member.isJibo;
        });
        list.innerHTML = '';
        if (!members.length) {
            var hint = data.lastSyncErrorMessage
                ? ('No people yet. Sync error: ' + data.lastSyncErrorMessage)
                : 'No people yet. Add someone above, then enroll face and voice from Introductions on Jibo.';
            list.appendChild(el('p', 'hint', hint));
            return;
        }

        members.forEach(function (member) {
            var card = el('div', 'card people-card');
            card.setAttribute('data-member-id', member.id);

            var header = el('div', 'people-card-header');
            if (member.photoUrl) {
                var img = el('img', 'people-avatar');
                img.src = member.photoUrl + '&t=' + Date.now();
                img.alt = member.writtenName || '';
                header.appendChild(img);
            } else {
                var initials = el('div', 'people-avatar people-avatar-fallback');
                initials.textContent = (member.writtenName || '?').charAt(0).toUpperCase();
                header.appendChild(initials);
            }
            var meta = el('div', 'people-meta');
            meta.appendChild(el('p', 'setting-title', member.writtenName || member.id));
            var hintParts = [];
            if (member.type === 'owner') {
                hintParts.push('Owner');
            } else if (member.type) {
                hintParts.push(member.type);
            } else {
                hintParts.push('member');
            }
            if (member.id) { hintParts.push(member.id); }
            meta.appendChild(el('p', 'hint', hintParts.join(' · ')));
            header.appendChild(meta);
            card.appendChild(header);

            var badges = el('div', 'people-badges');
            if (member.type === 'owner') {
                badges.appendChild(el('span', 'badge success', 'Owner'));
            }
            badges.appendChild(el('span', 'badge ' + (member.enrolled && member.enrolled.face ? 'success' : ''),
                member.enrolled && member.enrolled.face ? 'Face enrolled' : 'Face not enrolled'));
            badges.appendChild(el('span', 'badge ' + (member.enrolled && member.enrolled.voice ? 'success' : ''),
                member.enrolled && member.enrolled.voice ? 'Voice enrolled' : 'Voice not enrolled'));
            card.appendChild(badges);

            if (member.canEdit) {
                var nameRow = el('div', 'setting-row people-edit-row');
                var first = document.createElement('input');
                first.type = 'text';
                first.className = 'people-first';
                first.placeholder = 'First name';
                first.value = member.firstName || '';
                first.setAttribute('data-member-id', member.id);
                var last = document.createElement('input');
                last.type = 'text';
                last.className = 'people-last';
                last.placeholder = 'Last name';
                last.value = member.lastName || '';
                last.setAttribute('data-member-id', member.id);
                var gender = document.createElement('select');
                gender.className = 'people-gender';
                gender.setAttribute('data-member-id', member.id);
                [['unknown', 'Unspecified'], ['male', 'Male'], ['female', 'Female'], ['other', 'Other']].forEach(function (opt) {
                    var option = document.createElement('option');
                    option.value = opt[0];
                    option.textContent = opt[1];
                    if ((member.gender || 'unknown') === opt[0]) { option.selected = true; }
                    gender.appendChild(option);
                });
                nameRow.appendChild(first);
                nameRow.appendChild(last);
                nameRow.appendChild(gender);
                card.appendChild(nameRow);

                var phoneticRow = el('div', 'setting-row');
                var phonetic = document.createElement('input');
                phonetic.type = 'text';
                phonetic.className = 'people-phonetic';
                phonetic.placeholder = 'Phonetic name (spoken)';
                phonetic.value = member.phoneticName || '';
                phonetic.setAttribute('data-member-id', member.id);
                phoneticRow.appendChild(phonetic);
                card.appendChild(phoneticRow);

                var actionsRow = el('div', 'setting-row people-actions-row');
                var save = el('button', 'btn btn-primary', 'Save');
                save.setAttribute('data-action', 'save-person');
                save.setAttribute('data-member-id', member.id);
                actionsRow.appendChild(save);

                var photoBtn = el('button', 'btn', 'Photo');
                photoBtn.setAttribute('data-action', 'pick-person-photo');
                photoBtn.setAttribute('data-member-id', member.id);
                actionsRow.appendChild(photoBtn);

                if (member.hasPhoto) {
                    var clearPhoto = el('button', 'btn', 'Clear photo');
                    clearPhoto.setAttribute('data-action', 'clear-person-photo');
                    clearPhoto.setAttribute('data-member-id', member.id);
                    actionsRow.appendChild(clearPhoto);
                }

                if (member.canSetOwner) {
                    var makeOwner = el('button', 'btn', 'Make owner');
                    makeOwner.setAttribute('data-action', 'make-owner');
                    makeOwner.setAttribute('data-member-id', member.id);
                    actionsRow.appendChild(makeOwner);
                }

                if (member.canRemove) {
                    var remove = el('button', 'btn btn-danger', 'Remove');
                    remove.setAttribute('data-action', 'remove-person');
                    remove.setAttribute('data-member-id', member.id);
                    actionsRow.appendChild(remove);
                }
                card.appendChild(actionsRow);
            }

            list.appendChild(card);
        });
    }

    function loadPeople () {
        return api('GET', '/api/people').then(function (data) {
            renderPeople(data);
            return data;
        }).catch(function (err) {
            renderPeople(null);
            throw err;
        });
    }

    function toPeopleJpeg (file) {
        return new Promise(function (resolve, reject) {
            var url = URL.createObjectURL(file);
            var image = new Image();
            image.onload = function () {
                URL.revokeObjectURL(url);
                var side = Math.min(image.width, image.height);
                var canvas = document.createElement('canvas');
                canvas.width = PEOPLE_PHOTO_SIZE;
                canvas.height = PEOPLE_PHOTO_SIZE;
                var ctx = canvas.getContext('2d');
                ctx.drawImage(
                    image,
                    (image.width - side) / 2, (image.height - side) / 2, side, side,
                    0, 0, PEOPLE_PHOTO_SIZE, PEOPLE_PHOTO_SIZE
                );
                canvas.toBlob(function (blob) {
                    if (blob) { resolve(blob); } else { reject(new Error('Could not convert that image')); }
                }, 'image/jpeg', 0.9);
            };
            image.onerror = function () {
                URL.revokeObjectURL(url);
                reject(new Error('That file could not be read as an image'));
            };
            image.src = url;
        });
    }

    function uploadPersonPhoto (memberId, file) {
        if (!IMAGE_RE.test(file.name) && file.type.indexOf('image/') !== 0) {
            toast('Pick a picture file', 'error');
            return;
        }
        toast('Preparing picture…');
        toPeopleJpeg(file).then(function (blob) {
            return fetch('/api/people/photo?id=' + encodeURIComponent(memberId), {
                method: 'PUT',
                headers: { 'Content-Type': 'image/jpeg' },
                body: blob
            }).then(function (res) {
                return res.json().then(function (data) {
                    if (!res.ok) { throw new Error(data.error || 'Upload failed'); }
                    return data;
                });
            });
        }).then(function (data) {
            toast('Profile photo updated.', 'ok');
            renderPeople(data);
        }).catch(reportError);
    }

    /* -------------------------------------------------------------- screen */

    function setScreenMessage (text, isError) {
        var placeholder = $('#screen-placeholder');
        var hint = $('#screen-hint');
        if (placeholder) { placeholder.textContent = text; }
        if (hint) {
            hint.textContent = isError
                ? text
                : 'Watch Jibo\u2019s face here. Tap or drag the picture to touch the screen.';
        }
        $('#screen-stage').classList.toggle('is-down', !!isError);
    }

    function stopScreen () {
        state.screen.live = false;
        state.screen.pulling = false;
        state.screen.pointer = null;
        state.screen.pointerStart = null;
        state.screen.queue = [];
        if (state.screen.flushTimer) {
            clearTimeout(state.screen.flushTimer);
            state.screen.flushTimer = null;
        }
        if (state.screen.timer) {
            clearTimeout(state.screen.timer);
            state.screen.timer = null;
        }
        var img = $('#screen-view');
        if (img) {
            img.onload = null;
            img.onerror = null;
        }
        if (state.screen.objectUrl) {
            URL.revokeObjectURL(state.screen.objectUrl);
            state.screen.objectUrl = null;
        }
        $('#screen-hit').hidden = true;
        $('#screen-stage').classList.remove('is-live');
    }

    function scheduleScreen (delay) {
        if (!state.screen.live || state.panel !== 'screen') { return; }
        if (state.screen.timer) { clearTimeout(state.screen.timer); }
        state.screen.timer = setTimeout(pullScreen, delay || 0);
    }

    function pullScreen () {
        if (!state.screen.live || state.panel !== 'screen' || state.screen.pulling) { return; }
        state.screen.pulling = true;
        var img = $('#screen-view');
        img.onload = function () {
            state.screen.pulling = false;
            if (!state.screen.live || state.panel !== 'screen') { return; }
            $('#screen-stage').classList.add('is-live');
            $('#screen-hit').hidden = false;
            setScreenMessage('Live');
            scheduleScreen(0);
        };
        img.onerror = function () {
            state.screen.pulling = false;
            if (!state.screen.live || state.panel !== 'screen') { return; }
            if (!$('#screen-stage').classList.contains('is-live')) {
                $('#screen-hit').hidden = true;
                setScreenMessage('Could not read Jibo\u2019s screen.', true);
            }
            scheduleScreen(400);
        };
        img.src = '/api/screen.jpg?t=' + Date.now();
    }

    function loadScreen () {
        state.screen.live = true;
        setScreenMessage('Connecting to Jibo\u2019s screen\u2026');
        return api('GET', '/api/screen').then(function (data) {
            if (!data.available) {
                stopScreen();
                setScreenMessage('Open this page against a running Jibo. Screen view only works while Be is up.', true);
                return data;
            }
            pullScreen();
            return data;
        }).catch(function (err) {
            stopScreen();
            setScreenMessage(err.message || 'Could not reach Jibo\u2019s screen.', true);
            throw err;
        });
    }

    function screenPoint (event) {
        var stage = $('#screen-stage');
        var rect = stage.getBoundingClientRect();
        var src = event.changedTouches && event.changedTouches[0]
            ? event.changedTouches[0]
            : (event.touches && event.touches[0] ? event.touches[0] : event);
        var x = ((src.clientX - rect.left) / rect.width) * SCREEN_W;
        var y = ((src.clientY - rect.top) / rect.height) * SCREEN_H;
        if (x < 0) { x = 0; }
        if (y < 0) { y = 0; }
        if (x > SCREEN_W - 1) { x = SCREEN_W - 1; }
        if (y > SCREEN_H - 1) { y = SCREEN_H - 1; }
        return { x: Math.round(x), y: Math.round(y) };
    }

    function sendScreenInput (body) {
        return fetch('/api/screen/input', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        }).then(function (res) {
            if (!res.ok) {
                return res.text().then(function (text) {
                    var message = 'Touch failed';
                    try {
                        var data = JSON.parse(text);
                        if (data && data.error) { message = data.error; }
                    } catch (err) { /* default */ }
                    throw new Error(message);
                });
            }
            return res.json();
        });
    }

    function flushScreenQueue () {
        if (state.screen.flushTimer) {
            clearTimeout(state.screen.flushTimer);
            state.screen.flushTimer = null;
        }
        if (!state.screen.queue.length) { return; }
        var events = state.screen.queue;
        state.screen.queue = [];
        sendScreenInput({ type: 'batch', events: events }).catch(function (err) {
            if (events[0] && events[0].phase === 'down') { reportError(err); }
        });
    }

    function queueScreenPointer (phase, x, y) {
        state.screen.queue.push({ phase: phase, x: x, y: y });
        if (state.screen.queue.length > 32) {
            state.screen.queue = state.screen.queue.slice(-24);
        }
        if (phase === 'down' || phase === 'up') {
            flushScreenQueue();
            return;
        }
        if (!state.screen.flushTimer) {
            state.screen.flushTimer = setTimeout(flushScreenQueue, SCREEN_MOVE_MS);
        }
    }

    function flickDirection (start, end) {
        if (!start || !end) { return null; }
        var dx = end.x - start.x;
        var dy = end.y - start.y;
        var adx = Math.abs(dx);
        var ady = Math.abs(dy);
        var dt = Date.now() - (start.at || 0);
        if (dt > SCREEN_FLICK_MS || (adx < SCREEN_FLICK_DIST && ady < SCREEN_FLICK_DIST)) {
            return null;
        }
        if (ady > adx) { return dy > 0 ? 'down' : 'up'; }
        return dx > 0 ? 'right' : 'left';
    }

    function onScreenPointerDown (event) {
        event.preventDefault();
        var point = screenPoint(event);
        state.screen.pointer = point;
        state.screen.pointerStart = { x: point.x, y: point.y, at: Date.now() };
        state.screen.lastMove = Date.now();
        queueScreenPointer('down', point.x, point.y);
    }

    function onScreenPointerMove (event) {
        if (!state.screen.pointer) { return; }
        event.preventDefault();
        var now = Date.now();
        if (now - state.screen.lastMove < SCREEN_MOVE_MS) { return; }
        state.screen.lastMove = now;
        var point = screenPoint(event);
        state.screen.pointer = point;
        queueScreenPointer('move', point.x, point.y);
    }

    function onScreenPointerUp (event) {
        if (!state.screen.pointer) { return; }
        event.preventDefault();
        var point = screenPoint(event);
        var start = state.screen.pointerStart;
        state.screen.pointer = null;
        state.screen.pointerStart = null;
        queueScreenPointer('up', point.x, point.y);
        var dir = flickDirection(start, point);
        if (dir) {
            sendScreenInput({ type: 'swipe', direction: dir }).catch(function () {});
        }
    }

    function bindScreenInput () {
        var hit = $('#screen-hit');
        hit.addEventListener('mousedown', onScreenPointerDown);
        hit.addEventListener('mousemove', onScreenPointerMove);
        hit.addEventListener('mouseup', onScreenPointerUp);
        hit.addEventListener('mouseleave', onScreenPointerUp);
        hit.addEventListener('touchstart', onScreenPointerDown, { passive: false });
        hit.addEventListener('touchmove', onScreenPointerMove, { passive: false });
        hit.addEventListener('touchend', onScreenPointerUp);
        hit.addEventListener('touchcancel', onScreenPointerUp);
        hit.addEventListener('contextmenu', function (event) { event.preventDefault(); });
    }

    /* --------------------------------------------------------------- wire */

    var panelMeta = {
        status: {
            title: 'Status',
            actions: [{ action: 'refresh-status', label: 'Refresh' }]
        },
        screen: {
            title: 'Screen',
            actions: [{ action: 'screen-refresh', label: 'Refresh' }]
        },
        jukebox: {
            title: 'Music',
            actions: [
                { action: 'new-album', label: 'New' },
                { action: 'refresh-jukebox', label: 'Refresh' }
            ]
        },
        photos: {
            title: 'Photos',
            actions: [{ action: 'refresh-photos', label: 'Refresh' }]
        },
        people: {
            title: 'People',
            actions: [{ action: 'refresh-people', label: 'Refresh' }]
        },
        eye: {
            title: "Jibo's eye",
            actions: [{ action: 'refresh-eye', label: 'Apply' }]
        },
        skills: {
            title: 'Skills',
            actions: [{ action: 'refresh-skills', label: 'Refresh' }]
        },
        etc: {
            title: 'More',
            actions: [{ action: 'refresh-etc', label: 'Refresh' }]
        }
    };

    var loaders = {
        status: loadStatus,
        screen: loadScreen,
        jukebox: loadJukebox,
        photos: loadPhotos,
        people: loadPeople,
        eye: loadEye,
        skills: loadSkills,
        etc: loadEtc
    };

    function renderToolbar (name) {
        var meta = panelMeta[name] || panelMeta.status;
        $('#toolbar-title').textContent = meta.title;
        var actions = $('#toolbar-actions');
        actions.innerHTML = '';
        (meta.actions || []).forEach(function (item) {
            var button = el('button', 'toolbar-action', item.label);
            button.setAttribute('data-action', item.action);
            actions.appendChild(button);
        });
    }

    function refreshPanel (name) {
        var loader = loaders[name];
        if (!loader) { return; }
        loader().catch(reportError);
    }

    function showPanel (name) {
        if (!loaders[name]) { name = 'status'; }
        if (name !== 'screen') { stopScreen(); }
        state.panel = name;
        renderToolbar(name);
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
        'screen-refresh': loadScreen,
        'screen-swipe-down': function () {
            return sendScreenInput({ type: 'swipe', direction: 'down' })
                .then(function () { toast('Swipe down sent.', 'ok'); });
        },
        'refresh-jukebox': loadJukebox,
        'refresh-photos': loadPhotos,
        'refresh-people': loadPeople,
        'refresh-eye': refreshEye,
        'refresh-skills': loadSkills,
        'refresh-location': loadEtc,
        'refresh-etc': loadEtc,
        'detect-location': detectLocation,
        'apply-location': applyLocation,
        'save-location-city': saveLocationCity,
        'save-units': saveUnits,
        'new-album': newAlbum,
        'add-person': function () {
            var first = $('#people-new-first');
            var last = $('#people-new-last');
            var gender = $('#people-new-gender');
            var firstName = first ? first.value.trim() : '';
            if (!firstName) {
                toast('First name is required.', 'error');
                return;
            }
            return api('POST', '/api/people', {
                firstName: firstName,
                lastName: last ? last.value.trim() : '',
                gender: gender ? gender.value : 'unknown'
            }).then(function (data) {
                if (first) { first.value = ''; }
                if (last) { last.value = ''; }
                if (gender) { gender.value = 'unknown'; }
                toast('Person added.', 'ok');
                renderPeople(data);
            });
        },
        'save-person': function (button) {
            var memberId = button && button.getAttribute('data-member-id');
            if (!memberId) { return; }
            var first = document.querySelector('.people-first[data-member-id="' + memberId + '"]');
            var last = document.querySelector('.people-last[data-member-id="' + memberId + '"]');
            var gender = document.querySelector('.people-gender[data-member-id="' + memberId + '"]');
            var phonetic = document.querySelector('.people-phonetic[data-member-id="' + memberId + '"]');
            var firstName = first ? first.value.trim() : '';
            if (!firstName) {
                toast('First name is required.', 'error');
                return;
            }
            return api('PUT', '/api/people', {
                id: memberId,
                firstName: firstName,
                lastName: last ? last.value.trim() : '',
                gender: gender ? gender.value : 'unknown',
                phoneticName: phonetic ? phonetic.value : ''
            }).then(function (data) {
                toast('Person updated.', 'ok');
                renderPeople(data);
            });
        },
        'make-owner': function (button) {
            var memberId = button && button.getAttribute('data-member-id');
            if (!memberId) { return; }
            if (!confirm('Make this person the Loop owner? The previous owner becomes a regular member.')) {
                return;
            }
            return api('POST', '/api/people/owner', { id: memberId })
                .then(function (data) {
                    toast('Owner updated. Restart Be if Who-am-I still names the old owner.', 'ok');
                    renderPeople(data);
                });
        },
        'remove-person': function (button) {
            var memberId = button && button.getAttribute('data-member-id');
            if (!memberId) { return; }
            if (!confirm('Remove this person from the Loop?')) { return; }
            return api('DELETE', '/api/people?id=' + encodeURIComponent(memberId))
                .then(function (data) {
                    toast('Person removed.', 'ok');
                    renderPeople(data);
                });
        },
        'pick-person-photo': function (button) {
            var memberId = button && button.getAttribute('data-member-id');
            if (!memberId) { return; }
            var input = $('#people-photo-file');
            input.setAttribute('data-member-id', memberId);
            input.click();
        },
        'clear-person-photo': function (button) {
            var memberId = button && button.getAttribute('data-member-id');
            if (!memberId) { return; }
            return api('DELETE', '/api/people/photo?id=' + encodeURIComponent(memberId))
                .then(function (data) {
                    toast('Profile photo cleared.', 'ok');
                    renderPeople(data);
                });
        },
        'save-phonetic': function (button) {
            var memberId = button && button.getAttribute('data-member-id');
            if (!memberId) { return; }
            var input = document.querySelector('.people-phonetic[data-member-id="' + memberId + '"]');
            var phoneticName = input ? input.value : '';
            api('POST', '/api/people/phonetic-name', { id: memberId, phoneticName: phoneticName })
                .then(function (data) {
                    toast('Phonetic name saved.', 'ok');
                    renderPeople(data);
                })
                .catch(reportError);
        },
        'pick-eye': function () { $('#eye-file').click(); },
        'revert-eye': function () {
            if (!confirm('Put Jibo\'s original eye back?')) { return; }
            api('POST', '/api/eye/revert')
                .then(function (data) {
                    if (data.live) {
                        toast('Original eye restored.', 'ok');
                    } else {
                        toast('Original eye restored. Tap Apply if needed.', 'ok');
                    }
                    return loadEye();
                })
                .catch(reportError);
        }
    };

    document.addEventListener('change', function (event) {
        if (event.target && event.target.name === 'temperature-unit') {
            // Update highlight only — do not reset radios from saved state.
            var inputs = document.querySelectorAll('input[name="temperature-unit"]');
            for (var i = 0; i < inputs.length; i++) {
                var label = inputs[i].parentNode;
                if (label && label.classList) {
                    label.classList.toggle('is-selected', inputs[i].checked);
                }
            }
        }
    });

    document.addEventListener('click', function (event) {
        var target = event.target.closest ? event.target.closest('[data-action]') : null;
        if (!target) { return; }
        var action = actions[target.getAttribute('data-action')];
        if (!action) { return; }
        var result = action(target);
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

    $('#people-photo-file').addEventListener('change', function (event) {
        var memberId = event.target.getAttribute('data-member-id');
        if (memberId && event.target.files.length) {
            uploadPersonPhoto(memberId, event.target.files[0]);
        }
        event.target.value = '';
        event.target.removeAttribute('data-member-id');
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

    bindScreenInput();

    var cityInput = $('#location-city-input');
    if (cityInput) {
        cityInput.addEventListener('keydown', function (event) {
            var key = event.key || event.keyCode;
            if (key === 'Enter' || key === 13) {
                event.preventDefault();
                saveLocationCity();
            }
        });
    }

    document.addEventListener('visibilitychange', function () {
        if (state.panel !== 'screen') { return; }
        if (document.hidden) {
            stopScreen();
        } else {
            loadScreen().catch(reportError);
        }
    });

    showPanel(loaders[location.hash.slice(1)] ? location.hash.slice(1) : 'status');
}());
