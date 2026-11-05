'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  RotateCcw, 
  Tag, 
  CheckCircle2, 
  Star, 
  MapPin, 
  Search, 
  ChevronRight,
  TrendingUp,
  Cpu,
  Clock,
  Heart
} from 'lucide-react';
import { categories, Category } from '@/lib/casmikData';

interface UserHomeViewProps {
  onNavigateTab: (tabId: string) => void;
}

export default function UserHomeView({ onNavigateTab }: UserHomeViewProps) {
  const [selectedCity, setSelectedCity] = useState('New Delhi');
  const [searchQuery, setSearchQuery] = useState('');

  const banners = [
    {
      id: 1,
      title: 'Instant Sell & Doorstep Cash',
      subtitle: 'Get up to ₹85,000 for your old phone, laptop or camera',
      tag: '🔥 Diwali Super Bonus +₹2,500',
      actionTab: 'sell',
      gradient: 'from-emerald-600 via-teal-700 to-slate-900',
      btnText: 'Calculate Value'
    },
    {
      id: 2,
      title: 'Certified Refurbished Tech',
      subtitle: '32-Point Quality Inspected with 1-Year Pan-India Warranty',
      tag: '✨ Up to 70% Off Retail',
      actionTab: 'buy',
      gradient: 'from-blue-600 via-indigo-700 to-slate-900',
      btnText: 'Shop Devices'
    },
    {
      id: 3,
      title: '1-Step Doorstep Exchange',
      subtitle: 'Handover old device, receive new device on spot with zero downtime',
      tag: '🔄 Seamless Upgrade',
      actionTab: 'exchange',
      gradient: 'from-purple-600 via-pink-700 to-slate-900',
      btnText: 'Exchange Now'
    }
  ];

  const featuredDeals = [
    {
      id: 'deal-1',
      name: 'Apple iPhone 14 Pro (128GB)',
      category: 'Smartphones',
      condition: 'Superb',
      price: '₹58,999',
      originalPrice: '₹1,29,900',
      discount: '55% OFF',
      image: 'https://ik.imagekit.io/avdarinn/casmik/phones/iphone-14-pro.png',
      badge: 'Bestseller'
    },
    {
      id: 'deal-2',
      name: 'Sony Alpha A7 III Mirrorless',
      category: 'DSLR & Mirrorless',
      condition: 'Pristine',
      price: '₹89,500',
      originalPrice: '₹1,64,990',
      discount: '46% OFF',
      image: 'https://ik.imagekit.io/avdarinn/casmik/cameras/sony-a7iii.png',
      badge: 'Certified'
    },
    {
      id: 'deal-3',
      name: 'MacBook Air M2 (16GB/256GB)',
      category: 'Laptops',
      condition: 'Flawless',
      price: '₹69,900',
      originalPrice: '₹1,14,900',
      discount: '39% OFF',
      image: 'https://ik.imagekit.io/avdarinn/casmik/laptops/macbook-air-m2.png',
      badge: 'Top Pick'
    }
  ];

  const filteredCategories = categories.filter(c => 
    !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-5 px-3.5 py-3 text-slate-100 animate-in fade-in duration-300">
      {/* City & Search Bar */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">Doorstep Service in:</span>
            <select 
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-transparent text-emerald-400 font-bold border-none outline-none cursor-pointer text-xs"
            >
              <option value="New Delhi" className="bg-slate-900 text-slate-100">Delhi NCR</option>
              <option value="Mumbai" className="bg-slate-900 text-slate-100">Mumbai</option>
              <option value="Bengaluru" className="bg-slate-900 text-slate-100">Bengaluru</option>
              <option value="Hyderabad" className="bg-slate-900 text-slate-100">Hyderabad</option>
              <option value="Pune" className="bg-slate-900 text-slate-100">Pune</option>
            </select>
          </div>
          <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            Live Pickup Available
          </span>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search iPhone, MacBook, Sony A7, Canon..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800/90 border border-slate-700/80 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 transition-all shadow-inner"
          />
        </div>
      </div>

      {/* Hero Promo Cards Slider */}
      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none snap-x snap-mandatory">
        {banners.map((banner) => (
          <div
            key={banner.id}
            className={`min-w-[92%] sm:min-w-[85%] bg-gradient-to-br ${banner.gradient} rounded-3xl p-4 shadow-xl border border-white/10 flex flex-col justify-between snap-start relative overflow-hidden`}
          >
            <div className="relative z-10 space-y-2">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-[10px] font-black tracking-wide text-white border border-white/10">
                {banner.tag}
              </span>
              <h3 className="text-base font-black text-white leading-tight">
                {banner.title}
              </h3>
              <p className="text-[11px] text-slate-200/90 line-clamp-2">
                {banner.subtitle}
              </p>
            </div>

            <div className="mt-4 pt-2 border-t border-white/10 flex items-center justify-between relative z-10">
              <button
                onClick={() => onNavigateTab(banner.actionTab)}
                className="px-4 py-1.5 rounded-xl bg-white text-slate-900 font-bold text-xs flex items-center gap-1.5 hover:bg-slate-100 active:scale-95 transition-all shadow-md"
              >
                <span>{banner.btnText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] text-white/80 font-medium">Verified by Casmik</span>
            </div>

            {/* Decorative background glow */}
            <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          </div>
        ))}
      </div>

      {/* 3 Core Action Hub: World-Class Mobile Grid */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => onNavigateTab('sell')}
          className="bg-gradient-to-b from-emerald-500/20 to-emerald-950/40 border border-emerald-500/40 rounded-2xl p-3 flex flex-col items-center justify-center text-center space-y-1.5 hover:border-emerald-400 active:scale-95 transition-all group shadow-lg"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/30 group-hover:scale-110 transition-transform">
            <Zap className="w-5 h-5" />
          </div>
          <span className="text-xs font-black text-white">Sell Device</span>
          <span className="text-[9px] text-emerald-400 font-medium">Instant Cash</span>
        </button>

        <button
          onClick={() => onNavigateTab('buy')}
          className="bg-gradient-to-b from-blue-500/20 to-blue-950/40 border border-blue-500/40 rounded-2xl p-3 flex flex-col items-center justify-center text-center space-y-1.5 hover:border-blue-400 active:scale-95 transition-all group shadow-lg"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/30 group-hover:scale-110 transition-transform">
            <Tag className="w-5 h-5" />
          </div>
          <span className="text-xs font-black text-white">Buy Refurb</span>
          <span className="text-[9px] text-blue-400 font-medium">1-Yr Warranty</span>
        </button>

        <button
          onClick={() => onNavigateTab('exchange')}
          className="bg-gradient-to-b from-purple-500/20 to-purple-950/40 border border-purple-500/40 rounded-2xl p-3 flex flex-col items-center justify-center text-center space-y-1.5 hover:border-purple-400 active:scale-95 transition-all group shadow-lg"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-500/30 group-hover:scale-110 transition-transform">
            <RotateCcw className="w-5 h-5" />
          </div>
          <span className="text-xs font-black text-white">Exchange</span>
          <span className="text-[9px] text-purple-400 font-medium">Spot Difference</span>
        </button>
      </div>

      {/* Explore Categories */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black text-white tracking-wider uppercase flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            Device Categories
          </h2>
          <span className="text-[11px] text-slate-400">{filteredCategories.length} Categories</span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {filteredCategories.slice(0, 8).map((cat) => (
            <button
              key={cat.id}
              onClick={() => onNavigateTab('sell')}
              className="bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 rounded-2xl p-2.5 flex flex-col items-center text-center space-y-1 active:scale-95 transition-all group"
            >
              <div className="text-2xl group-hover:scale-110 transition-transform">
                {cat.icon || '📱'}
              </div>
              <span className="text-[10px] font-bold text-slate-200 line-clamp-1">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Top Certified Refurbished Deals */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <h2 className="text-xs font-black text-white tracking-wider uppercase">
              Top Deals of the Day
            </h2>
          </div>
          <button 
            onClick={() => onNavigateTab('buy')}
            className="text-[11px] font-bold text-emerald-400 flex items-center hover:underline"
          >
            View All
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-2.5">
          {featuredDeals.map((deal) => (
            <div
              key={deal.id}
              className="bg-slate-800/80 border border-slate-700/70 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-md hover:border-slate-600 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center p-1 relative overflow-hidden flex-shrink-0">
                  <span className="text-2xl">📱</span>
                  <span className="absolute top-0 right-0 bg-emerald-500 text-white text-[8px] font-black px-1 rounded-bl">
                    {deal.discount}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white line-clamp-1">{deal.name}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                    <span>{deal.category}</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold">{deal.condition}</span>
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-sm font-black text-white">{deal.price}</span>
                    <span className="text-[10px] text-slate-500 line-through">{deal.originalPrice}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onNavigateTab('buy')}
                className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-[11px] font-bold shadow-md shadow-emerald-500/20 active:scale-95 transition-all flex-shrink-0"
              >
                Buy Now
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Casmik 4 Pillars of Protection */}
      <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-3.5 space-y-3">
        <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Camsik Trust & Security Guarantee
        </h3>

        <div className="grid grid-cols-2 gap-2 text-[10px]">
          <div className="flex items-start gap-1.5 bg-slate-900/60 p-2 rounded-xl border border-slate-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-200 block">DoD Data Wipe</span>
              <span className="text-slate-400">100% certified data erasure</span>
            </div>
          </div>
          <div className="flex items-start gap-1.5 bg-slate-900/60 p-2 rounded-xl border border-slate-800">
            <Zap className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-200 block">Instant Payout</span>
              <span className="text-slate-400">Bank UPI at your doorstep</span>
            </div>
          </div>
          <div className="flex items-start gap-1.5 bg-slate-900/60 p-2 rounded-xl border border-slate-800">
            <Clock className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-200 block">Free Doorstep</span>
              <span className="text-slate-400">Pickup in 2 hours</span>
            </div>
          </div>
          <div className="flex items-start gap-1.5 bg-slate-900/60 p-2 rounded-xl border border-slate-800">
            <Star className="w-3.5 h-3.5 text-purple-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-200 block">1-Year Warranty</span>
              <span className="text-slate-400">On certified refurbished</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
