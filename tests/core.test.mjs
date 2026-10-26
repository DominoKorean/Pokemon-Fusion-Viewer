import test from 'node:test';
import assert from 'node:assert/strict';
import { fuseStats, fuseTypes, actualStats, statDeltas } from '../src/fusion.mjs';
import { compileQuery } from '../src/query.mjs';
import { readMarshal } from '../scripts/ruby-marshal.mjs';

const head = { stats: [78,84,78,109,85,100], types:['fire','flying'] };
const body = { stats: [60,65,60,130,75,110], types:['ghost','poison'] };
test('game weighting uses separate integer divisions, not a single rounded average', () => {
  assert.deepEqual(fuseStats(head.stats,body.stats),[72,71,66,115,81,106]);
  assert.equal(fuseStats([1,1,1,1,1,1],[1,1,1,1,1,1])[0],1);
  assert.equal(fuseStats([2,2,2,2,2,2],[2,2,2,2,2,2])[0],1);
});
test('fusion typing follows game head/body rules and Normal/Flying exception', () => {
  assert.deepEqual(fuseTypes(head,body),['fire','poison']);
  assert.deepEqual(fuseTypes({types:['normal','flying']},{types:['grass','poison']}),['flying','poison']);
  assert.deepEqual(fuseTypes({types:['fire']},{types:['water','fire']}),['fire','water']);
  assert.deepEqual(fuseTypes({types:['fire']},{types:['fire']}),['fire']);
});
test('actual stats account for nature, legal EV distribution, and Shedinja HP', () => {
  assert.deepEqual(actualStats([72,71,66,115,81,106],{level:50,iv:31,ev:[0,252,0,0,4,252],nature:{up:1,down:3}}),[147,135,86,121,102,158]);
  assert.equal(actualStats([1,80,45,30,30,40],{level:100,iv:31,ev:[0,0,0,0,0,0]})[0],1);
  assert.equal(actualStats([72,71,66,115,81,106],{level:50,wonderGuard:true})[0],1);
  assert.throws(()=>actualStats(head.stats,{level:50,iv:31,ev:[252,252,252,0,0,0]}),/EV/);
});
test('comparison reports positive, negative and unchanged values',()=>{
  assert.deepEqual(statDeltas([147,135,86],[145,138,86]),[2,-3,0]);
});
const record={ id:'6.94', name:'Char gar', names:['리자몽','팬텀','Charizard','Gengar'], head:6,body:94,stats:[72,71,66,115,81,106],bst:511,types:['fire','poison'],tags:['reference','joke'],artist:'sample artist',custom:true };
const query=q=>compileQuery(q,{types:{fire:['불꽃'],poison:['독'],water:['물']},tags:['reference','joke']}).test(record);
test('queries support AND precedence, OR, grouping and NOT',()=>{
  assert.equal(query('type:water OR type:fire AND atk:>70'),true);
  assert.equal(query('(type:water OR type:fire) AND atk:>80'),false);
  assert.equal(query('NOT type:water AND type:poison'),true);
});
test('queries support newlines, spaced colon values, exact numeric equality and Unicode',()=>{
  assert.equal(query('type: 독\nAND atk:71\nAND "리자몽"'),true);
  assert.equal(query('atk:21'),false);
  assert.equal(query('artist:"sample artist" and head:6'),true);
  assert.equal(query('팬텀'),true);
  assert.equal(query('id:6.94'),true);
});
test('invalid queries never silently become broad results',()=>{
  for(const q of ['atk:abc','atk:','type:posion','wat:21','(atk:21','atk:21 OR','type:fire )','"unclosed']){
    assert.throws(()=>compileQuery(q,{types:{fire:[],poison:[]}}),undefined,q);
  }
});
test('empty query matches all, unsafe text is treated as literal',()=>{
  assert.equal(query(''),true);
  assert.equal(query('"<script>alert(1)</script>"'),false);
});
test('Marshal parser reads a real-format hash, string ivar, links and signed fixnums',()=>{
  // Ruby Marshal 4.8: { :foo => ["bar", -1], :again => :foo }
  const data=Uint8Array.from([4,8,123,7,58,8,102,111,111,91,7,73,34,8,98,97,114,6,58,6,69,84,105,250,58,10,97,103,97,105,110,59,0]);
  assert.deepEqual(readMarshal(data),{foo:['bar',-1],again:'foo'});
});
