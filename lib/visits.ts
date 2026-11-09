import { database } from './catalog';
// Anonymous visitor counting for the owner dashboard. No names, phones, IPs or cookies are stored:
// a visitor is a one-way hash of (IP + browser + day + secret salt), so the same person counts once per day
// and cannot be traced back or followed across days.
export const PAGES: Record<string,string> = { '/': 'Home', '/partners': 'Partner sign-up', '/partners/agreement': 'Partner agreement', '/privacy': 'Privacy policy', '/terms': 'Terms', '/support': 'Help & support' };
// Short links for bios and posts: gulitonline.com/tg, /tt, /yt …
export const SOURCE_LINKS: Record<string,string> = { '/tg': 'telegram', '/tt': 'tiktok', '/yt': 'youtube', '/fb': 'facebook', '/ig': 'instagram' };
const SOURCES = ['telegram','tiktok','youtube','facebook','instagram','google','whatsapp','other site','direct'];
const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|embedly|curl|wget|python|node-fetch|headless|lighthouse|monitor|uptime/i;
export function addisDay(t = Date.now()) { return new Date(t + 3 * 3600_000).toISOString().slice(0, 10); }
export function sourceOf(url: URL, referer: string, ua: string) {
  const s = (url.searchParams.get('s') || url.searchParams.get('utm_source') || '').toLowerCase();
  const map = (x: string) => /t\.me|telegram|^tg$/.test(x) ? 'telegram' : /tiktok|^tt$/.test(x) ? 'tiktok' : /youtu|^yt$/.test(x) ? 'youtube' : /facebook|fb\.|^fb$/.test(x) ? 'facebook' : /instagram|^ig$/.test(x) ? 'instagram' : /google\./.test(x) ? 'google' : /whatsapp|wa\.me/.test(x) ? 'whatsapp' : '';
  if (s) return map(s) || 'other site';
  if (/musical_ly|BytedanceWebview|TikTok/i.test(ua)) return 'tiktok';
  if (/Instagram/.test(ua)) return 'instagram';
  if (/FBAN|FBAV|FB_IAB/.test(ua)) return 'facebook';
  if (/Telegram/i.test(ua)) return 'telegram';
  let host = '';
  try { host = new URL(referer).hostname.toLowerCase(); } catch {}
  if (host.endsWith('gulitonline.com') || host === url.hostname) return 'internal'; // moving between our own pages
  if (!host) return 'direct';
  return map(host) || (/^(www\.)?(bing|duckduckgo|yahoo)\./.test(host) ? 'google' : 'other site');
}
export function deviceOf(ua: string) { return /iPad|Tablet/i.test(ua) ? 'tablet' : /Mobi|Android|iPhone/i.test(ua) ? 'phone' : 'computer'; }
export function countable(request: Request) {
  if (request.method !== 'GET') return false;
  const url = new URL(request.url), h = request.headers, ua = h.get('user-agent') || '';
  if (!(url.pathname in PAGES)) return false;
  if (!(h.get('accept') || '').includes('text/html')) return false;
  if (!ua || BOT.test(ua)) return false;
  if (/prefetch|prerender/i.test(h.get('sec-purpose') || h.get('purpose') || '')) return false;
  if ((h.get('cookie') || '').includes('__Host-gulit-admin=')) return false; // don't count the owner
  return true;
}
let salt: string | null = null;
async function getSalt() {
  if (salt) return salt;
  const db = database(), row = await db.prepare("SELECT value FROM settings WHERE key='visits:salt'").first<any>();
  if (row) return (salt = row.value);
  const v = [...crypto.getRandomValues(new Uint8Array(24))].map(b => b.toString(16).padStart(2, '0')).join('');
  await db.prepare("INSERT OR IGNORE INTO settings(key,value,updated_at) VALUES('visits:salt',?,?)").bind(v, Date.now()).run();
  const again = await db.prepare("SELECT value FROM settings WHERE key='visits:salt'").first<any>();
  return (salt = again?.value || v);
}
export async function recordVisit(request: Request, now = Date.now()) {
  const url = new URL(request.url), h = request.headers, ua = h.get('user-agent') || '', day = addisDay(now);
  const raw = `${h.get('cf-connecting-ip') || ''}|${ua}|${day}|${await getSalt()}`;
  const hash = [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw)))].slice(0, 8).map(b => b.toString(16).padStart(2, '0')).join('');
  const db = database();
  await db.prepare('INSERT INTO page_views(at,day,path,source,device,visitor) VALUES(?,?,?,?,?,?)').bind(now, day, url.pathname, sourceOf(url, h.get('referer') || '', ua), deviceOf(ua), hash).run();
  if (Math.random() < 0.02) await db.prepare('DELETE FROM page_views WHERE at<?').bind(now - 120 * 86400_000).run(); // keep 4 months
}
export async function visitStats(now = Date.now()) {
  const db = database(), today = addisDay(now), week = addisDay(now - 6 * 86400_000), month = addisDay(now - 29 * 86400_000);
  const one = async (sql: string, ...b: any[]) => (await db.prepare(sql).bind(...b).first<any>()) || {};
  const all = async (sql: string, ...b: any[]) => ((await db.prepare(sql).bind(...b).all()).results || []) as any[];
  // A "visitor" is one person per day, so weekly visitors add up the daily counts.
  const period = async (from: string) => one('SELECT COUNT(*) views, (SELECT COUNT(*) FROM (SELECT DISTINCT day,visitor FROM page_views WHERE day>=?)) visitors FROM page_views WHERE day>=?', from, from);
  return {
    today: await period(today), week: await period(week), month: await period(month),
    daily: await all('SELECT day, COUNT(*) views, COUNT(DISTINCT visitor) visitors FROM page_views WHERE day>=? GROUP BY day ORDER BY day', addisDay(now - 13 * 86400_000)),
    sources: await all(`SELECT source, COUNT(DISTINCT day||visitor) visitors, COUNT(*) views FROM page_views WHERE day>=? AND source<>'internal' GROUP BY source ORDER BY visitors DESC`, month),
    pages: (await all('SELECT path, COUNT(DISTINCT day||visitor) visitors, COUNT(*) views FROM page_views WHERE day>=? GROUP BY path ORDER BY views DESC', month)).map(r => ({ ...r, name: PAGES[r.path] || r.path })),
    devices: await all('SELECT device, COUNT(DISTINCT day||visitor) visitors FROM page_views WHERE day>=? GROUP BY device ORDER BY visitors DESC', month),
    sourceNames: SOURCES,
  };
}
