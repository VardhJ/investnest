import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Property } from '@/types';
import PropertiesClient from '../../PropertiesClient';
import JsonLd from '@/components/JsonLd';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.investnest.in';

export const PROGRAMMATIC_CITIES: Record<
  string,
  { name: string; state: string; igrSource: string; description: string }
> = {
  mumbai: {
    name: 'Mumbai',
    state: 'Maharashtra',
    igrSource: 'Maharashtra IGR Ready Reckoner 2026',
    description:
      'Verified SARFAESI bank-seized residential flats, commercial offices, and industrial properties across Mumbai, Thane, and Navi Mumbai.',
  },
  delhi: {
    name: 'Delhi',
    state: 'Delhi NCR',
    igrSource: 'Delhi Circle Rate 2026',
    description:
      'Distressed bank auction residential floors, commercial shops, and industrial plots across New Delhi and NCR.',
  },
  bangalore: {
    name: 'Bangalore',
    state: 'Karnataka',
    igrSource: 'Karnataka Kaveri Guidance Value 2026',
    description:
      'Bank-seized apartments, villa plots, and IT corridor commercial properties auctioned by public and private banks in Bengaluru.',
  },
  hyderabad: {
    name: 'Hyderabad',
    state: 'Telangana',
    igrSource: 'Telangana Registration Market Value 2026',
    description:
      'SARFAESI e-auction flats, commercial buildings, and open plots in Hyderabad, Secunderabad, and Ranga Reddy districts.',
  },
  chennai: {
    name: 'Chennai',
    state: 'Tamil Nadu',
    igrSource: 'Tamil Nadu TNREGINET Guideline Value 2026',
    description:
      'Bank-foreclosed residential flats, industrial sheds, and plots across Chennai, Kancheepuram, and Tiruvallur.',
  },
  kolkata: {
    name: 'Kolkata',
    state: 'West Bengal',
    igrSource: 'West Bengal IGR Circle Rate 2026',
    description:
      'Scheduled bank e-auction residential apartments, commercial units, and warehouses across Kolkata and Howrah.',
  },
  pune: {
    name: 'Pune',
    state: 'Maharashtra',
    igrSource: 'Maharashtra IGR Ready Reckoner 2026',
    description:
      'Bank-seized residential flats, MIDC industrial units, and commercial spaces in Pune and Pimpri-Chinchwad.',
  },
  ahmedabad: {
    name: 'Ahmedabad',
    state: 'Gujarat',
    igrSource: 'Gujarat Jantri Rate 2026',
    description:
      'SARFAESI bank auction tenements, commercial offices, and GIDC industrial properties in Ahmedabad and Gandhinagar.',
  },
  jaipur: {
    name: 'Jaipur',
    state: 'Rajasthan',
    igrSource: 'Rajasthan DLC Rate 2026',
    description:
      'Distressed bank-seized residential plots, villas, and commercial properties across Jaipur.',
  },
  lucknow: {
    name: 'Lucknow',
    state: 'Uttar Pradesh',
    igrSource: 'UP DM Circle Rate 2026',
    description:
      'Bank e-auction residential houses, plots, and commercial godowns across Lucknow.',
  },
};

export const revalidate = 300;

export function generateStaticParams() {
  return Object.keys(PROGRAMMATIC_CITIES).map((city) => ({ city }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city: citySlug } = await params;
  const info = PROGRAMMATIC_CITIES[citySlug.toLowerCase()];
  if (!info) return {};

  return {
    title: `Bank Auction Properties in ${info.name} (${info.state}) - SARFAESI Deals 15-30% Below Market`,
    description: `${info.description} Compare reserve prices against ${info.igrSource} benchmarks and EMD dates.`,
    alternates: {
      canonical: `${siteUrl}/properties/city/${citySlug.toLowerCase()}`,
    },
    openGraph: {
      title: `Bank-Seized Auction Properties in ${info.name} - 15-30% Below Market`,
      description: info.description,
      url: `${siteUrl}/properties/city/${citySlug.toLowerCase()}`,
      images: [{ url: `${siteUrl}/og/default.png`, width: 1200, height: 630 }],
    },
  };
}

export default async function CityPropertiesPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city: citySlug } = await params;
  const info = PROGRAMMATIC_CITIES[citySlug.toLowerCase()];
  if (!info) notFound();

  let initialProperties: Property[] = [];
  try {
    const { data } = await supabase
      .from('properties')
      .select('*')
      .eq('status', 'active')
      .ilike('city', `%${info.name}%`)
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
    console.error('CityPropertiesPage SSR fetch error:', e);
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
              name: `${info.name} Bank Auctions`,
              item: `${siteUrl}/properties/city/${citySlug.toLowerCase()}`,
            },
          ],
        }}
      />
      <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
        <PropertiesClient initialProperties={initialProperties} initialCity={info.name} />
      </Suspense>
    </>
  );
}
