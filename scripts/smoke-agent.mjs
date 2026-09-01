#!/usr/bin/env node
/**
 * Smoke the agent HTTP API against a Convex site URL.
 *
 * Usage:
 *   CANVAS_SITE_URL=https://….convex.site \
 *   CANVAS_AGENT_TOKEN=… \
 *   node scripts/smoke-agent.mjs
 *
 * Exits non-zero on any failed step. Prints the public share URL on success.
 */
const site = process.env.CANVAS_SITE_URL?.replace(/\/$/, '');
const token = process.env.CANVAS_AGENT_TOKEN;

if (!site) {
  console.error('Need CANVAS_SITE_URL in the environment.');
  process.exit(1);
}

const headers = {
  'Content-Type': 'application/json',
  ...(token ? {Authorization: `Bearer ${token}`} : {}),
};

async function req(method, path, body) {
  const res = await fetch(`${site}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = {raw: text};
  }
  if (!res.ok) {
    throw new Error(`${method} ${path} → ${res.status}: ${text}`);
  }
  return json;
}

const stamp = new Date().toISOString();
const source1 = `<!doctype html><html><body style="font-family:system-ui;padding:2rem"><h1>agent smoke</h1><p>${stamp}</p></body></html>`;
const source2 = `<!doctype html><html><body style="font-family:system-ui;padding:2rem;background:#111;color:#eee"><h1>agent smoke updated</h1><p>${stamp}</p></body></html>`;

const created = await req('POST', '/agent/v1/canvases', {
  title: `smoke ${stamp}`,
  kind: 'html',
  source: source1,
});
console.log('created', created);

if (!created.slug || !created.url) {
  throw new Error('create response missing slug/url');
}

const written = await req('PUT', `/agent/v1/canvases/${created.slug}/source`, {
  source: source2,
});
console.log('written', written);

const read = await req('GET', `/agent/v1/canvases/${created.slug}`);
if (read.source !== source2) {
  throw new Error('read-back source mismatch');
}
console.log('read ok, version', read.version);

const listed = await req('GET', '/agent/v1/canvases');
if (!listed.canvases?.some((c) => c.slug === created.slug)) {
  throw new Error('list missing created slug');
}
console.log('list ok, count', listed.canvases.length);

const publicRes = await fetch(created.url, {redirect: 'follow'});
if (!publicRes.ok) {
  throw new Error(`public URL ${created.url} → ${publicRes.status}`);
}
console.log('public URL ok', created.url);
console.log('SMOKE_OK');
