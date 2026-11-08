'use strict';
// After an Agent Mode action that is one of Jibo's quick shows (calendar, commute, weather, news, the full report,
// a joke, a dance, a surprise), come back to Agent Mode with the conversation and what Jibo said during it.
const RETURNS = /\b(weather|forecast|news|commute|traffic|calendar|schedule|report|joke|dance|surprise)\b/i;
const TIMEOUT_MS = 180000, QUIET_MS = 1500, POLL_MS = 250;

// ESML from the cloud ("<speak><STYLE ...> for your commute , it should take about 19 minutes . ...") → plain words.
function plain(esml) {
    const text = esml && typeof esml === 'object' ? esml.esml || esml.text || '' : esml;
    return String(text || '').replace(/<[^>]*>/g, ' ').replace(/\s+([.,!?;:])/g, '$1').replace(/\s+/g, ' ').trim();
}

// Records what Jibo says until he is back on the idle skill and quiet, then calls back(said). Gives up if someone
// says "Hey Jibo" once he is done (a new request) or nothing finishes within 3 minutes.
function watch(jibo, be, back, clock) {
    // Wrapped: Electron's window timers throw "Illegal invocation" when called as methods of another object.
    clock = clock || { setInterval: (fn, ms) => setInterval(fn, ms), clearInterval: id => clearInterval(id), now: () => Date.now() };
    const tts = jibo.tts, original = tts.speak, said = [], start = clock.now();
    let left = false, quietSince = null, done = false;
    const record = function (text) { const line = plain(text); if (line) said.push(line); return original.apply(this, arguments); };
    tts.speak = record;
    // The action's own turn fires hjHeard as it starts, so only a "Hey Jibo" after he is back on idle is a new request.
    const hotword = jibo.jetstream.events.hjHeard, onHotword = () => { if (quietSince !== null) finish(false); };
    if (hotword && hotword.on) hotword.on(onHotword);
    const timer = clock.setInterval(() => {
        const skill = be && be.currentSkill && be.currentSkill.assetPack;
        if (skill && skill !== '@be/idle' && skill !== '@be/agent') left = true;
        if (clock.now() - start > TIMEOUT_MS) return finish(false);
        if (!left || skill !== '@be/idle' || tts.isTalking) { quietSince = null; return; }
        if (quietSince === null) quietSince = clock.now();
        else if (clock.now() - quietSince >= QUIET_MS) finish(true);
    }, POLL_MS);
    function finish(ok) {
        if (done) return; done = true;
        clock.clearInterval(timer);
        if (tts.speak === record) tts.speak = original;
        if (hotword && hotword.off) hotword.off(onHotword); else if (hotword && hotword.removeListener) hotword.removeListener(onHotword);
        if (ok) back(said.join(' ').slice(0, 2000));
    }
    return { cancel: () => finish(false) };
}

module.exports = { RETURNS: RETURNS, watch: watch, plain: plain };
