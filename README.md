# canvas

Live canvases at [canvas.n3wth.com](https://canvas.n3wth.com).

A canvas is an artifact: some source, and the running thing that source makes.
You write HTML or a React component on the left, it renders on the right, and
the URL is the share button. Convex holds the document, so opening the same
link somewhere else is not a copy of the canvas, it is the canvas. Change the
source in one view and every other view re-renders.

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

- **HTML** — the source is a whole document. You own `<head>`, styles, scripts.
- **React** — the source is a component compiled in the browser, ending in
  `render(<Component />)`. React and Babel load from a CDN inside the frame.

Previews run in a sandboxed iframe on an opaque origin, so a canvas cannot
reach the app around it.

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

**Vercel.** Import the repo, then set the build command so Convex deploys as
part of the same step and the app builds against the deployment it just made:

```
npx convex deploy --cmd 'npm run build'
```

Set `CONVEX_DEPLOY_KEY` in the Vercel project from the Convex dashboard
(Settings, Deploy keys). `NEXT_PUBLIC_CONVEX_URL` is set by that command, so
you do not add it by hand.

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
