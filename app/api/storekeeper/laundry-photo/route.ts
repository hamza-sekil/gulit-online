import { env } from 'cloudflare:workers';
import { json } from '../../../../lib/owner';
import { database } from '../../../../lib/catalog';
import { storeGuard } from '../../../../lib/storekeeper';
export const dynamic = 'force-dynamic';
// The laundry views a photo on one of its own orders: ?order&check
export async function GET(r: Request) {
  const a = await storeGuard(r); if (a.error) return a.error;
  const u = new URL(r.url), row = await database().prepare('SELECT payload FROM orders WHERE id=?').bind(String(u.searchParams.get('order'))).first<any>();
  const o = row ? JSON.parse(row.payload) : null;
  if (!o || o.allocation?.storeId !== a.user!.id) return json({ error: 'Not found' }, 404);
  const c = (o.laundryChecks || []).find((x: any) => x.id === u.searchParams.get('check'));
  const obj = c ? await (env as any).BUCKET?.get(c.key) : null; if (!obj) return json({ error: 'Not found' }, 404);
  return new Response(obj.body, { headers: { 'Content-Type': c.type, 'Cache-Control': 'private, max-age=3600', 'X-Content-Type-Options': 'nosniff' } });
}
