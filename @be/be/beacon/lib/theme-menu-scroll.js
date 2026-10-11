'use strict';

// Use the SDK's existing pan registration and frame updates. Its bound
// onPanEvent calls these instance methods, including on already-open menus.
const WIDTH = 1280;
const MARGIN = 30;
function clamp(value, max) { return Math.max(0, Math.min(max, value)); }
function visible(list, state) {
    const first = Math.max(0, Math.floor((state.offset - state.start - list.elementDimensions.width) / list.elementSpacing) + 1);
    const end = Math.min(list.componentList.length, Math.ceil((state.offset + WIDTH - state.start) / list.elementSpacing));
    return [first, Math.max(first, end)];
}
function position(list) {
    const s = list._beamThemeScroll; const range = visible(list, s);
    const index = Math.floor(range[0] / list.elementsPerPage);
    list._pageIndex = index; list._stateChanged = true;
    if (list.dynamicElements && list.dynamicElementsPageChange) {
        const buffer = Math.max(1, list.dynamicLoadBuffer || 1) * list.elementsPerPage;
        const next = [Math.max(0, range[0] - buffer), Math.min(list.componentList.length, range[1] + buffer)];
        const old = list._dynamicActiveIndexRange;
        if (!old || old[0] !== next[0] || old[1] !== next[1]) {
            list._dynamicActiveIndexRange = next;
            if (list.container && list._loadingElements) { list.dynamicElementsPageChange(index); }
        }
    }
    list.componentList.forEach((button, i) => {
        const x = s.start + i * list.elementSpacing - s.offset; const y = list.listStartPosition.y;
        button.setTargetPosition(x, y, true);
        const member = button.getSubcomponent('ListMember');
        if (member) {
            member.targetPosition.x = x; member.targetPosition.y = y; member.targetOffset = 0;
            if (member.velocity) { member.velocity.x = 0; }
        }
        // Native virtual lists only lock their current preload range. Keep newly
        // revealed buttons consistent while that range moves during a drag.
        if (button.lockInput && typeof list._childInputLocked === 'boolean') { button.lockInput(list._childInputLocked); }
    });
}
function stop(list) {
    const s = list._beamThemeScroll;
    s.velocity = 0; s.dragging = false; s.target = null; list._currentMovement = 0; list._panTotalDelta = 0;
    if (list.lockChildInput) { list.lockChildInput(!!list.inputLocked); }
}
function configure(list) {
    const s = list._beamThemeScroll;
    const width = list.componentList.length * list.elementDimensions.width + Math.max(0, list.componentList.length - 1) * list.elementBuffer;
    s.start = width <= WIDTH - MARGIN * 2 ? (WIDTH - width) / 2 : MARGIN;
    s.max = Math.max(0, width + MARGIN * 2 - WIDTH);
    s.offset = clamp(s.offset, s.max);
    list._elementSpacing = list.elementDimensions.width + list.elementBuffer;
    list._listStartPosition.x = s.start;
}
function enable(list) {
    if (list._beamThemeScroll) { return; }
    const names = ['calculateReferenceValues', 'pan', 'panStop', 'update', 'changePage', 'pageToEnd', 'getElementsByPage', 'getStartIndexByPage', 'setTargetsByPage'];
    const saved = {}; names.forEach(name => { saved[name] = { own: Object.getOwnPropertyDescriptor(list, name), method: list[name] }; });
    const initial = list.getStartIndexByPage(list.pageIndex) * (list.elementDimensions.width + list.elementBuffer);
    const s = list._beamThemeScroll = { saved: saved, offset: initial, max: 0, start: MARGIN, velocity: 0, dragging: false, target: null, time: 0 };
    list.calculateReferenceValues = function() { saved.calculateReferenceValues.method.call(this); configure(this); };
    list.pan = function(inputX, delta) {
        if (!isFinite(delta) || this.noPan || this.inputLocked || !s.max) { return; }
        const now = Date.now(); const dt = Math.max(8, Math.min(50, now - s.time || 16));
        if (!s.dragging) { s.velocity = 0; s.target = null; s.dragging = true; this.lockChildInput(true); }
        const old = s.offset; s.offset = clamp(old - delta, s.max);
        s.velocity = (s.offset - old) / dt; s.time = now; this._currentMovement = 1;
        position(this);
    };
    list.panStop = function() {
        s.dragging = false; this._currentMovement = 0; this._panTotalDelta = 0;
        if (Date.now() - s.time > 100 || Math.abs(s.velocity) < 0.02) { stop(this); }
    };
    list.update = function(elapsed) {
        if (s.dragging || (!s.velocity && s.target === null)) { return; }
        if (this.inputLocked) { stop(this); return; }
        const dt = Math.max(1, Math.min(50, typeof elapsed === 'number' && isFinite(elapsed) ? elapsed : 16));
        if (s.target !== null) {
            s.offset += (s.target - s.offset) * (1 - Math.exp(-dt / 90));
            if (Math.abs(s.target - s.offset) < 0.5) { s.offset = s.target; stop(this); }
        } else {
            const next = clamp(s.offset + s.velocity * dt, s.max);
            s.velocity *= Math.exp(-dt / 180);
            if (next === s.offset || Math.abs(s.velocity) < 0.02) { stop(this); }
            s.offset = next;
        }
        position(this);
    };
    function navigate(target) {
        if (list.inputLocked || list.noPan) { return false; }
        const next = clamp(target, s.max); if (next === s.offset) { return false; }
        s.dragging = false; s.velocity = 0; s.target = next; list.lockChildInput(true); return true;
    }
    list.changePage = function(forward) { return navigate(s.offset + (forward === false ? -1 : 1) * (WIDTH - MARGIN * 2)); };
    list.pageToEnd = function(front) { return navigate(front ? 0 : s.max); };
    list.getElementsByPage = function() { const r = visible(this, s); return this.componentList.slice(r[0], r[1]); };
    list.getStartIndexByPage = function(index) { return index === this.pageIndex ? visible(this, s)[0] : saved.getStartIndexByPage.method.call(this, index); };
    list.setTargetsByPage = function() { configure(this); stop(this); position(this); };
}
function disable(list) {
    const s = list._beamThemeScroll; if (!s) { return; }
    stop(list);
    Object.keys(s.saved).forEach(name => {
        if (s.saved[name].own) { Object.defineProperty(list, name, s.saved[name].own); }
        else { delete list[name]; }
    });
    delete list._beamThemeScroll;
}
function refresh(list) { configure(list); position(list); stop(list); position(list); }
module.exports = { enable: enable, disable: disable, refresh: refresh };
