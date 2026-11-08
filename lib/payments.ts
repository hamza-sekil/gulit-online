import { env } from 'cloudflare:workers';
import { database } from './catalog';
import { hex } from './password-auth';
import { paymentState, onlineReady } from './orders';
import { addRefund } from './routing';

// Chapa online payments (Telebirr, CBE Birr, bank cards and other methods on Chapa's hosted checkout).
// The order keeps its two separate payments:
//  - seller payment: the goods money, split to the linked supermarket's Chapa sub-account; Gulit keeps the
//    supermarket commission (commission_bps, default 1%) through Chapa's split.
//  - Gulit payment: service charge + delivery + VAT, paid to Gulit's own Chapa account.
// A payment only becomes "verified" after Gulit's server asks Chapa's verify endpoint directly. Callback and
// webhook bodies are never trusted on their own.

const API = 'https://api.chapa.co/v1';
const TX_REF = /^GUL-[A-F0-9]{16}-[SG]-[a-f0-9]{12}$/;
type Party = 'seller' | 'gulit';

function secret() {
  const key = (env as any).CHAPA_SECRET_KEY;
  if (typeof key !== 'string' || key.length < 16) throw Error('Online payment is not available right now. Pay by bank deposit instead.');
  return key;
}

export function chapaPhone(value: string) {
  let digits = String(value || '').replace(/\D/g, '');
  if (digits.startsWith('251') && digits.length === 12) digits = '0' + digits.slice(3);
  if (digits.length === 9 && /^[79]/.test(digits)) digits = '0' + digits;
  return /^0[79]\d{8}$/.test(digits) ? digits : null;
}

