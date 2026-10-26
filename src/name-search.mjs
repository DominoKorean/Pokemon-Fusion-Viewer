import hansearch from './vendor/hansearch.mjs';
export function findPokemon(pokemon,query,lang){
  const q=query.trim();if(!q)return pokemon;
  // Separate calls avoid upstream global-regex state skipping adjacent equal form names.
  if(lang==='ko')return pokemon.filter(p=>hansearch([{text:[...Object.values(p.names),p.identifier||'',p.form||''].join(' ')}],q,['text']).items.length>0);
  return pokemon.filter(p=>[...Object.values(p.names),p.identifier||'',p.form||''].some(n=>n.toLocaleLowerCase().includes(q.toLocaleLowerCase())));
}
export function createNameMatcher(pokemon,lang){
  const cache=new Map();
  return query=>{
    if(cache.has(query))return cache.get(query);
    const ids=new Set(findPokemon(pokemon,query,lang).map(p=>p.id));const lower=query.toLocaleLowerCase();
    const match=r=>ids.has(r.head)||ids.has(r.body)||(r.name||'').toLocaleLowerCase().includes(lower)||(r.id||'').toLocaleLowerCase().includes(lower);
    cache.set(query,match);return match;
  };
}
export function createSimpleSearch(query,nameMatcher){
  const terms=query.split(/[\s,]+/u).filter(Boolean).map(nameMatcher);
  return record=>terms.every(matches=>matches(record));
}
