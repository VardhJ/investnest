import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const alt = 'InvestNest – Alternative Investment Discovery Platform';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #064e3b 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '72px 80px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(16,185,129,0.15)',
            border: '1px solid rgba(16,185,129,0.4)',
            borderRadius: 24,
            padding: '8px 20px',
            marginBottom: 32,
          }}
        >
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} />
          <span style={{ color: '#10b981', fontSize: 16, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2 }}>
            Alternative Investment Discovery
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            display: 'flex',
            fontSize: 68,
            fontWeight: 900,
            color: '#ffffff',
            lineHeight: 1.1,
            marginBottom: 24,
            maxWidth: 900,
          }}
        >
          <span>Invest</span>
          <span style={{ color: '#10b981' }}>Nest</span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            display: 'flex',
            fontSize: 28,
            color: '#94a3b8',
            maxWidth: 800,
            lineHeight: 1.5,
            marginBottom: 48,
          }}
        >
          Bank auction properties, REITs, P2P lending & 16 alternative asset classes for Indian investors.
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 48 }}>
          {[
            { value: '500+', label: 'SARFAESI Properties' },
            { value: '15-30%', label: 'Auction Discount' },
            { value: '16', label: 'Asset Classes' },
            { value: '100% Free', label: 'Open Access' },
          ].map(stat => (
            <div key={stat.label} style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 32, fontWeight: 800, color: '#ffffff' }}>{stat.value}</span>
              <span style={{ fontSize: 16, color: '#64748b', marginTop: 4 }}>{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Domain */}
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            bottom: 48,
            right: 80,
            fontSize: 20,
            color: '#475569',
            fontWeight: 600,
          }}
        >
          investnest.in
        </div>
      </div>
    ),
    { ...size }
  );
}
