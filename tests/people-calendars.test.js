'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const http = require('http');
const createRequire = require('module').createRequire;
const beacon = path.resolve(__dirname, '../@be/be/beacon');
let credentials = null;
const calendarModule = { exports: {} };
const calendarRequire = createRequire(path.join(beacon, 'lib/calendars.js'));
new Function('require', 'module', 'exports', fs.readFileSync(path.join(beacon, 'lib/calendars.js'), 'utf8'))(
    name => name === './paths' ? { credentialsPath: () => '/test/credentials.json', isFile: () => credentials !== null } :
        name === 'fs' ? { readFileSync: () => credentials } : calendarRequire(name), calendarModule, calendarModule.exports);
const calendars = calendarModule.exports;
let member = { id: 'person', firstName: 'Amber', writtenName: 'Amber', canEdit: true, canRemove: true, canSetOwner: true };
const snapshot = () => ({ loopId: 'local-loop', members: [Object.assign({}, member), { id: 'robot', isJibo: true }] });
const people = { list: () => Promise.resolve(snapshot()), updateMember: (id, data) => {
    assert.strictEqual(id, 'person'); member = Object.assign({}, member, data, { writtenName: data.firstName }); return Promise.resolve(snapshot());
} };
const serverModule = { exports: {} }; const serverRequire = createRequire(path.join(beacon, 'server.js'));
new Function('require', 'module', 'exports', fs.readFileSync(path.join(beacon, 'server.js'), 'utf8'))(
    name => name === './lib/people' ? people : name === './lib/calendars' ? calendars : serverRequire(name), serverModule, serverModule.exports);
class Node {
    constructor(tag) { this.tagName = tag; this.children = []; this.attrs = {}; this._text = ''; this.classList = { add() {}, remove() {} }; }
    set innerHTML(value) { assert.strictEqual(value, ''); this.children = []; }
    set textContent(value) { this._text = String(value); this.children = []; }
    get textContent() { return this._text + this.children.map(child => child.textContent).join(''); }
    appendChild(child) { this.children.push(child); return child; }
    setAttribute(name, value) { this.attrs[name] = value; }
}
const nodes = { '#people-sync': new Node('p'), '#people-list': new Node('div') };
const document = { createElement: tag => new Node(tag), createTextNode: text => { const n = new Node('#text'); n.textContent = text; return n; } };
const el = (tag, css, text) => { const n = new Node(tag); n.className = css; if (text !== undefined) n.textContent = text; return n; };
const app = fs.readFileSync(path.join(beacon, 'public/app.js'), 'utf8');
const render = new Function('document', '$', 'el', app.slice(app.indexOf('    function renderPeople ('), app.indexOf('    function loadPeople (')) + '\nreturn renderPeople;')(
    document, selector => nodes[selector], el);
const all = n => n.children.reduce((out, child) => out.concat(child, all(child)), []);
function assertEditable(data, calendarVisible) {
    render(data); const elements = all(nodes['#people-list']);
    assert(elements.some(n => n.className === 'people-first'), 'Local name editor remains available');
    assert(elements.some(n => n.attrs['data-action'] === 'save-person'));
    assert(elements.some(n => n.attrs['data-action'] === 'remove-person'));
    assert.strictEqual(elements.some(n => n.className === 'people-calendar'), calendarVisible);
    assert(!nodes['#people-sync'].textContent.includes('cloud credentials'));
    assert(!nodes['#people-list'].textContent.includes('cloud credentials'));
}
function request(server, method, body) {
    return new Promise((resolve, reject) => {
        const req = http.request({ hostname: '127.0.0.1', port: server.address().port, method, path: '/api/people' }, res => {
            let text = ''; res.on('data', chunk => { text += chunk; }); res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(text) }));
        }); req.on('error', reject); req.end(body ? JSON.stringify(body) : undefined);
    });
}
async function run() {
    const saves = [];
    const saveCalendar = new Function('document', 'api', 'toast', 'renderPeople',
        'return ({' + app.slice(app.indexOf("        'save-calendar': function"), app.indexOf("        'test-calendar': function")) + '})["save-calendar"];')(
        { querySelector: selector => selector.includes('people-calendar-url') ? { value: '' } : { checked: false } },
        (method, route, body) => { saves.push({ method, route, body }); return Promise.resolve(snapshot()); },
        (message, kind) => { assert.notStrictEqual(kind, 'error', message); }, () => {});
    await saveCalendar({ getAttribute: () => 'person' });
    assert.deepStrictEqual(saves, [{ method: 'PUT', route: '/api/people/calendar', body: { id: 'person', isEnabled: false } }]);
    for (credentials of [null, 'invalid JSON', '{}']) {
        const result = await calendars.attachStatus(snapshot());
        assert.strictEqual(result.calendarAvailable, false); assertEditable(result, false);
    }
    credentials = null;
    const server = serverModule.exports.create(); await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    try {
        const roster = await request(server, 'GET'); assert.strictEqual(roster.status, 200); assertEditable(roster.data, false);
        const saved = await request(server, 'PUT', { id: 'person', firstName: 'Updated' });
        assert.strictEqual(saved.status, 200); assert.strictEqual(saved.data.members[0].firstName, 'Updated'); assertEditable(saved.data, false);
    } finally { await new Promise(resolve => server.close(resolve)); }
    let cloudError = false;
    const cloud = http.createServer((req, res) => {
        res.writeHead(cloudError ? 503 : 200); res.end(JSON.stringify({ members: [{ memberId: 'person', configured: true, host: 'calendar.example', isEnabled: true }] }));
    }); await new Promise(resolve => cloud.listen(0, '127.0.0.1', resolve));
    credentials = JSON.stringify({ accessKeyId: 'test', secretAccessKey: 'test', endpoint: 'http://127.0.0.1:' + cloud.address().port });
    try {
        const available = await calendars.attachStatus(snapshot()); assert.strictEqual(available.calendarAvailable, true); assertEditable(available, true);
        cloudError = true; const unavailable = await calendars.attachStatus(snapshot()); assert.strictEqual(unavailable.calendarAvailable, false); assertEditable(unavailable, false);
    } finally { await new Promise(resolve => cloud.close(resolve)); }
    console.log('Local Loop editing survives missing/invalid calendar credentials and cloud errors; calendar fields appear only when available');
}
run().catch(err => { console.error(err); process.exitCode = 1; });
