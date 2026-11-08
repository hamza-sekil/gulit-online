import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import vinext from "vinext";
import { defineConfig } from "vite";
import hostingConfig from "./.openai/hosting.json";
import { readExecutionProfile } from "./scripts/execution-profile.mjs";
import { configureToolEnvironment } from "./scripts/tool-environment.mjs";
import { sites } from "./scripts/vite/sites-vite-plugin";
import { connectorPreview } from "./scripts/vite/connector-preview-plugin.mjs";

const SITE_CREATOR_PLACEHOLDER_DATABASE_ID =
  "00000000-0000-4000-8000-000000000000";

const { d1, r2 } = hostingConfig;

// Production deploy to Gulit's own Cloudflare account (see DEPLOY.md):
// GULIT_DEPLOY=1 reads deploy/gulit.production.json for the real D1/R2 names, cron and routes.
type GulitDeploy = { workerName: string; d1DatabaseName: string; d1DatabaseId: string; r2BucketName: string; routes?: string[]; crons?: string[]; telegramChannel?: string; telegramPostNow?: string };
function readDeploy(): GulitDeploy | null {
  if (process.env.GULIT_DEPLOY !== "1") return null;
  const file = resolve(process.cwd(), "deploy", "gulit.production.json");
  if (!existsSync(file)) throw new Error("GULIT_DEPLOY=1 needs deploy/gulit.production.json (copy the .example file).");
  const value = JSON.parse(readFileSync(file, "utf8")) as GulitDeploy;
  if (!/^[0-9a-f-]{36}$/i.test(value.d1DatabaseId) || value.d1DatabaseId === SITE_CREATOR_PLACEHOLDER_DATABASE_ID) throw new Error("deploy/gulit.production.json: set d1DatabaseId to the real D1 database ID.");
  if (!value.workerName || !value.d1DatabaseName || !value.r2BucketName) throw new Error("deploy/gulit.production.json: workerName, d1DatabaseName and r2BucketName are required.");
  return value;
}
const deploy = readDeploy();

// macOS Seatbelt blocks FSEvents, so Codex previews need polling for HMR.
const isCodexSeatbeltSandbox = process.env.CODEX_SANDBOX === "seatbelt";
const managedLinux = readExecutionProfile() === "managed-linux";

const localBindingConfig = {
  main: "./worker/index.ts",
  compatibility_flags: ["nodejs_compat"],
  ...(deploy
    ? {
        name: deploy.workerName,
        workers_dev: true,
        preview_urls: false,
        ...(deploy.crons?.length ? { triggers: { crons: deploy.crons } } : {}),
        ...(deploy.routes?.length ? { routes: deploy.routes.map((pattern) => (pattern.includes("*") ? { pattern, zone_name: pattern.split("/")[0].split(".").slice(-2).join(".") } : { pattern, custom_domain: true })) } : {}),
        vars: { GULIT_HOSTING: "own-cloudflare", ...(deploy.telegramChannel ? { TELEGRAM_CHANNEL: deploy.telegramChannel } : {}), ...(deploy.telegramPostNow ? { TELEGRAM_POST_NOW: deploy.telegramPostNow } : {}) },
      }
    : {}),
  d1_databases: d1
    ? [
        {
          binding: d1,
          database_name: deploy?.d1DatabaseName ?? "site-creator-d1",
          database_id: deploy?.d1DatabaseId ?? SITE_CREATOR_PLACEHOLDER_DATABASE_ID,
          migrations_dir: "drizzle",
        },
      ]
    : [],
  r2_buckets: r2
    ? [
        {
          binding: r2,
          bucket_name: deploy?.r2BucketName ?? "site-creator-r2",
        },
      ]
    : [],
};

export default defineConfig(async ({ command }) => {
  configureToolEnvironment(process.cwd());

  // Wrangler snapshots its log path while the Cloudflare plugin is imported.
  const { cloudflare } = await import("@cloudflare/vite-plugin");

  return {
    server: {
      ...(managedLinux
        ? { host: "0.0.0.0", allowedHosts: ["terminal.local"] }
        : {}),
      ...(isCodexSeatbeltSandbox
        ? { watch: { useFsEvents: false, usePolling: true } }
        : {}),
    },
    plugins: [
      vinext(),
      sites({ mockAuth: !managedLinux }),
      connectorPreview(),
      cloudflare({
        viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
        inspectorPort: false,
        config: {
          ...localBindingConfig,
          ...(command === "serve"
            ? {
                services: [
                  {
                    binding: "CONNECTORS",
                    service: "sites-connector-preview",
                    entrypoint: "ConnectorPreview",
                  },
                ],
              }
            : {}),
        },
        ...(command === "serve"
          ? {
              auxiliaryWorkers: [
                {
                  config: {
                    name: "sites-connector-preview",
                    main: "./scripts/connector-preview/worker.mjs",
                    compatibility_date: "2026-05-15",
                  },
                },
              ],
            }
          : {}),
      }),
    ],
  };
});
