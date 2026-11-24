import Link from 'next/link';
import { investmentProducts } from '@/data/products';

export default function Home() {
  const featuredProducts = investmentProducts.slice(0, 6);
  const realEstateProducts = investmentProducts.filter(p => p.category === 'real-estate');
  const alternativeProducts = investmentProducts.filter(p => p.category === 'alternative');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Find Bank-Seized Properties at 15-30% Below Market Value
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            4,200+ SARFAESI auction properties from SBI, PNB, HDFC, ICICI & more. Plus guides on REITs, P2P lending, and all investment products.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/properties" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition">
              Browse Auction Properties
            </Link>
            <Link href="/products" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition">
              Explore Investment Products
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">500+</div>
              <div className="text-gray-600">Auction Properties</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">20+</div>
              <div className="text-gray-600">Investment Products</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">15-30%</div>
              <div className="text-gray-600">Avg. Property Discount</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">Free</div>
              <div className="text-gray-600">To Use</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Investment Products */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Investment Products You Should Know About</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {featuredProducts.map(product => (
              <Link key={product.id} href={`/products/${product.id}`} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition border border-gray-100">
                <div className="text-4xl mb-3">{product.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-3">{product.description}</p>
                <div className="flex justify-between text-sm">
                  <span className="text-green-600 font-medium">{product.expectedReturns}</span>
                  <span className="text-gray-500">Min: ₹{product.minInvestment.toLocaleString('en-IN')}</span>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/products" className="text-blue-600 font-semibold hover:underline">
              View All Investment Products →
            </Link>
          </div>
        </div>
      </section>

      {/* Bank-Seized Properties Highlight */}
      <section className="py-16 bg-blue-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">Bank-Seized Properties at 15-30% Discount</h2>
              <p className="text-gray-700 mb-6">
                Banks auction properties seized from defaulting borrowers under the SARFAESI Act.
                These properties are sold below market value — a genuine opportunity for informed investors.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Properties from SBI, PNB, HDFC, ICICI & more
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Residential, commercial, industrial & land
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Bank-backed title (safer than private deals)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Updated daily with new auctions
                </li>
              </ul>
              <Link href="/properties" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition inline-block">
                Browse Auction Properties →
              </Link>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <h3 className="text-xl font-bold mb-4">How SARFAESI Auctions Work</h3>
              <ol className="space-y-3 text-gray-700">
                <li><span className="font-semibold text-blue-600">1.</span> Borrower defaults on loan</li>
                <li><span className="font-semibold text-blue-600">2.</span> Bank seizes the property</li>
                <li><span className="font-semibold text-blue-600">3.</span> Bank publishes auction notice</li>
                <li><span className="font-semibold text-blue-600">4.</span> You register & pay EMD</li>
                <li><span className="font-semibold text-blue-600">5.</span> Bid in e-auction</li>
                <li><span className="font-semibold text-blue-600">6.</span> Win & get property at discount</li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Real Estate Investment Products */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Real Estate Investment Options</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {realEstateProducts.map(product => (
              <Link key={product.id} href={`/products/${product.id}`} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition border border-gray-100">
                <div className="text-4xl mb-3">{product.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                <div className="text-sm">
                  <span className="text-green-600 font-medium">{product.expectedReturns}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Alternative Investments */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Alternative Investments</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {alternativeProducts.map(product => (
              <Link key={product.id} href={`/products/${product.id}`} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
                <div className="text-4xl mb-3">{product.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                <div className="flex justify-between text-sm">
                  <span className="text-green-600 font-medium">{product.expectedReturns}</span>
                  <span className="text-gray-500">Risk: {product.riskLevel}/5</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-blue-600 text-white text-center">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Start Exploring Today</h2>
          <p className="text-xl mb-8 text-blue-100">
            Free to use. No registration required to browse.
          </p>
          <Link href="/properties" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition inline-block">
            Browse Properties Now
          </Link>
        </div>
      </section>
    </div>
  );
}