import test from 'node:test';
import assert from 'node:assert/strict';
import {eligibleVariants,deriveSpriteInventory,spriteUsage,selectVariant} from '../src/dex-data.mjs';
test('a lone temp is the game default; temp and alt are alternatives when main exists',()=>{
  const temp={id:'18.3',status:'temp'},main={id:'18.3a',status:'main'},alt={id:'18.3b',status:'alt'};
  assert.deepEqual(eligibleVariants([temp],'game'),[temp]);
  assert.deepEqual(eligibleVariants([temp,main,alt],'game'),[temp,main,alt]);
  assert.deepEqual(eligibleVariants([temp,main,alt],'other'),[]);
  assert.equal(spriteUsage(temp,[temp]),'temporaryDefault');assert.equal(spriteUsage(alt,[main,alt]),'alternative');
});
test('automatic selection prefers a suffixed main while explicit unsuffixed selection is preserved',()=>{
  const temp={id:'1.120',alt:'',status:'temp'},main={id:'1.120a',alt:'a',status:'main'},alt={id:'1.120b',alt:'b',status:'alt'};
  assert.equal(selectVariant([temp,main,alt]),main);
  assert.equal(selectVariant([temp,main,alt],{alt:'',explicit:true}),temp);
  assert.equal(selectVariant([alt]),null);
  assert.equal(selectVariant([alt],{alt:'b',explicit:true}),alt);
});
test('only official inventory absence warrants the not-applied badge',()=>{
  const unavailable={id:'1.2',status:'main',listed:false},temp={id:'1.2a',status:'temp'},unknown={id:'1.2b',status:'t'};
  assert.equal(spriteUsage(unavailable,[unavailable,temp]),'notApplied');
  assert.equal(spriteUsage(unknown,[unavailable,temp,unknown]),'unknownStatus');
  assert.deepEqual(eligibleVariants([unavailable,temp],'game'),[temp]);
  const counts=deriveSpriteInventory({tags:['mega'],rows:[[18,3,'',0,[0],'temp'],[1,2,'',0,[],'main',false],[1,2,'a',0,[],'temp']]});
  assert.equal(counts.mainVariantCount,2);assert.equal(counts.otherVariantCount,1);
});
test('a selected tag intersects inventory scope on the same sprite, never on the pair',()=>{
  const main={id:'1.2',status:'main',tags:['reference']},alt={id:'1.2a',status:'alt',tags:['sword']},unverified={id:'1.2b',status:'alt',tags:['reference','sword'],listed:false};
  assert.deepEqual(eligibleVariants([main,alt,unverified],'game','reference'),[main]);
  assert.deepEqual(eligibleVariants([main,alt,unverified],'other','reference'),[unverified]);
  assert.deepEqual(eligibleVariants([main,alt,unverified],'game','sword'),[alt]);
  assert.deepEqual(eligibleVariants([main,alt,unverified],'other','mega'),[]);
});
