import { database } from './catalog';

// Store performance over the last 7 days, from order records. Used for the store score (0–5),
// which decides who gets orders first when two supermarkets are about as close.
export type StoreStat = { storeId: string; orders: number; confirmed: number; onTime: number; confirmMinutes: number[]; items: number; missing: number; problems: number; score: number };

export async function recentOrders(days = 7, now = Date.now()) {
  const rows = (await database().prepare('SELECT o.id,o.created_at,o.payload,d.state AS delivery_state,d.provider,d.cost_cents FROM orders o LEFT JOIN deliveries d ON d.order_id=o.id WHERE o.created_at>? ORDER BY o.created_at DESC LIMIT 2000').bind(now - days * 86400000).all()).results as any[];
  return rows.map(r => ({ id: r.id, createdAt: r.created_at, delivery: r.delivery_state as string | null, provider: r.provider as string | null, costCents: r.cost_cents as number | null, o: JSON.parse(r.payload) }));
}

export function storeStats(orders: Awaited<ReturnType<typeof recentOrders>>) {
  const map = new Map<string, StoreStat>();
  const get = (id: string) => { if (!map.has(id)) map.set(id, { storeId: id, orders: 0, confirmed: 0, onTime: 0, confirmMinutes: [], items: 0, missing: 0, problems: 0, score: 4 }); return map.get(id)!; };
  for (const { o } of orders) {
    for (const miss of o.missedConfirm || []) { const s = get(miss.storeId); s.orders++; }
    const id = o.allocation?.storeId; if (!id) continue;
    const s = get(id); s.orders++;
    if (o.confirmedAt) { s.confirmed++; if (o.confirmedOnTime) s.onTime++; if (o.allocation?.at) s.confirmMinutes.push((o.confirmedAt - o.allocation.at) / 60000); }
    for (const i of o.items || []) { if (i.substituteFor) continue; s.items++; if (i.missing && (!i.missingStore || i.missingStore === id)) s.missing++; }
    if (o.timeline?.problem) s.problems++;
  }
  for (const s of map.values()) {
    if (s.orders < 3) { s.score = 4; continue; }
    const confirmRate = s.onTime / s.orders, accuracy = s.items ? 1 - s.missing / s.items : 1, problemRate = s.problems / s.orders;
    s.score = Math.round(5 * (0.4 * confirmRate + 0.4 * accuracy + 0.2 * (1 - problemRate)) * 10) / 10;
  }
  return map;
}

export async function storeScores() { return storeStats(await recentOrders()); }
