import { json } from '../../../lib/owner';
import { rateLimit } from '../../../lib/orders';
import { validateApplication,saveApplication } from '../../../lib/partners';
export const dynamic='force-dynamic';
// Public: a supermarket applies to partner with Gulit.
export async function POST(r:Request){if(r.headers.get('origin')!==new URL(r.url).origin)return json({error:'Invalid origin'},403);if(Number(r.headers.get('content-length'))>10000)return json({error:'Request too large'},413);try{if(!await rateLimit(r,'partners',300))return json({error:'Too many requests. Please try again later or call us.'},429);const a=validateApplication(await r.json());return json({ok:true,reference:await saveApplication(a)},201);}catch(e){return json({error:e instanceof Error?e.message:'Could not send the application.'},400);}}
