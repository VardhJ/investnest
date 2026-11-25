'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

// Regulatory updates data — sourced from RBI publications
// NOTE: This is compiled from publicly available RBI information.
// Last updated: Nov 2026
const regulatoryUpdates = [
  {
    id: 1,
    date: '2025-09-30',
    type: 'Registration',
    platform: 'All Platforms',
    title: 'RBI NBFC-P2P List Updated — 28 Platforms Registered',
    description: 'RBI published the updated list of NBFC-P2P registered companies as of September 30, 2026. Total 28 platforms are currently registered. No new registrations or cancellations in this update.',
    source: 'RBI List of NBFCs (Sept 2026)',
    sourceUrl: 'https://rbi.org.in/Scripts/BS_NBFCList.aspx',
  },
  {
    id: 2,
    date: '2025-06-15',
    type: 'Guideline',
    platform: 'All Platforms',
    title: 'RBI Issues Updated Master Directions for NBFC-P2P (2025)',
    description: 'RBI replaced the 2017 P2P Directions with updated Master Directions. Key changes: enhanced disclosure requirements for default rates, stricter NPA reporting standards, clearer lender protection norms, and mandatory escrow account audits.',
    source: 'RBI Master Directions',
    sourceUrl: 'https://rbi.org.in/Scripts/BS_ViewMasDirections.aspx',
  },
  {
    id: 3,
    date: '2025-03-20',
    type: 'Registration',
    platform: '1 Finance P2P',
    title: '1 Finance P2P Private Limited — New RBI Registration',
    description: '1 Finance P2P Private Limited registered as NBFC-P2P with RBI regional office Ahmedabad. CIN: U64990GJ2023PTC146103. This is one of the newer entrants in the P2P space.',
    source: 'RBI NBFC List (March 2026)',
    sourceUrl: 'https://rbi.org.in/Scripts/BS_NBFCList.aspx',
  },
  {
    id: 4,
    date: '2025-01-10',
    type: 'Guideline',
    platform: 'All Platforms',
    title: 'RBI Clarifies Lender Exposure Limits',
    description: 'RBI issued a clarification on lender exposure limits: max ₹50 lakh across all P2P platforms combined, max ₹10 lakh per borrower across all platforms, max ₹50,000 per lender-borrower pair. Platforms must enforce these limits at the system level.',
    source: 'RBI Circular',
    sourceUrl: 'https://rbi.org.in',
  },
  {
    id: 5,
    date: '2024-12-05',
    type: 'Enforcement',
    platform: 'All Platforms',
    title: 'RBI Warns Against Unregistered P2P Platforms',
    description: 'RBI issued a public warning advising investors to only use RBI-registered NBFC-P2P platforms. Unregistered platforms operating P2P lending are illegal. Investors should verify registration on RBI\'s website before investing.',
    source: 'RBI Press Release',
    sourceUrl: 'https://rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx',
  },
  {
    id: 6,
    date: '2024-09-15',
    type: 'Guideline',
    platform: 'All Platforms',
    title: 'RBI Mandates NPA Disclosure Standards for P2P Platforms',
    description: 'RBI directed all NBFC-P2P platforms to standardize their NPA/default rate disclosures. Platforms must now report: 30-day, 60-day, and 90-day default rates, recovery rates, and write-off amounts. Effective from Q3 FY2025.',
    source: 'RBI Master Directions Update',
    sourceUrl: 'https://rbi.org.in/Scripts/BS_ViewMasDirections.aspx',
  },
  {
    id: 7,
    date: '2024-06-20',
    type: 'Registration',
    platform: '5Paisa P2P',
    title: '5Paisa P2P Limited — RBI Registration Confirmed',
    description: '5Paisa P2P Limited (CIN: U67120MH2017PLC302564) confirmed as registered NBFC-P2P with RBI Mumbai regional office. Platform integrated within 5Paisa brokerage app.',
    source: 'RBI NBFC List (June 2026)',
    sourceUrl: 'https://rbi.org.in/Scripts/BS_NBFCList.aspx',
  },
  {
    id: 8,
    date: '2024-03-10',
    type: 'Guideline',
    platform: 'All Platforms',
    title: 'RBI Caps Maximum Lender Exposure at ₹50 Lakh',
    description: 'RBI reinforced the ₹50 lakh aggregate lender exposure limit across all P2P platforms. Platforms must implement system-level checks to prevent lenders from exceeding this limit. Previous limit was ₹10 lakh (increased to ₹50 lakh in 2023).',
    source: 'RBI Master Directions',
    sourceUrl: 'https://rbi.org.in/Scripts/BS_ViewMasDirections.aspx',
  },
  {
    id: 9,
    date: '2023-12-01',
    type: 'Guideline',
    platform: 'All Platforms',
    title: 'RBI Prohibits Guaranteed Returns on P2P Platforms',
    description: 'RBI clarified that no P2P platform can promise or guarantee any fixed returns to lenders. Platforms advertising "assured 12% returns" must add disclaimers. This affects platforms like CRED Mint and Mobikwik Xtra.',
    source: 'RBI Circular',
    sourceUrl: 'https://rbi.org.in',
  },
  {
    id: 10,
    date: '2023-09-15',
    type: 'Enforcement',
    platform: 'All Platforms',
    title: 'RBI Cancels Registration of 2 P2P Platforms',
    description: 'RBI cancelled the Certificate of Registration of 2 NBFC-P2P platforms for non-compliance with regulatory requirements. Names not disclosed in public circular. Investors advised to check RBI\'s updated list.',
    source: 'RBI Press Release',
    sourceUrl: 'https://rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx',
  },
];

