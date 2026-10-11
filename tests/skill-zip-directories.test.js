'use strict';
const assert = require('assert'), fs = require('fs'), os = require('os'), path = require('path');
const custom = require('../@be/be/beacon/lib/custom-skills');
const packages = require('../@be/be/beacon/lib/theme-package');
const fixture = require('./theme-fixtures');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-zip-directories-'));
const files = { 'manifest.json': Buffer.from('{"name":"Directory test","type":"skill","version":"1.0.0"}'),
    'icon.png': fixture.png(), 'pack/package.json': Buffer.from('{"name":"@be/directory-test","jibo":{"type":"asset-pack"}}'),
    'pack/index.js': Buffer.from('module.exports=function() {};') };
let failSync = false, failCleanup = false;
const originalReadDir = fs.readdirSync;
const service = custom.create({ root, compatibility: () => ({ status: 'compatible' }), onChange() { if (failSync) { throw new Error('Menu sync failed'); } } });
async function run() {
    for (const wrapped of [false, true]) {
        const prefix = wrapped ? 'Upload-main/' : '', entries = {};
        if (prefix) { entries[prefix] = Buffer.alloc(0); }
        entries[prefix + 'pack/'] = Buffer.alloc(0);
        Object.keys(files).forEach(name => { entries[prefix + name] = files[name]; });
        const zip = fixture.zip(entries), decoded = await packages.unzip(zip, { skill: true });
        assert(!Object.prototype.hasOwnProperty.call(decoded, ''), 'Enclosing directory must never become an empty file path');
        assert.deepStrictEqual(Object.keys(decoded).sort(), Object.keys(files).sort());
        await service.upload(zip); await service.upload(zip);
        assert(fs.statSync(service.resolve('@be/directory-test')).isDirectory());
    }
    const revision = service.inventory().skills[0].revision;
    for (const entries of [Object.assign({ pack: Buffer.from('file') }, files), Object.assign({}, files, { PACK: Buffer.from('file') })]) {
        await assert.rejects(service.upload(fixture.zip(entries)), /conflicts with a directory/);
        assert.strictEqual(service.inventory().skills[0].revision, revision);
    }
    failSync = failCleanup = true;
    fs.readdirSync = function (dir) {
        if (failCleanup && path.dirname(dir) === path.join(root, 'packages')) { throw new Error('Cleanup failed'); }
        return originalReadDir.apply(fs, arguments);
    };
    await assert.rejects(service.upload(fixture.zip(files)), /Menu sync failed/);
    assert.strictEqual(service.inventory().skills[0].revision, revision, 'Failed installation preserves the previous package');
    failSync = failCleanup = false; fs.readdirSync = originalReadDir;
    // The original bug left a regular file at a revision path. Clean it safely.
    const orphan = path.join(root, 'packages', 'a'.repeat(24)); fs.writeFileSync(orphan, '');
    const external = path.join(root, 'keep.txt'); fs.writeFileSync(external, 'keep');
    const link = path.join(root, 'packages', 'b'.repeat(24)); fs.symlinkSync(external, link);
    service.cleanup(); assert(!fs.existsSync(orphan)); assert(!fs.existsSync(link)); assert.strictEqual(fs.readFileSync(external, 'utf8'), 'keep');
    await service.upload(fixture.zip(files)); assert.notStrictEqual(service.inventory().skills[0].revision, revision, 'Retry works without a restart');
    await service.upload(fs.readFileSync(path.resolve(__dirname, '../../BadApple.zip')), 'BadApple.zip');
    assert(fs.statSync(service.resolve('@be/bad-apple')).isDirectory(), 'Actual BadApple.zip installs with its explicit enclosing directory');
    console.log('Skill ZIP directory entries, actual BadApple upload, repeat uploads, path conflicts, rollback, orphan cleanup and retry passed');
}
run().catch(err => { console.error(err); process.exitCode = 1; }).finally(() => { fs.readdirSync = originalReadDir; fs.rmSync(root, { recursive: true, force: true }); });
