'use strict';
// Repeating alarms in @be/clock: storage/scheduling, and that they never touch the one-time alarm.
const assert = require('assert');
const Module = require('module');
const path = require('path');
const clockDir = path.join(__dirname, '../@be/be/skills/clock');
const R = require(path.join(clockDir, 'repeating-alarms'));

function fakeModel(data) {
    const root = { data: data || {}, saves: 0, save() { this.saves++; return Promise.resolve(); } };
    return { root, loadRoot: () => Promise.resolve(root) };
}
function fakeScheduler() {
    const jobs = {};
    let n = 0;
    return {
        jobs,
        addJob(cron, erupt, cb) { const id = 'job' + (++n); jobs[id] = { cron, erupt }; setImmediate(cb, null, id); },
        removeJob(id, cb) { const had = !!jobs[id]; delete jobs[id]; setImmediate(cb, had ? null : new Error('no job')); },
        hasJob(id, cb) { setImmediate(cb, null, jobs[id] ? { id } : null); }
    };
}
const log = { info() { }, warn() { }, debug() { }, error() { }, createChild() { return log; } };

// Minimal stand-ins for the robot runtime so the real clock bundle loads in Node.
class DateTime {
    constructor(utc, text) {
        if (utc && typeof utc === 'object') { this.utc = utc.utc; }
        else if (text) {
            const m = /^(\d+):(\d+)(AM|PM)?$/i.exec(text);
            let hour = parseInt(m[1], 10) % 12 + (/pm/i.test(m[3] || '') ? 12 : 0);
            const d = new Date(); d.setUTCHours(hour, parseInt(m[2], 10), 0, 0);
            this.utc = d.getTime();
        }
        else { this.utc = utc || Date.now(); }
        this.timezone = { offsetUTC: 0 };
    }
    getLocalTime() { const d = new Date(this.utc); return { hour: d.getUTCHours(), minute: d.getUTCMinutes(), seconds: d.getUTCSeconds(), date: d.getUTCDate(), monthNum: d.getUTCMonth() }; }
    toString() { return 'one-time'; }
}
// Anything the test does not set is a do-nothing stub, so module-level lookups like jibo.rendering.tween resolve.
function stub(base) {
    return new Proxy(base || function () { }, {
        get: (target, key) => key in target ? target[key] : (target[key] = stub()),
        apply: () => stub(),
        construct: () => stub()
    });
}
const jibo = stub({ scheduler: fakeScheduler(), flow: { run: () => ({}) }, face: stub({ views: stub({ creator: { registerClass() { } } }) }) });
global.jibo = jibo;
const framework = stub({ BeSkill: class { constructor() { this.log = log; } exit() { } }, utils: stub({ DateTime, Location: { jiboHome: { timezone: {} } } }) });
const load = Module._load;
Module._load = function (request) {
    if (request === 'jibo') { return jibo; }
    if (request === '@be/be-framework') { return framework; }
    return load.apply(this, arguments);
};
const ClockSkill = require(path.join(clockDir, 'index.js'));
Module._load = load;
new ClockSkill(); // wires the shared loggers, as on the robot

