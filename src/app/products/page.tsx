'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { investmentProducts } from '@/data/products';

const categories = [
  { id: 'all', name: 'All Products' },
  { id: 'real-estate', name: 'Real Estate' },
  { id: 'traditional', name: 'Stocks & MFs' },
  { id: 'alternative', name: 'Alternative' },
  { id: 'fixed-income', name: 'Fixed Income' },
  { id: 'commodity', name: 'Commodities' },
];

export default function ProductsPage() {
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
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold mb-2">Investment Products</h1>
          <p className="text-gray-600">Understand every investment option available in India — from stocks to bank-seized properties</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border hover:bg-blue-50 hover:border-blue-300'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="text-sm text-gray-500 mb-4">
          Showing {filteredProducts.length} of {investmentProducts.length} products
        </div>

        {/* Product Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <Link key={product.id} href={`/products/${product.id}`} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition border border-gray-100">
              <div className="flex items-start gap-4">
                <div className="text-4xl">{product.icon}</div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded font-medium">{product.expectedReturns}</span>
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">Risk: {product.riskLevel}/5</span>
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">Min: ₹{product.minInvestment.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-600 text-lg">No products in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}