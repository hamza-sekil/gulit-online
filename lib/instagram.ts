import { env } from 'cloudflare:workers';
import { database } from './catalog';
import { MEDIA_BASE, type Post } from './telegram-posts';
// Instagram auto-posting: every Telegram channel post that has a photo or video is also published to the
// Instagram professional account, through the Instagram API with Instagram Login (Content Publishing).
// Publishing is two steps: create a media container, then publish it once Instagram has fetched the media.
// The cron (every minute) moves a waiting container on, so a video never blocks the worker.
// Photos use public/social/ig/<name>: a 4:5 copy, because Instagram feed photos must be between 4:5 and 1.91:1.
// Token: the owner's long-lived Instagram user token, set once as the INSTAGRAM_ACCESS_TOKEN secret. Long-lived
// tokens last 60 days; the cron refreshes it every ~20 days and keeps the refreshed one in D1 (key instagram_token).

export const IG_HOST = 'https://graph.instagram.com';
export const IG_VERSION = 'v26.0';
export type IG = { enabled: boolean; userId: string; pending: null | { id: string; at: number; label: string; tries: number }; queue: string[]; lastAt: number; lastError: string; sent: number };
export const DEFAULT_IG: IG = { enabled: false, userId: '', pending: null, queue: [], lastAt: 0, lastError: '', sent: 0 };
const PENDING_TIMEOUT = 60 * 60 * 1000, REFRESH_EVERY = 20 * 86400_000, QUEUE_MAX = 10;

async function readKey(key: string) { return database().prepare('SELECT value FROM settings WHERE key=?').bind(key).first<any>(); }
async function writeKey(key: string, value: string, prev: string | null) {
  const db = database(), now = Date.now();
  const r = prev === null
    ? await db.prepare('INSERT INTO settings (key,value,updated_at) VALUES (?,?,?) ON CONFLICT(key) DO NOTHING').bind(key, value, now).run()
    : await db.prepare('UPDATE settings SET value=?,updated_at=? WHERE key=? AND value=?').bind(value, now, key, prev).run();
  return r.meta.changes > 0;
}
export async function igSettings(): Promise<{ s: IG; raw: string | null }> {
  const row = await readKey('instagram');
  return { s: { ...DEFAULT_IG, ...(row ? JSON.parse(row.value) : {}) }, raw: row ? row.value : null };
}
async function update(fn: (s: IG) => IG) {
  for (let i = 0; i < 4; i++) { const { s, raw } = await igSettings(); const n = fn(s); if (await writeKey('instagram', JSON.stringify(n), raw)) return n; }
  throw Error('Busy, try again');
}
export function validateIG(b: any, cur: IG): IG {
  const s = { ...cur };
  if ('enabled' in b) s.enabled = b.enabled === true;
  if ('userId' in b) { const u = String(b.userId || '').trim(); if (u && !/^\d{5,25}$/.test(u)) throw Error('The Instagram user ID is a number (digits only).'); s.userId = u; }
  if (s.enabled && !s.userId) throw Error('Enter the Instagram user ID first.');
  return s;
}
export const saveIG = (b: any) => update(s => validateIG(b, s));

/** The token to use: a refreshed one kept in D1 if newer, else the secret. Never returned to the browser. */
async function token(): Promise<{ token: string; at: number }> {
  const row = await readKey('instagram_token');
  if (row) { const t = JSON.parse(row.value); if (t.token) return t; }
  return { token: String((env as any).INSTAGRAM_ACCESS_TOKEN || ''), at: 0 };
}
export const tokenSet = async () => !!(await token()).token;

async function call(path: string, params: Record<string, string>, method: 'GET' | 'POST' = 'POST') {
  const t = (await token()).token;
  if (!t) throw Error('INSTAGRAM_ACCESS_TOKEN is not set on the server.');
  const url = new URL(`${IG_HOST}/${IG_VERSION}/${path}`);
  const body = new URLSearchParams(params);
  const r = method === 'GET'
    ? await fetch(url + '?' + body, { headers: { Authorization: 'Bearer ' + t } })
    : await fetch(url, { method: 'POST', headers: { Authorization: 'Bearer ' + t, 'Content-Type': 'application/x-www-form-urlencoded' }, body });
  const j: any = await r.json().catch(() => ({}));
  if (!r.ok || j.error) throw Error('Instagram: ' + String(j.error?.message || r.status).slice(0, 200));
  return j;
}

