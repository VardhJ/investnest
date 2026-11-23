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
  const [status, setStatus] = useState('');

  // Redirect non-admins
  useEffect(() => {
    if (!loading && user && !isAdmin) {
      setAuthError('You do not have admin access. Contact the site owner.');
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
    setStatus('Saving...');

    try {
      // Get the session token for API auth
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
        setStatus('✅ Property added successfully!');
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
        setStatus(`❌ Error: ${data.error || 'Failed to save'}`);
      }
    } catch (e) {
      setStatus(`❌ Error: ${e}`);
    }
  };

  const inputClass = "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 bg-white";

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm p-8 w-full max-w-sm">
          <h1 className="text-2xl font-bold mb-2 text-center">Admin Login</h1>
          <p className="text-gray-600 text-sm mb-6 text-center">Sign in with your admin account</p>

          <button
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition mb-4"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.19 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign in with Google
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"></div></div>
            <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">or</span></div>
          </div>

          <form onSubmit={handleSignIn} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
            {authError && <p className="text-red-600 text-sm">{authError}</p>}
            <button type="submit" disabled={authLoading} className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50">
              {authLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <a href="/" className="text-blue-600 text-sm hover:underline">← Back to Home</a>
          </div>
        </div>
      </div>
    );
  }

  // Logged in but not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm p-8 w-full max-w-sm text-center">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-gray-600 text-sm mb-4">{authError || 'You do not have admin access.'}</p>
          <p className="text-gray-500 text-xs mb-6">Logged in as: {user?.email}</p>
          <button onClick={signOut} className="text-blue-600 text-sm hover:underline">
            Sign out
          </button>
        </div>
      </div>
    );
  }

  // Admin dashboard
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Add Property (Admin)</h1>
            <p className="text-gray-600 text-sm">Logged in as: {user?.email}</p>
          </div>
          <button onClick={signOut} className="text-sm text-red-600 hover:underline">
            Sign out
          </button>
        </div>

        {status && (
          <div className={`mb-4 p-3 rounded-lg ${status.startsWith('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {status}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Property Title *</label>
            <input name="title" value={formData.title} onChange={handleChange} required className={inputClass} placeholder="2BHK Flat in Andheri West, Mumbai" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bank *</label>
              <input name="bank" value={formData.bank} onChange={handleChange} required className={inputClass} placeholder="State Bank of India" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
              <input name="branch" value={formData.branch} onChange={handleChange} className={inputClass} placeholder="Andheri West Branch" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
            <input name="location" value={formData.location} onChange={handleChange} required className={inputClass} placeholder="Andheri West, Mumbai, Maharashtra" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
              <input name="city" value={formData.city} onChange={handleChange} required className={inputClass} placeholder="Mumbai" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
              <input name="state" value={formData.state} onChange={handleChange} required className={inputClass} placeholder="Maharashtra" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Property Type *</label>
            <select name="propertyType" value={formData.propertyType} onChange={handleChange} className={inputClass}>
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
              <option value="industrial">Industrial</option>
              <option value="land">Land</option>
              <option value="vehicle">Vehicle</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reserve Price (₹) *</label>
              <input name="reservePrice" value={formData.reservePrice} onChange={handleChange} required type="number" className={inputClass} placeholder="8500000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Market Value (₹)</label>
              <input name="marketValue" value={formData.marketValue} onChange={handleChange} type="number" className={inputClass} placeholder="12000000" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
              <input name="discount" value={formData.discount} onChange={handleChange} type="number" step="0.01" className={inputClass} placeholder="29.17" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">EMD (₹)</label>
              <input name="emd" value={formData.emd} onChange={handleChange} type="number" className={inputClass} placeholder="850000" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Auction Date</label>
            <input name="auctionDate" value={formData.auctionDate} onChange={handleChange} type="datetime-local" className={inputClass} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} className={inputClass} rows={3} placeholder="Property details..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Source URL (bank portal link)</label>
            <input name="sourceUrl" value={formData.sourceUrl} onChange={handleChange} className={inputClass} placeholder="https://www.ibapi.in/..." />
          </div>

          <div className="border-t pt-4 mt-4">
            <h3 className="text-lg font-semibold mb-3">Property Details (Optional)</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Area (sq ft)</label>
              <input name="areaSqft" value={formData.areaSqft} onChange={handleChange} type="number" className={inputClass} placeholder="750" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
              <input name="bedrooms" value={formData.bedrooms} onChange={handleChange} type="number" className={inputClass} placeholder="2" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
              <input name="bathrooms" value={formData.bathrooms} onChange={handleChange} type="number" className={inputClass} placeholder="2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Floor</label>
              <input name="floor" value={formData.floor} onChange={handleChange} className={inputClass} placeholder="5th" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Floors</label>
              <input name="totalFloors" value={formData.totalFloors} onChange={handleChange} type="number" className={inputClass} placeholder="12" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parking</label>
              <input name="parking" value={formData.parking} onChange={handleChange} className={inputClass} placeholder="1 covered" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Possession Status</label>
              <select name="possessionStatus" value={formData.possessionStatus} onChange={handleChange} className={inputClass}>
                <option value="">Select</option>
                <option value="ready">Ready to Move</option>
                <option value="under-construction">Under Construction</option>
                <option value="occupied">Occupied</option>
                <option value="vacant">Vacant</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Furnishing</label>
              <select name="furnishing" value={formData.furnishing} onChange={handleChange} className={inputClass}>
                <option value="">Select</option>
                <option value="furnished">Furnished</option>
                <option value="semi-furnished">Semi-Furnished</option>
                <option value="unfurnished">Unfurnished</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Construction Year</label>
              <input name="constructionYear" value={formData.constructionYear} onChange={handleChange} type="number" className={inputClass} placeholder="2020" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Facing</label>
              <input name="facing" value={formData.facing} onChange={handleChange} className={inputClass} placeholder="East" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amenities (comma-separated)</label>
            <input name="amenities" value={formData.amenities} onChange={handleChange} className={inputClass} placeholder="Lift, Gym, Swimming Pool, Security" />
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
            Add Property
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/properties" className="text-blue-600 hover:underline">← Back to Properties</a>
        </div>
      </div>
    </div>
  );
}