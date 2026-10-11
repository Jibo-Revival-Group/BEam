'use strict';

const path = require('path');
const paths = require('./paths');
const fail = require('./theme-package').fail;
const menuScroll = require('./theme-menu-scroll');
let current = null;
let live = { live: false, reason: 'Renderer has not started' };
let retryTimer = null;

function stockEye(value) {
    return /^(default_eye|white_eye|white-eye|jibo_eye_customizer_00|jibo_eye_customizer_38)\.png$/i.test(String(value || '').split(/[/\\]/).pop());
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
        Object.keys(theme.images).forEach(name => descriptors.push({ id: name, src: path.join(dir, name), type: 'texture', cache: cache }));
    }
    return new Promise((resolve, reject) => {
        jibo.loader.addCache(cache);
        let finished = false;
        const timeout = setTimeout(() => complete(fail('Theme texture loading timed out')), 15000);
        function complete(err, textures) {
            if (finished) { return; } finished = true; clearTimeout(timeout);
            if (err || !textures || descriptors.some(a => !textures[a.id])) {
                try { jibo.loader.deleteCache(cache); } catch (ignored) { /* already removed */ }
                reject(err || fail('Theme texture loading failed')); return;
            }
            resolve({ jibo: jibo, theme: theme, textures: textures, cache: cache, live: true });
        }
        try { jibo.loader.load(descriptors, { complete: complete }); } catch (err) { complete(err); }
    });
}
function hookFace(jibo) {
    const container = jibo.face.eye;
    if (container._beamThemeHooked) { return; }
    const eye = container.eye; const background = container.background;
    const originalTexture = container.getTexture;
    container.getTexture = function(value) {
        if (current && current.live && stockEye(value)) { return current.textures['face/eye.png'] || current.textures.stockEye; }
        return originalTexture.call(this, value);
    };
    const originalDefault = eye._isDefaultTexture;
    eye._isDefaultTexture = function(texture, value) { return stockEye(value) || originalDefault.call(this, texture, value); };
    const originalDisplay = eye.display;
    eye.display = function(timestamp, dofs) {
        const result = originalDisplay.call(this, timestamp, dofs);
        const themed = current && current.theme && current.theme.hasFace;
        const custom = themed && (stockEye(dofs.eyeTextureInfixBn_r) || !/\.(png|jpe?g|gif|webp|bmp)$/i.test(dofs.eyeTextureInfixBn_r || ''));
        if (this._beamClosedMesh) { this._beamClosedMesh.visible = !!custom; }
        if (!result || !custom) { this.scale.set(1, 1); this.eyeMesh.alpha = 1; return result; }
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
        if (result && current && current.theme && current.theme.hasFace) {
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
}
function styleButton(button, assets) {
    restoreButton(button);
    const theme = current && current.theme;
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
    } else {
        // Preserve the stock button art when the theme omits button.png.
        const old = button._beamThemeStock.content;
        const art = new PIXI.Container(); content.addChild(art);
        const saved = old.children.map((child, index) => ({ display: child, parent: old, index: index })).filter(item => item.display !== old.icon);
        button._beamThemeStock.art = saved; saved.forEach(item => { art.addChild(item.display); });
        art.scale.set(dimensions.width / button._beamThemeStock.dimensions.width, dimensions.height / button._beamThemeStock.dimensions.height);
    }
    const iconAsset = (assets || button._beamAssets || button._assets || {})[button.iconId];
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
    const theme = current && current.theme; const themed = theme && theme.hasMenu && standardMenu(view);
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
    Button.prototype.setupDisplay = function(assets) { restoreButton(this); this._beamAssets = assets; setup.call(this, assets); styleButton(this, assets); };
    Button.prototype.emptyDisplay = function() { restoreButton(this); return empty.call(this); };
    Button.prototype.destroy = function() { restoreButton(this); return destroy.call(this); };
    const position = Menu.prototype.positionComponents;
    Menu.prototype.positionComponents = function(height) {
        if (current && current.theme && current.theme.hasMenu && standardMenu(this)) { remember(this); layout(this); }
        else { layout(this); position.call(this, height); layout(this); }
    };
    const labels = Menu.prototype.updateButtonLabels;
    Menu.prototype.updateButtonLabels = function() {
        if (current && current.theme && current.theme.hasMenu && standardMenu(this)) { (this._buttonLabels || []).forEach(l => { if (l.display) { l.display.visible = false; } }); return; }
        return labels.apply(this, arguments);
    };
    const loaded = Menu.prototype.loaded;
    Menu.prototype.loaded = function() { loaded.call(this); layout(this); menuBackground(this); };
    Button.prototype._beamThemeHooked = true;
}
function menuBackground(view) {
    if (!view._stage) { return; }
    if (view._beamThemeBackground) { view._stage.removeChild(view._beamThemeBackground); view._beamThemeBackground.destroy(); view._beamThemeBackground = null; }
    if (current && current.theme && current.theme.hasMenu && standardMenu(view)) {
        const bg = new PIXI.Graphics(); bg.beginFill(parseInt(current.theme.menu.backgroundColor.slice(1), 16)); bg.drawRect(0, 0, 1280, 720); bg.endFill();
        view._stage.addChildAt(bg, 0); view._beamThemeBackground = bg;
    }
}
function refresh(jibo) {
    const c = jibo.face.eye; const themed = current && current.theme && current.theme.hasFace;
    c.eye._defaultTexture = current.textures['face/eye.png'] || current.textures.stockEye;
    c.background._defaultTexture = current.textures['face/background.png'] || current.textures.stockBackground;
    c.eye.reset(); c.background.reset(); c.eye.scale.set(1, 1); c.eye.eyeMesh.alpha = 1;
    if (c.eye._beamClosedMesh) { c.eye._beamClosedMesh.visible = false; }
    if (c.background._beamSolid) { c.background.removeChild(c.background._beamSolid); c.background._beamSolid.destroy(); c.background._beamSolid = null; }
    c.background.sprite.visible = true;
    if (themed) {
        const bg = new PIXI.Graphics(); bg.beginFill(parseInt(current.theme.face.backgroundColor.slice(1), 16)); bg.drawRect(0, 0, 1280, 720); bg.endFill();
        c.background.addChildAt(bg, 0); c.background._beamSolid = bg; c.background.sprite.visible = !!current.textures['face/background.png'];
    }
    if (!themed) { c.background.sprite.scale.set(1, 1); }
    c._previousDofValues = null;
    if (c._currentDofValues) { c.eye.display(Date.now(), c._currentDofValues); c.background.display(Date.now(), c._currentDofValues); }
    const views = jibo.face.views; const visited = [];
    function update(view) {
        if (!view || visited.indexOf(view) >= 0) { return; } visited.push(view);
        if (view instanceof views.MenuView && view._list) {
            view._list.componentList.forEach(b => { if (b.display && b._content) { styleButton(b); } });
            layout(view);
            if (!current.theme || !current.theme.hasMenu) { view.positionComponents(); view.updateButtonLabels(false, false); }
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
        hookFace(prepared.jibo); hookMenus(prepared.jibo); current = prepared; refresh(prepared.jibo);
        // Persistence belongs in the same transaction: retain old textures until it succeeds.
        if (commit) { commit(); }
        live = { live: true, reason: null };
        if (previous && previous.cache) { try { prepared.jibo.loader.deleteCache(previous.cache); } catch (err) { /* cache cleanup */ } }
        return Promise.resolve(live);
    } catch (err) {
        current = previous || Object.assign({}, prepared, { theme: null });
        try { refresh(current.jibo); } catch (ignored) { /* report original failure */ }
        if (previous) { try { prepared.jibo.loader.deleteCache(prepared.cache); } catch (ignored) { /* cache cleanup */ } }
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
module.exports = { prepare: prepare, apply: apply, start: start, status: () => live,
    closedAmount: closedAmount, geometry: geometry, stockEye: stockEye };
