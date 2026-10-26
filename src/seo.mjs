import {makeFusion} from './fusion.mjs';

// Keep the trailing slash. Change this one value when moving to a custom domain.
export const SITE_URL='https://dominokorean.github.io/Pokemon-Fusion-Viewer/';
export const SITE_DESCRIPTION='A Pokémon Infinite Fusion viewer with a mobile-friendly fusion lab, stat change comparisons, and easy sprite search by Pokémon, type, tag, and artist.';
export const PREVIEW_ALT='Fusion Viewer interface showing a Regigigas and Volcarona fusion, sprite variants and stat controls.';
export const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function entryRoute(href){
  const {pathname}=new URL(href),pair=pathname.match(/\/fusion\/(\d+)\.(\d+)\.html$/),triple=pathname.match(/\/triple\/(\d+\.\d+\.\d+)\.html$/);
  if(pair)return {kind:'fusion',head:Number(pair[1]),body:Number(pair[2]),page:'lab'};
  if(triple)return {kind:'triple',triple:triple[1],page:'triple'};
  if(pathname.endsWith('/dex.html'))return {kind:'dex',page:'dex'};
  if(pathname.endsWith('/triples.html'))return {kind:'triples',page:'triple'};
  return {kind:'home',page:'lab'};
}

export function entryURL({head,body,alt='',variantExplicit=false,page='lab',triple=''},base=SITE_URL,{home=false,tripleIndex=false}={}){
  if(home)return base;
  let path='';const query=new URLSearchParams();let hash='';
  if(page==='saved'){query.set('head',head);query.set('body',body);hash='#saved';}
  else if(page==='dex'){path='dex.html';if(head&&body){query.set('head',head);query.set('body',body);}}
  else if(page==='triple')path=tripleIndex||!triple?'triples.html':`triple/${triple}.html`;
  else if(!home){path=`fusion/${head}.${body}.html`;if(alt||variantExplicit)query.set('variant',alt);}
  return new URL(path+(query.size?'?'+query:'')+hash,base).href;
}

export function pageMetadata({page='home',head,body,triple,components=[],home=false,tripleIndex=false}={},base=SITE_URL){
  if(home)page='home';
  let title='Fusion Viewer — Pokémon Infinite Fusion Viewer',description=SITE_DESCRIPTION,canonical=base,shareDescription;
  if(page==='dex'){
    title='Fusion Dex — Search Sprites, Tags & Artists | Fusion Viewer';
    description='Browse Pokémon Infinite Fusion sprites. Search Pokémon names, types, tags, artists and base stats with live search or advanced queries.';
    canonical=new URL('dex.html',base).href;
  }else if(page==='triple'){
    title='Triple Fusions — Sprites & Stats | Fusion Viewer';
    description='Explore the supported Pokémon Infinite Fusion triple combinations with official sprites, dedicated base stats and level, nature, IV and EV controls.';
    canonical=new URL('triples.html',base).href;
    if(triple&&!tripleIndex){title=`${triple.name} — ${components.map(p=>p.names.en).join(' × ')} | Fusion Viewer`;description=`${triple.name} (#${triple.id}) in Pokémon Infinite Fusion. ${statSummary(triple.stats)}. View the official triple sprite and calculate stats.`;canonical=new URL(`triple/${triple.id}.html`,base).href;}
  }else if(page==='lab'&&head&&body&&!home){
    const fusion=makeFusion(head,body);
    title=`${head.names.en} × ${body.names.en} — ${fusion.name} | Fusion Viewer`;
    description=`${head.names.en} (head) × ${body.names.en} (body), #${fusion.id} in Pokémon Infinite Fusion. ${fusion.types.join('/')}. ${statSummary(fusion.stats)}. View sprites and compare stats.`;
    shareDescription=`Fusion #${fusion.id} · ${fusion.types.join('/')} · BST ${fusion.bst}. Explore sprites and compare stat changes in Pokémon Infinite Fusion.`;
    canonical=new URL(`fusion/${fusion.id}.html`,base).href;
  }
  return {title,description,shareDescription:shareDescription||description,canonical,image:new URL('social/preview.jpg',base).href,imageAlt:PREVIEW_ALT,robots:page==='saved'?'noindex,follow':'index,follow,max-image-preview:large'};
}

export function statSummary(stats){return ['HP','Atk','Def','SpA','SpD','Spe'].map((key,i)=>`${key} ${stats[i]}`).join(', ')+`; BST ${stats.reduce((a,b)=>a+b,0)}`;}

export function updatePageMetadata(meta,doc=document){
  doc.title=meta.title;
  const set=(selector,attribute,value)=>{const element=doc.head.querySelector(selector);if(element)element.setAttribute(attribute,value);};
  set('meta[name="description"]','content',meta.description);
  set('meta[name="robots"]','content',meta.robots);
  set('link[rel="canonical"]','href',meta.canonical);
  for(const [key,value] of Object.entries({title:meta.title,description:meta.shareDescription,url:meta.canonical,image:meta.image,'image:alt':meta.imageAlt}))set(`meta[property="og:${key}"]`,'content',value);
  const schema=doc.getElementById('site-schema');
  if(schema&&meta.canonical!==SITE_URL)schema.remove(); // Home-only structured data must not describe a different entry after navigation.
}
