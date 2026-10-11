'use strict';

const fs = require('fs');
const path = require('path');
const fail = require('./theme-package').fail;
const paths = require('./paths');
function index(root) {
    const files = Object.create(null); const names = Object.create(null);
    function walk(dir, prefix) {
        fs.readdirSync(dir).forEach(name => {
            const full = path.join(dir, name); const stat = fs.lstatSync(full);
            if (stat.isSymbolicLink()) { return; }
            const rel = prefix + name;
            if (stat.isDirectory()) { walk(full, rel + '/'); }
            else if (stat.isFile()) { files[rel] = true; (names[name] || (names[name] = [])).push(rel); }
        });
    }
    walk(root, ''); return { files: files, names: names };
}
function plan(theme, root) {
    const entries = (theme && theme.animationAssets) || [];
    if (!entries.length) { return []; }
    const base = root || path.join(paths.BE_ROOT, 'node_modules', 'jibo-anim-db-animations');
    const catalogs = {}; const used = Object.create(null);
    return entries.map(name => {
        const type = name.split('/')[0]; const rel = name.slice(type.length + 1);
        if (!catalogs[type]) { catalogs[type] = index(path.join(base, type === 'atex' ? 'animations/textures' : 'audio')); }
        const catalog = catalogs[type];
        const matches = catalog.files[rel] ? [rel] : rel.indexOf('/') < 0 ? catalog.names[rel] || [] : [];
        if (matches.length !== 1) { throw fail('Animation override ' + name + (matches.length ? ' is ambiguous; include its stock subfolder' : ' does not match a stock asset')); }
        const target = type + '/' + matches[0];
        if (used[target]) { throw fail('Duplicate animation override target: ' + name); } used[target] = true;
        return { name: name, type: type, target: matches[0] };
    });
}
function lookup(entries, type, value) {
    const text = String(value || '').replace(/\\/g, '/');
    const marker = type === 'atex' ? 'animations/textures/' : 'audio/';
    const pack = text.indexOf('jibo-anim-db-animations/');
    // Explicit references to another package/skill must retain its own assets.
    if (pack < 0 && text[0] === '/' && text.indexOf('/' + marker) !== 0 && text.indexOf('/animations/') !== 0) { return null; }
    let rel = pack >= 0 ? text.slice(pack + 'jibo-anim-db-animations/'.length) : text.replace(/^\//, '');
    if (rel.indexOf(marker) === 0) { rel = rel.slice(marker.length); }
    else if (type === 'atex' && rel.indexOf('animations/') === 0) { rel = rel.slice('animations/'.length); }
    const exact = (entries || []).filter(e => e.type === type && e.target === rel);
    if (exact.length) { return exact[0]; }
    const flat = rel.indexOf('/') < 0 ? (entries || []).filter(e => e.type === type && path.basename(e.target) === rel) : [];
    return flat.length === 1 ? flat[0] : null;
}
function decode(jibo, entries, dir) {
    const audio = entries.filter(e => e.type === 'asfx'); const out = Object.create(null);
    if (!audio.length) { return Promise.resolve(out); }
    const context = jibo.sound && jibo.sound.context && jibo.sound.context.context;
    if (!context || typeof context.decodeAudioData !== 'function') { return Promise.reject(fail('Animation sound renderer is not ready')); }
    let total = 0; const deadline = Date.now() + 15000;
    return audio.reduce((chain, entry) => chain.then(() => new Promise((resolve, reject) => {
        if (Date.now() >= deadline) { reject(fail('Animation sound decoding timed out')); return; }
        const data = fs.readFileSync(path.join(dir, entry.name));
        const buffer = new Uint8Array(data.length); buffer.set(data);
        let done = false; const timer = setTimeout(() => finish(fail('Animation sound decoding timed out')), Math.max(1, deadline - Date.now()));
        function finish(err, decoded) {
            if (done) { return; } done = true; clearTimeout(timer);
            if (err || !decoded) { reject(fail('Unable to decode ' + entry.name + ': ' + (err && err.message || 'invalid audio'))); return; }
            total += decoded.length * decoded.numberOfChannels * 4;
            if (!isFinite(total) || total > 64 * 1024 * 1024) { reject(fail('Decoded animation sounds exceed 64 MB')); return; }
            out[entry.name] = decoded; resolve();
        }
        try {
            const result = context.decodeAudioData(buffer.buffer, value => finish(null, value), err => finish(err || new Error('Invalid audio')));
            if (result && result.then) { result.then(value => finish(null, value), finish); }
        } catch (err) { finish(err); }
    })), Promise.resolve()).then(() => out);
}
function hookSound(jibo, selection) {
    const Sound = jibo.sound && jibo.sound.Sound;
    if (!Sound || Sound.prototype._beamAnimationSoundHooked) { return; }
    const play = Sound.prototype.play;
    Sound.prototype.play = function() {
        const sound = this; const chain = this._chain;
        if (chain && !chain._beamAnimationSoundHooked) {
            const clone = chain.cloneBufferSource;
            chain.cloneBufferSource = function() {
                const active = selection(); const entry = active && lookup(active.animationAssets, 'asfx', sound.src);
                if (!entry || !active.audio[entry.name]) { return clone.apply(this, arguments); }
                const nodes = this.nodes(); const stock = nodes.bufferSource;
                // Native AudioBufferSourceNode buffers cannot be reassigned. Swap
                // the clone template instead; the stock node is never modified.
                nodes.bufferSource = { buffer: active.audio[entry.name], playbackRate: stock.playbackRate, loop: stock.loop };
                try { return clone.apply(this, arguments); } finally { nodes.bufferSource = stock; }
            };
            chain._beamAnimationSoundHooked = true;
        }
        return play.apply(this, arguments);
    };
    Sound.prototype._beamAnimationSoundHooked = true;
}
module.exports = { plan: plan, lookup: lookup, decode: decode, hookSound: hookSound };
