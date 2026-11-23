import Link from 'next/link';
import { investmentProducts } from '@/data/products';

const categories = [
  { id: 'all', name: 'All Products' },
  { id: 'traditional', name: 'Traditional' },
  { id: 'real-estate', name: 'Real Estate' },
  { id: 'alternative', name: 'Alternative' },
  { id: 'fixed-income', name: 'Fixed Income' },
  { id: 'commodity', name: 'Commodities' },
];

export default function ProductsPage() {
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
            <Link
              key={cat.id}
              href={cat.id === 'all' ? '/products' : `/products?category=${cat.id}`}
              className="px-4 py-2 rounded-full text-sm font-medium bg-white border hover:bg-blue-50 hover:border-blue-300 transition"
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {investmentProducts.map(product => (
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
      </div>
    </div>
  );
}