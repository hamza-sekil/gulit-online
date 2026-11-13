import { database } from './catalog';
import { opsSettings, type Ops } from './settings';
// Monthly driver bonus (owner rule, Nov 2026): a rider who completes the target number of deliveries in a calendar
// month (Addis time, default 200) earns a fixed bonus, plus an extra amount for every delivery above the target.
// Amounts are in cents and editable in Admin → Live → Operating rules. Yango couriers are not counted.
const ADDIS = 3 * 3600_000;
export function monthRange(now = Date.now(), back = 0) {
  const d = new Date(now + ADDIS), y = d.getUTCFullYear(), m = d.getUTCMonth() - back;
  const start = Date.UTC(y, m, 1) - ADDIS, end = Date.UTC(y, m + 1, 1) - ADDIS;
  return { start, end, label: new Date(start + ADDIS).toISOString().slice(0, 7) };
}
export function bonusFor(delivered: number, ops: Pick<Ops, 'driverBonusTarget' | 'driverBonusFixed' | 'driverBonusPerExtra'>) {
  if (delivered < ops.driverBonusTarget) return 0;
  return ops.driverBonusFixed + (delivered - ops.driverBonusTarget) * ops.driverBonusPerExtra;
}
export async function monthCounts(now = Date.now(), back = 0) {
  const r = monthRange(now, back);
  const rows = (await database().prepare("SELECT driver_id, COUNT(*) n FROM deliveries WHERE state='delivered' AND driver_id!='yango' AND updated_at>=? AND updated_at<? GROUP BY driver_id").bind(r.start, r.end).all()).results as any[];
  return { ...r, counts: new Map(rows.map(x => [x.driver_id, Number(x.n)])) };
}
/** One driver's progress this month, for the rider app. */
export async function driverBonus(driverId: string, now = Date.now()) {
  const ops = await opsSettings(), m = await monthCounts(now), delivered = m.counts.get(driverId) || 0;
  return { month: m.label, delivered, target: ops.driverBonusTarget, fixed: ops.driverBonusFixed, perExtra: ops.driverBonusPerExtra, earned: bonusFor(delivered, ops), toGo: Math.max(0, ops.driverBonusTarget - delivered) };
}
/** All drivers, this month and last month, for the owner. */
export async function bonusBoard(now = Date.now()) {
  const ops = await opsSettings(), cur = await monthCounts(now), prev = await monthCounts(now, 1);
  const drivers = (await database().prepare('SELECT id,name FROM drivers ORDER BY name').all()).results as any[];
  const row = (m: any) => drivers.map(d => { const n = m.counts.get(d.id) || 0; return { id: d.id, name: d.name, delivered: n, bonus: bonusFor(n, ops) }; }).filter(x => x.delivered > 0).sort((a, b) => b.delivered - a.delivered);
  return { target: ops.driverBonusTarget, fixed: ops.driverBonusFixed, perExtra: ops.driverBonusPerExtra, thisMonth: { month: cur.label, drivers: row(cur) }, lastMonth: { month: prev.label, drivers: row(prev) } };
}
