import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {DatabaseSync} from 'node:sqlite';
import ts from 'typescript';
// Supermarket partner applications: public form → owner review → store account.
const sql=new DatabaseSync(':memory:');for(const f of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())sql.exec(fs.readFileSync(path.join('drizzle',f),'utf8'));
const DB={prepare(q){let a=[];return {bind(...v){a=v;return this},async first(){return sql.prepare(q).get(...a)||null},async all(){return {results:sql.prepare(q).all(...a)}},async run(){const r=sql.prepare(q).run(...a);return {meta:{changes:r.changes}}}}}};
const env={DB,BUCKET:{async put(){},async get(){return null}},OWNER_EMAIL:'owner@example.test',GULIT_HOSTING:'chatgpt-sites'};let currentUser=null,cookieHeader='';
const ctx=vm.createContext({Request,Response,URL,URLSearchParams,TextEncoder,crypto,console,Date,Map,Set,Uint8Array,Headers,File,FormData});const cache=new Map();
function synthetic(key,exports){const m=new vm.SyntheticModule(Object.keys(exports),function(){for(const [k,v]of Object.entries(exports))this.setExport(k,v)},{context:ctx,identifier:key});cache.set(key,m);return m;}
synthetic('next/headers',{headers:async()=>new Headers({cookie:cookieHeader})});synthetic('cloudflare:workers',{env});synthetic('auth',{getChatGPTUser:async()=>currentUser});
const pending=new Map();async function load(f){f=path.resolve(f);if(!pending.has(f))pending.set(f,inner(f));return pending.get(f);}
async function inner(f){if(cache.has(f))return cache.get(f);if(f.endsWith('.json'))return synthetic(f,{default:JSON.parse(fs.readFileSync(f,'utf8'))});const code=ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;const m=new vm.SourceTextModule(code,{context:ctx,identifier:f});cache.set(f,m);await m.link(async(s,ref)=>{if(s==='next/headers'||s==='cloudflare:workers')return cache.get(s);if(s.endsWith('chatgpt-auth'))return cache.get('auth');let t=path.resolve(path.dirname(ref.identifier),s);if(!path.extname(t))t+='.ts';return load(t)});return m;}
const R={};for(const [n,f] of Object.entries({pub:'app/api/partners/route.ts',adm:'app/api/admin/partners/route.ts',skAuth:'app/api/storekeeper/auth/route.ts',page:'app/partners/route.ts',apage:'app/admin/partners/route.ts'})){const m=await load(f);if(m.status!=='evaluated')await m.evaluate();R[n]=m.namespace;}
const same=(a,b)=>assert.equal(JSON.stringify(a),JSON.stringify(b));
const origin='https://gulit.test',req=(u,method='GET',body,src=origin,ip='1.1.1.1')=>new Request(origin+u,{method,headers:{Origin:src,'Content-Type':'application/json','CF-Connecting-IP':ip},...(body?{body:JSON.stringify(body)}:{})});
const good={businessType:'Supermarket',supermarket:'Bole Fresh Market',address:'Bole, near Edna Mall',branches:'2 · Bole, CMC',mapLink:'https://maps.app.goo.gl/abc',contactName:'Sara Tesfaye',contactRole:'Manager',phone:'+251 911 000 111',email:'sara@example.test',licence:'AA/123',tin:'0012345678',hours:'8–22',size:'500–2,000',categories:['Bakery','Drinks','Bogus'],software:'Excel',payout:'Telebirr',notes:'Call after 3pm',agree:true};
// Public page served
const ag=await import('node:fs').then(m=>m.readFileSync('lib/partner-agreement-html.ts','utf8'));const agh=JSON.parse(ag.match(/export default (.*);\s*$/s)[1]);assert.match(agh,/1% of the value of goods/);assert.match(agh,/Gulit Delivery PLC/);assert.match(agh,/Business Partner Agreement/);assert.match(agh,/30 days/);new Function(agh.split('<script>')[1].split('</script>')[0]);
const page=await R.page.GET();assert.equal(page.status,200);const html=await page.text();assert.match(html,/Become a Gulit partner business/);assert.match(html,/\/partners\/agreement/);new Function(html.split('<script>')[1].split('</script>')[0]);
// CSRF, validation
assert.equal((await R.pub.POST(req('/api/partners','POST',good,'https://evil.test'))).status,403);
for(const [k,v,m] of [['businessType','Casino',/type of business/],['supermarket','',/name/],['phone','12',/phone/],['agree',false,/agreement/],['email','nope',/email/],['mapLink','javascript:alert(1)',/https/],['size','huge',/products/]]){const r=await R.pub.POST(req('/api/partners','POST',{...good,[k]:v}));assert.equal(r.status,400);assert.match((await r.json()).error,m);}
// Save
let r=await R.pub.POST(req('/api/partners','POST',good));assert.equal(r.status,201);const {reference}=await r.json();assert.match(reference,/^SUP-/);
const row=sql.prepare('SELECT * FROM partner_applications WHERE id=?').get(reference);assert.equal(row.status,'new');same(JSON.parse(row.payload).categories,['Bakery','Drinks']);assert.equal(JSON.parse(row.payload).agreementVersion,'2026-11-08');assert.ok(JSON.parse(row.payload).agreedAt>0);
// Owner only
assert.equal((await R.adm.GET(req('/api/admin/partners'))).status,403);assert.equal((await R.apage.GET()).status,303);
currentUser={userId:'o',email:'owner@example.test'};assert.equal((await R.apage.GET()).status,200);
const ah=await(await R.apage.GET()).text();new Function(ah.split('<script>')[1].split('</script>')[0]);
let d=await(await R.adm.GET(req('/api/admin/partners'))).json();assert.equal(d.applications.length,1);assert.equal(d.applications[0].phone,'+251 911 000 111');
assert.equal((await R.adm.PATCH(req('/api/admin/partners','PATCH',{id:reference,status:'contacted',note:'Visit Tue'}))).status,200);
assert.equal((await R.adm.PATCH(req('/api/admin/partners','PATCH',{id:reference,status:'bogus'}))).status,400);
assert.equal(sql.prepare('SELECT note FROM partner_applications WHERE id=?').get(reference).note,'Visit Tue');
// Approve → store account with working storekeeper sign-in; second approve refused
assert.equal((await R.adm.POST(req('/api/admin/partners','POST',{id:reference,username:'Bad ID!'}))).status,400);
const acc=await(await R.adm.POST(req('/api/admin/partners','POST',{id:reference,username:'bole-fresh'}))).json();assert.equal(acc.username,'bole-fresh');assert.ok(acc.code.length>=40);
const st=sql.prepare('SELECT name,contact_phone,active FROM stores WHERE id=?').get(acc.id);assert.equal(st.name,'Bole Fresh Market');assert.equal(st.contact_phone,'+251 911 000 111');
assert.equal(sql.prepare('SELECT status,store_id FROM partner_applications WHERE id=?').get(reference).store_id,acc.id);
assert.equal((await R.adm.POST(req('/api/admin/partners','POST',{id:reference,username:'bole-fresh2'}))).status,409);
currentUser=null;assert.equal((await R.skAuth.POST(req('/api/storekeeper/auth','POST',{username:'bole-fresh',code:acc.code}))).status,200);
// Rate limit on public form
let last;for(let i=0;i<35;i++)last=await R.pub.POST(req('/api/partners','POST',good,origin,'9.9.9.9'));assert.equal(last.status,429);
console.log('PASS: partners — public bilingual page, CSRF + validation, application saved, owner-only review/notes/status, approve creates working storekeeper account once, rate limit');
