import { Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { Property } from '@/types';
import PropertiesClient from './PropertiesClient';

export const revalidate = 60;

export default async function PropertiesPage() {
  let initialProperties: Property[] = [];

  try {
    const { data } = await supabase
      .from('properties')
      .select('*')
      .eq('status', 'active')
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
    console.error('PropertiesPage SSR fetch error:', e);
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <PropertiesClient initialProperties={initialProperties} />
    </Suspense>
  );
}
