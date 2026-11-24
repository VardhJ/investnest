'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';

export default function Navbar() {
  const { user, loading, isAdmin, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            InvestNest
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/properties" className="text-gray-700 hover:text-blue-600 font-medium transition">
              Auction Properties
            </Link>
            <Link href="/products" className="text-gray-700 hover:text-blue-600 font-medium transition">
              Investment Products
            </Link>
            <Link href="/learn" className="text-gray-700 hover:text-blue-600 font-medium transition">
              Learn
            </Link>
            <Link href="/calculator" className="text-gray-700 hover:text-blue-600 font-medium transition">
              Calculator
            </Link>
            {user && (
              <>
                <Link href="/watchlist" className="text-gray-700 hover:text-blue-600 font-medium transition">
                  Watchlist
                </Link>
                <Link href="/alerts" className="text-gray-700 hover:text-blue-600 font-medium transition">
                  Alerts
                </Link>
              </>
            )}
            {isAdmin && (
              <Link href="/admin" className="text-orange-600 hover:text-orange-700 font-medium transition">
                Admin
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
            ) : user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 hidden sm:block">{user.email}</span>
                <button onClick={signOut} className="text-gray-700 hover:text-red-600 font-medium transition text-sm">
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <Link href="/login" className="text-gray-700 hover:text-blue-600 font-medium transition">
                  Login
                </Link>
                <Link href="/signup" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition">
                  Sign Up
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
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

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4 space-y-2">
            <Link
              href="/properties"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition"
            >
              Auction Properties
            </Link>
            <Link
              href="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition"
            >
              Investment Products
            </Link>
            <Link
              href="/learn"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition"
            >
              Learn
            </Link>
            <Link
              href="/calculator"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition"
            >
              Calculator
            </Link>
            {user && (
              <>
                <Link
                  href="/watchlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition"
                >
                  Watchlist
                </Link>
                <Link
                  href="/alerts"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition"
                >
                  Alerts
                </Link>
              </>
            )}
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 text-orange-600 hover:bg-gray-50 hover:text-orange-700 rounded-lg transition"
              >
                Admin
              </Link>
            )}
            {user && (
              <div className="px-4 py-2 text-sm text-gray-500 border-t mt-2 pt-2">
                {user.email}
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}