/** Telegram HTML caption → plain Instagram caption (links become their text; hashtags added once). */
export function igCaption(text: string) {
  const plain = text
    .replace(/<a\s[^>]*>(.*?)<\/a>/gis, '$1')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n').trim();
  const tags = /#Gulit\b/i.test(plain) ? '' : '\n\n#Gulit #ጉሊት #AddisAbaba #Ethiopia';
  return (plain + '\nLink: gulitonline.com' + tags).slice(0, 2150);
}
const postKey = (p: Post) => p.id || p.video || p.photo || '';

/** Queue a Telegram post for Instagram (text-only posts are skipped: Instagram needs a photo or video). */
export async function queueForInstagram(p: Post) {
  const { s } = await igSettings();
  if (!s.enabled || !s.userId || !(p.photo || p.video)) return 'skip';
  await update(c => ({ ...c, queue: [...c.queue, JSON.stringify({ k: postKey(p), photo: p.photo || '', video: p.video || '', text: p.text })].slice(-QUEUE_MAX) }));
  return 'queued';
}

/** Called by the cron every minute: refresh the token when due, move a waiting container on, or start the next one. */
export async function processInstagram(now = Date.now()) {
  const { s } = await igSettings();
  if (!s.enabled || !s.userId) return 'off';
  const t = await token();
  if (!t.token) return 'no-token';
  if (now - t.at > REFRESH_EVERY) {
    try {
      const r = await fetch(`${IG_HOST}/refresh_access_token?grant_type=ig_refresh_token&access_token=${encodeURIComponent(t.token)}`);
      const j: any = await r.json().catch(() => ({}));
      if (r.ok && j.access_token) {
        const prev = await readKey('instagram_token');
        await writeKey('instagram_token', JSON.stringify({ token: j.access_token, at: now }), prev ? prev.value : null);
      }
    } catch {}
  }
  if (s.pending) {
    const p = s.pending;
    if (!p.id) { if (now - p.at > 5 * 60_000) await update(c => ({ ...c, pending: null })); return 'starting'; }
    try {
      const st = await call(p.id, { fields: 'status_code' }, 'GET');
      if (st.status_code === 'FINISHED') {
        await call(`${s.userId}/media_publish`, { creation_id: p.id });
        await update(c => ({ ...c, pending: null, lastAt: now, sent: c.sent + 1, lastError: '' }));
        return 'published';
      }
      if (st.status_code === 'ERROR' || st.status_code === 'EXPIRED' || now - p.at > PENDING_TIMEOUT) {
        await update(c => ({ ...c, pending: null, lastError: `Instagram could not process "${p.label}" (${st.status_code || 'timeout'}).` }));
        return 'failed';
      }
      return 'waiting';
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'failed';
      await update(c => ({ ...c, pending: c.pending && c.pending.tries >= 5 ? null : c.pending && { ...c.pending, tries: c.pending.tries + 1 }, lastError: msg }));
      return 'error';
    }
  }
  if (!s.queue.length) return 'idle';
  // Claim the first queued post before calling Instagram, so it is never sent twice.
  const item = JSON.parse(s.queue[0]);
  const claimed = await update(c => (c.queue[0] === s.queue[0] && !c.pending ? { ...c, queue: c.queue.slice(1), pending: { id: '', at: now, label: item.k, tries: 0 } } : c));
  if (!claimed.pending || claimed.pending.id !== '' || claimed.pending.label !== item.k) return 'busy';
  try {
    const params: Record<string, string> = item.video
      ? { media_type: 'REELS', video_url: MEDIA_BASE + item.video, caption: igCaption(item.text), share_to_feed: 'true' }
      : { image_url: MEDIA_BASE + 'ig/' + item.photo, caption: igCaption(item.text) };
    const c = await call(`${s.userId}/media`, params);
    await update(x => ({ ...x, pending: { id: String(c.id), at: now, label: item.k, tries: 0 } }));
    return 'created';
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'failed';
    await update(x => ({ ...x, pending: null, lastError: msg }));
    return 'error';
  }
}
