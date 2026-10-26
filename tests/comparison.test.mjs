import test from 'node:test';
import assert from 'node:assert/strict';
import {createComparison} from '../src/comparison.mjs';
import {actualStats} from '../src/fusion.mjs';
import {readFile} from 'node:fs/promises';
const snapshot=(value)=>({base:[value,2,3,4,5,6],actual:[value*2,12,13,14,15,16],description:String(value)});
test('a multi-keystroke edit compares with its starting value, not intermediate values',()=>{
  const c=createComparison();c.begin('level',snapshot(50));c.change(snapshot(50),'level');
  c.change(snapshot(5),'level');
  assert.deepEqual(c.baseline(),snapshot(50));
  c.end('level');c.begin('level',snapshot(51));c.change(snapshot(51),'level');
  assert.deepEqual(c.baseline(),snapshot(51));
});
test('pin survives subsequent edits and unpin returns to last actual change',()=>{
  const c=createComparison();const s=snapshot(40);c.pin(s);s.base[0]=999;
  c.change(snapshot(50));c.change(snapshot(51));
  assert.deepEqual(c.baseline(),snapshot(40));assert.equal(c.isPinned(),true);
  c.unpin();assert.deepEqual(c.baseline(),snapshot(51));assert.equal(c.isPinned(),false);
});
test('focus without a change preserves previous comparison and discrete edits reset the transaction',()=>{
  const c=createComparison();c.change(snapshot(40));c.begin('iv',snapshot(50));c.end('iv');
  assert.deepEqual(c.baseline(),snapshot(40));
  c.begin('level',snapshot(50));c.change(snapshot(50),'level');c.change(snapshot(51));
  assert.deepEqual(c.baseline(),snapshot(51));
});
const fusionSnapshot=(actual,pair='6.94')=>({pair,actual,base:[72,71,66,115,81,106],description:pair});
const neutral=fusionSnapshot([147,91,86,135,101,126]);
const adamant=fusionSnapshot([147,100,86,121,101,126]);
const timid=fusionSnapshot([147,81,86,135,101,138]);
test('Adamant to Timid displays only current Timid effects, not removal of Adamant effects',()=>{
  const c=createComparison();c.change(adamant,'nature');
  const result=c.view({mode:'actual',current:timid,natureBaseline:neutral});
  assert.deepEqual(result.deltas,[0,-10,0,0,0,12]);assert.equal(result.kind,'nature');
  assert.equal(result.baseline,neutral);
});
test('neutral nature clears all nature deltas regardless of the previous nature',()=>{
  const c=createComparison();c.change(adamant,'nature');
  assert.deepEqual(c.view({mode:'actual',current:neutral,natureBaseline:neutral}).deltas,[0,0,0,0,0,0]);
});
test('base stats never display scenario or pinned deltas',()=>{
  const c=createComparison();c.pin(adamant);c.change(adamant,'nature');
  const result=c.view({mode:'base',current:timid,natureBaseline:neutral});
  assert.equal(result.kind,'none');assert.deepEqual(result.deltas,[0,0,0,0,0,0]);
});
test('a new fusion cannot inherit previous or pinned differences even before reset',()=>{
  const c=createComparison();c.pin(adamant);c.change(adamant,'level');
  const result=c.view({mode:'actual',current:fusionSnapshot([111,90,70,100,80,120],'94.6'),natureBaseline:neutral});
  assert.equal(result.kind,'none');assert.deepEqual(result.deltas,[0,0,0,0,0,0]);
  c.reset();assert.equal(c.isPinned(),false);assert.equal(c.baseline(),null);
});
test('explicit pinned comparison remains distinct from current nature effects',()=>{
  const c=createComparison();c.pin(adamant);c.change(adamant,'nature');
  const result=c.view({mode:'actual',current:timid,natureBaseline:neutral});
  assert.equal(result.kind,'pinned');assert.deepEqual(result.deltas,[0,-19,0,14,0,12]);
  c.unpin();assert.deepEqual(c.view({mode:'actual',current:timid,natureBaseline:neutral}).deltas,[0,-10,0,0,0,12]);
});
test('all 625 nature transitions display only the selected nature effects',async()=>{
  const {natures}=JSON.parse(await readFile(new URL('../public/data/catalog.json',import.meta.url),'utf8'));
  const base=[72,71,66,115,81,106],neutralValues=[147,91,86,135,101,126];
  for(const from of natures)for(const to of natures){
    const c=createComparison();c.change(fusionSnapshot(actualStats(base,{nature:from})),'nature');
    const view=c.view({mode:'actual',current:fusionSnapshot(actualStats(base,{nature:to})),natureBaseline:neutral});
    const expected=neutralValues.map((value,i)=>i===0||to.up===to.down?0:to.up===i?Math.floor(value*110/100)-value:to.down===i?Math.floor(value*90/100)-value:0);
    assert.deepEqual(view.deltas,expected,`${from.key} → ${to.key}`);
    assert.ok(view.deltas.filter(Boolean).length<=2);
  }
});
test('editing level after nature uses the same nature before and after the level change',()=>{
  const c=createComparison();c.change(adamant,'nature');c.begin('level',timid);c.change(timid,'level');
  c.change(fusionSnapshot([33,12,12,18,14,18]),'level');
  const view=c.view({mode:'actual',current:fusionSnapshot([150,83,88,138,103,140]),natureBaseline:neutral});
  assert.equal(view.kind,'previous');assert.deepEqual(view.deltas,[3,2,2,3,2,2]);
});
