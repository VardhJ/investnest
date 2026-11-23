export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-white font-bold text-xl mb-4">InvestNest</h3>
            <p className="text-sm text-gray-400">
              Discover investments beyond stocks & mutual funds. Free education and discovery platform for Indians.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Explore</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/properties" className="hover:text-white transition">Auction Properties</a></li>
              <li><a href="/products" className="hover:text-white transition">Investment Products</a></li>
              <li><a href="/learn" className="hover:text-white transition">Learn</a></li>
              <li><a href="/calculator" className="hover:text-white transition">Calculator</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Investment Types</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/products/reits" className="hover:text-white transition">REITs</a></li>
              <li><a href="/products/sarfaesi-properties" className="hover:text-white transition">SARFAESI Properties</a></li>
              <li><a href="/products/p2p-lending" className="hover:text-white transition">P2P Lending</a></li>
              <li><a href="/products/invoice-discounting" className="hover:text-white transition">Invoice Discounting</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/privacy" className="hover:text-white transition">Privacy Policy</a></li>
              <li><a href="/terms" className="hover:text-white transition">Terms of Service</a></li>
              <li><a href="/disclaimer" className="hover:text-white transition">Disclaimer</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
          <p>© 2026 InvestNest. All rights reserved.</p>
          <p className="mt-2">Disclaimer: This platform provides educational information only. Not financial advice. Investments are subject to market risks.</p>
        </div>
      </div>
    </footer>
  );
}