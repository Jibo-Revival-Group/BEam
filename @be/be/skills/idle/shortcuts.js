'use strict';

// Shortcut shade: drag down from the top third of the eye screen and a card follows your
// finger, like Android's notification shade, filling at most the top half. Behind it the
// eye stays, blurred and dimmed. The card has a status line (volume, clock, IP, battery)
// and Wi-Fi, Settings and a favorite skill chosen in BEacon. Drag it back up, tap below
// it, or leave it 20 s untouched to put it away. Drawn in PIXI on the eye view itself.
const path = require('path');
const jibo = require('jibo');
const be = require('@be/be-framework');

const SKILLS = path.join(__dirname, '..');
const settingsIcon = name => path.join(SKILLS, 'settings/assets', name);
const W = 1280, H = 720;
const HEIGHT = 360;            // open shade: the top half of the screen
const GRAB = H / 3;            // drags must start in the top third
const CARD = { x: 40, w: 1200, top: -40, radius: 40 };
const STATUS_Y = 52, BUTTON_Y = 175, BUTTON_R = 52, ICON = 84, SLIDER = { x: 190, w: 900, y: 175 };
const GRAY = 0x3A3A4A, CYAN = 0x25F2FB;
const IDLE_CLOSE = 20000, VOLUME_IDLE = 4000, DRAG_SLOP = 12;
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function ordinal(n) { const t = n % 100; return n + (t >= 11 && t <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] || 'th'); }
function clockText(t) { return (t.hour % 12 || 12) + ':' + ('0' + t.minute).slice(-2) + (t.hour < 12 ? 'AM' : 'PM') + '  ' + MONTHS[t.monthNum] + ' ' + ordinal(t.date); }
function volumeAt(x, min, max) { return min + Math.round(Math.max(0, Math.min(1, (x - SLIDER.x) / SLIDER.w)) * (max - min)); }
function short(text, max) { return text.length > max ? text.slice(0, max - 1) + '…' : text; }
// Where a released drag settles: open when pulled past a third (or flicked), else closed.
function settle(offset, velocity) { return velocity > 0.6 ? HEIGHT : velocity < -0.6 ? 0 : offset > HEIGHT / 3 ? HEIGHT : 0; }

class Shortcuts {
    // launch(skill, options) leaves idle; canOpen() says whether the robot is awake and not in privacy mode.
    constructor(launch, log, canOpen) { this.launch = launch; this.log = log; this.canOpen = canOpen; this.offset = 0; this.root = null; this.mode = 'main'; }
    get isOpen() { return this.offset > 0; }
    // A tap the shade handled (or that landed while it was out) must not also open the main menu.
    consumesTap() { return this.offset > 0 || !!this.drag || Date.now() - (this.lastTouch || 0) < 400; }

    attach(view) {
        if (!view || !view.stage) return;
        if (this.view === view && this.root && this.root.parent === view.stage) return;
        this.detach();
        const PIXI = global.PIXI;
        this.view = view;
        this.root = new PIXI.Container();
        this.catcher = new PIXI.Container(); // full-screen input layer; draws nothing
        this.catcher.interactive = true; this.catcher.hitArea = new PIXI.Rectangle(0, 0, W, H);
        ['mousedown', 'touchstart'].forEach(e => this.catcher.on(e, ev => this.down(ev.data.global)));
        ['mousemove', 'touchmove'].forEach(e => this.catcher.on(e, ev => this.move(ev.data.global)));
        ['mouseup', 'mouseupoutside', 'touchend', 'touchendoutside'].forEach(e => this.catcher.on(e, ev => this.up(ev.data.global)));
        this.dim = new PIXI.Graphics(); this.dim.beginFill(0x000000); this.dim.drawRect(0, 0, W, H); this.dim.endFill();
        this.card = new PIXI.Container();
        this.root.addChild(this.dim, this.card, this.catcher);
        view.stage.addChild(this.root);
        this.blur = this.blur || new PIXI.filters.BlurFilter(0);
        this.place(0);
    }
    detach() {
        this.stopAnimation(); clearInterval(this.timer); this.timer = null;
        if (this.root) { if (this.root.parent) this.root.parent.removeChild(this.root); this.root.destroy({ children: true }); }
        this.root = null; this.view = null; this.drag = null; this.clock = null; this.offset = 0; this.unblur();
    }

