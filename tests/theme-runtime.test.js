'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const pkg = require('../@be/be/beacon/lib/theme-package');
const fixture = require('./theme-fixtures');

// Exercise native shipped Eye/EyeMesh/MenuButton/MenuView methods with a CPU PIXI
// surface. Services/WebGL are unavailable on a development machine.
class Point {
    constructor(x = 0, y = 0) { this.x = x; this.y = y; }
    set(x, y = x) { this.x = x; this.y = y; }
    copy(p) { this.x = p.x; this.y = p.y; }
    clone() { return new Point(this.x, this.y); }
}
class Container {
    constructor() { this.children = []; this.scale = new Point(1, 1); this.position = new Point(); this.visible = true; this.alpha = 1; this.x = 0; this.y = 0; }
    addChild(child) { if (child.parent) child.parent.removeChild(child); this.children.push(child); child.parent = this; return child; }
    addChildAt(child, index) { this.addChild(child); this.children.splice(this.children.indexOf(child), 1); this.children.splice(index, 0, child); return child; }
    removeChild(child) { this.children = this.children.filter(c => c !== child); child.parent = null; }
    removeChildren() { this.children.slice().forEach(c => this.removeChild(c)); }
    destroy(options) { if (options && options.children) this.children.slice().forEach(c => c.destroy(options)); this.destroyed = true; }
    containerUpdateTransform() {}
}
class Mesh extends Container { constructor(texture) { super(); this.texture = texture; } }
Mesh.DRAW_MODES = { TRIANGLES: 0 };
class Sprite extends Container {
    constructor(texture) { super(); this.texture = texture; this.anchor = new Point(); this.width = texture ? texture.width : 1; this.height = texture ? texture.height : 1; }
}
class Text extends Sprite { constructor(text, style) { super(); this.text = text; this.style = style; this.height = style.fontSize; this.width = text.length * style.fontSize / 2; } }
class Graphics extends Container {
    beginFill(color) { this.color = color; }
    drawRect(x, y, w, h) { this.width = w; this.height = h; }
    drawRoundedRect(x, y, w, h) { this.drawRect(x, y, w, h); }
    endFill() {}
    generateTexture() { return texture('stock-art', this.width || 330, this.height || 300); }
}
function texture(name, width = 720, height = 720) { return { name, width, height, baseTexture: { imageUrl: name } }; }
const pixi = { Container, Point, Sprite, Text, Graphics, mesh: { Mesh }, Rectangle: class { constructor(x,y,width,height) { Object.assign(this, { x,y,width,height }); } } };
const bundle = fs.readFileSync(path.join(__dirname, '../@be/be/node_modules/jibo/lib/jibo.js'), 'utf8');
function native(id, dependencies) {
    const marker = '}],' + id + ':[function(require,module,exports){';
    const start = bundle.indexOf(marker) + marker.length; const end = bundle.indexOf('\n},{', start);
    assert(start > marker.length && end > start);
    const module = { exports: {} };
    new Function('require', 'module', 'exports', 'PIXI', bundle.slice(start, end))(name => {
        assert(name in dependencies, 'Missing native dependency ' + name); return dependencies[name];
    }, module, module.exports, pixi);
    return module.exports.default;
}
const log = { default: { debug() {}, warn() {}, info() {}, createChild() { return this; } }, simplifyTexture: v => v };
const jibo = { face: { plugins: { prepare: { upload(callback) { if (typeof callback === 'function') callback(); } } } } };
const Runtime = { default: { instance: jibo } };
const Layer = native(109, { '../../Runtime': Runtime, 'jibo-plugins': { PathUtils: { isImage: value => /\.png$/i.test(value) } }, './log': log });
const EyeMesh = native(114, {});
const AbstractEye = native(108, { './EyeMesh': { default: EyeMesh }, './AbstractLayer': { default: Layer }, './log': log });
const Eye = native(112, { './AbstractEye': { default: AbstractEye }, 'jibo-keyframes': { conversion: { toPixelsX: v => v, toPixelsY: v => v } }, '../FaceRenderer': { default: { WIDTH: 1280, HEIGHT: 720 } } });
const Background = native(110, { './AbstractLayer': { default: Layer }, './log': log });
class StandardButton {
    constructor() { this._assets = {}; this._assetDescriptors = []; this.targetPosition = new Point(); this.member = { targetPosition: new Point() }; this.display = new Container(); }
    assignConfig(c) { this.id = c.id; this.action = c.action; }
    addAssetDescriptor() {}
    addAssetDescriptorObject() {}
    addAction() {}
    addToContent(icon, container) { if (icon instanceof Sprite) icon.anchor.set(0.5); container.addChild(icon); }
    setupHitArea(bounds) { this.display.hitArea = bounds; }
    setupInteractions() { this.display.interactive = true; }
    emptyDisplay() { this.display.children.slice().forEach(c => c.destroy({ children: true })); this.display.removeChildren(); }
    destroy() { this.display.destroy({ children: true }); }
    setTargetPosition(x,y) { this.targetPosition.set(x,y); this.display.x = x; this.display.y = y; }
    getSubcomponent() { return this.member; }
}
const Button = native(141, { './StandardButton': { default: StandardButton }, '../../../Runtime': Runtime,
    '../../animation/Timeline': { default: class {} }, '../../tween/TweenManager': { default: { stop() {} } },
    '../actions/ActionData': { default: { SOUND: 'sound' } }, './log': log, path });
