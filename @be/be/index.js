'use strict';

/**
 * Be host entry. Implementation lives under ./lib/ as separate modules so
 * parallel edits do not collide in one browserify blob.
 */
module.exports = require('./lib/Be').default;
