'use strict';
// node tests/beacon-screen-capture.test.js  (Node 6)
// BEacon's screen view copies a face frame only when a capture asks for one. Copying every frame
// held Jibo's face at ~14 fps, and it stayed that slow after the stream closed.
const assert = require('assert');
const Module = require('module');
const path = require('path');

let draws = 0;
const ctx = { fillStyle: '', fillRect () {}, drawImage () { draws++; } };
const canvas = () => ({ width: 0, height: 0, getContext: () => ctx, toDataURL: () => 'data:image/jpeg;base64,/9j/AA==' });
const face = { view: { width: 1280, height: 720, getBoundingClientRect: () => ({ left: 0, top: 0, width: 1280, height: 720 }) } };
face.render = function () {};
global.window = {};
global.document = { createElement: canvas, getElementsByTagName: () => [] };
const load = Module._load;
Module._load = function (request) {
    if (request === 'jibo') { return { face: face }; }
    if (request === 'electron') { throw new Error('no electron'); }
    return load.apply(this, arguments);
};
const screen = require(path.join(__dirname, '..', '@be', 'be', 'beacon', 'lib', 'screen.js'));
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const first = screen.capture(42);
face.render();  // the face draws its next frame; that frame is copied for the capture
first.then((buf) => {
    assert(Buffer.isBuffer(buf) && buf.length > 0, 'capture returns a JPEG');
    assert.strictEqual(draws, 1, 'the requested frame is copied once');
    for (let i = 0; i < 30; i++) { face.render(); }
    assert.strictEqual(draws, 1, 'frames nobody asked for are not copied');
    return wait(40);
}).then(() => {
    const t = Date.now();
    return screen.capture(42).then((buf) => {  // the face isn't rendering: copy directly after a short wait
        assert(buf.length > 0 && draws === 2, 'a still face is still captured');
        assert(Date.now() - t < 1000, 'without renders the capture does not hang');
    });
}).then(() => {
    console.log('beacon screen capture ok');
}).catch((err) => { console.error(err); process.exit(1); });
