import { database } from '../../../../lib/catalog';
import { driverGuard } from '../../../../lib/driver';
import { json } from '../../../../lib/owner';
export const dynamic='force-dynamic';
// Rider goes online/offline for automatic dispatch and (optionally) shares the current position once.
export async function PATCH(r:Request){const a=await driverGuard(r);if(a.error)return a.error;try{const b:any=await r.json(),db=database();const available=b.available===true?1:0;
 const lat=Number(b.lat),lng=Number(b.lng),has=Number.isFinite(lat)&&Number.isFinite(lng)&&lat>=3&&lat<=15&&lng>=33&&lng<=48.5;
 if(b.lat!==undefined&&!has)return json({error:'Location is outside Ethiopia or invalid.'},400);
 if(has)await db.prepare('UPDATE drivers SET available=?,lat=?,lng=?,location_at=? WHERE id=?').bind(available,Math.round(lat*1e6)/1e6,Math.round(lng*1e6)/1e6,Date.now(),a.user.id).run();
 else await db.prepare('UPDATE drivers SET available=? WHERE id=?').bind(available,a.user.id).run();
 if(!available)await db.prepare('UPDATE drivers SET lat=NULL,lng=NULL,location_at=NULL WHERE id=?').bind(a.user.id).run();
 return json({ok:true,available:!!available});}catch{return json({error:'Could not update status'},400);}}
