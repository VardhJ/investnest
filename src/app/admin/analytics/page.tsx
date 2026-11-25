'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import BankAnalytics from '@/components/BankAnalytics';

export const dynamic = 'force-dynamic';

export default function AdminAnalyticsPage() {
  const { user, loading, isAdmin, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
          <Link href="/login" className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition inline-block">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You do not have admin access.</p>
          <Link href="/" className="text-blue-600 hover:underline">← Go Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Bank Analytics Dashboard</h1>
            <p className="text-xs text-slate-500 mt-0.5">Authenticated: {user?.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-xs font-semibold text-slate-500 hover:text-emerald-600 transition">
              Add Property
            </Link>
            <button onClick={signOut} className="text-xs font-semibold text-slate-500 hover:text-rose-600 transition">
              Sign Out
            </button>
          </div>
        </div>
        <BankAnalytics />
      </div>
    </div>
  );
}