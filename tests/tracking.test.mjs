// Live rider tracking: saved only during picked_up/on_way for the rider's own delivery, shown to the customer with an ETA, stale after 10 min, cleared on delivery.
import assert from 'node:assert/strict';import fs from 'node:fs';
const ts=(await import('/home/claude/gulit-online/node_modules/typescript/lib/typescript.js')).default;
const tx=f=>ts.transpileModule(fs.readFileSync(f,'utf8').replace(/^import .*$/mg,''),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText.replace(/^export /mg,'');
// tiny in-memory stand-in for the two tables involved
const rows={deliveries:{'GUL-1':{state:'on_way',driver_id:'d1'}},drivers:{d1:{}}};
const database=()=>({prepare:sql=>({bind:(...a)=>({run:async()=>{let changes=0;
 if(sql.startsWith('UPDATE deliveries SET rider_lat=?')){const [la,ln,at,id,drv]=a,d=rows.deliveries[id];if(d&&d.driver_id===drv&&['picked_up','on_way'].includes(d.state)){Object.assign(d,{rider_lat:la,rider_lng:ln,rider_loc_at:at});changes=1}}
 else if(sql.startsWith('UPDATE drivers')){Object.assign(rows.drivers[a[3]],{lat:a[0],lng:a[1]});changes=1}
 else if(sql.startsWith('UPDATE deliveries SET rider_lat=NULL')){Object.assign(rows.deliveries[a[0]],{rider_lat:null,rider_lng:null,rider_loc_at:null});changes=1}
 return {meta:{changes}}},first:async()=>rows.deliveries[a[0]]||null})})});
const code='const database='+database.toString()+';const rows='+JSON.stringify(rows)+';'+tx('lib/delivery.ts').replace(/export /g,'')+tx('lib/tracking.ts')+';export {saveRiderLocation,trackingFor,clearRiderLocation,etaMinutes};';
const m=await import('data:text/javascript,'+encodeURIComponent(code.replace('const rows='+JSON.stringify(rows),'globalThis.rows=globalThis.rows||'+JSON.stringify(rows)+';const rows=globalThis.rows')));
const now=Date.UTC(2026,10,15,10);
assert.equal(await m.saveRiderLocation('GUL-1','d2',9.01,38.76,now),false,'other rider cannot update');
assert.equal(await m.saveRiderLocation('GUL-1','d1',9.01,38.76,now),true);
await assert.rejects(m.saveRiderLocation('GUL-1','d1',51.5,-0.1,now),/outside Ethiopia/);
const t=await m.trackingFor('GUL-1',{lat:9.03,lng:38.76},now+60000);
assert.equal(t.lat,9.01);assert.ok(t.km>2&&t.km<3.5,'road km');assert.equal(t.minutes,m.etaMinutes(t.km));
assert.equal(await m.trackingFor('GUL-1',null,now+11*60000),null,'stale after 10 min');
await m.clearRiderLocation('GUL-1');assert.equal(await m.trackingFor('GUL-1',null,now+60000),null,'cleared on delivery');
// wiring
const drv=fs.readFileSync('app/driver/route.ts','utf8');assert.match(drv,/watchPosition/);assert.match(drv,/\/api\/driver\/location/);
assert.match(fs.readFileSync('app/api/driver/deliveries/route.ts','utf8'),/clearRiderLocation\(row\.order_id\)/);
assert.match(fs.readFileSync('app/api/orders/route.ts','utf8'),/trackingFor\(/);
const sf=fs.readFileSync('lib/storefront-html.ts','utf8');assert.match(sf,/openstreetmap\.org\/export\/embed\.html/);assert.match(sf,/trackBox\(o\)/);
assert.match(fs.readFileSync('drizzle/0016_rider_location.sql','utf8'),/rider_loc_at/);
console.log('PASS: live tracking — own delivery only, Ethiopia bounds, ETA, stale after 10 min, cleared on delivery, rider + customer pages');