class Label {
    constructor() { this.display = new Container(); this.targetPosition = new Point(); }
    getTextDimensions() { return { height: 50 }; }
    setTargetPosition(x,y) { this.targetPosition.set(x,y); }
    setTargetAnchor() {}
    close(callback) { this.display.alpha = 0; if (callback) callback(); }
    open() { this.display.alpha = 1; }
}
class List {
    constructor(buttons) { this.componentList = buttons; this.elementDimensions = { width: 330, height: 300 }; this.elementsPerPage = 3; this.elementBuffer = 30; this.pageIndex = 0; this.axisPosition = 0; this.noPan = false; }
    calculateReferenceValues() { this.elementSpacing = this.elementDimensions.width + this.elementBuffer; this.listStartPosition = new Point((1280 - this.elementsPerPage * this.elementSpacing) / 2, this.axisPosition - this.elementDimensions.height / 2); }
    setActivePage(i) { this.pageIndex = i; }
    getPagesCount() { return Math.ceil(this.componentList.length / this.elementsPerPage); }
    getStartIndexByPage(i) { return i * this.elementsPerPage; }
    getElementsByPage() { return this.componentList.slice(this.getStartIndexByPage(this.pageIndex), this.getStartIndexByPage(this.pageIndex) + this.elementsPerPage); }
    ready() {}
    createDisplay(stage, assets) { this.container = stage; this.calculateReferenceValues(); this.componentList.forEach(b => { b._assets = assets; b.setupDisplay(assets); stage.addChild(b.display); }); }
}
class View {
    constructor() { this._stage = new Container(); }
    createDisplay(stage, assets) { this._list.createDisplay(stage, assets); }
    ready() {}
    destroy() {}
}
const Menu = native(153, { './View': { default: View }, './log': log, '../../../Runtime': Runtime,
    '../components/List': { default: List }, '../components/Label': { default: Label }, '../components/ListProgress': { default: class {} },
    '../components/MenuButton': { default: Button }, '../../FaceRenderer': { default: { WIDTH: 1280, HEIGHT: 720 } },
    './EyeView': { default: class {} }, '../ViewManager': { default: {}, TRANSITION: {} } });
