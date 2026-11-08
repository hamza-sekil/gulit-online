import { storeGuard } from '../../../../lib/storekeeper';
import { json } from '../../../../lib/owner';
import { importStock,stockTemplate } from '../../../../lib/bulk';
export const dynamic='force-dynamic';
// Storekeeper: download this supermarket's stock list as CSV, edit quantities in Excel, upload it back.
export async function GET(r:Request){const a=await storeGuard(r);if(a.error)return a.error;return new Response(await stockTemplate(a.user!.id),{headers:{'Content-Type':'text/csv;charset=utf-8','Content-Disposition':`attachment; filename="gulit-stock-${a.user!.username}.csv"`,'Cache-Control':'no-store'}});}
export async function POST(r:Request){const a=await storeGuard(r);if(a.error)return a.error;if(Number(r.headers.get('content-length'))>2000000)return json({error:'File too large'},413);try{const b:any=await r.json();return json({ok:true,result:await importStock(String(b.csv||''),'storekeeper:'+a.user!.username,a.user!.id,false)});}catch(e){return json({error:e instanceof Error?e.message:'Import failed'},400);}}
