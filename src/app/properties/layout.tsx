import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.investnest.in';

export const metadata: Metadata = {
  title: 'Bank Auction Properties India – Live SARFAESI Deals',
  description: 'Browse 500+ bank-seized and SARFAESI auction properties across India. Filter by city, bank, property type and price. 15–30% below market value. Free discovery platform.',
  alternates: { canonical: `${siteUrl}/properties` },
  openGraph: {
    title: 'Bank Auction Properties India – Live SARFAESI Deals',
    description: 'Browse 500+ bank auction properties. 15–30% below market. Filter by city, bank & type.',
    images: [{ url: `${siteUrl}/og/default.png`, width: 1200, height: 630 }],
  },
};

export default function PropertiesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
            { '@type': 'ListItem', position: 2, name: 'Auction Properties', item: `${siteUrl}/properties` },
          ],
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Bank-Seized Property Auctions in India',
          description: 'Live repository of distressed commercial and residential SARFAESI bank auction properties.',
          url: `${siteUrl}/properties`,
        }}
      />
      {children}
    </>
  );
}
