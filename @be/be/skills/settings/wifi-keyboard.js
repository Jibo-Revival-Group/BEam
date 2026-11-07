'use strict';

// Settings › New Wi-Fi password keyboard: JiboTube's search keyboard (same keys, sizes, colours
// and drawing), moved left by JiboTube's 100 px side rail, plus Shift and a second symbol page
// because passwords are case-sensitive and use more symbols than searches.
const draw = require('./jibotube-draw');

const FONT = 'Proxima Nova Soft';
const COLOR = { bg0: 0x07151B, surface: 0x0F252D, raised: 0x17363F, raisedHi: 0x22505B, text: 0xFFFFFF, text2: 0xC4DCE2,
    text3: 0xA2BEC7, accent: 0x2FD0C0, accentDark: 0x0E6E67, accentHi: 0x6FF0E2, onAccent: 0x03211E, disabled: 0x7D9AA2 };
const TYPE = { title: 32, body: 24, meta: 22 };
const SHIFT = -100;
const LEFT = 248 + SHIFT, W = 984;
const LETTERS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
const SYMBOLS = ['1234567890', '-/:;()&@"', '.,?!\'#+'];
const MORE = ['[]{}#%^*+=', '_\\|~<>$€£', '.,?!\'`•'];
const KEYS = { y: [184, 264, 344], h: 72, w: 88, gap: 8, start: [264 + SHIFT, 312 + SHIFT, 408 + SHIFT] };
const SPECIAL_Y = 424, SPECIAL_H = 88;
const BACK = { x: LEFT, y: 16, w: 156, h: 72 };
const FIELD = { x: LEFT, y: 100, w: W, h: 72 };
const MIN = 8, MAX = 63; // WPA passphrase length

function hex(value) { return '#' + ('000000' + value.toString(16)).slice(-6); }

// What the keys type and show, from the keyboard state.
function page(state) { return state.symbols ? (state.more ? MORE : SYMBOLS) : LETTERS; }
function keyText(state, r, c) {
    const ch = page(state)[r][c];
    return state.symbols || !state.shift ? ch : ch.toUpperCase();
}

// Applies one key to the state; returns the new state (pure, so it can be tested off the robot).
function press(state, key) {
    const s = { text: state.text, shift: state.shift, symbols: state.symbols, more: state.more };
    if (key === 'shift') { if (s.symbols) s.more = !s.more; else s.shift = !s.shift; }
    else if (key === 'symbols') { s.symbols = !s.symbols; s.more = false; }
    else if (key === 'backspace') s.text = s.text.slice(0, -1);
    else if (key === 'clear') s.text = '';
    else if (key === 'space') { if (s.text.length < MAX) s.text += ' '; }
    else if (key && key.length && s.text.length < MAX) { s.text += key; if (!s.symbols) s.shift = false; }
    return s;
}

/**
 * Opens the keyboard. options: { views, PIXI, ssid, onJoin(password), onBack() }.
 * Returns the native View; its BACK/swipe handling stays with the caller.
 */
