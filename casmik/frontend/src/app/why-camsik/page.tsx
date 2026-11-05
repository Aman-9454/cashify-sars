import React from 'react';
import Link from 'next/link';
import { ChevronRight, Sparkles, ArrowRight } from 'lucide-react';
import CustomerHeader from '@/components/CustomerHeader';
import CustomerFooter from '@/components/CustomerFooter';
import WhyCamsik from '@/app/components/WhyCamsik';
import SafeAndReliableSection from '@/app/components/SafeAndReliableSection';
import CompetitiveComparisonTable from '@/app/components/CompetitiveComparisonTable';
import CamsikTrustScore from '@/app/components/CamsikTrustScore';

export const metadata = {
  title: 'Why Camsik — Highest Resale Valuation, 45-Point Diagnostics & Instant Payment',
  description: 'Discover why over 2,50,000 customers and creators across India choose Camsik for smartphone, laptop, tablet, and camera buyback, exchange, and certified refurbished gear.',
};

export default function WhyCamsikPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col justify-between">
      <CustomerHeader />

      {/* Hero Header */}
      <section className="bg-gradient-to-b from-slate-900 to-slate-950 text-white py-8 sm:py-10 border-b border-slate-800">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-6">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight size={13} />
            <span className="text-purple-400 font-bold">Why Camsik</span>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold mb-4 border border-purple-500/30">
              <Sparkles size={13} />
              THE CAMSIK ADVANTAGE
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white mb-4">
              Why Choose Camsik
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              We engineered India&apos;s leading tech ReCommerce ecosystem. No lowball offers from offline shops, no risky meetings with online strangers. Just algorithmic valuations, 45-point hardware diagnostics, certified DoD data wipes, and instant doorstep payouts.
            </p>
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
      <section className="py-8 sm:py-10 bg-purple-50/60 border-t border-purple-100">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3">
            Experience India&apos;s Highest Device Payouts
          </h2>
          <p className="text-sm text-slate-600 max-w-xl mx-auto mb-6">
            Join over 2,50,000 customers, professionals, and creators who turned their old phones, laptops, and cameras into instant cash.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/sell-device-get-quote"
              className="px-6 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md shadow-purple-600/25 flex items-center gap-2 transition-all btn-press"
            >
              <span>Sell Your Device Now</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/exchange-device"
              className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/25 flex items-center gap-2 transition-all btn-press"
            >
              <span>1-Step Exchange</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/contact-us"
              className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-sm transition-all"
            >
              <span>Talk to an Expert</span>
            </Link>
          </div>
        </div>
      </section>

      <CustomerFooter />
    </main>
  );
}
