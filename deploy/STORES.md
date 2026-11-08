# Publishing Gulit Online on Google Play and the Apple App Store

## Which app goes in the stores
Only the **customer shop, "Gulit Online"**, goes in the stores. The staff apps (storekeeper, driver, engineer) stay as installable web apps from the website. Staff get them from you, not from a store.

## Accounts and costs
| Store | Fee | Account type | What you need |
|---|---|---|---|
| Google Play Console | US$25, once | **Organization** (MOM Manufacturing PLC) | D-U-N-S number, company website (gulitonline.com), company email, payment card, ID check |
| Apple Developer Program | US$99 per year | **Organization** (MOM Manufacturing PLC) | D-U-N-S number, legal authority to sign for the company, company website, company email, an Apple ID with two-factor login |

- **D-U-N-S:** a free company number from Dun & Bradstreet. Request it through Apple's D-U-N-S lookup page (developer.apple.com/enroll/duns-lookup). It takes up to 5 business days, plus about 2 for Apple to receive it.
- **Organization accounts:** both stores then show **MOM Manufacturing PLC** as the seller.
- **Google closed testing:** a Google organization account can publish without the 14-day test with 12 testers that new personal accounts must do.

## Before submitting (both stores reject unfinished apps)
1. **Real products:** the live shop must have real supermarket products, prices and stock. Today only 8 demo products are live (headphones, mugs and so on). Reviewers reject demo or placeholder content.
   - Use **owner menu → Import** to download the products needing a price, fill in supermarket prices in Excel, and upload them; the products go live.
   - Upload stock the same way. Storekeepers can upload their own stock list.
   - Archive the 8 demo products.
2. **Own photos:** many product photos are linked from other companies' websites. On the Import page, switch on **Hide reference photos**, then upload your own photos product by product (Products page).
3. **Own hosting:** the site must run on your own Cloudflare account and domain (DEPLOY.md). The store app opens gulitonline.com.
4. **Payments:** the Chapa live key must be active. For physical goods and delivery, Apple and Google allow your own payment provider; their in-app purchase is not needed.
5. **Store pages:** privacy, terms and support now exist at https://gulitonline.com/privacy, /terms and /support. Have a lawyer read them.

## Android (Google Play): Trusted Web Activity
The Android app is a thin wrapper that opens the shop full-screen in Chrome. It uses the shop's offline page, notifications and updates, and never needs a new app version for site changes.
1. Install JDK 17 and Node, then run `npm i -g @bubblewrap/cli`.
2. Run `bubblewrap init --manifest https://gulitonline.com/manifest.webmanifest`. Use package **com.gulitonline.app** (see `deploy/android/twa-manifest.json`). Bubblewrap creates the upload keystore; **back it up**.
3. Run `bubblewrap build`, which makes `app-release-bundle.aab`.
4. In Play Console, create the app, turn on **Play App Signing**, and upload the .aab to Internal testing.
5. In Play Console → App integrity, copy the **SHA-256 certificate fingerprint**. Set it on the website:
   `npx wrangler secret put ANDROID_CERT_SHA256 --config dist/server/wrangler.json` (also set `ANDROID_PACKAGE` = `com.gulitonline.app`). `https://gulitonline.com/.well-known/assetlinks.json` must then show it. Without this, the app shows a browser bar.
6. Fill in the store listing, Data safety, content rating and target audience (below), then send to Production.

## Order notifications (all platforms)
Customers can tap **Notify me about this order** on the order page. They get a notification when the supermarket confirms, a replacement is offered, the order is packed, picked up or delivered. This works in the Android app and Chrome; on iPhone it works when Gulit is added to the Home Screen (iOS 16.4+). It needs the `PUSH_VAPID_PUBLIC_KEY` and `PUSH_VAPID_PRIVATE_JWK` secrets.

## iPhone (App Store): needs more native features
A starting point is in **`mobile/`** (Capacitor config, plugin list and step-by-step README).
Apple rejects apps that are "just a website" (guideline 4.2 Minimum Functionality). Plan the iPhone app as a **Capacitor** app (built on a Mac with Xcode) with native features a website doesn't have:
- **Order notifications** (Apple push): order confirmed, replacement offer, rider on the way, delivered. This needs Apple push keys and a small server addition.
- **Native location** for the delivery pin, native share of an order, Face ID–protected "My orders" if wanted.
- An offline screen and a native splash screen.
Budget about 1–2 weeks of developer work on a Mac after Android is live. Use the App Review notes to explain these features.

