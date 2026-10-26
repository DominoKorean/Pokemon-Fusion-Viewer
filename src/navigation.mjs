export function routeURL({head,body,alt='',page='lab',variantExplicit=false,triple=''}){
  if(page==='triple'&&triple)return `?${new URLSearchParams({triple})}#triple`;
  const query=new URLSearchParams({head:String(head),body:String(body)});
  if(alt||variantExplicit)query.set('variant',alt);
  return `?${query}#${page}`;
}
export function readRoute(href,ids,triples=new Set()){
  const url=new URL(href),fallbacks=[...ids];
  const pick=(key,fallback)=>{const id=Number(url.searchParams.get(key));return ids.has(id)?id:ids.has(fallback)?fallback:fallbacks[0];};
  const page=url.hash==='#triple'&&triples.size?'triple':['lab','dex','saved'].includes(url.hash.slice(1))?url.hash.slice(1):'lab';
  return {head:pick('head',6),body:pick('body',94),alt:url.searchParams.get('variant')||'',variantExplicit:url.searchParams.has('variant'),page,...(page==='triple'?{triple:triples.has(url.searchParams.get('triple'))?url.searchParams.get('triple'):[...triples][0]}:{})};
}
export function resolveHistoryRoute(route,current){
  if(route.page!=='triple')return route;
  return {...route,head:current.head,body:current.body,alt:current.alt,variantExplicit:current.variantExplicit};
}
