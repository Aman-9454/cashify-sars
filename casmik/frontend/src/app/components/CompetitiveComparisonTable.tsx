'use client';
import React from 'react';
import { Check, X, Sparkles, Shield, Camera } from 'lucide-react';
import Link from 'next/link';

interface FeatureComparison {
  feature: string;
  camsik: string;
  camsikPositive: boolean;
  localShops: string;
  localPositive: boolean;
  classifieds: string;
  classifiedsPositive: boolean;
}

const comparisonData: FeatureComparison[] = [
  {
    feature: 'Valuation Method',
    camsik: 'Objective AI algorithm based on live market liquidity, battery cycles & hardware diagnostics',
    camsikPositive: true,
    localShops: 'Arbitrary verbal quote, heavy dealer margin deducted',
    localPositive: false,
    classifieds: 'Tire-kickers, lowballers, and unpredictable bargaining',
    classifiedsPositive: false,
  },
  {
    feature: 'Payment Speed & Mode',
    camsik: 'Instant UPI / IMPS directly to bank within 2 mins before device handover',
    camsikPositive: true,
    localShops: 'Deferred payment or cheque after selling to their customer',
    localPositive: false,
    classifieds: 'High risk of fraudulent payment screenshots or counterfeit cash',
    classifiedsPositive: false,
  },
  {
    feature: 'Doorstep Convenience',
    camsik: 'Free doorstep inspection, delivery & trade-in swap across 200+ Indian cities',
    camsikPositive: true,
    localShops: 'Must travel in traffic with fragile, expensive phones, laptops & cameras',
    localPositive: false,
    classifieds: 'Meet strangers in parking lots or invite unknown people home',
    classifiedsPositive: false,
  },
  {
    feature: 'Hardware & Screen Diagnostics',
    camsik: 'Automated 45-point digital diagnostics (OLED, battery health, sensor & optics)',
    camsikPositive: true,
    localShops: 'Subjective visual inspection used to artificially drop price',
    localPositive: false,
    classifieds: 'Buyers demanding free testing days without deposit',
    classifiedsPositive: false,
  },
  {
    feature: 'Data Privacy & Wipe',
    camsik: 'Certified DoD 5220.22-M military-grade purge on SSDs, phones & camera buffers',
    camsikPositive: true,
    localShops: 'Rarely performed, risk of personal photos & accounts lingering',
    localPositive: false,
    classifieds: 'Completely on seller, no technical assistance provided',
    classifiedsPositive: false,
  },
  {
    feature: '1-Step Device Exchange',
    camsik: 'Doorstep 1-step swap with extra ₹5,000 bonus; pay only remaining balance',
    camsikPositive: true,
    localShops: 'Must sell first, bear downtime, then buy at full retail price',
    localPositive: false,
    classifieds: 'Virtually impossible to coordinate safely',
    classifiedsPositive: false,
  },
  {
    feature: 'Legal Indemnity & Bill of Sale',
    camsik: 'Official digital GST invoice & liability waiver certificate provided',
    camsikPositive: true,
    localShops: 'Kachha receipt or no formal legal transfer paperwork',
    localPositive: false,
    classifieds: 'Zero documentation, leaves you legally liable if misused',
    classifiedsPositive: false,
  },
];

