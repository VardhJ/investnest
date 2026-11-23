'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    bank: '',
    branch: '',
    location: '',
    city: '',
    state: '',
    propertyType: 'residential',
    reservePrice: '',
    marketValue: '',
    discount: '',
    auctionDate: '',
    emd: '',
    description: '',
    sourceUrl: '',
  });
  const [status, setStatus] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Saving...');

    try {
      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        }),
      });

      if (res.ok) {
        setStatus('✅ Property added successfully!');
        setFormData({
          title: '', bank: '', branch: '', location: '', city: '', state: '',
          propertyType: 'residential', reservePrice: '', marketValue: '', discount: '',
          auctionDate: '', emd: '', description: '', sourceUrl: '',
        });
      } else {
        const data = await res.json();
        setStatus(`❌ Error: ${data.error || 'Failed to save'}`);
      }
    } catch (e) {
      setStatus(`❌ Error: ${e}`);
    }
  };

  const inputClass = "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm";

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-2">Add Property (Admin)</h1>
        <p className="text-gray-600 mb-6">Manually add a SARFAESI property to the database</p>

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