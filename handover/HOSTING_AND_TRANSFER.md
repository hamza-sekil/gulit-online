# Hosting and transfer

## Current hosting

| Item | Recorded current value / behavior |
|---|---|
| Public domain | https://gulitonline.com (www also used in the project) |
| Site hosting/control plane | ChatGPT Sites, public audience |
| Execution provider | Cloudflare Workers |
| Database/storage | Platform-provisioned Cloudflare D1 / R2, logical bindings DB / BUCKET |
| Generated Site origin | https://hek-market-ethiopia.xnbkz8f2qx.chatgpt.site |
| Site project ID | appgprj_6ae64278a7a881918af8d353f886e41d |
| Latest published source version | 26 |
| Source SHA | 0ed1e2fa53a6245002a85f3fc944cbf45a014c75 |
| Saved version ID | appgprj_6ae64278a7a881918af8d353f886e41d~appgver_bfe6f7aa81d08191a72e035cbb469d27 |
| Deployment ID | appgdep_6aee4361c6b08191842e9dd918feda6e |
| Last recorded deployment result | Succeeded, runtime environment revision 2 |

The application was not uploaded to a cPanel/public_html directory and is not hosted as WordPress. Domain registration and DNS are separate from the Worker hosting. Earlier project work used Dynadot for domain management; this export did not log into the registrar or independently verify current registrar ownership/DNS records. Keep domain control with the owner until the new deployment has been validated.

## How publication works now

The platform workflow synchronizes the selected Site's Git repository, builds the Worker/assets, packages a deployment archive, saves a version tied to the pushed source SHA, then deploys that saved version. Native Sites publication provisions storage and applies pending D1 schema migrations before publishing the Worker. Site access configuration and runtime secret values are managed separately from source. Local `npm run build` or `npm start` does not publish production.

`.openai/hosting.json` preserves the current project ID plus DB/R2 logical names. `vite.config.ts` emits local placeholder bindings; do not mistake the all-zero local D1 ID for a real production resource ID. Source/tooling is included, but the external Sites control-plane helpers and account authorization are platform services, not transferred credentials.

`handover/deployment-artifact-v26.tar.gz` is the local built package prepared for the same latest published source. It contains the Worker build/assets/hosting manifest and no production data or secret settings. It is useful for inspection/recovery in the existing Sites workflow. It is not an Android/iOS binary and is not a one-click generic cPanel/Vercel deployment.

## Stay on Sites

The owner must grant the intended developer appropriate project editing access through the platform. This ZIP grants no access by itself. The developer can use the same project ID and supported Site source/build/save/deploy workflow, preserving its public audience and existing bindings. Do not create a second project accidentally or overwrite database/storage settings. Secrets can stay configured on the existing Site while the developer works on source; do not paste private values into chat.

## Move to an independently owned host

1. Choose a Cloudflare Workers/D1/R2 deployment or budget a server/database adapter port. Generic Node/VPS hosting is not drop-in: the current code imports `cloudflare:workers`, uses Worker-specific APIs and D1/R2 bindings.
2. Build the included source using the lockfile. Provision an owned D1 database and R2 bucket, configure Worker compatibility/bindings, runtime names, domain and HTTPS in that account. Do not deploy local placeholder IDs as production bindings. Sites manifests and identity routes may require adaptation outside Sites.
3. Obtain an authorized **production** D1 export and R2 object migration separately if preserving live business data. This ZIP does not contain them. Do not migrate local `.wrangler` preview data as if it were production. Obtain provider-specific database/bucket identifiers through the owner's hosting access; no independent account/resource credentials are included here.
4. Preserve immutable migration history; decide whether to restore the live schema+data or initialize a fresh empty schema. Do not replay create-table migrations on a restored database. Reconcile migration tracking before the next upgrade.
5. Implement trusted owner authentication/bootstrap. On an independent host, reject/strip untrusted identity headers before enabling the platform-owner branch. Password-based owner login can continue after credential initialization/migration. Secure session flags should remain enabled.
6. Keep the existing VAPID key pair through a private operator transfer if retaining existing push subscriptions, or intentionally rotate it and require re-subscription. Do not publish push endpoints or private signing keys in source.
7. Test products/photos, dates, owner login, orders, each deposit slip, admin verification, seller care chat, drivers, MEP jobs/location/push and storekeeper isolation/stock under the final HTTPS domain.
8. Back up data and arrange a controlled write freeze/final sync for cutover. Change DNS only to the verified target records returned by the chosen host. Retain the old deployment until smoke tests and data reconciliation pass. Do not change nameservers blindly or break company email DNS.
9. Review browser local-storage and cookies: customer order/support access depends on keeping the same origin/browser data. A different domain does not automatically inherit it.

These are transfer requirements; no DNS/account permissions, production data export or new hosting deployment were performed by this handover operation.

## Mobile delivery and store accounts

The existing URLs deliver separate installable web apps using manifests and `/sw.js`; mobile installation is through browser/Home Screen controls. Store accounts, D-U-N-S and payment discussions are administrative prerequisites only. The next developer must create native projects/wrappers as appropriate, prepare signing keys, handle platform capabilities and privacy metadata, test on physical devices and submit for review. There is no existing APK/AAB/IPA or store listing to upload or transfer in this package.

## External items the owner must retain/provide separately

- Domain registrar/DNS control and any hosting ownership grants.
- Production D1 and R2 export/migration access, including uploaded assets and private receipts.
- Administrator/company email control and any D&B application correspondence (no issued D-U-N-S confirmation is included here).
- Google/Apple developer-account ownership/payment receipts if accounts were opened later, and app signing material if a separate developer produced any later native build.
- Any supplier price/catalog feeds, original HEK inventory export and owned seller photos not already in this repository.
