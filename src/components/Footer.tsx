import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800/80">
      <div className="h-0.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-80" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Invest<span className="text-emerald-500">Nest</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400 max-w-sm">
              Discover opportunities beyond traditional equities and fixed deposits. We aggregate and analyze bank-seized SARFAESI auction properties, REITs, high-yield debt, and alternative assets across India.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Independent Investment Discovery & Intelligence Platform</span>
            </div>
          </div>

          {/* Column 1: Explore */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 tracking-wider uppercase mb-4">
              Discovery
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/properties" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span>Auction Properties</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    Hot
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-white transition-colors">
                  All Asset Classes
                </Link>
              </li>
              <li>
                <Link href="/calculator" className="hover:text-white transition-colors">
                  Yield & Growth Calculator
                </Link>
              </li>
              <li>
                <Link href="/learn" className="hover:text-white transition-colors">
                  Research & Education Hub
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Alternative Assets */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 tracking-wider uppercase mb-4">
              Asset Classes
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/products/sarfaesi-properties" className="hover:text-white transition-colors">
                  Bank-Seized Real Estate
                </Link>
              </li>
              <li>
                <Link href="/reits" className="hover:text-white transition-colors">
                  REIT, SM-REIT & InvIT Screener
                </Link>
              </li>
              <li>
                <Link href="/products/corporate-bonds-obpp" className="hover:text-white transition-colors">
                  Corporate Bonds (SEBI OBPP)
                </Link>
              </li>
              <li>
                <Link href="/products/securitized-debt-sdi" className="hover:text-white transition-colors">
                  Securitized Debt (SDIs)
                </Link>
              </li>
              <li>
                <Link href="/p2p/platforms" className="hover:text-white transition-colors">
                  NBFC-P2P Watchdog Scorecard
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Trust & Legal */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 tracking-wider uppercase mb-4">
              Transparency
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/learn/sarfaesi-title-check" className="hover:text-white transition-colors">
                  Title Verification Guide
                </Link>
              </li>
              <li>
                <Link href="/learn/mstc-e-auction-guide" className="hover:text-white transition-colors">
                  MSTC Bidding Protocol
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="hover:text-white transition-colors">
                  Regulatory Disclaimer
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Disclaimer & Copyright */}
        <div className="pt-8 border-t border-slate-900 text-xs text-slate-400 space-y-3">
          <p className="leading-relaxed text-slate-400">
            Disclaimer: InvestNest is an educational and discovery platform providing aggregated public notices, analytics, and informational resources. InvestNest is not a registered investment advisor, broker, or depository. Bank auction listings are collated from public notices under the SARFAESI Act, 2002. Users must perform independent legal, physical, and financial due diligence before participating in auctions or investing capital.
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 text-slate-400">
            <div>
              © {new Date().getFullYear()} InvestNest. All rights reserved.
            </div>
            <div className="flex items-center gap-4">
              <span>Engineered for Indian Investors</span>
              <span>•</span>
              <span className="text-emerald-400 font-medium">Free Access Tier</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
