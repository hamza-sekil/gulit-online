import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {DatabaseSync} from 'node:sqlite';
import ts from 'typescript';
// CSV price/stock import, templates, storekeeper CSV, reference-photo policy.
const sql=new DatabaseSync(':memory:');for(const f of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())sql.exec(fs.readFileSync(path.join('drizzle',f),'utf8'));
const DB={prepare(q){let a=[];return {bind(...v){a=v;return this},async first(){return sql.prepare(q).get(...a)||null},async all(){return {results:sql.prepare(q).all(...a)}},async run(){const r=sql.prepare(q).run(...a);return {meta:{changes:r.changes}}}}}};
const env={DB,BUCKET:{async put(){},async get(){return null}},OWNER_EMAIL:'owner@example.test',GULIT_HOSTING:'chatgpt-sites'};let currentUser=null,cookieHeader='';
const ctx=vm.createContext({Request,Response,URL,URLSearchParams,TextEncoder,crypto,console,Date,Map,Set,Uint8Array,Headers,File,FormData});const cache=new Map();
function synthetic(key,exports){const m=new vm.SyntheticModule(Object.keys(exports),function(){for(const [k,v]of Object.entries(exports))this.setExport(k,v)},{context:ctx,identifier:key});cache.set(key,m);return m;}
synthetic('next/headers',{headers:async()=>new Headers({cookie:cookieHeader})});synthetic('cloudflare:workers',{env});synthetic('auth',{getChatGPTUser:async()=>currentUser});
const pending=new Map();async function load(f){f=path.resolve(f);if(!pending.has(f))pending.set(f,inner(f));return pending.get(f);}
async function inner(f){if(cache.has(f))return cache.get(f);if(f.endsWith('.json'))return synthetic(f,{default:JSON.parse(fs.readFileSync(f,'utf8'))});const code=ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;const m=new vm.SourceTextModule(code,{context:ctx,identifier:f});cache.set(f,m);await m.link(async(s,ref)=>{if(s==='next/headers'||s==='cloudflare:workers')return cache.get(s);if(s.endsWith('chatgpt-auth'))return cache.get('auth');let t=path.resolve(path.dirname(ref.identifier),s);if(!path.extname(t))t+='.ts';return load(t)});return m;}
const R={};for(const [n,f] of Object.entries({bulk:'lib/bulk.ts',imp:'app/api/admin/import/route.ts',shop:'app/api/catalog/route.ts',stores:'app/api/admin/stores/route.ts',skAuth:'app/api/storekeeper/auth/route.ts',skImp:'app/api/storekeeper/import/route.ts',page:'app/admin/import/route.ts'})){const m=await load(f);if(m.status!=='evaluated')await m.evaluate();R[n]=m.namespace;}
const origin='https://gulit.test',req=(u,method='GET',body,src=origin)=>new Request(origin+u,{method,headers:{Origin:src,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
const same=(a,b)=>assert.equal(JSON.stringify(a),JSON.stringify(b));
// CSV parser: quotes, commas, newlines, semicolons, BOM
same(R.bulk.parseCsv('﻿id,name\n1,"Oil, 1 L ""Best"""\n2,"two\nlines"\n'),[['id','name'],['1','Oil, 1 L "Best"'],['2','two\nlines']]);
same(R.bulk.parseCsv('id;price_birr\r\n5;12,5\r\n'),[['id','price_birr'],['5','12,5']]);
assert.equal(R.bulk.num('1,250.50'),1250.5);assert.equal(R.bulk.num('12,5'),12.5);assert.equal(R.bulk.num('ETB 1 300'),1300);assert.ok(Number.isNaN(R.bulk.num('')));
// Owner only
assert.equal((await R.imp.GET(req('/api/admin/import'))).status,403);currentUser={userId:'o',email:'owner@example.test'};
let d=await(await R.imp.GET(req('/api/admin/import'))).json();assert.ok(d.counts.needPrice>1000);assert.ok(d.counts.referencePhotos>0);
const tpl=await(await R.imp.GET(req('/api/admin/import?template=drafts'))).text();const rows=R.bulk.parseCsv(tpl);same(rows[0],['id','name','category','brand','price_birr','status','photo']);
const [a,b,c]=rows.slice(1,4);
// Price import publishes drafts; errors reported per line; blank skipped
const csv=`id,price_birr\n${a[0]},"1,250.50"\n${b[0]},\n${c[0]},-3\n999999999,10\n`;
assert.equal((await R.imp.POST(req('/api/admin/import','POST',{kind:'prices',csv},'https://evil.test'))).status,403);
let r=(await(await R.imp.POST(req('/api/admin/import','POST',{kind:'prices',csv}))).json()).result;
assert.equal(r.published,1);assert.equal(r.skipped,1);assert.equal(r.errors.length,2);assert.match(r.errors[0],/Line 4/);
currentUser=null;let shop=await(await R.shop.GET()).json();let pa=shop.products.find(p=>p.id===Number(a[0]));assert.equal(pa.draft,undefined);assert.equal(pa.price,1250.5);
currentUser={userId:'o',email:'owner@example.test'};
r=(await(await R.imp.POST(req('/api/admin/import','POST',{kind:'prices',csv:`id,price_birr\n${a[0]},1300\n`}))).json()).result;assert.equal(r.updated,1);
// Stock import (owner, by store username) auto-assigns; drafts refused; bad quantities refused
const st=await(await R.stores.POST(req('/api/admin/stores','POST',{name:'Bole Mart',username:'bole01'}))).json();
r=(await(await R.imp.POST(req('/api/admin/import','POST',{kind:'stock',csv:`store_username,id,quantity,expiry_date\nbole01,${a[0]},12,2027-01-31\nnope01,${a[0]},1,\nbole01,${b[0]},3,\nbole01,${a[0]},1.5,\nbole01,${a[0]},2,2027-02-30\n`}))).json()).result;
assert.equal(r.added,1);assert.equal(r.errors.length,4);assert.match(r.errors.join('|'),/not found/);assert.match(r.errors.join('|'),/no confirmed price/);
assert.equal(sql.prepare('SELECT quantity,expiry_date FROM store_stock WHERE store_id=? AND product_id=?').get(st.id,Number(a[0])).quantity,12);
// Storekeeper: download own list, update quantities only for assigned products
currentUser=null;let lr=await R.skAuth.POST(req('/api/storekeeper/auth','POST',{username:'bole01',code:st.code}));cookieHeader=lr.headers.get('set-cookie').split(';')[0];
const mine=R.bulk.parseCsv(await(await R.skImp.GET(req('/api/storekeeper/import'))).text());same(mine[0],['id','name','quantity','manufacturing_date','expiry_date']);assert.equal(mine.length,2);
r=(await(await R.skImp.POST(req('/api/storekeeper/import','POST',{csv:`id,name,quantity\n${a[0]},x,7\n${c[0]},y,4\n`}))).json()).result;assert.equal(r.updated,1);assert.match(r.errors[0],/not assigned|no confirmed price/);
assert.equal(sql.prepare('SELECT quantity FROM store_stock WHERE store_id=? AND product_id=?').get(st.id,Number(a[0])).quantity,7);cookieHeader='';
// Reference photos hidden in the public shop when switched on
currentUser={userId:'o',email:'owner@example.test'};assert.equal((await R.imp.POST(req('/api/admin/import','POST',{kind:'photos',hideReference:true}))).status,200);currentUser=null;
shop=await(await R.shop.GET()).json();assert.ok(!shop.products.some(p=>p.photoKind==='reference'&&p.image!=='/photo-pending.svg'));
assert.ok(shop.products.some(p=>p.photoKind==='reference'),'still listed, only the photo is hidden');
const out=ts.transpileModule(fs.readFileSync('app/admin/import/route.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText;
const html=JSON.parse(fs.readFileSync('lib/admin-import-html.ts','utf8').match(/^export default (.*);\s*$/s)[1]);new Function(html.split('<script>')[1].split('</script>')[0]);
const sk=JSON.parse(fs.readFileSync('lib/storekeeper-html.ts','utf8').match(/^export default (.*);\s*$/s)[1]);for(const js of sk.split('<script>').slice(1).map(x=>x.split('</script>')[0]))new Function(js);
console.log('PASS: bulk — CSV parsing (quotes, newlines, semicolons, BOM), owner-only/CSRF, price template, price import publishes drafts with line errors, stock import by supermarket with auto-assign and validation, storekeeper own-list download/upload limited to assigned products, reference photos hidden, pages parse');
