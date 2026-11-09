import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {DatabaseSync} from 'node:sqlite';
import ts from 'typescript';

// Per-store prices, choose-your-supermarket, Compare & save, store-price routing and repricing.
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
const routes={};for(const [name,file] of Object.entries({shop:'app/api/catalog/route.ts',compare:'app/api/catalog/compare/route.ts',orders:'app/api/orders/route.ts',stores:'app/api/admin/stores/route.ts',skAuth:'app/api/storekeeper/auth/route.ts',skStock:'app/api/storekeeper/stock/route.ts',skImp:'app/api/storekeeper/import/route.ts',routing:'lib/routing.ts'})){const m=await load(file);if(m.status!=='evaluated')await m.evaluate();routes[name]=m.namespace;}
const {shop,compare,orders,stores,skAuth,skStock,skImp,routing}=routes,origin='https://gulit.test',owner={userId:'o',email:'owner@example.test'};
const req=(url,method='GET',body,source=origin)=>new Request(origin+url,{method,headers:{Origin:source,'Content-Type':'application/json','cf-connecting-ip':'ip-'+Math.random()},...(body!==undefined?{body:JSON.stringify(body)}:{})});
const payload=id=>JSON.parse(sql.prepare('SELECT payload FROM orders WHERE id=?').get(id).payload);
const all=(await(await shop.GET()).json()).products;
const [p1,p2]=all.filter(p=>!p.draft&&p.price>0),draft=all.find(p=>p.draft);
currentUser=owner;
const A=await(await stores.POST(req('/api/admin/stores','POST',{name:'Bole Mart',username:'bole01'}))).json();
const B=await(await stores.POST(req('/api/admin/stores','POST',{name:'Piassa Mart',username:'piassa01'}))).json();
// Both stores the same distance from the customer, so price decides.
await stores.PATCH(req('/api/admin/stores','PATCH',{storeId:A.id,action:'location',location:'9.0000, 38.7600'}));
await stores.PATCH(req('/api/admin/stores','PATCH',{storeId:B.id,action:'location',location:'9.0000, 38.7800'}));
const put=(s,p,q,price=null)=>sql.prepare('INSERT INTO store_stock(store_id,product_id,quantity,price_cents,revision,updated_at,updated_by) VALUES(?,?,?,?,1,?,?) ON CONFLICT(store_id,product_id) DO UPDATE SET quantity=excluded.quantity,price_cents=excluded.price_cents').run(s,p,q,price,Date.now(),'admin');
const base1=Math.round(p1.price*100),base2=Math.round(p2.price*100);
put(A.id,p1.id,10,base1-1000);put(B.id,p1.id,10,base1+2000);   // A cheaper for p1
put(A.id,p2.id,10,null);put(B.id,p2.id,10,base2-500);           // A sells p2 at Gulit price, B cheaper
put(A.id,draft.id,5,12345);put(B.id,draft.id,5,null);           // draft item: only A has a price
currentUser=null;

// Catalog shows each store's price, a "from" price, and publishes a draft item a store has priced.
let cat=(await(await shop.GET()).json());let c1=cat.products.find(p=>p.id===p1.id),cd=cat.products.find(p=>p.id===draft.id);
assert.equal(c1.fromPrice,(base1-1000)/100);assert.equal(c1.priceVaries,true);
assert.equal(c1.storeStock.find(s=>s.storeId===B.id).price,(base1+2000)/100);
assert.equal(cd.draft,false);assert.equal(cd.price,123.45);assert.equal(cd.stock,5,'only priced stock counts');assert.equal(cd.storeStock.find(s=>s.storeId===B.id).price,null);
assert.equal(cat.stores.length,2);

// Compare & save: A cheaper for p1-only bag; for p1+p2, totals compared; store without a price for an item counts it missing.
let cmp=await(await compare.POST(req('/api/catalog/compare','POST',{items:[{id:p1.id,n:2}]}))).json();
assert.equal(cmp.stores[0].id,A.id);assert.equal(cmp.stores[0].goodsCents,(base1-1000)*2);assert.equal(cmp.stores[1].goodsCents,(base1+2000)*2);
cmp=await(await compare.POST(req('/api/catalog/compare','POST',{items:[{id:p1.id,n:1},{id:draft.id,n:1}]}))).json();
assert.equal(cmp.stores[0].id,A.id);assert.equal(cmp.stores[0].complete,true);assert.equal(cmp.stores[1].missing,1);
assert.equal((await compare.POST(req('/api/catalog/compare','POST',{items:[]}))).status,200);
assert.equal((await compare.POST(req('/api/catalog/compare','POST',{items:[{id:p1.id,n:1}]},'https://evil.test'))).status,403);

