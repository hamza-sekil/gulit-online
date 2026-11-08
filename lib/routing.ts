import { database } from './catalog';
import { totals, paymentState } from './orders';
import { zones, pickZone, roadKm, type Point } from './delivery';
import { opsSettings, isOpen } from './settings';
import { storeScores } from './stats';

// Order routing (phase 1 rules from the development plan):
//  - one order, one supermarket: the nearest active supermarket that has every item in stock;
//  - the items are held (deducted from that supermarket's stock) as soon as the order is placed;
//  - the delivery fee comes from the distance zone between that supermarket and the customer's pin;
//  - holds are released when the owner cancels the order, or after 24 hours if nothing was paid.
export const HOLD_MS = 24 * 3600 * 1000;

type StoreRow = { id: string; name: string; lat: number | null; lng: number | null; chapa_subaccount: string | null; commission_bps: number; open_time?: string | null; close_time?: string | null; radius_km?: number | null };

async function storesWithAll(items: any[]): Promise<StoreRow[] | null> {
  const db = database(), ids = items.map(i => i.id);
  const rows = (await db.prepare(`SELECT x.store_id,x.product_id,x.quantity,s.name,s.lat,s.lng,s.chapa_subaccount,s.commission_bps,s.open_time,s.close_time,s.radius_km FROM store_stock x JOIN stores s ON s.id=x.store_id WHERE s.active=1 AND x.product_id IN (${ids.map(() => '?').join(',')})`).bind(...ids).all()).results as any[];
  // Products sold from the base catalogue (no supermarket stock rows) can't be routed automatically.
  const managed = new Set(rows.map(r => r.product_id));
  if (ids.some(id => !managed.has(id))) return null;
  const byStore = new Map<string, { store: StoreRow; stock: Map<number, number> }>();
  for (const r of rows) {
    if (!byStore.has(r.store_id)) byStore.set(r.store_id, { store: { id: r.store_id, name: r.name, lat: r.lat, lng: r.lng, chapa_subaccount: r.chapa_subaccount, commission_bps: r.commission_bps, open_time: r.open_time, close_time: r.close_time, radius_km: r.radius_km }, stock: new Map() });
    byStore.get(r.store_id)!.stock.set(r.product_id, r.quantity);
  }
  return [...byStore.values()].filter(s => items.every(i => (s.stock.get(i.id) || 0) >= i.n)).map(s => s.store);
}

function point(s: { lat: number | null; lng: number | null }): Point | null {
  return typeof s.lat === 'number' && typeof s.lng === 'number' ? { lat: s.lat, lng: s.lng } : null;
}

/** Deducts every item from one supermarket's stock, or nothing at all. */
export async function reserveAt(storeId: string, items: any[]) {
  const db = database(), done: any[] = [], now = Date.now();
  for (const i of items) {
    const r = await db.prepare('UPDATE store_stock SET quantity=quantity-?,revision=revision+1,updated_at=? WHERE store_id=? AND product_id=? AND quantity>=?').bind(i.n, now, storeId, i.id, i.n).run();
    if (!r.meta.changes) { await giveBack(storeId, done); return false; }
    done.push(i);
  }
  return true;
}
export async function giveBack(storeId: string, items: any[]) {
  const db = database(), now = Date.now();
  for (const i of items) await db.prepare('UPDATE store_stock SET quantity=quantity+?,revision=revision+1,updated_at=? WHERE store_id=? AND product_id=?').bind(i.n, now, storeId, i.id).run();
}

/** Applies a supermarket to the order: seller name, and the Chapa payout when the store has one. */
export function linkStore(o: any, store: StoreRow) {
  o.sellerName = store.name;
  const pay = { ...o.sellerPayment, storeId: store.id };
  if (store.chapa_subaccount) Object.assign(pay, { detailsReady: true, subaccount: store.chapa_subaccount, commissionBps: store.commission_bps });
  else { delete pay.subaccount; delete pay.commissionBps; }
  o.sellerPayment = pay;
}

/** Sets the delivery zone and fee, and recalculates both bills. */
export async function priceDelivery(o: any, store: { lat: number | null; lng: number | null } | null) {
  if (!o.inAddis) return;
  const from = store ? point(store) : null, to = o.customerLocation || null;
  const z = pickZone(await zones(), from && to ? roadKm(from, to) : null);
  o.deliveryZone = { zone: z.zone, km: z.km, estimated: z.estimated, label: z.label };
  Object.assign(o, totals(o.sellerTotal, z.fee));
  o.status = paymentState(o);
}

/** Supermarkets that can take these items now: every item in stock, open, customer inside the delivery radius.
 *  Sorted nearest first (1 km steps); among equally near stores, the higher store score goes first. */
export async function eligibleStores(items: any[], to: Point | null, exclude: string[] = [], now = Date.now()) {
  const all = await storesWithAll(items);
  if (!all) return null;
  const list = all.filter(s => !exclude.includes(s.id) && isOpen(s, now) && !(to && point(s) && typeof s.radius_km === 'number' && s.radius_km > 0 && roadKm(point(s)!, to) > s.radius_km));
  const scores = list.length > 1 ? await storeScores() : new Map();
  const score = (s: StoreRow) => scores.get(s.id)?.score ?? 4;
  const dist = (s: StoreRow) => { const p = point(s); return to && p ? Math.ceil(roadKm(p, to)) : p ? 500 : 1000; };
  return list.sort((a, b) => dist(a) - dist(b) || score(b) - score(a) || a.name.localeCompare(b.name));
}

