'use strict';
const assert = require('assert'), fs = require('fs'), path = require('path'), os = require('os');
const menu = require('../@be/be/beacon/lib/menu-layout');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'menu-runtime-'));
const layout = menu.create({ root, skills: { inventory: () => ({ skills: [] }) } });
const source = fs.readFileSync(path.resolve(__dirname, '../@be/be/skills/main-menu/index.js'), 'utf8');
const flowText = source.slice(source.indexOf("'use strict';"), source.indexOf('},{}],2:[function'));
const flowModule = { exports: {} };
new Function('require', 'module', 'exports', flowText)(name => { assert.strictEqual(name, '../../beacon/lib/menu-layout'); return layout; }, flowModule, flowModule.exports);
const skill = {}, blackboard = { skill, log: { debug() {}, warn() {} } }, flow = flowModule.exports(blackboard);
const mainId = 'b32b43a7-5ff2-44c8-a7b3-f7691433934b', node = flow[mainId]();
const transitions = [];
function selected(id) { return node.options.onItemChosen({ entities: { destination: id } }, { getComponentByIndex: () => ({ getComponentById: () => ({ id }), actionHandler() {} }) }, value => transitions.push(value)); }
try {
    let initial; node.options.getConfig(c => { initial = c; }); assert(initial.viewConfig.list.some(b => b.id === '__folder:folder-fun'));
    assert.strictEqual(selected('__folder:folder-fun'), '__menu');
    let folder; node.options.getConfig(c => { folder = c; }); assert.notStrictEqual(folder.viewConfig.id, initial.viewConfig.id, 'SDK must create a fresh folder view');
    assert(folder.viewConfig.list.some(b => b.id === 'dance')); assert.strictEqual(selected('dance'), 'dance');
    assert.strictEqual(selected('__back'), '__menu'); let back; node.options.getConfig(c => { back = c; }); assert.strictEqual(back.viewConfig.id, initial.viewConfig.id);
    assert(node.transitions.some(t => t.value === '__menu' && t.to === mainId)); assert(node.exceptions.some(t => t.value === '__menu' && t.to === mainId));
    selected('__folder:folder-fun'); assert.strictEqual(node.options.onMenuClosed(false, null, () => {}, '~InteractionError.MenuClosed'), '__menu'); assert.strictEqual(skill._beamMenuStack.length, 0);
    const tree = layout.inventory().tree; tree.reverse(); layout.save(tree); let edited; node.options.getConfig(c => { edited = c; }); assert.notStrictEqual(edited.viewConfig.id, initial.viewConfig.id, 'SDK must refresh changed layouts');
    // Run the actual shipped MainMenu redirect method with a minimal BeSkill facade.
    const start = source.indexOf('"use strict";', source.indexOf('},{}],2:[function'));
    const end = source.indexOf('},{"./flows/main":1', start);
    const skillModule = { exports: {} }; let redirected;
    const jibo = { face: { views: { TRANSITION: { UP: 'up' }, changeView: (opts, callback) => callback() } } };
    class BeSkill { constructor() { this.log = { debug() {}, warn() {}, info() {} }; } redirect(id, opts) { redirected = { id, opts }; } }
    new Function('require', 'module', 'exports', source.slice(start, end))(name => name === '@be/be-framework' ? { BeSkill } : name === 'jibo' ? jibo : name === './flows/main' ? flowModule.exports : require(name), skillModule, skillModule.exports);
    const main = new skillModule.exports(); main.redirectToSkill('@be/bad-apple'); assert.strictEqual(redirected.id, '@be/bad-apple');
    main.skillChosen = false; main.redirectToSkill('clock'); assert.strictEqual(redirected.id, '@be/clock');
    // All cloud menu buttons use the same synthetic-turn path. Runtime context
    // is attached by JetStream and must be honored by the cloud before execution.
    let cloudRequest, listenDisabled = 0;
    jibo.embodied = { listen: { disableOnce() { listenDisabled++; } } };
    jibo.jetstream = { mimicGlobalTurn(options) { cloudRequest = options; return Promise.resolve(); } };
    const cloudButtons = {
        'full-report': 'personal report',
        weather: 'tell me about the weather',
        news: 'tell me about the news',
        calendar: 'tell me about my calendar',
        commute: 'what does my commute look like',
        joke: 'tell me a joke',
        dance: 'do a dance',
        surprise: 'surprise me'
    };
    Object.keys(cloudButtons).forEach(button => {
        main.skillChosen = false;
        assert.strictEqual(main.redirectToSkill(button), true);
        assert.deepStrictEqual(cloudRequest, { clientASR: cloudButtons[button] });
    });
    assert.strictEqual(listenDisabled, Object.keys(cloudButtons).length);
    console.log('Shipped main-menu folder/back routing, layout refresh, skill redirects and cloud button requests passed');
} finally { fs.rmSync(root, { recursive: true, force: true }); }
