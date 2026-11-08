import { json } from '../../../../lib/owner';
import { database } from '../../../../lib/catalog';
import { getOrder,publicOrder,rateLimit } from '../../../../lib/orders';
import { resolveOffer } from '../../../../lib/ops';
import { giveBack } from '../../../../lib/routing';
export const dynamic='force-dynamic';
// Customer answers a replacement offer: {id, token, itemId, accept}.
export async function POST(r:Request){if(r.headers.get('origin')!==new URL(r.url).origin)return json({error:'Invalid origin'},403);if(Number(r.headers.get('content-length'))>2000)return json({error:'Request too large'},413);try{if(!await rateLimit(r))return json({error:'Too many requests. Try later.'},429);const b:any=await r.json(),db=database();
 for(let attempt=0;attempt<4;attempt++){const order=await getOrder(String(b.id),String(b.token));if(!order)return json({error:'Order not found'},404);const {id,createdAt,...o}=order;const before=(await db.prepare('SELECT payload FROM orders WHERE id=?').bind(id).first<any>()).payload;
  const item=o.items.find((i:any)=>i.id===Number(b.itemId));if(!item?.offer||item.offer.status!=='pending')return json({error:'This offer has already been answered or has expired.'},409);
  const res=await resolveOffer(o,item.id,b.accept===true);
  const saved=await db.prepare('UPDATE orders SET payload=? WHERE id=? AND payload=?').bind(JSON.stringify(o),id,before).run();
  if(!saved.meta.changes){if(res.reserved)await giveBack(res.reserved.storeId,[{id:res.reserved.id,n:res.reserved.n}]);continue;}
  return json({order:publicOrder({id,createdAt,...o})});}
 return json({error:'Order changed. Try again.'},409);}catch{return json({error:'Could not save your answer.'},400);}}
