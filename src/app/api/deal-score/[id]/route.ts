import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { calculateDealScore } from '@/lib/dealScoring';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Prefer the deal score already computed and stored by the scraper
    // (which has access to BAANKNET's area, possession, and inspection data).
    if (data.deal_score && data.market_value) {
      const dealScore = {
        overall: data.deal_score,
        grade: data.deal_score >= 80 ? 'A' : data.deal_score >= 65 ? 'B' : data.deal_score >= 50 ? 'C' : data.deal_score >= 35 ? 'D' : 'F',
        label:
          data.deal_score >= 80
            ? 'Excellent Deal'
            : data.deal_score >= 65
            ? 'Good Deal'
            : data.deal_score >= 50
            ? 'Average Deal'
            : data.deal_score >= 35
            ? 'Below Average'
            : 'Poor Deal',
        marketValueSource: {
          sourceName: data.market_value_source || 'State IGR Circle Rate & City Benchmark',
          sourceUrl: null,
          pricePerSqft: 0,
          methodology: `Estimated market value: ₹${Number(data.market_value).toLocaleString('en-IN')} based on ${data.market_value_source || 'circle-rate benchmark'}. Reserve price: ₹${Number(data.reserve_price).toLocaleString('en-IN')}. Discount: ${data.discount || 0}% below estimated market value.`,
          confidence: 'medium',
        },
        components: { discount: 0, location: 0, propertyType: 0, size: 0, emd: 0, bank: 0 },
        roi: {
          estimatedMarketValue: data.market_value,
          totalCost: data.reserve_price + Math.round(data.reserve_price * 0.07),
          potentialProfit: data.market_value - (data.reserve_price + Math.round(data.reserve_price * 0.07)),
          profitMargin: 0,
          rentalYield: 0,
          breakEvenYears: 99,
        },
        risks: [],
        recommendations: ['Always verify title independently before bidding', 'Budget 7-10% extra for registration, stamp duty, and legal fees'],
      };

      const { data: mvSources } = await supabase
        .from('market_value_sources')
        .select('*')
        .eq('property_id', id)
        .eq('is_active', true);

      return NextResponse.json({ dealScore, marketValueSources: mvSources || [] });
    }

    // Fallback: compute from available DB columns (legacy records without stored score)
    const property = {
      title: data.title,
      bank: data.bank,
      city: data.city,
      state: data.state,
      propertyType: data.property_type,
      reservePrice: data.reserve_price,
      emd: data.emd,
      areaSqft: null,
      bedrooms: null,
      bathrooms: null,
      floor: null,
      totalFloors: null,
      parking: null,
      furnishing: null,
      possessionStatus: null,
      constructionYear: null,
      amenities: [],
    };

    const dealScore = calculateDealScore(property);

    // Also fetch market value sources if available
    const { data: mvSources } = await supabase
      .from('market_value_sources')
      .select('*')
      .eq('property_id', id)
      .eq('is_active', true);

    return NextResponse.json({ dealScore, marketValueSources: mvSources || [] });
  } catch (e) {
    console.error('Deal score error:', e);
    return NextResponse.json({ error: 'Failed to calculate deal score' }, { status: 500 });
  }
}