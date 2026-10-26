import {cp,mkdir,readFile,writeFile,readdir,stat} from 'node:fs/promises';
import {buildSearchEntries,renderHomeEntry} from './seo.mjs';
import {verifySearch} from './verify-search.mjs';
const catalog=JSON.parse(await readFile(new URL('../public/data/catalog.json',import.meta.url)));
const {triples}=JSON.parse(await readFile(new URL('../public/data/triples.json',import.meta.url)));
const out=new URL('../dist/',import.meta.url);await mkdir(out,{recursive:true});
await cp(new URL('../public/',import.meta.url),out,{recursive:true});
await cp(new URL('../src/',import.meta.url),new URL('src/',out),{recursive:true});
await writeFile(new URL('index.html',out),renderHomeEntry(await readFile(new URL('../index.html',import.meta.url),'utf8')));
await cp(new URL('../styles.css',import.meta.url),new URL('styles.css',out));
await writeFile(new URL('.nojekyll',out),'');
const report=await buildSearchEntries(out,catalog,triples);
async function directoryBytes(folder){let size=0;for(const entry of await readdir(folder,{withFileTypes:true})){const file=new URL(entry.name+(entry.isDirectory()?'/':''),folder);size+=entry.isDirectory()?await directoryBytes(file):(await stat(file)).size;}return size;}
const bytes=await directoryBytes(out);
if(bytes>950_000_000)throw Error(`Site output exceeds the 950 MB safety budget: ${bytes} bytes`);
await writeFile(new URL('build-report.json',out),JSON.stringify({...report,totalBytes:bytes},null,2)+'\n');
console.log(`Static site built in dist/: ${report.urls.toLocaleString('en')} indexable URLs, ${report.sitemaps} sitemaps, ${(bytes/1e6).toFixed(1)} MB.`);
await verifySearch(out);
