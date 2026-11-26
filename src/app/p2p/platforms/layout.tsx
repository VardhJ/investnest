import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import { p2pPlatforms } from '@/data/p2p-platforms';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.investnest.in';

export const metadata: Metadata = {
  title: 'All 28 RBI-Registered P2P Lending Platforms in India – Full Directory',
  description: 'Compare all 28 NBFC-P2P lending platforms registered with the Reserve Bank of India. Compare advertised returns, minimum investments, loan tenures, fees, and credit risk levels.',
  alternates: { canonical: `${siteUrl}/p2p/platforms` },
  openGraph: {
    title: 'Directory of All 28 RBI-Registered P2P Platforms in India | InvestNest',
    description: 'Compare returns, fees, and features across all 28 RBI-licensed NBFC-P2P platforms.',
    images: [{ url: `${siteUrl}/og/default.png`, width: 1200, height: 630 }],
  },
};

export default function P2PPlatformsLayout({ children }: { children: React.ReactNode }) {
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'RBI-Registered P2P Lending Platforms in India',
    description: 'Complete directory of all 28 Reserve Bank of India registered NBFC-P2P peer to peer lending platforms.',
    numberOfItems: p2pPlatforms.length,
    itemListElement: p2pPlatforms.map((platform, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      item: {
        '@type': 'FinancialProduct',
        name: platform.name,
        description: platform.description || `${platform.name} – RBI registered NBFC-P2P platform (${platform.registeredCompany})`,
        url: platform.website || `${siteUrl}/p2p/platforms`,
        provider: {
          '@type': 'Organization',
          name: platform.registeredCompany,
        },
      },
    })),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'P2P Lending', item: `${siteUrl}/p2p` },
      { '@type': 'ListItem', position: 3, name: 'All 28 Platforms', item: `${siteUrl}/p2p/platforms` },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={itemListSchema} />
      {children}
    </>
  );
}
