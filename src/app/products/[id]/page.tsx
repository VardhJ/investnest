import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { investmentProducts } from '@/data/products';
import JsonLd from '@/components/JsonLd';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = investmentProducts.find(p => p.id === id);
  if (!product) return {};
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.investnest.in';
  return {
    title: `${product.name} - Returns, Risk & Taxation`,
    description: product.description?.slice(0, 160) || `Learn about ${product.name}: expected returns, risk, taxation, and regulation in India.`,
    alternates: { canonical: `${siteUrl}/products/${product.id}` },
  };
}

export function generateStaticParams() {
  return investmentProducts.map(product => ({ id: product.id }));
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = investmentProducts.find(p => p.id === id);

  if (!product) {
    notFound();
  }

  const liquidityLabels: Record<string, string> = {
    'high': 'High (Exchange Liquidity / Immediate)',
    'medium': 'Medium (Secondary Sale or 30-90 Days)',
    'low': 'Low (Private SPV or Fixed Tenure)',
    'very-low': 'Very Low (Physical Real Estate / Multi-Year)',
  };

  const isAuction = product.id === 'sarfaesi-properties';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.investnest.in';

  return (
    <div className="min-h-screen bg-slate-50 py-8 lg:py-12">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          description: product.description,
          category: product.category,
          url: `${siteUrl}/products/${product.id}`,
          brand: { '@type': 'Brand', name: 'InvestNest' },
        }}
      />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-xs font-medium text-slate-500">
          <Link href="/products" className="hover:text-emerald-700 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>All Asset Classes</span>
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold">{product.name}</span>
        </div>

        {/* Hero Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                  {product.category}
                </span>
                <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {product.subcategory}
                </span>
                {isAuction && (
                  <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-amber-500 text-white">
                    Key Highlight
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {product.name}
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
                {product.description}
              </p>
            </div>

            {isAuction && (
              <div className="shrink-0">
                <Link
                  href="/properties"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-sm inline-flex items-center gap-2"
                >
                  <span>Browse Live Auctions</span>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            )}
          </div>

          {/* Metric Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-slate-100">
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-100">
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Expected Returns</div>
              <div className="text-lg sm:text-xl font-extrabold text-emerald-700 mt-1">
                {product.expectedReturns}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Min. Investment</div>
              <div className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
                ₹{product.minInvestment.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Risk Profile</div>
              <div className="text-lg sm:text-xl font-bold text-slate-900 mt-1 flex items-center gap-1.5">
                <span>{product.riskLevel} / 5</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Liquidity Horizon</div>
              <div className="text-xs font-bold text-slate-800 mt-1.5 leading-snug">
                {liquidityLabels[product.liquidity] || product.liquidity}
              </div>
            </div>
          </div>
        </div>

        {/* Content Breakdown */}
        <div className="space-y-8">
          {/* How it works */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
            <h2 className="text-lg font-bold text-slate-900 mb-3">How It Works in India</h2>
            <p className="text-sm text-slate-700 leading-relaxed">
              {product.howItWorks}
            </p>
          </div>

          {/* Time Horizon & Tax Implications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="text-base font-bold text-slate-900 mb-2">Recommended Time Horizon</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {product.timeHorizon}
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="text-base font-bold text-slate-900 mb-2">Indian Tax Implications</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {product.taxImplications}
              </p>
            </div>
          </div>

          {/* Who Should Invest */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-base font-bold text-slate-900 mb-2">Investor Suitability</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {product.whoShouldInvest}
            </p>
          </div>

          {/* Pros and Cons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-emerald-200 p-6">
              <div className="flex items-center gap-2 mb-4 text-emerald-800 font-bold text-base">
                <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span>Key Advantages</span>
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                {product.pros.map((pro, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-rose-200 p-6">
              <div className="flex items-center gap-2 mb-4 text-rose-800 font-bold text-base">
                <svg className="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Risks & Limitations</span>
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                {product.cons.map((con, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Platforms to Access */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-base font-bold text-slate-900 mb-3">Regulated Channels & Platforms in India</h3>
            <div className="flex flex-wrap gap-2">
              {product.platforms.map((platform) => (
                <span
                  key={platform}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-semibold"
                >
                  {platform}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
