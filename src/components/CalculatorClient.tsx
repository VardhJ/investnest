'use client';

import { useState } from 'react';

export default function CalculatorClient() {
  const [principal, setPrincipal] = useState('100000');
  const [rate, setRate] = useState('12');
  const [years, setYears] = useState('5');
  const [result, setResult] = useState<number | null>(() => {
    const p = 100000;
    const r = 0.12;
    const t = 5;
    return p * Math.pow(1 + r, t);
  });

  const calculate = () => {
    const p = parseFloat(principal);
    const r = parseFloat(rate) / 100;
    const t = parseFloat(years);
    if (isNaN(p) || isNaN(r) || isNaN(t)) return;
    const amount = p * Math.pow(1 + r, t);
    setResult(amount);
  };

  const formatCurrency = (n: number) => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  const numPrincipal = parseFloat(principal) || 0;
  const totalGain = result !== null ? result - numPrincipal : 0;
  const percentGain = numPrincipal > 0 && result !== null ? ((result / numPrincipal - 1) * 100).toFixed(1) : '0';

  return (
    <div className="min-h-screen bg-slate-50 py-10 lg:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 text-center max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
            Compound Yield Engine
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Alternative Yield & Growth Calculator
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Simulate wealth accumulation across traditional fixed income and high-yield alternative investment vehicles.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Inputs Card */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-6 pb-2 border-b border-slate-100">
              Input Parameters
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Initial Capital (₹)
                </label>
                <input
                  type="number"
                  value={principal}
                  onChange={(e) => setPrincipal(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Expected Annual Return / Yield (%)
                </label>
                <input
                  type="number"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  step="0.1"
                  className="w-full px-4 py-2.5 text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Tenure Horizon (Years)
                </label>
                <input
                  type="number"
                  value={years}
                  onChange={(e) => setYears(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                />
              </div>

              <button
                onClick={calculate}
                className="w-full mt-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition shadow-sm"
              >
                Calculate Growth
              </button>
            </div>
          </div>

          {/* Result Card */}
          <div className="lg:col-span-7 space-y-6">
            {result !== null && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Maturity Value ({years} Years @ {rate}%)
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-emerald-700">
                  {formatCurrency(result)}
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-100">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Total Profit Generated</div>
                    <div className="text-lg font-bold text-slate-900 mt-0.5">
                      {formatCurrency(totalGain)}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-100">
                    <div className="text-[10px] uppercase font-bold text-emerald-800">Total Return Multiple</div>
                    <div className="text-lg font-bold text-emerald-700 mt-0.5">
                      +{percentGain}%
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Benchmark Comparison Table */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-4">
                Asset Benchmark Comparison (₹1,00,000 for 5 Years)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider">
                      <th className="py-2.5 font-bold">Asset Class</th>
                      <th className="py-2.5 font-bold text-right">Typical Yield</th>
                      <th className="py-2.5 font-bold text-right">Value in 5 Yrs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {[
                      { name: 'Bank Fixed Deposit', rate: 7.0, tag: 'Traditional' },
                      { name: 'Public Provident Fund (PPF)', rate: 7.1, tag: 'Tax-Free' },
                      { name: 'Commercial REITs', rate: 8.5, tag: 'Real Estate' },
                      { name: 'Sovereign Gold Bonds (SGB)', rate: 9.5, tag: 'Commodity' },
                      { name: 'Invoice Trade Finance', rate: 11.5, tag: 'Alternative' },
                      { name: 'P2P Credit (Net of NPAs)', rate: 12.0, tag: 'Alternative' },
                      { name: 'Nifty 50 Index ETF', rate: 12.5, tag: 'Equities' },
                    ].map((item) => {
                      const finalAmt = 100000 * Math.pow(1 + item.rate / 100, 5);
                      return (
                        <tr key={item.name} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2.5">
                            <span className="font-semibold text-slate-900">{item.name}</span>
                            <span className="ml-2 text-[10px] text-slate-400 font-normal">({item.tag})</span>
                          </td>
                          <td className="py-2.5 text-right font-bold text-slate-800">{item.rate}%</td>
                          <td className="py-2.5 text-right font-extrabold text-emerald-700">
                            {formatCurrency(finalAmt)}
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
