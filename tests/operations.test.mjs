import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {DatabaseSync} from 'node:sqlite';
import ts from 'typescript';

// Operations from the development plan: store hours/radius, confirmation limit and re-routing, replacement offers,
// rider groups and automatic dispatch, Yango backup, delivery timeline, live dashboard, KPIs, settings, storekeeper performance.
const sql=new DatabaseSync(':memory:');
for(const file of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())sql.exec(fs.readFileSync(path.join('drizzle',file),'utf8'));
const DB={prepare(query){let args=[];return {bind(...values){args=values;return this},async first(){return sql.prepare(query).get(...args)||null},async all(){return {results:sql.prepare(query).all(...args)}},async run(){const r=sql.prepare(query).run(...args);return {meta:{changes:r.changes}}}}}};
sql.prepare("INSERT INTO settings(key,value,updated_at) VALUES('ops','{\"packBagPrice\":0}',0)").run(); // packaging tested in store-prices
const env={DB,BUCKET:{async put(){},async get(){return null}},OWNER_EMAIL:'owner@example.test',GULIT_HOSTING:'chatgpt-sites'};
let currentUser=null,cookieHeader='';
const ctx=vm.createContext({Request,Response,File,FormData,URL,URLSearchParams,TextEncoder,crypto,console,Date,Map,Set,Uint8Array,Headers,fetch:async()=>{throw Error('no network')}});const cache=new Map();
function synthetic(key,exports){const m=new vm.SyntheticModule(Object.keys(exports),function(){for(const [k,v]of Object.entries(exports))this.setExport(k,v)},{context:ctx,identifier:key});cache.set(key,m);return m;}
synthetic('next/headers',{headers:async()=>new Headers({cookie:cookieHeader})});synthetic('cloudflare:workers',{env});synthetic('auth',{getChatGPTUser:async()=>currentUser});
const pendingLoads=new Map();async function load(file){file=path.resolve(file);if(!pendingLoads.has(file))pendingLoads.set(file,loadInner(file));return pendingLoads.get(file);}
async function loadInner(file){if(cache.has(file))return cache.get(file);if(file.endsWith('.json'))return synthetic(file,{default:JSON.parse(fs.readFileSync(file,'utf8'))});const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;const mod=new vm.SourceTextModule(code,{context:ctx,identifier:file});cache.set(file,mod);await mod.link(async(specifier,ref)=>{if(specifier==='next/headers'||specifier==='cloudflare:workers')return cache.get(specifier);if(specifier.endsWith('chatgpt-auth'))return cache.get('auth');let target=path.resolve(path.dirname(ref.identifier),specifier);if(!path.extname(target))target+='.ts';return load(target)});return mod;}
const R={};for(const [name,file] of Object.entries({orders:'app/api/orders/route.ts',sub:'app/api/orders/substitute/route.ts',stores:'app/api/admin/stores/route.ts',skAuth:'app/api/storekeeper/auth/route.ts',sk:'app/api/storekeeper/orders/route.ts',drivers:'app/api/admin/drivers/route.ts',dAuth:'app/api/driver/auth/route.ts',dels:'app/api/driver/deliveries/route.ts',dStatus:'app/api/driver/status/route.ts',live:'app/api/admin/live/route.ts',adminOrders:'app/api/admin/orders/route.ts',ops:'lib/ops.ts',settings:'lib/settings.ts'})){const m=await load(file);if(m.status!=='evaluated')await m.evaluate();R[name]=m.namespace;}
const origin='https://gulit.test',owner={userId:'o',email:'owner@example.test'};
const req=(url,method='GET',body,source=origin)=>new Request(origin+url,{method,headers:{Origin:source,'Content-Type':'application/json','cf-connecting-ip':'ip-'+Math.random()},...(body!==undefined?{body:JSON.stringify(body)}:{})});
const payload=id=>JSON.parse(sql.prepare('SELECT payload FROM orders WHERE id=?').get(id).payload);
const setPayload=(id,fn)=>{const o=payload(id);fn(o);sql.prepare('UPDATE orders SET payload=? WHERE id=?').run(JSON.stringify(o),id);};
const stockAt=(s,p)=>sql.prepare('SELECT quantity FROM store_stock WHERE store_id=? AND product_id=?').get(s,p)?.quantity;
const same=(a,b,m)=>assert.equal(JSON.stringify(a),JSON.stringify(b),m);
const asOwner=async fn=>{const prev=currentUser;currentUser=owner;try{return await fn()}finally{currentUser=prev}};
const loginAs=async(route,url,username,code)=>{cookieHeader='';const r=await route.POST(req(url,'POST',{username,code}));assert.equal(r.status,200);cookieHeader=r.headers.get('set-cookie').split(';')[0];};

