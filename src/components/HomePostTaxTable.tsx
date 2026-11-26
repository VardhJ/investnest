'use client';

import { useState } from 'react';
import Link from 'next/link';
import { trackEvent } from '@/lib/analytics';

interface Row {
  name: string;
  hub: string;
  href: string;
  preTaxPct: number;
  minTicket: string;
  liquidity: string;
  risk: string;
  riskColor: string;
  highlight?: boolean;
  computeNet: (slabRate: number) => string;
}

const ROWS: Row[] = [
  {
    name: 'SARFAESI Bank-Seized Auctions',
    hub: 'Distressed Real Estate Hub',
    href: '/properties',
    preTaxPct: 22.0,
    minTicket: '₹10,00,000',
    liquidity: 'Low (Physical Deed)',
    risk: '4 / 5',
    riskColor: 'bg-amber-100 text-amber-800',
    highlight: true,
    computeNet: () => '15-30% Equity Discount (12.5% LTCG >24m)',
  },
  {
    name: 'Listed Commercial REITs (4 Trusts)',
    hub: 'Listed Yield Trusts Hub',
    href: '/reits',
    preTaxPct: 7.8,
    minTicket: '₹350 (1 Unit)',
    liquidity: 'High (NSE / BSE)',
    risk: '3 / 5',
    riskColor: 'bg-blue-100 text-blue-800',
    highlight: true,
    computeNet: (s) => `${(7.8 * (0.75 + 0.25 * (1 - s))).toFixed(2)}% Net NDCF Yield`,
  },
  {
    name: 'SEBI Regulated SM-REITs (Fractional)',
    hub: 'Listed Yield Trusts Hub',
    href: '/reits',
    preTaxPct: 9.4,
    minTicket: '₹10,00,000',
    liquidity: 'Medium (Exchange Listed)',
    risk: '3 / 5',
    riskColor: 'bg-blue-100 text-blue-800',
    computeNet: (s) => `${(9.4 * (0.35 + 0.65 * (1 - s))).toFixed(2)}% Net NDCF Yield`,
  },
  {
    name: 'Listed Infrastructure InvITs (3 Trusts)',
    hub: 'Listed Yield Trusts Hub',
    href: '/reits',
    preTaxPct: 11.4,
    minTicket: '₹100 (1 Unit)',
    liquidity: 'High (NSE / BSE)',
    risk: '3 / 5',
    riskColor: 'bg-blue-100 text-blue-800',
    computeNet: (s) => `${(11.4 * (0.35 + 0.65 * (1 - s))).toFixed(2)}% Net NDCF Yield`,
  },
  {
    name: 'Senior Secured Corporate Bonds (OBPP)',
    hub: 'Fixed-Income & Credit Hub',
    href: '/products/corporate-bonds-obpp',
    preTaxPct: 11.0,
    minTicket: '₹10,000',
    liquidity: 'Medium (Listed Debt)',
    risk: '2 / 5',
    riskColor: 'bg-emerald-100 text-emerald-800',
    computeNet: (s) => `${(11.0 * (1 - s)).toFixed(2)}% Post-Tax Coupon`,
  },
  {
    name: 'RBI NBFC-P2P Lending (Net of ~3% NPA)',
    hub: 'Fixed-Income & Credit Hub',
    href: '/p2p/platforms',
    preTaxPct: 11.2,
    minTicket: '₹1,000',
    liquidity: 'Low (Monthly EMI)',
    risk: '4 / 5',
    riskColor: 'bg-amber-100 text-amber-800',
    computeNet: (s) => `${(11.2 * (1 - s)).toFixed(2)}% Post-Tax Net XIRR`,
  },
  {
    name: 'Sovereign Gold Bonds (Secondary Maturity)',
    hub: 'Commodity & Sovereign',
    href: '/products/sovereign-gold-bonds',
    preTaxPct: 10.5,
    minTicket: '₹7,500',
    liquidity: 'Medium (NSE / BSE)',
    risk: '1 / 5',
    riskColor: 'bg-emerald-100 text-emerald-800',
    computeNet: (s) => `${(8.0 + 2.5 * (1 - s)).toFixed(2)}% (Tax-Free Maturity)`,
  },
  {
    name: 'Bank Fixed Deposits (Scheduled Banks)',
    hub: 'Traditional Benchmark',
    href: '/products/fixed-deposits',
    preTaxPct: 7.25,
    minTicket: '₹1,000',
    liquidity: 'Medium (1% Penalty)',
    risk: '1 / 5',
    riskColor: 'bg-emerald-100 text-emerald-800',
    computeNet: (s) => `${(7.25 * (1 - s)).toFixed(2)}% Post-Tax Interest`,
  },
];

