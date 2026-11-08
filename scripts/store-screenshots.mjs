#!/usr/bin/env node
// Makes app-store screenshots from the live shop (or a test address):
//   npm i -D playwright && npx playwright install chromium
//   node scripts/store-screenshots.mjs https://gulitonline.com [orderId orderToken]
// Output: store-screenshots/google-play/*.png (1080×1920) and store-screenshots/app-store/*.png (1320×2868, iPhone 6.9").
// Pass an order ID and its private code (from "My orders" on your phone) to include the order-progress screen.
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const base = (process.argv[2] || "https://gulitonline.com").replace(/\/$/, "");
const [orderId, orderToken] = process.argv.slice(3);
let chromium;
try { ({ chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright")); }
catch { console.error("Install Playwright first: npm i -D playwright && npx playwright install chromium"); process.exit(1); }

const catalog = await (await fetch(base + "/api/catalog")).json();
const live = catalog.products.filter((p) => !p.draft && p.stock > 0 && p.price > 0 && !/photo-pending|icon-512/.test(p.image));
if (live.length < 3) { console.error(`Only ${live.length} live products with own photos. Publish real products first (owner menu → Import).`); process.exit(1); }
const cart = Object.fromEntries(live.slice(0, 4).map((p, i) => [p.id, i === 0 ? 2 : 1]));
const init = `try{localStorage.setItem('hekcart',${JSON.stringify(JSON.stringify(cart))});${orderId ? `localStorage.setItem('gulitOrders',${JSON.stringify(JSON.stringify([{ id: orderId, token: orderToken }]))});` : ""}}catch{}`;

const devices = [
  { folder: "google-play", width: 360, height: 640 },
  { folder: "app-store", width: 440, height: 956 },
];
const screens = [
  { name: "1-shop", run: async () => {} },
  { name: "2-groceries", run: async (p) => { await p.evaluate(() => window.scrollTo(0, Math.min(900, document.body.scrollHeight / 4))); } },
  { name: "3-cart", run: async (p) => { await p.evaluate(() => showCart()); } },
  { name: "4-checkout", run: async (p) => { await p.evaluate(() => checkout()); } },
  ...(orderId ? [{ name: "5-order-progress", run: async (p) => { await p.evaluate(() => openSavedOrder(0)); } }] : []),
  { name: "6-customer-care", run: async (p) => { await p.evaluate(() => document.getElementById("careLaunch")?.click()); } },
];
const browser = await chromium.launch();
for (const d of devices) {
  const dir = join("store-screenshots", d.folder); mkdirSync(dir, { recursive: true });
  for (const s of screens) {
    const ctx = await browser.newContext({ viewport: { width: d.width, height: d.height }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, locale: "en-US" });
    await ctx.addInitScript(init);
    const page = await ctx.newPage();
    await page.goto(base + "/", { waitUntil: "networkidle" });
    await page.evaluate(() => document.getElementById("careWelcome")?.remove());
    if (s.name !== "6-customer-care") await page.addStyleTag({ content: "#careLaunch{display:none!important}" });
    await s.run(page); await page.waitForTimeout(900);
    await page.screenshot({ path: join(dir, s.name + ".png") });
    await ctx.close();
    console.log("✓", d.folder, s.name);
  }
}
await browser.close();
console.log("\nScreenshots are in store-screenshots/. Check each one before uploading.");
