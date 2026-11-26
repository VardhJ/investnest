'use client';

import { useState } from 'react';
import Link from 'next/link';
import { trackEvent } from '@/lib/analytics';

interface BenchmarkAsset {
  id: string;
  name: string;
  tag: string;
  grossRatePct: number;
  // How the return is taxed in India (2026 rules)
  taxTreatment: 'slab-annual' | 'tax-free-eee' | 'reit-ndcf' | 'invit-ndcf' | 'equity-ltcg' | 'gold-sgb-maturity' | 'bond-coupon';
  taxExplanation: string;
  linkHref: string;
}

const BENCHMARK_ASSETS: BenchmarkAsset[] = [
  {
    id: 'fd',
    name: 'Bank Fixed Deposit (FD)',
    tag: 'Traditional',
    grossRatePct: 7.25,
    taxTreatment: 'slab-annual',
    taxExplanation: '100% of annual interest taxed at marginal income slab + 4% cess every year.',
    linkHref: '/products/fixed-deposits',
  },
  {
    id: 'ppf',
    name: 'Public Provident Fund (PPF)',
    tag: 'Sovereign EEE',
    grossRatePct: 7.1,
    taxTreatment: 'tax-free-eee',
    taxExplanation: '100% tax-free interest and maturity proceeds (EEE status).',
    linkHref: '/products/ppf',
  },
  {
    id: 'reits',
    name: 'Listed Commercial REITs (Avg)',
    tag: 'Real Estate Trust',
    grossRatePct: 8.2,
    taxTreatment: 'reit-ndcf',
    taxExplanation: '~75% of NDCF distribution (Exempt Dividend + Return of Capital) has zero immediate tax drag; ~25% interest taxed at slab.',
    linkHref: '/reits',
  },
  {
    id: 'sm-reits',
    name: 'SEBI SM-REITs (Fractional Office)',
    tag: 'SEBI SM-REIT',
    grossRatePct: 9.4,
    taxTreatment: 'invit-ndcf',
    taxExplanation: '~65% interest component taxed at slab; ~35% debt repayment / return of capital reduces cost base.',
    linkHref: '/reits',
  },
  {
    id: 'invits',
    name: 'Listed Infrastructure InvITs',
    tag: 'Infrastructure Trust',
    grossRatePct: 11.4,
    taxTreatment: 'invit-ndcf',
    taxExplanation: '~65% interest taxed at marginal slab; ~35% return of capital / exempt payout.',
    linkHref: '/reits',
  },
  {
    id: 'obpp-bonds',
    name: 'Senior Secured Corporate Bonds (OBPP)',
    tag: 'Listed Debt',
    grossRatePct: 11.0,
    taxTreatment: 'bond-coupon',
    taxExplanation: 'Coupon interest taxed at marginal income slab rate (10% TDS).',
    linkHref: '/products/corporate-bonds-obpp',
  },
  {
    id: 'sgb',
    name: 'Sovereign Gold Bonds (Held to Maturity)',
    tag: 'Gold + 2.5%',
    grossRatePct: 10.5,
    taxTreatment: 'gold-sgb-maturity',
    taxExplanation: '8% gold appreciation is 100% capital-gains tax-free at RBI maturity; only 2.5% coupon is taxed at slab.',
    linkHref: '/products/sovereign-gold-bonds',
  },
  {
    id: 'p2p',
    name: 'NBFC-P2P Credit (Net of ~3% NPA)',
    tag: 'Alternative Credit',
    grossRatePct: 11.2,
    taxTreatment: 'slab-annual',
    taxExplanation: 'Interest income taxed at full marginal slab rate under Income from Other Sources.',
    linkHref: '/p2p/platforms',
  },
  {
    id: 'nifty-etf',
    name: 'Nifty 50 Index ETF',
    tag: 'Listed Equities',
    grossRatePct: 12.5,
    taxTreatment: 'equity-ltcg',
    taxExplanation: 'Tax-deferred compounding; 12.5% LTCG tax only on gains above ₹1.25 Lakh at final redemption (>12m).',
    linkHref: '/products/etfs',
  },
];

