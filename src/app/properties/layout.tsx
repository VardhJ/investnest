import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bank-Seized Properties (SARFAESI Auctions) in India',
  description: 'Browse bank-seized and SARFAESI auction properties across India. Filter by city, bank, and price. Free discovery platform.',
  alternates: { canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.investnest.in'}/properties` },
};

export default function PropertiesLayout({ children }: { children: React.ReactNode }) {
  return children;
}