// Products: two groceries at 100 and 90 birr (replacement pair), one unrelated item.
const now0=Date.now();
for(const [id,name,cat,price] of [[900001,'Teff flour 1 kg','Groceries',10000],[900002,'Teff flour 1 kg (other brand)','Groceries',9000],[900003,'Dish soap','Cleaning & Laundry',5000],[900004,'Luxury perfume','Beauty & Care',500000]])sql.prepare("INSERT INTO products (id,name,category,price_cents,stock,image,archived,revision,updated_by,updated_at) VALUES (?,?,?,?,0,'/icon-512.png',0,1,'test',?)").run(id,name,cat,price,new Date().toISOString());
currentUser=owner;
const mk=async(name,username,location)=>{const s=await(await R.stores.POST(req('/api/admin/stores','POST',{name,username}))).json();await R.stores.PATCH(req('/api/admin/stores','PATCH',{storeId:s.id,action:'location',location}));return s;};
const A=await mk('Alpha Market','alpha01','8.9950, 38.7880'),B=await mk('Beta Market','beta01','9.0100, 38.7600'),C=await mk('Gamma Market','gamma01','9.0300, 38.7400');
const put=(s,p,q)=>sql.prepare("INSERT INTO store_stock(store_id,product_id,quantity,revision,updated_at,updated_by) VALUES(?,?,?,1,?,'admin') ON CONFLICT(store_id,product_id) DO UPDATE SET quantity=excluded.quantity").run(s,p,q,Date.now());
for(const s of [A,B,C])for(const p of [900001,900002,900003])put(s.id,p,20);
// Profile validation
assert.equal((await R.stores.PATCH(req('/api/admin/stores','PATCH',{storeId:A.id,action:'profile',hours:'8am-10pm'}))).status,400);
assert.equal((await R.stores.PATCH(req('/api/admin/stores','PATCH',{storeId:A.id,action:'profile',hours:'',radiusKm:0.1}))).status,400);
currentUser=null;
const near='https://www.google.com/maps/search/?api=1&query=8.9960%2C38.7885';
const place=async(items,mapLink=near)=>{const r=await R.orders.POST(req('/api/orders','POST',{name:'Liya Tesfaye',phone:'0911223344',address:'Bole, house 7',city:'Addis Ababa',inAddis:true,items,mapLink}));const d=await r.json();assert.equal(r.status,201,d.error);return {id:d.order.id,token:d.token,order:d.order};};

// 1. Opening hours and delivery radius decide which supermarket can take the order.
const t=R.settings.addisMinutes(),hm=m=>String(Math.floor(((m%1440)+1440)%1440/60)).padStart(2,'0')+':'+String(((m%1440)+1440)%1440%60).padStart(2,'0');
assert.equal(R.settings.isOpen({open_time:'22:00',close_time:'06:00'},Date.UTC(2026,0,1,0,0)),true,'03:00 Addis is inside 22:00–06:00');
assert.equal(R.settings.isOpen({open_time:'08:00',close_time:'20:00'},Date.UTC(2026,0,1,18,0)),false,'21:00 Addis is closed');
await asOwner(()=>R.stores.PATCH(req('/api/admin/stores','PATCH',{storeId:A.id,action:'profile',hours:`${hm(t+120)}-${hm(t+180)}`,radiusKm:null,phone:'0911000001'})));
let o1=await place([{id:900001,n:1}]);assert.equal(payload(o1.id).allocation.storeId,B.id,'A is closed now');
await asOwner(()=>R.stores.PATCH(req('/api/admin/stores','PATCH',{storeId:A.id,action:'profile',hours:'',radiusKm:0.5,phone:'0911000001'})));
let o2=await place([{id:900001,n:1}],'https://www.google.com/maps/search/?api=1&query=9.0000%2C38.7880');assert.notEqual(payload(o2.id).allocation.storeId,A.id,'customer outside A radius');
await asOwner(()=>R.stores.PATCH(req('/api/admin/stores','PATCH',{storeId:A.id,action:'profile',hours:'',radiusKm:null,phone:'0911000001'})));

