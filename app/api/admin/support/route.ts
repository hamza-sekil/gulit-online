import { database } from '../../../../lib/catalog';
import { guard,json } from '../../../../lib/owner';
export const dynamic='force-dynamic';
export async function GET(r:Request){const a=await guard(r);if(a.error)return a.error;const result=await database().prepare("SELECT s.id,s.created_at,s.updated_at,(SELECT body FROM order_messages m WHERE m.order_id=s.id ORDER BY created_at DESC LIMIT 1) AS last_message,(SELECT sender FROM order_messages m WHERE m.order_id=s.id ORDER BY created_at DESC LIMIT 1) AS last_sender FROM support_threads s ORDER BY s.updated_at DESC LIMIT 200").all();return json({threads:result.results});}
