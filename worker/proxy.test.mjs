import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handle, isDocsPath } from './index.mjs';
test('routes only documentation and its assets', () => {
  for (const path of ['/docs', '/docs/', '/docs/quickstart', '/docs/llms.txt', '/mintlify-assets/a.js', '/_mintlify/api/search']) assert.equal(isDocsPath(path), true, path);
  for (const path of ['/docs-other', '/api/mcp', '/dashboard', '/docs-secret']) assert.equal(isDocsPath(path), false, path);
});
test('forwards public content without application credentials or cookies', async () => {
  let seen;
  const response = await handle(new Request('https://truckerfetch.com/docs/quickstart?q=carrier', { headers: { cookie: 'session=private', authorization: 'Bearer secret', 'x-api-key': 'secret', 'cf-access-jwt-assertion': 'secret', accept: 'text/html' } }), async request => {
    seen = request;
    return new Response('docs', { headers: { 'set-cookie': 'upstream=secret', etag: 'fixture' } });
  });
  assert.equal(seen.url, 'https://truckerfetch.mintlify.site/docs/quickstart?q=carrier');
  for (const header of ['cookie','authorization','x-api-key','cf-access-jwt-assertion']) assert.equal(seen.headers.get(header), null);
  assert.equal(seen.headers.get('x-forwarded-host'), 'truckerfetch.com');
  assert.equal(seen.headers.get('accept'), 'text/html');
  assert.equal(response.headers.get('set-cookie'), null);
  assert.equal(response.headers.get('etag'), 'fixture');
  assert.equal(await response.text(), 'docs');
});
test('rewrites upstream redirects to the public domain and preserves the subpath', async () => {
  const response = await handle(new Request('https://truckerfetch.com/docs'), async () => new Response(null, { status: 308, headers: { location: 'https://truckerfetch.mintlify.site/docs/quickstart?tab=api' } }));
  assert.equal(response.headers.get('location'), 'https://truckerfetch.com/docs/quickstart?tab=api');
});
test('passes through off-scope routes unchanged', async () => {
  const request = new Request('https://truckerfetch.com/docs-other');
  await handle(request, async value => { assert.equal(value,request); return new Response('app'); });
});
test('supports anonymous search POST bodies', async () => {
  const response = await handle(new Request('https://truckerfetch.com/_mintlify/api/search', { method:'POST', body:'{"query":"carrier"}', headers:{'content-type':'application/json',cookie:'private'} }), async request => {
    assert.equal(request.method,'POST'); assert.equal(await request.text(),'{"query":"carrier"}'); assert.equal(request.headers.get('cookie'),null); return new Response('{}');
  });
  assert.equal(response.status,200);
});
test('returns a bounded uncached error when origin is unavailable', async () => {
  const response = await handle(new Request('https://truckerfetch.com/docs'), async () => { throw new Error('private upstream failure'); });
  assert.equal(response.status,502); assert.equal(response.headers.get('cache-control'),'no-store'); assert.ok(!(await response.text()).includes('private'));
});
