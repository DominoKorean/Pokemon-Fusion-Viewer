import test from 'node:test';
import assert from 'node:assert/strict';
import {initialRoute,rememberFusion} from '../src/initial-route.mjs';
const ids=new Set([1,4,6,7,94]);
test('a first visit or denied storage uses random database IDs instead of a fixed fusion',()=>{
  for(const saved of [null,{}, {head:999,body:7},'corrupt']){
    const values=[0.2,0.99];const route=initialRoute('https://viewer.test/#lab',ids,{saved,random:()=>values.shift()});
    assert.deepEqual(route,{head:4,body:94,alt:'',variantExplicit:false,page:'lab'});
  }
  assert.doesNotThrow(()=>rememberFusion({setItem(){throw Error('Denied');}},{head:4,body:7}));
});
test('the last fusion restores its explicit unsuffixed variant, with current navigation tab',()=>{
  const route=initialRoute('https://viewer.test/#dex',ids,{saved:{head:4,body:7,alt:'',variantExplicit:true},random:()=>{throw Error('Do not randomize');}});
  assert.deepEqual(route,{head:4,body:7,alt:'',variantExplicit:true,page:'dex'});
});
test('explicit URL parameters take precedence over a saved fusion without inheriting its variant',()=>{
  const route=initialRoute('https://viewer.test/?head=1&body=94#lab',ids,{saved:{head:4,body:7,alt:'e',variantExplicit:true},random:()=>0});
  assert.deepEqual(route,{head:1,body:94,alt:'',variantExplicit:false,page:'lab'});
  const explicit=initialRoute('https://viewer.test/?head=1&body=94&variant=#lab',ids,{random:()=>0});
  assert.equal(explicit.variantExplicit,true);
});
test('an explicit variant overrides the saved variant while reusing the saved parents',()=>{
  const route=initialRoute('https://viewer.test/?variant=b#lab',ids,{saved:{head:4,body:7,alt:'e',variantExplicit:true},random:()=>0});
  assert.deepEqual(route,{head:4,body:7,alt:'b',variantExplicit:true,page:'lab'});
});
test('remembered fusion stores a portable route and ignores unrelated settings',()=>{
  let saved;
  rememberFusion({setItem(key,value){saved={key,value:JSON.parse(value)};}},{head:4,body:7,alt:'e',variantExplicit:true,level:99});
  assert.deepEqual(saved,{key:'fusion-last-viewed',value:{head:4,body:7,alt:'e',variantExplicit:true}});
});
