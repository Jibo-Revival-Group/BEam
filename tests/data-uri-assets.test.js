'use strict';
// The sports score card's background is a PNG data: URI from BEefy; the loader must treat it like a URL (an Image),
// not a file under the skill folder.
const assert = require('assert');
const path = require('path');
const PathUtils = require(path.resolve(__dirname, '../@be/be/node_modules/jibo-plugins/lib/jibo-plugins.js')).PathUtils;

assert.ok(PathUtils.isURL('data:image/png;base64,iVBORw0KGgo='), 'data: URI');
assert.ok(PathUtils.isURL('http://a.espncdn.com/combiner/i?img=/i/teamlogos/nhl/500/wsh.png&h=200&w=200'));
assert.ok(PathUtils.isURL('https://x/y.png') && PathUtils.isURL('file:///x.png'));
assert.ok(!PathUtils.isURL('assets/personal-report-skill/weather/icons/rain_v01.crn'), 'skill assets stay files');
assert.ok(!PathUtils.isURL('/opt/jibo/x.png') && !PathUtils.isURL('database.png'));
console.log('PASS data: images load like URLs; skill asset paths are unchanged');
