# Every file and folder

Paths are relative to the extracted project root. All original source paths retain their final published content. Generated handover documentation is additive.

## Folders

| Folder | Purpose |
|---|---|
| `.openai/` | Current Sites project and storage binding declaration. |
| `app/` | Next-compatible routes and HTTP/API screens. |
| `app/admin/` | Route/module subdirectory for admin. |
| `app/admin/drivers/` | Route/module subdirectory for admin → drivers. |
| `app/admin/engineers/` | Route/module subdirectory for admin → engineers. |
| `app/admin/login/` | Route/module subdirectory for admin → login. |
| `app/admin/orders/` | Route/module subdirectory for admin → orders. |
| `app/admin/stores/` | Route/module subdirectory for admin → stores. |
| `app/admin/support/` | Route/module subdirectory for admin → support. |
| `app/api/` | Commerce and role-protected HTTP API implementations. |
| `app/api/admin/` | Route/module subdirectory for admin. |
| `app/api/admin/auth/` | Route/module subdirectory for admin → auth. |
| `app/api/admin/chat/` | Route/module subdirectory for admin → chat. |
| `app/api/admin/drivers/` | Route/module subdirectory for admin → drivers. |
| `app/api/admin/engineers/` | Route/module subdirectory for admin → engineers. |
| `app/api/admin/mep-jobs/` | Route/module subdirectory for admin → mep-jobs. |
| `app/api/admin/orders/` | Route/module subdirectory for admin → orders. |
| `app/api/admin/products/` | Route/module subdirectory for admin → products. |
| `app/api/admin/stores/` | Route/module subdirectory for admin → stores. |
| `app/api/admin/support/` | Route/module subdirectory for admin → support. |
| `app/api/admin/upload/` | Route/module subdirectory for admin → upload. |
| `app/api/catalog/` | Route/module subdirectory for catalog. |
| `app/api/driver/` | Route/module subdirectory for driver. |
| `app/api/driver/auth/` | Route/module subdirectory for driver → auth. |
| `app/api/driver/deliveries/` | Route/module subdirectory for driver → deliveries. |
| `app/api/engineer/` | Route/module subdirectory for engineer. |
| `app/api/engineer/auth/` | Route/module subdirectory for engineer → auth. |
| `app/api/engineer/jobs/` | Route/module subdirectory for engineer → jobs. |
| `app/api/engineer/profile/` | Route/module subdirectory for engineer → profile. |
| `app/api/engineer/push/` | Route/module subdirectory for engineer → push. |
| `app/api/images/` | Route/module subdirectory for images. |
| `app/api/images/[key]/` | Route/module subdirectory for images → [key]. |
| `app/api/orders/` | Route/module subdirectory for orders. |
| `app/api/orders/chat/` | Route/module subdirectory for orders → chat. |
| `app/api/orders/receipt/` | Route/module subdirectory for orders → receipt. |
| `app/api/storekeeper/` | Route/module subdirectory for storekeeper. |
| `app/api/storekeeper/auth/` | Route/module subdirectory for storekeeper → auth. |
| `app/api/storekeeper/stock/` | Route/module subdirectory for storekeeper → stock. |
| `app/api/support/` | Route/module subdirectory for support. |
| `app/driver/` | Route/module subdirectory for driver. |
| `app/engineer/` | Route/module subdirectory for engineer. |
| `app/storekeeper/` | Route/module subdirectory for storekeeper. |
| `app/storekeeper.webmanifest/` | Route/module subdirectory for storekeeper.webmanifest. |
| `components/` | Retained React UI/connector scaffolding. |
| `components/ui/` | Reusable UI starter toolkit. |
| `db/` | Application Drizzle database access and final schema. |
| `drizzle/` | Original immutable ordered SQL migrations. |
| `drizzle/meta/` | Generated migration snapshots and journal. |
| `examples/` | Optional starter examples, outside active application routes. |
| `examples/d1/` | Optional D1 notes example. |
| `examples/d1/app/` | Support/example subdirectory under examples/d1. |
| `examples/d1/app/api/` | Support/example subdirectory under examples/d1/app. |
| `examples/d1/app/api/notes/` | Support/example subdirectory under examples/d1/app/api. |
| `examples/d1/db/` | Support/example subdirectory under examples/d1. |
| `handover/` | New project-specific export documentation, schema, provenance and deployment artifact. |
| `hooks/` | Retained React UI hooks. |
| `lib/` | Domain helpers, auth, catalog, business logic, complete HTML UI strings and connector scaffolding. |
| `public/` | Static public assets and PWA manifests/worker/offline shell. |
| `public/product-photos/` | Locally retained catalog image assets. |
| `scripts/` | Tracked reproducible environment/install/build scripts. |
| `scripts/connector-preview/` | Local optional connected-app preview support. |
| `scripts/vite/` | Vendored Sites/Vite integration. |
| `tests/` | Regression tests. |
| `vendor/` | Third-party vendored CSS/license. |
| `worker/` | Cloudflare Worker production entrypoint. |

