const content = `# n3wth/canvas — LLM Context

> Make a tool, share the URL.

## What is this?
n3wth/canvas is a live-preview code editor for creating interactive HTML, React, and markdown canvases. Each canvas gets a shareable URL that updates in real-time across all open tabs.

## Site
- URL: https://canvas.n3wth.com
- Share URLs: https://canvas.n3wth.com/c/{slug}
- Contact: hey@n3wth.com

## Capabilities
- Create HTML canvases with inline CSS and JavaScript
- Create React components with live preview (uses React 18+)
- Create markdown documents with live rendering
- Real-time collaboration: edits sync across all viewers instantly
- No login required to view public canvases

## Agent API
Agents can create and update canvases programmatically via HTTP.

Base URL: Convex site URL (set via CANVAS_SITE_URL)
Auth: Bearer token (when CANVAS_AGENT_TOKEN is configured)

### Endpoints

POST /agent/v1/canvases
  Create a new canvas
  Body: { title?: string, kind: "html"|"react"|"markdown", source?: string }
  Returns: { slug, url, kind, title, version, updatedAt }

GET /agent/v1/canvases
  List recent canvases (metadata only)
  Returns: { canvases: [...] }

GET /agent/v1/canvases/:slug
  Get canvas by slug (includes source)
  Returns: { slug, url, kind, title, source, version, updatedAt }

PUT /agent/v1/canvases/:slug/source
  Update canvas source
  Body: { source: string }
  Returns: { slug, version, url }

## Example: Create a canvas

\`\`\`bash
curl -X POST "$CANVAS_SITE_URL/agent/v1/canvases" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $CANVAS_AGENT_TOKEN" \\
  -d '{"kind":"html","title":"My Tool","source":"<h1>Hello</h1>"}'
\`\`\`

## Tech Stack
- Frontend: Next.js 16, React 19, TypeScript
- Backend: Convex (real-time database)
- Styling: Astryx design system, Satoshi + Geist fonts

## For AI Agents
When generating canvases:
1. HTML kind: Write complete HTML documents with inline styles
2. React kind: Export a default component or call render(<Component />)
3. Use dark mode friendly colors (background: #08090b, text: #f4f4f5)
4. Keep source under 512KB

---
Built by Oliver Newth • https://n3wth.com
`;

export async function GET() {
  return new Response(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
