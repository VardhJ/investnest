'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function Navbar() {
  const { user, loading, isAdmin, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname?.startsWith(path)) return true;
    return false;
  };

  const navLinks = [
    { href: '/properties', label: 'Auction Deals', highlight: true },
    { href: '/products', label: 'Alternative Assets' },
    { href: '/calculator', label: 'Yield Calculator' },
    { href: '/learn', label: 'Research & Guides' },
    { href: '/analytics', label: 'Market Analytics' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-emerald-600/20 group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-slate-900 leading-none">
                Invest<span className="text-emerald-600">Nest</span>
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 mt-0.5">
                Beyond FDs & Demat
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'text-emerald-700 font-semibold bg-emerald-50/70'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {link.label}
                    {link.highlight && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-amber-100 text-amber-800 border border-amber-200/60">
                        15-30% OFF
                      </span>
                    )}
                  </span>
                </Link>
              );
            })}

            {user && (
              <>
                <Link
                  href="/watchlist"
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/watchlist')
                      ? 'text-emerald-700 font-semibold bg-emerald-50/70'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                  }`}
                >
                  Watchlist
                </Link>
                <Link
                  href="/alerts"
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/alerts')
                      ? 'text-emerald-700 font-semibold bg-emerald-50/70'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                  }`}
                >
                  Alerts
                </Link>
              </>
            )}

            {isAdmin && (
              <Link
                href="/admin"
                className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-md text-amber-700 bg-amber-50 border border-amber-200/80 hover:bg-amber-100 transition-colors"
              >
                Admin
              </Link>
            )}
          </nav>

          {/* User Auth Section */}
          <div className="flex items-center gap-3">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full bg-slate-100 border border-slate-200">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold uppercase">
                    {user.email ? user.email.charAt(0) : 'U'}
                  </div>
                  <span className="text-xs text-slate-700 font-medium max-w-[120px] truncate hidden sm:inline-block pr-2">
                    {user.email}
                  </span>
                </div>
                <button
                  onClick={signOut}
                  className="text-xs font-medium text-slate-500 hover:text-red-600 transition-colors px-2 py-1"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  href="/login"
                  className="text-sm font-semibold text-slate-700 hover:text-slate-900 px-3.5 py-2 rounded-lg hover:bg-slate-100/80 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg shadow-sm shadow-emerald-600/20 transition-all hover:shadow"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 py-3 space-y-1 bg-white">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium ${
                  isActive(link.href)
                    ? 'text-emerald-700 font-semibold bg-emerald-50'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{link.label}</span>
                {link.highlight && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
                    15-30% OFF
                  </span>
                )}
              </Link>
            ))}

            {user && (
              <>
                <Link
                  href="/watchlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
                >
                  Saved Watchlist
                </Link>
                <Link
                  href="/alerts"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
                >
                  Auction Alerts
                </Link>
              </>
            )}

            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 text-sm font-semibold text-amber-700 bg-amber-50 rounded-lg"
              >
                Admin Panel
              </Link>
            )}

            {!user && (
              <div className="pt-3 border-t border-slate-100 px-4 flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg"
                >
                  Get Started Free
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
