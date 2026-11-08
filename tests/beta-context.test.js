'use strict';
// BEefy sends changes that need beta robot code (until the next OTA) only when the robot's CONTEXT has runtime.beta;
// the face's context provider adds it only on the robot at exactly 192.168.7.165.
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const src = fs.readFileSync(path.join(__dirname, '../@be/be/node_modules/jibo/lib/jibo.js'), 'utf8');
const start = src.indexOf('    static isBetaTester(');
const end = src.indexOf('    getRuntimeContext(speakers, omitLoop = false) {');
assert.ok(start > 0 && end > start, 'method found');
assert.ok(/if \(ContextProvider\.isBetaTester\(\)\) \{\s+runtime = Object\.assign\(\{\}, runtime, \{ beta: true \}\);/.test(src),
    'getContext adds runtime.beta');
const ContextProvider = new Function('require', 'return class ContextProvider {\n' + src.slice(start, end) + '\n};')(require);

const at = (...addresses) => ({ lo: [{ family: 'IPv4', address: '127.0.0.1' }],
    wlan0: addresses.map((address) => ({ family: address.indexOf(':') >= 0 ? 'IPv6' : 'IPv4', address: address })) });
assert.strictEqual(ContextProvider.isBetaTester(at('192.168.7.165')), true);
assert.strictEqual(ContextProvider.isBetaTester(at('fe80::1', '192.168.7.165')), true);
['192.168.7.16', '192.168.7.1650', '192.168.7.115', '10.0.0.165', '192.168.17.165'].forEach((address) => {
    assert.strictEqual(ContextProvider.isBetaTester(at(address)), false, address);
});
assert.strictEqual(typeof ContextProvider.isBetaTester(), 'boolean', 'reads this machine\'s interfaces by default');
console.log('PASS only the robot at exactly 192.168.7.165 tags its CONTEXT runtime as beta');
