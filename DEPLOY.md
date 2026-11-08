# Deploying Gulit Online to Gulit's own Cloudflare account

This takes a developer about an hour, plus waiting for the domain to move. Everything runs from this folder with Node 22.13 or newer. The helper `scripts/gulit-deploy.mjs` wraps every Cloudflare (`wrangler`) command used below.

## 0. Before you start
- **Cloudflare:** Hamza's account, with you invited as a member (Workers, D1 and R2 permissions).
- **Live data:** `gulit_live_data_import.sql` (private) plus the R2 receipt files from ChatGPT, saved as `files/receipts/<id>` (3 files).
- **Chapa:** a test secret key (`CHASECK_TEST-…`), and the live key later.
- **Engineer push notifications:** the VAPID key pair, if you can get it. Otherwise create a new pair, and engineers turn notifications on again.

## 1. Install and log in
```bash
corepack enable
pnpm install --frozen-lockfile
npx wrangler login
```

## 2. Create the database and file storage
```bash
npx wrangler d1 create gulit-online-db        # copy the database_id it prints
npx wrangler r2 bucket create gulit-online-files
cp deploy/gulit.production.example.json deploy/gulit.production.json
```
Paste the `database_id` into `deploy/gulit.production.json`. Leave `"routes": []` for now, so the first deploy is only on a `*.workers.dev` test address. Then run:
```bash
node scripts/gulit-deploy.mjs check
```

## 3. Tables, live data and files (new, empty database only)
```bash
node scripts/gulit-deploy.mjs migrate                              # creates all tables 0000–0011 and records them
node scripts/gulit-deploy.mjs import gulit_live_data_import.sql    # products, orders, chats, staff and owner login
node scripts/gulit-deploy.mjs files files                          # uploads files/receipts/... to R2 with the same keys
```

## 4. Build, secrets, deploy
```bash
node scripts/gulit-deploy.mjs build
node scripts/gulit-deploy.mjs secrets      # CHAPA_SECRET_KEY (test key first), PUSH_VAPID_PUBLIC_KEY, PUSH_VAPID_PRIVATE_JWK, TELEGRAM_BOT_TOKEN, OWNER_SETUP_CODE
node scripts/gulit-deploy.mjs deploy
```
- **`OWNER_SETUP_CODE`** is only needed if no owner password exists. The live data already contains Hamza's, so skip it. On a fresh database, set a long random code and give it to Hamza privately. He enters it once on `/admin/login` to create his password.
- **`TELEGRAM_BOT_TOKEN`** — token from @BotFather for the bot that posts to the Gulit Telegram channel. Hamza creates the bot and makes it a channel admin with "Post messages"; he gives you the token privately. Then he turns posting on at `/admin/telegram`.
- **Automatic jobs:** the build adds a cron trigger that runs order automation (confirm limits, replacement time-outs, rider dispatch, 24-hour holds) every minute.
- **ChatGPT sign-in:** the build sets `GULIT_HOSTING=own-cloudflare`, so it is switched off, and any `oai-authenticated-*` headers are removed before the app sees them.

## 5. Test on the workers.dev address
1. **Owner:** sign in at `/admin/login` with the existing username and password. Check Live, Orders, Supermarkets, Drivers and Customer care.
2. **Supermarket:** create a test supermarket. Set its map location, hours, radius and Chapa sub-account, assign products and set stock.
3. **Order:** place an order from a phone with a map pin. Check the supermarket and zone fee, and that the storekeeper app beeps.
4. **Payment:** confirm in the storekeeper app, then pay both bills with Chapa test methods. Check both show "Paid online".
5. **Rider:** a rider goes online in the driver app and is assigned automatically. Packed → picked up → delivered all show on the Live page.
6. **Replacement:** mark an item "Not available" and answer the replacement offer as the customer.
7. **Old receipts:** check they open from Orders.
8. **Tests:** `for t in tests/*.test.mjs; do node --experimental-vm-modules "$t"; done` should print PASS for every group.

## 6. Move the domain (gulitonline.com)
1. **Add the site:** in Cloudflare, Add a domain → `gulitonline.com`. Check every existing DNS record was copied, **especially email (MX/TXT)**.
2. **Nameservers:** at Dynadot, change them to the two Cloudflare ones. Wait until Cloudflare shows the domain as Active.
3. **Routes:** in `deploy/gulit.production.json` set `"routes": ["gulitonline.com", "www.gulitonline.com"]`, then `node scripts/gulit-deploy.mjs deploy`.
4. **Final sync:** just before switching, ask ChatGPT for a fresh export of orders and messages since the first import. Load only the new rows. Keep the old ChatGPT site running until the new one has handled real orders.
5. **Chapa:** optionally set the webhook to `https://gulitonline.com/api/payments/chapa`. Switch `CHAPA_SECRET_KEY` to the live key with `npx wrangler secret put CHAPA_SECRET_KEY --config dist/server/wrangler.json`.

## Updating later
Change the code, then `node scripts/gulit-deploy.mjs migrate` (only if `drizzle/` has a new file), then `node scripts/gulit-deploy.mjs deploy`.
