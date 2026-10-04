'use strict';

const BeSkill = require('@be/be-framework').BeSkill;

// No behavior tree or idle animations: the controller owns the display and input.
class CameraStreamSkill extends BeSkill {
    open() {}
    close(done) { done(); }
    preload(done) { done(); }
    postInit(done) { done(); }
    destroy(done) { done(); }
}

module.exports = CameraStreamSkill;
