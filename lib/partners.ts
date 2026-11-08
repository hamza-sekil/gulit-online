import { database } from './catalog';
import { AGREEMENT_VERSION } from './partner-agreement-html';
// Partner business applications (supermarkets, shops, bakeries, producers…) (public form at /partners → owner review at /admin/partners).
export const CATEGORIES = ['Groceries & pantry', 'Fruit & vegetables', 'Meat, dairy & eggs', 'Bakery', 'Drinks', 'Household & cleaning', 'Beauty & personal care', 'Baby & kids', 'Ready meals'];
export const TYPES = ['Supermarket', 'Mini-market / shop', 'Bakery', 'Butcher', 'Fruit & vegetable shop', 'Dairy / eggs', 'Cosmetics & personal care shop', 'Restaurant / café', 'Producer / manufacturer', 'Wholesaler / distributor', 'Other'];
export const SIZES = ['Under 500', '500–2,000', '2,000–5,000', 'Over 5,000'];
export const PAYOUTS = ['Bank account', 'Telebirr', 'CBE Birr'];
export const STATUSES = ['new', 'contacted', 'approved', 'rejected'];
const str = (v: unknown, max: number) => String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);
export function validateApplication(b: any) {
  const a: any = {
    businessType: str(b.businessType, 40), supermarket: str(b.supermarket, 100), branches: str(b.branches, 200), address: str(b.address, 300), mapLink: str(b.mapLink, 500),
    contactName: str(b.contactName, 100), contactRole: str(b.contactRole, 60), phone: str(b.phone, 25), email: str(b.email, 120),
    licence: str(b.licence, 60), tin: str(b.tin, 30), hours: str(b.hours, 60), size: str(b.size, 30),
    categories: Array.isArray(b.categories) ? b.categories.map((c: unknown) => str(c, 40)).filter((c: string) => CATEGORIES.includes(c)) : [],
    software: str(b.software, 100), payout: str(b.payout, 30), notes: str(b.notes, 1000), agree: b.agree === true,
  };
  if (!TYPES.includes(a.businessType)) throw Error('Choose the type of business.');
  if (a.supermarket.length < 2) throw Error('Enter the business name.');
  if (a.address.length < 4) throw Error('Enter the sub-city and address.');
  if (a.contactName.length < 2) throw Error('Enter the contact person’s name.');
  if (!/^\+?[0-9 ()-]{9,20}$/.test(a.phone) || a.phone.replace(/\D/g, '').length < 9) throw Error('Enter a valid phone number.');
  if (a.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.email)) throw Error('Enter a valid email or leave it empty.');
  if (a.mapLink && !/^https:\/\//i.test(a.mapLink)) throw Error('The map link must start with https://');
  if (a.size && !SIZES.includes(a.size)) throw Error('Choose the number of products.');
  if (a.payout && !PAYOUTS.includes(a.payout)) throw Error('Choose how you want to receive payments.');
  if (!a.agree) throw Error('Please read and agree to the partner agreement.');
  a.agreementVersion = AGREEMENT_VERSION; a.agreedAt = Date.now();
  return a;
}
export async function saveApplication(a: any) {
  const id = 'SUP-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
  await database().prepare('INSERT INTO partner_applications (id,created_at,status,payload,note) VALUES (?,?,?,?,?)').bind(id, Date.now(), 'new', JSON.stringify(a), '').run();
  return id;
}
