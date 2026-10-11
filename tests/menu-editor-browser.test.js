'use strict';
const assert = require('assert'), http = require('http'), fs = require('fs'), path = require('path'), os = require('os');
const { chromium } = require('playwright');
const menu = require('../@be/be/beacon/lib/menu-layout');
const fixture = require('./theme-fixtures');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'beam-menu-browser-'));
const layout = menu.create({ root: temp, skills: { inventory: () => ({ skills: [] }) } });
const root = path.resolve(__dirname, '../@be/be/beacon/public');
let installed = false, installFailed = true, saved = null, githubConnected = false;
const skill = { id: 'bad-apple', revision: 'revision', packageName: '@be/bad-apple', manifest: { name: 'Bad Apple', version: '1.0.0', type: 'skill', buttonColor: ['#58586D', '#282735'] }, images: { 'banner.png': {} }, compatibility: { status: 'compatible' }, origin: { url: 'https://github.com/example/BadApple' } };
const entries = [{ id: 'skill-entry', name: 'Bad Apple', type: 'skill', url: skill.origin.url, developer: 'example', stars: 42, manifest: skill.manifest, compatibility: { status: 'compatible' }, description: 'Bad Apple on Jibo.' },
    { id: 'theme-entry', name: 'Astra', type: 'theme', developer: 'theme-dev', stars: 12, manifest: { name: 'Astra', version: '1.0.0', type: 'theme' }, compatibility: { status: 'compatible' }, description: 'An example theme.' }];
const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname.startsWith('/api/')) {
        const chunks = []; req.on('data', b => chunks.push(b)); req.on('end', () => {
            let data = {};
            try {
                if (url.pathname === '/api/menu/icon') { res.setHeader('Content-Type', 'image/png'); res.end(fs.readFileSync(layout.icon(url.searchParams.get('name')))); return; }
                if (url.pathname === '/api/skills/asset') { res.setHeader('Content-Type', 'image/png'); res.end(fixture.png()); return; }
                if (url.pathname === '/api/menu') { if (req.method === 'POST') { saved = JSON.parse(Buffer.concat(chunks)).tree; data = layout.save(saved); } else { data = layout.inventory(); } }
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
            const a = await source.boundingBox(), b = await target.boundingBox();
            await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await page.mouse.down();
            await page.mouse.move(b.x + b.width * .75, b.y + b.height / 2, { steps: 8 }); if (hover) { await page.waitForTimeout(1150); } await page.mouse.up();
        }
        await drag(page.locator('[data-drag="introductions"]'), page.locator('[data-drag="friendly-tips"]'), false);
        await page.locator('#menu-save').click(); await page.waitForFunction(() => !document.getElementById('menu-save').disabled); assert.strictEqual(saved[0].id, 'friendly-tips'); assert.strictEqual(saved[1].id, 'introductions');
        await drag(page.locator('[data-drag="friendly-tips"]'), page.locator('[data-drag="introductions"]'), true);
        await page.locator('.menu-folder-expanded').first().waitFor();
        const created = await page.locator('.menu-folder-expanded').first().getAttribute('data-folder');
        assert.strictEqual(await page.locator('[data-folder="' + created + '"] [data-drag]').count(), 2);
        await page.locator('[data-item="' + created + '"] .menu-folder-edit').click();
        await page.locator('#folder-name').fill('My apps'); await page.locator('#folder-color').fill('#123456'); await page.locator('#folder-shadow').fill('#234567');
        await page.locator('#folder-form button[type="submit"]').click();
        assert.strictEqual(await page.locator('[data-folder="' + created + '"] h3').textContent(), 'My apps');
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
        assert.deepStrictEqual(errors, []);
        console.log('BEacon browser drag/reorder, hover folders, expansion, editing, empty deletion, saving, skill install recovery and publisher metadata passed');
    } finally { await browser.close(); await new Promise(resolve => server.close(resolve)); fs.rmSync(temp, { recursive: true, force: true }); }
})().catch(err => { console.error(err); process.exitCode = 1; });
