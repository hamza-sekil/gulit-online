import { guard, json } from '../../../../lib/owner';
import { visitStats } from '../../../../lib/visits';
export const dynamic = 'force-dynamic';
export async function GET(r: Request) { const a = await guard(r); if (a.error) return a.error; return json(await visitStats()); }
