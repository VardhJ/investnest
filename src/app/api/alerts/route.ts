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
      .from('alerts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Alerts fetch error:', error.message);
      return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 400 });
    }

    return NextResponse.json({ alerts: data || [] });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 });
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
    // Validate inputs
    if (body.city && typeof body.city !== 'string') {
      return NextResponse.json({ error: 'Invalid city' }, { status: 400 });
    }
    if (body.property_type && !['residential', 'commercial', 'industrial', 'land', 'vehicle'].includes(body.property_type)) {
      return NextResponse.json({ error: 'Invalid property_type' }, { status: 400 });
    }
    if (body.max_price && (isNaN(body.max_price) || body.max_price < 0 || body.max_price > 10000000000)) {
      return NextResponse.json({ error: 'Invalid max_price' }, { status: 400 });
    }
    if (body.min_discount && (isNaN(body.min_discount) || body.min_discount < 0 || body.min_discount > 100)) {
      return NextResponse.json({ error: 'Invalid min_discount' }, { status: 400 });
    }
    const { data, error } = await supabase
      .from('alerts')
      .insert({
        user_id: user.id,
        city: body.city ? String(body.city).slice(0, 50) : null,
        property_type: body.property_type || null,
        max_price: body.max_price || null,
        min_discount: body.min_discount || null,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Alert create error:', error.message);
      return NextResponse.json({ error: 'Failed to create alert' }, { status: 400 });
    }

    return NextResponse.json({ alert: data }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to create alert' }, { status: 500 });
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
    const alertId = searchParams.get('id');

    const { error } = await supabase
      .from('alerts')
      .delete()
      .eq('id', alertId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Alert delete error:', error.message);
      return NextResponse.json({ error: 'Failed to delete alert' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to delete alert' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
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
    const { data, error } = await supabase
      .from('alerts')
      .update({ is_active: body.is_active })
      .eq('id', body.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Alert update error:', error.message);
      return NextResponse.json({ error: 'Failed to update alert' }, { status: 400 });
    }

    return NextResponse.json({ alert: data });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to update alert' }, { status: 500 });
  }
}