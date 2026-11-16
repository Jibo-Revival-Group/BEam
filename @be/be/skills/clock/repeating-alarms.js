'use strict';
// Repeating alarms for @be/clock. They live in their own KB model and scheduler jobs, apart from the
// stock one-time alarm (/jibo/clock/alarm_timer), so setting, ringing or deleting one never touches the other.
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const ERUPT = { skill: '@be/clock', domain: 'alarm', intent: 'finished' };

// "1,2,3" / [1, 2, 3] -> sorted unique days (0 = Sunday), or null when there are none.
function parseDays(value) {
    const list = Array.isArray(value) ? value : String(value == null ? '' : value).split(',');
    const days = [];
    list.forEach(d => {
        const n = parseInt(d, 10);
        if (n >= 0 && n <= 6 && days.indexOf(n) < 0) {
            days.push(n);
        }
    });
    return days.length ? days.sort() : null;
}

function cronString(alarm) {
    return `0 ${alarm.minute} ${alarm.hour} * * ${alarm.days.join(',')}`;
}

function clockText(alarm, spoken) {
    const hour = alarm.hour % 12 || 12;
    const ampm = alarm.hour < 12 ? 'AM' : 'PM';
    const minute = (alarm.minute < 10 ? '0' : '') + alarm.minute;
    return spoken && !alarm.minute ? `${hour} ${ampm}` : `${hour}:${minute} ${ampm}`;
}

function daysText(days, spoken) {
    const key = days.join(',');
    if (key === '0,1,2,3,4,5,6') {
        return spoken ? 'every day' : 'Every day';
    }
    if (key === '1,2,3,4,5') {
        return spoken ? 'every weekday' : 'Weekdays';
    }
    if (key === '0,6') {
        return spoken ? 'every weekend' : 'Weekends';
    }
    if (!spoken) {
        return days.map(d => DAY_NAMES[d].slice(0, 3)).join(' ');
    }
    const names = days.map(d => DAY_NAMES[d]);
    const last = names.pop();
    return 'every ' + (names.length ? names.join(', ') + ' and ' + last : last);
}

function spokenText(alarm) {
    return `${clockText(alarm, true)} ${daysText(alarm.days, true)}`;
}

function byTime(a, b) {
    return (a.hour * 60 + a.minute) - (b.hour * 60 + b.minute) || a.days[0] - b.days[0];
}

// model: a jibo.kb model; scheduler: jibo.scheduler (callback API).
function create(model, scheduler, log) {
    let queue = Promise.resolve();
    // KB saves write the whole root, so run changes one at a time.
    function serial(work) {
        const next = queue.then(work, work);
        queue = next.catch(() => { });
        return next;
    }
    function load() {
        return model.loadRoot().then(root => {
            if (!Array.isArray(root.data.alarms)) {
                root.data.alarms = [];
            }
            return root;
        });
    }
    function schedule(alarm) {
        return new Promise((resolve, reject) => {
            scheduler.addJob(cronString(alarm), ERUPT, (err, jobID) => err ? reject(err) : resolve(jobID));
        });
    }
    function unschedule(jobID) {
        // A job that is already gone (reboot, scheduler restart) is fine.
        return jobID ? new Promise(resolve => scheduler.removeJob(jobID, () => resolve())) : Promise.resolve();
    }
    function hasJob(jobID) {
        return new Promise(resolve => scheduler.hasJob(jobID, (err, data) => resolve(!err && !!data)));
    }
    return {
        list() {
            return load().then(root => root.data.alarms.slice().sort(byTime));
        },
        // alarm: {id?, hour, minute, days}; an existing id updates that alarm.
        save(alarm) {
            const days = parseDays(alarm.days);
            if (!days || !(alarm.hour >= 0 && alarm.hour < 24) || !(alarm.minute >= 0 && alarm.minute < 60)) {
                return Promise.reject(new Error('invalid repeating alarm'));
            }
            return serial(() => load().then(root => {
                const list = root.data.alarms;
                const index = alarm.id ? list.findIndex(a => a.id === alarm.id) : -1;
                const item = {
                    id: index >= 0 ? list[index].id : Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
                    hour: alarm.hour, minute: alarm.minute, days, jobID: null
                };
                return unschedule(index >= 0 ? list[index].jobID : null).then(() => schedule(item)).then(jobID => {
                    item.jobID = jobID;
                    if (index >= 0) {
                        list[index] = item;
                    }
                    else {
                        list.push(item);
                    }
                    return root.save();
                }).then(() => {
                    log.info('saved repeating alarm', item);
                    return item;
                });
            }));
        },
        remove(id) {
            return serial(() => load().then(root => {
                const list = root.data.alarms;
                const index = list.findIndex(a => a.id === id);
                if (index < 0) {
                    return false;
                }
                const jobID = list[index].jobID;
                list.splice(index, 1);
                return unschedule(jobID).then(() => root.save()).then(() => {
                    log.info('removed repeating alarm', id);
                    return true;
                });
            }));
        },
        // Scheduler jobs live in memory, so they are gone after a reboot: add back any that are missing.
        restore() {
            return serial(() => load().then(root => {
                const list = root.data.alarms;
                return list.reduce((p, alarm) => p.then(() => hasJob(alarm.jobID)).then(present => {
                    if (!present) {
                        return schedule(alarm).then(jobID => { alarm.jobID = jobID; });
                    }
                }), Promise.resolve()).then(() => list.length ? root.save() : null);
            })).catch(err => log.warn('restoring repeating alarms failed', err));
        }
    };
}

// The last place the screen was touched, so a tap on the alarm screen can tell which repeating alarm it hit.
const lastTouch = { x: -1, y: -1, at: 0 };
function recordTouch(event) {
    const point = event.changedTouches && event.changedTouches[0] || event;
    if (typeof point.clientX === 'number') {
        lastTouch.x = point.clientX;
        lastTouch.y = point.clientY;
        lastTouch.at = Date.now();
    }
}
if (typeof window !== 'undefined' && window.addEventListener && !window.__beRepeatingAlarmTouch) {
    window.__beRepeatingAlarmTouch = true;
    ['touchstart', 'touchend', 'mousedown', 'mouseup'].forEach(name => window.addEventListener(name, recordTouch, true));
}
function hitTest(rects, now) {
    if ((now || Date.now()) - lastTouch.at > 2000) {
        return null;
    }
    const rect = (rects || []).find(r => lastTouch.x >= r.x && lastTouch.x <= r.x + r.w && lastTouch.y >= r.y && lastTouch.y <= r.y + r.h);
    return rect ? rect.alarm : null;
}

module.exports = {
    create, parseDays, cronString, clockText, daysText, spokenText, hitTest, recordTouch, DAY_NAMES,
    store: null, // the clock skill's store, set in postInit
    edit: null // what the alarm edit screen is editing: {id, hour, minute, days} (id null = not a saved repeating alarm)
};
