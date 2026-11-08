import {storeGuard,inventory,saveStock} from '../../../../lib/storekeeper';
import {json} from '../../../../lib/owner';
export const dynamic='force-dynamic';
export async function GET(r:Request){const a=await storeGuard(r);if(a.error)return a.error;return json({store:a.user,items:await inventory(a.user!.id)});}
export async function PATCH(r:Request){const a=await storeGuard(r);if(a.error)return a.error;try{return await saveStock(a.user!.id,await r.json(),'storekeeper:'+a.user!.username);}catch(e){return json({error:e instanceof Error?e.message:'Could not save stock'},400);}}
