/* BEacon UI — vanilla ES5-ish so it also runs in older robot-adjacent browsers. */
(function () {
    'use strict';

    var PEOPLE_PHOTO_SIZE = 384;
    var SCREEN_W = 1280;
    var SCREEN_H = 720;
    var SCREEN_MOVE_MS = 16;
    var SCREEN_FLICK_DIST = 120;
    var SCREEN_FLICK_MS = 900;
    var IMAGE_RE = /\.(png|jpe?g|gif|webp|bmp)$/i;

    var state = {
        panel: 'status',
        photos: null,
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

    function api (method, path, body, requestOptions) {
        var options = { method: method, headers: {} };
        if (requestOptions && requestOptions.signal) { options.signal = requestOptions.signal; }
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
            cards.appendChild(stat('Version', 'BEam ' + (data.host.version || '?')));
            cards.appendChild(stat('This Jibo', data.robot ? data.hostname : 'Development (' + data.hostname + ')'));
            cards.appendChild(stat('Uptime', duration(data.uptimeSeconds)));
            cards.appendChild(stat('Theme', data.theme ? data.theme.name : 'None'));

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
                ['Photos folder', data.paths.photosDir + (data.paths.photosDirExists ? '' : '  (missing)')],
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

    var menuUI = window.BEaconMenuEditor.create({ api: api, toast: toast, reportError: reportError });
    var themeUI = window.BEaconThemes.create({ api: api, toast: toast, reportError: reportError, prompt: prompt2 });

    /* --------------------------------------------------------------- units */

    window.BEaconAppearance.bind($('#appearance-choices'));
    var unitsSwitch = window.BEaconAppearance.createSwitch($('#units-choices'));

    function renderUnits () {
        var value = state.units.temperature === 'celsius' ? 'celsius' : 'fahrenheit';
        unitsSwitch.set(value);
    }

    function selectedTemperatureUnit () {
        return unitsSwitch.get() || 'fahrenheit';
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
        return Promise.all([loadCameraStreamSetting(), loadAutoUpdate(), loadJiboSync(), loadLanguage(), window.BEaconAgent ? window.BEaconAgent.load() : Promise.resolve()]);
    }

    // Jibo's speech language: saved as soon as it is chosen; on failure the switch goes back.
    var languageSaved = 'en';
    var languageSwitch = window.BEaconAppearance.createSwitch($('#language-choices'), function (value) {
        api('POST', '/api/language', { language: value }).then(function (data) {
            languageSaved = data.language; toast('Jibo’s language saved.', 'ok');
        }).catch(function (err) { languageSwitch.set(languageSaved); reportError(err); });
    });
    function loadLanguage () {
        return api('GET', '/api/language').then(function (data) { languageSaved = data.language; languageSwitch.set(languageSaved); });
    }

    var jiboSyncTimer = null;
    function jiboSyncAction (path, robotId) {
        return api('POST', path, robotId ? { robotId: robotId } : {}).then(renderJiboSync).catch(reportError);
    }
    function renderJiboSync (data) {
        var list = $('#jibosync-robots');
        var last = data.last;
        var robots = (last && last.robots) || [];
        list.innerHTML = '';
        robots.forEach(function (robot) {
            var li = document.createElement('li');
            var text = robot.robotId + ' (' + robot.address + '): ';
            var button = null;
            if (robot.status === 'not in cluster') { text += 'not in this cluster'; button = ['Add', '/api/jibosync/add']; }
            else {
                if (robot.status === 'synced') { text += 'synced'; }
                else if (robot.status === 'different version') { text += 'in this cluster, not synced: different version (' + [robot.versions.os, robot.versions.services, robot.versions.beam].join(', ') + ')'; }
                else { text += 'in this cluster, not reachable'; }
                button = ['Remove', '/api/jibosync/remove'];
            }
            li.appendChild(document.createTextNode(text + ' '));
            var btn = document.createElement('button');
            btn.type = 'button'; btn.className = 'btn'; btn.textContent = button[0];
            btn.addEventListener('click', function () { btn.disabled = true; jiboSyncAction(button[1], robot.robotId); });
            li.appendChild(btn);
            list.appendChild(li);
        });
        var status = $('#jibosync-status');
        if (data.syncing) { status.textContent = data.inCluster ? 'Syncing…' : 'Looking for robots…'; }
        else if (!last) { status.textContent = data.inCluster ? 'Not synced yet.' : 'This robot is not in a cluster. Find robots, then add one to start a cluster.'; }
        else {
            var when = new Date(last.finished || last.at).toLocaleString();
            var parts = [(data.inCluster ? 'Last sync ' : 'Last looked ') + when + '.'];
            if (!robots.length) { parts.push('No other 5x1 robots found on this Wi-Fi.'); }
            if (!data.inCluster && robots.length) { parts.push('Add a robot to start a cluster.'); }
            if (last.imported || last.removed || last.settings) { parts.push(last.imported + ' people updated, ' + last.removed + ' removed, ' + (last.settings || 0) + ' report settings updated.'); }
            if (last.errors && last.errors.length) { parts.push('Problems: ' + last.errors.join('; ')); }
            status.textContent = parts.join(' ');
        }
        $('#jibosync-now').textContent = data.inCluster ? 'Sync now' : 'Find robots';
        $('#jibosync-now').disabled = !!data.syncing;
        $('#jibosync-leave').hidden = !data.inCluster;
        clearTimeout(jiboSyncTimer);
        if (data.syncing && state.panel === 'etc') { jiboSyncTimer = setTimeout(function () { loadJiboSync().catch(function () {}); }, 2000); }
    }
    function loadJiboSync () {
        return api('GET', '/api/jibosync/status').then(renderJiboSync);
    }
    $('#jibosync-now').addEventListener('click', function () {
        this.disabled = true;
        api('POST', '/api/jibosync/sync').then(renderJiboSync).catch(function (error) {
            $('#jibosync-now').disabled = false;
            reportError(error);
        });
    });
    $('#jibosync-leave').addEventListener('click', function () {
        if (!window.confirm('Leave this cluster? This robot keeps its people but stops syncing.')) { return; }
        jiboSyncAction('/api/jibosync/leave');
    });

    function loadAutoUpdate () {
        return api('GET', '/api/auto-update').then(function (data) {
            var input = $('#auto-update-enabled');
            input.checked = data.enabled === true;
            input.disabled = false;
        });
    }

    $('#auto-update-enabled').addEventListener('change', function () {
        var input = this;
        var previous = !input.checked;
        input.disabled = true;
        api('POST', '/api/auto-update', { enabled: input.checked }).then(function (data) {
            input.checked = data.enabled === true;
            $('#auto-update-status').textContent = 'Saved.';
        }).catch(function (error) {
            input.checked = previous;
            $('#auto-update-status').textContent = error.message;
            reportError(error);
        }).then(function () { input.disabled = false; });
    });

    function loadCameraStreamSetting () {
        return api('GET', '/api/camera-stream/settings').then(function (data) {
            var input = $('#camera-stream-enabled');
            input.checked = data.enabled === true;
            input.disabled = false;
            $('#camera-stream-setting-status').textContent = '';
        });
    }

    $('#camera-stream-enabled').addEventListener('change', function () {
        var input = this;
        var previous = !input.checked;
        input.disabled = true;
        api('POST', '/api/camera-stream/settings', { enabled: input.checked }).then(function (data) {
            input.checked = data.enabled === true;
            $('#camera-stream-setting-status').textContent = 'Saved.';
        }).catch(function (error) {
            input.checked = previous;
            $('#camera-stream-setting-status').textContent = error.message;
            // A cleanup failure can leave the preference saved as disabled.
            loadCameraStreamSetting().catch(function () {});
            reportError(error);
        }).then(function () { input.disabled = false; });
    });

    function renderPeople (data) {
        renderReports(data);
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

                var birthdayRow = el('label', 'setting-row people-birthday-row', 'Birthday');
                var birthday = document.createElement('input');
                birthday.type = 'date';
                birthday.className = 'people-birthday';
                birthday.value = member.birthday || '';
                birthday.max = new Date().toISOString().slice(0, 10);
                birthday.setAttribute('data-member-id', member.id);
                birthdayRow.appendChild(birthday);
                card.appendChild(birthdayRow);

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

    function calendarStatusText (member, data) {
        var calendar = member.calendar || {};
        if (!data || data.calendarAvailable !== true) {
            return 'Calendar connection unavailable. You can enter a feed URL, but saving or testing requires cloud access.';
        }
        if (!calendar.configured) { return 'No personal calendar yet.'; }
        var parts = [];
        parts.push(calendar.host ? ('Saved at ' + calendar.host) : 'Calendar saved');
        parts.push(calendar.isEnabled === false ? 'Disabled' : 'Enabled');
        if (calendar.lastError) { parts.push(calendar.lastError); }
        return parts.join(' · ');
    }

    function renderPersonCalendar (member, data) {
        var block = el('div', 'people-calendar');
        block.appendChild(el('p', 'setting-title', 'iCal URL'));
        block.appendChild(el('p', 'hint',
            'Private iCal URL for this person\'s personal report. A Google secret ICS address is a normal https link. The saved link is not shown again.'));
        block.appendChild(el('p', 'hint people-calendar-status', calendarStatusText(member, data)));

        var urlRow = el('div', 'setting-row');
        var url = document.createElement('input');
        url.type = 'url';
        url.className = 'people-calendar-url';
        url.placeholder = 'https://calendar.example/private/basic.ics';
        url.setAttribute('data-member-id', member.id);
        url.setAttribute('autocomplete', 'off');
        url.setAttribute('spellcheck', 'false');
        urlRow.appendChild(url);
        block.appendChild(urlRow);

        var toggle = el('label', 'people-calendar-toggle');
        var enabled = document.createElement('input');
        enabled.type = 'checkbox';
        enabled.className = 'people-calendar-enabled';
        enabled.setAttribute('data-member-id', member.id);
        var calendar = member.calendar || {};
        enabled.checked = !calendar.configured || calendar.isEnabled !== false;
        toggle.appendChild(enabled);
        toggle.appendChild(document.createTextNode(' Use this calendar in personal report'));
        block.appendChild(toggle);

        var actions = el('div', 'setting-row people-actions-row');
        var save = el('button', 'btn btn-primary', 'Save calendar');
        save.setAttribute('data-action', 'save-calendar');
        save.setAttribute('data-member-id', member.id);
        actions.appendChild(save);
        var test = el('button', 'btn', 'Test');
        test.setAttribute('data-action', 'test-calendar');
        test.setAttribute('data-member-id', member.id);
        actions.appendChild(test);
        if (calendar.configured) {
            var clear = el('button', 'btn', 'Clear');
            clear.setAttribute('data-action', 'clear-calendar');
            clear.setAttribute('data-member-id', member.id);
            actions.appendChild(clear);
        }
        block.appendChild(actions);
        return block;
    }

    function renderPersonWork (member, data) {
        var block = el('div', 'people-calendar');
        block.appendChild(el('p', 'setting-title', 'Work or school address'));
        block.appendChild(el('p', 'hint', data && data.commuteAvailable
            ? 'Where this person works or goes to school, for live commute times in their personal report.'
            : 'Commute times aren\'t available right now.'));
        var row = el('div', 'setting-row');
        var input = document.createElement('input');
        input.type = 'text';
        input.className = 'people-calendar-url people-work-address';
        input.placeholder = 'Street, town (e.g. 1 Main St, Boston)';
        input.value = member.workAddress || '';
        input.setAttribute('data-member-id', member.id);
        input.setAttribute('autocomplete', 'off');
        row.appendChild(input);
        block.appendChild(row);
        var actions = el('div', 'setting-row people-actions-row');
        var save = el('button', 'btn btn-primary', 'Save address');
        save.setAttribute('data-action', 'save-work');
        save.setAttribute('data-member-id', member.id);
        actions.appendChild(save);
        if (member.workAddress) {
            var clear = el('button', 'btn', 'Clear');
            clear.setAttribute('data-action', 'clear-work');
            clear.setAttribute('data-member-id', member.id);
            actions.appendChild(clear);
        }
        block.appendChild(actions);
        return block;
    }

    function renderPersonHome (member, data) {
        var block = el('div', 'people-calendar');
        block.appendChild(el('p', 'setting-title', 'Home address'));
        block.appendChild(el('p', 'hint', data && data.commuteAvailable
            ? 'Where this person lives; their commute starts here. The owner\'s home also sets Jibo\'s town and weather.'
            : 'Commute times aren\'t available right now.'));
        var row = el('div', 'setting-row');
        var input = document.createElement('input');
        input.type = 'text';
        input.className = 'people-calendar-url people-home-address';
        input.placeholder = 'Street, town (e.g. 1 Main St, Boston)';
        input.value = member.homeAddress || '';
        input.setAttribute('data-member-id', member.id);
        input.setAttribute('autocomplete', 'street-address');
        row.appendChild(input);
        block.appendChild(row);
        var actions = el('div', 'setting-row people-actions-row');
        var save = el('button', 'btn btn-primary', 'Save address');
        save.setAttribute('data-action', 'save-home');
        save.setAttribute('data-member-id', member.id);
        actions.appendChild(save);
        if (member.homeAddress) {
            var clear = el('button', 'btn', 'Clear');
            clear.setAttribute('data-action', 'clear-home');
            clear.setAttribute('data-member-id', member.id);
            actions.appendChild(clear);
        }
        block.appendChild(actions);
        return block;
    }

    var NEWS_TOPIC_NAMES = {
        general: 'Top Stories', world: 'World', nation: 'U.S.', business: 'Business', technology: 'Technology',
        entertainment: 'Entertainment', science: 'Science', sports: 'Sports', health: 'Health'
    };

    function renderPersonNews (member, data) {
        var block = el('div', 'people-calendar');
        block.appendChild(el('p', 'setting-title', 'Topics'));
        if (!data || !data.newsTopics) {
            block.appendChild(el('p', 'hint', 'News topics aren\'t available right now.'));
            return block;
        }
        block.appendChild(el('p', 'hint',
            'Topics Jibo reads when this person asks for the news. With more than five on, he picks five each time.'));
        var list = el('div', 'news-topics');
        data.newsTopics.forEach(function (topic) {
            var label = el('label', 'unit-choice');
            var box = document.createElement('input');
            box.type = 'checkbox';
            box.className = 'news-topic';
            box.value = topic;
            box.checked = (member.disabledNewsTopics || []).indexOf(topic) === -1;
            box.setAttribute('data-member-id', member.id);
            label.appendChild(box);
            label.appendChild(document.createTextNode(NEWS_TOPIC_NAMES[topic] || topic));
            list.appendChild(label);
        });
        block.appendChild(list);
        var actions = el('div', 'setting-row people-actions-row');
        var save = el('button', 'btn btn-primary', 'Save topics');
        save.setAttribute('data-action', 'save-news');
        save.setAttribute('data-member-id', member.id);
        actions.appendChild(save);
        block.appendChild(actions);
        return block;
    }

    // Personal Reports tab: one person at a time, chosen at the top (the owner first).
    var reportsPersonId = null, reportsData = null;
    function renderReports (data) {
        var select = $('#reports-person');
        var box = $('#reports-person-settings');
        if (!select || !box) { return; }
        reportsData = data;
        var members = ((data && data.members) || []).filter(function (member) { return !member.isJibo; });
        if (!members.some(function (member) { return member.id === reportsPersonId; })) {
            var owner = members.filter(function (member) { return member.type === 'owner'; })[0];
            reportsPersonId = (owner || members[0] || {}).id || null;
        }
        select.innerHTML = '';
        members.forEach(function (member) {
            var option = document.createElement('option');
            option.value = member.id;
            option.textContent = member.writtenName || member.firstName || member.id;
            option.selected = member.id === reportsPersonId;
            select.appendChild(option);
        });
        box.innerHTML = '';
        var person = members.filter(function (member) { return member.id === reportsPersonId; })[0];
        if (!person) {
            box.appendChild(el('p', 'hint', data ? 'Add someone in the People tab first.' : 'Loop roster unavailable.'));
            return;
        }
        [['Calendar', [renderPersonCalendar]], ['Commute', [renderPersonHome, renderPersonWork]], ['News', [renderPersonNews]]].forEach(function (section) {
            box.appendChild(el('p', 'section-header', section[0]));
            var card = el('div', 'card people-card');
            section[1].forEach(function (render) { card.appendChild(render(person, data)); });
            box.appendChild(card);
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
            img.removeAttribute('src');  // closes the live stream, so Jibo stops encoding frames
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
        if (!state.screen.polling) {
            // one continuous MJPEG response; a request per frame capped the frame rate
            img.onload = function () {
                if (!state.screen.live || state.panel !== 'screen') { return; }
                $('#screen-stage').classList.add('is-live');
                $('#screen-hit').hidden = false;
                setScreenMessage('Live');
            };
            img.onerror = function () {
                state.screen.pulling = false;
                state.screen.polling = true;  // fall back to one JPEG per request
                scheduleScreen(0);
            };
            img.src = '/api/screen/stream?t=' + Date.now();
            return;
        }
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

    function loadServer () {
        return Promise.all([
            api('GET', '/api/server'),
            api('GET', '/api/credentials')
        ]).then(function (pair) {
            var hub = pair[0] || {};
            var creds = pair[1] || {};
            var note = $('#server-hub-note');
            var current = $('#server-hub-current');
            var endpoint = $('#server-endpoint');
            var endpointCurrent = $('#server-endpoint-current');
            var host = $('#server-host');
            var port = $('#server-port');
            if (note) { note.textContent = hub.note || ''; }
            if (hub.current && host && !host.value) { host.value = hub.current.hostname || 'api.5x1.com'; }
            if (hub.current && port && !port.value) { port.value = hub.current.port || '443'; }
            if (!hub.current && host && !host.value) { host.value = 'api.5x1.com'; }
            if (!hub.current && port && !port.value) { port.value = '443'; }
            if (current) {
                current.textContent = hub.current
                    ? ('Current hub ' + hub.current.hostname + ':' + hub.current.port)
                    : (hub.error || '');
            }
            if (endpoint && !endpoint.value) {
                endpoint.value = creds.endpoint || 'http://joap.5x1.com:80';
            }
            if (endpointCurrent) {
                endpointCurrent.textContent = creds.endpoint
                    ? ('Current endpoint ' + creds.endpoint)
                    : (creds.error || '');
            }
        });
    }

    function saveHub () {
        var host = $('#server-host');
        var port = $('#server-port');
        return api('POST', '/api/server', {
            hostname: host ? host.value.trim() : 'api.5x1.com',
            port: port ? Number(port.value) : 443
        }).then(function () {
            toast('Hub saved. Reboot the robot to apply it.', 'ok');
            return loadServer();
        });
    }

    function saveEndpoint () {
        var input = $('#server-endpoint');
        return api('POST', '/api/credentials', {
            endpoint: input ? input.value.trim() : 'http://joap.5x1.com:80'
        }).then(function (data) {
            toast('Endpoint saved.', 'ok');
            var current = $('#server-endpoint-current');
            if (current && data && data.endpoint) {
                current.textContent = 'Current endpoint ' + data.endpoint;
            }
        });
    }

    var panelMeta = {
        status: {
            title: 'Status',
            actions: [{ action: 'refresh-status', label: 'Refresh' }]
        },
        screen: {
            title: 'Screen',
            actions: [{ action: 'screen-refresh', label: 'Refresh' }]
        },
        photos: {
            title: 'Photos',
            actions: [{ action: 'refresh-photos', label: 'Refresh' }]
        },
        people: {
            title: 'People',
            actions: [{ action: 'refresh-people', label: 'Refresh' }]
        },
        reports: {
            title: 'Personal Reports',
            actions: [{ action: 'refresh-reports', label: 'Refresh' }]
        },
        store: { title: 'Store', actions: [{ action: 'refresh-store', label: 'Refresh' }] },
        etc: {
            title: 'More',
            actions: [{ action: 'refresh-etc', label: 'Refresh' }]
        },
        server: {
            title: 'Server',
            actions: [{ action: 'refresh-server', label: 'Refresh' }]
        }
    };

    panelMeta.menu = { title: 'Main Menu', actions: [] };
    var loaders = {
        status: loadStatus,
        screen: loadScreen,
        photos: loadPhotos,
        people: loadPeople,
        reports: function () { return Promise.all([loadPeople(), loadUnits()]); },
        store: themeUI.loadStore,
        menu: menuUI.load,
        etc: loadEtc,
        server: loadServer
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
        if (name === 'themes' || name === 'skills') { name = 'store'; }
        if (!loaders[name]) { name = 'status'; }
        if (name !== 'screen') { stopScreen(); }
        state.panel = name;
        document.querySelector('main').classList.toggle('is-store', name === 'store');
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
        'refresh-photos': loadPhotos,
        'refresh-people': loadPeople,
        'refresh-store': function () { return themeUI.refreshStore(); },
        'refresh-reports': function () { return loaders.reports(); },
        'refresh-etc': loadEtc,
        'refresh-server': loadServer,
        'save-hub': saveHub,
        'save-endpoint': saveEndpoint,
        'save-units': saveUnits,
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
            var birthday = document.querySelector('.people-birthday[data-member-id="' + memberId + '"]');
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
                phoneticName: phonetic ? phonetic.value : '',
                birthday: birthday ? birthday.value : ''
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
        'save-calendar': function (button) {
            var memberId = button && button.getAttribute('data-member-id');
            if (!memberId) { return; }
            var url = document.querySelector('.people-calendar-url[data-member-id="' + memberId + '"]');
            var enabled = document.querySelector('.people-calendar-enabled[data-member-id="' + memberId + '"]');
            var icalUrl = url ? url.value.trim() : '';
            var body = { id: memberId, isEnabled: !enabled || enabled.checked };
            if (icalUrl) { body.icalUrl = icalUrl; }
            return api('PUT', '/api/people/calendar', body).then(function (data) {
                toast('Calendar saved.', 'ok');
                renderPeople(data);
            });
        },
        'test-calendar': function (button) {
            var memberId = button && button.getAttribute('data-member-id');
            if (!memberId) { return; }
            var url = document.querySelector('.people-calendar-url[data-member-id="' + memberId + '"]');
            var icalUrl = url ? url.value.trim() : '';
            var body = { id: memberId };
            if (icalUrl) { body.icalUrl = icalUrl; }
            return api('POST', '/api/people/calendar/test', body).then(function (data) {
                var probe = data.calendarTest || {};
                if (probe.ok) {
                    var count = typeof probe.todayEventCount === 'number' ? probe.todayEventCount : 0;
                    toast('Calendar looks good. ' + count + ' event' + (count === 1 ? '' : 's') + ' today.', 'ok');
                } else {
                    toast(probe.error || 'Calendar test failed.', 'error');
                }
                renderPeople(data);
            });
        },
        'save-work': function (button) {
            var memberId = button && button.getAttribute('data-member-id');
            var input = document.querySelector('.people-work-address[data-member-id="' + memberId + '"]');
            var address = input ? input.value.trim() : '';
            if (!memberId || !address) { toast('Enter a work address.', 'error'); return; }
            toast('Looking up the address…');
            return api('PUT', '/api/people/work', { id: memberId, address: address }).then(function (data) {
                toast('Work address saved.', 'ok');
                renderPeople(data);
            });
        },
        'clear-work': function (button) {
            var memberId = button && button.getAttribute('data-member-id');
            if (!memberId || !confirm('Remove this work address?')) { return; }
            return api('DELETE', '/api/people/work?id=' + encodeURIComponent(memberId)).then(function (data) {
                toast('Work address removed.', 'ok');
                renderPeople(data);
            });
        },
        'save-home': function (button) {
            var memberId = button && button.getAttribute('data-member-id');
            var input = document.querySelector('.people-home-address[data-member-id="' + memberId + '"]');
            var address = input ? input.value.trim() : '';
            if (!memberId || !address) { toast('Enter a home address.', 'error'); return; }
            toast('Looking up the address…');
            return api('PUT', '/api/people/home', { id: memberId, address: address }).then(function (data) {
                toast('Home address saved.', 'ok');
                renderPeople(data);
            });
        },
        'clear-home': function (button) {
            var memberId = button && button.getAttribute('data-member-id');
            if (!memberId || !confirm('Remove this home address?')) { return; }
            return api('DELETE', '/api/people/home?id=' + encodeURIComponent(memberId)).then(function (data) {
                toast('Home address removed.', 'ok');
                renderPeople(data);
            });
        },
        'save-news': function (button) {
            var memberId = button && button.getAttribute('data-member-id');
            if (!memberId) { return; }
            var boxes = document.querySelectorAll('.news-topic[data-member-id="' + memberId + '"]');
            var disabled = [];
            for (var i = 0; i < boxes.length; i++) {
                if (!boxes[i].checked) { disabled.push(boxes[i].value); }
            }
            if (boxes.length && disabled.length === boxes.length) { toast('Leave at least one topic on.', 'error'); return; }
            return api('PUT', '/api/people/news', { id: memberId, disabledTopics: disabled }).then(function (data) {
                toast('News topics saved.', 'ok');
                renderPeople(data);
            });
        },
        'clear-calendar': function (button) {
            var memberId = button && button.getAttribute('data-member-id');
            if (!memberId) { return; }
            if (!confirm('Remove this personal calendar?')) { return; }
            return api('DELETE', '/api/people/calendar?id=' + encodeURIComponent(memberId))
                .then(function (data) {
                    toast('Calendar removed.', 'ok');
                    renderPeople(data);
                });
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
        'add-store': themeUI.addSource,
        'close-theme-details': themeUI.closeDetails

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

    $('#theme-file').addEventListener('change', function (event) {
        if (event.target.files.length) { themeUI.upload(event.target.files[0]); }
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

    // Dropping a file anywhere else should not navigate away from the page.
    window.addEventListener('dragover', function (event) { event.preventDefault(); });
    window.addEventListener('drop', function (event) { event.preventDefault(); });

    window.addEventListener('hashchange', function () {
        var name = location.hash.slice(1);
        if ((loaders[name] || name === 'themes' || name === 'skills') && name !== state.panel) { showPanel(name); }
    });

    setInterval(function () {
        api('GET', '/api/status').then(function () { setLive(true); }).catch(function () { setLive(false); });
    }, 15000);

    bindScreenInput();

    $('#reports-person').addEventListener('change', function (event) {
        reportsPersonId = event.target.value;
        renderReports(reportsData);
    });

    document.addEventListener('visibilitychange', function () {
        if (state.panel !== 'screen') { return; }
        if (document.hidden) {
            stopScreen();
        } else {
            loadScreen().catch(reportError);
        }
    });

    showPanel(location.hash.slice(1) || 'status');
}());
