'use strict';
// "What can you do": the cards show while Jibo says the intro, and the flow takes over that same menu.
const assert = require('assert');
const Module = require('module');

const load = Module._load;
Module._load = function (request) {
    // Any SDK member the bundle reads at load time (e.g. jibo.rendering.gui.components.Label) is a stub that can be called or extended.
    if (request === 'jibo') {
        const stub = () => new Proxy(function () {}, {
            get: (target, key) => key in target ? target[key] : stub(),
            apply: () => stub()
        });
        return stub();
    }
    if (request === '@be/be-framework') return { BeSkill: class {} };
    return load.apply(this, arguments);
};
const CardDisplay = require('../@be/be/skills/friendly-tips/index.js').CardDisplay;
Module._load = load;

function display() {
    const d = Object.create(CardDisplay.prototype);
    d.opened = [];
    d._showCardMenu = (done) => { d.opened.push(done); };
    return d;
}
const calls = [];

// Intro still playing when the flow reaches "Do the thing.": it waits for the menu that is already up.
let d = display();
d.showCardMenuEarly();
assert.strictEqual(d.opened.length, 1, 'cards open as the intro starts');
d.showCardMenu((r) => calls.push(['a', r]));
assert.strictEqual(d.opened.length, 1, 'no second menu');
d.opened[0]('~SwipeDown');
assert.deepStrictEqual(calls, [['a', '~SwipeDown']]);

// Swiped away during the intro: the flow gets that result straight away.
d = display();
d.showCardMenuEarly();
d.opened[0]('~SwipeDown');
d.showCardMenu((r) => calls.push(['b', r]));
assert.deepStrictEqual(calls[1], ['b', '~SwipeDown']);

// "Want more?" -> yes: the next round opens a new menu.
d.showCardMenu(() => {});
assert.strictEqual(d.opened.length, 2);

// No intro (opened from the menu): unchanged.
d = display();
d.showCardMenu(() => {});
assert.strictEqual(d.opened.length, 1);
console.log('PASS friendly-tips cards show during the intro and the flow takes over that menu');
