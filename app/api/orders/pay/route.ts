import { json } from '../../../../lib/owner';
import { getOrder,publicOrder,rateLimit } from '../../../../lib/orders';
import { startPayment,confirmOrderPayments } from '../../../../lib/payments';
export const dynamic='force-dynamic';
// Customer starts an online payment (action "start") or, after returning from Chapa, asks the server to re-check it (action "check").
export async function POST(r:Request){if(r.headers.get('origin')!==new URL(r.url).origin)return json({error:'Invalid origin'},403);if(Number(r.headers.get('content-length'))>4000)return json({error:'Request too large'},413);try{if(!await rateLimit(r))return json({error:'Too many requests. Try later.'},429);const b:any=await r.json(),order=await getOrder(String(b.id),String(b.token));if(!order)return json({error:'Order not found'},404);
 if(b.action==='start'){const party=String(b.party);if(!['seller','gulit'].includes(party))return json({error:'Choose a payment.'},400);const {checkoutUrl}=await startPayment(order,party as any,new URL(r.url).origin);return json({checkoutUrl});}
 if(b.action==='check'){await confirmOrderPayments(order.id);const fresh=await getOrder(String(b.id),String(b.token));return json({order:publicOrder(fresh)});}
 return json({error:'Invalid action'},400);
}catch(e){return json({error:e instanceof Error&&!/D1_|SQLITE|database|storage/i.test(e.message)?e.message:'Payment could not be started. Try again.'},400);}}
