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
// The custom skill whose phrase is exactly what was said (after normalize), or null. First installed wins a tie.
function match(text, skills) {
    const said = normalize(text);
    if (!said) { return null; }
    for (let i = 0; i < skills.length; i++) {
        const phrases = skills[i].manifest && skills[i].manifest.phrases || [];
        if (phrases.some(p => normalize(p) === said)) { return skills[i].packageName; }
    }
    return null;
}
// Rewrite a global-turn result in place to open the matching skill, as the menu or a voice launch would.
function redirect(data, skills) {
    const result = data && data.result, text = result && result.asr && result.asr.text;
    const skill = text && match(text, skills);
    if (!skill) { return false; }
    data.result = Object.assign({}, result, { nlu: { intent: 'menu', entities: {} },
        match: { skillID: skill, onRobot: true, skipSurprises: true } });
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
module.exports = { normalize: normalize, match: match, redirect: redirect, hook: hook };
