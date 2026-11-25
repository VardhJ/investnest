import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(50, parseInt(searchParams.get('limit') || '20'));

    // Fetch recently added properties (first_seen_at in last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: newProps } = await supabase
      .from('properties')
      .select('id, title, bank, city, state, reserve_price, first_seen_at, created_at')
      .eq('status', 'active')
      .gte('first_seen_at', sevenDaysAgo)
      .order('first_seen_at', { ascending: false })
      .limit(limit);

    // Fetch likely sold properties
    const { data: soldProps } = await supabase
      .from('properties')
      .select('id, title, bank, city, state, reserve_price, last_seen_at')
      .eq('status', 'likely_sold')
      .order('last_seen_at', { ascending: false })
      .limit(limit);

    // Fetch properties with price changes (price_history length > 1)
    const { data: priceChangedProps } = await supabase
      .from('properties')
      .select('id, title, bank, city, state, reserve_price, price_history, last_seen_at')
      .not('price_history', 'is', null)
      .order('last_seen_at', { ascending: false })
      .limit(limit * 2);

    // Filter to only those with actual price changes
    const priceChanges = (priceChangedProps || []).filter(p => {
      const history = p.price_history || [];
      if (history.length < 2) return false;
      const last = history[history.length - 1]?.price;
      const prev = history[history.length - 2]?.price;
      return last !== prev;
    }).slice(0, limit);

    // Build activity feed
    const activities: any[] = [];

    (newProps || []).forEach(p => {
      activities.push({
        type: 'new',
        icon: '',
        title: p.title,
        bank: p.bank,
        city: p.city,
        state: p.state,
        price: p.reserve_price,
        date: p.first_seen_at || p.created_at,
        label: 'New Listing',
        color: 'emerald',
      });
    });

    (soldProps || []).forEach(p => {
      activities.push({
        type: 'sold',
        icon: '',
        title: p.title,
        bank: p.bank,
        city: p.city,
        state: p.state,
        price: p.reserve_price,
        date: p.last_seen_at,
        label: 'Likely Sold',
        color: 'slate',
      });
    });

    priceChanges.forEach(p => {
      const history = p.price_history || [];
      const last = history[history.length - 1]?.price;
      const prev = history[history.length - 2]?.price;
      activities.push({
        type: 'price_change',
        icon: last < prev ? '' : '',
        title: p.title,
        bank: p.bank,
        city: p.city,
        state: p.state,
        price: last,
        oldPrice: prev,
        date: p.last_seen_at,
        label: last < prev ? 'Price Drop' : 'Price Increase',
        color: last < prev ? 'emerald' : 'amber',
      });
    });

    // Sort by date descending
    activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({
      activities: activities.slice(0, limit),
      total: activities.length,
      newCount: (newProps || []).length,
      soldCount: (soldProps || []).length,
      priceChangeCount: priceChanges.length,
    });
  } catch (e) {
    console.error('Activity error:', e);
    return NextResponse.json({ error: 'Failed to fetch activity' }, { status: 500 });
  }
}