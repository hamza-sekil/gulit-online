import { env } from 'cloudflare:workers';
import { guard,json } from '../../../../lib/owner';
import { tgSettings,saveTG,postNextNow } from '../../../../lib/telegram';
import { POSTS } from '../../../../lib/telegram-posts';
export const dynamic='force-dynamic';
// Owner: Telegram channel auto-posting settings and "post now".
const view=async()=>{const {s}=await tgSettings();return {settings:s,tokenSet:!!(env as any).TELEGRAM_BOT_TOKEN,posts:POSTS,nextIndex:s.next%Math.max(1,POSTS.length)};};
export async function GET(r:Request){const a=await guard(r);if(a.error)return a.error;return json(await view());}
export async function POST(r:Request){const a=await guard(r);if(a.error)return a.error;try{const b:any=await r.json();if(b.action==='post-now')await postNextNow();else await saveTG(b);return json(await view());}catch(e){return json({error:e instanceof Error?e.message:'Could not save'},400);}}
