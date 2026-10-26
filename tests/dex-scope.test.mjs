import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('worker applies scope, selected tag and advanced expressions to the same variant',async()=>{
  const source=JSON.parse(await readFile(new URL('../public/data/catalog.json',import.meta.url),'utf8'));
  const catalog={...source,pokemon:source.pokemon.filter(p=>[1,4].includes(p.id))};
  const index={artists:['artist','collaborator'],tags:['reference','sword'],rows:[
    [1,4,'',1,[1],'main'],[1,4,'a',0,[0],'alt'],[1,4,'b',0,[0],'alt',false],
    [4,1,'',0,[0],'main',false],[4,4,'',0,[1],'main']
  ]};
  const originalFetch=globalThis.fetch,originalSelf=globalThis.self,results=[];
  globalThis.self={postMessage:message=>results.push(message)};
  globalThis.fetch=async url=>{assert.ok(String(url).endsWith('/data/search-index.json'));return {ok:true,json:async()=>index};};
  try{
    await import('../src/search-worker.mjs');
    await self.onmessage({data:{kind:'init',catalog}});
    const search=async(overrides)=>{await self.onmessage({data:{id:results.length+1,query:'',advanced:false,scope:'game',tag:'reference',customOnly:false,sort:'id',page:1,lang:'en',...overrides}});const result=results.at(-1);assert.equal(result.error,undefined);return result;};
    let result=await search({});assert.equal(result.total,1);assert.equal(result.results[0].variant.id,'1.4a');
    result=await search({scope:'other'});assert.equal(result.total,2);assert.deepEqual(result.results.map(r=>r.variant.id),['1.4b','4.1']);
    result=await search({advanced:true,query:'tag:reference OR tag:sword'});assert.equal(result.total,1);assert.equal(result.results[0].variant.id,'1.4a');
    result=await search({scope:'other',tag:'sword'});assert.equal(result.total,0);
    result=await search({tag:'',artist:'collaborator'});assert.equal(result.total,1);assert.equal(result.results[0].variant.id,'1.4');
    result=await search({tag:'reference',artist:'collaborator'});assert.equal(result.total,0);
    result=await search({tag:'',advanced:true,query:'artist:collaborator AND type:grass'});assert.equal(result.total,1);assert.equal(result.results[0].variant.id,'1.4');
  }finally{globalThis.fetch=originalFetch;globalThis.self=originalSelf;}
});