function show(options) {
    const views = options.views, PIXI = options.PIXI;
    let state = { text: '', shift: false, symbols: false, more: false };
    const components = [], buttons = {}, shapes = {};
    let pressed = '', view = null;

    const label = (id, x, y, width, text, size, color, align, bold) => {
        const anchor = align === 'left' ? 0 : 0.5;
        components.push({ type: 'Label', id: id, text: text || '', position: { x: x, y: y }, targetAnchor: { x: anchor, y: 0.5 },
            bounds: { width: width, height: Math.ceil(size * 1.55) },
            style: { fontSize: size, fontFamily: FONT, fill: hex(color), align: align || 'center', fontWeight: bold ? 'bold' : 'normal' } });
    };
    const button = (id, x, y, w, h, look, action) => {
        buttons[id] = { x: x, y: y, w: w, h: h, look: look, action: action };
        components.push({ type: 'Button', id: id, assets: [], position: { x: x, y: y }, hitArea: { x: 0, y: 0, width: w, height: h },
            action: { type: views.ActionData.CALLBACK, data: { callback: () => tap(id) } } });
    };
    const ready = () => state.text.length >= MIN;

    button('back', BACK.x, BACK.y, BACK.w, BACK.h, () => ({ style: 'secondary', icon: 'back' }), () => options.onBack());
    label('backText', BACK.x + 92, BACK.y + BACK.h / 2, 80, 'Back', TYPE.body, COLOR.text, 'center', true);
    label('title', BACK.x + BACK.w + 20, 52, W - BACK.w - 20, 'Password for ' + options.ssid, TYPE.title, COLOR.text, 'left', true);
    button('field', FIELD.x, FIELD.y, FIELD.w - 80, FIELD.h, () => ({ style: 'keyAlt' }), () => {});
    label('password', FIELD.x + 24, FIELD.y + FIELD.h / 2, FIELD.w - 120, 'Password', TYPE.title, COLOR.text3, 'left');
    button('clear', FIELD.x + FIELD.w - 72, FIELD.y, 72, 72, () => ({ style: 'key', icon: 'close' }), () => update('clear'));
    LETTERS.forEach((letters, r) => letters.split('').forEach((letter, c) => {
        const x = KEYS.start[r] + c * (KEYS.w + KEYS.gap), y = KEYS.y[r], id = 'key' + r + '_' + c;
        button(id, x, y, KEYS.w, KEYS.h, () => ({ style: 'key' }), () => update(keyText(state, r, c)));
        label(id + 'Text', x + KEYS.w / 2, y + KEYS.h / 2, KEYS.w - 8, letter, TYPE.title, COLOR.text);
    }));
    // Shift and Backspace sit either side of the last letter row, as on a phone.
    button('keyShift', KEYS.start[0], KEYS.y[2], KEYS.start[2] - KEYS.start[0] - KEYS.gap, KEYS.h,
        () => ({ style: state.shift && !state.symbols ? 'key' : 'keyAlt', icon: state.symbols ? '' : 'up' }), () => update('shift'));
    label('keyShiftText', (KEYS.start[0] + KEYS.start[2] - KEYS.gap) / 2, KEYS.y[2] + KEYS.h / 2, 120, '', TYPE.body, COLOR.text);
    const rowEnd = KEYS.start[2] + 7 * (KEYS.w + KEYS.gap);
    button('keyBack', rowEnd, KEYS.y[2], LEFT + W - rowEnd - 16, KEYS.h, () => ({ style: 'keyAlt', icon: 'backspace' }), () => update('backspace'));
    button('keySymbols', LEFT, SPECIAL_Y, 112, SPECIAL_H, () => ({ style: 'keyAlt' }), () => update('symbols'));
    label('keySymbolsText', LEFT + 56, SPECIAL_Y + SPECIAL_H / 2, 96, '123', TYPE.body, COLOR.text);
    button('keySpace', LEFT + 124, SPECIAL_Y, 564, SPECIAL_H, () => ({ style: 'keyAlt' }), () => update('space'));
    label('keySpaceText', LEFT + 124 + 282, SPECIAL_Y + SPECIAL_H / 2, 540, 'Space', TYPE.body, COLOR.text);
    button('keyGo', LEFT + 700, SPECIAL_Y, W - 700, SPECIAL_H, () => ({ style: 'primary', icon: 'check', iconLeft: true, disabled: !ready() }),
        () => { if (ready()) options.onJoin(state.text); });
    label('keyGoText', LEFT + 700 + (W - 700) / 2 + 18, SPECIAL_Y + SPECIAL_H / 2, W - 764, 'Join', TYPE.body, COLOR.onAccent, 'center', true);

    function paint(id) {
        const b = buttons[id], g = shapes[id];
        if (!b || !g) return;
        const look = b.look(), w = b.w, h = b.h, down = pressed === id && !look.disabled;
        g.clear();
        if (look.style === 'key' || look.style === 'keyAlt') {
            draw.roundedRect(g, 0, 0, w, h, 12, down ? COLOR.raisedHi : look.style === 'key' ? COLOR.raised : COLOR.surface, 1);
            if (look.icon) draw.icon(g, look.icon, w / 2 - 17, h / 2 - 17, 34, COLOR.text);
        } else if (look.style === 'primary') {
            draw.roundedRect(g, 0, 0, w, h, 16, look.disabled ? COLOR.accentDark : down ? COLOR.accentHi : COLOR.accent, 1);
            draw.icon(g, look.icon, look.iconLeft ? 22 : w / 2 - 17, h / 2 - 17, 34, look.disabled ? COLOR.disabled : COLOR.onAccent);
        } else if (look.style === 'secondary') {
            draw.roundedRect(g, 0, 0, w, h, 16, down ? COLOR.raisedHi : COLOR.raised, 1);
            draw.icon(g, look.icon, 20, h / 2 - 17, 34, COLOR.text);
        }
    }
    function setText(id, text, color) {
        const c = view && view.getComponentById(id);
        if (!c) return;
        if (c.text !== text) c.text = text;
        if (color !== undefined && c.style) c.style.fill = hex(color);
    }
    function refresh() {
        LETTERS.forEach((letters, r) => letters.split('').forEach((l, c) => setText('key' + r + '_' + c + 'Text', keyText(state, r, c))));
        setText('keyShiftText', state.symbols ? (state.more ? '123' : '#+=') : '');
        setText('keySymbolsText', state.symbols ? 'ABC' : '123');
        setText('password', state.text || 'Password', state.text ? COLOR.text : COLOR.text3);
        setText('keyGoText', 'Join', ready() ? COLOR.onAccent : COLOR.text);
        Object.keys(buttons).forEach(paint);
    }
    function update(key) { state = press(state, key); refresh(); }
    function tap(id) { pressed = ''; if (buttons[id]) buttons[id].action(); }

    view = views.createView('View', { viewConfig: { type: 'View', id: 'wifiPassword' }, componentConfigs: components }, true);
    view.on(views.LOADED, () => {
        const bg = new PIXI.Graphics();
        bg.beginFill(COLOR.bg0, 1).drawRect(0, 0, 1280, 720).endFill();
        view.stage.addChildAt(bg, 0);
        Object.keys(buttons).forEach((id) => {
            const component = view.getComponentById(id);
            if (!component || !component.display) return;
            const g = new PIXI.Graphics();
            component.display.addChildAt(g, 0);
            shapes[id] = g;
            if (typeof component.display.on === 'function') {
                ['mousedown', 'touchstart'].forEach(n => component.display.on(n, () => { pressed = id; paint(id); }));
                ['mouseup', 'mouseupoutside', 'mouseout', 'touchend', 'touchendoutside'].forEach(n => component.display.on(n, () => {
                    if (pressed === id) { pressed = ''; paint(id); }
                }));
            }
        });
        refresh();
    });
    return view;
}

module.exports = { show: show, press: press, keyText: keyText, MIN: MIN, MAX: MAX };
