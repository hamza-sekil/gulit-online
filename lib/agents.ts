import { database } from './catalog';
import { digest, hex } from './password-auth';
import { opsSettings } from './settings';

// Gulit Agents: businesses post "agent wanted" jobs (paid, checked by the owner before going live),
// and people across Ethiopia apply to a job or register as an agent. Public page /agents,
// business page /agents?manage=<token>, owner page /admin/agents.

export const REGIONS = ['All Ethiopia', 'Addis Ababa', 'Afar', 'Amhara', 'Benishangul-Gumuz', 'Central Ethiopia', 'Dire Dawa', 'Gambella', 'Harari', 'Oromia', 'Sidama', 'Somali', 'South Ethiopia', 'South West Ethiopia', 'Tigray'];
export const CATEGORIES = ['Food & drinks', 'Household & cleaning', 'Beauty & personal care', 'Building materials', 'Electronics & phones', 'Clothing & textile', 'Agriculture', 'Medicine & health', 'Services', 'Other'];
export const MODELS = ['Buy & resell', 'Commission', 'Salary + commission'];
export const POST_STATUSES = ['pending', 'live', 'closed', 'rejected'];
export const PEOPLE_STATUSES = ['new', 'contacted', 'accepted', 'rejected'];
export const POST_DAYS = 30;

const str = (v: unknown, max: number) => String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);
const phoneOk = (p: string) => /^\+?[0-9 ()-]{9,20}$/.test(p) && p.replace(/\D/g, '').length >= 9;
const list = (v: unknown, allowed: string[]) => (Array.isArray(v) ? [...new Set(v.map(x => str(x, 40)).filter(x => allowed.includes(x)))] : []);
const newId = (p: string) => p + '-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();

export function validatePost(b: any) {
  const a = {
    company: str(b.company, 100), product: str(b.product, 120), category: str(b.category, 40), model: str(b.model, 30),
    cities: list(b.cities, REGIONS), coverage: str(b.coverage, 200), terms: str(b.terms, 500), needs: str(b.needs, 500),
    description: str(b.description, 1000), contactName: str(b.contactName, 100), phone: str(b.phone, 25), tin: str(b.tin, 30),
  };
  if (a.company.length < 2) throw Error('Enter the business name.');
  if (a.product.length < 2) throw Error('Enter the product or service the agent will sell.');
  if (!CATEGORIES.includes(a.category)) throw Error('Choose a category.');
  if (!MODELS.includes(a.model)) throw Error('Choose how the agent earns.');
  if (!a.cities.length) throw Error('Choose at least one region.');
  if (a.terms.length < 10) throw Error('Explain what the agent earns (price, margin or commission).');
  if (a.contactName.length < 2) throw Error('Enter the contact person’s name.');
  if (!phoneOk(a.phone)) throw Error('Enter a valid phone number.');
  return a;
}
export function validatePerson(b: any) {
  const a = {
    name: str(b.name, 100), phone: str(b.phone, 25), region: str(b.region, 40), city: str(b.city, 60),
    categories: list(b.categories, CATEGORIES), hasShop: b.hasShop === true, hasVehicle: b.hasVehicle === true,
    experience: str(b.experience, 500), message: str(b.message, 500),
  };
  if (a.name.length < 2) throw Error('Enter your full name.');
  if (!phoneOk(a.phone)) throw Error('Enter a valid phone number.');
  if (!REGIONS.includes(a.region) || a.region === 'All Ethiopia') throw Error('Choose your region.');
  if (a.city.length < 2) throw Error('Enter your city or town.');
  return a;
}

/** A business posts a job. It stays pending until the owner confirms payment. The manage token is shown once. */
export async function savePost(a: any) {
  const id = newId('AG'), token = hex(crypto.getRandomValues(new Uint8Array(24)));
  await database().prepare('INSERT INTO agent_posts (id,created_at,status,payload,manage_hash,note,featured) VALUES (?,?,?,?,?,?,0)').bind(id, Date.now(), 'pending', JSON.stringify(a), await digest(token), '').run();
  const fee = (await opsSettings()).agentPostFee;
  return { id, token, fee, days: POST_DAYS };
}
export async function savePerson(a: any, postId: string | null) {
  const db = database();
  if (postId) {
    const p = await db.prepare("SELECT id FROM agent_posts WHERE id=? AND status='live' AND (expires_at IS NULL OR expires_at>?)").bind(postId, Date.now()).first();
    if (!p) throw Error('This agent job is no longer open.');
    const dup = await db.prepare('SELECT id FROM agent_people WHERE post_id=? AND json_extract(payload,\'$.phone\')=?').bind(postId, a.phone).first();
    if (dup) throw Error('You already applied for this job. The business will contact you.');
  }
  const id = newId('AP');
  await db.prepare('INSERT INTO agent_people (id,created_at,post_id,status,payload,note) VALUES (?,?,?,?,?,?)').bind(id, Date.now(), postId, 'new', JSON.stringify(a), '').run();
  return id;
}

/** Public list: live, not expired. The business phone is not shown publicly; agents apply through Gulit. */
export async function livePosts() {
  const rows = (await database().prepare("SELECT id,created_at,payload,featured,expires_at FROM agent_posts WHERE status='live' AND (expires_at IS NULL OR expires_at>?) ORDER BY featured DESC, created_at DESC LIMIT 300").bind(Date.now()).all()).results as any[];
  return rows.map(r => {
    const p = JSON.parse(r.payload);
    return { id: r.id, createdAt: r.created_at, featured: !!r.featured, company: p.company, product: p.product, category: p.category, model: p.model, cities: p.cities, coverage: p.coverage, terms: p.terms, needs: p.needs, description: p.description };
  });
}
export async function postByToken(token: string) {
  if (!/^[0-9a-f]{48}$/.test(token)) return null;
  const db = database(), row = await db.prepare('SELECT * FROM agent_posts WHERE manage_hash=?').bind(await digest(token)).first<any>();
  if (!row) return null;
  const people = (await db.prepare('SELECT id,created_at,status,payload FROM agent_people WHERE post_id=? ORDER BY created_at DESC LIMIT 500').bind(row.id).all()).results as any[];
  return {
    post: { id: row.id, createdAt: row.created_at, status: row.status, expiresAt: row.expires_at, ...JSON.parse(row.payload) },
    applicants: row.status === 'live' || row.status === 'closed' ? people.map(x => ({ id: x.id, createdAt: x.created_at, status: x.status, ...JSON.parse(x.payload) })) : [],
    waiting: row.status === 'pending' ? people.length : 0,
    fee: (await opsSettings()).agentPostFee,
  };
}
