# Feature status, unfinished work and known limitations

This inventory describes implemented code, not a guarantee of production operations or third-party approvals. Handover tests cover the code paths noted in VERIFICATION.md. Production customer/stock data and device permissions were not audited for this export.

## Implemented

| Area | Working functionality in this version |
|---|---|
| Storefront | Responsive department/brand/group search, sorting, paginated catalog, local saved items, visible cart and checkout |
| Languages | English plus Amharic mappings for many shop/checkout labels, and selected bilingual staff labels |
| Owner admin | Username/password login, existing platform owner fallback, product create/edit/archive/restore, prices, counts, image upload/URL, manufacturing and expiry dates, edit revision checks |
| Catalog photos | Local image assets plus remote references, fallback illustration and honest reference/pending labels |
| Orders | Server-side catalog pricing, buyer phone/address/city, separate seller/Gulit financial summaries and payment states |
| Charges | Seller amount includes seller VAT; Gulit service = 4% of seller net before VAT; 15% on Gulit service and delivery; Addis delivery base ETB 400 before Gulit VAT; outside delivery manually quoted at ETB 450/km from Adwa 00 |
| Deposits | Two independent receipt uploads, customer-care seller bank instructions, separate manual approval/rejection; dispatch gated on both verified |
| Customer care | On-page text chat for general enquiries and private order-related care; owner inbox; polling while open |
| Driver app | Separate PWA/login, assigned deliveries only, item list, phone/address/map links, instructions and delivery state changes |
| MEP customer enquiries | Plumbing, electrical and mechanical categories for home/factory/office, including cold rooms and chillers; care request form |
| MEP engineer app | Separate PWA/login, job assignments, accept/decline/status changes, one-shot GPS sharing/clear, available/offline, own jobs only |
| Nearest engineer | Matching skill, availability and nonbusy checks, location recency/accuracy filter, straight-line distance ranking; manual dispatch |
| Engineer notifications | VAPID Web Push subscription, opt-in/test/disable, generic private-data-free alerts, fixed engineer-app click target, expired-subscription cleanup |
| Supermarket / storekeeper | Per-supermarket login; owner assigns listings; own-store stock/date edits; out/low/unchecked views; aggregate linked stock in public catalog |
| Mobile | Home Screen install manifests; mobile Storekeeper/header/filters/cards/full-screen date editor and similar store-admin responsiveness |
| Basic discoverability | Canonical/Open Graph/structured data, robots/sitemap and verification metadata in source |

## Added in versions 27–29 (see CHANGES.md)

Online payments (Chapa), supermarket routing with stock holds, delivery zones, storekeeper order confirmation with time limit and automatic re-routing, replacement offers, live operations dashboard with KPIs and store scores, rider groups with automatic dispatch and Yango backup, delivery cost tracking, storekeeper performance/bonus, one owner menu and phone layouts.

## Partial / requires operator or further engineering

- **Catalog data:** 1,046 default listings, 1,038 marked drafts/range requests and 8 earlier demonstration listings. Not 2,000+ confirmed products. No full current Carrefour feed/import or inventory integration. Real seller prices, exact models/pack sizes, availability and dates must be confirmed.
- **Old HEK Supermarket app:** historic app was located during earlier work, but its complete older catalog/backend was not recovered or migrated. The included catalog is not that complete historical inventory.
- **Payments:** version 27 adds online payment through Chapa (Telebirr, CBE Birr, cards) for both the Gulit payment and the seller payment, with automatic server-side verification and a split that settles the seller amount to the supermarket's Chapa sub-account. Bank-deposit slips remain as a fallback. Refunds of missing items, partial refunds and chargebacks are still handled manually in the Chapa dashboard; duplicate online payments are flagged on the order for refund.
- **Invoices:** printable billing summaries; no fiscal-device/e-invoicing integration and no formal tax invoice issuance workflow. Relevant seller/Gulit issuer must supply the formal invoice. Current order design is not a multi-seller split-settlement engine.
- **Service businesses:** restaurant listings, laundry pickup/return and car-to-garage requests are catalog/care workflows. There is no dedicated laundry partner or garage operational app and no automatic multi-leg logistics/billing engine.
- **MEP:** customer-care details are manually entered into jobs; no automatic job intake, autonomous dispatch/acceptance or scheduling/route optimization. Customer numeric coordinates are required for nearest ranking; map links/addresses are not geocoded automatically. Engineer distance is not road distance/travel time.
- **Notifications:** engineer-job push implementation exists; actual delivery depends on device opt-in, OS/browser support and provider acceptance. No completed real-device push delivery audit is included. Customer chat/order notifications and driver push are not implemented. Storekeepers poll when open; no background stock alerts.
- **Native mobile:** customer/driver/engineer/storekeeper PWAs only. iOS and Android native wrappers/builds, signing, store metadata, review and releases remain to be done. Store registration fees/D-U-N-S discussions did not produce a store release.
- **Translation:** not every string/admin screen is translated; not a complete translation/localization system.
- **Operator accounts:** UI lets owner create/revoke/reset staff credentials. The ZIP does not create actual supermarkets or staff and contains no live account/access codes. One supermarket login is shared at that store; there is no named individual storekeeper role hierarchy.