/** Starts the supermarket confirmation clock for the currently allocated store. */
export async function startConfirmClock(o: any, now = Date.now()) {
  const ops = await opsSettings();
  o.storeState = 'new'; delete o.confirmedAt; delete o.confirmedOnTime;
  o.confirmBy = now + ops.confirmMinutes * 60000;
}

/** Chooses a supermarket, holds the stock, links the payout and prices delivery. Called once when an order is placed. */
export async function routeNewOrder(o: any, now = Date.now()) {
  o.timeline = { ...(o.timeline || {}), placed: now };
  const to: Point | null = o.customerLocation || null;
  const candidates = await eligibleStores(o.items, to, [], now);
  for (const store of candidates || []) {
    if (await reserveAt(store.id, o.items)) {
      o.allocation = { storeId: store.id, storeName: store.name, reserved: true, at: now };
      linkStore(o, store);
      await priceDelivery(o, store);
      await startConfirmClock(o, now);
      return o;
    }
  }
  await priceDelivery(o, null);
  return o;
}

/** Recalculates both bills after items change (missing or replaced) and records refunds for paid bills that went down. */
export function rebill(o: any, reason: string) {
  const oldSeller = o.sellerTotal, oldGulit = o.gulitTotal;
  const seller = o.items.filter((i: any) => !i.missing).reduce((s: number, i: any) => s + i.price * i.n, 0);
  Object.assign(o, totals(seller, o.delivery));
  if (o.sellerPayment?.status === 'verified') addRefund(o, 'seller', oldSeller - o.sellerTotal, reason);
  if (o.gulitPayment?.status === 'verified' && oldGulit !== null && o.gulitTotal !== null) addRefund(o, 'gulit', oldGulit - o.gulitTotal, 'service charge on ' + reason);
  if (!o.items.some((i: any) => !i.missing)) {
    // Nothing left to deliver: close the order and refund everything that was paid.
    for (const party of ['seller', 'gulit']) { const pay = o[party + 'Payment']; if (pay?.status === 'verified') { const paid = pay.paidCents ?? (party === 'seller' ? oldSeller : oldGulit); const already = (o.refundsDue || []).filter((r: any) => r.party === party).reduce((t: number, r: any) => t + r.amountCents, 0); addRefund(o, party, paid - already, 'no items available'); } }
    o.closed = 'Cancelled';
    if (o.allocation) o.allocation = { ...o.allocation, reserved: false, releasedAt: Date.now() };
  }
  o.status = paymentState(o);
}

/** Gives held stock back to the supermarket (once). */
export async function releaseHold(o: any) {
  if (!o.allocation?.reserved) return;
  const remaining = o.items.filter((i: any) => !i.missing);
  await giveBack(o.allocation.storeId, remaining);
  o.allocation = { ...o.allocation, reserved: false, releasedAt: Date.now() };
}

/** Moves an order to another supermarket chosen by the owner, moving the stock hold with it. */
export async function moveToStore(o: any, store: StoreRow) {
  const items = o.items.filter((i: any) => !i.missing);
  if (o.allocation?.storeId === store.id) { linkStore(o, store); return true; }
  if (!await reserveAt(store.id, items)) return false;
  if (o.allocation?.reserved) await giveBack(o.allocation.storeId, items);
  o.allocation = { storeId: store.id, storeName: store.name, reserved: true, at: Date.now() };
  linkStore(o, store);
  await startConfirmClock(o);
  const gulit = o.gulitPayment?.status;
  if (o.inAddis && !['verified', 'review'].includes(gulit)) await priceDelivery(o, store);
  return true;
}

/** Records money to give back when a paid bill went down (missing items, cancellation, overpayment). */
export function addRefund(o: any, party: string, cents: number, reason: string) {
  if (!(cents > 0)) return;
  o.refundsDue = [...(o.refundsDue || []), { party, amountCents: cents, reason, at: Date.now(), done: false }];
}

/** Releases holds on orders older than 24 hours where nothing has been paid or sent for review. */
export async function expireStale(now = Date.now()) {
  const db = database();
  const rows = (await db.prepare(`SELECT id,payload FROM orders WHERE created_at<? AND payload LIKE '%"reserved":true%' ORDER BY created_at LIMIT 50`).bind(now - HOLD_MS).all()).results as any[];
  let expired = 0;
  for (const row of rows) {
    const o = JSON.parse(row.payload);
    const open = (p: any) => !p || ['unpaid', 'rejected'].includes(p.status);
    if (o.closed || o.billingVersion !== 2 || !open(o.sellerPayment) || !open(o.gulitPayment)) continue;
    const pending = await db.prepare("SELECT COUNT(*) AS n FROM payment_attempts WHERE order_id=? AND status='pending' AND created_at>?").bind(row.id, now - 3600000).first<any>();
    if (pending?.n) continue; // customer may be on the Chapa page right now
    const before = row.payload, held = o.allocation;
    o.allocation = { ...held, reserved: false, releasedAt: now };
    o.closed = 'Expired'; o.status = paymentState(o);
    const r = await db.prepare('UPDATE orders SET payload=? WHERE id=? AND payload=?').bind(JSON.stringify(o), row.id, before).run();
    if (r.meta.changes) { await giveBack(held.storeId, o.items.filter((i: any) => !i.missing)); expired++; }
  }
  return expired;
}
