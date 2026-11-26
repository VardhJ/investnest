'use client';

import { useState } from 'react';
import Link from 'next/link';
import QuickAlertBox from '@/components/QuickAlertBox';

type HubTag = 'all' | 'distressed-re' | 'yield-trusts' | 'private-credit' | 'tax-strategy';

interface ArticleMeta {
  title: string;
  slug: string;
  description: string;
  category: string;
  hub: HubTag;
  readTime: string;
  featured?: boolean;
  screenerLink: { label: string; href: string };
}

const articles: ArticleMeta[] = [
  {
    title: 'MSTC E-Auction - Complete Buyer Registration & Bidding Guide',
    slug: 'mstc-e-auction-guide',
    description:
      'Step-by-step institutional guide to KYC verification, Global EMD Wallet funding, and real-time bidding on the official MSTC and IBAPI e-auction portals.',
    category: 'Bank Auctions',
    hub: 'distressed-re',
    readTime: '12 min',
    featured: true,
    screenerLink: { label: 'Browse Live Bank Auctions', href: '/properties' },
  },
  {
    title: 'What are SARFAESI Auctions? Complete Legal & Due Diligence Guide',
    slug: 'sarfaesi-auctions',
    description:
      'How Indian scheduled banks foreclose and auction defaulted real estate at 15-30% below circle rates under Section 13(4) of the SARFAESI Act 2002.',
    category: 'Bank Auctions',
    hub: 'distressed-re',
    readTime: '8 min',
    featured: true,
    screenerLink: { label: 'Open SARFAESI Property Screener', href: '/properties' },
  },
  {
    title: 'How to Check Property Title Before Bidding in Bank Auctions',
    slug: 'sarfaesi-title-check',
    description:
      'A 30-year sub-registrar due diligence checklist covering Form 15/16 encumbrances, CERSAI charge search, society dues, and Symbolic vs Physical possession.',
    category: 'Due Diligence',
    hub: 'distressed-re',
    readTime: '9 min',
    featured: true,
    screenerLink: { label: 'Inspect Active Auction Notices', href: '/properties' },
  },
  {
    title: 'How Our Deal Score Works - Circle Rate & Valuation Methodology',
    slug: 'deal-score-logic',
    description:
      'Understand how InvestNest benchmarks reserve prices against State IGR Ready Reckoner rates, bank reliability, and EMD ratios.',
    category: 'Valuation Engine',
    hub: 'distressed-re',
    readTime: '6 min',
    screenerLink: { label: 'View Scored Auctions', href: '/properties' },
  },
  {
    title: 'E-Auction Participation Blueprint - From EMD to Sale Certificate',
    slug: 'e-auction-participation',
    description:
      'Complete timeline of the 10% EMD deposit, 25% next-day payment, 15-day balance settlement, and Bank Sale Certificate registration.',
    category: 'Bank Auctions',
    hub: 'distressed-re',
    readTime: '8 min',
    screenerLink: { label: 'Search Upcoming Auctions', href: '/properties' },
  },
  {
    title: 'Best Indian Cities for Real Estate Investment in 2026',
    slug: 'best-cities-real-estate-2026',
    description:
      'Comparative analysis of circle-rate discounts, commercial absorption, and infrastructure catalysts across Mumbai, Bengaluru, Hyderabad, and Pune.',
    category: 'Real Estate',
    hub: 'distressed-re',
    readTime: '9 min',
    screenerLink: { label: 'Explore City Auction Directories', href: '/properties' },
  },
  {
    title: 'How to Evaluate a Property Before Buying',
    slug: 'property-evaluation',
    description:
      'Structural inspection, municipal compliance, carpet area loading, and rental yield forecasting checklist for Indian real estate.',
    category: 'Real Estate',
    hub: 'distressed-re',
    readTime: '10 min',
    screenerLink: { label: 'Compare City Auctions', href: '/properties' },
  },
  {
    title: 'How to Invest in REITs, SM-REITs & InvITs in India',
    slug: 'invest-reits-india',
    description:
      'Complete playbook on commercial Real Estate Investment Trusts, SEBI SM-REIT fractional schemes, quarterly NDCF distributions, and Section 115UA taxation.',
    category: 'Yield Trusts',
    hub: 'yield-trusts',
    readTime: '7 min',
    screenerLink: { label: 'Open REIT & InvIT Post-Tax Screener', href: '/reits' },
  },
  {
    title: 'P2P Lending in India: RBI T+1 Escrow Rules & Credit Risk',
    slug: 'p2p-lending-guide',
    description:
      'How RBI-registered NBFC-P2P platforms work after the 2024-2026 Master Directions, T+1 bank-trustee escrow rules, and 90-day NPA evaluation.',
    category: 'Private Credit',
    hub: 'private-credit',
    readTime: '6 min',
    screenerLink: { label: 'Audit 28 Platforms in P2P Watchdog', href: '/p2p/platforms' },
  },
  {
    title: 'Invoice Discounting & Trade Receivables Explained',
    slug: 'invoice-discounting',
    description:
      'How corporate invoice trade finance works, institutional TReDS vs retail platforms, and credit risk evaluation.',
    category: 'Private Credit',
    hub: 'private-credit',
    readTime: '5 min',
    screenerLink: { label: 'Compare Fixed-Income Products', href: '/products' },
  },
  {
    title: 'Taxation of Alternative & Traditional Investments in India (2026 Rules)',
    slug: 'tax-on-investments',
    description:
      'Comprehensive guide to the 12.5% LTCG / 20% STCG framework, Section 115UA REIT/InvIT pass-through splits, OBPP bond TDS, and SGB maturity exemptions.',
    category: 'Regulations & Tax',
    hub: 'tax-strategy',
    readTime: '9 min',
    screenerLink: { label: 'Run Post-Tax Yield Calculator', href: '/calculator' },
  },
  {
    title: 'Fixed Deposits vs Mutual Funds vs Listed Bonds',
    slug: 'fd-vs-mf',
    description:
      'An empirical comparison of DICGC capital safety vs post-tax inflation-adjusted compounding across 3, 5, and 10-year horizons.',
    category: 'Tax & Strategy',
    hub: 'tax-strategy',
    readTime: '8 min',
    screenerLink: { label: 'Compare in Post-Tax Calculator', href: '/calculator' },
  },
  {
    title: 'Gold (SGB & ETFs) vs Real Estate - Long-Term Wealth Comparison',
    slug: 'gold-vs-real-estate',
    description:
      'Historical INR CAGR, secondary market SGB tax-free maturity rules, and liquidity comparison against physical property.',
    category: 'Tax & Strategy',
    hub: 'tax-strategy',
    readTime: '7 min',
    screenerLink: { label: 'Simulate SGB vs REIT Returns', href: '/calculator' },
  },
  {
    title: 'NPS vs PPF - Retirement Tax & Yield Blueprint',
    slug: 'nps-vs-ppf',
    description:
      'Comparing Tier 1 National Pension System and Public Provident Fund on EEE tax status, lock-in duration, and equity/debt allocation.',
    category: 'Tax & Strategy',
    hub: 'tax-strategy',
    readTime: '7 min',
    screenerLink: { label: 'Open Post-Tax Calculator', href: '/calculator' },
  },
  {
    title: 'Understanding Risk Across 17 Indian Asset Classes',
    slug: 'understanding-risk',
    description:
      'How to evaluate credit default risk, mark-to-market volatility, liquidity lock-ins, and regulatory protections across Indian investments.',
    category: 'Portfolio Strategy',
    hub: 'tax-strategy',
    readTime: '6 min',
    screenerLink: { label: 'Explore 17-Asset Catalog', href: '/products' },
  },
  {
    title: 'Emergency Fund Sizing Before Deploying Into Illiquid Alternatives',
    slug: 'emergency-fund',
    description:
      'How much liquidity to maintain in sweep FDs, T-Bills, and overnight funds before participating in SARFAESI auctions or SM-REITs.',
    category: 'Portfolio Strategy',
    hub: 'tax-strategy',
    readTime: '5 min',
    screenerLink: { label: 'Compare Sovereign T-Bills & FDs', href: '/products' },
  },
];

