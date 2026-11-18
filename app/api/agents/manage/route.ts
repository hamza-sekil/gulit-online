import { json } from '../../../../lib/owner';
import { rateLimit } from '../../../../lib/orders';
import { database } from '../../../../lib/catalog';
import { postByToken, PEOPLE_STATUSES } from '../../../../lib/agents';
export const dynamic='force-dynamic';
// A business opens its private manage link: see its job's status and the agents who applied.
const ok=(r:Request)=>r.headers.get('origin')===new URL(r.url).origin;
export async function POST(r:Request){if(!ok(r))return json({error:'Invalid origin'},403);if(!await rateLimit(r,'agentmanage',300))return json({error:'Too many requests.'},429);const b:any=await r.json().catch(()=>({}));const d=await postByToken(String(b.token||''));if(!d)return json({error:'This link is not valid. Check that you copied the whole link.'},404);return json(d);}
export async function PATCH(r:Request){if(!ok(r))return json({error:'Invalid origin'},403);if(!await rateLimit(r,'agentmanage',300))return json({error:'Too many requests.'},429);const b:any=await r.json().catch(()=>({}));const d=await postByToken(String(b.token||''));if(!d)return json({error:'This link is not valid.'},404);const status=String(b.status||'');if(!PEOPLE_STATUSES.includes(status))return json({error:'Invalid status'},400);const res=await database().prepare('UPDATE agent_people SET status=? WHERE id=? AND post_id=?').bind(status,String(b.id||''),d.post.id).run();if(!res.meta.changes)return json({error:'Applicant not found'},404);return json({ok:true});}
