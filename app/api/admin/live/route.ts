import { guard,json } from '../../../../lib/owner';
import { database } from '../../../../lib/catalog';
import { paymentState } from '../../../../lib/orders';
import { moveToStore } from '../../../../lib/routing';
import { sweepIfDue,freeRiders } from '../../../../lib/ops';
import { opsSettings,saveOpsSettings } from '../../../../lib/settings';
import { recentOrders,storeStats } from '../../../../lib/stats';
import { notifyOrder } from '../../../../lib/order-push';
export const dynamic='force-dynamic';

const pct=(a:number,b:number)=>b?Math.round(a/b*1000)/10:null;
function stage(o:any,delivery:string|null){if(o.closed)return o.closed;if(delivery==='delivered')return 'Delivered';if(delivery==='problem')return 'Delivery problem';if(delivery==='on_way')return 'On the way';if(delivery==='picked_up')return 'Picked up';if(delivery==='assigned')return o.storeState==='ready'?'Packed · rider coming':'Rider assigned';if(!o.allocation)return 'Needs a supermarket';if(o.storeState==='new')return 'Waiting for supermarket';if(o.storeState==='ready')return 'Packed · needs rider';return 'Picking';}

export async function GET(r:Request){const a=await guard(r);if(a.error)return a.error;try{await sweepIfDue();}catch{}
 const db=database(),now=Date.now(),ops=await opsSettings(),week=await recentOrders(7,now);
 const drivers=new Map(((await db.prepare('SELECT id,name,phone,grp,available,location_at FROM drivers').all()).results as any[]).map(d=>[d.id,d]));
 const deliveries=new Map(((await db.prepare('SELECT * FROM deliveries').all()).results as any[]).map(d=>[d.order_id,d]));
 const stores=(await db.prepare('SELECT id,name,active,contact_phone,lat,open_time,close_time,radius_km FROM stores ORDER BY name').all()).results as any[];
 const storeMap=new Map(stores.map(s=>[s.id,s]));
 const open=week.filter(x=>!x.o.closed&&x.delivery!=='delivered'&&x.o.billingVersion===2).map(({id,createdAt,o})=>{const d:any=deliveries.get(id)||null,flags:string[]=[];const paid=o.status==='Payment verified';
  if(o.storeState==='new'&&o.confirmBy&&now>o.confirmBy)flags.push('Supermarket has not confirmed');if(o.storeState==='new'&&o.confirmBy===null)flags.push('Supermarket missed the time limit');
  if(paid&&o.timeline?.paid&&now-o.timeline.paid>ops.lateMinutes*60000)flags.push(`Paid over ${ops.lateMinutes} min ago, not delivered`);
  if(paid&&!d&&o.timeline?.paid&&now-o.timeline.paid>ops.riderWaitMinutes*60000)flags.push('No rider assigned');
  if(d?.state==='assigned'&&now-d.updated_at>20*60000)flags.push('Rider not picked up after 20 min');if(d?.state==='problem')flags.push('Delivery problem: '+(d.driver_note||''));
  if(o.items.some((i:any)=>i.offer?.status==='pending'))flags.push('Waiting for customer to answer a replacement');if(!o.allocation)flags.push('No supermarket has every item');
  const store:any=o.allocation?storeMap.get(o.allocation.storeId):null,driver:any=d?(d.driver_id==='yango'?{name:'Yango courier'}:drivers.get(d.driver_id)):null;
  return {id,createdAt,minutes:Math.round((now-createdAt)/60000),customer:o.name,phone:o.phone,address:o.address,stage:stage(o,d?.state||null),paid,status:o.status,total:o.total,storeId:o.allocation?.storeId||null,storeName:o.allocation?.storeName||null,storePhone:store?.contact_phone||null,confirmBy:o.storeState==='new'?o.confirmBy:null,
   delivery:d?{state:d.state,provider:d.provider,driver:driver?.name||null,driverPhone:driver?.phone||null,costCents:d.cost_cents,assignedBy:d.assigned_by}:null,flags,alerts:(o.alerts||[]).map((x:any,i:number)=>({...x,index:i})).filter((x:any)=>!x.done),items:o.items.map((i:any)=>({name:i.name,n:i.n,missing:!!i.missing,offer:i.offer?.status||null,substitute:!!i.substituteFor}))};}).sort((x,y)=>y.flags.length-x.flags.length||x.createdAt-y.createdAt);
 // KPIs (last 7 days) — targets from the development plan
 const alloc=week.filter(x=>x.o.allocation||x.o.missedConfirm),stats=storeStats(week);
 let items=0,missing=0,delivered=0,within=0,dispatched=0,problems=0,basket=0,paidN=0,fees=0,costs=0;const byProvider:any={own:{n:0,cost:0,fees:0},contracted:{n:0,cost:0,fees:0},yango:{n:0,cost:0,fees:0}};
 for(const x of week){const o=x.o;for(const i of o.items||[]){if(i.substituteFor)continue;items++;if(i.missing)missing++;}
  if(o.status==='Payment verified'||x.delivery==='delivered'){paidN++;basket+=o.sellerTotal||0;}
  if(x.delivery){dispatched++;if(o.timeline?.problem)problems++;}
  if(x.delivery==='delivered'){delivered++;if(o.timeline?.paid&&o.timeline?.delivered&&o.timeline.delivered-o.timeline.paid<=ops.lateMinutes*60000)within++;fees+=o.delivery||0;costs+=x.costCents||0;const p=byProvider[x.provider||'own']||byProvider.own;p.n++;p.cost+=x.costCents||0;p.fees+=o.delivery||0;}}
 const activeStores=stores.filter(s=>s.active).length;
 const kpis=[{key:'confirm',label:'Orders confirmed within time limit',value:pct(alloc.filter(x=>x.o.confirmedOnTime).length,alloc.length),target:95,better:'high'},{key:'available',label:'Ordered items actually available',value:pct(items-missing,items),target:95,better:'high'},{key:'ontime',label:`Delivered within ${ops.lateMinutes} min of payment`,value:pct(within,delivered),target:90,better:'high'},{key:'problems',label:'Orders with a delivery problem',value:pct(problems,dispatched),target:3,better:'low'},{key:'basket',label:'Average basket (birr)',value:paidN?Math.round(basket/paidN)/100:null,target:null},{key:'perstore',label:'Orders per supermarket per day',value:activeStores?Math.round(alloc.length/activeStores/7*10)/10:null,target:null}];
 const free=await freeRiders(now);
 return json({now,settings:ops,orders:open,kpis,deliveryMoney:{fees,costs,byProvider},
  stores:stores.map(s=>{const st=stats.get(s.id);const mins=st?.confirmMinutes||[];return {id:s.id,name:s.name,active:!!s.active,phone:s.contact_phone,hours:s.open_time?s.open_time+'–'+s.close_time:null,radiusKm:s.radius_km,hasLocation:typeof s.lat==='number',score:st?.score??4,orders:st?.orders||0,onTime:pct(st?.onTime||0,st?.orders||0),accuracy:pct((st?.items||0)-(st?.missing||0),st?.items||0),avgConfirm:mins.length?Math.round(mins.reduce((a,b)=>a+b,0)/mins.length*10)/10:null,problems:st?.problems||0};}),
  riders:[...drivers.values()].filter((d:any)=>d.available).map((d:any)=>({name:d.name,group:d.grp,phone:d.phone,busy:!free.some(f=>f.id===d.id),locationAge:d.location_at?Math.round((now-d.location_at)/60000):null}))});}

