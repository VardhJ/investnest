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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="inline-block w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center py-16 px-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-sm shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Authentication Required</h1>
          <p className="text-xs text-slate-500 mb-6">
            Sign in to your InvestNest account to track saved bank auction properties.
          </p>
          <Link
            href="/login"
            className="w-full inline-block py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition"
          >
            Sign In to Continue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Saved Auction Watchlist
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {watchlist.length} properties saved for tracking and bidding preparation
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs text-slate-500">Loading your saved properties...</p>
          </div>
        ) : watchlist.length === 0 ? (
          <div className="py-20 text-center max-w-sm mx-auto">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-slate-900">No properties bookmarked yet</h3>
            <p className="mt-1 text-xs text-slate-500">
              Browse current bank auction listings and click "Save to Watchlist" on any detail page to keep track here.
            </p>
            <Link
              href="/properties"
              className="mt-4 inline-block px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition"
            >
              Browse Auction Properties
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {watchlist.map((item) => {
              const prop = item.properties;
              if (!prop) return null;
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold text-slate-900 text-base line-clamp-1">{prop.title}</h3>
                      {prop.discount && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500 text-white shrink-0">
                          {prop.discount}% off
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-4">
                      <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="truncate">{prop.location}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-400">Reserve Price</div>
                        <div className="text-base font-extrabold text-emerald-700">
                          {formatPrice(prop.reserve_price)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs">
                    <Link
                      href={`/properties/${prop.id}`}
                      className="font-semibold text-emerald-700 hover:underline"
                    >
                      View Dossier →
                    </Link>
                    <button
                      onClick={() => removeFromWatchlist(prop.id)}
                      className="text-slate-400 hover:text-rose-600 font-medium transition"
                    >
                      Remove
                    </button>
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
