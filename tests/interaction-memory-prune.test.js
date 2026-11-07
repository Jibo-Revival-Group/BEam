'use strict';
// Every noteEvent appends the whole history record to the KB file; a 3,000-event history made it 931 MB, too big to load.
// Saving now keeps 2 weeks of events plus each person's last 3.
const assert = require('assert');
const path = require('path');
const im = require(path.resolve(__dirname, '../@be/be/node_modules/jibo-interaction-memory/lib/jibo-interaction-memory.js')).api;

const DAY = 86400000, now = Date.UTC(2026, 10, 7);
const ev = (daysAgo, people) => ({ description: people ? { skillName: '@be/x', personIDs: people } : { skillName: '@be/x' },
    timestamp: now - daysAgo * DAY });
function node(type, data) {
    return { type: type, data: data, edges: {}, save: (cb) => { saved.push(JSON.parse(JSON.stringify(data))); cb(); },
        getEdges: function (name) { return this.edges[name] || []; } };
}
const saved = [];
const history = node('history', { history: [ev(300, ['a']), ev(200, ['a']), ev(100, ['a']), ev(50, ['a']), ev(40, ['b']), ev(30), ev(3)] });
const stats = node('stats', { userSkillLaunchCounts: {} });
const root = node('root', {});
root.edges = { history: ['h'], stats: ['s'] };
im.init({ kb: { createModel: () => ({ loadRoot: (cb) => cb(null, root), load: (id, cb) => cb(null, id === 'h' ? history : stats) }) } });
im._memory.setDateProvider({ getDate: () => new Date(now) });

im.noteEvent({ skillName: '@be/greetings', personIDs: ['a'] }).then(() => {
    const h = saved.find((d) => d.history).history;
    assert.deepStrictEqual(h.map((e) => (now - e.timestamp) / DAY), [100, 50, 40, 3, 0],
        "older than 2 weeks goes, except each person's last 3 (a: now, 50, 100; b: 40); order kept");
    console.log("PASS interaction memory keeps 2 weeks plus each person's last 3 on every save");
}).catch((e) => { console.error(e); process.exit(1); });
