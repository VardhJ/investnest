import type { Metadata } from 'next';
import Link from 'next/link';
import { investmentProducts } from '@/data/products';
import { reitsAndInvits, calculatePostTaxTrustYield } from '@/data/reits-invits';
import ActivityFeed from '@/components/ActivityFeed';
import QuickAlertBox from '@/components/QuickAlertBox';
import HomePostTaxTable from '@/components/HomePostTaxTable';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.investnest.in';

export const metadata: Metadata = {
  title: {
    absolute: 'InvestNest - Bank Auction Properties, REIT Screener & Alternative Investments India',
  },
  description:
    'Discover bank-seized SARFAESI properties at 15-30% below market value, listed REITs/SM-REITs/InvITs with post-tax NDCF splits, and RBI NBFC-P2P watchdog scores. 100% free intelligence platform for Indian investors.',
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: 'InvestNest - Discover Investments Beyond Stocks & FDs',
    description:
      'Explore 4,200+ SARFAESI bank-seized properties at 15-30% discount, SEBI REIT/SM-REIT/InvIT post-tax screener, and 17 asset classes in India.',
    url: siteUrl,
    siteName: 'InvestNest',
    locale: 'en_IN',
    type: 'website',
    images: [{ url: `${siteUrl}/og/default.png`, width: 1200, height: 630, alt: 'InvestNest Alternative Investment Platform' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InvestNest - Bank Auction Properties & Alternative Investments',
    description: 'Explore bank-seized properties, REITs, SM-REITs, P2P lending watchdog, and more.',
    images: [`${siteUrl}/og/default.png`],
  },
};

export default function Home() {
  const featuredProducts = investmentProducts.filter((p) =>
    [
      'sarfaesi-properties',
      'reits',
      'sm-reits',
      'corporate-bonds-obpp',
      'securitized-debt-sdi',
      'invits',
    ].includes(p.id)
  );

  const topYieldTrusts = reitsAndInvits.slice(0, 6).map((t) => ({
    ...t,
    postTax30: calculatePostTaxTrustYield(t, 30),
  }));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* 1. HERO SECTION + 3 INTELLIGENCE HUB INTENT CARDS */}
      <section className="relative overflow-hidden bg-slate-950 text-white pt-14 pb-20 lg:pt-20 lg:pb-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(5,150,105,0.18),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(16,185,129,0.12),transparent_40%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Alternative Investment & Distressed Asset Intelligence</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
              Look Beyond Traditional Stocks and 7% Fixed Deposits.
            </h1>

            <p className="mt-5 text-base sm:text-xl text-slate-300 leading-relaxed max-w-2xl">
              Screen 4,200+ bank-seized SARFAESI properties at <span className="text-emerald-400 font-semibold">15-30% below market value</span>, compare post-tax NDCF yields on SEBI REITs, SM-REITs &amp; InvITs, and audit all 28 RBI NBFC-P2P licensees.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/properties"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm sm:text-base shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.01]"
              >
                <span>Browse Bank Auction Deals</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/reits"
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-slate-100 border border-slate-700 font-semibold text-sm sm:text-base transition-colors"
              >
                <span>REIT &amp; InvIT Screener</span>
              </Link>
              <Link
                href="/calculator"
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-emerald-400 border border-emerald-500/40 font-semibold text-sm sm:text-base transition-colors"
              >
                <span>Post-Tax Yield Comparator</span>
              </Link>
            </div>
          </div>

          {/* 3 Core Pillar Hub Cards (Self-Selection Within 5 Seconds) */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5">
            <Link
              href="/properties"
              className="group p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/80 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Hub 01 • Distressed Real Estate
                  </span>
                  <span className="text-xs font-extrabold text-emerald-400">15-30% Discount</span>
                </div>
                <h2 className="text-lg font-extrabold text-white group-hover:text-emerald-400 transition-colors">
                  SARFAESI Bank Auction Screener
                </h2>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  4,200+ active residential, commercial, and industrial foreclosures from SBI, PNB, Union Bank, BoB, and HDFC with circle-rate deal scores.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-emerald-400">
                <span>Search Auctions by City &amp; Bank</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>

            <Link
              href="/reits"
              className="group p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/80 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Hub 02 • Listed Yield Trusts
                  </span>
                  <span className="text-xs font-extrabold text-emerald-400">6.4% - 12.5% Yield</span>
                </div>
                <h2 className="text-lg font-extrabold text-white group-hover:text-emerald-400 transition-colors">
                  REIT, SM-REIT &amp; InvIT Screener
                </h2>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Compare Embassy, Mindspace, Brookfield, Nexus, PropShare SM-REIT, IndiGrid, and PowerGrid on post-tax Section 115UA NDCF splits.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-emerald-400">
                <span>Screen Post-Tax NDCF Yields</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>

            <Link
              href="/p2p/platforms"
              className="group p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/80 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    Hub 03 • Private Credit &amp; Bonds
                  </span>
                  <span className="text-xs font-extrabold text-emerald-400">9.0% - 13.5% XIRR</span>
                </div>
                <h2 className="text-lg font-extrabold text-white group-hover:text-emerald-400 transition-colors">
                  NBFC-P2P Watchdog &amp; SEBI OBPPs
                </h2>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Audit all 28 RBI-registered NBFC-P2P platforms on Named Bank Escrow Trustee, T+1 settlement verification, and public 90-day NPA reporting.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-emerald-400">
                <span>Open 28-Platform Watchdog</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. LIVE MARKET PULSE: AUCTION ACTIVITY FEED + LISTED REIT/InvIT YIELD TERMINAL */}
      <section className="py-16 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* 2A. Recent Auction Activity */}
          <div>
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-3">
                  <span>Live Terminal</span>
                  <span>•</span>
                  <span>IBAPI &amp; NSE Feeds</span>
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  Recent SARFAESI Auction Activity
                </h2>
                <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl">
                  New bank foreclosure listings, reserve price reductions, and properties concluded over the last 24 hours.
                </p>
              </div>
              <div className="mt-4 md:mt-0 flex items-center gap-4">
                <Link
                  href="/analytics"
                  className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900"
                >
                  Bank Analytics →
                </Link>
                <Link
                  href="/properties"
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  <span>View All Auctions</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
            <ActivityFeed limit={4} />
          </div>

          {/* 2B. Live Listed REIT, SM-REIT & InvIT Yield Snapshot */}
          <div className="pt-10 border-t border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  SEBI Registered Yield Trusts
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
                  Listed REIT, SM-REIT &amp; InvIT Post-Tax Yield Snapshot
                </h3>
              </div>
              <Link
                href="/reits"
                className="text-xs sm:text-sm font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
              >
                Open Full NDCF Tax-Split Screener →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {topYieldTrusts.map((trust) => (
                <Link
                  key={trust.id}
                  href="/reits"
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-emerald-400 hover:bg-white transition-all flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-sm">{trust.ticker}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                        {trust.occupancyPct}% Occ
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 truncate max-w-[190px]">
                      {trust.name}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      Tax-Free Div + RoC: {trust.taxSplit.dividendPct + trust.taxSplit.returnOfCapitalPct}%
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs text-slate-400">Net (30% Slab)</div>
                    <div className="text-lg font-extrabold text-emerald-700">
                      {trust.postTax30.netYieldPct.toFixed(2)}%
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Gross: {trust.distributionYieldPct.toFixed(2)}%
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* 2C. Quick Alert Lead Capture Box */}
          <QuickAlertBox
            variant="dark"
            title="Get Weekly Top 5 Below-Market Bank Auctions & Regulated Yield Digest"
            subtitle="Receive curated SARFAESI property reserve-price drops, SEBI REIT/SM-REIT yield breakdowns, and RBI NBFC-P2P compliance alerts."
          />
        </div>
      </section>

      {/* 3. INTERACTIVE POST-TAX ASSET CLASS COMPARATOR */}
      <section className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <HomePostTaxTable />
        </div>
      </section>

      {/* 4. AUCTION DEALS SPOTLIGHT & PROGRAMMATIC CITY/BANK ENTRY POINTS */}
      <section className="py-20 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider mb-3">
                <span>Distressed Real Estate Hub</span>
                <span>•</span>
                <span>SARFAESI Act 2002</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Browse Bank-Seized Auctions by City &amp; Lender
              </h2>
              <p className="mt-2 text-base text-slate-600 max-w-2xl leading-relaxed">
                Jump directly into localized SARFAESI auction directories benchmarked against State IGR Ready Reckoner and Circle Rates.
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link
                href="/properties"
                className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
              >
                <span>Open Full Auction Screener</span>
                <span>→</span>
              </Link>
            </div>
          </div>

          {/* City & Bank Directory Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-12">
            {[
              { slug: 'mumbai', name: 'Mumbai', rate: 'IGR Ready Reckoner' },
              { slug: 'delhi', name: 'Delhi NCR', rate: 'Delhi Circle Rate' },
              { slug: 'bangalore', name: 'Bangalore', rate: 'Kaveri Guidance' },
              { slug: 'hyderabad', name: 'Hyderabad', rate: 'Telangana IGR' },
              { slug: 'chennai', name: 'Chennai', rate: 'TNREGINET Value' },
              { slug: 'pune', name: 'Pune', rate: 'Maharashtra IGR' },
              { slug: 'kolkata', name: 'Kolkata', rate: 'WB Circle Rate' },
              { slug: 'ahmedabad', name: 'Ahmedabad', rate: 'Gujarat Jantri' },
              { slug: 'jaipur', name: 'Jaipur', rate: 'Rajasthan DLC' },
              { slug: 'lucknow', name: 'Lucknow', rate: 'UP Collector Rate' },
            ].map((c) => (
              <Link
                key={c.slug}
                href={`/properties/city/${c.slug}`}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-emerald-500 hover:bg-white transition-all"
              >
                <div className="font-bold text-slate-900 text-sm">{c.name} Auctions</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{c.rate}</div>
              </Link>
            ))}
          </div>

          {/* Step-by-Step Bidding Framework */}
          <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white">
            <div className="max-w-3xl mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Participation Blueprint
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                How to Acquire Bank-Seized Properties
              </h3>
              <p className="text-sm text-slate-400 mt-2">
                A structured 4-stage process to evaluate, register, and win property auctions with institutional rigor.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-slate-800/70 border border-slate-700/60 p-5 rounded-2xl">
                <div className="w-8 h-8 rounded-lg bg-emerald-600/30 text-emerald-400 flex items-center justify-center font-bold text-sm mb-3">
                  01
                </div>
                <h4 className="font-bold text-white text-base mb-1">Search &amp; Screen</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Filter listings by city, bank, reserve price, and property category on InvestNest to calculate fair value.
                </p>
              </div>

              <div className="bg-slate-800/70 border border-slate-700/60 p-5 rounded-2xl">
                <div className="w-8 h-8 rounded-lg bg-emerald-600/30 text-emerald-400 flex items-center justify-center font-bold text-sm mb-3">
                  02
                </div>
                <h4 className="font-bold text-white text-base mb-1">Physical &amp; Legal Check</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Inspect physical site, assess municipal tax receipts, and verify physical vs symbolic possession with the designated branch officer.
                </p>
              </div>

              <div className="bg-slate-800/70 border border-slate-700/60 p-5 rounded-2xl">
                <div className="w-8 h-8 rounded-lg bg-emerald-600/30 text-emerald-400 flex items-center justify-center font-bold text-sm mb-3">
                  03
                </div>
                <h4 className="font-bold text-white text-base mb-1">Register &amp; Deposit EMD</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Submit 10% Earnest Money Deposit into MSTC Global Wallet or bank nodal account 48-72h prior to the scheduled bidding date.
                </p>
              </div>

              <div className="bg-slate-800/70 border border-slate-700/60 p-5 rounded-2xl">
                <div className="w-8 h-8 rounded-lg bg-emerald-600/30 text-emerald-400 flex items-center justify-center font-bold text-sm mb-3">
                  04
                </div>
                <h4 className="font-bold text-white text-base mb-1">E-Auction &amp; Transfer</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Bid digitally in real-time. Winning bidders remit 25% within 24 hours, settle the balance in 15 days, and receive the Sale Certificate.
                </p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-slate-400">
                Want detailed legal checklists? Review our step-by-step documentation.
              </span>
              <Link
                href="/learn/sarfaesi-auctions"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
              >
                <span>Read Complete Auction Masterclass</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FEATURED ASSET CLASSES GRID */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Complete 17-Asset Catalog
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                Regulated Alternative &amp; Fixed-Income Vehicles
              </h2>
              <p className="mt-2 text-slate-600 text-base">
                Deep-dive into SEBI/RBI regulations, 2026 capital gains tax splits, and platform access in India.
              </p>
            </div>
            <Link
              href="/products"
              className="mt-4 md:mt-0 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
            >
              Explore all {investmentProducts.length} investment products →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group p-6 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-600/5 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                      {product.subcategory}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      Risk: {product.riskLevel}/5
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors mb-2">
                    {product.name}
                  </h3>
                  <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed mb-6">
                    {product.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <div className="text-slate-400 font-medium">Expected Yield</div>
                    <div className="text-sm font-bold text-emerald-700 mt-0.5">{product.expectedReturns}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-slate-400 font-medium">Minimum Ticket</div>
                    <div className="text-sm font-bold text-slate-800 mt-0.5">
                      ₹{product.minInvestment.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
