import handler from "vinext/server/fetch-handler";
import { runWithConnectorBinding } from "../lib/connector-context";
import type { ConnectorBinding } from "../lib/connector-contract.mjs";
import { onChatGPTSites, stripPlatformHeaders, assetLinksResponse } from "../lib/hosting";
import { sweep } from "../lib/ops";
import { postIfDue } from "../lib/telegram";

const worker = {
  fetch(request: Request, env: Cloudflare.Env, ctx: ExecutionContext<{ CONNECTORS?: ConnectorBinding }>) {
    // Off ChatGPT Sites, platform identity headers are untrusted: remove them before any route sees them.
    if (!onChatGPTSites(env)) request = stripPlatformHeaders(request);
    if (new URL(request.url).pathname === "/.well-known/assetlinks.json") return assetLinksResponse(env);
    let binding = ctx.props?.CONNECTORS;
    // Local preview emulates the same request-scoped capability. This branch and
    // the auxiliary service binding are absent from production builds.
    if (import.meta.env.DEV && !binding && env.CONNECTORS) {
      const preview = env.CONNECTORS;
      const expiresAt = Date.now() + 60_000;
      binding = {
        async getContext() {
          if (Date.now() >= expiresAt) return { status: "request_context_expired" };
          return preview.getContext?.() ?? { status: "binding_unavailable" };
        },
        async invoke(connectorId, actionName, args) {
          if (Date.now() >= expiresAt) {
            return { status: "request_context_expired", message: "This request has expired. Please try again." };
          }
          return preview.invoke(connectorId, actionName, args);
        },
      };
    }
    return runWithConnectorBinding(binding, () => handler.fetch(request, env, ctx));
  },
  // Cloudflare Cron Trigger (see deploy/wrangler settings): runs order automation every minute even when nobody has an app open.
  scheduled(_event: ScheduledController, _env: Cloudflare.Env, ctx: ExecutionContext) {
    ctx.waitUntil(sweep());
    ctx.waitUntil(postIfDue().catch(() => {}));
  },
};

export default worker;