## Known code/product limitations for the next developer

1. **Stock holds (version 28):** when an order is placed, every item is deducted from one supermarket's stock. Holds return on cancellation or after 24 hours unpaid. Products sold only from the base catalogue (no supermarket stock rows) are still not held.
2. **No automatic expiry blocking/alerts:** dates are stored/validated for calendar correctness and chronology, but an expired date does not itself prevent purchase, reduce stock or notify staff.
3. **One date pair per listing per store:** no lot/batch table or FEFO picking. Multiple batches require separate listings under the current model. Cross-store differing dates are shown as varying and customer care must confirm the supplying store/batch.
4. **Catalog edit metadata:** catalog() reconstructs a D1-overridden listing without preserving every default-only metadata flag (including draft/badge semantics). Editing a range request can move it out of its default draft representation. Verify seller details before enabling stock; a safer explicit publication state is future work.
5. **Supermarket allocation (version 28):** orders go automatically to the nearest active supermarket that has every item, and drivers pick up there. If no single supermarket has everything, customer care chooses one. Earlier note: aggregate availability is not an order reservation/selection of a particular supermarket. Driver pickup is still hardcoded as Adwa 00, not dynamically routed to the selling supermarket. This must be extended for real multi-store fulfillment.
6. **Limited staff/admin auditability:** one owner role, shared store accounts, stock last-updated metadata rather than an immutable stock movement ledger; no full audit/change-history dashboard.
7. **Customer access is browser-token based:** order/support tokens and favourites/cart are kept in browser storage. Clearing browser storage or changing phone can lose access; no complete registered-customer identity, recovery or synchronized multi-device account system.
8. **List limits/pagination:** several owner/driver/MEP listings cap recent rows at 200 without a complete history-search/pagination experience. Product/store lists have their own client pagination.
9. **Offline shell only:** no offline order placement, offline stock edits or background sync. Never assume cached data is current; authenticated pages/data are not intentionally cached by the service worker.
10. **Physical-device coverage:** phone-width layout and code checks were performed; a full matrix of Safari/Android real-device, keyboard, installation and notification behavior has not been completed.
11. **External photos:** some images remain third-party URLs and can break/change or raise asset-permission issues. Reference/illustrative photos are not seller-certified photos of exact stock. Check provenance manifest and replace with owned seller assets.
12. **Initial auth portability:** first owner-password setup depends on the verified Sites owner identity. An independently hosted empty database needs secure bootstrap or authorized credential-data migration. Do not expose platform identity headers to client forgery.
13. **Database constraints:** many entity relationships are enforced by code instead of SQL foreign keys. Orders/service jobs use JSON payloads. A new production design should consider transactional consistency, indexes, retention and backups; no formal performance/load test or independent security audit was performed.
14. **Configuration duplication:** contact/bank information, delivery origins/rates and financial display constants occur in multiple code locations. Centralize before changing them. Legacy billingVersion orders retain their earlier calculation behavior.

These are candid scope/implementation limits, not claims that an unrelated production outage was observed. The last mobile update is in version 26 and no unresolved build/type/test failure was observed in the handover checks.
