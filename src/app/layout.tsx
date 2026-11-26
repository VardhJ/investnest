import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Inter } from 'next/font/google';
import './globals.css';

import Navbar from '@/components/Navbar';
import JsonLd from '@/components/JsonLd';
import Footer from '@/components/Footer';
import { AuthProvider } from '@/lib/auth';
import { AnalyticsProvider } from '@/lib/analytics';
import { GoogleAnalytics } from '@next/third-parties/google';
import GoogleAnalyticsTracker from '@/components/GoogleAnalyticsTracker';

const inter = Inter({ subsets: ['latin'] });

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || '';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.investnest.in';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  verification: {
    google: 'google05f545bba76a658b',
    other: {
      'msvalidate.01': 'E42636624A4EB1D8A2DB9C78EE00EEED',
    },
  },
  title: {
    default: 'InvestNest - Discover Investments Beyond Stocks & MFs',
    template: '%s | InvestNest',
  },
  description: 'Explore bank-seized properties, REITs, P2P lending, invoice discounting, fractional real estate, and more. Free investment education and discovery platform for Indians.',
  keywords: ['investment', 'SARFAESI', 'bank seized properties', 'REITs', 'P2P lending', 'invoice discounting', 'fractional real estate', 'alternative investments', 'India', 'property auction', 'bank auction properties', 'MSTC e-auction', 'IBAPI', 'bank auction India'],
  authors: [{ name: 'InvestNest', url: SITE_URL }],
  openGraph: {
    title: 'InvestNest - Discover Investments Beyond Stocks & MFs',
    description: 'Explore bank-seized properties, REITs, P2P lending, invoice discounting, fractional real estate, and more. Free investment education for Indians.',
    url: SITE_URL,
    siteName: 'InvestNest',
    locale: 'en_IN',
    type: 'website',
    images: [{ url: `${SITE_URL}/og/default.png`, width: 1200, height: 630, alt: 'InvestNest – Alternative Investment Discovery Platform' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InvestNest - Discover Investments Beyond Stocks & MFs',
    description: 'Explore bank-seized properties, REITs, P2P lending, and more.',
    images: [`${SITE_URL}/og/default.png`],
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
    <html lang="en-IN">
      <body className={inter.className}>
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'InvestNest',
            url: SITE_URL,
            logo: `${SITE_URL}/og/default.png`,
            description: 'Investment discovery and education platform for Indians: bank-seized properties, REITs, P2P lending, and alternative assets.',
            sameAs: [
              'https://www.investnest.in',
            ],
          }}
        />
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'InvestNest',
            url: SITE_URL,
            potentialAction: {
              '@type': 'SearchAction',
              target: `${SITE_URL}/properties?search={search_term_string}`,
              'query-input': 'required name=search_term_string',
            },
          }}
        />
        <AuthProvider>
          <AnalyticsProvider>
            <Navbar />
            <main>{children}</main>
            <Footer />
          </AnalyticsProvider>
        </AuthProvider>
        {GA_ID && <GoogleAnalytics gaId={GA_ID} />}
        {GA_ID && (
          <Suspense fallback={null}>
            <GoogleAnalyticsTracker />
          </Suspense>
        )}
      </body>
    </html>
  );
}