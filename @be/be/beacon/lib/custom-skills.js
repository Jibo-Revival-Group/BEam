'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const paths = require('./paths');
const packages = require('./theme-package');
const stores = require('./theme-store');
const operations = require('./theme-operation');

function create(options) {
    const opts = options || {};
    const root = opts.root || path.join(paths.dataDir(), 'skills');
    const store = opts.store || stores.create();
    let queue = Promise.resolve(), downloading = false, progressState = { state: 'idle' };
    function read() {
        const file = path.join(root, 'state.json');
        if (!fs.existsSync(file)) { return { skills: [] }; }
        const state = JSON.parse(fs.readFileSync(file, 'utf8'));
        if (!Array.isArray(state.skills)) { throw packages.fail('Skill state is unreadable'); }
        return state;
    }
    function save(state) {
        paths.ensureDir(root);
        const file = path.join(root, 'state.json'), temp = file + '.tmp';
        fs.writeFileSync(temp, JSON.stringify(state, null, 2)); fs.renameSync(temp, file);
    }
    function directory(item) {
        if (!item || !/^[a-f0-9]{24}$/.test(item.revision)) { throw packages.fail('Invalid skill revision'); }
        return path.join(root, 'packages', item.revision, item.packageRoot);
    }
    function resolve(id) { const item = read().skills.filter(s => s.packageName === id)[0]; return item ? directory(item) : null; }
    function compatibility(m) { return (opts.compatibility || require('./themes').compatibility)(m); }
    function inventory() { return { skills: read().skills.map(s => Object.assign({}, s, { compatibility: compatibility(s.manifest) })) }; }
    function mutate(work) {
        const result = queue.then(() => operations.run('Skill operation', opts.timeout || 120000, work));
        queue = result.catch(() => {}); return result;
    }
    function validate(files) {
        const m = packages.manifest(files['manifest.json']);
        if (m.type !== 'skill') { throw packages.fail('This package is not a skill'); }
        const candidates = Object.keys(files).filter(n => n === 'package.json' || /^[^/]+\/package\.json$/.test(n));
        if (candidates.length !== 1) { throw packages.fail('Skill ZIP needs exactly one package.json at the root or in one skill directory'); }
        let p;
        try { p = JSON.parse(files[candidates[0]].toString('utf8')); } catch (err) { throw packages.fail('Invalid skill package.json'); }
        if (!/^@be\/[a-z0-9][a-z0-9-]{0,79}$/.test(p.name || '') || p.name === '@be/be') { throw packages.fail('Skill package name must be @be/<skill-name>'); }
        const host = paths.bePackage().jibo || {};
        if ((host.skills || []).concat(host.lazySkills || []).indexOf(p.name) >= 0 || fs.existsSync(path.join(paths.skillsRoot(), p.name.slice(4), 'package.json')) || fs.existsSync(path.join(paths.BE_ROOT, 'node_modules', p.name, 'package.json'))) { throw packages.fail('Custom skills cannot replace a built-in skill or host dependency'); }
        const packageRoot = candidates[0].slice(0, -'package.json'.length);
        const main = p.main || 'index.js';
        if (typeof main !== 'string' || main[0] === '/' || /[\\:\u0000-\u001f]/.test(main) || main.split('/').some(n => !n || n === '..' || n === '.') || !/\.js$/.test(main) || !files[packageRoot + main]) { throw packages.fail('Skill package needs a relative JavaScript main file'); }
        if (!p.jibo || p.jibo.type !== 'asset-pack') { throw packages.fail('Skill package must be a BEam asset-pack'); }
        // Packages ship their built output/dependencies. Never run npm or install scripts.
        if (!files['icon.png']) { throw packages.fail('Skill needs icon.png at the manifest root'); }
        const images = {};
        return ['icon.png', 'banner.png'].reduce((chain, n) => chain.then(() => files[n] ? packages.png(files[n], n).then(size => { images[n] = size; }) : null), Promise.resolve()).then(() => ({
            id: stores.hash(p.name), manifest: m, packageName: p.name, packageRoot: packageRoot,
            images: images, readme: files['README.md'] ? files['README.md'].toString('utf8').slice(0, 1024 * 1024) : ''
        }));
    }
    function installFiles(files, origin, operation) {
        return validate(files).then(skill => {
            operation.check();
            const compat = compatibility(skill.manifest);
            if (compat.status === 'incompatible') { throw packages.fail(skill.manifest.name + ' needs version ' + compat.minimum + ' or newer'); }
            const state = read(), previous = state.skills.slice(), old = state.skills.filter(s => s.id === skill.id)[0];
            if (old && old.origin.url && origin.url && old.origin.url !== origin.url) { throw packages.fail('This skill is installed from another source; remove it first'); }
            const revision = crypto.randomBytes(12).toString('hex');
            const dest = path.join(root, 'packages', revision);
            const installed = Object.assign(skill, { revision: revision, origin: origin, installedAt: new Date().toISOString() });
            try {
                Object.keys(files).forEach(n => { const file = path.join(dest, n); paths.ensureDir(path.dirname(file)); fs.writeFileSync(file, files[n]); });
                operation.check();
                state.skills = state.skills.filter(s => s.id !== skill.id).concat(installed); save(state);
                if (opts.onChange) { opts.onChange(); }
                else { require('./menu-layout').sync(); }
            } catch (err) {
                state.skills = previous;
                try { save(state); } catch (ignored) { /* preserve the original error */ }
                removeTree(dest); throw err;
            }
            // Old revisions remain until restart; an open skill may still use them.
            return inventory();
        });
    }
    function upload(buf, name) { return mutate(operation => packages.unzip(buf, { skill: true }).then(files => installFiles(files, { kind: 'zip', name: String(name || 'skill.zip').slice(0, 180) }, operation))); }
    function install(entryId, requestId) {
        if (requestId !== undefined && (typeof requestId !== 'string' || !/^[A-Za-z0-9_-]{1,80}$/.test(requestId))) { return Promise.reject(packages.fail('Invalid request ID')); }
        if (downloading) { return Promise.reject(packages.fail('A skill download is already in progress')); }
        downloading = true; progressState = { id: requestId || crypto.randomBytes(12).toString('hex'), entryId: entryId, state: 'resolving', percent: null };
        return operations.run('Skill download', opts.timeout || 120000, operation => {
            operation.progress = update => { operation.check(); Object.assign(progressState, update); };
            const entry = (opts.catalog ? opts.catalog() : require('./themes').catalog()).entries.filter(e => e.id === entryId && e.type === 'skill')[0];
            if (!entry || entry.error) { throw packages.fail('Refresh the storefront before installing this skill'); }
            return store.download(entry.url, operation).then(result => mutate(commit => installFiles(result.files,
                { kind: 'store', url: entry.url, commit: result.commit, readmeUrl: result.readmeUrl, developer: entry.developer, stars: entry.stars },
                { check: () => { operation.check(); commit.check(); } })));
        }).then(value => { downloading = false; Object.assign(progressState, { state: 'complete', percent: 100 }); return value; }, err => {
            downloading = false; Object.assign(progressState, { state: 'failed', error: err.message }); throw err;
        });
    }
    function remove(id) { return mutate(() => {
        const state = read(), item = state.skills.filter(s => s.id === id)[0];
        if (!item) { throw packages.fail('Skill not found'); }
        if (!opts.onChange) { require('../../skill-registry').removeCustom(item.packageName); }
        state.skills = state.skills.filter(s => s.id !== id); save(state);
        if (opts.onChange) { opts.onChange(); } else { require('./menu-layout').sync(); }
        return inventory();
    }); }
    function asset(id, name) {
        const item = read().skills.filter(s => s.id === id)[0];
        if (!item || ['icon.png', 'banner.png'].indexOf(name) < 0) { throw packages.fail('Unknown skill asset'); }
        return path.join(root, 'packages', item.revision, name);
    }
    function details(id) { const item = inventory().skills.filter(s => s.id === id)[0]; return item || null; }
    function removeTree(dir) { if (!fs.existsSync(dir)) { return; } fs.readdirSync(dir).forEach(n => { const f = path.join(dir, n); if (fs.lstatSync(f).isDirectory()) { removeTree(f); } else { fs.unlinkSync(f); } }); fs.rmdirSync(dir); }
    function cleanup() {
        const state = read(), packagesRoot = path.join(root, 'packages');
        if (!fs.existsSync(packagesRoot)) { return; }
        fs.readdirSync(packagesRoot).forEach(revision => { if (/^[a-f0-9]{24}$/.test(revision) && !state.skills.some(s => s.revision === revision)) { removeTree(path.join(packagesRoot, revision)); } });
    }
    return { inventory: inventory, resolve: resolve, validate: validate, install: install, upload: upload, remove: remove, asset: asset, details: details, cleanup: cleanup,
        ids: () => read().skills.map(s => s.packageName), progress: id => !id || progressState.id === id ? Object.assign({}, progressState) : { id: id, state: 'idle' } };
}
module.exports = Object.assign(create(), { create: create });
