'use strict';
// Node 6-compatible. Drives the bundled jibo-radio IHeartPlayer against stubbed
// iHeart responses: US (unchanged behaviour), a country whose locationConfig for
// jibo.appliance is empty (e.g. Australia), and an unsupported country.
const assert = require('assert');
const Module = require('module');
const path = require('path');
const radioPath = path.resolve(__dirname, '../@be/be/node_modules/jibo-radio/lib/jibo-radio.js');

const responses = {
    us: { 'jibo.appliance': { countryCode: 'US', config: { apiUrl: 'https://us.api.iheart.com', hostName: 'jibo.appliance', terminalId: 1, defaultLiveMarketId: 159 } } },
    au: {
        'jibo.appliance': { countryCode: 'AU', config: {} },
        'webapp': { countryCode: 'AU', config: { apiUrl: 'https://au.api.iheart.com', hostName: 'webapp.AU', terminalId: 161, defaultLiveMarketId: 460 } }
    },
    zz: { 'jibo.appliance': { countryCode: 'ZZ', config: {} }, 'webapp': { countryCode: 'ZZ', config: {} } }
};
let scenario, loginFails, calls;
const axios = { default: {
    get(url, opts) {
        calls.push({ method: 'GET', url, params: opts && opts.params });
        const m = url.match(/locationConfig\?hostname=([^&]+)/);
        return Promise.resolve({ data: m ? responses[scenario][decodeURIComponent(m[1])] : { hits: [] } });
    },
    post(url) {
        calls.push({ method: 'POST', url });
        return loginFails ? Promise.reject(new Error('login 400')) : Promise.resolve({ data: {} });
    }
} };
function Session() {}
Session.prototype.wrap = function (p) { return p; };
Session.prototype.cancel = function () {};
function log() { return { info() {}, debug() {}, error() {}, warn(msg) { calls.push({ method: 'WARN', url: msg }); }, createChild: log }; }
const stubs = {
    axios,
    'jibo-cai-utils': { CancelTokenSession: Session, PromiseUtils: { promisify: f => () => new Promise(r => f(r)) } },
    'jibo-log': { Log: log, default: log },
    'hls.js': Object.assign(function () {}, { isSupported: () => true }),
    icecast: {}
};
const load = Module._load;
Module._load = function (request) { return Object.prototype.hasOwnProperty.call(stubs, request) ? stubs[request] : load.apply(this, arguments); };
const IHeartPlayer = require(radioPath).createRadio().constructor;
Module._load = load;

function run(name, failLogin) {
    scenario = name; loginFails = failLogin; calls = [];
    const p = Object.create(IHeartPlayer.prototype);
    p._promises = new Session(); p._iHeartLog = log(); p._deviceId = 'test';
    p._locationConfigPromise = p._getLocation().catch(e => { p._locationConfigError = e; });
    p._initPromise = p._init().catch(e => { p._initError = e; });
    return p.getStations({ limit: 3 }).then(() => ({ ok: true, calls }), e => ({ ok: false, error: e, calls }));
}
const stations = r => r.calls.filter(c => /liveStations/.test(c.url));

run('us', false).then(r => {
    assert(r.ok, 'US radio works');
    assert.strictEqual(r.calls.filter(c => /locationConfig/.test(c.url)).length, 1, 'US asks locationConfig once');
    assert.strictEqual(stations(r)[0].params.marketId, 575, 'US keeps the national digital market');
    return run('au', true);
}).then(r => {
    assert(r.ok, 'Radio works when jibo.appliance has no config and login fails: ' + (r.error && r.error.message));
    assert(/hostname=webapp&/.test(r.calls[1].url), 'Falls back to the webapp locationConfig');
    assert(/^https:\/\/au\.api\.iheart\.com\//.test(stations(r)[0].url), 'Uses the country API');
    assert.strictEqual(stations(r)[0].params.marketId, 460, 'Uses the country default market');
    assert(r.calls.some(c => c.method === 'WARN' && /login failed/.test(c.url)), 'Logs the failed login');
    return run('zz', false);
}).then(r => {
    assert(!r.ok && /no API config for country ZZ/.test(r.error.message), 'Unsupported country gives a clear error');
    assert(!r.calls.some(c => /undefined\/api/.test(c.url)), 'Never calls undefined/api/...');
    console.log('jibo-radio iHeart: location fallback, non-fatal login and country market');
}).catch(e => { console.error(e); process.exit(1); });
