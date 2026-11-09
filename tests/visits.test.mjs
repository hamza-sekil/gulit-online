import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {DatabaseSync} from 'node:sqlite';
import ts from 'typescript';
// Anonymous visitor counting for the owner dashboard.
const sql=new DatabaseSync(':memory:');for(const f of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())sql.exec(fs.readFileSync(path.join('drizzle',f),'utf8'));
const DB={prepare(q){let a=[];return {bind(...v){a=v;return this},async first(){return sql.prepare(q).get(...a)||null},async all(){return {results:sql.prepare(q).all(...a)}},async run(){const r=sql.prepare(q).run(...a);return {meta:{changes:r.changes}}}}}};
const env={DB,BUCKET:{async put(){},async get(){return null}},OWNER_EMAIL:'owner@example.test',GULIT_HOSTING:'chatgpt-sites',TELEGRAM_BOT_TOKEN:'123:abc'};let currentUser=null,cookieHeader='';
const ctx=vm.createContext({fetch:(...a)=>globalThis.__fetch(...a),Request,Response,URL,URLSearchParams,TextEncoder,crypto,console,Date,Map,Set,Uint8Array,Headers,File,FormData});const cache=new Map();
function synthetic(key,exports){const m=new vm.SyntheticModule(Object.keys(exports),function(){for(const [k,v]of Object.entries(exports))this.setExport(k,v)},{context:ctx,identifier:key});cache.set(key,m);return m;}
synthetic('next/headers',{headers:async()=>new Headers({cookie:cookieHeader})});synthetic('cloudflare:workers',{env});synthetic('auth',{getChatGPTUser:async()=>currentUser});
const pending=new Map();async function load(f){f=path.resolve(f);if(!pending.has(f))pending.set(f,inner(f));return pending.get(f);}
async function inner(f){if(cache.has(f))return cache.get(f);if(f.endsWith('.json'))return synthetic(f,{default:JSON.parse(fs.readFileSync(f,'utf8'))});const code=ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;const m=new vm.SourceTextModule(code,{context:ctx,identifier:f});cache.set(f,m);await m.link(async(s,ref)=>{if(s==='next/headers'||s==='cloudflare:workers')return cache.get(s);if(s.endsWith('chatgpt-auth'))return cache.get('auth');let t=path.resolve(path.dirname(ref.identifier),s);if(!path.extname(t))t+='.ts';return load(t)});return m;}
const R={};for(const [n,f] of Object.entries({v:'lib/visits.ts',api:'app/api/admin/visits/route.ts',page:'app/admin/visits/route.ts',w:'worker/index.ts'})){try{const m=await load(f);if(m.status!=='evaluated')await m.evaluate();R[n]=m.namespace;}catch(e){if(n!=='w')throw e}}
const V=R.v,UA_IPHONE='Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1';
const page=(u,h={})=>new Request('https://gulitonline.com'+u,{headers:{accept:'text/html,*/*','user-agent':UA_IPHONE,'cf-connecting-ip':'196.188.1.2',...h}});
// What counts
assert.equal(V.countable(page('/')),true);assert.equal(V.countable(page('/partners?s=tiktok')),true);
assert.equal(V.countable(page('/admin')),false,'owner pages not counted');assert.equal(V.countable(page('/api/catalog')),false);
assert.equal(V.countable(page('/',{accept:'image/png'})),false);assert.equal(V.countable(page('/',{'user-agent':'Googlebot/2.1'})),false,'bots not counted');
assert.equal(V.countable(page('/',{cookie:'__Host-gulit-admin=abc'})),false,'owner not counted');assert.equal(V.countable(page('/',{'sec-purpose':'prefetch'})),false);
// Sources
const src=(u,ref='',ua=UA_IPHONE)=>V.sourceOf(new URL('https://gulitonline.com'+u),ref,ua);
assert.equal(src('/?s=telegram'),'telegram');assert.equal(src('/?s=tt'),'tiktok');assert.equal(src('/?utm_source=youtube'),'youtube');
assert.equal(src('/','https://www.google.com/'),'google');assert.equal(src('/','https://t.me/gulitonline1'),'telegram');assert.equal(src('/','https://m.youtube.com/'),'youtube');
assert.equal(src('/','',UA_IPHONE+' musical_ly_37.0 BytedanceWebview'),'tiktok');assert.equal(src('/','https://gulitonline.com/partners'),'internal');assert.equal(src('/'),'direct');assert.equal(src('/','https://example.org/'),'other site');
assert.equal(V.deviceOf(UA_IPHONE),'phone');assert.equal(V.deviceOf('Mozilla/5.0 (Windows NT 10.0)'),'computer');
// Recording + stats: same person twice a day = 1 visitor, 2 views; no IP stored
const now=Date.UTC(2026,10,10,9);await V.recordVisit(page('/?s=youtube'),now);await V.recordVisit(page('/partners',{referer:'https://gulitonline.com/?s=youtube'}),now+60e3);
await V.recordVisit(page('/',{'cf-connecting-ip':'10.0.0.9',referer:'https://www.tiktok.com/'}),now);await V.recordVisit(page('/'),now+86400e3);
const rows=sql.prepare('SELECT * FROM page_views').all();assert.equal(rows.length,4);assert.ok(rows.every(r=>!JSON.stringify(r).includes('196.188')),'no IP stored');assert.match(rows[0].visitor,/^[a-f0-9]{16}$/);
assert.notEqual(rows[0].visitor,rows[3].visitor,'hash changes each day');
// Owner only
assert.equal((await R.api.GET(new Request('https://gulit.test/api/admin/visits'))).status,403);assert.equal((await R.page.GET()).status,303);
currentUser={userId:'o',email:'owner@example.test'};
const s=await (await R.api.GET(new Request('https://gulit.test/api/admin/visits'))).json();
const S=await V.visitStats(now+86400e3);assert.equal(S.today.visitors,1);assert.equal(S.week.visitors,3);assert.equal(S.week.views,4);
assert.deepEqual(Object.fromEntries(S.sources.map(x=>[x.source,x.visitors])),{youtube:1,tiktok:1,direct:1});assert.equal(S.pages[0].name,'Home');assert.equal(S.devices[0].device,'phone');
assert.ok(s.week&&Array.isArray(s.daily));
// Page wiring
assert.match(fs.readFileSync('lib/admin-visits-html.ts','utf8'),/\/api\/admin\/visits/);for(const f of ['admin-telegram-html.ts','admin-partners-html.ts','admin-live-html.ts'])assert.match(fs.readFileSync('lib/'+f,'utf8'),/\/admin\/visits/,'menu link in '+f);
console.log('PASS: visitor counting — pages/bots/owner filtering, sources, anonymous daily hash, stats, owner-only access');
