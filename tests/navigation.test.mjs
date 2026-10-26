import test from 'node:test';
import assert from 'node:assert/strict';
import {readRoute,routeURL,resolveHistoryRoute} from '../src/navigation.mjs';

test('fusion URLs preserve head, body, variant and page under a Pages subpath',()=>{
  const state={head:18,body:3,alt:'a',page:'lab',variantExplicit:true};
  const url=routeURL(state,'https://example.github.io/FusionViewer/');
  assert.equal(url,'?head=18&body=3&variant=a#lab');
  assert.deepEqual(readRoute('https://example.github.io/FusionViewer/'+url,new Set([18,3])),state);
  assert.deepEqual(readRoute('https://example.github.io/?head=3&body=18#dex',new Set([18,3])),{head:3,body:18,alt:'',page:'dex',variantExplicit:false});
});
test('invalid history parameters use known Pokémon and a supported tab',()=>{
  assert.deepEqual(readRoute('https://example.test/?head=-1&body=9999#wrong',new Set([6,94])),{head:6,body:94,alt:'',page:'lab',variantExplicit:false});
});
test('explicit unsuffixed alternatives survive history without being confused with automatic defaults',()=>{
  const state={head:1,body:120,alt:'',variantExplicit:true,page:'lab'};
  const url=routeURL(state);assert.equal(url,'?head=1&body=120&variant=#lab');
  assert.deepEqual(readRoute('https://example.test/'+url,new Set([1,120])),state);
});
test('triple URLs restore a known official triple and reject unknown combinations',()=>{
  const ids=new Set([6,94]),triples=new Set(['1.4.7','3.6.9']);
  assert.equal(routeURL({head:6,body:94,page:'triple',triple:'1.4.7'}),'?triple=1.4.7#triple');
  assert.deepEqual(readRoute('https://viewer.test/?triple=3.6.9#triple',ids,triples),{head:6,body:94,alt:'',variantExplicit:false,page:'triple',triple:'3.6.9'});
  assert.equal(readRoute('https://viewer.test/?triple=1.2.3#triple',ids,triples).triple,'1.4.7');
});
test('triple history retains the complete dual selection when returning to the lab',()=>{
  const current={head:1,body:4,alt:'a',variantExplicit:true,page:'dex',triple:'1.4.7'};
  const route=readRoute('https://viewer.test/?triple=1.4.7#triple',new Set([1,4,6,94]),new Set(['1.4.7']));
  const restored=resolveHistoryRoute(route,current);
  assert.equal(routeURL({...restored,page:'lab'}),'?head=1&body=4&variant=a#lab');
});
