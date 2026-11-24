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

    // Sanitize search input to prevent filter injection
    if (search) {
      const sanitized = search.replace(/[%_\\,()'"<>]/g, '').slice(0, 100);
      if (sanitized) {
        query = query.or(`title.ilike.%${sanitized}%,location.ilike.%${sanitized}%,city.ilike.%${sanitized}%,bank.ilike.%${sanitized}%`);
      }
    }
    if (city) {
      query = query.eq('city', city.slice(0, 50));
    }
    if (type) {
      const validTypes = ['residential', 'commercial', 'industrial', 'land', 'vehicle'];
      if (validTypes.includes(type)) {
        query = query.eq('property_type', type);
      }
    }
    if (bank) {
      query = query.eq('bank', bank.slice(0, 50));
    }
    if (minPrice) {
      const minPriceNum = parseInt(minPrice);
      if (!isNaN(minPriceNum) && minPriceNum >= 0) {
        query = query.gte('reserve_price', minPriceNum);
      }
    }
    if (maxPrice) {
      const maxPriceNum = parseInt(maxPrice);
      if (!isNaN(maxPriceNum) && maxPriceNum >= 0) {
        query = query.lte('reserve_price', maxPriceNum);
      }
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
      console.error('Supabase error:', error.message);
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

    // Input validation
    if (!body.title || !body.bank || !body.location || !body.city || !body.state || !body.reserve_price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (typeof body.reserve_price !== 'number' || body.reserve_price < 0 || body.reserve_price > 10000000000) {
      return NextResponse.json({ error: 'Invalid reserve price' }, { status: 400 });
    }
    // Sanitize string fields
    body.title = String(body.title).slice(0, 200);
    body.bank = String(body.bank).slice(0, 100);
    body.location = String(body.location).slice(0, 500);
    body.city = String(body.city).slice(0, 100);
    body.state = String(body.state).slice(0, 100);
    body.description = body.description ? String(body.description).slice(0, 2000) : null;
    body.source_url = body.source_url ? String(body.source_url).slice(0, 500) : null;
    body.branch = body.branch ? String(body.branch).slice(0, 100) : null;

    const { data, error } = await supabase
      .from('properties')
      .insert(body)
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error.message);
      return NextResponse.json({ error: 'Failed to create property' }, { status: 400 });
    }

    return NextResponse.json({ property: data }, { status: 201 });
  } catch (e) {
    console.error('API error:', e);
    return NextResponse.json({ error: 'Failed to create property' }, { status: 500 });
  }
}