## Store listing text

**Name:** Gulit Online · Grocery delivery
**Short description (Play, 80 chars):** Groceries from Addis Ababa supermarkets, delivered. Pay with Telebirr or card.
**Subtitle (Apple, 30 chars):** Addis groceries, delivered

**Full description:**
Shop groceries and household essentials from trusted supermarkets in Addis Ababa and get them delivered to your door.

• Order from nearby partner supermarkets, with real prices and stock
• Pay online with Telebirr, CBE Birr or bank card, or by bank deposit
• Clear delivery fees by distance, shown before you pay
• If an item is not on the shelf, choose a similar item or have it removed. You never pay for missing items
• Follow your order: supermarket confirmed, packed, on the way, delivered
• Chat with Gulit customer care in English or Amharic

Gulit Online is operated by MOM Manufacturing PLC, Addis Ababa.

**Amharic (አማርኛ):**
ከአዲስ አበባ የታመኑ ሱፐርማርኬቶች ሸቀጣሸቀጦችን ይግዙ፤ እስከ በርዎ እናደርሳለን።
• በአቅራቢያዎ ካሉ ሱፐርማርኬቶች በእውነተኛ ዋጋና ክምችት ይዘዙ
• በቴሌብር፣ በሲቢኢ ብር ወይም በባንክ ካርድ በኦንላይን ይክፈሉ
• የማድረሻ ክፍያ በርቀት፣ ከመክፈልዎ በፊት ይታያል
• ዕቃ ከሌለ ተመሳሳይ ዕቃ ይምረጡ ወይም ይወገድ፤ ለሌለ ዕቃ አይከፍሉም
• ትዕዛዝዎን ይከታተሉ፦ ተረጋግጧል፣ ተዘጋጅቷል፣ በመንገድ ላይ፣ ደርሷል
(Have a native speaker check the wording.)

**Category:** Shopping (Apple: Shopping, secondary Food & Drink) · **Content rating:** Everyone / 4+ · **Target audience:** 18+
**Contact:** ceo@mommanufacturingplc.com · +251909225566 / +251910828617 · **Privacy:** https://gulitonline.com/privacy · **Support:** https://gulitonline.com/support

## Data safety (Google) and App Privacy (Apple) answers
| Data | Collected | Shared | Why | Optional |
|---|---|---|---|---|
| Name | Yes | Yes (rider, supermarket first name, Chapa) | Delivery, payments | No |
| Phone number | Yes | Yes (rider, Chapa) | Delivery, payments | No |
| Address | Yes | Yes (rider) | Delivery | No |
| Precise location | Yes, only when you add a pin | Yes (rider) | Delivery zone and map | **Yes** |
| Purchase history | Yes | Supermarket (items) | Orders, accounting | No |
| Photos | Yes, deposit slips only if paying by deposit | No | Payment check | **Yes** |
| Customer support messages | Yes | No | Support | **Yes** |
| Payment info | **No.** Chapa handles card and wallet details | n/a | n/a | n/a |

- **Not collected:** advertising IDs, tracking, contacts, health or financial account numbers.
- **Encrypted in transit:** yes.
- **Deletion:** on request via support, and there are no accounts. Apple label: "Data Linked to You" for contact info, location, purchases and user content. **"Data Used to Track You": none.**

## Screenshots
- **Google:** 2–8 phone screenshots of 1080×1920.
- **Apple:** iPhone 6.9″ screenshots of 1320×2868.

Once real products are live, run `node scripts/store-screenshots.mjs https://gulitonline.com`. It makes both sizes automatically: shop, products, cart, checkout and customer care. Add `<orderId> <orderCode>` to include an order-progress screen.

## Review notes for the reviewers
"Gulit Online is a grocery marketplace for Addis Ababa, Ethiopia. No sign-in is needed: add items to the cart and check out. Payments use Chapa (Telebirr, CBE Birr, cards) for physical goods and delivery. To test without paying, place an order and stop at the payment step. Customer care chat is available in the app."
