(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.bejukebox = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function (global){(function (){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getNodeRequire() {
    const candidates = [];
    try {
        if (typeof window !== 'undefined' && typeof window.require === 'function') {
            candidates.push(window.require);
        }
    }
    catch (e) { }
    try {
        if (typeof global !== 'undefined' && typeof global.require === 'function') {
            candidates.push(global.require);
        }
    }
    catch (e) { }
    try {
        const g = typeof global !== 'undefined' ? global : null;
        if (g && g.process && g.process.mainModule && typeof g.process.mainModule.require === 'function') {
            candidates.push(g.process.mainModule.require.bind(g.process.mainModule));
        }
    }
    catch (e) { }
    for (let i = 0; i < candidates.length; i++) {
        try {
            const r = candidates[i];
            const fs = r('fs');
            if (fs && typeof fs.readFileSync === 'function') {
                return r;
            }
        }
        catch (e) { }
    }
    return null;
}
exports.getNodeRequire = getNodeRequire;
function mimeForFormat(format) {
    const f = (format || '').toUpperCase();
    if (f === 'MP3') {
        return 'audio/mpeg';
    }
    if (f === 'OGG' || f === 'OPUS' || f === 'OGA') {
        return 'audio/ogg';
    }
    if (f === 'WAV') {
        return 'audio/wav';
    }
    return 'application/octet-stream';
}
exports.mimeForFormat = mimeForFormat;
function fileToBlobUrl(absPath, mime) {
    const req = getNodeRequire();
    if (!req) {
        throw new Error('Node require is not available');
    }
    const fs = req('fs');
    const raw = fs.readFileSync(absPath);
    const blob = new Blob([raw], { type: mime });
    return { url: URL.createObjectURL(blob), revoke: true };
}
exports.fileToBlobUrl = fileToBlobUrl;

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const be_framework_1 = require("@be/be-framework");
const jibo = require("jibo");
const MusicLibrary_1 = require("./models/MusicLibrary");
const CoverThumbs_1 = require("./views/CoverThumbs");
const JukeboxMenus_1 = require("./views/JukeboxMenus");
const PlayerOverlay_1 = require("./views/PlayerOverlay");
const StatusOverlay_1 = require("./views/StatusOverlay");
class JukeboxSkill extends be_framework_1.BeSkill {
    constructor(assetPack) {
        super(assetPack);
        this.albums = [];
        this.currentAlbum = null;
        this.menus = null;
        this.player = null;
        this.status = null;
        this.screen = 'loading';
        this.exiting = false;
        this.screenGestureHandler = null;
    }
    postInit(done) {
        done();
    }
    preload(done) {
        const es = jibo.embodied && jibo.embodied.speech;
        if (es && typeof es.installDelegate === 'function') {
            es.installDelegate(this.assetPack);
        }
        done();
    }
    open(result) {
        this.exiting = false;
        this.screen = 'loading';
        this.subscribeSwipeDown();
        try {
            this.status = StatusOverlay_1.default.show('Loading Jukebox...\nScanning music folder...');
        }
        catch (err) {
            console.error('[jukebox] could not show loading screen:', err);
        }
        const self = this;
        let finished = false;
        const watchdog = setTimeout(() => {
            if (finished || !self.status) {
                return;
            }
            self.status.showError('Scan is taking too long (or hung).', 'Check that music lives at:\n' +
                '/opt/jibo/Jibo/Skills/@be/be/node_modules/@be/jukebox/music/\n\n' +
                'Or that a previous update left it in /opt/tmp/jukebox-music/');
        }, 12000);
        setTimeout(() => {
            try {
                self.finishOpen();
            }
            finally {
                finished = true;
                clearTimeout(watchdog);
            }
        }, 50);
    }
    finishOpen() {
        try {
            if (this.status) {
                this.status.setLoading('Loading Jukebox...\nScanning music folder...');
            }
            const scan = MusicLibrary_1.default.scan(this.assetPack);
            console.log('[jukebox] scan result:\n' + (scan.detail || '(no detail)'));
            if (scan.error) {
                if (this.status) {
                    this.status.showError(scan.error, scan.detail);
                }
                return;
            }
            this.albums = scan.albums || [];
            if (this.status) {
                this.status.setLoading(this.albums.length
                    ? ('Found ' + this.albums.length + ' album(s).\nPreparing covers...')
                    : 'No albums found yet.\nOpening menu...');
            }
            const self = this;
            CoverThumbs_1.default.prepare(this.albums).then(() => {
                if (self.status) {
                    self.status.setLoading(self.albums.length
                        ? ('Found ' + self.albums.length + ' album(s).\nOpening menu...')
                        : 'No albums found yet.\nOpening menu...');
                }
                setTimeout(() => {
                    try {
                        self.menus = new JukeboxMenus_1.default();
                        self.player = new PlayerOverlay_1.default();
                        if (self.status) {
                            self.status.dismiss();
                            self.status = null;
                        }
                        self.showAlbumMenu();
                    }
                    catch (err) {
                        console.error('[jukebox] UI failed to start:', err);
                        if (self.status) {
                            self.status.showError('Player UI failed to start.', (scan.detail ? scan.detail + '\n\n' : '') +
                                (err && err.stack ? err.stack : String(err)));
                        }
                        else {
                            try {
                                self.status = StatusOverlay_1.default.show('Player UI failed to start.');
                                self.status.showError('Player UI failed to start.', err && err.stack ? err.stack : String(err));
                            }
                            catch (e2) { }
                        }
                    }
                }, 0);
            }).catch((err) => {
                console.warn('[jukebox] cover thumbs failed, opening with full covers', err);
                setTimeout(() => {
                    try {
                        self.menus = new JukeboxMenus_1.default();
                        self.player = new PlayerOverlay_1.default();
                        if (self.status) {
                            self.status.dismiss();
                            self.status = null;
                        }
                        self.showAlbumMenu();
                    }
                    catch (e2) {
                        console.error('[jukebox] UI failed to start:', e2);
                    }
                }, 0);
            });
        }
        catch (err) {
            console.error('[jukebox] open failed:', err);
            if (this.status) {
                this.status.showError('Jukebox failed to open.', err && err.stack ? err.stack : String(err));
            }
        }
    }
    showAlbumMenu() {
        if (!this.menus) {
            return;
        }
        if (this.player && this.player.isVisible()) {
            this.player.hide();
        }
        this.screen = 'albums';
        this.currentAlbum = null;
        this.menus.showAlbums(this.albums, (albumId) => {
            this.openAlbum(albumId);
        });
    }
    openAlbum(albumId) {
        const album = this.findAlbum(albumId);
        if (!album) {
            console.warn('[jukebox] album not found:', albumId);
            return;
        }
        this.currentAlbum = album;
        if (album.isSingle && album.tracks.length === 1) {
            this.playTrack(album.id, 0);
            return;
        }
        this.showTrackMenu();
    }
    showTrackMenu() {
        if (!this.menus || !this.currentAlbum) {
            return;
        }
        if (this.player && this.player.isVisible()) {
            this.player.hide();
        }
        this.screen = 'tracks';
        const nowPlaying = !!(this.player &&
            this.player.hasActiveTrack() &&
            this.player.getAlbumId() === this.currentAlbum.id);
        this.menus.showTracks(this.currentAlbum, (albumId, trackIndex) => {
            this.playTrack(albumId, trackIndex);
        }, {
            nowPlaying,
            onNowPlaying: () => {
                if (this.player && this.player.hasActiveTrack()) {
                    this.screen = 'player';
                    this.player.show();
                }
            }
        });
    }
    playTrack(albumId, trackIndex) {
        const album = this.findAlbum(albumId) || this.currentAlbum;
        if (!album || !album.tracks[trackIndex]) {
            console.warn('[jukebox] track not found', albumId, trackIndex);
            return;
        }
        this.currentAlbum = album;
        if (!this.player) {
            this.player = new PlayerOverlay_1.default();
        }
        this.screen = 'player';
        this.player.play(album, trackIndex);
    }
    findAlbum(id) {
        for (let i = 0; i < this.albums.length; i++) {
            if (this.albums[i].id === id) {
                return this.albums[i];
            }
        }
        return null;
    }
    close(done) {
        this.unsubscribeSwipeDown();
        if (this.player) {
            try {
                this.player.cleanup();
            }
            catch (e) { }
            this.player = null;
        }
        if (this.status) {
            try {
                this.status.dismiss();
            }
            catch (e) { }
            this.status = null;
        }
        const finish = () => {
            this.menus = null;
            this.albums = [];
            this.currentAlbum = null;
            this.screen = 'loading';
            done();
        };
        if (this.menus) {
            try {
                this.menus.cleanup(() => { finish(); });
                return;
            }
            catch (e) { }
        }
        finish();
    }
    subscribeSwipeDown() {
        try {
            const shared = jibo.globalEvents && jibo.globalEvents.shared;
            if (!shared || !shared.screenGesture) {
                return;
            }
            this.screenGestureHandler = (gesture) => {
                if (String(gesture).toLowerCase() !== 'swipedown' || this.exiting) {
                    return;
                }
                this.handleSwipeDown();
            };
            shared.screenGesture.on(this.screenGestureHandler);
        }
        catch (err) {
            console.warn('[jukebox] could not subscribe to swipe-down gesture', err);
        }
    }
    handleSwipeDown() {
        if (this.screen === 'player' || (this.player && this.player.isVisible())) {
            if (this.currentAlbum && this.currentAlbum.isSingle) {
                console.log('[jukebox] swipe-down: player -> albums (single)');
                this.showAlbumMenu();
            }
            else if (this.currentAlbum) {
                console.log('[jukebox] swipe-down: player -> tracks');
                this.showTrackMenu();
            }
            else {
                this.showAlbumMenu();
            }
            return;
        }
        if (this.screen === 'tracks') {
            console.log('[jukebox] swipe-down: tracks -> albums');
            this.showAlbumMenu();
            return;
        }
        this.exiting = true;
        console.log('[jukebox] swipe-down: exiting to idle');
        this.exit();
    }
    unsubscribeSwipeDown() {
        if (!this.screenGestureHandler) {
            return;
        }
        try {
            const shared = jibo.globalEvents && jibo.globalEvents.shared;
            if (shared && shared.screenGesture) {
                shared.screenGesture.removeListener(this.screenGestureHandler);
            }
        }
        catch (err) {
            console.warn('[jukebox] could not unsubscribe swipe-down gesture', err);
        }
        this.screenGestureHandler = null;
    }
}
module.exports = JukeboxSkill;

},{"./models/MusicLibrary":4,"./views/CoverThumbs":5,"./views/JukeboxMenus":6,"./views/PlayerOverlay":7,"./views/StatusOverlay":8,"@be/be-framework":undefined,"jibo":undefined}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CLIENT = 'BEast-Jukebox/0.1.0 (https://github.com/zane/BEast-Skills)';
const SEARCH_URL = 'https://lrclib.net/api/search';
const GET_URL = 'https://lrclib.net/api/get';
class LyricsService {
    static fetch(album, track, durationSec) {
        const trackName = track ? track.title : '';
        const artistName = album && album.artist ? album.artist : '';
        const albumName = album
            ? (album.isSingle ? trackName : (album.albumTitle || album.title || ''))
            : '';
        const tryGet = !!(artistName && trackName && durationSec && durationSec > 0);
        const run = tryGet
            ? LyricsService.getExact(trackName, artistName, albumName || trackName, durationSec)
                .catch(() => LyricsService.search(trackName, artistName, albumName, durationSec))
            : LyricsService.search(trackName, artistName, albumName, durationSec);
        return run.then((record) => LyricsService.toResult(record));
    }
    static getExact(trackName, artistName, albumName, duration) {
        const q = 'track_name=' + encodeURIComponent(trackName) +
            '&artist_name=' + encodeURIComponent(artistName) +
            '&album_name=' + encodeURIComponent(albumName) +
            '&duration=' + encodeURIComponent(String(Math.round(duration)));
        return LyricsService.httpGet(GET_URL + '?' + q).then((body) => {
            const data = JSON.parse(body);
            if (!data || data.code === 404) {
                throw new Error('not found');
            }
            return data;
        });
    }
    static search(trackName, artistName, albumName, durationSec) {
        const parts = [trackName, artistName, albumName].filter((p) => !!p && String(p).trim());
        const q = encodeURIComponent(parts.join(' '));
        return LyricsService.httpGet(SEARCH_URL + '?q=' + q).then((body) => {
            const list = JSON.parse(body);
            if (!Array.isArray(list) || !list.length) {
                throw new Error('no results');
            }
            return LyricsService.pickBest(list, trackName, artistName, albumName, durationSec);
        });
    }
    static pickBest(list, trackName, artistName, albumName, durationSec) {
        let best = null;
        let bestScore = -1;
        for (let i = 0; i < list.length; i++) {
            const r = list[i];
            if (!r) {
                continue;
            }
            const hasSynced = !!(r.syncedLyrics && String(r.syncedLyrics).trim());
            const hasPlain = !!(r.plainLyrics && String(r.plainLyrics).trim());
            if (!hasSynced && !hasPlain && !r.instrumental) {
                continue;
            }
            let score = 0;
            if (hasSynced) {
                score += 50;
            }
            else if (hasPlain) {
                score += 20;
            }
            if (r.instrumental && !hasSynced && !hasPlain) {
                score += 5;
            }
            if (LyricsService.fuzzyEq(r.trackName, trackName)) {
                score += 30;
            }
            if (artistName && LyricsService.fuzzyEq(r.artistName, artistName)) {
                score += 20;
            }
            if (albumName && LyricsService.fuzzyEq(r.albumName, albumName)) {
                score += 15;
            }
            if (durationSec && r.duration) {
                const diff = Math.abs(Number(r.duration) - durationSec);
                if (diff <= 2) {
                    score += 25;
                }
                else if (diff <= 5) {
                    score += 10;
                }
                else if (diff > 30) {
                    score -= 20;
                }
            }
            if (score > bestScore) {
                bestScore = score;
                best = r;
            }
        }
        if (!best) {
            throw new Error('no usable lyrics');
        }
        return best;
    }
    static toResult(record) {
        if (!record) {
            throw new Error('empty record');
        }
        const synced = LyricsService.parseSynced(record.syncedLyrics || '');
        const plain = String(record.plainLyrics || '').trim();
        if (record.instrumental && !synced.length && !plain) {
            return {
                lines: [],
                plain: '',
                instrumental: true,
                source: (record.artistName || '') + ' / ' + (record.trackName || '')
            };
        }
        return {
            lines: synced,
            plain: plain || synced.map((l) => l.text).filter(Boolean).join('\n'),
            instrumental: !!record.instrumental && !synced.length && !plain,
            source: (record.artistName || '') + ' — ' + (record.trackName || '')
        };
    }
    static parseSynced(raw) {
        if (!raw) {
            return [];
        }
        const lines = [];
        const re = /\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]\s*(.*)/g;
        const parts = String(raw).split(/\r?\n/);
        for (let i = 0; i < parts.length; i++) {
            const row = parts[i];
            re.lastIndex = 0;
            let m;
            const times = [];
            let text = '';
            while ((m = re.exec(row)) !== null) {
                const min = parseInt(m[1], 10) || 0;
                const sec = parseInt(m[2], 10) || 0;
                let frac = m[3] || '0';
                if (frac.length === 1) {
                    frac += '00';
                }
                else if (frac.length === 2) {
                    frac += '0';
                }
                const ms = parseInt(frac.substring(0, 3), 10) || 0;
                times.push(min * 60 + sec + ms / 1000);
                text = m[4] != null ? String(m[4]).trim() : '';
            }
            for (let t = 0; t < times.length; t++) {
                lines.push({ time: times[t], text });
            }
        }
        lines.sort((a, b) => a.time - b.time);
        return lines;
    }
    static activeIndex(lines, timeSec) {
        if (!lines || !lines.length) {
            return -1;
        }
        let idx = -1;
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].time <= timeSec + 0.05) {
                idx = i;
            }
            else {
                break;
            }
        }
        return idx;
    }
    static fuzzyEq(a, b) {
        const n = (s) => String(s || '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        const na = n(a);
        const nb = n(b);
        if (!na || !nb) {
            return false;
        }
        return na === nb || na.indexOf(nb) >= 0 || nb.indexOf(na) >= 0;
    }
    static httpGet(url) {
        return new Promise((resolve, reject) => {
            try {
                const xhr = new XMLHttpRequest();
                xhr.open('GET', url, true);
                xhr.timeout = 12000;
                try {
                    xhr.setRequestHeader('Lrclib-Client', CLIENT);
                }
                catch (e) { }
                try {
                    xhr.setRequestHeader('X-User-Agent', CLIENT);
                }
                catch (e2) { }
                xhr.onreadystatechange = () => {
                    if (xhr.readyState !== 4) {
                        return;
                    }
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve(xhr.responseText || '');
                    }
                    else if (xhr.status === 404) {
                        reject(new Error('not found'));
                    }
                    else {
                        reject(new Error('HTTP ' + xhr.status));
                    }
                };
                xhr.onerror = () => { reject(new Error('network error')); };
                xhr.ontimeout = () => { reject(new Error('timeout')); };
                xhr.send();
            }
            catch (err) {
                reject(err);
            }
        });
    }
}
exports.default = LyricsService;

},{}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
const AudioSupport_1 = require("../audio/AudioSupport");
const AUDIO_EXT = /\.(mp3|opus|ogg|oga)$/i;
const COVER_NAMES = ['cover.png', 'cover.jpg', 'cover.jpeg', 'folder.png', 'folder.jpg'];
class MusicLibrary {
    static scan(assetPack) {
        try {
            const req = AudioSupport_1.getNodeRequire();
            if (!req) {
                return {
                    albums: [],
                    dir: null,
                    error: 'Cannot access the filesystem (Node require is not available).',
                    detail: 'Electron window.require / process.mainModule.require failed.'
                };
            }
            const fs = req('fs');
            const path = req('path');
            const dir = MusicLibrary.resolveMusicDir(assetPack, req);
            if (!dir) {
                return {
                    albums: [],
                    dir: null,
                    error: 'Could not resolve the music/ folder path.',
                    detail: 'assetPack=' + String(assetPack) +
                        '\nTried PathUtils, package root, and /opt/jibo/... fallbacks.'
                };
            }
            if (!fs.existsSync(dir)) {
                return {
                    albums: [],
                    dir,
                    error: 'music/ folder not found on disk.',
                    detail: 'Looked for:\n' + dir +
                        '\n\nCreate album folders under that path, e.g.\n' +
                        'music/CHASER/cover.png\nmusic/CHASER/song.opus'
                };
            }
            let entries;
            try {
                entries = fs.readdirSync(dir);
            }
            catch (err) {
                return {
                    albums: [],
                    dir,
                    error: 'Could not read the music/ folder.',
                    detail: 'Path: ' + dir + '\n' + MusicLibrary.formatErr(err)
                };
            }
            const albums = [];
            const skipped = [];
            const seenIds = {};
            const addAlbum = (album) => {
                if (!album || !album.tracks.length) {
                    return false;
                }
                if (seenIds[album.id]) {
                    album.id = album.id + '_' + albums.length;
                }
                seenIds[album.id] = true;
                albums.push(album);
                return true;
            };
            for (let i = 0; i < entries.length; i++) {
                const name = entries[i];
                if (name.charAt(0) === '.') {
                    continue;
                }
                if (name === 'README.md') {
                    continue;
                }
                const albumPath = path.join(dir, name);
                let stat;
                try {
                    stat = fs.statSync(albumPath);
                }
                catch (e) {
                    continue;
                }
                if (!stat || !stat.isDirectory()) {
                    skipped.push(name + ' (not a folder — albums must be folders)');
                    continue;
                }
                try {
                    const album = MusicLibrary.scanAlbum(name, MusicLibrary.prettifyFolder(name), '', albumPath, assetPack, fs, path);
                    if (addAlbum(album)) {
                        continue;
                    }
                    const kids = fs.readdirSync(albumPath);
                    let nestedFound = 0;
                    for (let k = 0; k < kids.length; k++) {
                        const kid = kids[k];
                        if (kid.charAt(0) === '.') {
                            continue;
                        }
                        const kidPath = path.join(albumPath, kid);
                        let kidStat;
                        try {
                            kidStat = fs.statSync(kidPath);
                        }
                        catch (e) {
                            continue;
                        }
                        if (!kidStat || !kidStat.isDirectory()) {
                            continue;
                        }
                        const nestedId = name + '/' + kid;
                        const nested = MusicLibrary.scanAlbum(nestedId, MusicLibrary.prettifyFolder(kid), MusicLibrary.prettifyFolder(name), kidPath, assetPack, fs, path);
                        if (addAlbum(nested)) {
                            nestedFound++;
                        }
                    }
                    if (!nestedFound) {
                        const sample = kids.filter((f) => f.charAt(0) !== '.').slice(0, 8);
                        skipped.push(name + ' (no .mp3/.opus/.ogg inside' +
                            (sample.length ? '; saw: ' + sample.join(', ') : '') + ')');
                    }
                }
                catch (err) {
                    skipped.push(name + ' (error: ' + (err && err.message ? err.message : String(err)) + ')');
                }
            }
            albums.sort((a, b) => a.title.toLowerCase().localeCompare(b.title.toLowerCase()));
            console.log('[jukebox] found', albums.length, 'album(s) in', dir);
            const detailLines = [
                'music dir: ' + dir,
                'assetPack: ' + String(assetPack),
                'entries: ' + entries.length,
                'albums: ' + albums.length
            ];
            if (skipped.length) {
                detailLines.push('skipped:');
                for (let s = 0; s < skipped.length; s++) {
                    detailLines.push('  - ' + skipped[s]);
                }
            }
            return {
                albums,
                dir,
                error: null,
                detail: detailLines.join('\n')
            };
        }
        catch (err) {
            console.error('[jukebox] failed to scan music folder:', err);
            return {
                albums: [],
                dir: null,
                error: 'Unexpected error while scanning music/.',
                detail: MusicLibrary.formatErr(err)
            };
        }
    }
    static formatErr(err) {
        if (!err) {
            return String(err);
        }
        const msg = err.message || String(err);
        const stack = err.stack ? '\n' + err.stack : '';
        return msg + stack;
    }
    static scanAlbum(id, albumTitle, artist, albumPath, assetPack, fs, path) {
        const files = fs.readdirSync(albumPath);
        const tracks = [];
        let coverFile = null;
        const lowerFiles = files.map((f) => ({ raw: f, lower: f.toLowerCase() }));
        for (let c = 0; c < COVER_NAMES.length && !coverFile; c++) {
            const want = COVER_NAMES[c];
            for (let f = 0; f < lowerFiles.length; f++) {
                if (lowerFiles[f].lower === want) {
                    coverFile = lowerFiles[f].raw;
                    break;
                }
            }
        }
        const audioFiles = files
            .filter((name) => AUDIO_EXT.test(name))
            .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
        const relDir = id;
        for (let i = 0; i < audioFiles.length; i++) {
            const file = audioFiles[i];
            const abs = path.join(albumPath, file);
            const rel = relDir + '/' + file;
            tracks.push({
                file: rel,
                path: abs,
                title: MusicLibrary.prettifyName(file),
                format: MusicLibrary.formatLabel(file),
                url: MusicLibrary.resolveAssetUrl('music/' + rel, abs)
            });
        }
        const coverAbs = coverFile ? path.join(albumPath, coverFile) : null;
        const title = artist
            ? (artist + ' — ' + albumTitle)
            : albumTitle;
        const isSingle = tracks.length === 1 &&
            MusicLibrary.titlesMatch(tracks[0].title, albumTitle);
        return {
            id,
            title,
            albumTitle,
            artist: artist || '',
            coverUrl: coverAbs
                ? MusicLibrary.resolveAssetUrl('music/' + relDir + '/' + coverFile, coverAbs)
                : null,
            coverPath: coverAbs || null,
            isSingle,
            tracks
        };
    }
    static resolveMusicDir(assetPack, req) {
        const nodeRequire = req || AudioSupport_1.getNodeRequire();
        if (!nodeRequire) {
            return null;
        }
        const fs = nodeRequire('fs');
        const path = nodeRequire('path');
        const candidates = [
            '/opt/jibo/Jibo/Skills/@be/be/node_modules/@be/jukebox/music',
            '/opt/tmp/jukebox-music'
        ];
        try {
            const cwd = typeof process !== 'undefined' && process.cwd ? process.cwd() : null;
            if (cwd) {
                candidates.push(path.join(cwd, '@be', 'be', 'node_modules', '@be', 'jukebox', 'music'));
                candidates.push(path.join(cwd, 'node_modules', '@be', 'jukebox', 'music'));
                candidates.push(path.join(cwd, 'music'));
            }
        }
        catch (e) { }
        for (let i = 0; i < candidates.length; i++) {
            const c = candidates[i];
            if (!c) {
                continue;
            }
            try {
                if (fs.existsSync(c) && fs.statSync(c).isDirectory()) {
                    console.log('[jukebox] music dir:', c);
                    return c;
                }
            }
            catch (e) { }
        }
        return candidates[0] || null;
    }
    static resolveAssetUrl(relPath, absPath) {
        if (absPath) {
            return MusicLibrary.pathToFileUrl(absPath);
        }
        try {
            const PathUtils = jibo.utils && jibo.utils.PathUtils;
            if (PathUtils && typeof PathUtils.getAssetUri === 'function') {
                const uri = PathUtils.getAssetUri(relPath);
                if (uri) {
                    return uri;
                }
            }
        }
        catch (err) {
            console.warn('[jukebox] resolveAssetUrl failed for', relPath, err);
        }
        return './' + relPath.split('/').map(encodeURIComponent).join('/');
    }
    static pathToFileUrl(absPath) {
        const parts = String(absPath).split('/');
        const encoded = parts.map((p, i) => {
            if (i === 0 && p === '') {
                return '';
            }
            return encodeURIComponent(p);
        }).join('/');
        return 'file://' + encoded;
    }
    static uriToPath(uri) {
        let p = String(uri);
        if (p.indexOf('file://') === 0) {
            p = p.replace(/^file:\/\//, '');
            if (p.indexOf('localhost/') === 0) {
                p = p.substring('localhost'.length);
            }
        }
        try {
            p = decodeURIComponent(p);
        }
        catch (e) { }
        return p;
    }
    static prettifyName(file) {
        return file
            .replace(/\.(mp3|opus|ogg|oga)$/i, '')
            .replace(/_/g, ' ')
            .trim();
    }
    static prettifyFolder(name) {
        return String(name).replace(/_/g, ' ').trim();
    }
    static titlesMatch(a, b) {
        const norm = (s) => String(s || '')
            .toLowerCase()
            .replace(/[_]+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        const na = norm(a);
        const nb = norm(b);
        return !!na && na === nb;
    }
    static formatLabel(file) {
        const match = file.match(/\.([^.]+)$/);
        if (!match) {
            return '';
        }
        const ext = match[1].toLowerCase();
        if (ext === 'oga') {
            return 'OGG';
        }
        return ext.toUpperCase();
    }
}
exports.default = MusicLibrary;

},{"../audio/AudioSupport":1,"jibo":undefined}],5:[function(require,module,exports){
(function (Buffer){(function (){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AudioSupport_1 = require("../audio/AudioSupport");
const THUMB_SIZE = 300;
const THUMB_DIR_CANDIDATES = [
    '/opt/tmp/jukebox-thumbs',
    '/tmp/jukebox-thumbs'
];
class CoverThumbs {
    static prepare(albums) {
        if (!albums || !albums.length) {
            return Promise.resolve();
        }
        const thumbDir = CoverThumbs.ensureThumbDir();
        const jobs = [];
        for (let i = 0; i < albums.length; i++) {
            jobs.push(CoverThumbs.prepareOne(albums[i], thumbDir));
        }
        return Promise.all(jobs).then(() => undefined);
    }
    static prepareOne(album, thumbDir) {
        if (!album || (!album.coverPath && !album.coverUrl)) {
            album.iconUrl = null;
            return Promise.resolve();
        }
        return CoverThumbs.resizeToFile(album, thumbDir)
            .then((url) => {
            album.iconUrl = url || album.coverUrl || null;
        })
            .catch((err) => {
            console.warn('[jukebox] thumb failed for', album.id, err);
            album.iconUrl = album.coverUrl || null;
        });
    }
    static resizeToFile(album, thumbDir) {
        return new Promise((resolve, reject) => {
            const req = AudioSupport_1.getNodeRequire();
            if (!req || !thumbDir) {
                resolve(album.coverUrl);
                return;
            }
            let fs;
            let path;
            try {
                fs = req('fs');
                path = req('path');
            }
            catch (err) {
                reject(err);
                return;
            }
            const safe = CoverThumbs.safeFileName(album.id);
            const outPath = path.join(thumbDir, safe + '-' + THUMB_SIZE + '.jpg');
            try {
                if (album.coverPath && fs.existsSync(outPath) && fs.existsSync(album.coverPath)) {
                    const coverStat = fs.statSync(album.coverPath);
                    const thumbStat = fs.statSync(outPath);
                    if (thumbStat.mtimeMs >= coverStat.mtimeMs && thumbStat.size > 0) {
                        resolve(CoverThumbs.pathToFileUrl(outPath));
                        return;
                    }
                }
            }
            catch (e) { }
            const img = new Image();
            let objectUrl = null;
            const cleanup = () => {
                if (objectUrl) {
                    try {
                        URL.revokeObjectURL(objectUrl);
                    }
                    catch (e) { }
                    objectUrl = null;
                }
            };
            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    canvas.width = THUMB_SIZE;
                    canvas.height = THUMB_SIZE;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                        cleanup();
                        resolve(album.coverUrl);
                        return;
                    }
                    const sw = img.naturalWidth || img.width;
                    const sh = img.naturalHeight || img.height;
                    const side = Math.min(sw, sh);
                    const sx = Math.max(0, (sw - side) / 2);
                    const sy = Math.max(0, (sh - side) / 2);
                    ctx.fillStyle = '#1a0f28';
                    ctx.fillRect(0, 0, THUMB_SIZE, THUMB_SIZE);
                    ctx.drawImage(img, sx, sy, side, side, 0, 0, THUMB_SIZE, THUMB_SIZE);
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
                    const base64 = dataUrl.replace(/^data:image\/jpeg;base64,/, '');
                    const buf = Buffer.from(base64, 'base64');
                    fs.writeFileSync(outPath, buf);
                    cleanup();
                    resolve(CoverThumbs.pathToFileUrl(outPath));
                }
                catch (err) {
                    cleanup();
                    reject(err);
                }
            };
            img.onerror = () => {
                cleanup();
                resolve(album.coverUrl);
            };
            try {
                if (album.coverPath && fs.existsSync(album.coverPath)) {
                    const raw = fs.readFileSync(album.coverPath);
                    const mime = CoverThumbs.mimeForPath(album.coverPath);
                    const blob = new Blob([raw], { type: mime });
                    objectUrl = URL.createObjectURL(blob);
                    img.src = objectUrl;
                    return;
                }
            }
            catch (err) {
                console.warn('[jukebox] could not read cover for thumb', album.id, err);
            }
            if (album.coverUrl) {
                img.src = album.coverUrl;
            }
            else {
                resolve(null);
            }
        });
    }
    static ensureThumbDir() {
        const req = AudioSupport_1.getNodeRequire();
        if (!req) {
            return null;
        }
        let fs;
        try {
            fs = req('fs');
        }
        catch (e) {
            return null;
        }
        for (let i = 0; i < THUMB_DIR_CANDIDATES.length; i++) {
            const dir = THUMB_DIR_CANDIDATES[i];
            try {
                if (!fs.existsSync(dir)) {
                    try {
                        fs.mkdirSync(dir, { recursive: true });
                    }
                    catch (e1) {
                        fs.mkdirSync(dir);
                    }
                }
                if (fs.existsSync(dir)) {
                    return dir;
                }
            }
            catch (e) { }
        }
        return null;
    }
    static safeFileName(id) {
        return String(id || 'album')
            .replace(/[^a-zA-Z0-9._-]+/g, '_')
            .replace(/^_+|_+$/g, '')
            .substring(0, 80) || 'album';
    }
    static mimeForPath(p) {
        const lower = String(p).toLowerCase();
        if (lower.indexOf('.png') >= 0) {
            return 'image/png';
        }
        if (lower.indexOf('.jpeg') >= 0 || lower.indexOf('.jpg') >= 0) {
            return 'image/jpeg';
        }
        if (lower.indexOf('.webp') >= 0) {
            return 'image/webp';
        }
        return 'application/octet-stream';
    }
    static pathToFileUrl(absPath) {
        const parts = String(absPath).split('/');
        const encoded = parts.map((p, i) => {
            if (i === 0 && p === '') {
                return '';
            }
            return encodeURIComponent(p);
        }).join('/');
        return 'file://' + encoded;
    }
}
exports.default = CoverThumbs;

}).call(this)}).call(this,require("buffer").Buffer)

},{"../audio/AudioSupport":1,"buffer":undefined}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
const COLORS = ['0x8A2BE2', '0x3B1266'];
const DEFAULT_ICON = 'jibo://resources/actionIcons/play.png';
const NOW_PLAYING_ICON = 'jibo://resources/actionIcons/play.png';
class JukeboxMenus {
    constructor() {
        this.albumView = null;
        this.trackView = null;
        this.onAlbumPress = null;
        this.onTrackPress = null;
        this.onNowPlaying = null;
    }
    showAlbums(albums, onPress, done) {
        this.onAlbumPress = onPress;
        this.clearListeners(this.albumView);
        this.clearListeners(this.trackView);
        const list = [];
        for (let i = 0; i < albums.length; i++) {
            const album = albums[i];
            list.push({
                id: 'album_' + i,
                label: album.title,
                iconSrc: album.iconUrl || album.coverUrl || DEFAULT_ICON,
                action: {
                    type: 'event',
                    data: {
                        event: 'pressed',
                        intent: 'album|' + album.id,
                        albumId: album.id
                    }
                }
            });
        }
        const config = {
            viewConfig: {
                type: 'MenuView',
                id: 'jukeboxAlbums',
                title: albums.length ? 'Albums' : 'No albums found',
                dynamic: true,
                ignoreSwipeDown: true,
                elementsPerPage: 3,
                listDefault: {
                    menuButtonType: 'SkillButton',
                    colors: COLORS
                },
                list
            }
        };
        this.replaceWith(config, 'album', (view) => {
            this.albumView = view;
            this.trackView = null;
            const handle = (e) => {
                if (!this.onAlbumPress) {
                    return;
                }
                const id = JukeboxMenus.albumIdFromEvent(e);
                if (id) {
                    this.onAlbumPress(id);
                }
            };
            view.on('pressed', handle);
            view.on('press', handle);
            if (done) {
                done();
            }
        });
    }
    showTracks(album, onPress, opts, done) {
        this.onTrackPress = onPress;
        this.onNowPlaying = opts && opts.onNowPlaying ? opts.onNowPlaying : null;
        this.clearListeners(this.trackView);
        const list = [];
        if (opts && opts.nowPlaying) {
            list.push({
                id: 'nowPlaying',
                label: 'Now playing',
                iconSrc: NOW_PLAYING_ICON,
                colors: ['0xe8723a', '0x8a3a12'],
                action: {
                    type: 'event',
                    data: {
                        event: 'pressed',
                        intent: 'nowPlaying'
                    }
                }
            });
        }
        for (let i = 0; i < album.tracks.length; i++) {
            const track = album.tracks[i];
            list.push({
                id: 'track_' + i,
                label: track.title,
                iconSrc: album.iconUrl || album.coverUrl || DEFAULT_ICON,
                action: {
                    type: 'event',
                    data: {
                        event: 'pressed',
                        intent: 'track|' + album.id + '|' + i,
                        albumId: album.id,
                        trackIndex: i
                    }
                }
            });
        }
        const config = {
            viewConfig: {
                type: 'MenuView',
                id: 'jukeboxTracks',
                title: album.albumTitle || album.title,
                dynamic: true,
                ignoreSwipeDown: true,
                elementsPerPage: 3,
                listDefault: {
                    menuButtonType: 'ActionBigButton',
                    colors: COLORS
                },
                list
            }
        };
        this.replaceWith(config, 'track', (view) => {
            this.trackView = view;
            const handle = (e) => {
                if (!e) {
                    return;
                }
                const intent = String(e.intent || (e.data && e.data.intent) || '');
                if (intent === 'nowPlaying') {
                    if (this.onNowPlaying) {
                        this.onNowPlaying();
                    }
                    return;
                }
                if (!this.onTrackPress) {
                    return;
                }
                const parsed = JukeboxMenus.trackFromEvent(e, album.id);
                if (!parsed) {
                    return;
                }
                this.onTrackPress(parsed.albumId, parsed.trackIndex);
            };
            view.on('pressed', handle);
            view.on('press', handle);
            if (done) {
                done();
            }
        });
    }
    cleanup(done) {
        this.clearListeners(this.albumView);
        this.clearListeners(this.trackView);
        this.albumView = null;
        this.trackView = null;
        this.onAlbumPress = null;
        this.onTrackPress = null;
        this.onNowPlaying = null;
        try {
            jibo.face.views.changeView({ removeAll: true, leaveEmpty: true }, () => { if (done) {
                done();
            } }, () => { if (done) {
                done();
            } });
        }
        catch (err) {
            console.warn('[jukebox] menu cleanup failed', err);
            if (done) {
                done();
            }
        }
    }
    static albumIdFromEvent(e) {
        if (!e) {
            return null;
        }
        if (e.albumId != null) {
            return String(e.albumId);
        }
        if (e.data && e.data.albumId != null) {
            return String(e.data.albumId);
        }
        const intent = String(e.intent || (e.data && e.data.intent) || '');
        if (intent.indexOf('album|') === 0) {
            return intent.substring('album|'.length) || null;
        }
        return null;
    }
    static trackFromEvent(e, fallbackAlbumId) {
        let albumId = e.albumId != null ? String(e.albumId)
            : (e.data && e.data.albumId != null ? String(e.data.albumId) : null);
        let trackIndex = e.trackIndex != null ? e.trackIndex
            : (e.data && e.data.trackIndex != null ? e.data.trackIndex : null);
        const intent = String(e.intent || (e.data && e.data.intent) || '');
        if (intent.indexOf('track|') === 0) {
            const parts = intent.split('|');
            if (parts.length >= 3) {
                trackIndex = parts[parts.length - 1];
                albumId = parts.slice(1, -1).join('|');
            }
        }
        if (albumId == null) {
            albumId = fallbackAlbumId;
        }
        const idx = typeof trackIndex === 'number' ? trackIndex : parseInt(String(trackIndex), 10);
        if (albumId == null || isNaN(idx)) {
            return null;
        }
        return { albumId, trackIndex: idx };
    }
    replaceWith(config, _kind, onReady) {
        const open = () => {
            try {
                const view = jibo.face.views.createView('MenuView', config, true);
                jibo.face.views.changeView({ addView: view }, null, (err) => {
                    console.error('[jukebox] changeView failed:', err);
                }, (readyView) => {
                    onReady(readyView || view);
                });
            }
            catch (err) {
                console.error('[jukebox] createView MenuView failed:', err);
            }
        };
        try {
            if (jibo.face.views.currentView) {
                jibo.face.views.changeView({ removeAll: true, leaveEmpty: true }, () => { open(); }, () => { open(); });
            }
            else {
                open();
            }
        }
        catch (err) {
            console.warn('[jukebox] replaceWith remove failed, opening anyway', err);
            open();
        }
    }
    clearListeners(view) {
        if (!view || typeof view.removeAllListeners !== 'function') {
            return;
        }
        try {
            view.removeAllListeners('pressed');
            view.removeAllListeners('press');
        }
        catch (e) { }
    }
}
exports.default = JukeboxMenus;

},{"jibo":undefined}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AudioSupport_1 = require("../audio/AudioSupport");
const LyricsService_1 = require("../lyrics/LyricsService");
class PlayerOverlay {
    constructor() {
        this.root = null;
        this.album = null;
        this.trackIndex = -1;
        this.objectUrl = null;
        this.playToken = 0;
        this.lyricsToken = 0;
        this.progressRaf = 0;
        this.lastTimeText = '';
        this.lastTotalText = '';
        this.lastProgressPct = -1;
        this.visible = false;
        this.lyrics = null;
        this.lyricsLineEls = [];
        this.lastLyricsIndex = -1;
        this.showCover = true;
        this.hasLyrics = false;
        this.audio = new Audio();
        this.audio.preload = 'metadata';
        this.build();
        this.bindAudio();
        this.bindControls();
    }
    isVisible() {
        return this.visible;
    }
    isPlaying() {
        return !!(this.audio && !this.audio.paused && !this.audio.ended && this.trackIndex >= 0);
    }
    hasActiveTrack() {
        return !!(this.album && this.trackIndex >= 0);
    }
    getAlbumId() {
        return this.album ? this.album.id : null;
    }
    play(album, trackIndex) {
        this.album = album;
        this.trackIndex = trackIndex;
        this.showCover = true;
        this.hasLyrics = false;
        this.updateMeta();
        this.show();
        this.loadAndPlay(album.tracks[trackIndex]);
        this.loadLyrics();
    }
    show() {
        if (!this.root) {
            return;
        }
        this.root.style.display = 'flex';
        this.visible = true;
    }
    hide() {
        if (!this.root) {
            return;
        }
        this.root.style.display = 'none';
        this.visible = false;
    }
    cleanup() {
        this.playToken++;
        this.lyricsToken++;
        if (this.progressRaf) {
            cancelAnimationFrame(this.progressRaf);
        }
        this.progressRaf = 0;
        this.revokeObjectUrl();
        this.lyrics = null;
        this.lyricsLineEls = [];
        this.lastLyricsIndex = -1;
        try {
            if (this.audio) {
                this.audio.pause();
                this.audio.src = '';
            }
        }
        catch (e) { }
        if (this.root && this.root.parentNode) {
            this.root.parentNode.removeChild(this.root);
        }
        this.root = null;
        this.visible = false;
        this.album = null;
        this.trackIndex = -1;
    }
    build() {
        this.root = document.createElement('div');
        this.root.id = 'jukebox-player';
        this.style(this.root, {
            position: 'absolute',
            left: '0',
            top: '0',
            width: '1280px',
            height: '720px',
            zIndex: '90000',
            display: 'none',
            flexDirection: 'row',
            alignItems: 'stretch',
            boxSizing: 'border-box',
            padding: '56px 64px',
            background: 'linear-gradient(135deg, #1a0f28 0%, #0d1016 55%, #121820 100%)',
            color: '#f2f4f7',
            fontFamily: '"Avenir Next", "Helvetica Neue", Helvetica, Arial, sans-serif',
            webkitUserSelect: 'none',
            userSelect: 'none',
            webkitTouchCallout: 'none',
            touchAction: 'none'
        });
        this.root.addEventListener('selectstart', (e) => { e.preventDefault(); }, false);
        this.root.addEventListener('dragstart', (e) => { e.preventDefault(); }, false);
        this.root.addEventListener('contextmenu', (e) => { e.preventDefault(); }, false);
        this.leftPanel = document.createElement('div');
        this.style(this.leftPanel, {
            width: '520px',
            flexShrink: '0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            paddingRight: '48px',
            boxSizing: 'border-box'
        });
        this.coverWrap = document.createElement('div');
        this.style(this.coverWrap, {
            width: '480px',
            height: '560px',
            borderRadius: '12px',
            overflow: 'hidden',
            background: '#1e2430',
            boxShadow: '0 18px 48px rgba(0,0,0,0.45)',
            position: 'relative',
            display: 'none'
        });
        this.coverImg = document.createElement('img');
        this.style(this.coverImg, {
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'none',
            pointerEvents: 'none'
        });
        this.coverWrap.appendChild(this.coverImg);
        this.coverPlaceholder = document.createElement('div');
        this.style(this.coverPlaceholder, {
            position: 'absolute',
            left: '0',
            top: '0',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            letterSpacing: '1px',
            color: 'rgba(242,244,247,0.35)',
            background: 'linear-gradient(160deg, #2a1a44, #1a2230)'
        });
        this.coverPlaceholder.textContent = 'No cover';
        this.coverWrap.appendChild(this.coverPlaceholder);
        this.lyricsWrap = document.createElement('div');
        this.style(this.lyricsWrap, {
            width: '480px',
            height: '560px',
            borderRadius: '12px',
            overflow: 'hidden',
            background: 'rgba(20, 16, 28, 0.92)',
            boxShadow: '0 18px 48px rgba(0,0,0,0.45)',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box',
            padding: '28px 24px'
        });
        this.lyricsStatusEl = document.createElement('div');
        this.style(this.lyricsStatusEl, {
            fontSize: '20px',
            color: 'rgba(242,244,247,0.45)',
            textAlign: 'center',
            marginBottom: '12px',
            flexShrink: '0'
        });
        this.lyricsStatusEl.textContent = 'Loading lyrics...';
        this.lyricsWrap.appendChild(this.lyricsStatusEl);
        this.lyricsScroll = document.createElement('div');
        this.style(this.lyricsScroll, {
            flex: '1',
            overflowY: 'auto',
            overflowX: 'hidden',
            webkitOverflowScrolling: 'touch',
            paddingRight: '8px'
        });
        this.lyricsWrap.appendChild(this.lyricsScroll);
        const toggleHint = document.createElement('div');
        this.style(toggleHint, {
            marginTop: '12px',
            fontSize: '16px',
            color: 'rgba(242,244,247,0.3)',
            textAlign: 'center',
            flexShrink: '0'
        });
        toggleHint.textContent = 'Tap to show cover';
        this.lyricsWrap.appendChild(toggleHint);
        const coverHint = document.createElement('div');
        this.style(coverHint, {
            position: 'absolute',
            left: '0',
            right: '0',
            bottom: '16px',
            fontSize: '16px',
            color: 'rgba(242,244,247,0.55)',
            textAlign: 'center',
            pointerEvents: 'none'
        });
        coverHint.textContent = 'Tap to show lyrics';
        this.coverWrap.appendChild(coverHint);
        this.leftPanel.appendChild(this.lyricsWrap);
        this.leftPanel.appendChild(this.coverWrap);
        this.leftPanel.addEventListener('click', () => { this.toggleCoverLyrics(); }, false);
        this.root.appendChild(this.leftPanel);
        const right = document.createElement('div');
        this.style(right, {
            flex: '1',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            minWidth: '0',
            paddingLeft: '8px'
        });
        this.trackTitleEl = document.createElement('div');
        this.style(this.trackTitleEl, {
            fontSize: '44px',
            fontWeight: '700',
            lineHeight: '1.2',
            marginBottom: '16px',
            wordBreak: 'break-word'
        });
        this.trackTitleEl.textContent = '—';
        right.appendChild(this.trackTitleEl);
        this.albumEl = document.createElement('div');
        this.style(this.albumEl, {
            fontSize: '28px',
            fontWeight: '500',
            color: 'rgba(242,244,247,0.85)',
            marginBottom: '8px',
            wordBreak: 'break-word'
        });
        right.appendChild(this.albumEl);
        this.artistEl = document.createElement('div');
        this.style(this.artistEl, {
            fontSize: '24px',
            color: 'rgba(242,244,247,0.55)',
            marginBottom: '36px',
            wordBreak: 'break-word',
            minHeight: '28px'
        });
        right.appendChild(this.artistEl);
        this.statusEl = document.createElement('div');
        this.style(this.statusEl, {
            fontSize: '18px',
            color: 'rgba(232,114,58,0.95)',
            marginBottom: '20px',
            minHeight: '22px'
        });
        right.appendChild(this.statusEl);
        const transport = document.createElement('div');
        this.style(transport, {
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            marginBottom: '28px'
        });
        const prevBtn = this.makeIconBtn('prev', 72);
        const playBtn = this.makeIconBtn('play', 88);
        const nextBtn = this.makeIconBtn('next', 72);
        this.playPauseBtn = playBtn;
        this.playPauseIcon = playBtn.querySelector('svg');
        prevBtn.addEventListener('click', () => { this.prev(); }, false);
        playBtn.addEventListener('click', () => { this.togglePlayPause(); }, false);
        nextBtn.addEventListener('click', () => { this.next(); }, false);
        transport.appendChild(prevBtn);
        transport.appendChild(playBtn);
        transport.appendChild(nextBtn);
        right.appendChild(transport);
        const seekRow = document.createElement('div');
        this.style(seekRow, {
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
        });
        this.currentTimeEl = document.createElement('span');
        this.style(this.currentTimeEl, {
            fontSize: '18px',
            color: 'rgba(242,244,247,0.65)',
            width: '56px',
            textAlign: 'right',
            fontVariantNumeric: 'tabular-nums'
        });
        this.currentTimeEl.textContent = '0:00';
        this.progressTrack = document.createElement('div');
        this.style(this.progressTrack, {
            flex: '1',
            height: '14px',
            borderRadius: '7px',
            background: 'rgba(255,255,255,0.12)',
            position: 'relative',
            overflow: 'hidden'
        });
        this.progressFill = document.createElement('div');
        this.style(this.progressFill, {
            position: 'absolute',
            left: '0',
            top: '0',
            height: '100%',
            width: '0%',
            background: '#e8723a',
            borderRadius: '7px'
        });
        this.progressTrack.appendChild(this.progressFill);
        this.progressTrack.addEventListener('click', (e) => { this.seekFromEvent(e); }, false);
        this.totalTimeEl = document.createElement('span');
        this.style(this.totalTimeEl, {
            fontSize: '18px',
            color: 'rgba(242,244,247,0.65)',
            width: '56px',
            fontVariantNumeric: 'tabular-nums'
        });
        this.totalTimeEl.textContent = '0:00';
        seekRow.appendChild(this.currentTimeEl);
        seekRow.appendChild(this.progressTrack);
        seekRow.appendChild(this.totalTimeEl);
        right.appendChild(seekRow);
        const hint = document.createElement('div');
        this.style(hint, {
            marginTop: '36px',
            fontSize: '18px',
            color: 'rgba(242,244,247,0.35)'
        });
        hint.textContent = 'Swipe down for track list';
        right.appendChild(hint);
        this.root.appendChild(right);
        this.mount();
    }
    makeIconBtn(kind, size) {
        const btn = document.createElement('div');
        this.style(btn, {
            width: size + 'px',
            height: size + 'px',
            borderRadius: Math.round(size / 2) + 'px',
            background: 'rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: '0'
        });
        const iconSize = Math.round(size * 0.42);
        btn.appendChild(this.createTransportSvg(kind, iconSize));
        return btn;
    }
    createTransportSvg(kind, size) {
        const ns = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(ns, 'svg');
        svg.setAttribute('width', String(size));
        svg.setAttribute('height', String(size));
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('aria-hidden', 'true');
        this.style(svg, {
            display: 'block',
            pointerEvents: 'none'
        });
        const fill = '#f2f4f7';
        if (kind === 'play') {
            const path = document.createElementNS(ns, 'path');
            path.setAttribute('d', 'M8 5v14l11-7z');
            path.setAttribute('fill', fill);
            svg.appendChild(path);
        }
        else if (kind === 'pause') {
            const r1 = document.createElementNS(ns, 'rect');
            r1.setAttribute('x', '6');
            r1.setAttribute('y', '5');
            r1.setAttribute('width', '4');
            r1.setAttribute('height', '14');
            r1.setAttribute('rx', '1');
            r1.setAttribute('fill', fill);
            const r2 = document.createElementNS(ns, 'rect');
            r2.setAttribute('x', '14');
            r2.setAttribute('y', '5');
            r2.setAttribute('width', '4');
            r2.setAttribute('height', '14');
            r2.setAttribute('rx', '1');
            r2.setAttribute('fill', fill);
            svg.appendChild(r1);
            svg.appendChild(r2);
        }
        else if (kind === 'prev') {
            const bar = document.createElementNS(ns, 'rect');
            bar.setAttribute('x', '5');
            bar.setAttribute('y', '5');
            bar.setAttribute('width', '3');
            bar.setAttribute('height', '14');
            bar.setAttribute('rx', '1');
            bar.setAttribute('fill', fill);
            const path = document.createElementNS(ns, 'path');
            path.setAttribute('d', 'M19 5v14L8 12z');
            path.setAttribute('fill', fill);
            svg.appendChild(bar);
            svg.appendChild(path);
        }
        else {
            const path = document.createElementNS(ns, 'path');
            path.setAttribute('d', 'M5 5v14l11-7z');
            path.setAttribute('fill', fill);
            const bar = document.createElementNS(ns, 'rect');
            bar.setAttribute('x', '16');
            bar.setAttribute('y', '5');
            bar.setAttribute('width', '3');
            bar.setAttribute('height', '14');
            bar.setAttribute('rx', '1');
            bar.setAttribute('fill', fill);
            svg.appendChild(path);
            svg.appendChild(bar);
        }
        return svg;
    }
    setPlayPauseIcon(playing) {
        if (!this.playPauseBtn) {
            return;
        }
        const size = this.playPauseIcon
            ? parseInt(this.playPauseIcon.getAttribute('width') || '36', 10)
            : 36;
        while (this.playPauseBtn.firstChild) {
            this.playPauseBtn.removeChild(this.playPauseBtn.firstChild);
        }
        this.playPauseIcon = this.createTransportSvg(playing ? 'pause' : 'play', size);
        this.playPauseBtn.appendChild(this.playPauseIcon);
    }
    mount() {
        const face = document.getElementById('face');
        const host = face || document.body || document.documentElement;
        if (!host) {
            console.error('[jukebox] PlayerOverlay: no DOM host');
            return;
        }
        if (face) {
            this.root.style.position = 'absolute';
        }
        else {
            this.root.style.position = 'fixed';
        }
        host.appendChild(this.root);
    }
    bindAudio() {
        this.audio.addEventListener('play', () => {
            this.setPlayPauseIcon(true);
            this.setStatus('');
            this.startProgressLoop();
        }, false);
        this.audio.addEventListener('pause', () => {
            this.setPlayPauseIcon(false);
        }, false);
        this.audio.addEventListener('ended', () => {
            this.next();
        }, false);
        this.audio.addEventListener('error', () => {
            this.setStatus('Could not play this track');
            this.setPlayPauseIcon(false);
        }, false);
        this.audio.addEventListener('loadedmetadata', () => {
            this.updateProgress(true);
            if (!this.lyrics || (!this.lyrics.lines.length && !this.lyrics.plain && !this.lyrics.instrumental)) {
                this.loadLyrics();
            }
        }, false);
    }
    bindControls() {
    }
    updateMeta() {
        if (!this.album || this.trackIndex < 0) {
            return;
        }
        const track = this.album.tracks[this.trackIndex];
        this.trackTitleEl.textContent = track ? track.title : '—';
        if (this.album.isSingle) {
            this.albumEl.textContent = 'Single';
            this.albumEl.style.display = 'block';
        }
        else {
            this.albumEl.textContent = this.album.albumTitle || this.album.title || '';
            this.albumEl.style.display = this.albumEl.textContent ? 'block' : 'none';
        }
        this.artistEl.textContent = this.album.artist || '';
        this.artistEl.style.display = this.album.artist ? 'block' : 'none';
        if (this.album.coverUrl) {
            this.coverImg.src = this.album.coverUrl;
            this.coverImg.style.display = 'block';
            this.coverPlaceholder.style.display = 'none';
        }
        else {
            this.coverImg.removeAttribute('src');
            this.coverImg.style.display = 'none';
            this.coverPlaceholder.style.display = 'flex';
        }
        this.applyLeftMode();
    }
    loadLyrics() {
        if (!this.album || this.trackIndex < 0) {
            return;
        }
        const track = this.album.tracks[this.trackIndex];
        const token = ++this.lyricsToken;
        this.lyrics = null;
        this.hasLyrics = false;
        this.lyricsLineEls = [];
        this.lastLyricsIndex = -1;
        this.clearLyricsScroll();
        this.lyricsStatusEl.style.display = 'block';
        this.lyricsStatusEl.textContent = 'Loading lyrics...';
        this.showCover = true;
        this.applyLeftMode();
        const duration = this.audio && isFinite(this.audio.duration) && this.audio.duration > 0
            ? this.audio.duration
            : undefined;
        LyricsService_1.default.fetch(this.album, track, duration).then((result) => {
            if (token !== this.lyricsToken) {
                return;
            }
            this.lyrics = result;
            if (result.instrumental || !this.hasUsableLyrics(result)) {
                this.hasLyrics = false;
                this.showCover = true;
                this.clearLyricsScroll();
                this.applyLeftMode();
                return;
            }
            this.hasLyrics = true;
            this.showCover = false;
            this.renderLyrics(result);
            this.applyLeftMode();
            this.updateLyricsHighlight(true);
        }).catch((err) => {
            if (token !== this.lyricsToken) {
                return;
            }
            console.warn('[jukebox] lyrics fetch failed', err);
            this.lyrics = null;
            this.hasLyrics = false;
            this.showCover = true;
            this.clearLyricsScroll();
            this.applyLeftMode();
        });
    }
    hasUsableLyrics(result) {
        if (!result || result.instrumental) {
            return false;
        }
        if (result.lines && result.lines.some((l) => !!(l.text && l.text.trim()))) {
            return true;
        }
        return !!(result.plain && result.plain.trim());
    }
    renderLyrics(result) {
        this.clearLyricsScroll();
        this.lyricsLineEls = [];
        this.lastLyricsIndex = -1;
        this.lyricsStatusEl.style.display = 'none';
        if (result.lines && result.lines.length) {
            for (let i = 0; i < result.lines.length; i++) {
                const line = result.lines[i];
                const el = document.createElement('div');
                this.style(el, {
                    fontSize: '26px',
                    lineHeight: '1.45',
                    marginBottom: '14px',
                    color: 'rgba(242,244,247,0.35)',
                    transition: 'color 120ms linear, transform 120ms linear',
                    wordBreak: 'break-word'
                });
                el.textContent = line.text || ' ';
                this.lyricsScroll.appendChild(el);
                this.lyricsLineEls.push(el);
            }
            return;
        }
        const plain = result.plain || '';
        const chunks = plain.split(/\n/);
        for (let i = 0; i < chunks.length; i++) {
            const el = document.createElement('div');
            this.style(el, {
                fontSize: '24px',
                lineHeight: '1.5',
                marginBottom: '10px',
                color: 'rgba(242,244,247,0.75)',
                wordBreak: 'break-word',
                minHeight: chunks[i] ? '0' : '12px'
            });
            el.textContent = chunks[i] || ' ';
            this.lyricsScroll.appendChild(el);
        }
    }
    clearLyricsScroll() {
        if (!this.lyricsScroll) {
            return;
        }
        while (this.lyricsScroll.firstChild) {
            this.lyricsScroll.removeChild(this.lyricsScroll.firstChild);
        }
    }
    updateLyricsHighlight(forceScroll) {
        if (!this.lyrics || !this.lyrics.lines || !this.lyrics.lines.length) {
            return;
        }
        if (!this.lyricsLineEls.length) {
            return;
        }
        const t = this.audio && isFinite(this.audio.currentTime) ? this.audio.currentTime : 0;
        const idx = LyricsService_1.default.activeIndex(this.lyrics.lines, t);
        if (idx === this.lastLyricsIndex && !forceScroll) {
            return;
        }
        this.lastLyricsIndex = idx;
        for (let i = 0; i < this.lyricsLineEls.length; i++) {
            const el = this.lyricsLineEls[i];
            if (i === idx) {
                el.style.color = '#f2f4f7';
                el.style.fontWeight = '700';
                el.style.transform = 'scale(1.02)';
            }
            else if (idx >= 0 && Math.abs(i - idx) === 1) {
                el.style.color = 'rgba(242,244,247,0.55)';
                el.style.fontWeight = '500';
                el.style.transform = 'none';
            }
            else {
                el.style.color = 'rgba(242,244,247,0.28)';
                el.style.fontWeight = '400';
                el.style.transform = 'none';
            }
        }
        if (idx >= 0 && this.lyricsLineEls[idx] && !this.showCover) {
            try {
                const el = this.lyricsLineEls[idx];
                const parent = this.lyricsScroll;
                const top = el.offsetTop - parent.clientHeight / 2 + el.clientHeight / 2;
                parent.scrollTop = Math.max(0, top);
            }
            catch (e) { }
        }
    }
    toggleCoverLyrics() {
        if (!this.hasLyrics) {
            return;
        }
        this.showCover = !this.showCover;
        this.applyLeftMode();
    }
    applyLeftMode() {
        if (!this.lyricsWrap || !this.coverWrap) {
            return;
        }
        if (this.showCover || !this.hasLyrics) {
            this.lyricsWrap.style.display = 'none';
            this.coverWrap.style.display = 'block';
        }
        else {
            this.coverWrap.style.display = 'none';
            this.lyricsWrap.style.display = 'flex';
        }
    }
    loadAndPlay(track) {
        if (!track) {
            return;
        }
        const token = ++this.playToken;
        this.setStatus('Loading…');
        this.revokeObjectUrl();
        this.resolvePlayable(track).then((src) => {
            if (token !== this.playToken) {
                if (src.revoke) {
                    try {
                        URL.revokeObjectURL(src.url);
                    }
                    catch (e) { }
                }
                return;
            }
            if (src.revoke) {
                this.objectUrl = src.url;
            }
            try {
                this.audio.src = src.url;
                const p = this.audio.play();
                if (p && typeof p.catch === 'function') {
                    p.catch((err) => {
                        console.warn('[jukebox] play() rejected', err);
                        this.setStatus('Playback blocked or failed');
                    });
                }
            }
            catch (err) {
                console.error('[jukebox] play failed', err);
                this.setStatus('Playback failed');
            }
        }).catch((err) => {
            console.error('[jukebox] resolvePlayable failed', err);
            this.setStatus('Could not load track');
        });
    }
    resolvePlayable(track) {
        const absPath = track.path;
        if (absPath) {
            try {
                return Promise.resolve(AudioSupport_1.fileToBlobUrl(absPath, AudioSupport_1.mimeForFormat(track.format)));
            }
            catch (err) {
                console.warn('[jukebox] blob URL failed, falling back to file URL', err);
            }
        }
        return Promise.resolve({ url: track.url, revoke: false });
    }
    togglePlayPause() {
        if (!this.audio || this.trackIndex < 0) {
            return;
        }
        if (this.audio.paused) {
            const p = this.audio.play();
            if (p && typeof p.catch === 'function') {
                p.catch(() => { this.setStatus('Could not resume'); });
            }
        }
        else {
            this.audio.pause();
        }
    }
    prev() {
        if (!this.album || !this.album.tracks.length) {
            return;
        }
        if (this.audio && this.audio.currentTime > 3) {
            this.audio.currentTime = 0;
            this.updateLyricsHighlight(true);
            return;
        }
        const nextIndex = this.trackIndex <= 0
            ? this.album.tracks.length - 1
            : this.trackIndex - 1;
        this.trackIndex = nextIndex;
        this.updateMeta();
        this.loadAndPlay(this.album.tracks[nextIndex]);
        this.loadLyrics();
    }
    next() {
        if (!this.album || !this.album.tracks.length) {
            return;
        }
        const nextIndex = (this.trackIndex + 1) % this.album.tracks.length;
        this.trackIndex = nextIndex;
        this.updateMeta();
        this.loadAndPlay(this.album.tracks[nextIndex]);
        this.loadLyrics();
    }
    seekFromEvent(e) {
        if (!this.audio || !isFinite(this.audio.duration) || this.audio.duration <= 0) {
            return;
        }
        const rect = this.progressTrack.getBoundingClientRect();
        if (!rect.width) {
            return;
        }
        const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        this.audio.currentTime = x * this.audio.duration;
        this.updateProgress(true);
    }
    startProgressLoop() {
        if (this.progressRaf) {
            return;
        }
        const tick = () => {
            this.progressRaf = 0;
            this.updateProgress(false);
            if (this.audio && !this.audio.paused && !this.audio.ended) {
                this.progressRaf = requestAnimationFrame(tick);
            }
        };
        this.progressRaf = requestAnimationFrame(tick);
    }
    updateProgress(force) {
        const cur = this.audio && isFinite(this.audio.currentTime) ? this.audio.currentTime : 0;
        const dur = this.audio && isFinite(this.audio.duration) ? this.audio.duration : 0;
        const timeText = this.formatTime(cur);
        const totalText = dur > 0 ? this.formatTime(dur) : '0:00';
        const pct = dur > 0 ? Math.max(0, Math.min(100, (cur / dur) * 100)) : 0;
        if (force || timeText !== this.lastTimeText) {
            this.currentTimeEl.textContent = timeText;
            this.lastTimeText = timeText;
        }
        if (force || totalText !== this.lastTotalText) {
            this.totalTimeEl.textContent = totalText;
            this.lastTotalText = totalText;
        }
        if (force || Math.abs(pct - this.lastProgressPct) >= 0.25) {
            this.progressFill.style.width = pct.toFixed(2) + '%';
            this.lastProgressPct = pct;
        }
        this.updateLyricsHighlight(force);
    }
    formatTime(sec) {
        if (!isFinite(sec) || sec < 0) {
            return '0:00';
        }
        const s = Math.floor(sec);
        const m = Math.floor(s / 60);
        const r = s % 60;
        return m + ':' + (r < 10 ? '0' : '') + r;
    }
    revokeObjectUrl() {
        if (!this.objectUrl) {
            return;
        }
        try {
            URL.revokeObjectURL(this.objectUrl);
        }
        catch (e) { }
        this.objectUrl = null;
    }
    setStatus(msg) {
        this.statusEl.textContent = msg || '';
    }
    style(el, props) {
        for (const key in props) {
            if (props.hasOwnProperty(key)) {
                el.style[key] = props[key];
            }
        }
    }
}
exports.default = PlayerOverlay;

},{"../audio/AudioSupport":1,"../lyrics/LyricsService":3}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class StatusOverlay {
    static show(message) {
        return new StatusOverlay(message || 'Loading Jukebox...');
    }
    constructor(message) {
        this.root = document.createElement('div');
        this.root.id = 'jukebox-status';
        this.style(this.root, {
            position: 'absolute',
            left: '0',
            top: '0',
            width: '1280px',
            height: '720px',
            zIndex: '100000',
            background: '#0d1016',
            color: '#f2f4f7',
            fontFamily: '"Avenir Next", "Helvetica Neue", Helvetica, Arial, sans-serif',
            boxSizing: 'border-box',
            padding: '80px 72px',
            overflow: 'auto',
            webkitUserSelect: 'none',
            userSelect: 'none',
            webkitTouchCallout: 'none',
            touchAction: 'pan-y'
        });
        this.root.addEventListener('selectstart', (e) => { e.preventDefault(); }, false);
        this.root.addEventListener('dragstart', (e) => { e.preventDefault(); }, false);
        this.root.addEventListener('contextmenu', (e) => { e.preventDefault(); }, false);
        this.titleEl = document.createElement('div');
        this.style(this.titleEl, {
            fontSize: '48px',
            fontWeight: '700',
            letterSpacing: '1px',
            marginBottom: '28px'
        });
        this.titleEl.textContent = 'Jukebox';
        this.root.appendChild(this.titleEl);
        this.messageEl = document.createElement('div');
        this.style(this.messageEl, {
            fontSize: '30px',
            lineHeight: '1.45',
            color: 'rgba(242,244,247,0.9)',
            marginBottom: '28px',
            whiteSpace: 'pre-wrap'
        });
        this.messageEl.textContent = message;
        this.root.appendChild(this.messageEl);
        this.detailEl = document.createElement('pre');
        this.style(this.detailEl, {
            fontSize: '18px',
            lineHeight: '1.5',
            color: 'rgba(242,244,247,0.55)',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            margin: '0',
            fontFamily: 'Menlo, Consolas, monospace',
            display: 'none'
        });
        this.root.appendChild(this.detailEl);
        this.mount();
    }
    setLoading(message) {
        this.titleEl.textContent = 'Jukebox';
        this.titleEl.style.color = '#f2f4f7';
        this.messageEl.textContent = message;
        this.messageEl.style.color = 'rgba(242,244,247,0.9)';
        this.detailEl.style.display = 'none';
        this.detailEl.textContent = '';
    }
    showError(message, detail) {
        this.titleEl.textContent = 'Jukebox — Error';
        this.titleEl.style.color = '#ff8a6a';
        this.messageEl.textContent = message;
        this.messageEl.style.color = '#ffd5c8';
        if (detail) {
            this.detailEl.textContent = detail;
            this.detailEl.style.display = 'block';
        }
        else {
            this.detailEl.style.display = 'none';
            this.detailEl.textContent = '';
        }
    }
    dismiss() {
        if (this.root && this.root.parentNode) {
            this.root.parentNode.removeChild(this.root);
        }
        this.root = null;
    }
    mount() {
        const face = document.getElementById('face');
        const host = face || document.body || document.documentElement;
        if (!host) {
            console.error('[jukebox] StatusOverlay: no DOM host to mount into');
            return;
        }
        if (face) {
            this.root.style.position = 'absolute';
        }
        else {
            this.root.style.position = 'fixed';
        }
        host.appendChild(this.root);
    }
    style(el, props) {
        for (const key in props) {
            if (props.hasOwnProperty(key)) {
                el.style[key] = props[key];
            }
        }
    }
}
exports.default = StatusOverlay;

},{}]},{},[2])(2)
});

//# sourceMappingURL=index.js.map