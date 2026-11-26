import { MetadataRoute } from 'next';
import { investmentProducts } from '@/data/products';
import { supabase } from '@/lib/supabase';

const articleSlugs: Array<{ slug: string; updatedAt: string }> = [
  { slug: 'deal-score-logic', updatedAt: '2026-11-01' },
  { slug: 'mstc-e-auction-guide', updatedAt: '2026-11-01' },
  { slug: 'sarfaesi-auctions', updatedAt: '2026-11-01' },
  { slug: 'invest-reits-india', updatedAt: '2026-11-01' },
  { slug: 'p2p-lending-guide', updatedAt: '2026-11-01' },
  { slug: 'invoice-discounting', updatedAt: '2026-11-01' },
  { slug: 'fd-vs-mf', updatedAt: '2026-11-01' },
  { slug: 'property-evaluation', updatedAt: '2026-11-01' },
  { slug: 'understanding-risk', updatedAt: '2026-11-01' },
  { slug: 'tax-on-investments', updatedAt: '2026-11-01' },
  { slug: 'home-loan-guide', updatedAt: '2026-11-01' },
  { slug: 'credit-score-guide', updatedAt: '2026-11-01' },
  { slug: 'mutual-fund-sip', updatedAt: '2026-11-01' },
  { slug: 'e-auction-guide', updatedAt: '2026-11-01' },
  { slug: 'best-cities-real-estate', updatedAt: '2026-11-01' },
  { slug: 'gold-vs-real-estate', updatedAt: '2026-11-01' },
  { slug: 'nps-vs-ppf', updatedAt: '2026-11-01' },
  { slug: 'emergency-fund', updatedAt: '2026-11-01' },
  { slug: 'e-auction-participation', updatedAt: '2026-11-01' },
  { slug: 'best-cities-real-estate-2026', updatedAt: '2026-11-15' },
  { slug: 'sarfaesi-title-check', updatedAt: '2026-11-01' },
];

// Product last-updated dates (update when product page content changes)
const productUpdatedAt = '2026-11-01';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.investnest.in';

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date('2026-11-26'), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/properties`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/products`, lastModified: new Date(productUpdatedAt), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/p2p`, lastModified: new Date(productUpdatedAt), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/p2p/platforms`, lastModified: new Date(productUpdatedAt), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/p2p/regulatory`, lastModified: new Date(productUpdatedAt), changeFrequency: 'weekly', priority: 0.6 },
    { url: `${baseUrl}/learn`, lastModified: new Date('2026-11-15'), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/calculator`, lastModified: new Date(productUpdatedAt), changeFrequency: 'monthly', priority: 0.6 },
  ];

  const productPages: MetadataRoute.Sitemap = investmentProducts.map(product => ({
    url: `${baseUrl}/products/${product.id}`,
    lastModified: new Date(productUpdatedAt),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const articlePages: MetadataRoute.Sitemap = articleSlugs.map(({ slug, updatedAt }) => ({
    url: `${baseUrl}/learn/${slug}`,
    lastModified: new Date(updatedAt),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  // Fetch active property listings from Supabase for sitemap
  let propertyPages: MetadataRoute.Sitemap = [];
  try {
    const { data: properties } = await supabase
      .from('properties')
      .select('id, updated_at')
      .eq('status', 'active')
      .limit(5000);

    if (properties && properties.length > 0) {
      propertyPages = properties.map(p => ({
        url: `${baseUrl}/properties/${p.id}`,
        lastModified: new Date(p.updated_at || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.75,
      }));
    }
  } catch (e) {
    // Sitemap still generates without properties if Supabase is unreachable
    console.error('Sitemap: failed to fetch properties', e);
  }

  return [...staticPages, ...productPages, ...articlePages, ...propertyPages];
}
