# Gulit Online for iPhone (Capacitor shell)

This folder is the starting point for the App Store app. It is **not built or tested yet**: it needs a Mac with Xcode, an Apple Developer account (MOM Manufacturing PLC) and about 1–2 weeks of developer time. Publish Android first (deploy/STORES.md).

## Why extra work for iPhone
Apple rejects apps that are only a website in a frame (App Review Guideline 4.2, Minimum Functionality). The app must add things the website can't do on its own. Plan:

| Native feature | Plugin | What to build |
|---|---|---|
| Order notifications (confirmed, replacement offer, packed, picked up, delivered) | `@capacitor/push-notifications` | Register for APNs, send the device token to a new endpoint like `/api/orders/push` (type `apns`), and send pushes from the server with an APNs auth key (.p8), or through Firebase Cloud Messaging. The web version of this already works (lib/order-push.ts); the server needs an APNs/FCM sender beside the Web Push one. |
| Delivery pin from GPS | `@capacitor/geolocation` | Use the native location prompt for "Use my current location" at checkout. |
| Share order / invite | `@capacitor/share` | Native share sheet for the order link and app invite. |
| Splash screen, haptics, offline screen | `@capacitor/splash-screen`, `@capacitor/haptics` | Native launch screen; haptic feedback on add-to-bag; offline message (www/index.html). |

The shop detects the app with `window.Capacitor?.isNativePlatform()`, and uses the native plugins there and the web features elsewhere.

## Steps on the Mac
1. `cd mobile && npm install && npx cap add ios && npx cap sync ios && npx cap open ios`
2. In Xcode:
   - Set the team (MOM Manufacturing PLC) and bundle ID `com.gulitonline.app`.
   - Add the Push Notifications and Background Modes → Remote notifications capabilities.
   - Add the app icon (1024×1024 from public/icon-512.png redrawn at full size) and the location usage text: "Used to set your delivery location."
3. Build the native features above, then test on a real iPhone.
4. In App Store Connect:
   - Create the app.
   - Fill in the privacy labels from deploy/STORES.md.
   - Add the screenshots (`node scripts/store-screenshots.mjs`, app-store folder).
   - Upload the build from Xcode, then submit with the review notes from deploy/STORES.md, listing the native features.

## Payments
Groceries and delivery are physical goods and services, so Apple's in-app purchase isn't used. Chapa opens inside the app (allowed by `allowNavigation`).
