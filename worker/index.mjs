const ORIGIN = 'truckerfetch.mintlify.site';
const DOMAIN = 'truckerfetch.com';
export function isDocsPath(path) {
  return path === '/docs' || path.startsWith('/docs/') || path.startsWith('/mintlify-assets/') || path.startsWith('/_mintlify/');
}
export async function handle(request, upstream = fetch) {
  const url = new URL(request.url);
  if (!isDocsPath(url.pathname)) return upstream(request);
  url.hostname = ORIGIN;
  url.protocol = 'https:';
  url.port = '';
  // Public docs need no application sessions, API keys, or access tokens.
  const headers = new Headers();
  for (const name of ['accept', 'accept-language', 'content-type', 'user-agent', 'range', 'if-none-match', 'if-modified-since', 'rsc', 'next-router-state-tree', 'next-router-prefetch', 'next-url']) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  headers.set('X-Forwarded-Host', DOMAIN);
  headers.set('X-Forwarded-Proto', 'https');
  const init = { method: request.method, headers, redirect: 'manual', signal: AbortSignal.timeout(20_000) };
  if (!['GET', 'HEAD'].includes(request.method)) { init.body = request.body; init.duplex = 'half'; }
  try {
    const result = await upstream(new Request(url, init));
    const response = new Response(result.body, result);
    response.headers.delete('set-cookie');
    const location = response.headers.get('location');
    if (location) {
      const target = new URL(location, url);
      if (target.hostname === ORIGIN) {
        target.protocol = 'https:';
        target.hostname = DOMAIN;
        target.port = '';
        response.headers.set('location', target.href);
      }
    }
    response.headers.set('X-Content-Type-Options', 'nosniff');
    return response;
  } catch {
    return new Response('Documentation is temporarily unavailable. Please retry.', { status: 502, headers: { 'Cache-Control': 'no-store', 'Content-Type': 'text/plain; charset=utf-8' } });
  }
}
export default { fetch(request) { return handle(request); } };
