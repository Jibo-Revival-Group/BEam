'use strict';
// Private, app-owned child. Never adopt a process or kill a pid from disk.
var locations=require('./paths'),fs=require('fs'),path=require('path'),crypto=require('crypto'),child=require('child_process');
var timers=require('timers'),proc=null,pending=null,stopping=null,generation=0;
var tokenFile=path.join(locations.dataRoot(),'token');
var cachedSettings=null;
function settings(){
if(cachedSettings)return cachedSettings;
locations.ensureDirectory(locations.dataRoot());
locations.ensureDirectory(path.join(locations.dataRoot(),'cache'));
var token;
try{var st=fs.lstatSync(tokenFile);if(!st.isFile()||st.isSymbolicLink()||st.nlink!==1||st.size>128)throw Error('music_token_invalid');token=fs.readFileSync(tokenFile,'utf8').trim();if(!/^[a-f0-9]{48}$/.test(token))throw Error('music_token_invalid');}
catch(e){if(e.code!=='ENOENT')throw e;token=crypto.randomBytes(24).toString('hex');fs.writeFileSync(tokenFile,token+'\n',{flag:'wx',mode:384});}
cachedSettings={base:'http://127.0.0.1:18701',token:token};
return cachedSettings;
}
function stop(){
 generation++;
 if(stopping)return stopping;
 var owned=proc;if(!owned)return Promise.resolve(true);
 stopping=new Promise(function(resolve,reject){
  var kill=null,bound=null,done=false;
  function finish(error){if(done)return;done=true;timers.clearTimeout(kill);timers.clearTimeout(bound);owned.removeListener('exit',onExit);if(!error&&proc===owned)proc=null;stopping=null;if(error)reject(error);else resolve(true);}
  function onExit(){finish();}
  owned.once('exit',onExit);
  if(owned.exitCode!==null&&owned.exitCode!==undefined){finish();return;}
  try{owned.stdin.end();owned.kill('SIGTERM');}catch(e){}
  kill=timers.setTimeout(function(){try{owned.kill('SIGKILL');}catch(e){}},1200);
  bound=timers.setTimeout(function(){finish(Error('music_helper_stop_unconfirmed'));},2000);
 });
 return stopping;
}
function ensure(){
 settings();
 if(stopping)return stopping.then(ensure);
 if(pending)return pending;
 if(proc)return Promise.resolve(true);
 var ownGeneration=generation;
 pending=new Promise(function(resolve){
  var owned,timeout=null,tail='',done=false;
  function finish(ok){if(done)return;done=true;timers.clearTimeout(timeout);if(!ok)stop().then(function(){resolve(false);},function(){resolve(false);});else resolve(true);}
  try{
   owned=child.spawn('/usr/bin/node',['--max-old-space-size=48','--expose-gc',path.join(__dirname,'helper/run.js')],{cwd:__dirname,detached:false,stdio:['pipe','pipe','ignore'],env:{PATH:'/usr/bin:/bin',HOME:locations.dataRoot(),BE_MUSIC_PORT:'18701',BE_MUSIC_HOST:'127.0.0.1',BE_MUSIC_CACHE_DIR:path.join(locations.dataRoot(),'cache'),BE_MUSIC_TOKEN_FILE:tokenFile,BE_MUSIC_STANDALONE:'1'}});
   proc=owned;owned.stdin.on('error',function(){});
   owned.stdout.on('data',function(b){tail=(tail+b.toString('utf8')).slice(-4096);if(tail.indexOf('BE_MUSIC_READY\n')>=0)finish(ownGeneration===generation&&proc===owned);});
   owned.once('error',function(){finish(false);});
   owned.once('exit',function(){if(proc===owned)proc=null;finish(false);});
   timeout=timers.setTimeout(function(){finish(false);},10000);
  }catch(e){finish(false);}
 }).then(function(ok){pending=null;return ok;},function(){pending=null;return false;});
 return pending;
}
module.exports={settings:settings,ensure:ensure,stop:stop};
