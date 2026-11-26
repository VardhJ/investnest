import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { calculateDealScore } from '@/lib/dealScoring';
import QuickAlertBox from '@/components/QuickAlertBox';
import PropertyAnalyticsTracker from './PropertyAnalyticsTracker';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.investnest.in';

function formatPrice(price: number | null | undefined): string {
  if (!price) return 'N/A';
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
  return `₹${price.toLocaleString('en-IN')}`;
}

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data: property } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single();

  if (!property) notFound();

  const dealScoreData = calculateDealScore({
    title: property.title,
    bank: property.bank,
    city: property.city,
    state: property.state,
    propertyType: property.property_type,
    reservePrice: property.reserve_price,
    emd: property.emd,
    areaSqft: property.area_sqft || null,
    bedrooms: property.bedrooms || null,
    bathrooms: property.bathrooms || null,
    floor: property.floor || null,
    totalFloors: property.total_floors || null,
    parking: property.parking || null,
    furnishing: property.furnishing || null,
    possessionStatus: property.possession_status || null,
    constructionYear: property.construction_year || null,
    amenities: property.amenities || [],
  });

  const effectiveMarketValue = property.market_value || dealScoreData.roi.estimatedMarketValue;
  const potentialProfit =
    effectiveMarketValue && property.reserve_price
      ? effectiveMarketValue - property.reserve_price
      : null;

  return (
    <div className="min-h-screen bg-slate-50 py-8 lg:py-12">
      {/* Fire-and-forget analytics tracker (client component, no SSR impact) */}
      <PropertyAnalyticsTracker property={property} dealScore={dealScoreData} />

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
                    {property.property_type}
                  </span>
                  <span className="px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                    {property.bank}
                  </span>
                  {property.discount && (
                    <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-600 text-white">
                      {property.discount}% Below Market
                    </span>
                  )}
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  {property.title}
                </h1>
                <p className="mt-1 text-sm text-slate-500 font-medium">
                  {property.location && `${property.location}, `}{property.city}, {property.state}
                </p>
              </div>

              {property.source_url && (
                <a
                  href={property.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition inline-flex items-center gap-1.5"
                >
                  <span>View Official Notice</span>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>

            {/* Price Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200/80">
              <div>
                <div className="text-xs text-slate-500 font-medium mb-0.5">Reserve Price</div>
                <div className="text-lg font-extrabold text-slate-900">{formatPrice(property.reserve_price)}</div>
              </div>
              {effectiveMarketValue && (
                <div>
                  <div className="text-xs text-slate-500 font-medium mb-0.5">Est. Market Value</div>
                  <div className="text-lg font-extrabold text-slate-900">{formatPrice(effectiveMarketValue)}</div>
                </div>
              )}
              {potentialProfit && potentialProfit > 0 && (
                <div>
                  <div className="text-xs text-slate-500 font-medium mb-0.5">Potential Upside</div>
                  <div className="text-lg font-extrabold text-emerald-600">{formatPrice(potentialProfit)}</div>
                </div>
              )}
              {property.emd && (
                <div>
                  <div className="text-xs text-slate-500 font-medium mb-0.5">EMD Required</div>
                  <div className="text-lg font-extrabold text-slate-900">{formatPrice(property.emd)}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Details */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-base font-bold text-slate-900 mb-4">Property Details</h2>
              <dl className="space-y-0 text-sm">
                {property.auction_date && (
                  <div className="flex justify-between py-1.5 border-b border-slate-50">
                    <dt className="text-slate-500 font-medium">Auction Date</dt>
                    <dd className="font-semibold text-slate-900">
                      {new Date(property.auction_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </dd>
                  </div>
                )}
                {property.area_sqft && (
                  <div className="flex justify-between py-1.5 border-b border-slate-50">
                    <dt className="text-slate-500 font-medium">Area</dt>
                    <dd className="font-semibold text-slate-900">{property.area_sqft.toLocaleString('en-IN')} sq.ft</dd>
                  </div>
                )}
                {property.bedrooms && (
                  <div className="flex justify-between py-1.5 border-b border-slate-50">
                    <dt className="text-slate-500 font-medium">Bedrooms</dt>
                    <dd className="font-semibold text-slate-900">{property.bedrooms}</dd>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="flex justify-between py-1.5 border-b border-slate-50">
                    <dt className="text-slate-500 font-medium">Bathrooms</dt>
                    <dd className="font-semibold text-slate-900">{property.bathrooms}</dd>
                  </div>
                )}
                {property.possession_status && (
                  <div className="flex justify-between py-1.5 border-b border-slate-50">
                    <dt className="text-slate-500 font-medium">Possession Status</dt>
                    <dd className="font-semibold capitalize text-emerald-700">
                      {property.possession_status.replace('-', ' ')}
                    </dd>
                  </div>
                )}
                {property.floor && (
                  <div className="flex justify-between py-1.5 border-b border-slate-50">
                    <dt className="text-slate-500 font-medium">Floor Level</dt>
                    <dd className="font-semibold text-slate-900">
                      {property.floor}{property.total_floors ? ` of ${property.total_floors}` : ''}
                    </dd>
                  </div>
                )}
                {property.facing && (
                  <div className="flex justify-between py-1.5 border-b border-slate-50">
                    <dt className="text-slate-500 font-medium">Facing</dt>
                    <dd className="font-semibold text-slate-900 capitalize">{property.facing}</dd>
                  </div>
                )}
                {property.construction_year && (
                  <div className="flex justify-between py-1.5 border-b border-slate-50">
                    <dt className="text-slate-500 font-medium">Construction Year</dt>
                    <dd className="font-semibold text-slate-900">{property.construction_year}</dd>
                  </div>
                )}
                {property.branch && (
                  <div className="flex justify-between py-1.5 border-b border-slate-50">
                    <dt className="text-slate-500 font-medium">Bank Branch</dt>
                    <dd className="font-semibold text-slate-900">{property.branch}</dd>
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

            {/* Deal Score */}
            {dealScoreData && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-slate-900">InvestNest Valuation & Deal Score</h2>
                  <span className="px-2.5 py-0.5 rounded text-xs font-extrabold bg-emerald-100 text-emerald-800">
                    Grade {dealScoreData.grade}: {dealScoreData.label}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-5 pb-5 border-b border-slate-100">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-500 flex items-center justify-center shrink-0">
                    <span className="text-2xl font-extrabold text-emerald-700">{dealScoreData.overall}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                      {dealScoreData.marketValueSource.sourceName}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {dealScoreData.marketValueSource.methodology}
                    </p>
                  </div>
                </div>
                {dealScoreData.recommendations.length > 0 && (
                  <div className="mt-4">
                    <div className="text-xs font-bold text-slate-800 mb-2">Analyst Notes & Action Items</div>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      {dealScoreData.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <QuickAlertBox
              variant="sidebar"
              defaultCity={property.city || 'All India'}
              defaultAssetType={property.property_type || 'all'}
              title={`Track ${property.city || 'Local'} Re-Auctions & Price Drops`}
              subtitle="Get notified if this property's reserve price is reduced in a subsequent auction round or similar bank-seized assets list nearby."
            />

            {/* Due Diligence Checklist */}
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

            {/* Related Learn Links */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="text-base font-bold text-slate-900 mb-4">Related Guides</h3>
              <ul className="space-y-3 text-xs">
                <li>
                  <Link href="/learn/mstc-e-auction-guide" className="text-emerald-700 hover:underline font-medium">
                    MSTC E-Auction Registration & Bidding →
                  </Link>
                </li>
                <li>
                  <Link href="/learn/sarfaesi-auctions" className="text-emerald-700 hover:underline font-medium">
                    SARFAESI Auctions Explained →
                  </Link>
                </li>
                <li>
                  <Link href="/learn/e-auction-participation" className="text-emerald-700 hover:underline font-medium">
                    E-Auction Participation Guide →
                  </Link>
                </li>
                <li>
                  <Link href="/learn/property-evaluation" className="text-emerald-700 hover:underline font-medium">
                    How to Evaluate a Property →
                  </Link>
                </li>
              </ul>
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
