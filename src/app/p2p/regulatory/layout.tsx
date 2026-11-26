import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.investnest.in';

export const metadata: Metadata = {
  title: 'RBI P2P Lending Regulations & Guidelines – NBFC Rules in India',
  description: 'Understand the Reserve Bank of India (RBI) regulatory framework for NBFC-P2P lending: lender limits (₹50 Lakh cap), escrow accounts, T+1 settlement, and fair practice code.',
  alternates: { canonical: `${siteUrl}/p2p/regulatory` },
  openGraph: {
    title: 'RBI P2P Lending Regulations & Guidelines | InvestNest',
    description: 'RBI regulatory norms for peer-to-peer lending in India: limits, escrow mechanisms, and borrower limits.',
    images: [{ url: `${siteUrl}/og/default.png`, width: 1200, height: 630 }],
  },
};

export default function P2PRegulatoryLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
            { '@type': 'ListItem', position: 2, name: 'P2P Lending', item: `${siteUrl}/p2p` },
            { '@type': 'ListItem', position: 3, name: 'RBI Regulatory Guide', item: `${siteUrl}/p2p/regulatory` },
          ],
        }}
      />
      {children}
    </>
  );
}
