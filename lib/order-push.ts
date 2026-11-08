import { database } from './catalog';
import { digest } from './password-auth';
import { pushConfig, validatePushEndpoint, vapidAuthorization } from './engineer-push';

// Customer order notifications (Web Push, payload-free). Works in Chrome/Android (and the Play Store app),
// desktop browsers, and iPhone when Gulit is added to the Home Screen (iOS 16.4+). The notification only says
// "your order has an update"; details stay in the order page, which needs the private order code.
export async function subscribeOrder(orderId: string, endpoint: unknown) {
  const url = validatePushEndpoint(endpoint), db = database(), id = await digest(orderId + '|' + url);
  await db.prepare('INSERT INTO order_push (id,order_id,endpoint,created_at) VALUES (?,?,?,?) ON CONFLICT(id) DO UPDATE SET created_at=excluded.created_at').bind(id, orderId, url, Date.now()).run();
  await db.prepare('DELETE FROM order_push WHERE order_id=? AND id NOT IN (SELECT id FROM order_push WHERE order_id=? ORDER BY created_at DESC LIMIT 5)').bind(orderId, orderId).run();
}
export async function unsubscribeOrder(orderId: string, endpoint: unknown) {
  const url = validatePushEndpoint(endpoint);
  await database().prepare('DELETE FROM order_push WHERE id=?').bind(await digest(orderId + '|' + url)).run();
}
export async function notifyOrder(orderId: string) {
  const cfg = pushConfig(), summary = { sent: 0, failed: 0, expired: 0 };
  if (!cfg.publicKey || !cfg.privateJwk) return summary;
  try {
    const db = database(), rows = (await db.prepare('SELECT id,endpoint FROM order_push WHERE order_id=? LIMIT 5').bind(orderId).all()).results as any[];
    await Promise.all(rows.map(async row => {
      try {
        const endpoint = validatePushEndpoint(row.endpoint);
        const r = await fetch(endpoint, { method: 'POST', redirect: 'manual', signal: AbortSignal.timeout(6000), headers: { Authorization: await vapidAuthorization(endpoint), TTL: '3600', Urgency: 'high', Topic: 'gulit-order' } });
        if (r.status === 404 || r.status === 410) { await db.prepare('DELETE FROM order_push WHERE id=?').bind(row.id).run(); summary.expired++; }
        else if (r.status === 201 || r.status === 202) summary.sent++; else summary.failed++;
      } catch { summary.failed++; }
    }));
  } catch { summary.failed++; }
  return summary;
}
export async function cleanupOrderPush(now = Date.now()) {
  await database().prepare('DELETE FROM order_push WHERE created_at<?').bind(now - 14 * 86400000).run();
}
