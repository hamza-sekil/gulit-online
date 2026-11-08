import { env } from 'cloudflare:workers';
import { database } from './catalog';
import { addisMinutes } from './settings';
import { POSTS } from './telegram-posts';
// Automatic Telegram channel posts from the Cloudflare cron (runs every minute; posts only when a slot is due).
export type TG = { enabled: boolean; channel: string; everyHours: number; startHour: number; endHour: number; next: number; lastSlot: string; lastAt: number; lastError: string; sent: number; postNow?: string };
export const DEFAULT_TG: TG = { enabled: false, channel: '', everyHours: 2, startHour: 7, endHour: 21, next: 0, lastSlot: '', lastAt: 0, lastError: '', sent: 0 };
const token = () => String((env as any).TELEGRAM_BOT_TOKEN || '');
export async function tgSettings(): Promise<{ s: TG; raw: string | null }> {
  const row = await database().prepare("SELECT value FROM settings WHERE key='telegram'").first<any>();
  // Before the owner saves settings, a channel given in the deploy config (TELEGRAM_CHANNEL) switches posting on.
  const preset = String((env as any).TELEGRAM_CHANNEL || '');
  const base = !row && preset ? { ...DEFAULT_TG, enabled: true, channel: preset } : DEFAULT_TG;
  return { s: { ...base, ...(row ? JSON.parse(row.value) : {}) }, raw: row ? row.value : null };
}
async function save(s: TG, raw: string | null) {
  const v = JSON.stringify(s), db = database(), now = Date.now();
  const r = raw === null
    ? await db.prepare("INSERT INTO settings (key,value,updated_at) VALUES ('telegram',?,?) ON CONFLICT(key) DO NOTHING").bind(v, now).run()
    : await db.prepare("UPDATE settings SET value=?,updated_at=? WHERE key='telegram' AND value=?").bind(v, now, raw).run();
  return r.meta.changes > 0;
}
export function validateTG(b: any, cur: TG): TG {
  const s = { ...cur };
  if ('enabled' in b) s.enabled = b.enabled === true;
  if ('channel' in b) { const c = String(b.channel || '').trim().replace(/^https?:\/\/t\.me\//i, '@'); if (c && !/^@[A-Za-z0-9_]{5,32}$/.test(c) && !/^-100\d{6,15}$/.test(c)) throw Error('Enter the channel as @username (for example @gulitonline).'); s.channel = c; }
  const int = (k: 'everyHours' | 'startHour' | 'endHour', lo: number, hi: number) => { if (k in b) { const n = Number(b[k]); if (!Number.isInteger(n) || n < lo || n > hi) throw Error('Invalid ' + k); s[k] = n; } };
  int('everyHours', 1, 24); int('startHour', 0, 23); int('endHour', 0, 23);
  if (s.endHour < s.startHour) throw Error('The last posting hour must be after the first.');
  if (s.enabled && !s.channel) throw Error('Enter the channel first.');
  return s;
}
export async function saveTG(b: any) {
  for (let i = 0; i < 3; i++) { const { s, raw } = await tgSettings(); const n = validateTG(b, s); if (await save(n, raw)) return n; }
  throw Error('Busy, try again');
}
/** Addis date + hour if `now` is a posting slot, else null. */
export function slotFor(s: TG, now = Date.now()) {
  const m = addisMinutes(now), h = Math.floor(m / 60);
  if (h < s.startHour || h > s.endHour || (h - s.startHour) % s.everyHours !== 0 || m % 60 >= 15) return null;
  return new Date(now + 3 * 3600_000).toISOString().slice(0, 10) + 'T' + h;
}
export async function sendTelegram(channel: string, text: string) {
  if (!token()) throw Error('TELEGRAM_BOT_TOKEN is not set on the server.');
  const r = await fetch(`https://api.telegram.org/bot${token()}/sendMessage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: channel, text, parse_mode: 'HTML', link_preview_options: { is_disabled: true } }) });
  const j: any = await r.json().catch(() => ({}));
  if (!r.ok || !j.ok) throw Error('Telegram: ' + String(j.description || r.status).slice(0, 200));
}
/** Called by the cron every minute. Claims the slot first so a post is never sent twice. */
export async function postIfDue(now = Date.now()) {
  if (!token()) return 'no-token';
  const { s, raw } = await tgSettings();
  if (!s.enabled || !s.channel || !POSTS.length) return 'off';
  // TELEGRAM_POST_NOW (deploy config): send the next post once, right away, outside the schedule.
  const once = String((env as any).TELEGRAM_POST_NOW || '');
  const now1 = once && s.postNow !== once;
  const slot = slotFor(s, now);
  if (!now1 && (!slot || slot === s.lastSlot)) return 'not-due';
  const i = s.next % POSTS.length, claimed = now1 ? { ...s, postNow: once, next: i + 1 } : { ...s, lastSlot: slot!, next: i + 1 };
  if (!await save(claimed, raw)) return 'busy';
  let err = '';
  try { await sendTelegram(s.channel, POSTS[i]); } catch (e) { err = e instanceof Error ? e.message : 'failed'; }
  for (let k = 0; k < 3; k++) { const cur = await tgSettings(); if (await save({ ...cur.s, lastAt: err ? cur.s.lastAt : now, sent: cur.s.sent + (err ? 0 : 1), lastError: err }, cur.raw)) break; }
  return err ? 'error' : 'sent';
}
/** Owner "post the next one now": sends the next post and moves the rotation on. */
export async function postNextNow() {
  const { s } = await tgSettings();
  if (!s.channel) throw Error('Enter the channel first.');
  const i = s.next % POSTS.length;
  await sendTelegram(s.channel, POSTS[i]);
  for (let k = 0; k < 3; k++) { const cur = await tgSettings(); if (await save({ ...cur.s, next: i + 1, lastAt: Date.now(), sent: cur.s.sent + 1, lastError: '' }, cur.raw)) return; }
}