// Orders: "Best price" picks the lowest total and charges that store's prices.
const pin='9.0000, 38.7700',base={name:'Sara Alemu',phone:'0911000000',address:'Near the church, house 4',city:'Addis Ababa',inAddis:true};
async function place(items,extra={}){const r=await orders.POST(req('/api/orders','POST',{...base,items,mapLink:'https://www.google.com/maps/search/?api=1&query=9.0000%2C38.7700',...extra}));const d=await r.json();assert.equal(r.status,201,d.error);return payload(d.order.id);}
let o=await place([{id:p1.id,n:2}]);
assert.equal(o.allocation.storeId,A.id);assert.equal(o.items[0].price,base1-1000);assert.equal(o.goodsTotal,(base1-1000)*2);assert.equal(o.total,o.sellerTotal+o.gulitTotal);
// Packaging (default 1 bag per 10 items, ETB 15): on the supermarket bill, not in the Gulit 4% service.
assert.equal(o.packaging,1500);assert.equal(o.sellerTotal,o.goodsTotal+1500);assert.equal(o.service,Math.round(Math.round(o.goodsTotal/1.15)*.04));
let big=await place([{id:p1.id,n:10},{id:p2.id,n:1}]);assert.equal(big.packaging,3000,'11 items = 2 bags');
put(A.id,p1.id,10,base1-1000);put(B.id,p1.id,10,base1+2000);put(A.id,p2.id,10,null);put(B.id,p2.id,10,base2-500); // restock
o=await place([{id:p2.id,n:1}]);assert.equal(o.allocation.storeId,B.id,'B cheaper for p2');assert.equal(o.goodsTotal,base2-500);
// Chosen store wins even if dearer, at its own prices.
o=await place([{id:p1.id,n:1}],{storeId:B.id});assert.equal(o.allocation.storeId,B.id);assert.equal(o.goodsTotal,base1+2000);assert.equal(o.storeNote,undefined);
// Chosen store can't price the draft item → goes to A, customer told.
o=await place([{id:draft.id,n:1}],{storeId:B.id});assert.equal(o.allocation.storeId,A.id);assert.equal(o.goodsTotal,12345);assert.equal(o.storeNote.used,'Bole Mart');
// Unknown store id is ignored.
o=await place([{id:p1.id,n:1}],{storeId:'nope'});assert.equal(o.allocation.storeId,A.id);
// Public order hides internal fields.
const pub=(await(await orders.POST(req('/api/orders','POST',{...base,items:[{id:p1.id,n:1}],storeId:B.id}))).json()).order;assert.equal(pub.preferredStore,undefined);assert.equal(pub.placedPriced,undefined);

// Moving an unpaid order to another store reprices it and tells the customer.
o=await place([{id:p1.id,n:1}]);const before=o.goodsTotal;
const storeB=sql.prepare('SELECT id,name,lat,lng,chapa_subaccount,commission_bps FROM stores WHERE id=?').get(B.id);
assert.equal(await routing.moveToStore(o,storeB),true);assert.equal(o.goodsTotal,base1+2000);assert.equal(o.priceNote.from,before);assert.equal(o.priceNote.to,base1+2000);assert.equal(o.priceNote.store,'Piassa Mart');

// Storekeeper sets prices: in the app and by CSV; bad prices and unpriced draft stock refused.
currentUser=null;let lr=await skAuth.POST(req('/api/storekeeper/auth','POST',{username:'piassa01',code:B.code}));cookieHeader=lr.headers.get('set-cookie').split(';')[0];
let inv=(await(await skStock.GET(req('/api/storekeeper/stock'))).json()).items;let row=inv.find(i=>i.productId===draft.id);assert.equal(row.price,null);assert.equal(row.basePrice,null);
let r=await skStock.PATCH(req('/api/storekeeper/stock','PATCH',{productId:draft.id,revision:row.revision,quantity:3}));assert.equal(r.status,400);assert.match((await r.json()).error,/shelf price/);
r=await skStock.PATCH(req('/api/storekeeper/stock','PATCH',{productId:draft.id,revision:row.revision,quantity:3,price:-5}));assert.equal(r.status,400);
r=await skStock.PATCH(req('/api/storekeeper/stock','PATCH',{productId:draft.id,revision:row.revision,quantity:3,price:110.5}));assert.equal(r.status,200);
assert.equal(sql.prepare('SELECT price_cents FROM store_stock WHERE store_id=? AND product_id=?').get(B.id,draft.id).price_cents,11050);
cat=(await(await shop.GET()).json());cd=cat.products.find(p=>p.id===draft.id);assert.equal(cd.fromPrice,110.5,'B now cheapest');
const csv=await(await skImp.GET(req('/api/storekeeper/import'))).text();assert.match(csv.split('\n')[0],/id,name,quantity,price,gulit_price/);
let imp=(await(await skImp.POST(req('/api/storekeeper/import','POST',{csv:`id,name,quantity,price\n${p1.id},x,4,99.5\n${p2.id},y,2,abc\n`}))).json()).result;
assert.equal(imp.updated,1);assert.match(imp.errors[0],/price/);
assert.equal(sql.prepare('SELECT price_cents,quantity FROM store_stock WHERE store_id=? AND product_id=?').get(B.id,p1.id).price_cents,9950);
// Empty price keeps the existing store price on CSV import.
imp=(await(await skImp.POST(req('/api/storekeeper/import','POST',{csv:`id,name,quantity,price\n${p1.id},x,6,\n`}))).json()).result;assert.equal(imp.updated,1);
assert.equal(sql.prepare('SELECT price_cents FROM store_stock WHERE store_id=? AND product_id=?').get(B.id,p1.id).price_cents,9950);
// Owner can change or switch off packaging.
currentUser=owner;const {saveOpsSettings,opsSettings}=await (async()=>{const m=await load('lib/settings.ts');if(m.status!=='evaluated')await m.evaluate();return m.namespace})();
await saveOpsSettings({...(await opsSettings()),packItemsPerBag:5,packBagPrice:20});currentUser=null;cookieHeader='';
big=await place([{id:p1.id,n:6}]);assert.equal(big.packaging,4000,'6 items at 5 per bag = 2 bags × ETB 20');
assert.equal((await(await shop.GET()).json()).packaging.bagPrice,20);
await saveOpsSettings({...(await opsSettings()),packBagPrice:0});big=await place([{id:p1.id,n:3}]);assert.equal(big.packaging,0);assert.equal(big.sellerTotal,big.goodsTotal);
console.log('PASS: store prices + packaging per bag — per-store prices and from-price in catalog, store-priced drafts publish, Compare & save, best-total routing, chosen store honoured or fallback with note, repricing on move, storekeeper app + CSV prices');