const HUB_TABS: { id: HubTag; label: string }[] = [
  { id: 'all', label: `All Research (${articles.length})` },
  { id: 'distressed-re', label: 'Hub 1: SARFAESI Bank Auctions (7)' },
  { id: 'yield-trusts', label: 'Hub 2: REITs, SM-REITs & InvITs' },
  { id: 'private-credit', label: 'Hub 3: P2P & Private Credit' },
  { id: 'tax-strategy', label: '2026 Taxation & Portfolio Strategy' },
];

export default function LearnPage() {
  const [selectedHub, setSelectedHub] = useState<HubTag>('all');

  const featured = articles.filter((a) => a.featured);
  const filteredArticles =
    selectedHub === 'all' ? articles : articles.filter((a) => a.hub === selectedHub);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
              Research &amp; Due Diligence Library
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Alternative Investment Intelligence Hub
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">
              Institutional diligence checklists, SARFAESI auction bidding protocols, SEBI REIT/SM-REIT taxation breakdowns, and RBI NBFC-P2P compliance guides.
            </p>
          </div>

          {/* Hub Filter Pills */}
          <div className="mt-6 flex flex-wrap items-center gap-2">
            {HUB_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedHub(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                  selectedHub === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Featured Guides: SARFAESI Focus (shown when All or Distressed RE selected) */}
        {(selectedHub === 'all' || selectedHub === 'distressed-re') && (
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
                <div
                  key={article.slug}
                  className="bg-white rounded-2xl border border-slate-200 p-6 hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-600/5 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-3">
                      <span className="font-bold text-emerald-700 uppercase tracking-wider">
                        {article.category}
                      </span>
                      <span className="text-slate-400 font-medium">{article.readTime}</span>
                    </div>
                    <Link href={`/learn/${article.slug}`}>
                      <h3 className="font-bold text-slate-900 text-base hover:text-emerald-700 transition-colors mb-2 leading-snug">
                        {article.title}
                      </h3>
                    </Link>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                      {article.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 mt-6 flex items-center justify-between text-xs">
                    <Link
                      href={`/learn/${article.slug}`}
                      className="font-bold text-emerald-700 hover:underline"
                    >
                      Read Dossier →
                    </Link>
                    <Link
                      href={article.screenerLink.href}
                      className="text-slate-500 hover:text-slate-900 font-semibold"
                    >
                      {article.screenerLink.label}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filtered Research Grid */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-6">
            {selectedHub === 'all'
              ? 'All Research Dossiers & Implementation Guides'
              : HUB_TABS.find((t) => t.id === selectedHub)?.label}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <div
                key={article.slug}
                className="bg-white rounded-2xl border border-slate-200 p-6 hover:border-slate-400 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="font-bold text-slate-500 uppercase tracking-wider">
                      {article.category}
                    </span>
                    <span className="text-slate-400 font-medium">{article.readTime}</span>
                  </div>
                  <Link href={`/learn/${article.slug}`}>
                    <h3 className="font-bold text-slate-900 text-base hover:text-emerald-700 transition-colors mb-2 leading-snug">
                      {article.title}
                    </h3>
                  </Link>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-2">
                    {article.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs">
                  <Link
                    href={`/learn/${article.slug}`}
                    className="font-bold text-emerald-700 hover:underline"
                  >
                    Read Guide →
                  </Link>
                  <Link
                    href={article.screenerLink.href}
                    className="text-slate-500 hover:text-emerald-700 font-semibold"
                  >
                    {article.screenerLink.label} →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lead Capture Box on Learn Hub */}
        <QuickAlertBox
          variant="dark"
          title="Get Weekly Research Dossiers & Below-Market Bank Auction Alerts"
          subtitle="Stay ahead of SEBI SM-REIT listings, RBI NBFC-P2P compliance shifts, and 20-30% discounted SARFAESI properties."
        />
      </div>
    </div>
  );
}