// 2. Supermarket must confirm in time; storekeeper sees countdown and confirms.
let o3=await place([{id:900001,n:2},{id:900003,n:1}]);let p3=payload(o3.id);assert.equal(p3.allocation.storeId,A.id);assert.equal(p3.storeState,'new');assert.ok(p3.confirmBy>Date.now()+9*60000&&p3.confirmBy<=Date.now()+10*60000);
await loginAs(R.skAuth,'/api/storekeeper/auth','alpha01',A.code);
let sk=await(await R.sk.GET(req('/api/storekeeper/orders'))).json();let mine=sk.orders.find(x=>x.id===o3.id);assert.equal(mine.state,'new');assert.ok(mine.confirmBy);assert.ok(sk.performance);
assert.equal((await R.sk.PATCH(req('/api/storekeeper/orders','PATCH',{id:o3.id,action:'confirm'}))).status,200);p3=payload(o3.id);assert.equal(p3.storeState,'picking');assert.equal(p3.confirmedOnTime,true);assert.ok(p3.timeline.confirmed);

// 3. Missed limit → moved to the next supermarket (stock moves too); if goods already paid → alert only.
let o4=await place([{id:900003,n:3}]);assert.equal(payload(o4.id).allocation.storeId,A.id);const aBefore=stockAt(A.id,900003),bBefore=stockAt(B.id,900003);
setPayload(o4.id,o=>{o.confirmBy=Date.now()-1000});await R.ops.sweep();let p4=payload(o4.id);
assert.equal(p4.allocation.storeId,B.id,'next nearest');assert.equal(stockAt(A.id,900003),aBefore+3);assert.equal(stockAt(B.id,900003),bBefore-3);assert.equal(p4.storeState,'new');assert.equal(p4.missedConfirm[0].storeId,A.id);assert.equal(p4.alerts[0].type,'moved');
let o5=await place([{id:900003,n:1}]);setPayload(o5.id,o=>{o.confirmBy=Date.now()-1000;o.sellerPayment.status='verified'});await R.ops.sweep();let p5=payload(o5.id);
assert.equal(p5.allocation.storeId,A.id,'paid goods stay');assert.equal(p5.confirmBy,null);assert.equal(p5.alerts[0].type,'confirm-missed');
await R.ops.sweep();assert.equal(payload(o5.id).alerts.length,1,'alerted once');
const pub5=(await(await R.orders.POST(req('/api/orders','POST',{action:'lookup',id:o5.id,token:o5.token}))).json()).order;assert.equal(pub5.alerts,undefined);assert.equal(pub5.missedConfirm,undefined);

