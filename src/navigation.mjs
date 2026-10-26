import {entryRoute} from './seo.mjs';

export function routeURL({head,body,alt='',page='lab',variantExplicit=false,triple=''}){
  if(page==='triple'&&triple)return `?${new URLSearchParams({triple})}#triple`;
  const query=new URLSearchParams({head:String(head),body:String(body)});
  if(alt||variantExplicit)query.set('variant',alt);
  return `?${query}#${page}`;
}
export function readRoute(href,ids,triples=new Set()){
  const url=new URL(href),entry=entryRoute(href),fallbacks=[...ids];
  const pick=(key,fallback)=>{const id=Number(url.searchParams.has(key)?url.searchParams.get(key):entry[key]);return ids.has(id)?id:ids.has(fallback)?fallback:fallbacks[0];};
  const requestedPage=url.hash.slice(1)||entry.page;
  const page=requestedPage==='triple'&&triples.size?'triple':['lab','dex','saved'].includes(requestedPage)?requestedPage:'lab';
  const triple=url.searchParams.get('triple')||entry.triple;
  return {head:pick('head',6),body:pick('body',94),alt:url.searchParams.get('variant')||'',variantExplicit:url.searchParams.has('variant'),page,...(page==='triple'?{triple:triples.has(triple)?triple:[...triples][0]}:{})};
}
export function resolveHistoryRoute(route,current){
  if(route.page!=='triple')return route;
  return {...route,head:current.head,body:current.body,alt:current.alt,variantExplicit:current.variantExplicit};
}
