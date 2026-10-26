import {makeFusion} from './fusion.mjs';
import {compileQuery} from './query.mjs';
import {assetURL} from './paths.mjs';
import {createNameMatcher,createSimpleSearch} from './name-search.mjs';
import {eligibleVariants} from './dex-data.mjs';
let data,indexPromise,groups;
async function loadIndex(){
  if(groups)return groups;
  if(!indexPromise)indexPromise=fetch(assetURL('data/search-index.json')).then(r=>{if(!r.ok)throw Error(`HTTP ${r.status}`);return r.json();}).then(index=>{
    const grouped=new Map();
    for(const [head,body,alt,artist,tags,status]of index.rows){const key=head*1000+body;if(!grouped.has(key))grouped.set(key,[]);grouped.get(key).push({id:`${head}.${body}${alt}`,alt,artist:index.artists[artist],tags:tags.map(i=>index.tags[i]),status});}
    for(const variants of grouped.values())variants.sort((a,b)=>(a.alt!==''&&a.status!=='main')-(b.alt!==''&&b.status!=='main')||a.alt.length-b.alt.length||a.alt.localeCompare(b.alt));
    groups=grouped;return grouped;
  }).catch(e=>{indexPromise=null;throw e;});
  return indexPromise;
}
self.onmessage=async({data:message})=>{
  if(message.kind==='init'){data=message.catalog;return;}
  const {id,query,advanced=true,scope='game',tag,type,customOnly,sort,page,pageSize=24,lang}=message;
  try{
    const typeAliases=Object.fromEntries(data.types.map(t=>[t.key,Object.values(t.names)]));
    const nameMatcher=createNameMatcher(data.pokemon,lang);
    const filter=advanced?compileQuery(query,{types:typeAliases,tags:data.metadata.tags.map(t=>t.key),nameMatcher}).test:createSimpleSearch(query,nameMatcher);
    const spriteGroups=await loadIndex();const matches=[];
    for(const head of data.pokemon)for(const body of data.pokemon){
      const variants=eligibleVariants(spriteGroups.get(head.id*1000+body.id),scope);
      if((customOnly||tag||scope==='other')&&!variants.length)continue;
      const f=makeFusion(head,body);
      if(type&&!f.types.includes(type))continue;
      let chosen;
      for(const variant of variants.length?variants:[{}]){
        if(tag&&!variant.tags?.includes(tag))continue;
        const r={...f,custom:Boolean(variant.id),tags:variant.tags||[],artist:variant.artist||''};
        if(filter(r)){chosen={head:head.id,body:body.id,variant,bst:f.bst,name:lang==='en'?f.name:`${head.names[lang]} × ${body.names[lang]}`};break;}
      }
      if(chosen)matches.push(chosen);
    }
    if(sort==='bst')matches.sort((a,b)=>b.bst-a.bst||a.head-b.head||a.body-b.body);
    else if(sort==='name')matches.sort((a,b)=>a.name.localeCompare(b.name,lang));
    const pages=Math.max(1,Math.ceil(matches.length/pageSize)),safePage=Math.min(page,pages);
    self.postMessage({id,total:matches.length,pages,page:safePage,results:matches.slice((safePage-1)*pageSize,safePage*pageSize)});
  }catch(e){self.postMessage({id,error:e.message,position:e.position??null});}
};
