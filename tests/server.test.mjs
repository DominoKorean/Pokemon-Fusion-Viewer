import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
test('local server serves application files and keeps workspace internals private',async()=>{
  const child=spawn(process.execPath,['scripts/serve.mjs'],{env:{...process.env,PORT:'5174'},stdio:['ignore','pipe','pipe']});
  try{
    await Promise.race([once(child.stdout,'data'),once(child,'exit').then(()=>{throw Error('Server exited');})]);
    for(const file of ['/','/styles.css','/src/app.mjs','/src/search-worker.mjs','/src/vendor/hansearch.mjs','/data/catalog.json']){
      const r=await fetch(`http://127.0.0.1:5174${file}`);assert.equal(r.status,200,file);assert.ok((await r.text()).length>0);
    }
    for(const file of ['/.git/config','/scripts/sync-data.mjs','/package.json','/data/../../.git/config']){
      const r=await fetch(`http://127.0.0.1:5174${file}`);assert.equal(r.status,404,file);
    }
  }finally{child.kill();}
});
