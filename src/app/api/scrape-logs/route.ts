import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('scrape_logs')
      .select('*')
      .order('scraped_at', { ascending: false })
      .limit(30);

    if (error) {
      console.error('Scrape logs error:', error.message);
      return NextResponse.json({ logs: [] }, { status: 200 });
    }

    return NextResponse.json({ logs: data || [] });
  } catch (e) {
    console.error('Scrape logs error:', e);
    return NextResponse.json({ logs: [] }, { status: 200 });
  }
}