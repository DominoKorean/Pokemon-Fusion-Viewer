export function routeURL({head,body,alt='',page='lab',variantExplicit=false}){
  const query=new URLSearchParams({head:String(head),body:String(body)});
  if(alt||variantExplicit)query.set('variant',alt);
  return `?${query}#${page}`;
}
export function readRoute(href,ids){
  const url=new URL(href),fallbacks=[...ids];
  const pick=(key,fallback)=>{const id=Number(url.searchParams.get(key));return ids.has(id)?id:ids.has(fallback)?fallback:fallbacks[0];};
  return {head:pick('head',6),body:pick('body',94),alt:url.searchParams.get('variant')||'',variantExplicit:url.searchParams.has('variant'),page:['lab','dex','saved'].includes(url.hash.slice(1))?url.hash.slice(1):'lab'};
}
