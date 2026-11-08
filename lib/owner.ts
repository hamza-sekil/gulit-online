import { env } from "cloudflare:workers";
import { getChatGPTUser } from "../app/chatgpt-auth";
import { passwordOwner } from "./password-auth";
import { onChatGPTSites } from "./hosting";
export async function chatOwner(){
 if(!onChatGPTSites())return null;
 const user=await getChatGPTUser();if(!user)return null;
 const email=(env as any).OWNER_EMAIL;
 if(!email||user.email.toLowerCase()!==String(email).toLowerCase())return null;
 return user;
}
export async function owner(){return await passwordOwner() || await chatOwner();}
export async function guard(request:Request){
 const user=await owner();if(!user)return {error:Response.json({error:"Sign in to your owner account."},{status:403})};
 if(request.method!=='GET'){
 const origin=request.headers.get('origin');if(!origin||origin!==new URL(request.url).origin)return {error:Response.json({error:"This request must come from this website."},{status:403})};
 }
 return {user};
}
export function json(data:any,status=200){return Response.json(data,{status,headers:{'Cache-Control':'no-store'}});}
