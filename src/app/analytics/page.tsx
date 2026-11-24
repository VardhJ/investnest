'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { trackEvent } from '@/lib/analytics';

interface AnalyticsData {
  totalProperties: number;
  bankDistribution: { bank: string; count: number; percentage: number }[];
  cityDistribution: { city: string; count: number }[];
  typeDistribution: { type: string; count: number; percentage: number }[];
  priceRanges: { range: string; count: number; percentage: number }[];
  stateDistribution: { state: string; count: number; percentage: number }[];
  bestDeals: { id: string; title: string; bank: string; city: string; reservePrice: number; propertyType: string }[];
  emdStats: { avgEmd: number; emdPercentage: number };
  priceStats: { min: number; max: number; avg: number; median: number };
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
    trackEvent('analytics_viewed', {});
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics');
      const json = await res.json();
      if (json.error) {
        setError(json.error);
      } else {
        setData(json);
      }
    } catch (e) {
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
    return `₹${price.toLocaleString('en-IN')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Analytics Unavailable</h1>
          <p className="text-gray-600">{error || 'No data available'}</p>
        </div>
      </div>
    );
  }

  const maxBankCount = Math.max(...data.bankDistribution.map(b => b.count));
  const maxCityCount = Math.max(...data.cityDistribution.map(c => c.count));
  const maxTypeCount = Math.max(...data.typeDistribution.map(t => t.count));

  const typeColors: Record<string, string> = {
    residential: 'bg-emerald-500',
    commercial: 'bg-blue-500',
    industrial: 'bg-amber-500',
    land: 'bg-purple-500',
    vehicle: 'bg-rose-500',
  };

  const typeLabels: Record<string, string> = {
    residential: 'Residential',
    commercial: 'Commercial',
    industrial: 'Industrial',
    land: 'Land',
    vehicle: 'Vehicle',
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Market Analytics Dashboard</h1>
          <p className="text-slate-600">Real-time insights from {data.totalProperties.toLocaleString()} SARFAESI auction properties</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
            <div className="text-3xl font-extrabold text-slate-900">{data.totalProperties.toLocaleString()}</div>
            <div className="text-sm text-slate-500 mt-1">Total Properties</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
            <div className="text-3xl font-extrabold text-emerald-600">{data.bankDistribution.length}</div>
            <div className="text-sm text-slate-500 mt-1">Banks Listing</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
            <div className="text-3xl font-extrabold text-blue-600">{data.cityDistribution.length}</div>
            <div className="text-sm text-slate-500 mt-1">Cities Covered</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
            <div className="text-3xl font-extrabold text-amber-600">{formatPrice(data.priceStats.median)}</div>
            <div className="text-sm text-slate-500 mt-1">Median Price</div>
          </div>
        </div>

        {/* Property Type Breakdown */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Property Type Breakdown</h2>
          <div className="space-y-4">
            {data.typeDistribution.map((type) => (
              <div key={type.type} className="flex items-center gap-4">
                <div className="w-28 text-sm font-medium text-slate-700 capitalize">{typeLabels[type.type] || type.type}</div>
                <div className="flex-1 bg-slate-100 rounded-full h-6 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${typeColors[type.type] || 'bg-slate-500'} transition-all duration-500`}
                    style={{ width: `${(type.count / maxTypeCount) * 100}%` }}
                  />
                </div>
                <div className="w-24 text-right">
                  <span className="text-sm font-bold text-slate-900">{type.count.toLocaleString()}</span>
                  <span className="text-xs text-slate-500 ml-1">({type.percentage.toFixed(1)}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Best Deals Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Best Deals — Lowest Reserve Prices</h2>
            <Link href="/properties?sortBy=price" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.bestDeals.map((deal) => (
              <Link
                key={deal.id}
                href={`/properties/${deal.id}`}
                className="p-4 rounded-xl border border-slate-200/80 hover:border-emerald-300 hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{deal.propertyType}</span>
                  <span className="text-xs font-medium text-emerald-600">{deal.bank}</span>
                </div>
                <h3 className="font-semibold text-slate-900 text-sm mb-2 line-clamp-1">{deal.title}</h3>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-emerald-600">{formatPrice(deal.reservePrice)}</span>
                  <span className="text-xs text-slate-500">{deal.city}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Bank Comparison */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Bank Comparison — Auction Activity</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-2 font-semibold text-slate-700">Bank</th>
                  <th className="text-right py-3 px-2 font-semibold text-slate-700">Properties</th>
                  <th className="text-right py-3 px-2 font-semibold text-slate-700">Share</th>
                  <th className="text-left py-3 px-2 font-semibold text-slate-700 w-1/3">Distribution</th>
                </tr>
              </thead>
              <tbody>
                {data.bankDistribution.map((bank) => (
                  <tr key={bank.bank} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-2 font-medium text-slate-900">{bank.bank}</td>
                    <td className="py-3 px-2 text-right font-bold text-slate-900">{bank.count.toLocaleString()}</td>
                    <td className="py-3 px-2 text-right text-slate-600">{bank.percentage.toFixed(1)}%</td>
                    <td className="py-3 px-2">
                      <div className="bg-slate-100 rounded-full h-4 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                          style={{ width: `${(bank.count / maxBankCount) * 100}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* City Heatmap */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
          <h2 className="text-xl font-bold text-slate-900 mb-6">City Heatmap — Property Concentration</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {data.cityDistribution.map((city) => {
              const intensity = city.count / maxCityCount;
              const bgClass = intensity > 0.7 ? 'bg-emerald-600 text-white' :
                             intensity > 0.4 ? 'bg-emerald-400 text-white' :
                             intensity > 0.2 ? 'bg-emerald-200 text-emerald-900' :
                             'bg-slate-100 text-slate-700';
              return (
                <Link
                  key={city.city}
                  href={`/properties?city=${encodeURIComponent(city.city)}`}
                  className={`rounded-xl p-3 text-center ${bgClass} transition-all hover:scale-105 cursor-pointer block`}
                >
                  <div className="text-lg font-bold">{city.count}</div>
                  <div className="text-xs font-medium truncate">{city.city}</div>
                </Link>
              );
            })}
          </div>
          <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-600"></span> High (50+)</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-400"></span> Medium (20-50)</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-200"></span> Low (10-20)</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-slate-100"></span> Very Low (&lt;10)</span>
          </div>
        </div>

        {/* Price Distribution */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Price Distribution</h2>
          <div className="space-y-3">
            {data.priceRanges.map((range) => (
              <div key={range.range} className="flex items-center gap-4">
                <div className="w-24 text-sm font-medium text-slate-700">{range.range}</div>
                <div className="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${range.percentage}%` }}
                  />
                </div>
                <div className="w-24 text-right">
                  <span className="text-sm font-bold text-slate-900">{range.count.toLocaleString()}</span>
                  <span className="text-xs text-slate-500 ml-1">({range.percentage.toFixed(1)}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* State Distribution */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Geographic Distribution — Top States</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {data.stateDistribution.map((state) => (
              <div
                key={state.state}
                className="rounded-xl p-3 text-center bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-all"
              >
                <div className="text-lg font-bold text-slate-900">{state.count}</div>
                <div className="text-xs font-medium text-slate-600 truncate">{state.state}</div>
                <div className="text-xs text-slate-400">{state.percentage.toFixed(1)}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* EMD Stats */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
          <h2 className="text-xl font-bold text-slate-900 mb-4">EMD (Earnest Money Deposit) Stats</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-slate-600 mb-1">Average EMD Amount</div>
              <div className="text-2xl font-bold text-slate-900">{formatPrice(data.emdStats.avgEmd)}</div>
            </div>
            <div>
              <div className="text-sm text-slate-600 mb-1">EMD as % of Reserve Price</div>
              <div className="text-2xl font-bold text-slate-900">{data.emdStats.emdPercentage.toFixed(1)}%</div>
            </div>
          </div>
          <p className="text-sm text-slate-500 mt-4">
            EMD is typically 5-10% of the reserve price. You need to pay this before bidding. It's refundable if you don't win.
          </p>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          <strong>Disclaimer:</strong> This data is derived from IBAPI (Indian Banks' Association Property Auction portal).
          Property counts and prices are updated daily via automated scraping. Market values, deal scores, and discounts are estimates.
          Always verify property details independently before bidding.
        </div>

        <div className="text-[11px] text-slate-400 leading-relaxed pt-2">
          <span className="font-medium text-slate-500">Note:</span> Deal scores, ROI estimates, and market value projections are indicative and based on city-level averages. They do not constitute financial advice or a recommendation to bid. Actual property values may differ significantly. InvestNest is not a financial advisor.
        </div>
      </div>
    </div>
  );
}