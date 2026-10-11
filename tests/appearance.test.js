'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const publicDir = path.resolve(__dirname, '../@be/be/beacon/public');
const source = fs.readFileSync(path.join(publicDir, 'appearance.js'), 'utf8');
class Node {
    constructor(value) { this.attrs = { 'data-value': value }; this.style = {}; this.events = {}; this.disabled = false; }
    getAttribute(name) { return this.attrs[name]; }
    setAttribute(name, value) { this.attrs[name] = value; }
    addEventListener(name, callback) { this.events[name] = callback; }
    focus() { this.focused = true; }
}
function root(values) {
    const slider = new Node(), buttons = values.map(value => new Node(value));
    return { slider, buttons, querySelector: () => slider, querySelectorAll: () => buttons };
}
function environment(value, dark, legacy, unavailable) {
    const storage = { value }; const events = {}; const media = { matches: dark };
    media[legacy ? 'addListener' : 'addEventListener'] = legacy ? fn => { media.changed = fn; } : (name, fn) => { media.changed = fn; };
    const window = { matchMedia: query => { assert.strictEqual(query, '(prefers-color-scheme: dark)'); return media; },
        addEventListener: (name, fn) => { events[name] = fn; }, localStorage: {
            getItem: () => { if (unavailable) throw new Error('Storage unavailable'); return storage.value; },
            setItem: (key, item) => { if (unavailable) throw new Error('Storage unavailable'); storage.value = item; }
        } };
    const document = { documentElement: new Node() };
    new Function('window', 'document', source)(window, document);
    return { window, document, media, storage, events, api: window.BEaconAppearance };
}
async function run() {
    const env = environment(null, true); assert.strictEqual(env.api.get(), 'system');
    assert.strictEqual(env.document.documentElement.attrs['data-appearance'], 'dark', 'Default follows system before page rendering');
    const appearance = root(['bright', 'system', 'dark']); env.api.bind(appearance);
    assert.strictEqual(appearance.slider.style.transform, 'translateX(100%)');
    env.media.matches = false; env.media.changed(); assert.strictEqual(env.document.documentElement.attrs['data-appearance'], 'bright');
    appearance.buttons[2].onclick(); assert.strictEqual(env.storage.value, 'dark');
    assert.strictEqual(appearance.slider.style.transform, 'translateX(200%)'); assert.strictEqual(appearance.buttons[2].attrs['aria-checked'], 'true');
    env.media.matches = false; env.media.changed(); assert.strictEqual(env.document.documentElement.attrs['data-appearance'], 'dark', 'Manual preference overrides system changes');
    appearance.buttons[2].events.keydown({ key: 'Home', preventDefault() {} });
    assert.strictEqual(env.api.get(), 'bright'); assert(appearance.buttons[0].focused);
    env.media.matches = true; env.media.changed(); assert.strictEqual(env.document.documentElement.attrs['data-appearance'], 'bright');
    appearance.buttons[0].events.keydown({ key: 'ArrowRight', preventDefault() {} }); assert.strictEqual(env.api.get(), 'system');
    assert.strictEqual(env.document.documentElement.attrs['data-appearance'], 'dark');
    assert.strictEqual(environment('bright', true).document.documentElement.attrs['data-appearance'], 'bright', 'Saved choice survives restart');
    env.storage.value = 'dark'; env.events.storage({ key: 'beacon-appearance' }); assert.strictEqual(env.api.get(), 'dark');
    assert.strictEqual(appearance.buttons[2].attrs['aria-checked'], 'true');
    env.storage.value = null; env.events.storage({ key: null }); assert.strictEqual(env.api.get(), 'system');
    const old = environment('invalid', false, true); old.media.matches = true; old.media.changed();
    assert.strictEqual(old.document.documentElement.attrs['data-appearance'], 'dark', 'Legacy matchMedia listener works');
    const blocked = environment(null, true, false, true); blocked.api.set('bright');
    assert.strictEqual(blocked.document.documentElement.attrs['data-appearance'], 'bright', 'Storage errors do not prevent switching');
    const noMedia = { addEventListener() {}, localStorage: { getItem() { return null; } } };
    const fallbackDoc = { documentElement: new Node() }; new Function('window', 'document', source)(noMedia, fallbackDoc);
    assert.strictEqual(fallbackDoc.documentElement.attrs['data-appearance'], 'bright', 'Unsupported system detection falls back to bright');

    const units = root(['fahrenheit', 'celsius']), save = new Node(), state = { units: { temperature: 'fahrenheit' } };
    const calls = []; let fail = false;
    const api = (method, url, body) => {
        calls.push({ method, url, body }); return fail ? Promise.reject(new Error('Save failed')) : Promise.resolve({ temperature: body ? body.temperature : 'fahrenheit' });
    };
    const app = fs.readFileSync(path.join(publicDir, 'app.js'), 'utf8');
    const start = app.indexOf("    window.BEaconAppearance.bind($('#appearance-choices'));");
    const code = app.slice(start, app.indexOf('    function loadEtc ()', start));
    const unitUI = new Function('window', '$', 'state', 'api', 'toast', 'reportError', code + '\nreturn {load:loadUnits,save:saveUnits,selected:selectedTemperatureUnit};')(
        env.window, selector => selector === '#appearance-choices' ? root(['bright', 'system', 'dark']) : selector === '#units-choices' ? units : save,
        state, api, () => {}, () => {});
    await unitUI.load(); units.buttons[1].onclick(); assert.strictEqual(unitUI.selected(), 'celsius');
    assert.strictEqual(units.slider.style.transform, 'translateX(100%)'); await unitUI.save();
    assert.strictEqual(calls[calls.length - 1].body.temperature, 'celsius'); assert.strictEqual(state.units.temperature, 'celsius');
    units.buttons[0].onclick(); fail = true; await unitUI.save();
    assert.strictEqual(unitUI.selected(), 'celsius', 'Failed saves restore the saved unit'); assert.strictEqual(save.disabled, false);
    const html = fs.readFileSync(path.join(publicDir, 'index.html'), 'utf8');
    assert(html.indexOf('src="appearance.js"') < html.indexOf('href="app.css"'));
    assert(html.includes('id="appearance-choices"') && !html.includes('name="temperature-unit"'));
    console.log('System appearance, saved overrides, live changes, storage recovery, slider keyboard controls and weather-unit saves passed');
}
run().catch(err => { console.error(err); process.exitCode = 1; });
