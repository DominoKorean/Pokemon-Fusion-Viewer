import test from 'node:test';
import assert from 'node:assert/strict';
import {SITE_URL,entryRoute,entryURL,pageMetadata} from '../src/seo.mjs';
import {readRoute} from '../src/navigation.mjs';
import {initialRoute} from '../src/initial-route.mjs';
import {renderFusionEntry,renderHomeEntry,searchPageURLs,sitemapXML,sitemapIndexXML,buildSearchEntries} from '../scripts/seo.mjs';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {pathToFileURL} from 'node:url';
import path from 'node:path';

const head={id:1,names:{en:'Bulbasaur',ko:'이상해씨',ja:'フシギダネ'},stats:[45,49,49,65,65,45],types:['grass','poison'],split:['Bulba','saur']};
const body={id:4,names:{en:'Charmander',ko:'파이리',ja:'ヒトカゲ'},stats:[39,52,43,60,50,65],types:['fire'],split:['Char','mander']};
test('crawlable entries work on a project subpath and root domain',()=>{
  assert.deepEqual(entryRoute(`${SITE_URL}fusion/1.4.html`),{kind:'fusion',head:1,body:4,page:'lab'});
  assert.equal(entryRoute(`${SITE_URL}triple/1.4.7.html`).triple,'1.4.7');
  assert.equal(entryRoute(`${SITE_URL}dex.html`).page,'dex');
  assert.equal(entryURL({head:1,body:4,page:'lab',alt:'a'},SITE_URL),`${SITE_URL}fusion/1.4.html?variant=a`);
  assert.equal(entryURL({head:1,body:4,page:'lab'},'https://example.test/'), 'https://example.test/fusion/1.4.html');
  assert.equal(entryURL({head:1,body:4,page:'saved'},SITE_URL),`${SITE_URL}?head=1&body=4#saved`);
  assert.equal(entryURL({head:1,body:4,page:'triple',triple:'1.4.7'},SITE_URL,{home:true}),SITE_URL);
});
test('static fusion entries override saved views and preserve legacy query routes',()=>{
  const ids=new Set([1,4,6,94]),settings={saved:{head:6,body:94},random:()=>{throw Error('Must use the explicit pair');}};
  assert.deepEqual(initialRoute(`${SITE_URL}fusion/1.4.html`,ids,settings),{head:1,body:4,alt:'',variantExplicit:false,page:'lab'});
  assert.equal(readRoute(`${SITE_URL}triple/1.4.7.html`,ids,new Set(['1.4.7'])).page,'triple');
  assert.equal(initialRoute(`${SITE_URL}dex.html`,ids,{saved:{head:1,body:4}}).page,'dex');
  assert.equal(readRoute(`${SITE_URL}?head=4&body=1#lab`,ids).head,4);
});
test('fusion metadata has a specific title, database-backed summary and canonical without variants',()=>{
  const meta=pageMetadata({page:'lab',head,body});
  assert.match(meta.title,/Bulbasaur × Charmander/);
  assert.match(meta.description,/HP 43/);
  assert.equal(meta.canonical,`${SITE_URL}fusion/1.4.html`);
  assert.match(meta.image,/\/social\/preview.jpg$/);
  assert.equal(pageMetadata({page:'saved'}).robots,'noindex,follow');
  assert.equal(pageMetadata({page:'triple',home:true}).canonical,SITE_URL);
});
test('a small production build writes every pair, reverse, directory, and matching sitemap inventory',async()=>{
  const folder=await mkdtemp(path.join(tmpdir(),'fusion-seo-')),out=pathToFileURL(folder+path.sep);
  try{
    const report=await buildSearchEntries(out,{pokemon:[head,body]},[]);
    assert.equal(report.urls,10); // Home, 2 overview pages, 3 directories, 4 pairs.
    assert.equal(report.sitemaps,1);
    const expected=[...searchPageURLs([head,body],[])];
    const xml=await readFile(new URL('sitemaps/pages-1.xml',out),'utf8');
    const actual=[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
    assert.deepEqual(actual,expected);assert.equal(new Set(actual).size,actual.length);
    for(const url of actual.slice(1))assert.ok((await readFile(new URL(url.replace(SITE_URL,'').replace(/\/$/,'/index.html'),out),'utf8')).includes('<h1>'));
    const root=renderHomeEntry('<!-- SEO:START -->placeholder<!-- SEO:END -->');
    assert.ok(root.includes('application/ld+json'));assert.ok(root.includes(SITE_URL));assert.ok(!root.includes('placeholder'));
  }finally{await rm(folder,{recursive:true,force:true});}
});
test('prerendered fusion HTML is useful without JS, escaped and small enough for all pairs',()=>{
  const html=renderFusionEntry(head,body);
  for(const text of ['Bulbasaur','Charmander','이상해씨','フシギダネ','43','canonical','og:image','twitter:card','src/app.mjs'])assert.ok(html.includes(text),text);
  assert.ok(Buffer.byteLength(html)<3600,`Entry is ${Buffer.byteLength(html)} bytes`);
  const escaped=renderFusionEntry({...head,names:{...head.names,en:'<script>"&'}},body);
  assert.ok(!escaped.includes('<h1><script>'));
  assert.ok(escaped.includes('&lt;script&gt;'));
});
test('sitemaps contain absolute canonical URLs and no invented last modification dates',()=>{
  const urls=[SITE_URL,`${SITE_URL}fusion/1.4.html`];
  const xml=sitemapXML(urls);
  assert.match(xml,/xmlns="http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9"/);
  assert.ok(xml.includes(urls[1]));assert.ok(!xml.includes('lastmod'));
  assert.match(sitemapIndexXML([`${SITE_URL}sitemaps/fusions-1.xml`]),/<sitemapindex/);
  assert.throws(()=>sitemapXML(Array(50001).fill(SITE_URL)),/50,000/);
});
