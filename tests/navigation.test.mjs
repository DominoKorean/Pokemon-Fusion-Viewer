import test from 'node:test';
import assert from 'node:assert/strict';
import {readRoute,routeURL} from '../src/navigation.mjs';

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
