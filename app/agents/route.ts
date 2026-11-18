import { agentsHtml } from '../../lib/agents-html';
export const dynamic='force-static';
export function GET(){return new Response(agentsHtml,{headers:{'Content-Type':'text/html;charset=utf-8','Cache-Control':'public, max-age=600','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'}});}
