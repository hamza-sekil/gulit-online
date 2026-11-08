import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {DatabaseSync} from 'node:sqlite';
import ts from 'typescript';

// Order routing, stock holds, delivery zones, storekeeper picking, driver pickup, cancel/expiry and refunds.
const sql=new DatabaseSync(':memory:');
for(const file of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())sql.exec(fs.readFileSync(path.join('drizzle',file),'utf8'));
const DB={prepare(query){let args=[];return {bind(...values){args=values;return this},async first(){return sql.prepare(query).get(...args)||null},async all(){return {results:sql.prepare(query).all(...args)}},async run(){const r=sql.prepare(query).run(...args);return {meta:{changes:r.changes}}}}}};
const env={DB,BUCKET:{async put(){},async get(){return null}},OWNER_EMAIL:'owner@example.test',GULIT_HOSTING:'chatgpt-sites',CHAPA_SECRET_KEY:'CHASECK_TEST-fixturefixturefixture'};
let currentUser=null,cookieHeader='';
const ctx=vm.createContext({Request,Response,File,FormData,URL,URLSearchParams,TextEncoder,crypto,console,Date,Map,Set,Uint8Array,Headers,fetch:async()=>{throw Error('no network in tests')}});const cache=new Map();
function synthetic(key,exports){const m=new vm.SyntheticModule(Object.keys(exports),function(){for(const [k,v]of Object.entries(exports))this.setExport(k,v)},{context:ctx,identifier:key});cache.set(key,m);return m;}
synthetic('next/headers',{headers:async()=>new Headers({cookie:cookieHeader})});synthetic('cloudflare:workers',{env});synthetic('auth',{getChatGPTUser:async()=>currentUser});
const pendingLoads=new Map();async function load(file){file=path.resolve(file);if(!pendingLoads.has(file))pendingLoads.set(file,loadInner(file));return pendingLoads.get(file);}
async function loadInner(file){if(cache.has(file))return cache.get(file);if(file.endsWith('.json'))return synthetic(file,{default:JSON.parse(fs.readFileSync(file,'utf8'))});const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;const mod=new vm.SourceTextModule(code,{context:ctx,identifier:file});cache.set(file,mod);await mod.link(async(specifier,ref)=>{if(specifier==='next/headers'||specifier==='cloudflare:workers')return cache.get(specifier);if(specifier.endsWith('chatgpt-auth'))return cache.get('auth');let target=path.resolve(path.dirname(ref.identifier),specifier);if(!path.extname(target))target+='.ts';return load(target)});return mod;}
const routes={};for(const [name,file] of Object.entries({shop:'app/api/catalog/route.ts',orders:'app/api/orders/route.ts',pay:'app/api/orders/pay/route.ts',adminOrders:'app/api/admin/orders/route.ts',stores:'app/api/admin/stores/route.ts',skAuth:'app/api/storekeeper/auth/route.ts',skOrders:'app/api/storekeeper/orders/route.ts',drivers:'app/api/admin/drivers/route.ts',dAuth:'app/api/driver/auth/route.ts',deliveries:'app/api/driver/deliveries/route.ts',delivery:'lib/delivery.ts',ops:'lib/ops.ts'})){const m=await load(file);if(m.status!=='evaluated')await m.evaluate();routes[name]=m.namespace;}
const {shop,orders,pay,adminOrders,stores,skAuth,skOrders,drivers,dAuth,deliveries,delivery,ops}=routes,origin='https://gulit.test',owner={userId:'o',email:'owner@example.test'};
const req=(url,method='GET',body,source=origin)=>new Request(origin+url,{method,headers:{Origin:source,'Content-Type':'application/json','cf-connecting-ip':'ip-'+Math.random()},...(body!==undefined?{body:JSON.stringify(body)}:{})});
const same=(a,b,m)=>assert.equal(JSON.stringify(a),JSON.stringify(b),m);
const payload=id=>JSON.parse(sql.prepare('SELECT payload FROM orders WHERE id=?').get(id).payload);
const stockAt=(store,product)=>sql.prepare('SELECT quantity FROM store_stock WHERE store_id=? AND product_id=?').get(store,product).quantity;
const asOwner=async fn=>{const prev=currentUser;currentUser=owner;try{return await fn()}finally{currentUser=prev}};