    // Build the card's contents each time it starts to open (favorite, Wi-Fi icon).
    build() {
        const PIXI = global.PIXI, card = this.card;
        card.removeChildren().forEach(c => c.destroy({ children: true }));
        let favorite = null;
        try { favorite = require('../../beacon/lib/menu-layout').favorite(); }
        catch (error) { this.log.warn('Shortcut favorite unavailable', error); }
        this.mode = 'main';
        const bg = new PIXI.Graphics(), h = HEIGHT - 16 - CARD.top;
        bg.beginFill(0x1B1A26, 0.94); bg.drawRoundedRect(CARD.x, CARD.top, CARD.w, h, CARD.radius); bg.endFill();
        bg.lineStyle(2, 0x3A3950, 1); bg.drawRoundedRect(CARD.x, CARD.top, CARD.w, h, CARD.radius); bg.lineStyle(0);
        bg.beginFill(0x2C2B3A); bg.drawRect(CARD.x + 40, 100, CARD.w - 80, 2); bg.endFill(); // divider under the status line
        bg.beginFill(0x6B6B80); bg.drawRoundedRect(W / 2 - 40, HEIGHT - 42, 80, 8, 4); bg.endFill(); // grab handle
        card.addChild(bg);
        const text = (parent, size, color, anchorX, x, y, light) => {
            const t = new PIXI.Text('', { fontFamily: light ? 'Proxima Nova Light' : 'Proxima Nova', fontSize: size, fill: color || '#FFFFFF' });
            t.anchor.set(anchorX, 0.5); t.x = x; t.y = y; parent.addChild(t); return t;
        };
        const sprite = (parent, src, size, x, y, anchorX) => {
            const s = PIXI.Sprite.fromImage(src); s.anchor.set(anchorX === undefined ? 0.5 : anchorX, 0.5); s.x = x; s.y = y;
            const fit = () => s.scale.set(size / Math.max(s.texture.width, s.texture.height));
            if (s.texture.baseTexture.hasLoaded) fit(); else s.texture.baseTexture.once('loaded', fit);
            parent.addChild(s); return s;
        };
        // Status line: volume (tap for the slider) on the left, clock in the middle, IP and battery on the right.
        sprite(card, settingsIcon('menu/icons/volume.png'), 46, 92, STATUS_Y, 0);
        this.volumeText = text(card, 34, null, 0, 150, STATUS_Y);
        this.clock = text(card, 36, null, 0.5, W / 2, STATUS_Y);
        this.batteryText = text(card, 34, null, 1, 1188, STATUS_Y);
        this.batteryIcon = sprite(card, settingsIcon('menu/icons/battery.png'), 46, 1110, STATUS_Y, 1);
        this.ip = text(card, 30, '#9A9AB0', 1, 1048, STATUS_Y, true);
        // Wi-Fi, Settings and the favorite: small round buttons.
        const buttons = this.buttons = new PIXI.Container(); card.addChild(buttons);
        const items = [
            { icon: settingsIcon('menu/icons/wifi.png'), color: GRAY, go: () => this.go('@be/settings', { nlu: { intent: 'wifiStatus', entities: {} } }) },
            { icon: path.join(SKILLS, 'main-menu/resources/icons/settings.png'), color: GRAY, label: 'Settings', go: () => this.go('@be/settings', { nlu: { intent: 'menu', entities: {} } }) }
        ];
        if (favorite) items.push({ icon: favorite.iconSrc, color: favorite.colors[0], label: short(favorite.label, 12), go: () => this.go('@be/main-menu', { intent: 'shortcut', destination: favorite.id }) });
        const xs = items.length === 3 ? [440, 640, 840] : [540, 740];
        this.hits = items.map((item, i) => {
            const x = xs[i], g = new PIXI.Graphics();
            g.beginFill(item.color); g.drawCircle(x, BUTTON_Y, BUTTON_R); g.endFill();
            g.beginFill(0xFFFFFF, 0.08); g.drawCircle(x, BUTTON_Y - 6, BUTTON_R - 6); g.endFill();
            buttons.addChild(g);
            sprite(buttons, item.icon, ICON, x, BUTTON_Y);
            item.caption = text(buttons, 28, '#D5D5E0', 0.5, x, BUTTON_Y + 88, true); item.caption.text = item.label || '';
            return { x: x, r: BUTTON_R + 24, go: item.go };
        });
        this.wifiItem = items[0];
        // Volume slider, shown in place of the buttons after tapping the volume.
        const box = this.sliderBox = new PIXI.Container(); box.visible = false; card.addChild(box);
        this.slider = new PIXI.Graphics(); box.addChild(this.slider);
        this.knobText = text(box, 30, '#1B1A26', 0.5, 0, SLIDER.y);
        this.render();
    }
    drawSlider(volume) {
        const v = jibo.volume, k = (volume - v.MIN_VOLUME) / (v.MAX_VOLUME - v.MIN_VOLUME), x = SLIDER.x + k * SLIDER.w, g = this.slider;
        g.clear();
        g.beginFill(GRAY); g.drawRoundedRect(SLIDER.x, SLIDER.y - 8, SLIDER.w, 16, 8); g.endFill();
        g.beginFill(CYAN); g.drawRoundedRect(SLIDER.x, SLIDER.y - 8, Math.max(16, k * SLIDER.w), 16, 8); g.endFill();
        g.beginFill(0xFFFFFF); g.drawCircle(x, SLIDER.y, 34); g.endFill();
        this.knobText.x = x; this.knobText.text = String(Math.round(volume));
    }
    setMode(mode) {
        this.mode = mode; this.lastTouch = Date.now();
        this.buttons.visible = mode === 'main'; this.sliderBox.visible = mode === 'volume';
        this.render();
    }

