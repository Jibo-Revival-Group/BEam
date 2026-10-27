'use strict';
// Exercise the actual Free request path with a local, fake transport on Node 6.
const assert = require('assert'), fs = require('fs'), path = require('path'), EventEmitter = require('events');
const file = path.resolve(__dirname, '../@be/be/beacon/lib/agent-free.js');
let snapshot, sent = [];
const dependencies = {
    fs: { readFileSync: () => 'fixture-ca' },
    './people': { list: () => Promise.resolve(snapshot) },
    https: { request: (options, callback) => {
        const request = new EventEmitter();
        request.destroy = () => {};
        request.end = body => {
            const parsed = JSON.parse(body); sent.push(parsed);
            const response = new EventEmitter(); response.statusCode = 200;
            callback(response);
            response.emit('data', Buffer.from(JSON.stringify({requestId: parsed.requestId, model: 'gemma3:4b', text: 'ok'})));
            response.emit('end');
        };
        return request;
    } }
};
const mod = { exports: {} };
new Function('require', 'module', 'exports', '__dirname', fs.readFileSync(file, 'utf8'))(
    id => Object.prototype.hasOwnProperty.call(dependencies, id) ? dependencies[id] : require(id.charAt(0) === '.' ? path.resolve(path.dirname(file), id) : id), mod, mod.exports, path.dirname(file));
const history = [{role:'user', content:'Hello'}];
function expectId(value, expected) {
    snapshot = value;
    return mod.exports.chat(history).promise.then(text => { assert.strictEqual(text, 'ok'); assert.strictEqual(sent[sent.length - 1].robotId, expected); });
}
function expectFailure(value) {
    snapshot = value; const before = sent.length;
    return mod.exports.chat(history).promise.then(() => { throw new Error('Expected identity failure'); }, error => {
        assert(/could not identify/i.test(error.message)); assert.strictEqual(sent.length, before);
    });
}
expectId({robot:'actual-robot', members:[{isJibo:true,id:'unnamed-person'}, {isJibo:true,id:'actual-robot'}]}, 'actual-robot')
.then(() => expectId({robot:'actual-robot', members:[]}, 'actual-robot'))
.then(() => expectFailure({robot:null, members:[{isJibo:true,id:'unnamed-person'}, {isJibo:false,id:'person'}]}))
.then(() => expectFailure({robot:null, members:[{isJibo:true,id:'first'}, {isJibo:true,id:'second'}]}))
.then(() => expectFailure({robot:null, members:[]}))
.then(() => expectFailure({robot:' ', members:[{isJibo:true,id:'first'}, {isJibo:true,id:'second'}]}))
.then(() => expectFailure({robot:42, members:[{isJibo:true,id:'unnamed-person'}]}))
.then(() => expectFailure({robot:null, members:[{isJibo:true,id:' ' }]}))
.then(() => console.log('Free robot ID selection passed.'), error => { console.error(error); process.exitCode = 1; });
