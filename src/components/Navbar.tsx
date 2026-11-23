'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth';

export default function Navbar() {
  const { user, loading, isAdmin, signOut } = useAuth();

  return (
    <nav className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            InvestNest
          </Link>
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
          </div>
        </div>
      </div>
    </nav>
  );
}