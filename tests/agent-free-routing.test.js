'use strict';
const assert=require('assert'),fs=require('fs'),path=require('path');
const file=path.resolve(__dirname,'../@be/be/beacon/lib/agent-provider.js'),moduleObject={exports:{}};
const history=[{role:'user',content:'Hello'}];let received=null;
const free={chat:messages=>{received=messages;return {promise:Promise.resolve('Free route selected.'),cancel:()=>{}};}};
const blocked={request:()=>{throw new Error('Must not use direct provider transport');}};
new Function('require','module','exports','__dirname',fs.readFileSync(file,'utf8'))(id=>id==='./agent-free'?free:id==='http'||id==='https'?blocked:require(id.charAt(0)==='.'?path.resolve(path.dirname(file),id):id),moduleObject,moduleObject.exports,path.dirname(file));
moduleObject.exports.chat({provider:'free',model:'arbitrary',endpoint:'http://never.invalid',apiKey:'must-not-leak'},history).promise.then(reply=>{
 assert.strictEqual(reply,'Free route selected.');assert.deepStrictEqual(received,history);
 console.log('Free provider delegates only conversation history to the anonymous BEefy relay; no direct Ollama, custom endpoint, model or user key.');
}).catch(error=>{console.error(error);process.exitCode=1;});
