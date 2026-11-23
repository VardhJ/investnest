import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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

    return NextResponse.json({ properties, total: count || 0 });
  } catch (e) {
    console.error('API error:', e);
    return NextResponse.json({ properties: [], total: 0 }, { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify auth token
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check admin role
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    // If profile doesn't exist, create it (default role: user)
    if (!profile) {
      await supabase.from('user_profiles').insert({ id: user.id, role: 'user' });
      return NextResponse.json({ error: 'Admin access required. Your role is "user".' }, { status: 403 });
    }

    if (profile.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();

    const { data, error } = await supabase
      .from('properties')
      .insert(body)
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ property: data }, { status: 201 });
  } catch (e) {
    console.error('API error:', e);
    return NextResponse.json({ error: 'Failed to create property' }, { status: 500 });
  }
}