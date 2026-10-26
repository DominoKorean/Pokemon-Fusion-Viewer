import {cp,mkdir,readFile,writeFile} from 'node:fs/promises';
await readFile(new URL('../public/data/catalog.json',import.meta.url));
const out=new URL('../dist/',import.meta.url);await mkdir(out,{recursive:true});
await cp(new URL('../public/',import.meta.url),out,{recursive:true});
await cp(new URL('../src/',import.meta.url),new URL('src/',out),{recursive:true});
await cp(new URL('../index.html',import.meta.url),new URL('index.html',out));
await cp(new URL('../styles.css',import.meta.url),new URL('styles.css',out));
await writeFile(new URL('.nojekyll',out),'');
console.log('Static site built in dist/');
