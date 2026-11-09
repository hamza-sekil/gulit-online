import { database, catalog } from './catalog';
import { paymentState } from './orders';
import { bestStores, reserveAt, giveBack, linkStore, priceDelivery, startConfirmClock, rebill, expireStale, applyStorePrices } from './routing';
import { opsSettings } from './settings';
import { roadKm, type Point } from './delivery';
import { notifyOrder, cleanupOrderPush } from './order-push';

// Day-to-day automation from the development plan. Runs "lazily": whenever the shop, a storekeeper,
// a driver or the owner loads data, at most every 15 seconds (sweepIfDue). A Cloudflare cron trigger can also call sweep().
//  1. supermarket did not confirm in time → move the order to the next supermarket (if the goods are not paid yet) and alert
//  2. replacement offers the customer did not answer in time → treated as "no, refund it"
//  3. paid orders → nearest free rider (own riders first, then contracted); nobody free → "book Yango" alert
//  4. unpaid stock holds older than 24 hours → released (routing.expireStale)

async function saveOrder(id: string, before: string, o: any) {
  const r = await database().prepare('UPDATE orders SET payload=? WHERE id=? AND payload=?').bind(JSON.stringify(o), id, before).run();
  return r.meta.changes > 0;
}
export function addAlert(o: any, type: string, text: string, now = Date.now()) {
  o.alerts = [...(o.alerts || []), { type, text, at: now, done: false }];
}

// ---------- 1. confirmation limit ----------
async function rerouteLate(now: number) {
  const db = database();
  const rows = (await db.prepare(`SELECT id,payload FROM orders WHERE payload LIKE '%"storeState":"new"%' ORDER BY created_at LIMIT 50`).all()).results as any[];
  for (const row of rows) {
    const o = JSON.parse(row.payload);
    if (o.closed || o.storeState !== 'new' || typeof o.confirmBy !== 'number' || o.confirmBy > now || !o.allocation?.reserved) continue;
    const old = o.allocation, items = o.items.filter((i: any) => !i.missing);
    o.missedConfirm = [...(o.missedConfirm || []), { storeId: old.storeId, storeName: old.storeName, at: now }];
    const sellerOpen = ['unpaid', 'rejected'].includes(o.sellerPayment?.status);
    const paying = await db.prepare("SELECT COUNT(*) AS n FROM payment_attempts WHERE order_id=? AND party='seller' AND status='pending' AND created_at>?").bind(row.id, now - 1800000).first<any>();
    let moved = null;
    if (sellerOpen && !paying?.n) {
      const tried = o.missedConfirm.map((m: any) => m.storeId);
      for (const store of (await bestStores(items, o.customerLocation || null, tried, now)) || []) {
        if (await reserveAt(store.id, items)) { moved = store; break; }
      }
    }
    if (moved) {
      o.allocation = { storeId: moved.id, storeName: moved.name, reserved: true, at: now };
      linkStore(o, moved);
      await applyStorePrices(o, moved.id, moved.name);
      if (o.inAddis && !['verified', 'review'].includes(o.gulitPayment?.status)) await priceDelivery(o, moved);
      await startConfirmClock(o, now);
      addAlert(o, 'moved', `${old.storeName} did not confirm in time. Order moved to ${moved.name}.`, now);
    } else {
      o.confirmBy = null; // escalate once; a supervisor takes over
      addAlert(o, 'confirm-missed', `${old.storeName} did not confirm in time. ${sellerOpen ? 'No other supermarket has every item open now' : 'Goods already paid to this supermarket'}: call the store.`, now);
    }
    o.status = paymentState(o);
    if (await saveOrder(row.id, row.payload, o)) { if (moved) await giveBack(old.storeId, items); }
    else if (moved) await giveBack(moved.id, items);
  }
}

// ---------- 2. replacement offers ----------
/** A similar item at the same supermarket: same category, in stock, price between 70% and 100% of the missing item. */
export async function findReplacement(o: any, item: any, storeId: string) {
  const products = await catalog(false, false), byId = new Map(products.map(p => [p.id, p]));
  const original = byId.get(item.id); if (!original) return null;
  const inOrder = new Set(o.items.map((i: any) => i.id));
  const rows = (await database().prepare('SELECT product_id,quantity,price_cents FROM store_stock WHERE store_id=? AND quantity>=?').bind(storeId, item.n).all()).results as any[];
  let best: any = null;
  for (const r of rows) {
    const p: any = byId.get(r.product_id); if (!p || inOrder.has(p.id) || p.cat !== original.cat) continue;
    const price = r.price_cents ?? (p.draft ? null : Math.round(p.price * 100)); // this supermarket's own price
    if (price === null) continue;
    if (price > item.price || price < item.price * 0.7) continue;
    if (!best || Math.abs(item.price - price) < Math.abs(item.price - best.price)) best = { id: p.id, name: p.name, price, n: item.n };
  }
  return best;
}

