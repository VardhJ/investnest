'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { p2pPlatforms, P2PPlatform } from '@/data/p2p-platforms';

export default function P2PPlatformsPage() {
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [minInvestmentFilter, setMinInvestmentFilter] = useState('');
  const [autoInvestFilter, setAutoInvestFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');

  const filtered = useMemo(() => {
    let result = [...p2pPlatforms];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.registeredCompany.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.headquarters.toLowerCase().includes(q)
      );
    }

    if (riskFilter) {
      result = result.filter(p => p.riskLevel === parseInt(riskFilter));
    }

    if (minInvestmentFilter) {
      const maxMin = parseInt(minInvestmentFilter);
      result = result.filter(p => p.minInvestment !== null && p.minInvestment <= maxMin);
    }

    if (autoInvestFilter === 'yes') {
      result = result.filter(p => p.autoInvest === true);
    } else if (autoInvestFilter === 'no') {
      result = result.filter(p => p.autoInvest === false);
    }

    // Sort
    if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'returns') {
      result.sort((a, b) => {
        const aNum = parseFloat(a.advertisedReturns?.match(/[\d.]+/)?.[0] || '0');
        const bNum = parseFloat(b.advertisedReturns?.match(/[\d.]+/)?.[0] || '0');
        return bNum - aNum;
      });
    } else if (sortBy === 'minInvestment') {
      result.sort((a, b) => (a.minInvestment || 999999) - (b.minInvestment || 999999));
    } else if (sortBy === 'risk') {
      result.sort((a, b) => a.riskLevel - b.riskLevel);
    }

    return result;
  }, [search, riskFilter, minInvestmentFilter, autoInvestFilter, sortBy]);

  const formatMoney = (n: number | null) => {
    if (!n) return 'N/A';
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
    return `₹${n}`;
  };

  const riskColors: Record<number, string> = {
    1: 'bg-emerald-100 text-emerald-700',
    2: 'bg-blue-100 text-blue-700',
    3: 'bg-amber-100 text-amber-700',
    4: 'bg-orange-100 text-orange-700',
    5: 'bg-red-100 text-red-700',
  };

  const riskLabels: Record<number, string> = {
    1: 'Very Low',
    2: 'Low',
    3: 'Medium',
    4: 'High',
    5: 'Very High',
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
            <Link href="/p2p" className="hover:text-emerald-700">P2P Lending</Link>
            <span>/</span>
            <span className="text-slate-900 font-medium">Platform Directory</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">P2P Platform Directory</h1>
          <p className="text-slate-600">
            Compare all {p2pPlatforms.length} RBI-registered P2P lending platforms in India
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              placeholder="Search platforms..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm text-slate-900 bg-white"
            />
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white"
            >
              <option value="">All Risk Levels</option>
              <option value="1">Very Low (1/5)</option>
              <option value="2">Low (2/5)</option>
              <option value="3">Medium (3/5)</option>
              <option value="4">High (4/5)</option>
              <option value="5">Very High (5/5)</option>
            </select>
            <select
              value={minInvestmentFilter}
              onChange={(e) => setMinInvestmentFilter(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white"
            >
              <option value="">Any Min Investment</option>
              <option value="500">≤ ₹500</option>
              <option value="1000">≤ ₹1,000</option>
              <option value="5000">≤ ₹5,000</option>
              <option value="10000">≤ ₹10,000</option>
              <option value="25000">≤ ₹25,000</option>
            </select>
            <select
              value={autoInvestFilter}
              onChange={(e) => setAutoInvestFilter(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white"
            >
              <option value="">Auto-Invest: Any</option>
              <option value="yes">Auto-Invest: Yes</option>
              <option value="no">Auto-Invest: No</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white"
            >
              <option value="name">Sort: Name</option>
              <option value="returns">Sort: Highest Returns</option>
              <option value="minInvestment">Sort: Lowest Min</option>
              <option value="risk">Sort: Lowest Risk</option>
            </select>
          </div>
          <div className="mt-3 text-xs text-slate-500">
            Showing {filtered.length} of {p2pPlatforms.length} platforms
          </div>
        </div>

        {/* Platform Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((platform) => (
            <div
              key={platform.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 hover:border-emerald-300 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{platform.icon}</div>
                  <div>
                    <h3 className="font-bold text-slate-900">{platform.name}</h3>
                    <p className="text-xs text-slate-500">{platform.registeredCompany}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  platform.riskLevel <= 2 ? 'bg-emerald-100 text-emerald-700' :
                  platform.riskLevel === 3 ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {riskLabels[platform.riskLevel]}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                <div className="bg-slate-50 rounded-lg p-2">
                  <div className="text-slate-500">Returns</div>
                  <div className="font-bold text-emerald-600">{platform.advertisedReturns || 'N/A'}</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-2">
                  <div className="text-slate-500">Min Investment</div>
                  <div className="font-bold text-slate-900">{formatMoney(platform.minInvestment)}</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-2">
                  <div className="text-slate-500">Loan Tenure</div>
                  <div className="font-bold text-slate-900">{platform.loanTenure || 'N/A'}</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-2">
                  <div className="text-slate-500">Auto-Invest</div>
                  <div className="font-bold text-slate-900">{platform.autoInvest === true ? 'Yes' : platform.autoInvest === false ? 'No' : 'N/A'}</div>
                </div>
              </div>

              {platform.fees && (
                <div className="text-xs text-slate-500 mb-2">
                  <span className="font-medium">Fees:</span> {platform.fees}
                </div>
              )}

              {platform.description && (
                <p className="text-xs text-slate-600 mb-3 line-clamp-2">{platform.description}</p>
              )}

              {platform.pros.length > 0 && (
                <div className="mb-2">
                  <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">Pros</div>
                  <ul className="text-xs text-slate-600 space-y-0.5">
                    {platform.pros.slice(0, 3).map((pro, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <span className="text-emerald-500">✓</span> {pro}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {platform.cons.length > 0 && (
                <div className="mb-3">
                  <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">Cons</div>
                  <ul className="text-xs text-slate-600 space-y-0.5">
                    {platform.cons.slice(0, 2).map((con, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <span className="text-red-500">✗</span> {con}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="text-[10px] text-slate-400">
                  {platform.website ? (
                    <a
                      href={platform.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 hover:underline font-medium"
                    >
                      Visit Website →
                    </a>
                  ) : (
                    <span>No website found</span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400">
                  Source: {platform.dataSource}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-slate-600 text-lg">No platforms match your filters.</p>
            <p className="text-slate-500 mt-2">Try adjusting your search criteria.</p>
          </div>
        )}

        {/* Regulatory Info */}
        <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          <strong>Disclaimer:</strong> All platforms listed are registered with RBI as NBFC-P2P. Data is sourced from RBI's official NBFC list (Sept 2026) and platform websites. Returns, fees, and features may change. P2P lending involves credit risk — lenders can lose principal. RBI does not guarantee returns. Always verify current details on the platform's official website before investing.
        </div>
      </div>
    </div>
  );
}