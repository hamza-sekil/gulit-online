import { catalog, database, validateProduct, validateProductDates } from './catalog';

// Bulk catalogue work from spreadsheets (CSV, e.g. "Save as CSV" in Excel or Google Sheets):
//  - price list: publishes products (draft → live) with the supermarket-confirmed, VAT-inclusive price;
//  - stock list: sets each supermarket's quantities (and dates), assigning products to the supermarket if needed.
export const MAX_ROWS = 3000;

/** Small RFC 4180 CSV parser (quotes, commas and line breaks inside quotes, ; or , separators). */
export function parseCsv(text: string): string[][] {
  text = String(text || '').replace(/^﻿/, '');
  const first = text.split(/\r?\n/, 1)[0] || '';
  const sep = (first.match(/;/g) || []).length > (first.match(/,/g) || []).length ? ';' : ',';
  const rows: string[][] = []; let row: string[] = [], cell = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) { if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else quoted = false; } else cell += c; continue; }
    if (c === '"' && cell === '') quoted = true;
    else if (c === sep) { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; }
    else cell += c;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  return rows.filter(r => r.some(c => c.trim() !== ''));
}
const csvCell = (v: unknown) => { const s = String(v ?? ''); return /[",\n;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
export const toCsv = (rows: unknown[][]) => '﻿' + rows.map(r => r.map(csvCell).join(',')).join('\r\n') + '\r\n';

function table(text: string, required: string[]) {
  const rows = parseCsv(text);
  if (rows.length < 2) throw Error('The file has no data rows. Keep the header row and add one product per row.');
  if (rows.length - 1 > MAX_ROWS) throw Error(`Upload at most ${MAX_ROWS} rows at a time.`);
  const head = rows[0].map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
  for (const r of required) if (!head.includes(r)) throw Error(`Missing column "${r}". Download the template and keep its header row.`);
  return rows.slice(1).map((r, i) => ({ line: i + 2, get: (k: string) => String(r[head.indexOf(k)] ?? '').trim() }));
}
// "1,250.50" and "1 250" → thousands separators; "12,5" / "12,50" (European decimal comma) → 12.5
export const num = (v: string) => { let t = v.trim().replace(/^etb\s*/i, '').replace(/\s/g, ''); if (t === '') return NaN; if (/^\d+,\d{1,2}$/.test(t)) t = t.replace(',', '.'); else t = t.replace(/,/g, ''); return Number(t); };

export async function priceTemplate(onlyDrafts = false) {
  const list = (await catalog(true, false)).filter((p: any) => !onlyDrafts || p.draft).sort((a: any, b: any) => (a.cat + a.name).localeCompare(b.cat + b.name));
  return toCsv([['id', 'name', 'category', 'brand', 'price_birr', 'status', 'photo'], ...list.map((p: any) => [p.id, p.name, p.cat, p.brand || '', p.draft ? '' : p.price, p.archived ? 'archived' : p.draft ? 'needs price' : 'live', p.photoKind === 'reference' ? 'reference photo – replace' : p.image === '/photo-pending.svg' || p.image === '/icon-512.png' ? 'no photo' : 'own photo'])]);
}

/** Price list → products go live with the given VAT-inclusive price (blank price = skip row). */
export async function importPrices(text: string, by: string) {
  const rows = table(text, ['id', 'price_birr']);
  const current = new Map((await catalog(true, false)).map((p: any) => [p.id, p]));
  const result = { published: 0, updated: 0, skipped: 0, errors: [] as string[] };
  for (const r of rows) {
    const id = Number(r.get('id')), raw = r.get('price_birr');
    if (!raw) { result.skipped++; continue; }
    const p: any = current.get(id);
    if (!Number.isSafeInteger(id) || !p) { result.errors.push(`Line ${r.line}: product id ${r.get('id')} not found.`); continue; }
    const price = num(raw);
    if (!(price > 0) || price > 1000000) { result.errors.push(`Line ${r.line}: price "${raw}" must be a number above 0 (birr, VAT included).`); continue; }
    try {
      const name = r.get('name') || p.name;
      const v = validateProduct({ ...p, name, price, stock: p.stock || 0 });
      const res = await database().prepare(`INSERT INTO products (id,name,category,price_cents,stock,image,manufacturing_date,expiry_date,archived,revision,updated_by,updated_at) VALUES (?,?,?,?,?,?,?,?,0,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,price_cents=excluded.price_cents,archived=0,revision=products.revision+1,updated_by=excluded.updated_by,updated_at=excluded.updated_at`).bind(id, v.name, v.cat, v.priceCents, v.stock, v.image, v.manufacturingDate, v.expiryDate, (p.revision || 0) + 1, by, new Date().toISOString()).run();
      if (res.meta.changes) p.draft ? result.published++ : result.updated++;
    } catch (e) { result.errors.push(`Line ${r.line}: ${e instanceof Error ? e.message : 'invalid row'}`); }
  }
  return result;
}

/** Stock list → supermarket quantities. storeId fixed (storekeeper) or taken from a store_username column (owner). */
export async function importStock(text: string, by: string, storeId: string | null, assignNew: boolean) {
  const rows = table(text, storeId ? ['id', 'quantity'] : ['store_username', 'id', 'quantity']);
  const db = database(), live = new Map((await catalog(false, false)).map((p: any) => [p.id, p]));
  const stores = new Map(((await db.prepare('SELECT id,username FROM stores WHERE active=1').all()).results as any[]).map(s => [s.username, s.id]));
  const result = { updated: 0, added: 0, skipped: 0, errors: [] as string[] };
  for (const r of rows) {
    const id = Number(r.get('id')), qRaw = r.get('quantity');
    if (qRaw === '') { result.skipped++; continue; }
    const sid = storeId || stores.get(r.get('store_username').toLowerCase());
    if (!sid) { result.errors.push(`Line ${r.line}: supermarket "${r.get('store_username')}" not found or not active.`); continue; }
    const p: any = live.get(id);
    if (!p) { result.errors.push(`Line ${r.line}: product ${r.get('id')} not found or archived.`); continue; }
    const pRaw = r.get('price') ?? '';
    let priceCents: number | null = null;
    if (pRaw !== '') { const v = num(pRaw); if (!Number.isFinite(v) || v <= 0 || v > 100000000) { result.errors.push(`Line ${r.line}: price "${pRaw}" must be a number in birr.`); continue; } priceCents = Math.round(v * 100); }
    if (p.draft && priceCents === null) { result.errors.push(`Line ${r.line}: ${p.name} has no Gulit price yet. Add your price in the price column.`); continue; }
    const q = num(qRaw);
    if (!Number.isSafeInteger(q) || q < 0 || q > 100000000) { result.errors.push(`Line ${r.line}: quantity "${qRaw}" must be a whole number of 0 or more.`); continue; }
    let dates;
    try { dates = validateProductDates({ manufacturingDate: r.get('manufacturing_date') || null, expiryDate: r.get('expiry_date') || null }); } catch (e) { result.errors.push(`Line ${r.line}: ${e instanceof Error ? e.message : 'invalid date'}`); continue; }
    const upd = await db.prepare('UPDATE store_stock SET quantity=?,price_cents=COALESCE(?,price_cents),manufacturing_date=COALESCE(?,manufacturing_date),expiry_date=COALESCE(?,expiry_date),revision=revision+1,updated_at=?,updated_by=? WHERE store_id=? AND product_id=?').bind(q, priceCents, dates.manufacturingDate, dates.expiryDate, Date.now(), by, sid, id).run();
    if (upd.meta.changes) { result.updated++; continue; }
    if (!assignNew) { result.errors.push(`Line ${r.line}: ${p.name} is not assigned to your supermarket. Ask Gulit to assign it.`); continue; }
    await db.prepare('INSERT INTO store_stock (store_id,product_id,quantity,price_cents,manufacturing_date,expiry_date,revision,updated_at,updated_by) VALUES (?,?,?,?,?,?,1,?,?) ON CONFLICT(store_id,product_id) DO NOTHING').bind(sid, id, q, priceCents, dates.manufacturingDate, dates.expiryDate, Date.now(), by).run();
    result.added++;
  }
  return result;
}

export async function stockTemplate(storeId: string | null) {
  const db = database(), all = await catalog(false, false);
  if (storeId) {
    const rows = (await db.prepare('SELECT product_id,quantity,price_cents,manufacturing_date,expiry_date FROM store_stock WHERE store_id=?').bind(storeId).all()).results as any[];
    const byId = new Map(all.map((p: any) => [p.id, p]));
    return toCsv([['id', 'name', 'quantity', 'price', 'gulit_price', 'manufacturing_date', 'expiry_date'], ...rows.filter(r => byId.has(r.product_id)).map(r => { const p: any = byId.get(r.product_id); return [r.product_id, p.name, r.quantity, r.price_cents == null ? '' : r.price_cents / 100, p.draft ? '' : p.price, r.manufacturing_date || '', r.expiry_date || '']; })]);
  }
  return toCsv([['store_username', 'id', 'name', 'quantity', 'price', 'manufacturing_date', 'expiry_date'], ...all.map((p: any) => ['', p.id, p.name, '', '', '', ''])]);
}

// Reference photos (taken from other shops' websites while building the catalogue) must be replaced before public launch.
export async function photoSettings() {
  try { const row = await database().prepare("SELECT value FROM settings WHERE key='photos'").first<any>(); if (row) return { hideReference: !!JSON.parse(row.value).hideReference }; } catch {}
  return { hideReference: false };
}
export async function savePhotoSettings(hideReference: boolean) {
  await database().prepare("INSERT INTO settings (key,value,updated_at) VALUES ('photos',?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at").bind(JSON.stringify({ hideReference }), Date.now()).run();
}
export function applyPhotoPolicy(products: any[], hideReference: boolean) {
  return hideReference ? products.map(p => p.photoKind === 'reference' ? { ...p, image: '/photo-pending.svg' } : p) : products;
}
