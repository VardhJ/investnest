import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Fetch all properties (paginated)
    let allProperties: any[] = [];
    let offset = 0;
    const limit = 1000;

    while (true) {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'active')
        .range(offset, offset + limit - 1);

      if (error || !data || data.length === 0) break;
      allProperties = allProperties.concat(data);
      if (data.length < limit) break;
      offset += limit;
    }

    if (allProperties.length === 0) {
      return NextResponse.json({ error: 'No properties found' }, { status: 404 });
    }

    // Bank distribution
    const bankCounts: Record<string, number> = {};
    allProperties.forEach(p => {
      bankCounts[p.bank] = (bankCounts[p.bank] || 0) + 1;
    });
    const bankDistribution = Object.entries(bankCounts)
      .map(([bank, count]) => ({
        bank,
        count,
        percentage: (count / allProperties.length) * 100,
      }))
      .sort((a, b) => b.count - a.count);

    // City distribution (top 20)
    const cityCounts: Record<string, number> = {};
    allProperties.forEach(p => {
      cityCounts[p.city] = (cityCounts[p.city] || 0) + 1;
    });
    const cityDistribution = Object.entries(cityCounts)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    // Property type distribution
    const typeCounts: Record<string, number> = {};
    allProperties.forEach(p => {
      typeCounts[p.property_type] = (typeCounts[p.property_type] || 0) + 1;
    });
    const typeDistribution = Object.entries(typeCounts)
      .map(([type, count]) => ({
        type,
        count,
        percentage: (count / allProperties.length) * 100,
      }))
      .sort((a, b) => b.count - a.count);

    // State distribution (top 15)
    const stateCounts: Record<string, number> = {};
    allProperties.forEach(p => {
      stateCounts[p.state] = (stateCounts[p.state] || 0) + 1;
    });
    const stateDistribution = Object.entries(stateCounts)
      .map(([state, count]) => ({
        state,
        count,
        percentage: (count / allProperties.length) * 100,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    // Price ranges
    const priceRanges = [
      { range: '< ₹25L', min: 0, max: 2500000 },
      { range: '₹25-50L', min: 2500000, max: 5000000 },
      { range: '₹50L-1Cr', min: 5000000, max: 10000000 },
      { range: '₹1-2Cr', min: 10000000, max: 20000000 },
      { range: '₹2-5Cr', min: 20000000, max: 50000000 },
      { range: '> ₹5Cr', min: 50000000, max: Infinity },
    ];
    const priceRangeData = priceRanges.map(r => {
      const count = allProperties.filter(p => p.reserve_price >= r.min && p.reserve_price < r.max).length;
      return {
        range: r.range,
        count,
        percentage: (count / allProperties.length) * 100,
      };
    });

    // Best deals (lowest 6 prices)
    const bestDeals = [...allProperties]
      .sort((a, b) => a.reserve_price - b.reserve_price)
      .slice(0, 6)
      .map(p => ({
        id: p.id,
        title: p.title,
        bank: p.bank,
        city: p.city,
        reservePrice: p.reserve_price,
        propertyType: p.property_type,
      }));

    // Price stats
    const prices = allProperties.map(p => p.reserve_price).filter(Boolean).sort((a, b) => a - b);
    const priceStats = {
      min: prices[0] || 0,
      max: prices[prices.length - 1] || 0,
      avg: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
      median: prices[Math.floor(prices.length / 2)] || 0,
    };

    // EMD stats
    const emds = allProperties.map(p => p.emd).filter(Boolean);
    const emdStats = {
      avgEmd: emds.length > 0 ? Math.round(emds.reduce((a, b) => a + b, 0) / emds.length) : 0,
      emdPercentage: emds.length > 0 && prices.length > 0
        ? (emds.reduce((a, b) => a + b, 0) / prices.reduce((a, b) => a + b, 0)) * 100
        : 0,
    };

    return NextResponse.json({
      totalProperties: allProperties.length,
      bankDistribution,
      cityDistribution,
      typeDistribution,
      stateDistribution,
      priceRanges: priceRangeData,
      bestDeals,
      priceStats,
      emdStats,
    });
  } catch (e) {
    console.error('Analytics error:', e);
    return NextResponse.json({ error: 'Failed to load analytics' }, { status: 500 });
  }
}