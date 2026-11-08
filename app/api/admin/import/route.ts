import { guard,json } from '../../../../lib/owner';
import { priceTemplate,importPrices,importStock,stockTemplate,photoSettings,savePhotoSettings } from '../../../../lib/bulk';
import { catalog } from '../../../../lib/catalog';
export const dynamic='force-dynamic';
const csv=(body:string,name:string)=>new Response(body,{headers:{'Content-Type':'text/csv;charset=utf-8','Content-Disposition':`attachment; filename="${name}"`,'Cache-Control':'no-store'}});
export async function GET(r:Request){const a=await guard(r);if(a.error)return a.error;const u=new URL(r.url),t=u.searchParams.get('template');
 if(t==='prices')return csv(await priceTemplate(false),'gulit-prices.csv');if(t==='drafts')return csv(await priceTemplate(true),'gulit-products-needing-price.csv');if(t==='stock')return csv(await stockTemplate(null),'gulit-stock.csv');
 const all=await catalog(true,false),live=all.filter((p:any)=>!p.draft&&!p.archived);
 return json({counts:{total:all.length,live:live.length,needPrice:all.filter((p:any)=>p.draft&&!p.archived).length,referencePhotos:all.filter((p:any)=>p.photoKind==='reference'&&!p.archived).length,referenceLive:live.filter((p:any)=>p.photoKind==='reference').length},photos:await photoSettings()});}
export async function POST(r:Request){const a=await guard(r);if(a.error)return a.error;if(Number(r.headers.get('content-length'))>3000000)return json({error:'File too large (max 3 MB). Split it into smaller files.'},413);try{const b:any=await r.json(),by='owner-import';
 if(b.kind==='prices')return json({ok:true,result:await importPrices(String(b.csv||''),by)});
 if(b.kind==='stock')return json({ok:true,result:await importStock(String(b.csv||''),by,null,true)});
 if(b.kind==='photos'){await savePhotoSettings(b.hideReference===true);return json({ok:true});}
 return json({error:'Choose prices or stock.'},400);}catch(e){return json({error:e instanceof Error?e.message:'Import failed'},400);}}
