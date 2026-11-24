import Link from 'next/link';
import { investmentProducts } from '@/data/products';

export default function Home() {
  const realEstateProducts = investmentProducts.filter(p => p.category === 'real-estate');
  const alternativeProducts = investmentProducts.filter(p => p.category === 'alternative');
  const featuredProducts = investmentProducts.filter(p => 
    ['sarfaesi-properties', 'reits', 'invoice-discounting', 'fractional-real-estate', 'p2p-lending', 'invits'].includes(p.id)
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-slate-950 text-white pt-16 pb-24 lg:pt-24 lg:pb-32">
        {/* Ambient Gradient Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(5,150,105,0.18),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(16,185,129,0.12),transparent_40%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Alternative Investment Discovery Platform
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
              Look Beyond Traditional Stocks and 7% Fixed Deposits.
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-slate-300 leading-relaxed max-w-2xl">
              Discover distressed bank-seized properties at <span className="text-emerald-400 font-semibold">15-30% below market value</span>, listed commercial REITs, corporate invoice discounting, and high-yield alternative assets.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                href="/properties"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-base shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.01]"
              >
                <span>Browse Bank Auction Deals</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-base transition-colors"
              >
                Explore 16 Asset Classes
              </Link>
            </div>

            {/* Quick Metrics */}
            <div className="mt-12 pt-8 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-6">
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white">15-30%</div>
                <div className="text-xs sm:text-sm text-slate-400 font-medium mt-0.5">Average Auction Discount</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white">500+</div>
                <div className="text-xs sm:text-sm text-slate-400 font-medium mt-0.5">SARFAESI Properties Tracked</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white">10-14%</div>
                <div className="text-xs sm:text-sm text-slate-400 font-medium mt-0.5">Alternative Asset Yields</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">100% Free</div>
                <div className="text-xs sm:text-sm text-slate-400 font-medium mt-0.5">Open Access Discovery</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. AUCTION DEALS SPOTLIGHT (CORE FOCUS) */}
      <section className="py-20 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider mb-3">
                <span>Featured Category</span>
                <span>•</span>
                <span>SARFAESI Act 2002</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Bank-Seized Auction Properties
              </h2>
              <p className="mt-3 text-base text-slate-600 max-w-2xl leading-relaxed">
                When borrowers default on secured loans, public and private sector banks (SBI, PNB, HDFC, ICICI) recover capital by auctioning distressed residential, commercial, and industrial real estate directly to registered public bidders.
              </p>
            </div>
            <div className="mt-6 md:mt-0">
              <Link
                href="/properties"
                className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800 group"
              >
                <span>View all verified auctions</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Value Proposition Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold mb-4">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Discounted Reserve Prices</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Banks price auctions to recover the principal loan amount rather than speculative market peaks. This creates discounts between 15% to 30% against prevailing circle rates.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold mb-4">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Direct Bank Title Transfer</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Sales are executed directly under statutory authority with a Bank Sale Certificate, establishing clean conveyance free from prior non-statutory mortgagor encumbrances.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold mb-4">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Standardized E-Auctions</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Regulated bidding conducted via national platforms (MSTC and IBAPI). Transparent bidding increments, public dates, and structured Earnest Money Deposit (EMD) escrow.
              </p>
            </div>
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
                <h4 className="font-bold text-white text-base mb-1">Search & Screen</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Filter listings by city, bank, reserve price, and property category on InvestNest to calculate fair value.
                </p>
              </div>

              <div className="bg-slate-800/70 border border-slate-700/60 p-5 rounded-2xl">
                <div className="w-8 h-8 rounded-lg bg-emerald-600/30 text-emerald-400 flex items-center justify-center font-bold text-sm mb-3">
                  02
                </div>
                <h4 className="font-bold text-white text-base mb-1">Physical & Legal Check</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Inspect physical site, assess municipal tax receipts, and verify physical vs symbolic possession with the designated branch officer.
                </p>
              </div>

              <div className="bg-slate-800/70 border border-slate-700/60 p-5 rounded-2xl">
                <div className="w-8 h-8 rounded-lg bg-emerald-600/30 text-emerald-400 flex items-center justify-center font-bold text-sm mb-3">
                  03
                </div>
                <h4 className="font-bold text-white text-base mb-1">Register & Deposit EMD</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Submit 10% Earnest Money Deposit into MSTC Global Wallet or bank nodal account 48-72h prior to the scheduled bidding date.
                </p>
              </div>

              <div className="bg-slate-800/70 border border-slate-700/60 p-5 rounded-2xl">
                <div className="w-8 h-8 rounded-lg bg-emerald-600/30 text-emerald-400 flex items-center justify-center font-bold text-sm mb-3">
                  04
                </div>
                <h4 className="font-bold text-white text-base mb-1">E-Auction & Transfer</h4>
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
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ASSET CLASS COMPARISON (DEZERV STYLE) */}
      <section className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Portfolio Diversification
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Alternative Yield vs Traditional Instruments
            </h2>
            <p className="mt-3 text-slate-600 text-base leading-relaxed">
              Most Indian investors limit their capital to bank deposits, mutual funds, and gold. Here is how non-traditional asset classes compare on returns, minimum ticket size, and risk profile.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden text-sm">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-600">
                  <th className="py-4 px-6">Asset Class</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Expected Yield / Return</th>
                  <th className="py-4 px-6">Min. Ticket</th>
                  <th className="py-4 px-6">Liquidity</th>
                  <th className="py-4 px-6">Risk Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                <tr className="bg-emerald-50/40 hover:bg-emerald-50/70 transition-colors">
                  <td className="py-4 px-6 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-600" />
                      <span>SARFAESI Property Auctions</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-emerald-800 font-semibold">Real Estate</td>
                  <td className="py-4 px-6 text-emerald-700 font-bold">15-30% discount to market</td>
                  <td className="py-4 px-6">₹5,00,000</td>
                  <td className="py-4 px-6 text-slate-500">Low (Tangible)</td>
                  <td className="py-4 px-6">
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800">4 / 5</span>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6 font-semibold text-slate-900">Commercial REITs</td>
                  <td className="py-4 px-6 text-slate-500">Real Estate</td>
                  <td className="py-4 px-6 text-emerald-600 font-bold">6-9% dividend yield + growth</td>
                  <td className="py-4 px-6">₹10,000</td>
                  <td className="py-4 px-6 text-slate-600 font-semibold">High (Listed)</td>
                  <td className="py-4 px-6">
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-800">3 / 5</span>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6 font-semibold text-slate-900">Invoice Discounting</td>
                  <td className="py-4 px-6 text-slate-500">Alternative Debt</td>
                  <td className="py-4 px-6 text-emerald-600 font-bold">10-13% annualized</td>
                  <td className="py-4 px-6">₹1,00,000</td>
                  <td className="py-4 px-6 text-slate-600">Medium (30-90 Days)</td>
                  <td className="py-4 px-6">
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-800">3 / 5</span>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6 font-semibold text-slate-900">P2P Lending NBFCs</td>
                  <td className="py-4 px-6 text-slate-500">Alternative Debt</td>
                  <td className="py-4 px-6 text-emerald-600 font-bold">10-14% interest</td>
                  <td className="py-4 px-6">₹5,000</td>
                  <td className="py-4 px-6 text-slate-500">Low (Monthly EMI)</td>
                  <td className="py-4 px-6">
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800">4 / 5</span>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6 font-semibold text-slate-900">Fixed Deposits (Bank)</td>
                  <td className="py-4 px-6 text-slate-500">Traditional</td>
                  <td className="py-4 px-6 text-slate-600">6.5-7.5% fixed</td>
                  <td className="py-4 px-6">₹1,000</td>
                  <td className="py-4 px-6 text-slate-600">Medium</td>
                  <td className="py-4 px-6">
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800">1 / 5</span>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6 font-semibold text-slate-900">Public Equity (Nifty 50)</td>
                  <td className="py-4 px-6 text-slate-500">Traditional</td>
                  <td className="py-4 px-6 text-slate-600">10-14% CAGR (Volatile)</td>
                  <td className="py-4 px-6">₹100</td>
                  <td className="py-4 px-6 text-slate-600 font-semibold">High</td>
                  <td className="py-4 px-6">
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800">4 / 5</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 4. FEATURED PRODUCTS GRID (GROWW STYLE) */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Asset Intelligence
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                Curated Alternative Asset Classes
              </h2>
              <p className="mt-2 text-slate-600 text-base">
                Deep-dive into regulations, expected returns, and platform access in India.
              </p>
            </div>
            <Link
              href="/products"
              className="mt-4 md:mt-0 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
            >
              Explore all 16 investment products →
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

      {/* 5. CALL TO ACTION BANNER */}
      <section className="py-16 bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(5,150,105,0.2),transparent_50%)] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-2xl">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Start Discovering Deals Right Now.
            </h2>
            <p className="mt-4 text-base text-slate-300 leading-relaxed">
              No registration or phone number required to browse property auction records, inspect reserve prices, and analyze alternative assets.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                href="/properties"
                className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-semibold text-white text-center transition-colors shadow-lg shadow-emerald-600/30"
              >
                Search Live Auction Properties
              </Link>
              <Link
                href="/calculator"
                className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 font-semibold text-slate-200 text-center transition-colors"
              >
                Open Yield Calculator
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
