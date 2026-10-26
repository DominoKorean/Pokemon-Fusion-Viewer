export const spriteScope=variant=>variant.status==='main'?'game':'other';
export const eligibleVariants=(variants=[],scope='game')=>variants.filter(v=>spriteScope(v)===scope);
export function deriveSpriteInventory(index){
  let mainVariantCount=0,otherVariantCount=0;const main=new Map(),other=new Map();
  for(const row of index.rows){const inGame=row[5]==='main',map=inGame?main:other;if(inGame)mainVariantCount++;else otherVariantCount++;for(const tag of row[4]){const key=index.tags[tag];map.set(key,(map.get(key)||0)+1);}}
  const sorted=map=>[...map].map(([key,count])=>({key,count})).sort((a,b)=>b.count-a.count||a.key.localeCompare(b.key));
  return {mainVariantCount,otherVariantCount,mainTags:sorted(main),otherTags:sorted(other)};
}
