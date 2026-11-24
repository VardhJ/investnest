'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { trackEvent } from '@/lib/analytics';

export default function WatchlistPage() {
  const { user, loading: authLoading } = useAuth();
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchWatchlist();
  }, [user]);

  const fetchWatchlist = async () => {
    try {
      const { data: { session } } = await (await import('@/lib/supabase')).supabase.auth.getSession();
      const token = session?.access_token;
      const res = await fetch('/api/watchlist', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setWatchlist(data.watchlist || []);
    } catch (e) {
      console.error('Failed to fetch watchlist:', e);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWatchlist = async (propertyId: string) => {
    try {
      const { data: { session } } = await (await import('@/lib/supabase')).supabase.auth.getSession();
      const token = session?.access_token;
      await fetch(`/api/watchlist?property_id=${propertyId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setWatchlist(watchlist.filter(w => w.property_id !== propertyId));
      trackEvent('property_removed_from_watchlist', { property_id: propertyId });
    } catch (e) {
      console.error('Failed to remove:', e);
    }
  };

  const formatPrice = (price: number | undefined | null) => {
    if (!price) return 'N/A';
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
    return `₹${price.toLocaleString('en-IN')}`;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
          <p className="text-gray-600 mb-4">Please sign in to view your watchlist.</p>
          <Link href="/login" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition inline-block">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold mb-2">My Watchlist</h1>
          <p className="text-gray-600">{watchlist.length} saved properties</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : watchlist.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600 text-lg">No properties saved yet.</p>
            <p className="text-gray-500 mt-2">Browse properties and click "Add to Watchlist" to save them here.</p>
            <Link href="/properties" className="text-blue-600 font-semibold hover:underline mt-4 inline-block">
              Browse Properties →
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {watchlist.map((item) => {
              const prop = item.properties;
              if (!prop) return null;
              return (
                <div key={item.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    <span className="text-4xl">🏠</span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 line-clamp-1">{prop.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">📍 {prop.location}</p>
                    <div className="flex justify-between items-center">
                      <div className="text-lg font-bold text-blue-600">{formatPrice(prop.reserve_price)}</div>
                      {prop.discount && (
                        <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">
                          {prop.discount}% off
                        </span>
                      )}
                    </div>
                    <div className="mt-3 flex justify-between">
                      <Link href={`/properties/${prop.id}`} className="text-blue-600 text-sm hover:underline">
                        View Details →
                      </Link>
                      <button
                        onClick={() => removeFromWatchlist(prop.id)}
                        className="text-red-600 text-sm hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}