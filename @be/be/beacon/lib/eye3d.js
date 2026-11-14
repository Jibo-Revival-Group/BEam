'use strict';
// The built-in "3D Eye" theme's renderer side: draws Jibo's eye as a real 3D object (../eye3d/eye3d.js) over the face.
// Only in Jibo's renderer; standalone BEacon (no window) has no face to draw on.
const ID = '3d-eye';
function start() {
    if (typeof window === 'undefined' || window.__eye3d) { return; }
    require('../eye3d/eye3d.js')();
}
function stop() {
    if (typeof window !== 'undefined' && window.__eye3d) { window.__eye3d.stop(); }
}
module.exports = { ID: ID, NAME: '3D Eye', start: start, stop: stop };
