// Deterministic fault injection against the generated worker implementation.
import { workerSource } from './worker-source.mjs';
import { runInNewContext } from 'node:vm';
import { createHash, webcrypto } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
const root='https://example.org/Maeen/', stores=new Map(), handlers={};
const bodies={ 'index.html':'current shell', 'models/probe.bin':'complete model' };
const assets=Object.fromEntries(Object.entries(bodies).map(([p,b])=>[p,{bytes:b.length,sha256:createHash('sha256').update(b).digest('hex')}]));
let interrupted=true;
stores.set('maeen-%2FMaeen%2F-shell-old', new Map([[root+'index.html',new Response('previous shell')]]));
runInNewContext(workerSource({shell:['index.html'],version:'next',assets}),{
  self:{registration:{scope:root},addEventListener:(n,f)=>handlers[n]=f,clients:{claim:async()=>{}},skipWaiting:()=>{}},
  caches:{open:async n=>{ if(!stores.has(n))stores.set(n,new Map());const s=stores.get(n);return {match:async k=>s.get(typeof k==='string'?k:k.url)?.clone(),put:async(k,r)=>s.set(typeof k==='string'?k:k.url,r.clone()),delete:async k=>s.delete(typeof k==='string'?k:k.url),keys:async()=>[...s.keys()].map(u=>new Request(u))};},keys:async()=>[...stores.keys()],delete:async n=>stores.delete(n)},
  fetch:async r=>{const p=new URL(r.url).pathname.slice('/Maeen/'.length);if(interrupted){return new Response(new ReadableStream({start(c){c.enqueue(new Uint8Array([1]));c.error(Error('connection interrupted'));}}));}return new Response(bodies[p]);},
  URL,Request,Response,Uint8Array,Map,Set,crypto:webcrypto,
});
async function get(){let p;handlers.fetch({request:new Request(root+'models/probe.bin'),respondWith:r=>p=r});return p;}
let install;handlers.install({waitUntil:p=>install=p});let rejected=false;try{await install;}catch{rejected=true;}
const response=await get();
const report={method:'Node VM fault injection of actual worker generator; not a physical/browser network test',failedInstallRejected:rejected,previousShellRetained:stores.get('maeen-%2FMaeen%2F-shell-old').has(root+'index.html'),interruptedModelStatus:response.status,partialModelCached:[...stores.entries()].filter(([n])=>n.includes('model-assets')).some(([,s])=>s.size>0)};
interrupted=false;
report.recoveredModel=await(await get()).text()==='complete model';
await writeFile(new URL('../../docs/phase7/recovery-faults.json',import.meta.url),JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
if(!report.failedInstallRejected||!report.previousShellRetained||report.interruptedModelStatus!==503||report.partialModelCached||!report.recoveredModel)process.exitCode=1;
