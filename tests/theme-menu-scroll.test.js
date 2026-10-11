'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const scroll = require('../@be/be/beacon/lib/theme-menu-scroll');
const bundle = fs.readFileSync(path.join(__dirname, '../@be/be/node_modules/jibo/lib/jibo.js'), 'utf8');
class Point {
    constructor(x, y) { this.x = x || 0; this.y = y || 0; }
    clone() { return new Point(this.x, this.y); }
}
class Group {
    constructor() { this.componentList = []; this.inputLocked = false; }
    get componentsTotal() { return this.componentList.length; }
    lockChildInput(flag) { this._childInputLocked = flag; this.componentList.forEach(b => b.inputLocked = flag); }
    registerUpdate() {}
    ready() {}
    destroy() {}
}
class Member { constructor() { this.targetPosition = new Point(); this.velocity = new Point(); } }
let panEvents = 0;
const runtime = { globalEvents: { shared: { screenGesture: { emit() { panEvents++; } } } } };
const dependencies = {
    '../components/Button': { default: class {} }, '../ComponentGroup': { default: Group }, '../ComponentCreator': {},
    '../ViewManager': {}, '../actions/ActionData': {}, '../../FaceRenderer': { default: { WIDTH: 1280, HEIGHT: 720 } },
    '../../tween/TweenManager': {}, '../../../Runtime': { default: { instance: runtime } },
    '../TouchManager': { GESTURE: { PAN: 'pan' }, default: { instance: { addGesture() {}, removeGesture() {} } } },
    '../DisplayUtils': {}, './subcomponents/ListMember': { default: Member }, './log': { default: { createChild() { return { info() {} }; } } }
};
Member.TYPE = 'ListMember';
const marker = '}],139:[function(require,module,exports){';
const start = bundle.indexOf(marker) + marker.length; const end = bundle.indexOf('\n},{', start);
assert(start > marker.length && end > start);
const moduleValue = { exports: {} };
new Function('require', 'module', 'exports', 'PIXI', bundle.slice(start, end))(name => {
    assert(name in dependencies, name); return dependencies[name];
}, moduleValue, moduleValue.exports, { Point });
const List = moduleValue.exports.default;
function list(count, dynamicElements) {
    const result = new List(); result.elementDimensions = { width: 400, height: 300 };
    result.elementsPerPage = 3; result.elementBuffer = 30; result.axisPosition = 360; result.autoFitElements = false;
    for (let i = 0; i < count; i++) {
        const member = new Member();
        result.componentList.push({ display: { x: 0, y: 0 }, targetPosition: new Point(), member: member,
            setTargetPosition(x, y) { this.display.x = this.targetPosition.x = x; this.display.y = this.targetPosition.y = y; },
            lockInput(flag) { this.inputLocked = flag; },
            getSubcomponent() { return member; } });
    }
    result.calculateReferenceValues(); result.container = {}; result.dynamicElements = !!dynamicElements;
    scroll.enable(result); result.calculateReferenceValues(); scroll.refresh(result); return result;
}
function gesture(result, delta, final) {
    // Use the SDK's original bound callback, as registered with TouchManager.
    result.onPanEvent({ isFinal: !!final, velocityX: delta ? -1 : 0, pointers: [{ x: 640 }], srcEvent: { movementX: delta } });
}
const current = list(6);
assert.strictEqual(current.elementSpacing, 430); assert.strictEqual(current.componentList[0].display.x, 30);
assert.strictEqual(current.componentList[2].display.x, 890);
assert.strictEqual(current.componentList[2].display.x + 400, 1290, 'Show a partial button at the edge');
const before = current.componentList[0].display.x;
gesture(current, -73);
assert.strictEqual(current.componentList[0].display.x, before - 73, 'Track the finger without spring lag');
assert(current.componentList.every(b => b.inputLocked), 'Dragging cannot activate buttons');
gesture(current, 0, true); assert.strictEqual(panEvents, 1, 'Keep native global pan notification');
for (let i = 0; i < 200; i++) { current.update(16); }
const offset = current._beamThemeScroll.offset;
assert(offset > 73, 'Release coasts forward');
assert(offset < current._beamThemeScroll.max);
assert(Math.abs(offset / 430 - Math.round(offset / 430)) > 0.01, 'Do not snap to a button or page');
assert(current.componentList.every(b => !b.inputLocked), 'Taps work after scrolling settles');
current.componentList.forEach(b => assert.strictEqual(b.member.targetPosition.x, b.display.x, 'Hit target moves with button'));
const settled = current.componentList[0].display.x; current.update(16); assert.strictEqual(current.componentList[0].display.x, settled);
gesture(current, -100000); gesture(current, 0, true); current.update(16);
assert.strictEqual(current._beamThemeScroll.offset, current._beamThemeScroll.max);
assert.strictEqual(current.componentList[5].display.x + 400, 1250, 'Last button is fully reachable');
gesture(current, 100000); gesture(current, 0, true); current.update(16); assert.strictEqual(current._beamThemeScroll.offset, 0);
current.inputLocked = true; gesture(current, -100); assert.strictEqual(current._beamThemeScroll.offset, 0);
current.inputLocked = false;
assert(current.changePage(true)); for (let i = 0; i < 150; i++) current.update(16);
assert.strictEqual(current._beamThemeScroll.offset, 1220, 'Voice/page navigation smoothly moves by a viewport');
assert(current.pageToEnd(true)); for (let i = 0; i < 150; i++) current.update(16);
assert.strictEqual(current._beamThemeScroll.offset, 0);
const original = List.prototype.panStop; scroll.disable(current);
assert.strictEqual(current.panStop, original, 'Restore the original native methods');
assert(!Object.prototype.hasOwnProperty.call(current, 'panStop')); assert(!current._beamThemeScroll);
const short = list(2); assert.strictEqual(short._beamThemeScroll.max, 0); assert.strictEqual(short.componentList[0].display.x, 225);
gesture(short, -100); assert.strictEqual(short.componentList[0].display.x, 225); assert(!short._childInputLocked);
const lazy = list(20, true); lazy._loadingElements = []; const ranges = [];
lazy.dynamicElementsPageChange = function() { ranges.push(this._dynamicActiveIndexRange.slice()); };
gesture(lazy, -2300); gesture(lazy, 0, true);
assert(ranges.length); const range = ranges[ranges.length - 1];
assert(range[0] <= 5 && range[1] >= 9, 'Preload every partially visible icon and its neighbors');
assert(lazy.getElementsByPage().length >= 3, 'Expose currently visible buttons to menu actions');
scroll.disable(lazy);
console.log('Native List dynamic drag, inertia, partial icons, bounds, touch locks, navigation, lazy loading and restoration passed');
