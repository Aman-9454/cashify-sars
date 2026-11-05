'use client';

import React from 'react';
import {
  Flame,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Smartphone,
  Tag,
  Clock,
} from 'lucide-react';
import { Tenant } from '@/lib/saas/types';

export default function TemplateVibrantMarketplace({
  tenant,
  catalog,
}: {
  tenant: Tenant;
  catalog: { categories: any[]; brands: any[] };
}) {
  const primaryColor = tenant.branding.primaryColor || '#F97316';

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      {/* Top Banner Alert */}
      <div
        className="py-1.5 px-4 text-center text-xs font-bold text-black"
        style={{ backgroundColor: primaryColor }}
      >
        🔥 FLASH RECOMMERCE DEALS: Extra ₹1,500 Exchange Bonus on iPhone 15 & S24 Series Today!
      </div>

      {/* Main Header */}
      <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-black text-base shadow-lg"
              style={{ backgroundColor: primaryColor }}
            >
              {tenant.branding.brandName.slice(0, 1)}
            </div>
            <div>
              <div className="font-black text-xl text-white tracking-tight">
                {tenant.branding.brandName}
              </div>
              <div className="text-[11px] text-amber-400 font-semibold">
                ★ 4.9/5 Trusted Trade-In Network
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-xs font-bold">
            <span className="text-slate-300 hover:text-white cursor-pointer">Sell Phone</span>
            <span className="text-slate-300 hover:text-white cursor-pointer">Buy Certified</span>
            <span className="text-slate-300 hover:text-white cursor-pointer">Repairs</span>
            <div
              className="px-5 py-2.5 rounded-full text-black font-extrabold shadow-lg cursor-pointer transform hover:scale-105 transition"
              style={{ backgroundColor: primaryColor }}
            >
              Sell Now &gt;
            </div>
          </div>
        </div>
      </header>

      {/* Big Action Hero */}
      <section className="py-16 px-6 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Tag className="w-3.5 h-3.5" />
            <span>Dedicated DB: {tenant.dbName}</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            Sell Old Phone for <br />
            <span style={{ color: primaryColor }}>Highest Instant Cash</span>
          </h1>

          <p className="text-base text-slate-300 max-w-xl mx-auto">
            Doorstep pickup in 45 minutes, instant UPI / Bank transfer before handover, certified safe.
          </p>

          {/* Quick-Action 3 Triad Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 max-w-3xl mx-auto text-left">
            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 shadow-xl cursor-pointer hover:border-amber-400/60 transition group">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-black mb-3 group-hover:scale-110 transition"
                style={{ backgroundColor: primaryColor }}
              >
                1
              </div>
              <h3 className="font-extrabold text-base text-white">Sell Device</h3>
              <p className="text-xs text-slate-400 mt-1">Check price in 30 seconds & schedule free pickup</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 shadow-xl cursor-pointer hover:border-amber-400/60 transition group">
              <div className="w-10 h-10 rounded-xl bg-cyan-400 flex items-center justify-center font-bold text-black mb-3 group-hover:scale-110 transition">
                2
              </div>
              <h3 className="font-extrabold text-base text-white">Buy Refurbished</h3>
              <p className="text-xs text-slate-400 mt-1">45-point tested with 12 months warranty</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 shadow-xl cursor-pointer hover:border-amber-400/60 transition group">
              <div className="w-10 h-10 rounded-xl bg-emerald-400 flex items-center justify-center font-bold text-black mb-3 group-hover:scale-110 transition">
                3
              </div>
              <h3 className="font-extrabold text-base text-white">Doorstep Repair</h3>
              <p className="text-xs text-slate-400 mt-1">Original parts replacement with 6 months warranty</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Bar */}
      <section className="py-12 px-6 max-w-7xl mx-auto">
        <h2 className="text-xl font-black text-white mb-6">Choose Your Device Type</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {(catalog.categories.length > 0
            ? catalog.categories
            : [
                { name: 'Phones', slug: 'smartphones' },
                { name: 'Laptops', slug: 'laptops' },
                { name: 'Tablets', slug: 'tablets' },
                { name: 'Watches', slug: 'smartwatches' },
                { name: 'Cameras', slug: 'cameras' },
                { name: 'Gaming Consoles', slug: 'gaming' },
              ]
          ).map((cat, i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-slate-800 border border-slate-700 hover:border-slate-500 transition text-center cursor-pointer"
            >
              <Smartphone className="w-6 h-6 mx-auto mb-2 text-amber-400" />
              <div className="font-bold text-xs text-white">{cat.name}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Top Cash Paid</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-8 px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>{tenant.branding.brandName} • Powered by Camsik SaaS</div>
          <div>{tenant.branding.supportPhone}</div>
        </div>
      </footer>
    </div>
  );
}

