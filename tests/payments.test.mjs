import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {DatabaseSync} from 'node:sqlite';
import ts from 'typescript';

// In-memory database with every migration applied in order (including 0009 online payments).
const sql=new DatabaseSync(':memory:');
for(const file of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())sql.exec(fs.readFileSync(path.join('drizzle',file),'utf8'));
const DB={prepare(query){let args=[];return {bind(...values){args=values;return this},async first(){return sql.prepare(query).get(...args)||null},async all(){return {results:sql.prepare(query).all(...args)}},async run(){const r=sql.prepare(query).run(...args);return {meta:{changes:r.changes}}}}}};
const env={DB,BUCKET:{async put(){},async get(){return null}},OWNER_EMAIL:'owner@example.test',GULIT_HOSTING:'chatgpt-sites',CHAPA_SECRET_KEY:'CHASECK_TEST-fixturefixturefixture'};
let currentUser=null;

// Fake Chapa API: records every call; verify answers come from `chapaState`.
const calls=[];const chapaState=new Map();let initializeFails=false;
async function fakeFetch(url,init={}){url=String(url);calls.push({url,init});const auth=init.headers?.Authorization;assert.equal(auth,'Bearer '+env.CHAPA_SECRET_KEY);
 if(url==='https://api.chapa.co/v1/transaction/initialize'){if(initializeFails)return Response.json({status:'failed',message:'bad'},{status:400});return Response.json({status:'success',data:{checkout_url:'https://checkout.chapa.co/checkout/payment/'+JSON.parse(init.body).tx_ref}});}
 const m=url.match(/^https:\/\/api\.chapa\.co\/v1\/transaction\/verify\/(.+)$/);if(m){const tx=decodeURIComponent(m[1]);const s=chapaState.get(tx);return Response.json({status:'success',data:s?{tx_ref:tx,currency:'ETB',reference:'APREF'+tx.slice(-4),...s}:{tx_ref:tx,status:'pending'}});}
 throw Error('unexpected fetch '+url);}

const ctx=vm.createContext({Request,Response,File,FormData,URL,URLSearchParams,TextEncoder,crypto,console,Date,Map,Set,Uint8Array,Headers,fetch:fakeFetch});const cache=new Map();
function synthetic(key,exports){const m=new vm.SyntheticModule(Object.keys(exports),function(){for(const [k,v]of Object.entries(exports))this.setExport(k,v)},{context:ctx,identifier:key});cache.set(key,m);return m;}
synthetic('next/headers',{headers:async()=>new Headers()});synthetic('cloudflare:workers',{env});synthetic('auth',{getChatGPTUser:async()=>currentUser});
const pendingLoads=new Map();async function load(file){file=path.resolve(file);if(!pendingLoads.has(file))pendingLoads.set(file,loadInner(file));return pendingLoads.get(file);}
async function loadInner(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);if(file.endsWith('.json'))return synthetic(file,{default:JSON.parse(fs.readFileSync(file,'utf8'))});const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;const mod=new vm.SourceTextModule(code,{context:ctx,identifier:file});cache.set(file,mod);await mod.link(async(specifier,ref)=>{if(specifier==='next/headers'||specifier==='cloudflare:workers')return cache.get(specifier);if(specifier.endsWith('chatgpt-auth'))return cache.get('auth');let target=path.resolve(path.dirname(ref.identifier),specifier);if(!path.extname(target))target+='.ts';return load(target)});return mod;}
const routes={};for(const [name,file] of Object.entries({shop:'app/api/catalog/route.ts',orders:'app/api/orders/route.ts',pay:'app/api/orders/pay/route.ts',chapa:'app/api/payments/chapa/route.ts',adminOrders:'app/api/admin/orders/route.ts',stores:'app/api/admin/stores/route.ts'})){const m=await load(file);if(m.status!=='evaluated')await m.evaluate();routes[name]=m.namespace;}
const {shop,orders,pay,chapa,adminOrders,stores}=routes,origin='https://gulit.test',owner={userId:'o',email:'owner@example.test'};
const req=(url,method='GET',body,source=origin)=>new Request(origin+url,{method,headers:{Origin:source,'Content-Type':'application/json'},...(body!==undefined?{body:JSON.stringify(body)}:{})});
const lastInit=()=>JSON.parse([...calls].reverse().find(c=>c.url.endsWith('/initialize')).init.body);

