import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

export const dynamic = 'force-dynamic';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { AuthProvider } from '@/lib/auth';
import { AnalyticsProvider } from '@/lib/analytics';
import { GoogleAnalytics } from '@next/third-parties/google';
import GoogleAnalyticsTracker from '@/components/GoogleAnalyticsTracker';

const inter = Inter({ subsets: ['latin'] });

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || '';
const SITE_URL = 'https://investnest-seven.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'InvestNest — Discover Investments Beyond Stocks & MFs',
    template: '%s | InvestNest',
  },
  description: 'Explore bank-seized properties, REITs, P2P lending, invoice discounting, fractional real estate, and more. Free investment education and discovery platform for Indians.',
  keywords: ['investment', 'SARFAESI', 'bank seized properties', 'REITs', 'P2P lending', 'invoice discounting', 'fractional real estate', 'alternative investments', 'India', 'property auction', 'bank auction properties'],
  authors: [{ name: 'InvestNest' }],
  openGraph: {
    title: 'InvestNest — Discover Investments Beyond Stocks & MFs',
    description: 'Explore bank-seized properties, REITs, P2P lending, and more. Free investment education for Indians.',
    url: SITE_URL,
    siteName: 'InvestNest',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'InvestNest — Investment Discovery Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InvestNest — Discover Investments Beyond Stocks & MFs',
    description: 'Explore bank-seized properties, REITs, P2P lending, and more.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
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
        <AuthProvider>
          <AnalyticsProvider>
            <Navbar />
            <main>{children}</main>
            <Footer />
          </AnalyticsProvider>
        </AuthProvider>
        {GA_ID && <GoogleAnalytics gaId={GA_ID} />}
        {GA_ID && <GoogleAnalyticsTracker />}
      </body>
    </html>
  );
}