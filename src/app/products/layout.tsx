import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import { investmentProducts } from '@/data/products';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.investnest.in';

export const metadata: Metadata = {
  title: '16 Alternative Investment Types in India – Returns, Risk & Tax',
  description: 'Compare 16+ investment products in India: REITs, P2P lending, invoice discounting, fractional real estate, SARFAESI properties, mutual funds, and more. Expected returns, risk levels & tax guide.',
  alternates: { canonical: `${siteUrl}/products` },
  openGraph: {
    title: '16 Alternative Investments in India | InvestNest',
    description: 'Compare REITs, P2P lending, invoice discounting, bank auction properties and 12 more asset classes. Returns, risk & tax breakdown.',
    images: [{ url: `${siteUrl}/og/default.png`, width: 1200, height: 630 }],
  },
};

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Investment Products and Asset Classes in India',
    description: 'Guide to 16 traditional and alternative investment asset classes for Indian investors.',
    numberOfItems: investmentProducts.length,
    itemListElement: investmentProducts.map((p, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: p.name,
      url: `${siteUrl}/products/${p.id}`,
    })),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Asset Classes', item: `${siteUrl}/products` },
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
