import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Market Analytics',
  description: 'Market analytics and insights on bank-seized properties and alternative investments in India.',
  alternates: { canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.investnest.in'}/analytics` },
};

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return children;
}