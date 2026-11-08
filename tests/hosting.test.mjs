import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {DatabaseSync} from 'node:sqlite';
import ts from 'typescript';

// Own-Cloudflare hosting: ChatGPT identity headers are never trusted off ChatGPT Sites; first owner password via OWNER_SETUP_CODE.
const sql=new DatabaseSync(':memory:');for(const f of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())sql.exec(fs.readFileSync(path.join('drizzle',f),'utf8'));
const DB={prepare(q){let a=[];return {bind(...v){a=v;return this},async first(){return sql.prepare(q).get(...a)||null},async all(){return {results:sql.prepare(q).all(...a)}},async run(){const r=sql.prepare(q).run(...a);return {meta:{changes:r.changes}}}}}};
const env={DB,BUCKET:{async put(){},async get(){return null}},OWNER_EMAIL:'owner@example.test'};let forgedUser=null,cookieHeader='';
const ctx=vm.createContext({Request,Response,URL,URLSearchParams,TextEncoder,crypto,console,Date,Map,Set,Uint8Array,Headers});const cache=new Map();
function synthetic(key,exports){const m=new vm.SyntheticModule(Object.keys(exports),function(){for(const [k,v]of Object.entries(exports))this.setExport(k,v)},{context:ctx,identifier:key});cache.set(key,m);return m;}
synthetic('next/headers',{headers:async()=>new Headers({cookie:cookieHeader})});synthetic('cloudflare:workers',{env});synthetic('auth',{getChatGPTUser:async()=>forgedUser});
const pending=new Map();async function load(f){f=path.resolve(f);if(!pending.has(f))pending.set(f,inner(f));return pending.get(f);}
async function inner(f){if(cache.has(f))return cache.get(f);if(f.endsWith('.json'))return synthetic(f,{default:JSON.parse(fs.readFileSync(f,'utf8'))});const code=ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;const m=new vm.SourceTextModule(code,{context:ctx,identifier:f});cache.set(f,m);await m.link(async(s,ref)=>{if(s==='next/headers'||s==='cloudflare:workers')return cache.get(s);if(s.endsWith('chatgpt-auth'))return cache.get('auth');let t=path.resolve(path.dirname(ref.identifier),s);if(!path.extname(t))t+='.ts';return load(t)});return m;}
const R={};for(const [n,f] of Object.entries({hosting:'lib/hosting.ts',privacy:'app/privacy/route.ts',terms:'app/terms/route.ts',support:'app/support/route.ts',auth:'app/api/admin/auth/route.ts',login:'app/admin/login/route.ts',live:'app/api/admin/live/route.ts',owner:'lib/owner.ts'})){const m=await load(f);if(m.status!=='evaluated')await m.evaluate();R[n]=m.namespace;}
const origin='https://gulit.test',req=(u,method='GET',body)=>new Request(origin+u,{method,headers:{Origin:origin,'Content-Type':'application/json','cf-connecting-ip':'1.2.3.4'},...(body?{body:JSON.stringify(body)}:{})});

