import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Investment Products & Asset Classes in India',
  description: 'Compare 16+ investment products in India: REITs, P2P lending, invoice discounting, fractional real estate, mutual funds, and more.',
  alternates: { canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.investnest.in'}/products` },
};

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return children;
}