export default function CompetitiveComparisonTable() {
  const [mobileTab, setMobileTab] = React.useState<'all' | 'offline' | 'classifieds'>('all');

  return (
    <section className="py-8 lg:py-12 bg-white relative overflow-hidden w-full max-w-full">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="text-center max-w-3xl mx-auto mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-800 text-xs font-bold uppercase tracking-wider mb-2 border border-slate-200">
            <Sparkles size={13} className="text-purple-600" />
            Honest Market Comparison
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            Why Smart Customers Choose <span className="bg-gradient-to-r from-emerald-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Camsik</span>
          </h2>
          <p className="text-slate-500 mt-2 text-xs sm:text-sm lg:text-base max-w-xl mx-auto">
            See how buying, selling, or exchanging tech on Camsik compares against traditional offline shops and risky classifieds.
          </p>
        </div>

        {/* Mobile View Toggle Buttons (< md) */}
        <div className="md:hidden flex items-center justify-center p-1 bg-slate-100 rounded-2xl mb-4 text-xs font-bold gap-1">
          <button
            type="button"
            onClick={() => setMobileTab('all')}
            className={`flex-1 py-2 px-2 rounded-xl transition-all text-center ${
              mobileTab === 'all'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Features
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('offline')}
            className={`flex-1 py-2 px-2 rounded-xl transition-all text-center ${
              mobileTab === 'offline'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            vs Offline Shops
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('classifieds')}
            className={`flex-1 py-2 px-2 rounded-xl transition-all text-center ${
              mobileTab === 'classifieds'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            vs Classifieds
          </button>
        </div>

        {/* Mobile View: All Features Cards (< md) */}
        {mobileTab === 'all' && (
          <div className="md:hidden space-y-3.5">
            {comparisonData.map((row, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:p-4 shadow-sm"
              >
                {/* Feature Header */}
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
                    {row.feature}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                    0{idx + 1}
                  </span>
                </div>

                {/* Camsik (Recommended) Card */}
                <div className="rounded-xl bg-gradient-to-r from-purple-50/90 to-indigo-50/70 border border-purple-200/90 p-3 mb-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-black text-purple-800 mb-1">
                    <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
                    <span>Camsik (Recommended)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <Check size={12} strokeWidth={3} />
                    </div>
                    <p className="text-xs font-semibold text-slate-800 leading-snug">
                      {row.camsik}
                    </p>
                  </div>
                </div>

                {/* Competitors List */}
                <div className="space-y-1.5">
                  <div className="rounded-xl bg-slate-50 border border-slate-200/60 p-2.5">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-0.5">
                      Offline Camera Shops
                    </p>
                    <div className="flex items-start gap-1.5">
                      <div className="w-4 h-4 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                        <X size={10} strokeWidth={3} />
                      </div>
                      <p className="text-xs text-slate-600 leading-snug">
                        {row.localShops}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-50 border border-slate-200/60 p-2.5">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-0.5">
                      Online Classifieds (OLX/Etc.)
                    </p>
                    <div className="flex items-start gap-1.5">
                      <div className="w-4 h-4 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                        <X size={10} strokeWidth={3} />
                      </div>
                      <p className="text-xs text-slate-600 leading-snug">
                        {row.classifieds}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Mobile View: Head-to-Head 2-Column Comparison (< md) */}
        {mobileTab !== 'all' && (
          <div className="md:hidden rounded-2xl border border-slate-200 overflow-hidden shadow-sm bg-white">
            <div className="grid grid-cols-2 bg-slate-50 border-b border-slate-200 text-xs font-bold text-center">
              <div className="py-3 px-2 bg-purple-50/80 text-purple-800 border-r border-slate-200 flex items-center justify-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
                Camsik
              </div>
              <div className="py-3 px-2 text-slate-600 flex items-center justify-center">
                {mobileTab === 'offline' ? 'Offline Shops' : 'Classifieds'}
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {comparisonData.map((row, idx) => (
                <div key={idx} className="p-3">
                  <p className="text-[10px] font-black uppercase tracking-wide text-slate-400 mb-1.5">
                    {row.feature}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-start gap-1.5 p-2 rounded-xl bg-purple-50/50 border border-purple-100">
                      <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={10} strokeWidth={3} />
                      </div>
                      <p className="text-[11px] font-semibold text-slate-800 leading-snug">
                        {row.camsik}
                      </p>
                    </div>
                    <div className="flex items-start gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="w-4 h-4 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                        <X size={10} strokeWidth={3} />
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug">
                        {mobileTab === 'offline' ? row.localShops : row.classifieds}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Desktop Comparison Table (>= md) */}
        <div className="hidden md:block overflow-x-auto rounded-3xl border border-slate-200 shadow-lg bg-white">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70">
                <th className="py-5 px-6 font-extrabold text-sm text-slate-900 w-1/4">
                  Feature / Capability
                </th>
                <th className="py-5 px-6 font-black text-sm text-purple-700 bg-purple-50/50 w-1/3 border-x border-purple-200/60">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse" />
                    Camsik (Recommended)
                  </div>
                </th>
                <th className="py-5 px-6 font-bold text-sm text-slate-500 w-1/4">
                  Offline Camera Shops
                </th>
                <th className="py-5 px-6 font-bold text-sm text-slate-500 w-1/4">
                  Online Classifieds (OLX/Etc.)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {comparisonData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/40 transition-colors">
                  <td className="py-5 px-6 font-bold text-sm text-slate-900 align-top">
                    {row.feature}
                  </td>

                  {/* Camsik Column */}
                  <td className="py-5 px-6 bg-purple-50/[0.15] border-x border-purple-200/60 align-top">
                    <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={13} strokeWidth={3} />
                      </div>
                      <span className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug">
                        {row.camsik}
                      </span>
                    </div>
                  </td>

                  {/* Offline Shops Column */}
                  <td className="py-5 px-6 align-top text-slate-600">
                    <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                        <X size={13} strokeWidth={3} />
                      </div>
                      <span className="text-xs sm:text-sm text-slate-600 leading-snug">
                        {row.localShops}
                      </span>
                    </div>
                  </td>

                  {/* Classifieds Column */}
                  <td className="py-5 px-6 align-top text-slate-600">
                    <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                        <X size={13} strokeWidth={3} />
                      </div>
                      <span className="text-xs sm:text-sm text-slate-600 leading-snug">
                        {row.classifieds}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom CTA Banner */}
        <div className="mt-8 sm:mt-10 p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6 shadow-xl">
          <div className="flex items-center gap-3 sm:gap-4 text-center md:text-left flex-col sm:flex-row">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-purple-300 shrink-0">
              <Camera size={26} />
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-black text-white">
                Ready to experience the smarter way to sell cameras?
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                It takes only 60 seconds to see your exact guaranteed payout.
              </p>
            </div>
          </div>
          <Link
            href="/sell-device-get-quote"
            className="w-full sm:w-auto text-center shrink-0 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-sm shadow-lg shadow-emerald-600/30 transition-all"
          >
            Calculate Exact Price Now &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
