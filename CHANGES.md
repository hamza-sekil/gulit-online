# Gulit Online — version 27 changes (7 November 2026)

Built on the version 26 handover (commit `0ed1e2fa`). All existing tests still pass, plus a new `tests/payments.test.mjs`.

## What changed: online payments through Chapa

Customers still pay two separate bills (seller goods, and Gulit service + delivery), but each bill can now be paid **online** with Telebirr, CBE Birr or a bank card through Chapa's secure checkout. Bank-deposit slips still work as a fallback.

| Bill | Who receives the money | How |
|---|---|---|
| Gulit payment (4% service + delivery + VAT) | Gulit's Chapa account | Normal Chapa checkout |
| Seller payment (goods incl. seller VAT) | The supermarket's bank account | Chapa split payment to the supermarket's sub-account; Gulit keeps the supermarket commission (1% by default, set per supermarket) |

- A payment is marked **paid** only after Gulit's server asks Chapa directly and Chapa confirms success, birr currency and the full amount. Callback and webhook messages are never trusted on their own.
- A customer who comes back from the Chapa page sees the order refreshed and confirmed immediately.
- If a customer pays the same bill twice, the second payment is flagged on the owner's order page for refund.
- If `CHAPA_SECRET_KEY` is not set, the shop hides the online buttons and works exactly as before (slips only).

## Screens

- **Shop → order page:** "Pay online now · Telebirr, CBE Birr or card" button on each bill when it is ready, plus "Paid online" status. The slip upload stays below it.
- **Owner → Supermarkets (`/admin/stores`):** new "Online payout" button per supermarket to save its Chapa sub-account ID and Gulit commission %.
- **Owner → Orders (`/admin/orders`):** choose the supermarket for an order's seller payment ("Link supermarket for online payment"), see Chapa references, duplicate-payment warnings, and a "Check online payments with Chapa" button.

## Files

New: `lib/payments.ts`, `app/api/orders/pay/route.ts`, `app/api/payments/chapa/route.ts`, `drizzle/0009_online_payments.sql`, `drizzle/meta/0009_snapshot.json`, `tests/payments.test.mjs`, this file, `MOVE_TO_OWN_CLOUDFLARE.md`.

Changed: `lib/orders.ts`, `lib/storefront-html.ts`, `lib/admin-stores-html.ts`, `app/admin/orders/route.ts`, `app/api/admin/orders/route.ts`, `app/api/admin/stores/route.ts`, `db/schema.ts`, `drizzle/meta/_journal.json`, `cloudflare-env.d.ts`, tests that build the schema (`catalog`, `storekeeper`), and the handover docs (`ENVIRONMENT*`, `DATABASE.md`, `schema.sql`, `FEATURE_STATUS.md`).

`handover/deployment-artifact-v26.tar.gz` and `handover/SHA256SUMS.txt` describe version 26 and are now out of date; rebuild after deploying.

## Setup before going live

