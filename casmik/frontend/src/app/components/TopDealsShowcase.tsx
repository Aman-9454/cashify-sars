'use client';
import React, { useState, useRef, useMemo } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Zap,
  ShieldCheck,
  ArrowLeftRight,
  Percent,
  CheckCircle2,
  Tag,
  Smartphone,
  Laptop,
  Camera,
  Tablet,
} from 'lucide-react';
import { deviceModels, categories } from '@/lib/casmikData';
import { defaultRefurbishedProducts, RefurbishedProduct } from '@/lib/refurbishedCatalog';

type DealMode = 'sell' | 'buy' | 'exchange';

interface ExchangeDeal {
  id: string;
  name: string;
  category: string;
  categoryId: string;
  image: string;
  tradeInFrom: string;
  upgradeTo: string;
  tradeInValue: number;
  bonusAmount: number;
  effectiveUpgradePrice: number;
  specs: string;
  popularBadge: string;
}

const curatedExchangeDeals: ExchangeDeal[] = [
  {
    id: 'ex-iphone-15-pro',
    name: 'Apple iPhone 15 Pro (128GB)',
    category: 'Smartphones',
    categoryId: 'cat-smartphone',
    image: '/assets/images/refurbished/iphone-15-pro.png',
    tradeInFrom: 'iPhone 13 / 14 Pro',
    upgradeTo: 'iPhone 15 Pro (Titanium)',
    tradeInValue: 34000,
    bonusAmount: 5000,
    effectiveUpgradePrice: 24999,
    specs: 'A17 Pro · 48MP Triple Lens · 120Hz ProMotion',
    popularBadge: '🔥 Top Phone Upgrade',
  },
  {
    id: 'ex-sony-a7-iv',
    name: 'Sony Alpha 7 IV (Body)',
    category: 'DSLR & Mirrorless',
    categoryId: 'cat-dslr',
    image: 'https://camsik.com/img/product/c6e39542-a7d0-4ddf-9d3a-2303e3a479ff.png',
    tradeInFrom: 'Sony A7 III / Canon 80D',
    upgradeTo: 'Sony Alpha 7 IV 33MP',
    tradeInValue: 85000,
    bonusAmount: 6000,
    effectiveUpgradePrice: 58000,
    specs: '33MP Full-Frame · 4K 60p 10-bit · BIONZ XR',
    popularBadge: '⭐ Creator Favorite',
  },
  {
    id: 'ex-macbook-pro-m3',
    name: 'MacBook Pro 14" M3 (512GB)',
    category: 'Laptops',
    categoryId: 'cat-laptop',
    image: '/assets/images/refurbished/macbook-pro-m3.png',
    tradeInFrom: 'MacBook Air M1 / Dell XPS',
    upgradeTo: 'MacBook Pro M3 Pro',
    tradeInValue: 52000,
    bonusAmount: 7000,
    effectiveUpgradePrice: 69999,
    specs: 'M3 Pro Chip · Liquid Retina XDR · 18GB Unified',
    popularBadge: '💻 Pro Workflow Pick',
  },
  {
    id: 'ex-canon-eos-r6',
    name: 'Canon EOS R6 Mark II',
    category: 'DSLR & Mirrorless',
    categoryId: 'cat-dslr',
    image: 'https://camsik.com/img/product/bdf13589-9e8c-4731-bf5c-15a454d6f8fc.png',
    tradeInFrom: 'Canon 5D Mark IV / 6D II',
    upgradeTo: 'EOS R6 II Full-Frame',
    tradeInValue: 92000,
    bonusAmount: 5500,
    effectiveUpgradePrice: 62000,
    specs: '24.2MP · 40 fps Electronic · 6K Oversampled',
    popularBadge: '📸 Wedding Pro Upgrade',
  },
  {
    id: 'ex-samsung-s24-ultra',
    name: 'Samsung Galaxy S24 Ultra',
    category: 'Smartphones',
    categoryId: 'cat-smartphone',
    image: '/assets/images/refurbished/samsung-s24-ultra.png',
    tradeInFrom: 'Galaxy S22 / S21 Ultra',
    upgradeTo: 'S24 Ultra Galaxy AI',
    tradeInValue: 42000,
    bonusAmount: 5000,
    effectiveUpgradePrice: 38999,
    specs: 'Snapdragon 8 Gen 3 · 200MP · Titanium Frame',
    popularBadge: '🚀 Flagship AI Upgrade',
  },
  {
    id: 'ex-ipad-pro-m4',
    name: 'iPad Pro 11" M4 (256GB)',
    category: 'Tablets & iPads',
    categoryId: 'cat-tablet',
    image: '/assets/images/refurbished/ipad-pro-m4.png',
    tradeInFrom: 'iPad Air 4 / iPad Pro 2020',
    upgradeTo: 'iPad Pro OLED M4',
    tradeInValue: 28000,
    bonusAmount: 4000,
    effectiveUpgradePrice: 34999,
    specs: 'Ultra Retina XDR OLED · M4 Chip · 5.3mm Ultra Thin',
    popularBadge: '🎨 Digital Artists Pick',
  },
  {
    id: 'ex-sony-24-70-gm',
    name: 'Sony FE 24-70mm f/2.8 GM II',
    category: 'Camera Lenses',
    categoryId: 'cat-lens',
    image: 'https://camsik.com/img/product/f47aeaf5-b1a1-432d-947f-8be7815b3c3b.png',
    tradeInFrom: 'Sigma 24-70 / GM Gen 1',
    upgradeTo: 'Sony 24-70 GM II',
    tradeInValue: 68000,
    bonusAmount: 4500,
    effectiveUpgradePrice: 42000,
    specs: 'f/2.8 Constant Aperture · Lightweight 695g · 4 XD Linear Motors',
    popularBadge: '🔍 Sharpest Standard Zoom',
  },
  {
    id: 'ex-dji-action-4',
    name: 'DJI Osmo Action 4 Adventure Combo',
    category: 'Action Cameras',
    categoryId: 'cat-action-camera',
    image: 'https://camsik.com/img/product/6e8121dd-49f6-4df5-b458-7990f5d11eae.png',
    tradeInFrom: 'GoPro Hero 9 / 10',
    upgradeTo: 'DJI Action 4 1/1.3" Sensor',
    tradeInValue: 14000,
    bonusAmount: 2500,
    effectiveUpgradePrice: 15499,
    specs: '1/1.3" Low-Light Sensor · 4K/120fps · Magnetic Quick-Release',
    popularBadge: '🎥 Action Creator Pick',
  },
];

