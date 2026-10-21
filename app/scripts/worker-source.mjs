export function workerSource({ shell, version, assets = {} }) {
  return `// Generated MAEEN public-asset worker. No recordings, personal data or external requests.
const ROOT=new URL(self.registration.scope);
const PREFIX='maeen-'+encodeURIComponent(ROOT.pathname)+'-';
const CACHE=PREFIX+'shell-${version}';
const MODELS=PREFIX+'model-assets-v1';
const SHELL=${JSON.stringify(shell)};
const ASSETS=${JSON.stringify(assets)};
const pending=new Map();
const key=path=>new URL('__verified/'+ASSETS[path].sha256+'/'+path,ROOT).href;
async function valid(response,path){
 if(!response||!response.ok||!ASSETS[path])return false;
 const bytes=await response.clone().arrayBuffer();
 if(bytes.byteLength!==ASSETS[path].bytes)return false;
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');
 return hash===ASSETS[path].sha256;
}
async function fresh(path){
 const r=await fetch(new Request(new URL(path,ROOT).href,{cache:'reload'}));
 if(!await valid(r,path))throw Error('integrity');
 return r;
}
async function model(path){
 const cache=await caches.open(MODELS),cacheKey=key(path),stored=await cache.match(cacheKey);
 if(stored){if(await valid(stored,path))return stored;await cache.delete(cacheKey);}
 if(!pending.has(path))pending.set(path,(async()=>{
  try{const response=await fresh(path);try{await cache.put(cacheKey,response.clone());}catch{/* Storage quota may prevent offline caching; verified online inference still works. */}return response;}
  catch(error){const integrity=String(error).includes('integrity');return new Response('MAEEN model unavailable. Connect and download this model once before offline use.',{status:integrity?502:503,headers:{'Content-Type':'text/plain','X-MAEEN-Cache-Error':integrity?'integrity':'offline-missing'}});}
 })().finally(()=>pending.delete(path)));
 return (await pending.get(path)).clone();
}
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const responses=await Promise.all(SHELL.map(path=>fresh(path)));
 const cache=await caches.open(CACHE);
 await Promise.all(SHELL.map((path,i)=>cache.put(new URL(path,ROOT).href,responses[i])));
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 const allowed=new Set(Object.keys(ASSETS).filter(p=>!SHELL.includes(p)).map(key));
 const models=await caches.open(MODELS);for(const request of await models.keys())if(!allowed.has(request.url))await models.delete(request);
 for(const name of await caches.keys())if(name.startsWith(PREFIX)&&name!==CACHE&&name!==MODELS)await caches.delete(name);
 await self.clients.claim();
})()));
self.addEventListener('message',event=>{
 if(event.data?.type!=='ACTIVATE_UPDATE'||!event.source?.url)return;
 const client=new URL(event.source.url);
 if(client.origin===ROOT.origin&&client.pathname.startsWith(ROOT.pathname))self.skipWaiting();
});
async function shellAsset(path){
 const cache=await caches.open(CACHE),url=new URL(path,ROOT).href,stored=await cache.match(url);
 if(await valid(stored,path))return stored;
 if(stored)await cache.delete(url);
 try{const response=await fresh(path);try{await cache.put(url,response.clone());}catch{}return response;}
 catch{return new Response('MAEEN offline app assets are incomplete. Reconnect and reload.',{status:503,headers:{'Content-Type':'text/plain'}});}
}
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==ROOT.origin||!url.pathname.startsWith(ROOT.pathname))return;
 const path=url.pathname.slice(ROOT.pathname.length);
 if(request.mode==='navigate'){
  if(path!==''&&path!=='index.html')return;
  event.respondWith(shellAsset('index.html'));return;
 }
 if(SHELL.includes(path)){event.respondWith(shellAsset(path));return;}
 if(Object.hasOwn(ASSETS,path))event.respondWith(model(path));
});
`;
}