    // Input. Everything runs through the one full-screen catcher so drags, taps on the card's
    // buttons and taps below the card are told apart by position and movement.
    down(p) {
        if (this.animating && this.target === 0) return;
        const open = this.offset >= HEIGHT;
        if (this.offset === 0 && (p.y > GRAB || !this.canOpen())) return;
        this.raise();
        this.drag = { startY: p.y, startOffset: this.offset, moved: false, lastY: p.y, lastT: Date.now(), v: 0 };
        if (this.offset === 0) {
            jibo.wifi.getCurrentNetwork((e, n) => { this.network = e ? null : n || null; this.render(); });
        }
        if (open && this.mode === 'volume' && Math.abs(p.y - SLIDER.y) < 70 && p.x > SLIDER.x - 60 && p.x < SLIDER.x + SLIDER.w + 60) {
            this.drag.slider = true; this.slide(p.x);
        }
        this.lastTouch = Date.now();
    }
    move(p) {
        const d = this.drag;
        if (!d) return;
        this.lastTouch = Date.now();
        if (d.slider) { this.slide(p.x); return; }
        if (!d.moved && Math.abs(p.y - d.startY) < DRAG_SLOP) return;
        if (!d.moved) { d.moved = true; this.stopAnimation(); if (this.offset === 0) this.build(); }
        const now = Date.now();
        d.v = (p.y - d.lastY) / Math.max(1, now - d.lastT); d.lastY = p.y; d.lastT = now;
        this.place(Math.max(0, Math.min(HEIGHT, d.startOffset + p.y - d.startY)));
    }
    up(p) {
        const d = this.drag;
        if (!d) return;
        this.drag = null; this.lastTouch = Date.now();
        if (d.slider) {
            try { jibo.volume.changeVolume('volumeToValue', this.dragVolume); } catch (error) { this.log.warn('Volume change failed', error); }
            return;
        }
        if (d.moved) { this.animateTo(settle(this.offset, d.v)); return; }
        if (this.offset < HEIGHT) return; // a tap on the closed eye is the main menu's
        if (p.y > HEIGHT) { this.animateTo(0); return; } // tap below the card
        if (this.mode === 'volume') { this.setMode('main'); return; }
        if (p.y < 100 && p.x < 330) { this.setMode('volume'); return; }
        const hit = Math.abs(p.y - BUTTON_Y) < BUTTON_R + 40 && this.hits.filter(h => Math.abs(p.x - h.x) < h.r)[0];
        if (hit) hit.go();
    }
    slide(x) {
        const v = jibo.volume;
        this.dragVolume = volumeAt(x, v.MIN_VOLUME, v.MAX_VOLUME); this.drawSlider(this.dragVolume);
    }
    go(skill, options) { this.animateTo(0, () => this.launch(skill, options)); }

