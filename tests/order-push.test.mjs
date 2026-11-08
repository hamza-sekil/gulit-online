import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {DatabaseSync} from 'node:sqlite';
import ts from 'typescript';
// Customer order notifications: subscribe with the private order code, payload-free VAPID pushes on order events, expired cleanup.
const sql=new DatabaseSync(':memory:');for(const f of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())sql.exec(fs.readFileSync(path.join('drizzle',f),'utf8'));
const DB={prepare(q){let a=[];return {bind(...v){a=v;return this},async first(){return sql.prepare(q).get(...a)||null},async all(){return {results:sql.prepare(q).all(...a)}},async run(){const r=sql.prepare(q).run(...a);return {meta:{changes:r.changes}}}}}};
const kp=await crypto.subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},true,['sign','verify']);const pub=new Uint8Array(await crypto.subtle.exportKey('raw',kp.publicKey));const b64=u=>Buffer.from(u).toString('base64url');
const env={DB,BUCKET:{async put(){},async get(){return null}},OWNER_EMAIL:'owner@example.test',GULIT_HOSTING:'chatgpt-sites',PUSH_VAPID_PUBLIC_KEY:b64(pub),PUSH_VAPID_PRIVATE_JWK:JSON.stringify(await crypto.subtle.exportKey('jwk',kp.privateKey))};
let currentUser=null,cookieHeader='';const pushes=[];let pushStatus=201;
const ctx=vm.createContext({Request,Response,URL,URLSearchParams,TextEncoder,crypto,console,Date,Map,Set,Uint8Array,Headers,AbortSignal,btoa,fetch:async(u,i)=>{pushes.push({url:String(u),headers:i.headers});return new Response(null,{status:pushStatus})}});const cache=new Map();
function synthetic(key,exports){const m=new vm.SyntheticModule(Object.keys(exports),function(){for(const [k,v]of Object.entries(exports))this.setExport(k,v)},{context:ctx,identifier:key});cache.set(key,m);return m;}
synthetic('next/headers',{headers:async()=>new Headers({cookie:cookieHeader})});synthetic('cloudflare:workers',{env});synthetic('auth',{getChatGPTUser:async()=>currentUser});
const pending=new Map();async function load(f){f=path.resolve(f);if(!pending.has(f))pending.set(f,inner(f));return pending.get(f);}
async function inner(f){if(cache.has(f))return cache.get(f);if(f.endsWith('.json'))return synthetic(f,{default:JSON.parse(fs.readFileSync(f,'utf8'))});const code=ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;const m=new vm.SourceTextModule(code,{context:ctx,identifier:f});cache.set(f,m);await m.link(async(s,ref)=>{if(s==='next/headers'||s==='cloudflare:workers')return cache.get(s);if(s.endsWith('chatgpt-auth'))return cache.get('auth');let t=path.resolve(path.dirname(ref.identifier),s);if(!path.extname(t))t+='.ts';return load(t)});return m;}
const R={};for(const [n,f] of Object.entries({orders:'app/api/orders/route.ts',push:'app/api/orders/push/route.ts',stores:'app/api/admin/stores/route.ts',skAuth:'app/api/storekeeper/auth/route.ts',sk:'app/api/storekeeper/orders/route.ts'})){const m=await load(f);if(m.status!=='evaluated')await m.evaluate();R[n]=m.namespace;}
const origin='https://gulit.test',req=(u,method='GET',body,src=origin)=>new Request(origin+u,{method,headers:{Origin:src,'Content-Type':'application/json','cf-connecting-ip':'ip'+Math.random()},...(body?{body:JSON.stringify(body)}:{})});
for(const [id,name,price] of [[900001,'Teff flour 1 kg',10000]])sql.prepare("INSERT INTO products (id,name,category,price_cents,stock,image,archived,revision,updated_by,updated_at) VALUES (?,?,'Groceries',?,0,'/icon-512.png',0,1,'t',?)").run(id,name,price,new Date().toISOString());
currentUser={userId:'o',email:'owner@example.test'};const st=await(await R.stores.POST(req('/api/admin/stores','POST',{name:'Alpha','username':'alpha01'}))).json();currentUser=null;
sql.prepare("INSERT INTO store_stock(store_id,product_id,quantity,revision,updated_at,updated_by) VALUES(?,?,9,1,?,'admin')").run(st.id,900001,Date.now());
const d=await(await R.orders.POST(req('/api/orders','POST',{name:'Liya',phone:'0911223344',address:'Bole, house 7',city:'Addis Ababa',inAddis:true,items:[{id:900001,n:1}]}))).json();const key={id:d.order.id,token:d.token};
assert.equal((await(await R.push.GET()).json()).publicKey,env.PUSH_VAPID_PUBLIC_KEY);
const ep='https://fcm.googleapis.com/fcm/send/abc123';
assert.equal((await R.push.POST(req('/api/orders/push','POST',{...key,endpoint:ep},'https://evil.test'))).status,403);
assert.equal((await R.push.POST(req('/api/orders/push','POST',{id:key.id,token:'0'.repeat(64),endpoint:ep}))).status,404);
assert.equal((await R.push.POST(req('/api/orders/push','POST',{...key,endpoint:'https://evil.test/push'}))).status,400);
assert.equal((await R.push.POST(req('/api/orders/push','POST',{...key,endpoint:ep}))).status,200);assert.equal((await R.push.POST(req('/api/orders/push','POST',{...key,endpoint:ep}))).status,200);
assert.equal(sql.prepare('SELECT COUNT(*) n FROM order_push WHERE order_id=?').get(key.id).n,1,'same device once');
// storekeeper confirms → one payload-free push with VAPID auth
const lr=await R.skAuth.POST(req('/api/storekeeper/auth','POST',{username:'alpha01',code:st.code}));cookieHeader=lr.headers.get('set-cookie').split(';')[0];
assert.equal((await R.sk.PATCH(req('/api/storekeeper/orders','PATCH',{id:key.id,action:'confirm'}))).status,200);
assert.equal(pushes.length,1);assert.equal(pushes[0].url,ep);assert.match(pushes[0].headers.Authorization,/^vapid t=.+, k=/);assert.equal(pushes[0].headers.Topic,'gulit-order');
// expired subscription removed
pushStatus=410;assert.equal((await R.sk.PATCH(req('/api/storekeeper/orders','PATCH',{id:key.id,action:'ready'}))).status,200);assert.equal(sql.prepare('SELECT COUNT(*) n FROM order_push').get().n,0);
cookieHeader='';
const sf=JSON.parse(fs.readFileSync('lib/storefront-html.ts','utf8').match(/^export default (.*);\s*$/s)[1]);assert.match(sf,/Notify me about this order/);for(const js of sf.split('<script>').slice(1).map(x=>x.split('</script>')[0]).filter(x=>!x.trim().startsWith('{')))new Function(js);
console.log('PASS: order notifications — public key, CSRF, private order code, push-service allowlist, one row per device, VAPID payload-free push on storekeeper confirm, expired subscriptions deleted, shop button present');
