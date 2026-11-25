'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Activity {
  type: 'new' | 'sold' | 'price_change';
  icon: string;
  title: string;
  bank: string;
  city: string;
  state: string;
  price: number;
  oldPrice?: number;
  date: string;
  label: string;
  color: string;
}

const colorClasses: Record<string, string> = {
  emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  slate: 'bg-slate-50 border-slate-200 text-slate-700',
  amber: 'bg-amber-50 border-amber-200 text-amber-700',
};

const formatPrice = (price: number) => {
  if (!price) return 'N/A';
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
  return `₹${price.toLocaleString('en-IN')}`;
};

const timeAgo = (date: string) => {
  if (!date) return '';
  const now = new Date();
  const then = new Date(date);
  const diff = now.getTime() - then.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return 'Just now';
};

export default function ActivityFeed({ limit = 10 }: { limit?: number }) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ newCount: 0, soldCount: 0, priceChangeCount: 0 });

  useEffect(() => {
    fetch(`/api/activity?limit=${limit}`)
      .then(res => res.json())
      .then(data => {
        setActivities(data.activities || []);
        setStats({
          newCount: data.newCount || 0,
          soldCount: data.soldCount || 0,
          priceChangeCount: data.priceChangeCount || 0,
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [limit]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-4 border border-slate-200/80 animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-slate-100 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <p>No recent activity. Check back tomorrow!</p>
      </div>
    );
  }

  return (
    <div>
      {/* Stats Bar */}
      <div className="flex flex-wrap gap-3 mb-6">
        {stats.newCount > 0 && (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
            🆕 {stats.newCount} New
          </span>
        )}
        {stats.soldCount > 0 && (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            ✅ {stats.soldCount} Likely Sold
          </span>
        )}
        {stats.priceChangeCount > 0 && (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
            📊 {stats.priceChangeCount} Price Changes
          </span>
        )}
      </div>

      {/* Activity Items */}
      <div className="space-y-3">
        {activities.map((activity, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 p-4 rounded-xl border ${colorClasses[activity.color]} transition-all hover:shadow-sm`}
          >
            <span className="text-xl shrink-0">{activity.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider">{activity.label}</span>
                <span className="text-xs text-slate-400">{timeAgo(activity.date)}</span>
              </div>
              <div className="text-sm font-semibold text-slate-900 line-clamp-1">{activity.title}</div>
              <div className="text-xs text-slate-500 mt-0.5">
                {activity.bank} • {activity.city}, {activity.state}
              </div>
              <div className="text-sm font-bold text-slate-900 mt-1">
                {formatPrice(activity.price)}
                {activity.oldPrice && activity.oldPrice !== activity.price && (
                  <span className="text-xs text-slate-400 line-through ml-2">
                    {formatPrice(activity.oldPrice)}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}