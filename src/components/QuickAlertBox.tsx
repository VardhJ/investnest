'use client';

import { useState } from 'react';
import { trackEvent } from '@/lib/analytics';

const CITIES = [
  'All India',
  'Mumbai',
  'Delhi',
  'Bangalore',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Pune',
  'Ahmedabad',
  'Jaipur',
  'Lucknow',
];

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

interface Props {
  defaultCity?: string;
  defaultAssetType?: string;
  variant?: 'inline' | 'sidebar' | 'dark';
  title?: string;
  subtitle?: string;
}

export default function QuickAlertBox({
  defaultCity = 'All India',
  defaultAssetType = 'all',
  variant = 'inline',
  title = 'Get Weekly Below-Market Bank Auctions & Regulated Yield Digest',
  subtitle = 'Receive top 20-30% discounted SARFAESI property notices, reserve price drops, and SEBI REIT/OBPP updates directly in your inbox.',
}: Props) {
  const [email, setEmail] = useState('');
  const [city, setCity] = useState(defaultCity || 'All India');
  const [assetType, setAssetType] = useState(defaultAssetType || 'all');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || cleanEmail.length > 150 || !EMAIL_REGEX.test(cleanEmail)) {
      setStatus('error');
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setStatus('submitting');
    try {
      const res = await fetch('/api/lead-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          city: city.slice(0, 50),
          asset_type: assetType.slice(0, 30),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus('error');
        setErrorMsg(data.error || 'Could not save alert preference.');
        return;
      }

      setStatus('success');
      setEmail('');
      trackEvent('lead_alert_subscribed', {
        city,
        asset_type: assetType,
        variant,
      });
    } catch {
      setStatus('error');
      setErrorMsg('Network error. Please try again.');
    }
  };

  if (variant === 'sidebar') {
    return (
      <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-6 shadow-sm">
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold uppercase tracking-wider mb-2">
          Instant Price-Drop Alerts
        </div>
        <h3 className="text-base font-bold text-white mb-1.5">{title}</h3>
        <p className="text-xs text-slate-300 leading-relaxed mb-4">{subtitle}</p>

        {status === 'success' ? (
          <div className="p-3.5 rounded-xl bg-emerald-950/90 border border-emerald-700 text-xs text-emerald-200 font-medium">
            Alert activated for <strong>{city}</strong>. We will notify you when matching properties or reserve price reductions are published.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3" noValidate>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                maxLength={150}
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Target City
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Focus
                </label>
                <select
                  value={assetType}
                  onChange={(e) => setAssetType(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">All Auctions & Alts</option>
                  <option value="residential">Residential Flats</option>
                  <option value="commercial">Commercial Offices</option>
                  <option value="land">Plots & Industrial</option>
                  <option value="reits">REITs & SM-REITs</option>
                </select>
              </div>
            </div>

            {status === 'error' && errorMsg && (
              <p className="text-xs text-rose-400 font-medium">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-xs font-bold rounded-xl transition shadow-sm"
            >
              {status === 'submitting' ? 'Activating Alert...' : 'Activate Free Auction Alert'}
            </button>
            <p className="text-[10px] text-slate-400 text-center">
              No spam. Unsubscribe anytime in one click.
            </p>
          </form>
        )}
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border p-6 sm:p-8 shadow-sm ${
        variant === 'dark'
          ? 'bg-slate-900 border-slate-800 text-white'
          : 'bg-white border-slate-200 text-slate-900'
      }`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-6">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
            Free Auction & Alternative Yield Alerts
          </div>
          <h3
            className={`text-xl sm:text-2xl font-extrabold tracking-tight ${
              variant === 'dark' ? 'text-white' : 'text-slate-900'
            }`}
          >
            {title}
          </h3>
          <p
            className={`text-xs sm:text-sm mt-1.5 leading-relaxed ${
              variant === 'dark' ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            {subtitle}
          </p>
        </div>

        <div className="lg:col-span-6">
          {status === 'success' ? (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-900 font-semibold">
              Alert confirmed for <strong>{city}</strong>. You will receive our next curated SARFAESI price-drop and alternative asset dossier.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-2.5" noValidate>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="email"
                  required
                  maxLength={150}
                  placeholder="Enter your email address..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`flex-1 px-4 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    variant === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-400'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white'
                  }`}
                />
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={`px-3.5 py-2.5 text-xs sm:text-sm font-medium rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    variant === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  {CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition shadow-sm whitespace-nowrap"
                >
                  {status === 'submitting' ? 'Saving...' : 'Get Free Alerts'}
                </button>
              </div>
              {status === 'error' && errorMsg && (
                <p className="text-xs text-rose-500 font-medium">{errorMsg}</p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
