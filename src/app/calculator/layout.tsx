import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Investment Calculator',
  description: 'Calculate returns, EMI, and investment growth across asset classes. Free tools by InvestNest.',
  alternates: { canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.investnest.in'}/calculator` },
};

export default function CalculatorLayout({ children }: { children: React.ReactNode }) {
  return children;
}