// A real, orderable catalog product.
const product=(await(await shop.GET()).json()).products.find(p=>!p.draft&&p.stock>0&&p.price>0);assert.ok(product,'needs an orderable fixture product');
async function newOrder(){const r=await orders.POST(req('/api/orders','POST',{name:'Abebe Kebede Tesfaye',phone:'+251 911 234 567',address:'Bole, near Edna Mall, house 12',city:'Addis Ababa',inAddis:true,items:[{id:product.id,n:1}]}));assert.equal(r.status,201);const d=await r.json();return {order:d.order,key:{id:d.order.id,token:d.token}};}

// 1. Customer sees Pay online for Gulit charges only; seller needs a linked supermarket first.
let {order,key}=await newOrder();
assert.equal(order.gulitPayment.online,true);assert.equal(order.sellerPayment.online,false);assert.equal(order.sellerPayment.paidOnline,false);
assert.equal((await pay.POST(req('/api/orders/pay','POST',{action:'start',...key,party:'gulit'},'https://evil.test'))).status,403);
assert.equal((await pay.POST(req('/api/orders/pay','POST',{action:'start',id:key.id,token:'0'.repeat(64),party:'gulit'}))).status,404);
assert.equal((await pay.POST(req('/api/orders/pay','POST',{action:'start',...key,party:'seller'}))).status,400);

