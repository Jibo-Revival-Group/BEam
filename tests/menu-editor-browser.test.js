'use strict';
const assert = require('assert'), http = require('http'), fs = require('fs'), path = require('path'), os = require('os');
const { chromium } = require('playwright');
const menu = require('../@be/be/beacon/lib/menu-layout');
const fixture = require('./theme-fixtures');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'beam-menu-browser-'));
const layout = menu.create({ root: temp, skills: { inventory: () => ({ skills: [] }) } });
const root = path.resolve(__dirname, '../@be/be/beacon/public');
let installed = false, installFailed = true, saved = null, githubConnected = false;
let menuSaveAttempts = 0, failNextMenuSave = false, delayNextMenuSave = false, pendingMenuResponse = null;
const uploadedIcons = [];
const skill = { id: 'bad-apple', revision: 'revision', packageName: '@be/bad-apple', manifest: { name: 'Bad Apple', version: '1.0.0', type: 'skill', buttonColor: ['#58586D', '#282735'] }, images: { 'banner.png': {} }, compatibility: { status: 'compatible' }, origin: { url: 'https://github.com/example/BadApple' } };
const entries = [{ id: 'skill-entry', name: 'Bad Apple', type: 'skill', url: skill.origin.url, developer: 'example', stars: 42, manifest: skill.manifest, compatibility: { status: 'compatible' }, description: 'Bad Apple on Jibo.' },
    { id: 'theme-entry', name: 'Astra', type: 'theme', developer: 'theme-dev', stars: 12, manifest: { name: 'Astra', version: '1.0.0', type: 'theme' }, compatibility: { status: 'compatible' }, description: 'An example theme.' }];
