'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { p2pPlatforms, getPlatformWatchdogMetrics } from '@/data/p2p-platforms';

export default function P2PPlatformsPage() {
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [minInvestmentFilter, setMinInvestmentFilter] = useState('');
  const [complianceFilter, setComplianceFilter] = useState('');
  const [sortBy, setSortBy] = useState('complianceScore');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const enrichedPlatforms = useMemo(() => {
    return p2pPlatforms.map((p) => ({
      ...p,
      watchdog: getPlatformWatchdogMetrics(p),
    }));
  }, []);

  const filtered = useMemo(() => {
    let result = [...enrichedPlatforms];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.registeredCompany.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.headquarters.toLowerCase().includes(q) ||
          p.cin.toLowerCase().includes(q)
      );
    }

    if (riskFilter) {
      result = result.filter((p) => p.riskLevel === parseInt(riskFilter));
    }

    if (minInvestmentFilter) {
      const maxMin = parseInt(minInvestmentFilter);
      result = result.filter((p) => p.minInvestment !== null && p.minInvestment <= maxMin);
    }

    if (complianceFilter === 'tier1') {
      result = result.filter((p) => p.watchdog.complianceTier === 'Tier 1: High Disclosure');
    } else if (complianceFilter === 'tplus1') {
      result = result.filter((p) => p.watchdog.tPlusOneSettlement === 'Verified');
    } else if (complianceFilter === 'npa') {
      result = result.filter((p) => p.watchdog.publishesNpa !== 'Not Disclosed');
    }

    if (sortBy === 'complianceScore') {
      result.sort((a, b) => b.watchdog.complianceScore - a.watchdog.complianceScore);
    } else if (sortBy === 'name') {
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
  }, [enrichedPlatforms, search, riskFilter, minInvestmentFilter, complianceFilter, sortBy]);

  const formatMoney = (n: number | null) => {
    if (!n) return 'N/A';
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
    return `₹${n}`;
  };

  const riskLabels: Record<number, string> = {
    1: 'Very Low',
    2: 'Low',
    3: 'Medium',
    4: 'High',
    5: 'Very High',
  };

  const tier1Count = enrichedPlatforms.filter((p) => p.watchdog.complianceTier === 'Tier 1: High Disclosure').length;
  const tPlus1Count = enrichedPlatforms.filter((p) => p.watchdog.tPlusOneSettlement === 'Verified').length;
  const npaDisclosedCount = enrichedPlatforms.filter((p) => p.watchdog.publishesNpa !== 'Not Disclosed').length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-slate-950 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
            <Link href="/p2p" className="hover:text-emerald-400">
              P2P Lending Hub
            </Link>
            <span>/</span>
            <span className="text-slate-200 font-semibold">Watchdog & Compliance Scorecard</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Independent RBI NBFC-P2P Watchdog</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
            NBFC-P2P Compliance Scorecard & Platform Directory
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
            Audit all {p2pPlatforms.length} RBI-registered NBFC-P2P licensees against a uniform set of post-2024 RBI Master Direction metrics: Named Bank Escrow Trustee, T+1 Settlement verification, public NPA disclosure, Net XIRR after defaults, CIN, and fee transparency.
          </p>

          {/* Watchdog Summary Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/80">
            <div>
              <div className="text-2xl font-extrabold text-white">{p2pPlatforms.length}</div>
              <div className="text-xs text-slate-400">Total RBI NBFC-P2P Licensees</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-emerald-400">{tier1Count} Platforms</div>
              <div className="text-xs text-slate-400">Tier 1 High Disclosure Score (78+)</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-white">{tPlus1Count} Verified</div>
              <div className="text-xs text-slate-400">T+1 Escrow Settlement Compliant</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-amber-400">
                {p2pPlatforms.length - npaDisclosedCount} Platforms
              </div>
              <div className="text-xs text-slate-400">Do Not Disclose Public NPA Rates</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters & View Switcher */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-3">
            <input
              type="text"
              placeholder="Search by platform name, registered NBFC entity, CIN, or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              maxLength={100}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-xs sm:text-sm text-slate-900 bg-white"
            />
            <select
              value={complianceFilter}
              onChange={(e) => setComplianceFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 bg-white font-medium"
            >
              <option value="">All Watchdog Tiers</option>
              <option value="tier1">Tier 1: High Disclosure Only</option>
              <option value="tplus1">T+1 Escrow Verified Only</option>
              <option value="npa">Publishes NPA Data Only</option>
            </select>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 bg-white font-medium"
            >
              <option value="">All Risk Levels</option>
              <option value="2">Low Risk (2/5)</option>
              <option value="3">Medium Risk (3/5)</option>
              <option value="4">High Risk (4/5)</option>
            </select>
            <select
              value={minInvestmentFilter}
              onChange={(e) => setMinInvestmentFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 bg-white font-medium"
            >
              <option value="">Any Min Ticket</option>
              <option value="500">Up to ₹500</option>
              <option value="1000">Up to ₹1,000</option>
              <option value="5000">Up to ₹5,000</option>
              <option value="25000">Up to ₹25,000</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 bg-white font-medium"
            >
              <option value="complianceScore">Sort: Watchdog Score (High to Low)</option>
              <option value="name">Sort: Platform Name</option>
              <option value="returns">Sort: Advertised Returns</option>
              <option value="minInvestment">Sort: Lowest Minimum</option>
              <option value="risk">Sort: Lowest Risk</option>
            </select>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs text-slate-500">
              Showing <strong>{filtered.length}</strong> of {p2pPlatforms.length} RBI-registered NBFC-P2P entities
            </div>
            <div className="inline-flex rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Watchdog Table View
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  viewMode === 'cards' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Detailed Cards View
              </button>
            </div>
          </div>
        </div>

        {/* Uniform Watchdog Scorecard Table */}
        {viewMode === 'table' ? (
          <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200 shadow-sm mb-8">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/90 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  <th className="py-3.5 px-4">Platform & RBI Legal Entity</th>
                  <th className="py-3.5 px-3 text-center">Watchdog Score</th>
                  <th className="py-3.5 px-3">Escrow Trustee</th>
                  <th className="py-3.5 px-3 text-center">T+1 Escrow</th>
                  <th className="py-3.5 px-3">Publishes NPA</th>
                  <th className="py-3.5 px-3">Est. Net XIRR</th>
                  <th className="py-3.5 px-3">Gross Adv.</th>
                  <th className="py-3.5 px-3 text-right">Min Ticket</th>
                  <th className="py-3.5 px-3 text-right">Max / Borrower</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70">
                {filtered.map((p) => {
                  const w = p.watchdog;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/90 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{p.name}</span>
                          {p.website && (
                            <a
                              href={p.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] font-semibold text-emerald-700 hover:underline"
                            >
                              [Site]
                            </a>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500">{p.registeredCompany}</div>
                        <div className="text-[10px] font-mono text-slate-400">
                          CIN: {p.cin} • RBI {p.rbiRegionalOffice}
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`inline-flex items-center justify-center px-2.5 py-1 rounded-lg font-extrabold text-xs ${
                            w.complianceScore >= 78
                              ? 'bg-emerald-100 text-emerald-800'
                              : w.complianceScore >= 50
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {w.complianceScore}/100
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">{w.complianceTier.split(':')[0]}</div>
                      </td>

                      <td className="py-3.5 px-3 text-slate-700 font-medium max-w-[180px]">
                        {w.escrowTrustee}
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            w.tPlusOneSettlement === 'Verified'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : w.tPlusOneSettlement === 'Transitioning'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {w.tPlusOneSettlement}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <div
                          className={`font-bold ${
                            w.publishesNpa === 'Monthly / Quarterly'
                              ? 'text-emerald-700'
                              : w.publishesNpa === 'Summary Only'
                              ? 'text-amber-700'
                              : 'text-rose-600'
                          }`}
                        >
                          {w.publishesNpa}
                        </div>
                        <div className="text-[10px] text-slate-500 max-w-[190px] line-clamp-2">
                          {w.npaDisclosureDetail}
                        </div>
                      </td>

                      <td className="py-3.5 px-3 font-bold text-emerald-700">
                        {w.netXirrEst}
                      </td>

                      <td className="py-3.5 px-3 text-slate-600 font-semibold">
                        {p.advertisedReturns || 'Not Disclosed'}
                      </td>

                      <td className="py-3.5 px-3 text-right font-semibold text-slate-900">
                        {formatMoney(p.minInvestment)}
                      </td>

                      <td className="py-3.5 px-3 text-right font-mono text-slate-600">
                        {formatMoney(p.maxBorrowerLoan)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Detailed Cards View */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {filtered.map((platform) => {
              const w = platform.watchdog;
              return (
                <div
                  key={platform.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between mb-3 gap-2">
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">{platform.name}</h3>
                        <p className="text-xs text-slate-500">{platform.registeredCompany}</p>
                        <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                          CIN: {platform.cin} • RBI {platform.rbiRegionalOffice}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            w.complianceScore >= 78
                              ? 'bg-emerald-100 text-emerald-800'
                              : w.complianceScore >= 50
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          Score: {w.complianceScore}/100
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Risk: {riskLabels[platform.riskLevel]}
                        </div>
                      </div>
                    </div>

                    {/* Uniform Watchdog Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                      <div className="bg-slate-50 rounded-lg p-2">
                        <div className="text-[10px] text-slate-500">Est. Net XIRR</div>
                        <div className="font-bold text-emerald-700">{w.netXirrEst}</div>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-2">
                        <div className="text-[10px] text-slate-500">Gross Advertised</div>
                        <div className="font-bold text-slate-900">{platform.advertisedReturns || 'N/A'}</div>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-2">
                        <div className="text-[10px] text-slate-500">T+1 Escrow</div>
                        <div className="font-bold text-slate-900">{w.tPlusOneSettlement}</div>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-2">
                        <div className="text-[10px] text-slate-500">Publishes NPA</div>
                        <div className="font-bold text-slate-900">{w.publishesNpa}</div>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-2">
                        <div className="text-[10px] text-slate-500">Min Investment</div>
                        <div className="font-bold text-slate-900">{formatMoney(platform.minInvestment)}</div>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-2">
                        <div className="text-[10px] text-slate-500">Loan Tenure</div>
                        <div className="font-bold text-slate-900">{platform.loanTenure || 'N/A'}</div>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1 mb-3 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                      <div>
                        <span className="font-semibold text-slate-800">Escrow Trustee:</span> {w.escrowTrustee}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-800">NPA Disclosure:</span> {w.npaDisclosureDetail}
                      </div>
                      {platform.fees && (
                        <div>
                          <span className="font-semibold text-slate-800">Fee Structure:</span> {platform.fees}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="text-[11px]">
                      {platform.website ? (
                        <a
                          href={platform.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-700 hover:underline font-semibold"
                        >
                          Official Portal →
                        </a>
                      ) : (
                        <span className="text-slate-400">No retail website</span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400">Source: {platform.dataSource}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <p className="text-slate-700 font-bold text-base">No NBFC-P2P platforms match your filter criteria.</p>
            <p className="text-slate-500 text-xs mt-1">Try resetting your search or compliance tier filter.</p>
          </div>
        )}

        {/* Watchdog Methodology & Regulatory Note */}
        <div className="mt-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
          <h2 className="text-base font-bold text-slate-900">
            How the Independent NBFC-P2P Watchdog Score is Calculated
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Following the RBI&apos;s August 2024 revised Master Directions for NBFC-P2P Lending Platforms, platforms are strictly prohibited from offering liquid pool products, assuring returns, or holding lender funds outside T+1 bank-trustee managed escrow accounts. Our 100-point Watchdog Score weights: (1) Active RBI Certificate of Registration & CIN disclosure (20 pts), (2) Named independent SEBI/RBI-registered Bank Escrow Trustee (25 pts), (3) Verified T+1 direct escrow settlement workflow (25 pts), and (4) Publicly verifiable 30/60/90-day NPA and net XIRR cohort disclosures (30 pts).
          </p>
          <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3">
            <strong>Regulatory Disclaimer:</strong> All 28 entities listed hold an NBFC-P2P Certificate of Registration per the RBI registry. P2P lending carries 100% principal credit risk without DICGC insurance. Always verify latest board-approved NPA disclosures directly on the platform before lending.
          </div>
        </div>
      </div>
    </div>
  );
}
