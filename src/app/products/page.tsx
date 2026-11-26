'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { investmentProducts } from '@/data/products';

const categories = [
  { id: 'all', name: 'All Asset Classes' },
  { id: 'real-estate', name: 'Real Estate & Land' },
  { id: 'alternative', name: 'Alternative Credit' },
  { id: 'fixed-income', name: 'Fixed Income' },
  { id: 'commodity', name: 'Commodities & Gold' },
  { id: 'traditional', name: 'Equities & ETFs' },
];

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState(searchParams?.get('category') || 'all');

  useEffect(() => {
    const cat = searchParams?.get('category');
    if (cat) setSelectedCategory(cat);
  }, [searchParams]);

  const filteredProducts = selectedCategory === 'all'
    ? investmentProducts
    : investmentProducts.filter(p => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Banner */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
              Comprehensive Indian Investment Catalog
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Alternative & Traditional Asset Classes
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">
              Understand the mechanics, expected yield, taxation, and SEBI/RBI regulatory structures for every investment option available in India.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Pill Filters (Groww style) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none mb-6">
          {categories.map(cat => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:text-slate-900'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        <div className="text-xs text-slate-500 font-medium mb-6">
          Showing {filteredProducts.length} of {investmentProducts.length} curated asset classes
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => {
            const isAuction = product.id === 'sarfaesi-properties';

            return (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className={`group bg-white rounded-2xl border p-6 hover:shadow-xl transition-all flex flex-col justify-between ${
                  isAuction
                    ? 'border-amber-300 ring-1 ring-amber-200 hover:border-amber-400'
                    : 'border-slate-200 hover:border-emerald-500'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {product.subcategory}
                    </span>
                    {isAuction && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                        Top Opportunity
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors mb-2">
                    {product.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed mb-6">
                    {product.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Expected Returns</span>
                    <span className="font-bold text-emerald-700">{product.expectedReturns}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Min. Investment</span>
                    <span className="font-semibold text-slate-800">
                      ₹{product.minInvestment.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Risk Level</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <span
                          key={lvl}
                          className={`w-2 h-2 rounded-full ${
                            lvl <= product.riskLevel
                              ? product.riskLevel >= 4 ? 'bg-amber-500' : 'bg-emerald-600'
                              : 'bg-slate-200'
                          }`}
                        />
                      ))}
                      <span className="text-slate-500 font-semibold ml-1">{product.riskLevel}/5</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <ProductsPageContent />
    </Suspense>
  );
}
