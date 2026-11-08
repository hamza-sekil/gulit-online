#!/usr/bin/env node
// Gulit Online — deploy helper for Gulit's own Cloudflare account. See DEPLOY.md.
//   node scripts/gulit-deploy.mjs check              preflight: config file, IDs, wrangler login
//   node scripts/gulit-deploy.mjs build              production build (GULIT_DEPLOY=1)
//   node scripts/gulit-deploy.mjs migrate            apply database migrations (records them in d1_migrations)
//   node scripts/gulit-deploy.mjs import <file.sql>  load a data file (e.g. gulit_live_data_import.sql) — new database only
//   node scripts/gulit-deploy.mjs files <folder>     upload R2 files; <folder> mirrors object keys (e.g. receipts/<id>)
//   node scripts/gulit-deploy.mjs secrets            prompts for each secret (wrangler secret put)
//   node scripts/gulit-deploy.mjs deploy             build + deploy the worker
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { resolve, join, relative, extname } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
const configFile = join(root, "deploy", "gulit.production.json");
const d1Config = join(root, "deploy", "wrangler.d1.json");
const builtConfig = join(root, "dist", "server", "wrangler.json");

function fail(message) { console.error("\n✗ " + message + "\n"); process.exit(1); }
function run(cmd, args, extraEnv = {}) {
  console.log("\n$ " + [cmd, ...args].join(" "));
  const r = spawnSync(cmd, args, { cwd: root, stdio: "inherit", shell: process.platform === "win32", env: { ...process.env, ...extraEnv } });
  if (r.status !== 0) fail(`${cmd} ${args[0] || ""} failed (exit ${r.status}).`);
}
function wrangler(...args) { run("npx", ["wrangler", ...args]); }
function settings() {
  if (!existsSync(configFile)) fail("Missing deploy/gulit.production.json — copy deploy/gulit.production.example.json and fill in the D1 database ID.");
  const s = JSON.parse(readFileSync(configFile, "utf8"));
  if (!/^[0-9a-f-]{36}$/i.test(s.d1DatabaseId || "")) fail("deploy/gulit.production.json: d1DatabaseId must be the ID printed by `npx wrangler d1 create`.");
  return s;
}
function writeD1Config(s) {
  // Absolute migrations path so wrangler finds drizzle/ wherever it resolves paths from.
  writeFileSync(d1Config, JSON.stringify({ name: s.workerName, d1_databases: [{ binding: "DB", database_name: s.d1DatabaseName, database_id: s.d1DatabaseId, migrations_dir: join(root, "drizzle") }] }, null, 2));
}

const [command, arg] = process.argv.slice(2);
const s = command && command !== "help" ? settings() : null;
switch (command) {
  case "check": {
    writeD1Config(s);
    const migrations = readdirSync(join(root, "drizzle")).filter((f) => f.endsWith(".sql")).sort();
    console.log(`✓ deploy/gulit.production.json: worker "${s.workerName}", D1 "${s.d1DatabaseName}", R2 "${s.r2BucketName}", ${s.routes?.length ? "routes " + s.routes.join(", ") : "workers.dev only (no domain yet)"}, cron ${(s.crons || []).join(" ") || "none"}`);
    console.log(`✓ ${migrations.length} migrations, last: ${migrations.at(-1)}`);
    wrangler("whoami");
    console.log("\nSecrets to set (node scripts/gulit-deploy.mjs secrets): CHAPA_SECRET_KEY, PUSH_VAPID_PUBLIC_KEY, PUSH_VAPID_PRIVATE_JWK, TELEGRAM_BOT_TOKEN (channel auto-posts), OWNER_SETUP_CODE (only if no owner password exists yet).");
    break;
  }
  case "build":
    run("node", ["scripts/run-framework.mjs", "build"], { GULIT_DEPLOY: "1" });
    if (!existsSync(builtConfig)) fail("Build finished but dist/server/wrangler.json is missing.");
    console.log("\n✓ Built. Worker config: dist/server/wrangler.json");
    break;
  case "migrate":
    writeD1Config(s);
    wrangler("d1", "migrations", "apply", s.d1DatabaseName, "--remote", "--config", d1Config);
    break;
  case "import": {
    if (!arg || !existsSync(arg)) fail("Give the data file: node scripts/gulit-deploy.mjs import gulit_live_data_import.sql");
    writeD1Config(s);
    wrangler("d1", "execute", s.d1DatabaseName, "--remote", "--file", resolve(arg), "--config", d1Config);
    break;
  }
  case "files": {
    if (!arg || !existsSync(arg) || !statSync(arg).isDirectory()) fail("Give a folder whose sub-paths are the object keys, e.g. files/receipts/<id>.");
    const base = resolve(arg), walk = (d) => readdirSync(d).flatMap((n) => { const p = join(d, n); return statSync(p).isDirectory() ? walk(p) : [p]; });
    const types = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" };
    for (const file of walk(base)) {
      const key = relative(base, file).split("\\").join("/");
      const type = types[extname(file).toLowerCase()] || "image/jpeg"; // receipt keys have no extension and are JPEG/PNG photos
      wrangler("r2", "object", "put", `${s.r2BucketName}/${key}`, "--file", file, "--content-type", type, "--remote");
    }
    break;
  }
  case "secrets":
    for (const name of ["CHAPA_SECRET_KEY", "PUSH_VAPID_PUBLIC_KEY", "PUSH_VAPID_PRIVATE_JWK", "TELEGRAM_BOT_TOKEN", "OWNER_SETUP_CODE"]) {
      console.log(`\nSet ${name}? (press Ctrl+C in the next prompt to skip)`);
      run("npx", ["wrangler", "secret", "put", name, "--config", builtConfig]);
    }
    break;
  case "deploy":
    run("node", ["scripts/run-framework.mjs", "build"], { GULIT_DEPLOY: "1" });
    wrangler("deploy", "--config", builtConfig);
    console.log("\n✓ Deployed. Open the workers.dev address printed above and run the test list in DEPLOY.md.");
    break;
  default:
    console.log(readFileSync(new URL(import.meta.url), "utf8").split("\n").slice(1, 10).join("\n"));
}
