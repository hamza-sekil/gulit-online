// Live rider location while a delivery is picked up / on the way.
// Riders' phones send their position about every 20 seconds; customers see it only for their own order,
// only during the trip, and the position is cleared when the delivery is finished.
import { database } from './catalog';
import { roadKm, type Point } from './delivery';

export const TRACK_STATES = ['picked_up', 'on_way'];
export const STALE_MS = 10 * 60 * 1000;
const CITY_KMH = 18; // average e-bike / motorbike speed in Addis traffic

export const inEthiopia = (lat: number, lng: number) => Number.isFinite(lat) && Number.isFinite(lng) && lat >= 3 && lat <= 15 && lng >= 33 && lng <= 48.5;
export const etaMinutes = (km: number) => Math.max(2, Math.round((km / CITY_KMH) * 60));

export async function saveRiderLocation(orderId: string, driverId: string, lat: number, lng: number, now = Date.now()) {
  if (!inEthiopia(lat, lng)) throw Error('Location is outside Ethiopia or invalid.');
  const la = Math.round(lat * 1e6) / 1e6, ln = Math.round(lng * 1e6) / 1e6, db = database();
  const w = await db.prepare(`UPDATE deliveries SET rider_lat=?,rider_lng=?,rider_loc_at=? WHERE order_id=? AND driver_id=? AND state IN ('picked_up','on_way')`).bind(la, ln, now, orderId, driverId).run();
  if (!w.meta.changes) return false;
  await db.prepare('UPDATE drivers SET lat=?,lng=?,location_at=? WHERE id=?').bind(la, ln, now, driverId).run();
  return true;
}

export async function clearRiderLocation(orderId: string) {
  await database().prepare('UPDATE deliveries SET rider_lat=NULL,rider_lng=NULL,rider_loc_at=NULL WHERE order_id=?').bind(orderId).run();
}

export async function trackingFor(orderId: string, to: Point | null, now = Date.now()) {
  const row = await database().prepare('SELECT state,rider_lat,rider_lng,rider_loc_at FROM deliveries WHERE order_id=?').bind(orderId).first<any>();
  if (!row || !TRACK_STATES.includes(row.state) || row.rider_lat == null || row.rider_lng == null || !row.rider_loc_at || now - row.rider_loc_at > STALE_MS) return null;
  const at = { lat: row.rider_lat, lng: row.rider_lng };
  const km = to ? roadKm(at, to) : null;
  return { ...at, at: row.rider_loc_at, km, minutes: km === null ? null : etaMinutes(km) };
}