    // The card slides down from above; blur and dimming follow how far it is out.
    place(offset) {
        this.offset = offset;
        if (!this.root) return;
        const k = offset / HEIGHT, eye = jibo.face.eye;
        this.card.y = offset - HEIGHT; this.card.visible = offset > 0;
        this.dim.alpha = 0.45 * k; this.dim.visible = offset > 0;
        if (eye && offset > 0) { this.blur.blur = 12 * k; if (!eye.filters || eye.filters.indexOf(this.blur) < 0) eye.filters = [this.blur]; }
        else this.unblur();
        if (offset > 0 && !this.timer) this.timer = setInterval(() => this.tick(), 500);
        if (offset === 0 && this.timer) { clearInterval(this.timer); this.timer = null; }
    }
    unblur() { const eye = jibo.face.eye; if (eye && eye.filters && this.blur && eye.filters.indexOf(this.blur) >= 0) eye.filters = null; }
    // The eye view re-adds the eye on top when it resumes; keep the shade above it.
    raise() { const parent = this.root && this.root.parent; if (parent && parent.children[parent.children.length - 1] !== this.root) parent.addChild(this.root); }
    animateTo(target, then) {
        this.stopAnimation();
        if (target > 0 && this.offset === 0) this.build();
        const from = this.offset, start = Date.now(), duration = 260;
        this.animating = true; this.target = target;
        const step = () => {
            const t = Math.min(1, (Date.now() - start) / duration);
            this.place(from + (target - from) * (1 - Math.pow(1 - t, 3)));
            if (t >= 1) { this.stopAnimation(); if (then) then(); }
        };
        this.ticker = step; global.PIXI.ticker.shared.add(step); step();
    }
    stopAnimation() { if (this.ticker) global.PIXI.ticker.shared.remove(this.ticker); this.ticker = null; this.animating = false; }
    close() { if (this.offset > 0) this.animateTo(0); }

    tick() {
        if (!this.root || this.offset === 0 || this.drag) return;
        this.raise();
        const now = Date.now();
        if (this.mode === 'volume' && now - this.lastTouch > VOLUME_IDLE) this.setMode('main');
        else if (this.offset >= HEIGHT && now - (this.lastTouch || 0) > IDLE_CLOSE) this.animateTo(0);
        else this.render();
    }
    render() {
        if (!this.clock) return;
        const v = jibo.volume, volume = Math.round(v.currentVolume);
        this.volumeText.text = Math.round(volume / v.MAX_VOLUME * 100) + '%';
        this.clock.text = clockText(new be.utils.DateTime(null, null, be.utils.Location.jiboHome.timezone).getLocalTime());
        const battery = Math.round(jibo.system.getBatteryLevel());
        this.batteryText.text = isFinite(battery) ? battery + '%' : '';
        this.batteryIcon.tint = jibo.system.batteryCharging ? 0x7CF29A : 0xFFFFFF; // green while charging
        this.batteryIcon.x = this.batteryText.x - this.batteryText.width - 12;
        const net = this.network;
        this.ip.text = net && net.ip_address && net.ip_address !== 'disconnected' ? net.ip_address : '';
        this.ip.x = this.batteryIcon.x - 46 - 20;
        if (this.wifiItem) this.wifiItem.caption.text = net && net.ssid ? short(net.ssid, 12) : 'Wi-Fi';
        if (this.mode === 'volume' && !(this.drag && this.drag.slider)) this.drawSlider(volume);
    }
}

Shortcuts.clockText = clockText;
Shortcuts.volumeAt = volumeAt;
Shortcuts.settle = settle;
Shortcuts.HEIGHT = HEIGHT;
module.exports = Shortcuts;
