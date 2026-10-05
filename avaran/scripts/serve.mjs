import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve(import.meta.dirname,'../dist');
const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.mp4':'video/mp4','.stl':'application/octet-stream'};
const server=http.createServer(async(req,res)=>{
  try {
    const url = new URL(req.url,'http://localhost');
    const relative=decodeURIComponent(url.pathname) === '/' ? 'index.html' : decodeURIComponent(url.pathname).slice(1);
    const file=path.resolve(root,relative);
    if(!file.startsWith(root+path.sep)) {res.writeHead(403).end();return;}
    const info=await stat(file); if(!info.isFile()) throw new Error('Not a file');
    const data=await readFile(file);
    const range=req.headers.range;
    if(range && path.extname(file)==='.mp4'){
      const match=/bytes=(\d+)-(\d*)/.exec(range);
      if(!match){res.writeHead(416).end();return;}
      const start=Number(match[1]),end=Math.min(match[2]?Number(match[2]):info.size-1,info.size-1);
      if(start>end){res.writeHead(416).end();return;}
      res.writeHead(206,{'Content-Type':types['.mp4'],'Content-Range':`bytes ${start}-${end}/${info.size}`,'Accept-Ranges':'bytes','Content-Length':end-start+1});res.end(data.subarray(start,end+1));return;
    }
    res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});res.end(data);
  }catch{res.writeHead(404,{'Content-Type':'text/plain'}).end('Not found');}
});
const port=Number(process.env.PORT)||5173;
server.listen(port,'127.0.0.1',()=>console.log(`Local: http://127.0.0.1:${port}`));
