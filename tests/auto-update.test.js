'use strict';

// More › Automatic updates: default on, the toggle persists, and only newer Store releases install.
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const paths = require('../@be/be/beacon/lib/paths');
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'auto-update-'));
paths.dataDir = () => temporary;
const autoUpdate = require('../@be/be/beacon/lib/auto-update');

const store = (url, release, version) => ({ kind: 'store', url: url, release: release === null ? null : { id: release } });
const calls = [];
function fakes() {
    const entries = [
        { id: 'e-skill-new', type: 'skill', url: 'https://github.com/a/Skill', manifest: { version: '1.1.2' }, release: { id: 20 } },
        { id: 'e-skill-same', type: 'skill', url: 'https://github.com/a/Same', manifest: { version: '1.0.0' }, release: { id: 5 } },
        { id: 'e-skill-old', type: 'skill', url: 'https://github.com/a/Stale', manifest: { version: '0.9.0' }, release: { id: 3 } },
        { id: 'e-skill-incompatible', type: 'skill', url: 'https://github.com/a/Future', manifest: { version: '2.0.0' }, release: { id: 9 }, compatibility: { status: 'incompatible' } },
        { id: 'e-zip', type: 'skill', url: 'https://github.com/a/Zip', manifest: { version: '9.0.0' }, release: { id: 99 } },
        { id: 'e-theme-active', url: 'https://github.com/a/Theme', manifest: { version: '2.0.0' }, release: { id: 8 } },
        { id: 'e-theme-other', url: 'https://github.com/a/Other', manifest: { version: '1.1.0' }, release: null }
    ];
    const skills = {
        inventory: () => ({ skills: [
            { manifest: { name: 'Skill', version: '1.1.1' }, origin: store('https://github.com/a/Skill', 10) },
            { manifest: { name: 'Same', version: '1.0.0' }, origin: store('https://github.com/a/Same', 5) },
            { manifest: { name: 'Stale', version: '1.0.0' }, origin: store('https://github.com/a/Stale', 4) },
            { manifest: { name: 'Future', version: '1.0.0' }, origin: store('https://github.com/a/Future', 1) },
            { manifest: { name: 'Zip', version: '1.0.0' }, origin: { kind: 'zip', name: 'zip.zip' } }
        ] }),
        install: id => { calls.push('skill ' + id); return Promise.resolve(); }
    };
    const themes = {
        catalog: () => ({ entries: entries }),
        inventory: () => ({ themes: [
            { id: 't1', active: true, manifest: { name: 'Theme', version: '1.0.0' }, origin: store('https://github.com/a/Theme', 7) },
            { id: 't2', active: false, manifest: { name: 'Other', version: '1.0.0' }, origin: store('https://github.com/a/Other', null) }
        ] }),
        install: id => { calls.push('theme ' + id); return id === 'e-theme-other' ? Promise.reject(new Error('download failed')) : Promise.resolve(); },
        activate: id => { calls.push('apply ' + id); return Promise.resolve(); }
    };
    return { skills: skills, themes: themes };
}

assert.strictEqual(autoUpdate.get(), true, 'on by default');
const warn = console.warn; console.warn = () => {};
autoUpdate.run(fakes()).then(updated => {
    console.warn = warn;
    // Newer release / different version only; stale listings, incompatible and uploaded ZIPs are left alone.
    // The theme in use is re-applied; one failed download does not stop the rest.
    assert.deepStrictEqual(calls, ['skill e-skill-new', 'theme e-theme-active', 'apply t1', 'theme e-theme-other']);
    assert.deepStrictEqual(updated, ['Skill', 'Theme']);

    assert.strictEqual(autoUpdate.set(false), false);
    assert.strictEqual(autoUpdate.get(), false, 'the toggle persists');
    assert.throws(() => autoUpdate.set('no'), /true or false/);
    calls.length = 0;
    return autoUpdate.run(fakes());
}).then(updated => {
    assert.deepStrictEqual(updated, []); assert.deepStrictEqual(calls, [], 'off: nothing installs');
    autoUpdate.set(true); assert.strictEqual(autoUpdate.get(), true);
    console.log('PASS auto-update');
}).catch(err => { console.error(err); process.exit(1); });
