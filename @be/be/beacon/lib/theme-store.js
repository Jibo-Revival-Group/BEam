'use strict';

const http = require('http');
const https = require('https');
const url = require('url');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const pkg = require('./theme-package');
const DEFAULT_SOURCE = 'https://store.5x1.com/manifest.json';
const MAX_METADATA = 1024 * 1024;
let authorities;
function certificateAuthorities() {
    // Electron 1.4.3 has an old embedded trust store. Supply the shipped Mozilla
    // roots explicitly for every HTTPS hop, including GitHub's archive host.
    if (!authorities) { authorities = fs.readFileSync(path.join(__dirname, '../certs/mozilla-ca.pem'), 'utf8'); }
    return authorities;
}
function hash(value) { return crypto.createHash('sha256').update(value).digest('hex').slice(0, 24); }
function normalize(value) {
    if (typeof value !== 'string' || value.length > 2048) { throw pkg.fail('Enter a manifest or GitHub repository URL'); }
    const u = url.parse(value.trim());
    if ((u.protocol !== 'https:' && u.protocol !== 'http:') || !u.hostname || u.auth) { throw pkg.fail('Use an HTTP or HTTPS URL without credentials'); }
    u.hash = null;
    const gh = /^\/([^/]+)\/([^/]+?)(?:\.git)?\/?$/.exec(u.pathname || '');
    if (u.hostname.toLowerCase() === 'github.com' && gh) { return 'https://github.com/' + gh[1] + '/' + gh[2]; }
    return url.format(u);
}
function github(value) {
    const u = url.parse(value); const m = /^\/([^/]+)\/([^/]+)$/.exec(u.pathname);
    return u.hostname === 'github.com' && m ? { owner: m[1], repo: m[2] } : null;
}
function request(value, limit, hops, operation) {
    let normalized;
    try { if (operation) { operation.check(); } normalized = normalize(value); } catch (err) { return Promise.reject(err); }
    return new Promise((resolve, reject) => {
        const transport = normalized.indexOf('https:') === 0 ? https : http;
        let done = false; let response; let unsubscribe = () => {};
        const requestOptions = url.parse(normalized);
        requestOptions.headers = { 'User-Agent': 'BEacon-Themes', Accept: 'application/json, */*' };
        const auth = require('./github-auth');
        const token = requestOptions.protocol === 'https:' && requestOptions.hostname === 'api.github.com' ? auth.token() : null;
        if (requestOptions.hostname === 'api.github.com' && !token) { const e = pkg.fail('Sign in to GitHub to use the Store.'); e.status = 401; reject(e); return; }
        if (token) { requestOptions.headers.Authorization = 'Bearer ' + token; }
        if (transport === https) {
            requestOptions.ca = certificateAuthorities();
            requestOptions.rejectUnauthorized = true;
        }
        const req = transport.get(requestOptions, res => {
            response = res;
            res.on('error', abort);
            res.on('aborted', () => abort(pkg.fail('Download was interrupted. You can retry.')));
            let ended = false;
            res.on('end', () => { ended = true; });
            res.on('close', () => { if (!ended) { abort(pkg.fail('Download connection closed before completion. You can retry.')); } });
            if ([301, 302, 303, 307, 308].indexOf(res.statusCode) >= 0) {
                if ((hops || 0) >= 5 || !res.headers.location) { abort(pkg.fail('Too many download redirects')); return; }
                done = true; clearTimeout(deadline); unsubscribe(); res.resume();
                request(url.resolve(normalized, res.headers.location), limit, (hops || 0) + 1, operation).then(resolve, reject); return;
            }
            if (res.statusCode === 401 && token) {
                auth.invalidate(token);
                const e = pkg.fail('GitHub authorization expired or was revoked. Sign in again.'); e.status = 401; e.remoteStatus = 401;
                res.resume(); abort(e); return;
            }
            if (res.statusCode !== 200) {
                const e = pkg.fail('Download returned HTTP ' + res.statusCode); e.remoteStatus = res.statusCode; res.resume(); abort(e); return;
            }
            const chunks = []; let size = 0;
            const length = Number(res.headers['content-length']);
            const total = Number.isFinite(length) && length > 0 ? length : null;
            function report() { if (operation && operation.onProgress) { operation.onProgress(size, total); } }
            report();
            res.on('data', chunk => {
                if (done) { return; }
                size += chunk.length;
                if (size > limit) { abort(pkg.fail('Download exceeds the size limit')); }
                else { chunks.push(chunk); report(); }
            });
            res.on('end', () => { if (!done) { done = true; clearTimeout(deadline); unsubscribe(); resolve(Buffer.concat(chunks, size)); } });
        });
        function abort(e) {
            if (done) { return; } done = true; clearTimeout(deadline); unsubscribe(); req.destroy(); if (response) { response.destroy(); } reject(e);
        }
        const deadline = setTimeout(() => abort(pkg.fail('Download timed out')), 30000);
        req.on('error', abort);
        if (operation) { unsubscribe = operation.onCancel(abort); }
    });
}
function json(buf) { try { return JSON.parse(buf.toString('utf8')); } catch (err) { throw pkg.fail('Remote manifest is not valid JSON'); } }
function optional(value) { return request(value, MAX_METADATA).catch(err => { if (err.remoteStatus === 404) { return null; } throw err; }); }
function paragraph(readme) {
    const lines = String(readme || '').split(/\r?\n/); const out = []; let fenced = false;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (/^```|^~~~/.test(line)) { fenced = !fenced; continue; }
        if (fenced || /^#|^[-=*]{3,}$/.test(line) || (i + 1 < lines.length && /^\s*(?:={3,}|-{3,})\s*$/.test(lines[i + 1])) || (!out.length && !line)) { continue; }
        if (!line && out.length) { break; }
        out.push(line.replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/[*_`]/g, '').replace(/<[^>]*>/g, ''));
    }
    return out.join(' ').slice(0, 1000);
}
function entries(data, section, base) {
    const arr = data[section] || [];
    if (!Array.isArray(arr)) { throw pkg.fail('Store ' + section + ' must be an array'); }
    const out = [];
    for (let i = 0; i < arr.length; i++) {
        let item = arr[i]; let name;
        if (typeof item === 'string') {
            name = item;
            if (!arr[i + 1] || typeof arr[i + 1] !== 'object') { continue; }
            item = arr[++i];
        } else if (item && typeof item === 'object') { name = item.name; }
        if (!item || typeof item.url !== 'string') { throw pkg.fail('Store entries require a URL'); }
        if (name === 'None' && item.url === '.') { out.push({ name: 'None', type: 'theme', stock: true, url: null }); continue; }
        out.push({ name: name || '', type: section === 'themes' ? 'theme' : 'skill', url: normalize(url.resolve(base, item.url)) });
    }
    if (out.length > 100) { throw pkg.fail('Store has too many entries'); }
    return out;
}
function create(fetcher) {
    const network = fetcher || request;
    const repoCache = Object.create(null), releaseCache = Object.create(null);
    function fetch(value, limit, operation) {
        return Promise.resolve().then(() => { if (operation) { operation.check(); } return network(value, limit, 0, operation); });
    }
    const opt = (value, operation) => fetch(value, MAX_METADATA, operation).catch(err => { if (err.remoteStatus === 404) { return null; } throw err; });
    function cached(cache, key, ttl, operation) {
        const existing = cache[key];
        if (existing && Date.now() - existing.time < ttl) { return Promise.resolve(existing.data); }
        return fetch(key, MAX_METADATA, operation).then(json).then(data => { cache[key] = { data: data, time: Date.now() }; return data; });
    }
    function resolve(value, operation) {
        value = normalize(value); const gh = github(value);
        if (!gh) { return fetch(value, MAX_METADATA, operation).then(buf => ({ url: value, base: value, data: json(buf), manifest: buf })); }
        const api = 'https://api.github.com/repos/' + encodeURIComponent(gh.owner) + '/' + encodeURIComponent(gh.repo);
        return cached(repoCache, api, 60 * 60 * 1000, operation).then(repo => {
            return cached(releaseCache, api + '/releases/latest', 10 * 60 * 1000, operation).catch(err => {
                if (err.remoteStatus === 404) { throw pkg.fail('No published GitHub release found for ' + gh.owner + '/' + gh.repo); }
                throw err;
            }).then(release => ({ repo: repo, release: release }));
        }).then(resolved => {
            const release = resolved.release, repo = resolved.repo;
            if (release.draft || release.prerelease || typeof release.tag_name !== 'string' || !release.tag_name.trim()) {
                throw pkg.fail('GitHub repository needs a published stable release');
            }
            const tag = encodeURIComponent(release.tag_name);
            const base = 'https://raw.githubusercontent.com/' + gh.owner + '/' + gh.repo + '/' + tag + '/';
            if (release.assets !== undefined && !Array.isArray(release.assets)) { throw pkg.fail('GitHub release assets are invalid'); }
            const zipAssets = (release.assets || []).filter(asset => asset && /\.zip$/i.test(asset.name || '') && asset.state === 'uploaded');
            // Prefer the repository-named package if a release contains other ZIPs.
            const named = zipAssets.filter(asset => String(asset.name).toLowerCase() === gh.repo.toLowerCase() + '.zip');
            const candidates = named.length ? named : zipAssets;
            if (candidates.length > 1) { throw pkg.fail('Release has multiple ZIP packages; name the installable package ' + gh.repo + '.zip'); }
            const asset = candidates[0];
            const archive = asset ? asset.browser_download_url : release.zipball_url;
            if (!archive) { throw pkg.fail('GitHub release has no downloadable ZIP'); }
            const origin = { id: release.id, tag: release.tag_name, name: release.name || release.tag_name,
                url: release.html_url || value + '/releases/tag/' + tag, publishedAt: release.published_at || null,
                asset: asset ? asset.name : null };
            return fetch(base + 'manifest.json', MAX_METADATA, operation).then(buf => ({
                url: value, base: base + 'manifest.json', data: json(buf), manifest: buf, release: origin,
                archive: normalize(archive), developer: repo.owner && repo.owner.login || gh.owner,
                stars: typeof repo.stargazers_count === 'number' ? repo.stargazers_count : null
            }));
        });
    }
    function detail(value, operation) {
        return resolve(value, operation).then(r => {
            const manifest = pkg.manifest(r.manifest);
            return opt(url.resolve(r.base, 'README.md'), operation).then(buf => {
                const readme = buf ? buf.toString('utf8') : '';
                return { url: r.url, manifest: manifest, readme: readme, readmeUrl: url.resolve(r.base, 'README.md'), description: paragraph(readme), commit: null, release: r.release || null,
                    bannerUrl: url.resolve(r.base, 'banner.png'), developer: r.developer || null, stars: r.stars == null ? null : r.stars };
            });
        });
    }
    function catalog(value, operation) {
        return resolve(value, operation).then(r => {
            const items = r.data.type ? [{ name: pkg.manifest(r.manifest).name, type: r.data.type, url: r.url }] :
                entries(r.data, 'themes', r.base).concat(entries(r.data, 'skills', r.base));
            const themes = items.filter(item => item.type === 'theme' || item.type === 'skill');
            // Small batches avoid overwhelming robot memory/network on large storefronts.
            let chain = Promise.resolve(); const out = [];
            themes.forEach(item => { chain = chain.then(() => {
                if (item.stock) { out.push(item); return; }
                return detail(item.url, operation).then(d => {
                    if (d.manifest.type !== item.type) { throw pkg.fail('Store entry type does not match its manifest'); }
                    out.push(Object.assign({}, item, d, { name: d.manifest.name }));
                }).catch(err => { if (operation) { operation.check(); } const repo = github(item.url); out.push(Object.assign({}, item, { developer: repo && repo.owner, stars: null, error: err.message })); });
            }); });
            return chain.then(() => out);
        });
    }
    function download(value, operation) {
        function report(update) { if (operation && operation.progress) { operation.progress(update); } }
        function transfer(onProgress) {
            const token = Object.create(operation || null); token.onProgress = onProgress;
            // Standalone store downloads have no cancellation token.
            if (!operation) { token.check = () => {}; token.onCancel = () => () => {}; }
            return token;
        }
        const packageTransfer = transfer((received, total) => report({ state: 'downloading', received: received, total: total,
            percent: total ? Math.min(100, received / total * 100) : null }));
        function archive(value, skill) {
            return fetch(value, pkg.MAX_ZIP, packageTransfer).then(buf => {
                report({ state: 'validating', percent: null }); return pkg.unzip(buf, { skill: skill });
            });
        }
        return resolve(value, operation).then(r => {
            const declared = pkg.manifest(r.manifest);
            function archiveResult(files) {
                const actual = pkg.manifest(files['manifest.json']);
                if (JSON.stringify(actual) !== JSON.stringify(declared)) { throw pkg.fail('Downloaded package does not match its published manifest'); }
                return { files: files, commit: null, release: r.release || null, readmeUrl: url.resolve(r.base, 'README.md') };
            }
            if (r.archive) { return archive(r.archive, declared.type === 'skill').then(archiveResult); }
            if (r.data.download) {
                return archive(normalize(url.resolve(r.base, r.data.download)), declared.type === 'skill').then(archiveResult);
            }
            if (declared.type === 'skill') { throw pkg.fail('Skill manifests need a download ZIP URL or a GitHub repository'); }
            const files = { 'manifest.json': r.manifest };
            const extra = [];
            ['atex', 'asfx', 'icons'].forEach(folder => {
                if (r.data[folder] === undefined) { return; }
                if (!Array.isArray(r.data[folder]) || r.data[folder].length > 1024) { throw pkg.fail(folder + ' must be an array of relative asset filenames'); }
                r.data[folder].forEach(name => {
                    const file = folder + '/' + name;
                    if (typeof name !== 'string' || !pkg.assetPath(file) || extra.indexOf(file) >= 0) { throw pkg.fail('Invalid animation asset path: ' + file); }
                    extra.push(file);
                });
            });
            if (extra.length > 1014) { throw pkg.fail('Too many animation assets'); }
            const names = pkg.FILES.filter(n => n !== 'manifest.json').concat(extra); let completed = 0; let size = r.manifest.length;
            return names.reduce((chain, n) => chain.then(() => {
                report({ state: 'downloading', percent: completed / names.length * 100, received: 0, total: null });
                const token = transfer((received, total) => report({ state: 'downloading', received: received, total: total,
                    percent: (completed + (total ? Math.min(1, received / total) : 0)) / names.length * 100 }));
                return fetch(url.resolve(r.base, n.split('/').map(encodeURIComponent).join('/')), pkg.assetPath(n) || /\.png$/.test(n) ? 16 * 1024 * 1024 : MAX_METADATA, token).then(buf => {
                    size += buf.length;
                    if (size > 64 * 1024 * 1024) { throw pkg.fail('Theme exceeds 64 MB expanded'); }
                    files[n] = buf;
                })
                    .catch(err => { if (err.remoteStatus !== 404 || extra.indexOf(n) >= 0) { throw err; } })
                    .then(() => { completed++; report({ percent: completed / names.length * 100 }); });
            }), Promise.resolve()).then(() => ({ files: files, commit: null, readmeUrl: url.resolve(r.base, 'README.md') }));
        });
    }
    function banner(value, operation) {
        return fetch(normalize(value), 2 * 1024 * 1024, operation).then(buf => pkg.png(buf).then(() => buf))
            .catch(err => { if (err.remoteStatus === 404) { return null; } throw err; });
    }
    return { catalog: catalog, detail: detail, download: download, banner: banner };
}
module.exports = { create: create, normalize: normalize, hash: hash, paragraph: paragraph,
    DEFAULT_SOURCE: DEFAULT_SOURCE, entries: entries, request: request };
