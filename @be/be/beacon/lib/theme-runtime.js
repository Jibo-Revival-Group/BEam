'use strict';

const path = require('path');
const paths = require('./paths');
const fail = require('./theme-package').fail;
const menuScroll = require('./theme-menu-scroll');
const animationAssets = require('./theme-animation-assets');
const themeIcons = require('./theme-icons');
let iconHook = null;
let current = null;
let live = { live: false, reason: 'Renderer has not started' };
let retryTimer = null;
let skillScope = null;
function nonEyeThemesEnabled() { return !skillScope || skillScope.enabled; }
function menuTheme() { return nonEyeThemesEnabled() && current && current.theme; }
function setSkillScope(scope) {
    const previous = nonEyeThemesEnabled(); skillScope = scope;
    if (previous !== nonEyeThemesEnabled() && current && current.live) {
        try { refresh(current.jibo); } catch (err) { console.warn('[themes] skill appearance refresh:', err.message); }
    }
}
function enterSkill(skill, enabled) {
    const scope = { skill: skill, enabled: enabled !== false };
    setSkillScope(scope); return scope;
}
function leaveSkill(scope) { if (scope && skillScope === scope) { setSkillScope(null); } }


function stockEye(value) {
    return /^(default_eye|white_eye|white-eye|jibo_eye_customizer_00|jibo_eye_customizer_38)\.png$/i.test(String(value || '').split(/[/\\]/).pop());
}
function listeningEye(dofs) {
    // Native listening animations tint the stock eye light blue (163,217,255),
    // including interpolated transitions into and out of that color.
    return dofs.eye_blueChannelBn_r > dofs.eye_greenChannelBn_r + 0.001 &&
        dofs.eye_greenChannelBn_r > dofs.eye_redChannelBn_r + 0.001;
}
function restoreListeningFilters(eye) {
    if (eye._beamListeningFilters !== undefined) {
        eye.filters = eye._beamListeningFilters;
        delete eye._beamListeningFilters;
    }
}
function closedAmount(points) {
    if (!points || points.length !== 9) { return 0; }
    // The neutral UV mesh is square. Row/column averages exclude translation and rotation.
    const height = Math.abs((points[6].y + points[7].y + points[8].y - points[0].y - points[1].y - points[2].y) / 3);
    const width = Math.abs((points[2].x + points[5].x + points[8].x - points[0].x - points[3].x - points[6].x) / 3);
    return Math.max(0, Math.min(1, 1 - height / Math.max(width, 0.001)));
}
function geometry(theme, texture) {
    const m = theme.menu; const h = 720 * m.buttonSize / 100;
    const aspect = texture ? texture.width / texture.height : 1;
    return { width: h * aspect, height: h, iconHeight: h * m.iconSize / 100,
        textHeight: h * m.textSize / 100,
        iconX: h * aspect * (0.5 + m.iconPlacement.x / 100), iconY: h * (0.5 - m.iconPlacement.y / 100),
        textX: h * aspect * (0.5 + m.textPlacement.x / 100), textY: h * (0.5 - m.textPlacement.y / 100) };
}
function jiboRuntime() {
    if (typeof window === 'undefined') { return null; }
    return require('jibo');
}
function prepare(theme, dir) {
    let overrides;
    try { overrides = animationAssets.plan(theme); } catch (err) { return Promise.reject(err); }
    let jibo;
    try { jibo = jiboRuntime(); } catch (err) { return Promise.reject(err); }
    if (!jibo) { return Promise.resolve({ theme: theme, live: false }); }
    const container = jibo.face && jibo.face.eye;
    if (!container || !container.eye || !container.eye.initialized || !container.background.initialized || !jibo.loader) {
        return Promise.reject(fail('Jibo face is not ready; try applying the theme again'));
    }
    const stock = container._getDefaultTextures();
    const cache = 'beam-theme-' + Date.now() + '-' + Math.random().toString(16).slice(2);
    const descriptors = [];
    // Load pristine assets even for None: old custom-eye caches must not survive migration.
    descriptors.push({ id: 'stockEye', src: paths.pristineEye(), type: 'texture', cache: cache });
    const bg = stock.filter(a => a.id === 'background')[0];
    descriptors.push({ id: 'stockBackground', src: bg.src, type: 'texture', cache: cache });
    if (theme) {
        Object.keys(theme.images).filter(name => name !== 'banner.png' && !/\.svg$/.test(name)).forEach(name => descriptors.push({ id: name, src: path.join(dir, name), type: 'texture', cache: cache }));
    }
    const svgTextures = {};
    const svgNames = theme ? Object.keys(theme.images).filter(name => /\.svg$/.test(name)) : [];
    const svgReady = svgNames.reduce((chain, name) => chain.then(() => require('./theme-svg').texture(PIXI, path.join(dir, name), theme.images[name]).then(texture => { svgTextures[name] = texture; })), Promise.resolve());
    return svgReady.then(() => animationAssets.decode(jibo, overrides, dir)).then(audio => new Promise((resolve, reject) => {
        jibo.loader.addCache(cache);
        let finished = false;
        const timeout = setTimeout(() => complete(fail('Theme texture loading timed out')), 15000);
        function complete(err, textures) {
            if (finished) { return; } finished = true; clearTimeout(timeout);
            if (err || !textures || descriptors.some(a => !textures[a.id])) {
                try { jibo.loader.deleteCache(cache); } catch (ignored) { /* already removed */ }
                reject(err || fail('Theme texture loading failed')); return;
            }
            resolve({ jibo: jibo, theme: theme, textures: Object.assign(textures, svgTextures), svgTextures: svgTextures, audio: audio, animationAssets: overrides, cache: cache, live: true });
        }
        try { jibo.loader.load(descriptors, { complete: complete }); } catch (err) { complete(err); }
    })).catch(err => { Object.keys(svgTextures).forEach(name => svgTextures[name].destroy(true)); throw err; });
}
function hookFace(jibo) {
    const container = jibo.face.eye;
    // FaceRenderer replaces the entire EyeContainer after a render failure. Hook
    // its initialization before the asynchronous stock texture load completes.
    const prototype = container.constructor.prototype;
    if (prototype.init && !prototype._beamThemeRecoveryHooked) {
        const originalInit = prototype.init;
        prototype.init = function() {
            if (jibo.face.eye === this) { hookFace(jibo); }
            return originalInit.apply(this, arguments);
        };
        prototype._beamThemeRecoveryHooked = true;
    }
    if (container._beamThemeHooked) { return; }
    const eye = container.eye; const background = container.background;
    [eye, background].forEach((layer, index) => {
        const init = layer.init;
        layer.init = function(texture) {
            if (current && current.live && current.jibo === jibo) {
                texture = index === 0 ? current.textures['face/eye.png'] || current.textures.stockEye :
                    nonEyeThemesEnabled() && current.textures['face/background.png'] || current.textures.stockBackground;
            }
            const result = init.call(this, texture);
            if (current && current.live && current.jibo === jibo && jibo.face.eye === container &&
                eye.initialized && background.initialized) { refreshFace(jibo); }
            return result;
        };
    });
    const originalTexture = container.getTexture;
    container.getTexture = function(value) {
        const override = nonEyeThemesEnabled() && current && current.live && animationAssets.lookup(current.animationAssets, 'atex', value);
        if (override) { return current.textures[override.name]; }
        if (current && current.live && stockEye(value)) { return current.textures['face/eye.png'] || current.textures.stockEye; }
        const texture = originalTexture.call(this, value);
        const resolved = texture && texture.baseTexture && nonEyeThemesEnabled() && current && animationAssets.lookup(current.animationAssets, 'atex', texture.baseTexture.imageUrl);
        return resolved ? current.textures[resolved.name] : texture;
    };
    const originalDefault = eye._isDefaultTexture;
    eye._isDefaultTexture = function(texture, value) { return stockEye(value) || originalDefault.call(this, texture, value); };
    const originalDisplay = eye.display;
    eye.display = function(timestamp, dofs) {
        const result = originalDisplay.call(this, timestamp, dofs);
        const themed = current && current.theme && current.theme.hasFace;
        const custom = themed && (stockEye(dofs.eyeTextureInfixBn_r) || !/\.(png|jpe?g|gif|webp|bmp)$/i.test(dofs.eyeTextureInfixBn_r || ''));
        if (this._beamClosedMesh) { this._beamClosedMesh.visible = !!custom; }
        if (!result || !custom) { restoreListeningFilters(this); this.scale.set(1, 1); this.eyeMesh.alpha = 1; return result; }
        const listening = listeningEye(dofs) ? current.textures['face/eyeListening.png'] : null;
        const open = listening || current.textures['face/eye.png'] || current.textures.stockEye;
        // Texture paths often stay unchanged while only the listening tint changes.
        if (this._texture !== open) { this._applyTexture(open); }
        if (listening) {
            this.eyeMesh.tint = 0xffffff;
            if (this._beamListeningFilters === undefined) {
                this._beamListeningFilters = this.filters || null;
                this.filters = (this.filters || []).filter(filter => filter !== container.lighting && filter !== container.glow);
            }
        } else { restoreListeningFilters(this); }
        const theme = current.theme; const factor = theme.face.eyeSize / 100; this.scale.set(factor, factor);
        const closed = current.textures['face/eyeClosed.png'];
        if (closed) {
            if (!this._beamClosedMesh) {
                // Reuse the native EyeMesh class, including its point-to-vertex updateTransform.
                this._beamClosedMesh = new this.eyeMesh.constructor(closed); this.addChild(this._beamClosedMesh);
            }
            const mesh = this._beamClosedMesh; mesh.texture = closed; mesh.visible = true;
            for (let i = 0; i < this.eyeMesh.points.length; i++) { mesh.points[i].copy(this.eyeMesh.points[i]); }
            const amount = closedAmount(this.eyeMesh.points); this.eyeMesh.alpha = 1 - amount;
            mesh.alpha = amount; mesh.tint = this.eyeMesh.tint;
        } else { this.eyeMesh.alpha = 1; if (this._beamClosedMesh) { this._beamClosedMesh.visible = false; } }
        return result;
    };
    const originalBackground = background.display;
    background.display = function(timestamp, dofs) {
        const result = originalBackground.call(this, timestamp, dofs);
        if (result && nonEyeThemesEnabled() && current && current.theme && current.theme.hasFace) {
            const tex = current.textures['face/background.png'];
            if (tex) { this.sprite.texture = tex; this.sprite.tint = 0xffffff; }
            this.sprite.visible = !!tex;
            if (this._beamSolid) { this._beamSolid.visible = true; }
            if (tex) { this.sprite.width = 1280; this.sprite.height = 720; }
        }
        return result;
    };
    container._beamThemeHooked = true;
}
function restoreButton(button) {
    const iconStock = button._beamIconStock;
    if (iconStock) { iconStock.sprite.texture = iconStock.texture; button._beamIconStock = null; }
    if (!button._beamThemeStock) { return; }
    const stock = button._beamThemeStock;
    (stock.art || []).forEach(item => { item.parent.addChildAt(item.display, item.index); });
    const icon = stock.icon;
    if (icon) {
        if (icon.parent) { icon.parent.addChild(icon.display); }
        else if (icon.display.parent) { icon.display.parent.removeChild(icon.display); }
        icon.display.x = icon.x; icon.display.y = icon.y; icon.display.scale.set(icon.scaleX, icon.scaleY);
    }
    if (button._beamThemeDisplay) { button.display.removeChild(button._beamThemeDisplay); button._beamThemeDisplay.destroy({ children: true }); button._beamThemeDisplay = null; }
    stock.children.forEach((child, i) => { child.visible = stock.visibility[i]; });
    button._content = stock.content; button._dimensions = stock.dimensions;
    button.display.hitArea = stock.hitArea; button._hitArea = stock.internalHitArea;
    button._beamThemeStock = null;
    button._beamThemeButton = null;
}
function colorButton(button) {
    const sprite = button._beamThemeButton;
    if (!sprite || !current || !current.theme || current.theme.menu.buttonColors !== true) { return; }
    // Map artwork luminance between MenuView's shadow and highlight colors.
    // Filter only the artwork: labels/icons and image alpha remain unchanged.
    const defaults = [0x25f2fb, 0x107799];
    const colors = defaults.map((fallback, i) => {
        const value = button.colors && Number(button.colors[i]);
        return typeof value === 'number' && isFinite(value) && value >= 0 && value <= 0xffffff ? value : fallback;
    });
    const matrix = [];
    [16, 8, 0].forEach(shift => {
        const light = ((colors[0] >> shift) & 255) / 255;
        const dark = ((colors[1] >> shift) & 255) / 255;
        const range = light - dark;
        matrix.push(range * 0.2126, range * 0.7152, range * 0.0722, 0, dark);
    });
    matrix.push(0, 0, 0, 1, 0);
    if (!sprite.filters || !sprite.filters.length) { sprite.filters = [new PIXI.filters.ColorMatrixFilter()]; }
    sprite.filters[0].matrix = matrix;
}
function styleButton(button, assets) {
    restoreButton(button);
    const override = themeIcons.button(nonEyeThemesEnabled() && current, button);
    // Keep the native layout for icon-only themes, including cached open menus.
    const iconContainer = button._content && button._content.icon;
    if (override && iconContainer) {
        const sprite = (iconContainer.children || []).filter(child => child.texture && child.texture.baseTexture)[0];
        if (sprite) { button._beamIconStock = { sprite: sprite, texture: sprite._beamIconOriginal || sprite.texture }; sprite.texture = override; }
    }
    const theme = menuTheme();
    if (!theme || !theme.hasMenu || !standardButton(button) || !button.display || !button._content) { return; }
    const texture = current.textures['menu/button.png'];
    const dimensions = geometry(theme, texture || button.dimensions);
    const children = button.display.children.slice();
    button._beamThemeStock = { children: children, visibility: children.map(c => c.visible), content: button._content,
        dimensions: button.dimensions, hitArea: button.display.hitArea, internalHitArea: button._hitArea };
    children.forEach(c => { c.visible = false; });
    const content = new PIXI.Container(); button.display.addChild(content); button._beamThemeDisplay = content; button._content = content;
    if (texture) {
        const sprite = new PIXI.Sprite(texture); sprite.width = dimensions.width; sprite.height = dimensions.height; content.addChild(sprite);
        button._beamThemeButton = sprite; colorButton(button);
    } else {
        // Preserve the stock button art when the theme omits button.png.
        const old = button._beamThemeStock.content;
        const art = new PIXI.Container(); content.addChild(art);
        const saved = old.children.map((child, index) => ({ display: child, parent: old, index: index })).filter(item => item.display !== old.icon);
        button._beamThemeStock.art = saved; saved.forEach(item => { art.addChild(item.display); });
        art.scale.set(dimensions.width / button._beamThemeStock.dimensions.width, dimensions.height / button._beamThemeStock.dimensions.height);
    }
    const iconAsset = override || (assets || button._beamAssets || button._assets || {})[button.iconId];
    let icon;
    if (iconAsset && iconAsset.baseTexture) { icon = new PIXI.Sprite(iconAsset); }
    else if (button.iconMovieClip) {
        // Keep the animated icon alive; restore its parent before destroying themed content.
        icon = button.iconMovieClip;
        button._beamThemeStock.icon = { display: icon, parent: icon.parent, x: icon.x, y: icon.y, scaleX: icon.scale.x, scaleY: icon.scale.y };
    }
    if (icon) {
        const h = icon.height / (icon.scale.y || 1) || 1; const w = icon.width / (icon.scale.x || 1) || 1;
        icon.scale.set(dimensions.iconHeight / h); icon.x = dimensions.iconX - w * icon.scale.x / 2; icon.y = dimensions.iconY - h * icon.scale.y / 2; content.addChild(icon);
    }
    const label = new PIXI.Text(button.label || '', { fontFamily: 'Proxima Nova Light', fontSize: dimensions.textHeight, fill: '#ffffff', align: 'center', wordWrap: true, wordWrapWidth: dimensions.width });
    label.anchor.set(0.5, 0.5); label.x = dimensions.textX; label.y = dimensions.textY; content.addChild(label);
    button._dimensions = { width: dimensions.width, height: dimensions.height };
    const hit = new PIXI.Rectangle(0, 0, dimensions.width, dimensions.height); button._hitArea = hit; button.display.hitArea = hit;
}
function standardButton(button) { return ['SkillButton', 'ActionButton', 'ActionBigButton'].indexOf(button._type) !== -1; }
function standardMenu(view) {
    return view._list && view._list.componentList && view._list.componentList.length && view._list.componentList.every(standardButton);
}
function remember(view) {
    if (!view._beamThemeLayout && view._list) {
        const list = view._list;
        view._beamThemeLayout = { dimensions: list.elementDimensions, count: list.elementsPerPage, buffer: list.elementBuffer,
            axis: list.axisPosition, pan: list.noPan, hint: list.pageHinting, autoFit: list.autoFitElements, title: view._title && view._title.display && view._title.display.visible };
    }
}
function layout(view) {
    const list = view._list; if (!list || !list.componentList || !list.componentList.length) { return; }
    const theme = menuTheme(); const themed = theme && theme.hasMenu && standardMenu(view);
    const dynamic = themed && theme.menu.menuType === 'dynamic';
    if (!dynamic) { menuScroll.disable(list); }
    if (themed) {
        remember(view); const d = geometry(theme, current.textures['menu/button.png'] || list.componentList[0].dimensions);
        list.elementDimensions = { width: d.width, height: d.height }; list.elementBuffer = 30;
        list.elementsPerPage = Math.max(1, Math.floor((1280 - 60) / (d.width + 30)));
        list.axisPosition = 360; list.noPan = false; list.pageHinting = false; list.autoFitElements = false;
        if (view._title && view._title.display) { view._title.display.visible = false; }
    } else if (view._beamThemeLayout) {
        const s = view._beamThemeLayout; list.elementDimensions = s.dimensions; list.elementsPerPage = s.count;
        list.elementBuffer = s.buffer; list.axisPosition = s.axis; list.noPan = s.pan; list.pageHinting = s.hint; list.autoFitElements = s.autoFit;
        if (view._title && view._title.display) { view._title.display.visible = s.title !== false; }
        view._beamThemeLayout = null;
    }
    if (dynamic) { menuScroll.enable(list); }
    list.calculateReferenceValues();
    if (list.container) {
        list.setActivePage(Math.min(list.pageIndex, Math.max(0, list.getPagesCount() - 1)));
        const start = list.getStartIndexByPage(list.pageIndex);
        list.componentList.forEach((button, i) => {
            const x = list.listStartPosition.x + list.elementSpacing * (i - start); const y = list.listStartPosition.y;
            button.setTargetPosition(x, y, true);
            const member = button.getSubcomponent('ListMember');
            if (member) { member.targetPosition.x = x; member.targetPosition.y = y; member.targetOffset = 0; }
        });
        if (list.dynamicElements && list.dynamicElementsPageChange) { list.dynamicElementsPageChange(list.pageIndex); }
        if (typeof list.ready === 'function') { list.ready(); }
        if (dynamic) { menuScroll.refresh(list); }
    }
    if (view._listProgress) {
        const display = view._listProgress.display;
        if (display && dynamic) {
            if (!view._beamThemeProgress) { view._beamThemeProgress = { visible: display.visible }; }
            display.visible = false;
        } else if (display && view._beamThemeProgress) {
            display.visible = view._beamThemeProgress.visible; delete view._beamThemeProgress;
        }
        view._listProgress.updatePage(list.pageIndex, list.getPagesCount());
    }
    (view._buttonLabels || []).forEach(label => { if (label.display) { label.display.visible = !themed; } });
}
function hookMenus(jibo) {
    const views = jibo.face.views; const Button = views.MenuButton; const Menu = views.MenuView;
    if (!Button || !Menu) { throw fail('Shared menu renderer is unavailable'); }
    if (Button.prototype._beamThemeHooked) { return; }
    const setup = Button.prototype.setupDisplay; const destroy = Button.prototype.destroy;
    const empty = Button.prototype.emptyDisplay;
    const colors = Button.prototype.applyColors;
    Button.prototype.applyColors = function() {
        // Keep hidden stock art current too, so None restores the latest colors.
        const content = this._content;
        if (this._beamThemeStock) { this._content = this._beamThemeStock.content; }
        try { colors.apply(this, arguments); } finally { this._content = content; }
        colorButton(this);
    };
    Button.prototype.setupDisplay = function(assets) { restoreButton(this); this._beamAssets = assets; setup.call(this, assets); styleButton(this, assets); };
    Button.prototype.emptyDisplay = function() { restoreButton(this); return empty.call(this); };
    Button.prototype.destroy = function() { restoreButton(this); return destroy.call(this); };
    const position = Menu.prototype.positionComponents;
    Menu.prototype.positionComponents = function(height) {
        if (menuTheme() && current.theme.hasMenu && standardMenu(this)) { remember(this); layout(this); }
        else { layout(this); position.call(this, height); layout(this); }
    };
    const labels = Menu.prototype.updateButtonLabels;
    Menu.prototype.updateButtonLabels = function() {
        if (menuTheme() && current.theme.hasMenu && standardMenu(this)) { (this._buttonLabels || []).forEach(l => { if (l.display) { l.display.visible = false; } }); return; }
        return labels.apply(this, arguments);
    };
    const loaded = Menu.prototype.loaded;
    Menu.prototype.loaded = function() { loaded.call(this); layout(this); menuBackground(this); };
    Button.prototype._beamThemeHooked = true;
}
function menuBackground(view) {
    if (!view._stage) { return; }
    if (view._beamThemeBackground) { view._stage.removeChild(view._beamThemeBackground); view._beamThemeBackground.destroy(); view._beamThemeBackground = null; }
    if (menuTheme() && current.theme.hasMenu && standardMenu(view)) {
        const bg = new PIXI.Graphics(); bg.beginFill(parseInt(current.theme.menu.backgroundColor.slice(1), 16)); bg.drawRect(0, 0, 1280, 720); bg.endFill();
        view._stage.addChildAt(bg, 0); view._beamThemeBackground = bg;
    }
}
function refreshFace(jibo) {
    const c = jibo.face.eye; const themed = current && current.theme && current.theme.hasFace;
    restoreListeningFilters(c.eye);
    c.eye._defaultTexture = current.textures['face/eye.png'] || current.textures.stockEye;
    c.background._defaultTexture = nonEyeThemesEnabled() && current.textures['face/background.png'] || current.textures.stockBackground;
    c.eye.reset(); c.background.reset(); c.eye.scale.set(1, 1); c.eye.eyeMesh.alpha = 1;
    if (c.eye._beamClosedMesh) { c.eye._beamClosedMesh.visible = false; }
    if (c.background._beamSolid) { c.background.removeChild(c.background._beamSolid); c.background._beamSolid.destroy(); c.background._beamSolid = null; }
    c.background.sprite.visible = true;
    if (themed && nonEyeThemesEnabled()) {
        const bg = new PIXI.Graphics(); bg.beginFill(parseInt(current.theme.face.backgroundColor.slice(1), 16)); bg.drawRect(0, 0, 1280, 720); bg.endFill();
        c.background.addChildAt(bg, 0); c.background._beamSolid = bg; c.background.sprite.visible = !!current.textures['face/background.png'];
    }
    if (!themed || !nonEyeThemesEnabled()) { c.background.sprite.scale.set(1, 1); }
    c._previousDofValues = null;
    if (c._currentDofValues) { c.eye.display(Date.now(), c._currentDofValues); c.background.display(Date.now(), c._currentDofValues); }
}
function refresh(jibo) {
    if (iconHook) { iconHook.refresh(); }
    refreshFace(jibo);
    const views = jibo.face.views; const visited = [];
    const components = [];
    function updateComponents(group) {
        if (!group || components.indexOf(group) >= 0) { return; } components.push(group);
        if (standardButton(group) && group.display && group._content) { styleButton(group); }
        (group.componentList || []).forEach(updateComponents);
    }
    function update(view) {
        if (!view || visited.indexOf(view) >= 0) { return; } visited.push(view);
        if (iconHook) { iconHook.track(view._stage); iconHook.track(view.display); }
        updateComponents(view); updateComponents(view._list);
        if (view instanceof views.MenuView && view._list) {
            layout(view);
            if (!menuTheme() || !current.theme.hasMenu) { view.positionComponents(); view.updateButtonLabels(false, false); }
            menuBackground(view);
        }
        update(view.pausedParent);
    }
    update(views.currentView);
    // viewsInProcess is a boolean in the shipped SDK, not a list of views.
    if (views._viewProcess) {
        update(views._viewProcess.currentView); update(views._viewProcess.closingView);
        (views._viewProcess._activeViews || []).forEach(update);
    }
}
function apply(prepared, commit) {
    if (!prepared.live) {
        return Promise.resolve().then(() => { if (commit) { commit(); } current = prepared; live = { live: false, reason: 'Saved for the next Jibo renderer start' }; return live; });
    }
    const previous = current;
    try {
        hookFace(prepared.jibo); hookMenus(prepared.jibo);
        animationAssets.hookSound(prepared.jibo, () => nonEyeThemesEnabled() ? current : null);
        iconHook = themeIcons.hook(PIXI, () => nonEyeThemesEnabled() ? current : null);
        current = prepared; refresh(prepared.jibo);
        // Persistence belongs in the same transaction: retain old textures until it succeeds.
        if (commit) { commit(); }
        live = { live: true, reason: null };
        if (previous && previous.cache) { try { release(previous); } catch (err) { /* cache cleanup */ } }
        return Promise.resolve(live);
    } catch (err) {
        current = previous || Object.assign({}, prepared, { theme: null });
        try { refresh(current.jibo); } catch (ignored) { /* report original failure */ }
        if (previous) { try { release(prepared); } catch (ignored) { /* cache cleanup */ } }
        return Promise.reject(err);
    }
}
function start(restore) {
    if (typeof window === 'undefined') { live = { live: false, reason: 'Standalone BEacon has no face renderer' }; return; }
    if (retryTimer) { return; }
    function attempt() {
        retryTimer = null;
        Promise.resolve().then(restore).catch(err => {
            live = { live: false, reason: err.message };
            if (/not ready/.test(err.message)) { retryTimer = setTimeout(attempt, 2000); }
            else { console.warn('[themes] startup:', err.message); }
        });
    }
    attempt();
}
function release(prepared) {
    prepared.jibo.loader.deleteCache(prepared.cache);
    Object.keys(prepared.svgTextures || {}).forEach(name => prepared.svgTextures[name].destroy(true));
}
function discard(prepared) {
    if (prepared && prepared.cache && prepared !== current) { release(prepared); }
}
module.exports = { prepare: prepare, apply: apply, discard: discard, start: start, status: () => live,
    closedAmount: closedAmount, geometry: geometry, stockEye: stockEye, enterSkill: enterSkill, leaveSkill: leaveSkill };
