# Provenance and verification

## Export validation

- The project control plane reported an active public Site and latest version 26 during this export.
- get_site_version for version 26 reported source commit `0ed1e2fa53a6245002a85f3fc944cbf45a014c75`, matching the clean local repository HEAD.
- All 378 original tracked files were exported from that Git commit and checked byte-for-byte against the commit. Working files, old chat snippets and untracked runtime state were not substituted.
- Nine schema migrations (0000–0008) were applied to a new in-memory SQLite database; a final schema-only SQL file was generated and successfully applied to a second empty database. Table/field/index definitions are documented.
- ZIP integrity, file manifest coverage and per-file SHA256 hashes were checked before delivery.
- Common secret/key patterns and excluded-state filenames were checked in source/build artifacts. No real secret values are included. A SanDisk product URL was a false-positive substring match and was retained as public photo provenance.

## Code checks rerun on the exported source revision

All completed successfully:

```sh
node --experimental-vm-modules tests/catalog.test.mjs
node --experimental-vm-modules tests/storekeeper.test.mjs
node tests/engineer-location.test.mjs
node tests/push-worker.test.mjs
node tests/gps.test.mjs
node node_modules/typescript/bin/tsc --noEmit
```

Coverage includes role/owner boundaries, cross-origin protection, product persistence and edit conflicts, calendar-date validation, separate-store isolation and stock aggregation, staff revocation/reset/logout, order server pricing, separate payment slips, care privacy, paid-only dispatch, MEP assignment constraints, GPS cancellation/races, VAPID signing/endpoint validation and generic push-worker behavior.

The latest publication build had already completed successfully for this exact revision. It was not rebuilt or republished solely for this export. The included deployment artifact is the locally prepared build archive used in that latest publication workflow; its file SHA256 is recorded separately in PROVENANCE.json. The Sites storage content hash is platform metadata and is not used as a raw-file checksum.

## Limits

These checks use in-memory SQL and mocked platform/push interfaces where applicable. They are not a production load test, a penetration test, a live bank verification, a complete real-device Safari/Android test, or proof that a notification was delivered to a physical phone. The last Storekeeper mobile change was inspected at phone width using sample data and the live login page was opened after publishing. No live account/data export or email/app-store audit was performed during handover.
