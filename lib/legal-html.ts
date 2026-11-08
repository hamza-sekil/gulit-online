// Public policy pages required by Google Play and the App Store (privacy policy URL, support URL, terms).
// Business details match the shop footer. Have a lawyer review before publishing in the stores.
export const BUSINESS = {
  trade: 'Gulit Online',
  legal: 'MOM Manufacturing PLC',
  country: 'Ethiopia',
  city: 'Addis Ababa',
  phone: '+251909225566',
  phone2: '+251910828617',
  email: 'ceo@mommanufacturingplc.com',
  site: 'https://gulitonline.com',
  updated: '7 November 2026',
};
const B = BUSINESS;
const shell = (title: string, body: string) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} · Gulit Online</title><meta name="description" content="${title} for Gulit Online, operated by ${B.legal}."><link rel="icon" href="/favicon.svg"><style>body{margin:0;font:17px/1.65 Arial,sans-serif;color:#18372f;background:#f6f5f0}header{background:#133d32;color:#fff;padding:18px 20px}header a{color:#d5ed84;text-decoration:none;font-weight:700;font-size:22px}main{max-width:760px;margin:0 auto;padding:24px 18px 60px;background:#fff}h1{font-size:30px;line-height:1.2;margin:8px 0 6px}h2{font-size:21px;margin:28px 0 8px}p,li{max-width:70ch}ul{padding-left:22px}.muted{color:#627269;font-size:15px}a{color:#133d32}nav{display:flex;gap:16px;flex-wrap:wrap;margin-top:30px;padding-top:16px;border-top:1px solid #e3e8df}.contact{background:#eef4e4;border-radius:10px;padding:14px 16px}</style></head><body><header><a href="/">Gulit.</a></header><main><h1>${title}</h1><p class="muted">Last updated ${B.updated} · ${B.trade} is operated by ${B.legal}, ${B.city}, ${B.country}.</p>${body}<nav><a href="/">Shop</a><a href="/privacy">Privacy policy</a><a href="/terms">Terms</a><a href="/support">Help &amp; support</a><a href="/partners">Sell on Gulit</a><a href="/partners/agreement">Partner agreement</a></nav></main></body></html>`;
const contact = `<div class="contact"><b>${B.legal}</b> (${B.trade})<br>${B.city}, ${B.country}<br>Phone: <a href="tel:${B.phone}">${B.phone}</a> · <a href="tel:${B.phone2}">${B.phone2}</a><br>Email: <a href="mailto:${B.email}">${B.email}</a><br>Or use <b>Customer care</b> chat in the shop.</div>`;

export const privacyHtml = shell('Privacy policy', `
<p>This policy explains what personal information Gulit Online collects when you use our website and apps, why, who we share it with, and your choices. You can shop without creating an account.</p>
<h2>Information we collect</h2>
<ul>
<li><b>Order details:</b> your name, phone number, delivery address and city, the items you order, prices and totals.</li>
<li><b>Location (optional):</b> if you add a Google Maps link or tap "Use my current location", we save that map point to deliver your order and to work out the delivery zone. We do not track your location in the background.</li>
<li><b>Payments:</b> online payments (Telebirr, CBE Birr, cards) are handled by our payment provider Chapa on its own secure page. We receive the payment result, amount and a reference, but never your card number, PIN or wallet password. If you pay by bank deposit, we store the photo of the deposit slip you upload.</li>
<li><b>Customer care messages</b> you send us in the chat.</li>
<li><b>Technical data:</b> your device's IP address is used briefly, in scrambled (hashed) form, to stop abuse such as repeated sign-in attempts. Our hosting provider keeps standard security logs.</li>
<li><b>On your device:</b> the shop stores your cart, favourites, language and the private codes for your orders and chats in your browser's local storage, so you can find them again. Clearing your browser data removes them from the device.</li>
</ul>
<p>We do not use advertising trackers or sell personal information.</p>
<h2>How we use it</h2>
<ul><li>To prepare, deliver and support your order, including replacement offers when an item is not available.</li><li>To take payments, issue invoices and refunds, and keep accounting and tax records.</li><li>To answer your questions, prevent fraud and keep the service secure.</li><li>To measure our service quality, for example delivery times and stock accuracy (in summary form).</li></ul>
<h2>Who we share it with</h2>
<ul>
<li><b>The supermarket</b> that prepares your order sees the items and your first name only.</li>
<li><b>The rider</b> delivering your order sees your name, phone number, address, map point and items. Riders may be Gulit employees, contracted motorbike owners or a delivery partner such as Yango.</li>
<li><b>Chapa</b> (payments) receives your name, phone number and the amount to process your payment.</li>
<li><b>Cloudflare</b> hosts our website, database and files.</li>
<li><b>Authorities</b>, when Ethiopian law requires it.</li>
</ul>
<h2>How long we keep it</h2>
<p>We keep order, invoice and payment records as long as needed for accounting and tax law. Chat messages and deposit slips are kept with the order. Map points are kept with the order they belong to.</p>
<h2>Your choices and rights</h2>
<p>You can ask us for a copy of your information, to correct it, or to delete it where we are not required to keep it by law. Contact us with your order number or phone number. Because there are no customer accounts, we may ask you to confirm the order code shown on your device.</p>
<h2>Children</h2><p>Gulit Online is not intended for children under 18. Orders should be placed by adults.</p>
<h2>Staff apps</h2><p>Storekeepers, riders and engineers who use our staff apps share work information with us, such as order actions and, for riders and engineers who choose to go online, their current location while available. This is used only to assign and track work.</p>
<h2>Security</h2><p>Connections are encrypted (HTTPS). Order and chat links are protected with private codes, and staff passwords and codes are stored only in scrambled form.</p>
<h2>Changes</h2><p>We will update this page when our practices change and show the new date at the top.</p>
<h2>Contact</h2>${contact}`);

export const termsHtml = shell('Terms of service', `
<p>These terms apply when you order through Gulit Online. By placing an order you agree to them.</p>
<h2>What Gulit does</h2><p>Gulit Online lets you buy groceries and other products from partner supermarkets in Addis Ababa and arranges delivery. Each order is prepared by one supermarket, which sells you the goods. Gulit provides the platform, customer care and delivery.</p>
<h2>Prices and two bills</h2><ul><li><b>Supermarket bill:</b> the goods, at the supermarket's price including its VAT.</li><li><b>Gulit bill:</b> a 4% service charge on the goods (before VAT) plus the delivery fee, with 15% VAT on both.</li><li>Delivery fees in Addis Ababa depend on the distance from the supermarket to your map point, by zone. They are shown before you pay. Outside Addis, delivery is quoted before payment.</li></ul>
<h2>Payment</h2><p>Pay each bill online through Chapa (Telebirr, CBE Birr or card) or by bank deposit with a slip. Online payments are confirmed automatically, and deposit slips are checked by our team. An order is delivered only after both bills are paid. Unpaid orders are cancelled after 24 hours.</p>
<h2>Items not available and replacements</h2><p>If an item is not on the shelf, we may offer you a similar item at the same price or less. You can accept or decline. If you do not answer within the time shown, the item is removed and you are not charged for it. Amounts already paid for removed items are refunded.</p>
<h2>Delivery</h2><p>Delivery usually takes 30–60 minutes after both payments are confirmed. This is an estimate, not a guarantee. Please keep your phone on so the rider can reach you, and check your items on delivery.</p>
<h2>Cancellations and refunds</h2><p>Contact customer care quickly if you need to cancel. Once a rider has picked up the order, it cannot be cancelled. Refunds for cancelled orders, removed items or double payments are paid back to the original payment method or bank account.</p>
<h2>Problems with an order</h2><p>Tell us within 24 hours if items are missing, damaged or wrong, with photos if possible. We will arrange a refund or replacement with the supermarket.</p>
<h2>Supermarkets and other sellers</h2><p>Businesses that sell through Gulit — supermarkets, shops, bakeries, producers and others — do so under the <a href="/partners/agreement">Gulit Business Partner Agreement</a>. To become a partner, apply at <a href="/partners">gulitonline.com/partners</a>.</p><h2>Acceptable use</h2><p>Do not misuse the service, place fake orders, upload false payment slips or try to access other people's orders. We may refuse or cancel orders in these cases.</p>
<h2>Liability</h2><p>We take reasonable care to provide the service. Product quality and labelling are the responsibility of the supermarket and manufacturer. Nothing in these terms limits rights you have under Ethiopian consumer protection law.</p>
<h2>Changes and law</h2><p>We may update these terms and will show the date at the top. These terms are governed by the laws of Ethiopia.</p>
<h2>Contact</h2>${contact}`);

export const supportHtml = shell('Help & support', `
<p>We are here to help with orders, payments and delivery.</p>
<h2>Contact us</h2>${contact}
<h2>Common questions</h2>
<p><b>Where is my order?</b> Open <b>My orders</b> in the shop. The progress bar shows: placed, supermarket confirmed, packed, on the way, delivered.</p>
<p><b>Why are there two payments?</b> The goods are sold by the supermarket, so you pay the supermarket's bill and Gulit's service and delivery bill separately. Both can be paid online.</p>
<p><b>An item was not available.</b> You can accept a similar item or have it removed. You are never charged for removed items.</p>
<p><b>I paid twice or need a refund.</b> Contact us with your order number. Refunds go back to your original payment method.</p>
<p><b>Delete my information.</b> Contact us with your order number or phone number. See our <a href="/privacy">privacy policy</a>.</p>`);
