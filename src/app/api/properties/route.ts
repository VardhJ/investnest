import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Property } from '@/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const search = searchParams.get('search');
  const city = searchParams.get('city');
  const type = searchParams.get('type');
  const bank = searchParams.get('bank');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const sortBy = searchParams.get('sortBy') || 'auction_date';
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = 20;

  try {
    let query = supabase
      .from('properties')
      .select('*', { count: 'exact' })
      .eq('status', 'active');

    if (search) {
      query = query.or(`title.ilike.%${search}%,location.ilike.%${search}%,city.ilike.%${search}%,bank.ilike.%${search}%`);
    }
    if (city) {
      query = query.eq('city', city);
    }
    if (type) {
      query = query.eq('property_type', type);
    }
    if (bank) {
      query = query.eq('bank', bank);
    }
    if (minPrice) {
      query = query.gte('reserve_price', parseInt(minPrice));
    }
    if (maxPrice) {
      query = query.lte('reserve_price', parseInt(maxPrice));
    }

    // Sorting
    if (sortBy === 'price') {
      query = query.order('reserve_price', { ascending: true });
    } else if (sortBy === 'discount') {
      query = query.order('discount', { ascending: false });
    } else {
      query = query.order('auction_date', { ascending: true });
    }

    // Pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ properties: [], total: 0 }, { status: 200 });
    }

    // Map snake_case to camelCase for frontend
    const properties = (data || []).map((p: any) => ({
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
    }));

    return NextResponse.json({ properties, total: count || 0 });
  } catch (e) {
    console.error('API error:', e);
    return NextResponse.json({ properties: [], total: 0 }, { status: 200 });
  }
}