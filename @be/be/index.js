'use strict';

/**
 * Be host entry. Implementation lives under ./lib/ as separate modules so
 * parallel edits do not collide in one browserify blob.
 */
// Reuse V8's compiled code between boots (BEnch's code cache); older BEnch without it: load as before.
try { require('/usr/local/lib/jibo/code-cache.js'); } catch (e) {}
require('./runtime-state').ensureBeam();
module.exports = require('./lib/Be').default;
