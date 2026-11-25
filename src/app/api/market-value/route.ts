import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();

    if (!body.property_id || !body.listed_price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate UUID format
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.property_id)) {
      return NextResponse.json({ error: 'Invalid property_id format' }, { status: 400 });
    }

    // Validate price
    if (typeof body.listed_price !== 'number' || body.listed_price < 0 || body.listed_price > 100000000000) {
      return NextResponse.json({ error: 'Invalid listed_price' }, { status: 400 });
    }

    // Sanitize source fields
    const sourceName = body.source_name ? String(body.source_name).slice(0, 100) : 'User Suggestion';
    const sourceUrl = body.source_url ? String(body.source_url).slice(0, 500) : null;
    const methodology = body.methodology ? String(body.methodology).slice(0, 500) : 'User-submitted';

    const { data, error } = await supabase
      .from('market_value_sources')
      .insert({
        property_id: body.property_id,
        source_name: sourceName,
        source_url: sourceUrl,
        listed_price: body.listed_price,
        methodology: methodology,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Market value insert error:', error.message);
      return NextResponse.json({ error: 'Failed to submit' }, { status: 400 });
    }

    return NextResponse.json({ success: true, id: data.id }, { status: 201 });
  } catch (e) {
    console.error('Market value error:', e);
    return NextResponse.json({ error: 'Failed to submit' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const propertyId = searchParams.get('property_id');

  if (!propertyId) {
    return NextResponse.json({ error: 'Missing property_id' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('market_value_sources')
      .select('*')
      .eq('property_id', propertyId)
      .eq('is_active', true)
      .order('fetched_at', { ascending: false });

    if (error) {
      console.error('Market value fetch error:', error.message);
      return NextResponse.json({ sources: [] }, { status: 200 });
    }

    return NextResponse.json({ sources: data || [] });
  } catch (e) {
    console.error('Market value error:', e);
    return NextResponse.json({ sources: [] }, { status: 200 });
  }
}