const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname.startsWith('/api/')) {
        const chunks = []; req.on('data', b => chunks.push(b)); req.on('end', () => {
            let data = {};
            try {
                if (url.pathname === '/api/menu/icon') {
                    if (req.method === 'PUT') {
                        const png = Buffer.concat(chunks);
                        layout.uploadIcon(png).then(data => { uploadedIcons.push([png.readUInt32BE(16), png.readUInt32BE(20)]); res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(data)); }, err => { res.writeHead(400, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: err.message })); }); return;
                    }
                    res.setHeader('Content-Type', 'image/png'); res.end(fs.readFileSync(layout.icon(url.searchParams.get('name')))); return;
                }
                if (url.pathname === '/api/skills/asset') { res.setHeader('Content-Type', 'image/png'); res.end(fixture.png()); return; }
                if (url.pathname === '/api/menu') {
                    if (req.method === 'POST') {
                        menuSaveAttempts++;
                        if (failNextMenuSave) { failNextMenuSave = false; res.writeHead(500, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: 'Save unavailable' })); return; }
                        saved = JSON.parse(Buffer.concat(chunks)).tree; data = layout.save(saved);
                        if (delayNextMenuSave) {
                            delayNextMenuSave = false;
                            pendingMenuResponse = () => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(data)); pendingMenuResponse = null; }; return;
                        }
                    } else { data = layout.inventory(); }
                }
                if (url.pathname === '/api/github/auth/poll') { githubConnected = true; data = { connected: true, state: 'connected' }; }
                if (url.pathname === '/api/github/auth') {
                    if (req.method === 'POST') { data = { connected: githubConnected, state: 'pending', userCode: 'ABCD-EFGH', interval: 5 }; }
                    else { if (req.method === 'DELETE') { githubConnected = false; } data = { connected: githubConnected, state: githubConnected ? 'connected' : 'disconnected' }; }
                }
                if (url.pathname === '/api/store' || url.pathname === '/api/store/refresh') { data = { sources: [], entries }; }
                if (url.pathname === '/api/themes') { data = { themes: [], active: null, live: { live: true } }; }
                if (url.pathname === '/api/skills/custom') { data = { skills: installed ? [skill] : [] }; }
                if (url.pathname === '/api/skills/install') { if (installFailed) { res.statusCode = 400; data = { error: 'Download connection failed. Retry.' }; } else { installed = true; data = { skills: [skill] }; } }
                if (url.pathname === '/api/skills/progress') { data = { id: url.searchParams.get('id'), state: 'downloading', percent: 50 }; }
                if (url.pathname === '/api/skills' && req.method === 'DELETE') { installed = false; data = { skills: [] }; }
                res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(data));
            } catch (err) { res.writeHead(400, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: err.message })); }
        }); return;
    }
    const file = path.join(root, url.pathname === '/' ? 'index.html' : url.pathname);
    if (!file.startsWith(root + path.sep) || !fs.existsSync(file)) { res.writeHead(404); res.end(); return; }
    res.setHeader('Content-Type', ({ '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' })[path.extname(file)] || 'application/octet-stream'); res.end(fs.readFileSync(file));
});
(async () => {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
    try {
        const page = await browser.newPage({ viewport: { width: 1200, height: 1100 } }); const errors = []; page.on('pageerror', e => errors.push(e.message));
        await page.goto('http://127.0.0.1:' + server.address().port + '/#menu');
        await page.locator('[data-drag="introductions"]').waitFor();
        async function drag(source, target, hover) {
            await page.waitForFunction(() => [...document.querySelectorAll('#menu-editor [data-item]')].every(item => item.getAnimations().every(animation => animation.playState !== 'running')));
            const a = await source.boundingBox(), b = await target.boundingBox();
            await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await page.mouse.down();
            await page.mouse.move(b.x + b.width * .75, b.y + b.height / 2, { steps: 8 }); if (hover) { await page.waitForTimeout(1150); } await page.mouse.up();
        }
        const originalOrder = await page.locator('#menu-editor [data-drag]').evaluateAll(buttons => buttons.map(button => button.dataset.drag));
        async function beginPreview() {
            await page.waitForFunction(() => [...document.querySelectorAll('#menu-editor [data-item]')].every(item => item.getAnimations().every(animation => animation.playState !== 'running')));
            const source = await page.locator('[data-drag="introductions"]').boundingBox(), target = await page.locator('[data-drag="friendly-tips"]').boundingBox();
            await page.mouse.move(source.x + source.width / 2, source.y + source.height / 2); await page.mouse.down();
            await page.mouse.move(target.x + target.width * .75, target.y + target.height / 2, { steps: 8 });
            await page.waitForFunction(() => document.querySelector('#menu-editor [data-drag]').dataset.drag === 'friendly-tips');
        }
        await beginPreview();
        assert(await page.locator('#menu-editor [data-item]').evaluateAll(items => items.some(item => item.getAnimations().some(animation => animation.playState === 'running'))), 'Buttons slide into their new slots before release');
        assert.strictEqual(await page.locator('.is-dragging').count(), 1, 'Dragged skill retains a placeholder');
        assert.strictEqual(saved, null, 'Drag previews do not save the layout');
        await page.keyboard.press('Escape'); await page.mouse.up();
        assert.deepStrictEqual(await page.locator('#menu-editor [data-drag]').evaluateAll(buttons => buttons.map(button => button.dataset.drag)), originalOrder, 'Escape restores the original order');
        await page.waitForTimeout(250);
        await page.emulateMedia({ reducedMotion: 'reduce' }); await beginPreview();
        assert(await page.locator('#menu-editor [data-item]').evaluateAll(items => items.every(item => item.getAnimations().length === 0)), 'Reduced motion disables sliding animations');
        await page.keyboard.press('Escape'); await page.mouse.up(); await page.emulateMedia({ reducedMotion: 'no-preference' });
        await page.waitForTimeout(250);
        await drag(page.locator('[data-drag="introductions"]'), page.locator('[data-drag="friendly-tips"]'), false);
        await page.locator('#menu-save').click(); await page.waitForFunction(() => !document.getElementById('menu-save').disabled); assert.strictEqual(saved[0].id, 'friendly-tips'); assert.strictEqual(saved[1].id, 'introductions');
        await drag(page.locator('[data-drag="friendly-tips"]'), page.locator('[data-drag="introductions"]'), true);
        await page.locator('#menu-editor .is-expanded').first().waitFor();
        const created = await page.locator('.menu-folder-expanded').first().getAttribute('data-folder');
        assert.strictEqual(await page.locator('[data-folder="' + created + '"] [data-drag]').count(), 2);
        await page.waitForFunction(() => [...document.querySelectorAll('#menu-editor [data-item]')].every(item => item.getAnimations().every(animation => animation.playState !== 'running')));
        const folderButton = page.locator('[data-drag="' + created + '"]');
        async function checkInlineFolder() {
            const dimensions = await folderButton.evaluate(button => {
                const item = button.parentNode, contents = item.querySelector('.menu-folder-contents');
                const child = contents.querySelector('[data-drag]');
                const rect = element => { const r = element.getBoundingClientRect(); return { left: r.left, right: r.right, top: r.top, width: r.width }; };
                return { folder: rect(item), header: rect(button), child: rect(child), background: getComputedStyle(item).backgroundImage };
            });
            assert(dimensions.folder.width > dimensions.header.width * 1.8, 'The folder button widens to hold its contents');
            assert(dimensions.child.left >= dimensions.header.right, 'Contents expand to the right of the folder icon');
            assert(Math.abs(dimensions.child.top - dimensions.header.top) < 1, 'Child buttons sit inside the same horizontal folder');
            assert(dimensions.child.right <= dimensions.folder.right + 1, 'Child buttons fit inside the expanded folder');
            assert(dimensions.background.includes('88, 88, 109') && dimensions.background.includes('40, 39, 53'), 'The button area uses Bad Apple dark gray colors');
        }
        await checkInlineFolder();
        const editButton = page.locator('[data-item="' + created + '"] .menu-folder-edit');
        assert.strictEqual(await editButton.textContent(), '', 'Folder edit uses an icon instead of a text button');
        assert((await editButton.getAttribute('aria-label')).includes('Edit folder'));
        assert((await editButton.locator('span').evaluate(icon => getComputedStyle(icon).maskImage)).includes('icons/material/folder.svg'));
        async function dropOnFolder(fraction) {
            await page.waitForFunction(() => [...document.querySelectorAll('#menu-editor [data-item]')].every(item => item.getAnimations().every(animation => animation.playState !== 'running')));
            const source = await page.locator('[data-drag="clock"]').boundingBox(), target = await folderButton.boundingBox();
            await page.mouse.move(source.x + source.width / 2, source.y + source.height / 2); await page.mouse.down();
            await page.mouse.move(target.x + target.width * fraction, target.y + target.height / 2, { steps: 8 });
            await page.waitForTimeout(180); await page.mouse.up();
        }
        function rootOrder() { return page.locator('#menu-editor > [data-container="root"] > [data-item]').evaluateAll(items => items.map(item => item.dataset.item)); }
        await dropOnFolder(.1); let order = await rootOrder();
        await page.waitForFunction(() => [...document.querySelectorAll('#menu-editor [data-item]')].every(item => item.getAnimations().every(animation => animation.playState !== 'running')));
        await checkInlineFolder();
        assert.strictEqual(order[order.indexOf(created) - 1], 'clock', 'Left edge inserts a skill before the expanded folder');
        assert.strictEqual(await page.locator('[data-folder="' + created + '"] [data-drag]').count(), 2);
        await dropOnFolder(.9); order = await rootOrder();
        assert.strictEqual(order[order.indexOf(created) + 1], 'clock', 'Right edge inserts a skill after the expanded folder');
        await dropOnFolder(.5);
        assert.strictEqual(await page.locator('[data-folder="' + created + '"] [data-drag="clock"]').count(), 1, 'Center still moves skills into a folder');
        await dropOnFolder(.9); order = await rootOrder();
        assert.strictEqual(order[order.indexOf(created) + 1], 'clock', 'A skill can move from inside to beside its own folder');
        assert.strictEqual(await page.locator('[data-folder="' + created + '"] [data-drag]').count(), 2);
        await page.setViewportSize({ width: 390, height: 844 });
        await page.waitForFunction(() => [...document.querySelectorAll('#menu-editor [data-item]')].every(item => item.getAnimations().every(animation => animation.playState !== 'running')));
        await checkInlineFolder();
        assert(await folderButton.evaluate(button => {
            const item = button.parentNode, children = [...item.querySelector('.menu-folder-contents').children].map(child => child.getBoundingClientRect());
            const bounds = item.getBoundingClientRect(), header = button.getBoundingClientRect();
            return children.some(child => child.top > header.bottom) && children.every(child => child.left >= bounds.left && child.right <= bounds.right && child.bottom <= bounds.bottom);
        }), 'Extra folder buttons wrap to another row inside the folder');
        const mobileBounds = await folderButton.evaluate(button => { const rect = button.parentNode.getBoundingClientRect(); return { bottom: rect.bottom }; });
        assert((await page.locator('[data-drag="clock"]').boundingBox()).y >= mobileBounds.bottom, 'Wrapping folders push later menu buttons down');
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'Open folders fit the mobile viewport');
        await page.screenshot({ path: '/tmp/store-preview/open-folder-390.png', fullPage: true });
        await page.setViewportSize({ width: 1200, height: 1100 });
        await page.locator('[data-item="' + created + '"] .menu-folder-edit').click();
        await page.locator('#folder-name').fill('My apps'); await page.locator('#folder-color').fill('#123456'); await page.locator('#folder-shadow').fill('#234567');
        await page.locator('#folder-form button[type="submit"]').click();
        assert.strictEqual(await folderButton.locator('.menu-skill-label').textContent(), 'My apps');
        for (const [width, height] of [[900, 450], [450, 900], [700, 700], [200, 100]]) {
            const encoded = await page.evaluate(([width, height]) => {
                const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
                const context = canvas.getContext('2d'); context.fillStyle = '#123456'; context.fillRect(width / 4, height / 4, width / 2, height / 2);
                return canvas.toDataURL('image/png').split(',')[1];
            }, [width, height]);
            if (width === 900) {
                const rejected = await page.evaluate(async encoded => {
                    const png = await (await fetch('data:image/png;base64,' + encoded)).blob();
                    const response = await fetch('/api/menu/icon', { method: 'PUT', body: png });
                    return { status: response.status, data: await response.json() };
                }, encoded);
                assert.strictEqual(rejected.status, 400); assert(rejected.data.error.includes('330 x 330'));
                assert(!fs.existsSync(path.join(temp, 'icons')), 'Oversized raw uploads do not store an icon');
            }
            await page.locator('[data-item="' + created + '"] .menu-folder-edit').click();
            await page.locator('#folder-icon-file').setInputFiles({ name: 'folder.png', mimeType: 'image/png', buffer: Buffer.from(encoded, 'base64') });
            await page.locator('#folder-form button[type="submit"]').click(); await page.locator('#folder-details').waitFor({ state: 'hidden' });
            const image = page.locator('[data-drag="' + created + '"] img');
            await image.evaluate(img => img.decode());
            const alpha = await image.evaluate(img => {
                const canvas = document.createElement('canvas'); canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
                const context = canvas.getContext('2d'); context.drawImage(img, 0, 0); return context.getImageData(0, 0, 1, 1).data[3];
            });
            assert.strictEqual(alpha, 0, 'Resizing retains transparent pixels');
        }
        assert.deepStrictEqual(uploadedIcons, [[330, 165], [165, 330], [330, 330], [200, 100]], 'Landscape, portrait and square icons fit; small icons are not enlarged');
        await page.locator('[data-drag="' + created + '"]').dblclick(); assert.strictEqual(await page.locator('[data-folder="' + created + '"]').count(), 0);
        await page.locator('[data-drag="' + created + '"]').dblclick();
        await drag(page.locator('[data-drag="friendly-tips"]'), page.locator('[data-drag="clock"]'), false);
        await drag(page.locator('[data-drag="introductions"]'), page.locator('[data-drag="clock"]'), false);
        assert.strictEqual(await page.locator('[data-drag="' + created + '"]').count(), 0, 'Empty folder disappears');
        await page.locator('#menu-save').click(); await page.waitForFunction(() => !document.getElementById('menu-save').disabled); assert(!saved.some(n => n.id === created));
        await page.reload(); await page.locator('[data-drag="clock"]').waitFor();
        await page.locator('[data-panel="store"]').click();
        await page.locator('#store-auth-required').waitFor();
        assert.strictEqual(await page.locator('#store-content').isVisible(), false);
        await page.locator('#store-sign-in').click();
        await page.locator('#github-auth-start').click();
        await page.waitForFunction(() => document.getElementById('github-auth-status').textContent.includes('GitHub connected'));
        await page.locator('#close-store-management').click();
        await page.locator('#store-list .store-card').nth(1).waitFor();
        assert((await page.locator('#store-list .store-publisher').textContent()).includes('theme-dev'));
        await page.locator('#store-tab-skills').click(); assert((await page.locator('#store-skills').textContent()).includes('potential malware'));
        assert((await page.locator('#store-skill-list .store-publisher').textContent()).includes('★ 42'));
        await page.locator('#store-skill-list .store-install').click(); await page.locator('.theme-download-progress.is-failed').waitFor();
        assert.strictEqual(await page.locator('#store-skill-list .store-install').isEnabled(), true, 'Failure releases install UI');
        installFailed = false; await page.locator('#store-skill-list .store-install').click(); await page.locator('#store-skill-list .store-install', { hasText: 'Remove' }).waitFor();
        assert.strictEqual(await page.locator('#store-skill-list .store-apply').count(), 0, 'Skills do not have theme Apply actions');
        page.on('dialog', d => d.accept()); await page.locator('#store-skill-list .store-install').click(); await page.locator('#store-skill-list .store-install', { hasText: 'Install' }).waitFor();
        await page.locator('#store-options-button').click(); await page.locator('#manage-storefronts').click();
        await page.locator('#github-auth-start').click(); await page.locator('#github-auth-code:not([hidden])').waitFor();
        assert.strictEqual(await page.locator('#github-auth-code').textContent(), 'ABCD-EFGH');
        assert.strictEqual(await page.locator('#github-auth-link').getAttribute('href'), 'https://github.com/login/device');
        await page.waitForFunction(() => document.getElementById('github-auth-status').textContent.includes('GitHub connected'));
        await page.locator('#github-auth-disconnect').click(); await page.waitForFunction(() => document.getElementById('github-auth-status').textContent.includes('Sign in'));
        await page.locator('#close-store-management').click();
        assert.strictEqual(await page.locator('#store-content').isVisible(), false);
        assert.strictEqual(await page.locator('#store-tab-skills').isEnabled(), false);
        await page.setViewportSize({ width: 390, height: 844 }); await page.evaluate(() => { location.hash = 'menu'; }); await page.locator('#panel-menu.is-active').waitFor();
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
        await page.waitForTimeout(400); await page.evaluate(() => { document.getElementById('toasts').textContent = ''; });
        await page.screenshot({ path: '/tmp/store-preview/menu-editor-390.png', fullPage: true });
        await page.goto('http://127.0.0.1:' + server.address().port + '/#menu');
        await page.locator('[data-drag="clock"]').waitFor(); await page.clock.install();
        async function editOrder() {
            await page.locator('#menu-editor > [data-container="root"] > [data-item] > [data-drag]').first().focus();
            await page.keyboard.press('Alt+ArrowRight');
        }
        async function savedStatus() { await page.waitForFunction(() => document.getElementById('menu-editor-status').textContent.startsWith('Saved')); }
        let attempts = menuSaveAttempts;
        await editOrder(); await page.clock.fastForward(4000); assert.strictEqual(menuSaveAttempts, attempts, 'Autosave waits five seconds');
        await editOrder(); await page.clock.fastForward(4000); assert.strictEqual(menuSaveAttempts, attempts, 'A new edit resets the five-second delay');
        await page.clock.fastForward(1000); await savedStatus(); assert.strictEqual(menuSaveAttempts, ++attempts);
        await editOrder(); await page.locator('#menu-save').click(); await savedStatus(); assert.strictEqual(menuSaveAttempts, ++attempts);
        await page.clock.fastForward(5000); assert.strictEqual(menuSaveAttempts, attempts, 'Manual save cancels the pending autosave');
        await editOrder(); await page.locator('#menu-reset').click(); await page.waitForFunction(() => !document.getElementById('menu-editor-status').textContent);
        await page.clock.fastForward(5000); assert.strictEqual(menuSaveAttempts, attempts, 'Discard cancels autosave');
        failNextMenuSave = true; await editOrder(); const unsavedOrder = await rootOrder();
        await page.clock.fastForward(5000); await page.waitForFunction(() => document.getElementById('menu-editor-status').textContent.startsWith('Save failed'));
        assert.strictEqual(menuSaveAttempts, ++attempts); assert.deepStrictEqual(await rootOrder(), unsavedOrder, 'Failed autosave keeps edits');
        await page.locator('#menu-save').click(); await savedStatus(); assert.strictEqual(menuSaveAttempts, ++attempts);
        delayNextMenuSave = true; await editOrder(); await page.clock.fastForward(5000);
        await page.waitForFunction(() => document.getElementById('menu-save').disabled); assert(pendingMenuResponse);
        await editOrder(); const newerOrder = await rootOrder(); pendingMenuResponse();
        await page.waitForFunction(() => !document.getElementById('menu-save').disabled);
        assert.deepStrictEqual(await rootOrder(), newerOrder, 'Late save responses never overwrite newer edits');
        attempts++;
        await page.clock.fastForward(5000); await savedStatus(); assert.strictEqual(menuSaveAttempts, ++attempts, 'Newer edits get their own autosave');
        assert.deepStrictEqual(errors, []);
        console.log('BEacon browser drag/reorder, hover folders, expansion, editing, empty deletion, saving, skill install recovery and publisher metadata passed');
    } finally { await browser.close(); await new Promise(resolve => server.close(resolve)); fs.rmSync(temp, { recursive: true, force: true }); }
})().catch(err => { console.error(err); process.exitCode = 1; });