function computePostTaxMaturity(
  principal: number,
  grossRatePct: number,
  years: number,
  taxSlabPct: number,
  treatment: BenchmarkAsset['taxTreatment']
): {
  preTaxMaturity: number;
  postTaxMaturity: number;
  effectivePostTaxCagrPct: number;
  taxPaidInr: number;
} {
  const r = grossRatePct / 100;
  const preTaxMaturity = principal * Math.pow(1 + r, years);
  // Add 4% Health & Education Cess for non-zero tax slabs
  const slabRate = taxSlabPct > 0 ? (taxSlabPct * 1.04) / 100 : 0;

  let postTaxMaturity = preTaxMaturity;

  if (treatment === 'tax-free-eee') {
    postTaxMaturity = preTaxMaturity;
  } else if (treatment === 'slab-annual' || treatment === 'bond-coupon') {
    const netRate = r * (1 - slabRate);
    postTaxMaturity = principal * Math.pow(1 + netRate, years);
  } else if (treatment === 'reit-ndcf') {
    // Average Listed REIT: ~25% taxable interest, ~75% tax-free dividend + RoC
    const netRate = r * (0.75 + 0.25 * (1 - slabRate));
    postTaxMaturity = principal * Math.pow(1 + netRate, years);
  } else if (treatment === 'invit-ndcf') {
    // Average InvIT / SM-REIT: ~65% taxable interest, ~35% RoC/exempt
    const netRate = r * (0.35 + 0.65 * (1 - slabRate));
    postTaxMaturity = principal * Math.pow(1 + netRate, years);
  } else if (treatment === 'gold-sgb-maturity') {
    // 2.5% coupon taxed at slab, rest (~8% gold appreciation) tax-free at maturity
    const couponPortion = Math.min(r, 0.025);
    const goldAppreciation = Math.max(0, r - couponPortion);
    const netRate = goldAppreciation + couponPortion * (1 - slabRate);
    postTaxMaturity = principal * Math.pow(1 + netRate, years);
  } else if (treatment === 'equity-ltcg') {
    // 12.5% LTCG (+ 4% cess = 13%) on gains above Rs 1,25,000 at redemption (if years >= 1)
    const totalGain = Math.max(0, preTaxMaturity - principal);
    const ltcgRate = years >= 1 ? 0.125 * 1.04 : 0.20 * 1.04;
    const exemptGain = years >= 1 ? 125000 : 0;
    const taxableGain = Math.max(0, totalGain - exemptGain);
    const tax = taxableGain * ltcgRate;
    postTaxMaturity = preTaxMaturity - tax;
  }

  const effectivePostTaxCagrPct =
    principal > 0 && years > 0
      ? (Math.pow(postTaxMaturity / principal, 1 / years) - 1) * 100
      : 0;

  return {
    preTaxMaturity,
    postTaxMaturity,
    effectivePostTaxCagrPct: Number(effectivePostTaxCagrPct.toFixed(2)),
    taxPaidInr: Math.max(0, preTaxMaturity - postTaxMaturity),
  };
}

