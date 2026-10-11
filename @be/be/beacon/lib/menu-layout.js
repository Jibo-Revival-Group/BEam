'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const paths = require('./paths');
const pkg = require('./theme-package');
const custom = require('./custom-skills');

function create(options) {
    const opts = options || {}, root = opts.root || path.join(paths.dataDir(), 'menu');
    const menuRoot = path.join(paths.skillsRoot(), 'main-menu');
    const customSkills = opts.skills || custom;
    function config(file) { return JSON.parse(fs.readFileSync(path.join(menuRoot, 'resources/views', file), 'utf8')); }
    const main = config('main-menu-verbal.json');
    const folders = { fun: config('fun-stuff-verbal.json'), 'personal-report': config('personal-report-verbal.json') };
    function destination(button) { return button.action.data.utterance.entities.destination; }
    const built = [];
    [main].concat(Object.keys(folders).map(k => folders[k])).forEach(c => c.viewConfig.list.forEach(b => {
        if (!folders[destination(b)] && !built.some(s => s.id === destination(b))) { built.push(Object.assign({}, b, { id: destination(b), type: 'skill', icon: b.iconSrc, colors: (b.colors || c.viewConfig.listDefault.colors || ['0x58BCEB', '0x246487']).map(color => color.replace(/^0x/i, '#')) })); }
    }));
    function available() {
        return built.concat(customSkills.inventory().skills.map(s => ({ id: s.packageName, type: 'skill', label: s.manifest.name,
            colors: s.manifest.buttonColor, icon: customSkills.asset(s.id, 'icon.png'), customId: s.id })));
    }
    function initial() {
        return main.viewConfig.list.map(b => {
            const id = destination(b);
            return folders[id] ? { type: 'folder', id: 'folder-' + id, name: b.label, colors: b.colors.map(c => c.replace(/^0x/i, '#')), icon: b.iconSrc,
                children: folders[id].viewConfig.list.map(child => ({ type: 'skill', id: destination(child) })) } : { type: 'skill', id: id };
        });
    }
    function write(tree) {
        paths.ensureDir(root); const file = path.join(root, 'layout.json'), temp = file + '.tmp';
        fs.writeFileSync(temp, JSON.stringify({ tree: tree }, null, 2)); fs.renameSync(temp, file);
    }
    function read() {
        const file = path.join(root, 'layout.json');
        if (!fs.existsSync(file)) { return initial(); }
        const data = JSON.parse(fs.readFileSync(file, 'utf8'));
        if (!Array.isArray(data.tree)) { throw pkg.fail('Saved menu layout is unreadable'); } return data.tree;
    }
    function icons() { return fs.readdirSync(path.join(menuRoot, 'resources/icons')).filter(n => /\.png$/.test(n)).map(n => 'resources/icons/' + n); }
    function validIcon(icon) { return icons().indexOf(icon) >= 0 || typeof icon === 'string' && /^custom-[a-f0-9]{24}\.png$/.test(icon) && fs.existsSync(path.join(root, 'icons', icon)); }
    function normalize(tree, strict) {
        const skills = available(), ids = Object.create(null), seen = Object.create(null); let count = 0;
        skills.forEach(s => { ids[s.id] = true; });
        function walk(list, depth) {
            if (!Array.isArray(list) || depth > 5 || list.length > 200) { throw pkg.fail('Invalid menu folders'); }
            const result = [];
            list.forEach(n => {
                if (!n || typeof n.id !== 'string' || ++count > 300 || seen[n.id]) { throw pkg.fail('Duplicate or invalid menu item'); }
                seen[n.id] = true;
                if (n.type === 'skill') {
                    if (!ids[n.id]) { if (strict) { throw pkg.fail('Skill is no longer installed; reload the menu editor'); } return; }
                    result.push({ type: 'skill', id: n.id });
                } else if (n.type === 'folder') {
                    if (!/^folder-[a-z0-9-]{1,90}$/.test(n.id) || typeof n.name !== 'string' || !n.name.trim() || n.name.length > 80 || /[\u0000-\u001f]/.test(n.name) ||
                        !Array.isArray(n.colors) || n.colors.length !== 2 || n.colors.some(c => !/^#[a-f0-9]{6}$/i.test(c)) || !validIcon(n.icon)) { throw pkg.fail('Invalid folder name, colors or icon'); }
                    const children = walk(n.children, depth + 1);
                    if (children.length) { result.push({ type: 'folder', id: n.id, name: n.name.trim(), colors: n.colors, icon: n.icon, children: children }); }
                } else { throw pkg.fail('Invalid menu item type'); }
            }); return result;
        }
        const out = walk(tree, 0);
        skills.forEach(s => { if (!seen[s.id]) { out.unshift({ type: 'skill', id: s.id }); } });
        return out;
    }
    function sync() { const tree = normalize(read(), false); write(tree); return inventory(); }
    function inventory() {
        return { tree: normalize(read(), false), skills: available().map(s => Object.assign({}, s, {
            iconUrl: s.customId ? '/api/skills/asset?id=' + encodeURIComponent(s.customId) + '&name=icon.png' : '/api/menu/icon?name=' + encodeURIComponent(s.icon)
        })), icons: icons() };
    }
    function save(tree) { const normalized = normalize(tree, true); write(normalized); return inventory(); }
    function icon(name) {
        if (!validIcon(name)) { throw pkg.fail('Unknown menu icon'); }
        return name.indexOf('custom-') === 0 ? path.join(root, 'icons', name) : path.join(menuRoot, name);
    }
    function uploadIcon(buf) { return pkg.png(buf, 'Folder icon').then(() => {
        const name = 'custom-' + crypto.createHash('sha256').update(buf).digest('hex').slice(0, 24) + '.png';
        paths.ensureDir(path.join(root, 'icons')); fs.writeFileSync(path.join(root, 'icons', name), buf); return { icon: name };
    }); }
    function view(folderId) {
        const data = inventory(), map = Object.create(null); data.skills.forEach(s => { map[s.id] = s; });
        let nodes = data.tree, title = null;
        function find(list) { for (let i = 0; i < list.length; i++) { const n = list[i]; if (n.type === 'folder') { if (n.id === folderId) { return n; } const child = find(n.children); if (child) { return child; } } } return null; }
        if (folderId) { const folder = find(data.tree); if (folder) { nodes = folder.children; title = folder.name; } }
        function button(n) {
            const source = n.type === 'folder' ? n : map[n.id], dest = n.type === 'folder' ? '__folder:' + n.id : n.id;
            return { id: dest, label: source.label || source.name, colors: source.colors.map(c => c.replace('#', '0x')),
                iconSrc: source.customId ? source.icon : source.icon.indexOf('custom-') === 0 ? icon(source.icon) : source.icon,
                action: { type: 'utterance', data: { utterance: { intent: 'loadMenu', entities: { destination: dest } } } } };
        }
        const result = JSON.parse(JSON.stringify(main)); result.viewConfig.list = nodes.map(button);
        // MimBehavior reuses the current view when IDs match. A folder/layout
        // change must create a fresh shared MenuView instead of reusing old buttons.
        result.viewConfig.id = 'main-menu-' + crypto.createHash('sha256').update(JSON.stringify(data.tree) + JSON.stringify(customSkills.inventory().skills.map(s => s.revision))).digest('hex').slice(0, 12);
        if (title) { result.viewConfig.title = title; }
        return result;
    }
    // Back uses an existing stock icon and the same MenuView action contract.
    const back = { id: '__back', type: 'skill', label: 'Back', colors: ['#BBC6CA', '#434D55'], icon: 'resources/icons/fun-stuff.png' };
    // Kept separate from editable inventory: users cannot reorder/delete navigation.
    function configView(folderId) {
        if (!folderId) { return view(null); }
        const result = view(null), data = inventory(); let folder;
        function find(list) { list.forEach(n => { if (n.type === 'folder') { if (n.id === folderId) { folder = n; } find(n.children); } }); } find(data.tree);
        if (!folder) { return result; }
        result.viewConfig.id += '-' + folder.id;
        const selected = Object.create(null); data.skills.forEach(s => { selected[s.id] = s; });
        result.viewConfig.title = folder.name;
        result.viewConfig.list = [back].concat(folder.children.map(n => n.type === 'folder' ? { id: '__folder:' + n.id, label: n.name, colors: n.colors, icon: n.icon } : selected[n.id])).map(s => ({
            id: s.id, label: s.label, colors: s.colors.map(c => c.replace('#', '0x')), iconSrc: s.customId ? s.icon : s.icon.indexOf('custom-') === 0 ? icon(s.icon) : s.icon,
            action: { type: 'utterance', data: { utterance: { intent: 'loadMenu', entities: { destination: s.id } } } }
        })); return result;
    }
    function choose(skill, destination) {
        const stack = skill._beamMenuStack || (skill._beamMenuStack = []);
        if (destination === 'fun' || destination === 'personal-report') { destination = '__folder:folder-' + destination; }
        if (destination.indexOf('__folder:') === 0) { stack.push(destination.slice(9)); return '__menu'; }
        if (destination === '__back') { stack.pop(); return '__menu'; }
        return destination;
    }
    return { inventory: inventory, save: save, sync: sync, icon: icon, uploadIcon: uploadIcon, view: configView, choose: choose };
}
module.exports = Object.assign(create(), { create: create });
