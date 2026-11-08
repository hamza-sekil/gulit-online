import { json } from '../../../../lib/owner';
import { confirmPayment } from '../../../../lib/payments';
export const dynamic='force-dynamic';
// Chapa calls this after a payment: GET callback (?trx_ref=…) and, if enabled in the Chapa dashboard, a POST webhook.
// Nothing in the request is trusted: confirmPayment() asks Chapa's verify endpoint for the real state and amount.
function ref(v:unknown){return String(v||'').slice(0,80);}
export async function GET(r:Request){const u=new URL(r.url);const result=await confirmPayment(ref(u.searchParams.get('trx_ref')||u.searchParams.get('tx_ref')));return json({ok:true,status:result.status});}
export async function POST(r:Request){if(Number(r.headers.get('content-length'))>20000)return json({error:'Request too large'},413);let b:any={};try{b=await r.json();}catch{}const result=await confirmPayment(ref(b?.tx_ref||b?.trx_ref||b?.data?.tx_ref));return json({ok:true,status:result.status});}
