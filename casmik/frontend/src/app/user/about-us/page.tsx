'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Sparkles, ArrowRight, ShieldCheck, Award, Lock, Cpu, CheckCircle2, Zap, RefreshCw, ShoppingBag } from 'lucide-react';
import CustomerHeader from '@/components/CustomerHeader';
import CustomerFooter from '@/components/CustomerFooter';
import WhyCamsik from '@/app/components/WhyCamsik';
import SafeAndReliableSection from '@/app/components/SafeAndReliableSection';
import CompetitiveComparisonTable from '@/app/components/CompetitiveComparisonTable';
import CamsikTrustScore from '@/app/components/CamsikTrustScore';

export default function UserAboutUsPage() {
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
            <span className="text-emerald-400 font-bold">About Us</span>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold mb-4 border border-emerald-500/30">
              <Sparkles size={13} />
              THE CASMIK ADVANTAGE
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white mb-4">
              Pioneering India&apos;s Circular Electronics Revolution
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              We engineered India&apos;s leading tech ReCommerce ecosystem. No lowball offers from offline shops, no risky meetings with online strangers. Just algorithmic valuations, 45-point hardware diagnostics, certified DoD 5220.22-M data wipes, and instant doorstep payouts.
            </p>
          </div>
        </div>
      </section>

      {/* Core Mission & Tech Standards */}
      <section className="py-12 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/70 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Lock size={22} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">DoD 5220.22-M Data Wipe</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Every smartphone, MacBook, and laptop sold or exchanged undergoes military-grade multipass data sanitization with an instant tamper-evident digital certificate.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/70 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Cpu size={22} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">45-Point Lab Diagnostics</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Automated battery cycle analysis, sensor testing, touchscreen digitizer heatmap, camera aperture checks, and biometric security checks on every device.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/70 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <Zap size={22} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Instant Spot Payouts</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                No delayed vouchers. Directly to your UPI ID or IMPS bank account before our executive leaves your doorstep. 100% verified, safe, and instant.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9 Core Value Pillars */}
      <WhyCamsik />

      {/* Safe and Reliable Diagnostic Pillars */}
      <SafeAndReliableSection />

      {/* Head-to-Head Comparison Table */}
      <CompetitiveComparisonTable />

      {/* Platform Trust Score */}
      <CamsikTrustScore />

      {/* Bottom CTA */}
      <section className="py-12 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Ready to Upgrade or Sell Your Old Device?
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Experience the fastest, most secure way to sell or buy certified electronics in India.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/user/sell-device"
              className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all"
            >
              <Zap size={16} /> Sell Device Now
            </Link>
            <Link
              href="/user/buy-refurbished"
              className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/25 flex items-center gap-2 transition-all"
            >
              <ShoppingBag size={16} /> Buy Refurbished Tech
            </Link>
            <Link
              href="/user/exchange"
              className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-lg shadow-amber-500/25 flex items-center gap-2 transition-all"
            >
              <RefreshCw size={16} /> 1-Step Exchange
            </Link>
          </div>
        </div>
      </section>

      <CustomerFooter />
    </main>
  );
}
