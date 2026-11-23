'use strict';
// Custom skill settings: a skill lists them in manifest.json ("settings"), BEacon shows a Settings popup, and the values
// go to the skill's own Knowledge folder, which it may read without any permission:
//   /opt/jibo/Knowledge/<skill>/settings.json  {"<id>": value}; image and music values are absolute file paths
//   (in /opt/jibo/Knowledge/<skill>/settings/) or null.
const fs = require('fs'), path = require('path'), paths = require('./paths');
const TYPES = ['image', 'music', 'text', 'boolean', 'slider'];
const FILES = { image: { exts: ['png', 'jpg', 'jpeg', 'gif', 'webp'], max: 10 * 1024 * 1024 },
    music: { exts: ['mp3', 'm4a', 'aac', 'wav', 'ogg'], max: 30 * 1024 * 1024 } };
function fail(message, status) { const error = new Error(message); error.status = status || 400; return error; }
const number = value => typeof value === 'number' && isFinite(value);

// manifest.json "settings" -> a clean list, or a thrown message for the installer.
function schema(list) {
    if (!Array.isArray(list) || list.length < 1 || list.length > 20) throw fail('settings must list 1 to 20 settings');
    const ids = [];
    return list.map(s => {
        if (!s || typeof s.id !== 'string' || !/^[a-z][a-z0-9_-]{0,39}$/i.test(s.id) || ids.indexOf(s.id) >= 0) throw fail('each setting needs a unique id (letters, numbers, _ and -)');
        ids.push(s.id);
        if (TYPES.indexOf(s.type) < 0) throw fail('setting ' + s.id + ': type must be one of ' + TYPES.join(', '));
        if (typeof s.label !== 'string' || !s.label.trim() || s.label.length > 60) throw fail('setting ' + s.id + ' needs a label of up to 60 characters');
        const out = { id: s.id, type: s.type, label: s.label.trim() };
        if (typeof s.description === 'string' && s.description.trim()) out.description = s.description.trim().slice(0, 200);
        if (s.type === 'text') {
            out.maxLength = s.maxLength === undefined ? 200 : s.maxLength;
            if (!Number.isInteger(out.maxLength) || out.maxLength < 1 || out.maxLength > 1000) throw fail('setting ' + s.id + ': maxLength must be 1 to 1000');
            out.default = s.default === undefined ? '' : s.default;
            if (typeof out.default !== 'string' || out.default.length > out.maxLength) throw fail('setting ' + s.id + ': default must be text');
        } else if (s.type === 'boolean') {
            out.default = s.default === undefined ? false : s.default;
            if (typeof out.default !== 'boolean') throw fail('setting ' + s.id + ': default must be true or false');
        } else if (s.type === 'slider') {
            out.min = s.min === undefined ? 0 : s.min; out.max = s.max === undefined ? 100 : s.max; out.step = s.step === undefined ? 1 : s.step;
            if (![out.min, out.max, out.step].every(number) || out.min >= out.max || out.step <= 0) throw fail('setting ' + s.id + ': needs min < max and a step above 0');
            out.default = s.default === undefined ? out.min : s.default;
            if (!number(out.default) || out.default < out.min || out.default > out.max) throw fail('setting ' + s.id + ': default must be between min and max');
        } else out.default = null; // image / music: none until the owner picks a file
        return out;
    });
}
function folder(item) { return path.join(path.dirname(paths.dataDir()), item.packageName.slice(4)); } // its own KB section
function file(item) { return path.join(folder(item), 'settings.json'); }
function read(item) { try { return JSON.parse(fs.readFileSync(file(item), 'utf8')) || {}; } catch (_) { return {}; } }
function write(item, values) {
    paths.ensureDir(folder(item));
    const target = file(item), temporary = target + '.tmp';
    fs.writeFileSync(temporary, JSON.stringify(values, null, 2)); fs.renameSync(temporary, target);
}
// Every setting's current value (defaults for ones never set; a file that went missing reads as null).
function values(item) {
    const saved = read(item), out = {};
    (item.manifest.settings || []).forEach(s => {
        const value = saved[s.id];
        out[s.id] = s.type === 'image' || s.type === 'music' ? (typeof value === 'string' && fs.existsSync(value) ? value : null)
            : value === undefined ? s.default : value;
    });
    return out;
}
function setting(item, id) {
    const s = (item.manifest.settings || []).filter(x => x.id === id)[0];
    if (!s) throw fail('This skill has no setting ' + id);
    return s;
}
// Text, switches and sliders from the popup.
function save(item, input) {
    const saved = read(item);
    Object.keys(input || {}).forEach(id => {
        const s = setting(item, id), value = input[id];
        if (s.type === 'image' || s.type === 'music') throw fail(s.label + ' is a file; upload it instead');
        if (s.type === 'text' && (typeof value !== 'string' || value.length > s.maxLength)) throw fail(s.label + ' must be text of up to ' + s.maxLength + ' characters');
        if (s.type === 'boolean' && typeof value !== 'boolean') throw fail(s.label + ' must be on or off');
        if (s.type === 'slider' && (!number(value) || value < s.min || value > s.max)) throw fail(s.label + ' must be between ' + s.min + ' and ' + s.max);
        saved[id] = value;
    });
    write(item, saved);
    return values(item);
}
// An image or music file for one setting; replaces the old one.
function saveFile(item, id, name, buf) {
    const s = setting(item, id), kind = FILES[s.type];
    if (!kind) throw fail(s.label + ' is not a file setting');
    const ext = String(path.extname(String(name || ''))).slice(1).toLowerCase();
    if (kind.exts.indexOf(ext) < 0) throw fail(s.label + ' must be a ' + kind.exts.join(', ') + ' file');
    if (!buf || !buf.length || buf.length > kind.max) throw fail(s.label + ' must be under ' + kind.max / 1024 / 1024 + ' MB');
    const dir = path.join(folder(item), 'settings');
    paths.ensureDir(dir);
    clearFile(item, id, true);
    const target = path.join(dir, id + '.' + ext);
    fs.writeFileSync(target, buf);
    const saved = read(item); saved[id] = target; write(item, saved);
    return values(item);
}
function clearFile(item, id, keepValue) {
    setting(item, id);
    const saved = read(item);
    if (typeof saved[id] === 'string' && path.dirname(saved[id]) === path.join(folder(item), 'settings')) { try { fs.unlinkSync(saved[id]); } catch (_) {} }
    if (!keepValue) { saved[id] = null; write(item, saved); }
    return values(item);
}
module.exports = { TYPES: TYPES, FILES: FILES, schema: schema, values: values, save: save, saveFile: saveFile, clearFile: clearFile, folder: folder };
