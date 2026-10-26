import {readRoute} from './navigation.mjs';
import {entryRoute} from './seo.mjs';

export function initialRoute(href,ids,{saved=null,random=Math.random,tripleIds=new Set()}={}){
  const url=new URL(href),route=readRoute(href,ids,tripleIds),list=[...ids];
  const valid=saved&&ids.has(saved.head)&&ids.has(saved.body);
  const entry=entryRoute(href);
  const explicit=entry.kind==='fusion'||entry.kind==='triple'||url.searchParams.has('head')||url.searchParams.has('body')||url.searchParams.has('triple');
  const pick=()=>list[Math.min(list.length-1,Math.floor(random()*list.length))];
  if(route.page==='triple'&&valid)return {...route,head:saved.head,body:saved.body,alt:typeof saved.alt==='string'?saved.alt:'',variantExplicit:saved.variantExplicit===true};
  if(!explicit&&valid)return {...route,head:saved.head,body:saved.body,alt:route.variantExplicit?route.alt:typeof saved.alt==='string'?saved.alt:'',variantExplicit:route.variantExplicit||saved.variantExplicit===true,...(entry.kind==='home'&&!url.hash&&saved.page==='triple'&&tripleIds.has(saved.triple)?{page:'triple',triple:saved.triple}:{})};
  for(const key of ['head','body']){
    const id=Number(url.searchParams.has(key)?url.searchParams.get(key):entry[key]);
    if(!ids.has(id))route[key]=pick();
  }
  return route;
}

export function rememberFusion(storage,{head,body,alt='',variantExplicit=false,page,triple}){
  try{storage.setItem('fusion-last-viewed',JSON.stringify({head,body,alt,variantExplicit,...(page==='triple'&&triple?{page,triple}:{})}));}catch{/* Storage can be denied. */}
}
