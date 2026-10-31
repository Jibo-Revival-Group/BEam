'use strict';

// Custom voices: packs (ZIP, Store, or a theme's GitHub link) that change how Jibo's own TTS sounds.
// Pitch, speed and formants go to the TTS engine per request (voice-tts.js); vibrato and volume
// are read by the jibo_voicefx ALSA plugin from fx.txt; breath.mp3 plays after each sentence.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const paths = require('./paths');
const packages = require('./theme-package');
const stores = require('./theme-store');
const operations = require('./theme-operation');

function create(options) {
    const opts = options || {};
    const root = opts.root || path.join(paths.dataDir(), 'voices');
    const store = opts.store || stores.create();
    const catalog = () => (opts.catalog ? opts.catalog() : require('./themes').catalog());
    let queue = Promise.resolve(), downloading = false, progressState = { state: 'idle' }, listeners = [];
    function read() {
        const file = path.join(root, 'state.json');
        if (!fs.existsSync(file)) { return { voices: [], active: null }; }
        const state = JSON.parse(fs.readFileSync(file, 'utf8'));
        if (!Array.isArray(state.voices)) { throw packages.fail('Voice state is unreadable'); }
        return state;
    }
    function atomic(file, text) {
        paths.ensureDir(path.dirname(file));
        const temp = file + '.tmp-' + crypto.randomBytes(6).toString('hex');
        try { fs.writeFileSync(temp, text); fs.renameSync(temp, file); } finally { if (fs.existsSync(temp)) { fs.unlinkSync(temp); } }
    }
    function save(state) { atomic(path.join(root, 'state.json'), JSON.stringify(state, null, 2)); }
    function dir(item) {
        if (!item || !/^[a-f0-9]{24}$/.test(item.revision)) { throw packages.fail('Invalid voice revision'); }
        return path.join(root, 'packages', item.revision);
    }
    function compatibility(m) { return (opts.compatibility || require('./themes').compatibility)(m); }
    function inventory() {
        const s = read();
        return { active: s.active, voices: s.voices.map(v => Object.assign({}, v, { active: v.id === s.active, compatibility: compatibility(v.manifest) })) };
    }
    function mutate(work) {
        const result = queue.then(() => operations.run('Voice operation', opts.timeout || 120000, work));
        queue = result.catch(() => {}); return result;
    }
    // What the TTS hook and the ALSA plugin need for the active voice (null = Jibo's normal voice).
    function current() {
        let s; try { s = read(); } catch (err) { return null; }
        const v = s.voices.filter(x => x.id === s.active)[0];
        if (!v) { return null; }
        return Object.assign({ id: v.id, name: v.manifest.name }, v.manifest.voice,
            { breath: v.hasBreath ? path.join(dir(v), 'breath.mp3') : null });
    }
    function applyEffects() {
        const v = current() || packages.voiceParams({});
        // jibo_voicefx reads: <vibrato semitones> <vibrato Hz> <volume>
        atomic(path.join(root, 'fx.txt'), v.vibrato + ' ' + v.vibratoSpeed + ' ' + v.volume + '\n');
        listeners.forEach(fn => { try { fn(current()); } catch (err) { console.warn('[voices] listener failed:', err.message); } });
    }
    function validate(files) {
        const m = packages.manifest(files['manifest.json']);
        if (m.type !== 'voice') { throw packages.fail('This package is not a voice'); }
        Object.keys(files).forEach(n => { if (packages.VOICE_FILES.indexOf(n) < 0) { throw packages.fail('Unsupported voice file: ' + n); } });
        if (files['breath.mp3']) { packages.audio(files['breath.mp3'], 'breath.mp3'); }
        const images = {};
        return (files['banner.png'] ? packages.png(files['banner.png'], 'banner.png').then(size => { images['banner.png'] = size; }) : Promise.resolve()).then(() => ({
            id: stores.hash('voice:' + m.name.toLowerCase()), manifest: m, images: images, hasBreath: !!files['breath.mp3'],
            readme: files['README.md'] ? files['README.md'].toString('utf8').slice(0, 256 * 1024) : ''
        }));
    }
    function installFiles(files, origin, operation) {
        return validate(files).then(voice => {
            operation.check();
            const compat = compatibility(voice.manifest);
            if (compat.status === 'incompatible') { throw packages.fail(voice.manifest.name + ' needs version ' + compat.minimum + ' or newer'); }
            const state = read(), old = state.voices.filter(v => v.id === voice.id)[0];
            if (old && old.origin.url && origin.url && old.origin.url !== origin.url) { throw packages.fail('A voice with this name is installed from another source; remove it first'); }
            const installed = Object.assign(voice, { revision: crypto.randomBytes(12).toString('hex'), origin: origin, installedAt: new Date().toISOString() });
            const dest = dir(installed);
            try {
                paths.ensureDir(dest);
                Object.keys(files).forEach(n => fs.writeFileSync(path.join(dest, n), files[n]));
                state.voices = state.voices.filter(v => v.id !== voice.id).concat(installed); save(state);
            } catch (err) { removeTree(dest); throw err; }
            if (old) { try { removeTree(dir(old)); } catch (err) { /* orphan cleanup can wait */ } }
            if (state.active === voice.id) { applyEffects(); }
            return Object.assign({ installed: voice.id }, inventory());
        });
    }
    function upload(buf, name) {
        return mutate(operation => packages.unzip(buf, { voice: true }).then(files => installFiles(files, { kind: 'zip', name: String(name || 'voice.zip').slice(0, 180) }, operation)));
    }
    function download(url, origin, requestId) {
        if (requestId !== undefined && (typeof requestId !== 'string' || !/^[A-Za-z0-9_-]{1,80}$/.test(requestId))) { return Promise.reject(packages.fail('Invalid request ID')); }
        if (downloading) { return Promise.reject(packages.fail('A voice download is already in progress')); }
        downloading = true; progressState = { id: requestId || crypto.randomBytes(12).toString('hex'), state: 'resolving', percent: null };
        return operations.run('Voice download', opts.timeout || 120000, operation => {
            operation.progress = update => { operation.check(); Object.assign(progressState, update); };
            return store.download(url, operation).then(result => mutate(commit => installFiles(result.files,
                Object.assign({ url: url, commit: result.commit, release: result.release || null, readmeUrl: result.readmeUrl }, origin),
                { check: () => { operation.check(); commit.check(); } })));
        }).then(value => { downloading = false; Object.assign(progressState, { state: 'complete', percent: 100 }); return value; }, err => {
            downloading = false; Object.assign(progressState, { state: 'failed', error: err.message }); throw err;
        });
    }
    function install(entryId, requestId) {
        const entry = catalog().entries.filter(e => e.id === entryId && e.type === 'voice')[0];
        if (!entry || entry.error) { return Promise.reject(packages.fail('Refresh the storefront before installing this voice')); }
        return download(entry.url, { kind: 'store', sourceId: entry.sourceId, developer: entry.developer, stars: entry.stars }, requestId);
    }
    // A theme's voice link: download it, use it, and list it in the Store if no storefront has it yet.
    function installFromTheme(url, themeName) {
        let u; try { u = stores.normalize(url); } catch (err) { return Promise.reject(err); }
        if (!/^https:\/\/github\.com\/[^/]+\/[^/]+$/.test(u)) { return Promise.reject(packages.fail('Theme voices must be GitHub repositories')); }
        return download(u, { kind: 'theme', theme: String(themeName || '').slice(0, 120) }).then(result => activate(result.installed)
            .then(() => (opts.addToStore ? opts.addToStore(u) : require('./themes').addLocalEntry(u)).catch(err => { console.warn('[voices] could not list voice in Store:', err.message); }))
            .then(() => inventory()));
    }
    function activate(id) {
        return mutate(() => {
            if (id !== null && (typeof id !== 'string' || !/^[a-f0-9]{24}$/.test(id))) { throw packages.fail('Use a voice ID or null for Jibo’s normal voice'); }
            const state = read();
            if (id && !state.voices.some(v => v.id === id)) { throw packages.fail('Voice not found'); }
            state.active = id; save(state); applyEffects(); return inventory();
        });
    }
    function remove(id) {
        return mutate(() => {
            const state = read(), item = state.voices.filter(v => v.id === id)[0];
            if (!item) { throw packages.fail('Voice not found'); }
            state.voices = state.voices.filter(v => v.id !== id);
            if (state.active === id) { state.active = null; }
            save(state); applyEffects();
            try { removeTree(dir(item)); } catch (err) { /* orphan cleanup can wait */ }
            return inventory();
        });
    }
    function asset(id, name) {
        const item = read().voices.filter(v => v.id === id)[0];
        if (!item || ['banner.png', 'breath.mp3'].indexOf(name) < 0) { throw packages.fail('Unknown voice asset'); }
        return path.join(dir(item), name);
    }
    function details(id) { return inventory().voices.filter(v => v.id === id)[0] || null; }
    function removeTree(target) {
        let stat;
        try { stat = fs.lstatSync(target); } catch (err) { if (err.code === 'ENOENT') { return; } throw err; }
        if (!stat.isDirectory()) { fs.unlinkSync(target); return; }
        fs.readdirSync(target).forEach(n => removeTree(path.join(target, n))); fs.rmdirSync(target);
    }
    function start() {
        try { applyEffects(); } catch (err) { console.warn('[voices] could not apply the active voice:', err.message); }
    }
    return { inventory: inventory, current: current, upload: upload, install: install, installFromTheme: installFromTheme,
        activate: activate, remove: remove, asset: asset, details: details, start: start, validate: validate,
        onChange: fn => { listeners.push(fn); }, fxFile: () => path.join(root, 'fx.txt'),
        progress: id => !id || progressState.id === id ? Object.assign({}, progressState) : { id: id, state: 'idle' } };
}
// Custom voices are turned off for now (code kept for later). Set BEACON_VOICES=1 to turn them on (the tests do).
const ENABLED = process.env.BEACON_VOICES === '1';
module.exports = Object.assign(create(), { create: create, ENABLED: ENABLED });
