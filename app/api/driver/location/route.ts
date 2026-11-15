import { json } from '../../../../lib/owner';
import { driverGuard } from '../../../../lib/driver';
import { saveRiderLocation } from '../../../../lib/tracking';
export const dynamic = 'force-dynamic';
// Rider's phone sends its position during an active delivery: {id, lat, lng}. Only for the rider's own picked-up / on-the-way delivery.
export async function POST(r: Request) {
  const a = await driverGuard(r); if (a.error) return a.error;
  try {
    const b: any = await r.json();
    const ok = await saveRiderLocation(String(b.id || ''), a.user.id, Number(b.lat), Number(b.lng));
    return ok ? json({ ok: true }) : json({ error: 'Location is shared only while you are delivering this order.' }, 409);
  } catch (e: any) { return json({ error: e?.message || 'Could not save location' }, 400); }
}
