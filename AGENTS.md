# AGENTS

Project-specific guidance for AI coding agents.

## What this project is

`canvas` is deployed at canvas.n3wth.com. A canvas holds source and the tool
that source makes. New canvases are interactive markdown. The shareable URL
opens on the rendered tool; source is behind a quiet icon. Every open view
follows the shared document, so a write in one view re-renders the others.

It is not a whiteboard, a drawing tool, or a diagram editor. There are no
strokes, shapes, or freehand input anywhere in the product. If you find
yourself adding a pointer-drawing surface, you have misread the product.

Convex is the source of truth. The client never holds authoritative state; the
editor is a draft view of a Convex document and follows it.

## Layout of the code

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

Household agents (Cursor, Hermes, Grok Bot, etc.) should load
`skills/canvas/SKILL.md` and call the Convex HTTP API — not drive the browser.

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/agent/v1` | Discovery (no auth) |
| POST | `/agent/v1/canvases` | Create (`title?`, `kind?`: `markdown`\|`html`\|`react` default markdown, `source?`) |
| GET | `/agent/v1/canvases` | List metadata |
| GET | `/agent/v1/canvases/:slug` | Read source + metadata |
| PUT | `/agent/v1/canvases/:slug/source` | Replace source (hot-updates watchers) |

Base URL is the Convex **site** host (`NEXT_PUBLIC_CONVEX_SITE_URL` /
`https://<deployment>.convex.site`), not `canvas.n3wth.com`. Responses include
a `url` field pointing at the public share link.

Legacy: `POST /canvas/source` with `{slug, source}` still works; when
`CANVAS_AGENT_TOKEN` is set it requires the same Bearer header.

Optional MCP: wrap the four HTTP calls above; no separate MCP server ships in
this repo. Portable skill copy target: `skills.n3wth.com`.

Smoke: `CANVAS_SITE_URL=… [CANVAS_AGENT_TOKEN=…] node scripts/smoke-agent.mjs`
(token required only when the deployment has one configured).

Also see root `llms.txt`. Contact: hey@n3wth.com.

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
