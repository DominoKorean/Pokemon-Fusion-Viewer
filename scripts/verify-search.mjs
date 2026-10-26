import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {SITE_URL} from '../src/seo.mjs';
import {searchPageURLs} from './seo.mjs';

export async function verifySearch(out=new URL('../dist/',import.meta.url)){
  const catalog=JSON.parse(await readFile(new URL('data/catalog.json',out)));
  const {triples}=JSON.parse(await readFile(new URL('data/triples.json',out)));
  const expected=new Set(searchPageURLs(catalog.pokemon,triples)),seen=new Set();
  const locations=xml=>[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
  const index=await readFile(new URL('sitemap.xml',out),'utf8'),maps=locations(index);
  assert.ok(index.includes('<sitemapindex'));
  assert.equal(maps.length,Math.ceil(expected.size/40000));
  const files=new Set(['index.html','dex.html','triples.html']);
  for(const dir of ['fusion','triple','fusions'])for(const file of await readdir(new URL(`${dir}/`,out)))files.add(`${dir}/${file}`);
  for(const map of maps){
    assert.ok(map.startsWith(SITE_URL+'sitemaps/'));const relative=map.slice(SITE_URL.length);
    assert.match(relative,/^sitemaps\/pages-\d+\.xml$/);
    const xml=await readFile(new URL(relative,out),'utf8'),urls=locations(xml);
    assert.ok(xml.includes('<urlset'));assert.ok(urls.length>0&&urls.length<=40000);assert.ok(Buffer.byteLength(xml)<50*1024*1024);
    for(const url of urls){
      assert.ok(expected.has(url),`Unexpected sitemap URL: ${url}`);assert.ok(!seen.has(url),`Duplicate sitemap URL: ${url}`);seen.add(url);
      const relative=url.slice(SITE_URL.length),file=relative===''?'index.html':relative.endsWith('/')?relative+'index.html':relative;
      assert.ok(files.has(file),`Missing deployed page: ${file}`);
    }
  }
  assert.equal(seen.size,expected.size);
  const home=await readFile(new URL('index.html',out),'utf8');
  assert.ok(home.includes('application/ld+json'));assert.ok(home.includes(`${SITE_URL}social/preview.jpg`));
  for(const asset of ['social/preview.jpg','favicon.svg','icons/icon-96.png','site.webmanifest','404.html'])assert.ok((await readFile(new URL(asset,out))).length>0,asset);
  const report=JSON.parse(await readFile(new URL('build-report.json',out)));
  assert.equal(report.urls,expected.size);assert.ok(report.totalBytes<950_000_000);
  console.log(`Verified ${seen.size.toLocaleString('en')} canonical URLs across ${maps.length} sitemaps; every target exists.`);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)await verifySearch();
