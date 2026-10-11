'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const EventEmitter = require('events');
const pkg = require('../@be/be/beacon/lib/theme-package');
const fixture = require('./theme-fixtures');
function decoder() {
    let now = 0, next = 0, stream; const timers = new Map();
    function timeout(fn, delay) { const id = ++next; timers.set(id, {fn, at:now+delay}); return id; }
    function advance(ms) {
        const end = now + ms;
        while (true) {
            const due = Array.from(timers).filter(entry => entry[1].at <= end).sort((a,b)=>a[1].at-b[1].at)[0];
            if (!due) break;
            now=due[1].at;timers.delete(due[0]);due[1].fn();
        }
        now=end;
    }
    function inflate(options) {
        assert.strictEqual(options.chunkSize,256*1024);
        stream=new EventEmitter();stream.end=buf=>{stream.input=buf;};stream.close=()=>{stream.closed=true;stream.emit('close');};return stream;
    }
    const module={exports:{}};
    new Function('require','module','exports','setTimeout','clearTimeout',fs.readFileSync(path.resolve(__dirname,'../@be/be/beacon/lib/theme-package.js'),'utf8'))(
        name=>name==='zlib'?{createInflate:inflate,createInflateRaw:inflate}:require(name),module,module.exports,timeout,id=>timers.delete(id));
    return {pkg:module.exports,advance,stream:()=>stream,timers};
}
function chunk(type, data) {
    const name=Buffer.from(type),out=Buffer.alloc(data.length+12);out.writeUInt32BE(data.length,0);name.copy(out,4);data.copy(out,8);
    out.writeUInt32BE(pkg.crc32(Buffer.concat([name,data])),data.length+8);return out;
}
function indexed(index, filter) {
    const head=Buffer.alloc(13);head.writeUInt32BE(1,0);head.writeUInt32BE(1,4);head[8]=8;head[9]=3;
    return Buffer.concat([Buffer.from('89504e470d0a1a0a','hex'),chunk('IHDR',head),chunk('PLTE',Buffer.from([255,255,255])),chunk('IDAT',zlib.deflateSync(Buffer.from([filter,index]))),chunk('IEND',Buffer.alloc(0))]);
}
async function run() {
    const live=decoder();const promise=live.pkg.png(fixture.png(),'face/eye.png');const stream=live.stream();const raw=zlib.inflateSync(stream.input);
    live.advance(20000);stream.emit('data',raw.slice(0,2));
    live.advance(20000);assert(!stream.closed,'Progress must extend the deadline beyond the original start time');stream.emit('data',raw.slice(2));
    live.advance(20000);assert(!stream.closed);stream.emit('end');
    assert.deepStrictEqual(await promise,{width:1,height:1});assert.strictEqual(live.timers.size,0);
    const stalled=decoder();const stalledPromise=stalled.pkg.png(fixture.png(),'atex/example.png');
    stalled.advance(30001);await assert.rejects(stalledPromise,e=>e.status===400&&/atex\/example.png:.*stalled/.test(e.message));assert(stalled.stream().closed);
    const oversized=decoder();const oversizedPromise=oversized.pkg.png(fixture.png(),'face/eye.png');oversized.stream().emit('data',Buffer.alloc(6));
    await assert.rejects(oversizedPromise,/face\/eye.png: Expanded data exceeds/);assert(oversized.stream().closed);
    for(let filter=0;filter<=4;filter++) {
        assert.deepStrictEqual(await pkg.png(fixture.png(filter)),{width:1,height:1});
        assert.deepStrictEqual(await pkg.png(indexed(0,filter)),{width:1,height:1});
        await assert.rejects(pkg.png(indexed(1,filter)),/missing palette color/);
    }
    await assert.rejects(pkg.png(fixture.png(5)),/Invalid PNG filter/);
    console.log('Progress-based decode deadlines, named stall/size errors, cleanup, truecolor filters and indexed palette validation passed');
}
run().catch(e=>{console.error(e);process.exitCode=1;});
