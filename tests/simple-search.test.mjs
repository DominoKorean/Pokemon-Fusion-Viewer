import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createNameMatcher,createSimpleSearch} from '../src/name-search.mjs';
import {makeFusion} from '../src/fusion.mjs';

const {pokemon}=JSON.parse(readFileSync(new URL('../public/data/catalog.json',import.meta.url)));
const get=id=>pokemon.find(p=>p.id===id);
const pair=makeFusion(get(25),get(1)),reverse=makeFusion(get(1),get(25)),other=makeFusion(get(25),get(7));
const matcher=createNameMatcher(pokemon,'ko');

test('simple search requires every space or comma separated term across either parent',()=>{
  for(const query of ['피카츄 이상해씨','피카츄,이상해씨',' 이상해씨,  피카츄,, ', '피카츄\t이상해씨']){
    const filter=createSimpleSearch(query,matcher);
    assert.equal(filter(pair),true,query);
    assert.equal(filter(reverse),true,query);
    assert.equal(filter(other),false,query);
  }
});

test('multi-term search keeps Korean initials and multilingual partial-name matching',()=>{
  for(const query of ['ㅍㅋㅊ ㅇㅅㅎㅆ','피카, Bulba','ピカチュウ,이상해']){
    const filter=createSimpleSearch(query,matcher);
    assert.equal(filter(pair),true,query);
    assert.equal(filter(other),false,query);
  }
});

test('single terms and empty separators preserve normal name and fusion ID search',()=>{
  for(const query of ['', ' ,  , ', '25.1', pair.name, '피카츄'])assert.equal(createSimpleSearch(query,matcher)(pair),true,query);
  assert.equal(createSimpleSearch('피카츄 팬텀 이상해씨',matcher)(pair),false);
  assert.equal(createSimpleSearch('type:poison',matcher)(pair),false);
});
