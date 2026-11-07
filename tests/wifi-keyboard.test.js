'use strict';
// Settings › New Wi-Fi password keyboard (JiboTube's keyboard plus Shift and a second symbol page).
const assert = require('assert');
const kb = require('../@be/be/skills/settings/wifi-keyboard');

let s = { text: '', shift: false, symbols: false, more: false };
const key = (name) => { s = kb.press(s, name); };
const tap = (r, c) => { s = kb.press(s, kb.keyText(s, r, c)); };   // what the key shows is what it types

key('shift'); tap(0, 0); tap(1, 0);           // Shift applies to one letter, like a phone
assert.strictEqual(s.text, 'Qa');
key('symbols'); tap(0, 0);                     // 1
key('shift'); tap(1, 6);                       // second page: $
key('symbols'); key('space'); key('backspace');
assert.strictEqual(s.text, 'Qa1$');
assert.strictEqual(kb.keyText(s, 0, 0), 'q', 'back to lower-case letters after the symbols page');
for (let i = 0; i < 80; i++) key('x');
assert.strictEqual(s.text.length, kb.MAX, 'a WPA passphrase is at most 63 characters');
key('clear');
assert.strictEqual(s.text, '');
assert.strictEqual(kb.MIN, 8);
console.log('PASS Wi-Fi keyboard: shift, symbols, second symbol page, backspace, clear, 63-character limit');
