import { env } from "cloudflare:workers";
import { guard,json } from "../../../../lib/owner";
export const dynamic="force-dynamic";
export async function POST(request:Request){
 const auth=await guard(request);if(auth.error)return auth.error;
 const length=Number(request.headers.get('content-length'));if(length>6*1024*1024)return json({error:"Choose a photo smaller than 5 MB"},413);
 try{const form=await request.formData();const file=form.get('photo');if(!(file instanceof File)||!file.size||file.size>5*1024*1024)return json({error:"Choose a JPG, PNG or WebP photo smaller than 5 MB"},400);
 const bytes=new Uint8Array(await file.arrayBuffer());let extension='';let type='';
 if(bytes[0]===255&&bytes[1]===216&&bytes[2]===255){extension='jpg';type='image/jpeg';}
 else if(bytes[0]===137&&bytes[1]===80&&bytes[2]===78&&bytes[3]===71){extension='png';type='image/png';}
 else if(String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP'){extension='webp';type='image/webp';}
 else return json({error:"Only JPG, PNG and WebP photos are supported"},400);
 if(!env.BUCKET)return json({error:"Photo storage is unavailable"},503);
 const key=crypto.randomUUID()+'.'+extension;await env.BUCKET.put('products/'+key,bytes,{httpMetadata:{contentType:type}});return json({image:'/api/images/'+key});
 }catch{return json({error:"Photo upload failed. Try again."},400);}
}
