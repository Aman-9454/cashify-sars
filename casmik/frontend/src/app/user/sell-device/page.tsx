'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import CustomerHeader from '@/components/CustomerHeader';
import CustomerFooter from '@/components/CustomerFooter';
import SellDeviceWorkflow from '@/app/sell-device-get-quote/components/SellDeviceWorkflow';

export default function UserSellDevicePage() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <CustomerHeader />

      {/* Breadcrumbs Header */}
      <div className="bg-slate-900 text-white py-3 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 text-xs font-medium text-slate-400">
          <Link href="/user" className="hover:text-white transition-colors">
            User Home
          </Link>
          <ChevronRight size={12} />
          <span className="text-emerald-400 font-semibold">Sell Device (Instant Quote)</span>
        </div>
      </div>

      <div className="flex-1 py-8">
        <Suspense
          fallback={
            <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-semibold text-slate-500">Loading device valuation workflow...</p>
            </div>
          }
        >
          <SellDeviceWorkflow />
        </Suspense>
      </div>

      <CustomerFooter />
    </main>
  );
}
