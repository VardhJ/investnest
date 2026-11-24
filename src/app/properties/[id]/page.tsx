'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';

export default function PropertyDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params?.id) {
      fetch(`/api/properties/${params.id}`)
        .then(res => res.json())
        .then(data => {
          setProperty(data.property);
          if (data.property) {
            import('@/lib/analytics').then(({ trackEvent }) => {
              trackEvent('property_viewed', {
                property_id: data.property.id,
                city: data.property.city,
                bank: data.property.bank,
                price: data.property.reservePrice,
                property_type: data.property.propertyType,
                discount: data.property.discount,
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Property Not Found</h1>
          <Link href="/properties" className="text-blue-600 hover:underline">← Back to Properties</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/properties" className="text-blue-600 hover:underline mb-4 inline-block">← Back to Properties</Link>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="h-64 bg-gray-200 flex items-center justify-center">
            {property.photos && property.photos.length > 0 ? (
              <img src={property.photos[0]} alt={property.title} className="w-full h-full object-cover" />
            ) : (
              <span className="text-6xl">🏠</span>
            )}
          </div>
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-2xl font-bold">{property.title}</h1>
              {property.discount && (
                <span className="bg-green-100 text-green-700 text-sm font-bold px-3 py-1 rounded-full">
                  {property.discount}% below market value
                </span>
              )}
            </div>
            <p className="text-gray-600 mb-4">📍 {property.location}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">Reserve Price</div>
                <div className="text-xl font-bold text-blue-600">{formatPrice(property.reservePrice)}</div>
              </div>
              {property.marketValue && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600">Market Value</div>
                  <div className="text-xl font-bold text-gray-700">{formatPrice(property.marketValue)}</div>
                </div>
              )}
              {property.emd && (
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600">EMD Required</div>
                  <div className="text-xl font-bold text-yellow-700">{formatPrice(property.emd)}</div>
                </div>
              )}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">Auction Date</div>
                <div className="text-lg font-bold text-gray-700">
                  {property.auctionDate ? new Date(property.auctionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBA'}
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h2 className="text-lg font-semibold mb-3">Property Details</h2>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Bank</dt>
                    <dd className="font-medium">{property.bank}</dd>
                  </div>
                  {property.branch && (
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Branch</dt>
                      <dd className="font-medium">{property.branch}</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-gray-600">City</dt>
                    <dd className="font-medium">{property.city}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">State</dt>
                    <dd className="font-medium">{property.state}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Type</dt>
                    <dd className="font-medium capitalize">{property.propertyType}</dd>
                  </div>
                  {property.areaSqft && (
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Area</dt>
                      <dd className="font-medium">{property.areaSqft} sq ft</dd>
                    </div>
                  )}
                  {property.bedrooms && (
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Bedrooms</dt>
                      <dd className="font-medium">{property.bedrooms} BHK</dd>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Bathrooms</dt>
                      <dd className="font-medium">{property.bathrooms}</dd>
                    </div>
                  )}
                  {property.floor && (
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Floor</dt>
                      <dd className="font-medium">{property.floor}{property.totalFloors ? ` of ${property.totalFloors}` : ''}</dd>
                    </div>
                  )}
                  {property.parking && (
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Parking</dt>
                      <dd className="font-medium">{property.parking}</dd>
                    </div>
                  )}
                  {property.furnishing && (
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Furnishing</dt>
                      <dd className="font-medium capitalize">{property.furnishing.replace('-', ' ')}</dd>
                    </div>
                  )}
                  {property.possessionStatus && (
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Possession</dt>
                      <dd className="font-medium capitalize">{property.possessionStatus.replace('-', ' ')}</dd>
                    </div>
                  )}
                  {property.constructionYear && (
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Built Year</dt>
                      <dd className="font-medium">{property.constructionYear}</dd>
                    </div>
                  )}
                  {property.facing && (
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Facing</dt>
                      <dd className="font-medium">{property.facing}</dd>
                    </div>
                  )}
                </dl>
              </div>
              <div>
                <h2 className="text-lg font-semibold mb-3">Investment Analysis</h2>
                <dl className="space-y-2 text-sm">
                  {property.marketValue && property.reservePrice && (
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Potential Profit</dt>
                      <dd className="font-medium text-green-600">{formatPrice(property.marketValue - property.reservePrice)}</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Rental Yield (est.)</dt>
                    <dd className="font-medium">2-4% (residential)</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Break-even</dt>
                    <dd className="font-medium">5-7 years</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Risk Level</dt>
                    <dd className="font-medium text-orange-600">Medium-High</dd>
                  </div>
                </dl>
              </div>
            </div>

            {property.amenities && property.amenities.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Amenities</h2>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((amenity: string, i: number) => (
                    <span key={i} className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {property.description && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Description</h2>
                <p className="text-gray-700 text-sm">{property.description}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={property.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition text-center"
              >
                View on Bank Portal →
              </a>
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
                        alert('Added to watchlist!');
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
                  className="border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
                >
                  Add to Watchlist
                </button>
              )}
              <Link href="/watchlist" className="border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition text-center">
                My Watchlist
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
          <strong>Disclaimer:</strong> This information is for educational purposes only. Always conduct your own due diligence before participating in any auction.
          Verify property title, encumbrances, and physical condition independently. Reserve prices may not reflect final sale price.
        </div>
      </div>
    </div>
  );
}