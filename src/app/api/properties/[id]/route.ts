import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ property: null }, { status: 404 });
    }

    const property = {
      id: data.id,
      title: data.title,
      bank: data.bank,
      branch: data.branch,
      location: data.location,
      city: data.city,
      state: data.state,
      propertyType: data.property_type,
      reservePrice: data.reserve_price,
      marketValue: data.market_value,
      discount: data.discount,
      auctionDate: data.auction_date,
      emd: data.emd,
      description: data.description,
      photos: data.photos || [],
      sourceUrl: data.source_url,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      firstSeenAt: data.first_seen_at,
      areaSqft: data.area_sqft,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      floor: data.floor,
      totalFloors: data.total_floors,
      parking: data.parking,
      amenities: data.amenities || [],
      possessionStatus: data.possession_status,
      constructionYear: data.construction_year,
      facing: data.facing,
      furnishing: data.furnishing,
    };

    return NextResponse.json({ property });
  } catch (e) {
    console.error('API error:', e);
    return NextResponse.json({ property: null }, { status: 500 });
  }
}