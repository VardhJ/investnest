'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  reitsAndInvits,
  fractionalMigrationTracker,
  calculatePostTaxTrustYield,
  TrustAsset,
  TrustCategory,
} from '@/data/reits-invits';
import JsonLd from '@/components/JsonLd';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.investnest.in';

export default function ReitsScreenerPage() {
  const [selectedCategory, setSelectedCategory] = useState<'all' | TrustCategory>('all');
  const [taxSlab, setTaxSlab] = useState<number>(30);
  const [sortBy, setSortBy] = useState<'netYield' | 'grossYield' | 'occupancy' | 'wale' | 'aum'>('netYield');
  const [liveQuotes, setLiveQuotes] = useState<
    Record<
      string,
      {
        price: number;
        fiftyTwoWeekHigh: number;
        fiftyTwoWeekLow: number;
        trailing12mDividend: number;
        liveYieldPct: number;
        updatedAt: string;
        source: string;
      }
    >
  >({});
  const [liveStatus, setLiveStatus] = useState<'loading' | 'live' | 'baseline'>('loading');

  useEffect(() => {
    fetch('/api/reits')
      .then((r) => r.json())
      .then((data) => {
        if (data?.quotes && Object.keys(data.quotes).length > 0) {
          setLiveQuotes(data.quotes);
          setLiveStatus('live');
        } else {
          setLiveStatus('baseline');
        }
      })
      .catch(() => setLiveStatus('baseline'));
  }, []);

  const enrichedTrusts = useMemo(() => {
    return reitsAndInvits.map((trust) => {
      const q = liveQuotes[trust.id];
      const merged: TrustAsset = q
        ? {
            ...trust,
            currentPrice: q.price,
            fiftyTwoWeekHigh: q.fiftyTwoWeekHigh,
            fiftyTwoWeekLow: q.fiftyTwoWeekLow,
            annualDistributionPerUnit: q.trailing12mDividend,
            distributionYieldPct: q.liveYieldPct,
          }
        : trust;

      const yieldCalc = calculatePostTaxTrustYield(merged, taxSlab);
      return {
        ...merged,
        isLiveQuote: Boolean(q),
        yieldCalc,
      };
    });
  }, [liveQuotes, taxSlab]);

  const filteredTrusts = useMemo(() => {
    const list =
      selectedCategory === 'all'
        ? [...enrichedTrusts]
        : enrichedTrusts.filter((t) => t.category === selectedCategory);

    list.sort((a, b) => {
      if (sortBy === 'netYield') return b.yieldCalc.netYieldPct - a.yieldCalc.netYieldPct;
      if (sortBy === 'grossYield') return b.distributionYieldPct - a.distributionYieldPct;
      if (sortBy === 'occupancy') return b.occupancyPct - a.occupancyPct;
      if (sortBy === 'wale') return b.waleYears - a.waleYears;
      if (sortBy === 'aum') return b.aumCrores - a.aumCrores;
      return 0;
    });

    return list;
  }, [enrichedTrusts, selectedCategory, sortBy]);

  const formatInr = (val: number) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} Lakh`;
    return `₹${val.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  };

  const categoryLabels: Record<TrustCategory, { badge: string; color: string }> = {
    'listed-reit': { badge: 'Listed REIT', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    'sm-reit': { badge: 'SEBI SM-REIT', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    'listed-invit': { badge: 'Listed InvIT', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Dataset',
          name: 'India Listed REIT, SM-REIT & InvIT Post-Tax Yield Screener',
          description:
            'Comparative dataset of all SEBI-registered REITs, SM-REITs, and InvITs in India including Section 115UA NDCF distribution tax splits, occupancy, WALE, and NSE market yields.',
          url: `${siteUrl}/reits`,
          creator: {
            '@type': 'Organization',
            name: 'InvestNest',
            url: siteUrl,
          },
        }}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-950 text-white pt-14 pb-20 lg:pt-20 lg:pb-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(5,150,105,0.18),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(16,185,129,0.12),transparent_40%)] pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>SEBI Registered Real Estate & Infrastructure Trusts</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.12]">
              India REIT, SM-REIT & InvIT Screener
            </h1>

            <p className="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed">
              Headline distribution yields are misleading without Section 115UA tax splits. Screen all listed REITs, SEBI-regulated fractional SM-REIT schemes, and Infrastructure InvITs on <span className="text-emerald-400 font-semibold">real post-tax cash yield</span>, occupancy, WALE, and verified exchange filings.
            </p>

            {/* Quick Summary Counters */}
            <div className="mt-10 pt-8 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-6">
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white">4 Listed REITs</div>
                <div className="text-xs text-slate-400 font-medium mt-0.5">125M+ sq.ft Grade-A Offices & Malls</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">6.4% - 12.5%</div>
                <div className="text-xs text-slate-400 font-medium mt-0.5">Quarterly NDCF Distribution Yield</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white">₹10 Lakh</div>
                <div className="text-xs text-slate-400 font-medium mt-0.5">SEBI SM-REIT Regulated Ticket</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white">100% Verified</div>
                <div className="text-xs text-slate-400 font-medium mt-0.5">NSE / BSE & SEBI Filing Proofs</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Controls Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'all', label: `All Trusts (${reitsAndInvits.length})` },
                { id: 'listed-reit', label: 'Listed REITs (4)' },
                { id: 'sm-reit', label: 'SEBI SM-REITs (2)' },
                { id: 'listed-invit', label: 'Listed InvITs (3)' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id as any)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    selectedCategory === tab.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Investor Tax Slab Selector & Sort */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-emerald-50/80 border border-emerald-200 px-3 py-1.5 rounded-xl">
                <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                  Your Income Tax Slab:
                </span>
                {[0, 10, 20, 30].map((slab) => (
                  <button
                    key={slab}
                    onClick={() => setTaxSlab(slab)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                      taxSlab === slab
                        ? 'bg-emerald-600 text-white'
                        : 'text-emerald-800 hover:bg-emerald-100'
                    }`}
                  >
                    {slab}%
                  </button>
                ))}
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
              >
                <option value="netYield">Sort: Highest Post-Tax Yield ({taxSlab}% Slab)</option>
                <option value="grossYield">Sort: Highest Pre-Tax Yield</option>
                <option value="occupancy">Sort: Highest Occupancy / Availability</option>
                <option value="wale">Sort: Longest WALE / Concession</option>
                <option value="aum">Sort: Largest AUM (Cr)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-14">
        {/* 1. Comparative Screener Table */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                Pre-Tax vs Post-Tax NDCF Distribution Comparison
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Showing real post-tax yields for an investor in the <strong>{taxSlab}% marginal tax slab</strong> (including 4% cess).
              </p>
            </div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600">
              <span
                className={`w-2 h-2 rounded-full ${
                  liveStatus === 'live' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <span>
                {liveStatus === 'live'
                  ? 'NSE Market Prices Refreshed Live (1h Cache)'
                  : 'Verified Q3 FY27 NSE Baseline Filings'}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200 shadow-sm">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  <th className="py-3.5 px-4">Trust / Ticker</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4 text-right">Unit Price</th>
                  <th className="py-3.5 px-4 text-right">Pre-Tax Yield</th>
                  <th className="py-3.5 px-4 text-right bg-emerald-50/60 text-emerald-900">
                    Post-Tax Yield ({taxSlab}% Slab)
                  </th>
                  <th className="py-3.5 px-4">NDCF Tax Split (Int / Div / RoC)</th>
                  <th className="py-3.5 px-4 text-right">Occupancy</th>
                  <th className="py-3.5 px-4 text-right">WALE</th>
                  <th className="py-3.5 px-4 text-right">Proof</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70">
                {filteredTrusts.map((trust) => {
                  const cat = categoryLabels[trust.category];
                  return (
                    <tr key={trust.id} className="hover:bg-slate-50/90 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-900">{trust.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {trust.ticker} • {trust.sebiRegNo}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${cat.color}`}>
                          {cat.badge}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right font-semibold text-slate-900">
                        <div>{formatInr(trust.currentPrice)}</div>
                        <div className="text-[10px] text-slate-400">
                          NAV: {formatInr(trust.navPerUnit)}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right font-bold text-slate-700">
                        <div>{trust.distributionYieldPct.toFixed(2)}%</div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          DPU: ₹{trust.annualDistributionPerUnit.toLocaleString('en-IN')}/yr
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right bg-emerald-50/40">
                        <div className="text-base font-extrabold text-emerald-700">
                          {trust.yieldCalc.netYieldPct.toFixed(2)}%
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Tax drag: -{trust.yieldCalc.effectiveTaxDragBps} bps
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="w-44">
                          <div className="flex h-2 rounded-full overflow-hidden bg-slate-100 mb-1">
                            <div
                              style={{ width: `${trust.taxSplit.interestPct}%` }}
                              className="bg-amber-500"
                              title={`Taxable Interest: ${trust.taxSplit.interestPct}%`}
                            />
                            <div
                              style={{ width: `${trust.taxSplit.dividendPct}%` }}
                              className="bg-emerald-500"
                              title={`Dividend: ${trust.taxSplit.dividendPct}%`}
                            />
                            <div
                              style={{ width: `${trust.taxSplit.returnOfCapitalPct}%` }}
                              className="bg-blue-500"
                              title={`Return of Capital: ${trust.taxSplit.returnOfCapitalPct}%`}
                            />
                          </div>
                          <div className="flex justify-between text-[10px] font-semibold text-slate-600">
                            <span className="text-amber-700">{trust.taxSplit.interestPct}% Int</span>
                            <span className="text-emerald-700">
                              {trust.taxSplit.dividendPct}% Div{trust.taxSplit.dividendTaxFree ? '*' : ''}
                            </span>
                            <span className="text-blue-700">{trust.taxSplit.returnOfCapitalPct}% RoC</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right font-semibold text-slate-800">
                        {trust.occupancyPct}%
                      </td>
                      <td className="py-4 px-4 text-right font-semibold text-slate-800">
                        {trust.waleYears} yrs
                      </td>
                      <td className="py-4 px-4 text-right">
                        <a
                          href={trust.proofUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-semibold text-xs transition"
                        >
                          <span>Filing</span>
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
            <div>
              <strong>Legend:</strong> <span className="text-amber-700 font-semibold">Int</span> = Interest (Taxed at marginal slab) •{' '}
              <span className="text-emerald-700 font-semibold">Div*</span> = Exempt Dividend (where SPV has not opted for Section 115BAA 22% tax regime) •{' '}
              <span className="text-blue-700 font-semibold">RoC</span> = Return of Capital / Debt Amortization (reduces cost of acquisition, tax-deferred until unit sale).
            </div>
            <div>Last verified against exchange filings: Nov 2026</div>
          </div>
        </section>

        {/* 2. Detailed Dossier Cards with Proof Citations */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-extrabold text-slate-900">
              Individual Trust Dossiers & Verification Proofs
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Full portfolio metrics, tenant concentration, debt gearing, and direct links to official investor relations and SEBI registration proofs.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredTrusts.map((trust) => {
              const cat = categoryLabels[trust.category];
              return (
                <div
                  key={trust.id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${cat.color}`}>
                            {cat.badge}
                          </span>
                          <span className="text-xs font-mono text-slate-500">
                            {trust.ticker} • ISIN: {trust.isin}
                          </span>
                        </div>
                        <h3 className="text-lg font-extrabold text-slate-900">{trust.name}</h3>
                        <p className="text-xs text-slate-500">
                          Sponsor: <strong className="text-slate-700">{trust.sponsor}</strong> • SEBI Reg:{' '}
                          <span className="font-mono">{trust.sebiRegNo}</span>
                        </p>
                      </div>

                      <div className="text-right bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-xl">
                        <div className="text-[10px] font-bold uppercase text-emerald-800">
                          Net Yield ({taxSlab}% Slab)
                        </div>
                        <div className="text-xl font-extrabold text-emerald-700">
                          {trust.yieldCalc.netYieldPct.toFixed(2)}%
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Pre-tax: {trust.distributionYieldPct.toFixed(2)}%
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed mb-4">{trust.summary}</p>

                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="text-[10px] text-slate-400 uppercase font-bold">AUM / Size</div>
                        <div className="text-xs font-bold text-slate-900 mt-0.5">
                          ₹{trust.aumCrores.toLocaleString('en-IN')} Cr
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="text-[10px] text-slate-400 uppercase font-bold">Occupancy</div>
                        <div className="text-xs font-bold text-slate-900 mt-0.5">{trust.occupancyPct}%</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="text-[10px] text-slate-400 uppercase font-bold">Debt Gearing</div>
                        <div className="text-xs font-bold text-slate-900 mt-0.5">{trust.gearingPct}%</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="text-[10px] text-slate-400 uppercase font-bold">Credit Rating</div>
                        <div className="text-xs font-bold text-emerald-700 mt-0.5 truncate" title={trust.creditRating}>
                          {trust.creditRating}
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1.5 mb-4">
                      <div>
                        <span className="font-semibold text-slate-800">Scale:</span> {trust.leasableAreaOrCapacity}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-800">Marquee Tenants / Counterparties:</span>{' '}
                        {trust.topTenants.join(', ')}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-800">Geographic Split:</span>{' '}
                        {trust.geography.join(' • ')}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <a
                      href={trust.proofUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-emerald-700 hover:text-emerald-800 hover:underline inline-flex items-center gap-1"
                    >
                      <span>Proof: {trust.proofSourceLabel}</span>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                    <a
                      href={trust.exchangeQuoteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-500 hover:text-slate-800 font-medium"
                    >
                      Exchange Quote →
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 3. Fractional Real Estate to SEBI SM-REIT Migration Tracker */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="max-w-3xl mb-6">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold uppercase tracking-wider mb-2">
              SEBI Regulatory Watch
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">
              Fractional Real Estate to SEBI SM-REIT Migration Tracker
            </h2>
            <p className="text-sm text-slate-600 mt-1 leading-relaxed">
              In March 2024, SEBI notified the Small and Medium REIT (SM-REIT) framework to regulate fractional commercial real estate platforms. Below is the official registration status of major fractional platforms in India.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                  <th className="py-3 px-4">Platform</th>
                  <th className="py-3 px-4">Registered Entity</th>
                  <th className="py-3 px-4">SEBI SM-REIT Reg No.</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Min Ticket</th>
                  <th className="py-3 px-4">Migration & Scheme Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fractionalMigrationTracker.map((item) => (
                  <tr key={item.platformName} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{item.platformName}</td>
                    <td className="py-3.5 px-4 text-slate-600">{item.legalEntity}</td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-700">
                      {item.sebiSmReitRegNo || 'Not Registered'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          item.status === 'SEBI Registered SM-REIT'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'Applicant / Transitioning SPVs'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-slate-900">
                      ₹{(item.minTicketInr / 100000).toFixed(0)} Lakh
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      {item.firstSchemeStatus}{' '}
                      <a
                        href={item.proofUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-700 font-semibold hover:underline ml-1"
                      >
                        [Verify]
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Cross-Link CTA */}
        <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold">Compare REITs Against FDs, Bonds & P2P in Your Tax Slab</h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Use our Post-Tax Yield Comparator to simulate 1 to 10 year compounding after income tax and LTCG deductions.
            </p>
          </div>
          <Link
            href="/calculator"
            className="shrink-0 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold rounded-xl transition"
          >
            Open Post-Tax Calculator →
          </Link>
        </div>
      </div>
    </div>
  );
}
