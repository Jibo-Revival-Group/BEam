'use strict';
// BEacon wake-up time: validated and saved like the other settings; idle wakes him at that minute instead of 6:45,
// treats 22:00 to the wake minute as night, and keeps the stock part-of-day behaviour when it is unset.
const assert = require('assert'), fs = require('fs'), os = require('os'), path = require('path');
const paths = require('../@be/be/beacon/lib/paths');
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'beam-wake-time-'));
paths.dataDir = function () { return dir; };
const wakeTime = require('../@be/be/beacon/lib/wake-time');
const cu = require('../@be/be/node_modules/jibo-cai-utils');

// The idle skill's CircadianManager and ChooseTimeState, taken out of the browserify bundle.
const source = fs.readFileSync(path.join(__dirname, '../@be/be/skills/idle/index.js'), 'utf8');
function bundled(start, end) {
    const text = source.slice(source.indexOf(start) + start.length, source.indexOf(end));
    const m = { exports: {} };
    new Function('require', 'module', 'exports', text)(function (name) {
        if (name === '../../beacon/lib/wake-time') { return wakeTime; }
        if (name === '@be/be-framework') { return { libraries: { jibo_cai_utils: cu, jibo_state_machine: { State: class { constructor(parent) { this.parent = parent; } } } } }; }
        if (name === 'lodash/lodash.min') { return require('../@be/be/node_modules/lodash/lodash.min'); }
        return { CircadianState: {} };
    }, m, m.exports);
    return m.exports;
}
const CircadianManager = bundled('],18:[function(require,module,exports){', '},{"./CircadianExpression":17').CircadianManager;
const ChooseTimeState = bundled('],27:[function(require,module,exports){', '},{"@be/be-framework":undefined,"jibo-common-types":undefined}],28:').ChooseTimeState;

const RealDate = Date;
function at(h, m) { return new RealDate(2026, 10, 19, h, m); }
let clock = at(0, 0);
global.Date = class extends RealDate { constructor() { if (arguments.length) { super(...arguments); } else { super(clock.getTime()); } } };
const events = [];
const manager = Object.create(CircadianManager.prototype);
manager.currentPoD = null;
manager.circadianSM = { update() {}, events: { dayStarts: { emit() { events.push('day ' + clock.toTimeString().slice(0, 5)); } },
    nightStarts: { emit() { events.push('night ' + clock.toTimeString().slice(0, 5)); } } } };
function run(times) { events.length = 0; times.forEach(function (t) { clock = at(t[0], t[1]); manager.update(); }); return events.slice(); }
function chosen(h, m) {
    clock = at(h, m); manager.currentPoD = cu.TimeUtils.getPartOfDay(clock);
    const state = new ChooseTimeState({ parent: Object.assign(manager, { parent: { log: { info() {} } } }) });
    let to; state.transitionTo = function (s) { to = s; }; state.installTransitions = null;
    state.daytimeState = 'day'; state.nighttimeState = 'night'; state.onEntry();
    return to;
}

try {
    // Unset: the stock 6:45 wake-up and the stock part-of-day night.
    assert.deepStrictEqual(wakeTime.get(), { time: '06:45', isDefault: true });
    assert.strictEqual(wakeTime.minutes(), null); assert.strictEqual(wakeTime.isNight(at(3, 0)), null);
    assert.deepStrictEqual(run([[6, 24], [6, 25], [6, 44], [6, 45], [21, 59], [22, 0]]), ['day 06:45', 'night 22:00']);
    assert.strictEqual(chosen(4, 44), 'night'); assert.strictEqual(chosen(6, 0), 'day');
    assert.strictEqual(manager.isNight(at(4, 44)), true); assert.strictEqual(manager.isNight(at(4, 45)), false);

    // Validation: HH:MM, 02:00 to 11:00 inclusive.
    ['01:59', '11:01', '6:25', '06:60', '24:00', '', null, 625].forEach(function (bad) {
        assert.throws(function () { wakeTime.set(bad); }, function (err) { return err.status === 400; }, String(bad));
    });
    assert.strictEqual(wakeTime.minutes(), null, 'rejected values are not saved');
    ['02:00', '11:00', '06:25'].forEach(function (good) { assert.deepStrictEqual(wakeTime.set(good), { time: good, isDefault: false }); });
    assert.deepStrictEqual(JSON.parse(fs.readFileSync(path.join(dir, 'wake-time.json'), 'utf8')), { time: '06:25' });
    assert(!fs.existsSync(path.join(dir, 'wake-time.json.tmp')));
    wakeTime._reset(); assert.strictEqual(wakeTime.minutes(), 6 * 60 + 25, 'survives a restart');

    // Set to 06:25: he wakes when the clock crosses 06:25, not again at 06:45; night still starts at 22:00.
    assert.strictEqual(wakeTime.crossed(384, 385), true); assert.strictEqual(wakeTime.crossed(385, 386), false);
    assert.deepStrictEqual(run([[6, 23], [6, 24], [6, 25], [6, 26], [6, 44], [6, 45], [21, 59], [22, 0]]), ['day 06:25', 'night 22:00']);
    assert.deepStrictEqual(run([[23, 59], [0, 0], [6, 24], [6, 27]]), ['day 06:27'], 'a late update still wakes him once');
    [[21, 59, false], [22, 0, true], [0, 0, true], [6, 24, true], [6, 25, false], [11, 0, false]].forEach(function (c) {
        assert.strictEqual(wakeTime.isNight(at(c[0], c[1])), c[2], c.join(':'));
        assert.strictEqual(manager.isNight(at(c[0], c[1])), c[2], 'manager ' + c.join(':'));
        assert.strictEqual(chosen(c[0], c[1]), c[2] ? 'night' : 'day', 'ChooseTimeState ' + c.join(':'));
    });
    // A late wake time: 4:45 to 9:00 is night now, where stock it is day.
    wakeTime.set('09:00'); assert.strictEqual(chosen(5, 0), 'night'); assert.strictEqual(chosen(9, 0), 'day');
    console.log('wake-time ok');
} finally {
    global.Date = RealDate;
    fs.rmSync(dir, { recursive: true, force: true });
}
