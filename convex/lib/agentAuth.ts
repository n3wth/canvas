/**
 * Shared helpers for the agent HTTP surface.
 *
 * Auth is a single shared bearer token (`CANVAS_AGENT_TOKEN`) set on the Convex
 * deployment — something an agent can hold in its env, not a browser cookie.
 * The token never belongs in this repo.
 */

export const PUBLIC_ORIGIN =
  process.env.CANVAS_PUBLIC_ORIGIN?.replace(/\/$/, '') ||
  'https://canvas.n3wth.com';

export const AGENT_CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
} as const;

export function agentJson(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...AGENT_CORS,
    },
  });
}

export function agentOptions(): Response {
  return new Response(null, {status: 204, headers: {...AGENT_CORS}});
}

/** Constant-time-ish string compare (Convex HTTP actions are not Node). */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

/**
 * Returns an error Response when the request is not authorized, otherwise null.
 * Fail closed: if the deployment has no token configured, agent routes 503.
 */
export function requireAgentToken(request: Request): Response | null {
  const expected = process.env.CANVAS_AGENT_TOKEN;
  if (!expected) {
    return agentJson(
      {
        error:
          'Agent API is not configured. Set CANVAS_AGENT_TOKEN on the Convex deployment.',
      },
      503,
    );
  }

  const header = request.headers.get('Authorization') ?? '';
  const match = /^Bearer\s+(\S+)$/i.exec(header.trim());
  if (!match || !safeEqual(match[1], expected)) {
    return agentJson({error: 'Unauthorized'}, 401);
  }
  return null;
}

/**
 * Soft auth for agent HTTP routes and the legacy source push.
 * - Token unset: allow (same trust model as public Convex mutations; local/dev).
 * - Token set: require `Authorization: Bearer <CANVAS_AGENT_TOKEN>`.
 * Set the token on production so only agents that hold it can write.
 */
export function requireAgentTokenIfConfigured(
  request: Request,
): Response | null {
  if (!process.env.CANVAS_AGENT_TOKEN) {
    return null;
  }
  return requireAgentToken(request);
}

export function canvasUrl(slug: string): string {
  return `${PUBLIC_ORIGIN}/c/${slug}`;
}

export async function readJsonBody(
  request: Request,
): Promise<{ok: true; value: unknown} | {ok: false; response: Response}> {
  try {
    return {ok: true, value: await request.json()};
  } catch {
    return {
      ok: false,
      response: agentJson({error: 'Body must be JSON'}, 400),
    };
  }
}
