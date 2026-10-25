'use strict';

const VIDEO = { x: 160, y: 30, width: 960, height: 440 };
const COVER = { x: 110, y: 160, width: 380, height: 380 };
class UI {
    constructor(actions) { this.actions = actions; this.image = null; this.texture = null; this.artGeneration = 0; }
    config(views) {
        const components = [];
        const label = (id, x, y, width, size) => components.push({ type: 'Label', id: id, text: '',
            position: { x: x, y: y }, targetAnchor: { x: 0, y: 0.5 }, bounds: { width: width, height: 110 },
            style: { fontFamily: 'Proxima Nova Soft', fontSize: size, fill: '#ffffff', align: 'left' } });
        label('title', 160, 500, 960, 36); label('artist', 160, 552, 960, 28); label('status', 180, 95, 920, 28);
        label('position', 840, 565, 310, 24);
        this.buttons = [
            ['toggle', 'Pause', 170, 180], ['back', '-15s', 370, 140], ['forward', '+15s', 530, 140],
            ['quieter', 'Vol -', 690, 140], ['louder', 'Vol +', 850, 140], ['stop', 'Stop', 1010, 140]
        ];
        this.buttons.forEach(button => {
            components.push({ type: 'Button', id: button[0], assets: [], position: { x: button[2], y: 610 },
                hitArea: { x: 0, y: 0, width: button[3], height: 76 },
                action: { type: views.ActionData.CALLBACK, data: { callback: () => this.actions[button[0]]() } } });
            label(button[0] + 'Text', button[2] + 18, 648, button[3] - 28, 26);
        });
        return { viewConfig: { type: 'View', id: 'music', category: 'gui', ignoreSwipeDown: true, transitionStageOnly: true }, componentConfigs: components };
    }
    decorate(view, PIXI) {
        this.view = view; this.PIXI = PIXI;
        this.background = new PIXI.Graphics(); this.background.beginFill(0x07151b); this.background.drawRect(0, 0, 1280, 720); this.background.endFill();
        view.stage.addChildAt(this.background, 0);
        this.mediaLayer = new PIXI.Container(); view.stage.addChildAt(this.mediaLayer, 1);
        this.artLayer = new PIXI.Container(); view.stage.addChildAt(this.artLayer, 2);
        this.placeholder = new PIXI.Graphics(); this.placeholder.beginFill(0x17363f); this.placeholder.drawRect(COVER.x, COVER.y, COVER.width, COVER.height); this.placeholder.endFill();
        this.artLayer.addChild(this.placeholder);
        const note = new PIXI.Text('♪', { fontSize: 128, fill: '#c4dce2' }); note.x = 235; note.y = 250; this.artLayer.addChild(note);
        this.buttons.forEach(button => {
            const component = view.getComponentById(button[0]), shape = new PIXI.Graphics();
            shape.beginFill(0x17363f); shape.drawRect(0, 0, button[3], 76); shape.endFill(); component.display.addChildAt(shape, 0);
        });
    }
    label(id, value, x, y, width) {
        const component = this.view.getComponentById(id);
        if (!component) return;
        if (x !== undefined) { component.display.x = x; component.display.y = y; }
        let text = String(value || '');
        if (this.PIXI.TextMetrics && width) {
            while (text.length > 1 && this.PIXI.TextMetrics.measureText(text, component.style).width > width) text = text.slice(0, -2).trim() + '…';
        }
        component.text = text;
    }
    render(state, session) {
        if (!this.view || !this.mediaLayer) return;
        const album = state.format === 'cover' || state.format === 'lyrics';
        this.label('title', state.song && state.song.title, album ? 550 : 160, album ? 255 : 500, album ? 600 : 960);
        this.label('artist', state.song && state.song.artist, album ? 550 : 160, album ? 325 : 550, album ? 600 : 660);
        this.label('status', state.message || '', 180, 95, 920);
        this.label('position', state.song ? clock(state.position) + ' / ' + clock(state.song.duration) : '', 840, 565, 310);
        this.buttons.forEach(button => {
            const enabled = button[0] === 'stop' || !!state.song && !!session && /^(playing|paused|ended)$/.test(state.phase);
            this.view.getComponentById(button[0]).lockInput(!enabled);
            this.label(button[0] + 'Text', button[0] === 'toggle' ? state.phase === 'ended' ? 'Replay' : state.phase === 'paused' ? 'Play' : 'Pause' : button[1]);
            this.view.getComponentById(button[0] + 'Text').display.alpha = enabled ? 1 : 0.35;
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
