export type CanvasKind = 'html' | 'react';

const REACT_URL = 'https://unpkg.com/react@18.3.1/umd/react.production.min.js';
const REACT_DOM_URL =
  'https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js';
const BABEL_URL = 'https://unpkg.com/@babel/standalone@7.26.4/babel.min.js';

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
 * Turn stored source into the document the preview frame runs. HTML canvases
 * are passed through untouched so the author owns the whole document.
 */
export function buildPreviewDocument(kind: CanvasKind, source: string): string {
  return kind === 'html' ? source : reactHarness(source);
}
