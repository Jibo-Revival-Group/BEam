'use strict';
// The 3D eye's renderer side: draws Jibo's eye as a real 3D object (../eye3d/eye3d.js) over the face. Used by the
// built-in "3D Eye" theme (Phoenix's grey ball) and by themes whose face.json sets "eye3d": true (their face/eye.png on
// the ball, or on their own face/eye.glb model). Only in Jibo's renderer; standalone BEacon has no face to draw on.
const fs = require('fs');
const path = require('path');
const ID = '3d-eye';
// What a theme asks for: null (no 3D), or { texture, model } paths that exist in its package.
function themeOptions(theme, dir) {
    if (!theme || !theme.face || !theme.face.eye3d || !dir) { return null; }
    const file = name => fs.existsSync(path.join(dir, name)) ? path.join(dir, name) : null;
    return { texture: file('face/eye.png'), model: file('face/eye.glb') };
}
function same(a, b) { return JSON.stringify(a || {}) === JSON.stringify(b || {}); }
function start(opts) {
    if (typeof window === 'undefined') { return; }
    if (window.__eye3d) { if (same(window.__eye3d.opts, opts)) { return; } window.__eye3d.stop(); }
    require('../eye3d/eye3d.js')(opts || {});
}
function stop() {
    if (typeof window !== 'undefined' && window.__eye3d) { window.__eye3d.stop(); }
}
module.exports = { ID: ID, NAME: '3D Eye', themeOptions: themeOptions, start: start, stop: stop };
