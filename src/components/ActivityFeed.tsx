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

const labelColors: Record<string, string> = {
  emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  slate: 'bg-slate-100 text-slate-700 border-slate-200',
  amber: 'bg-amber-100 text-amber-700 border-amber-200',
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

export default function ActivityFeed({ limit = 4 }: { limit?: number }) {
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200/80 p-5 animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-3/4 mb-3"></div>
            <div className="h-3 bg-slate-100 rounded w-1/2 mb-2"></div>
            <div className="h-5 bg-slate-100 rounded w-1/3"></div>
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
      <div className="flex flex-wrap gap-2 mb-6">
        {stats.newCount > 0 && (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
            New {stats.newCount}
          </span>
        )}
        {stats.soldCount > 0 && (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            Likely Sold {stats.soldCount}
          </span>
        )}
        {stats.priceChangeCount > 0 && (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
            Price Changes {stats.priceChangeCount}
          </span>
        )}
      </div>

      {/* Activity Items - Grid matching property cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {activities.map((activity, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col"
          >
            {/* Label */}
            <div className="flex items-center justify-between mb-3">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${labelColors[activity.color]}`}>
                {activity.label}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">{timeAgo(activity.date)}</span>
            </div>

            {/* Title */}
            <h3 className="font-bold text-slate-900 text-sm mb-2 line-clamp-2 flex-1">
              {activity.title}
            </h3>

            {/* Bank & Location */}
            <div className="text-xs text-slate-500 mb-3">
              {activity.bank} • {activity.city}
            </div>

            {/* Price */}
            <div className="flex items-center justify-between">
              <span className="text-lg font-extrabold text-slate-900">
                {formatPrice(activity.price)}
              </span>
              {activity.oldPrice && activity.oldPrice !== activity.price && (
                <span className="text-xs text-slate-400 line-through">
                  {formatPrice(activity.oldPrice)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}