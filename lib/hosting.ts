import { env } from 'cloudflare:workers';
// Where this copy of Gulit runs. "Sign in with ChatGPT" only exists on ChatGPT Sites, where the platform itself
// adds the oai-authenticated-* headers. On any other host (Gulit's own Cloudflare account) those headers could be
// forged by anyone, so they are ignored and stripped unless GULIT_HOSTING is exactly "chatgpt-sites".
export function onChatGPTSites(e: any = env) { return e?.GULIT_HOSTING === 'chatgpt-sites'; }
export function ownerSetupCode(e: any = env) { const c = e?.OWNER_SETUP_CODE; return typeof c === 'string' && c.length >= 16 ? c : null; }
export function stripPlatformHeaders(request: Request) {
  let found = false;
  for (const name of request.headers.keys()) if (name.toLowerCase().startsWith('oai-')) { found = true; break; }
  if (!found) return request;
  const headers = new Headers(request.headers);
  for (const name of [...headers.keys()]) if (name.toLowerCase().startsWith('oai-')) headers.delete(name);
  return new Request(request, { headers });
}

// Android app (Trusted Web Activity) proof that gulitonline.com belongs to the app.
// Set ANDROID_PACKAGE (e.g. com.gulitonline.app) and ANDROID_CERT_SHA256 (from Play Console → App signing; comma-separated if several).
export function assetLinksResponse(e: any = env) {
  const pkg = String(e?.ANDROID_PACKAGE || '').trim(), certs = String(e?.ANDROID_CERT_SHA256 || '').split(',').map(x => x.trim().toUpperCase()).filter(x => /^([0-9A-F]{2}:){31}[0-9A-F]{2}$/.test(x));
  if (!/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/.test(pkg) || !certs.length) return new Response('[]', { status: 404, headers: { 'Content-Type': 'application/json' } });
  return new Response(JSON.stringify([{ relation: ['delegate_permission/common.handle_all_urls'], target: { namespace: 'android_app', package_name: pkg, sha256_cert_fingerprints: certs } }]), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600' } });
}