const assets = { icon: texture('skill-icon', 100, 100), skillButton: { library: { stage: class extends Container {
    constructor() { super(); this.content = new Container(); this.content.background = new Graphics(); this.content.gradient = { children: [{}] };
        this.content.background.children.push({ tint: 0 }); this.content.icon = new Container(); this.content.addChild(this.content.icon); this.addChild(this.content); }
} } } };
function menu() {
    const v = new Menu(); const buttons = [];
    for (let i = 0; i < 4; i++) { const b = new Button(); b.assignConfig({ id: String(i), label: 'Skill ' + i, iconSrc: 'icon', colors: [0x222222, 0xffffff], action: { destination: 'skill-' + i } }); buttons.push(b); }
    v._list = new List(buttons); v._list.calculateReferenceValues(); v._buttonLabels = [new Label(), new Label(), new Label()]; v._title = new Label(); v._assets = assets; return v;
}
const c = new Container(); c.eye = new Eye(c); c.background = new Background(c);
c.eye.init(texture('animation-utilities/Default_Eye.png')); c.background.init(texture('animation-utilities/JiBO_BG_00.png'));
c._getDefaultTextures = () => [{ id: 'background', src: 'stock-background.png' }];
c.getTexture = value => value === '/skill/special.png' ? texture('special-animation') : null;
jibo.face.eye = c;
jibo.face.views = { MenuButton: Button, MenuView: Menu, currentView: menu(), viewsInProcess: true, _viewProcess: { _activeViews: [] } };
const nativeMenu = jibo.face.views.currentView; nativeMenu.loaded();
const caches = []; let loadError = false;
jibo.loader = { addCache(id) { caches.push(id); }, deleteCache() {}, load(descriptors, options) {
    if (loadError) { options.complete(new Error('GPU load failed')); return; }
    const out = {}; descriptors.forEach(d => { out[d.id] = texture(d.id, d.id === 'menu/button.png' ? 500 : 720, d.id === 'menu/button.png' ? 500 : 720); }); options.complete(null, out);
} };
const loaded = { exports: {} };
new Function('require', 'module', 'exports', 'window', 'PIXI', fs.readFileSync(path.join(__dirname, '../@be/be/beacon/lib/theme-runtime.js'), 'utf8'))(
    name => name === 'jibo' ? jibo : name === './paths' ? { pristineEye: () => 'pristine.png' } : name === './theme-package' ? pkg : require(name), loaded, loaded.exports, {}, pixi);