1. **Open a Chapa merchant account** for Gulit and complete their business verification. Set settlement to **automatic** (Chapa's split payments only work with automatic settlement).
2. **Get the secret key** from the Chapa dashboard. Start with the **test** key.
3. **Add the database change:** apply migration `0009_online_payments.sql` (normal deploys apply pending migrations; on a manual setup run it once).
4. **Set the secret** on the Worker: `wrangler secret put CHAPA_SECRET_KEY`. Never put it in the code.
5. **For each supermarket:** create a sub-account in the Chapa dashboard with the supermarket's bank account, then in `/admin/stores` press **Online payout**, paste the sub-account ID and set the commission (1).
6. **Optional webhook:** in the Chapa dashboard set `https://gulitonline.com/api/payments/chapa`. Not required, because the callback and the customer's return also confirm payments.
7. **Decide who pays Chapa's fee** (Gulit or the customer) in the Chapa dashboard settings.
8. **Test end to end with the test key**: one order, pay both bills online, check both show "Paid online" and the order shows "Payment verified" and can be dispatched. Then switch to the live key.

## Day-to-day for customer care

When an order comes in, open it in `/admin/orders`, choose the supermarket under the seller bill and press **Link supermarket for online payment**. The customer can then pay the seller online. The Gulit bill can be paid online straight away.

## Not done yet (next steps)

- Distance-zone delivery fees (300 / 550 / 850 / 1,200 birr). The code still uses a flat 400 birr in Addis.
- Automatic refunds for items that turn out to be missing (refund manually in the Chapa dashboard for now).
- Stock reservation, so two customers can't buy the same last item.
- Picking the supermarket automatically, and driver pickup at that supermarket instead of Adwa 00.
- Amharic translations for the new payment texts.

---

# Version 28 changes (7 November 2026)

## Orders go to the right supermarket automatically

- When a customer places an order, Gulit picks the **nearest active supermarket that has every item** in stock. If the customer added a map pin, "nearest" is measured from that pin.
- Those items are **deducted from that supermarket's stock straight away**, so two customers can't buy the same last item.
- If that supermarket has a Chapa payout account, the seller bill can be **paid online immediately**; customer care no longer needs to link it by hand.
- Stock goes back if the owner **cancels** the order, or after **24 hours** with nothing paid. Orders with a slip under review, or someone on the Chapa page, are kept.
- If no single supermarket has everything, the order works as before and customer care chooses a supermarket on the orders page. Choosing one moves the stock hold there.

## Delivery fee by distance zone

| Zone | Distance from supermarket to customer | Fee before VAT |
|---|---|---|
| 1 | under 3 km | 300 birr |
| 2 | 3–7 km | 550 birr |
| 3 | 7–12 km | 850 birr |
| 4 | over 12 km | 1,200 birr |

- Distance is the straight line from the supermarket's map location to the customer's pin, × 1.3 for roads.
- No pin (or a short `maps.app.goo.gl` link without coordinates) → **Zone 2 as an estimate**, clearly marked. Customer care can change the zone until the Gulit bill is paid.
- The owner can change the fees and distances on the orders page (**Delivery fees by distance zone**).
- Outside Addis is unchanged: 450 birr/km quoted by customer care.

## Storekeeper app: orders to prepare

- Each supermarket sees its own orders (no customer phone numbers), with items to pick.
- **Not available** on an item removes it from the customer's bill and records 0 in stock. If the bill was already paid, the owner sees **Refund due** with the amount.
- **Packed – ready for pickup** tells the driver and the owner the bag is ready.

## Driver app

- Each job shows **1. Pick up at the supermarket** (with map link and "packed" status), then **2. Deliver to** the customer. Adwa 00 is no longer used for Addis orders.

## Owner pages

- **Supermarkets:** new **Map location** button per supermarket. Paste the coordinates; this is needed for distance pricing.
- **Orders:** each order is now a short card (customer, total, status, alerts) that opens for details. Inside: supermarket and hold status, items not available, delivery zone (changeable), **Refund due / Mark refunded**, and **Cancel order**.
- Paid-twice and paid-after-cancel online payments are flagged for refund.

## Phone layout (all apps)

- Every screen was checked at phone width (390 px) in a real browser: shop, cart, checkout, order and payment, owner products / orders / supermarkets / drivers / engineers / customer care / login, storekeeper, driver and engineer apps. None scroll sideways now; the owner products page used to.
- One **owner menu bar** on every owner page that stays at the top and swipes sideways on phones, with Sign out.
- **Shop payment cards:** the "Pay online" button comes first; bank-deposit details and slip upload fold under "Or pay by bank deposit".
- Amharic added for the new payment and delivery texts in the shop. Have a native speaker check the wording.

## Tests

New `tests/routing.test.mjs`. All 15 test groups pass. Tests now load modules safely in parallel.

## Still to do

- Automatic refunds through Chapa's refund API. For now the owner refunds in the Chapa dashboard and taps **Mark refunded**.
- Splitting one basket across several supermarkets (phase 3 in the plan).
- Road distance from a maps service instead of straight line × 1.3.
- Notifications (sound/push) for storekeepers when a new order arrives. The app refreshes itself while open.

---

# Version 29 changes (7 November 2026): the rest of the development plan

## Supermarkets confirm every order in time
- A new order shows in the storekeeper app with a red frame and a **countdown** (10 minutes by default). There's an optional **alarm sound and vibration**: tap "Turn on order sound" once per phone.
- **Confirm order** starts picking. Marking an item or packing also counts as confirming.
- If the time runs out, the order **moves automatically** to the next nearest supermarket that has every item, as long as the goods haven't been paid yet. The stock hold moves with it, delivery is re-priced if the Gulit bill isn't paid, and the new store gets a fresh countdown. If the goods are already paid to that store, the order stays there and the supervisor gets an alert to call the store.

## Replacements instead of missing items
- When a storekeeper taps **Not available**, Gulit looks in the same supermarket for a similar item (same category, in stock, 70–100% of the price). If there is one, the customer sees **"Replace it with …? Yes / No"** on the order page.
- No answer within **5 minutes** means the item is removed, the customer is not charged for it, and the order continues.
- Accepting holds the replacement's stock and adds it to the storekeeper's pick list. Packing waits for the answer.
- If a paid bill goes down, the owner sees **Refund due**.

## Live operations page (owner menu → Live)
- **Open orders** with stage and minutes since ordering. Late or blocked orders have a **red** edge and say why: not confirmed, missed limit, paid but not delivered in 60 min, no rider, rider not picked up after 20 min, delivery problem, or waiting for a replacement answer.
- Buttons for each order: call the customer, supermarket or rider; move to another supermarket; **Booked with Yango** (records the cost), Yango picked up and delivered; mark alerts as handled.
- **KPIs for the last 7 days** with the plan's targets: confirmed on time (95%), items available (95%), delivered within 60 min (90%), delivery problems (under 3%), average basket, orders per supermarket per day. Also delivery fees against rider costs by group.
- **Supermarket scores (0–5):** 40% confirmed on time, 40% items available, 20% no delivery problems. Equally near supermarkets get orders in score order.
- **Rules** you can change: confirm time, replacement reply time, when an order counts as late, when to book Yango, and the storekeeper bonus.

## Supermarket details
- **Hours, radius & phone** button on the Supermarkets page. Closed supermarkets, and customers outside a supermarket's radius, are skipped when choosing a supermarket.

## Riders
- Riders are either **own riders (salary)** or **contracted motorbike owners (paid per trip)**, set when creating them or with **Group & pay**.
- In the driver app riders tap **Go online for deliveries**, which shares their location once.
- Paid orders go automatically to the **nearest free rider: own riders first, then contracted**. If nobody is free for 5 minutes, the Live page asks you to **book Yango**.
- Each delivery records who delivered it and what it cost (contracted trip fee, or the Yango price you enter).
- Pick-up, on the way and delivered times are saved on the order for the KPIs and the customer's progress bar.

## Customers
- A progress bar on the order: placed → supermarket confirmed → packed → on the way → delivered, with **"Delivery usually takes 30–60 minutes after both payments are confirmed."**

## Storekeepers
- **My performance:** orders packed today, confirmed on time, correct picks, and the week's bonus. The bonus counts orders confirmed on time with no missing items, at the amount you set on the Live page.

## Tests
- New `tests/operations.test.mjs`. All 16 test groups pass. Every screen was checked again at phone width.

## Left for later (as in the plan)
- Cash on delivery: it doesn't fit the two separate payments. Tell me if you want it with a limit.
- Personal logins for each storekeeper (phone + PIN). Today each supermarket shares one login.
- Barcode scanning, baskets split across supermarkets, direct links to supermarket stock systems.
- The open "Gulit Delivery" service for anyone (parcels, phone bookings). The rider app and dispatch are ready to be reused for it.
- Separate supervisor logins limited to 2–3 supermarkets. The Live page is owner-only for now.

---

# Version 30 changes (7 November 2026): ready for Gulit's own Cloudflare account

- **Security:** "Sign in with ChatGPT" only exists on ChatGPT Sites. On any other host the identity headers it relies on could be faked, so they are ignored and removed unless `GULIT_HOSTING=chatgpt-sites`. Off Sites, the owner signs in only with a password.
- **First owner password on a fresh database:** the developer sets a one-time `OWNER_SETUP_CODE`. It only works while no password exists. The live data already includes Hamza's password.
- **Production build:** `deploy/gulit.production.json` holds the real D1 database ID, R2 bucket, worker name, cron and domain routes. Build with `GULIT_DEPLOY=1`.
- **Cron trigger:** order automation runs every minute even when no app is open.
- **`scripts/gulit-deploy.mjs`:** check, build, migrate, import live data, upload R2 files, set secrets, deploy.
- **`DEPLOY.md`:** the full move with a test list, plus domain and Chapa switch-over.
- New `tests/hosting.test.mjs`. All 17 test groups pass.

**Note to the developer:** the production build has not been run here because there's no network for `pnpm install`. Run `node scripts/gulit-deploy.mjs build` first and report any build error.

---

# Version 31 changes (7 November 2026): app store preparation

- **Required store pages:** `/privacy` (privacy policy), `/terms` (terms of service) and `/support` (help and contact), using the shop's business details (MOM Manufacturing PLC). They are linked in the shop footer and sitemap. They describe what the code actually collects and shares, with no trackers. Have a lawyer review them.
- **Android app link:** `/.well-known/assetlinks.json` is served from the `ANDROID_PACKAGE` and `ANDROID_CERT_SHA256` settings, so the Play Store app opens full-screen without a browser bar.
- **App manifest:** the name is now "Gulit Online", the "demo" wording is removed, and separate normal and maskable icons are listed.
- **`deploy/android/twa-manifest.json`** (package `com.gulitonline.app`) and **`deploy/STORES.md`**: accounts and costs, readiness blockers, Android and iPhone steps, listing text in English and Amharic, Data safety and App Privacy answers, screenshot sizes and review notes.
- Tests extended. All groups pass.

---

# Version 32 changes (7 November 2026): real products, notifications, store assets

- **Import prices and stock (owner menu → Import):** download the products that need a price as a CSV, fill in prices in Excel or Google Sheets, and upload. Those products go live. Stock lists can also be uploaded per supermarket (assigned automatically). Each problem row is reported by line number, and both `1,250.50` and `12,5` price styles work.
- **Storekeeper stock in Excel:** storekeepers download their own stock list, update quantities and upload it. This only works for products assigned to their supermarket.
- **Reference photos:** a switch hides catalogue photos copied from other shops' websites ("photo coming soon" instead) until your own photos are uploaded. The Import page shows how many remain.
- **Order notifications for customers:** a **Notify me about this order** button. Customers are notified when the supermarket confirms, a replacement is offered or times out, the order is packed, the rider picks up, or it is delivered. The notification carries no personal data, and tapping it opens My orders. The shared service worker now tells customer and engineer notifications apart.
- **`scripts/store-screenshots.mjs`:** makes Google Play (1080×1920) and App Store (1320×2868) screenshots from the live shop.
- **`mobile/`:** an iPhone (Capacitor) starting point with the native features Apple expects. It still needs a Mac to build.
- New tests: `bulk`, `order-push`, plus customer push in `push-worker`. All test groups pass.

## v33 — Supermarket partner registration
- Public bilingual (English/Amharic) form at **/partners** for supermarkets to apply: shop details, map link, hours, size, categories, contact, trade licence/TIN, payout method (no account numbers), partnership terms. Spam honeypot, origin check, rate limit. Applicant gets a reference number (SUP-…).
- Owner page **/admin/partners** ("Applications" in the owner menu): review, notes, status (new/contacted/approved/rejected), **Approve & create store account** → creates the storekeeper sign-in (store ID + one-time code).
- Shop footer link "Own a supermarket? Become a Gulit partner →"; /partners added to sitemap.
- Migration 0013_partner_applications. Test: tests/partners.test.mjs.
- Supermarket Partner Agreement with **Gulit Delivery PLC** (EN/Amharic, printable) at **/partners/agreement**, version 2026-11-08. The application form links to it and requires acceptance; the accepted version and time are saved with each application and shown on /admin/partners.
- Opened to **all partner businesses** (supermarkets, shops, bakeries, butchers, producers, wholesalers, restaurants…): "Type of business" field, form and agreement wording generalised to the **Gulit Business Partner Agreement** with Gulit Delivery PLC (adds: partner holds required licences).
- Agreement linked from the shop footer, the privacy/terms/support pages menu, and a new "Supermarkets and other sellers" section in the Terms.

## v33 — Telegram channel auto-posts
- New owner page **/admin/telegram** ("Telegram" in owner menu): channel @username, on/off, every N hours between first/last Addis hour (default every 2 h, 7am–9pm = 8 posts/day), "Post the next one now", last error shown.
- 24 bilingual (Amharic + English) "coming soon" posts for customers, partner businesses and riders in lib/telegram-posts.ts; rotate in order.
- Posted by the existing every-minute Cloudflare cron (worker scheduled → postIfDue); each slot claimed in the database so a post is never sent twice.
- New secret TELEGRAM_BOT_TOKEN (added to `gulit-deploy.mjs secrets`). Test: tests/telegram.test.mjs.

## v34 — Each supermarket's own price, choose your supermarket, Compare & save
- Migration 0014: `store_stock.price_cents` — each partner's own VAT-inclusive shelf price (empty = Gulit base price). Draft items (no base price) go on sale as soon as a partner prices them.
- Storekeeper app: "Your shelf price" field per item; CSV stock list gains `price` (and read-only `gulit_price`) columns. Owner stock import accepts `price` too.
- Shop: "🏷️ Best price · all supermarkets" picker (or one supermarket). Product cards show "from ETB …" when prices differ; product page lists each supermarket's price.
- Cart: **Compare & save** — the bag priced at every supermarket, lowest marked, "Shop here" to switch (`POST /api/catalog/compare`).
- Orders charge the supplying supermarket's own prices. "Best price" routes to the lowest products + delivery total; a chosen supermarket is used first, otherwise the order falls back and the customer sees why. Moving an unpaid order to another store reprices it and shows the change. Replacement offers use the store's own price.
- Test: tests/store-prices.test.mjs.
