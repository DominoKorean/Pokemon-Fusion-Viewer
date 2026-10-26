export function defaultVariants(variants=[]){
  const listed=variants.filter(v=>v.listed!==false),main=listed.filter(v=>v.status==='main');
  return main.length?main:listed.filter(v=>v.status==='temp');
}
export function selectVariant(variants=[],{alt='',explicit=false}={}){
  if(explicit){const selected=variants.find(v=>v.alt===alt);if(selected)return selected;}
  return defaultVariants(variants)[0]||null;
}
export const spriteScope=(variant,variants=[variant])=>defaultVariants(variants).includes(variant)?'game':'other';
export function eligibleVariants(variants=[],scope='game'){
  const defaults=new Set(defaultVariants(variants));
  return variants.filter(v=>scope==='game'?defaults.has(v):!defaults.has(v));
}
export function spriteUsage(variant,variants=[]){
  if(variant.listed===false)return 'notApplied';
  if(defaultVariants(variants).includes(variant))return variant.status==='temp'?'temporaryDefault':'defaultSprite';
  return ['main','alt','temp'].includes(variant.status)?'alternative':'unknownStatus';
}
export function deriveSpriteInventory(index){
  let mainVariantCount=0,otherVariantCount=0;const main=new Map(),other=new Map();
  const hasMain=new Set(index.rows.filter(r=>r[5]==='main'&&r[6]!==false).map(r=>`${r[0]}.${r[1]}`));
  for(const row of index.rows){const inGame=row[6]!==false&&(row[5]==='main'||row[5]==='temp'&&!hasMain.has(`${row[0]}.${row[1]}`)),map=inGame?main:other;if(inGame)mainVariantCount++;else otherVariantCount++;for(const tag of row[4]){const key=index.tags[tag];map.set(key,(map.get(key)||0)+1);}}
  const sorted=map=>[...map].map(([key,count])=>({key,count})).sort((a,b)=>b.count-a.count||a.key.localeCompare(b.key));
  return {mainVariantCount,otherVariantCount,mainTags:sorted(main),otherTags:sorted(other)};
}