// 1. Forged ChatGPT identity is ignored when not on ChatGPT Sites.
forgedUser={userId:'x',email:'owner@example.test',displayName:'x',fullName:null};
assert.equal(await R.owner.owner(),null);assert.equal((await R.live.GET(req('/api/admin/live'))).status,403);
env.GULIT_HOSTING='chatgpt-sites';assert.ok(await R.owner.owner(),'trusted on Sites');env.GULIT_HOSTING='own-cloudflare';
const stripped=R.hosting.stripPlatformHeaders(new Request(origin,{headers:{'oai-authenticated-user-email':'owner@example.test','OAI-Authenticated-User-Id':'1','x-other':'ok'}}));
assert.equal(stripped.headers.get('oai-authenticated-user-email'),null);assert.equal(stripped.headers.get('oai-authenticated-user-id'),null);assert.equal(stripped.headers.get('x-other'),'ok');
// 2. No password yet and no setup code: page explains; no ChatGPT link; API refuses.
let page=await(await R.login.GET()).text();assert.match(page,/OWNER_SETUP_CODE/);assert.doesNotMatch(page,/signin-with-chatgpt/);
assert.equal((await R.auth.POST(req('/api/admin/auth','POST',{username:'hamza',password:'correct horse battery',confirm:'correct horse battery'}))).status,403);
// 3. Setup code creates the first password, once; then normal sign-in.
env.OWNER_SETUP_CODE='S3tup-code-for-gulit-2026';
page=await(await R.login.GET()).text();assert.match(page,/name="setupCode"/);
assert.equal((await R.auth.POST(req('/api/admin/auth','POST',{username:'hamza',password:'correct horse battery',confirm:'correct horse battery',setupCode:'wrong-code-wrong-code-xx'}))).status,403);
let r=await R.auth.POST(req('/api/admin/auth','POST',{username:'hamza',password:'correct horse battery',confirm:'correct horse battery',setupCode:'S3tup-code-for-gulit-2026'}));assert.equal(r.status,200);
cookieHeader=r.headers.get('set-cookie').split(';')[0];forgedUser=null;assert.ok(await R.owner.owner(),'password session works');assert.equal((await R.live.GET(req('/api/admin/live'))).status,200);cookieHeader='';
page=await(await R.login.GET()).text();assert.doesNotMatch(page,/setupCode/);assert.doesNotMatch(page,/recovery with ChatGPT/);
assert.equal((await R.auth.POST(req('/api/admin/auth','POST',{username:'hamza',password:'another password!!',confirm:'another password!!',setupCode:'S3tup-code-for-gulit-2026'}))).status,401,'setup code cannot replace an existing password');
assert.equal((await R.auth.POST(req('/api/admin/auth','POST',{username:'hamza',password:'correct horse battery'}))).status,200);
// 4. Build config: production settings file is validated.
const vite=fs.readFileSync('vite.config.ts','utf8');assert.match(vite,/GULIT_DEPLOY/);assert.match(vite,/migrations_dir: "drizzle"/);assert.match(vite,/GULIT_HOSTING: "own-cloudflare"/);
const worker=fs.readFileSync('worker/index.ts','utf8');assert.match(worker,/stripPlatformHeaders\(request\)/);assert.match(worker,/scheduled\(/);
// 5. Store requirements: policy pages and Android asset links.
for(const k of ['privacy','terms','support']){const r=await R[k].GET();assert.equal(r.status,200);const t=await r.text();assert.match(t,/MOM Manufacturing PLC/);assert.match(t,/ceo@mommanufacturingplc\.com/);}
assert.match(await(await R.privacy.GET()).text(),/Chapa/);
assert.equal(R.hosting.assetLinksResponse({}).status,404);assert.equal(R.hosting.assetLinksResponse({ANDROID_PACKAGE:'com.gulitonline.app',ANDROID_CERT_SHA256:'nope'}).status,404);
const fp=Array.from({length:32},(_,i)=>i.toString(16).padStart(2,'0')).join(':');const al=await R.hosting.assetLinksResponse({ANDROID_PACKAGE:'com.gulitonline.app',ANDROID_CERT_SHA256:fp}).json();
assert.equal(al[0].target.package_name,'com.gulitonline.app');assert.equal(al[0].target.sha256_cert_fingerprints[0],fp.toUpperCase());
const mf=JSON.parse(fs.readFileSync('public/manifest.webmanifest','utf8'));assert.doesNotMatch(mf.description,/demo/i);assert.ok(mf.icons.some(i=>i.purpose==='maskable'));
console.log('PASS: hosting — forged ChatGPT headers ignored off Sites, headers stripped, setup-code-only first password (once), password sign-in, no ChatGPT links off Sites, production build config, cron handler, policy pages, Android asset links, store-ready manifest');
