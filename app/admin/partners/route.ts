import { owner } from '../../../lib/owner';
import html from '../../../lib/admin-partners-html';
export const dynamic='force-dynamic';
export async function GET(){if(!await owner())return new Response(null,{status:303,headers:{Location:'/admin/login','Cache-Control':'no-store'}});return new Response(html,{headers:{'Content-Type':'text/html;charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"frame-ancestors 'self' https://chatgpt.com"}});}
