'use strict';
// 5x1 local-first (the robot at exactly 192.168.7.163): BEacon keeps calendar feeds, commute addresses and news topics
// in Knowledge/beacon/report-settings.json and uses the cloud only to check feeds, geocode and list the topics.
// Every other robot calls the cloud exactly as before.
const assert = require('assert'), fs = require('fs'), os = require('os'), path = require('path');
const EventEmitter = require('events');
const lib = path.resolve(__dirname, '../@be/be/beacon/lib');
const load = (name, stubs) => {
    const mod = { exports: {} };
    new Function('require', 'module', 'exports', fs.readFileSync(path.join(lib, name), 'utf8'))(
        n => (n in stubs ? stubs[n] : require(n.indexOf('./') === 0 ? path.join(lib, n) : n)), mod, mod.exports);
    return mod.exports;
};

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'local-first-'));
const store = load('local-first.js', { './paths': { dataDir: () => dir } });
const at = address => ({ lo: [{ family: 'IPv4', address: '127.0.0.1' }], wlan0: [{ family: 'IPv4', address: address }] });
assert.strictEqual(store.enabled(at('192.168.7.163')), true);
['192.168.7.165', '192.168.7.1630', '10.0.0.163'].forEach(a => assert.strictEqual(store.enabled(at(a)), false, a));
const empty = { calendarFeeds: [], commuteAddresses: [], newsTopics: [] };
assert.deepStrictEqual(store.read(), empty, 'missing file');
fs.writeFileSync(store.file(), '{broken');
assert.deepStrictEqual(store.read(), empty, 'broken file');
store.put('newsTopics', 'a', { memberId: 'a', disabledTopics: ['sports'] });
store.put('newsTopics', 'b', { memberId: 'b', disabledTopics: [] });
store.put('newsTopics', 'a', { memberId: 'a', disabledTopics: ['health'] });
store.put('newsTopics', 'b', null);
assert.deepStrictEqual(store.read().newsTopics, [{ memberId: 'a', disabledTopics: ['health'] }]);
assert.strictEqual(fs.statSync(store.file()).mode & 0o777, 0o600, 'private like agent-memory.json');
assert.deepStrictEqual(fs.readdirSync(dir), ['report-settings.json'], 'atomic write leaves no temporary file');
fs.unlinkSync(store.file());
let local = true;
store.enabled = () => local;

// calendars.js signs its own requests: answer them with a fake http and record what the cloud was sent.
const sent = []; let reply = () => ({ status: 200, body: {} });
const http = { request: (options, onResponse) => {
    const req = new EventEmitter(); let payload = '';
    req.setTimeout = () => {}; req.write = chunk => { payload += chunk; };
    req.end = () => {
        const op = options.headers['X-Amz-Target'].split('.')[1], body = JSON.parse(payload), r = reply(op, body);
        sent.push({ op: op, body: body });
        const res = new EventEmitter(); res.statusCode = r.status; res.setEncoding = () => {};
        onResponse(res); res.emit('data', JSON.stringify(r.body)); res.emit('end');
    };
    return req;
} };
const roster = () => ({ members: [{ id: 'zane', firstName: 'Zane', lastName: 'Vincent', type: 'owner' }, { id: 'robot', isJibo: true }] });
const people = { list: () => Promise.resolve(roster()),
    findMember: id => Promise.resolve({ member: roster().members.filter(m => m.id === id)[0], snapshot: roster() }) };
const calendars = load('calendars.js', {
    './local-first': store, './people': people, http: http,
    './paths': { credentialsPath: () => '/creds', isFile: () => true },
    fs: { readFileSync: f => (f === '/creds' ? JSON.stringify({ accessKeyId: 'k', secretAccessKey: 's', endpoint: 'http://cloud' }) : '{"name":"Robot-Name"}') }
});
const url = 'https://calendar.example/private/zane.ics';

