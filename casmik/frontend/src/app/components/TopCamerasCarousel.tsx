'use client';
import React, { useState, useRef } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Tag,
  Zap,
} from 'lucide-react';
import { deviceModels, categories } from '@/lib/casmikData';

export default function TopCamerasCarousel() {
  const [activeTab, setActiveTab] = useState<string>('all');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const filteredProducts = activeTab === 'all'
    ? deviceModels
    : deviceModels.filter((m) => m.categoryId === activeTab);

  const getCategoryFallback = (categoryId: string) => {
    switch (categoryId) {
      case 'cat-dslr': return '/assets/images/categories/dslr.png';
      case 'cat-lens': return '/assets/images/categories/lens.png';
      case 'cat-video':
      case 'cat-video-camera': return '/assets/images/categories/video.png';
      case 'cat-action':
      case 'cat-action-camera': return '/assets/images/categories/action.png';
      case 'cat-gimbal': return '/assets/images/categories/gimbal.png';
      case 'cat-smartphone': return '/assets/images/categories/smartphone.png';
      case 'cat-laptop': return '/assets/images/categories/laptop.png';
      case 'cat-tablet': return '/assets/images/categories/tablet.png';
      default: return '/assets/images/categories/dslr.png';
    }
  };

  return (
    <section className="py-8 lg:py-10 bg-slate-50 border-b border-slate-200/60">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-8 xl:px-10">
        {/* Header Row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-5 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100/70 border border-purple-200 text-xs font-bold text-purple-800 mb-2">
              <TrendingUp size={13} className="text-purple-600" />
              <span>MOST VALUED TECH & CAMERA GEAR TODAY</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
              Top Selling <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Devices & Cameras</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Users and creators are getting peak payouts for these models this week
            </p>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <button
              onClick={() => scroll('left')}
              className="w-10 h-10 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 hover:text-purple-600 transition-colors"
              aria-label="Scroll Left"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-10 h-10 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 hover:text-purple-600 transition-colors"
              aria-label="Scroll Right"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 ${
              activeTab === 'all'
                ? 'bg-purple-700 text-white shadow-md shadow-purple-600/20'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-purple-300 hover:text-slate-900'
            }`}
          >
            All Gear ({deviceModels.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveTab(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 ${
                activeTab === cat.id
                  ? 'bg-purple-700 text-white shadow-md shadow-purple-600/20'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-purple-300 hover:text-slate-900'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Horizontal Carousel Track */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scroll-smooth no-scrollbar"
        >
          {filteredProducts.map((prod) => (
            <div
              key={prod.id}
              className="w-[280px] sm:w-[300px] flex-shrink-0 snap-start bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-xl hover:border-purple-300 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group"
            >
              {/* Product Top Header: Brand Tag + Instant Badge */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                    {prod.id.startsWith('cam-')
                      ? 'Camera'
                      : prod.id.startsWith('lens-')
                      ? 'Lens'
                      : prod.id.startsWith('vid-')
                      ? 'Camcorder'
                      : prod.id.startsWith('action-')
                      ? 'Action Cam'
                      : 'Gimbal'}
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
                <h3 className="font-extrabold text-base text-slate-900 group-hover:text-purple-700 transition-colors line-clamp-1 mb-1">
                  {prod.name}
                </h3>

                {/* Key specs row */}
                <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-4 line-clamp-1">
                  {Object.entries(prod.specs)
                    .slice(0, 2)
                    .map(([k, v]) => (
                      <span key={k} className="bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                        {v}
                      </span>
                    ))}
                </div>
              </div>

              {/* Bottom Price & CTA Bar */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block -mb-0.5">Get Up to</span>
                  <span className="text-lg font-black text-slate-900 tracking-tight">
                    ₹{prod.basePrice.toLocaleString('en-IN')}
                  </span>
                </div>

                <Link
                  href={`/sell-device-get-quote?model=${prod.slug}`}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/20 hover:shadow-purple-600/30 flex items-center gap-1 transition-all"
                >
                  <span>Sell Now</span>
                  <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