// Map links → coordinates; zones.
same(delivery.coordsFrom('https://www.google.com/maps/search/?api=1&query=9.0108%2C38.7613'),{lat:9.0108,lng:38.7613});
same(delivery.coordsFrom('https://www.google.com/maps/@9.0301,38.7406,17z'),{lat:9.0301,lng:38.7406});
same(delivery.coordsFrom('9.0108, 38.7613'),{lat:9.0108,lng:38.7613});
assert.equal(delivery.coordsFrom('https://maps.app.goo.gl/abc123'),null);assert.equal(delivery.coordsFrom('51.5072, -0.1276'),null,'outside Ethiopia');
const Z=delivery.DEFAULT_ZONES;assert.equal(delivery.pickZone(Z,1.2).fee,30000);assert.equal(delivery.pickZone(Z,3).fee,55000);assert.equal(delivery.pickZone(Z,11.9).fee,85000);assert.equal(delivery.pickZone(Z,40).fee,120000);
same([delivery.pickZone(Z,null).fee,delivery.pickZone(Z,null).estimated],[55000,true]);

// Two supermarkets, with map locations, stock and (for A) a Chapa payout account.
const [p1,p2]=(await(await shop.GET()).json()).products.filter(p=>!p.draft&&p.stock>0&&p.price>0);
currentUser=owner;
const A=await(await stores.POST(req('/api/admin/stores','POST',{name:'Bole Supermarket',username:'bole01'}))).json();
const B=await(await stores.POST(req('/api/admin/stores','POST',{name:'Piassa Supermarket',username:'piassa01'}))).json();
assert.equal((await stores.PATCH(req('/api/admin/stores','PATCH',{storeId:A.id,action:'location',location:'somewhere nice'}))).status,400);
assert.equal((await stores.PATCH(req('/api/admin/stores','PATCH',{storeId:A.id,action:'location',location:'https://www.google.com/maps/@8.9950,38.7880,17z'}))).status,200);
assert.equal((await stores.PATCH(req('/api/admin/stores','PATCH',{storeId:B.id,action:'location',location:'9.0350, 38.7520'}))).status,200);
assert.equal((await stores.PATCH(req('/api/admin/stores','PATCH',{storeId:A.id,action:'payout',subaccount:'aaaaaaaa-1111-2222-3333-bbbbbbbbbbbb',commissionPercent:1}))).status,200);
const put=(s,p,q)=>sql.prepare('INSERT INTO store_stock(store_id,product_id,quantity,revision,updated_at,updated_by) VALUES(?,?,?,1,?,?) ON CONFLICT(store_id,product_id) DO UPDATE SET quantity=excluded.quantity').run(s,p,q,Date.now(),'admin');
put(A.id,p1.id,5);put(A.id,p2.id,0);put(B.id,p1.id,5);put(B.id,p2.id,5);
currentUser=null;
const base={name:'Sara Alemu',phone:'0911000000',address:'Near the church, house 4',city:'Addis Ababa',inAddis:true};
async function place(items,mapLink){const r=await orders.POST(req('/api/orders','POST',{...base,items,...(mapLink?{mapLink}:{})}));const d=await r.json();assert.equal(r.status,201,d.error);return {order:d.order,key:{id:d.order.id,token:d.token}};}

// 1. Near Bole, only p1: nearest store with everything = A; stock held; zone 1; payout linked → seller can pay online.
let {order,key}=await place([{id:p1.id,n:2}],'https://www.google.com/maps/search/?api=1&query=8.9970%2C38.7890');
let o=payload(key.id);assert.equal(o.allocation.storeId,A.id);assert.equal(o.allocation.reserved,true);assert.equal(stockAt(A.id,p1.id),3);assert.equal(stockAt(B.id,p1.id),5);
assert.equal(o.deliveryZone.zone,1);assert.equal(o.delivery,30000);assert.equal(o.deliveryZone.estimated,false);assert.equal(order.sellerName,'Bole Supermarket');assert.equal(order.sellerPayment.online,true);
assert.equal(order.allocation,undefined,'routing details stay private');assert.equal(order.customerLocation,undefined);
const first=key;

// 2. Needs p2 too: only B has both, even though A is nearer. B has no payout → seller pays by deposit details from care.
({order,key}=await place([{id:p1.id,n:1},{id:p2.id,n:2}],'https://www.google.com/maps/search/?api=1&query=8.9970%2C38.7890'));
o=payload(key.id);assert.equal(o.allocation.storeId,B.id);assert.equal(stockAt(B.id,p2.id),3);assert.equal(order.sellerName,'Piassa Supermarket');assert.equal(order.sellerPayment.online,false);
assert.ok(o.deliveryZone.km>4&&o.deliveryZone.zone>=2,'distance-based zone from B');const second=key;

