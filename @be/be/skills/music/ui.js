'use strict';

const path = require('path');

// Three layouts (Zane's mockups), on Jibo's black face with his native round ActionButtons:
//  video  - music video centred; volume above, progress below. Tap the video for controls.
//  cover  - artwork left; title, artist and buttons right; progress and volume below. Tap the
//           artwork for timed lyrics.
//  lyrics - lyrics fill the screen. Tap for controls (volume, progress, buttons); tap again
//           to go back to the artwork.
// While AirPlay plays, "Now playing from <device>" sits above the title.
const VIDEO = { x: 253, y: 131, width: 774, height: 435 };
const COVER = { x: 126, y: 72, width: 418, height: 418 };
const FULL = { x: 0, y: 0, width: 1280, height: 720 };
const GREY = [0x58586D, 0x282735], JIBO = [0x25F2FB, 0x107799];
const core = name => 'core://resources/actionIcons/' + name + '.png';
const own = name => path.join(__dirname, 'assets', 'icons', name + '.png');
// [id, action, icon]
const BUTTONS = [
    ['back', 'back', core('back')],
    ['toggle_pause', 'toggle', core('pause')],
    ['toggle_play', 'toggle', core('play')],
    ['toggle_replay', 'toggle', core('restart')],
    ['forward', 'forward', own('forward')]
];
// Where things go: text column centre, lines' y, buttons' y, progress and volume rows.
const PLACES = {
    overlay: { x: 640, device: 189, title: 254, artist: 310, plainTitle: 223, plainArtist: 281, buttons: 450, progress: 616, volume: 74 },
    cover: { x: 905, device: 97, title: 210, artist: 265, plainTitle: 171, plainArtist: 227, buttons: 397, plainButtons: 360, progress: 540, volume: 619 }
};
const ARROW = 0.37, PAUSE = 0.49, GAP = 150, CONTROLS_MS = 5000;
const LYRIC_CENTRE = 346;