const runtime = loaded.exports;
function dofs(height = 720) {
    const values = { eyeTextureInfixBn_r: '/animations/White_Eye.png', eyeSubRootBn_t: 20, eyeSubRootBn_t_2: 10, eyeSubRootBn_r: 0.1,
        eye_redChannelBn_r: 1, eye_greenChannelBn_r: 1, eye_blueChannelBn_r: 1,
        screenBG_redChannelBn_r: 0, screenBG_greenChannelBn_r: 0, screenBG_blueChannelBn_r: 0, screenBGTextureInfixBn_r: '' };
    for (let i = 0; i < 9; i++) { values['vertexJoint' + (i + 1) + '_t'] = (i % 3 - 1) * 360; values['vertexJoint' + (i + 1) + '_t_2'] = (Math.floor(i / 3) - 1) * height / 2; }
    return values;
}
async function run() {
    const theme = await pkg.validate(fixture.astra());
    c._currentDofValues = dofs();
    await runtime.apply(await runtime.prepare(theme, '/tmp/theme'));
    assert.strictEqual(c.getTexture('White_Eye.png').name, 'face/eye.png');
    assert.strictEqual(c.eye.x, 660); assert.strictEqual(c.eye.rotation, -0.1);
    c.eye.display(1, Object.assign(dofs(0), { eyeTextureInfixBn_r: '/skill/special.png' }));
    assert.strictEqual(c.eye.eyeMesh.texture.name, 'special-animation'); assert.strictEqual(c.eye._beamClosedMesh.visible, false);
    for (const h of [720, 360, 0]) {
        c.eye.display(1, dofs(h)); c.eye.eyeMesh.updateTransform(); c.eye._beamClosedMesh.updateTransform();
        assert.strictEqual(c.eye._beamClosedMesh.alpha, 1 - h / 720);
        assert.strictEqual(c.eye.eyeMesh.alpha, h / 720);
        assert.deepStrictEqual(c.eye.eyeMesh.vertices, c.eye._beamClosedMesh.vertices);
    }
    c.eye.display(1, Object.assign(dofs(0), { eyeVisibilityBn_r: 0, eye_alphaChannelBn_r: 0.2 }));
    assert.strictEqual(c.eye.visible, false); assert.strictEqual(c.eye.alpha, 0.2);
    assert.strictEqual(nativeMenu._list.elementsPerPage, 1); assert.strictEqual(nativeMenu._list.elementDimensions.height, 684);
    assert(nativeMenu._buttonLabels.every(l => !l.display.visible)); assert(!nativeMenu._title.display.visible);
    const button = nativeMenu._list.componentList[0];
    assert.strictEqual(button.display.hitArea.height, 684); assert.strictEqual(button._content.children[2].y, 34.199999999999996);
    assert.strictEqual(button.action.destination, 'skill-0');
    assert.strictEqual(button.member.targetPosition.y, nativeMenu._list.listStartPosition.y);
    const next = menu(); next.loaded(); assert.strictEqual(next._list.elementsPerPage, 1);
    assert(next._beamThemeBackground); assert(next._buttonLabels.every(l => !l.display.visible));
    const specialized = menu(); specialized._list.componentList.forEach(b => { b._type = 'ContactButton'; }); specialized.loaded();
    assert.strictEqual(specialized._list.elementsPerPage, 3); assert(!specialized._beamThemeBackground);
    assert(specialized._buttonLabels.every(l => l.display.visible), 'Specialized interfaces keep their labels');
    const withBackground = Object.assign({}, theme, { face: Object.assign({}, theme.face, { backgroundColor: '#123456' }),
        images: Object.assign({}, theme.images, { 'face/background.png': { width: 640, height: 480 } }) });
    await runtime.apply(await runtime.prepare(withBackground, '/tmp/theme'));
    assert.strictEqual(c.background.sprite.width, 1280); assert.strictEqual(c.background.sprite.height, 720);
    assert.strictEqual(c.background._beamSolid.color, 0x123456); assert.strictEqual(c.background._beamSolid.visible, true);
    assert.strictEqual(c.background.sprite.texture.name, 'face/background.png');
    for (const size of [50, 300]) {
        const scaled = Object.assign({}, theme, { face: Object.assign({}, theme.face, { eyeSize: size }) });
        await runtime.apply(await runtime.prepare(scaled, '/tmp/theme')); c.eye.display(1, dofs());
        assert.strictEqual(c.eye.scale.x, size / 100);
    }
    loadError = true; await assert.rejects(runtime.prepare(theme, '/tmp/theme'), /GPU/); loadError = false;
    assert.strictEqual(c.eye.scale.x, 3, 'Failed preload preserves current appearance');
    const failedCommit = Object.assign({}, theme, { face: Object.assign({}, theme.face, { eyeSize: 50 }) });
    await assert.rejects(runtime.apply(await runtime.prepare(failedCommit, '/tmp/theme'), () => { throw new Error('State write failed'); }), /State write/);
    assert.strictEqual(c.eye.scale.x, 3, 'Failed persistence restores the prior live appearance');
    await runtime.apply(await runtime.prepare(null));
    c.eye.display(1, dofs()); assert.strictEqual(c.eye.scale.x, 1); assert.strictEqual(c.eye.eyeMesh.alpha, 1);
    assert.strictEqual(c.eye._beamClosedMesh.visible, false); assert.strictEqual(c.getTexture('White_Eye.png').name, 'stockEye');
    assert.strictEqual(c.background.sprite.visible, true); assert.strictEqual(nativeMenu._list.elementsPerPage, 3);
    assert.strictEqual(nativeMenu._list.elementDimensions.height, 300); assert(nativeMenu._buttonLabels.every(l => l.display.visible));
    assert(nativeMenu._title.display.visible); assert.strictEqual(button.display.hitArea.height, 300);
    assert.strictEqual(button._beamThemeDisplay, null); assert.strictEqual(button.action.destination, 'skill-0');
    assert.strictEqual(runtime.status().live, true);
    console.log('Native eye geometry/blending, scaling, shared menu layout/hit areas, live switching and stock restoration passed');
}
run().catch(e => { console.error(e); process.exitCode = 1; });
