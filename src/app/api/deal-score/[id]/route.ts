import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { calculateDealScore } from '@/lib/dealScoring';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    const property = {
      title: data.title,
      bank: data.bank,
      city: data.city,
      state: data.state,
      propertyType: data.property_type,
      reservePrice: data.reserve_price,
      emd: data.emd,
      areaSqft: data.area_sqft,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      floor: data.floor,
      totalFloors: data.total_floors,
      parking: data.parking,
      furnishing: data.furnishing,
      possessionStatus: data.possession_status,
      constructionYear: data.construction_year,
      amenities: data.amenities || [],
    };

    const dealScore = calculateDealScore(property);

    // Also fetch market value sources if available
    const { data: mvSources } = await supabase
      .from('market_value_sources')
      .select('*')
      .eq('property_id', id)
      .eq('is_active', true);

    return NextResponse.json({ dealScore, marketValueSources: mvSources || [] });
  } catch (e) {
    console.error('Deal score error:', e);
    return NextResponse.json({ error: 'Failed to calculate deal score' }, { status: 500 });
  }
}