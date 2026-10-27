'use strict';
var assert = require('assert');
var Runtime = require('../@be/be/skills/agent/runtime');

assert(Runtime.isStop('goodbye'));
assert(Runtime.isStop('good bye'));
assert(Runtime.isStop('Good-bye, Jibo!'));
assert(Runtime.isStop('Okay, goodbye.'));
assert(Runtime.isStop('Bye!'));
assert(!Runtime.isStop('I said goodbye'));
console.log('Free/Agent exit phrases pass Node 6 normalization smoke.');