// 2. Start the Gulit payment: right amount, no split, callback + return URLs, phone normalised.
let r=await pay.POST(req('/api/orders/pay','POST',{action:'start',...key,party:'gulit'}));assert.equal(r.status,200);let {checkoutUrl}=await r.json();assert.match(checkoutUrl,/^https:\/\/checkout\.chapa\.co\//);
let body=lastInit();assert.equal(body.amount,(order.gulitTotal/100).toFixed(2));assert.equal(body.currency,'ETB');assert.equal(body.subaccounts,undefined);assert.equal(body.phone_number,'0911234567');assert.equal(body.first_name,'Abebe');assert.equal(body.last_name,'Kebede Tesfaye');
assert.equal(body.callback_url,origin+'/api/payments/chapa');assert.equal(body.return_url,origin+'/?paid='+key.id);assert.match(body.tx_ref,/^GUL-[A-F0-9]{16}-G-[a-f0-9]{12}$/);
const gulitTx=body.tx_ref;

// 3. Callback before Chapa says success changes nothing; a short payment changes nothing.
r=await chapa.GET(new Request(origin+'/api/payments/chapa?trx_ref='+gulitTx));assert.equal((await r.json()).status,'pending');
chapaState.set(gulitTx,{status:'success',amount:(order.gulitTotal/100-1).toFixed(2)});r=await chapa.GET(new Request(origin+'/api/payments/chapa?trx_ref='+gulitTx));assert.equal((await r.json()).status,'pending');
chapaState.set(gulitTx,{status:'success',amount:String(order.gulitTotal/100),currency:'USD'});r=await chapa.GET(new Request(origin+'/api/payments/chapa?trx_ref='+gulitTx));assert.equal((await r.json()).status,'pending');
let stored=JSON.parse(sql.prepare('SELECT payload FROM orders WHERE id=?').get(key.id).payload);assert.equal(stored.gulitPayment.status,'unpaid');

// 4. Verified success marks the Gulit payment paid online; replays are harmless.
chapaState.set(gulitTx,{status:'success',amount:String(order.gulitTotal/100)});
r=await chapa.GET(new Request(origin+'/api/payments/chapa?trx_ref='+gulitTx));assert.equal((await r.json()).status,'paid');
r=await chapa.POST(new Request(origin+'/api/payments/chapa',{method:'POST',body:JSON.stringify({tx_ref:gulitTx,status:'success'})}));assert.equal((await r.json()).status,'paid');
stored=JSON.parse(sql.prepare('SELECT payload FROM orders WHERE id=?').get(key.id).payload);assert.equal(stored.gulitPayment.status,'verified');assert.equal(stored.gulitPayment.method,'online');assert.equal(stored.gulitPayment.txRef,gulitTx);assert.equal(stored.status,'Awaiting separate payments');assert.equal(stored.duplicatePayments,undefined);
assert.equal((await pay.POST(req('/api/orders/pay','POST',{action:'start',...key,party:'gulit'}))).status,400,'paid payment cannot be started again');

// 5. Owner sets a supermarket payout account, then links it to the order's seller payment.
currentUser=owner;
const store=await(await stores.POST(req('/api/admin/stores','POST',{name:'Fixture Supermarket',username:'fixture01'}))).json();
assert.equal((await stores.PATCH(req('/api/admin/stores','PATCH',{storeId:store.id,action:'payout',subaccount:'bad id!',commissionPercent:1}))).status,400);
assert.equal((await stores.PATCH(req('/api/admin/stores','PATCH',{storeId:store.id,action:'payout',subaccount:'3380b03b-1142-44b2-b6ab-9a5ec740fbe4',commissionPercent:25}))).status,400);
assert.equal((await stores.PATCH(req('/api/admin/stores','PATCH',{storeId:store.id,action:'payout',subaccount:'3380b03b-1142-44b2-b6ab-9a5ec740fbe4',commissionPercent:1}))).status,200);
let admin=await(await adminOrders.GET(req('/api/admin/orders'))).json();assert.equal(admin.onlinePayments,true);assert.deepEqual(admin.payoutStores.map(s=>s.id),[store.id]);
assert.equal((await adminOrders.PATCH(req('/api/admin/orders','PATCH',{id:key.id,action:'seller',storeId:store.id}))).status,409,'store without the items cannot take the order');
sql.prepare('INSERT INTO store_stock(store_id,product_id,quantity,revision,updated_at,updated_by) VALUES(?,?,?,1,?,?)').run(store.id,product.id,10,Date.now(),'admin');
assert.equal((await adminOrders.PATCH(req('/api/admin/orders','PATCH',{id:key.id,action:'seller',storeId:'nope'}))).status,400);
assert.equal((await adminOrders.PATCH(req('/api/admin/orders','PATCH',{id:key.id,action:'seller',storeId:store.id},'https://evil.test'))).status,403);
assert.equal((await adminOrders.PATCH(req('/api/admin/orders','PATCH',{id:key.id,action:'seller',storeId:store.id}))).status,200);
currentUser=null;
r=await orders.POST(req('/api/orders','POST',{action:'lookup',...key}));order=(await r.json()).order;
assert.equal(order.sellerName,'Fixture Supermarket');assert.equal(order.sellerPayment.online,true);assert.equal(order.gulitPayment.paidOnline,true);
assert.ok(!JSON.stringify(order).includes('3380b03b'),'sub-account ID is never sent to customers');

// 6. Seller payment is split: the supermarket sub-account gets the goods money, Gulit keeps 1%.
r=await pay.POST(req('/api/orders/pay','POST',{action:'start',...key,party:'seller'}));assert.equal(r.status,200);
body=lastInit();assert.equal(body.amount,(order.sellerTotal/100).toFixed(2));assert.deepEqual(body.subaccounts,{id:'3380b03b-1142-44b2-b6ab-9a5ec740fbe4',split_type:'percentage',split_value:0.01});
const sellerTx=body.tx_ref;chapaState.set(sellerTx,{status:'success',amount:(order.sellerTotal/100).toFixed(2)});

// 7. Customer returns from Chapa before the callback arrives: "check" verifies and shows both paid.
r=await pay.POST(req('/api/orders/pay','POST',{action:'check',...key}));assert.equal(r.status,200);order=(await r.json()).order;
assert.equal(order.sellerPayment.status,'verified');assert.equal(order.sellerPayment.paidOnline,true);assert.equal(order.status,'Payment verified');

// 8. Paying the same bill twice is recorded for refund, not silently lost.
let second=await newOrder();
const a1=await(await pay.POST(req('/api/orders/pay','POST',{action:'start',...second.key,party:'gulit'}))).json();const tx1=lastInit().tx_ref;
const a2=await(await pay.POST(req('/api/orders/pay','POST',{action:'start',...second.key,party:'gulit'}))).json();const tx2=lastInit().tx_ref;assert.ok(a1.checkoutUrl&&a2.checkoutUrl&&tx1!==tx2);
for(const tx of [tx1,tx2])chapaState.set(tx,{status:'success',amount:(second.order.gulitTotal/100).toFixed(2)});
assert.equal((await(await chapa.GET(new Request(origin+'/api/payments/chapa?trx_ref='+tx1))).json()).status,'paid');
assert.equal((await(await chapa.GET(new Request(origin+'/api/payments/chapa?trx_ref='+tx2))).json()).status,'duplicate');
stored=JSON.parse(sql.prepare('SELECT payload FROM orders WHERE id=?').get(second.key.id).payload);assert.equal(stored.gulitPayment.txRef,tx1);assert.equal(stored.duplicatePayments.length,1);assert.equal(stored.duplicatePayments[0].txRef,tx2);
r=await orders.POST(req('/api/orders','POST',{action:'lookup',...second.key}));assert.equal((await r.json()).order.duplicatePayments,undefined,'refund notes stay owner-only');

// 9. Unknown or malformed references are ignored; failed checkout start is reported and recorded.
assert.equal((await(await chapa.GET(new Request(origin+'/api/payments/chapa?trx_ref=GUL-0000000000000000-G-000000000000'))).json()).status,'unknown');
assert.equal((await(await chapa.GET(new Request(origin+"/api/payments/chapa?trx_ref=x' OR 1=1"))).json()).status,'unknown');
let third=await newOrder();initializeFails=true;r=await pay.POST(req('/api/orders/pay','POST',{action:'start',...third.key,party:'gulit'}));assert.equal(r.status,400);assert.match((await r.json()).error,/bank deposit/);initializeFails=false;
assert.equal(sql.prepare("SELECT status FROM payment_attempts WHERE order_id=?").get(third.key.id).status,'failed');

// 10. Without a Chapa key the shop falls back to bank-deposit slips only.
const saved=env.CHAPA_SECRET_KEY;delete env.CHAPA_SECRET_KEY;
r=await orders.POST(req('/api/orders','POST',{action:'lookup',...third.key}));order=(await r.json()).order;assert.equal(order.gulitPayment.online,false);
assert.equal((await pay.POST(req('/api/orders/pay','POST',{action:'start',...third.key,party:'gulit'}))).status,400);env.CHAPA_SECRET_KEY=saved;

// 11. The shop, admin orders and supermarket pages still contain valid JavaScript.
const scripts=html=>[...html.matchAll(/<script(?![^>]*application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
const decoded=f=>JSON.parse(fs.readFileSync(f,'utf8').match(/^export default (.*);\s*$/s)[1]);
for(const f of ['lib/storefront-html.ts','lib/admin-stores-html.ts'])for(const js of scripts(decoded(f)))new Function(js);
const adminPage=ts.transpileModule(fs.readFileSync('app/admin/orders/route.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText;for(const js of scripts(JSON.parse(adminPage.match(/new Response\(("(?:[^"\\]|\\.)*")/s)[1])))new Function(js);
console.log('PASS: online payments — Gulit and seller payments via Chapa, server-side verification (amount, currency, status), split to supermarket sub-account with commission, replay safety, duplicate-payment recording, return check, owner payout settings, CSRF, no key = deposit fallback, page scripts parse');
