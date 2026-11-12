import handler from "vinext/server/fetch-handler";
import { runWithConnectorBinding } from "../lib/connector-context";
import type { ConnectorBinding } from "../lib/connector-contract.mjs";
import { onChatGPTSites, stripPlatformHeaders, assetLinksResponse } from "../lib/hosting";
import { sweep } from "../lib/ops";
import { postIfDue } from "../lib/telegram";
import { countable, recordVisit, SOURCE_LINKS } from "../lib/visits";

// People type or share links in many forms ("Gulitonline.com/Partners", "/partner", "/partners.html"):
// send them to the real page instead of a 404. API, asset and app paths are left alone.
const ALIASES: Record<string, string> = { "/partner": "/partners", "/partners.html": "/partners", "/register": "/partners", "/join": "/partners", "/sell": "/partners", "/agreement": "/partners/agreement", "/partner/agreement": "/partners/agreement", "/owner": "/admin", "/owners": "/admin", "/login": "/admin/login", "/owner/login": "/admin/login", "/dashboard": "/admin", "/applications": "/admin/partners", "/owner/partners": "/admin/partners", "/owner/applications": "/admin/partners", "/supermarket": "/storekeeper", "/store": "/storekeeper", "/rider": "/driver" };
export function friendlyRedirect(request: Request): Response | null {
  if (request.method !== "GET" && request.method !== "HEAD") return null;
  const url = new URL(request.url);
  if (/^\/(api|_next|assets|social|product-photos)\//i.test(url.pathname) || /\.[a-z0-9]{2,5}$/i.test(url.pathname) && !/\.html$/i.test(url.pathname)) return null;
  let p = url.pathname.toLowerCase().replace(/\/+$/, "") || "/";
  // Tracking short links (gulitonline.com/tg, /tt, /yt …) open the shop and record where the visitor came from.
  const DEPT: Record<string, string> = { "/mep": "mep", "/services": "mep", "/laundry": "laundry", "/garage": "garage", "/import": "import" };
  if (DEPT[p]) { const q = new URLSearchParams(url.search); q.set("department", DEPT[p]); url.pathname = "/"; url.search = "?" + q.toString(); return Response.redirect(url.toString(), 302); }
  if (SOURCE_LINKS[p]) { url.pathname = "/"; url.search = "?s=" + SOURCE_LINKS[p]; return Response.redirect(url.toString(), 302); }
  p = ALIASES[p] || p;
  if (p === url.pathname) return null;
  url.pathname = p;
  return Response.redirect(url.toString(), 301);
}

const worker = {
  fetch(request: Request, env: Cloudflare.Env, ctx: ExecutionContext<{ CONNECTORS?: ConnectorBinding }>) {
    // Off ChatGPT Sites, platform identity headers are untrusted: remove them before any route sees them.
    if (!onChatGPTSites(env)) request = stripPlatformHeaders(request);
    if (new URL(request.url).pathname === "/.well-known/assetlinks.json") return assetLinksResponse(env);
    const friendly = friendlyRedirect(request);
    if (friendly) return friendly;
    if (countable(request)) ctx.waitUntil(recordVisit(request).catch(() => {}));
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
