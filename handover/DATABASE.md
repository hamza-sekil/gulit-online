# Database structure

The final schema has **17 application tables**. SQL is SQLite-compatible (Cloudflare D1). Run schema.sql on an empty independent database, or replay the original migrations, not both. No row data, password hashes, customer details or receipts are exported.

`db/schema.ts` and all original SQL/snapshots are included. Many relationships below are application-level and do not have SQL FOREIGN KEY declarations.

## admin_attempts

Namespaced rate-limit counters and reset times for several roles/operations.

| Field | SQL type | Required | Primary key position | Default |
|---|---|---|---|---|
| `key` | TEXT | Yes | 1 | None |
| `count` | INTEGER | Yes | — | None |
| `until` | INTEGER | Yes | — | None |

Indexes: `sqlite_autoindex_admin_attempts_1` (unique).

## admin_credentials

Single owner password account; id=1 is used by application code.

| Field | SQL type | Required | Primary key position | Default |
|---|---|---|---|---|
| `id` | INTEGER | Yes | 1 | None |
| `username` | TEXT | Yes | — | None |
| `salt` | TEXT | Yes | — | None |
| `password_hash` | TEXT | Yes | — | None |

## admin_sessions

Hashed owner login sessions and expiry.

| Field | SQL type | Required | Primary key position | Default |
|---|---|---|---|---|
| `token_hash` | TEXT | Yes | 1 | None |
| `expires` | INTEGER | Yes | — | None |

Indexes: `sqlite_autoindex_admin_sessions_1` (unique).

## deliveries

One delivery assignment/state per order.

| Field | SQL type | Required | Primary key position | Default |
|---|---|---|---|---|
| `order_id` | TEXT | Yes | 1 | None |
| `driver_id` | TEXT | Yes | — | None |
| `state` | TEXT | Yes | — | None |
| `instructions` | TEXT | Yes | — | None |
| `driver_note` | TEXT | Yes | — | None |
| `updated_at` | INTEGER | Yes | — | None |

Indexes: `sqlite_autoindex_deliveries_1` (unique).

## driver_sessions

Driver login sessions.

| Field | SQL type | Required | Primary key position | Default |
|---|---|---|---|---|
| `token_hash` | TEXT | Yes | 1 | None |
| `driver_id` | TEXT | Yes | — | None |
| `expires` | INTEGER | Yes | — | None |

Indexes: `sqlite_autoindex_driver_sessions_1` (unique).

## drivers

Driver identity, access-code hash and active state.

| Field | SQL type | Required | Primary key position | Default |
|---|---|---|---|---|
| `id` | TEXT | Yes | 1 | None |
| `name` | TEXT | Yes | — | None |
| `username` | TEXT | Yes | — | None |
| `code_hash` | TEXT | Yes | — | None |
| `active` | INTEGER | Yes | — | `1` |

Indexes: `drivers_username_unique` (unique), `sqlite_autoindex_drivers_1` (unique).

## engineer_push

Engineer push endpoint records tied to a login session; endpoint is a private capability.

| Field | SQL type | Required | Primary key position | Default |
|---|---|---|---|---|
| `id` | TEXT | Yes | 1 | None |
| `engineer_id` | TEXT | Yes | — | None |
| `endpoint` | TEXT | Yes | — | None |
| `session_hash` | TEXT | Yes | — | None |
| `updated_at` | INTEGER | Yes | — | None |

Indexes: `sqlite_autoindex_engineer_push_1` (unique).

## engineer_sessions

Engineer login sessions.

| Field | SQL type | Required | Primary key position | Default |
|---|---|---|---|---|
| `token_hash` | TEXT | Yes | 1 | None |
| `engineer_id` | TEXT | Yes | — | None |
| `expires` | INTEGER | Yes | — | None |

Indexes: `sqlite_autoindex_engineer_sessions_1` (unique).

## engineers

Engineer account, JSON skills, availability and optional shared GPS location.

