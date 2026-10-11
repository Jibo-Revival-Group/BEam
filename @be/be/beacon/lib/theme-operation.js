'use strict';

// A deadline must stop late callbacks from committing, not just reject a race.
function run(label, timeout, work) {
    return new Promise((resolve, reject) => {
        let finished = false; let cancelled = null; let callbacks = [];
        const operation = {
            check: () => { if (cancelled) { throw cancelled; } },
            onCancel: callback => {
                if (cancelled) { callback(cancelled); return () => {}; }
                callbacks.push(callback);
                return () => { callbacks = callbacks.filter(fn => fn !== callback); };
            }
        };
        const timer = setTimeout(() => {
            if (finished) { return; }
            cancelled = new Error(label + ' timed out. You can retry.'); cancelled.status = 504;
            callbacks.slice().forEach(fn => { try { fn(cancelled); } catch (err) { /* still release the operation */ } });
            settle(cancelled);
        }, timeout);
        function settle(err, result) {
            if (finished) { return; } finished = true; clearTimeout(timer); callbacks = [];
            if (err) { reject(err); } else { resolve(result); }
        }
        Promise.resolve().then(() => work(operation)).then(value => settle(null, value), err => settle(err));
    });
}
module.exports = { run: run };