/** Applies the customer's answer (or a timeout). Returns false if nothing was pending. Caller saves the order. */
export async function resolveOffer(o: any, itemId: number, accept: boolean, now = Date.now()) {
  const item = o.items.find((i: any) => i.id === itemId && i.offer?.status === 'pending');
  if (!item) return { changed: false, reserved: null as any };
  let reserved = null;
  if (accept && o.allocation?.reserved && await reserveAt(o.allocation.storeId, [{ id: item.offer.id, n: item.offer.n }])) {
    reserved = { storeId: o.allocation.storeId, id: item.offer.id, n: item.offer.n };
    o.items.push({ id: item.offer.id, name: item.offer.name, n: item.offer.n, price: item.offer.price, substituteFor: item.id });
    item.offer = { ...item.offer, status: 'accepted', at: now };
  } else item.offer = { ...item.offer, status: accept ? 'unavailable' : (now >= item.offer.expiresAt ? 'expired' : 'declined'), at: now };
  item.missing = true; delete item.missingPending;
  rebill(o, (item.offer.status === 'accepted' ? 'replaced item: ' : 'item not available: ') + item.name);
  return { changed: true, reserved };
}

async function expireOffers(now: number) {
  const rows = (await database().prepare(`SELECT id,payload FROM orders WHERE payload LIKE '%"status":"pending","expiresAt"%' LIMIT 50`).all()).results as any[];
  for (const row of rows) {
    const o = JSON.parse(row.payload);
    let changed = false;
    for (const i of o.items) if (i.offer?.status === 'pending' && i.offer.expiresAt <= now) { await resolveOffer(o, i.id, false, now); changed = true; }
    if (changed && await saveOrder(row.id, row.payload, o)) await notifyOrder(row.id).catch(() => {});
  }
}

// ---------- 3. riders ----------
export async function freeRiders(now = Date.now()) {
  return (await database().prepare("SELECT * FROM drivers WHERE active=1 AND available=1 AND id NOT IN (SELECT driver_id FROM deliveries WHERE state IN ('assigned','picked_up','on_way','problem'))").all()).results as any[];
}
export function pickRider(riders: any[], store: Point | null, now = Date.now()) {
  const fresh = (r: any) => typeof r.lat === 'number' && r.location_at && now - r.location_at < 30 * 60000;
  const rank = (r: any) => (r.grp === 'own' ? 0 : r.grp === 'contracted' ? 1 : 2);
  return [...riders].sort((a, b) => rank(a) - rank(b) || ((store && fresh(a) ? roadKm({ lat: a.lat, lng: a.lng }, store) : 999) - (store && fresh(b) ? roadKm({ lat: b.lat, lng: b.lng }, store) : 999)) || a.name.localeCompare(b.name))[0] || null;
}
async function autoDispatch(now: number) {
  const db = database(), ops = await opsSettings();
  const rows = (await db.prepare(`SELECT o.id,o.payload FROM orders o LEFT JOIN deliveries d ON d.order_id=o.id WHERE d.order_id IS NULL AND o.payload LIKE '%"status":"Payment verified"%' ORDER BY o.created_at LIMIT 20`).all()).results as any[];
  for (const row of rows) {
    const o = JSON.parse(row.payload);
    if (o.closed || o.status !== 'Payment verified' || !o.allocation?.storeId) continue;
    if (!o.timeline?.paid) { o.timeline = { ...(o.timeline || {}), paid: now }; await saveOrder(row.id, row.payload, o); continue; }
    const store = await db.prepare('SELECT lat,lng FROM stores WHERE id=?').bind(o.allocation.storeId).first<any>();
    const rider = pickRider(await freeRiders(now), store && typeof store.lat === 'number' ? { lat: store.lat, lng: store.lng } : null, now);
    if (rider) {
      const r = await db.prepare("INSERT INTO deliveries (order_id,driver_id,state,instructions,driver_note,updated_at,provider,cost_cents,assigned_by) VALUES (?,?,'assigned','','',?,?,?,'auto') ON CONFLICT(order_id) DO NOTHING").bind(row.id, rider.id, now, rider.grp === 'contracted' ? 'contracted' : 'own', rider.grp === 'contracted' ? rider.trip_fee : 0).run();
      if (r.meta.changes) { const fresh = await db.prepare('SELECT payload FROM orders WHERE id=?').bind(row.id).first<any>(); const f = JSON.parse(fresh.payload); f.timeline = { ...(f.timeline || {}), assigned: now }; await saveOrder(row.id, fresh.payload, f); }
    } else if (now - o.timeline.paid >= ops.riderWaitMinutes * 60000 && !(o.alerts || []).some((a: any) => a.type === 'no-rider')) {
      addAlert(o, 'no-rider', 'No own or contracted rider is free. Book a Yango courier and record it on the live page.', now);
      await saveOrder(row.id, row.payload, o);
    }
  }
}

// ---------- runner ----------
let lastSweep = 0;
export async function sweep(now = Date.now()) {
  lastSweep = now;
  for (const step of [expireStale, rerouteLate, expireOffers, autoDispatch, cleanupOrderPush]) { try { await step(now); } catch (e) { console.error('sweep step failed', e); } }
}
export async function sweepIfDue() { const now = Date.now(); if (now - lastSweep < 15000) return; await sweep(now); }
