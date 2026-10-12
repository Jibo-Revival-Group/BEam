'use strict';
const assert = require('assert'), fs = require('fs'), os = require('os'), path = require('path'), Module = require('module');
const custom = require('../@be/be/beacon/lib/custom-skills');
const menu = require('../@be/be/beacon/lib/menu-layout');
const fixture = require('./theme-fixtures');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'custom-skill-node6-'));
let current = '3.1.6';
const service = custom.create({ root: path.join(temp, 'skills'), onChange: function () {}, compatibility: function (m) { return { status: current < m.supported ? 'incompatible' : 'compatible' }; } });
const files = {
    'manifest.json': Buffer.from('{"name":"Node 6 Skill","type":"skill","version":"1.0.0","supported":"3.1.6","buttonColor":"#58586D #282735","themes":false}'),
    'icon.png': fixture.png(),
    'pack/package.json': Buffer.from('{"name":"@be/node6-test","main":"index.js","jibo":{"type":"asset-pack"}}'),
    'pack/index.js': Buffer.from('const EventEmitter=require("events"); module.exports=class Skill extends EventEmitter { constructor(opts) { super(); this.assetPack=opts.assetPack; this.rootPath=opts.rootPath; } };')
};
const originalResolver = Module._resolveFilename;
function clean(dir) { fs.readdirSync(dir).forEach(n => { const file = path.join(dir, n); if (fs.statSync(file).isDirectory()) { clean(file); } else { fs.unlinkSync(file); } }); fs.rmdirSync(dir); }
function finish(err) { Module._resolveFilename = originalResolver; clean(temp); if (err) { console.error(err); process.exitCode = 1; } }
const wrapped = { 'Skill-main/': Buffer.alloc(0), 'Skill-main/pack/': Buffer.alloc(0) };
Object.keys(files).forEach(function (name) { wrapped['Skill-main/' + name] = files[name]; });
service.upload(fixture.zip(wrapped)).then(function () {
    const layout = menu.create({ root: path.join(temp, 'menu'), skills: service });
    assert.strictEqual(layout.view(null).viewConfig.list[0].id, '@be/node6-test');
    const servicePath = require.resolve('../@be/be/beacon/lib/custom-skills');
    require.cache[servicePath].exports = service;
    const resolver = require('../@be/be/skills-resolve'); resolver.install();
    assert.strictEqual(require.resolve('@be/node6-test'), path.join(service.resolve('@be/node6-test'), 'index.js'));
    assert.strictEqual(require.resolve('@be/node6-test/package.json'), path.join(service.resolve('@be/node6-test'), 'package.json'));
    const registryPath = path.resolve(__dirname, '../@be/be/skill-registry.js'), module = { exports: {} };
    const fakeJibo = { utils: { PathUtils: { resolve: id => require.resolve(id) } }, loader: { deleteCache() {} }, expression: { destroyCaches() {} } };
    const localRequire = id => id === 'jibo' ? fakeJibo : id === './skills-resolve' ? resolver : id === './beacon/lib/custom-skills' ? service : require(id);
    localRequire.cache = require.cache;
    new Function('require', 'module', 'exports', 'setTimeout', fs.readFileSync(registryPath, 'utf8'))(localRequire, module, module.exports, () => 0);
    let recovered = false;
    const registry = module.exports, be = { packageInfo: { jibo: { skills: [], lazySkills: [] } }, skills: {}, _validateSkill: () => true, redirect() {}, exit(skill, opts) { recovered = opts.noElementsOfSurprise; } };
    registry.install(be);
    const first = registry.prepareForOpen(be, '@be/node6-test'); assert.strictEqual(first.assetPack, '@be/node6-test'); assert.strictEqual(first._beamThemesEnabled, false); assert.strictEqual(service.inventory().skills[0].manifest.themes, false);
    assert.strictEqual(first.rootPath, service.resolve('@be/node6-test').replace(/\/$/, ''));
    current = '3.1.5'; assert.throws(() => registry.prepareForOpen(be, '@be/node6-test'), /needs version/);
    be.currentSkill = { assetPack: '@be/main-menu' }; be.skillRedirect(be.currentSkill, '@be/node6-test'); assert(recovered, 'Failed custom launch returns to idle'); current = '3.1.6';
    return service.upload(fixture.zip(files)).then(function () {
        const second = registry.prepareForOpen(be, '@be/node6-test'); assert.notStrictEqual(second, first, 'New revision reloads even with identical source');
        be.currentSkill = second; assert.throws(() => registry.removeCustom('@be/node6-test'), /Close this skill/); be.currentSkill = null; registry.removeCustom('@be/node6-test'); assert(!be.skills['@be/node6-test']);
        service.cleanup(); console.log('Node 6 custom ZIP install, menu rendering, module/asset resolution, compatibility and live revision reload passed');
    });
}).then(() => finish(), finish);