export async function PATCH(r:Request){const a=await guard(r);if(a.error)return a.error;try{const b:any=await r.json(),db=database(),now=Date.now();
 if(b.action==='settings'){try{return json({ok:true,settings:await saveOpsSettings(b.settings||{})});}catch(e){return json({error:e instanceof Error?e.message:'Invalid settings'},400);}}
 for(let attempt=0;attempt<4;attempt++){const row=await db.prepare('SELECT payload FROM orders WHERE id=?').bind(String(b.id)).first<any>();if(!row)return json({error:'Order not found'},404);const o=JSON.parse(row.payload);let after:any=null;
  if(b.action==='move'){if(o.closed)return json({error:'Order is closed.'},409);if(['verified','review'].includes(o.sellerPayment?.status))return json({error:'The goods are already paid to the current supermarket. Ask that supermarket to fulfil it, or cancel and refund.'},409);const store=await db.prepare('SELECT id,name,lat,lng,chapa_subaccount,commission_bps FROM stores WHERE id=? AND active=1').bind(String(b.storeId)).first<any>();if(!store)return json({error:'Choose an active supermarket.'},400);if(!await moveToStore(o,store))return json({error:store.name+' does not have every item in stock.'},409);o.status=paymentState(o);}
  else if(b.action==='alertDone'){const i=Number(b.index);if(!o.alerts?.[i])return json({error:'Alert not found'},404);o.alerts[i]={...o.alerts[i],done:true,doneAt:now};}
  else if(b.action==='yango'){if(o.status!=='Payment verified'||o.closed)return json({error:'Only paid, open orders can be sent with Yango.'},409);const cost=Math.round(Number(b.costBirr)*100);if(!Number.isSafeInteger(cost)||cost<0||cost>10000000)return json({error:'Enter what Yango charged, in birr.'},400);const d=await db.prepare('SELECT state FROM deliveries WHERE order_id=?').bind(String(b.id)).first<any>();if(d&&d.state!=='problem')return json({error:'This order already has a rider. Mark a delivery problem first.'},409);
   after=async()=>{await db.prepare("INSERT INTO deliveries (order_id,driver_id,state,instructions,driver_note,updated_at,provider,cost_cents,assigned_by) VALUES (?,'yango','assigned',?,'',?,'yango',?,'owner') ON CONFLICT(order_id) DO UPDATE SET driver_id='yango',state='assigned',instructions=excluded.instructions,driver_note='',updated_at=excluded.updated_at,provider='yango',cost_cents=excluded.cost_cents,assigned_by='owner'").bind(String(b.id),String(b.ref||'Yango booking').slice(0,200),now,cost).run();};
   o.timeline={...(o.timeline||{}),assigned:now};for(const al of o.alerts||[])if(al.type==='no-rider'&&!al.done){al.done=true;al.doneAt=now;}}
  else if(b.action==='yangoState'){const d=await db.prepare('SELECT state,driver_id FROM deliveries WHERE order_id=?').bind(String(b.id)).first<any>();const next:any={assigned:'picked_up',picked_up:'delivered'};if(!d||d.driver_id!=='yango'||next[d.state]!==b.state)return json({error:'Invalid Yango update'},400);const key=b.state==='delivered'?'delivered':'pickedUp';o.timeline={...(o.timeline||{}),[key]:now};after=async()=>{await db.prepare('UPDATE deliveries SET state=?,updated_at=? WHERE order_id=?').bind(b.state,now,String(b.id)).run();};}
  else return json({error:'Invalid action'},400);
  const w=await db.prepare('UPDATE orders SET payload=? WHERE id=? AND payload=?').bind(JSON.stringify(o),String(b.id),row.payload).run();if(!w.meta.changes)continue;if(after)await after();if(b.action==='yangoState'||b.action==='move')await notifyOrder(String(b.id)).catch(()=>{});return json({ok:true});}
 return json({error:'Order changed. Refresh and try again.'},409);}catch{return json({error:'Update failed'},400);}}
