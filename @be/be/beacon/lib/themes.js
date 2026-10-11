'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const paths = require('./paths');
const packages = require('./theme-package');
const stores = require('./theme-store');
const runtime = require('./theme-runtime');

function compare(a, b) {
    function parts(v) { const p = v.split('+')[0].split('-'); return { nums: p[0].split('.').map(Number), pre: p.slice(1).join('-') }; }
    const x = parts(a); const y = parts(b);
    for (let i = 0; i < 3; i++) { if (x.nums[i] !== y.nums[i]) { return x.nums[i] < y.nums[i] ? -1 : 1; } }
    if (x.pre === y.pre) { return 0; } if (!x.pre) { return 1; } if (!y.pre) { return -1; }
    const xx = x.pre.split('.'); const yy = y.pre.split('.');
    for (let i = 0; i < Math.max(xx.length, yy.length); i++) {
        if (xx[i] === undefined) { return -1; } if (yy[i] === undefined) { return 1; }
        if (xx[i] === yy[i]) { continue; }
        const xn = /^\d+$/.test(xx[i]); const yn = /^\d+$/.test(yy[i]);
        if (xn && yn) { return Number(xx[i]) < Number(yy[i]) ? -1 : 1; }
        if (xn !== yn) { return xn ? -1 : 1; } return xx[i] < yy[i] ? -1 : 1;
    }
    return 0;
}
function tbdVersion() {
    const candidates = [path.join(paths.REPO_ROOT, 'jibo-tbd', 'package.json'),
        '/opt/jibo/Jibo/Skills/jibo-tbd/package.json', '/opt/jibo/Jibo/Skills/@jibo/jibo-tbd/package.json',
        path.join(paths.BE_ROOT, 'node_modules', 'jibo-tbd', 'package.json')];
    if (paths.onRobot()) { candidates.shift(); }
    for (let i = 0; i < candidates.length; i++) {
        try { const v = JSON.parse(fs.readFileSync(candidates[i], 'utf8')).version; if (/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(v)) { return v; } } catch (err) { /* try next installed path */ }
    }
    return null;
}
function removeTree(dir) {
    if (!fs.existsSync(dir)) { return; }
    fs.readdirSync(dir).forEach(n => { const f = path.join(dir, n); if (fs.lstatSync(f).isDirectory()) { removeTree(f); } else { fs.unlinkSync(f); } });
    fs.rmdirSync(dir);
}
function create(options) {
    const opts = options || {}; const root = opts.root || path.join(paths.dataDir(), 'themes');
    const store = opts.store || stores.create(); const renderer = opts.runtime || runtime;
    const version = opts.version || tbdVersion; let queue = Promise.resolve();
    function atomic(file, data) {
        paths.ensureDir(path.dirname(file)); const temp = file + '.tmp-' + crypto.randomBytes(6).toString('hex');
        try { fs.writeFileSync(temp, JSON.stringify(data, null, 2)); fs.renameSync(temp, file); }
        finally { if (fs.existsSync(temp)) { fs.unlinkSync(temp); } }
    }
    function defaults() { return { themes: [], active: null, migratedEye: false,
        sources: [{ id: stores.hash(stores.DEFAULT_SOURCE), url: stores.DEFAULT_SOURCE, entries: [], refreshedAt: null, error: null }] }; }
    function read() {
        const file = path.join(root, 'state.json');
        if (!fs.existsSync(file)) { return defaults(); }
        try {
            const s = JSON.parse(fs.readFileSync(file, 'utf8'));
            if (!Array.isArray(s.themes) || !Array.isArray(s.sources)) { throw new Error(); } return s;
        } catch (err) { throw packages.fail('Theme state is unreadable; restore state.json before changing themes'); }
    }
    function save(s) { atomic(path.join(root, 'state.json'), s); }
    function mutate(fn) { const result = queue.then(fn); queue = result.catch(() => {}); return result; }
    function dir(revision) {
        if (!/^[a-f0-9]{24}$/.test(revision || '')) { throw packages.fail('Invalid theme revision'); }
        return path.join(root, 'packages', revision);
    }
    function compat(manifest) {
        const current = version(); const minimum = manifest.supported;
        return { current: current, minimum: minimum, status: !minimum ? 'compatible' : !current ? 'unverified' : compare(current, minimum) >= 0 ? 'compatible' : 'incompatible' };
    }
    function check(m) { const c = compat(m); if (c.status === 'incompatible') { throw packages.fail(m.name + ' requires jibo-tbd ' + c.minimum + ' or newer (installed: ' + c.current + ')'); } }
    function inventory() {
        const s = read(); return { active: s.active ? s.active.id : null, jiboTbdVersion: version(), live: renderer.status(),
            themes: s.themes.map(t => Object.assign({}, t, { compatibility: compat(t.manifest), active: !!(s.active && s.active.id === t.id),
                pending: !!(s.active && s.active.id === t.id && s.active.revision !== t.revision) })) };
    }
    function catalog() {
        const s = read(); const entries = [];
        s.sources.forEach(source => (source.entries || []).forEach(e => {
            if (e.type === 'skill' || e.stock) { return; }
            const id = stores.hash(source.id + ':' + e.url);
            entries.push(Object.assign({}, e, { id: id, sourceId: source.id,
                compatibility: e.manifest ? compat(e.manifest) : null }));
        }));
        return { sources: s.sources, entries: entries, jiboTbdVersion: version() };
    }
    function refreshSources(id) {
        const s = read(); const selected = id ? s.sources.filter(v => v.id === id) : s.sources;
        if (id && !selected.length) { throw packages.fail('Storefront not found'); }
        // Fetch outside the mutation queue so a slow storefront cannot block offline theme use.
        const results = [];
        return selected.reduce((chain, source) => chain.then(() => store.catalog(source.url).then(entries => {
            results.push({ id: source.id, entries: entries, refreshedAt: new Date().toISOString(), error: null });
        }).catch(err => { results.push({ id: source.id, error: err.message }); })), Promise.resolve()).then(() => mutate(() => {
            const fresh = read();
            results.forEach(result => {
                const source = fresh.sources.filter(v => v.id === result.id)[0];
                if (source) { Object.assign(source, result); }
            });
            save(fresh); return catalog();
        }));
    }
    function addSource(value) {
        return mutate(() => {
            const u = stores.normalize(value); const s = read();
            let source = s.sources.filter(v => v.url === u)[0];
            if (!source) {
                if (s.sources.length >= 20) { throw packages.fail('At most 20 storefronts are supported'); }
                source = { id: stores.hash(u), url: u, entries: [], refreshedAt: null, error: null }; s.sources.push(source); save(s);
            }
            return source.id;
        }).then(refreshSources);
    }
    function removeSource(id) { return mutate(() => { const s = read(); s.sources = s.sources.filter(v => v.id !== id); save(s); return catalog(); }); }
    function installFiles(files, origin) {
        return packages.validate(files).then(theme => {
            check(theme.manifest);
            const s = read(); const revision = crypto.randomBytes(12).toString('hex'); const dest = dir(revision);
            const staged = Object.assign({}, theme, { revision: revision, origin: origin, installedAt: new Date().toISOString() });
            try {
                paths.ensureDir(dest);
                Object.keys(files).forEach(n => { if (packages.FILES.indexOf(n) < 0) { return; } const f = path.join(dest, n); paths.ensureDir(path.dirname(f)); fs.writeFileSync(f, files[n]); });
                atomic(path.join(dest, 'theme.json'), staged);
                const old = s.themes.filter(t => t.id === theme.id)[0];
                // A name identifies a theme. Cross-source replacements require explicit user intent.
                if (old && origin.url && old.origin && old.origin.url && old.origin.url !== origin.url) { throw packages.fail('A theme with this name is already installed from another source; remove it first'); }
                s.themes = s.themes.filter(t => t.id !== theme.id).concat(staged); save(s);
                if (old && (!s.active || s.active.revision !== old.revision)) { try { removeTree(dir(old.revision)); } catch (err) { /* orphan cleanup can wait */ } }
                return { installed: staged.id, themes: inventory() };
            } catch (err) { removeTree(dest); throw err; }
        });
    }
    function upload(buf, name) { return mutate(() => packages.unzip(buf).then(files => installFiles(files, { kind: 'zip', name: String(name || 'theme.zip').slice(0, 180) }))); }
    function install(entryId, themeId) {
        return mutate(() => {
            let origin;
            if (themeId) {
                const t = read().themes.filter(v => v.id === themeId)[0];
                if (!t || !t.origin || !t.origin.url) { throw packages.fail('Upload a replacement ZIP to update this theme'); }
                origin = t.origin;
            } else {
                const entry = catalog().entries.filter(v => v.id === entryId)[0];
                if (!entry || entry.error) { throw packages.fail('Refresh this storefront before installing its theme'); }
                origin = { kind: 'store', url: entry.url, sourceId: entry.sourceId };
            }
            return store.download(origin.url).then(result => installFiles(result.files, Object.assign({}, origin, { commit: result.commit })));
        });
    }
    function activeTheme(s) {
        if (!s.active) { return null; }
        return JSON.parse(fs.readFileSync(path.join(dir(s.active.revision), 'theme.json'), 'utf8'));
    }
    function activate(id) {
        return mutate(() => {
            if (id !== null && (typeof id !== 'string' || !/^[a-f0-9]{24}$/.test(id))) { throw packages.fail('Use a theme ID or null for None'); }
            const s = read(); const theme = id ? s.themes.filter(t => t.id === id)[0] : null;
            if (id && !theme) { throw packages.fail('Theme not found'); } if (theme) { check(theme.manifest); }
            const old = s.active;
            return renderer.prepare(theme, theme && dir(theme.revision)).then(prepared => {
                return renderer.apply(prepared, () => {
                    s.active = theme ? { id: theme.id, revision: theme.revision } : null; save(s);
                }).then(() => {
                    if (old && !s.themes.some(t => t.revision === old.revision)) { try { removeTree(dir(old.revision)); } catch (err) { /* retained orphan */ } }
                    return inventory();
                });
            });
        });
    }
    function remove(id) {
        // Activate before acquiring the removal lock to avoid queue recursion.
        return (read().active && read().active.id === id ? activate(null) : Promise.resolve()).then(() => mutate(() => {
            const s = read();
            if (s.active && s.active.id === id) { throw packages.fail('Select None before removing this theme'); }
            const t = s.themes.filter(v => v.id === id)[0]; s.themes = s.themes.filter(v => v.id !== id); save(s);
            if (t) { try { removeTree(dir(t.revision)); } catch (err) { /* retained orphan */ } } return inventory();
        }));
    }
    function asset(id, name) {
        if (packages.FILES.indexOf(name) < 0 || !/\.png$/.test(name)) { throw packages.fail('Unknown theme asset'); }
        const t = read().themes.filter(v => v.id === id)[0]; if (!t) { throw packages.fail('Theme not found'); }
        return path.join(dir(t.revision), name);
    }
    function details(id) {
        const t = read().themes.filter(v => v.id === id)[0]; if (t) { return Promise.resolve(Object.assign({}, t, { compatibility: compat(t.manifest) })); }
        const entry = catalog().entries.filter(v => v.id === id)[0]; if (!entry) { return Promise.reject(packages.fail('Store entry not found')); }
        return Promise.resolve(entry);
    }
    function migrate() {
        const s = read(); if (s.migratedEye) { return; }
        const eyeDirs = [path.join(paths.dataDir(), 'eye'), path.join(paths.dataDirLegacy(), 'eye')];
        const custom = eyeDirs.some(d => {
            if (paths.isFile(path.join(d, 'custom.png'))) { return true; }
            try { return !!JSON.parse(fs.readFileSync(path.join(d, 'state.json'), 'utf8')).custom; } catch (err) { return false; }
        });
        if (custom) {
            const original = paths.pristineEye(); if (!paths.isFile(original)) { throw packages.fail('Stock eye is missing; cannot migrate custom eyes'); }
            const buf = fs.readFileSync(original);
            paths.eyeTextures().forEach(f => { try { fs.chmodSync(f, 0o666); } catch (err) { /* write reports failure */ } fs.writeFileSync(f, buf); });
        }
        s.migratedEye = true; save(s);
    }
    function start() {
        try { migrate(); } catch (err) { console.warn('[themes] eye migration failed:', err.message); return; }
        renderer.start(() => mutate(() => {
            const s = read(); const theme = activeTheme(s); if (theme) { check(theme.manifest); }
            return renderer.prepare(theme, theme && dir(theme.revision)).then(p => renderer.apply(p));
        }));
    }
    return { inventory: inventory, catalog: catalog, addSource: addSource, removeSource: removeSource,
        refresh: refreshSources, details: details, upload: upload, install: install,
        activate: activate, remove: remove, asset: asset, start: start, compatibility: compat };
}
const instance = create();
module.exports = Object.assign(instance, { create: create, compare: compare, tbdVersion: tbdVersion });