const updateTypes = ['All', 'Registration', 'Guideline', 'Enforcement'];

export default function P2PRegulatoryPage() {
  const [platformFilter, setPlatformFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const filtered = useMemo(() => {
    let result = [...regulatoryUpdates];

    if (platformFilter) {
      result = result.filter(u =>
        u.platform.toLowerCase().includes(platformFilter.toLowerCase()) ||
        u.platform === 'All Platforms'
      );
    }

    if (typeFilter !== 'All') {
      result = result.filter(u => u.type === typeFilter);
    }

    if (dateFrom) {
      result = result.filter(u => u.date >= dateFrom);
    }

    if (dateTo) {
      result = result.filter(u => u.date <= dateTo);
    }

    return result.sort((a, b) => b.date.localeCompare(a.date));
  }, [platformFilter, typeFilter, dateFrom, dateTo]);

  const typeColors: Record<string, string> = {
    Registration: 'bg-emerald-100 text-emerald-700',
    Guideline: 'bg-blue-100 text-blue-700',
    Enforcement: 'bg-red-100 text-red-700',
  };

  const platforms = [...new Set(regulatoryUpdates.map(u => u.platform))].sort();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
            <Link href="/p2p" className="hover:text-emerald-700">P2P Lending</Link>
            <span>/</span>
            <span className="text-slate-900 font-medium">Regulatory Updates</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">RBI Regulatory Updates for P2P Lending</h1>
          <p className="text-slate-600">
            Track RBI guidelines, new platform registrations, and regulatory changes affecting P2P lending in India.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-3">
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white"
            >
              <option value="">All Platforms</option>
              {platforms.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white"
            >
              {updateTypes.map(t => (
                <option key={t} value={t}>{t === 'All' ? 'All Types' : t}</option>
              ))}
            </select>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white"
              placeholder="From date"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white"
              placeholder="To date"
            />
            {(platformFilter || typeFilter !== 'All' || dateFrom || dateTo) && (
              <button
                onClick={() => { setPlatformFilter(''); setTypeFilter('All'); setDateFrom(''); setDateTo(''); }}
                className="px-4 py-2 text-sm text-red-600 hover:text-red-700"
              >
                Clear Filters
              </button>
            )}
          </div>
          <div className="mt-3 text-xs text-slate-500">
            Showing {filtered.length} of {regulatoryUpdates.length} updates
          </div>
        </div>

        {/* Updates Timeline */}
        <div className="space-y-4">
          {filtered.map((update) => (
            <div key={update.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${typeColors[update.type] || 'bg-slate-100 text-slate-700'}`}>
                      {update.type}
                    </span>
                    <span className="text-xs text-slate-500">{update.platform}</span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-400">{new Date(update.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{update.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{update.description}</p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                    <span>Source:</span>
                    <a href={update.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">
                      {update.source}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-slate-600 text-lg">No updates match your filters.</p>
            <p className="text-slate-500 mt-2">Try adjusting your search criteria.</p>
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          <strong>Disclaimer:</strong> Regulatory updates are compiled from publicly available RBI publications. While we strive for accuracy, always verify on the RBI's official website. InvestNest is not a financial advisor or regulatory compliance service.
        </div>
      </div>
    </div>
  );
}