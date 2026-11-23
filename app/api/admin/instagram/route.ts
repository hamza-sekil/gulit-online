import { guard,json } from '../../../../lib/owner';
import { igSettings,saveIG,tokenSet,queueForInstagram } from '../../../../lib/instagram';
import { tgSettings } from '../../../../lib/telegram';
import { POSTS } from '../../../../lib/telegram-posts';
export const dynamic='force-dynamic';
// Owner: Instagram auto-posting (same posts as the Telegram channel). The token itself is never sent to the browser.
const view=async()=>{const {s}=await igSettings();return {settings:{...s,queue:s.queue.length},tokenSet:await tokenSet()};};
export async function GET(r:Request){const a=await guard(r);if(a.error)return a.error;return json(await view());}
export async function POST(r:Request){const a=await guard(r);if(a.error)return a.error;try{const b:any=await r.json();
if(b.action==='post-next'){const {s}=await igSettings();if(!s.enabled||!s.userId)throw Error('Switch Instagram on and save first.');const {s:t}=await tgSettings();const n=POSTS.length;let p=null;for(let k=0;k<n;k++){const c=POSTS[(t.next+k)%n];if(c.photo||c.video){p=c;break}}if(!p)throw Error('No post with a photo or video.');await queueForInstagram(p);}
else await saveIG(b);return json(await view());}catch(e){return json({error:e instanceof Error?e.message:'Could not save'},400);}}
