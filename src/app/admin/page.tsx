'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default function AdminPage() {
  const router = useRouter();
  const { user, loading, isAdmin, signIn, signInWithGoogle, signOut } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '', bank: '', branch: '', location: '', city: '', state: '',
    propertyType: 'residential', reservePrice: '', marketValue: '', discount: '',
    auctionDate: '', emd: '', description: '', sourceUrl: '',
    areaSqft: '', bedrooms: '', bathrooms: '', floor: '', totalFloors: '',
    parking: '', amenities: '', possessionStatus: '', constructionYear: '',
    facing: '', furnishing: '',
  });
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'loading'; message: string } | null>(null);

  // Redirect non-admins
  useEffect(() => {
    if (!loading && user && !isAdmin) {
      setAuthError('You do not have administrative privileges.');
    }
  }, [loading, user, isAdmin]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    const { error } = await signIn(email, password);
    if (error) setAuthError(error);
    setAuthLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: 'loading', message: 'Publishing auction record to database...' });

    try {
      const { data: { session } } = await (await import('@/lib/supabase')).supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          bank: formData.bank,
          branch: formData.branch,
          location: formData.location,
          city: formData.city,
          state: formData.state,
          property_type: formData.propertyType,
          reserve_price: parseInt(formData.reservePrice),
          market_value: formData.marketValue ? parseInt(formData.marketValue) : null,
          discount: formData.discount ? parseFloat(formData.discount) : null,
          auction_date: formData.auctionDate || null,
          emd: formData.emd ? parseInt(formData.emd) : null,
          description: formData.description,
          source_url: formData.sourceUrl || 'https://manual-entry',
          status: 'active',
          area_sqft: formData.areaSqft ? parseInt(formData.areaSqft) : null,
          bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
          bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
          floor: formData.floor || null,
          total_floors: formData.totalFloors ? parseInt(formData.totalFloors) : null,
          parking: formData.parking || null,
          amenities: formData.amenities ? formData.amenities.split(',').map(s => s.trim()) : [],
          possession_status: formData.possessionStatus || null,
          construction_year: formData.constructionYear ? parseInt(formData.constructionYear) : null,
          facing: formData.facing || null,
          furnishing: formData.furnishing || null,
        }),
      });

      if (res.ok) {
        setStatus({ type: 'success', message: 'Property record successfully published to active auction registry.' });
        setFormData({
          title: '', bank: '', branch: '', location: '', city: '', state: '',
          propertyType: 'residential', reservePrice: '', marketValue: '', discount: '',
          auctionDate: '', emd: '', description: '', sourceUrl: '',
          areaSqft: '', bedrooms: '', bathrooms: '', floor: '', totalFloors: '',
          parking: '', amenities: '', possessionStatus: '', constructionYear: '',
          facing: '', furnishing: '',
        });
      } else {
        const data = await res.json();
        setStatus({ type: 'error', message: data.error || 'Failed to save property record.' });
      }
    } catch (e: any) {
      setStatus({ type: 'error', message: e?.message || 'Network exception while saving.' });
    }
  };

  const inputClass = "w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 font-medium";

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="inline-block w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center py-16 px-4">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 w-full max-w-sm shadow-sm">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold text-slate-900">Administrator Portal</h1>
            <p className="text-xs text-slate-500 mt-1">Authorized site administration only</p>
          </div>

          <button
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 py-2.5 rounded-xl text-xs font-semibold hover:bg-slate-50 transition mb-4 shadow-xs"
          >
            Authenticate with Google
          </button>

          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Admin Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@investnest.in"
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={inputClass}
                required
              />
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
            >
              {authLoading ? 'Verifying...' : 'Sign In as Admin'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Not an admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center py-16 px-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 w-full max-w-sm text-center shadow-sm">
          <h1 className="text-lg font-bold text-slate-900 mb-2">Access Denied</h1>
          <p className="text-xs text-slate-500 mb-4">{authError || 'You do not have administrator permissions.'}</p>
          <button onClick={signOut} className="text-xs font-semibold text-emerald-700 hover:underline">
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Manual Auction Entry</h1>
            <p className="text-xs text-slate-500 mt-0.5">Authenticated: {user?.email}</p>
          </div>
          <button onClick={signOut} className="text-xs font-semibold text-slate-500 hover:text-rose-600 transition">
            Sign Out
          </button>
        </div>

        {status && (
          <div className={`mb-6 p-4 rounded-xl border text-xs font-semibold ${
            status.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : status.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-slate-100 border-slate-200 text-slate-700'
          }`}>
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-5 shadow-sm">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Property Title *
            </label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className={inputClass}
              placeholder="e.g. 2BHK Flat in Andheri West, Mumbai"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Bank Name *
              </label>
              <input
                name="bank"
                value={formData.bank}
                onChange={handleChange}
                required
                className={inputClass}
                placeholder="State Bank of India"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Branch
              </label>
              <input
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                className={inputClass}
                placeholder="Andheri West Branch"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Full Locality Address *
            </label>
            <input
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className={inputClass}
              placeholder="Flat 402, Sea Green Heights, Andheri West, Mumbai"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                City *
              </label>
              <input
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className={inputClass}
                placeholder="Mumbai"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                State *
              </label>
              <input
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
                className={inputClass}
                placeholder="Maharashtra"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Property Category *
              </label>
              <select
                name="propertyType"
                value={formData.propertyType}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="industrial">Industrial</option>
                <option value="land">Land</option>
                <option value="vehicle">Vehicle</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Reserve Price (₹) *
              </label>
              <input
                name="reservePrice"
                value={formData.reservePrice}
                onChange={handleChange}
                required
                type="number"
                className={inputClass}
                placeholder="8500000"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Estimated Market Value (₹)
              </label>
              <input
                name="marketValue"
                value={formData.marketValue}
                onChange={handleChange}
                type="number"
                className={inputClass}
                placeholder="12000000"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Discount Percentage (%)
              </label>
              <input
                name="discount"
                value={formData.discount}
                onChange={handleChange}
                type="number"
                step="0.01"
                className={inputClass}
                placeholder="29.17"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Earnest Money Deposit EMD (₹)
              </label>
              <input
                name="emd"
                value={formData.emd}
                onChange={handleChange}
                type="number"
                className={inputClass}
                placeholder="850000"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Scheduled Auction Date
            </label>
            <input
              name="auctionDate"
              value={formData.auctionDate}
              onChange={handleChange}
              type="datetime-local"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Notice Description / Encumbrance Remarks
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={inputClass}
              rows={3}
              placeholder="Paste official auction notice text..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Original Bank Portal / Notice Source URL
            </label>
            <input
              name="sourceUrl"
              value={formData.sourceUrl}
              onChange={handleChange}
              className={inputClass}
              placeholder="https://www.ibapi.in/..."
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-sm"
          >
            Publish Auction Property Notice
          </button>
        </form>
      </div>
    </div>
  );
}
