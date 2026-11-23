import Link from 'next/link';
import { notFound } from 'next/navigation';
import { investmentProducts } from '@/data/products';

export function generateStaticParams() {
  return investmentProducts.map(product => ({ id: product.id }));
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = investmentProducts.find(p => p.id === id);

  if (!product) {
    notFound();
  }

  const riskColors = ['', 'bg-green-500', 'bg-green-400', 'bg-yellow-500', 'bg-orange-500', 'bg-red-500'];
  const liquidityLabels: Record<string, string> = {
    'high': 'High (sell anytime)',
    'medium': 'Medium (few days)',
    'low': 'Low (weeks to months)',
    'very-low': 'Very Low (months to years)',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/products" className="text-blue-600 hover:underline mb-4 inline-block">← Back to Products</Link>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="text-5xl">{product.icon}</div>
            <div>
              <h1 className="text-3xl font-bold">{product.name}</h1>
              <p className="text-gray-600 mt-1">{product.description}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">{product.category}</span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">{product.subcategory}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-gray-600">Expected Returns</div>
              <div className="text-lg font-bold text-green-600">{product.expectedReturns}</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-gray-600">Min Investment</div>
              <div className="text-lg font-bold text-blue-600">₹{product.minInvestment.toLocaleString('en-IN')}</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="text-sm text-gray-600">Risk Level</div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${riskColors[product.riskLevel]}`}></div>
                <span className="text-lg font-bold">{product.riskLevel}/5</span>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600">Liquidity</div>
              <div className="text-lg font-bold">{liquidityLabels[product.liquidity]}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold mb-3">How It Works</h2>
          <p className="text-gray-700">{product.howItWorks}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold mb-3">Time Horizon</h2>
            <p className="text-gray-700">{product.timeHorizon}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold mb-3">Tax Implications</h2>
            <p className="text-gray-700">{product.taxImplications}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold mb-3">Who Should Invest?</h2>
          <p className="text-gray-700">{product.whoShouldInvest}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold mb-3 text-green-600">Pros</h2>
            <ul className="space-y-2">
              {product.pros.map((pro, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-500 mt-0.5">✓</span> {pro}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold mb-3 text-red-600">Cons</h2>
            <ul className="space-y-2">
              {product.cons.map((con, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-700">
                  <span className="text-red-500 mt-0.5">✗</span> {con}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold mb-3">Where to Invest</h2>
          <div className="flex flex-wrap gap-2">
            {product.platforms.map(platform => (
              <span key={platform} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                {platform}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
          <strong>Disclaimer:</strong> This information is for educational purposes only and does not constitute financial advice.
          Investments are subject to market risks. Please consult a SEBI-registered financial advisor before making investment decisions.
        </div>
      </div>
    </div>
  );
}