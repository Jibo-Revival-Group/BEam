'use strict';
// Agent Mode's ESML filter: only tags Jibo can play, rebuilt from checked parts; everything else spoken as words.
const assert = require('assert');
const esml = require('../@be/be/skills/agent/esml');
const db = { emoji: new Set(['trophy', 'pizza']), dance: new Set(['carlton', 'music', 'the-twist']), happy: new Set(['big']), laughing: new Set([]), 'system-states': new Set(['shutdown']) };
const one = text => esml.chunks(text, db).join(' | ');

assert.strictEqual(one("Nice! <anim cat='emoji' filter='trophy' /> You win."),
    "Nice! <anim cat='emoji' filter='trophy, !hf' layers='!audio' /> You win.", 'the emoji plays in full');
assert.strictEqual(one('<anim cat="emoji" filter="unicorn"/>Hi'), 'Hi', 'an emoji Jibo does not have is dropped');
assert.strictEqual(one("<anim cat='dance' filter='ballroom'/>"), "<anim cat='dance' filter='music, rom-ballroom' />", 'the dance asked for');
assert.strictEqual(one("<anim cat='dance' filter='music, rom-twerk'/>"), "<anim cat='dance' filter='music, rom-twerk' />");
const random = new Set(); for (let i = 0; i < 200; i++) random.add(one("<anim cat='dance' filter='carlton'/>"));
assert.deepStrictEqual([...random].sort(), esml.DANCES.map(d => "<anim cat='dance' filter='music, rom-" + d + "' />").sort(), 'other styles: one of the Hey Jibo, dance ones');
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

assert(/filter='music, rom-(upbeat|ballroom|silly|slowdance|electronic|twerk)'/.test(esml.danceFor('do a dance')));
assert.strictEqual(esml.danceFor('do an electronic dance'), "<anim cat='dance' filter='music, rom-electronic' />");
assert.strictEqual(esml.danceFor('slow dance with me'), "<anim cat='dance' filter='music, rom-slowdance' />");
assert.strictEqual(esml.danceFor("what's the weather", db), null);
assert.strictEqual(esml.danceFor(null, db), null);
// The real animation database has what the prompt offers.
assert(esml.chunks("<anim cat='emoji' filter='trophy'/><anim cat='dance' filter='silly'/>")[0].split('<anim').length === 3);
const real = {}, all = require('../@be/be/node_modules/jibo-anim-db-animations/animdb.json');
Object.keys(all).forEach(k => all[k].categories.forEach(c => { real[c] = real[c] || new Set(); (all[k].metaTerms || []).forEach(t => real[c].add(t)); }));
esml.EMOJI_EXAMPLES.forEach(w => assert(real.emoji.has(w), 'emoji ' + w));
esml.DANCES.forEach(w => assert(real.dance.has('rom-' + w), 'dance ' + w));
esml.CATEGORIES.forEach(c => assert(real[c], 'animation ' + c));
assert(/ballroom/.test(esml.PROMPT) && !/carlton/.test(esml.PROMPT) && esml.PROMPT.length < 2000);
console.log('agent esml ok');
