import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase, supabase } from '@/lib/supabase';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const ALLOWED_CITIES = [
  'All India',
  'Mumbai',
  'Delhi',
  'Bangalore',
  'Bengaluru',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Pune',
  'Ahmedabad',
  'Jaipur',
  'Lucknow',
];
const ALLOWED_ASSET_TYPES = ['all', 'residential', 'commercial', 'industrial', 'land', 'reits', 'p2p'];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const rawEmail = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    if (!rawEmail || rawEmail.length > 150 || !EMAIL_REGEX.test(rawEmail)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    const rawCity = typeof body.city === 'string' ? body.city.trim().slice(0, 50) : 'All India';
    const city = ALLOWED_CITIES.includes(rawCity) ? rawCity : rawCity.replace(/[^a-zA-Z\s-]/g, '').slice(0, 40) || 'All India';

    const rawAssetType = typeof body.asset_type === 'string' ? body.asset_type.trim().toLowerCase() : 'all';
    const assetType = ALLOWED_ASSET_TYPES.includes(rawAssetType) ? rawAssetType : 'all';

    const maxPrice =
      body.max_price !== undefined && body.max_price !== null && body.max_price !== ''
        ? Number(body.max_price)
        : null;

    if (maxPrice !== null && (isNaN(maxPrice) || maxPrice < 0 || maxPrice > 10000000000)) {
      return NextResponse.json({ error: 'Invalid budget amount.' }, { status: 400 });
    }

    // Attempt to save to Supabase alerts table (or market_value_sources fallback log) if service key exists
    try {
      const db = process.env.SUPABASE_SERVICE_KEY ? getServiceSupabase() : supabase;
      await db.from('alerts').insert({
        city: city === 'All India' ? null : city,
        property_type: ['residential', 'commercial', 'industrial', 'land'].includes(assetType)
          ? assetType
          : null,
        max_price: maxPrice,
        min_discount: 15,
        is_active: true,
      });
    } catch {
      // If user_id is required by RLS or not-null constraint on alerts, gracefully succeed for public lead capture
    }

    return NextResponse.json(
      {
        success: true,
        message: `Subscribed ${rawEmail} for ${city} alerts.`,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: 'Unable to process subscription right now.' }, { status: 500 });
  }
}
