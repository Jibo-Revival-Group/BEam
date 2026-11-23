'use strict';
// Custom skill settings: manifest "settings" (image, music, text, boolean, slider) are checked at install; BEacon
// saves values to the skill's own Knowledge folder (settings.json + settings/<id>.<ext>) that the skill reads.
const assert = require('assert'), fs = require('fs'), os = require('os'), path = require('path');
const root = path.resolve(__dirname, '../@be/be/beacon/lib'), paths = require(root + '/paths');
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-settings-'));
paths.dataDir = () => { const dir = path.join(temporary, 'beacon'); paths.ensureDir(dir); return dir; };
const settings = require(root + '/skill-settings'), packages = require(root + '/theme-package');

const declared = [
    { id: 'background', type: 'image', label: 'Background' },
    { id: 'alarm', type: 'music', label: 'Alarm sound' },
    { id: 'name', type: 'text', label: 'Pet name', default: 'Blob', maxLength: 20 },
    { id: 'loud', type: 'boolean', label: 'Loud mode' },
    { id: 'speed', type: 'slider', label: 'Speed', min: 1, max: 10, step: 1, default: 5 }
];
const manifest = packages.manifest(Buffer.from(JSON.stringify({ name: 'Pet', version: '1.0.0', type: 'skill', settings: declared })));
assert.strictEqual(manifest.settings.length, 5, 'the installer keeps the settings');
[[{ id: 'x', type: 'colour', label: 'X' }], [{ id: 'x', type: 'text', label: '' }], [{ id: 'a', type: 'text', label: 'A' }, { id: 'a', type: 'boolean', label: 'B' }],
    [{ id: 's', type: 'slider', label: 'S', min: 5, max: 1 }], [{ id: 's', type: 'slider', label: 'S', min: 0, max: 1, default: 3 }], [{ id: '../x', type: 'text', label: 'X' }], 'nope']
    .forEach(bad => assert.throws(() => packages.manifest(Buffer.from(JSON.stringify({ name: 'Pet', version: '1.0.0', type: 'skill', settings: bad }))), /setting/));

const skill = { packageName: '@be/pet', manifest: manifest };
const folder = path.join(temporary, 'pet'), saved = () => JSON.parse(fs.readFileSync(path.join(folder, 'settings.json'), 'utf8'));
assert.strictEqual(settings.folder(skill), folder, "the skill's own Knowledge section, which it may read without a permission");
assert.deepStrictEqual(settings.values(skill), { background: null, alarm: null, name: 'Blob', loud: false, speed: 5 }, 'defaults');
assert.deepStrictEqual(settings.save(skill, { name: 'Mochi', loud: true, speed: 8 }), { background: null, alarm: null, name: 'Mochi', loud: true, speed: 8 });
assert.deepStrictEqual(saved(), { name: 'Mochi', loud: true, speed: 8 });
[{ speed: 11 }, { speed: '5' }, { loud: 'yes' }, { name: 'x'.repeat(21) }, { nope: 1 }, { background: '/etc/passwd' }]
    .forEach(bad => assert.throws(() => settings.save(skill, bad), e => e.status === 400));

const png = Buffer.from('89504e470d0a1a0a', 'hex');
let values = settings.saveFile(skill, 'background', 'cat.PNG', png);
assert.strictEqual(values.background, path.join(folder, 'settings', 'background.png'));
assert(fs.readFileSync(values.background).equals(png));
values = settings.saveFile(skill, 'background', 'cat2.jpg', png);
assert(!fs.existsSync(path.join(folder, 'settings', 'background.png')), 'the old file is replaced');
assert.throws(() => settings.saveFile(skill, 'background', 'song.mp3', png), /png/);
assert.throws(() => settings.saveFile(skill, 'alarm', 'x.exe', png), /mp3/);
assert.throws(() => settings.saveFile(skill, 'name', 'a.png', png), /not a file/);
assert.throws(() => settings.saveFile(skill, 'alarm', 'a.mp3', Buffer.alloc(0)), /under/);
assert.strictEqual(settings.saveFile(skill, 'alarm', 'beep.mp3', png).alarm, path.join(folder, 'settings', 'alarm.mp3'));
values = settings.clearFile(skill, 'background');
assert.strictEqual(values.background, null); assert(!fs.existsSync(path.join(folder, 'settings', 'background.jpg')));
assert.strictEqual(values.name, 'Mochi', 'other settings stay');
fs.rmSync(temporary, { recursive: true, force: true });
console.log('Skill settings: manifest checks, defaults, text/switch/slider validation, image and music files kept in the skill\'s own folder.');
