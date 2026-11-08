# Gulit Online — owner checklist (Hamza)

The code is ready. These steps need your own accounts, documents or signature, so only you can do them.

## 1. Get your live data from ChatGPT
- [ ] Send ChatGPT the data-export request (in the Claude chat).
- [ ] Bring the files back: database export (.sql) and photos/receipts (.zip).

## 2. Chapa (online payments)
- [ ] Open a Chapa merchant account for Gulit and finish their business verification.
- [ ] Set settlement to **automatic** (needed for paying supermarkets directly).
- [ ] Decide who pays Chapa's fee: Gulit or the customer.
- [ ] For each supermarket: create a **sub-account** with its bank account, and copy the sub-account ID.

## 3. Cloudflare (your own hosting)
- [ ] Create a Cloudflare account with a Gulit email, with two-factor login turned on.
- [ ] Invite your developer as a member. Don't share your password.
- [ ] Give the developer the code ZIP, `gulit_live_data_import.sql` (privately) and the 3 receipt photos. They follow **DEPLOY.md** and test on a workers.dev address first.
- [ ] Sign in on the test address with your usual owner username and password, and try a test order yourself.

## 4. Set up each supermarket (owner pages → Supermarkets)
- [ ] Add the supermarket and give the storekeeper the login.
- [ ] **Map location:** stand at the supermarket, copy the coordinates from Google Maps, and paste them.
- [ ] **Online payout:** paste its Chapa sub-account ID and set the commission (1%).
- [ ] **Hours, radius & phone:** opening hours, how far it delivers, and a phone number for supervisors.
- [ ] **Assign products** and have the storekeeper count the real stock.
- [ ] On the storekeeper phone: install the app, keep it open, and tap **Turn on order sound**.

## 5. Riders
- [ ] Create each rider on the Drivers page as an **own rider** or a **contracted** rider (with pay per trip).
- [ ] Riders install the driver app and tap **Go online for deliveries** when working.
- [ ] Keep a Yango business account ready as backup. The Live page tells you when to book one.

## 6. Rules (owner menu → Live → Rules)
- [ ] Check the confirm time (10 min), replacement reply time (5 min), late limit (60 min), Yango wait (5 min) and storekeeper bonus.

## 7. Real products (needed for the app stores too)
- [ ] Owner menu → **Import** → download *products needing a price*, get the prices from your supermarkets, upload. Products go live.
- [ ] Upload stock for each supermarket, or let storekeepers upload their own list.
- [ ] Switch on **Hide reference photos** and add your own product photos.
- [ ] Archive the 8 demo products (headphones, tote, mug and so on).

## 8. App stores (deploy/STORES.md)
- [ ] Request the D-U-N-S number for MOM Manufacturing PLC.
- [ ] Google Play Console as an organization (US$25), then the Android app (developer, about 1 day).
- [ ] Apple Developer Program as an organization (US$99 per year), then the iPhone app on a Mac (developer, 1–2 weeks, mobile/README.md).

## 9. Before opening to customers
- [ ] Place a test order with the Chapa **test** key. The storekeeper confirms it, you pay both bills online, a rider is assigned automatically, the storekeeper packs it and the rider delivers it. Then watch it on the Live page.
- [ ] Check the delivery fees on the orders page (Delivery fees by distance zone).
- [ ] Have someone check the Amharic wording.
- [ ] Switch to the Chapa **live** key, then move the domain at Dynadot.
