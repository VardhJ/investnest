import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Investment Education & Guides',
  description: 'Free investment education: SARFAESI auctions, REITs, P2P lending, tax planning, and more. Research articles by InvestNest.',
  alternates: { canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.investnest.in'}/learn` },
};

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return children;
}