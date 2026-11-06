'use strict';
/**
 * JiboSync merge rules (pure: no robot calls). Each robot runs this against the people of the
 * other robots and only changes itself.
 *
 *  - A person is "first last" (case-insensitive). The robot member is never synced.
 *  - Placeholder people (BEacon's empty-loop owner "FirstName LastName") are deleted once a real person exists.
 *  - Same name twice on this robot: keep the more complete one (face + voice beats one), then the newer.
 *  - From other robots: face and voice each come from whichever robot enrolled it most recently,
 *    so the merged person is as complete as any copy. Photo and phonetic name fill gaps only.
 *  - A person removed on any robot (a tombstone) is removed everywhere unless enrolled or added again later.
 */

const TOMBSTONE_DAYS = 30;
const PLACEHOLDER = { firstName: 'FirstName', lastName: 'LastName' };

function personKey (p) {
    return [p.firstName, p.lastName].map((s) => String(s || '').trim().toLowerCase().replace(/\s+/g, ' ')).join(' ').trim();
}
function isPlaceholder (p) {
    return p.firstName === PLACEHOLDER.firstName && p.lastName === PLACEHOLDER.lastName;
}
function faceStamp (p) { return p.face ? Number(p.face.last) || 0 : 0; }
function voiceStamp (p) { return p.voice ? Number(p.voice.stamp) || 0 : 0; }
function score (p) { return (p.face ? 1 : 0) + (p.voice ? 1 : 0); }
function activity (p) { return Math.max(faceStamp(p), voiceStamp(p), Number(p.created) || 0); }
/** Negative when a is the better copy of a person. */
function better (a, b) { return (score(b) - score(a)) || (activity(b) - activity(a)); }

function mergeTombstones (lists, now) {
    const out = {};
    lists.forEach((t) => Object.keys(t || {}).forEach((k) => {
        const at = Number(t[k]) || 0;
        if (now - at < TOMBSTONE_DAYS * 86400000 && (!out[k] || at > out[k])) out[k] = at;
    }));
    return out;
}

/**
 * local = { people: [person], tombstones: { key: ms } }, peers = [{ robotId, people, tombstones }].
 * person = { id, firstName, lastName, gender, phoneticName, hasPhoto, owner, created (ms),
 *            face: { examples, last (ms) } | null, voice: { stamp (ms) } | null }.
 * Returns { removes: [localId], setOwner: { id } | { key } | null, imports: [...], tombstones }.
 * import = { localId (null = add a new person), peer (index), remoteId, fields, face, voice, photo, phoneticName }.
 */
function plan (local, peers, now) {
    now = now || Date.now();
    const tombstones = mergeTombstones([local.tombstones].concat(peers.map((p) => p.tombstones)), now);
    const result = { removes: [], setOwner: null, imports: [], tombstones: tombstones };
    const real = (list) => (list || []).filter((p) => !isPlaceholder(p) && personKey(p));
    const gone = (key, people) => tombstones[key] && people.every((p) => activity(p) < tombstones[key]);

    // This robot: one copy per name; tombstoned names go.
    const keep = {};
    const groups = {};
    real(local.people).forEach((p) => { (groups[personKey(p)] = groups[personKey(p)] || []).push(p); });
    Object.keys(groups).forEach((key) => {
        const copies = groups[key].slice().sort(better);
        if (gone(key, copies)) { copies.forEach((p) => { if (!p.owner) result.removes.push(p.id); }); return; }
        // The owner node can't be removed, so it stays as the one copy when it's among the duplicates.
        const winner = copies.filter((p) => p.owner)[0] || copies[0];
        keep[key] = winner;
        copies.forEach((p) => { if (p !== winner) result.removes.push(p.id); });
    });

    // Other robots: per name, the newest face and the newest voice; fill photo / phonetic gaps.
    const remote = {};
    peers.forEach((peer, i) => real(peer.people).forEach((p) => {
        const key = personKey(p);
        (remote[key] = remote[key] || []).push({ peer: i, p: p });
    }));
    Object.keys(remote).forEach((key) => {
        const copies = remote[key];
        if (gone(key, copies.map((c) => c.p).concat(keep[key] ? [keep[key]] : []))) return;
        const mine = keep[key] || null;
        const best = copies.slice().sort((a, b) => better(a.p, b.p))[0];
        const face = copies.filter((c) => c.p.face).sort((a, b) => faceStamp(b.p) - faceStamp(a.p))[0];
        const voice = copies.filter((c) => c.p.voice).sort((a, b) => voiceStamp(b.p) - voiceStamp(a.p))[0];
        const photo = copies.filter((c) => c.p.hasPhoto)[0];
        const phonetic = copies.filter((c) => c.p.phoneticName)[0];
        const wantFace = face && faceStamp(face.p) > (mine ? faceStamp(mine) : 0);
        const wantVoice = voice && voiceStamp(voice.p) > (mine ? voiceStamp(mine) : 0);
        const wantPhoto = photo && !(mine && mine.hasPhoto);
        const wantPhonetic = phonetic && !(mine && mine.phoneticName);
        if (mine && !wantFace && !wantVoice && !wantPhoto && !wantPhonetic) return;
        // One import per (name, robot): the robot holding the newest face/voice sends that part.
        const parts = {};
        const add = (c, what) => {
            const k = c.peer + ' ' + c.p.id;
            parts[k] = parts[k] || { localId: mine ? mine.id : null, peer: c.peer, remoteId: c.p.id, key: key,
                fields: { firstName: best.p.firstName, lastName: best.p.lastName, gender: best.p.gender || null },
                face: false, voice: false, photo: false, phoneticName: null };
            if (what === 'phoneticName') parts[k].phoneticName = c.p.phoneticName;
            else if (what !== 'new') parts[k][what] = true;
        };
        if (!mine) add(best, 'new');
        if (wantFace) add(face, 'face');
        if (wantVoice) add(voice, 'voice');
        if (wantPhoto) add(photo, 'photo');
        if (wantPhonetic) add(phonetic, 'phoneticName');
        Object.keys(parts).forEach((k) => result.imports.push(parts[k]));
    });

    // Placeholders go once this robot has (or is getting) a real person; a placeholder owner hands over first.
    const placeholders = (local.people || []).filter(isPlaceholder);
    const realLeft = Object.keys(keep).map((k) => keep[k]);
    const incoming = result.imports.filter((it) => !it.localId);
    if (placeholders.length && (realLeft.length || incoming.length)) {
        placeholders.forEach((p) => result.removes.push(p.id));
        if (placeholders.some((p) => p.owner) && !realLeft.some((p) => p.owner)) {
            const remoteOwnerKeys = {};
            peers.forEach((peer) => real(peer.people).forEach((p) => { if (p.owner) remoteOwnerKeys[personKey(p)] = true; }));
            const pick = realLeft.filter((p) => remoteOwnerKeys[personKey(p)])[0] || realLeft[0];
            // No local person yet: name the incoming person; jibosync.js resolves it after adding them.
            result.setOwner = pick ? { id: pick.id } : { key: (incoming.filter((it) => remoteOwnerKeys[it.key])[0] || incoming[0]).key };
        }
    }
    return result;
}

module.exports = { plan, personKey, isPlaceholder, better, TOMBSTONE_DAYS };