// 4. Replacement offers: accept, decline, time out; packing waits for the answer; paid bills get refunds.
let o6=await place([{id:900001,n:2},{id:900003,n:1}]);assert.equal(payload(o6.id).allocation.storeId,A.id);
assert.equal((await R.sk.PATCH(req('/api/storekeeper/orders','PATCH',{id:o6.id,action:'missing',productId:900001}))).status,200);
let p6=payload(o6.id),it=p6.items.find(i=>i.id===900001);assert.equal(it.offer.status,'pending');assert.equal(it.offer.id,900002);assert.equal(it.offer.price,9000);assert.equal(stockAt(A.id,900001),0,'shelf is empty');
assert.equal(p6.sellerTotal,2*10000+5000,'bill unchanged while waiting');
assert.equal((await R.sk.PATCH(req('/api/storekeeper/orders','PATCH',{id:o6.id,action:'ready'}))).status,409,'wait for the customer');
let pub=(await(await R.orders.POST(req('/api/orders','POST',{action:'lookup',id:o6.id,token:o6.token}))).json()).order;assert.equal(pub.items[0].offer.status,'pending');assert.equal(pub.items[0].missingStore,undefined);
const a2Before=stockAt(A.id,900002);
assert.equal((await R.sub.POST(req('/api/orders/substitute','POST',{id:o6.id,token:'0'.repeat(64),itemId:900001,accept:true}))).status,404);
let r=await R.sub.POST(req('/api/orders/substitute','POST',{id:o6.id,token:o6.token,itemId:900001,accept:true}));assert.equal(r.status,200);
p6=payload(o6.id);assert.equal(p6.items.find(i=>i.id===900002).substituteFor,900001);assert.equal(p6.sellerTotal,2*9000+5000);assert.equal(stockAt(A.id,900002),a2Before-2,'replacement held');
assert.equal((await R.sub.POST(req('/api/orders/substitute','POST',{id:o6.id,token:o6.token,itemId:900001,accept:false}))).status,409,'answered once');
assert.equal((await R.sk.PATCH(req('/api/storekeeper/orders','PATCH',{id:o6.id,action:'ready'}))).status,200);
put(A.id,900001,20);
// decline with seller already paid → refund
let o7=await place([{id:900001,n:1},{id:900003,n:1}]);setPayload(o7.id,o=>{o.sellerPayment.status='verified'});
await R.sk.PATCH(req('/api/storekeeper/orders','PATCH',{id:o7.id,action:'missing',productId:900001}));
r=await R.sub.POST(req('/api/orders/substitute','POST',{id:o7.id,token:o7.token,itemId:900001,accept:false}));assert.equal(r.status,200);
let p7=payload(o7.id);assert.equal(p7.sellerTotal,5000);assert.equal(p7.refundsDue[0].party,'seller');assert.equal(p7.refundsDue[0].amountCents,10000);assert.equal(p7.items[0].offer.status,'declined');
put(A.id,900001,20);
// timeout
let o8=await place([{id:900001,n:1},{id:900003,n:1}]);await R.sk.PATCH(req('/api/storekeeper/orders','PATCH',{id:o8.id,action:'missing',productId:900001}));
setPayload(o8.id,o=>{o.items[0].offer.expiresAt=Date.now()-1});await R.ops.sweep();let p8=payload(o8.id);assert.equal(p8.items[0].offer.status,'expired');assert.equal(p8.items[0].missing,true);assert.equal(p8.sellerTotal,5000);
put(A.id,900001,20);
// no replacement possible → plain missing
let o9=await place([{id:900003,n:1},{id:900001,n:1}]);await R.sk.PATCH(req('/api/storekeeper/orders','PATCH',{id:o9.id,action:'missing',productId:900003}));assert.equal(payload(o9.id).items[0].missing,true);assert.equal(payload(o9.id).items[0].offer,undefined);
cookieHeader='';

