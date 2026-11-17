import { appsHtml } from '../../lib/apps-html';
export const dynamic='force-static';
export function GET(){return new Response(appsHtml,{headers:{'Content-Type':'text/html;charset=utf-8','Cache-Control':'public, max-age=3600','X-Content-Type-Options':'nosniff'}});}