export default function CalculatorClient() {
  const [principal, setPrincipal] = useState('500000');
  const [rate, setRate] = useState('11');
  const [years, setYears] = useState('5');
  const [taxSlab, setTaxSlab] = useState<number>(30);
  const [customTaxType, setCustomTaxType] = useState<BenchmarkAsset['taxTreatment']>('slab-annual');

  const cleanPrincipal = Math.min(Math.max(parseFloat(principal) || 100000, 1000), 1000000000);
  const cleanRate = Math.min(Math.max(parseFloat(rate) || 0, 1), 40);
  const cleanYears = Math.min(Math.max(parseFloat(years) || 1, 1), 40);

  const customSim = computePostTaxMaturity(
    cleanPrincipal,
    cleanRate,
    cleanYears,
    taxSlab,
    customTaxType
  );

  const formatCurrency = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

  const preTaxGain = customSim.preTaxMaturity - cleanPrincipal;
  const postTaxGain = customSim.postTaxMaturity - cleanPrincipal;

  const handleCalculateClick = () => {
    trackEvent('calculator_used', {
      principal: cleanPrincipal,
      rate: cleanRate,
      years: cleanYears,
      tax_slab: taxSlab,
      tax_treatment: customTaxType,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 lg:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
            Post-Tax Compound Yield Engine
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Post-Tax Alternative Yield & Growth Calculator
          </h1>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            Compare pre-tax and post-tax wealth accumulation across FDs, Listed REITs, SM-REITs, InvITs, Corporate Bonds, P2P, and Equities based on your Indian income tax slab.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Inputs Card */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-6 pb-2 border-b border-slate-100">
              Simulation Parameters
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Investment Capital (₹)
                </label>
                <input
                  type="number"
                  min={1000}
                  max={1000000000}
                  value={principal}
                  onChange={(e) => setPrincipal(e.target.value.slice(0, 12))}
                  className="w-full px-4 py-2.5 text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[
                    { label: '₹1 Lakh', val: '100000' },
                    { label: '₹5 Lakh', val: '500000' },
                    { label: '₹10 Lakh (SM-REIT)', val: '1000000' },
                    { label: '₹25 Lakh', val: '2500000' },
                  ].map((preset) => (
                    <button
                      key={preset.val}
                      type="button"
                      onClick={() => setPrincipal(preset.val)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition ${
                        principal === preset.val
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Your Income Tax Slab (%)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[0, 10, 20, 30].map((slab) => (
                    <button
                      key={slab}
                      type="button"
                      onClick={() => setTaxSlab(slab)}
                      className={`py-2 rounded-xl text-xs font-bold border transition ${
                        taxSlab === slab
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {slab}% Slab
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Pre-Tax Yield (%)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={40}
                    step="0.1"
                    value={rate}
                    onChange={(e) => setRate(e.target.value.slice(0, 5))}
                    className="w-full px-3.5 py-2.5 text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Tenure (Years)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={40}
                    value={years}
                    onChange={(e) => setYears(e.target.value.slice(0, 2))}
                    className="w-full px-3.5 py-2.5 text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Taxation Structure
                </label>
                <select
                  value={customTaxType}
                  onChange={(e) => setCustomTaxType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                >
                  <option value="slab-annual">Fixed Deposit / P2P / Bond Coupon (Taxed at Slab)</option>
                  <option value="reit-ndcf">Listed REIT Pass-Through (~75% Tax-Exempt/RoC)</option>
                  <option value="invit-ndcf">InvIT / SM-REIT Pass-Through (~35% RoC)</option>
                  <option value="equity-ltcg">Listed Equity / ETF (12.5% LTCG above ₹1.25L)</option>
                  <option value="gold-sgb-maturity">SGB Held to Maturity (Tax-Free Gold Gain + 2.5% Coupon)</option>
                  <option value="tax-free-eee">PPF / Tax-Free Bond (100% Tax-Exempt)</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleCalculateClick}
                className="w-full mt-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition shadow-sm"
              >
                Update Post-Tax Comparison
              </button>
            </div>
          </div>

          {/* Result & Benchmark Card */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Post-Tax Maturity Value ({cleanYears} Yrs in {taxSlab}% Slab)
                  </div>
                  <div className="text-3xl sm:text-4xl font-extrabold text-emerald-700">
                    {formatCurrency(customSim.postTaxMaturity)}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Effective Post-Tax CAGR: <strong className="text-slate-800">{customSim.effectivePostTaxCagrPct}% p.a.</strong> (vs {cleanRate}% pre-tax)
                  </div>
                </div>

                <div className="text-left sm:text-right bg-slate-50 border border-slate-200/80 px-4 py-3 rounded-xl">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Pre-Tax Maturity</div>
                  <div className="text-lg font-bold text-slate-700">
                    {formatCurrency(customSim.preTaxMaturity)}
                  </div>
                  <div className="text-[11px] text-rose-600 font-semibold mt-0.5">
                    Est. Tax Drag: -{formatCurrency(customSim.taxPaidInr)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Pre-Tax Profit</div>
                  <div className="text-lg font-bold text-slate-900 mt-0.5">
                    {formatCurrency(preTaxGain)}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-100">
                  <div className="text-[10px] uppercase font-bold text-emerald-800">Net Take-Home Profit</div>
                  <div className="text-lg font-bold text-emerald-700 mt-0.5">
                    {formatCurrency(postTaxGain)}
                  </div>
                </div>
              </div>
            </div>

            {/* Multi-Asset Post-Tax Benchmark Table */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Post-Tax Asset Class Comparator ({formatCurrency(cleanPrincipal)} for {cleanYears} Years)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Side-by-side net returns after Indian income tax ({taxSlab}% slab) and 12.5% LTCG rules.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[11px]">
                      <th className="py-2.5 pr-3 font-bold">Asset Class</th>
                      <th className="py-2.5 px-2 font-bold text-right">Pre-Tax</th>
                      <th className="py-2.5 px-2 font-bold text-right text-emerald-800 bg-emerald-50/50">
                        Post-Tax Yield
                      </th>
                      <th className="py-2.5 pl-3 font-bold text-right">Net Maturity Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {BENCHMARK_ASSETS.map((item) => {
                      const sim = computePostTaxMaturity(
                        cleanPrincipal,
                        item.grossRatePct,
                        cleanYears,
                        taxSlab,
                        item.taxTreatment
                      );
                      return (
                        <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 pr-3">
                            <Link
                              href={item.linkHref}
                              className="font-bold text-slate-900 hover:text-emerald-700 hover:underline"
                            >
                              {item.name}
                            </Link>
                            <span className="ml-2 text-[10px] text-slate-400 font-normal">
                              ({item.tag})
                            </span>
                            <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                              {item.taxExplanation}
                            </div>
                          </td>
                          <td className="py-3 px-2 text-right font-semibold text-slate-600">
                            {item.grossRatePct.toFixed(2)}%
                          </td>
                          <td className="py-3 px-2 text-right font-extrabold text-emerald-700 bg-emerald-50/40">
                            {sim.effectivePostTaxCagrPct.toFixed(2)}%
                          </td>
                          <td className="py-3 pl-3 text-right font-extrabold text-slate-900">
                            <div>{formatCurrency(sim.postTaxMaturity)}</div>
                            <div className="text-[10px] text-slate-400 font-normal">
                              Tax: -{formatCurrency(sim.taxPaidInr)}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
