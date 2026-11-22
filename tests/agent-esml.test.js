'use strict';
// Agent Mode's ESML filter: only tags Jibo can play, rebuilt from checked parts; everything else spoken as words.
const assert = require('assert');
const esml = require('../@be/be/skills/agent/esml');
const db = { emoji: new Set(['trophy', 'pizza']), dance: new Set(['carlton', 'music', 'the-twist']), happy: new Set(['big']), laughing: new Set([]), 'system-states': new Set(['shutdown']) };
const one = text => esml.chunks(text, db).join(' | ');

assert.strictEqual(one("Nice! <anim cat='emoji' filter='trophy' /> You win."),
    "Nice! <anim cat='emoji' filter='trophy, !hf' layers='!audio' /> You win.", 'the emoji plays in full');
assert.strictEqual(one('<anim cat="emoji" filter="unicorn"/>Hi'), 'Hi', 'an emoji Jibo does not have is dropped');
assert.strictEqual(one("<anim cat='dance' filter='carlton'/>"), "<anim cat='dance' filter='carlton' />", 'the dance asked for');
assert.strictEqual(one("<anim cat='dance' filter='moonwalk'/>"), "<anim cat='dance' filter='music' />", 'an unknown dance style is still a dance');
assert.strictEqual(one("<anim cat='happy'/> Yay"), "<anim cat='happy' nonBlocking='true' /> Yay");
assert.strictEqual(one("<anim cat='system-states' filter='shutdown'/> Bye"), 'Bye', 'only expressive animations');
assert.strictEqual(one("<anim cat='emoji' filter='trophy' onload='x' layers='body'/>"), "<anim cat='emoji' filter='trophy, !hf' layers='!audio' />", 'attributes rebuilt, not copied');
assert.strictEqual(one("<ssa cat='laughing'/> ha <ssa cat='evil'/>"), "<ssa cat='laughing' /> ha");
assert.strictEqual(one("Wait <break size='0.5'/> now <break size='99'/>"), "Wait <break size='0.5' /> now");
assert.strictEqual(one("<style set='enthusiastic'>Let's go!</style>"), "<style set='enthusiastic'> Let's go! </style>");
assert.strictEqual(one("<style set='enthusiastic'>Unclosed"), "<style set='enthusiastic'> Unclosed</style>", 'styles are always closed');
assert.strictEqual(one("</style> stray"), 'stray');
assert.strictEqual(one('<script>alert(1)</script> 1 < 2 & **bold**'), '&lt;script&gt; alert(1) &lt;/script&gt; 1 &lt; 2 &amp; bold', 'anything else is spoken as text');
const long = esml.chunks(('word '.repeat(200)) + "<style set='sheepish'>" + 'quiet '.repeat(100) + '</style>', db);
assert(long.length > 1 && long.every(chunk => chunk.replace(/<[^>]*>/g, '').length <= 460), 'chunks stay within the TTS limit');
assert(long.every(chunk => chunk.split('<style').length === chunk.split('</style>').length), 'a style split across chunks is closed and reopened');
assert(long[long.length - 1].indexOf("<style set='sheepish'>") === 0);
assert.strictEqual(one("<style set='sheepish'>a <style set='confident'>b</style> c"), "<style set='sheepish'> a b </style> c", 'styles do not nest');

assert.strictEqual(esml.danceFor('do a dance', db), "<anim cat='dance' filter='music' />");
assert.strictEqual(esml.danceFor('do the carlton', db), "<anim cat='dance' filter='carlton' />");
assert.strictEqual(esml.danceFor('dance the twist', db), "<anim cat='dance' filter='the-twist' />");
assert.strictEqual(esml.danceFor("what's the weather", db), null);
assert.strictEqual(esml.danceFor(null, db), null);
// The real animation database has what the prompt offers.
assert(esml.chunks("<anim cat='emoji' filter='trophy'/><anim cat='dance' filter='carlton'/>")[0].split('<anim').length === 3);
console.log('agent esml ok');
