'use strict';

const path = require('path');

// Layout follows Jibo's own Radio player: black face, media centred, round
// ActionButtons with stock white icons in two side columns, text centred below.
const VIDEO = { x: 290, y: 110, width: 700, height: 394 };
const COVER = { x: 445, y: 110, width: 390, height: 390 };
const BAR = { x: 290, y: 552, width: 700, height: 10 };
const GREY = [0x58586D, 0x282735], JIBO = [0x25F2FB, 0x107799];
const SCALE = 0.4, SIZE = 264 * SCALE;
const core = name => 'core://resources/actionIcons/' + name + '.png';
const own = name => path.join(__dirname, 'assets', 'icons', name + '.png');
// [id, action, label, icon, column centre x, row]
const BUTTONS = [
    ['back', 'back', 'Back 15', core('back'), 145, 0],
    ['toggle_pause', 'toggle', 'Pause', core('pause'), 145, 1],
    ['toggle_play', 'toggle', 'Play', core('play'), 145, 1],
    ['toggle_replay', 'toggle', 'Replay', core('restart'), 145, 1],
    ['forward', 'forward', 'Ahead 15', own('forward'), 145, 2],
    ['louder', 'louder', 'Louder', core('add'), 1135, 0],
    ['quieter', 'quieter', 'Quieter', own('minus'), 1135, 1],
    ['stop', 'stop', 'Stop', core('stop'), 1135, 2]
];
const ROW_Y = [100, 255, 410];

class UI {
    constructor(actions) {
        this.actions = actions; this.image = null; this.texture = null; this.artGeneration = 0;
        this.progressTrack = null; this.progressFill = null; this.progressFraction = 0;
        this.buttons = BUTTONS;
    }
    config(views) {
        const components = [];
        const label = (id, x, y, width, size, font, bold) => components.push({ type: 'Label', id: id, text: '',
            position: { x: x, y: y }, targetAnchor: { x: 0.5, y: 0.5 }, bounds: { width: width },
            style: { fontFamily: font, fontStyle: bold ? 'bold' : 'normal', fontSize: size, fill: '#FFFFFF', align: 'center' } });
        label('status', 640, 58, 1000, 36, 'Proxima Nova Soft');
        label('position', 640, 528, 400, 28, 'Proxima Nova Light');
        label('artist', 640, 610, 1120, 45, 'Proxima Nova', true);
        label('title', 640, 662, 1120, 45, 'Proxima Nova Light');
        BUTTONS.forEach(button => {
            const top = ROW_Y[button[5]];
            components.push({ type: 'ActionButton', id: button[0], iconSrc: button[3],
                colors: button[1] === 'toggle' ? JIBO : GREY,
                position: { x: button[4] - SIZE / 2, y: top }, transform: { scaleX: SCALE, scaleY: SCALE },
                action: { type: views.ActionData.CALLBACK, data: { callback: () => this.actions[button[1]]() } } });
            label(button[0] + 'Text', button[4], top + SIZE + 22, 230, 30, 'Proxima Nova Light');
        });
        return { viewConfig: { type: 'View', id: 'music', category: 'gui', ignoreSwipeDown: true, transitionStageOnly: true }, componentConfigs: components };
    }
    decorate(view, PIXI) {
        this.view = view; this.PIXI = PIXI;
        this.background = new PIXI.Graphics();
        this.background.beginFill(0x000000); this.background.drawRect(0, 0, 1280, 720); this.background.endFill();
        view.stage.addChildAt(this.background, 0);
        this.mediaLayer = new PIXI.Container(); view.stage.addChildAt(this.mediaLayer, 1);
        this.artLayer = new PIXI.Container(); view.stage.addChildAt(this.artLayer, 2);
        this.placeholder = new PIXI.Graphics(); this.placeholder.beginFill(0x21202b);
        this.placeholder.drawRect(COVER.x, COVER.y, COVER.width, COVER.height); this.placeholder.endFill();
        this.artLayer.addChild(this.placeholder);
        const note = new PIXI.Text('♪', { fontFamily: 'Proxima Nova Light', fontSize: 140, fill: '#58586D' });
        note.x = COVER.x + COVER.width / 2 - 40; note.y = COVER.y + COVER.height / 2 - 90; this.artLayer.addChild(note);
        // Same track/fill palette as Jibo's native ListProgress bar.
        this.progressTrack = new PIXI.Graphics(); this.progressFill = new PIXI.Graphics();
        view.stage.addChild(this.progressTrack); view.stage.addChild(this.progressFill);
        this.artLayer.visible = false;
    }
    label(id, value, width) {
        const component = this.view.getComponentById(id);
        if (!component) return;
        let text = String(value || '');
        if (this.PIXI.TextMetrics && width) {
            while (text.length > 1 && this.PIXI.TextMetrics.measureText(text, component.style).width > width) text = text.slice(0, -2).trim() + '…';
        }
        component.text = text;
    }
    render(state, session) {
        if (!this.view || !this.mediaLayer) return;
        const album = state.format === 'cover' || state.format === 'lyrics';
        const song = state.song;
        this.label('status', state.message || 'Music', 1000);
        this.label('artist', song && song.artist, 1120);
        this.label('title', song && song.title, 1120);
        this.label('position', song ? clock(state.position) + ' / ' + clock(song.duration) : '', 400);

        const duration = song && Number(song.duration);
        this.progressFraction = duration > 0 ? Math.max(0, Math.min(1, Number(state.position || 0) / duration)) : 0;
        this.progressTrack.clear(); this.progressTrack.beginFill(0x21202b);
        this.progressTrack.drawRect(BAR.x, BAR.y, BAR.width, BAR.height); this.progressTrack.endFill();
        this.progressFill.clear(); this.progressFill.beginFill(0x58586D);
        if (this.progressFraction > 0) this.progressFill.drawRect(BAR.x, BAR.y, BAR.width * this.progressFraction, BAR.height);
        this.progressFill.endFill();
        this.progressTrack.visible = this.progressFill.visible = !!song;

        const playable = !!song && !!session && /^(playing|paused|ended)$/.test(state.phase);
        const toggle = state.phase === 'ended' ? 'toggle_replay' : state.phase === 'paused' ? 'toggle_play' : 'toggle_pause';
        BUTTONS.forEach(button => {
            const id = button[0], component = this.view.getComponentById(id), text = this.view.getComponentById(id + 'Text');
            const shown = button[1] !== 'toggle' || id === toggle;
            const enabled = shown && (id === 'stop' || playable);
            component.lockInput(!enabled);
            component.display.visible = text.display.visible = shown;
            component.display.alpha = text.display.alpha = enabled ? 1 : 0.4;
            text.text = button[2];
        });
        const showArt = album && (state.format === 'lyrics' || !!this.texture || !session);
        this.artLayer.visible = showArt; this.mediaLayer.visible = !showArt;
        if (session) { session.options.viewport = album ? COVER : VIDEO; session.fit(); }
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
module.exports = UI;
