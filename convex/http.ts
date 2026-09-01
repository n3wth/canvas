import {httpRouter} from 'convex/server';
import {httpAction} from './_generated/server';
import {api, internal} from './_generated/api';
import {
  AGENT_CORS,
  PUBLIC_ORIGIN,
  agentJson,
  agentOptions,
  canvasUrl,
  readJsonBody,
  requireAgentTokenIfConfigured,
} from './lib/agentAuth';

const http = httpRouter();

const LEGACY_CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function legacyJson(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {'Content-Type': 'application/json', ...LEGACY_CORS},
  });
}

/**
 * Legacy push endpoint. Prefer PUT /agent/v1/canvases/:slug/source.
 * When CANVAS_AGENT_TOKEN is set on the deployment, Bearer auth is required.
 */
http.route({
  path: '/canvas/source',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    const denied = requireAgentTokenIfConfigured(request);
    if (denied) {
      return denied;
    }

    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      return legacyJson({error: 'Body must be JSON'}, 400);
    }

    if (typeof payload !== 'object' || payload === null) {
      return legacyJson({error: 'Body must be a JSON object'}, 400);
    }

    const {slug, source} = payload as Record<string, unknown>;
    if (typeof slug !== 'string' || slug.length === 0) {
      return legacyJson({error: 'Field "slug" is required'}, 400);
    }
    if (typeof source !== 'string') {
      return legacyJson({error: 'Field "source" is required'}, 400);
    }

    try {
      const {version} = await ctx.runMutation(internal.canvases.pushSource, {
        slug,
        source,
        editorId: 'http',
      });
      return legacyJson({slug, version, url: canvasUrl(slug)});
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Push failed';
      return legacyJson({error: message}, 404);
    }
  }),
});

http.route({
  path: '/canvas/source',
  method: 'OPTIONS',
  handler: httpAction(async () => {
    return new Response(null, {status: 204, headers: LEGACY_CORS});
  }),
});

/** Create a canvas. Returns the live share URL. */
http.route({
  path: '/agent/v1/canvases',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    const denied = requireAgentTokenIfConfigured(request);
    if (denied) {
      return denied;
    }

    const body = await readJsonBody(request);
    if (!body.ok) {
      return body.response;
    }
    if (typeof body.value !== 'object' || body.value === null) {
      return agentJson({error: 'Body must be a JSON object'}, 400);
    }

    const {
      title,
      kind,
      source,
    } = body.value as Record<string, unknown>;

    const resolvedKind =
      kind === undefined || kind === null
        ? 'html'
        : kind === 'html' || kind === 'react'
          ? kind
          : null;
    if (resolvedKind === null) {
      return agentJson(
        {error: 'Field "kind" must be "html" or "react" when provided'},
        400,
      );
    }
    if (title !== undefined && typeof title !== 'string') {
      return agentJson({error: 'Field "title" must be a string'}, 400);
    }
    if (source !== undefined && typeof source !== 'string') {
      return agentJson({error: 'Field "source" must be a string'}, 400);
    }

    try {
      const {slug} = await ctx.runMutation(api.canvases.create, {
        title: typeof title === 'string' ? title : undefined,
        kind: resolvedKind,
        source: typeof source === 'string' ? source : undefined,
      });

      const canvas = await ctx.runQuery(api.canvases.getBySlug, {slug});
      return agentJson(
        {
          slug,
          url: canvasUrl(slug),
          kind: canvas?.kind ?? resolvedKind,
          title: canvas?.title ?? title ?? 'Untitled canvas',
          version: canvas?.version ?? 1,
          updatedAt: canvas?.updatedAt ?? Date.now(),
        },
        201,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Create failed';
      return agentJson({error: message}, 400);
    }
  }),
});

/** List recent canvases (metadata only — no source bodies). */
http.route({
  path: '/agent/v1/canvases',
  method: 'GET',
  handler: httpAction(async (ctx, request) => {
    const denied = requireAgentTokenIfConfigured(request);
    if (denied) {
      return denied;
    }

    const rows = await ctx.runQuery(api.canvases.list, {});
    return agentJson({
      canvases: rows.map((row) => ({
        slug: row.slug,
        url: canvasUrl(row.slug),
        kind: row.kind,
        title: row.title,
        version: row.version,
        updatedAt: row.updatedAt,
      })),
    });
  }),
});

