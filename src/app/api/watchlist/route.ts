import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  try {
    const { data, error } = await supabase
      .from('watchlist')
      .select('*, properties(*)')
      .eq('user_id', user.id);

    if (error) {
      console.error('Watchlist fetch error:', error.message);
      return NextResponse.json({ error: 'Failed to fetch watchlist' }, { status: 400 });
    }

    return NextResponse.json({ watchlist: data || [] });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch watchlist' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (!body.property_id || typeof body.property_id !== 'string') {
      return NextResponse.json({ error: 'Invalid property_id' }, { status: 400 });
    }
    // Validate UUID format
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.property_id)) {
      return NextResponse.json({ error: 'Invalid property_id format' }, { status: 400 });
    }
    const { data, error } = await supabase
      .from('watchlist')
      .insert({ user_id: user.id, property_id: body.property_id })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Already in watchlist' }, { status: 409 });
      }
      console.error('Watchlist insert error:', error.message);
      return NextResponse.json({ error: 'Failed to add to watchlist' }, { status: 400 });
    }

    return NextResponse.json({ item: data }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to add to watchlist' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('property_id');

    const { error } = await supabase
      .from('watchlist')
      .delete()
      .eq('user_id', user.id)
      .eq('property_id', propertyId);

    if (error) {
      console.error('Watchlist delete error:', error.message);
      return NextResponse.json({ error: 'Failed to remove from watchlist' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to remove from watchlist' }, { status: 500 });
  }
}