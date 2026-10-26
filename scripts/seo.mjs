import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {makeFusion} from '../src/fusion.mjs';
import {SITE_URL,SITE_DESCRIPTION,escapeHTML as e,pageMetadata} from '../src/seo.mjs';

export function metadataHTML(meta,{prefix='../',full=false}={}){
  return `<meta name="description" content="${e(meta.description)}"><meta name="robots" content="${meta.robots}"><link rel="canonical" href="${e(meta.canonical)}"><meta property="og:type" content="website"><meta property="og:site_name" content="Fusion Viewer"><meta property="og:title" content="${e(meta.title)}"><meta property="og:description" content="${e(meta.shareDescription||meta.description)}"><meta property="og:url" content="${e(meta.canonical)}"><meta property="og:image" content="${meta.image}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="${e(meta.imageAlt)}"><meta name="twitter:card" content="summary_large_image"><link rel="icon" href="${prefix}favicon.svg" type="image/svg+xml"><link rel="icon" href="${prefix}icons/icon-96.png" sizes="96x96" type="image/png">${full?`<meta property="og:locale" content="en_US"><link rel="apple-touch-icon" href="${prefix}icons/apple-touch-icon.png"><link rel="manifest" href="${prefix}site.webmanifest">`:''}`;
}
function documentHTML(meta,content,{prefix='../',interactive=true,schema=''}={}){
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#ffffff"><title>${e(meta.title)}</title>${metadataHTML(meta,{prefix})}<link rel="stylesheet" href="${prefix}styles.css">${schema}${interactive?`<script type="module" src="${prefix}src/app.mjs"></script>`:''}</head><body><a class="skip-link" href="#main">Skip to content</a><div id="app">${content}</div>${interactive?'<dialog id="dialog"></dialog><div id="toast" role="status" aria-live="polite"></div>':''}</body></html>`;
}
const brand=prefix=>`<header class="seo-header"><a href="${prefix}">Fusion Viewer</a><nav><a href="${prefix}dex.html">Fusion dex</a><a href="${prefix}triples.html">Triple fusions</a><a href="${prefix}fusions/">All combinations</a></nav></header>`;
const statsHTML=stats=>`<table class="seo-stats"><caption>Base stats</caption><thead><tr>${['HP','Atk','Def','SpA','SpD','Spe','BST'].map(k=>`<th scope="col">${k}</th>`).join('')}</tr></thead><tbody><tr>${[...stats,stats.reduce((a,b)=>a+b,0)].map(n=>`<td>${n}</td>`).join('')}</tr></tbody></table>`;
const localizedNames=parents=>`<p class="seo-local-names"><span lang="ko">${parents.map(p=>e(p.names.ko)).join(' × ')}</span> · <span lang="ja">${parents.map(p=>e(p.names.ja)).join(' × ')}</span></p>`;
export function renderHomeEntry(template){
  const schema={'@context':'https://schema.org','@graph':[{'@type':'WebSite','@id':`${SITE_URL}#website`,name:'Fusion Viewer',alternateName:'Pokémon Infinite Fusion Viewer',url:SITE_URL,inLanguage:['en','ko','ja']},{'@type':'WebApplication',name:'Fusion Viewer',url:SITE_URL,description:SITE_DESCRIPTION,applicationCategory:'GameApplication',operatingSystem:'Any',browserRequirements:'Requires JavaScript for the interactive viewer',isAccessibleForFree:true,inLanguage:['en','ko','ja'],featureList:['Mobile-friendly Pokémon fusion viewer','Stat change comparisons','Sprite search by Pokémon, type, tag and artist','Official triple fusion sprites and stats']}]};
  return template.replace(/<!-- SEO:START -->[\s\S]*?<!-- SEO:END -->/,`<!-- SEO:START -->${metadataHTML(pageMetadata(),{prefix:'./',full:true})}<script type="application/ld+json" id="site-schema">${JSON.stringify(schema).replace(/</g,'\\u003c')}</script><!-- SEO:END -->`);
}
export function renderFusionEntry(head,body){
  const f=makeFusion(head,body),meta=pageMetadata({page:'lab',head,body});
  const content=`<div class="shell seo-entry">${brand('../')}<main id="main"><h1>${e(head.names.en)} × ${e(body.names.en)}</h1><p>${e(f.name)} · #${f.id} · ${f.types.map(e).join(' / ')}</p>${localizedNames([head,body])}${statsHTML(f.stats)}<p>Head: ${e(head.names.en)} (#${head.id}). Body: ${e(body.names.en)} (#${body.id}).</p><p>Explore sprites and compare stat changes with level, nature, IV and EV controls in the fusion lab.</p><nav class="seo-links"><a href="../?head=${head.id}&amp;body=${body.id}#lab">Open fusion lab</a><a href="${body.id}.${head.id}.html">Reverse fusion</a><a href="../fusions/${head.id}.html">More ${e(head.names.en)} fusions</a></nav><noscript><p>The interactive lab requires JavaScript. Names, types and base stats are available above.</p></noscript></main></div>`;
  return documentHTML(meta,content);
}
export function renderTripleEntry(record,pokemon){
  const parents=record.components.map(id=>pokemon.find(p=>p.id===id)),meta=pageMetadata({page:'triple',triple:record,components:parents});
  const content=`<div class="shell seo-entry">${brand('../')}<main id="main"><h1>${e(record.name)}</h1><p>${parents.map(p=>e(p.names.en)).join(' × ')} · #${record.id}</p>${localizedNames(parents)}<img class="seo-triple-image" src="https://raw.githubusercontent.com/infinitefusion/infinitefusion-hoenn-public/main/${record.spritePath}" alt="${e(record.name)} triple fusion" width="288" height="288"><p>${record.types.map(e).join(' / ')}</p>${statsHTML(record.stats)}<p>Official triple fusion with dedicated base stats. Compare calculated stats with level, nature, IV and EV controls.</p><a href="../?triple=${record.id}#triple">Open triple fusion lab</a></main></div>`;
  return documentHTML(meta,content);
}
export function renderDirectory(pokemon,head=null){
  const meta={...pageMetadata(),title:head?`${head.names.en} Fusions — All Body Combinations | Fusion Viewer`:'All Pokémon Fusion Combinations | Fusion Viewer',description:head?`Browse every ${head.names.en} head fusion in the Pokémon Infinite Fusion database. Choose a body to see types, sprites and base stats.`:'Browse Pokémon Infinite Fusion combinations by head Pokémon. Open an individual combination to view sprites, types and base stats.',canonical:new URL(head?`fusions/${head.id}.html`:'fusions/',SITE_URL).href};
  const links=pokemon.map(p=>`<li><a href="${head?`../fusion/${head.id}.${p.id}.html`:`${p.id}.html`}">#${p.id} ${e(p.names.en)} <span lang="ko">${e(p.names.ko)}</span> <span lang="ja">${e(p.names.ja)}</span></a></li>`).join('');
  return documentHTML(meta,`<div class="shell seo-entry">${brand('../')}<main id="main"><h1>${e(head?head.names.en+' head fusions':'All fusion combinations')}</h1><p>${e(meta.description)}</p><ul class="seo-directory">${links}</ul></main></div>`,{interactive:false});
}
export function renderOverview(page,triples=[],pokemon=[]){
  const triple=page==='triple',meta=pageMetadata({page});
  const links=triple?`<ul class="seo-directory">${triples.map(record=>`<li><a href="./triple/${record.id}.html">${e(record.name)} — ${record.components.map(id=>e(pokemon.find(p=>p.id===id)?.names.en)).join(' × ')}</a></li>`).join('')}</ul>`:'';
  return documentHTML(meta,`<div class="shell seo-entry">${brand('./')}<main id="main"><h1>${triple?'Triple fusions':'Fusion dex'}</h1><p>${e(meta.description)}</p><p>Mobile-friendly viewing · Stat change comparisons · Easy search</p><p><a href="./fusions/">Browse all Pokémon combinations</a></p>${links}</main></div>`,{prefix:'./'});
}
export function* searchPageURLs(pokemon,triples){
  yield SITE_URL;for(const path of ['dex.html','triples.html','fusions/'])yield new URL(path,SITE_URL).href;
  for(const head of pokemon){yield new URL(`fusions/${head.id}.html`,SITE_URL).href;for(const body of pokemon)yield new URL(`fusion/${head.id}.${body.id}.html`,SITE_URL).href;}
  for(const record of triples)yield new URL(`triple/${record.id}.html`,SITE_URL).href;
}
export function sitemapXML(urls){
  if(urls.length>50000)throw Error('A sitemap must contain at most 50,000 URLs');
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(url=>`<url><loc>${e(url)}</loc></url>`).join('')}</urlset>`;
}
export const sitemapIndexXML=urls=>`<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(url=>`<sitemap><loc>${e(url)}</loc></sitemap>`).join('')}</sitemapindex>`;

export async function buildSearchEntries(out,catalog,triples){
  const pokemon=catalog.pokemon;let totalBytes=0,pages=0,sitemapNumber=0,urls=[];const maps=[];
  for(const folder of ['fusion/','triple/','fusions/','sitemaps/'])await mkdir(new URL(folder,out),{recursive:true});
  const save=async(path,content)=>{totalBytes+=Buffer.byteLength(content);await writeFile(new URL(path,out),content);};
  const flush=async()=>{if(!urls.length)return;const path=`sitemaps/pages-${++sitemapNumber}.xml`;await save(path,sitemapXML(urls));maps.push(new URL(path,SITE_URL).href);urls=[];};
  const register=async(path,html)=>{await save(path,html);pages++;urls.push(new URL(path.replace(/index\.html$/,''),SITE_URL).href);if(urls.length===40000)await flush();};
  urls.push(SITE_URL);
  await register('dex.html',renderOverview('dex'));
  await register('triples.html',renderOverview('triple',triples,pokemon));
  await register('fusions/index.html',renderDirectory(pokemon));
  for(const head of pokemon){
    await register(`fusions/${head.id}.html`,renderDirectory(pokemon,head));
    // Bound pending filesystem writes: neither 250k promises nor a giant HTML array in memory.
    for(let i=0;i<pokemon.length;i+=24){
      await Promise.all(pokemon.slice(i,i+24).map(async body=>{
        const path=`fusion/${head.id}.${body.id}.html`;await save(path,renderFusionEntry(head,body));pages++;
      }));
      for(const body of pokemon.slice(i,i+24)){urls.push(new URL(`fusion/${head.id}.${body.id}.html`,SITE_URL).href);if(urls.length===40000)await flush();}
    }
  }
  for(const record of triples)await register(`triple/${record.id}.html`,renderTripleEntry(record,pokemon));
  await flush();await save('sitemap.xml',sitemapIndexXML(maps));
  await save('robots.txt',`# Project-path robots.txt is informational: crawlers read /robots.txt at the domain root.\nUser-agent: *\nAllow: /\nSitemap: ${SITE_URL}sitemap.xml\n`);
  if(totalBytes>900_000_000)throw Error(`Search pages exceed the 900 MB budget (${totalBytes} bytes).`);
  return {pages,urls:pages+1,sitemaps:maps.length,bytes:totalBytes};
}