// 3. No map pin: Zone 2 estimate.
({order,key}=await place([{id:p1.id,n:1}]));o=payload(key.id);assert.equal(o.allocation.storeId,A.id,'stores with a map location first');assert.equal(o.delivery,55000);assert.equal(o.deliveryZone.estimated,true);const third=key;

// 4. Owner changes the zone before the Gulit bill is paid; owner edits the zone fees.
currentUser=owner;
assert.equal((await adminOrders.PATCH(req('/api/admin/orders','PATCH',{id:third.id,action:'zone',zone:3}))).status,200);o=payload(third.id);assert.equal(o.delivery,85000);assert.equal(o.deliveryZone.estimated,false);assert.equal(o.gulitTotal,o.service+o.serviceVat+85000+12750);
assert.equal((await adminOrders.PATCH(req('/api/admin/orders','PATCH',{action:'zones',zones:[{upToKm:5,fee:1},{upToKm:3,fee:2},{upToKm:null,fee:3}]}))).status,400);
assert.equal((await adminOrders.PATCH(req('/api/admin/orders','PATCH',{action:'zones',zones:[{upToKm:3,fee:35000},{upToKm:7,fee:60000},{upToKm:12,fee:90000},{upToKm:null,fee:130000}]}))).status,200);
assert.equal((await(await shop.GET()).json()).deliveryZones[0].fee,35000);
let admin=await(await adminOrders.GET(req('/api/admin/orders'))).json();assert.equal(admin.deliveryZones.length,4);assert.match(admin.deliveryZones[1].label,/Zone 2: 3–7 km/);
currentUser=null;

// 5. Storekeeper A sees only its orders, marks an item missing (bill goes down, shelf set to 0) and marks packed.
let r=await skAuth.POST(req('/api/storekeeper/auth','POST',{username:'bole01',code:A.code}));assert.equal(r.status,200);cookieHeader=r.headers.get('set-cookie').split(';')[0];
let mine=(await(await skOrders.GET(req('/api/storekeeper/orders'))).json()).orders;same(mine.map(x=>x.id).sort(),[first.id,third.id].sort());assert.ok(!JSON.stringify(mine).includes('0911000000'),'no customer phone for storekeepers');
assert.equal((await skOrders.PATCH(req('/api/storekeeper/orders','PATCH',{id:second.id,action:'ready'}))).status,404,'other store\'s order');
assert.equal((await skOrders.PATCH(req('/api/storekeeper/orders','PATCH',{id:first.id,action:'missing',productId:p1.id}))).status,409,'last item cannot be removed');
cookieHeader='';r=await skAuth.POST(req('/api/storekeeper/auth','POST',{username:'piassa01',code:B.code}));cookieHeader=r.headers.get('set-cookie').split(';')[0];
// Seller of order 2 already paid (slip verified) → removing an item creates a refund.
let s2=payload(second.id);s2.sellerPayment.status='verified';sql.prepare('UPDATE orders SET payload=? WHERE id=?').run(JSON.stringify(s2),second.id);
const before=s2.sellerTotal;
assert.equal((await skOrders.PATCH(req('/api/storekeeper/orders','PATCH',{id:second.id,action:'missing',productId:p2.id},'https://evil.test'))).status,403);
assert.equal((await skOrders.PATCH(req('/api/storekeeper/orders','PATCH',{id:second.id,action:'missing',productId:p2.id}))).status,200);
s2=payload(second.id);assert.equal(s2.sellerTotal,before-Math.round(p2.price*100)*2);assert.equal(s2.refundsDue[0].party,'seller');assert.equal(s2.refundsDue[0].amountCents,Math.round(p2.price*100)*2);assert.equal(stockAt(B.id,p2.id),0);
assert.equal((await skOrders.PATCH(req('/api/storekeeper/orders','PATCH',{id:second.id,action:'ready'}))).status,200);assert.equal(payload(second.id).storeState,'ready');
assert.equal((await skOrders.PATCH(req('/api/storekeeper/orders','PATCH',{id:second.id,action:'missing',productId:p1.id}))).status,409,'packed orders are locked');
let lookup=(await(await orders.POST(req('/api/orders','POST',{action:'lookup',...second}))).json()).order;assert.equal(lookup.items.find(i=>i.id===p2.id).missing,true);assert.equal(lookup.refundsDue,undefined);
cookieHeader='';