export default function TopDealsShowcase() {
  const [dealMode, setDealMode] = useState<DealMode>('sell');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const getCategoryFallback = (categoryId: string) => {
    switch (categoryId) {
      case 'cat-dslr':
      case 'Cameras': return '/assets/images/categories/dslr.png';
      case 'cat-lens': return '/assets/images/categories/lens.png';
      case 'cat-video':
      case 'cat-video-camera': return '/assets/images/categories/video.png';
      case 'cat-action':
      case 'cat-action-camera': return '/assets/images/categories/action.png';
      case 'cat-gimbal': return '/assets/images/categories/gimbal.png';
      case 'cat-smartphone':
      case 'Smartphones': return '/assets/images/categories/smartphone.png';
      case 'cat-laptop':
      case 'Laptops': return '/assets/images/categories/laptop.png';
      case 'cat-tablet':
      case 'Tablets': return '/assets/images/categories/tablet.png';
      default: return '/assets/images/categories/dslr.png';
    }
  };

  // Filter products based on active category & mode
  const filteredSellProducts = useMemo(() => {
    if (activeCategory === 'all') return deviceModels;
    return deviceModels.filter((m) => m.categoryId === activeCategory);
  }, [activeCategory]);

  const filteredBuyProducts = useMemo(() => {
    if (activeCategory === 'all') return defaultRefurbishedProducts;
    return defaultRefurbishedProducts.filter((p) => {
      if (activeCategory === 'cat-smartphone') return p.category === 'Smartphones';
      if (activeCategory === 'cat-dslr' || activeCategory === 'cat-lens' || activeCategory === 'cat-video-camera') return p.category === 'Cameras';
      if (activeCategory === 'cat-laptop') return p.category === 'Laptops';
      if (activeCategory === 'cat-tablet') return p.category === 'Tablets';
      return false;
    });
  }, [activeCategory]);

  const filteredExchangeProducts = useMemo(() => {
    if (activeCategory === 'all') return curatedExchangeDeals;
    return curatedExchangeDeals.filter((d) => d.categoryId === activeCategory);
  }, [activeCategory]);

  return (
    <section id="top-deals-section" className="py-8 lg:py-12 bg-slate-50/80 border-b border-slate-200/80">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        {/* Top Header Row */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-6 gap-5">
          <div>
            {/* Dynamic Status Pill */}
            {dealMode === 'sell' && (
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-100/80 border border-emerald-300 text-xs font-black text-emerald-800 mb-2.5">
                <Zap size={13} className="text-emerald-600 fill-emerald-600" />
                <span>HIGHEST RESALE PAYOUTS FOR TECH &amp; CAMERAS THIS WEEK</span>
              </div>
            )}
            {dealMode === 'buy' && (
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-100/80 border border-indigo-300 text-xs font-black text-indigo-800 mb-2.5">
                <Sparkles size={13} className="text-indigo-600 fill-indigo-600" />
                <span>45-POINT CERTIFIED REFURBISHED DEALS WITH WARRANTY</span>
              </div>
            )}
            {dealMode === 'exchange' && (
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-purple-100/80 border border-purple-300 text-xs font-black text-purple-800 mb-2.5">
                <ArrowLeftRight size={13} className="text-purple-600" />
                <span>POPULAR 1-STEP TRADE-IN COMBOS + EXTRA ₹5,000 BONUS</span>
              </div>
            )}

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
              {dealMode === 'sell' && (
                <>
                  Top Selling{' '}
                  <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    Devices &amp; Cameras
                  </span>
                </>
              )}
              {dealMode === 'buy' && (
                <>
                  Top Buying{' '}
                  <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                    Certified Refurbished
                  </span>
                </>
              )}
              {dealMode === 'exchange' && (
                <>
                  Top Exchange{' '}
                  <span className="bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                    &amp; Upgrade Deals
                  </span>
                </>
              )}
            </h2>

            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {dealMode === 'sell' && 'Get guaranteed peak payouts with free doorstep pickup across 200+ cities in India'}
              {dealMode === 'buy' && 'Pre-owned phones, MacBooks, iPads & DSLRs tested with 6–12 months warranty'}
              {dealMode === 'exchange' && 'Trade your current phone, laptop or camera for a modern upgrade with zero hassle'}
            </p>
          </div>

          {/* Right Controls: Mode Tabs + Scroll Arrows */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 self-stretch lg:self-auto">
            {/* 3 Interactive Mode Tabs */}
            <div className="flex items-center p-1 rounded-2xl bg-white border border-slate-200/90 shadow-sm w-full sm:w-auto overflow-x-auto">
              <button
                type="button"
                onClick={() => {
                  setDealMode('sell');
                  setActiveCategory('all');
                }}
                className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
                  dealMode === 'sell'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                    : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/50'
                }`}
              >
                <Zap size={14} className={dealMode === 'sell' ? 'fill-white' : 'text-emerald-600'} />
                <span>Top Selling</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${dealMode === 'sell' ? 'bg-emerald-700/80 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {deviceModels.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setDealMode('buy');
                  setActiveCategory('all');
                }}
                className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
                  dealMode === 'buy'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                    : 'text-slate-600 hover:text-indigo-700 hover:bg-indigo-50/50'
                }`}
              >
                <Sparkles size={14} className={dealMode === 'buy' ? 'fill-white' : 'text-indigo-600'} />
                <span>Top Buying</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${dealMode === 'buy' ? 'bg-indigo-700/80 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {defaultRefurbishedProducts.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setDealMode('exchange');
                  setActiveCategory('all');
                }}
                className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
                  dealMode === 'exchange'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
                    : 'text-slate-600 hover:text-purple-700 hover:bg-purple-50/50'
                }`}
              >
                <ArrowLeftRight size={14} className={dealMode === 'exchange' ? 'text-white' : 'text-purple-600'} />
                <span>Exchange Deals</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${dealMode === 'exchange' ? 'bg-purple-700/80 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {curatedExchangeDeals.length}
                </span>
              </button>
            </div>

            {/* Navigation Arrows */}
            <div className="hidden sm:flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={() => scroll('left')}
                className="w-10 h-10 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors"
                aria-label="Scroll Left"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => scroll('right')}
                className="w-10 h-10 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors"
                aria-label="Scroll Right"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-5 no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 ${
              activeCategory === 'all'
                ? dealMode === 'sell'
                  ? 'bg-emerald-700 text-white shadow-md shadow-emerald-600/20'
                  : dealMode === 'buy'
                  ? 'bg-indigo-700 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-purple-700 text-white shadow-md shadow-purple-600/20'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 ${
                activeCategory === cat.id
                  ? dealMode === 'sell'
                    ? 'bg-emerald-700 text-white shadow-md shadow-emerald-600/20'
                    : dealMode === 'buy'
                    ? 'bg-indigo-700 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-purple-700 text-white shadow-md shadow-purple-600/20'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* ── CAROUSEL TRACK: MODE 1 (TOP SELLING) ── */}
        {dealMode === 'sell' && (
          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scroll-smooth no-scrollbar"
          >
            {filteredSellProducts.map((prod) => (
              <div
                key={prod.id}
                className="w-[280px] sm:w-[300px] flex-shrink-0 snap-start bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-xl hover:border-emerald-400 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                      {prod.categoryId === 'cat-smartphone'
                        ? 'Smartphone'
                        : prod.categoryId === 'cat-laptop'
                        ? 'Laptop'
                        : prod.categoryId === 'cat-tablet'
                        ? 'Tablet'
                        : prod.id.startsWith('lens-')
                        ? 'Lens'
                        : 'Camera'}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                      <Zap size={11} className="fill-emerald-500 text-emerald-500" />
                      Instant Cash
                    </span>
                  </div>

                  {/* Product Image */}
                  <div className="w-full h-44 rounded-xl bg-slate-50 p-3 flex items-center justify-center overflow-hidden mb-4 border border-slate-100">
                    <img
                      src={prod.image}
                      alt={prod.alt}
                      className="max-w-full max-h-full object-contain group-hover:scale-108 transition-transform duration-300 filter drop-shadow-sm"
                      onError={(e) => {
                        const fallback = getCategoryFallback(prod.categoryId);
                        if (e.currentTarget.src !== fallback) {
                          e.currentTarget.src = fallback;
                        }
                      }}
                    />
                  </div>

                  {/* Product Name */}
                  <h3 className="font-extrabold text-base text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1 mb-1">
                    {prod.name}
                  </h3>

                  {/* Specs */}
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-4 line-clamp-1">
                    {Object.entries(prod.specs)
                      .slice(0, 2)
                      .map(([k, v]) => (
                        <span key={k} className="bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                          {v}
                        </span>
                      ))}
                  </div>
                </div>

                {/* Bottom Price & Action */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block -mb-0.5">Get Up to</span>
                    <span className="text-lg font-black text-slate-900 tracking-tight">
                      ₹{prod.basePrice.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <Link
                    href={`/sell-device-get-quote?model=${prod.slug}`}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 hover:shadow-emerald-600/30 flex items-center gap-1 transition-all"
                  >
                    <span>Sell Now</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── CAROUSEL TRACK: MODE 2 (TOP BUYING REFURBISHED) ── */}
        {dealMode === 'buy' && (
          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scroll-smooth no-scrollbar"
          >
            {filteredBuyProducts.map((prod) => (
              <div
                key={prod.id}
                className="w-[280px] sm:w-[300px] flex-shrink-0 snap-start bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-xl hover:border-indigo-400 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-[10px] font-black text-indigo-700 uppercase tracking-wide border border-indigo-200/60">
                      {prod.condition} Grade
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                      <ShieldCheck size={12} className="text-emerald-500" />
                      {prod.warranty}
                    </span>
                  </div>

                  {/* Product Image */}
                  <div className="w-full h-44 rounded-xl bg-slate-50 p-3 flex items-center justify-center overflow-hidden mb-4 border border-slate-100">
                    <img
                      src={prod.image}
                      alt={prod.model}
                      className="max-w-full max-h-full object-contain group-hover:scale-108 transition-transform duration-300 filter drop-shadow-sm"
                      onError={(e) => {
                        const fallback = getCategoryFallback(prod.category);
                        if (e.currentTarget.src !== fallback) {
                          e.currentTarget.src = fallback;
                        }
                      }}
                    />
                  </div>

                  {/* Product Title */}
                  <h3 className="font-extrabold text-base text-slate-900 group-hover:text-indigo-700 transition-colors line-clamp-1 mb-0.5">
                    {prod.brand} {prod.model}
                  </h3>

                  <p className="text-[11px] text-slate-500 line-clamp-1 mb-2">
                    {prod.storage} · {prod.color} · 45-Point Certified
                  </p>

                  {/* Mini Tags */}
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-600 mb-4">
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                      Battery: {typeof prod.batteryHealth === 'number' ? `${prod.batteryHealth}%` : prod.batteryHealth}
                    </span>
                    <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-100 font-bold">
                      {prod.discount}% OFF
                    </span>
                  </div>
                </div>

                {/* Bottom Price & Action */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 line-through block -mb-0.5">
                      ₹{prod.originalPrice.toLocaleString('en-IN')}
                    </span>
                    <span className="text-lg font-black text-slate-900 tracking-tight">
                      ₹{prod.sellingPrice.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <Link
                    href={`/buy-refurbished`}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 flex items-center gap-1 transition-all"
                  >
                    <span>Buy Now</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── CAROUSEL TRACK: MODE 3 (TOP EXCHANGE DEALS) ── */}
        {dealMode === 'exchange' && (
          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scroll-smooth no-scrollbar"
          >
            {filteredExchangeProducts.map((deal) => (
              <div
                key={deal.id}
                className="w-[290px] sm:w-[310px] flex-shrink-0 snap-start bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-xl hover:border-purple-400 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2 py-0.5 rounded-md bg-purple-50 text-[10px] font-black text-purple-700 uppercase tracking-wide border border-purple-200/60">
                      {deal.popularBadge}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600">
                      +₹{deal.bonusAmount.toLocaleString('en-IN')} Bonus
                    </span>
                  </div>

                  {/* Product Image */}
                  <div className="w-full h-44 rounded-xl bg-slate-50 p-3 flex items-center justify-center overflow-hidden mb-4 border border-slate-100">
                    <img
                      src={deal.image}
                      alt={deal.name}
                      className="max-w-full max-h-full object-contain group-hover:scale-108 transition-transform duration-300 filter drop-shadow-sm"
                      onError={(e) => {
                        const fallback = getCategoryFallback(deal.categoryId);
                        if (e.currentTarget.src !== fallback) {
                          e.currentTarget.src = fallback;
                        }
                      }}
                    />
                  </div>

                  {/* Trade In Path */}
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 mb-3">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
                      <span>Trade-in from:</span>
                      <span className="text-slate-800">{deal.tradeInFrom}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-purple-700">
                      <span>Upgrade target:</span>
                      <span className="text-purple-900 truncate max-w-[140px]">{deal.upgradeTo}</span>
                    </div>
                  </div>

                  <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-purple-700 transition-colors line-clamp-1 mb-1">
                    {deal.name}
                  </h3>

                  <p className="text-[11px] text-slate-500 line-clamp-1 mb-3">
                    {deal.specs}
                  </p>
                </div>

                {/* Bottom Upgrade Price & Action */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-purple-700 block -mb-0.5">
                      Upgrade From
                    </span>
                    <span className="text-lg font-black text-slate-900 tracking-tight">
                      ₹{deal.effectiveUpgradePrice.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <Link
                    href={`/exchange-device`}
                    className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/20 hover:shadow-purple-600/30 flex items-center gap-1 transition-all"
                  >
                    <span>Exchange</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
