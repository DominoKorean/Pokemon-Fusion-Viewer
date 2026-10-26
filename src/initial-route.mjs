import {readRoute} from './navigation.mjs';

export function initialRoute(href,ids,{saved=null,random=Math.random}={}){
  const url=new URL(href),route=readRoute(href,ids),list=[...ids];
  const valid=saved&&ids.has(saved.head)&&ids.has(saved.body);
  const explicit=url.searchParams.has('head')||url.searchParams.has('body');
  const pick=()=>list[Math.min(list.length-1,Math.floor(random()*list.length))];
  if(!explicit&&valid)return {...route,head:saved.head,body:saved.body,alt:route.variantExplicit?route.alt:typeof saved.alt==='string'?saved.alt:'',variantExplicit:route.variantExplicit||saved.variantExplicit===true};
  for(const key of ['head','body']){
    const id=Number(url.searchParams.get(key));
    if(!url.searchParams.has(key)||!ids.has(id))route[key]=pick();
  }
  return route;
}

export function rememberFusion(storage,{head,body,alt='',variantExplicit=false}){
  try{storage.setItem('fusion-last-viewed',JSON.stringify({head,body,alt,variantExplicit}));}catch{/* Storage can be denied. */}
}
