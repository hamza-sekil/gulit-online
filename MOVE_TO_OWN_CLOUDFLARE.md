# Moving Gulit Online from ChatGPT Sites to Gulit's own Cloudflare account

Today gulitonline.com runs on **ChatGPT Sites**, which hosts it on Cloudflare (Workers + D1 database + R2 file storage). The code already runs on Cloudflare, so the move keeps the same technology; only the account changes. The steps below follow `handover/HOSTING_AND_TRANSFER.md`.

## What the owner (Hamza) does

1. **Create a Cloudflare account** with a Gulit company email you control. Turn on two-factor login. Add a payment method if Cloudflare asks for one.
2. **Get the live data out of ChatGPT Sites.** Ask in the ChatGPT project that built the site for:
   - a full **export of the production D1 database** (products, prices, stock, orders, customers, staff logins), and
   - a copy of **all files in the R2 storage** (uploaded product photos and payment receipt images).
   The handover ZIP does **not** contain this data.
3. **Keep control of the domain** at Dynadot. Don't change anything there until step 7 of the developer's list.
4. **Give the developer access** to the Cloudflare account (Members → invite), not your password.
5. **Keep the old ChatGPT Sites site running** until the new one is tested.

## What the developer does

Follow **DEPLOY.md**. It has step-by-step commands, a helper script (`scripts/gulit-deploy.mjs`) and a test list. The code is ready for it (version 30):
- **Build settings:** the build reads the real database, storage, cron and domain from `deploy/gulit.production.json`.
- **Owner sign-in:** ChatGPT identity headers are ignored and removed when not on ChatGPT Sites, so nobody can pretend to be the owner. The owner password comes across with the live data. A fresh database uses a one-time `OWNER_SETUP_CODE`.
- **Automatic jobs:** a cron trigger runs order automation every minute.

Customers' saved carts and order links are stored in their browser for gulitonline.com. They keep working because the domain stays the same.
