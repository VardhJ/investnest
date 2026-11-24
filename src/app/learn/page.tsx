import Link from 'next/link';

const articles = [
  {
    title: 'MSTC E-Auction — Complete Buyer Registration & Bidding Guide',
    slug: 'mstc-e-auction-guide',
    description: 'Step-by-step guide to registering and bidding on MSTC e-auction platform for bank-seized properties.',
    category: 'Real Estate',
    readTime: '12 min',
  },
  {
    title: 'What are SARFAESI Auctions? Complete Guide',
    slug: 'sarfaesi-auctions',
    description: 'Learn how banks sell seized properties at 15-30% below market value. Complete step-by-step guide.',
    category: 'Real Estate',
    readTime: '8 min',
  },
  {
    title: 'How to Invest in REITs in India',
    slug: 'invest-reits-india',
    description: 'Complete guide to investing in Real Estate Investment Trusts.',
    category: 'Real Estate',
    readTime: '7 min',
  },
  {
    title: 'P2P Lending: Higher Returns, Higher Risk',
    slug: 'p2p-lending-guide',
    description: 'Everything you need to know about peer-to-peer lending platforms.',
    category: 'Alternative',
    readTime: '6 min',
  },
  {
    title: 'Invoice Discounting Explained',
    slug: 'invoice-discounting',
    description: 'How trade finance works and how you can earn 10-13% in 30-90 days.',
    category: 'Alternative',
    readTime: '5 min',
  },
  {
    title: 'Fixed Deposits vs Mutual Funds',
    slug: 'fd-vs-mf',
    description: 'Which is better for your money? A detailed comparison.',
    category: 'Traditional',
    readTime: '8 min',
  },
  {
    title: 'How to Evaluate a Property Before Buying',
    slug: 'property-evaluation',
    description: 'Checklist for due diligence on real estate purchases.',
    category: 'Real Estate',
    readTime: '10 min',
  },
  {
    title: 'Understanding Risk in Investments',
    slug: 'understanding-risk',
    description: 'What is risk, how to measure it, and how to manage it.',
    category: 'Basics',
    readTime: '6 min',
  },
  {
    title: 'Tax on Investments in India',
    slug: 'tax-on-investments',
    description: 'Complete guide to capital gains, dividends, and interest taxation.',
    category: 'Basics',
    readTime: '9 min',
  },
  {
    title: 'Credit Score in India — Complete Guide',
    slug: 'credit-score-guide',
    description: 'How credit scores work, why they matter, and how to improve yours.',
    category: 'Basics',
    readTime: '6 min',
  },
  {
    title: 'SIP in Mutual Funds — How to Start',
    slug: 'mutual-fund-sip',
    description: 'Everything about Systematic Investment Plans — returns, strategies, and mistakes to avoid.',
    category: 'Traditional',
    readTime: '7 min',
  },
  {
    title: 'How to Participate in E-Auctions in India',
    slug: 'e-auction-guide',
    description: 'Step-by-step guide to participating in bank e-auctions for seized properties.',
    category: 'Real Estate',
    readTime: '8 min',
  },
  {
    title: 'Best Cities for Real Estate Investment (2026)',
    slug: 'best-cities-real-estate',
    description: 'Top 10 cities for real estate investment in India based on yields and appreciation.',
    category: 'Real Estate',
    readTime: '7 min',
  },
  {
    title: 'Gold vs Real Estate — Which is Better?',
    slug: 'gold-vs-real-estate',
    description: 'Comprehensive comparison of gold and real estate as investments.',
    category: 'Investment Comparison',
    readTime: '7 min',
  },
  {
    title: 'NPS vs PPF — Which is Better for Retirement?',
    slug: 'nps-vs-ppf',
    description: 'Compare NPS and PPF for retirement planning — returns, tax benefits, and lock-in.',
    category: 'Retirement',
    readTime: '7 min',
  },
  {
    title: 'Emergency Fund — How Much and Where to Keep It',
    slug: 'emergency-fund',
    description: 'Complete guide to building and maintaining an emergency fund.',
    category: 'Basics',
    readTime: '5 min',
  },
  {
    title: 'How to Participate in E-Auctions in India',
    slug: 'e-auction-participation',
    description: 'Step-by-step guide to participating in bank e-auctions for seized properties.',
    category: 'Real Estate',
    readTime: '8 min',
  },
  {
    title: 'Best Cities for Real Estate Investment (2026)',
    slug: 'best-cities-real-estate-2026',
    description: 'Top 10 cities for real estate investment in India based on yields and appreciation.',
    category: 'Real Estate',
    readTime: '7 min',
  },
  {
    title: 'How to Check Property Title Before Buying',
    slug: 'sarfaesi-title-check',
    description: 'Complete checklist for property title verification — essential for SARFAESI buyers.',
    category: 'Real Estate',
    readTime: '9 min',
  },
];

export default function LearnPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold mb-2">Investment Education Hub</h1>
          <p className="text-gray-600">Learn about every investment product — from basics to advanced strategies</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map(article => (
            <Link key={article.slug} href={`/learn/${article.slug}`} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded">{article.category}</span>
                <span className="text-gray-500 text-xs">{article.readTime} read</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">{article.title}</h3>
              <p className="text-gray-600 text-sm">{article.description}</p>
            </Link>
          ))}
        </div>

        {/* SARFAESI Guide CTA */}
        <div className="mt-12 bg-blue-600 rounded-xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-3">New to Bank-Seized Properties?</h2>
          <p className="mb-6 text-blue-100">
            Read our complete guide on how SARFAESI auctions work, how to participate, and how to avoid common mistakes.
          </p>
          <Link href="/learn/sarfaesi-auctions" className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition inline-block">
            Read the Guide →
          </Link>
        </div>
      </div>
    </div>
  );
}