import { catalog,database,validateProduct } from "../../../../lib/catalog";
import { guard,json } from "../../../../lib/owner";
export const dynamic="force-dynamic";
export async function GET(request:Request){const auth=await guard(request);if(auth.error)return auth.error;return json({products:await catalog(true)});}
export async function POST(request:Request){
 const auth=await guard(request);if(auth.error)return auth.error;
 try{
 const body=await request.json() as any;const previous=body.id===undefined?undefined:(await catalog(true,false)).find(p=>p.id===Number(body.id));const p=validateProduct({...previous,...body});const id=body.id===undefined?Date.now():Number(body.id);const revision=body.revision===undefined?0:Number(body.revision);
 if(!Number.isSafeInteger(id)||id<=0||!Number.isSafeInteger(revision)||revision<0)return json({error:"Invalid product version"},400);
 const current=(await catalog(true,false)).find(p=>p.id===id);
 if(current?.draft&&p.stock>0&&p.priceCents<=0)return json({error:"Enter the seller’s confirmed VAT-inclusive price before adding stock."},400);
 if(current&&current.revision!==revision)return json({error:"This product changed in another window. Refresh and try again."},409);
 if(!current&&body.id!==undefined)return json({error:"Product not found"},404);
 const result=await database().prepare(`INSERT INTO products (id,name,category,price_cents,stock,image,manufacturing_date,expiry_date,archived,revision,updated_by,updated_at) VALUES (?,?,?,?,?,?,?,?,0,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,category=excluded.category,price_cents=excluded.price_cents,stock=excluded.stock,image=excluded.image,manufacturing_date=excluded.manufacturing_date,expiry_date=excluded.expiry_date,archived=0,revision=excluded.revision,updated_by=excluded.updated_by,updated_at=excluded.updated_at WHERE products.revision=?`).bind(id,p.name,p.cat,p.priceCents,p.stock,p.image,p.manufacturingDate,p.expiryDate,revision+1,auth.user!.userId,new Date().toISOString(),revision).run();
 if(!result.meta.changes)return json({error:"This product changed in another window. Refresh and try again."},409);
 return json({ok:true,id,products:await catalog(true)});
 }catch(error){return json({error:error instanceof Error?error.message:"Could not save product"},400);}
}
export async function DELETE(request:Request){
 const auth=await guard(request);if(auth.error)return auth.error;
 try{const body=await request.json() as any;const id=Number(body.id);const revision=Number(body.revision);const p=(await catalog(true)).find(p=>p.id===id);
 if(!p)return json({error:"Product not found"},404);if(p.revision!==revision)return json({error:"This product changed. Refresh and try again."},409);
 const result=await database().prepare(`INSERT INTO products(id,name,category,price_cents,stock,image,archived,revision,updated_by,updated_at) VALUES(?,?,?,?,?,?,1,?,?,?) ON CONFLICT(id) DO UPDATE SET archived=1,revision=excluded.revision,updated_by=excluded.updated_by,updated_at=excluded.updated_at WHERE products.revision=?`).bind(p.id,p.name,p.cat,Math.round(p.price*100),p.stock,p.image,revision+1,auth.user!.userId,new Date().toISOString(),revision).run();
 if(!result.meta.changes)return json({error:"This product changed. Refresh and try again."},409);return json({ok:true,products:await catalog(true)});
 }catch{return json({error:"Could not archive product"},400);}
}
