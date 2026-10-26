import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
test('local server serves application files and keeps workspace internals private',async()=>{
  const child=spawn(process.execPath,['scripts/serve.mjs'],{env:{...process.env,PORT:'0'},stdio:['ignore','pipe','pipe']});
  try{
    const [output]=await Promise.race([once(child.stdout,'data'),once(child,'exit').then(()=>{throw Error('Server exited');})]);
    const base=String(output).trim().replace('Local: ','');
    for(const file of ['/','/styles.css','/src/app.mjs','/src/search-worker.mjs','/src/vendor/hansearch.mjs','/data/catalog.json','/fusion/1.4.html','/triple/1.4.7.html','/dex.html','/triples.html','/fusions/','/fusions/1.html','/sitemap.xml','/sitemaps/pages-1.xml','/robots.txt','/site.webmanifest','/social/preview.jpg','/icons/icon-96.png']){
      const r=await fetch(`${base}${file}`);assert.equal(r.status,200,file);assert.ok((await r.text()).length>0);
    }
    for(const file of ['/.git/config','/scripts/sync-data.mjs','/package.json','/data/../../.git/config','/fusion/99999.1.html','/triple/1.2.3.html','/fusions/99999.html','/sitemaps/pages-999.xml','/social/../.git/config']){
      const r=await fetch(`${base}${file}`);assert.equal(r.status,404,file);
    }
    const fusion=await(await fetch(`${base}/fusion/1.4.html?variant=a`)).text();
    assert.match(fusion,/<title>Bulbasaur × Charmander/);
    assert.match(fusion,/<link rel="canonical" href="https:\/\/dominokorean.github.io\/Pokemon-Fusion-Viewer\/fusion\/1.4.html">/);
    assert.ok(fusion.includes('이상해씨'));assert.ok(fusion.includes('<caption>Base stats</caption>'));
    const home=await(await fetch(base)).text();assert.ok(home.includes('application/ld+json'));assert.ok(!home.includes('Generated from src/seo.mjs'));
  }finally{child.kill();}
});
