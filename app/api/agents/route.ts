import { json } from '../../../lib/owner';
import { rateLimit } from '../../../lib/orders';
import { opsSettings } from '../../../lib/settings';
import { REGIONS, CATEGORIES, MODELS, POST_DAYS, livePosts, validatePost, validatePerson, savePost, savePerson } from '../../../lib/agents';
export const dynamic='force-dynamic';
// Public: list open agent jobs; post a job (business); apply to a job or register as an agent.
export async function GET(){return json({posts:await livePosts(),regions:REGIONS,categories:CATEGORIES,models:MODELS,fee:(await opsSettings()).agentPostFee,days:POST_DAYS});}
export async function POST(r:Request){if(r.headers.get('origin')!==new URL(r.url).origin)return json({error:'Invalid origin'},403);if(Number(r.headers.get('content-length'))>10000)return json({error:'Request too large'},413);try{const b:any=await r.json();if(b.kind==='post'){if(!await rateLimit(r,'agentpost',20))return json({error:'Too many requests. Please try again later or call us.'},429);return json({ok:true,...await savePost(validatePost(b))},201);}if(b.kind==='apply'||b.kind==='agent'){if(!await rateLimit(r,'agentapply',60))return json({error:'Too many requests. Please try again later or call us.'},429);const postId=b.kind==='apply'?String(b.postId||'').slice(0,40):null;if(b.kind==='apply'&&!postId)return json({error:'Choose a job.'},400);return json({ok:true,reference:await savePerson(validatePerson(b),postId)},201);}return json({error:'Unknown request'},400);}catch(e){return json({error:e instanceof Error?e.message:'Could not send.'},400);}}
