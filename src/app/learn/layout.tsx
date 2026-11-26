import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.investnest.in';

export const metadata: Metadata = {
  title: 'Investment Education Hub – SARFAESI, REITs, P2P & More',
  description: 'Free investment education for Indian investors: SARFAESI bank auctions, REITs, P2P lending, invoice discounting, tax planning and more. Research articles by InvestNest.',
  alternates: { canonical: `${siteUrl}/learn` },
  openGraph: {
    title: 'Investment Education Hub | InvestNest',
    description: 'Free investment guides for Indian investors: SARFAESI auctions, REITs, P2P lending, invoice discounting, and alternative assets.',
    images: [{ url: `${siteUrl}/og/default.png`, width: 1200, height: 630 }],
  },
};

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
            { '@type': 'ListItem', position: 2, name: 'Research & Learn', item: `${siteUrl}/learn` },
          ],
        }}
      />
      {children}
    </>
  );
}
