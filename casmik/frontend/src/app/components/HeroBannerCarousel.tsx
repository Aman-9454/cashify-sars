'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Zap,
  Truck,
  Camera,
  ArrowRight,
  Search,
  CheckCircle,
  TrendingUp,
} from 'lucide-react';
import { deviceModels, brands } from '@/lib/casmikData';

interface HeroSlide {
  id: string;
  badge: string;
  titlePrefix: string;
  titleHighlight: string;
  titleSuffix?: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  categoryFilter: string;
  bgGradient: string;
  accentColor: string;
  image: string;
  imageAlt: string;
  stats: { label: string; value: string }[];
}

const slides: HeroSlide[] = [
  {
    id: 'slide-smartphone',
    badge: '📱 #1 SMARTPHONE & IPHONE BUYBACK',
    titlePrefix: 'Sell Used ',
    titleHighlight: 'Smartphones & iPhones',
    titleSuffix: ' for Peak Cash',
    description:
      'Get guaranteed highest resale payout for Apple iPhone 16/15 Pro, Samsung Galaxy S24, Google Pixel & OnePlus. AI instant quote, free doorstep pickup & spot UPI payment within 15 minutes.',
    ctaText: 'Check Phone Price',
    ctaLink: '/sell-device-get-quote?cat=cat-smartphone',
    categoryFilter: 'cat-smartphone',
    bgGradient: 'from-blue-950 via-slate-900 to-indigo-950',
    accentColor: '#3b82f6',
    image: '/assets/images/categories/smartphone-banner.png',
    imageAlt: 'Sell Used Smartphones and iPhones on Camsik',
    stats: [
      { label: 'Smartphones Sold', value: '3,20,000+' },
      { label: 'Payment Speed', value: 'Instant UPI / Bank' },
      { label: 'Data Wipe', value: '100% Certified' },
    ],
  },
  {
    id: 'slide-laptop',
    badge: '💻 MAX VALUE FOR LAPTOPS & MACBOOKS',
    titlePrefix: 'Turn Old ',
    titleHighlight: 'MacBook & Laptops',
    titleSuffix: ' Into Big Money',
    description:
      'Selling Apple MacBook Pro / Air M3, Dell XPS, HP Spectre, Lenovo ThinkPad or gaming laptops? Fair evaluation, zero hidden deductions & free doorstep inspection.',
    ctaText: 'Sell Old Laptop',
    ctaLink: '/sell-device-get-quote?cat=cat-laptop',
    categoryFilter: 'cat-laptop',
    bgGradient: 'from-violet-950 via-slate-900 to-purple-950',
    accentColor: '#8b5cf6',
    image: '/assets/images/categories/laptop.png',
    imageAlt: 'Sell Laptops and MacBooks on Camsik',
    stats: [
      { label: 'Laptops Liquidated', value: '95,000+' },
      { label: 'Doorstep Pickup', value: '100% Free' },
      { label: 'Turnaround Time', value: '15 Minutes' },
    ],
  },
  {
    id: 'slide-tablet',
    badge: '📟 INSTANT CASH FOR IPADS & TABLETS',
    titlePrefix: 'Upgrade Your ',
    titleHighlight: 'iPads & Tablets',
    titleSuffix: ' Today',
    description:
      'Instant AI-driven valuation for Apple iPad Pro M4, iPad Air, Samsung Galaxy Tab S9 & Lenovo tablets. Doorstep testing, hassle-free handover and instant bank transfer.',
    ctaText: 'Sell iPad / Tablet',
    ctaLink: '/sell-device-get-quote?cat=cat-tablet',
    categoryFilter: 'cat-tablet',
    bgGradient: 'from-cyan-950 via-slate-900 to-teal-950',
    accentColor: '#06b6d4',
    image: '/assets/images/categories/tablet.png',
    imageAlt: 'Sell Apple iPad and Android Tablets on Camsik',
    stats: [
      { label: 'Tablets Purchased', value: '62,000+' },
      { label: 'Best Price Match', value: 'Guaranteed' },
      { label: 'Happy Customers', value: '99.4%' },
    ],
  },
  {
    id: 'slide-dslr',
    badge: '★ #1 CAMERA BUYBACK PLATFORM IN INDIA',
    titlePrefix: 'Sell Used ',
    titleHighlight: 'DSLR & Mirrorless',
    titleSuffix: ' Cameras for Instant Cash',
    description:
      'Get guaranteed top market value for Canon, Nikon, Sony, LUMIX and Fujifilm cameras. AI-calculated valuation, free doorstep pickup & instant payment within minutes.',
    ctaText: 'Check Camera Price',
    ctaLink: '/sell-device-get-quote?cat=cat-dslr',
    categoryFilter: 'cat-dslr',
    bgGradient: 'from-purple-950 via-slate-900 to-indigo-950',
    accentColor: '#9333ea',
    image: 'https://camsik.com/img/Category/a44c5d48-0f22-4db2-bef9-f0edb0fb54f7.png',
    imageAlt: 'Sell Used DSLR & Mirrorless Camera on Camsik',
    stats: [
      { label: 'Happy Sellers', value: '1,85,000+' },
      { label: 'Google Rating', value: '4.8 / 5.0' },
      { label: 'Doorstep Pickup', value: '100% Free' },
    ],
  },
  {
    id: 'slide-lens',
    badge: '🔍 TOP VALUATION FOR ALL MOUNTS',
    titlePrefix: 'Turn Old ',
    titleHighlight: 'Camera Lenses',
    titleSuffix: ' Into Instant Money',
    description:
      'Selling Sony G Master, Canon RF/EF, Nikon Z, Sigma Art, or Tamron lenses? Get objective valuation without last-minute deductions.',
    ctaText: 'Sell Camera Lens',
    ctaLink: '/sell-device-get-quote?cat=cat-lens',
    categoryFilter: 'cat-lens',
    bgGradient: 'from-blue-950 via-slate-900 to-indigo-950',
    accentColor: '#3b82f6',
    image: 'https://camsik.com/img/Category/808ecde1-f8e7-45b3-ab62-8ec69183b2b7.png',
    imageAlt: 'Sell Camera Lenses on Camsik',
    stats: [
      { label: 'Lenses Purchased', value: '45,000+' },
      { label: 'Payment Speed', value: 'Spot UPI / Bank' },
      { label: 'Hidden Charges', value: '₹0 Zero' },
    ],
  },
  {
    id: 'slide-action-video',
    badge: '🎥 ACTION & 4K CAMCORDERS',
    titlePrefix: 'Sell 4K Video Cameras, ',
    titleHighlight: 'GoPro & Gimbals',
    titleSuffix: '',
    description:
      'Trade in your GoPro Hero, DJI Osmo Pocket, Insta360 X3, Canon XA Camcorders & 3-Axis Gimbals. Fast inspection and certified factory data wipe.',
    ctaText: 'Sell Video / Action Gear',
    ctaLink: '/sell-device-get-quote?cat=cat-action-camera',
    categoryFilter: 'cat-action-camera',
    bgGradient: 'from-emerald-950 via-slate-900 to-teal-950',
    accentColor: '#10b981',
    image: 'https://camsik.com/img/Category/209c7dc4-2916-40fe-b812-723f5c0b6a0b.png',
    imageAlt: 'Sell Video Cameras and Action Cameras on Camsik',
    stats: [
      { label: 'Action Gear Resold', value: '28,000+' },
      { label: 'Inspection Time', value: '15 Minutes' },
      { label: 'Data Privacy', value: '100% Guaranteed' },
    ],
  },
  {
    id: 'slide-safety',
    badge: '🛡️ 100% SAFE, RELIABLE & VERIFIED',
    titlePrefix: 'Selling Camera Gear is ',
    titleHighlight: 'Safe, Fast & Easy',
    titleSuffix: '',
    description:
      'Every pickup is handled by verified Camsik camera specialists. Valid purchase invoice issued on the spot with direct bank or UPI transfer.',
    ctaText: 'Start Safe Selling',
    ctaLink: '/sell-device-get-quote',
    categoryFilter: 'cat-dslr',
    bgGradient: 'from-slate-950 via-purple-950 to-slate-900',
    accentColor: '#a855f7',
    image: 'https://camsik.com/img/illustrations/shield_3d_check.jpg',
    imageAlt: 'Safe & Reliable Camera Buyback Guarantee',
    stats: [
      { label: 'Disbursed to Date', value: '₹13,898+ Cr.' },
      { label: 'Operating Cities', value: '200+ Cities' },
      { label: 'Customer Trust', value: 'Since 2015' },
    ],
  },
];

