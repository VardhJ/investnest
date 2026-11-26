import Link from 'next/link';
import { p2pPlatforms } from '@/data/p2p-platforms';

export const metadata = {
  title: 'P2P Lending in India - Compare 28 RBI-Registered Platforms',
  description: 'Discover and compare all 28 RBI-registered P2P lending platforms in India. Returns, fees, risk levels, and more. Free comparison tool.',
  alternates: { canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.investnest.in'}/p2p` },
};

export default function P2PLandingPage() {
  const verifiedPlatforms = p2pPlatforms.filter(p => p.website !== null);
  const totalPlatforms = p2pPlatforms.length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-950 text-white pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(5,150,105,0.18),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(16,185,129,0.12),transparent_40%)] pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Alternative Investment Discovery
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
              P2P Lending in India - Compare All RBI-Registered Platforms
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-slate-300 leading-relaxed max-w-2xl">
              Peer-to-peer lending lets you earn <span className="text-emerald-400 font-semibold">10-18% returns</span> by lending directly to borrowers. 
              Compare all {totalPlatforms} RBI-registered platforms, understand the risks, and find the right one for your profile.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                href="/p2p/platforms"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-base shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.01]"
              >
                <span>Browse P2P Platforms</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/learn/p2p-lending-guide"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-base transition-colors"
              >
                Read P2P Guide
              </Link>
            </div>

            <div className="mt-12 pt-8 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-6">
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white">{totalPlatforms}</div>
                <div className="text-xs sm:text-sm text-slate-400 font-medium mt-0.5">RBI-Registered Platforms</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white">10-18%</div>
                <div className="text-xs sm:text-sm text-slate-400 font-medium mt-0.5">Advertised Returns</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white">₹500</div>
                <div className="text-xs sm:text-sm text-slate-400 font-medium mt-0.5">Min. Investment</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">RBI</div>
                <div className="text-xs sm:text-sm text-slate-400 font-medium mt-0.5">Regulated & Supervised</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What is P2P Lending */}
      <section className="py-20 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
              What is P2P Lending?
            </h2>
            <p className="text-base text-slate-600 leading-relaxed mb-6">
              Peer-to-peer (P2P) lending connects individual lenders with borrowers through an online platform. 
              Instead of going to a bank, borrowers get loans directly from investors like you. 
              You earn interest on the money you lend - typically 10-18% annually, much higher than FDs (6-8%).
            </p>
            <p className="text-base text-slate-600 leading-relaxed mb-6">
              All P2P platforms in India are regulated by the RBI under the NBFC-P2P framework. 
              The platform is just an intermediary - it doesn't lend its own money. 
              Credit risk is borne by you (the lender), not the platform.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="text-emerald-600 font-bold text-lg mb-1">Higher Returns</div>
                <p className="text-sm text-slate-600">Earn 10-18% vs 6-8% from FDs</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="text-emerald-600 font-bold text-lg mb-1">Low Minimum</div>
                <p className="text-sm text-slate-600">Start with as little as ₹250</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="text-emerald-600 font-bold text-lg mb-1">RBI Regulated</div>
                <p className="text-sm text-slate-600">All platforms registered with RBI</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1: P2P Platform Directory */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-3">
                <span>Section 1</span>
                <span>•</span>
                <span>Platform Directory</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                P2P Platform Directory
              </h2>
              <p className="mt-3 text-base text-slate-600 max-w-2xl leading-relaxed">
                Compare all {totalPlatforms} RBI-registered P2P lending platforms in India. 
                Filter by returns, risk level, minimum investment, and more.
              </p>
            </div>
            <div className="mt-6 md:mt-0">
              <Link
                href="/p2p/platforms"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-600/30 transition-all"
              >
                <span>View All Platforms</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80">
              <div className="text-2xl font-extrabold text-slate-900">{totalPlatforms}</div>
              <div className="text-xs text-slate-500 mt-1">RBI-Registered Platforms</div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80">
              <div className="text-2xl font-extrabold text-emerald-600">{verifiedPlatforms.length}</div>
              <div className="text-xs text-slate-500 mt-1">With Verified Websites</div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80">
              <div className="text-2xl font-extrabold text-blue-600">₹250</div>
              <div className="text-xs text-slate-500 mt-1">Lowest Min. Investment</div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80">
              <div className="text-2xl font-extrabold text-amber-600">18%</div>
              <div className="text-xs text-slate-500 mt-1">Highest Advertised Return</div>
            </div>
          </div>

          {/* Top Platforms Preview */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {p2pPlatforms.filter(p => p.website !== null && p.minInvestment !== null).slice(0, 6).map(platform => (
              <Link
                key={platform.id}
                href={`/p2p/platforms?highlight=${platform.id}`}
                className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-300 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-2xl">{platform.icon}</div>
                  <div>
                    <h3 className="font-bold text-slate-900">{platform.name}</h3>
                    <p className="text-xs text-slate-500">{platform.registeredCompany}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500">Returns:</span>
                    <span className="font-semibold text-emerald-600 ml-1">{platform.advertisedReturns || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Min:</span>
                    <span className="font-semibold text-slate-900 ml-1">{platform.minInvestment ? `₹${platform.minInvestment.toLocaleString('en-IN')}` : 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Risk:</span>
                    <span className="font-semibold text-slate-900 ml-1">{platform.riskLevel}/5</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Auto-invest:</span>
                    <span className="font-semibold text-slate-900 ml-1">{platform.autoInvest ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Section 2: Regulatory Updates */}
      <section className="py-20 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold uppercase tracking-wider mb-3">
                <span>Section 2</span>
                <span>•</span>
                <span>Regulatory Updates</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                RBI Regulatory Updates for P2P Lending
              </h2>
              <p className="mt-3 text-base text-slate-600 max-w-2xl leading-relaxed">
                Stay informed about RBI guidelines, new platform registrations, and regulatory changes affecting P2P lending in India.
              </p>
            </div>
            <div className="mt-6 md:mt-0">
              <Link
                href="/p2p/regulatory"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition-all"
              >
                <span>View All Updates</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Key Regulatory Facts */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="text-sm font-bold text-slate-900 mb-2">RBI Master Directions (2025)</div>
              <p className="text-xs text-slate-600 leading-relaxed">
                RBI issued updated Master Directions for NBFC-P2P in 2025, replacing the 2017 framework. Key changes: enhanced disclosure requirements, stricter NPA reporting, and clearer lender protection norms.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="text-sm font-bold text-slate-900 mb-2">28 Registered Platforms</div>
              <p className="text-xs text-slate-600 leading-relaxed">
                As of September 2026, 28 companies are registered as NBFC-P2P with RBI. This includes major platforms like LenDenClub, Faircent, Lendbox, and newer entrants like 1 Finance P2P.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="text-sm font-bold text-slate-900 mb-2">Lender & Borrower Limits</div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Max ₹50L per lender across all platforms. Max ₹10L per borrower. Max ₹50,000 per lender-borrower pair. Max 36 months tenure. No guaranteed returns allowed.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="text-sm font-bold text-slate-900 mb-2">Escrow Accounts</div>
              <p className="text-xs text-slate-600 leading-relaxed">
                All lender funds must be held in bank-managed escrow accounts. Platforms cannot hold or pool lender money. This protects lenders if a platform shuts down.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="text-sm font-bold text-slate-900 mb-2">Credit Risk on Lenders</div>
              <p className="text-xs text-slate-600 leading-relaxed">
                The platform is only an intermediary. Credit risk (borrower default) is borne by the lender, not the platform. Platforms cannot guarantee returns or absorb losses.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="text-sm font-bold text-slate-900 mb-2">NPA Reporting</div>
              <p className="text-xs text-slate-600 leading-relaxed">
                RBI requires platforms to report NPA/default rates. However, disclosure standards vary. Always check a platform's latest disclosure before investing.
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/p2p/regulatory"
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800 group"
            >
              <span>View full regulatory timeline and updates</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-slate-950 text-white text-center">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to Explore P2P Lending?</h2>
          <p className="text-xl mb-8 text-slate-300">
            Compare all 28 RBI-registered platforms and find the right one for your risk profile.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/p2p/platforms" className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-emerald-500 transition inline-block">
              Browse P2P Platforms
            </Link>
            <Link href="/learn/p2p-lending-guide" className="border-2 border-slate-600 text-slate-200 px-8 py-3 rounded-xl font-semibold hover:bg-slate-800 transition inline-block">
              Read P2P Guide
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}