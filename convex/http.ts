import {httpRouter} from 'convex/server';
import {httpAction} from './_generated/server';
import {internal} from './_generated/api';

const http = httpRouter();

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {'Content-Type': 'application/json', ...CORS_HEADERS},
  });
}

/**
 * Push new source into an existing canvas from outside the browser, so a
 * script or an agent can drive a preview that someone else is watching.
 *
 *   curl -X POST "$CONVEX_SITE_URL/canvas/source" \
 *     -H 'Content-Type: application/json' \
 *     -d '{"slug":"abc123","source":"<h1>hi</h1>"}'
 */
http.route({
  path: '/canvas/source',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      return json({error: 'Body must be JSON'}, 400);
    }

    if (typeof payload !== 'object' || payload === null) {
      return json({error: 'Body must be a JSON object'}, 400);
    }

    const {slug, source} = payload as Record<string, unknown>;
    if (typeof slug !== 'string' || slug.length === 0) {
      return json({error: 'Field "slug" is required'}, 400);
    }
    if (typeof source !== 'string') {
      return json({error: 'Field "source" is required'}, 400);
    }

    try {
      const {version} = await ctx.runMutation(internal.canvases.pushSource, {
        slug,
        source,
        editorId: 'http',
      });
      return json({slug, version});
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Push failed';
      return json({error: message}, 404);
    }
  }),
});

http.route({
  path: '/canvas/source',
  method: 'OPTIONS',
  handler: httpAction(async () => new Response(null, {status: 204, headers: CORS_HEADERS})),
});

export default http;
