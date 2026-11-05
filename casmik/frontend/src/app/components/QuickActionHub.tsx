'use client';
import React from 'react';
import Link from 'next/link';
import {
  Zap,
  ShieldCheck,
  ArrowLeftRight,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Smartphone,
  Laptop,
  Camera,
  Tablet,
  TrendingUp,
  Percent,
  Coins,
  Truck,
  Video,
  Film,
} from 'lucide-react';

export default function QuickActionHub() {
  return (
    <section className="relative z-20 -mt-6 sm:-mt-8 lg:-mt-10 mb-8 sm:mb-12 px-4 sm:px-6 lg:px-8 xl:px-10 max-w-screen-2xl mx-auto">
      {/* 4 Main Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
        {/* ── CARD 1: SELL TECH ── */}
        <div className="group relative rounded-3xl bg-white border border-slate-200/90 hover:border-emerald-500/70 p-6 sm:p-7 shadow-lg hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 flex flex-col justify-between overflow-hidden hover:-translate-y-1.5">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-16 -right-16 w-44 h-44 bg-gradient-to-br from-emerald-400/15 via-teal-400/10 to-transparent rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />

          <div>
            {/* Top Badge & Micro Category Icons */}
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] font-black uppercase tracking-wider text-emerald-700">
                <Zap size={12} className="text-emerald-600 fill-emerald-500" />
                Instant Cash Payout
              </span>
              <div className="flex items-center gap-1.5 text-slate-400">
                <Smartphone size={15} />
                <Laptop size={15} />
                <Camera size={15} />
                <Tablet size={15} />
              </div>
            </div>

            {/* Title & Tagline */}
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-2 group-hover:text-emerald-700 transition-colors">
              Sell Old Tech &amp; Gear
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5">
              Turn your smartphone, laptop, tablet, DSLR, or lenses into instant cash with a 60-second AI quote and free doorstep pickup.
            </p>

            {/* Feature Bullets */}
            <div className="space-y-2.5 mb-6 pt-3 border-t border-slate-100 text-xs font-semibold text-slate-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                <span>Instant IMPS / UPI transfer before handing device</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                <span>Free doorstep evaluation in 200+ Indian cities</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                <span>Certified DoD 5220.22-M military-grade data wipe</span>
              </div>
            </div>

            {/* Supported Pills */}
            <div className="flex flex-wrap gap-1.5 mb-6">
              {['Smartphones', 'Laptops & MacBooks', 'DSLR & Mirrorless', 'iPads'].map((item) => (
                <span
                  key={item}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 text-[10px] font-bold text-slate-700 group-hover:bg-emerald-50 group-hover:text-emerald-800 transition-colors"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <Link
            href="/sell-device-get-quote"
            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-emerald-600/20 hover:shadow-lg hover:shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all duration-200 group-hover:scale-[1.02]"
          >
            <span>Sell Devices for Instant Cash</span>
            <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* ── CARD 2: BUY REFURBISHED ── */}
        <div className="group relative rounded-3xl bg-white border border-slate-200/90 hover:border-indigo-500/70 p-6 sm:p-7 shadow-lg hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col justify-between overflow-hidden hover:-translate-y-1.5">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-16 -right-16 w-44 h-44 bg-gradient-to-br from-indigo-400/15 via-blue-400/10 to-transparent rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />

          <div>
            {/* Top Badge & Micro Category Icons */}
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-[11px] font-black uppercase tracking-wider text-indigo-700">
                <Sparkles size={12} className="text-indigo-600 fill-indigo-500" />
                Up to 70% Off Retail
              </span>
              <div className="flex items-center gap-1.5 text-slate-400">
                <Percent size={15} />
                <ShieldCheck size={15} />
                <Truck size={15} />
              </div>
            </div>

            {/* Title & Tagline */}
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-2 group-hover:text-indigo-700 transition-colors">
              Buy Certified Refurbished
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5">
              Explore 45-point certified pre-owned iPhones, MacBooks, iPads, and professional camera bodies with 6–12 months warranty.
            </p>

            {/* Feature Bullets */}
            <div className="space-y-2.5 mb-6 pt-3 border-t border-slate-100 text-xs font-semibold text-slate-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-indigo-600 shrink-0" />
                <span>6 to 12 months comprehensive warranty coverage</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-indigo-600 shrink-0" />
                <span>45-point hardware, optical &amp; battery diagnostic check</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-indigo-600 shrink-0" />
                <span>7-day replacement guarantee &amp; zero-cost EMI</span>
              </div>
            </div>

            {/* Supported Pills */}
            <div className="flex flex-wrap gap-1.5 mb-6">
              {['Like-New Flagships', '100% Genuine Parts', 'Battery 90%+', 'Full Box & Cable'].map((item) => (
                <span
                  key={item}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 text-[10px] font-bold text-slate-700 group-hover:bg-indigo-50 group-hover:text-indigo-800 transition-colors"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <Link
            href="/buy-refurbished"
            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-700 hover:to-blue-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-indigo-600/20 hover:shadow-lg hover:shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all duration-200 group-hover:scale-[1.02]"
          >
            <span>Shop Refurbished Store</span>
            <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* ── CARD 3: EXCHANGE & UPGRADE ── */}
        <div className="group relative rounded-3xl bg-white border border-slate-200/90 hover:border-purple-500/70 p-6 sm:p-7 shadow-lg hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 flex flex-col justify-between overflow-hidden hover:-translate-y-1.5">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-16 -right-16 w-44 h-44 bg-gradient-to-br from-purple-400/15 via-fuchsia-400/10 to-transparent rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />

          <div>
            {/* Top Badge & Micro Category Icons */}
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200/80 text-[11px] font-black uppercase tracking-wider text-purple-700">
                <ArrowLeftRight size={12} className="text-purple-600" />
                Extra ₹5,000 Trade Bonus
              </span>
              <div className="flex items-center gap-1.5 text-slate-400">
                <Coins size={15} />
                <TrendingUp size={15} />
                <Sparkles size={15} />
              </div>
            </div>

            {/* Title & Tagline */}
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-2 group-hover:text-purple-700 transition-colors">
              Exchange &amp; Upgrade
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5">
              Trade your old gadget towards any newer phone, laptop, or camera with 1-step doorstep swap and zero downtime.
            </p>

            {/* Feature Bullets */}
            <div className="space-y-2.5 mb-6 pt-3 border-t border-slate-100 text-xs font-semibold text-slate-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-purple-600 shrink-0" />
                <span>Extra exchange bonus up to ₹5,000 added automatically</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-purple-600 shrink-0" />
                <span>1-Step doorstep swap — hand old device, receive upgraded one</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-purple-600 shrink-0" />
                <span>Pay only difference amount or get cash back if value exceeds</span>
              </div>
            </div>

            {/* Supported Pills */}
            <div className="flex flex-wrap gap-1.5 mb-6">
              {['Phone to Phone', 'Camera Upgrades', 'MacBook Swaps', 'Any Brand Any Gear'].map((item) => (
                <span
                  key={item}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 text-[10px] font-bold text-slate-700 group-hover:bg-purple-50 group-hover:text-purple-800 transition-colors"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <Link
            href="/exchange-device"
            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-purple-600/20 hover:shadow-lg hover:shadow-purple-600/30 flex items-center justify-center gap-2 transition-all duration-200 group-hover:scale-[1.02]"
          >
            <span>Start 1-Step Device Exchange</span>
            <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* ── CARD 4: RENTAL CAMERAS & GEAR ── */}
        <div className="group relative rounded-3xl bg-white border border-slate-200/90 hover:border-rose-500/70 p-6 sm:p-7 shadow-lg hover:shadow-2xl hover:shadow-rose-500/10 transition-all duration-300 flex flex-col justify-between overflow-hidden hover:-translate-y-1.5">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-16 -right-16 w-44 h-44 bg-gradient-to-br from-rose-400/15 via-pink-400/10 to-transparent rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />

          <div>
            {/* Top Badge & Micro Category Icons */}
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200/80 text-[11px] font-black uppercase tracking-wider text-rose-700">
                <Camera size={12} className="text-rose-600 fill-rose-500" />
                Daily &amp; Weekly Rentals
              </span>
              <div className="flex items-center gap-1.5 text-slate-400">
                <Video size={15} />
                <Film size={15} />
                <Camera size={15} />
              </div>
            </div>

            {/* Title & Tagline */}
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-2 group-hover:text-rose-700 transition-colors">
              Rent Pro Cameras &amp; Gear
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5">
              Rent cinema bodies, mirrorless cameras, GM prime lenses &amp; gimbals with flexible daily rates and doorstep delivery.
            </p>

            {/* Feature Bullets */}
            <div className="space-y-2.5 mb-6 pt-3 border-t border-slate-100 text-xs font-semibold text-slate-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-rose-600 shrink-0" />
                <span>Flexible daily rates starting from ₹499/day</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-rose-600 shrink-0" />
                <span>Includes 2 OEM batteries, dual charger &amp; memory card</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-rose-600 shrink-0" />
                <span>Insured doorstep delivery &amp; free return collection</span>
              </div>
            </div>

            {/* Supported Pills */}
            <div className="flex flex-wrap gap-1.5 mb-6">
              {['Cinema 4K/8K', 'Sony FX3 & A7 IV', 'Canon R5 & C70', 'DJI Ronin & Gimbals'].map((item) => (
                <span
                  key={item}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 text-[10px] font-bold text-slate-700 group-hover:bg-rose-50 group-hover:text-rose-800 transition-colors"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <Link
            href="/rental-cameras"
            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-rose-600/20 hover:shadow-lg hover:shadow-rose-600/30 flex items-center justify-center gap-2 transition-all duration-200 group-hover:scale-[1.02]"
          >
            <span>Explore Rental Cameras</span>
            <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