(async () => {
    // Calendars, local-first.
    let snap = await calendars.save('zane', url, true);
    assert.deepStrictEqual(sent, [{ op: 'SetCalendarFeed', body: { memberId: 'zane', icalUrl: url, isEnabled: true, memberName: 'Zane Vincent', timeZone: null, localFirst: true } }]);
    assert.deepStrictEqual(store.read().calendarFeeds, [{ memberId: 'zane', icalUrl: url, isEnabled: true, memberName: 'Zane Vincent', timeZone: null }]);
    assert.deepStrictEqual(snap.members[0].calendar, { memberId: 'zane', configured: true, isEnabled: true, host: 'calendar.example', lastSuccessUtc: null, lastError: null, updatedUtc: null });
    assert.strictEqual(JSON.stringify(snap).indexOf('private'), -1, 'the page never sees the feed URL');
    sent.length = 0;
    await calendars.save('zane', '', false);
    assert.strictEqual(sent[0].body.icalUrl, url, 'turning it off re-sends the URL saved here for the check');
    assert.strictEqual(store.read().calendarFeeds[0].isEnabled, false);
    sent.length = 0; reply = () => ({ status: 400, body: { error: 'Use an https link.' } });
    await assert.rejects(calendars.save('zane', 'http://bad', true), /https link/);
    assert.strictEqual(store.read().calendarFeeds[0].icalUrl, url, 'a rejected feed is not saved');
    sent.length = 0; reply = () => ({ status: 200, body: { ok: true } });
    snap = await calendars.testFeed('zane');
    assert.deepStrictEqual(sent, [{ op: 'TestCalendarFeed', body: { memberId: 'zane', icalUrl: url, localFirst: true } }]);
    assert.strictEqual(snap.calendarTest.ok, true);
    sent.length = 0;
    snap = await calendars.clear('zane');
    assert.deepStrictEqual(sent, [], 'reading and clearing feeds never call the cloud');
    assert.deepStrictEqual(store.read().calendarFeeds, []);
    assert.strictEqual(snap.members[0].calendar.configured, false);

    // Calendars, every other robot: the same cloud calls as before.
    local = false; sent.length = 0; reply = () => ({ status: 200, body: { members: [] } });
    await calendars.save('zane', url, true);
    await calendars.testFeed('zane');
    await calendars.clear('zane');
    assert.deepStrictEqual(sent, [
        { op: 'SetCalendarFeed', body: { memberId: 'zane', icalUrl: url, isEnabled: true, memberName: 'Zane Vincent', timeZone: null } },
        { op: 'GetCalendarFeeds', body: {} },
        { op: 'TestCalendarFeed', body: { memberId: 'zane' } },
        { op: 'GetCalendarFeeds', body: {} },
        { op: 'ClearCalendarFeed', body: { memberId: 'zane' } },
        { op: 'GetCalendarFeeds', body: {} }
    ]);
    assert.deepStrictEqual(store.read().calendarFeeds, [], 'nothing saved locally');

    // Commute, local-first: the cloud geocodes, the address is kept here.
    local = true;
    const calls = []; let applied = null;
    const cloud = { robotIdFrom: () => 'Robot-Name', homeTimeZone: () => 'America/New_York',
        callCloud: (op, body) => {
            calls.push({ op: op, body: body });
            if (op === 'GetCommuteAddresses') return Promise.resolve({ available: true, addresses: [{ memberId: 'cloud', address: 'not used' }] });
            return Promise.resolve({ address: body.address.toUpperCase(), lat: 42.6, lng: -71.4, city: 'Lowell', state: 'MA' });
        } };
    const commute = load('commute.js', { './calendars': cloud, './local-first': store, './people': people,
        './location': { applyAddress: found => { applied = found; return Promise.resolve({ location: { city: found.city } }); } } });
    await commute.setWork('zane', '2 work rd', 'walking');
    assert.deepStrictEqual(calls, [{ op: 'SetCommuteAddress', body: { memberId: 'zane', address: '2 work rd', memberName: 'Zane Vincent', mode: 'walking', localFirst: true } }]);
    calls.length = 0;
    await commute.setWork('zane', '2 Work Rd', 'bicycling');
    assert.deepStrictEqual(calls, [], 'a mode-only change needs no lookup');
    assert.deepStrictEqual(store.find('commuteAddresses', 'zane'), { memberId: 'zane', address: '2 WORK RD', lat: 42.6, lng: -71.4, city: 'Lowell', mode: 'bicycling', memberName: 'Zane Vincent', timeZone: null });
    await commute.setPersonHome('zane', '1 main st');
    assert.deepStrictEqual(calls.map(c => c.op + ' ' + JSON.stringify(c.body)), [
        'GetCommuteAddresses {"localFirst":true}',
        'SetCommuteAddress {"memberId":"home:zane","address":"1 main st","memberName":"Zane Vincent","localFirst":true}',
        'SetCommuteAddress {"address":"1 MAIN ST","timeZone":"America/New_York","localFirst":true}'
    ], 'the owner\'s home also becomes the household home');
    assert.strictEqual(applied.city, 'Lowell');
    assert.deepStrictEqual(store.find('commuteAddresses', 'home'), { memberId: 'home', address: '1 MAIN ST', lat: 42.6, lng: -71.4, city: 'Lowell', mode: null, memberName: null, timeZone: 'America/New_York' });
    calls.length = 0;
    snap = await commute.attach(roster());
    assert.strictEqual(snap.commuteAvailable, true);
    assert.deepStrictEqual([snap.members[0].workAddress, snap.members[0].commuteMode, snap.members[0].homeAddress], ['2 WORK RD', 'bicycling', '1 MAIN ST']);
    assert.deepStrictEqual(await commute.homeAddress(), { available: true, address: '1 MAIN ST' });
    calls.length = 0;
    await commute.clearWork('zane'); await commute.clearPersonHome('zane');
    assert.deepStrictEqual(calls, [], 'clearing never calls the cloud');
    assert.deepStrictEqual(store.read().commuteAddresses.map(a => a.memberId), ['home']);

    // News topics, local-first: the cloud lists the topics only.
    const topics = load('news-topics.js', { './calendars': { robotIdFrom: () => 'Robot-Name', callCloud: (op, body) => {
        calls.push({ op: op, body: body }); return Promise.resolve({ topics: ['general', 'sports'], people: [{ memberId: 'zane', disabledTopics: ['general'] }] });
    } }, './local-first': store, './people': people });
    calls.length = 0;
    await topics.set('zane', ['sports']);
    assert.deepStrictEqual(calls, [], 'saving topics never calls the cloud');
    snap = await topics.attach(roster());
    assert.deepStrictEqual(calls, [{ op: 'GetNewsTopics', body: { localFirst: true } }]);
    assert.deepStrictEqual([snap.newsTopics, snap.members[0].disabledNewsTopics], [['general', 'sports'], ['sports']]);

    // JiboSync reads the same file on a local-first robot (writes go through the modules above).
    store.put('calendarFeeds', 'zane', { memberId: 'zane', icalUrl: url, isEnabled: true });
    store.put('commuteAddresses', 'zane', { memberId: 'zane', address: '2 WORK RD' });
    const sync = fs.readFileSync(path.join(lib, 'jibosync.js'), 'utf8');
    const defaultSettings = new Function('require', sync.slice(sync.indexOf('function defaultSettings ('), sync.indexOf('function sameVersions (')) + '\nreturn defaultSettings;')(
        n => ({ './calendars': { callCloud: () => { throw new Error('no cloud for local-first'); } }, './commute': {}, './news-topics': {}, './local-first': store })[n]);
    assert.deepStrictEqual(await defaultSettings(people).read(), { zane: { calendar: { url: url, enabled: true }, work: '2 WORK RD', news: ['sports'] } });
    fs.unlinkSync(store.file()); fs.rmdirSync(dir);
    console.log('Local-first: report settings stay in report-settings.json (0600, atomic); other robots call the cloud as before');
})().catch(err => { console.error(err); process.exitCode = 1; });
