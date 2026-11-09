import { catalog,database } from "../../../lib/catalog";
import { opsSettings as getOps } from "../../../lib/settings";
import { owner,json } from "../../../lib/owner";
import { zones,zoneLabel } from "../../../lib/delivery";
import { photoSettings,applyPhotoPolicy } from "../../../lib/bulk";
async function packInfo(){const o=await getOps();return o.packBagPrice>0?{perBag:o.packItemsPerBag,bagPrice:o.packBagPrice}:null;}
export const dynamic="force-dynamic";
export async function GET(){try{const list=await zones();const photos=await photoSettings();const stores=((await database().prepare("SELECT s.id,s.name FROM stores s WHERE s.active=1 AND EXISTS (SELECT 1 FROM store_stock x WHERE x.store_id=s.id) ORDER BY s.name").all()).results as any[]);return json({stores,products:applyPhotoPolicy(await catalog(),photos.hideReference),isOwner:!!await owner(),packaging:await packInfo(),deliveryZones:list.map((z,i)=>({fee:z.fee,label:zoneLabel(list,i)}))});}catch{return json({error:"The catalog could not be loaded. Please try again."},503);}}
