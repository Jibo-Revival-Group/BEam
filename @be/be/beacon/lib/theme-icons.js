'use strict';

function filename(value) { return String(value || '').replace(/\\/g, '/').split(/[?#]/)[0].split('/').pop(); }
function lookup(active, value) {
    if (!active || !active.theme) { return null; }
    const name = filename(value);
    if (!/\.(png|svg)$/.test(name)) { return null; }
    const stem = name.replace(/\.(png|svg)$/, '');
    const entry = (active.theme.icons || []).filter(n => n.slice(6).replace(/\.(png|svg)$/, '') === stem)[0];
    return entry && active.textures[entry] || null;
}
// Hook the shared sprite API as well as MenuButton: custom skills can use their
// own layouts and cached textures. Always retain the original requested texture.
function hook(PIXI, selection) {
    const proto = PIXI.Sprite.prototype;
    if (proto._beamIconHook) { return proto._beamIconHook; }
    const descriptor = Object.getOwnPropertyDescriptor(proto, 'texture');
    if (!descriptor || !descriptor.get || !descriptor.set || !descriptor.configurable) { return { refresh: function() {}, track: function() {} }; }
    const sprites = [];
    function choose(texture) { return lookup(selection(), texture && texture.baseTexture && texture.baseTexture.imageUrl) || texture; }
    Object.defineProperty(proto, 'texture', {
        configurable: true, enumerable: descriptor.enumerable,
        get: descriptor.get,
        set: function(texture) {
            this._beamIconOriginal = texture;
            if (texture && /\.(png|svg)$/.test(filename(texture.baseTexture && texture.baseTexture.imageUrl)) && sprites.indexOf(this) < 0) { sprites.push(this); }
            descriptor.set.call(this, choose(texture));
        }
    });
    const destroy = proto.destroy;
    proto.destroy = function() {
        const index = sprites.indexOf(this); if (index >= 0) { sprites.splice(index, 1); }
        this._beamIconOriginal = null;
        return destroy.apply(this, arguments);
    };
    const hook = { track: function(root) {
        if (!root) { return; }
        if (root instanceof PIXI.Sprite) { root.texture = root._beamIconOriginal || root.texture; }
        (root.children || []).forEach(hook.track);
    }, refresh: function() { sprites.slice().forEach(sprite => descriptor.set.call(sprite, choose(sprite._beamIconOriginal))); } };
    proto._beamIconHook = hook; return hook;
}
function button(active, target) {
    const custom = filename(target.iconId) === 'icon.png' && /^@be\/[a-z0-9-]+$/.test(target.id || '') ? target.id.slice(4) + '.png' : null;
    return (custom && lookup(active, custom)) || lookup(active, target.iconId);
}
module.exports = { lookup: lookup, button: button, hook: hook };
