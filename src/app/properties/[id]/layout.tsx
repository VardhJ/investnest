import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import JsonLd from '@/components/JsonLd';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.investnest.in';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const { data } = await supabase.from('properties').select('*').eq('id', id).single();
  if (!data) return {};
  return {
    title: `${data.title} - ${data.city} Bank Auction Property`,
    description: `${data.property_type || 'Property'} in ${data.city}, ${data.state}. Reserve price ₹${Number(data.reserve_price).toLocaleString('en-IN')}.`,
    alternates: { canonical: `${siteUrl}/properties/${id}` },
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

  const jsonLd = data
    ? {
        '@context': 'https://schema.org',
        '@type': 'RealEstateListing',
        name: data.title,
        description: data.description || `${data.property_type} in ${data.city}`,
        url: `${siteUrl}/properties/${id}`,
        address: {
          '@type': 'PostalAddress',
          addressLocality: data.city,
          addressRegion: data.state,
          addressCountry: 'IN',
        },
        offers: {
          '@type': 'Offer',
          price: data.reserve_price,
          priceCurrency: 'INR',
        },
      }
    : null;

  return (
    <>
      {jsonLd && <JsonLd data={jsonLd} />}
      {children}
    </>
  );
}