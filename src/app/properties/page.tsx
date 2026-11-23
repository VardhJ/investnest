'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Property } from '@/types';

const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow'];
const PROPERTY_TYPES = ['residential', 'commercial', 'industrial', 'land', 'vehicle'];
const BANKS = ['SBI', 'PNB', 'HDFC', 'ICICI', 'Axis', 'Bank of Baroda', 'Canara Bank', 'Union Bank'];

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [bank, setBank] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('auction_date');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchProperties();
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold mb-2">Bank-Seized Properties (SARFAESI Auctions)</h1>
          <p className="text-gray-600">Properties sold by banks at 15-30% below market value</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              placeholder="Search by location, bank, or property type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <select value={city} onChange={(e) => { setCity(e.target.value); setPage(1); }} className="px-4 py-2 border rounded-lg">
              <option value="">All Cities</option>
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={propertyType} onChange={(e) => { setPropertyType(e.target.value); setPage(1); }} className="px-4 py-2 border rounded-lg">
              <option value="">All Types</option>
              {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
            <select value={bank} onChange={(e) => { setBank(e.target.value); setPage(1); }} className="px-4 py-2 border rounded-lg">
              <option value="">All Banks</option>
              {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
              Search
            </button>
          </form>

          {/* Advanced Filters */}
          <div className="flex flex-wrap gap-3 mt-3">
            <input
              type="number"
              placeholder="Min Price (₹)"
              value={minPrice}
              onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
              className="px-3 py-1.5 border rounded text-sm w-32"
            />
            <input
              type="number"
              placeholder="Max Price (₹)"
              value={maxPrice}
              onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
              className="px-3 py-1.5 border rounded text-sm w-32"
            />
            <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); setPage(1); }} className="px-3 py-1.5 border rounded text-sm">
              <option value="auction_date">Sort: Auction Date</option>
              <option value="price">Sort: Price (Low to High)</option>
              <option value="discount">Sort: Highest Discount</option>
            </select>
            {(city || propertyType || bank || minPrice || maxPrice || search) && (
              <button
                onClick={() => { setSearch(''); setCity(''); setPropertyType(''); setBank(''); setMinPrice(''); setMaxPrice(''); setPage(1); }}
                className="px-3 py-1.5 text-sm text-red-600 hover:text-red-700"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Property Grid */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading properties...</p>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600 text-lg">No properties found. Try adjusting your filters.</p>
            <p className="text-gray-500 mt-2">New properties are added daily.</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map(property => (
                <Link key={property.id} href={`/properties/${property.id}`} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition border border-gray-100">
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    {property.photos && property.photos.length > 0 ? (
                      <img src={property.photos[0]} alt={property.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl">🏠</span>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900 line-clamp-1">{property.title}</h3>
                      {property.discount && (
                        <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">
                          {property.discount}% off
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-2">📍 {property.location}</p>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-lg font-bold text-blue-600">{formatPrice(property.reservePrice)}</div>
                        <div className="text-xs text-gray-500">Reserve Price</div>
                      </div>
                      {property.marketValue && (
                        <div className="text-right">
                          <div className="text-sm text-gray-500 line-through">{formatPrice(property.marketValue)}</div>
                          <div className="text-xs text-gray-500">Market Value</div>
                        </div>
                      )}
                    </div>
                    <div className="mt-3 flex justify-between text-xs text-gray-500">
                      <span>🏦 {property.bank}</span>
                      <span>📅 {property.auctionDate ? new Date(property.auctionDate).toLocaleDateString('en-IN') : 'TBA'}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 border rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2">Page {page}</span>
              <button
                onClick={() => setPage(page + 1)}
                className="px-4 py-2 border rounded-lg"
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