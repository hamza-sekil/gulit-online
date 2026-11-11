import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {DatabaseSync} from 'node:sqlite';
import ts from 'typescript';

// Laundry: each laundry prices item types, customers pick a laundry, two-trip delivery, no stock hold, separate orders.
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
const partners=await load('app/api/admin/partners/route.ts');if(partners.status!=='evaluated')await partners.evaluate();const P=partners.namespace;
const pubPartners=await load('app/api/partners/route.ts');if(pubPartners.status!=='evaluated')await pubPartners.evaluate();
const LIDS=JSON.parse(fs.readFileSync('lib/catalog-defaults.json','utf8')).filter(x=>x.id>=300000&&x.id<=300999);
assert.ok(LIDS.length>=25&&LIDS.every(x=>x.cat==='Laundry service'&&x.draft),'laundry item types in the catalogue');
for(const f of new Set(LIDS.map(x=>x.image)))assert.ok(fs.existsSync('public'+f),'icon '+f);
// Laundry partner applies and is approved: its storekeeper account gets every laundry item to price.
const app={businessType:'Laundry / dry cleaner',supermarket:'Bole Clean Laundry',branches:1,address:'Bole, Woreda 03',contactName:'Almaz T',role:'Owner',phone:'0911223344',email:'',tin:'0012345678',license:'',categories:['Other'],size:'Under 500',delivery:'No',payout:'Telebirr',hours:'8–6',message:'',agree:true};
let r=await pubPartners.namespace.POST(req('/api/partners','POST',app));assert.equal(r.status,201,(await r.clone().text()));const appId=(await r.json()).reference;
currentUser=owner;
r=await P.POST(req('/api/admin/partners','POST',{id:appId,username:'boleclean'}));assert.equal(r.status,201);const L1=await r.json();
assert.equal(sql.prepare('SELECT COUNT(*) n FROM store_stock WHERE store_id=?').get(L1.id).n,LIDS.length,'all laundry items assigned');
// a second laundry, added directly
const L2=await(await stores.POST(req('/api/admin/stores','POST',{name:'Piassa Laundry',username:'piassalaundry'}))).json();
await stores.PATCH(req('/api/admin/stores','PATCH',{storeId:L1.id,action:'location',location:'9.0000, 38.7600'}));
await stores.PATCH(req('/api/admin/stores','PATCH',{storeId:L2.id,action:'location',location:'9.0000, 38.7800'}));
const put=(s,p,q,price=null)=>sql.prepare('INSERT INTO store_stock(store_id,product_id,quantity,price_cents,revision,updated_at,updated_by) VALUES(?,?,?,?,1,?,?) ON CONFLICT(store_id,product_id) DO UPDATE SET quantity=excluded.quantity,price_cents=excluded.price_cents,updated_by=excluded.updated_by').run(s,p,q,price,Date.now(),'admin');
const shirt=300000,suit=300011;
// Not priced yet: still drafts
let cat=(await(await shop.GET()).json());assert.equal(cat.products.find(p=>p.id===shirt).draft,true);
put(L1.id,shirt,1,6000);put(L1.id,suit,1,35000);   // Bole: shirt 60, suit 350; accepting = 1
put(L2.id,shirt,50,5000);put(L2.id,suit,50,40000); // Piassa: shirt 50, suit 400
cat=(await(await shop.GET()).json());let cs=cat.products.find(p=>p.id===shirt);
assert.equal(cs.draft,false);assert.equal(cs.badge,'Laundry price');assert.equal(cs.fromPrice,50);assert.equal(cs.stock,999,'service: not limited by the number entered');
// Compare: 3 shirts + 1 suit → Bole 530, Piassa 550
let cmp=await(await compare.POST(req('/api/catalog/compare','POST',{items:[{id:shirt,n:3},{id:suit,n:1}]}))).json();
assert.equal(cmp.stores[0].id,L1.id);assert.equal(cmp.stores[0].goodsCents,53000);
// Order: 5 shirts at Bole even though it entered 1 (accepting), two delivery trips, no bags, stock not reduced
const base={name:'Sara Alemu',phone:'0911000000',address:'Near the church, house 4',city:'Addis Ababa',inAddis:true,mapLink:'https://www.google.com/maps/search/?api=1&query=9.0000%2C38.7700'};
r=await orders.POST(req('/api/orders','POST',{...base,items:[{id:shirt,n:5},{id:suit,n:1}],storeId:L1.id}));let d=await r.json();assert.equal(r.status,201,d.error);
const o=payload(d.order.id);
assert.equal(o.laundry,true);assert.equal(o.allocation.storeId,L1.id);assert.equal(o.goodsTotal,5*6000+35000);assert.equal(o.packaging,0);
assert.equal(o.deliveryZone.trips,2);assert.match(o.deliveryZone.label,/pickup and return/);
const zones=(await load('lib/delivery.ts')).namespace;const oneTrip=zones.DEFAULT_ZONES[0].fee;assert.equal(o.delivery,oneTrip*2,'2 trips (both laundries ~1 km away: zone 1)');
assert.equal(sql.prepare('SELECT quantity FROM store_stock WHERE store_id=? AND product_id=?').get(L1.id,shirt).quantity,1,'service capacity not used up');
// Photo checks: the customer sends a photo of a stained shirt; the laundry refuses it, so one shirt comes off the bill.
const orderToken=d.token,orderId=d.order.id;
const jpg=new Uint8Array([0xff,0xd8,0xff,0xe0,0,16,74,70,73,70,0,1,1,0,0,1,0,1,0,0,0xff,0xd9]);
const files=new Map();env.BUCKET={async put(k,b,o){files.set(k,{body:b,o})},async get(k){const f=files.get(k);return f?{body:f.body}:null}};
const lp=(await load('app/api/orders/laundry-photo/route.ts'));if(lp.status!=='evaluated')await lp.evaluate();
const sko=(await load('app/api/storekeeper/orders/route.ts'));if(sko.status!=='evaluated')await sko.evaluate();
const skp=(await load('app/api/storekeeper/laundry-photo/route.ts'));if(skp.status!=='evaluated')await skp.evaluate();
const form=(fields)=>{const f=new FormData();for(const [k,v] of Object.entries(fields))f.set(k,v);return new Request(origin+'/api/orders/laundry-photo',{method:'POST',headers:{Origin:origin,'cf-connecting-ip':'ip-'+Math.random()},body:f});};
r=await lp.namespace.POST(form({id:orderId,token:'0'.repeat(64),photo:new File([jpg],'a.jpg',{type:'image/jpeg'})}));assert.equal(r.status,404,'wrong token');
r=await lp.namespace.POST(form({id:orderId,token:orderToken,photo:new File([new Uint8Array([1,2,3,4])],'a.txt')}));assert.equal(r.status,400,'not an image');
r=await lp.namespace.POST(form({id:orderId,token:orderToken,photo:new File([jpg],'a.jpg',{type:'image/jpeg'}),itemId:String(shirt),note:'Paint on the front'}));let pd=await r.json();assert.equal(r.status,201,pd.error);
const chk=pd.order.laundryChecks[0];assert.equal(chk.status,'pending');assert.equal(chk.by,'customer');assert.equal(chk.key,undefined,'storage key hidden from customer');
r=await lp.namespace.GET(new Request(origin+'/api/orders/laundry-photo?id='+orderId+'&token='+orderToken+'&check='+chk.id));assert.equal(r.status,200);
// The laundry signs in, sees the photo, and must give a reason to refuse
currentUser=null;const lr=await skAuth.POST(req('/api/storekeeper/auth','POST',{username:'boleclean',code:L1.code}));assert.equal(lr.status,200);cookieHeader=lr.headers.get('set-cookie').split(';')[0];
let so=await(await sko.namespace.GET(req('/api/storekeeper/orders'))).json();let mine=so.orders.find(x=>x.id===orderId);assert.equal(mine.laundry,true);assert.equal(mine.checks.length,1);
r=await skp.namespace.GET(req(mine.checks[0].img.replace(origin,'')));assert.equal(r.status,200,'laundry can view the photo');
const before=payload(orderId).goodsTotal;
r=await sko.namespace.PATCH(req('/api/storekeeper/orders','PATCH',{id:orderId,action:'check',checkId:chk.id,decision:'reject',reply:''}));assert.equal(r.status,409,'reason required');
r=await sko.namespace.PATCH(req('/api/storekeeper/orders','PATCH',{id:orderId,action:'check',checkId:chk.id,decision:'reject',reply:'Paint will not come out'}));assert.equal(r.status,200);
let po=payload(orderId);assert.equal(po.laundryChecks[0].status,'rejected');assert.equal(po.items.find(i=>i.id===shirt).n,4);assert.equal(po.goodsTotal,before-6000,'one shirt off the bill');
r=await sko.namespace.PATCH(req('/api/storekeeper/orders','PATCH',{id:orderId,action:'check',checkId:chk.id,decision:'accept'}));assert.equal(r.status,409,'answered once');
assert.equal(sql.prepare('SELECT quantity FROM store_stock WHERE store_id=? AND product_id=?').get(L1.id,shirt).quantity,1,'refusing a piece does not switch the laundry off');
// a second photo accepted keeps the bill
r=await lp.namespace.POST(form({id:orderId,token:orderToken,photo:new File([jpg],'b.jpg',{type:'image/jpeg'}),itemId:String(suit)}));pd=await r.json();const chk2=pd.order.laundryChecks[1];
r=await sko.namespace.PATCH(req('/api/storekeeper/orders','PATCH',{id:orderId,action:'check',checkId:chk2.id,decision:'accept'}));assert.equal(r.status,200);assert.equal(payload(orderId).goodsTotal,before-6000);
cookieHeader='';currentUser=owner;
// Photo checks only for laundry orders
const gl=(await load('lib/laundry-checks.ts')).namespace;assert.throws(()=>gl.addCheck({items:[]},{by:'rider',key:'k',type:'image/jpeg'}),/only for laundry/);
// Laundry with 0 = not accepting: not chosen
put(L1.id,shirt,0,6000);
r=await orders.POST(req('/api/orders','POST',{...base,items:[{id:shirt,n:1}]}));d=await r.json();assert.equal(payload(d.order.id).allocation.storeId,L2.id);
// Laundry and shopping can't be mixed
const goods=cat.products.find(p=>!p.draft&&p.price>0&&p.id<300000);
r=await orders.POST(req('/api/orders','POST',{...base,items:[{id:shirt,n:1},{id:goods.id,n:1}]}));assert.equal(r.status,400);assert.match((await r.json()).error,/separate order/);
// Partner form offers the laundry business type
assert.ok((await load('lib/partners.ts')).namespace.TYPES.includes('Laundry / dry cleaner'));
// Storefront and storekeeper wiring
const sf=fs.readFileSync('lib/storefront-html.ts','utf8');assert.match(sf,/cartIsLaundry/);assert.match(sf,/gulitLaundry/);assert.match(sf,/Best price · all laundries/);
assert.match(fs.readFileSync('lib/storekeeper-html.ts','utf8'),/Accepting orders\?/);
console.log('PASS: laundry — photo checks (customer photo, laundry refuses with reason → piece off the bill), partner approval assigns items, per-laundry prices, compare, choose laundry, two trips, no bags, no stock hold, separate orders');
