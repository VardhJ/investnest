import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'InvestNest — Discover Investments Beyond Stocks & MFs',
    template: '%s | InvestNest',
  },
  description: 'Explore bank-seized properties, REITs, P2P lending, invoice discounting, fractional real estate, and more. Free investment education and discovery platform for Indians.',
  keywords: ['investment', 'SARFAESI', 'bank seized properties', 'REITs', 'P2P lending', 'invoice discounting', 'fractional real estate', 'alternative investments', 'India'],
  openGraph: {
    title: 'InvestNest — Discover Investments Beyond Stocks & MFs',
    description: 'Explore bank-seized properties, REITs, P2P lending, and more. Free investment education for Indians.',
    url: 'https://investnest.in',
    siteName: 'InvestNest',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InvestNest — Discover Investments Beyond Stocks & MFs',
    description: 'Explore bank-seized properties, REITs, P2P lending, and more.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}