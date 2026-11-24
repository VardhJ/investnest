import Link from 'next/link';

const articles = [
  {
    title: 'How Our AI Deal Score Works — Methodology Explained',
    slug: 'deal-score-logic',
    description: 'Understand how InvestNest calculates deal scores, ROI estimates, and risk factors for properties.',
    category: 'InvestNest',
    readTime: '6 min',
  },
  {
    title: 'MSTC E-Auction — Complete Buyer Registration & Bidding Guide',
    slug: 'mstc-e-auction-guide',
    description: 'Step-by-step institutional guide to registering and bidding on the official MSTC e-auction portal for bank-seized properties.',
    category: 'Bank Auctions',
    readTime: '12 min',
    featured: true,
  },
  {
    title: 'What are SARFAESI Auctions? Complete Legal & Due Diligence Guide',
    slug: 'sarfaesi-auctions',
    description: 'How Indian banks auction seized borrower real estate at 15-30% below circle rates without litigation delays.',
    category: 'Bank Auctions',
    readTime: '8 min',
    featured: true,
  },
  {
    title: 'How to Check Property Title Before Bidding in Bank Auctions',
    slug: 'sarfaesi-title-check',
    description: 'A 30-year due diligence checklist for property title verification, encumbrances, and symbolic vs physical possession.',
    category: 'Due Diligence',
    readTime: '9 min',
    featured: true,
  },
  {
    title: 'How to Invest in REITs in India',
    slug: 'invest-reits-india',
    description: 'Complete playbook on commercial Real Estate Investment Trusts, quarterly dividend yields, and taxation.',
    category: 'Real Estate',
    readTime: '7 min',
  },
  {
    title: 'Invoice Discounting Explained',
    slug: 'invoice-discounting',
    description: 'How corporate invoice trade finance works and how accredited individuals earn 10-13% annualized returns in 30-90 days.',
    category: 'Alternative Debt',
    readTime: '5 min',
  },
  {
    title: 'P2P Lending: Higher Returns, Calibrated Credit Risk',
    slug: 'p2p-lending-guide',
    description: 'Everything you need to know about RBI-registered NBFC-P2P lending platforms, default mitigation, and diversification.',
    category: 'Alternative Debt',
    readTime: '6 min',
  },
  {
    title: 'Fixed Deposits vs Mutual Funds',
    slug: 'fd-vs-mf',
    description: 'An empirical comparison of capital safety vs inflation-adjusted wealth compounding across 5 and 10-year horizons.',
    category: 'Traditional Assets',
    readTime: '8 min',
  },
  {
    title: 'How to Evaluate a Property Before Buying',
    slug: 'property-evaluation',
    description: 'Structural inspection, municipal compliance, and rental yield forecasting checklist for Indian real estate.',
    category: 'Real Estate',
    readTime: '10 min',
  },
  {
    title: 'Taxation of Alternative Investments in India',
    slug: 'tax-on-investments',
    description: 'Capital gains, dividend distributions, and withholding tax structures for non-traditional asset classes.',
    category: 'Regulations & Tax',
    readTime: '9 min',
  },
  {
    title: 'Gold vs Real Estate — Which is Better for Long-Term Wealth?',
    slug: 'gold-vs-real-estate',
    description: 'Historical yield analysis, liquidity comparison, and portfolio allocation principles for physical vs paper assets.',
    category: 'Strategy',
    readTime: '7 min',
  },
  {
    title: 'NPS vs PPF — Retirement Planning Blueprint',
    slug: 'nps-vs-ppf',
    description: 'Comparing Tier 1 National Pension Scheme and Public Provident Fund on tax exemptions (EEE status), lock-in, and yields.',
    category: 'Retirement',
    readTime: '7 min',
  },
  {
    title: 'Emergency Fund — Sizing and Liquid Allocation',
    slug: 'emergency-fund',
    description: 'How much liquidity to maintain in arbitrage funds and overnight instruments before exploring alternative illiquid yield.',
    category: 'Basics',
    readTime: '5 min',
  },
];

export default function LearnPage() {
  const featured = articles.filter(a => a.featured);
  const standard = articles.filter(a => !a.featured);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
              Research & Education
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Alternative Investment Intelligence Hub
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">
              Institutional diligence checklists, SARFAESI auction bidding procedures, and regulatory frameworks curated for Indian investors.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Featured Guides: SARFAESI Focus */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Essential Bank Auction Masterclasses
            </h2>
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
              Must-Read Before Bidding
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featured.map((article) => (
              <Link
                key={article.slug}
                href={`/learn/${article.slug}`}
                className="group bg-white rounded-2xl border border-slate-200 p-6 hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-600/5 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="font-bold text-emerald-700 uppercase tracking-wider">
                      {article.category}
                    </span>
                    <span className="text-slate-400 font-medium">
                      {article.readTime}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-700 transition-colors mb-2 leading-snug">
                    {article.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                    {article.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-6 flex items-center justify-between text-xs font-semibold text-emerald-700">
                  <span>Read Article</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* General Asset Guides */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-6">
            Asset Class & Portfolio Guides
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {standard.map((article) => (
              <Link
                key={article.slug}
                href={`/learn/${article.slug}`}
                className="group bg-white rounded-2xl border border-slate-200 p-6 hover:border-slate-400 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="font-bold text-slate-500 uppercase tracking-wider">
                      {article.category}
                    </span>
                    <span className="text-slate-400 font-medium">
                      {article.readTime}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-700 transition-colors mb-2 leading-snug">
                    {article.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-2">
                    {article.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs font-semibold text-slate-700 group-hover:text-emerald-700">
                  <span>Explore Guide</span>
                  <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="rounded-2xl bg-slate-900 text-white p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="max-w-xl">
            <h3 className="text-xl font-bold text-white">Ready to Put This Knowledge Into Practice?</h3>
            <p className="text-sm text-slate-400 mt-1">
              Browse over 500+ bank auction properties currently scheduled across Indian metropolitan cities.
            </p>
          </div>
          <Link
            href="/properties"
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 font-semibold text-white rounded-xl text-sm transition shrink-0 shadow-sm"
          >
            Browse Auction Deals
          </Link>
        </div>
      </div>
    </div>
  );
}
