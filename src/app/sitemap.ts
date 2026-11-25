import { MetadataRoute } from 'next';
import { investmentProducts } from '@/data/products';

const articleSlugs = [
  'deal-score-logic',
  'mstc-e-auction-guide',
  'sarfaesi-auctions',
  'invest-reits-india',
  'p2p-lending-guide',
  'invoice-discounting',
  'fd-vs-mf',
  'property-evaluation',
  'understanding-risk',
  'tax-on-investments',
  'home-loan-guide',
  'credit-score-guide',
  'mutual-fund-sip',
  'e-auction-guide',
  'best-cities-real-estate',
  'gold-vs-real-estate',
  'nps-vs-ppf',
  'emergency-fund',
  'e-auction-participation',
  'best-cities-real-estate-2026',
  'sarfaesi-title-check',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://investnest.in';

  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1 },
    { url: `${baseUrl}/properties`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${baseUrl}/products`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${baseUrl}/p2p`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${baseUrl}/p2p/platforms`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${baseUrl}/p2p/regulatory`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.6 },
    { url: `${baseUrl}/learn`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${baseUrl}/calculator`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: `${baseUrl}/analytics`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.8 },
  ];

  const productPages = investmentProducts.map(product => ({
    url: `${baseUrl}/products/${product.id}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const articlePages = articleSlugs.map(slug => ({
    url: `${baseUrl}/learn/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...productPages, ...articlePages];
}