async function run() {
    // Pure helpers.
    assert.deepStrictEqual(R.parseDays('5,1,3,1,9,x'), [1, 3, 5]);
    assert.strictEqual(R.parseDays('null'), null);
    assert.strictEqual(R.parseDays([]), null);
    assert.strictEqual(R.cronString({ hour: 7, minute: 5, days: [1, 2, 3, 4, 5] }), '0 5 7 * * 1,2,3,4,5');
    assert.strictEqual(R.clockText({ hour: 0, minute: 5 }), '12:05 AM');
    assert.strictEqual(R.clockText({ hour: 19, minute: 0 }, true), '7 PM');
    assert.strictEqual(R.daysText([1, 2, 3, 4, 5]), 'Weekdays');
    assert.strictEqual(R.daysText([1, 3], false), 'Mon Wed');
    assert.strictEqual(R.spokenText({ hour: 7, minute: 30, days: [1, 3, 5] }), '7:30 AM every Monday, Wednesday and Friday');
    assert.strictEqual(R.spokenText({ hour: 7, minute: 0, days: [0, 6] }), '7 AM every weekend');

    // Store: save, update, remove, restore after a reboot.
    const model = fakeModel();
    const scheduler = fakeScheduler();
    const store = R.create(model, scheduler, log);
    const a = await store.save({ hour: 7, minute: 30, days: [5, 1, 2, 3, 4] });
    const b = await store.save({ hour: 6, minute: 0, days: '0,6' });
    assert.deepStrictEqual(Object.keys(scheduler.jobs).map(id => scheduler.jobs[id].cron).sort(), ['0 0 6 * * 0,6', '0 30 7 * * 1,2,3,4,5']);
    assert.deepStrictEqual(scheduler.jobs[a.jobID].erupt, { skill: '@be/clock', domain: 'alarm', intent: 'finished' });
    assert.deepStrictEqual((await store.list()).map(x => x.id), [b.id, a.id], 'listed by time of day');
    const a2 = await store.save({ id: a.id, hour: 8, minute: 15, days: [1] });
    assert.strictEqual(a2.id, a.id);
    assert(!scheduler.jobs[a.jobID], 'editing replaces the old job');
    assert.strictEqual(scheduler.jobs[a2.jobID].cron, '0 15 8 * * 1');
    assert.strictEqual((await store.list()).length, 2);
    await assert.rejects(store.save({ hour: 7, minute: 0, days: [] }), /invalid/);
    for (const id of Object.keys(scheduler.jobs)) { delete scheduler.jobs[id]; } // reboot: scheduler jobs are in memory
    await store.restore();
    assert.strictEqual(Object.keys(scheduler.jobs).length, 2, 'restore schedules missing jobs');
    await store.restore();
    assert.strictEqual(Object.keys(scheduler.jobs).length, 2, 'restore leaves present jobs alone');
    assert.strictEqual(await store.remove(b.id), true);
    assert.strictEqual(Object.keys(scheduler.jobs).length, 1);
    assert.deepStrictEqual((await store.list()).map(x => x.id), [a.id]);

    // Tap hit test uses the last touch position.
    R.recordTouch({ clientX: 1000, clientY: 150 });
    const rects = [{ x: 975, y: 110, w: 280, h: 110, alarm: a2 }];
    assert.strictEqual(R.hitTest(rects), a2);
    R.recordTouch({ changedTouches: [{ clientX: 640, clientY: 400 }] });
    assert.strictEqual(R.hitTest(rects), null);
    assert.strictEqual(R.hitTest(rects, Date.now() + 5000), null, 'stale touches never count');

    // The clock skill: a repeating alarm is added next to the one-time alarm and never replaces it.
    const repeating = fakeModel();
    R.store = R.create(repeating, jibo.scheduler, log);
    const oneTimeUtc = Date.now() + 3600 * 1000;
    const oneTime = fakeModel({ alarm: { dateTimeInstance: { utc: oneTimeUtc }, jobID: 'one-time-job', cronString: 'x' } });
    jibo.scheduler.jobs['one-time-job'] = { cron: 'x' };
    const result = ClockSkill.prototype.createTimeObject.call({ log }, { nlu: { intent: 'start', entities: { domain: 'alarm', time: '7:00', ampm: 'am', repeat: '1,2,3,4,5' } } });
    assert.deepStrictEqual(result.repeat, [1, 2, 3, 4, 5]);
    const plain = ClockSkill.prototype.createTimeObject.call({ log }, { nlu: { intent: 'start', entities: { domain: 'alarm', time: '7:00', ampm: 'am' } } });
    assert.strictEqual(plain.repeat, null, 'no repeat entity = the stock one-time alarm');
    const skill = { log, _finishedIntent: 'finished', createTimeObject: x => x, analytics: { setAlarmTimer() { } } };
    const at = new ClockSkill.AlarmTimer(skill, null, result, false, oneTime, null, null);
    await at.run(); // builds the Alarm the same way a real launch does
    assert.strictEqual(at.isCurrentDomainSet(), false, 'a new repeating alarm does not ask to replace the one-time alarm');
    assert.strictEqual(String(at.promptTime), '7 AM every weekday');
    await at.addToScheduler();
    await at.addToKB();
    const saved = await R.store.list();
    assert.strictEqual(saved.length, 1);
    assert.deepStrictEqual([saved[0].hour, saved[0].minute, saved[0].days], [7, 0, [1, 2, 3, 4, 5]]);
    assert.strictEqual(oneTime.root.data.alarm.jobID, 'one-time-job', 'one-time alarm untouched');
    assert.strictEqual(oneTime.root.data.alarm.dateTimeInstance.utc, oneTimeUtc);
    assert(jibo.scheduler.jobs['one-time-job'], 'one-time job still scheduled');
    // "That's wrong" right after: only the repeating alarm just made goes away.
    await at.changeAlarmTimer(true);
    assert.strictEqual((await R.store.list()).length, 0);
    assert.strictEqual(oneTime.root.data.alarm.jobID, 'one-time-job');
    assert(jibo.scheduler.jobs['one-time-job']);
    // Startup restore keeps the one-time alarm's job id when the job is still scheduled (renderer reload);
    // losing it made "delete my alarm" do nothing while the alarm still rang.
    const kept = fakeModel({ alarm: { dateTimeInstance: { utc: oneTimeUtc }, jobID: 'one-time-job', cronString: 'x' } });
    jibo.kb.onInit = () => Promise.resolve();
    jibo.kb.createModel = name => name === '/jibo/clock/alarm_timer' ? kept : fakeModel();
    await new Promise(done => ClockSkill.prototype.postInit.call({ log }, done));
    assert.strictEqual(kept.root.data.alarm.jobID, 'one-time-job');
    console.log('clock repeating alarms: ok');
}

run().catch(err => { console.error(err); process.exit(1); });
