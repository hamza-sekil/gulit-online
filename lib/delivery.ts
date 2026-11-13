import { database } from './catalog';

// Delivery fee by distance zone (store → customer), owner's price list from Nov 2026:
// up to 3 km 200 birr, 3–6 km 300, 6–9 km 400, 9–12 km 500, 12–15 km 600, then +100 birr for every further 3 km
// (15–18 km 700, 18–21 km 800 …), all before VAT. The last zone can carry that step (stepKm, stepFee).
// Fees and limits are editable by the owner (stored in the settings table as "delivery_zones").
// Distance = straight-line distance × ROAD_FACTOR, a simple estimate of road distance in Addis.
export type Zone = { upToKm: number | null; fee: number; stepKm?: number; stepFee?: number }; // fees in cents (santim)
export const DEFAULT_ZONES: Zone[] = [
  { upToKm: 3, fee: 20000 },
  { upToKm: 6, fee: 30000 },
  { upToKm: 9, fee: 40000 },
  { upToKm: 12, fee: 50000 },
  { upToKm: 15, fee: 60000 },
  { upToKm: null, fee: 70000, stepKm: 3, stepFee: 10000 },
];
export const ROAD_FACTOR = 1.3;
export const DEFAULT_ZONE_INDEX = 1; // used (as an estimate) when the distance is unknown
export type Point = { lat: number; lng: number };

/** Reads coordinates from a Google Maps link or plain "lat, lng" text. Only accepts points in Ethiopia. */
export function coordsFrom(text: unknown): Point | null {
  let s = String(text || '');
  try { s = decodeURIComponent(s); } catch {}
  const m = s.match(/(?:[?&](?:query|q|ll|center|destination)=|@|^\s*)(-?\d{1,2}\.\d{3,})\s*,\s*(-?\d{1,3}\.\d{3,})/);
  if (!m) return null;
  const lat = Number(m[1]), lng = Number(m[2]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < 3 || lat > 15 || lng < 33 || lng > 48.5) return null;
  return { lat: Math.round(lat * 1e6) / 1e6, lng: Math.round(lng * 1e6) / 1e6 };
}

export function straightKm(a: Point, b: Point) {
  const rad = (d: number) => d * Math.PI / 180, R = 6371;
  const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
export function roadKm(a: Point, b: Point) { return Math.round(straightKm(a, b) * ROAD_FACTOR * 10) / 10; }

export function validateZones(input: unknown): Zone[] {
  if (!Array.isArray(input) || input.length < 2 || input.length > 8) throw Error('Enter between 2 and 8 delivery zones.');
  let last = 0;
  return input.map((z: any, i: number) => {
    const fee = Math.round(Number(z?.fee));
    if (!Number.isSafeInteger(fee) || fee < 0 || fee > 10000000) throw Error('Each delivery fee must be between 0 and 100,000 birr.');
    const final = i === input.length - 1;
    if (final) {
      const hasStep = z?.stepKm !== undefined && z?.stepKm !== null && z?.stepKm !== '' && Number(z?.stepFee) > 0;
      if (!hasStep) return { upToKm: null, fee };
      const stepKm = Math.round(Number(z.stepKm) * 10) / 10, stepFee = Math.round(Number(z.stepFee));
      if (!Number.isFinite(stepKm) || stepKm < 0.5 || stepKm > 100) throw Error('The extra-distance step must be between 0.5 and 100 km.');
      if (!Number.isSafeInteger(stepFee) || stepFee > 10000000) throw Error('The extra fee per step must be between 0 and 100,000 birr.');
      return { upToKm: null, fee, stepKm, stepFee };
    }
    const up = Number(z?.upToKm);
    if (!Number.isFinite(up) || up <= last || up > 500) throw Error('Zone distances must go up in order (for example 3, 7, 12 km).');
    last = up;
    return { upToKm: Math.round(up * 10) / 10, fee };
  });
}

export async function zones(): Promise<Zone[]> {
  try {
    const row = await database().prepare("SELECT value FROM settings WHERE key='delivery_zones'").first<any>();
    if (row) return validateZones(JSON.parse(row.value));
  } catch {}
  return DEFAULT_ZONES;
}
export async function saveZones(input: unknown) {
  const list = validateZones(input);
  await database().prepare("INSERT INTO settings (key,value,updated_at) VALUES ('delivery_zones',?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at").bind(JSON.stringify(list), Date.now()).run();
  return list;
}

export function zoneLabel(list: Zone[], index: number) {
  const z = list[index], from = index === 0 ? 0 : list[index - 1].upToKm;
  const step = z.upToKm === null && z.stepKm && z.stepFee ? ` (+${z.stepFee / 100} birr every ${z.stepKm} km)` : '';
  return `Zone ${index + 1}: ` + (z.upToKm === null ? `over ${from} km${step}` : index === 0 ? `under ${z.upToKm} km` : `${from}–${z.upToKm} km`);
}

/** Picks the zone for a distance. Unknown distance → the default zone, marked as an estimate. */
export function pickZone(list: Zone[], km: number | null) {
  let index = DEFAULT_ZONE_INDEX;
  if (km !== null) { index = list.findIndex(z => z.upToKm === null || km < z.upToKm); if (index < 0) index = list.length - 1; }
  index = Math.min(index, list.length - 1);
  const z = list[index], from = index === 0 ? 0 : (list[index - 1].upToKm as number);
  if (km !== null && z.upToKm === null && z.stepKm && z.stepFee) {
    // beyond the last fixed zone: add the step fee for every further stepKm
    const band = Math.max(0, Math.floor((km - from) / z.stepKm)), lo = from + band * z.stepKm;
    return { zone: index + 1 + band, fee: z.fee + band * z.stepFee, km, estimated: false, label: `Zone ${index + 1 + band}: ${Math.round(lo * 10) / 10}–${Math.round((lo + z.stepKm) * 10) / 10} km` };
  }
  return { zone: index + 1, fee: z.fee, km, estimated: km === null, label: zoneLabel(list, index) };
}
