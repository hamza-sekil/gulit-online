import { storeGuard } from '../../../../lib/storekeeper';
import { json } from '../../../../lib/owner';
import { database } from '../../../../lib/catalog';
import { paymentState } from '../../../../lib/orders';
import { rebill } from '../../../../lib/routing';
import { sweepIfDue, findReplacement } from '../../../../lib/ops';
import { opsSettings } from '../../../../lib/settings';
import { notifyOrder } from '../../../../lib/order-push';
export const dynamic='force-dynamic';
// Orders routed to this supermarket. Flow: new → Confirm (within the time limit) → pick (mark items not available;
// the customer may be offered a replacement) → Packed – ready for pickup.
const closedDelivery=['picked_up','on_way','delivered'];
function view(id:string,createdAt:number,o:any){const paid=o.sellerPayment?.status==='verified'&&o.gulitPayment?.status==='verified';return {id,createdAt,customer:String(o.name||'').split(' ')[0],bags:o.packaging>0&&o.pack?Math.ceil(o.items.filter((i:any)=>!i.missing).reduce((s:number,i:any)=>s+i.n,0)/o.pack.perBag):0,items:o.items.map((i:any)=>({id:i.id,name:i.name,n:i.n,missing:!!i.missing,pending:i.offer?.status==='pending',offer:i.offer?{name:i.offer.name,n:i.offer.n,status:i.offer.status,expiresAt:i.offer.expiresAt}:null,substitute:!!i.substituteFor})),paid,state:o.storeState==='ready'?'ready':o.storeState==='new'?'new':'picking',confirmBy:o.storeState==='new'?o.confirmBy:null,status:o.status};}
async function performance(storeId:string){const ops=await opsSettings(),now=Date.now(),day=now-((now/60000+180)%1440)*60000,week=now-7*86400000;
 const rows=(await database().prepare('SELECT payload FROM orders WHERE created_at>? AND payload LIKE ?').bind(week,'%"storeId":"'+storeId+'"%').all()).results as any[];
 let today=0,weekPacked=0,onTime=0,correct=0,eligible=0;for(const r of rows){const o=JSON.parse(r.payload);if(o.allocation?.storeId!==storeId||!o.readyAt)continue;const ok=!!o.confirmedOnTime,clean=!o.items.some((i:any)=>i.missing&&i.missingStore===storeId);weekPacked++;if(o.readyAt>=day)today++;if(ok)onTime++;if(clean)correct++;if(ok&&clean)eligible++;}
 return {today,weekPacked,onTime,correct,bonusPerOrder:ops.storekeeperBonus,bonusWeek:eligible*ops.storekeeperBonus};}
export async function GET(r:Request){const a=await storeGuard(r);if(a.error)return a.error;const id=a.user!.id;if(!/^[0-9a-f-]{36}$/i.test(id))return json({orders:[]});try{await sweepIfDue();}catch{}
 const rows=(await database().prepare(`SELECT o.id,o.created_at,o.payload,d.state AS delivery FROM orders o LEFT JOIN deliveries d ON d.order_id=o.id WHERE o.payload LIKE ? ORDER BY o.created_at DESC LIMIT 100`).bind('%"storeId":"'+id+'"%').all()).results as any[];
 return json({now:Date.now(),performance:await performance(id),orders:rows.filter(r=>{const o=JSON.parse(r.payload);return o.allocation?.storeId===id&&!o.closed&&!closedDelivery.includes(r.delivery);}).map(r=>view(r.id,r.created_at,JSON.parse(r.payload)))});}
export async function PATCH(r:Request){const a=await storeGuard(r);if(a.error)return a.error;try{const b:any=await r.json(),db=database(),storeId=a.user!.id,now=Date.now();
 for(let attempt=0;attempt<4;attempt++){const row=await db.prepare('SELECT o.payload,d.state AS delivery FROM orders o LEFT JOIN deliveries d ON d.order_id=o.id WHERE o.id=?').bind(String(b.id)).first<any>();if(!row)return json({error:'Order not found'},404);const o=JSON.parse(row.payload);if(o.allocation?.storeId!==storeId)return json({error:'Order not found'},404);if(o.closed||closedDelivery.includes(row.delivery))return json({error:'This order can no longer be changed here.'},409);
  const confirm=()=>{if(!o.confirmedAt){o.confirmedAt=now;o.confirmedOnTime=typeof o.confirmBy!=='number'||now<=o.confirmBy;o.timeline={...(o.timeline||{}),confirmed:now};}if(o.storeState!=='ready')o.storeState='picking';};
  let after:any=null;
  if(b.action==='confirm'){if(o.storeState!=='new')return json({ok:true});confirm();}
  else if(b.action==='missing'){if(o.storeState==='ready')return json({error:'Order is already packed. Call Gulit customer care.'},409);const item=o.items.find((i:any)=>i.id===Number(b.productId)&&!i.substituteFor);if(!item||item.missing||item.offer?.status==='pending')return json({error:'Item not found'},404);confirm();
   const ops=await opsSettings(),offer=ops.offerMinutes>0?await findReplacement(o,item,storeId):null;item.missingStore=storeId;
   if(offer){item.offer={status:'pending',expiresAt:now+ops.offerMinutes*60000,...offer};item.missingPending=true;}
   else{if(o.items.filter((i:any)=>!i.missing).length<2)return json({error:'This is the last item and there is no replacement. Call Gulit customer care to cancel the order.'},409);item.missing=true;rebill(o,'item not available: '+item.name);}
   after=async()=>{await db.prepare("UPDATE store_stock SET quantity=0,revision=revision+1,updated_at=?,updated_by=? WHERE store_id=? AND product_id=?").bind(now,'storekeeper:'+a.user!.username,storeId,item.id).run();};}
  else if(b.action==='ready'){if(o.items.some((i:any)=>i.offer?.status==='pending'))return json({error:'Wait for the customer to answer the replacement offer.'},409);confirm();o.storeState='ready';o.readyAt=now;o.timeline={...(o.timeline||{}),packed:now};}
  else return json({error:'Invalid action'},400);
  o.status=paymentState(o);
  const res=await db.prepare('UPDATE orders SET payload=? WHERE id=? AND payload=?').bind(JSON.stringify(o),String(b.id),row.payload).run();if(!res.meta.changes)continue;if(after)await after();if(b.action==='confirm'||b.action==='ready'||(b.action==='missing'&&o.items.some((i:any)=>i.offer?.status==='pending')))await notifyOrder(String(b.id)).catch(()=>{});return json({ok:true});}
 return json({error:'Order changed. Refresh and try again.'},409);}catch{return json({error:'Could not update order'},400);}}
