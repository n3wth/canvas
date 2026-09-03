import {ImageResponse} from '@vercel/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(145deg, #08090b 0%, #101114 50%, #16171b 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 80px',
            borderRadius: '24px',
            border: '1px solid #22242a',
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          <div
            style={{
              fontSize: '72px',
              fontWeight: 700,
              color: '#f4f4f5',
              letterSpacing: '-0.03em',
              marginBottom: '16px',
            }}
          >
            n3wth/canvas
          </div>
          <div
            style={{
              fontSize: '28px',
              fontWeight: 400,
              color: '#a1a1aa',
              letterSpacing: '-0.01em',
            }}
          >
            Make a tool, share the URL.
          </div>
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            right: '48px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '18px',
            color: '#71717a',
          }}
        >
          hey@n3wth.com
        </div>
        <div
          style={{
            position: 'absolute',
            top: '40px',
            left: '48px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: '#0071e3',
            }}
          />
          <span style={{fontSize: '18px', color: '#a1a1aa', fontWeight: 500}}>
            canvas.n3wth.com
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
