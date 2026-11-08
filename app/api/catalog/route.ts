import { catalog } from "../../../lib/catalog";
import { owner,json } from "../../../lib/owner";
import { zones,zoneLabel } from "../../../lib/delivery";
import { photoSettings,applyPhotoPolicy } from "../../../lib/bulk";
export const dynamic="force-dynamic";
export async function GET(){try{const list=await zones();const photos=await photoSettings();return json({products:applyPhotoPolicy(await catalog(),photos.hideReference),isOwner:!!await owner(),deliveryZones:list.map((z,i)=>({fee:z.fee,label:zoneLabel(list,i)}))});}catch{return json({error:"The catalog could not be loaded. Please try again."},503);}}
