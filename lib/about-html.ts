// /about: a plain, server-rendered page that explains Gulit in English and Amharic.
// Written for people, search engines and AI assistants (which often cannot run the shop's JavaScript).
// Keep facts here in step with the shop: delivery fees (lib/delivery.ts), payments, services, contact.
import { BUSINESS as B } from './legal-html';

const faq: [string, string][] = [
  ['What is Gulit Online?', 'Gulit Online (ጉሊት) is an online market in Addis Ababa, Ethiopia. You order groceries and household items from Addis supermarkets and shops on gulitonline.com, and Gulit riders deliver them to your door. Gulit also arranges laundry pickup, home repair (MEP), car and garage services, imports and wholesale orders.'],
  ['Which areas does Gulit deliver to?', 'Gulit delivers across Addis Ababa. The delivery fee depends on the distance from the shop to your address.'],
  ['How much is delivery?', 'Delivery is 200 birr up to 3 km, 300 birr up to 6 km, 400 birr up to 9 km, 500 birr up to 12 km and 600 birr up to 15 km, then 100 birr more for every extra 3 km. The exact fee is shown at checkout before you pay.'],
  ['How do I pay?', 'You can pay online with Telebirr, CBE Birr or card, or by bank deposit to CBE with a slip. Nothing is charged when you place the order; you choose how to pay on the next screen.'],
  ['What happens if an item is out of stock?', 'You choose: accept a replacement or do not pay for that item. Nothing is changed without your approval.'],
  ['Does Gulit offer laundry service?', 'Yes. A rider collects your clothes and brings them to a laundry you choose. Each laundry sets its own price per clothing type, and one delivery fee covers pickup and return.'],
  ['Can Gulit import products that are not available in Ethiopia?', 'Yes. With "Import for me" you tell us what you need — for example tiles, lighting, kitchen items or foods — and Gulit sends one full quote (product, shipping, customs, delivery) before you pay.'],
  ['Do you sell wholesale to businesses outside Addis Ababa?', 'Yes. Shop owners in other cities can order in bulk online. Gulit buys the goods in Addis, packs them and loads them onto the customer\'s own truck or Isuzu.'],
  ['Can my shop sell on Gulit?', 'Yes. Supermarkets, shops, kiosks, laundries and service providers can apply at gulitonline.com/partners.'],
  ['Who operates Gulit?', `Gulit Online is operated by ${B.legal}, Addis Ababa, Ethiopia. Phone ${B.phone} or ${B.phone2}.`],
];
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const ld = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': ['OnlineStore', 'LocalBusiness'], '@id': 'https://gulitonline.com/#organization', name: 'Gulit Online Market', alternateName: ['ጉሊት', 'Gulit Online', 'Gulit'], legalName: 'M O M MANUFACTURING PLC', url: 'https://gulitonline.com/', logo: 'https://gulitonline.com/icon-512.png', image: 'https://gulitonline.com/social/og.jpg', telephone: B.phone, email: B.email, description: 'Online market and delivery service in Addis Ababa, Ethiopia: groceries from Addis supermarkets delivered to your door, laundry pickup, home repair, import for me and wholesale.', address: { '@type': 'PostalAddress', streetAddress: 'Bole, Woreda 13/14', addressLocality: 'Addis Ababa', addressCountry: 'ET' }, areaServed: { '@type': 'City', name: 'Addis Ababa' }, currenciesAccepted: 'ETB', paymentAccepted: 'Telebirr, CBE Birr, card, bank deposit', knowsLanguage: ['en', 'am'], sameAs: ['https://t.me/gulitonline1', 'https://www.youtube.com/@GulitOnlineMarket', 'https://www.tiktok.com/@gulitonline'] },
    { '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
  ],
};
export const aboutHtml = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>About Gulit Online · Grocery delivery in Addis Ababa | ጉሊት</title><meta name="description" content="Gulit Online (ጉሊት) delivers groceries from Addis Ababa supermarkets to your door, plus laundry pickup, home repair, import for me and wholesale. Delivery from 200 birr. Pay with Telebirr, CBE Birr or card."><link rel="canonical" href="https://gulitonline.com/about"><meta property="og:type" content="website"><meta property="og:title" content="Gulit Online · Your market, delivered in Addis Ababa"><meta property="og:description" content="Groceries from Addis supermarkets delivered to your door. Laundry, home repair, import for me and wholesale."><meta property="og:url" content="https://gulitonline.com/about"><meta property="og:image" content="https://gulitonline.com/social/og.jpg"><meta name="twitter:card" content="summary_large_image"><link rel="icon" href="/favicon.svg"><script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script><style>body{margin:0;font:17px/1.65 Arial,sans-serif;color:#18372f;background:#f6f5f0}header{background:#133d32;color:#fff;padding:18px 20px}header a{color:#d5ed84;text-decoration:none;font-weight:700;font-size:22px}main{max-width:780px;margin:0 auto;padding:24px 18px 60px;background:#fff}h1{font-size:30px;line-height:1.2;margin:8px 0 6px}h2{font-size:22px;margin:30px 0 8px}h3{font-size:18px;margin:18px 0 4px}p,li{max-width:70ch}ul{padding-left:22px}table{border-collapse:collapse;margin:8px 0}td,th{border:1px solid #dfe5da;padding:6px 12px;text-align:left}.am{color:#3c564d}.cta{display:inline-block;background:#133d32;color:#d5ed84;padding:12px 20px;border-radius:30px;text-decoration:none;font-weight:700;margin:8px 8px 0 0}a{color:#133d32}nav{display:flex;gap:16px;flex-wrap:wrap;margin-top:30px;padding-top:16px;border-top:1px solid #e3e8df}</style></head><body><header><a href="/">Gulit.</a></header><main>
<h1>Gulit Online — your market, delivered in Addis Ababa</h1>
<p class="am" lang="am">ጉሊት ኦንላይን — ገበያዎ እቤትዎ ድረስ። ከአዲስ አበባ ሱፐርማርኬቶችና ሱቆች ዕቃዎን በስልክዎ ያዝዙ፣ እኛ ደጃፍዎ ድረስ እናደርሳለን።</p>
<p><b>Gulit Online</b> is an online market and delivery service in <b>Addis Ababa, Ethiopia</b>. Customers order groceries and household products from Addis supermarkets, shops and kiosks on <a href="https://gulitonline.com/">gulitonline.com</a>, in English or Amharic, and Gulit riders deliver them to the door. Gulit is operated by ${esc(B.legal)}.</p>
<a class="cta" href="/">Start shopping</a><a class="cta" href="/suggest">Suggest a product</a>
<h2>Services</h2>
<ul>
<li><b><a href="/">Grocery &amp; supermarket delivery</a></b> — fruit, vegetables, milk, coffee, oil, soap and household items from Addis supermarkets. <span class="am" lang="am">የሱፐርማርኬት ዕቃ ማድረስ</span></li>
<li><b><a href="/laundry">Laundry pickup &amp; return</a></b> — choose a laundry and its price per clothing type; one delivery fee covers pickup and return. <span class="am" lang="am">ልብስ ማጠብ</span></li>
<li><b><a href="/mep">Home repair (MEP)</a></b> — plumbing, electrical and mechanical work with a quote before you pay. <span class="am" lang="am">የቧንቧ፣ የኤሌክትሪክና የመካኒካል ሥራ</span></li>
<li><b><a href="/garage">Car &amp; garage</a></b> — car service requests through customer care.</li>
<li><b><a href="/import">Import for me</a></b> — products you cannot find in Ethiopia, including Arabian and healthy foods, imported with one full quote. <span class="am" lang="am">አስመጣልኝ</span></li>
<li><b><a href="/wholesale">Wholesale to your city</a></b> — bulk orders for businesses outside Addis, loaded onto your own truck or Isuzu. <span class="am" lang="am">ጅምላ እስከ ከተማዎ</span></li>
</ul>
<h2>Delivery fees in Addis Ababa</h2>
<table><tr><th>Distance</th><th>Fee</th></tr><tr><td>Up to 3 km</td><td>200 birr</td></tr><tr><td>3–6 km</td><td>300 birr</td></tr><tr><td>6–9 km</td><td>400 birr</td></tr><tr><td>9–12 km</td><td>500 birr</td></tr><tr><td>12–15 km</td><td>600 birr</td></tr><tr><td>Over 15 km</td><td>+100 birr every 3 km</td></tr></table>
<p>The exact fee is shown at checkout before you pay.</p>
<h2>How to order</h2>
<ol><li>Open <a href="/">gulitonline.com</a> and choose a supermarket or shop.</li><li>Add items to your bag and enter your address.</li><li>Pay online (Telebirr, CBE Birr or card) or by CBE bank deposit.</li><li>Follow your order: confirmed → packed → on the way → delivered.</li></ol>
<h2>Frequently asked questions</h2>
${faq.map(([q, a]) => `<h3>${esc(q)}</h3><p>${esc(a)}</p>`).join('')}
<h2>Contact</h2>
<p>${esc(B.legal)} (Gulit Online), Bole, Woreda 13/14, Addis Ababa, Ethiopia<br>Phone: <a href="tel:${B.phone}">${B.phone}</a> · <a href="tel:${B.phone2}">${B.phone2}</a><br>Telegram: <a href="https://t.me/gulitonline1">t.me/gulitonline1</a> · TikTok: <a href="https://www.tiktok.com/@gulitonline">@gulitonline</a> · YouTube: <a href="https://www.youtube.com/@GulitOnlineMarket">@GulitOnlineMarket</a></p>
<nav><a href="/">Shop</a><a href="/partners">Sell on Gulit</a><a href="/support">Help &amp; support</a><a href="/privacy">Privacy policy</a><a href="/terms">Terms</a></nav>
</main></body></html>`;
