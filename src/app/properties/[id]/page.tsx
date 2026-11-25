'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';

export default function PropertyDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const [property, setProperty] = useState<any>(null);
  const [dealScore, setDealScore] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params?.id) {
      Promise.all([
        fetch(`/api/properties/${params.id}`).then(res => res.json()),
        fetch(`/api/deal-score/${params.id}`).then(res => res.json()),
      ]).then(([propData, scoreData]) => {
        setProperty(propData.property);
        setDealScore(scoreData.dealScore || null);
        if (propData.property) {
          import('@/lib/analytics').then(({ trackEvent }) => {
            trackEvent('property_viewed', {
              property_id: propData.property.id,
              city: propData.property.city,
              bank: propData.property.bank,
              price: propData.property.reservePrice,
              property_type: propData.property.propertyType,
              discount: propData.property.discount,
              deal_score: scoreData.dealScore?.overall,
            });
          });
        }
      })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [params?.id]);

  const formatPrice = (price: number | undefined | null) => {
    if (!price) return 'N/A';
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
    return `₹${price.toLocaleString('en-IN')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm font-semibold text-slate-600">Loading auction dossier...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center py-16 px-4">
        <div className="text-center max-w-sm">
          <h1 className="text-xl font-bold text-slate-900 mb-2">Property Record Not Found</h1>
          <p className="text-xs text-slate-500 mb-6">This auction may have expired or was concluded by the lending institution.</p>
          <Link
            href="/properties"
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition"
          >
            Back to Active Auctions
          </Link>
        </div>
      </div>
    );
  }

  const potentialProfit = property.marketValue && property.reservePrice ? property.marketValue - property.reservePrice : null;

  return (
    <div className="min-h-screen bg-slate-50 py-8 lg:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-6 flex items-center gap-2 text-xs font-medium text-slate-500">
          <Link href="/properties" className="hover:text-emerald-700 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>All Auctions</span>
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold truncate max-w-xs">{property.title}</span>
        </div>

        {/* Top Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm mb-8">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-800">
                    {property.propertyType}
                  </span>
                  <span className="px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                    {property.bank}
                  </span>
                  {property.discount && (
                    <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-amber-500 text-white">
                      {property.discount}% Below Market Value
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {property.title}
                </h1>

                <div className="mt-2 flex items-center gap-1.5 text-sm text-slate-500 font-medium">
                  <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{property.location}</span>
                </div>
              </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 shrink-0">
                {user && (
                  <button
                    onClick={async () => {
                      try {
                        const { data: { session } } = await (await import('@/lib/supabase')).supabase.auth.getSession();
                        const token = session?.access_token;
                        const res = await fetch('/api/watchlist', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                          body: JSON.stringify({ property_id: property.id }),
                        });
                        if (res.ok) {
                          alert('Added to your watchlist!');
                          import('@/lib/analytics').then(({ trackEvent }) => {
                            trackEvent('property_watchlisted', { property_id: property.id, city: property.city });
                          });
                        } else {
                          const data = await res.json();
                          alert(data.error || 'Failed to add');
                        }
                      } catch (e) {
                        alert('Failed to add to watchlist');
                      }
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
                  >
                    Save to Watchlist
                  </button>
                )}

                <a
                  href={property.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-1.5 shadow-sm"
                >
                  <span>Verify on Bank Portal</span>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Financial Summary Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-slate-100">
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-100">
                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Reserve Price</div>
                <div className="text-xl sm:text-2xl font-extrabold text-emerald-700 mt-0.5">
                  {formatPrice(property.reservePrice)}
                </div>
                <div className="text-[11px] text-emerald-600 mt-1">Starting auction bid threshold</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Estimated Market Value</div>
                <div className="text-xl sm:text-2xl font-extrabold text-slate-800 mt-0.5">
                  {formatPrice(property.marketValue)}
                </div>
                {potentialProfit && (
                  <div className="text-[11px] text-emerald-700 font-semibold mt-1">
                    Potential spread: {formatPrice(potentialProfit)}
                  </div>
                )}
              </div>

              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/70">
                <div className="text-[11px] font-bold uppercase tracking-wider text-amber-800">Earnest Money (EMD)</div>
                <div className="text-xl sm:text-2xl font-extrabold text-amber-900 mt-0.5">
                  {formatPrice(property.emd)}
                </div>
                <div className="text-[11px] text-amber-700 mt-1">10% refundable deposit required</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Auction Scheduled</div>
                <div className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
                  {property.auctionDate ? new Date(property.auctionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBA'}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Online E-Bidding window</div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Deal Analysis Section */}
        {dealScore && (
          <div className="mb-8 bg-gradient-to-br from-slate-50 to-emerald-50 rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">AI Deal Analysis</h2>
              <div className="flex items-center gap-3">
                <div className={`px-4 py-2 rounded-xl text-2xl font-extrabold ${
                  dealScore.grade === 'A' ? 'bg-emerald-500 text-white' :
                  dealScore.grade === 'B' ? 'bg-blue-500 text-white' :
                  dealScore.grade === 'C' ? 'bg-amber-500 text-white' :
                  dealScore.grade === 'D' ? 'bg-orange-500 text-white' :
                  'bg-red-500 text-white'
                }`}>
                  {dealScore.overall}/100
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-900">Grade {dealScore.grade}</div>
                  <div className="text-xs text-slate-500">{dealScore.label}</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {[
                { label: 'Discount', score: dealScore.components.discount, max: 30, color: 'bg-emerald-500' },
                { label: 'Location', score: dealScore.components.location, max: 25, color: 'bg-blue-500' },
                { label: 'Property Type', score: dealScore.components.propertyType, max: 15, color: 'bg-purple-500' },
                { label: 'Size', score: dealScore.components.size, max: 10, color: 'bg-amber-500' },
                { label: 'EMD', score: dealScore.components.emd, max: 10, color: 'bg-rose-500' },
                { label: 'Bank', score: dealScore.components.bank, max: 10, color: 'bg-slate-500' },
              ].map((comp) => (
                <div key={comp.label} className="bg-white/60 rounded-lg p-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">{comp.label}</span>
                    <span className="font-bold text-slate-900">{comp.score}/{comp.max}</span>
                  </div>
                  <div className="bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${comp.color}`}
                      style={{ width: `${(comp.score / comp.max) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white/60 rounded-lg p-4 mb-4">
              <h3 className="text-sm font-bold text-slate-900 mb-3">ROI Estimates</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <div className="text-xs text-slate-500">Est. Market Value</div>
                  <div className="font-bold text-slate-900">{formatPrice(dealScore.roi.estimatedMarketValue)}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Total Cost (incl. fees)</div>
                  <div className="font-bold text-slate-900">{formatPrice(dealScore.roi.totalCost)}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Potential Profit</div>
                  <div className={`font-bold ${dealScore.roi.potentialProfit > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {formatPrice(dealScore.roi.potentialProfit)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Profit Margin</div>
                  <div className={`font-bold ${dealScore.roi.profitMargin > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {dealScore.roi.profitMargin}%
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm mt-3">
                <div>
                  <div className="text-xs text-slate-500">Est. Rental Yield</div>
                  <div className="font-bold text-slate-900">{dealScore.roi.rentalYield}%</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Break-even</div>
                  <div className="font-bold text-slate-900">{dealScore.roi.breakEvenYears} years</div>
                </div>
              </div>
            </div>

            {dealScore.risks.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-bold text-red-700 mb-2">Risk Factors</h3>
                <ul className="space-y-1">
                  {dealScore.risks.map((risk: string, i: number) => (
                    <li key={i} className="text-sm text-red-600 flex items-start gap-2">
                      <span className="mt-0.5">•</span> {risk}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {dealScore.recommendations.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-emerald-700 mb-2">Recommendations</h3>
                <ul className="space-y-1">
                  {dealScore.recommendations.map((rec: string, i: number) => (
                    <li key={i} className="text-sm text-emerald-600 flex items-start gap-2">
                      <span className="mt-0.5">•</span> {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-slate-200/80 text-xs text-slate-500">
              <strong>Disclaimer:</strong> AI-generated estimate based on city averages. Actual market values may vary. Always verify independently.
            </div>
          </div>
        )}

        {/* Detail Specifications and Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Main Specifications */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
              <h2 className="text-lg font-bold text-slate-900 mb-6 pb-2 border-b border-slate-100">
                Asset Specifications & Notice Attributes
              </h2>

              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                <div className="flex justify-between py-1.5 border-b border-slate-50">
                  <dt className="text-slate-500 font-medium">Lending Bank</dt>
                  <dd className="font-semibold text-slate-900">{property.bank}</dd>
                </div>
                {property.branch && (
                  <div className="flex justify-between py-1.5 border-b border-slate-50">
                    <dt className="text-slate-500 font-medium">Authorised Branch</dt>
                    <dd className="font-semibold text-slate-900">{property.branch}</dd>
                  </div>
                )}
                <div className="flex justify-between py-1.5 border-b border-slate-50">
                  <dt className="text-slate-500 font-medium">Jurisdiction City</dt>
                  <dd className="font-semibold text-slate-900">{property.city}</dd>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-50">
                  <dt className="text-slate-500 font-medium">State</dt>
                  <dd className="font-semibold text-slate-900">{property.state}</dd>
                </div>
                {property.areaSqft && (
                  <div className="flex justify-between py-1.5 border-b border-slate-50">
                    <dt className="text-slate-500 font-medium">Super Built-up Area</dt>
                    <dd className="font-semibold text-slate-900">{property.areaSqft} sq ft</dd>
                  </div>
                )}
                {property.bedrooms && (
                  <div className="flex justify-between py-1.5 border-b border-slate-50">
                    <dt className="text-slate-500 font-medium">Unit Configuration</dt>
                    <dd className="font-semibold text-slate-900">{property.bedrooms} BHK</dd>
                  </div>
                )}
                {property.possessionStatus && (
                  <div className="flex justify-between py-1.5 border-b border-slate-50">
                    <dt className="text-slate-500 font-medium">Possession Status</dt>
                    <dd className="font-semibold capitalize text-emerald-700">
                      {property.possessionStatus.replace('-', ' ')}
                    </dd>
                  </div>
                )}
                {property.floor && (
                  <div className="flex justify-between py-1.5 border-b border-slate-50">
                    <dt className="text-slate-500 font-medium">Floor Level</dt>
                    <dd className="font-semibold text-slate-900">
                      {property.floor}{property.totalFloors ? ` of ${property.totalFloors}` : ''}
                    </dd>
                  </div>
                )}
              </dl>

              {property.description && (
                <div className="mt-8 pt-6 border-t border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 mb-2">Statutory Notice Extract</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/80 font-mono">
                    {property.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Investment Due Diligence Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="text-base font-bold text-slate-900 mb-4">
                Bidding Due Diligence Checklist
              </h3>
              <ul className="space-y-3 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                  <span>Obtain Title Search Report covering last 30 years from local sub-registrar.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                  <span>Inspect physical occupancy to verify Symbolic vs Physical bank possession.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                  <span>Account for 5-8% state stamp duty and local municipal dues.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                  <span>Confirm EMD transfer via NEFT/RTGS into MSTC wallet 48 hours prior.</span>
                </li>
              </ul>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <Link
                  href="/learn/sarfaesi-title-check"
                  className="text-xs font-semibold text-emerald-700 hover:underline flex items-center justify-between"
                >
                  <span>Title Verification Master Guide</span>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Regulatory Disclaimer */}
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
              <span className="font-bold">Disclaimer:</span> Asset descriptions are reproduced from public notices issued by financial institutions under the SARFAESI Act, 2002. InvestNest does not verify titles or broker property sales. Always carry out independent inspection and title verification.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
