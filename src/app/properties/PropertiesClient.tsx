'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Property } from '@/types';
import QuickAlertBox from '@/components/QuickAlertBox';

const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow'];
const PROPERTY_TYPES = ['residential', 'commercial', 'industrial', 'land', 'vehicle'];
const BANKS = ['SBI', 'PNB', 'HDFC', 'ICICI', 'Axis', 'Bank of Baroda', 'Canara Bank', 'Union Bank'];

interface Props {
  initialProperties?: Property[];
  initialCity?: string;
  initialBank?: string;
}

export default function PropertiesClient({ initialProperties = [], initialCity = '', initialBank = '' }: Props) {
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [loading, setLoading] = useState(initialProperties.length === 0);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState(initialCity);
  const [propertyType, setPropertyType] = useState('');
  const [bank, setBank] = useState(initialBank);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('auction_date');
  const [page, setPage] = useState(1);
  const [showNewOnly, setShowNewOnly] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const cityParam = urlParams.get('city');
      if (cityParam && cityParam !== city) {
        setCity(cityParam);
        setHasUserInteracted(true);
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Only refetch on mount if no initial properties were passed, or if the user changed filters
    if (hasUserInteracted || initialProperties.length === 0) {
      fetchProperties();
    }
  }, [city, propertyType, bank, minPrice, maxPrice, sortBy, page, showNewOnly]);

  // Track search/filter events
  useEffect(() => {
    if (hasUserInteracted && (city || propertyType || bank || minPrice || maxPrice || search)) {
      import('@/lib/analytics').then(({ trackEvent }) => {
        trackEvent('property_searched', {
          city: city || 'all',
          property_type: propertyType || 'all',
          bank: bank || 'all',
          min_price: minPrice || null,
          max_price: maxPrice || null,
          sort_by: sortBy,
          page: page,
        });
      });
    }
  }, [city, propertyType, bank, minPrice, maxPrice, sortBy, page, hasUserInteracted]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (city) params.set('city', city);
      if (propertyType) params.set('type', propertyType);
      if (bank) params.set('bank', bank);
      if (minPrice) params.set('minPrice', minPrice);
      if (maxPrice) params.set('maxPrice', maxPrice);
      if (showNewOnly) params.set('newOnly', 'true');
      params.set('sortBy', sortBy);
      params.set('page', page.toString());

      const res = await fetch(`/api/properties?${params}`);
      const data = await res.json();
      setProperties(data.properties || []);
    } catch (e) {
      console.error('Failed to fetch properties:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasUserInteracted(true);
    setPage(1);
    fetchProperties();
  };

  const formatPrice = (price: number | undefined | null) => {
    if (!price) return 'N/A';
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const hasActiveFilters = Boolean(city || propertyType || bank || minPrice || maxPrice || search || showNewOnly);

  const clearAllFilters = () => {
    setHasUserInteracted(true);
    setSearch('');
    setCity('');
    setPropertyType('');
    setBank('');
    setMinPrice('');
    setMaxPrice('');
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider mb-2">
                <span>SARFAESI Public Auctions</span>
                <span>•</span>
                <span>Updated Daily</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                {city
                  ? `Bank-Seized Property Auctions in ${city}`
                  : bank
                  ? `${bank} SARFAESI Property Auctions`
                  : 'Bank-Seized Property Auctions'}
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl">
                Distressed commercial, residential, and industrial assets auctioned by Indian scheduled banks at 15-30% below market valuations.
              </p>
            </div>
            <div className="flex flex-col sm:items-end gap-2">
              <Link
                href="/analytics"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition"
              >
                <span>Bank & City Auction Analytics</span>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </Link>
              <div className="text-xs text-slate-500 font-medium">
                Showing active e-auctions across India
              </div>
            </div>
          </div>

          {/* Programmatic Hub Sub-Navigation Links for SEO & Hierarchy */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-slate-400 uppercase tracking-wider mr-1">Top Cities:</span>
              {CITIES.map((c) => (
                <Link
                  key={c}
                  href={`/properties/city/${c.toLowerCase()}`}
                  className={`px-2.5 py-1 rounded-lg font-semibold border transition ${
                    city.toLowerCase() === c.toLowerCase()
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-emerald-300 hover:text-emerald-700'
                  }`}
                >
                  {c}
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-slate-400 uppercase tracking-wider mr-1">By Bank:</span>
              {[
                { slug: 'sbi', label: 'SBI' },
                { slug: 'pnb', label: 'PNB' },
                { slug: 'union-bank', label: 'Union Bank' },
                { slug: 'bank-of-baroda', label: 'BoB' },
                { slug: 'canara-bank', label: 'Canara' },
                { slug: 'hdfc', label: 'HDFC' },
              ].map((b) => (
                <Link
                  key={b.slug}
                  href={`/properties/bank/${b.slug}`}
                  className="px-2.5 py-1 rounded-lg font-semibold bg-blue-50/70 text-blue-800 border border-blue-200/70 hover:bg-blue-100 transition"
                >
                  {b.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <form onSubmit={handleSearch} className="space-y-3">
            {/* Top search input row */}
            <div className="flex flex-col md:flex-row gap-2.5">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by locality, city, bank name, or asset title..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  maxLength={100}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder:text-slate-400 font-medium"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <select
                  value={city}
                  onChange={(e) => { setCity(e.target.value); setPage(1); setHasUserInteracted(true); }}
                  className="px-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 font-medium text-slate-700"
                >
                  <option value="">All Cities</option>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                <select
                  value={propertyType}
                  onChange={(e) => { setPropertyType(e.target.value); setPage(1); setHasUserInteracted(true); }}
                  className="px-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 font-medium text-slate-700"
                >
                  <option value="">All Asset Types</option>
                  {PROPERTY_TYPES.map(t => (
                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>

                <select
                  value={bank}
                  onChange={(e) => { setBank(e.target.value); setPage(1); setHasUserInteracted(true); }}
                  className="px-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 font-medium text-slate-700"
                >
                  <option value="">All Banks</option>
                  {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-xs"
              >
                Apply Filters
              </button>
              <button
                type="button"
                onClick={() => { setShowNewOnly(!showNewOnly); setPage(1); setHasUserInteracted(true); }}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-xs border ${
                  showNewOnly
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {showNewOnly ? ' New (7 days)' : 'New (7 days)'}
              </button>
            </div>

            {/* Secondary filter chips & price range */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="number"
                  placeholder="Min Price (₹)"
                  value={minPrice}
                  onChange={(e) => { setMinPrice(e.target.value); setPage(1); setHasUserInteracted(true); }}
                  className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg w-28 text-slate-700 font-medium placeholder:text-slate-400"
                />
                <input
                  type="number"
                  placeholder="Max Price (₹)"
                  value={maxPrice}
                  onChange={(e) => { setMaxPrice(e.target.value); setPage(1); setHasUserInteracted(true); }}
                  className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg w-28 text-slate-700 font-medium placeholder:text-slate-400"
                />

                <select
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value); setPage(1); setHasUserInteracted(true); }}
                  className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
                >
                  <option value="auction_date">Sort: Auction Date (Upcoming)</option>
                  <option value="price">Sort: Price (Low to High)</option>
                  <option value="discount">Sort: Highest Discount</option>
                </select>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline px-2 py-1"
                  >
                    Reset all filters
                  </button>
                )}
              </div>

              <div className="text-xs text-slate-500 font-medium">
                {properties.length} results available on this page
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Property Cards Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <QuickAlertBox
          defaultCity={city || 'All India'}
          defaultAssetType={propertyType || 'all'}
          title={
            city
              ? `Get ${city} Bank Auction Price-Drop & Re-Auction Alerts`
              : 'Get Instant Bank Auction Price-Drop & Re-Auction Alerts'
          }
          subtitle="When a bank's 1st auction receives no bids, the reserve price is typically reduced by 10-15% on re-listing. Subscribe to get instant alerts before the bidding window closes."
        />
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-1/3 mb-4" />
                <div className="h-6 bg-slate-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-slate-200 rounded w-1/2 mb-6" />
                <div className="h-10 bg-slate-100 rounded mb-4" />
                <div className="h-4 bg-slate-200 rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 max-w-lg mx-auto p-8">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">No property auctions found</h3>
            <p className="text-xs text-slate-500 mb-4">
              We couldn&apos;t find any assets matching your current filter criteria.
            </p>
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <Link
                  key={property.id}
                  href={`/properties/${property.id}`}
                  className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-600/5 transition-all flex flex-col justify-between"
                >
                  <div className="p-6">
                    {/* Tags row */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                          {property.propertyType}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200/60">
                          {property.bank}
                        </span>
                      </div>

                      {property.discount && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {property.discount}% OFF
                        </span>
                      )}
                    </div>

                    {/* Title & Location */}
                    <div>
                      <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
                        {property.title}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
                        <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{property.location}</span>
                      </div>

                      {/* Price Comparison Block */}
                      <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] uppercase font-bold text-slate-400">Reserve Price</div>
                          <div className="text-lg font-extrabold text-emerald-700">
                            {formatPrice(property.reservePrice)}
                          </div>
                        </div>

                        {property.marketValue && (
                          <div className="text-right">
                            <div className="text-[10px] uppercase font-bold text-slate-400">Market Value</div>
                            <div className="text-xs font-semibold text-slate-400 line-through">
                              {formatPrice(property.marketValue)}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500 font-medium">
                    <div className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>
                        Auction: {property.auctionDate ? new Date(property.auctionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'TBA'}
                      </span>
                    </div>

                    <span className="text-emerald-700 font-semibold group-hover:underline flex items-center gap-1">
                      <span>View Details</span>
                      <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="mt-12 flex items-center justify-center gap-3">
              <button
                onClick={() => { setPage(Math.max(1, page - 1)); setHasUserInteracted(true); }}
                disabled={page === 1}
                className="px-4 py-2 text-xs font-semibold border border-slate-200 rounded-xl bg-white text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition"
              >
                Previous
              </button>
              <span className="text-xs font-bold text-slate-600 px-3 py-2 bg-slate-100 rounded-xl">
                Page {page}
              </span>
              <button
                onClick={() => { setPage(page + 1); setHasUserInteracted(true); }}
                className="px-4 py-2 text-xs font-semibold border border-slate-200 rounded-xl bg-white text-slate-700 hover:bg-slate-50 transition"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
