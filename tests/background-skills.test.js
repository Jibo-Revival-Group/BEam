'use strict';

// Background parts of custom skills: started at boot, can open their own screen, stopped on removal.
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const BE = path.join(__dirname, '..', '@be', 'be');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bg-skills-'));

function pack (name, pkg, files) {
    const dir = path.join(root, name);
    fs.mkdirSync(dir);
    fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify(pkg));
    Object.keys(files).forEach(f => fs.writeFileSync(path.join(dir, f), files[f]));
    return dir;
}

const calls = [];
const dirs = {
    '@be/caller': pack('caller', { name: '@be/caller', jibo: { type: 'asset-pack', background: 'background.js' } }, {
        'background.js': "exports.start = function (api) { global.__bg.push(['start', api.skillId]); global.__bgApi = api; };\n" +
            "exports.stop = function () { global.__bg.push(['stop']); };"
    }),
    '@be/plain': pack('plain', { name: '@be/plain', jibo: { type: 'asset-pack' } }, {}),
    '@be/broken': pack('broken', { name: '@be/broken', jibo: { type: 'asset-pack', background: 'bg.js' } }, { 'bg.js': 'throw new Error("boom")' }),
    '@be/escape': pack('escape', { name: '@be/escape', jibo: { type: 'asset-pack', background: '../caller/background.js' } }, {}),
    '@be/old': pack('old', { name: '@be/old', jibo: { type: 'asset-pack', background: 'bg.js' } }, { 'bg.js': 'global.__bg.push(["old ran"]);' })
};
global.__bg = calls;

const skills = Object.keys(dirs).map(id => ({ packageName: id, compatibility: { status: id === '@be/old' ? 'incompatible' : 'compatible' } }));
require.cache[path.join(BE, 'beacon/lib/custom-skills.js')] = { exports: {
    inventory: () => ({ skills: skills }), resolve: id => dirs[id]
} };
const prepared = [];
require.cache[path.join(BE, 'skill-registry.js')] = { exports: { prepareForOpen: (be, id) => { prepared.push(id); return { assetPack: id }; } } };

function SkillSwitchData (skill, options) { this.skill = skill; this.options = options; }
const redirects = [];
const be = { idle: { assetPack: '@be/idle' }, redirect: data => redirects.push(data) };
be.currentSkill = be.idle;
be.constructor = { SkillSwitchData: SkillSwitchData };

const background = require(path.join(BE, 'background-skills.js'));
const warn = console.warn; console.warn = () => {};
background.start(be);
console.warn = warn;

// Only the skill with a valid background script runs; broken, escaping, incompatible and plain ones are skipped.
assert.deepStrictEqual(calls, [['start', '@be/caller']]);
assert.deepStrictEqual(background.running(), ['@be/caller']);

const api = global.__bgApi;
assert.strictEqual(api.isIdle(), true);
assert.strictEqual(api.isOpen(), false);

// open() brings the skill's own screen up, passing the data as the launch entities.
assert.strictEqual(api.open({ caller: 'Zoe' }), true);
assert.deepStrictEqual(prepared, ['@be/caller']);
assert.strictEqual(redirects.length, 1);
assert.strictEqual(redirects[0].skill.assetPack, '@be/caller');
assert.deepStrictEqual(redirects[0].options.nlu, { intent: 'background', entities: { caller: 'Zoe' } });
assert.strictEqual(redirects[0].options.match.skillID, '@be/caller');

// Already showing: open() does nothing.
be.currentSkill = { assetPack: '@be/caller' };
assert.strictEqual(api.isOpen(), true);
assert.strictEqual(api.open({}), false);
assert.strictEqual(redirects.length, 1);

// Starting again (e.g. a second start call) does not run the script twice.
background.start(be);
assert.strictEqual(calls.filter(c => c[0] === 'start').length, 1);

// Update: the old script is stopped and the new one started.
background.restart('@be/caller');
assert.deepStrictEqual(calls.slice(1), [['stop'], ['start', '@be/caller']]);

// Removal stops it.
background.stop('@be/caller');
assert.deepStrictEqual(calls[calls.length - 1], ['stop']);
assert.deepStrictEqual(background.running(), []);

console.log('PASS background-skills');
