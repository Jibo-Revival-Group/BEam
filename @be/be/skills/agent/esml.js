'use strict';
// Agent Mode replies may animate Jibo with a little ESML (his speech markup): emojis, dances, body animations,
// sounds, speaking styles and pauses. Only tags Jibo can play are kept, rebuilt from their checked parts
// (so a reply can't smuggle anything else in); a tag he can't play is dropped and other text is spoken as words.
const CATEGORIES = ['emoji', 'dance', 'happy', 'laughing', 'excited', 'proud', 'affection', 'surprised', 'curious', 'thinking',
    'question', 'confused', 'dontknow', 'yes', 'no', 'sad', 'worried', 'scared', 'oops', 'embarrassed', 'frustrated', 'disgusted', 'sleep'];
const SOUNDS = ['happy', 'affection', 'worried', 'oops', 'proud', 'sad', 'confused', 'laughing', 'question', 'embarrassed', 'scared', 'disgusted'];
const STYLES = ['enthusiastic', 'sheepish', 'confused', 'confident'];
// The dances "Hey Jibo, dance" plays (BEefy's music + rom-* styles); any other or no style picks one at random.
const DANCES = ['upbeat', 'ballroom', 'silly', 'slowdance', 'electronic', 'twerk'];
function dance(style) {
    style = String(style || '').toLowerCase().replace(/^.*rom-/, ''); // 'silly', 'rom-silly' or 'music, rom-silly'
    if (DANCES.indexOf(style) === -1) style = DANCES[Math.floor(Math.random() * DANCES.length)];
    return "<anim cat='dance' filter='music, rom-" + style + "' />";
}

let terms = null;
// category -> Set of the filter words Jibo's animations answer to (from his animation database).
function animationTerms(db) {
    if (db) return db;
    if (!terms) {
        terms = Object.create(null);
        const all = require('jibo-anim-db-animations/animdb.json');
        Object.keys(all).forEach(key => (all[key].categories || []).forEach(category => {
            const set = terms[category] || (terms[category] = new Set());
            (all[key].metaTerms || []).forEach(term => set.add(String(term).toLowerCase()));
        }));
    }
    return terms;
}
function escape(text) { return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function attributes(text) {
    const out = {};
    text.replace(/([a-zA-Z]+)\s*=\s*(['"])([^'"<>]*)\2/g, (all, name, quote, value) => { out[name.toLowerCase()] = value.trim().toLowerCase(); });
    return out;
}
// One tag from the AI -> safe ESML ('' drops it), or null when it isn't one of ours (then it's spoken as text).
function tag(raw, open, db) {
    const m = /^<\s*(\/)?\s*([a-zA-Z]+)\b([^<>]*?)\/?\s*>$/.exec(raw);
    if (!m) return null;
    const closing = !!m[1], name = m[2].toLowerCase(), a = attributes(m[3]);
    if (name === 'anim' && !closing) {
        if (a.cat === 'dance') return dance(a.filter); // dances play in full before he goes on
        const known = CATEGORIES.indexOf(a.cat) !== -1 && db[a.cat];
        if (!known) return '';
        let filter = (a.filter || '').split(',').map(word => word.trim()).filter(Boolean);
        if (filter.some(word => !known.has(word))) {
            if (a.cat === 'emoji') return '';
            filter = [];
        }
        if (a.cat === 'emoji' && !filter.length) return '';
        // Not the hot-frame emojis: they only blink unless timed to speech (Jibo's replies use '!hf' too).
        if (a.cat === 'emoji') filter = filter.concat('!hf');
        // Emojis play in full before he goes on (like Jibo's own replies; a non-blocking emoji got cut off by
        // whatever came next); body animations play while he talks.
        return "<anim cat='" + a.cat + "'" + (filter.length ? " filter='" + filter.join(', ') + "'" : '') +
            (a.cat === 'emoji' ? " layers='!audio'" : " nonBlocking='true'") + ' />';
    }
    if (name === 'ssa' && !closing) return SOUNDS.indexOf(a.cat) !== -1 ? "<ssa cat='" + a.cat + "' />" : '';
    if (name === 'break' && !closing) {
        const size = parseFloat(a.size);
        return size > 0 && size <= 3 ? "<break size='" + size + "' />" : '';
    }
    if (name === 'style') {
        if (closing) { if (!open.style) return ''; open.style = null; return '</style>'; }
        if (STYLES.indexOf(a.set) === -1 || open.style) return ''; // styles don't nest
        open.style = a.set; return "<style set='" + a.set + "'>";
    }
    return null;
}
// The reply as ESML chunks for embodied speech, each within the TTS limit; a style split across chunks is
// closed and reopened.
function chunks(text, db) {
    db = animationTerms(db);
    const open = { style: null }, out = [];
    let chunk = '', length = 0;
    String(text).replace(/[*`#]/g, '').split(/(<[^<>]{0,300}>)|\s+/).forEach(piece => {
        if (!piece) return;
        let safe = piece.charAt(0) === '<' ? tag(piece, open, db) : null, spoken = 0;
        if (safe === null) { safe = escape(piece.slice(0, 200)); spoken = safe.length; }
        if (!safe) return;
        if (length + spoken > 450 && chunk) {
            const style = open.style && safe.indexOf('<style') !== 0 ? open.style : null;
            out.push(chunk + (style ? '</style>' : '')); chunk = style ? "<style set='" + style + "'>" : ''; length = 0;
        }
        chunk += (chunk ? ' ' : '') + safe; length += spoken + 1;
    });
    if (open.style) chunk += '</style>';
    if (chunk) out.push(chunk);
    return out;
}
// "DO: do a silly dance" -> a dance right here instead of the cloud's ("Watch this", and Agent Mode would end).
function danceFor(command) {
    if (!/\bdanc(e|ing)\b/i.test(command || '')) return null;
    const words = String(command).toLowerCase().replace(/slow dance/g, 'slowdance').split(/[^a-z]+/);
    return dance(DANCES.filter(style => words.indexOf(style) !== -1)[0]);
}
// What the AI is told (every provider's system prompt). Every name here is checked against Jibo's animations in tests.
const EMOJI_EXAMPLES = ['trophy', 'pizza', 'heart', 'cat', 'dog', 'star', 'fireworks', 'music', 'sun', 'cake', 'gift', 'ghost', 'rainbow', 'idea', 'thumbs-up'];
const BODY = CATEGORIES.filter(category => category !== 'emoji' && category !== 'dance' && category !== 'sleep');
const PROMPT = ' You can also animate yourself with Jibo\'s speech markup inside a reply:' +
    " <anim cat='emoji' filter='WORD'/> shows an emoji on your screen (WORD is one simple word, like " + EMOJI_EXAMPLES.join(', ') + ');' +
    " <anim cat='dance' filter='STYLE'/> dances (STYLE: " + DANCES.join(', ') + ', or leave it out for any);' +
    " <anim cat='happy'/> plays a body animation (" + BODY.join(', ') + ');' +
    " <ssa cat='laughing'/> makes a sound (" + SOUNDS.join(', ') + ');' +
    " <style set='enthusiastic'>words</style> changes how you say them (" + STYLES.join(', ') + ");" +
    " <break size='0.5'/> pauses. To dance, use the dance tag, not a DO line; you keep chatting after it." +
    ' Use these sparingly, at most one or two per reply.';
module.exports = { chunks: chunks, danceFor: danceFor, PROMPT: PROMPT, EMOJI_EXAMPLES: EMOJI_EXAMPLES, DANCES: DANCES,
    CATEGORIES: CATEGORIES, SOUNDS: SOUNDS, STYLES: STYLES };
