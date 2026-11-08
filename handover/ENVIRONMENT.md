# Configuration names — no secret values

## Required bindings

| Name | Purpose |
|---|---|
| DB | Cloudflare D1 database binding; not a connection-string environment variable |
| BUCKET | Cloudflare R2 bucket binding for product images and payment receipts |

## Application runtime variables

| Name | Purpose |
|---|---|
| OWNER_EMAIL | Allowlisted owner email for the platform-identity branch and initial admin setup |
| PUSH_VAPID_PUBLIC_KEY | VAPID P-256 public key for engineer Web Push registration |
| PUSH_VAPID_PRIVATE_JWK | Private VAPID signing JWK, JSON string; keep secret |

Push keys are optional for ordinary shop/stock access, but both are required for engineer push. Existing private keys are not exported. A public key is returned only through the engineer notification workflow. Replacing the key pair generally requires existing devices to subscribe again.

## Optional platform binding

- CONNECTORS — Sites connector bridge, used by retained starter integration infrastructure; not required by the core commerce flows.

## Optional local/build tooling names

These are controls used by the retained platform/installer tooling, not additional Gulit business secrets:

- SITES_MANAGED_LINUX_CONTAINER
- SITES_RUNTIME_ROOT
- SITES_PROJECT_ROOT
- SITES_ENV_READY
- SITES_BUILD_TIMEOUT
- SITES_PNPM_BIN
- SITES_PNPM_SHARED_STORE
- SITES_PNPM_STORE_LOCK_TIMEOUT
- SITES_INSTALL_REPORT_PATH
- CLOUDFLARE_CF_FETCH_ENABLED
- WRANGLER_SEND_METRICS
- WRANGLER_WRITE_LOGS
- WRANGLER_LOG_PATH
- WRANGLER_REGISTRY_PATH
- MINIFLARE_REGISTRY_PATH
- SHARP_IGNORE_GLOBAL_LIBVIPS
- CODEX_SANDBOX

Host environment variables used by Node/package-manager tooling need not be copied from the old machine. Do not copy platform tokens, proxy credentials or runtime caches. Cloudflare account credentials for an independent deployment are supplied through that developer's own authenticated tooling, not embedded in the ZIP.

## Configuration stored elsewhere

- `.openai/hosting.json`: project identity and logical DB/R2 binding names, not passwords.
- `vite.config.ts`: local placeholder resource IDs and Worker configuration; these are not the production resource IDs.
- D1 `admin_credentials`: actual administrator username/password hash; staff access-code hashes in their role tables. These are database records, not environment variables.
- `.sites-runtime/execution-profile.json`: ignored local execution-profile selection; not included.
- Business contacts, public payment instructions, delivery rates, brand text and VAPID contact email are currently hardcoded in relevant HTML/route/helper sources. They are not centrally configurable environment variables.
- ChatGPT identity headers are platform request metadata, not environment values to set.

No real runtime variable values or private credentials are included in this document or ENVIRONMENT_NAMES.txt.


## Online payments (added in version 27)

| Name | Kind | Purpose |
|---|---|---|
| `CHAPA_SECRET_KEY` | Secret | Chapa secret key (test key `CHASECK_TEST-…` while testing, live key `CHASECK-…` in production). When it is not set, the shop hides the Pay online buttons and only bank-deposit slips are offered. |

Set it as an encrypted Worker secret (`wrangler secret put CHAPA_SECRET_KEY`), never in source. In the Chapa dashboard, optionally point the webhook to `https://gulitonline.com/api/payments/chapa`; every callback and webhook is re-checked against Chapa's verify API before an order is marked paid.


## Automatic tasks (version 29)

Confirmation limits, replacement time-outs, rider dispatch and 24-hour stock holds are checked whenever the shop, a storekeeper, a driver or the owner loads data (at most every 15 seconds). For quiet hours, optionally add a Cloudflare Cron Trigger (every minute) that requests `/api/admin/live` with an owner session, or call `sweep()` from `lib/ops.ts` in a `scheduled` handler in `worker/index.ts`.


## Android app link (version 31)

| Name | Kind | Purpose |
|---|---|---|
| `ANDROID_PACKAGE` | Variable or secret | `com.gulitonline.app` |
| `ANDROID_CERT_SHA256` | Variable or secret | SHA-256 fingerprint(s) from Play Console → App integrity → App signing, comma-separated. Served at `/.well-known/assetlinks.json` so the Android app opens full-screen. |

- `TELEGRAM_BOT_TOKEN` (secret, optional) — bot token from @BotFather. Used by the cron to post to the Telegram channel set at /admin/telegram (lib/telegram.ts). Without it, posting stays off.
