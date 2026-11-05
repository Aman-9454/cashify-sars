'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Sparkles, ArrowRight, ShieldCheck, Zap, RefreshCw, ShoppingBag, CheckCircle2 } from 'lucide-react';
import CustomerHeader from '@/components/CustomerHeader';
import CustomerFooter from '@/components/CustomerFooter';
import HowItWorks from '@/app/components/HowItWorks';
import SafeAndReliableSection from '@/app/components/SafeAndReliableSection';
import CamsikTrustScore from '@/app/components/CamsikTrustScore';

export default function UserHowItWorksPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col justify-between">
      <CustomerHeader />

      {/* Hero Header */}
      <section className="bg-gradient-to-b from-slate-900 to-slate-950 text-white py-12 sm:py-16 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-6">
            <Link href="/user" className="hover:text-white transition-colors">
              User Home
            </Link>
            <ChevronRight size={13} />
            <span className="text-emerald-400 font-bold">How It Works</span>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold mb-4 border border-emerald-500/30">
              <Sparkles size={13} />
              FAST, FAIR &amp; TRANSPARENT
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white mb-4">
              How the Casmik Ecosystem Works
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Selling, exchanging, or buying pre-owned gadgets in India used to mean haggling with local shops or dealing with unverified online buyers. Casmik makes it effortless, transparent, and completely risk-free across smartphones, laptops, tablets, and cameras.
            </p>
          </div>
        </div>
      </section>

      {/* 3-Step Interactive Process Component */}
      <HowItWorks />

      {/* Trust & Guarantees */}
      <SafeAndReliableSection />

      {/* Live Platform Stats */}
      <CamsikTrustScore />

      {/* Bottom CTA Banner */}
      <section className="py-12 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Ready to Check Your Device&apos;s Resale Value?
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Get an instant AI valuation based on real hardware diagnostics, battery health, and market liquidity in under 60 seconds.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/user/sell-device"
              className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all"
            >
              <Zap size={16} /> Get Instant Valuation
            </Link>
            <Link
              href="/user/buy-refurbished"
              className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/25 flex items-center gap-2 transition-all"
            >
              <ShoppingBag size={16} /> Explore Refurbished Store
            </Link>
            <Link
              href="/user/exchange"
              className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-lg shadow-amber-500/25 flex items-center gap-2 transition-all"
            >
              <RefreshCw size={16} /> 1-Step Device Exchange
            </Link>
          </div>
        </div>
      </section>

      <CustomerFooter />
    </main>
  );
}
