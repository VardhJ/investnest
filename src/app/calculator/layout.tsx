import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.investnest.in';

export const metadata: Metadata = {
  title: 'Investment Return Calculator – Compare Yields Across Asset Classes',
  description: 'Free investment calculator for Indian investors. Compare returns across SARFAESI auctions, P2P lending, REITs, FDs, mutual funds, and more. Calculate EMI, yield, and compound growth.',
  alternates: { canonical: `${siteUrl}/calculator` },
  openGraph: {
    title: 'Investment Return Calculator | InvestNest',
    description: 'Compare yields across bank auctions, P2P, REITs, and FDs. Free calculator for Indian investors.',
    images: [{ url: `${siteUrl}/og/default.png`, width: 1200, height: 630 }],
  },
};

export default function CalculatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
            { '@type': 'ListItem', position: 2, name: 'Calculator', item: `${siteUrl}/calculator` },
          ],
        }}
      />
      {children}
    </>
  );
}
