import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import JsonLd from '@/components/JsonLd';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.investnest.in';

function formatPrice(price: number | null | undefined): string {
  if (!price) return 'N/A';
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
  return `₹${price.toLocaleString('en-IN')}`;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const { data } = await supabase.from('properties').select('*').eq('id', id).single();
  if (!data) return { title: 'Property Not Found | InvestNest' };

  const discountText = data.discount ? `, ${data.discount}% below market value` : '';
  const areaText = data.area_sqft ? `, ${data.area_sqft} sq.ft` : '';
  const description = `${data.property_type || 'Property'} bank auction (SARFAESI) in ${data.location || data.city}, ${data.state}${areaText}. Reserve price ${formatPrice(data.reserve_price)}${discountText}. Auctioned by ${data.bank}. View deal score, EMD & due diligence checklist.`;

  return {
    title: `${data.title} – Bank Auction in ${data.city}, ${data.state}`,
    description,
    alternates: { canonical: `${siteUrl}/properties/${id}` },
    openGraph: {
      title: `${data.title} | Bank Auction – ${data.city}`,
      description,
      type: 'website',
      images: data.photos?.[0]
        ? [{ url: data.photos[0], width: 800, height: 600, alt: data.title }]
        : [{ url: `${siteUrl}/og/default.png`, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${data.title} | Bank Auction`,
      description,
      images: data.photos?.[0] ? [data.photos[0]] : [`${siteUrl}/og/default.png`],
    },
  };
}

export default async function PropertyDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data } = await supabase.from('properties').select('*').eq('id', id).single();

  const jsonLdProperty = data
    ? {
        '@context': 'https://schema.org',
        '@type': 'RealEstateListing',
        name: data.title,
        description: data.description || `${data.property_type} bank auction property in ${data.city}, ${data.state}`,
        url: `${siteUrl}/properties/${id}`,
        image: data.photos?.[0] || undefined,
        address: {
          '@type': 'PostalAddress',
          streetAddress: data.location || undefined,
          addressLocality: data.city,
          addressRegion: data.state,
          addressCountry: 'IN',
        },
        offers: {
          '@type': 'Offer',
          price: data.reserve_price,
          priceCurrency: 'INR',
          availability: 'https://schema.org/InStock',
        },
        floorSize: data.area_sqft
          ? { '@type': 'QuantitativeValue', value: data.area_sqft, unitCode: 'FTK' }
          : undefined,
      }
    : null;

  const jsonLdBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Properties', item: `${siteUrl}/properties` },
      { '@type': 'ListItem', position: 3, name: data?.title || 'Property', item: `${siteUrl}/properties/${id}` },
    ],
  };

  return (
    <>
      {jsonLdProperty && <JsonLd data={jsonLdProperty} />}
      <JsonLd data={jsonLdBreadcrumb} />
      {children}
    </>
  );
}
