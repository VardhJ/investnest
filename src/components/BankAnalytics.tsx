'use client';

import { useState, useEffect } from 'react';

interface BankData {
  bank: string;
  count: number;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  residential: number;
  commercial: number;
  industrial: number;
  land: number;
  topCity: string;
}

interface ScrapeLog {
  scraped_at: string;
  total_fetched: number;
  new_properties: number;
  updated_properties: number;
  removed_properties: number;
  price_changes: number;
  duration_seconds: number;
}

export default function BankAnalytics() {
  const [bankData, setBankData] = useState<BankData[]>([]);
  const [scrapeLogs, setScrapeLogs] = useState<ScrapeLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalProps, setTotalProps] = useState(0);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch all properties
      let allProps: any[] = [];
      let offset = 0;
      while (true) {
        const res = await fetch(`/api/properties?limit=1000&page=${Math.floor(offset / 1000) + 1}`);
        const data = await res.json();
        if (!data.properties || data.properties.length === 0) break;
        allProps = allProps.concat(data.properties);
        if (data.properties.length < 1000) break;
        offset += 1000;
      }

      // Fetch scrape logs
      const logsRes = await fetch('/api/scrape-logs');
      const logsData = await logsRes.json();

      // Aggregate by bank
      const bankMap: Record<string, BankData> = {};
      allProps.forEach(p => {
        const bank = p.bank || 'Unknown';
        if (!bankMap[bank]) {
          bankMap[bank] = {
            bank,
            count: 0,
            avgPrice: 0,
            minPrice: Infinity,
            maxPrice: 0,
            residential: 0,
            commercial: 0,
            industrial: 0,
            land: 0,
            topCity: '',
          };
        }
        const b = bankMap[bank];
        b.count++;
        b.avgPrice += p.reservePrice || 0;
        b.minPrice = Math.min(b.minPrice, p.reservePrice || Infinity);
        b.maxPrice = Math.max(b.maxPrice, p.reservePrice || 0);
        if (p.propertyType === 'residential') b.residential++;
        else if (p.propertyType === 'commercial') b.commercial++;
        else if (p.propertyType === 'industrial') b.industrial++;
        else if (p.propertyType === 'land') b.land++;
      });

      // Calculate averages and top cities
      const cityByBank: Record<string, Record<string, number>> = {};
      allProps.forEach(p => {
        const bank = p.bank || 'Unknown';
        if (!cityByBank[bank]) cityByBank[bank] = {};
        cityByBank[bank][p.city] = (cityByBank[bank][p.city] || 0) + 1;
      });

      const bankArray = Object.values(bankMap).map(b => {
        b.avgPrice = Math.round(b.avgPrice / b.count);
        if (b.minPrice === Infinity) b.minPrice = 0;
        // Top city
        const cities = cityByBank[b.bank] || {};
        b.topCity = Object.entries(cities).sort((a, c) => c[1] - a[1])[0]?.[0] || 'N/A';
        return b;
      }).sort((a, b) => b.count - a.count);

      setBankData(bankArray);
      setScrapeLogs(logsData.logs || []);
      setTotalProps(allProps.length);
    } catch (e) {
      console.error('Failed to fetch analytics:', e);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    if (!price) return 'N/A';
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
    return `₹${price.toLocaleString('en-IN')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  const maxCount = Math.max(...bankData.map(b => b.count));

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80">
          <div className="text-2xl font-extrabold text-slate-900">{totalProps.toLocaleString()}</div>
          <div className="text-xs text-slate-500 mt-1">Total Properties</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80">
          <div className="text-2xl font-extrabold text-emerald-600">{bankData.length}</div>
          <div className="text-xs text-slate-500 mt-1">Banks Listing</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80">
          <div className="text-2xl font-extrabold text-blue-600">
            {bankData.length > 0 ? formatPrice(Math.round(bankData.reduce((a, b) => a + b.avgPrice, 0) / bankData.length)) : 'N/A'}
          </div>
          <div className="text-xs text-slate-500 mt-1">Avg Reserve Price</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80">
          <div className="text-2xl font-extrabold text-amber-600">{scrapeLogs.length}</div>
          <div className="text-xs text-slate-500 mt-1">Scrape Runs</div>
        </div>
      </div>

      {/* Bank Performance Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
        <div className="p-5 border-b border-slate-200/80">
          <h3 className="text-lg font-bold text-slate-900">Bank Performance</h3>
          <p className="text-xs text-slate-500 mt-1">Property counts, average prices, and type breakdown by bank</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Bank</th>
                <th className="text-right py-3 px-2 font-semibold text-slate-700">Properties</th>
                <th className="text-right py-3 px-2 font-semibold text-slate-700">Share</th>
                <th className="text-right py-3 px-2 font-semibold text-slate-700">Avg Price</th>
                <th className="text-right py-3 px-2 font-semibold text-slate-700">Min</th>
                <th className="text-right py-3 px-2 font-semibold text-slate-700">Max</th>
                <th className="text-center py-3 px-2 font-semibold text-slate-700">Res</th>
                <th className="text-center py-3 px-2 font-semibold text-slate-700">Comm</th>
                <th className="text-center py-3 px-2 font-semibold text-slate-700">Ind</th>
                <th className="text-left py-3 px-2 font-semibold text-slate-700">Top City</th>
                <th className="text-left py-3 px-2 font-semibold text-slate-700 w-1/6">Distribution</th>
              </tr>
            </thead>
            <tbody>
              {bankData.map((bank) => (
                <tr key={bank.bank} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-medium text-slate-900 text-xs">{bank.bank}</td>
                  <td className="py-3 px-2 text-right font-bold text-slate-900">{bank.count.toLocaleString()}</td>
                  <td className="py-3 px-2 text-right text-slate-600">{((bank.count / totalProps) * 100).toFixed(1)}%</td>
                  <td className="py-3 px-2 text-right text-slate-900">{formatPrice(bank.avgPrice)}</td>
                  <td className="py-3 px-2 text-right text-slate-600 text-xs">{formatPrice(bank.minPrice)}</td>
                  <td className="py-3 px-2 text-right text-slate-600 text-xs">{formatPrice(bank.maxPrice)}</td>
                  <td className="py-3 px-2 text-center text-slate-600">{bank.residential}</td>
                  <td className="py-3 px-2 text-center text-slate-600">{bank.commercial}</td>
                  <td className="py-3 px-2 text-center text-slate-600">{bank.industrial}</td>
                  <td className="py-3 px-2 text-slate-600 text-xs">{bank.topCity}</td>
                  <td className="py-3 px-2">
                    <div className="bg-slate-100 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                        style={{ width: `${(bank.count / maxCount) * 100}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scrape History */}
      {scrapeLogs.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
          <div className="p-5 border-b border-slate-200/80">
            <h3 className="text-lg font-bold text-slate-900">Scrape History</h3>
            <p className="text-xs text-slate-500 mt-1">Daily scraper runs and results</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Date</th>
                  <th className="text-right py-3 px-2 font-semibold text-slate-700">Fetched</th>
                  <th className="text-right py-3 px-2 font-semibold text-slate-700">New</th>
                  <th className="text-right py-3 px-2 font-semibold text-slate-700">Updated</th>
                  <th className="text-right py-3 px-2 font-semibold text-slate-700">Removed</th>
                  <th className="text-right py-3 px-2 font-semibold text-slate-700">Price Changes</th>
                  <th className="text-right py-3 px-2 font-semibold text-slate-700">Duration</th>
                </tr>
              </thead>
              <tbody>
                {scrapeLogs.map((log, i) => (
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="py-3 px-4 text-slate-900 text-xs">{new Date(log.scraped_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="py-3 px-2 text-right text-slate-900">{log.total_fetched?.toLocaleString()}</td>
                    <td className="py-3 px-2 text-right text-emerald-600 font-semibold">{log.new_properties}</td>
                    <td className="py-3 px-2 text-right text-slate-600">{log.updated_properties}</td>
                    <td className="py-3 px-2 text-right text-red-600">{log.removed_properties}</td>
                    <td className="py-3 px-2 text-right text-amber-600">{log.price_changes}</td>
                    <td className="py-3 px-2 text-right text-slate-500 text-xs">{log.duration_seconds}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Property Type Summary */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Property Type Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['residential', 'commercial', 'industrial', 'land'].map(type => {
            const count = bankData.reduce((sum, b) => {
              if (type === 'residential') return sum + b.residential;
              if (type === 'commercial') return sum + b.commercial;
              if (type === 'industrial') return sum + b.industrial;
              if (type === 'land') return sum + b.land;
              return sum;
            }, 0);
            const total = bankData.reduce((sum, b) => sum + b.count, 0);
            const pct = total > 0 ? (count / total * 100).toFixed(1) : '0';
            const colors: Record<string, string> = {
              residential: 'bg-emerald-500',
              commercial: 'bg-blue-500',
              industrial: 'bg-amber-500',
              land: 'bg-purple-500',
            };
            return (
              <div key={type} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-3 h-3 rounded-full ${colors[type]}`} />
                  <span className="text-sm font-medium text-slate-700 capitalize">{type}</span>
                </div>
                <div className="text-2xl font-bold text-slate-900">{count}</div>
                <div className="text-xs text-slate-500">{pct}% of total</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Export Button */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            const csv = [
              'Bank,Properties,Avg Price,Min Price,Max Price,Residential,Commercial,Industrial,Land,Top City',
              ...bankData.map(b =>
                `"${b.bank}",${b.count},${b.avgPrice},${b.minPrice},${b.maxPrice},${b.residential},${b.commercial},${b.industrial},${b.land},"${b.topCity}"`
              )
            ].join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `investnest-bank-analytics-${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition"
        >
          Export to CSV
        </button>
      </div>
    </div>
  );
}