// 6. Driver picks up at the supermarket (with map link and packed status), not Adwa 00.
currentUser=owner;const drv=await(await drivers.POST(req('/api/admin/drivers','POST',{name:'Dawit',username:'dawit01'}))).json();
s2=payload(second.id);s2.gulitPayment.status='verified';s2.status='Payment verified';sql.prepare('UPDATE orders SET payload=? WHERE id=?').run(JSON.stringify(s2),second.id);
assert.equal((await drivers.PATCH(req('/api/admin/drivers','PATCH',{action:'assign',orderId:second.id,driverId:drv.id}))).status,200);currentUser=null;
r=await dAuth.POST(req('/api/driver/auth','POST',{username:'dawit01',code:drv.code}));cookieHeader=r.headers.get('set-cookie').split(';')[0];
const job=(await(await deliveries.GET(req('/api/driver/deliveries'))).json()).deliveries[0];assert.equal(job.pickup,'Piassa Supermarket');assert.match(job.pickupMap,/query=9\.035,38\.752$/);assert.equal(job.storeReady,true);same(job.items.map(i=>i.name),[p1.name]);
cookieHeader='';

// 7. Owner cancels order 1: stock goes back, no online payment possible, owner marks refunds done.
currentUser=owner;
assert.equal((await adminOrders.PATCH(req('/api/admin/orders','PATCH',{id:first.id,action:'cancel'}))).status,200);o=payload(first.id);assert.equal(o.status,'Cancelled');assert.equal(o.allocation.reserved,false);
assert.equal(stockAt(A.id,p1.id),4,'2 returned (one unit is still held by order 3)');
assert.equal((await adminOrders.PATCH(req('/api/admin/orders','PATCH',{id:first.id,action:'cancel'}))).status,409);
assert.equal((await adminOrders.PATCH(req('/api/admin/orders','PATCH',{id:second.id,action:'refunded',index:0}))).status,200);assert.equal(payload(second.id).refundsDue[0].done,true);
currentUser=null;
lookup=(await(await orders.POST(req('/api/orders','POST',{action:'lookup',...first}))).json()).order;assert.equal(lookup.gulitPayment.online,false);assert.equal(lookup.sellerPayment.online,false);
assert.equal((await pay.POST(req('/api/orders/pay','POST',{action:'start',...first,party:'gulit'}))).status,400);

// 8. Unpaid holds expire after 24 hours (checked when the next order comes in); slips under review are kept.
let s3=payload(third.id);s3.gulitPayment.status='review';sql.prepare('UPDATE orders SET payload=?,created_at=? WHERE id=?').run(JSON.stringify(s3),Date.now()-25*3600e3,third.id);
const fourth=(await place([{id:p1.id,n:1}],'https://www.google.com/maps/search/?api=1&query=8.9970%2C38.7890')).key;
sql.prepare('UPDATE orders SET created_at=? WHERE id=?').run(Date.now()-25*3600e3,fourth.id);
const heldBefore=stockAt(A.id,p1.id);
await ops.sweep();assert.equal(stockAt(A.id,p1.id),heldBefore+1,'expired hold returned');
await place([{id:p1.id,n:1}],'https://www.google.com/maps/search/?api=1&query=8.9970%2C38.7890');
assert.equal(payload(fourth.id).status,'Expired');assert.equal(payload(third.id).closed,undefined,'slip under review keeps its hold');assert.equal(payload(third.id).allocation.reserved,true);
assert.equal(stockAt(A.id,p1.id),heldBefore+1-1,'expired hold returned, new order held');

// 9. Products without supermarket stock rows still order fine (no routing, estimated zone).
const unmanaged=(await(await shop.GET()).json()).products.find(p=>!p.draft&&p.stock>0&&p.price>0&&![p1.id,p2.id].includes(p.id));
({key}=await place([{id:unmanaged.id,n:1}]));o=payload(key.id);assert.equal(o.allocation,undefined);assert.equal(o.deliveryZone.estimated,true);assert.equal(o.delivery,60000);

// 10. Every changed page still contains valid JavaScript.
const scripts=html=>[...html.matchAll(/<script(?![^>]*application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
const decoded=f=>JSON.parse(fs.readFileSync(f,'utf8').match(/^export default (.*);\s*$/s)[1]);
for(const f of ['lib/storefront-html.ts','lib/admin-stores-html.ts','lib/storekeeper-html.ts'])for(const js of scripts(decoded(f)))new Function(js);
for(const f of ['app/admin/orders/route.ts','app/driver/route.ts']){const out=ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText;for(const js of scripts(JSON.parse(out.match(/new Response\(("(?:[^"\\]|\\.)*")/s)[1])))new Function(js);}
console.log('PASS: routing — map pins, distance zones and estimates, nearest store with every item, stock holds, payout auto-link, owner zone change and fee settings, storekeeper isolation/missing items/refunds/packed lock, driver pickup at supermarket, cancel returns stock, 24h expiry keeps slips under review, unmanaged products, page scripts parse');
