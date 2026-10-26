import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {gzipSync} from 'node:zlib';
import {renderHomeEntry,renderFusionEntry,renderTripleEntry,renderDirectory,renderOverview,searchPageURLs,sitemapXML,sitemapIndexXML} from './seo.mjs';
import {SITE_URL} from '../src/seo.mjs';
const root=path.resolve(fileURLToPath(new URL('../',import.meta.url)));
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.webmanifest':'application/manifest+json','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg'};
let searchData;
const getSearchData=()=>searchData??=Promise.all(['catalog','triples'].map(name=>readFile(path.join(root,'public/data',`${name}.json`),'utf8').then(JSON.parse)));
async function generatedPage(name){
  if(name==='/index.html')return renderHomeEntry(await readFile(path.join(root,'index.html'),'utf8'));
  const [catalog,{triples}]=await getSearchData(),pokemon=catalog.pokemon,find=id=>pokemon.find(p=>p.id===Number(id));
  const fusion=name.match(/^\/fusion\/(\d+)\.(\d+)\.html$/),triple=name.match(/^\/triple\/(\d+\.\d+\.\d+)\.html$/),directory=name.match(/^\/fusions\/(\d+)\.html$/);
  if(fusion&&find(fusion[1])&&find(fusion[2]))return renderFusionEntry(find(fusion[1]),find(fusion[2]));
  if(triple){const record=triples.find(r=>r.id===triple[1]);if(record)return renderTripleEntry(record,pokemon);}
  if(name==='/fusions/'||name==='/fusions/index.html')return renderDirectory(pokemon);
  if(directory&&find(directory[1]))return renderDirectory(pokemon,find(directory[1]));
  if(name==='/dex.html'||name==='/triples.html')return renderOverview(name==='/dex.html'?'dex':'triple',triples,pokemon);
  const count=pokemon.length**2+pokemon.length+triples.length+4,mapCount=Math.ceil(count/40000);
  if(name==='/sitemap.xml')return sitemapIndexXML(Array.from({length:mapCount},(_,i)=>new URL(`sitemaps/pages-${i+1}.xml`,SITE_URL).href));
  const map=name.match(/^\/sitemaps\/pages-(\d+)\.xml$/);
  if(map&&Number(map[1])>=1&&Number(map[1])<=mapCount){const start=(Number(map[1])-1)*40000,urls=[];let i=0;for(const url of searchPageURLs(pokemon,triples)){if(i>=start&&i<start+40000)urls.push(url);if(++i>=start+40000)break;}return sitemapXML(urls);}
  return null;
}
const server=http.createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,'http://localhost');let name=decodeURIComponent(url.pathname);
    if(name==='/')name='/index.html';
    // Expose application files only; never expose Git, scripts or other workspace files.
    const generated=/^\/(?:index\.html|dex\.html|triples\.html|fusion\/\d+\.\d+\.html|triple\/\d+\.\d+\.\d+\.html|fusions\/(?:index\.html|\d+\.html)?|sitemap\.xml|sitemaps\/pages-\d+\.xml)$/.test(name);
    if(!generated&&!/^\/(?:404\.html|styles\.css|favicon\.svg|robots\.txt|site\.webmanifest|icons\/[\w-]+\.png|social\/[\w.-]+\.(?:jpg|html)|src\/(?:vendor\/)?[\w.-]+\.mjs|data\/[\w./-]+\.json)$/.test(name)){res.writeHead(404);res.end('Not found');return;}
    const relative=/^\/(?:data\/|icons\/|social\/|favicon\.svg|robots\.txt|site\.webmanifest|404\.html)/.test(name)?'public'+name:name.slice(1);
    const file=path.resolve(root,relative);
    if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
    const html=generated?await generatedPage(name):null;
    if(generated&&html===null){res.writeHead(404);res.end('Not found');return;}
    let bytes=generated?Buffer.from(html):await readFile(file);const headers={'Content-Type':mime[path.extname(file)]||(generated?'text/html; charset=utf-8':'application/octet-stream'),'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','Vary':'Accept-Encoding'};
    if(bytes.length>1000&&req.headers['accept-encoding']?.includes('gzip')){bytes=gzipSync(bytes);headers['Content-Encoding']='gzip';}
    res.writeHead(200,headers);res.end(bytes);
  }catch{res.writeHead(404);res.end('Not found');}
});
server.listen(Number(process.env.PORT??5173),'127.0.0.1',()=>console.log(`Local: http://127.0.0.1:${server.address().port}`));
