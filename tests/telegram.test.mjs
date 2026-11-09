import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {DatabaseSync} from 'node:sqlite';
import ts from 'typescript';
// Telegram channel auto-posting.
const sql=new DatabaseSync(':memory:');for(const f of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())sql.exec(fs.readFileSync(path.join('drizzle',f),'utf8'));
const DB={prepare(q){let a=[];return {bind(...v){a=v;return this},async first(){return sql.prepare(q).get(...a)||null},async all(){return {results:sql.prepare(q).all(...a)}},async run(){const r=sql.prepare(q).run(...a);return {meta:{changes:r.changes}}}}}};
const env={DB,BUCKET:{async put(){},async get(){return null}},OWNER_EMAIL:'owner@example.test',GULIT_HOSTING:'chatgpt-sites',TELEGRAM_BOT_TOKEN:'123:abc'};let currentUser=null,cookieHeader='';
const ctx=vm.createContext({fetch:(...a)=>globalThis.__fetch(...a),Request,Response,URL,URLSearchParams,TextEncoder,crypto,console,Date,Map,Set,Uint8Array,Headers,File,FormData});const cache=new Map();
function synthetic(key,exports){const m=new vm.SyntheticModule(Object.keys(exports),function(){for(const [k,v]of Object.entries(exports))this.setExport(k,v)},{context:ctx,identifier:key});cache.set(key,m);return m;}
synthetic('next/headers',{headers:async()=>new Headers({cookie:cookieHeader})});synthetic('cloudflare:workers',{env});synthetic('auth',{getChatGPTUser:async()=>currentUser});
const pending=new Map();async function load(f){f=path.resolve(f);if(!pending.has(f))pending.set(f,inner(f));return pending.get(f);}
async function inner(f){if(cache.has(f))return cache.get(f);if(f.endsWith('.json'))return synthetic(f,{default:JSON.parse(fs.readFileSync(f,'utf8'))});const code=ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;const m=new vm.SourceTextModule(code,{context:ctx,identifier:f});cache.set(f,m);await m.link(async(s,ref)=>{if(s==='next/headers'||s==='cloudflare:workers')return cache.get(s);if(s.endsWith('chatgpt-auth'))return cache.get('auth');let t=path.resolve(path.dirname(ref.identifier),s);if(!path.extname(t))t+='.ts';return load(t)});return m;}
let sentMsgs=[];globalThis.__fetch=async(u,o)=>{sentMsgs.push({u,b:JSON.parse(o.body)});return new Response(JSON.stringify(JSON.parse(o.body).chat_id==='@badchannel'?{ok:false,description:'chat not found'}:{ok:true}),{status:200})};
const R={};for(const [n,f] of Object.entries({tg:'lib/telegram.ts',posts:'lib/telegram-posts.ts',api:'app/api/admin/telegram/route.ts',page:'app/admin/telegram/route.ts'})){const m=await load(f);if(m.status!=='evaluated')await m.evaluate();R[n]=m.namespace;}
const origin='https://gulit.test',req=(u,method='GET',body,src=origin)=>new Request(origin+u,{method,headers:{Origin:src,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
const P=R.posts.POSTS;assert.ok(P.length>=10);for(const p of P){assert.ok(p.text.length<=1024,'caption limit');assert.match(p.text,/[ሀ-፿]/,'has Amharic');assert.doesNotMatch(p.text.replace(/<\/?(b|i)>|<a href="https:\/\/gulitonline\.com\/[a-z\/?=]*">|<\/a>/g,''),/<[^>]*>/,'only safe tags');assert.ok(p.photo||p.video,'every post has a picture or video');assert.ok(fs.existsSync('public/social/'+(p.photo||p.video)),'media file exists');}
const at=(d,h,m=0)=>Date.UTC(2026,10,d,h-3,m); // Addis local time
// Off by default
assert.equal(await R.tg.postIfDue(at(9,9)),'off');
// Deploy preset switches it on before any owner setting exists
env.TELEGRAM_CHANNEL='@presetchan';assert.equal((await R.tg.tgSettings()).s.enabled,true);assert.equal((await R.tg.tgSettings()).s.channel,'@presetchan');delete env.TELEGRAM_CHANNEL;
// Owner only + validation
assert.equal((await R.api.GET(req('/api/admin/telegram'))).status,403);assert.equal((await R.page.GET()).status,303);
currentUser={userId:'o',email:'owner@example.test'};
let r=await R.api.POST(req('/api/admin/telegram','POST',{enabled:true,channel:'not a channel'}));assert.equal(r.status,400);
r=await R.api.POST(req('/api/admin/telegram','POST',{enabled:true,channel:'https://t.me/gulitonline'}));assert.equal(r.status,200);
let d=await r.json();assert.equal(d.settings.channel,'@gulitonline');assert.equal(d.tokenSet,true);
// Default: 2 posts a day, 12:00 and 19:00 Addis, first 15 minutes, once each
assert.equal(d.settings.everyHours,7);assert.equal(R.tg.slotFor(d.settings,at(9,9)),null);assert.equal(R.tg.slotFor(d.settings,at(9,20)),null);assert.equal(R.tg.slotFor(d.settings,at(9,12,20)),null);assert.ok(R.tg.slotFor(d.settings,at(9,19,5)));
assert.equal(await R.tg.postIfDue(at(9,9)),'not-due');
assert.equal(await R.tg.postIfDue(at(9,12,0)),'sent');assert.equal(await R.tg.postIfDue(at(9,12,1)),'not-due','no double post in the same slot');
assert.equal(await R.tg.postIfDue(at(9,19,3)),'sent');
assert.equal(sentMsgs.length,2);assert.match(sentMsgs[0].u,/bot123:abc\/sendVideo$/);assert.equal(sentMsgs[0].b.video,'https://gulitonline.com/social/gulit-delivery.mp4');assert.equal(sentMsgs[0].b.caption,P[0].text);assert.match(sentMsgs[1].u,/sendPhoto$/);assert.equal(sentMsgs[1].b.photo,'https://gulitonline.com/social/'+P[1].photo);assert.equal(sentMsgs[0].b.chat_id,'@gulitonline');assert.equal(sentMsgs[0].b.parse_mode,'HTML');
// Count per day = 2
let n=0;for(let h=0;h<24;h++)for(const m of [0,10,20,40])if(R.tg.slotFor(d.settings,at(10,h,m)))n++;assert.equal(n,2*2);
// Post now advances rotation
r=await R.api.POST(req('/api/admin/telegram','POST',{action:'post-now'}));d=await r.json();assert.equal(sentMsgs.at(-1).b.caption,P[2].text);assert.equal(d.nextIndex,3);assert.equal(d.settings.sent,3);
// Errors recorded, not thrown
await R.api.POST(req('/api/admin/telegram','POST',{channel:'@badchannel'}));assert.equal(await R.tg.postIfDue(at(10,12)),'error');d=await(await R.api.GET(req('/api/admin/telegram'))).json();assert.match(d.settings.lastError,/chat not found/);
// One-off post now (deploy config), outside the schedule, only once
await R.api.POST(req('/api/admin/telegram','POST',{channel:'@gulitonline'}));env.TELEGRAM_POST_NOW='t1';const before=sentMsgs.length;
assert.equal(await R.tg.postIfDue(at(9,1,30)),'sent');assert.equal(await R.tg.postIfDue(at(9,1,31)),'not-due');assert.equal(sentMsgs.length,before+1);delete env.TELEGRAM_POST_NOW;
// Turned off
await R.api.POST(req('/api/admin/telegram','POST',{enabled:false}));assert.equal(await R.tg.postIfDue(at(11,12)),'off');
const h=await(await R.page.GET()).text();new Function(h.split('<script>')[1].split('</script>')[0]);
console.log('PASS: telegram — bilingual picture/video posts, owner-only settings + validation, 2 posts a day (12:00, 19:00 Addis), never twice per slot, rotation, post-now, errors recorded, off switch');
