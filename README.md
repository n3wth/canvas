# canvas

Canvases at [canvas.n3wth.com](https://canvas.n3wth.com).

Make a tool. Share the URL.

You open the link and see the running tool. Source stays behind a toggle until
you need it. Opening the same link somewhere else is not a copy — it is the
same canvas. Change it in one view and every other view follows.

That is the whole idea. No sign-in, no export step, no build to wait on.

## What is in here

- `src/app` — Next.js App Router pages. `/` lists canvases, `/c/[slug]` is one canvas.
- `src/components` — the index and the two-pane workspace.
- `src/theme` — the n3wth Astryx theme, plus the CSS the Astryx CLI builds from it.
- `src/lib` — the preview harness and per-tab viewer identity.
- `convex` — schema, queries, mutations, and the HTTP endpoint for pushing source.

## Run it

Two processes. Convex first, so the generated types exist before Next compiles:

```bash
npm install
npx convex dev
```

Leave that running and start Next in another terminal:

```bash
npm run dev
```

Then open http://localhost:3000. `npx convex dev` writes `NEXT_PUBLIC_CONVEX_URL`
into `.env.local` on first run, which is the only variable the app needs.

To see the point of the thing, create a canvas, copy the link, and open it in a
second window next to the first. Type in one.

## Kinds of canvas

- **HTML** — the source is a page. You own `<head>`, styles, scripts.
- **React** — the source is a component compiled in the browser, ending in
  `render(<Component />)`. React and Babel load from a CDN inside the frame.

Previews run in an iframe on an opaque origin, so a canvas cannot reach the
app around it.

## Pushing source from outside the browser

Every canvas can be written to over HTTP, which is useful when something else
is generating the UI and you just want to watch it land:

```bash
curl -X POST "$NEXT_PUBLIC_CONVEX_SITE_URL/canvas/source" \
  -H 'Content-Type: application/json' \
  -d '{"slug":"your-canvas-slug","source":"<h1>pushed</h1>"}'
```

Any view of that canvas updates without a reload.

## Theme

The look comes from Astryx with a custom theme in `src/theme/n3wthTheme.ts`:
Satoshi for display and headings, Geist Sans for body, Geist Mono for code, on
a near-black `#08090b` page.

`src/theme/n3wth.css`, `n3wth.js`, and `n3wth.d.ts` are generated. Edit the
theme source, then rebuild:

```bash
npm run theme:build
```

Do not hand-edit the generated files; the next build will overwrite them.

## Deploy

Convex and the Next app deploy separately.

**Convex.** Push the backend and get a production URL:

```bash
npx convex deploy
```

**Vercel.** `vercel.json` already points the build at
`scripts/vercel-build.mjs`, so there is nothing to configure in the dashboard.
That script deploys Convex and builds the frontend against the deployment it
just made, which keeps the two from drifting:

```
npx convex deploy --cmd 'npm run build'
```

It only does that when `CONVEX_DEPLOY_KEY` is set. Add it in the Vercel project
from the Convex dashboard, under Settings, Deploy keys. You do not set
`NEXT_PUBLIC_CONVEX_URL` by hand; the deploy supplies it.

Without the key the build still succeeds and the site renders a "no backend
connected" page, so a missing variable is a visible state rather than a red
deploy. The next build picks the backend up on its own once the key is there.

**Domain.** Add `canvas.n3wth.com` to the Vercel project and point a CNAME at
`cname.vercel-dns.com`. Vercel issues the certificate once the record resolves.

## Checks

```bash
npm run lint
npm run typecheck
npm run build
```

## Contact

hey@n3wth.com
