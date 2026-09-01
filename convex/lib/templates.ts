/**
 * Starter sources for new canvases. Kept as plain modules so both the
 * mutations and the HTTP push endpoint can reach them.
 */

export const HTML_STARTER = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      :root { color-scheme: dark; }
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        background: #08090b;
        color: #f4f4f5;
        font-family: ui-sans-serif, system-ui, sans-serif;
      }
      .card {
        padding: 2.5rem 3rem;
        border: 1px solid #22242a;
        border-radius: 16px;
        background: #101114;
        text-align: center;
      }
      h1 { margin: 0 0 0.5rem; font-size: 1.75rem; letter-spacing: -0.02em; }
      p { margin: 0; color: #a1a1aa; }
      button {
        margin-top: 1.5rem;
        padding: 0.6rem 1.1rem;
        border: 1px solid #22242a;
        border-radius: 8px;
        background: #16171b;
        color: #f4f4f5;
        font: inherit;
        cursor: pointer;
      }
      button:hover { border-color: #33363e; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Hello from your canvas</h1>
      <p>Edit the source. This preview updates as you type.</p>
      <button onclick="this.textContent = 'Clicked ' + (++n) + 'x'">Click me</button>
      <script>let n = 0;</script>
    </div>
  </body>
</html>
`;

export const REACT_STARTER = `function Counter() {
  const [count, setCount] = React.useState(0);

  return (
    <div style={styles.card}>
      <h1 style={styles.title}>Hello from your canvas</h1>
      <p style={styles.body}>Edit the source. This preview updates as you type.</p>
      <button style={styles.button} onClick={() => setCount(count + 1)}>
        Clicked {count}x
      </button>
    </div>
  );
}

const styles = {
  card: {
    padding: '2.5rem 3rem',
    border: '1px solid #22242a',
    borderRadius: 16,
    background: '#101114',
    textAlign: 'center',
    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
    color: '#f4f4f5',
  },
  title: {margin: '0 0 0.5rem', fontSize: '1.75rem', letterSpacing: '-0.02em'},
  body: {margin: 0, color: '#a1a1aa'},
  button: {
    marginTop: '1.5rem',
    padding: '0.6rem 1.1rem',
    border: '1px solid #22242a',
    borderRadius: 8,
    background: '#16171b',
    color: '#f4f4f5',
    font: 'inherit',
    cursor: 'pointer',
  },
};

render(<Counter />);
`;

export function starterFor(kind: 'html' | 'react'): string {
  return kind === 'html' ? HTML_STARTER : REACT_STARTER;
}

const SLUG_ALPHABET = 'abcdefghijkmnpqrstuvwxyz23456789';

/** Short, unambiguous, URL-safe id for shareable links. */
export function generateSlug(length = 10): string {
  let out = '';
  for (let i = 0; i < length; i++) {
    out += SLUG_ALPHABET[Math.floor(Math.random() * SLUG_ALPHABET.length)];
  }
  return out;
}
