import { database } from './catalog';

// Owner-adjustable operating rules (settings table, key "ops").
export type Ops = { confirmMinutes: number; offerMinutes: number; lateMinutes: number; riderWaitMinutes: number; storekeeperBonus: number; packItemsPerBag: number; packBagPrice: number };
export const DEFAULT_OPS: Ops = { confirmMinutes: 10, offerMinutes: 5, lateMinutes: 60, riderWaitMinutes: 5, storekeeperBonus: 0, packItemsPerBag: 10, packBagPrice: 15 };
const LIMITS: Record<keyof Ops, [number, number]> = { confirmMinutes: [2, 120], offerMinutes: [0, 60], lateMinutes: [15, 480], riderWaitMinutes: [1, 60], storekeeperBonus: [0, 1000000], packItemsPerBag: [1, 200], packBagPrice: [0, 10000] };

export function validateOps(input: any): Ops {
  const out: any = {};
  for (const key of Object.keys(DEFAULT_OPS) as (keyof Ops)[]) {
    const v = input?.[key] === undefined ? DEFAULT_OPS[key] : Number(input[key]);
    const [lo, hi] = LIMITS[key];
    if (!Number.isFinite(v) || v < lo || v > hi) throw Error(`${key} must be between ${lo} and ${hi}.`);
    out[key] = Math.round(v);
  }
  return out;
}
export async function opsSettings(): Promise<Ops> {
  try { const row = await database().prepare("SELECT value FROM settings WHERE key='ops'").first<any>(); if (row) return validateOps(JSON.parse(row.value)); } catch {}
  return { ...DEFAULT_OPS };
}
export async function saveOpsSettings(input: any) {
  const ops = validateOps({ ...(await opsSettings()), ...input });
  await database().prepare("INSERT INTO settings (key,value,updated_at) VALUES ('ops',?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at").bind(JSON.stringify(ops), Date.now()).run();
  return ops;
}

/** Addis Ababa local minutes since midnight (UTC+3, no daylight saving). */
export function addisMinutes(now = Date.now()) { return Math.floor((now / 60000 + 180) % 1440); }
export function parseHM(v: unknown) { const m = String(v || '').match(/^([01]?\d|2[0-3]):([0-5]\d)$/); return m ? Number(m[1]) * 60 + Number(m[2]) : null; }
/** A store with no hours set counts as open. Handles hours that pass midnight. */
export function isOpen(store: { open_time?: string | null; close_time?: string | null }, now = Date.now()) {
  const o = parseHM(store.open_time), c = parseHM(store.close_time);
  if (o === null || c === null || o === c) return true;
  const t = addisMinutes(now);
  return o < c ? t >= o && t < c : t >= o || t < c;
}
