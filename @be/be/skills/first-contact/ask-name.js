'use strict';

// 5x1: a robot with nobody in his loop asks "What's your name?" in first contact and saves the answer.
// BEacon gives an empty loop a "FirstName LastName" placeholder owner, which counts as nobody here.
const people = require('../../beacon/lib/people');

const P = people.PLACEHOLDER_OWNER;
const LEAD = /^(?:(?:hi|hello|hey|oh|um|uh|well|so|okay|ok|sure|yes|yeah)\b[\s,]*)*(?:my name is|my name's|the name is|name's|i am|i'm|im|it's|its|this is|call me|you can call me)\s+/i;
const NOT_A_NAME = /^(?:no|nope|nothing|what|huh|never ?mind|stop|cancel|i don't know|idk)$/i;

function isPlaceholder(looper) {
    const d = looper.data || {};
    return d.firstName === P.firstName && d.lastName === P.lastName;
}

// People the loop really has: not Jibo, not removed, not the placeholder.
function realPeople(loop) {
    return (loop || []).filter((looper) => {
        const status = (looper.data && looper.data.status) || '';
        return !looper.isJibo && !isPlaceholder(looper) && status !== 'removed' && status !== 'declined';
    });
}

function cap(word) { return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(); }

// "my name is zane vincent" → { firstName: 'Zane', lastName: 'Vincent' }; null when it isn't a name.
function parseName(text) {
    const said = String(text || '').trim().replace(/[.!?,]+$/, '').replace(LEAD, '').trim();
    if (!said || NOT_A_NAME.test(said)) return null;
    const words = said.split(/\s+/);
    if (words.length > 3 || words.some((w) => !/^[A-Za-z][A-Za-z'-]*$/.test(w))) return null;
    return { firstName: cap(words[0]), lastName: words.length > 1 ? words.slice(1).map(cap).join(' ') : null };
}

// Renames the placeholder owner, or adds the person as owner when there isn't one.
function save(name, loop) {
    const placeholder = (loop || []).filter(isPlaceholder)[0];
    if (placeholder) return people.updateMember(placeholder.id || placeholder._id, { firstName: name.firstName, lastName: name.lastName });
    return people.createMember(name).then((id) => people.setOwner(id));
}

module.exports = { realPeople: realPeople, parseName: parseName, save: save };