## Files

| File | Purpose |
|---|---|
| `.gitignore` | Excludes dependencies, generated builds, secrets, local databases and tool state from Git. |
| `.npmrc` | Package-manager local behavior settings. |
| `.openai/hosting.json` | Existing Sites project identity and DB/R2 binding declarations. |
| `README.md` | Retained Vinext/Sites starter documentation; START_HERE and handover docs describe Gulit-specific final behavior. |
| `START_HERE.md` | Project handover entry point and exact inclusion/exclusion summary. |
| `app/admin/drivers/route.ts` | Owner driver/account and delivery-dispatch screen. |
| `app/admin/engineers/route.ts` | Owner-protected engineer dispatch HTML route. |
| `app/admin/login/route.ts` | Administrator password login/initial setup HTML route. |
| `app/admin/orders/route.ts` | Owner order/quote/payment-slip/verification/seller-details management screen. |
| `app/admin/route.ts` | Owner-protected main catalog dashboard route. |
| `app/admin/stores/route.ts` | Owner-protected supermarket stock/admin HTML route. |
| `app/admin/support/route.ts` | Owner general and order customer-care inbox screen. |
| `app/api/admin/auth/route.ts` | Owner password initial setup/sign-in/sign-out and session/rate-limit handling. |
| `app/api/admin/chat/route.ts` | Owner replies and order chat operations. |
| `app/api/admin/drivers/route.ts` | Owner driver creation/revoke/reset and paid-order delivery assignments. |
| `app/api/admin/engineers/route.ts` | Owner engineer accounts/revoke/reset and availability/device summary. |
| `app/api/admin/mep-jobs/route.ts` | Owner MEP job creation, nearest candidates, guarded assignment/reassignment/cancellation and notifications. |
| `app/api/admin/orders/route.ts` | Owner order listing/receipt viewing, quotes, seller details and payment decisions. |
| `app/api/admin/products/route.ts` | Owner-only catalog listing, validated create/update and archive operations. |
| `app/api/admin/stores/route.ts` | Owner supermarket account creation/reset/revoke, product assignment and stock editing. |
| `app/api/admin/support/route.ts` | Owner care inbox/thread inspection and replies. |
| `app/api/admin/upload/route.ts` | Owner-only validated product image upload into R2. |
| `app/api/catalog/route.ts` | Public merged catalog response and owner hint. |
| `app/api/driver/auth/route.ts` | Driver credential sign-in/sign-out. |
| `app/api/driver/deliveries/route.ts` | Driver-scoped delivery list, customer navigation info and state updates. |
| `app/api/engineer/auth/route.ts` | Engineer credential sign-in/sign-out and session-related cleanup. |
| `app/api/engineer/jobs/route.ts` | Engineer-scoped job list/status transitions and revision checks. |
| `app/api/engineer/profile/route.ts` | Engineer availability/current GPS/clear-location operations. |
| `app/api/engineer/push/route.ts` | Engineer push configuration, subscribe/test/unsubscribe operations. |
| `app/api/images/[key]/route.ts` | Validated public product-image retrieval from R2 products prefix. |
| `app/api/orders/chat/route.ts` | Private order-token customer chat. |
| `app/api/orders/receipt/route.ts` | Private customer receipt uploads with payment-party/state checks. |
| `app/api/orders/route.ts` | Private-token order creation/lookup and server-side totals. |
| `app/api/storekeeper/auth/route.ts` | Store credential sign-in/sign-out. |
| `app/api/storekeeper/stock/route.ts` | Own-store inventory read and quantity/date edit API. |
| `app/api/support/route.ts` | Private-token pre-order/general customer-care threads and text messages. |
| `app/chatgpt-auth.ts` | Platform identity-header helpers and top-level ChatGPT sign-in/sign-out URL helpers. |
| `app/driver/route.ts` | Complete driver app/login/delivery UI route. |
| `app/engineer/route.ts` | Public install/login shell route for private engineer app. |
| `app/layout.tsx` | Root Next/React-compatible HTML layout and fallback metadata. |
| `app/route.ts` | Public home route serving the complete storefront HTML. |
| `app/storekeeper.webmanifest/route.ts` | Storekeeper-specific PWA manifest response. |
| `app/storekeeper/route.ts` | Public install/login shell route for private storekeeper app. |
| `cloudflare-env.d.ts` | Type declarations for D1/R2 Worker bindings. |
| `components.json` | shadcn component-generator configuration. |
| `components/connector-error.tsx` | Retained starter connected-app error presentation component. |
| `components/ui/accordion.tsx` | Retained shadcn/Base UI/React accordion component; starter toolkit, not necessarily used by Gulit HTML screens. |
| `components/ui/alert-dialog.tsx` | Retained shadcn/Base UI/React alert dialog component; starter toolkit, not necessarily used by Gulit HTML screens. |
| `components/ui/alert.tsx` | Retained shadcn/Base UI/React alert component; starter toolkit, not necessarily used by Gulit HTML screens. |
| `components/ui/aspect-ratio.tsx` | Retained shadcn/Base UI/React aspect ratio component; starter toolkit, not necessarily used by Gulit HTML screens. |
| `components/ui/attachment.tsx` | Retained shadcn/Base UI/React attachment component; starter toolkit, not necessarily used by Gulit HTML screens. |
| `components/ui/avatar.tsx` | Retained shadcn/Base UI/React avatar component; starter toolkit, not necessarily used by Gulit HTML screens. |
| `components/ui/badge.tsx` | Retained shadcn/Base UI/React badge component; starter toolkit, not necessarily used by Gulit HTML screens. |
| `components/ui/breadcrumb.tsx` | Retained shadcn/Base UI/React breadcrumb component; starter toolkit, not necessarily used by Gulit HTML screens. |
| `components/ui/bubble.tsx` | Retained shadcn/Base UI/React bubble component; starter toolkit, not necessarily used by Gulit HTML screens. |
| `components/ui/button-group.tsx` | Retained shadcn/Base UI/React button group component; starter toolkit, not necessarily used by Gulit HTML screens. |
| `components/ui/button.tsx` | Retained shadcn/Base UI/React button component; starter toolkit, not necessarily used by Gulit HTML screens. |
| `components/ui/calendar.tsx` | Retained shadcn/Base UI/React calendar component; starter toolkit, not necessarily used by Gulit HTML screens. |
| `components/ui/card.tsx` | Retained shadcn/Base UI/React card component; starter toolkit, not necessarily used by Gulit HTML screens. |
| `components/ui/carousel.tsx` | Retained shadcn/Base UI/React carousel component; starter toolkit, not necessarily used by Gulit HTML screens. |
| `components/ui/chart.tsx` | Retained shadcn/Base UI/React chart component; starter toolkit, not necessarily used by Gulit HTML screens. |
| `components/ui/checkbox.tsx` | Retained shadcn/Base UI/React checkbox component; starter toolkit, not necessarily used by Gulit HTML screens. |
| `components/ui/collapsible.tsx` | Retained shadcn/Base UI/React collapsible component; starter toolkit, not necessarily used by Gulit HTML screens. |
| `components/ui/combobox.tsx` | Retained shadcn/Base UI/React combobox component; starter toolkit, not necessarily used by Gulit HTML screens. |
| `components/ui/command.tsx` | Retained shadcn/Base UI/React command component; starter toolkit, not necessarily used by Gulit HTML screens. |
| `components/ui/context-menu.tsx` | Retained shadcn/Base UI/React context menu component; starter toolkit, not necessarily used by Gulit HTML screens. |
| `components/ui/dialog.tsx` | Retained shadcn/Base UI/React dialog component; starter toolkit, not necessarily used by Gulit HTML screens. |
| `components/ui/direction.tsx` | Retained shadcn/Base UI/React direction component; starter toolkit, not necessarily used by Gulit HTML screens. |
| `components/ui/drawer.tsx` | Retained shadcn/Base UI/React drawer component; starter toolkit, not necessarily used by Gulit HTML screens. |
| `components/ui/dropdown-menu.tsx` | Retained shadcn/Base UI/React dropdown menu component; starter toolkit, not necessarily used by Gulit HTML screens. |
| `components/ui/empty.tsx` | Retained shadcn/Base UI/React empty component; starter toolkit, not necessarily used by Gulit HTML screens. |
| `components/ui/field.tsx` | Retained shadcn/Base UI/React field component; starter toolkit, not necessarily used by Gulit HTML screens. |
| `components/ui/form.tsx` | Retained shadcn/Base UI/React form component; starter toolkit, not necessarily used by Gulit HTML screens. |
| `components/ui/hover-card.tsx` | Retained shadcn/Base UI/React hover card component; starter toolkit, not necessarily used by Gulit HTML screens. |
| `components/ui/input-group.tsx` | Retained shadcn/Base UI/React input group component; starter toolkit, not necessarily used by Gulit HTML screens. |
| `components/ui/input-otp.tsx` | Retained shadcn/Base UI/React input otp component; starter toolkit, not necessarily used by Gulit HTML screens. |
| `components/ui/input.tsx` | Retained shadcn/Base UI/React input component; starter toolkit, not necessarily used by Gulit HTML screens. |
| `components/ui/item.tsx` | Retained shadcn/Base UI/React item component; starter toolkit, not necessarily used by Gulit HTML screens. |
| `components/ui/kbd.tsx` | Retained shadcn/Base UI/React kbd component; starter toolkit, not necessarily used by Gulit HTML screens. |
| `components/ui/label.tsx` | Retained shadcn/Base UI/React label component; starter toolkit, not necessarily used by Gulit HTML screens. |
| `components/ui/marker.tsx` | Retained shadcn/Base UI/React marker component; starter toolkit, not necessarily used by Gulit HTML screens. |
| `components/ui/menubar.tsx` | Retained shadcn/Base UI/React menubar component; starter toolkit, not necessarily used by Gulit HTML screens. |
| `components/ui/message-scroller.tsx` | Retained shadcn/Base UI/React message scroller component; starter toolkit, not necessarily used by Gulit HTML screens. |
| `components/ui/message.tsx` | Retained shadcn/Base UI/React message component; starter toolkit, not necessarily used by Gulit HTML screens. |
| `components/ui/native-select.tsx` | Retained shadcn/Base UI/React native select component; starter toolkit, not necessarily used by Gulit HTML screens. |
| `components/ui/navigation-menu.tsx` | Retained shadcn/Base UI/React navigation menu component; starter toolkit, not necessarily used by Gulit HTML screens. |
| `components/ui/pagination.tsx` | Retained shadcn/Base UI/React pagination component; starter toolkit, not necessarily used by Gulit HTML screens. |
| `components/ui/popover.tsx` | Retained shadcn/Base UI/React popover component; starter toolkit, not necessarily used by Gulit HTML screens. |
| `components/ui/progress.tsx` | Retained shadcn/Base UI/React progress component; starter toolkit, not necessarily used by Gulit HTML screens. |
| `components/ui/radio-group.tsx` | Retained shadcn/Base UI/React radio group component; starter toolkit, not necessarily used by Gulit HTML screens. |
| `components/ui/resizable.tsx` | Retained shadcn/Base UI/React resizable component; starter toolkit, not necessarily used by Gulit HTML screens. |
| `components/ui/scroll-area.tsx` | Retained shadcn/Base UI/React scroll area component; starter toolkit, not necessarily used by Gulit HTML screens. |
| `components/ui/select.tsx` | Retained shadcn/Base UI/React select component; starter toolkit, not necessarily used by Gulit HTML screens. |
| `components/ui/separator.tsx` | Retained shadcn/Base UI/React separator component; starter toolkit, not necessarily used by Gulit HTML screens. |
| `components/ui/sheet.tsx` | Retained shadcn/Base UI/React sheet component; starter toolkit, not necessarily used by Gulit HTML screens. |
| `components/ui/sidebar.tsx` | Retained shadcn/Base UI/React sidebar component; starter toolkit, not necessarily used by Gulit HTML screens. |
| `components/ui/skeleton.tsx` | Retained shadcn/Base UI/React skeleton component; starter toolkit, not necessarily used by Gulit HTML screens. |
| `components/ui/slider.tsx` | Retained shadcn/Base UI/React slider component; starter toolkit, not necessarily used by Gulit HTML screens. |
| `components/ui/sonner.tsx` | Retained shadcn/Base UI/React sonner component; starter toolkit, not necessarily used by Gulit HTML screens. |
| `components/ui/spinner.tsx` | Retained shadcn/Base UI/React spinner component; starter toolkit, not necessarily used by Gulit HTML screens. |
| `components/ui/switch.tsx` | Retained shadcn/Base UI/React switch component; starter toolkit, not necessarily used by Gulit HTML screens. |
| `components/ui/table.tsx` | Retained shadcn/Base UI/React table component; starter toolkit, not necessarily used by Gulit HTML screens. |
| `components/ui/tabs.tsx` | Retained shadcn/Base UI/React tabs component; starter toolkit, not necessarily used by Gulit HTML screens. |
| `components/ui/textarea.tsx` | Retained shadcn/Base UI/React textarea component; starter toolkit, not necessarily used by Gulit HTML screens. |
| `components/ui/toggle-group.tsx` | Retained shadcn/Base UI/React toggle group component; starter toolkit, not necessarily used by Gulit HTML screens. |
| `components/ui/toggle.tsx` | Retained shadcn/Base UI/React toggle component; starter toolkit, not necessarily used by Gulit HTML screens. |
| `components/ui/tooltip.tsx` | Retained shadcn/Base UI/React tooltip component; starter toolkit, not necessarily used by Gulit HTML screens. |
| `db/index.ts` | Drizzle D1 database binding accessor. |
| `db/schema.ts` | Final Drizzle declarations for all 17 application tables. |
| `drizzle.config.ts` | Drizzle schema source, SQLite dialect and migration output configuration. |
| `drizzle/0000_dark_frog_thor.sql` | Immutable ordered schema migration 0000. Apply pending migrations in order; final alternative schema is in handover/schema.sql. |
| `drizzle/0001_dear_quasimodo.sql` | Immutable ordered schema migration 0001. Apply pending migrations in order; final alternative schema is in handover/schema.sql. |
| `drizzle/0002_cute_malcolm_colcord.sql` | Immutable ordered schema migration 0002. Apply pending migrations in order; final alternative schema is in handover/schema.sql. |
| `drizzle/0003_majestic_sunset_bain.sql` | Immutable ordered schema migration 0003. Apply pending migrations in order; final alternative schema is in handover/schema.sql. |
| `drizzle/0004_green_skullbuster.sql` | Immutable ordered schema migration 0004. Apply pending migrations in order; final alternative schema is in handover/schema.sql. |
| `drizzle/0005_nappy_midnight.sql` | Immutable ordered schema migration 0005. Apply pending migrations in order; final alternative schema is in handover/schema.sql. |
| `drizzle/0006_public_silvermane.sql` | Immutable ordered schema migration 0006. Apply pending migrations in order; final alternative schema is in handover/schema.sql. |
| `drizzle/0007_rainy_master_chief.sql` | Immutable ordered schema migration 0007. Apply pending migrations in order; final alternative schema is in handover/schema.sql. |
| `drizzle/0008_flat_molecule_man.sql` | Immutable ordered schema migration 0008. Apply pending migrations in order; final alternative schema is in handover/schema.sql. |
| `drizzle/meta/0000_snapshot.json` | Immutable generated Drizzle schema snapshot for its migration number. |
| `drizzle/meta/0001_snapshot.json` | Immutable generated Drizzle schema snapshot for its migration number. |
| `drizzle/meta/0002_snapshot.json` | Immutable generated Drizzle schema snapshot for its migration number. |
| `drizzle/meta/0003_snapshot.json` | Immutable generated Drizzle schema snapshot for its migration number. |
| `drizzle/meta/0004_snapshot.json` | Immutable generated Drizzle schema snapshot for its migration number. |
| `drizzle/meta/0005_snapshot.json` | Immutable generated Drizzle schema snapshot for its migration number. |
| `drizzle/meta/0006_snapshot.json` | Immutable generated Drizzle schema snapshot for its migration number. |
| `drizzle/meta/0007_snapshot.json` | Immutable generated Drizzle schema snapshot for its migration number. |
| `drizzle/meta/0008_snapshot.json` | Immutable generated Drizzle schema snapshot for its migration number. |
| `drizzle/meta/_journal.json` | Ordered Drizzle migration journal; preserve with SQL history. |
| `eslint.config.mjs` | ESLint configuration. |
| `examples/d1/app/api/notes/route.ts` | Retained optional D1 notes example; not an active Gulit shop route/schema. |
| `examples/d1/db/schema.ts` | Retained optional D1 notes example; not an active Gulit shop route/schema. |
| `handover/DATABASE.md` | Every table/field/index plus JSON payload and object-storage notes. |
| `handover/DEPENDENCIES.csv` | All declared production/development packages and version constraints. |
| `handover/DEVELOPER_GUIDE.md` | Actual stack, routes, installation, authentication and business flow documentation. |
| `handover/ENVIRONMENT.md` | Runtime/binding/tool configuration names and their purposes; no values. |
| `handover/ENVIRONMENT_NAMES.txt` | Core application binding/environment names only. |
| `handover/FEATURE_STATUS.md` | Implemented functions, incomplete requests and known limitations. |
| `handover/FILE_INDEX.md` | This exhaustive file/folder purpose index. |
| `handover/HOSTING_AND_TRANSFER.md` | Current Sites/Cloudflare deployment and independent migration/access requirements. |
| `handover/PROVENANCE.json` | Published version/source identity and export counts. |
| `handover/RESOLVED_PACKAGES.txt` | Full list of resolved package keys from the lockfile. |
| `handover/SHA256SUMS.txt` | SHA256 checksums of all other package files. |
| `handover/VERIFICATION.md` | Export checks, passing test commands and test coverage limitations. |
| `handover/deployment-artifact-v26.tar.gz` | Latest generated Worker/asset deployment archive from the same published source; no native mobile binary. |
| `handover/schema.sql` | Final empty 17-table schema, generated and validated from original migrations. |
| `hooks/use-mobile.ts` | Retained React mobile-breakpoint helper (main raw HTML screens use CSS media queries). |
| `lib/admin-engineers-html.ts` | Complete owner engineer-account/MEP job/nearest-candidate/dispatch UI. |
| `lib/admin-html.ts` | Complete owner product/price/stock/date/photo catalog editor UI. |
| `lib/admin-stores-html.ts` | Complete owner supermarket/store-account/product-assignment/stock-overview UI. |
| `lib/catalog-defaults.json` | 1,046 default/demo/range-request catalog listings; merged with live database records. |
| `lib/catalog-photo-sources.json` | Catalog image provenance, source URLs, matched titles and reference/pending classification. |
| `lib/catalog.ts` | Fallback/default + D1 + store-stock catalog merge; product/image/date validators. |
| `lib/connector-context.ts` | Retained Sites connector bridge/contracts/context/error/preview support; not a supplier catalog integration. |
| `lib/connector-contract.mts` | Retained Sites connector bridge/contracts/context/error/preview support; not a supplier catalog integration. |
| `lib/connector-errors.mts` | Retained Sites connector bridge/contracts/context/error/preview support; not a supplier catalog integration. |
| `lib/connector-preview.d.ts` | Retained Sites connector bridge/contracts/context/error/preview support; not a supplier catalog integration. |
| `lib/connectors.ts` | Retained Sites connector bridge/contracts/context/error/preview support; not a supplier catalog integration. |
| `lib/driver.ts` | Private driver session/guard/rate-limit and permitted delivery transitions. |
| `lib/engineer-html.ts` | Complete private engineer PWA UI, login, assignment states, GPS and push controls. |
| `lib/engineer-push.ts` | VAPID configuration/signatures, endpoint allowlist, payload-free sends and test limits. |
| `lib/engineer.ts` | Engineer role/session/guard, job validation, coordinates, nearest-distance and state transitions. |
| `lib/orders.ts` | Server-side legacy/current totals, order validation, customer token lookup and public-order projection. |
| `lib/owner.ts` | Owner identity/password-session authorization and same-origin mutation guard. |
| `lib/password-auth.ts` | PBKDF2 password hashing, token digest, secure admin cookie and owner-session verification. |
| `lib/storefront-html.ts` | Complete customer shop/cart/checkout/order/payment/chat UI, CSS, client JS and translation mappings. |
| `lib/storekeeper-html.ts` | Complete private storekeeper UI, own-store stock/date editor and mobile layout. |
| `lib/storekeeper.ts` | Storekeeper sessions/guard/rate limits, scoped inventory and revision-safe stock/date updates. |
| `lib/utils.ts` | Shared starter styling/class-name utility. |
| `next.config.ts` | Next-compatible configuration scaffold. |
| `package.json` | Application and development dependencies, Node/package manager versions and run/build scripts. |
| `pnpm-lock.yaml` | Exact resolved dependency graph and package integrity metadata. |
| `pnpm-workspace.yaml` | pnpm dependency/build policy and shared-store settings. |
| `postcss.config.mjs` | CSS/PostCSS tooling configuration. |
| `public/driver.webmanifest` | Driver app PWA identity/start URL/icon metadata. |
| `public/engineer.webmanifest` | MEP engineer PWA identity/start URL/icon metadata. |
| `public/favicon.svg` | Static public image/asset used by the storefront or retained starter; filename: favicon.svg. |
| `public/icon-180.png` | Gulit app/logo icon at 180 pixel size. |
| `public/icon-192.png` | Gulit app/logo icon at 192 pixel size. |
| `public/icon-512.png` | Gulit app/logo icon at 512 pixel size. |
| `public/manifest.webmanifest` | Customer app PWA identity/start URL/icon metadata. |
| `public/offline.html` | Offline information page; no offline transactions. |
| `public/photo-pending.svg` | Fallback image when a seller/reference photo is unavailable. |
| `public/product-photos/01794d204e6af442af.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/0383fcd1e7e905f7e3.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/041d18995cedf2bfbf.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/0433fc89a1de021cf3.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/051a2a92d7947326d7.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/06a6ecf975dc8dfe9f.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/0c467421e198f528bd.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/0e4fb19e2912e305b4.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/10b550422d625de10d.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/10f8991b5ab3e64239.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/126f6f5959a8988cf6.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/12acdc160c7d22c981.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/13ec8ec60c924dcb5e.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/166188667632f3c8ca.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/17bae6a248be7ab933.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/198b0a76a400ea9d71.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/1adf9b56d3691bb08b.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/1c2b7721376a3b8dd5.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/1c66fbc10e9cabe6c8.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/1fbbceac6184eb1d8b.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/21b3f5a542b239a865.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/238bb39a714f519bf4.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/25ca536f2ce7fbe14b.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/267634744dd0df74bb.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/26bf8573d0be71f722.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/2790c99290006a92d0.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/284fce178409ecbeb7.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/2949ec73583806b54e.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/2a827905f7e5e31524.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/2b80b877c172400e8a.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/2bf4836e61855e0f22.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/2bfbe3c9f9e246e5fa.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/2da4003607500a03f7.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/2f923dd8bc1467af56.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/309633cbef54009cea.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/30b83d5d423da70e1c.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/30d652362832a05e38.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/31ce58d048889157df.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/37e4b44840c6326800.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/3891335f8b7f515f60.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/392aa1eb4872b3b4b5.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/3b0dd9f9c4185bea92.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/3fc10d9991c17c6839.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/4284e2be22b8e6c27a.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/42adca9bad82513b52.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/42d64158beae72134c.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/44902c54f2e234caab.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/450419d5bd402e1513.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/468ec1e6f02670f57b.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/4939406a6f1e8b0715.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/496bf16631c90c7df1.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/49a8bf9be0fea42017.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/49d7a5251b4d655a74.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/4a62fb6aeaa84d068d.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/4a6dcb42fbc6ad26c6.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/4c03a8938178cc5235.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/4ce4a5a04634369b3f.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/4e1a5722fe7f49c307.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/4fde95988a63c9e52c.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/509caec97e7522fb78.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/51b570393979b7e59d.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/51b6dc9438a812c86c.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/53aefbf8d3c613d121.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/553205404e3463f0c5.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/56126fc11521c5e4e7.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/56c4acd0f5cb3a5657.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/5af7342f35d7bce364.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/613e973edff50e4a71.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/635c2293c184590268.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/681715016bd2b78361.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/6870cc389697268123.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/6afad6b9b2ac35784c.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/6bbc1f52d33da0b74d.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/6d279fea16330f4aca.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/6e4a3c27b510684ac6.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/7066ee99a84f5ea74c.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/7196f04f5ee114b356.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/73575086599bf13199.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/7430e3e10ea0fa6db6.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/754c2bf624867dde63.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/767fad02f495defe93.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/76b7559b6ba9ba9648.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/77097c69a05171d5c1.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/7809b5f768bfc3cb18.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/780bd39e1f082d32eb.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/7855b2ed3c008b36bf.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/792d0fe4228291d1a2.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/7bd3f613e5e23ae042.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/7ca3055c491bdef39a.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/80a14abbeb7e686fab.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/848ce0c378d5039dd3.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/87b585c8e02384d3ea.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/891fca43dd488d6dfc.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/8b6efac461c470ef1c.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/8bb1b2e7f9d0b2d76b.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/8ed44da2fa4befae22.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/8f6470c110b6b5d365.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/9167fde1c6e63a9eb9.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/91e5eac78fa255adba.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/95df81c72cd2853672.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/992a42b3607f37dbc3.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/9b62b9e0cd4157390e.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/9b8abab7b7aca607c5.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/9bb7903b4104efe62d.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/9e90436316f8197ed6.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/9f52b0fc0f488bf010.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/a03bdffca8e40df47f.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/a1d13adb47d51d6363.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/a1f04445845e92df7b.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/a221073be75d9493ac.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/a5a2c16c5ed539659c.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/a8d9bb8b32aa481461.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/a8dabe473b93659f34.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/a99751b7103dbb3b3f.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/aaa98ad937c8f3255f.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/ad9513a43cca20c323.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/ae89d247f939112609.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/b0a994177e2751dfeb.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/b157224d5ef34452da.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/b688e38ffd674e75f1.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/b9e404ccbb7b7d324a.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/ba66694a4524a3fa70.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/bc447361389e576338.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/bf2b363f3ca06c2747.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/c05d1bb4625c649338.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/c0d4fa3b29347519fb.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/c124fe335d812e56b6.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/c3339245a30d9c247f.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/c5e65c268a6bfe341e.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/c6450ccb3f6db7ee44.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/c7796449623243a942.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/ca4296335b05d9c959.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/cc8077d71a829682d6.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/cd426ce5684cb81090.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/cd93f32721eb2bf86d.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/d001647fb8d89f882c.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/d217c83e766adfe978.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/d2da6af27cfc3edcea.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/d331d4862c84527b36.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/d3b47d6f46799c0187.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/d460b139308611e9a9.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/d47c70cc13f092a2ca.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/d50f4df6207392f067.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/d51f10860d1c92cf17.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/d543efba30327ebe93.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/d557b4594137af6fc3.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/d6f9ffb6e036dcec35.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/d740a38ea81e0455d7.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/da136af170b7af50b8.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/da5b464376e7747510.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/db0a6d35604d0b8c72.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/db6ad1b1d00280c564.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/db7c6ffedd885d52e3.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/dc6ed9c2ad506ac7df.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/ddc96db95cc78d4089.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/ddd3292dfb59a895de.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/df204226c5896bb578.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/e12214efaf6a6a37ea.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/e198a97e392e973e63.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/e2029462d80da65893.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/e2ec4654abf79c96bf.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/e813203ff1ba66ed86.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/e98586998aacda0ca0.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/ed9b5ace6e952a4bc8.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/edba2f49ddc52dee80.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/ef1d83cab336e9e924.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/f1329527c8f49a0dbf.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/f2696d4ea510fcd4a0.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/f2caab2ea7d4e09b54.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/f401c6fc333059450f.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/f4ca43e7136e91d1e6.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/f58f2319a0e91da51d.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/f6d6ce14b891e136ab.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/f7771eb4bca7230f0a.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/fa55a644c546cc7bb5.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/fa7a8b102632c74e04.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/fcaa8c12ecceb6e315.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/ff49ce9a7851305fc5.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/product-photos/ff5de7571ba675e690.jpg` | Local catalog photo asset; see catalog image provenance for usage. |
| `public/robots.txt` | Crawler rules and sitemap reference. |
| `public/sitemap.xml` | Public sitemap entries. |
| `public/sw.js` | Shared PWA static/offline worker plus generic engineer-job push/click handlers. |
| `scripts/build-verified.sh` | Retained Node/Bash tool for build verified during local installation, preview, environment setup or builds. |
| `scripts/connector-preview/connector-preview-session.mjs` | Retained local Sites connector-preview Worker/session/protocol support. |
| `scripts/connector-preview/host-binding.mjs` | Retained local Sites connector-preview Worker/session/protocol support. |
| `scripts/connector-preview/protocol.mjs` | Retained local Sites connector-preview Worker/session/protocol support. |
| `scripts/connector-preview/worker.mjs` | Retained local Sites connector-preview Worker/session/protocol support. |
| `scripts/execution-profile.mjs` | Retained Node/Bash tool for execution profile during local installation, preview, environment setup or builds. |
| `scripts/install-ci.mjs` | Retained Node/Bash tool for install ci during local installation, preview, environment setup or builds. |
| `scripts/install-ci.sh` | Retained Node/Bash tool for install ci during local installation, preview, environment setup or builds. |
| `scripts/install-pnpm.sh` | Retained Node/Bash tool for install pnpm during local installation, preview, environment setup or builds. |
| `scripts/npm-install.mjs` | Retained Node/Bash tool for npm install during local installation, preview, environment setup or builds. |
| `scripts/pnpm-install.mjs` | Retained Node/Bash tool for pnpm install during local installation, preview, environment setup or builds. |
| `scripts/run-framework.mjs` | Retained Node/Bash tool for run framework during local installation, preview, environment setup or builds. |
| `scripts/sites-env.mjs` | Retained Node/Bash tool for sites env during local installation, preview, environment setup or builds. |
| `scripts/sites-env.sh` | Retained Node/Bash tool for sites env during local installation, preview, environment setup or builds. |
| `scripts/tool-environment.mjs` | Retained Node/Bash tool for tool environment during local installation, preview, environment setup or builds. |
| `scripts/vite/connector-preview-plugin.mjs` | Vendored Sites Vite/preview plugin integration or its license. |
| `scripts/vite/sites-vite-plugin.LICENSE` | Vendored Sites Vite/preview plugin integration or its license. |
| `scripts/vite/sites-vite-plugin.ts` | Vendored Sites Vite/preview plugin integration or its license. |
| `tests/catalog.test.mjs` | Backend/API integration/security/business-flow test harness using in-memory SQLite and mocked platform interfaces. |
| `tests/engineer-location.test.mjs` | Engineer pending/in-flight GPS clear/update race regression tests. |
| `tests/gps.test.mjs` | Storefront GPS success, failure/retry/manual fallback and script syntax tests. |
| `tests/push-worker.test.mjs` | Payload-free push display and safe engineer notification-click behavior tests. |
| `tests/storekeeper.test.mjs` | Date persistence/validation and store-isolated credentials/inventory/stock aggregation regression tests. |
| `tsconfig.json` | TypeScript compiler and module/path configuration. |
| `vendor/shadcn-tailwind-4.13.0.LICENSE.md` | Vendored shadcn Tailwind stylesheet or accompanying license. |
| `vendor/shadcn-tailwind-4.13.0.css` | Vendored shadcn Tailwind stylesheet or accompanying license. |
| `vite.config.ts` | Vinext/Vite/Sites/Cloudflare plugins, local binding declarations and execution-profile configuration. |
| `worker/index.ts` | Production Worker fetch entry; framework handler and request connector-context bridge. |
