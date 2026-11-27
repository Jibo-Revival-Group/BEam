'use strict';
// BEefy sends changes that need beta robot code (until the next OTA) only when the robot's CONTEXT has runtime.beta;
// the face's context provider adds it only on the robot at exactly 192.168.7.163. That robot is also local-first:
// runtime.localFirst carries BEacon's report-settings.json (empty lists when it is missing or broken).
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const src = fs.readFileSync(path.join(__dirname, '../@be/be/node_modules/jibo/lib/jibo.js'), 'utf8');
const start = src.indexOf('    getContext(speakers, omitLoop = false) {');
const end = src.indexOf('    getRuntimeContext(speakers, omitLoop = false) {');
assert.ok(start > 0 && end > start && src.slice(start, end).indexOf('static isBetaTester(') > 0, 'methods found');
const __awaiter = (self, _a, _p, generator) => new Promise((resolve, reject) => {
    const it = generator.call(self);
    const step = (next) => { try { const r = next(); r.done ? resolve(r.value) : Promise.resolve(r.value).then((v) => step(() => it.next(v)), (e) => step(() => it.throw(e))); } catch (e) { reject(e); } };
    step(() => it.next());
});
const ContextProvider = new Function('require', '__awaiter', 'log', 'return class ContextProvider {\n' + src.slice(start, end) + '\n};')(require, __awaiter, console);

const at = (...addresses) => ({ lo: [{ family: 'IPv4', address: '127.0.0.1' }],
    wlan0: addresses.map((address) => ({ family: address.indexOf(':') >= 0 ? 'IPv6' : 'IPv4', address: address })) });
assert.strictEqual(ContextProvider.isBetaTester(at('192.168.7.163')), true);
assert.strictEqual(ContextProvider.isBetaTester(at('fe80::1', '192.168.7.163')), true);
['192.168.7.165', '192.168.7.16', '192.168.7.1630', '192.168.7.113', '10.0.0.163', '192.168.17.163'].forEach((address) => {
    assert.strictEqual(ContextProvider.isBetaTester(at(address)), false, address);
});
assert.strictEqual(typeof ContextProvider.isBetaTester(), 'boolean', 'reads this machine\'s interfaces by default');

const empty = { calendarFeeds: [], commuteAddresses: [], newsTopics: [] };
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'local-first-'));
const file = path.join(dir, 'report-settings.json');
assert.deepStrictEqual(ContextProvider.localFirstSettings(file), empty, 'missing file');
fs.writeFileSync(file, '{not json');
assert.deepStrictEqual(ContextProvider.localFirstSettings(file), empty, 'corrupt file');
const saved = { calendarFeeds: [{ memberId: 'zane', icalUrl: 'https://cal.example/x.ics', isEnabled: true, memberName: 'Zane', timeZone: 'America/New_York' }],
    commuteAddresses: 'oops', newsTopics: [{ memberId: 'zane', memberName: 'Zane', disabledTopics: ['sports'] }] };
fs.writeFileSync(file, JSON.stringify(saved));
assert.deepStrictEqual(ContextProvider.localFirstSettings(file), Object.assign({}, saved, { commuteAddresses: [] }), 'non-list keys become empty');
fs.unlinkSync(file); fs.rmdirSync(dir);

(async () => {
    const provider = Object.create(ContextProvider.prototype);
    provider.skill = { id: null };
    provider.getRuntimeContext = () => Promise.resolve({ loop: { users: [] } });
    ContextProvider.localFirstSettings = () => saved;
    ContextProvider.isBetaTester = () => false;
    const regular = await provider.getContext([]);
    assert.deepStrictEqual(regular.runtime, { loop: { users: [] } }, 'other robots: no beta and no localFirst key at all');
    ContextProvider.isBetaTester = () => true;
    const local = await provider.getContext([]);
    assert.deepStrictEqual(local.runtime, { loop: { users: [] }, beta: true, localFirst: saved });
    console.log('PASS only the robot at exactly 192.168.7.163 tags its CONTEXT runtime as beta and sends its local-first report settings');
})().catch((err) => { console.error(err); process.exitCode = 1; });
