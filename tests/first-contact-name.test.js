'use strict';
// First contact asks "What's your name?" when the loop has nobody (or only BEacon's placeholder) and saves the answer;
// the tutorial's touch section ends by pointing at the Shortcuts shade.
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const Module = require('module');

const skills = path.join(__dirname, '../@be/be/skills');
const saved = [];
const people = {
    PLACEHOLDER_OWNER: { firstName: 'FirstName', lastName: 'LastName' },
    updateMember: (id, fields) => { saved.push(['rename', id, fields]); return Promise.resolve(); },
    createMember: (fields) => { saved.push(['create', fields]); return Promise.resolve('new-id'); },
    setOwner: (id) => { saved.push(['owner', id]); return Promise.resolve(); }
};
const load = Module._load;
Module._load = function (request, parent) {
    if (/beacon\/lib\/people$/.test(request)) return people;
    return load.apply(this, arguments);
};
const askName = require(path.join(skills, 'first-contact/ask-name'));

// Names.
assert.deepStrictEqual(askName.parseName('my name is zane vincent.'), { firstName: 'Zane', lastName: 'Vincent' });
assert.deepStrictEqual(askName.parseName("Hi, I'm Pou"), { firstName: 'Pou', lastName: null });
assert.deepStrictEqual(askName.parseName('kevin'), { firstName: 'Kevin', lastName: null });
assert.strictEqual(askName.parseName(''), null);
assert.strictEqual(askName.parseName('no'), null);
assert.strictEqual(askName.parseName('what time is it right now'), null);

// The flow module from the first-contact bundle (the subflow with "Say Loop Names").
const src = fs.readFileSync(path.join(skills, 'first-contact/index.js'), 'utf8');
const at = src.indexOf("'name': 'F C_ Say Loop Names'");
const start = src.lastIndexOf("'use strict';", at);
const body = src.slice(start, src.indexOf('},{', at));
function flow(loop) {
    const mod = { exports: {} };
    const jibo = { kb: { loop: { loadLoop: (cb) => cb(null, loop) } } };
    new Function('require', 'module', 'exports', 'jibo', body)((name) => name === './ask-name' ? askName : require(name), mod, mod.exports, jibo);
    const notepad = {};
    const blackboard = { attentionHandler: { release() {} }, log: { info() {}, warn() {} } };
    const tree = mod.exports(blackboard, notepad, {}, null);
    const node = (name) => { const k = Object.keys(tree).filter((id) => typeof tree[id] === 'function' && tree[id]().name === name)[0]; return tree[k](); };
    return { notepad: notepad, node: node };
}
const placeholder = { id: 'p1', isJibo: false, data: { firstName: 'FirstName', lastName: 'LastName', status: 'accepted' }, toString: () => 'FirstName' };
const robot = { id: 'r1', isJibo: true, data: {}, toString: () => 'Jibo' };
const zane = { id: 'z1', isJibo: false, data: { firstName: 'Zane', status: 'accepted' }, toString: () => 'Zane' };

// Nobody but the placeholder: Jibo asks, hears a name, renames the placeholder and greets them.
let f = flow([robot, placeholder]);
let next;
f.node('initialize stuff').options.exec((t) => { next = t; });
assert.deepStrictEqual(f.notepad.loopNames, [], 'the placeholder is nobody');
assert.strictEqual(f.node('F C_ Say Loop Names').transitions[0].to, '5x1-need-name');
assert.strictEqual(f.node('nobody in the loop?').options.Script(), 'ask');
f.node('F C_ Whats Your Name').options.onSuccess({ asrResults: { text: 'my name is zane' } });
f.node('save the name').options.exec((t) => { next = t; });
setImmediate(() => {
    assert.strictEqual(next, 'saved');
    assert.deepStrictEqual(saved, [['rename', 'p1', { firstName: 'Zane', lastName: null }]]);
    assert.deepStrictEqual(f.node('F C_ Nice To Meet You').options.getPromptData(), { name: 'Zane' });

    // Someone already in the loop: no question.
    f = flow([robot, zane]);
    f.node('initialize stuff').options.exec(() => {});
    assert.deepStrictEqual(f.notepad.loopNames, ['Zane']);
    assert.strictEqual(f.node('nobody in the loop?').options.Script(), '');

    // No answer (or not a name): nothing saved, first contact carries on.
    saved.length = 0;
    f = flow([robot]);
    f.node('initialize stuff').options.exec(() => {});
    f.node('F C_ Whats Your Name').options.onSuccess({ asrResults: { text: '' } });
    f.node('save the name').options.exec((t) => { next = t; });
    assert.strictEqual(next, '');
    assert.deepStrictEqual(saved, []);

    // An empty loop without a placeholder: add the person and make them the owner.
    askName.save({ firstName: 'Vic', lastName: null }, [robot]).then(() => {
        assert.deepStrictEqual(saved, [['create', { firstName: 'Vic', lastName: null }], ['owner', 'new-id']]);

        // Tutorial: after the menu part, Jibo points at the Shortcuts shade, then the touch section ends.
        const tut = fs.readFileSync(path.join(skills, 'tutorial/index.js'), 'utf8');
        const release = tut.slice(tut.indexOf("'name': 'Release Mode'"), tut.indexOf("'name': 'Release Mode'") + 300);
        assert.ok(/'to': '5x1-touch-shortcuts'/.test(release), 'Release Mode leads to the shortcuts tip');
        assert.ok(/'mimPath': 'mims\/en-us\/Tut_TouchShortcuts.mim'/.test(tut));
        ['first-contact/mims/en-us/oobe/FC_WhatsYourName.mim', 'first-contact/mims/en-us/oobe/FC_NiceToMeetYou.mim', 'tutorial/mims/en-us/Tut_TouchShortcuts.mim']
            .forEach((m) => assert.ok(JSON.parse(fs.readFileSync(path.join(skills, m), 'utf8')).prompts.length));
        console.log('first-contact name + shortcuts tip ok');
    }).catch((e) => { console.error(e); process.exit(1); });
});
