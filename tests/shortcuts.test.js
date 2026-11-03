'use strict';
// Shortcut shade: the favorite skill BEacon saves, and the idle eye's pull-down card.
const assert = require('assert'), fs = require('fs'), path = require('path'), os = require('os'), Module = require('module');
const menu = require('../@be/be/beacon/lib/menu-layout');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'shortcuts-'));
const layout = menu.create({ root, skills: { inventory: () => ({ skills: [] }) } });

try {
    assert.strictEqual(layout.favorite(), null, 'no favorite until one is chosen');
    assert.strictEqual(layout.inventory().favorite, null);
    assert.strictEqual(layout.setFavorite('dance').favorite, 'dance');
    const fav = layout.favorite();
    assert.strictEqual(fav.id, 'dance'); assert(fav.label); assert(fav.colors.every(c => typeof c === 'number'));
    assert(path.isAbsolute(fav.iconSrc), 'built-in icons resolve inside main-menu');
    assert.throws(() => layout.setFavorite('@be/not-installed'), /no longer installed/);
    assert.strictEqual(layout.favorite().id, 'dance', 'a rejected favorite keeps the old one');
    fs.writeFileSync(path.join(root, 'favorite.json'), JSON.stringify({ id: '@be/forgotten' }));
    assert.strictEqual(layout.favorite(), null, 'a forgotten skill reads as no favorite');
    assert.strictEqual(layout.setFavorite(null).favorite, null);

    const server = fs.readFileSync(path.resolve(__dirname, '../@be/be/beacon/server.js'), 'utf8');
    assert(/'POST \/api\/menu\/favorite': guard\(/.test(server), 'BEacon saves the favorite through a guarded route');

    // The shade module loads on Node 6 syntax with the robot modules stubbed.
    const load = Module._load;
    Module._load = function (name) { return name === 'jibo' || name === '@be/be-framework' ? {} : load.apply(this, arguments); };
    let Shortcuts;
    try { Shortcuts = require('../@be/be/skills/idle/shortcuts'); } finally { Module._load = load; }
    const shade = new Shortcuts(() => {}, { warn() {} }, () => true);
    assert.strictEqual(shade.consumesTap(), false, 'a closed, untouched shade lets taps through to the eye');
    shade.offset = 10; assert.strictEqual(shade.consumesTap(), true, 'an open shade eats the tap');

    const idle = fs.readFileSync(path.resolve(__dirname, '../@be/be/skills/idle/index.js'), 'utf8');
    assert(/CircadianState\.ALERT \|\| state === jibo_common_types_1\.CircadianState\.RELAXED/.test(idle), 'shade only while Jibo is awake');
    assert(/privacyController && jibo\.privacyController\.enabled/.test(idle), 'no shade in privacy mode');
    assert(/this\.shortcuts\.detach\(\)/.test(idle), 'idle removes the shade when it closes');
    console.log('Shortcut favorite (set, rejected, forgotten, cleared), route, shade tap handling and idle gating passed');
} finally {
    fs.rmSync ? fs.rmSync(root, { recursive: true, force: true }) : null;
}
