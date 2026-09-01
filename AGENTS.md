# AGENTS

## Directory

```
src/app/            Next.js App Router
  layout.tsx        Fonts + providers
  page.tsx          Canvas index
  c/[slug]/page.tsx Canvas by slug
src/components/     CanvasIndex, CanvasWorkspace
src/lib/            preview.ts (source→iframe), identity.ts (per-tab id)
src/theme/          n3wthTheme.ts → generated n3wth.{css,js,d.ts}
convex/             schema.ts, canvases.ts, presence.ts, http.ts
skills/canvas/SKILL.md  Agent skill (HTTP API docs)
```

## Agent HTTP routes (`convex/http.ts`)

Base: `$CANVAS_SITE_URL` (Convex site host). Auth: `Bearer $CANVAS_AGENT_TOKEN` when set.

| Method | Path | Body |
|--------|------|------|
| POST | `/agent/v1/canvases` | `{title?, kind: "html"|"react"|"markdown", source?}` |
| GET | `/agent/v1/canvases` | — |
| GET | `/agent/v1/canvases/:slug` | — |
| PUT | `/agent/v1/canvases/:slug/source` | `{source}` |

## Add a markdown canvas

1. Add `"markdown"` to `canvasKind` in `convex/schema.ts`
2. Add starter template in `convex/lib/templates.ts`
3. Add preview renderer in `src/lib/preview.ts` (markdown→HTML)
4. Update http.ts validation if needed

## Share URL

```
https://canvas.n3wth.com/c/{slug}
```

Open tabs update when source is written — no reload needed.

## Commands

```bash
npx convex dev        # backend + codegen
npm run dev           # Next dev
npm run theme:build   # after editing n3wthTheme.ts
npm run theme:check   # verify theme is fresh
```

## Rules

- Theme CSS is generated — edit `n3wthTheme.ts`, run `theme:build`
- Viewer id is per-tab (sessionStorage) — localStorage breaks echo suppression
- Queries must not call `Date.now()` — do clock reads in mutations only
- Convex is source of truth — client is a draft view, not authoritative

## Skill

Read `skills/canvas/SKILL.md` for the full HTTP API. Smoke test:

```bash
CANVAS_SITE_URL=… node scripts/smoke-agent.mjs
```

Contact: hey@n3wth.com
