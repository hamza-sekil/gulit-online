# Developer guide

## Actual stack

- TypeScript and JavaScript, HTML and CSS; JSON catalog/configuration; SQLite-compatible SQL migrations; Bash and Node.js tooling.
- Vinext `1.0.0-beta.5` with Vite `8.0.13` and Next.js-compatible App Router APIs. Next `16.3.4`, React/React DOM `19.2.6` are installed. The principal Gulit screens are complete HTML/CSS/vanilla-JavaScript documents stored as exported strings or inline route HTML, rather than a conventional React component SPA.
- Cloudflare Worker ESM server entry `worker/index.ts` and framework fetch handler.
- Cloudflare D1 via `DB`, accessed with parameterized SQL; Drizzle ORM/schema and Drizzle Kit migrations.
- Cloudflare R2 via `BUCKET` for uploaded product photos and private payment receipt objects.
- Progressive web app manifests and a shared service worker; browser Web Crypto, Geolocation, Push API and Notifications API.
- Tailwind 4, shadcn/Radix/Base UI components and related UI packages are supplied by the starter. Many `components/ui` files are retained scaffolding rather than used by the principal HTML screens.
- ChatGPT Sites tooling/plugin integration for hosting and optional owner identity. Connector helper infrastructure is included; core commerce does not require a connected third-party app.
- No WordPress, WooCommerce, Laravel, Flutter, React Native, Firebase or native mobile build project is present.

`package.json` and `handover/DEPENDENCIES.csv` list all declared dependencies. `pnpm-lock.yaml` pins the complete transitive graph. Version ranges in the CSV are declarations, not promises about future registry resolution; use the lockfile.

## Entry points

| URL | Implementation | Purpose |
|---|---|---|
| `/` | `app/route.ts`, `lib/storefront-html.ts` | Public shop, catalog, cart, checkout, order/payment views and customer care |
| `/admin`, `/admin/login` | Admin routes, `lib/admin-html.ts` | Owner login, product and price/date editing |
| `/admin/orders` | `app/admin/orders/route.ts` | Order quotes, bank-details workflow, receipt review and payment verification |
| `/admin/support` | `app/admin/support/route.ts` | Pre-order and order customer-care inbox |
| `/admin/drivers` | Driver admin route | Driver credentials and paid-order dispatch |
| `/driver` | `app/driver/route.ts` | Assigned deliveries, items, customer location/phone and delivery states |
| `/admin/engineers` | Engineer admin route / HTML | Engineer credentials, service jobs, availability, nearest-engineer candidates and dispatch |
| `/engineer` | Engineer route / HTML | Private assigned MEP jobs, one-shot GPS, availability, status updates, notification setup |
| `/admin/stores` | Store admin route / HTML | Supermarket credentials, product assignment and stock overview |
| `/storekeeper` | Storekeeper route / HTML | Own-store stock quantities, manufacturing/expiry dates, stock filters |
| `/manifest.webmanifest`, `/driver.webmanifest`, `/engineer.webmanifest` | `public/` | Customer, driver and engineer installation metadata |
| `/storekeeper.webmanifest` | `app/storekeeper.webmanifest/route.ts` | Storekeeper installation metadata |
| `/sw.js`, `/offline.html` | `public/` | Static asset/offline shell support; engineer push handler |

All implemented API endpoints are indexed individually in FILE_INDEX.md. They include catalog/products, owner authentication, orders/receipts, support/chat, drivers/deliveries, engineers/jobs/profile/push, and stores/stock.

## Code organization and editing

`lib/*-html.ts` exports a JSON-escaped string containing the entire relevant HTML page, styles and client JavaScript. This is the complete working source, even though the file has one long line. Decode the string to edit it, then JSON-encode it again into `export default ...;`; do not edit an old HTML copy or create a competing route. Some older screens, including driver/admin orders/login, embed their full HTML in the route file itself.

`lib/catalog-defaults.json` is a fallback/request catalog merged at runtime with D1 product rows by product ID. D1 rows contain owner changes, archives and newly created products. Do not assume the products table alone is the entire catalog. Store-linked products use active stores' combined stock; disabled stores contribute none. If all store assignments are removed, the base catalog stock applies again. If assignments remain but every store is inactive, the linked product has zero available stock.

`lib/orders.ts` owns server financial calculations and order creation. Client display calculations also exist in storefront HTML; change both together and preserve legacy billing records.

## Local installation and first run

The source declares Node >=22.13.0; handover verification ran on Node 24.22.1. The test suite uses Node's built-in SQLite API and VM modules. Use the pinned package manager `pnpm@11.25.0`, through Corepack where available or an equivalent installation of that exact version.

From the extracted project root, run these in order:

```sh
corepack pnpm install --frozen-lockfile
npm run build
```

The `npm run` commands invoke existing project scripts; dependency installation uses pnpm. A clean checkout selects the portable execution profile without needing platform caches. The `install:ci`/Linux installer scripts are platform helpers, not the preferred cross-platform install entry point. Build produces `dist/server/index.js`, assets, and `dist/server/wrangler.json` from Vite's local binding declarations.

For a **fresh local database only**, apply the original migrations in filename order using the generated Wrangler configuration:

```sh
for file in drizzle/*.sql; do
  node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file "$file"
done
npm run dev
```

This shell loop is for Bash; other shells can execute the same Wrangler command once per migration. Read the URL actually printed by the server. `npm start` runs the built Worker locally instead of the development server.

Do not replay migrations on an existing database. Do not apply both `handover/schema.sql` and the migration chain to the same fresh database. The final SQL is an alternative for an independent empty database, not a production upgrade script or a Sites migration-journal substitute.

Runtime values must be configured separately; ENVIRONMENT.md lists names only. HTTPS is required for production Secure cookies, geolocation and push. Do not weaken authentication to make an HTTP preview work.

## Authentication and initial owner setup

The owner may authenticate by the app's username/password session, or the Sites owner identity whose email matches OWNER_EMAIL. Admin password hashes use PBKDF2-SHA256 with a random salt and 100,000 iterations. Admin sessions expire in 8 hours; driver, engineer and storekeeper sessions in 12 hours. Session tokens are stored hashed. Staff random access codes are stored as SHA256 hashes. Cookie names and security flags are in the source.

The first `/api/admin/auth` password setup is deliberately gated by `chatOwner()`. A fresh independent deployment without Sites identity cannot bootstrap that account through the normal setup screen. Migrate the existing credential row through an authorized private data transfer or implement a secure operator-controlled bootstrap. Do not enable public self-registration or trust arbitrary client-supplied identity headers.

On a non-Sites host, strip externally supplied `oai-authenticated-*` headers and replace/disable the platform identity branch. `app/chatgpt-auth.ts` assumes the platform validates these headers; that trust assumption must not be copied blindly to an untrusted origin. Existing password authentication can remain, after secure bootstrap/data migration.

## Main operational paths

1. Owner confirms catalog prices/stock and actual batch dates; request listings remain drafts until seller details are confirmed.
2. Customer creates order with delivery address and optional Google Maps pin. Server prices the order from catalog data, not client totals.
3. Customer care confirms seller/account details and any outside-Addis delivery distance; customer makes separate seller/Gulit deposits and uploads separate slips.
4. Owner manually verifies each payment. Only fully verified orders can be dispatched to a driver.
5. MEP and other service enquiries enter customer care; owner manually creates/assigns engineer jobs. There is no automatic care-chat-to-job conversion.
6. Owner creates supermarket logins and assigns product IDs. Storekeepers save actual quantities/dates; owner sees out/low/unchecked counts. Orders do not deduct stock automatically.
