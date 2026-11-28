'use strict';

// 5x1: OOBE picks Wi-Fi on the robot's screen instead of scanning a QR code from Jibo Inc's retired app.
// Same networks (SSM /get_scan_results), colours, keyboard layout and keys as Settings › New Wi-Fi
// (@be/be/skills/settings/wifi-keyboard.js), drawn as a DOM layer over the OOBE canvas so this skill
// keeps working on its own.

const FONT = '"Proxima Nova Soft", sans-serif';
const C = { bg: '#07151B', surface: '#0F252D', raised: '#17363F', raisedHi: '#22505B', text: '#FFFFFF', text2: '#C4DCE2',
    text3: '#A2BEC7', accent: '#2FD0C0', accentDark: '#0E6E67', onAccent: '#03211E', disabled: '#7D9AA2' };
const LETTERS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
const SYMBOLS = ['1234567890', '-/:;()&@"', '.,?!\'#+'];
const MORE = ['[]{}#%^*+=', '_\\|~<>$€£', '.,?!\'`•'];
const MIN = 8, MAX = 63;   // WPA passphrase length
const PER_PAGE = 5;

function page(state) { return state.symbols ? (state.more ? MORE : SYMBOLS) : LETTERS; }
function keyText(state, r, c) {
    const ch = page(state)[r][c];
    return state.symbols || !state.shift ? ch : ch.toUpperCase();
}
// Applies one key to the keyboard state and returns the new state (pure; tested off the robot).
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

function scan(callback) {
    const request = new XMLHttpRequest();
    request.open('POST', 'http://127.0.0.1:8668/get_scan_results', true);
    request.timeout = 15000;
    request.onload = () => {
        let networks = [];
        try { networks = JSON.parse(request.responseText).networks || []; } catch (err) { networks = []; }
        callback(networks);
    };
    request.onerror = request.ontimeout = () => callback([]);
    request.send('{}');
}

// The network Jibo is already on (PM leaves him on the owner's Wi-Fi), or '' if none. Never waits more than 5 s.
function current(wifi, callback) {
    let answered = false;
    const answer = (ssid) => { if (!answered) { answered = true; callback(ssid || ''); } };
    setTimeout(() => answer(''), 5000);
    try {
        wifi.getCurrentNetwork((error, stats) => answer(!error && stats && stats.ssid));
    } catch (err) { answer(''); }
}

function el(parent, css, text, onTap) {
    const d = document.createElement('div');
    d.style.cssText = 'position:absolute;box-sizing:border-box;font-family:' + FONT + ';color:' + C.text + ';' +
        'display:flex;align-items:center;justify-content:center;white-space:nowrap;overflow:hidden;' + css;
    if (text !== undefined) d.textContent = text;
    if (onTap) {
        d.addEventListener('click', onTap);
        const base = d.style.background;
        d.addEventListener('mousedown', () => { if (!d.dataset.off) d.style.filter = 'brightness(1.35)'; });
        ['mouseup', 'mouseleave'].forEach((n) => d.addEventListener(n, () => { d.style.filter = ''; d.style.background = base; }));
    }
    parent.appendChild(d);
    return d;
}

function bars(parent, x, y, signal) {
    const level = signal >= -55 ? 3 : signal >= -70 ? 2 : 1;
    for (let i = 0; i < 3; i++) {
        el(parent, 'left:' + (x + i * 14) + 'px;top:' + (y + 24 - (i + 1) * 8) + 'px;width:10px;height:' + ((i + 1) * 8) + 'px;' +
            'border-radius:2px;background:' + (i < level ? C.accent : C.raisedHi) + ';');
    }
}

/**
 * Shows the network list, then the password keyboard for secured networks.
 * callback({ ssid, password }) once the user taps an open network or Join.
 */
