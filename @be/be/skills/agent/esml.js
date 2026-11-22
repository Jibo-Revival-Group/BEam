'use strict';
// Agent Mode replies may animate Jibo with a little ESML (his speech markup): emojis, dances, body animations,
// sounds, speaking styles and pauses. Only tags Jibo can play are kept, rebuilt from their checked parts
// (so a reply can't smuggle anything else in); a tag he can't play is dropped and other text is spoken as words.
const CATEGORIES = ['emoji', 'dance', 'happy', 'laughing', 'excited', 'proud', 'affection', 'surprised', 'curious', 'thinking',
    'question', 'confused', 'dontknow', 'yes', 'no', 'sad', 'worried', 'scared', 'oops', 'embarrassed', 'frustrated', 'disgusted', 'sleep'];
const SOUNDS = ['happy', 'affection', 'worried', 'oops', 'proud', 'sad', 'confused', 'laughing', 'question', 'embarrassed', 'scared', 'disgusted'];
const STYLES = ['enthusiastic', 'sheepish', 'confused', 'confident'];
// A dance whose style Jibo doesn't have becomes one of his music dances.
const ANY_DANCE = 'music';

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
        const known = CATEGORIES.indexOf(a.cat) !== -1 && db[a.cat];
        if (!known) return '';
        let filter = (a.filter || '').split(',').map(word => word.trim()).filter(Boolean);
        if (filter.some(word => !known.has(word))) {
            if (a.cat === 'emoji') return '';
            filter = a.cat === 'dance' ? [ANY_DANCE] : [];
        }
        if (a.cat === 'emoji' && !filter.length) return '';
        // Not the hot-frame emojis: they only blink unless timed to speech (Jibo's replies use '!hf' too).
        if (a.cat === 'emoji') filter = filter.concat('!hf');
        // Emojis and dances play in full before he goes on (like Jibo's own replies; a non-blocking emoji got cut
        // off by whatever came next); body animations play while he talks.
        return "<anim cat='" + a.cat + "'" + (filter.length ? " filter='" + filter.join(', ') + "'" : '') +
            (a.cat === 'emoji' ? " layers='!audio'" : a.cat === 'dance' ? '' : " nonBlocking='true'") + ' />';
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
// "DO: do the carlton" -> a dance right here instead of the cloud's ("Watch this", and Agent Mode would end).
function danceFor(command, db) {
    if (!/\bdanc(e|ing)\b|\bdo the\b/i.test(command || '')) return null;
    const known = animationTerms(db).dance || new Set();
    const words = String(command).toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/);
    const pairs = words.map((word, i) => word + '-' + (words[i + 1] || ''));
    const style = pairs.concat(words).filter(word => known.has(word) && ['dance', 'do', 'the', 'a'].indexOf(word) === -1)[0];
    return "<anim cat='dance' filter='" + (style || ANY_DANCE) + "' />";
}
// What the AI is told (every provider's system prompt). Every name here is checked against Jibo's animations in tests.
const EMOJI_EXAMPLES = ['trophy', 'pizza', 'heart', 'cat', 'dog', 'star', 'fireworks', 'music', 'sun', 'cake', 'gift', 'ghost', 'rainbow', 'idea', 'thumbs-up'];
const DANCES = ['carlton', 'disco', 'robotic', 'twerk', 'waltz', 'tango', 'samba', 'flamenco', 'charleston', 'the-twist', 'headbanger',
    'belly-dancing', 'smooth-jazz', 'reggae', 'country', 'techno', 'pigeon', 'seaweed', 'roxbury', 'prom-night', 'cabbage-patch', 'dab'];
const BODY = CATEGORIES.filter(category => category !== 'emoji' && category !== 'dance' && category !== 'sleep');
const PROMPT = ' You can also animate yourself with Jibo\'s speech markup inside a reply:' +
    " <anim cat='emoji' filter='WORD'/> shows an emoji on your screen (WORD is one simple word, like " + EMOJI_EXAMPLES.join(', ') + ');' +
    " <anim cat='dance' filter='STYLE'/> dances (STYLE: " + DANCES.join(', ') + ', or ' + ANY_DANCE + ' for any);' +
    " <anim cat='happy'/> plays a body animation (" + BODY.join(', ') + ');' +
    " <ssa cat='laughing'/> makes a sound (" + SOUNDS.join(', ') + ');' +
    " <style set='enthusiastic'>words</style> changes how you say them (" + STYLES.join(', ') + ");" +
    " <break size='0.5'/> pauses. To dance, use the dance tag, not a DO line; you keep chatting after it." +
    ' Use these sparingly, at most one or two per reply.';
module.exports = { chunks: chunks, danceFor: danceFor, PROMPT: PROMPT, EMOJI_EXAMPLES: EMOJI_EXAMPLES, DANCES: DANCES,
    CATEGORIES: CATEGORIES, SOUNDS: SOUNDS, STYLES: STYLES };
