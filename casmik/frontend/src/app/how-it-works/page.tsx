import React from 'react';
import Link from 'next/link';
import { ChevronRight, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import CustomerHeader from '@/components/CustomerHeader';
import CustomerFooter from '@/components/CustomerFooter';
import HowItWorks from '@/app/components/HowItWorks';
import SafeAndReliableSection from '@/app/components/SafeAndReliableSection';
import CamsikTrustScore from '@/app/components/CamsikTrustScore';

export const metadata = {
  title: 'How It Works — Camsik Device Buyback, Refurbished Sales & Exchange Process',
  description: 'Learn how to sell, trade-in, or buy certified smartphones, laptops, MacBooks, tablets, and DSLR cameras on Camsik with instant online quote, free doorstep pickup, and instant bank transfer.',
};

export default function HowItWorksPage() {
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
            <span className="text-purple-400 font-bold">How It Works</span>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold mb-4 border border-purple-500/30">
              <Sparkles size={13} />
              FAST, FAIR &amp; TRANSPARENT
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white mb-4">
              How Camsik Works
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Selling, exchanging, or buying pre-owned gadgets in India used to mean haggling with local shops or dealing with unverified online buyers. Camsik makes it effortless, transparent, and completely risk-free across smartphones, laptops, tablets, and cameras.
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
      <section className="py-8 sm:py-10 bg-purple-50/60 border-t border-purple-100">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3">
            Ready to Check Your Device&apos;s Resale Value?
          </h2>
          <p className="text-sm text-slate-600 max-w-xl mx-auto mb-6">
            Get an instant AI valuation based on real hardware diagnostics, battery health, and market liquidity in under 60 seconds.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/sell-device-get-quote"
              className="px-6 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md shadow-purple-600/25 flex items-center gap-2 transition-all btn-press"
            >
              <span>Get Instant Valuation</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/buy-refurbished"
              className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-sm transition-all"
            >
              <span>Explore Refurbished Store</span>
            </Link>
            <Link
              href="/exchange-device"
              className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/25 flex items-center gap-2 transition-all btn-press"
            >
              <span>1-Step Device Exchange</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <CustomerFooter />
    </main>
  );
}
