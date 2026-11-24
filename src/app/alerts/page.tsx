'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';

const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow'];
const PROPERTY_TYPES = ['residential', 'commercial', 'industrial', 'land', 'vehicle'];

export default function AlertsPage() {
  const { user, loading: authLoading } = useAuth();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    city: '',
    property_type: '',
    max_price: '',
    min_discount: '',
  });

  useEffect(() => {
    if (!user) return;
    fetchAlerts();
  }, [user]);

  const fetchAlerts = async () => {
    try {
      const { data: { session } } = await (await import('@/lib/supabase')).supabase.auth.getSession();
      const token = session?.access_token;
      const res = await fetch('/api/alerts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAlerts(data.alerts || []);
    } catch (e) {
      console.error('Failed to fetch alerts:', e);
    } finally {
      setLoading(false);
    }
  };

  const createAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { session } } = await (await import('@/lib/supabase')).supabase.auth.getSession();
      const token = session?.access_token;
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          city: formData.city || null,
          property_type: formData.property_type || null,
          max_price: formData.max_price ? parseInt(formData.max_price) : null,
          min_discount: formData.min_discount ? parseFloat(formData.min_discount) : null,
        }),
      });
      if (res.ok) {
        setShowForm(false);
        setFormData({ city: '', property_type: '', max_price: '', min_discount: '' });
        fetchAlerts();
      }
    } catch (e) {
      console.error('Failed to create alert:', e);
    }
  };

  const deleteAlert = async (id: string) => {
    try {
      const { data: { session } } = await (await import('@/lib/supabase')).supabase.auth.getSession();
      const token = session?.access_token;
      await fetch(`/api/alerts?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlerts(alerts.filter(a => a.id !== id));
    } catch (e) {
      console.error('Failed to delete alert:', e);
    }
  };

  const toggleAlert = async (id: string, isActive: boolean) => {
    try {
      const { data: { session } } = await (await import('@/lib/supabase')).supabase.auth.getSession();
      const token = session?.access_token;
      await fetch('/api/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id, is_active: !isActive }),
      });
      setAlerts(alerts.map(a => a.id === id ? { ...a, is_active: !isActive } : a));
    } catch (e) {
      console.error('Failed to toggle alert:', e);
    }
  };

  const formatPrice = (price: number | undefined | null) => {
    if (!price) return 'Any Price';
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Sign In for Auction Alerts</h1>
          <p className="text-xs text-slate-500 mb-6">
            Get instant notifications when new bank auction properties match your target city and budget.
          </p>
          <Link
            href="/login"
            className="w-full inline-block py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition"
          >
            Sign In to Manage Alerts
          </Link>
        </div>
      </div>
    );
  }

  const inputClass = "w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 font-medium";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Auction Notification Triggers
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Receive updates when new bank properties meet your city and minimum discount criteria
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm shrink-0"
          >
            {showForm ? 'Close Form' : '+ Create New Trigger'}
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {showForm && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 mb-8 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Set Up New Auction Alert
            </h2>
            <form onSubmit={createAlert} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Target City
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className={inputClass}
                  >
                    <option value="">Any City across India</option>
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Asset Type
                  </label>
                  <select
                    value={formData.property_type}
                    onChange={(e) => setFormData({ ...formData, property_type: e.target.value })}
                    className={inputClass}
                  >
                    <option value="">Any Asset Category</option>
                    {PROPERTY_TYPES.map(t => (
                      <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Maximum Reserve Price (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.max_price}
                    onChange={(e) => setFormData({ ...formData, max_price: e.target.value })}
                    className={inputClass}
                    placeholder="e.g. 10000000"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Minimum Discount (%)
                  </label>
                  <input
                    type="number"
                    value={formData.min_discount}
                    onChange={(e) => setFormData({ ...formData, min_discount: e.target.value })}
                    className={inputClass}
                    placeholder="e.g. 20"
                    step="0.1"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                >
                  Save Trigger
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs text-slate-500">Checking your notification rules...</p>
          </div>
        ) : alerts.length === 0 ? (
          <div className="py-20 text-center max-w-sm mx-auto">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-slate-900">No active alert triggers</h3>
            <p className="mt-1 text-xs text-slate-500">
              Create a trigger above to automatically monitor new bank listings matching your preferred city and budget.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`bg-white rounded-2xl border p-5 shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  alert.is_active ? 'border-emerald-200' : 'border-slate-200 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`w-2 h-2 rounded-full ${alert.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      {alert.is_active ? 'Active Monitoring' : 'Paused'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 font-medium">
                    <div>
                      City: <span className="font-semibold text-slate-900">{alert.city || 'All Cities'}</span>
                    </div>
                    <div>
                      Type: <span className="font-semibold text-slate-900 capitalize">{alert.property_type || 'All Types'}</span>
                    </div>
                    <div>
                      Max Budget: <span className="font-semibold text-slate-900">{formatPrice(alert.max_price)}</span>
                    </div>
                    {alert.min_discount && (
                      <div>
                        Min Discount: <span className="font-semibold text-emerald-700">{alert.min_discount}%</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <button
                    onClick={() => toggleAlert(alert.id, alert.is_active)}
                    className="text-xs font-semibold text-emerald-700 hover:underline"
                  >
                    {alert.is_active ? 'Pause' : 'Activate'}
                  </button>
                  <span className="text-slate-200">•</span>
                  <button
                    onClick={() => deleteAlert(alert.id)}
                    className="text-xs font-semibold text-rose-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
