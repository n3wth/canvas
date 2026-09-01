export type CanvasKind = 'markdown' | 'html' | 'react';

const REACT_URL = 'https://unpkg.com/react@18.3.1/umd/react.production.min.js';
const REACT_DOM_URL =
  'https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js';
const BABEL_URL = 'https://unpkg.com/@babel/standalone@7.26.4/babel.min.js';
const MARKED_URL = 'https://cdn.jsdelivr.net/npm/marked@15.0.7/marked.min.js';

/**
 * Harness for React canvases. The source is compiled in the browser by Babel
 * standalone and handed a `render()` helper, so a canvas is a single component
 * file rather than a whole bundler setup.
 *
 * A syntax error while typing would otherwise leave a blank frame with the
 * reason buried in a console nobody is looking at, so uncaught errors are
 * painted into the frame itself.
 */
function reactHarness(source: string): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script src="${REACT_URL}"></script>
    <script src="${REACT_DOM_URL}"></script>
    <script src="${BABEL_URL}"></script>
    <style>
      :root { color-scheme: dark; }
      html, body { margin: 0; min-height: 100%; }
      body {
        display: grid;
        place-items: center;
        background: #08090b;
        color: #f4f4f5;
        font-family: ui-sans-serif, system-ui, sans-serif;
      }
      #canvas-error {
        display: none;
        position: fixed;
        inset: 0;
        margin: 0;
        padding: 24px;
        background: #08090b;
        color: #ff9ba3;
        font: 13px/1.6 ui-monospace, SFMono-Regular, Menlo, monospace;
        white-space: pre-wrap;
        overflow: auto;
        z-index: 2147483647;
      }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <pre id="canvas-error"></pre>
    <script>
      (function () {
        var overlay = document.getElementById('canvas-error');
        function show(message) {
          overlay.textContent = String(message);
          overlay.style.display = 'block';
        }
        window.addEventListener('error', function (event) {
          show(event.message || event.error || 'Unknown error');
        });
        window.addEventListener('unhandledrejection', function (event) {
          show(event.reason);
        });

        var root = null;
        window.render = function render(node) {
          if (!root) {
            root = ReactDOM.createRoot(document.getElementById('root'));
          }
          root.render(node);
        };
      })();
    </script>
    <script type="text/babel" data-presets="react">
${source}
    </script>
  </body>
</html>`;
}

/**
 * Markdown canvases render as a quiet reading surface. marked (GFM) covers
 * headings, lists, links, code fences, and tables. Source is escaped into a
 * JSON string so a fence cannot break out of the harness script.
 */
function markdownHarness(source: string): string {
  const payload = JSON.stringify(source);
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="stylesheet" href="https://api.fontshare.com/v2/css?f%5B%5D=satoshi@500,700&display=swap" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/geist@1.3.1/dist/fonts/geist-sans/style.css" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/geist@1.3.1/dist/fonts/geist-mono/style.css" />
    <script src="${MARKED_URL}"></script>
    <style>
      :root { color-scheme: light; }
      html, body {
        margin: 0;
        min-height: 100%;
        background: #fff;
        color: #111;
        font-family: "Geist", ui-sans-serif, system-ui, sans-serif;
        font-size: 16px;
        font-weight: 500;
        line-height: 1.65;
      }
      main {
        max-width: 40rem;
        margin: 0 auto;
        padding: 2.75rem 1.5rem 4rem;
      }
      h1, h2, h3, h4 {
        font-family: "Satoshi", ui-sans-serif, system-ui, sans-serif;
        font-weight: 700;
        line-height: 1.2;
        letter-spacing: -0.025em;
        margin: 1.6em 0 0.55em;
      }
      h1 { font-size: 1.85rem; margin-top: 0; }
      h2 { font-size: 1.35rem; }
      h3 { font-size: 1.1rem; }
      p, ul, ol, table, pre, blockquote { margin: 0 0 1em; }
      a { color: #0b57d0; }
      code {
        font-family: "Geist Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 0.9em;
        background: #f4f4f5;
        padding: 0.1em 0.35em;
        border-radius: 4px;
      }
      pre {
        background: #0f1115;
        color: #f4f4f5;
        padding: 1rem 1.1rem;
        border-radius: 10px;
        overflow: auto;
      }
      pre code { background: transparent; padding: 0; color: inherit; }
      table { border-collapse: collapse; width: 100%; }
      th, td {
        border: 1px solid #e4e4e7;
        padding: 0.5rem 0.7rem;
        text-align: left;
      }
      th { background: #fafafa; }
      blockquote {
        border-left: 3px solid #d4d4d8;
        padding-left: 1rem;
        color: #52525b;
      }
      img { max-width: 100%; height: auto; }
      hr { border: 0; border-top: 1px solid #e4e4e7; margin: 2rem 0; }
    </style>
  </head>
  <body>
    <main id="root"></main>
    <script>
      (function () {
        var source = ${payload};
        marked.setOptions({gfm: true, breaks: false});
        document.getElementById('root').innerHTML = marked.parse(source || '');
      })();
    </script>
  </body>
</html>`;
}

/**
 * Turn stored source into the document the preview frame runs.
 * - markdown → rendered reading surface
 * - html → passed through so the author owns the whole document
 * - react → Babel harness
 */
export function buildPreviewDocument(kind: CanvasKind, source: string): string {
  if (kind === 'markdown') return markdownHarness(source);
  if (kind === 'html') return source;
  return reactHarness(source);
}
