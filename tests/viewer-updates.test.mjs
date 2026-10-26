import test from 'node:test';
import assert from 'node:assert/strict';
import {createSearchState,applySearch,switchSearchMode} from '../src/search-state.mjs';
import {findPokemon,createNameMatcher} from '../src/name-search.mjs';
import {spriteScope,deriveSpriteInventory,eligibleVariants} from '../src/dex-data.mjs';
import {parseNumericInput} from '../src/combobox.mjs';
import {compileQuery} from '../src/query.mjs';

const pokemon=[{id:25,nationalId:25,names:{ko:'피카츄',en:'Pikachu',ja:'ピカチュウ'}},{id:6,nationalId:6,names:{ko:'리자몽',en:'Charizard',ja:'リザードン'}},{id:94,nationalId:94,names:{ko:'팬텀',en:'Gengar',ja:'ゲンガー'}}];
test('simple and advanced inputs, applied queries and histories remain independent',()=>{
  const state=createSearchState();state.simple.input='피카츄';applySearch(state,'simple');
  switchSearchMode(state,'advanced');state.advanced.input='atk:>=80\nAND type:fire';applySearch(state,'advanced');
  assert.equal(switchSearchMode(state,'simple').input,'피카츄');
  assert.deepEqual(state.simple.history,['피카츄']);
  assert.deepEqual(state.advanced.history,['atk:>=80\nAND type:fire']);
  assert.equal(state.simple.applied,'피카츄');
});
test('hansearch matches Korean initials, mixed Hangul and normal multilingual text',()=>{
  assert.deepEqual(findPokemon(pokemon,'ㅍㅋㅊ','ko').map(p=>p.id),[25]);
  assert.deepEqual(findPokemon(pokemon,'리ㅈ','ko').map(p=>p.id),[6]);
  assert.deepEqual(findPokemon(pokemon,'PIKACHU','ko').map(p=>p.id),[25]);
  assert.deepEqual(findPokemon(pokemon,'ピカ','ja').map(p=>p.id),[25]);
  assert.deepEqual(findPokemon(pokemon,'ㅍㅋㅊ','en'),[]);
  assert.deepEqual(findPokemon([{...pokemon[0],id:1},{...pokemon[0],id:2}],'ㅍㅋㅊ','ko').map(p=>p.id),[1,2]);
});
test('advanced name expressions use hansearch while numeric filters stay exact',()=>{
  const matchName=createNameMatcher(pokemon,'ko');
  const record={head:25,body:94,name:'Pikagar',names:['피카츄','팬텀'],stats:[50,80,50,80,50,80]};
  assert.equal(compileQuery('name:ㅍㅋㅊ AND atk:80',{nameMatcher:matchName}).test(record),true);
  assert.equal(compileQuery('ㅍㅋㅊ AND atk:81',{nameMatcher:matchName}).test(record),false);
});
test('inventory membership determines dex scope regardless of status or tag',()=>{
  assert.equal(spriteScope({status:'main',tags:['reference']}),'game');
  assert.equal(spriteScope({status:'alt',tags:['sword']}),'game');
  assert.equal(spriteScope({status:'temp',tags:[]}),'game');
  assert.equal(spriteScope({status:'t',tags:[]}),'game');
  assert.equal(spriteScope({status:'main',listed:false}),'other');
  const variants=[{status:'main',id:'1.1'},{status:'alt',id:'1.1a'},{status:'temp',id:'1.1b'},{status:'main',id:'1.1c',listed:false}];
  assert.deepEqual(eligibleVariants(variants,'game').map(v=>v.id),['1.1','1.1a','1.1b']);
  assert.deepEqual(eligibleVariants(variants,'other').map(v=>v.id),['1.1c']);
});
test('unverified sprites never inflate in-game counts or tag counts',()=>{
  const result=deriveSpriteInventory({artists:[],tags:['reference','sword'],rows:[[1,1,'',0,[0],'main'],[1,1,'a',0,[0],'alt'],[1,2,'',0,[1],'temp'],[1,1,'b',0,[1],'main',false]]});
  assert.equal(result.mainVariantCount,3);assert.equal(result.otherVariantCount,1);
  assert.deepEqual(result.mainTags,[{key:'reference',count:2},{key:'sword',count:1}]);
  assert.deepEqual(result.otherTags,[{key:'sword',count:1}]);
});
test('numeric dropdown inputs accept direct integers and reject partial or out-of-range values',()=>{
  assert.equal(parseNumericInput('57',{min:1,max:100}),57);
  assert.equal(parseNumericInput('0',{min:0,max:31}),0);
  for(const value of ['', '101','0','5.5','abc'])assert.equal(parseNumericInput(value,{min:1,max:100}),null);
});
