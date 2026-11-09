import { json } from '../../../../lib/owner';
import { database } from '../../../../lib/catalog';
import { storePrices } from '../../../../lib/routing';
import { isOpen } from '../../../../lib/settings';
export const dynamic='force-dynamic';
// "Compare & save": the shopper's bag priced at every partner supermarket (goods only; delivery depends on the map pin).
export async function POST(r:Request){
 if(r.headers.get('origin')!==new URL(r.url).origin)return json({error:'Invalid origin'},403);
 if(Number(r.headers.get('content-length'))>8000)return json({error:'Request too large'},413);
 try{
  const b:any=await r.json();const raw=Array.isArray(b.items)?b.items.slice(0,50):[];
  const items=raw.map((i:any)=>({id:Number(i.id),n:Number(i.n)})).filter((i:any)=>Number.isSafeInteger(i.id)&&Number.isSafeInteger(i.n)&&i.n>0&&i.n<=1000);
  if(!items.length)return json({stores:[]});
  const db=database(),ids=items.map((i:any)=>i.id);
  const stores=(await db.prepare('SELECT id,name,open_time,close_time FROM stores WHERE active=1').all()).results as any[];
  const stock=(await db.prepare(`SELECT store_id,product_id,quantity FROM store_stock WHERE product_id IN (${ids.map(()=>'?').join(',')})`).bind(...ids).all()).results as any[];
  const qty=new Map(stock.map(s=>[s.store_id+':'+s.product_id,s.quantity]));
  const prices=await storePrices(stores.map(s=>s.id),ids);
  const out=stores.map(s=>{let goods=0,missing=0;for(const i of items){const c=prices.get(s.id)?.get(i.id);if(typeof c!=='number'||(qty.get(s.id+':'+i.id)||0)<i.n){missing++;continue;}goods+=c*i.n;}return {id:s.id,name:s.name,goodsCents:goods,missing,complete:missing===0,open:isOpen(s)};}).filter(s=>s.missing<items.length);
  out.sort((a,b)=>Number(b.complete)-Number(a.complete)||a.missing-b.missing||a.goodsCents-b.goodsCents);
  return json({stores:out});
 }catch{return json({error:'Could not compare prices'},400);}
}
