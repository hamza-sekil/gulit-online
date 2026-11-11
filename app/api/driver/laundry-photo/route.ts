import { json } from '../../../../lib/owner';
import { database } from '../../../../lib/catalog';
import { driverGuard } from '../../../../lib/driver';
import { savePhoto, addCheck, canCheck, MAX_PHOTO } from '../../../../lib/laundry-checks';
export const dynamic = 'force-dynamic';
// Rider sends a photo of a problem piece at pickup: form {id, photo, note, itemId}. Only for the rider's own delivery.
export async function POST(r: Request) {
  const a = await driverGuard(r); if (a.error) return a.error;
  if (Number(r.headers.get('content-length')) > MAX_PHOTO + 100000) return json({ error: 'Photo must be smaller than 6 MB' }, 413);
  try {
    const f = await r.formData(), id = String(f.get('id')), db = database();
    const d = await db.prepare('SELECT state FROM deliveries WHERE order_id=? AND driver_id=?').bind(id, a.user.id).first<any>();
    if (!d) return json({ error: 'Delivery not found' }, 404);
    if (d.state === 'delivered') return json({ error: 'This delivery is finished.' }, 409);
    const first = await db.prepare('SELECT payload FROM orders WHERE id=?').bind(id).first<any>();
    const err = canCheck(JSON.parse(first.payload)); if (err) return json({ error: err }, 409);
    const photo = await savePhoto(f.get('photo'));
    for (let i = 0; i < 4; i++) {
      const row = await db.prepare('SELECT payload FROM orders WHERE id=?').bind(id).first<any>();
      const o = JSON.parse(row.payload);
      addCheck(o, { by: 'rider', ...photo, note: f.get('note'), itemId: f.get('itemId') });
      const w = await db.prepare('UPDATE orders SET payload=? WHERE id=? AND payload=?').bind(JSON.stringify(o), id, row.payload).run();
      if (w.meta.changes) return json({ ok: true }, 201);
    }
    return json({ error: 'Order changed. Try again.' }, 409);
  } catch (e: any) { return json({ error: e?.message || 'Photo could not be sent.' }, 400); }
}