function names(full: string) {
  const clean = String(full || '').replace(/[^\p{L}\p{N} .'-]/gu, ' ').replace(/\s+/g, ' ').trim();
  const parts = clean.split(' ');
  const first = (parts.shift() || 'Gulit').slice(0, 50);
  const last = (parts.join(' ') || 'Customer').slice(0, 50);
  return { first, last };
}

export function birr(cents: number) {
  return (cents / 100).toFixed(2);
}

/** Creates a Chapa checkout for one of the order's two payments and returns the checkout URL. */
export async function startPayment(order: any, party: Party, origin: string) {
  if (!onlineReady(order, party)) throw Error(party === 'seller'
    ? 'Online payment for the seller is not ready yet. Ask customer care, or pay by bank deposit.'
    : 'This payment cannot be paid online right now.');
  const key = secret();
  const pay = order[party + 'Payment'];
  const amountCents: number = party === 'seller' ? order.sellerTotal : order.gulitTotal;
  if (!Number.isSafeInteger(amountCents) || amountCents < 100) throw Error('This payment amount cannot be paid online.');
  const txRef = `${order.id}-${party === 'seller' ? 'S' : 'G'}-${hex(crypto.getRandomValues(new Uint8Array(6)))}`;
  const now = Date.now(), db = database();
  await db.prepare('INSERT INTO payment_attempts (tx_ref,order_id,party,amount_cents,status,provider_ref,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?)')
    .bind(txRef, order.id, party, amountCents, 'pending', null, now, now).run();
  const { first, last } = names(order.name);
  const body: any = {
    amount: birr(amountCents),
    currency: 'ETB',
    first_name: first,
    last_name: last,
    tx_ref: txRef,
    callback_url: origin + '/api/payments/chapa',
    return_url: origin + '/?paid=' + encodeURIComponent(order.id),
    customization: {
      title: 'Gulit Online',
      description: `Order ${order.id} ${party === 'seller' ? 'goods payment' : 'service and delivery'}`,
    },
    meta: { order_id: order.id, party },
  };
  const phone = chapaPhone(order.phone);
  if (phone) body.phone_number = phone;
  if (party === 'seller') {
    const bps = Number.isInteger(pay.commissionBps) ? pay.commissionBps : 100;
    body.subaccounts = { id: pay.subaccount, split_type: 'percentage', split_value: bps / 10000 };
  }
  let data: any = null;
  try {
    const r = await fetch(API + '/transaction/initialize', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    data = await r.json().catch(() => null);
    if (!r.ok) data = null;
  } catch { data = null; }
  const url = data?.status === 'success' ? String(data?.data?.checkout_url || '') : '';
  let valid = false;
  try { const u = new URL(url); valid = u.protocol === 'https:' && (u.hostname === 'chapa.co' || u.hostname.endsWith('.chapa.co')); } catch {}
  if (!valid) {
    await db.prepare("UPDATE payment_attempts SET status='failed',updated_at=? WHERE tx_ref=?").bind(Date.now(), txRef).run();
    throw Error('Online payment could not start. Try again, or pay by bank deposit.');
  }
  return { checkoutUrl: url, txRef };
}

async function verifyWithChapa(txRef: string) {
  const r = await fetch(API + '/transaction/verify/' + encodeURIComponent(txRef), { headers: { Authorization: 'Bearer ' + secret() } });
  const d: any = await r.json().catch(() => null);
  return d?.data && typeof d.data === 'object' ? d.data : null;
}

/** Asks Chapa for the real state of a transaction and, if paid in full, marks that order payment verified. */
export async function confirmPayment(txRef: string): Promise<{ status: string; orderId?: string }> {
  if (!TX_REF.test(String(txRef || ''))) return { status: 'unknown' };
  const db = database();
  const attempt = await db.prepare('SELECT * FROM payment_attempts WHERE tx_ref=?').bind(txRef).first<any>();
  if (!attempt) return { status: 'unknown' };
  if (attempt.status === 'paid' || attempt.status === 'duplicate') return { status: attempt.status, orderId: attempt.order_id };
  let data: any;
  try { data = await verifyWithChapa(txRef); } catch { return { status: 'pending', orderId: attempt.order_id }; }
  const state = String(data?.status || '').toLowerCase();
  if (state === 'failed' || state === 'cancelled' || state === 'expired') {
    await db.prepare("UPDATE payment_attempts SET status='failed',updated_at=? WHERE tx_ref=? AND status='pending'").bind(Date.now(), txRef).run();
    return { status: 'failed', orderId: attempt.order_id };
  }
  const paidCents = Math.round(Number(data?.amount) * 100);
  if (state !== 'success' || String(data?.currency || '').toUpperCase() !== 'ETB' || String(data?.tx_ref || txRef) !== txRef || !(paidCents >= attempt.amount_cents)) {
    return { status: 'pending', orderId: attempt.order_id };
  }
  // Claim the attempt first so two callbacks for the same payment can't both apply it.
  const claimed = await db.prepare("UPDATE payment_attempts SET status='paid',provider_ref=?,updated_at=? WHERE tx_ref=? AND status IN ('pending','failed')")
    .bind(String(data?.reference || data?.ref_id || '').slice(0, 100) || null, Date.now(), txRef).run();
  if (!claimed.meta.changes) return { status: 'paid', orderId: attempt.order_id };
  for (let i = 0; i < 6; i++) {
    const row = await db.prepare('SELECT payload FROM orders WHERE id=?').bind(attempt.order_id).first<any>();
    if (!row) return { status: 'paid', orderId: attempt.order_id };
    const o = JSON.parse(row.payload), key = attempt.party + 'Payment', pay = o[key] || {};
    let outcome = 'paid';
    if (o.closed || (pay.status === 'verified' && pay.txRef !== txRef)) {
      // Bill already paid, or the order was cancelled/expired: keep a record so the owner refunds it.
      o.duplicatePayments = [...(o.duplicatePayments || []), { party: attempt.party, txRef, amountCents: paidCents, at: Date.now(), reason: o.closed ? 'order ' + String(o.closed).toLowerCase() : 'paid twice' }];
      outcome = 'duplicate';
    } else if (pay.status !== 'verified') {
      o[key] = { ...pay, status: 'verified', method: 'online', txRef, providerRef: String(data?.reference || '').slice(0, 100) || null, paidCents, paidAt: Date.now() };
      // The bill can go down while the customer is on the Chapa page (an item marked missing): refund the difference.
      const due = attempt.party === 'seller' ? o.sellerTotal : o.gulitTotal;
      if (Number.isInteger(due) && paidCents > due) addRefund(o, attempt.party, paidCents - due, 'paid more than the final bill');
      o.status = paymentState(o);
    }
    const result = await db.prepare('UPDATE orders SET payload=? WHERE id=? AND payload=?').bind(JSON.stringify(o), attempt.order_id, row.payload).run();
    if (result.meta.changes) {
      if (outcome === 'duplicate') await db.prepare("UPDATE payment_attempts SET status='duplicate' WHERE tx_ref=?").bind(txRef).run();
      return { status: outcome, orderId: attempt.order_id };
    }
  }
  // Could not save the order (it kept changing). Release the claim so the next callback or check retries.
  await db.prepare("UPDATE payment_attempts SET status='pending',updated_at=? WHERE tx_ref=?").bind(Date.now(), txRef).run();
  return { status: 'pending', orderId: attempt.order_id };
}

/** Re-checks every unfinished online attempt for an order (used when the customer returns, and by the owner). */
export async function confirmOrderPayments(orderId: string) {
  const rows = await database().prepare("SELECT tx_ref FROM payment_attempts WHERE order_id=? AND status='pending' ORDER BY created_at DESC LIMIT 6").bind(orderId).all();
  const results = [];
  for (const row of rows.results as any[]) results.push(await confirmPayment(row.tx_ref));
  return results;
}