// 5. Riders: own riders first, then contracted (cost recorded); none free → Yango alert → Yango booked and delivered.
const dOwn=await asOwner(async()=>(await R.drivers.POST(req('/api/admin/drivers','POST',{name:'Abel',username:'abel01',group:'own',tripFee:0,phone:'0911000010'}))).json());
const dCon=await asOwner(async()=>(await R.drivers.POST(req('/api/admin/drivers','POST',{name:'Kebede',username:'kebede01',group:'contracted',tripFee:150,phone:'0911000011'}))).json());
assert.equal((await asOwner(()=>R.drivers.PATCH(req('/api/admin/drivers','PATCH',{id:dCon.id,action:'profile',group:'boss',tripFee:1})))).status,400);
await loginAs(R.dAuth,'/api/driver/auth','abel01',dOwn.code);assert.equal((await R.dStatus.PATCH(req('/api/driver/status','PATCH',{available:true,lat:51.5,lng:0}))).status,400);
assert.equal((await R.dStatus.PATCH(req('/api/driver/status','PATCH',{available:true,lat:8.9955,lng:38.7881}))).status,200);
await loginAs(R.dAuth,'/api/driver/auth','kebede01',dCon.code);await R.dStatus.PATCH(req('/api/driver/status','PATCH',{available:true,lat:8.99,lng:38.78}));cookieHeader='';
const paid=id=>setPayload(id,o=>{o.sellerPayment.status='verified';o.gulitPayment.status='verified';o.status='Payment verified'});
paid(o3.id);await R.ops.sweep();assert.ok(payload(o3.id).timeline.paid,'paid time noted');await R.ops.sweep();
let d3=sql.prepare('SELECT * FROM deliveries WHERE order_id=?').get(o3.id);assert.equal(d3.driver_id,dOwn.id);assert.equal(d3.provider,'own');assert.equal(d3.assigned_by,'auto');assert.equal(d3.cost_cents,0);
paid(o6.id);await R.ops.sweep();await R.ops.sweep();let d6=sql.prepare('SELECT * FROM deliveries WHERE order_id=?').get(o6.id);assert.equal(d6.driver_id,dCon.id);assert.equal(d6.provider,'contracted');assert.equal(d6.cost_cents,15000);
paid(o9.id);await R.ops.sweep();assert.equal(sql.prepare('SELECT COUNT(*) n FROM deliveries WHERE order_id=?').get(o9.id).n,0);
setPayload(o9.id,o=>{o.timeline.paid=Date.now()-6*60000});await R.ops.sweep();assert.equal(payload(o9.id).alerts.find(a=>a.type==='no-rider').done,false);
currentUser=owner;
let live=await(await R.live.GET(req('/api/admin/live'))).json();let row9=live.orders.find(x=>x.id===o9.id);assert.ok(row9.flags.includes('No rider assigned'));assert.equal(live.kpis.length,6);assert.ok(live.stores.find(s=>s.id===A.id).orders>=1);assert.equal(live.riders.length,2);
assert.ok(live.orders.find(x=>x.id===o5.id).flags.some(f=>/missed/.test(f)));
assert.equal((await R.live.PATCH(req('/api/admin/live','PATCH',{id:o9.id,action:'yango',costBirr:-5}))).status,400);
assert.equal((await R.live.PATCH(req('/api/admin/live','PATCH',{id:o9.id,action:'yango',costBirr:320,ref:'YG-123'}))).status,200);
let d9=sql.prepare('SELECT * FROM deliveries WHERE order_id=?').get(o9.id);assert.equal(d9.provider,'yango');assert.equal(d9.cost_cents,32000);assert.ok(payload(o9.id).alerts.find(a=>a.type==='no-rider').done);
assert.equal((await R.live.PATCH(req('/api/admin/live','PATCH',{id:o9.id,action:'yangoState',state:'delivered'}))).status,400,'pick up first');
assert.equal((await R.live.PATCH(req('/api/admin/live','PATCH',{id:o9.id,action:'yangoState',state:'picked_up'}))).status,200);
assert.equal((await R.live.PATCH(req('/api/admin/live','PATCH',{id:o9.id,action:'yangoState',state:'delivered'}))).status,200);assert.ok(payload(o9.id).timeline.delivered);
// alerts handled, move order, settings
assert.equal((await R.live.PATCH(req('/api/admin/live','PATCH',{id:o5.id,action:'alertDone',index:0}))).status,200);assert.equal(payload(o5.id).alerts[0].done,true);
assert.equal((await R.live.PATCH(req('/api/admin/live','PATCH',{id:o5.id,action:'move',storeId:C.id}))).status,409,'goods paid to current store');
let o10=await place([{id:900003,n:1}]);assert.equal((await R.live.PATCH(req('/api/admin/live','PATCH',{id:o10.id,action:'move',storeId:C.id},'https://evil.test'))).status,403);
assert.equal((await R.live.PATCH(req('/api/admin/live','PATCH',{id:o10.id,action:'move',storeId:C.id}))).status,200);assert.equal(payload(o10.id).allocation.storeId,C.id);assert.equal(payload(o10.id).storeState,'new');
assert.equal((await R.live.PATCH(req('/api/admin/live','PATCH',{action:'settings',settings:{confirmMinutes:1}}))).status,400);
assert.equal((await R.live.PATCH(req('/api/admin/live','PATCH',{action:'settings',settings:{confirmMinutes:15,storekeeperBonus:1000}}))).status,200);
let o11=await place([{id:900003,n:1}]);assert.ok(payload(o11.id).confirmBy>Date.now()+14*60000,'new limit used');
currentUser=null;

