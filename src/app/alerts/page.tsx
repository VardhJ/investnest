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
    if (!price) return 'Any';
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
          <p className="text-gray-600 mb-4">Please sign in to manage your alerts.</p>
          <Link href="/login" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition inline-block">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const inputClass = "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 bg-white";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Property Alerts</h1>
            <p className="text-gray-600">Get notified when new properties match your criteria</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            {showForm ? 'Cancel' : '+ New Alert'}
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Create New Alert</h2>
            <form onSubmit={createAlert} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <select value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className={inputClass}>
                    <option value="">Any City</option>
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                  <select value={formData.property_type} onChange={(e) => setFormData({ ...formData, property_type: e.target.value })} className={inputClass}>
                    <option value="">Any Type</option>
                    {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Price (₹)</label>
                  <input type="number" value={formData.max_price} onChange={(e) => setFormData({ ...formData, max_price: e.target.value })} className={inputClass} placeholder="e.g., 10000000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Discount (%)</label>
                  <input type="number" value={formData.min_discount} onChange={(e) => setFormData({ ...formData, min_discount: e.target.value })} className={inputClass} placeholder="e.g., 20" step="0.01" />
                </div>
              </div>
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
                Create Alert
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600 text-lg">No alerts set up yet.</p>
            <p className="text-gray-500 mt-2">Create an alert to get notified about new properties.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className={`bg-white rounded-xl shadow-sm p-6 border ${alert.is_active ? 'border-green-200' : 'border-gray-200 opacity-60'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`w-2 h-2 rounded-full ${alert.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                      <span className="font-semibold">{alert.is_active ? 'Active' : 'Paused'}</span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      {alert.city && <div>City: {alert.city}</div>}
                      {alert.property_type && <div>Type: {alert.property_type}</div>}
                      {alert.max_price && <div>Max Price: {formatPrice(alert.max_price)}</div>}
                      {alert.min_discount && <div>Min Discount: {alert.min_discount}%</div>}
                      {!alert.city && !alert.property_type && !alert.max_price && !alert.min_discount && <div>All properties</div>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleAlert(alert.id, alert.is_active)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {alert.is_active ? 'Pause' : 'Resume'}
                    </button>
                    <button
                      onClick={() => deleteAlert(alert.id)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}