'use client';

import { useState } from 'react';

export default function CalculatorPage() {
  const [principal, setPrincipal] = useState('100000');
  const [rate, setRate] = useState('8');
  const [years, setYears] = useState('5');
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const p = parseFloat(principal);
    const r = parseFloat(rate) / 100;
    const t = parseFloat(years);
    const amount = p * Math.pow(1 + r, t);
    setResult(amount);
  };

  const formatCurrency = (n: number) => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-2">Investment Calculator</h1>
        <p className="text-gray-600 mb-8">Calculate compound returns for any investment</p>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Principal Amount (₹)</label>
              <input
                type="number"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Annual Return Rate (%)</label>
              <input
                type="number"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                step="0.1"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time Period (Years)</label>
              <input
                type="number"
                value={years}
                onChange={(e) => setYears(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={calculate}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Calculate
            </button>
          </div>

          {result !== null && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-gray-600">Final Amount</div>
              <div className="text-3xl font-bold text-blue-600">{formatCurrency(result)}</div>
              <div className="text-sm text-gray-600 mt-2">
                Total Gain: {formatCurrency(result - parseFloat(principal))} 
                ({((result / parseFloat(principal) - 1) * 100).toFixed(1)}%)
              </div>
            </div>
          )}
        </div>

        {/* Quick Compare */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">Quick Comparison: ₹1 Lakh invested for 5 years</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Investment</th>
                  <th className="text-right py-2">Rate</th>
                  <th className="text-right py-2">Final Amount</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Fixed Deposit', rate: 7 },
                  { name: 'PPF', rate: 7.1 },
                  { name: 'Nifty 50 ETF', rate: 12 },
                  { name: 'Gold (SGB)', rate: 9 },
                  { name: 'REITs', rate: 8 },
                  { name: 'P2P Lending', rate: 12 },
                ].map(item => {
                  const amt = 100000 * Math.pow(1 + item.rate / 100, 5);
                  return (
                    <tr key={item.name} className="border-b">
                      <td className="py-2">{item.name}</td>
                      <td className="text-right py-2">{item.rate}%</td>
                      <td className="text-right py-2 font-medium">₹{amt.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}