export function defaultVariants(variants=[]){
  const listed=variants.filter(v=>v.listed!==false),main=listed.filter(v=>v.status==='main');
  return main.length?main:listed.filter(v=>v.status==='temp');
}
export function selectVariant(variants=[],{alt='',explicit=false}={}){
  if(explicit){const selected=variants.find(v=>v.alt===alt);if(selected)return selected;}
  return defaultVariants(variants)[0]||null;
}
// Dex membership follows the official inventory, independently of default selection.
export const spriteScope=variant=>variant.listed===false?'other':'game';
export const creditedArtists=credit=>[...new Set(String(credit||'').split(/\s+&\s+|;/).map(name=>name.trim()).filter(Boolean))];
export function eligibleVariants(variants=[],scope='game',tag='',artist=''){
  return variants.filter(v=>spriteScope(v)===scope&&(!tag||v.tags?.includes(tag))&&(!artist||creditedArtists(v.artist).some(name=>name.toLowerCase()===artist.toLowerCase())));
}
export function deriveArtistInventory(index){
  const counts=new Map();
  for(const row of index.rows)for(const name of creditedArtists(index.artists[row[3]])){
    if(!counts.has(name))counts.set(name,{name,game:0,other:0});
    counts.get(name)[row[6]===false?'other':'game']++;
  }
  return [...counts.values()].sort((a,b)=>a.name.localeCompare(b.name));
}
export function spriteUsage(variant,variants=[]){
  if(variant.listed===false)return 'notApplied';
  if(defaultVariants(variants).includes(variant))return variant.status==='temp'?'temporaryDefault':'defaultSprite';
  return ['main','alt','temp'].includes(variant.status)?'alternative':'unknownStatus';
}
export function deriveSpriteInventory(index){
  let mainVariantCount=0,otherVariantCount=0;const main=new Map(),other=new Map();
  // Keep snapshot field names compatible; main/other now mean listed/unverified.
  for(const row of index.rows){const inGame=row[6]!==false,map=inGame?main:other;if(inGame)mainVariantCount++;else otherVariantCount++;for(const tag of row[4]){const key=index.tags[tag];map.set(key,(map.get(key)||0)+1);}}
  const sorted=map=>[...map].map(([key,count])=>({key,count})).sort((a,b)=>b.count-a.count||a.key.localeCompare(b.key));
  return {mainVariantCount,otherVariantCount,mainTags:sorted(main),otherTags:sorted(other)};
}
