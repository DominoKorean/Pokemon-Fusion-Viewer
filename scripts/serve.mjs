import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {gzipSync} from 'node:zlib';
const root=path.resolve(fileURLToPath(new URL('../',import.meta.url)));
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png'};
const server=http.createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,'http://localhost');let name=decodeURIComponent(url.pathname);
    if(name==='/')name='/index.html';
    // Expose application files only; never expose Git, scripts or other workspace files.
    if(!/^\/(?:index\.html|styles\.css|favicon\.svg|src\/(?:vendor\/)?[\w.-]+\.mjs|data\/[\w./-]+\.json)$/.test(name)){res.writeHead(404);res.end('Not found');return;}
    const relative=name.startsWith('/data/')||name==='/favicon.svg'?'public'+name:name.slice(1);
    const file=path.resolve(root,relative);
    if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
    let bytes=await readFile(file);const headers={'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','Vary':'Accept-Encoding'};
    if(bytes.length>1000&&req.headers['accept-encoding']?.includes('gzip')){bytes=gzipSync(bytes);headers['Content-Encoding']='gzip';}
    res.writeHead(200,headers);res.end(bytes);
  }catch{res.writeHead(404);res.end('Not found');}
});
server.listen(Number(process.env.PORT)||5173,'127.0.0.1',()=>console.log(`Local: http://127.0.0.1:${server.address().port}`));
