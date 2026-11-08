import { env } from "cloudflare:workers";
export const dynamic="force-dynamic";
export async function GET(request:Request,{params}:{params:Promise<{key:string}>}){
 const {key}=await params;if(!/^[a-zA-Z0-9-]+\.(jpg|png|webp)$/.test(key)||!env.BUCKET)return new Response('Not found',{status:404});
 const file=await env.BUCKET.get('products/'+key);if(!file)return new Response('Not found',{status:404});
 return new Response(file.body,{headers:{'Content-Type':file.httpMetadata?.contentType||'application/octet-stream','Cache-Control':'public,max-age=86400','X-Content-Type-Options':'nosniff'}});
}
