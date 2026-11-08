import { privacyHtml } from '../../lib/legal-html';
export const dynamic='force-static';
export function GET(){return new Response(privacyHtml,{headers:{'Content-Type':'text/html;charset=utf-8','Cache-Control':'public, max-age=3600','X-Content-Type-Options':'nosniff'}});}
