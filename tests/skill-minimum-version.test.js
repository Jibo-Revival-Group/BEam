'use strict';
// Custom skills must declare "supported" 3.2.0 or newer (permissions, settings): older or undeclared ones are turned
// off (status incompatible, which blocks launching, launch phrases, background scripts, the menu button and installs).
const assert = require('assert');
const themes = require('../@be/be/beacon/lib/themes');
const compat = m => themes.compatibility(Object.assign({ name: 'Pet', version: '1.0.0', type: 'skill' }, m));
assert.strictEqual(themes.SKILL_MINIMUM, '3.2.0');
[{}, { supported: '3.1.7' }, { supported: '3.1.9' }, { supported: '2.0.0' }].forEach(m => {
    const c = compat(m);
    assert.strictEqual(c.status, 'incompatible', JSON.stringify(m)); assert(c.outdated);
    assert(/Pet was made for an older Jibo and is turned off/.test(c.message) && /3\.2\.0/.test(c.message), c.message);
});
// 3.2.0+ skills follow the usual rule against the robot's version (jibo-tbd), not the outdated one.
['3.2.0', '3.2.1', '4.0.0'].forEach(v => { const c = compat({ supported: v }); assert(!c.outdated, v); assert(!c.message, v); });
// Themes and voices keep their old rule: no minimum means compatible.
assert.strictEqual(themes.compatibility({ name: 'T', version: '1.0.0', type: 'theme' }).status, 'compatible');
assert.strictEqual(themes.compatibility({ name: 'T', version: '1.0.0', type: 'theme', supported: '3.1.7' }).outdated, undefined);
console.log('Custom skills older than 3.2.0 (or with no minimum) are turned off; themes are unaffected.');
