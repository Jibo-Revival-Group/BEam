'use strict';
// Launch phrases for custom skills: a skill's manifest lists "phrases" (e.g. "buy a pizza"), and when Jibo hears one
// after "Hey Jibo" he opens that skill. Matching happens here on the robot, on the transcript the cloud already sends
// with every turn, so the cloud never needs to know about the skill: upload the ZIP and the phrases work.

// Lower case, words only. "Hey Jibo, buy a pizza please!" -> "buy a pizza".
function normalize(text) {
    let t = ' ' + String(text || '').toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, ' ').trim() + ' ';
    t = t.replace(/^ (hey )?jibo /, ' ').replace(/^ (please |can you |could you |will you |would you )+/, ' ').replace(/ please $/, ' ');
    return t.trim();
}
// Everyday words that start ordinary requests. A phrase must say something more specific before its first {slot} (or,
// with no slot, anywhere), so a skill cannot grab "can {x}", "what is {x}" or "tell me about {x}" from everything else.
const COMMON = ('a an the and or but so to of in on at for with from about into over up down out off by as if then ' +
    'what whats who whos whom whose where wheres when whens why how hows which ' +
    'is are was were be been am do does did dont doesnt didnt can cant could couldnt will wont would wouldnt shall should ' +
    'may might must have has had havent isnt arent ' +
    'i im ive id ill me my mine you youre your yours we us our he him his she her it its they them their this that these those ' +
    'there theres here hey hi hello ok okay jibo please thanks thank yes no not just really very much more some any all ' +
    'tell say ask play show set turn take open start stop go get give make let lets look find help put know think want ' +
    'like need see hear talk read sing dance').split(' ');
// True when the phrase opens with words specific enough to be a launch phrase (see COMMON).
function specific(phrase) {
    const lead = String(phrase).split('{')[0];
    if (!normalize(lead)) { return false; }
    return normalize(lead).split(' ').some(w => COMMON.indexOf(w) < 0);
}
// "call {name}" -> /^call (.+?)$/ with slot names ['name']. A {slot} matches one or more spoken words.
function pattern(phrase) {
    const slots = [], parts = String(phrase).split(/\{([a-z_][a-z0-9_]*)\}/i);
    const source = parts.map((part, i) => {
        if (i % 2) { slots.push(part); return '(.+?)'; }
        return normalize(part);   // only a-z, 0-9 and spaces, so safe in a RegExp
    }).filter(s => s).join(' ');
    return { re: new RegExp('^' + source + '$'), slots: slots };
}
// { skill, entities } for the custom skill whose phrase matches what was said, or null. First installed wins a tie.
function match(text, skills) {
    const said = normalize(text);
    if (!said) { return null; }
    for (let i = 0; i < skills.length; i++) {
        const phrases = skills[i].manifest && skills[i].manifest.phrases || [];
        for (let j = 0; j < phrases.length; j++) {
            if (!specific(phrases[j])) { continue; }   // also guards skills installed before this check existed
            const p = pattern(phrases[j]), m = p.re.exec(said);
            if (!m) { continue; }
            const entities = {};
            p.slots.forEach((slot, k) => { entities[slot] = m[k + 1]; });
            return { skill: skills[i].packageName, entities: entities };
        }
    }
    return null;
}
// Rewrite a global-turn result in place to open the matching skill, as the menu or a voice launch would.
function redirect(data, skills) {
    const result = data && data.result, text = result && result.asr && result.asr.text;
    const found = text && match(text, skills);
    if (!found) { return false; }
    // The skill's open(result) gets the slots as result.nlu.entities ("call jackson" -> { name: 'jackson' }).
    data.result = Object.assign({}, result, { nlu: { intent: 'menu', entities: found.entities },
        match: { skillID: found.skill, onRobot: true, skipSurprises: true } });
    return true;
}
// Wrap the SDK's handlers for cloud turn results (looked up by name on every message, so wrapping works after start).
function hook(jibo, skills) {
    const events = jibo && jibo.globalEvents;
    if (!events || !events.eventHandlers || events._beamLaunchPhrases) { return false; }
    ['skill-relaunch', 'skill-launch'].forEach(name => {
        const original = events.eventHandlers[name];
        if (!original) { return; }
        events.eventHandlers[name] = function (data) {
            try {
                if (redirect(data, skills().filter(s => s.compatibility.status !== 'incompatible'))) { console.log('[launch-phrases] opening', data.result.match.skillID); }
            } catch (err) { console.warn('[launch-phrases]', err.message); }
            return original.apply(this, arguments);
        };
    });
    events._beamLaunchPhrases = true;
    return true;
}
module.exports = { normalize: normalize, specific: specific, pattern: pattern, match: match, redirect: redirect, hook: hook };