export default function HomePostTaxTable() {
  const [taxSlab, setTaxSlab] = useState<number>(30);
  const slabRate = taxSlab > 0 ? (taxSlab * 1.04) / 100 : 0;

  const handleSlabSelect = (slab: number) => {
    setTaxSlab(slab);
    trackEvent('home_tax_slab_toggled', { tax_slab: slab });
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Interactive Post-Tax Comparator
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Alternative Yield vs Traditional Instruments
          </h2>
          <p className="mt-2 text-slate-600 text-sm sm:text-base leading-relaxed">
            A 7.25% bank FD yields just 5.0% in the 30% tax bracket. Toggle your income tax slab below to compare real post-tax yields across India&apos;s regulated asset classes.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white border border-slate-200 p-1.5 rounded-xl shadow-xs self-start md:self-auto">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2">
            Tax Slab:
          </span>
          {[0, 10, 20, 30].map((slab) => (
            <button
              key={slab}
              type="button"
              onClick={() => handleSlabSelect(slab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition ${
                taxSlab === slab
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {slab}%
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden text-xs sm:text-sm">
          <thead>
            <tr className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600">
              <th className="py-3.5 px-5">Asset Class</th>
              <th className="py-3.5 px-4">Intelligence Hub</th>
              <th className="py-3.5 px-4">Pre-Tax Headline</th>
              <th className="py-3.5 px-4 bg-emerald-50/60 text-emerald-900">
                Real Post-Tax Yield ({taxSlab}% Slab)
              </th>
              <th className="py-3.5 px-4">Min. Ticket</th>
              <th className="py-3.5 px-4">Liquidity</th>
              <th className="py-3.5 px-4">Risk</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
            {ROWS.map((row) => (
              <tr
                key={row.name}
                className={
                  row.highlight
                    ? 'bg-emerald-50/30 hover:bg-emerald-50/60 transition-colors'
                    : 'hover:bg-slate-50 transition-colors'
                }
              >
                <td className="py-4 px-5 font-bold text-slate-900">
                  <Link href={row.href} className="hover:text-emerald-700 hover:underline flex items-center gap-2">
                    {row.highlight && <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />}
                    <span>{row.name}</span>
                  </Link>
                </td>
                <td className="py-4 px-4 text-xs text-slate-500">{row.hub}</td>
                <td className="py-4 px-4 text-slate-700 font-semibold">
                  {row.href === '/properties' ? '15-30% Discount' : `${row.preTaxPct}% p.a.`}
                </td>
                <td className="py-4 px-4 bg-emerald-50/30 font-extrabold text-emerald-700">
                  {row.computeNet(slabRate)}
                </td>
                <td className="py-4 px-4 font-semibold text-slate-900">{row.minTicket}</td>
                <td className="py-4 px-4 text-xs text-slate-500">{row.liquidity}</td>
                <td className="py-4 px-4">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${row.riskColor}`}>
                    {row.risk}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
        <span>
          Calculations include 4% Health &amp; Education Cess and Section 115UA pass-through exemptions for REITs/InvITs.
        </span>
        <Link href="/calculator" className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline">
          Run Custom Multi-Year Simulation in Post-Tax Calculator →
        </Link>
      </div>
    </div>
  );
}
