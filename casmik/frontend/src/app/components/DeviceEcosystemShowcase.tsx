'use client';
import React from 'react';
import Link from 'next/link';
import {
  Smartphone,
  Laptop,
  Camera,
  Tablet,
  ArrowRight,
  Sparkles,
  Zap,
  ShoppingBag,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';

const pillars = [
  {
    id: 'eco-phone',
    icon: Smartphone,
    category: 'Smartphones & Flagships',
    headline: 'iPhones, Galaxy & Pixels',
    description: 'Sell your iPhone 16/15 Pro, Samsung S24, or Pixel for top cash, or buy certified pre-owned with 12M warranty.',
    brands: ['Apple iPhone', 'Samsung Galaxy', 'Google Pixel', 'OnePlus'],
    sellUrl: '/sell-device-get-quote?cat=cat-smartphone',
    buyUrl: '/buy-refurbished',
    exchangeUrl: '/exchange-device',
    color: 'from-blue-600 to-indigo-700',
    borderGlow: 'hover:border-blue-400',
    tag: '⚡ 60s AI Quote',
  },
  {
    id: 'eco-laptop',
    icon: Laptop,
    category: 'Laptops & MacBooks',
    headline: 'MacBook M-Series, Dell & HP',
    description: 'Enterprise DoD 5220.22-M certified data wipe on all SSDs. Fair evaluation for MacBook Air/Pro, Dell XPS & ThinkPads.',
    brands: ['MacBook Pro / Air', 'Dell XPS', 'Lenovo ThinkPad', 'HP Spectre'],
    sellUrl: '/sell-device-get-quote?cat=cat-laptop',
    buyUrl: '/buy-refurbished',
    exchangeUrl: '/exchange-device',
    color: 'from-violet-600 to-purple-700',
    borderGlow: 'hover:border-purple-400',
    tag: '🛡️ Certified Data Wipe',
  },
  {
    id: 'eco-camera',
    icon: Camera,
    category: 'DSLR & Mirrorless Optics',
    headline: 'Sony, Canon, Nikon & Lenses',
    description: 'Specialized laser sensor testing, exact shutter count readout, and optical fungus check with doorstep cash.',
    brands: ['Sony Alpha', 'Canon EOS R', 'Nikon Z-Mount', 'Sigma & GM Lenses'],
    sellUrl: '/sell-device-get-quote?cat=cat-dslr',
    buyUrl: '/buy-refurbished',
    exchangeUrl: '/exchange-device',
    color: 'from-emerald-600 to-teal-700',
    borderGlow: 'hover:border-emerald-400',
    tag: '🔬 Digital Shutter Check',
  },
  {
    id: 'eco-tablet',
    icon: Tablet,
    category: 'Tablets & iPads',
    headline: 'iPad Pro, Air & Galaxy Tabs',
    description: 'Upgrade your digital studio or liquidate unused tablets. Doorstep screen diagnostics and instant IMPS payment.',
    brands: ['iPad Pro M4', 'iPad Air', 'Galaxy Tab S9', 'Drawing Tablets'],
    sellUrl: '/sell-device-get-quote?cat=cat-tablet',
    buyUrl: '/buy-refurbished',
    exchangeUrl: '/exchange-device',
    color: 'from-amber-600 to-orange-700',
    borderGlow: 'hover:border-amber-400',
    tag: '✨ Battery & Screen QA',
  },
];

export default function DeviceEcosystemShowcase() {
  return (
    <section className="py-10 lg:py-16 bg-white border-b border-slate-100 relative overflow-hidden">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold uppercase tracking-wider mb-2.5">
            <Sparkles size={13} className="text-purple-600" />
            Complete ReCommerce Ecosystem
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            One Platform to <span className="bg-gradient-to-r from-emerald-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Sell, Buy &amp; Exchange</span> All Tech
          </h2>
          <p className="text-slate-600 mt-2 text-sm sm:text-base leading-relaxed">
            Whether upgrading your daily smartphone, liquidating studio gear, or picking up a certified MacBook, Camsik delivers peak value with 100% security.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className={`rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group ${item.borderGlow} hover:-translate-y-1`}
              >
                <div>
                  {/* Top Bar: Icon + Tag */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
                      <Icon size={24} />
                    </div>
                    <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                      {item.tag}
                    </span>
                  </div>

                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    {item.category}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mb-2">
                    {item.headline}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {item.description}
                  </p>

                  {/* Brand Pills */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {item.brands.map((b) => (
                      <span
                        key={b}
                        className="px-2 py-0.5 rounded-md bg-slate-50 text-[10px] font-semibold text-slate-600 border border-slate-100"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 3 Quick Action Links */}
                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <Link
                    href={item.sellUrl}
                    className="flex items-center justify-between p-2 rounded-xl text-xs font-bold text-emerald-700 hover:bg-emerald-50 transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <Zap size={13} className="text-emerald-600" />
                      Sell for Instant Cash
                    </span>
                    <ArrowRight size={13} />
                  </Link>

                  <Link
                    href={item.buyUrl}
                    className="flex items-center justify-between p-2 rounded-xl text-xs font-bold text-indigo-700 hover:bg-indigo-50 transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <ShoppingBag size={13} className="text-indigo-600" />
                      Buy Certified Refurbished
                    </span>
                    <ArrowRight size={13} />
                  </Link>

                  <Link
                    href={item.exchangeUrl}
                    className="flex items-center justify-between p-2 rounded-xl text-xs font-bold text-purple-700 hover:bg-purple-50 transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <RefreshCw size={13} className="text-purple-600" />
                      1-Step Device Exchange
                    </span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
