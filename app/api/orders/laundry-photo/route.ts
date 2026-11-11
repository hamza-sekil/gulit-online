import { env } from 'cloudflare:workers';
import { json } from '../../../../lib/owner';
import { database } from '../../../../lib/catalog';
import { getOrder, publicOrder, rateLimit } from '../../../../lib/orders';
import { savePhoto, addCheck, canCheck, MAX_PHOTO } from '../../../../lib/laundry-checks';
export const dynamic = 'force-dynamic';
// Customer sends a photo of a stained or damaged piece to the laundry: form {id, token, photo, note, itemId}.
export async function POST(r: Request) {
  if (r.headers.get('origin') !== new URL(r.url).origin) return json({ error: 'Invalid origin' }, 403);
  if (Number(r.headers.get('content-length')) > MAX_PHOTO + 100000) return json({ error: 'Photo must be smaller than 6 MB' }, 413);
  try {
    if (!await rateLimit(r, 'laundry-photo', 60)) return json({ error: 'Too many photos. Try later.' }, 429);
    const f = await r.formData(), id = String(f.get('id')), token = String(f.get('token'));
    const first = await getOrder(id, token); if (!first) return json({ error: 'Order not found' }, 404);
    const err = canCheck(first); if (err) return json({ error: err }, 409);
    const photo = await savePhoto(f.get('photo')), db = database();
    for (let i = 0; i < 4; i++) {
      const row = await db.prepare('SELECT payload,created_at FROM orders WHERE id=?').bind(id).first<any>();
      const o = JSON.parse(row.payload);
      addCheck(o, { by: 'customer', ...photo, note: f.get('note'), itemId: f.get('itemId') });
      const w = await db.prepare('UPDATE orders SET payload=? WHERE id=? AND payload=?').bind(JSON.stringify(o), id, row.payload).run();
      if (w.meta.changes) return json({ order: publicOrder({ id, createdAt: row.created_at, ...o }) }, 201);
    }
    return json({ error: 'Order changed. Try again.' }, 409);
  } catch (e: any) { return json({ error: e?.message || 'Photo could not be sent.' }, 400); }
}
// Customer views one of their own photos: ?id&token&check
export async function GET(r: Request) {
  const u = new URL(r.url), o = await getOrder(String(u.searchParams.get('id')), String(u.searchParams.get('token')));
  const c = o?.laundryChecks?.find((x: any) => x.id === u.searchParams.get('check'));
  if (!c) return json({ error: 'Not found' }, 404);
  const obj = await (env as any).BUCKET?.get(c.key); if (!obj) return json({ error: 'Not found' }, 404);
  return new Response(obj.body, { headers: { 'Content-Type': c.type, 'Cache-Control': 'private, max-age=3600', 'X-Content-Type-Options': 'nosniff' } });
}
