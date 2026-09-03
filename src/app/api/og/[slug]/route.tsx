import {ImageResponse} from '@vercel/og';
import {fetchQuery} from 'convex/nextjs';
import {api} from '../../../../../convex/_generated/api';

export const runtime = 'edge';

const kindLabels: Record<string, string> = {
  html: 'HTML Canvas',
  react: 'React Canvas',
  markdown: 'Markdown',
};

const kindColors: Record<string, string> = {
  html: '#f97316',
  react: '#06b6d4',
  markdown: '#8b5cf6',
};

export async function GET(
  _request: Request,
  {params}: {params: Promise<{slug: string}>},
) {
  const {slug} = await params;

  const meta = await fetchQuery(api.canvases.getMetaBySlug, {slug}).catch(
    () => null,
  );

  const title = meta?.title || 'Untitled canvas';
  const kind = meta?.kind || 'html';
  const kindLabel = kindLabels[kind] || 'Canvas';
  const kindColor = kindColors[kind] || '#0071e3';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background:
            'linear-gradient(145deg, #08090b 0%, #101114 50%, #16171b 100%)',
          fontFamily: 'sans-serif',
          padding: '48px',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '40px',
          }}
        >
          <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#0071e3',
              }}
            />
            <span style={{fontSize: '20px', color: '#a1a1aa', fontWeight: 500}}>
              n3wth/canvas
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '9999px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid #22242a',
            }}
          >
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: kindColor,
              }}
            />
            <span style={{fontSize: '16px', color: '#a1a1aa'}}>
              {kindLabel}
            </span>
          </div>
        </div>

        {/* Main content */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '48px 56px',
              borderRadius: '20px',
              border: '1px solid #22242a',
              background:
                'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}
          >
            <div
              style={{
                fontSize: '56px',
                fontWeight: 700,
                color: '#f4f4f5',
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
                maxWidth: '900px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {title}
            </div>
            <div
              style={{
                marginTop: '20px',
                fontSize: '22px',
                color: '#71717a',
                letterSpacing: '-0.01em',
              }}
            >
              canvas.n3wth.com/c/{slug}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginTop: '32px',
          }}
        >
          <span style={{fontSize: '18px', color: '#52525b'}}>
            hey@n3wth.com
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
