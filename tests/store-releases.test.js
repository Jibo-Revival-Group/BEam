'use strict';
// Node 6-compatible tests for stable-release resolution, asset selection and caching.
const assert = require('assert'), stores = require('../@be/be/beacon/lib/theme-store');
const pkg = require('../@be/be/beacon/lib/theme-package'), fixture = require('./theme-fixtures');
const files = fixture.astra(), repo = 'https://github.com/example/widget', api = 'https://api.github.com/repos/example/widget';
const tag = 'v1.0.0', base = 'https://raw.githubusercontent.com/example/widget/' + tag + '/';
const archive = api + '/zipball/' + tag, assetUrl = repo + '/releases/download/' + tag + '/widget.zip';
function release(overrides) { return Object.assign({id: 12, tag_name: tag, name: 'Version one', html_url: repo + '/releases/tag/' + tag, published_at: '2026-10-12T00:00:00Z', draft: false, prerelease: false, zipball_url: archive, assets: []}, overrides); }
function zip(name, url) { return {name: name, state: 'uploaded', browser_download_url: url || assetUrl}; }
function scenario(metadata) {
    const requests = [];
    const store = stores.create(function(value) {
        requests.push(value);
        if (value === api) { return Promise.resolve(Buffer.from(JSON.stringify({default_branch: 'unreleased-work', owner:{login:'example'}, stargazers_count:8}))); }
        if (value === api + '/releases/latest') {
            if (metadata instanceof Error) { return Promise.reject(metadata); }
            return Promise.resolve(Buffer.from(JSON.stringify(metadata)));
        }
        if (value === archive || value === assetUrl) { return Promise.resolve(fixture.zip(files)); }
        if (value.indexOf(base) === 0 && files[value.slice(base.length)]) { return Promise.resolve(files[value.slice(base.length)]); }
        return Promise.reject(Object.assign(new Error('Unexpected request: ' + value), {remoteStatus:404}));
    });
    return {store: store, requests: requests};
}
function rejects(promise, pattern) { return promise.then(function(){throw new Error('Expected rejection');},function(err){assert(pattern.test(err.message),err.message);}); }
const attached = scenario(release({assets:[zip('widget.zip')]}));
attached.store.catalog(repo).then(function(items){
    assert.strictEqual(items[0].release.tag, tag); assert.strictEqual(items[0].manifest.name, 'Astra');
    assert.strictEqual(items[0].readmeUrl, base + 'README.md'); assert.strictEqual(items[0].bannerUrl, base + 'banner.png');
    return attached.store.download(repo);
}).then(function(download){
    assert.strictEqual(download.release.asset, 'widget.zip'); assert.strictEqual(download.release.id, 12); assert.strictEqual(download.commit,null);
    assert(attached.requests.indexOf(assetUrl)>=0);assert(attached.requests.indexOf(archive)<0);
    assert.strictEqual(attached.requests.filter(u=>u===api+'/releases/latest').length,1,'Release metadata is cached across browsing and download');
    assert(!attached.requests.some(u=>/commits|unreleased-work/.test(u)));
    const source=scenario(release());return source.store.download(repo).then(function(download){assert.strictEqual(download.release.asset,null);assert(source.requests.indexOf(archive)>=0);});
}).then(function(){
    const named=scenario(release({assets:[zip('debug.zip','https://example.com/debug.zip'),zip('widget.zip')]}));
    return named.store.download(repo).then(function(download){assert.strictEqual(download.release.asset,'widget.zip');});
}).then(function(){
    return rejects(scenario(release({assets:[zip('one.zip'),zip('two.zip')]})).store.download(repo),/multiple ZIP/);
}).then(function(){
    return rejects(scenario(Object.assign(new Error('Not found'),{remoteStatus:404})).store.download(repo),/No published GitHub release/);
}).then(function(){
    return rejects(scenario(release({draft:true})).store.download(repo),/stable release/);
}).then(function(){
    return rejects(scenario(release({prerelease:true})).store.download(repo),/stable release/);
}).then(function(){
    return rejects(scenario(release({tag_name:''})).store.download(repo),/stable release/);
}).then(function(){
    return rejects(scenario(release({zipball_url:null})).store.download(repo),/no downloadable ZIP/);
}).then(function(){
    const rate=scenario(Object.assign(new Error('Rate limit'),{remoteStatus:403}));
    return rejects(rate.store.download(repo),/Rate limit/).then(function(){assert(rate.requests.every(u=>u.indexOf('https://api.github.com/')===0));});
}).then(function(){
    const mismatch=stores.create(function(value){
        if(value===api){return Promise.resolve(Buffer.from('{}'));}
        if(value===api+'/releases/latest'){return Promise.resolve(Buffer.from(JSON.stringify(release({assets:[zip('widget.zip')]}))));}
        if(value===base+'manifest.json'){return Promise.resolve(files['manifest.json']);}
        const changed=Object.assign({},files);const manifest=JSON.parse(files['manifest.json']);manifest.version='9.9.9';changed['manifest.json']=Buffer.from(JSON.stringify(manifest));
        return Promise.resolve(fixture.zip(changed));
    });return rejects(mismatch.download(repo),/does not match/);
}).then(function(){console.log('Stable GitHub releases, attached package ZIPs, tagged archives, provenance, cache, ambiguity, missing releases, prereleases, API errors and manifest agreement passed');})
.catch(function(err){console.error(err);process.exitCode=1;});
