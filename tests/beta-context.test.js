'use strict';
// BEefy sends changes that need beta robot code (until the next OTA) only when the robot's CONTEXT has runtime.beta;
// the face's context provider adds it only on the robot at exactly 192.168.7.163. Every robot is local-first once
// BEacon has imported the cloud's settings: runtime.localFirst carries report-settings.json (none before the import).
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

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'local-first-'));
const file = path.join(dir, 'report-settings.json');
assert.strictEqual(ContextProvider.localFirstSettings(file), null, 'missing file: not local-first yet');
fs.writeFileSync(file, '{not json');
assert.strictEqual(ContextProvider.localFirstSettings(file), null, 'corrupt file');
fs.writeFileSync(file, JSON.stringify({ newsTopics: [] }));
assert.strictEqual(ContextProvider.localFirstSettings(file), null, 'not imported yet');
const saved = { calendarFeeds: [{ memberId: 'zane', icalUrl: 'https://cal.example/x.ics', isEnabled: true, memberName: 'Zane', timeZone: 'America/New_York' }],
    commuteAddresses: [], newsTopics: [{ memberId: 'zane', memberName: 'Zane', disabledTopics: ['sports'] }] };
fs.writeFileSync(file, JSON.stringify(Object.assign({ imported: true }, saved, { commuteAddresses: 'oops' })));
assert.deepStrictEqual(ContextProvider.localFirstSettings(file), saved, 'non-list keys become empty');
fs.unlinkSync(file); fs.rmdirSync(dir);

(async () => {
    const provider = Object.create(ContextProvider.prototype);
    provider.skill = { id: null };
    provider.getRuntimeContext = () => Promise.resolve({ loop: { users: [] } });
    ContextProvider.localFirstSettings = () => null;
    ContextProvider.isBetaTester = () => false;
    assert.deepStrictEqual((await provider.getContext([])).runtime, { loop: { users: [] } }, 'before the import: no beta and no localFirst key');
    ContextProvider.localFirstSettings = () => saved;
    assert.deepStrictEqual((await provider.getContext([])).runtime, { loop: { users: [] }, localFirst: saved }, 'any robot after the import');
    ContextProvider.isBetaTester = () => true;
    assert.deepStrictEqual((await provider.getContext([])).runtime, { loop: { users: [] }, beta: true, localFirst: saved });
    console.log('PASS only 192.168.7.163 is tagged beta; every robot sends its local-first report settings once imported');
})().catch((err) => { console.error(err); process.exitCode = 1; });