class UI {
    constructor(actions) {
        this.actions = actions; this.image = null; this.texture = null; this.artGeneration = 0;
        this.progressFraction = 0; this.controlsUntil = 0; this.mode = null;
    }
    config(views) {
        const components = BUTTONS.map(button => ({ type: 'ActionButton', id: button[0], iconSrc: button[2],
            colors: button[1] === 'toggle' ? JIBO : GREY, position: { x: 0, y: 0 }, transform: { scaleX: ARROW, scaleY: ARROW },
            action: { type: views.ActionData.CALLBACK, data: { callback: () => { this.poke(); this.actions[button[1]](); } } } }));
        return { viewConfig: { type: 'View', id: 'music', category: 'gui', ignoreSwipeDown: true, transitionStageOnly: true }, componentConfigs: components };
    }
    // Everything drawn here goes below the native buttons, so they always get their touches.
    decorate(view, PIXI) {
        this.view = view; this.PIXI = PIXI;
        let layer = 0;
        const add = child => { view.stage.addChildAt(child, layer++); return child; };
        const fill = (graphics, color, alpha, box) => { graphics.beginFill(color, alpha); graphics.drawRect(box.x, box.y, box.width, box.height); graphics.endFill(); return graphics; };
        add(fill(new PIXI.Graphics(), 0x000000, 1, FULL));
        this.mediaLayer = add(new PIXI.Container());
        this.artLayer = add(new PIXI.Container());
        this.placeholder = fill(new PIXI.Graphics(), 0x21202b, 1, COVER); this.artLayer.addChild(this.placeholder);
        this.note = new PIXI.Text('♪', { fontFamily: 'Proxima Nova Light', fontSize: 140, fill: '#58586D' });
        this.note.anchor.set(0.5, 0.5); this.artLayer.addChild(this.note);
        this.artLayer.visible = false;

        // Lyrics: one column of every line that glides to keep the sung line in the middle.
        this.lyricsLayer = add(new PIXI.Container()); this.lyricsLayer.visible = false;
        this.lyricsList = new PIXI.Container(); this.lyricsLayer.addChild(this.lyricsList);
        this.lyricsNote = this.lyricText(''); this.lyricsNote.x = 640; this.lyricsNote.y = LYRIC_CENTRE; this.lyricsLayer.addChild(this.lyricsNote);
        for (let i = 0; i < 8; i++) this.lyricsLayer.addChild(fill(new PIXI.Graphics(), 0x000000, (i + 1) / 8, { x: 0, y: 600 + i * 15, width: 1280, height: 15 }));
        // delta = frames elapsed at 60 fps, so the glide takes ~0.6 s whatever Jibo's frame rate (screen sharing drops it to 15)
        this.glide = delta => { this.lyricsList.y += (this.scrollTo - this.lyricsList.y) * (1 - Math.pow(0.92, delta || 1)); };

        // Taps on the picture (below everything else that takes touches).
        this.tap = add(new PIXI.Container()); this.tap.interactive = true;
        const tapped = () => this.tapped();
        this.tap.on('click', tapped); this.tap.on('tap', tapped);

        // Controls over the video or lyrics: dimming, and darker bands behind volume and progress.
        this.dim = add(new PIXI.Graphics());
        this.device = add(new PIXI.Container());
        this.deviceIcon = new PIXI.Graphics(); this.device.addChild(this.deviceIcon);
        this.deviceText = new PIXI.Text('', { fontFamily: 'Proxima Nova Light', fontSize: 30, fill: '#BDBDC8' });
        this.deviceText.anchor.set(0, 0.5); this.device.addChild(this.deviceText);
        this.title = add(this.text(52, 'Proxima Nova', 'bold', '#FFFFFF'));
        this.artist = add(this.text(44, 'Proxima Nova Light', 'normal', '#BDBDC8'));

        // Progress: elapsed - bar - length.
        this.progress = add(new PIXI.Container());
        this.elapsed = this.text(27, 'Proxima Nova', 'bold', '#E6E6EE'); this.length = this.text(27, 'Proxima Nova', 'bold', '#E6E6EE');
        this.progressBar = new PIXI.Graphics();
        [this.elapsed, this.length, this.progressBar].forEach(child => this.progress.addChild(child));

        // Volume: speaker - slider - louder speaker. Drag or tap the slider; tap a speaker for a step.
        this.volumeRow = add(new PIXI.Container());
        this.volumeBar = new PIXI.Graphics(); this.volumeRow.addChild(this.volumeBar);
        const speaker = (x, waves, step) => {
            const icon = new PIXI.Graphics(); icon.x = x; this.drawSpeaker(icon, waves);
            icon.interactive = true; icon.hitArea = new PIXI.Rectangle(-30, -30, 60, 60);
            const press = () => { this.poke(); this.actions[step](); };
            icon.on('click', press); icon.on('tap', press);
            this.volumeRow.addChild(icon);
        };
        speaker(327, 1, 'quieter'); speaker(954, 2, 'louder');
        this.volumeBar.interactive = true; this.volumeBar.hitArea = new PIXI.Rectangle(380, -30, 500, 60);
        const drag = event => {
            if (!this.dragging) return;
            const x = event.data.getLocalPosition(this.volumeRow).x;
            const fraction = Math.max(0, Math.min(1, (x - 398) / 460));
            this.poke(); this.drawVolume(fraction); if (this.actions.setVolume) this.actions.setVolume(fraction);
        };
        this.volumeBar.on('pointerdown', event => { this.dragging = true; drag(event); });
        this.volumeBar.on('pointermove', drag);
        const stop = () => { this.dragging = false; };
        this.volumeBar.on('pointerup', stop); this.volumeBar.on('pointerupoutside', stop);
    }
    text(size, font, weight, fill) {
        const text = new this.PIXI.Text('', { fontFamily: font, fontWeight: weight, fontSize: size, fill: fill, align: 'center' });
        text.anchor.set(0.5, 0.5); return text;
    }
    drawSpeaker(icon, waves) {
        icon.beginFill(0xE6E6EE); icon.drawPolygon([-12, -5, -6, -5, 2, -12, 2, 12, -6, 5, -12, 5]); icon.endFill();
        for (let i = 1; i <= waves; i++) { icon.lineStyle(2.5, 0xE6E6EE); icon.arc(2, 0, 4 + i * 6, -Math.PI / 4, Math.PI / 4); icon.moveTo(0, 0); }
        icon.lineStyle(0);
    }
    drawAirplay(icon) {
        icon.clear(); icon.lineStyle(2.5, 0xBDBDC8);
        [8, 14].forEach(radius => { icon.moveTo(Math.cos(0.75 * Math.PI) * radius, Math.sin(0.75 * Math.PI) * radius); icon.arc(0, 0, radius, 0.75 * Math.PI, 2.25 * Math.PI); });
        icon.lineStyle(0); icon.beginFill(0xBDBDC8); icon.drawPolygon([-8, 16, 8, 16, 0, 6]); icon.endFill();
    }
    drawVolume(fraction) {
        this.volumeFraction = fraction;
        const knob = 398 + 460 * fraction;
        this.volumeBar.clear();
        this.volumeBar.lineStyle(3, 0x8C8CA3); this.volumeBar.moveTo(398, 0); this.volumeBar.lineTo(858, 0); this.volumeBar.lineStyle(0);
        this.volumeBar.beginFill(0xE6E6EE); this.volumeBar.drawCircle(knob, 0, 20); this.volumeBar.endFill();
    }
    // Controls stay up for a few seconds after the last touch.
    poke() { if (this.controlsUntil) this.showControls(); }
    showControls() {
        this.controlsUntil = Date.now() + CONTROLS_MS;
        clearTimeout(this.controlsTimer);
        this.controlsTimer = setTimeout(() => { this.controlsUntil = 0; this.refresh(); }, CONTROLS_MS + 50);
        this.refresh();
    }
    hideControls() { clearTimeout(this.controlsTimer); this.controlsUntil = 0; this.refresh(); }
    tapped() {
        if (this.mode === 'cover') { if (this.actions.lyrics) this.actions.lyrics(); return; }
        if (!this.controlsUntil) { this.showControls(); return; }
        if (this.mode === 'lyrics' && this.actions.lyrics) { this.hideControls(); this.actions.lyrics(); return; } // back to the artwork
        this.hideControls();
    }
    refresh() { if (this.lastState) this.render(this.lastState, this.lastSession); }
    lyricText(text) {
        const line = new this.PIXI.Text(text, { fontFamily: 'Proxima Nova Light', fontWeight: 'normal', fontSize: 48, fill: '#8C8CA3', align: 'center', wordWrap: true, wordWrapWidth: 1100 });
        line.anchor.set(0.5, 0.5); line.x = 640; return line;
    }
    // lyrics: null (hide), { message } or { lines, at } (at = index of the line being sung).
    lyrics(show) {
        if (!this.lyricsLayer) return;
        const was = this.lyricsShown;
        this.lyricsShown = !!show;
        if (this.PIXI.ticker) this.PIXI.ticker.shared[show && show.lines ? 'add' : 'remove'](this.glide);
        if (was !== this.lyricsShown) { this.controlsUntil = 0; clearTimeout(this.controlsTimer); this.refresh(); }
        if (!show) { this.lyricsSet = null; return; }
        this.lyricsNote.text = show.message || ''; this.lyricsList.visible = !show.message;
        if (show.message) return;
        if (show.lines !== this.lyricsSet) { // new song: one text per line
            this.lyricsSet = show.lines; this.lyricsAt = null;
            this.lyricsList.removeChildren().forEach(old => old.destroy());
            show.lines.forEach(entry => this.lyricsList.addChild(this.lyricText(entry.text || '♪')));
        }
        if (show.at === this.lyricsAt) return;
        const first = this.lyricsAt === null;
        this.lyricsAt = show.at;
        // The sung line is bold, white and larger; stack the lines by their drawn heights.
        let y = 0, target = 0;
        this.lyricsList.children.forEach((line, i) => {
            const now = i === show.at;
            line.style.fill = now ? '#FFFFFF' : '#C8C8D2'; line.style.fontWeight = now ? 'bold' : 'normal';
            line.style.fontFamily = now ? 'Proxima Nova' : 'Proxima Nova Light'; line.style.fontSize = now ? 78 : 48;
            const height = line.height;
            line.y = y + height / 2;
            if (i === Math.max(show.at, 0)) target = line.y;
            y += height + 34;
        });
        this.scrollTo = LYRIC_CENTRE - target + (show.at < 0 ? 60 : 0); // before the first line: it waits just below the middle
        if (first) this.lyricsList.y = this.scrollTo; // opening mid-song jumps straight there
    }
    fit(text, value, width) {
        let shown = String(value || '');
        if (this.PIXI.TextMetrics) while (shown.length > 1 && this.PIXI.TextMetrics.measureText(shown, text.style).width > width) shown = shown.slice(0, -2).trim() + '…';
        text.text = shown;
    }
    render(state, session) {
        if (!this.view || !this.mediaLayer) return;
        this.lastState = state; this.lastSession = session;
        const song = state.song, busy = /^(loading|error|starting|buffering)$/.test(state.phase);
        const video = !state.airplay && state.format === 'video' && !!session && !this.lyricsShown;
        const mode = this.mode = this.lyricsShown ? 'lyrics' : video ? 'video' : 'cover';
        const controls = mode === 'cover' || !!this.controlsUntil;
        const place = mode === 'cover' ? PLACES.cover : PLACES.overlay;
        const fromDevice = !!state.airplay;

        // Pictures.
        const hasArt = !!this.texture;
        this.mediaLayer.visible = mode === 'video' || (mode === 'cover' && !hasArt && !!session);
        this.artLayer.visible = mode === 'cover' && (hasArt || !session);
        this.placeholder.visible = this.note.visible = !hasArt;
        this.note.x = COVER.x + COVER.width / 2; this.note.y = COVER.y + COVER.height / 2;
        this.lyricsLayer.visible = mode === 'lyrics';
        if (session) { session.options.viewport = mode === 'video' ? VIDEO : COVER; session.fit(); }
        const area = mode === 'video' ? VIDEO : mode === 'cover' ? COVER : FULL;
        this.tap.hitArea = new this.PIXI.Rectangle(area.x, area.y, area.width, area.height);

        // Dimming under the controls.
        this.dim.clear();
        if (controls && mode !== 'cover') {
            this.dim.beginFill(0x000000, mode === 'video' ? 0.55 : 0.78); this.dim.drawRect(area.x, area.y, area.width, area.height); this.dim.endFill();
            if (mode === 'lyrics') { this.dim.beginFill(0x0B0B0F, 0.95); this.dim.drawRect(0, 0, 1280, 142); this.dim.drawRect(0, 576, 1280, 144); this.dim.endFill(); }
        }

        // Text.
        const overlayText = controls;
        this.title.visible = this.artist.visible = overlayText;
        this.device.visible = overlayText && fromDevice;
        this.title.x = this.artist.x = place.x;
        this.title.y = fromDevice ? place.title : place.plainTitle; this.artist.y = fromDevice ? place.artist : place.plainArtist;
        const width = mode === 'cover' ? 600 : 1000;
        this.fit(this.title, song && song.title || state.message || 'Music', width);
        this.fit(this.artist, busy && song && state.message || song && song.artist || '', width);
        if (this.device.visible) {
            this.drawAirplay(this.deviceIcon);
            this.fit(this.deviceText, 'Now playing from ' + (state.device || 'AirPlay'), width - 50);
            this.deviceText.x = 22;
            this.device.x = place.x - (this.deviceText.width + 22) / 2 + 2; this.device.y = place.device;
            this.deviceIcon.y = -4;
        }

        // Progress and volume rows.
        const duration = song && Number(song.duration);
        this.progressFraction = duration > 0 ? Math.max(0, Math.min(1, Number(state.position || 0) / duration)) : 0;
        this.progress.visible = duration > 0 && (mode !== 'lyrics' || controls);
        this.progress.y = place.progress;
        const left = 210, right = 1067;
        this.elapsed.text = clock(state.position); this.length.text = clock(duration);
        this.elapsed.x = 153; this.length.x = 1125;
        this.progressBar.clear();
        this.progressBar.lineStyle(3, 0x3A3A48); this.progressBar.moveTo(left, 0); this.progressBar.lineTo(right, 0);
        if (this.progressFraction > 0) { this.progressBar.lineStyle(3, 0xD2D2DC); this.progressBar.moveTo(left, 0); this.progressBar.lineTo(left + (right - left) * this.progressFraction, 0); }
        this.progressBar.lineStyle(0);
        this.volumeRow.visible = mode !== 'lyrics' || controls;
        this.volumeRow.y = place.volume;
        if (!this.dragging && state.volume !== undefined) this.drawVolume(state.volume);

        // Buttons: previous / play-pause-replay / next, only with the controls.
        const playable = !!song && (!!session || state.airplay) && /^(playing|paused|ended)$/.test(state.phase);
        const toggle = state.phase === 'ended' ? 'toggle_replay' : state.phase === 'paused' ? 'toggle_play' : 'toggle_pause';
        const buttonsY = mode === 'cover' && !fromDevice ? place.plainButtons : place.buttons;
        BUTTONS.forEach(button => {
            const id = button[0], component = this.view.getComponentById(id);
            const big = button[1] === 'toggle', scale = big ? PAUSE : ARROW, size = 264 * scale;
            const centre = place.x + (id === 'back' ? -GAP : id === 'forward' ? GAP : 0);
            const shown = controls && (!big || id === toggle);
            component.display.x = centre - size / 2; component.display.y = buttonsY - size / 2;
            component.display.scale.x = component.display.scale.y = scale;
            component.lockInput(!(shown && playable));
            component.display.visible = shown;
            component.display.alpha = playable ? 1 : 0.4;
        });
    }
    artwork(target, changed) {
        this.releaseArtwork();
        const generation = this.artGeneration, image = this.image = new global.Image();
        image.crossOrigin = 'anonymous';
        const timer = this.artTimer = setTimeout(() => { if (generation === this.artGeneration) this.releaseArtwork(); }, 12000);
        image.onload = () => {
            clearTimeout(timer);
            if (generation !== this.artGeneration || !image.naturalWidth || image.naturalWidth > 1400 || image.naturalHeight > 1400) return;
            image.onload = image.onerror = null;
            this.texture = new this.PIXI.Texture(new this.PIXI.BaseTexture(image));
            this.artSprite = new this.PIXI.Sprite(this.texture);
            this.artSprite.x = COVER.x; this.artSprite.y = COVER.y; this.artSprite.width = COVER.width; this.artSprite.height = COVER.height;
            this.artLayer.addChild(this.artSprite); changed();
        };
        image.onerror = () => { clearTimeout(timer); image.onload = image.onerror = null; };
        image.src = target;
    }
    releaseArtwork() {
        this.artGeneration++; clearTimeout(this.artTimer);
        if (this.image) { this.image.onload = this.image.onerror = null; this.image.src = ''; this.image = null; }
        if (this.artSprite) { this.artSprite.parent.removeChild(this.artSprite); this.artSprite.destroy(); this.artSprite = null; }
        if (this.texture) { this.texture.destroy(true); this.texture = null; }
    }
}
function clock(seconds) { seconds = Math.max(0, Math.floor(seconds || 0)); return Math.floor(seconds / 60) + ':' + ('0' + seconds % 60).slice(-2); }
UI.VIDEO = VIDEO; UI.COVER = COVER;
module.exports = UI;
