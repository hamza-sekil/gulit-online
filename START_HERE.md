# Gulit Online — complete developer handover

Prepared: 7 November 2026 (Addis Ababa). Website: https://gulitonline.com

**This package contains the complete 378 tracked source and asset files from published version 26**, at commit `0ed1e2fa53a6245002a85f3fc944cbf45a014c75`. Source files retain their original relative paths. No historical versions, partial patches or replacement snippets are used. Database migration history is retained because it is required to recreate and upgrade the schema.

The website and the customer, driver, MEP engineer and storekeeper “apps” are web apps / PWAs in this one repository. **No Flutter/React Native project, Android APK/AAB, Xcode project, iOS IPA, or App Store / Google Play release was produced.** Installing the site on a phone does not constitute app-store publication.

## Where to start

| Deliverable | Location |
|---|---|
| Complete latest application code and local assets | Original `app/`, `lib/`, `public/`, `worker/`, `scripts/`, etc. in this folder |
| Every file and folder explained | `handover/FILE_INDEX.md` |
| Architecture, route list, build and migration instructions | `handover/DEVELOPER_GUIDE.md` |
| Database tables, fields, JSON records and relationships | `handover/DATABASE.md` |
| SQL to create the final empty database | `handover/schema.sql` |
| Original ordered migrations and Drizzle metadata | `drizzle/` |
| Runtime configuration names, without credentials | `handover/ENVIRONMENT.md` and `handover/ENVIRONMENT_NAMES.txt` |
| Completed features, unfinished work, known issues | `handover/FEATURE_STATUS.md` |
| Hosting, domain cutover and platform dependencies | `handover/HOSTING_AND_TRANSFER.md` |
| Declared application/tool packages | `handover/DEPENDENCIES.csv` and `package.json` |
| Exact resolved dependency lockfile | `pnpm-lock.yaml` |
| Latest built Sites deployment artifact | `handover/deployment-artifact-v26.tar.gz` |
| Test results and provenance | `handover/VERIFICATION.md` and `handover/PROVENANCE.json` |
| Checksums for every packaged file except the checksum file itself | `handover/SHA256SUMS.txt` |

## What is deliberately separate

This is a **source, schema and build handover**, not a production database or storage export. Live product overrides, prices, inventory, customers, order/payment records, staff accounts, uploaded product images, receipts and messages are in the hosted D1 database / R2 bucket and are not included. Actual dates are entered by the owner/storekeepers; they are not invented in the seed catalog. The seed catalog contains 1,046 listings, of which 1,038 are drafts/range requests; it is not a verified live supermarket feed.

Passwords, private VAPID keys, API tokens, session cookies, private Git history, runtime environment files, local databases, caches and `node_modules` are excluded. Public business information already embedded in the application (contact details, payment instructions and branding) remains in the source. Assets referenced by remote image URLs remain remote. Account ownership, domain registrar access, email inboxes and app-store developer accounts are not transferred by downloading this ZIP.

No existing website settings were changed, and no new developer was granted access, while preparing this handover.

`README.md` is the retained platform starter documentation; use the project-specific documents above for the final Gulit implementation. In particular, this repository has **pnpm-lock.yaml**, not package-lock.json: use the pinned pnpm workflow rather than the starter's generic `npm ci` advice.
