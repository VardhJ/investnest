'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Property } from '@/types';

const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow'];
const PROPERTY_TYPES = ['residential', 'commercial', 'industrial', 'land', 'vehicle'];
const BANKS = ['SBI', 'PNB', 'HDFC', 'ICICI', 'Axis', 'Bank of Baroda', 'Canara Bank', 'Union Bank'];

function PropertiesPageContent() {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState(searchParams?.get('city') || '');
  const [propertyType, setPropertyType] = useState('');
  const [bank, setBank] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('auction_date');
  const [page, setPage] = useState(1);
  const [showNewOnly, setShowNewOnly] = useState(false);

  useEffect(() => {
    const cityParam = searchParams?.get('city');
    if (cityParam && cityParam !== city) {
      setCity(cityParam);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchProperties();
  }, [city, propertyType, bank, minPrice, maxPrice, sortBy, page]);

  // Track search/filter events
  useEffect(() => {
    if (city || propertyType || bank || minPrice || maxPrice || search) {
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
  }, [city, propertyType, bank, minPrice, maxPrice, sortBy, page]);

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
                Bank-Seized Property Auctions
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl">
                Distressed commercial, residential, and industrial assets auctioned by Indian scheduled banks at 15-30% below market valuations.
              </p>
            </div>
            <div className="text-sm text-slate-500 font-medium">
              Showing active e-auctions across India
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
                  onChange={(e) => { setCity(e.target.value); setPage(1); }}
                  className="px-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 font-medium text-slate-700"
                >
                  <option value="">All Cities</option>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                <select
                  value={propertyType}
                  onChange={(e) => { setPropertyType(e.target.value); setPage(1); }}
                  className="px-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 font-medium text-slate-700"
                >
                  <option value="">All Asset Types</option>
                  {PROPERTY_TYPES.map(t => (
                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>

                <select
                  value={bank}
                  onChange={(e) => { setBank(e.target.value); setPage(1); }}
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
                onClick={() => { setShowNewOnly(!showNewOnly); setPage(1); }}
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
                  onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                  className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg w-28 text-slate-700 font-medium placeholder:text-slate-400"
                />
                <input
                  type="number"
                  placeholder="Max Price (₹)"
                  value={maxPrice}
                  onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                  className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg w-28 text-slate-700 font-medium placeholder:text-slate-400"
                />

                <select
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <div className="py-24 text-center">
            <div className="inline-block w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm font-semibold text-slate-600">Retrieving verified bank auction notices...</p>
          </div>
        ) : properties.length === 0 ? (
          <div className="py-20 text-center max-w-md mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-slate-900">No properties matched this criteria</h3>
            <p className="mt-1 text-xs text-slate-500">
              Try broadening your city or price filters. New bank auctions are synced daily from official notice portals.
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="mt-4 px-4 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition"
              >
                Clear all filters
              </button>
            )}
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
                  <div>
                    {/* Image / Header Visual */}
                    <div className="relative h-48 bg-slate-100 flex items-center justify-center overflow-hidden">
                      {property.photos && property.photos.length > 0 ? (
                        <img
                          src={property.photos[0]}
                          alt={property.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-slate-400">
                          <svg className="w-10 h-10 mb-1 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                            Verified SARFAESI Record
                          </span>
                        </div>
                      )}

                      {/* New Badge */}
                      {property.firstSeenAt && (Date.now() - new Date(property.firstSeenAt).getTime()) < 7 * 24 * 60 * 60 * 1000 && (
                        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-500 text-white shadow-sm z-10">
                          NEW
                        </div>
                      )}

                      {/* Discount Badge */}
                      {property.discount && property.discount > 0 && (
                        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-500 text-white shadow-sm z-10">
                          {property.discount}% Below Market
                        </div>
                      )}

                      {/* Property Type Badge */}
                      <div className="absolute top-12 left-3 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/90 text-slate-800 backdrop-blur-xs z-10">
                        {property.propertyType}
                      </div>

                      {/* Bank Badge */}
                      <div className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-900/80 text-white backdrop-blur-xs z-10">
                        {property.bank}
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-5">
                      <h3 className="font-bold text-slate-900 text-base line-clamp-1 group-hover:text-emerald-700 transition-colors">
                        {property.title}
                      </h3>

                      {/* Location with Pin SVG */}
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 font-medium line-clamp-1">
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
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-xs font-semibold border border-slate-200 rounded-xl bg-white text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition"
              >
                Previous
              </button>
              <span className="text-xs font-bold text-slate-600 px-3 py-2 bg-slate-100 rounded-xl">
                Page {page}
              </span>
              <button
                onClick={() => setPage(page + 1)}
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

export default function PropertiesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <PropertiesPageContent />
    </Suspense>
  );
}
