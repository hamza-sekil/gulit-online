import { env } from 'cloudflare:workers';
import { rebill } from './routing';
// Photo checks for laundry orders. Before the laundry takes clothes in, the customer (from the order page) or the
// rider (at pickup) can send a photo of a piece with a stain, paint or damage. The laundry answers in its app:
// "we can take it" or "we can't". A rejected piece linked to an item type is taken off the order and the bills are
// recalculated (refund recorded if already paid), so the rider leaves that piece with the customer.
export const MAX_CHECKS = 40, MAX_PHOTO = 6 * 1024 * 1024;
export function sniff(b: Uint8Array) {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg';
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return 'image/png';
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return 'image/webp';
  return '';
}
/** Validates and stores the photo; returns its storage key and type. */
export async function savePhoto(file: unknown) {
  if (!(file instanceof File) || !file.size || file.size > MAX_PHOTO) throw Error('Choose a photo smaller than 6 MB.');
  const bytes = new Uint8Array(await file.arrayBuffer()), type = sniff(bytes);
  if (!type) throw Error('Only JPG, PNG or WebP photos are supported.');
  if (!(env as any).BUCKET) throw Error('Photo storage is unavailable.');
  const key = 'laundry/' + crypto.randomUUID();
  await (env as any).BUCKET.put(key, bytes, { httpMetadata: { contentType: type } });
  return { key, type };
}
export function canCheck(o: any) {
  if (!o?.laundry) return 'Photo checks are only for laundry orders.';
  if (o.closed) return 'This order is closed.';
  if ((o.laundryChecks || []).length >= MAX_CHECKS) return 'Too many photos on this order. Call customer care.';
  return '';
}
export function addCheck(o: any, c: { by: 'customer' | 'rider'; key: string; type: string; note?: unknown; itemId?: unknown }, now = Date.now()) {
  const err = canCheck(o); if (err) throw Error(err);
  const note = String(c.note ?? '').trim().slice(0, 300);
  const itemId = c.itemId === undefined || c.itemId === null || c.itemId === '' ? null : Number(c.itemId);
  const item = itemId === null ? null : o.items.find((i: any) => i.id === itemId && !i.missing);
  if (itemId !== null && !item) throw Error('Choose a clothing type from this order.');
  const check = { id: [...crypto.getRandomValues(new Uint8Array(6))].map(b => b.toString(16).padStart(2, '0')).join(''), by: c.by, key: c.key, type: c.type, note, itemId, itemName: item?.name || '', at: now, status: 'pending' as string };
  o.laundryChecks = [...(o.laundryChecks || []), check];
  return check;
}
export function decide(o: any, checkId: string, decision: string, reply: unknown, now = Date.now()) {
  const c = (o.laundryChecks || []).find((x: any) => x.id === checkId);
  if (!c) throw Error('Photo not found.');
  if (c.status !== 'pending') throw Error('This photo has already been answered.');
  if (!['accept', 'reject'].includes(decision)) throw Error('Choose accept or reject.');
  const text = String(reply ?? '').trim().slice(0, 300);
  if (decision === 'reject' && text.length < 3) throw Error('Write a short reason for the customer (for example: paint will not come out).');
  c.status = decision === 'accept' ? 'accepted' : 'rejected'; c.reply = text; c.answeredAt = now;
  if (c.status === 'rejected' && c.itemId !== null) {
    const item = o.items.find((i: any) => i.id === c.itemId && !i.missing);
    if (item) {
      if (item.n > 1) item.n -= 1; else { item.missing = true; item.laundryRejected = true; }
      c.removed = item.name;
      rebill(o, 'laundry cannot take: ' + item.name);
    }
  }
  return c;
}
/** What people outside the laundry may see (no storage key). */
export function checkView(c: any, img?: string) {
  return { id: c.id, by: c.by, note: c.note, itemId: c.itemId, itemName: c.itemName, at: c.at, status: c.status, reply: c.reply || '', removed: c.removed || '', ...(img ? { img } : {}) };
}