export default function HeroBannerCarousel() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchDropdown, setSearchDropdown] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused]);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  const activeSlide = slides[current];

  // Quick suggestions for search
  const filteredModels = searchQuery.trim()
    ? deviceModels.filter((m) => m.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5)
    : [];

  return (
    <section
      className="relative overflow-hidden pt-2 sm:pt-4 select-none w-full max-w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slide Canvas */}
      <div className={`relative min-h-[520px] sm:min-h-[520px] lg:min-h-[580px] bg-gradient-to-br ${activeSlide.bgGradient} transition-all duration-700 flex items-center overflow-hidden`}>
        {/* Subtle Decorative Glows */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-8 sm:py-12 lg:py-16 w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 xl:col-span-7 space-y-6 animate-in fade-in slide-in-from-left-4 duration-500 key={activeSlide.id}">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-bold tracking-wide text-purple-200">
                <Sparkles size={13} className="text-yellow-400" />
                <span>{activeSlide.badge}</span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-white leading-tight tracking-tight text-balance">
                {activeSlide.titlePrefix}
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-300 bg-clip-text text-transparent">
                  {activeSlide.titleHighlight}
                </span>
                {activeSlide.titleSuffix}
              </h1>

              {/* Description */}
              <p className="text-xs sm:text-base lg:text-lg text-slate-300 max-w-xl leading-relaxed">
                {activeSlide.description}
              </p>

              {/* Search & Instant CTA Row */}
              <div className="space-y-4 pt-2 max-w-xl">
                {/* Search Bar on Hero */}
                <div className="relative">
                  <div className="flex flex-col sm:flex-row sm:items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-1.5 shadow-2xl focus-within:bg-white/20 focus-within:border-purple-400 transition-all gap-1.5 sm:gap-0">
                    <div className="flex items-center flex-1 min-w-0">
                      <Search className="w-5 h-5 text-purple-300 ml-2.5 sm:ml-3 flex-shrink-0" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setSearchDropdown(true);
                        }}
                        onFocus={() => {
                          if (searchQuery) setSearchDropdown(true);
                        }}
                        placeholder="Search model (e.g. iPhone 16, MacBook, Sony A7...)"
                        className="w-full min-w-0 bg-transparent px-2.5 sm:px-3 py-2 text-sm text-white placeholder:text-slate-300 focus:outline-none"
                      />
                    </div>
                    <Link
                      href={activeSlide.ctaLink}
                      className="w-full sm:w-auto justify-center px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-purple-600/30 whitespace-nowrap transition-all flex items-center gap-1.5 hover:gap-2.5"
                    >
                      <span>{activeSlide.ctaText}</span>
                      <ArrowRight size={15} />
                    </Link>
                  </div>

                  {/* Autocomplete Dropdown in Hero */}
                  {searchDropdown && filteredModels.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden z-50 divide-y divide-white/10">
                      {filteredModels.map((m) => (
                        <Link
                          key={m.id}
                          href={`/sell-device-get-quote?model=${m.slug}`}
                          onClick={() => setSearchDropdown(false)}
                          className="flex items-center justify-between p-3 hover:bg-purple-600/20 transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-white/10 p-1 flex items-center justify-center">
                              <img src={m.image} alt={m.name} className="w-full h-full object-contain" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white group-hover:text-purple-300">{m.name}</p>
                              <p className="text-xs text-slate-400">Get up to ₹{m.basePrice.toLocaleString('en-IN')}</p>
                            </div>
                          </div>
                          <span className="text-xs font-semibold text-purple-400 group-hover:translate-x-1 transition-transform">
                            Sell Now →
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Popular Search Badges */}
                <div className="flex items-center gap-2 flex-wrap text-xs text-slate-300">
                  <span className="font-semibold text-slate-400">Popular:</span>
                  {['iPhone 16 Pro', 'MacBook Pro M3', 'iPad Pro M4', 'Galaxy S24 Ultra', 'Sony A7 III', 'Canon EOS RP'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setSearchQuery(item);
                        setSearchDropdown(true);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10 transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stats Counters on Slide */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-4 border-t border-white/10 max-w-xl">
                {activeSlide.stats.map((st) => (
                  <div key={st.label} className="min-w-0">
                    <p className="text-base sm:text-xl lg:text-2xl font-black text-white truncate">{st.value}</p>
                    <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 truncate">{st.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Visual / Camera Showcase */}
            <div className="lg:col-span-5 xl:col-span-5 flex justify-center items-center relative animate-in fade-in zoom-in-95 duration-500">
              <div
                className={`relative w-full ${
                  activeSlide.id === 'slide-smartphone'
                    ? 'max-w-[340px] sm:max-w-[480px] lg:max-w-[560px]'
                    : 'max-w-[280px] sm:max-w-[420px]'
                } aspect-[4/3] sm:aspect-square flex items-center justify-center mx-auto`}
              >
                {/* Glowing Orbit Rings */}
                <div className="absolute inset-0 rounded-full border border-purple-500/20 animate-spin [animation-duration:30s] pointer-events-none" />
                <div className="absolute inset-6 rounded-full border border-dashed border-indigo-500/30 animate-spin [animation-duration:20s] [animation-direction:reverse] pointer-events-none" />
                <div className="absolute inset-16 rounded-full bg-gradient-to-tr from-purple-600/20 to-indigo-600/10 blur-2xl pointer-events-none" />

                {/* Main Hero Product Image */}
                <div
                  className={`relative z-10 ${
                    activeSlide.id === 'slide-smartphone' ? 'w-full h-full' : 'w-4/5 h-4/5'
                  } flex items-center justify-center p-2 sm:p-4`}
                >
                  <img
                    src={activeSlide.image}
                    alt={activeSlide.imageAlt}
                    className="max-w-full max-h-full object-contain filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.6)] transform hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Floating Benefit Cards (rendered on slides without built-in badges) */}
                {activeSlide.id !== 'slide-smartphone' && (
                  <>
                    <div className="hidden sm:flex absolute top-4 left-0 bg-slate-900/90 backdrop-blur-md border border-white/15 rounded-2xl p-3 shadow-2xl items-center gap-3 animate-bounce [animation-duration:3s]">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                        <Zap size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Instant Payment</p>
                        <p className="text-[10px] text-slate-400">UPI / Bank at Pickup</p>
                      </div>
                    </div>

                    <div className="hidden sm:flex absolute bottom-4 right-0 bg-slate-900/90 backdrop-blur-md border border-white/15 rounded-2xl p-3 shadow-2xl items-center gap-3 animate-bounce [animation-duration:4s]">
                      <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                        <Truck size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Free Doorstep Pickup</p>
                        <p className="text-[10px] text-slate-400">200+ Cities in India</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Navigation Arrows - desktop only to prevent mobile overflow */}
        <button
          onClick={prevSlide}
          className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-white items-center justify-center transition-all z-20 hover:scale-110"
          aria-label="Previous Slide"
        >
          <ChevronLeft size={22} />
        </button>
        <button
          onClick={nextSlide}
          className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-white items-center justify-center transition-all z-20 hover:scale-110"
          aria-label="Next Slide"
        >
          <ChevronRight size={22} />
        </button>

        {/* Carousel Indicators / Slide Bar */}
        <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-2 z-20">
          {slides.map((s, index) => (
            <button
              key={s.id}
              onClick={() => setCurrent(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === current ? 'w-8 bg-purple-500' : 'w-2.5 bg-white/30 hover:bg-white/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
