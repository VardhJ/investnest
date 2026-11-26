import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Property } from '@/types';
import PropertiesClient from '../../PropertiesClient';
import JsonLd from '@/components/JsonLd';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.investnest.in';

export const PROGRAMMATIC_BANKS: Record<
  string,
  { shortName: string; fullName: string; dbMatch: string; description: string }
> = {
  sbi: {
    shortName: 'SBI',
    fullName: 'State Bank of India (SBI)',
    dbMatch: 'STATE BANK OF INDIA',
    description:
      'Browse active State Bank of India (SBI) SARFAESI e-auction residential flats, plots, commercial offices, and industrial assets across India.',
  },
  pnb: {
    shortName: 'PNB',
    fullName: 'Punjab National Bank (PNB)',
    dbMatch: 'PUNJAB NATIONAL BANK',
    description:
      'Verified Punjab National Bank (PNB) foreclosed property auctions at 15-30% below circle and market valuations.',
  },
  'union-bank': {
    shortName: 'Union Bank',
    fullName: 'Union Bank of India',
    dbMatch: 'UNION BANK OF INDIA',
    description:
      'Active Union Bank of India SARFAESI property auctions including residential apartments, houses, land, and godowns.',
  },
  'bank-of-baroda': {
    shortName: 'Bank of Baroda',
    fullName: 'Bank of Baroda (BoB)',
    dbMatch: 'BANK OF BARODA',
    description:
      'Bank of Baroda (BoB) distressed property e-auctions across Mumbai, Gujarat, Delhi NCR, Bengaluru, and pan-India branches.',
  },
  'canara-bank': {
    shortName: 'Canara Bank',
    fullName: 'Canara Bank',
    dbMatch: 'CANARA BANK',
    description:
      'Canara Bank SARFAESI e-auction notices for residential flats, independent houses, commercial shops, and industrial land.',
  },
  hdfc: {
    shortName: 'HDFC',
    fullName: 'HDFC Bank',
    dbMatch: 'HDFC',
    description:
      'HDFC Bank seized residential and commercial properties available via public SARFAESI e-auction.',
  },
  icici: {
    shortName: 'ICICI',
    fullName: 'ICICI Bank',
    dbMatch: 'ICICI',
    description:
      'ICICI Bank SARFAESI auction properties across major Indian metro and tier-2 cities.',
  },
  axis: {
    shortName: 'Axis',
    fullName: 'Axis Bank',
    dbMatch: 'AXIS',
    description:
      'Axis Bank foreclosed residential and commercial properties listed for public bidding.',
  },
};

export const revalidate = 300;

export function generateStaticParams() {
  return Object.keys(PROGRAMMATIC_BANKS).map((bank) => ({ bank }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ bank: string }>;
}): Promise<Metadata> {
  const { bank: bankSlug } = await params;
  const info = PROGRAMMATIC_BANKS[bankSlug.toLowerCase()];
  if (!info) return {};

  return {
    title: `${info.fullName} Property Auctions - SARFAESI Seized Flats & Plots`,
    description: `${info.description} Compare reserve prices, EMD requirements, and estimated market discounts.`,
    alternates: {
      canonical: `${siteUrl}/properties/bank/${bankSlug.toLowerCase()}`,
    },
    openGraph: {
      title: `${info.fullName} E-Auction Properties (15-30% Below Market)`,
      description: info.description,
      url: `${siteUrl}/properties/bank/${bankSlug.toLowerCase()}`,
      images: [{ url: `${siteUrl}/og/default.png`, width: 1200, height: 630 }],
    },
  };
}

export default async function BankPropertiesPage({
  params,
}: {
  params: Promise<{ bank: string }>;
}) {
  const { bank: bankSlug } = await params;
  const info = PROGRAMMATIC_BANKS[bankSlug.toLowerCase()];
  if (!info) notFound();

  let initialProperties: Property[] = [];
  try {
    const { data } = await supabase
      .from('properties')
      .select('*')
      .eq('status', 'active')
      .ilike('bank', `%${info.dbMatch}%`)
      .order('created_at', { ascending: false })
      .limit(20);

    if (data && data.length > 0) {
      initialProperties = data.map((p: any) => ({
        id: p.id,
        title: p.title,
        bank: p.bank,
        branch: p.branch,
        location: p.location,
        city: p.city,
        state: p.state,
        propertyType: p.property_type,
        reservePrice: p.reserve_price,
        marketValue: p.market_value,
        discount: p.discount,
        auctionDate: p.auction_date,
        emd: p.emd,
        description: p.description,
        photos: p.photos || [],
        sourceUrl: p.source_url,
        status: p.status,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
        firstSeenAt: p.first_seen_at,
        areaSqft: p.area_sqft,
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
        floor: p.floor,
        totalFloors: p.total_floors,
        parking: p.parking,
        amenities: p.amenities || [],
        possessionStatus: p.possession_status,
        constructionYear: p.construction_year,
        facing: p.facing,
        furnishing: p.furnishing,
      }));
    }
  } catch (e) {
    console.error('BankPropertiesPage SSR fetch error:', e);
  }

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
            { '@type': 'ListItem', position: 2, name: 'Auction Deals', item: `${siteUrl}/properties` },
            {
              '@type': 'ListItem',
              position: 3,
              name: `${info.fullName} Auctions`,
              item: `${siteUrl}/properties/bank/${bankSlug.toLowerCase()}`,
            },
          ],
        }}
      />
      <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
        <PropertiesClient initialProperties={initialProperties} initialBank={info.shortName} />
      </Suspense>
    </>
  );
}
