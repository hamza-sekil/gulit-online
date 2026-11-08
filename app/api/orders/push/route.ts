import { json } from '../../../../lib/owner';
import { getOrder,rateLimit } from '../../../../lib/orders';
import { pushConfig } from '../../../../lib/engineer-push';
import { subscribeOrder,unsubscribeOrder } from '../../../../lib/order-push';
export const dynamic='force-dynamic';
export async function GET(){const c=pushConfig();return json({publicKey:c.publicKey&&c.privateJwk?c.publicKey:''});}
export async function POST(r:Request){if(r.headers.get('origin')!==new URL(r.url).origin)return json({error:'Invalid origin'},403);if(Number(r.headers.get('content-length'))>6000)return json({error:'Request too large'},413);try{if(!await rateLimit(r))return json({error:'Too many requests. Try later.'},429);const b:any=await r.json(),order=await getOrder(String(b.id),String(b.token));if(!order)return json({error:'Order not found'},404);
 if(b.action==='unsubscribe'){await unsubscribeOrder(order.id,b.endpoint);return json({ok:true});}
 await subscribeOrder(order.id,b.endpoint);return json({ok:true});}catch(e){return json({error:e instanceof Error&&/push/i.test(e.message)?e.message:'Could not turn on notifications.'},400);}}
