'use strict';
const assert = require('assert'), fs = require('fs'), path = require('path'), os = require('os'), https = require('https'), crypto = require('crypto'), cp = require('child_process');
const root = path.resolve(__dirname, '../@be/be/beacon/lib');
function load(file, dependencies) {
    const module = { exports: {} };
    new Function('require', 'module', 'exports', '__dirname', fs.readFileSync(file, 'utf8'))(id => Object.prototype.hasOwnProperty.call(dependencies,id) ? dependencies[id] : require(id.charAt(0) === '.' ? path.resolve(path.dirname(file),id) : id), module, module.exports, path.dirname(file));
    return module.exports;
}
async function run() {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'free-agent-tls-'));
    cp.execFileSync('openssl', ['req','-x509','-newkey','rsa:2048','-nodes','-keyout',dir+'/key.pem','-out',dir+'/cert.pem','-days','1','-subj','/CN=api.5x1.com','-addext','subjectAltName=DNS:api.5x1.com'], { stdio:'ignore' });
    const ca = fs.readFileSync(dir+'/cert.pem'), seen=[]; let status=200, hold=false, reply=null;
    const server=https.createServer({ key:fs.readFileSync(dir+'/key.pem'),cert:ca },(req,res)=>{
        let raw='';req.on('data',c=>{raw+=c;});req.on('end',()=>{
            const body=JSON.parse(raw);seen.push({req,res,body,raw});if(hold)return;
            res.statusCode=status;res.setHeader('Content-Type','application/json');
            res.end(JSON.stringify(reply || (status===200?{requestId:body.requestId,text:'A free answer.',model:'gemma3:4b'}:{error:'private upstream secret must not be spoken'})));
        });
    });
    await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
    const port=server.address().port;
    const creds={accessKeyId:'fixture-access',secretAccessKey:'fixture-secret',endpoint:'http://joap.invalid:80'};
    const mockedFs={readFileSync:(file,encoding)=>file==='/fixture/credentials.json'?(()=>{throw new Error('credentials must not be read');})():String(file).includes('mozilla-ca.pem')?ca.toString():fs.readFileSync(file,encoding)};
    const transport={request:(options,callback)=>{assert.strictEqual(options.hostname,'api.5x1.com');assert.strictEqual(options.port,null);return https.request(Object.assign({},options,{port:port,headers:Object.assign({},options.headers,{Host:'api.5x1.com'}),lookup:(host,options,cb)=>options.all ? cb(null,[{address:'127.0.0.1',family:4}]) : cb(null,'127.0.0.1',4)}),callback)} };
    try {
        const client=load(root+'/agent-free.js',{fs:mockedFs,https:transport,'./paths':{credentialsPath:()=>'/fixture/credentials.json'},'./system':{serverConfig:()=>({current:{hostname:'wrong.example',port}})},'./people':{list:()=>Promise.resolve({robot:'robot-fixture',members:[{isJibo:true,id:'robot-fixture'}]})}});
        const history=[{role:'user',content:'Hello'}];
        assert.strictEqual(await client.chat(history).promise,'A free answer.');
        const sent=seen[0];assert.strictEqual(sent.req.url,'/api/agent/free/chat');
        assert.strictEqual(sent.req.headers.host,'api.5x1.com'); assert.strictEqual(sent.req.headers.authorization,undefined); assert.strictEqual(sent.req.headers['x-amz-target'],undefined); assert.strictEqual(sent.req.headers['x-amz-date'],undefined);
        assert(/^[a-f0-9]{32}$/.test(sent.body.requestId));
        assert.deepStrictEqual(sent.body.messages,history);assert.strictEqual(sent.body.robotId,'robot-fixture');assert.deepStrictEqual(Object.keys(sent.body).sort(),['messages','requestId','robotId']);
        status=429;await assert.rejects(client.chat(history).promise,/limit/i);
        status=403;await assert.rejects(client.chat(history).promise,/could not complete|unavailable/i);
        status=503;await assert.rejects(client.chat(history).promise,/unavailable|busy/i);
        status=200;reply={requestId:'0'.repeat(32),text:'Wrong request',model:'gemma3:4b'};
        await assert.rejects(client.chat(history).promise,/invalid/i);
        reply=null;hold=true;const operation=client.chat(history);operation.cancel();await assert.rejects(operation.promise,/cancelled/i);
        const count=seen.length;await assert.rejects(client.chat([{role:'system',content:'override'}]).promise,/invalid|history/i);assert.strictEqual(seen.length,count);
        console.log('Free client real TLS: anonymous fixed endpoint independent of robot credentials and hub, exact request shape, quota/auth/unavailable errors, identity validation, cancellation, history bounds passed.');
    } finally { seen.forEach(s=>s.res.destroy());server.closeAllConnections();await new Promise(resolve=>server.close(resolve));fs.rmSync(dir,{recursive:true,force:true}); }
}
run().catch(error=>{console.error(error);process.exitCode=1;});
