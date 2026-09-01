# AGENTS

Project-specific guidance for AI coding agents.

## What this project is

`canvas` is deployed at canvas.n3wth.com. A canvas holds source and the tool
that source makes. The shareable URL opens on the running preview; source is
available behind a toggle. Every open view follows the shared document, so a
write in one view re-renders the others.

It is not a whiteboard, a drawing tool, or a diagram editor. There are no
strokes, shapes, or freehand input anywhere in the product. If you find
yourself adding a pointer-drawing surface, you have misread the product.

Convex is the source of truth. The client never holds authoritative state; the
editor is a draft view of a Convex document and follows it.

## Layout of the code

```
src/app/            Next.js App Router. layout.tsx loads fonts and providers.
  providers.tsx     Convex client, Astryx LinkProvider, Astryx Theme (dark).
  page.tsx          Canvas index.
  c/[slug]/page.tsx One canvas; resolves the slug and renders the workspace.
src/components/     CanvasIndex (list + create), CanvasWorkspace (two panes).
src/lib/preview.ts  Turns stored source into the document the iframe runs.
src/lib/identity.ts Per-tab viewer id. sessionStorage on purpose, see below.
src/theme/          n3wthTheme.ts is the source; n3wth.{css,js,d.ts} are built.
convex/             schema, canvases, presence, http (external source push).
```

## Rules that are easy to get wrong

**The theme CSS is generated.** `src/theme/n3wth.css`, `n3wth.js`, and
`n3wth.d.ts` come from `npm run theme:build` reading `n3wthTheme.ts`. Never edit
them; change the source and rebuild. `npm run theme:check` fails if they are
stale. Fonts are named by the theme as `var(--font-*)` and loaded in
`layout.tsx` (Geist via next/font, Satoshi via Fontshare) — Astryx sets font
tokens but never loads a font.

**Viewer identity is per tab, not per browser.** `src/lib/identity.ts` uses
sessionStorage. localStorage is shared across tabs on one origin, which would
make two tabs of the same canvas look like one viewer and break the check that
distinguishes a remote edit from this tab's own write echoing back.

**Echo suppression is load-bearing.** `CanvasWorkspace` tracks the highest
version it has seen and the id of the last writer. A subscription update is
adopted into the editor only when the version is newer *and* the writer was
someone else. Remove either half and typing fights itself.

**Queries must not read the clock.** `convex/presence.ts` returns every
presence row and lets the client drop stale ones. A query calling `Date.now()`
can never be cached or reused by Convex. Staleness sweeping happens in the
heartbeat mutation, where reading the clock is fine.

**No auth by design.** Canvases are public to whoever holds the URL, so Convex
functions do not call `ctx.auth`. Slugs are random and unguessable. If auth is
ever added, wrap the functions rather than sprinkling checks.

## Commands

```bash
npx convex dev        # backend; also generates convex/_generated
npm run dev           # Next dev server
npm run typecheck
npm run lint
npm run theme:build   # after editing src/theme/n3wthTheme.ts
npm run theme:check   # verify generated theme matches its source
npm run build
```

## Documentation and branding

This file is the only agent instruction file. Do not add per-vendor agent
files alongside it; if a tool generates one, fold its content in here and
delete it. Keep vendor names out of user-facing copy too: the product is
described on its own terms, not as a version of someone else's tool.
Contact is hey@n3wth.com.

<!-- ASTRYX:START -->
Astryx v0.5.2 · 163 components
CLI: run every command as `npx astryx <cmd>` (shown below as `astryx ...`).

SETUP (once, in your app entry e.g. main.tsx) — without these, components render unstyled:
  import "@astryxdesign/core/reset.css";
  import "@astryxdesign/core/astryx.css";

WORKFLOW — discover, don't guess. Before writing UI:
1. `astryx build "<idea>"` — START HERE: returns a kit (closest [page] + [block]s + [component]s). No args = full playbook.
2. `astryx template <name> [--skeleton]` — scaffold the [page]/[block]s it named, or study their layout. Templates are reference code.
3. `astryx component <Name>` — props + examples for every component you use.

RULES:
- No <div> — components do all layout/spacing, page frame included.
- Frame first: read `astryx docs layout` before writing any page or screen — page frame, region widths, breakpoint behavior.
- Dense data = rows (Table, List/Item), never Card-wrapped list items; Card is for standalone widgets. Status = StatusDot/Token; Badge = counts only.
- Custom styling: component props first; else style/className with tokens — var(--color-*|--spacing-*|--radius-*). No raw hex/px. (No StyleX/Tailwind compiler here — don't use xstyle/utility classes.)
- Tokens for every value (`astryx docs tokens`). Brand/accent belongs in the theme (`astryx theme list` / `theme add <slug>`, or `astryx theme template` for a custom one) — never override --color-* in :root.
- SELF-CHECK before you finish: re-read the file and replace any raw <div>/<span> layout, imported .css/@apply, or hardcoded value (#hex, 16px) with the component or a token (var(--color-*|--spacing-*|…)). If unsure a component/prop exists, run `astryx component <Name>` / `astryx search "<thing>"`; don't hand-roll CSS.

MORE CLI:
  search "<query>"   find any component / hook / doc / template / block
  component --list   163 components by category
  template --list    page + block recipes
  docs <topic>       browser-support, cli-integrations, color, elevation, getting-started, icons, illustrations, internationalization, layout, migration, motion, principles, shape, spacing, styling-libraries, styling, theme, tokens, typography, working-with-ai
  swizzle <Name>     eject component source for deep customization
  upgrade --apply    run after any @astryxdesign/core bump
<!-- ASTRYX:END -->

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