// 6. Driver updates fill the delivery timeline; going offline clears location.
await loginAs(R.dAuth,'/api/driver/auth','abel01',dOwn.code);
let job=(await(await R.dels.GET(req('/api/driver/deliveries'))).json());assert.equal(job.driver.available,true);assert.equal(job.deliveries[0].id,o3.id);
assert.equal((await R.dels.PATCH(req('/api/driver/deliveries','PATCH',{id:o3.id,state:'picked_up'}))).status,200);assert.ok(payload(o3.id).timeline.pickedUp);
await R.dels.PATCH(req('/api/driver/deliveries','PATCH',{id:o3.id,state:'on_way'}));await R.dels.PATCH(req('/api/driver/deliveries','PATCH',{id:o3.id,state:'delivered'}));assert.ok(payload(o3.id).timeline.delivered);
assert.equal((await R.dStatus.PATCH(req('/api/driver/status','PATCH',{available:false}))).status,200);assert.equal(sql.prepare('SELECT lat FROM drivers WHERE id=?').get(dOwn.id).lat,null);
cookieHeader='';
// 7. KPIs and storekeeper performance reflect the week.
currentUser=owner;live=await(await R.live.GET(req('/api/admin/live'))).json();currentUser=null;
const k=Object.fromEntries(live.kpis.map(x=>[x.key,x.value]));assert.ok(k.available<100,'missing items lower availability');assert.equal(k.ontime,100);assert.ok(live.deliveryMoney.byProvider.yango.n===1&&live.deliveryMoney.costs===32000);
await loginAs(R.skAuth,'/api/storekeeper/auth','alpha01',A.code);sk=await(await R.sk.GET(req('/api/storekeeper/orders'))).json();assert.equal(sk.performance.bonusPerOrder,1000);assert.ok(sk.performance.weekPacked>=1);cookieHeader='';
// 8. Pages still contain valid JavaScript.
const scripts=html=>[...html.matchAll(/<script(?![^>]*application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
const decoded=f=>JSON.parse(fs.readFileSync(f,'utf8').match(/^export default (.*);\s*$/s)[1]);
for(const f of ['lib/storefront-html.ts','lib/admin-stores-html.ts','lib/storekeeper-html.ts','lib/admin-live-html.ts','lib/admin-html.ts','lib/admin-engineers-html.ts'])for(const js of scripts(decoded(f)))new Function(js);
for(const f of ['app/admin/orders/route.ts','app/admin/drivers/route.ts','app/driver/route.ts','app/admin/support/route.ts']){const out=ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText;for(const js of scripts(JSON.parse(out.match(/new Response\(("(?:[^"\\]|\\.)*")/s)[1])))new Function(js);}
console.log('PASS: operations — opening hours and radius, confirm limit, re-routing with stock move, paid-goods escalation once, replacement offers (accept/decline/timeout, holds, refunds, packing waits), no-replacement fallback, own-then-contracted auto-dispatch with costs, Yango alert/booking/states, live dashboard flags/KPIs/stores/riders/settings, driver timeline and offline, storekeeper performance and bonus, private fields hidden, page scripts parse');
