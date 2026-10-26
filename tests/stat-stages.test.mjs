import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {actualStats,statCalculations} from '../src/fusion.mjs';
const {natures}=JSON.parse(readFileSync(new URL('../public/data/catalog.json',import.meta.url)));
const bases=[[72,71,66,115,81,106],[65,76,66,94,91,88],[1,80,45,30,30,40],[255,255,255,255,255,255]];
// Independent integer oracle from official 014_Pokemon/001_Pokemon.rb calcHP/calcStat.
function reference(base,level,iv,ev,nature,wonderGuard){return base.map((b,i)=>{
  if(i===0&&(b===1||wonderGuard))return 1;
  const main=Math.floor((b*2+iv+Math.floor(ev[i]/4))*level/100);
  if(i===0)return main+level+10;
  let percent=100;if(nature.up!==nature.down){if(nature.up===i)percent=110;if(nature.down===i)percent=90;}
  return Math.floor((main+5)*percent/100);
});}
test('actual stats match the original integer formula across all natures and boundaries',()=>{
  const spreads=[[0,0,0,0,0,0],[252,252,4,0,0,0],[1,2,3,4,5,6],[0,252,0,0,4,252],[0,0,0,252,4,252],[252,0,252,0,6,0]];
  for(const base of bases)for(const nature of natures)for(const level of [1,50,100])for(const iv of [0,31])for(const ev of spreads){
    const settings={level,iv,ev,nature};assert.deepEqual(actualStats(base,settings),reference(base,level,iv,ev,nature,false));
  }
});
test('calculation stages explain current nature and reset neutral effects without retaining the old nature',()=>{
  const base=bases[0],adamant=natures.find(n=>n.key==='adamant'),modest=natures.find(n=>n.key==='modest'),hardy=natures.find(n=>n.key==='hardy');
  const raised=statCalculations(base,{level:50,iv:31,nature:adamant});
  assert.equal(raised[1].beforeNature,91);assert.equal(raised[1].naturePercent,110);assert.equal(raised[1].natureDelta,9);assert.equal(raised[1].value,100);
  const changed=statCalculations(base,{nature:modest});assert.equal(changed[1].value,81);assert.equal(changed[1].natureDelta,-10);assert.equal(changed[3].value,148);
  const neutral=statCalculations(base,{nature:hardy});assert.deepEqual(neutral.map(s=>s.natureDelta),[0,0,0,0,0,0]);
  assert.deepEqual(neutral.map(s=>s.value),[147,91,86,135,101,126]);
});
test('EV truncation and forced HP exceptions remain visible in breakdowns',()=>{
  const parts=statCalculations(bases[0],{ev:[3,4,0,0,0,0],wonderGuard:true});
  assert.equal(parts[0].evContribution,0);assert.equal(parts[1].evContribution,1);
  assert.equal(parts[0].value,1);assert.equal(parts[0].hpException,'wonderGuard');
  assert.equal(statCalculations(bases[2])[0].hpException,'baseHP');
});
