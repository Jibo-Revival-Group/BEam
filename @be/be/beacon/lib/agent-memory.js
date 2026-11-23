'use strict';
// Agent Mode's permanent memory: short notes the AI saves ("REMEMBER: ...") and reads back in its instructions.
// Kept on Jibo even while memory is turned off in the Agent settings; BEacon lists, deletes and clears them.
const fs = require('fs'), path = require('path'), crypto = require('crypto'), paths = require('./paths');
const MAX_ENTRIES = 200, MAX_LENGTH = 300;
function file() { return path.join(paths.dataDir(), 'agent-memory.json'); }
function list() {
    try { const entries = JSON.parse(fs.readFileSync(file(), 'utf8')); return Array.isArray(entries) ? entries : []; }
    catch (_) { return []; }
}
function write(entries) {
    const target = file(), temporary = target + '.tmp';
    fs.writeFileSync(temporary, JSON.stringify(entries), { mode: 0o600 });
    fs.renameSync(temporary, target);
    return entries;
}
function add(text) {
    text = String(text || '').replace(/[\x00-\x1f\x7f]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, MAX_LENGTH);
    const entries = list();
    if (!text || entries.some(entry => entry.text.toLowerCase() === text.toLowerCase())) return entries;
    entries.push({ id: crypto.randomBytes(8).toString('hex'), text: text, time: Date.now() });
    return write(entries.slice(-MAX_ENTRIES)); // the oldest go first when it is full
}
function remove(id) { return write(list().filter(entry => entry.id !== id)); }
function clear() { return write([]); }
// For the AI's instructions: the newest notes that fit in about 3000 characters, oldest first.
function prompt() {
    const lines = [];
    let size = 0;
    list().slice().reverse().some(entry => { size += entry.text.length + 3; if (size > 3000) return true; lines.unshift('- ' + entry.text); });
    return lines.join('\n');
}
module.exports = { list: list, add: add, remove: remove, clear: clear, prompt: prompt, MAX_LENGTH: MAX_LENGTH };
