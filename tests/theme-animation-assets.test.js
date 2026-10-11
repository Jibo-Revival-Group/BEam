'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const pkg = require('../@be/be/beacon/lib/theme-package');
const adapter = require('../@be/be/beacon/lib/theme-animation-assets');
const themes = require('../@be/be/beacon/lib/themes');
const stores = require('../@be/be/beacon/lib/theme-store');
const fixture = require('./theme-fixtures');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'theme-animation-'));
const bad = fn => assert.rejects(Promise.resolve().then(fn), e => e.status === 400);
function wav() {
    const out = Buffer.alloc(46); out.write('RIFF'); out.writeUInt32LE(38,4); out.write('WAVEfmt ',8); out.writeUInt32LE(16,16);
    out.writeUInt16LE(1,20); out.writeUInt16LE(1,22); out.writeUInt32LE(8000,24); out.writeUInt32LE(16000,28);
    out.writeUInt16LE(2,32); out.writeUInt16LE(16,34); out.write('data',36); out.writeUInt32LE(2,40); return out;
}
async function run() {
    const files = Object.assign({}, fixture.astra(), { 'atex/blackeye_blur1.png': fixture.png(), 'asfx/ds_bloop_01.mp3': fs.readFileSync(path.resolve(__dirname,'../@be/be/node_modules/jibo-anim-db-animations/audio/device/ds_bloop_01.mp3')) });
    const nested = {}; Object.keys(files).forEach(n => { nested['Example-main/' + n] = files[n]; });
    const decoded = await pkg.validate(await pkg.unzip(fixture.zip(nested)));
    assert.deepStrictEqual(decoded.animationAssets, ['atex/blackeye_blur1.png','asfx/ds_bloop_01.mp3']);
    const entries = adapter.plan(decoded);
    let manifest = Object.assign({}, JSON.parse(files['manifest.json']), { atex:['blackeye_blur1.png'], asfx:['ds_bloop_01.mp3'] });
    const storefront = stores.create(value => {
        const file = value.replace('https://example.com/theme/', '');
        if (file === 'manifest.json') { return Promise.resolve(Buffer.from(JSON.stringify(manifest))); }
        if (files[file]) { return Promise.resolve(files[file]); }
        const err = pkg.fail('Not found'); err.remoteStatus=404;return Promise.reject(err);
    });
    const downloaded = await storefront.download('https://example.com/theme/manifest.json');
    assert.deepStrictEqual((await pkg.validate(downloaded.files)).animationAssets, decoded.animationAssets);
    manifest.asfx=['missing.mp3'];await bad(()=>storefront.download('https://example.com/theme/manifest.json'));
    manifest.asfx=['../bad.mp3'];await bad(()=>storefront.download('https://example.com/theme/manifest.json'));
    assert.strictEqual(entries[1].target, 'device/ds_bloop_01.mp3');
    assert(adapter.lookup(entries,'asfx','/opt/be/node_modules/jibo-anim-db-animations/audio/device/ds_bloop_01.mp3'));
    assert(!adapter.lookup(entries,'asfx','/opt/another-skill/audio/device/ds_bloop_01.mp3'));
    assert(adapter.lookup(entries,'atex','/animations/blackeye_blur1.png'));
    assert(!adapter.lookup(entries,'atex','/other-skill/blackeye_blur1.png'));
    await bad(() => pkg.validate(Object.assign({}, files, { 'asfx/ds_bloop_01.mp3': Buffer.from('not audio at all') })));
    await bad(() => pkg.validate(Object.assign({}, files, { 'atex/blackeye_blur1.png': Buffer.from('not a png') })));
    const manyImages = Object.assign({}, files);
    for (let i = 0; i < 68; i++) { manyImages['atex/large-' + i + '.png'] = files['face/eye.png']; }
    await assert.rejects(pkg.validate(manyImages), /Decoded theme images exceed 64 MB/);
    for (const name of ['atex/../bad.png','asfx/../bad.wav','atex/script.js','asfx/script.js','asfx/config.json']) {
        await bad(() => pkg.unzip(fixture.zip(Object.assign({}, files, { [name]: wav() }))));
    }
    await bad(() => pkg.unzip(fixture.zip(files, {symlink:'asfx/ds_bloop_01.mp3'})));
    await bad(() => adapter.plan({animationAssets:['atex/nonexistent.png']}));
    await bad(() => adapter.plan({animationAssets:['asfx/ds_bloop_01.mp3','asfx/device/ds_bloop_01.mp3']}));
    const stock = path.join(root,'stock'); fs.mkdirSync(stock); fs.mkdirSync(path.join(stock,'animations')); fs.mkdirSync(path.join(stock,'animations','textures'));
    for(const dir of ['one','two']) { fs.mkdirSync(path.join(stock,'animations','textures',dir)); fs.writeFileSync(path.join(stock,'animations','textures',dir,'duplicate.png'),fixture.png()); }
    await bad(() => adapter.plan({animationAssets:['atex/duplicate.png']},stock));
    assert.strictEqual(adapter.plan({animationAssets:['atex/two/duplicate.png']},stock)[0].target,'two/duplicate.png');
    let selection = {animationAssets:entries,audio:{'asfx/ds_bloop_01.mp3':{name:'themed'}}};
    class Sound {
        constructor(src) {
            this.src=src;const nodes={bufferSource:{buffer:{name:'stock'},playbackRate:{value:0.8},loop:true}};
            this._chain={nodes:()=>nodes,cloneBufferSource:()=>({buffer:nodes.bufferSource.buffer,rate:nodes.bufferSource.playbackRate.value,loop:nodes.bufferSource.loop})};
        }
        play(options) { this.options=options;return this._chain.cloneBufferSource(); }
    }
    const jibo={sound:{Sound}};const sound=new Sound('/opt/be/node_modules/jibo-anim-db-animations/audio/device/ds_bloop_01.mp3');
    adapter.hookSound(jibo,()=>selection);
    const template=sound._chain.nodes().bufferSource;const options={offset:1,complete:()=>{}};
    assert.strictEqual(sound.play(options).buffer.name,'themed');assert.strictEqual(sound.options,options);
    assert.strictEqual(sound._chain.nodes().bufferSource,template);assert.strictEqual(template.buffer.name,'stock');
    selection=null;assert.strictEqual(sound.play().buffer.name,'stock','Cached sounds restore immediately');
    selection={animationAssets:entries,audio:{'asfx/ds_bloop_01.mp3':{name:'second'}}};assert.strictEqual(sound.play().buffer.name,'second');
    assert.strictEqual(new Sound('/other-skill/audio/device/ds_bloop_01.mp3').play().buffer.name,'stock');
    const decodeDir=path.join(root,'decode');fs.mkdirSync(decodeDir);fs.mkdirSync(path.join(decodeDir,'asfx'));fs.writeFileSync(path.join(decodeDir,'asfx','test.wav'),wav());
    const audioEntry=[{type:'asfx',name:'asfx/test.wav',target:'test.wav'}];
    jibo.sound.context={context:{decodeAudioData:(buffer,success)=>{assert(buffer instanceof ArrayBuffer);success({length:1,numberOfChannels:1});}}};
    assert((await adapter.decode(jibo,audioEntry,decodeDir))['asfx/test.wav']);
    jibo.sound.context.context.decodeAudioData=()=>Promise.reject(new Error('bad codec'));
    await bad(()=>adapter.decode(jibo,audioEntry,decodeDir));
    jibo.sound.context.context.decodeAudioData=()=>Promise.resolve({length:20000000,numberOfChannels:1});
    await assert.rejects(adapter.decode(jibo,audioEntry,decodeDir), /Decoded animation sounds exceed 64 MB/);
    const service=themes.create({root:path.join(root,'knowledge'),version:()=> '99.0.0',runtime:{status:()=>({live:false})}});
    const installed=await service.upload(fixture.zip(nested),'test.zip');
    const item=service.inventory().themes[0];
    assert.strictEqual(fs.readFileSync(path.join(root,'knowledge','packages',item.revision,'asfx/ds_bloop_01.mp3')).length,files['asfx/ds_bloop_01.mp3'].length);
    assert(service.asset(installed.installed,'atex/blackeye_blur1.png'));
    const restart=themes.create({root:path.join(root,'knowledge'),version:()=> '99.0.0',runtime:{status:()=>({live:false})}});
    assert.deepStrictEqual(restart.inventory().themes[0].animationAssets,decoded.animationAssets);
    await bad(()=>service.upload(fixture.zip(Object.assign({},files,{'atex/nonexistent.png':fixture.png()})),'bad.zip'));
    assert.strictEqual(restart.inventory().themes[0].revision,item.revision,'Failed replacement retains the prior installation');
    console.log('Sparse animation ZIPs, PNG/audio validation, target matching, cached sound switching, decoding failures, persistent installs and replacement recovery passed');
}
run().catch(e=>{console.error(e);process.exitCode=1;});