| Field | SQL type | Required | Primary key position | Default |
|---|---|---|---|---|
| `id` | TEXT | Yes | 1 | None |
| `name` | TEXT | Yes | — | None |
| `username` | TEXT | Yes | — | None |
| `code_hash` | TEXT | Yes | — | None |
| `skills` | TEXT | Yes | — | None |
| `active` | INTEGER | Yes | — | `1` |
| `available` | INTEGER | Yes | — | `0` |
| `location` | TEXT | No | — | None |
| `location_at` | INTEGER | No | — | None |

Indexes: `engineers_username_unique` (unique), `sqlite_autoindex_engineers_1` (unique).

## order_messages

Text messages for orders and general care thread IDs; sender customer/care.

| Field | SQL type | Required | Primary key position | Default |
|---|---|---|---|---|
| `id` | TEXT | Yes | 1 | None |
| `order_id` | TEXT | Yes | — | None |
| `sender` | TEXT | Yes | — | None |
| `body` | TEXT | Yes | — | None |
| `created_at` | INTEGER | Yes | — | None |

Indexes: `sqlite_autoindex_order_messages_1` (unique).

## orders

Private order access token hash and JSON snapshot of customer/items/charges/payment state.

| Field | SQL type | Required | Primary key position | Default |
|---|---|---|---|---|
| `id` | TEXT | Yes | 1 | None |
| `token_hash` | TEXT | Yes | — | None |
| `payload` | TEXT | Yes | — | None |
| `created_at` | INTEGER | Yes | — | None |

Indexes: `sqlite_autoindex_orders_1` (unique).

## products

Owner overrides/new listings/archives; defaults are also loaded from catalog-defaults.json.

| Field | SQL type | Required | Primary key position | Default |
|---|---|---|---|---|
| `id` | INTEGER | Yes | 1 | None |
| `name` | TEXT | Yes | — | None |
| `category` | TEXT | Yes | — | None |
| `price_cents` | INTEGER | Yes | — | None |
| `stock` | INTEGER | Yes | — | None |
| `image` | TEXT | Yes | — | None |
| `archived` | INTEGER | Yes | — | `0` |
| `revision` | INTEGER | Yes | — | `1` |
| `updated_by` | TEXT | Yes | — | None |
| `updated_at` | TEXT | Yes | — | None |
| `manufacturing_date` | TEXT | No | — | None |
| `expiry_date` | TEXT | No | — | None |

## service_jobs

MEP job trade, assigned engineer/state/revision plus JSON customer/job payload.

| Field | SQL type | Required | Primary key position | Default |
|---|---|---|---|---|
| `id` | TEXT | Yes | 1 | None |
| `trade` | TEXT | Yes | — | None |
| `engineer_id` | TEXT | No | — | None |
| `state` | TEXT | Yes | — | None |
| `payload` | TEXT | Yes | — | None |
| `note` | TEXT | Yes | — | None |
| `revision` | INTEGER | Yes | — | `1` |
| `created_at` | INTEGER | Yes | — | None |
| `updated_at` | INTEGER | Yes | — | None |

Indexes: `sqlite_autoindex_service_jobs_1` (unique).

## store_sessions

Supermarket storekeeper login sessions.

| Field | SQL type | Required | Primary key position | Default |
|---|---|---|---|---|
| `token_hash` | TEXT | Yes | 1 | None |
| `store_id` | TEXT | Yes | — | None |
| `expires` | INTEGER | Yes | — | None |

Indexes: `sqlite_autoindex_store_sessions_1` (unique).

## store_stock

Per-store/product quantity and date pair, optimistic revision and last-update metadata.

| Field | SQL type | Required | Primary key position | Default |
|---|---|---|---|---|
| `store_id` | TEXT | Yes | 1 | None |
| `product_id` | INTEGER | Yes | 2 | None |
| `quantity` | INTEGER | Yes | — | `0` |
| `manufacturing_date` | TEXT | No | — | None |
| `expiry_date` | TEXT | No | — | None |
| `revision` | INTEGER | Yes | — | `1` |
| `updated_at` | INTEGER | Yes | — | None |
| `updated_by` | TEXT | Yes | — | None |