function pick(callback) {
    const root = document.createElement('div');
    root.style.cssText = 'position:fixed;left:0;top:0;width:1280px;height:720px;background:' + C.bg + ';z-index:10;overflow:hidden;';
    document.body.appendChild(root);
    const clear = () => { while (root.firstChild) root.removeChild(root.firstChild); };
    const done = (ssid, password) => { document.body.removeChild(root); callback({ ssid: ssid, password: password || '' }); };

    function list(networks, first) {
        clear();
        el(root, 'left:148px;top:40px;width:984px;height:64px;justify-content:flex-start;font-size:40px;font-weight:bold;',
            networks.length ? 'Choose your Wi-Fi network' : 'No Wi-Fi networks found');
        if (!networks.length) {
            // Stock services have no network list (BEnch adds it): typing the name still works.
            el(root, 'left:148px;top:124px;width:984px;height:120px;justify-content:flex-start;white-space:normal;font-size:30px;' +
                'color:' + C.text2 + ';', 'Tap "Type a name" to enter your Wi-Fi network\'s name, or scan again.');
        }
        networks.slice(first, first + PER_PAGE).forEach((net, i) => {
            const y = 124 + i * 92;
            el(root, 'left:148px;top:' + y + 'px;width:984px;height:80px;border-radius:16px;background:' + C.raised + ';', '', () => {
                if (net.secure) password(net, networks, first); else done(net.ssid, '');
            });
            el(root, 'left:180px;top:' + y + 'px;width:760px;height:80px;justify-content:flex-start;font-size:32px;pointer-events:none;',
                net.ssid);
            el(root, 'left:950px;top:' + y + 'px;width:110px;height:80px;font-size:22px;color:' + C.text3 + ';pointer-events:none;',
                net.secure ? 'Secured' : 'Open');
            bars(root, 1072, y + 28, net.signal);
        });
        const bottom = 600;
        el(root, 'left:148px;top:' + bottom + 'px;width:260px;height:80px;border-radius:16px;font-size:28px;font-weight:bold;' +
            'background:' + C.accent + ';color:' + C.onAccent + ';', 'Scan again', () => searching());
        el(root, 'left:428px;top:' + bottom + 'px;width:280px;height:80px;border-radius:16px;font-size:28px;font-weight:bold;' +
            'background:' + C.raised + ';', 'Type a name', () => typeName(networks, first));
        if (first > 0) {
            el(root, 'left:744px;top:' + bottom + 'px;width:180px;height:80px;border-radius:16px;font-size:28px;background:' + C.raised + ';',
                'Back', () => list(networks, first - PER_PAGE));
        }
        if (first + PER_PAGE < networks.length) {
            el(root, 'left:952px;top:' + bottom + 'px;width:180px;height:80px;border-radius:16px;font-size:28px;background:' + C.raised + ';',
                'More', () => list(networks, first + PER_PAGE));
        }
    }

    function searching() {
        clear();
        el(root, 'left:0;top:300px;width:1280px;height:80px;font-size:40px;', 'Looking for Wi-Fi networks…');
        scan((networks) => list(networks, 0));
    }

    function password(net, networks, first) {
        keyboard({ title: 'Password for ' + net.ssid, placeholder: 'Password', min: MIN, go: 'Join',
            back: () => list(networks, first), done: (text) => done(net.ssid, text) });
    }

    // A network that isn't listed: type its name, then its password (or choose No password).
    function typeName(networks, first) {
        keyboard({ title: 'Wi-Fi network name', placeholder: 'Network name', min: 1, go: 'Next', back: () => list(networks, first),
            done: (ssid) => keyboard({ title: 'Password for ' + ssid, placeholder: 'Password', min: MIN, go: 'Join',
                back: () => typeName(networks, first), done: (text) => done(ssid, text),
                extra: { label: 'No password', tap: () => done(ssid, '') } }) });
    }

    function keyboard(opts) {
        let state = { text: '', shift: false, symbols: false, more: false };
        const KEYS = { y: [184, 264, 344], h: 72, w: 88, gap: 8, start: [164, 212, 308] };
        const LEFT = 148, W = 984, SPECIAL_Y = 424, SPECIAL_H = 88;
        const ready = () => state.text.length >= opts.min;
        const titleW = W - 176 - (opts.extra ? 236 : 0);
        clear();
        el(root, 'left:' + LEFT + 'px;top:16px;width:156px;height:72px;border-radius:16px;font-size:24px;font-weight:bold;' +
            'background:' + C.raised + ';', 'Back', opts.back);
        el(root, 'left:' + (LEFT + 176) + 'px;top:16px;width:' + titleW + 'px;height:72px;justify-content:flex-start;' +
            'font-size:32px;font-weight:bold;', opts.title);
        if (opts.extra) {
            el(root, 'left:' + (LEFT + W - 220) + 'px;top:16px;width:220px;height:72px;border-radius:16px;font-size:24px;' +
                'font-weight:bold;background:' + C.raised + ';', opts.extra.label, opts.extra.tap);
        }
        const field = el(root, 'left:' + LEFT + 'px;top:100px;width:' + (W - 80) + 'px;height:72px;border-radius:12px;' +
            'justify-content:flex-start;padding-left:24px;font-size:32px;background:' + C.surface + ';');
        el(root, 'left:' + (LEFT + W - 72) + 'px;top:100px;width:72px;height:72px;border-radius:12px;font-size:32px;' +
            'background:' + C.raised + ';', '×', () => update('clear'));
        const keys = [];
        LETTERS.forEach((letters, r) => letters.split('').forEach((letter, c) => {
            keys.push({ r: r, c: c, el: el(root, 'left:' + (KEYS.start[r] + c * (KEYS.w + KEYS.gap)) + 'px;top:' + KEYS.y[r] + 'px;' +
                'width:' + KEYS.w + 'px;height:' + KEYS.h + 'px;border-radius:12px;font-size:32px;background:' + C.raised + ';', letter,
                () => update(keyText(state, r, c))) });
        }));
        const shift = el(root, 'left:' + KEYS.start[0] + 'px;top:' + KEYS.y[2] + 'px;width:' + (KEYS.start[2] - KEYS.start[0] - KEYS.gap) +
            'px;height:' + KEYS.h + 'px;border-radius:12px;font-size:24px;', 'Shift', () => update('shift'));   // the robot's fonts lack ⇧ and ⌫
        const rowEnd = KEYS.start[2] + 7 * (KEYS.w + KEYS.gap);
        el(root, 'left:' + rowEnd + 'px;top:' + KEYS.y[2] + 'px;width:' + (LEFT + W - rowEnd - 16) + 'px;height:' + KEYS.h + 'px;' +
            'border-radius:12px;font-size:24px;background:' + C.surface + ';', 'Delete', () => update('backspace'));
        const symbols = el(root, 'left:' + LEFT + 'px;top:' + SPECIAL_Y + 'px;width:112px;height:' + SPECIAL_H + 'px;border-radius:12px;' +
            'font-size:24px;background:' + C.surface + ';', '123', () => update('symbols'));
        el(root, 'left:' + (LEFT + 124) + 'px;top:' + SPECIAL_Y + 'px;width:564px;height:' + SPECIAL_H + 'px;border-radius:12px;' +
            'font-size:24px;background:' + C.surface + ';', 'Space', () => update('space'));
        const join = el(root, 'left:' + (LEFT + 700) + 'px;top:' + SPECIAL_Y + 'px;width:' + (W - 700) + 'px;height:' + SPECIAL_H + 'px;' +
            'border-radius:16px;font-size:24px;font-weight:bold;', opts.go, () => { if (ready()) opts.done(state.text); });

        function refresh() {
            keys.forEach((k) => { k.el.textContent = keyText(state, k.r, k.c); });
            shift.textContent = state.symbols ? (state.more ? '123' : '#+=') : 'Shift';
            shift.style.background = state.shift && !state.symbols ? C.raisedHi : C.surface;
            symbols.textContent = state.symbols ? 'ABC' : '123';
            field.textContent = state.text || opts.placeholder;
            field.style.color = state.text ? C.text : C.text3;
            join.style.background = ready() ? C.accent : C.accentDark;
            join.style.color = ready() ? C.onAccent : C.disabled;
            if (ready()) delete join.dataset.off; else join.dataset.off = '1';
        }
        function update(key) { state = press(state, key); refresh(); }
        refresh();
    }

    searching();
}

module.exports = { pick: pick, current: current, press: press, keyText: keyText, MIN: MIN, MAX: MAX };
