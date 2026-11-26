import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.investnest.in';

export const metadata: Metadata = {
  title: 'REIT, SM-REIT & InvIT Screener India - Post-Tax Yield, NDCF Split & Occupancy',
  description:
    'Compare all listed Indian REITs (Embassy, Mindspace, Brookfield, Nexus), SEBI-registered SM-REITs (PropShare, Strata), and InvITs (IndiGrid, PowerGrid, IRB) with live NSE prices, post-tax NDCF distribution splits, occupancy, WALE, and verified SEBI/NSE filing proofs.',
  alternates: {
    canonical: `${siteUrl}/reits`,
  },
  openGraph: {
    title: 'India REIT, SM-REIT & InvIT Screener - Real Post-Tax Yields & Proofs',
    description:
      'Screen every SEBI-regulated REIT, SM-REIT, and InvIT on pre-tax vs post-tax yield, Section 115UA NDCF tax breakdown, occupancy, WALE, and debt gearing.',
    url: `${siteUrl}/reits`,
    images: [{ url: `${siteUrl}/og/default.png`, width: 1200, height: 630 }],
  },
};

export default function ReitsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