Indexes: `sqlite_autoindex_store_stock_1` (unique).

## stores

Supermarket/branch account; one private store login per record.

| Field | SQL type | Required | Primary key position | Default |
|---|---|---|---|---|
| `id` | TEXT | Yes | 1 | None |
| `name` | TEXT | Yes | — | None |
| `username` | TEXT | Yes | — | None |
| `code_hash` | TEXT | Yes | — | None |
| `active` | INTEGER | Yes | — | `1` |

Indexes: `stores_username_unique` (unique), `sqlite_autoindex_stores_1` (unique).

## support_threads

General pre-order customer-care conversations, protected by private token hash.

| Field | SQL type | Required | Primary key position | Default |
|---|---|---|---|---|
| `id` | TEXT | Yes | 1 | None |
| `token_hash` | TEXT | Yes | — | None |
| `created_at` | INTEGER | Yes | — | None |
| `updated_at` | INTEGER | Yes | — | None |

Indexes: `sqlite_autoindex_support_threads_1` (unique).

## Units and encoded fields

- Prices/amounts in orders and products.price_cents are integer ETB minor units. Public catalog price is a major-unit number.
- Most created_at/updated_at/expires/location_at/until values are epoch milliseconds. products.updated_at is an ISO timestamp string.
- Manufacturing/expiry dates are nullable Gregorian `YYYY-MM-DD` text, not Ethiopian-calendar dates. Unknown/inapplicable dates are null. The validator rejects impossible calendar dates and expiry before manufacturing.
- active, available, archived and similar flags use integer 0/1. store_stock.updated_by=`pending` marks an item awaiting its first count; it is not a checked out-of-stock report. Other values record the editing actor.
- Drivers/engineers/stores store access-code hashes, not plaintext. Session tables store token hashes, not reusable cookie values. A session/code hash is still private account data and is not exported.

## Logical relationships

- driver_sessions.driver_id → drivers.id; deliveries.driver_id → drivers.id; deliveries.order_id → orders.id.
- engineer_sessions.engineer_id and engineer_push.engineer_id → engineers.id; engineer_push.session_hash → engineer_sessions.token_hash.
- service_jobs.engineer_id → engineers.id when assigned.
- store_sessions.store_id and store_stock.store_id → stores.id.
- store_stock.product_id refers to a catalog ID, which can exist only in the default JSON catalog and need not have a products row.
- order_messages.order_id refers to either an order ID or a support-thread ID. General support threads reuse this message table.
- admin_credentials.id is the singleton owner credential record; admin_sessions are not a multi-admin user model.

## JSON payloads that must migrate intact

**orders.payload:** customer name/phone/address/city/mapLink/inAddis; item snapshots (id/name/n/price and, for new orders, manufacturingDate/expiryDate/storeStock); billingVersion; subtotal/sellerTotal/sellerNet/sellerVat/service/serviceVat/delivery/deliveryVat/gulitVat/gulitTotal/total; status; sellerName; sellerPayment/gulitPayment objects with status/detailsReady/receiptKey/receiptType; distanceKm; legacy receipt fields. Older records follow the legacy billing shape. Do not recompute old order totals using the newest formula during a data migration.

**service_jobs.payload:** service, property, customer, phone, city, address, details, preferred visit, mapLink, optional numeric position and sourceThread reference. Engineer assignment and state live in regular columns.

**engineers.skills:** JSON array of trade strings (Plumbing, Electrical, Mechanical). **engineers.location:** optional JSON coordinates/accuracy. Clear/offline/logout operations deliberately remove location.

JSON snapshots are application-versioned rather than normalized relational tables. Inspect the helpers and API writers before transforming them. This handover includes no live payload records.

