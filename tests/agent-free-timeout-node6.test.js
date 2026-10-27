'use strict';
// Run with Node 6: fake only transport and clocks, exercise actual Free client.
const assert = require('assert'), fs = require('fs'), path = require('path'), EventEmitter = require('events');
const file = path.resolve(__dirname, '../@be/be/beacon/lib/agent-free.js');
let timers = [], cleared = [], requests = [];
const fakeFs = { readFileSync: file => String(file).indexOf('credentials') !== -1 ? JSON.stringify({accessKeyId:'fixture', secretAccessKey:'secret'}) : 'fixture-ca' };
const transport = { request: (options, callback) => {
    const request = new EventEmitter(); request.destroy = () => { request.destroyed = true; }; request.end = body => { request.body = JSON.parse(body); }; request.respond = callback; requests.push(request); return request;
} };
const dependencies = { fs: fakeFs, https: transport, './people': {list: () => Promise.resolve({robot:'robot-fixture',members:[{isJibo:true,id:'robot-fixture'}]})}, './system': {serverConfig: () => ({current:{hostname:'localhost',port:443}})} };
const moduleObject = {exports:{}};
new Function('require','module','exports','__dirname','setTimeout','clearTimeout',fs.readFileSync(file,'utf8'))(
    id => Object.prototype.hasOwnProperty.call(dependencies,id) ? dependencies[id] : require(id.charAt(0)==='.' ? path.resolve(path.dirname(file),id) : id),
    moduleObject,moduleObject.exports,path.dirname(file), (fn,delay) => { const timer = {fn:fn,delay:delay}; timers.push(timer); return timer; }, timer => { cleared.push(timer); });
const client = moduleObject.exports, history = [{role:'user',content:'Hello'}];
const pending = client.chat(history);
assert.strictEqual(timers[0].delay, 150000, 'Free deadline must allow backend 120 seconds plus relay overhead');
setImmediate(() => { timers[0].fn(); });
pending.promise.then(() => { throw new Error('Expected timeout'); }, error => {
    assert(/too long/i.test(error.message)); assert(requests[0].destroyed); assert(cleared.indexOf(timers[0]) !== -1);
    const success = client.chat(history); return new Promise(resolve => setImmediate(resolve)).then(() => { const response = new EventEmitter(); response.statusCode = 200; requests[1].respond(response);
    response.emit('data', Buffer.from(JSON.stringify({requestId:requests[1].body.requestId, model:'gemma3:4b', text:'Done'}))); response.emit('end');
    return success.promise.then(text => { assert.strictEqual(text,'Done'); assert(cleared.indexOf(timers[1]) !== -1);
        const cancelled = client.chat(history); return new Promise(resolve => setImmediate(resolve)).then(() => { cancelled.cancel(); return cancelled.promise.then(() => { throw new Error('Expected cancellation'); }, error => { assert(/cancelled/i.test(error.message)); assert(requests[2].destroyed); assert(cleared.indexOf(timers[2]) !== -1); }); });
    }); });
}).then(() => console.log('Free Node 6 deadline, timeout destruction, success and cancellation cleanup passed.'), error => { console.error(error); process.exitCode = 1; });
