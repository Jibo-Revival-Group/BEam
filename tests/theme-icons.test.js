'use strict';
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const pkg = require('../@be/be/beacon/lib/theme-package');
const icons = require('../@be/be/beacon/lib/theme-icons');
const svg = require('../@be/be/beacon/lib/theme-svg');
const stores = require('../@be/be/beacon/lib/theme-store');
const themes = require('../@be/be/beacon/lib/themes');
const fixture = require('./theme-fixtures');
const vector = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path fill="#fff" d="M0 0h64v64z"/></svg>');
const bad = fn => assert.rejects(Promise.resolve().then(fn), e => e.status === 400);
async function run() {
    const files = { 'manifest.json': fixture.astra()['manifest.json'], 'icons/bad-apple.png': fixture.png(), 'icons/custom.svg': vector };
    const nested = {}; Object.keys(files).forEach(n => { nested['theme/' + n] = files[n]; });
    const theme = await pkg.validate(await pkg.unzip(fixture.zip(nested)));
    assert.deepStrictEqual(theme.icons, ['icons/bad-apple.png', 'icons/custom.svg']);
    assert.deepStrictEqual(theme.animationAssets, []);
    assert(!theme.hasMenu, 'Icons need no menu configuration');
    assert.deepStrictEqual(theme.images['icons/custom.svg'], {width:64,height:64});
    const original = {baseTexture:{imageUrl:'/skills/not-installed/bad-apple.png'}};
    const alternate = {baseTexture:{imageUrl:'/theme/icons/bad-apple.png'}};
    let active = {theme, textures:{'icons/bad-apple.png':alternate, 'icons/custom.svg':{vector:true}}};
    assert.strictEqual(icons.lookup(active, 'core://resources/icons/bad-apple.png'), alternate);
    assert.strictEqual(icons.lookup(active, '/custom-skill/custom.png?revision=1').vector, true, 'SVG replaces a PNG request');
    assert.strictEqual(icons.lookup(active, '/skill/missing.png'), null);
    class Sprite {
        constructor(texture) { this.texture=texture; this.children=[]; }
        get texture() { return this._texture; }
        set texture(texture) { this._texture=texture; }
        destroy() { this.destroyed=true; }
    }
    const existing = new Sprite(original);
    const hook = icons.hook({Sprite}, () => active);
    hook.track({children:[existing]}); assert.strictEqual(existing.texture, alternate);
    const custom = new Sprite(original); assert.strictEqual(custom.texture,alternate);
    const second = {baseTexture:{imageUrl:'/theme-two/icons/bad-apple.png'}};
    active={theme,textures:{'icons/bad-apple.png':second}}; hook.refresh();
    assert.strictEqual(custom.texture,second); assert.strictEqual(existing.texture,second);
    active=null; hook.refresh(); assert.strictEqual(custom.texture,original); assert.strictEqual(existing.texture,original);
    custom.destroy(); active={theme,textures:{'icons/bad-apple.png':alternate}}; hook.refresh(); assert.strictEqual(custom.texture,original);
    for (const content of [
        '<svg><script>alert(1)</script></svg>', '<svg width="32" height="32" onload="x()"/>',
        '<svg width="32" height="32"><image href="file:///etc/passwd"/></svg>',
        '<svg width="32" height="32"><path fill="url(https://example.com/a)"/></svg>',
        '<svg width="32" height="32"><path style="fill:u&#114;l(https://example.com/a)"/></svg>',
        '<!DOCTYPE svg [<!ENTITY x "bad">]><svg width="32" height="32"/>',
        '<svg width="9000" height="32"/>', '<svg width="32" height="32"><path></svg>',
        '<svg width="32" height="32"><use href="other.svg#x"/></svg>'
    ]) { await bad(() => pkg.validate(Object.assign({},files,{'icons/custom.svg':Buffer.from(content)}))); }
    await bad(() => pkg.validate(Object.assign({},files,{'icons/custom.png':fixture.png()})));
    await bad(() => pkg.unzip(fixture.zip(Object.assign({},files,{'icons/a.js':Buffer.from('x')}))));
    await bad(() => pkg.unzip(fixture.zip(Object.assign({},files,{'icons/custom.svg':vector}),{symlink:'icons/custom.svg'})));
    const manifest=Object.assign({},JSON.parse(files['manifest.json']),{icons:['bad-apple.png','custom.svg']});
    const store=stores.create(value => {
        const name=value.replace('https://example.com/theme/','');
        if(name==='manifest.json') return Promise.resolve(Buffer.from(JSON.stringify(manifest)));
        if(files[name]) return Promise.resolve(files[name]);
        const err=pkg.fail('Missing');err.remoteStatus=404;return Promise.reject(err);
    });
    assert.deepStrictEqual((await pkg.validate((await store.download('https://example.com/theme/manifest.json')).files)).icons,theme.icons);
    manifest.icons=['absent.svg']; await bad(() => store.download('https://example.com/theme/manifest.json'));
    manifest.icons=['../bad.svg']; await bad(() => store.download('https://example.com/theme/manifest.json'));
    const root=fs.mkdtempSync(path.join(os.tmpdir(),'theme-icons-'));
    const options={root,version:()=> '99.0.0',runtime:{status:()=>({live:false})}};
    const service=themes.create(options);const installed=await service.upload(fixture.zip(nested),'icons.zip');
    assert(service.asset(installed.installed,'icons/custom.svg'));
    assert.deepStrictEqual(themes.create(options).inventory().themes[0].icons,theme.icons,'Unknown skill icons persist without any skill lookup');
    const filename=path.join(root,'icon.svg');fs.writeFileSync(filename,vector);
    global.Image=class { set src(value) { assert(value.startsWith('data:image/svg+xml;base64,')); this.onload(); } };
    let drawn=false;
    global.document={createElement:()=>({getContext:()=>({drawImage:()=>{drawn=true;}})})};
    const rendered=await svg.texture({BaseTexture:class {constructor(canvas, scaleMode, resolution){assert.strictEqual(canvas.width,330);assert.strictEqual(canvas.height,330);assert.strictEqual(resolution,330/64);}},Texture:class {constructor(base){this.baseTexture=base;}}},filename,{width:64,height:64});
    assert(drawn);assert.strictEqual(rendered.baseTexture.imageUrl,filename);
    assert.deepStrictEqual(svg.rasterSize({width:24,height:48}), {width:165,height:330,resolution:330/48});
    assert.deepStrictEqual(svg.rasterSize({width:48,height:24}), {width:330,height:165,resolution:330/48});
    assert.deepStrictEqual(svg.rasterSize({width:512,height:256}), {width:512,height:256,resolution:1});
    const smallIcons = {'manifest.json':files['manifest.json']};
    for (let i=0;i<620;i++) { smallIcons['icons/small-'+i+'.svg']=vector; }
    await bad(() => pkg.validate(smallIcons)); // Budget counts raster pixels, not the 64x64 viewBox.

    global.Image=class { set src(value) { this.onerror(); } };
    await bad(() => svg.texture({},filename,{width:64,height:64}));
    delete global.Image;delete global.document;
    console.log('Theme icon ZIP/store installs, unknown skills, SVG validation/rasterization, custom sprites and live restoration passed');
}
run().catch(e=>{console.error(e);process.exitCode=1;});