http.route({
  path: '/agent/v1/canvases',
  method: 'OPTIONS',
  handler: httpAction(async () => agentOptions()),
});

/**
 * Read one canvas (GET …/canvases/:slug) or replace its source
 * (PUT …/canvases/:slug/source).
 */
http.route({
  pathPrefix: '/agent/v1/canvases/',
  method: 'GET',
  handler: httpAction(async (ctx, request) => {
    const denied = requireAgentTokenIfConfigured(request);
    if (denied) {
      return denied;
    }

    const url = new URL(request.url);
    const rest = url.pathname.replace(/^\/agent\/v1\/canvases\//, '');
    const slug = rest.split('/').filter(Boolean)[0];
    if (!slug) {
      return agentJson({error: 'Missing slug'}, 400);
    }

    const canvas = await ctx.runQuery(api.canvases.getBySlug, {slug});
    if (canvas === null) {
      return agentJson({error: `No canvas with slug "${slug}"`}, 404);
    }

    return agentJson({
      slug: canvas.slug,
      url: canvasUrl(canvas.slug),
      kind: canvas.kind,
      title: canvas.title,
      source: canvas.source,
      version: canvas.version,
      updatedAt: canvas.updatedAt,
    });
  }),
});

http.route({
  pathPrefix: '/agent/v1/canvases/',
  method: 'PUT',
  handler: httpAction(async (ctx, request) => {
    const denied = requireAgentTokenIfConfigured(request);
    if (denied) {
      return denied;
    }

    const url = new URL(request.url);
    const rest = url.pathname.replace(/^\/agent\/v1\/canvases\//, '');
    const parts = rest.split('/').filter(Boolean);
    const slug = parts[0];
    const action = parts[1];

    if (!slug || action !== 'source' || parts.length !== 2) {
      return agentJson(
        {
          error:
            'Use PUT /agent/v1/canvases/:slug/source with JSON {"source":"..."}',
        },
        404,
      );
    }

    const body = await readJsonBody(request);
    if (!body.ok) {
      return body.response;
    }
    if (typeof body.value !== 'object' || body.value === null) {
      return agentJson({error: 'Body must be a JSON object'}, 400);
    }

    const {source} = body.value as Record<string, unknown>;
    if (typeof source !== 'string') {
      return agentJson({error: 'Field "source" is required'}, 400);
    }

    try {
      const {version} = await ctx.runMutation(api.canvases.setSource, {
        slug,
        source,
        editorId: 'agent',
      });
      return agentJson({slug, version, url: canvasUrl(slug)});
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Write failed';
      const status = message.startsWith('No canvas') ? 404 : 400;
      return agentJson({error: message}, status);
    }
  }),
});

http.route({
  pathPrefix: '/agent/v1/canvases/',
  method: 'OPTIONS',
  handler: httpAction(async () => agentOptions()),
});

/** Health / discovery for agents probing the deployment. */
http.route({
  path: '/agent/v1',
  method: 'GET',
  handler: httpAction(async () => {
    return agentJson({
      name: 'canvas-agent-api',
      version: 1,
      publicOrigin: PUBLIC_ORIGIN,
      endpoints: {
        create: 'POST /agent/v1/canvases',
        list: 'GET /agent/v1/canvases',
        read: 'GET /agent/v1/canvases/:slug',
        writeSource: 'PUT /agent/v1/canvases/:slug/source',
      },
      auth: 'Authorization: Bearer $CANVAS_AGENT_TOKEN (required when that env is set on the deployment)',
    });
  }),
});

http.route({
  path: '/agent/v1',
  method: 'OPTIONS',
  handler: httpAction(async () => agentOptions()),
});

// Silence unused import if tree-shaken oddly; AGENT_CORS is used via helpers.
void AGENT_CORS;

export default http;
