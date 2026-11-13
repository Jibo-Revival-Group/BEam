'use strict';
// Node 6-compatible, no network. Drives the bundled jibo-radio IHeartPlayer against
// stubbed iHeart responses: US (unchanged behaviour); Australia, where locationConfig
// returns an empty config and the anonymous login fails (seen 16 Oct 2026); a failed
// market lookup; and a country with no iHeart API.
const assert = require('assert');
const Module = require('module');
const path = require('path');
const radioPath = path.resolve(__dirname, '../@be/be/node_modules/jibo-radio/lib/jibo-radio.js');

const location = {
    us: { countryCode: 'US', config: { apiUrl: 'https://us.api.iheart.com', hostName: 'jibo.appliance.us', terminalId: 385, defaultLiveMarketId: 159 } },
    au: { countryCode: 'AU', config: {} },
    zz: { countryCode: 'ZZ', config: {} }
};
const auMarkets = { hits: [
    { marketId: 715, name: 'REGIONAL-NSW', stationCount: 81 },
    { marketId: 460, name: 'Sydney-NSW', stationCount: 52 },
    { marketId: 576, name: 'DIGITALAU-NAT', stationCount: 44 }
] };
let country, opts, calls;
const axios = { default: {
    get(url, o) {
        calls.push({ method: 'GET', url, params: o && o.params, headers: o && o.headers });
        if (/locationConfig/.test(url)) { return Promise.resolve({ data: location[country] }); }
        if (/zz\.api\.iheart\.com/.test(url)) { return Promise.reject(new Error('getaddrinfo ENOTFOUND zz.api.iheart.com')); }
        if (/content\/markets/.test(url)) { return opts.marketsFail ? Promise.reject(new Error('markets 500')) : Promise.resolve({ data: auMarkets }); }
        return Promise.resolve({ data: { hits: [] } });
    },
    post(url) {
        calls.push({ method: 'POST', url });
        return opts.loginFails ? Promise.reject(new Error('login 400')) : Promise.resolve({ data: {} });
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

function run(c, o) {
    country = c; opts = o || {}; calls = [];
    const p = Object.create(IHeartPlayer.prototype);
    p._promises = new Session(); p._iHeartLog = log(); p._deviceId = 'test';
    p._locationConfigPromise = p._getLocation().catch(e => { p._locationConfigError = e; });
    p._initPromise = p._init().catch(e => { p._initError = e; });
    return p.getStations({ limit: 3 }).then(() => ({ ok: true, calls, p }), e => ({ ok: false, error: e, calls, p }));
}
const stations = r => r.calls.filter(c => /liveStations/.test(c.url));
const warned = (r, re) => r.calls.some(c => c.method === 'WARN' && re.test(c.url));

run('us').then(r => {
    assert(r.ok, 'US radio works');
    assert(!r.calls.some(c => /content\/markets/.test(c.url)), 'US does not look up markets');
    assert(/^https:\/\/us\.api\.iheart\.com\//.test(stations(r)[0].url), 'US uses the configured API');
    assert.strictEqual(stations(r)[0].params.marketId, 575, 'US keeps the national digital market');
    return run('au', { loginFails: true });
}).then(r => {
    assert(r.ok, 'Australia works with an empty config and a failed login: ' + (r.error && r.error.message));
    assert(/^https:\/\/au\.api\.iheart\.com\//.test(stations(r)[0].url), 'Uses the regional API');
    assert.strictEqual(stations(r)[0].headers['X-hostName'], 'webapp.AU', 'Sends the regional host name');
    assert.strictEqual(r.p._iHeartTerminal, 159, 'Has a terminal id for streams');
    assert.strictEqual(stations(r)[0].params.marketId, 576, "Uses the country's national digital market");
    assert(warned(r, /login failed/), 'Logs the failed login');
    assert(!r.calls.some(c => /undefined\/api/.test(c.url)), 'Never calls undefined/api/...');
    return run('au', { marketsFail: true });
}).then(r => {
    assert(r.ok, 'A failed market lookup does not stop the radio');
    assert.strictEqual(stations(r)[0].params.marketId, 575, 'Falls back to the US national market');
    assert(warned(r, /market lookup failed/), 'Logs the failed market lookup');
    return run('zz');
}).then(r => {
    assert(!r.ok && /ENOTFOUND zz\.api\.iheart\.com/.test(r.error.message), 'A country with no iHeart API fails with the network error');
    console.log('jibo-radio iHeart: regional API fallback, non-fatal login and country market');
}).catch(e => { console.error(e); process.exit(1); });