## Object storage outside SQL

R2 `products/` holds uploaded product image objects; routes expose safe image keys. R2 `receipts/` holds private deposit receipt objects referenced from order JSON. Stock/catalog JSON may also reference static `public/product-photos/` files or remote URLs. A DB-only export is not a complete uploaded-asset backup.


## Version 27 additions (migration `0009_online_payments`)

- `stores.chapa_subaccount` (text, nullable): the supermarket's Chapa sub-account ID. When set, the owner can link the supermarket to an order and the customer can pay the seller amount online; Chapa settles it to the supermarket's bank account.
- `stores.commission_bps` (integer, default 100 = 1%): Gulit commission kept from each online seller payment through Chapa's split.
- `payment_attempts`: one row per Chapa checkout started (`tx_ref`, `order_id`, `party` seller|gulit, `amount_cents`, `status` pending|paid|failed|duplicate, `provider_ref`, timestamps). An order payment is marked verified only after Chapa's verify API confirms status, ETB currency and the full amount.
- Order JSON payment objects (`sellerPayment`, `gulitPayment`) can now also hold `method: "online"`, `txRef`, `providerRef`, `paidCents`, `paidAt`, and for the seller `storeId`, `subaccount`, `commissionBps`. `duplicatePayments` lists extra successful payments of an already-paid bill so the owner can refund them; it is never shown to customers.

## Version 28 additions (migration `0010_routing_zones`)

- `stores.lat`, `stores.lng` (real, nullable): the supermarket's map location, used to choose the nearest supermarket and to price delivery by distance.
- `settings` (`key`, `value` JSON, `updated_at`): owner settings. `delivery_zones` holds the delivery fee zones, for example `[{"upToKm":3,"fee":30000},{"upToKm":7,"fee":55000},{"upToKm":12,"fee":85000},{"upToKm":null,"fee":120000}]` (fees in santim, before VAT).
- Order JSON gains `customerLocation` (from the map pin), `allocation` (`storeId`, `storeName`, `reserved`, timestamps), `deliveryZone` (`zone`, `km`, `estimated`, `label`), `storeState` (`ready` when packed), `items[].missing`, `refundsDue[]` (`party`, `amountCents`, `reason`, `done`) and `closed` (`Cancelled` or `Expired`). `allocation`, `customerLocation`, `refundsDue` and `duplicatePayments` are never sent to customers.

## Version 29 additions (migration `0011_operations`)

- `stores.open_time`, `stores.close_time` (text `HH:MM`, Addis time), `stores.radius_km` (real), `stores.contact_phone`: a supermarket outside its hours, or farther than its radius from the customer, is skipped when routing.
- `drivers.grp` (`own` | `contracted`), `drivers.trip_fee` (santim per trip for contracted riders), `drivers.phone`, `drivers.available`, `drivers.lat`/`lng`/`location_at` (shared when going online).
- `deliveries.provider` (`own` | `contracted` | `yango`), `deliveries.cost_cents`, `deliveries.assigned_by` (`auto` | `owner`). Yango deliveries use `driver_id = 'yango'`.
- `settings` key `ops`: `confirmMinutes` (10), `offerMinutes` (5, 0 = no replacements), `lateMinutes` (60), `riderWaitMinutes` (5), `storekeeperBonus` (santim per order, 0).
- Order JSON gains `storeState` (`new` | `picking` | `ready`), `confirmBy`, `confirmedAt`, `confirmedOnTime`, `missedConfirm[]`, `alerts[]` (`type`, `text`, `done`), `timeline` (`placed`, `confirmed`, `packed`, `paid`, `assigned`, `pickedUp`, `onWay`, `delivered`, `problem`), and on items `offer` (`status` pending|accepted|declined|expired|unavailable, `expiresAt`, `id`, `name`, `price`, `n`), `substituteFor`, `missingStore`. `alerts`, `missedConfirm`, `missingStore` and `timeline.problemNote` are never sent to customers.
