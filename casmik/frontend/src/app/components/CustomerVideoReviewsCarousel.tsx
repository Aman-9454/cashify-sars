'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Star, ChevronLeft, ChevronRight, Play, CheckCircle2, ShieldCheck, Sparkles, MapPin, X, ArrowRight } from 'lucide-react';
import AppImage from '@/components/ui/AppImage';
import Link from 'next/link';

interface VideoReview {
  id: string;
  name: string;
  role: string;
  city: string;
  gearSold: string;
  gearTypeLabel: string;
  amountReceived: string;
  rating: number;
  duration: string;
  thumbnail: string;
  avatar: string;
  quote: string;
  highlight: string;
  verifiedBadge: string;
  actionUrl: string;
  actionText: string;
}

const reviews: VideoReview[] = [
  {
    id: 'rev-1',
    name: 'Prateek Sharma',
    role: 'Software Engineer & Tech Creator',
    city: 'Bengaluru (Indiranagar)',
    gearSold: 'Apple iPhone 15 Pro Max (256GB)',
    gearTypeLabel: 'Device Sold',
    amountReceived: '₹88,000',
    rating: 5,
    duration: '1:12',
    thumbnail: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
    quote: 'Sold my iPhone 15 Pro Max in just 2 hours! The technician tested the OLED display, battery cycle, and Face ID at my doorstep in Indiranagar and transferred ₹88,000 via UPI on the spot.',
    highlight: 'Instant UPI Payment in 2 Mins',
    verifiedBadge: 'Verified iPhone Seller',
    actionUrl: '/sell-device-get-quote?cat=cat-smartphone',
    actionText: 'Check Phone Resale Value',
  },
  {
    id: 'rev-2',
    name: 'Megha Singhal',
    role: 'UI/UX Product Designer',
    city: 'Mumbai (Bandra West)',
    gearSold: 'MacBook Pro 14" M3 Pro (18GB / 512GB)',
    gearTypeLabel: 'Refurbished Purchase',
    amountReceived: 'Saved ₹75,000',
    rating: 5,
    duration: '0:58',
    thumbnail: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format&fit=crop',
    quote: 'Bought a certified refurbished MacBook Pro M3. It arrived looking 100% brand new with 100% battery health, full box, and a 12-month Camsik warranty. Best tech decision ever!',
    highlight: '12-Month Warranty Included',
    verifiedBadge: 'Verified MacBook Buyer',
    actionUrl: '/buy-refurbished',
    actionText: 'Explore Refurbished MacBooks',
  },
  {
    id: 'rev-3',
    name: 'Rajesh Kannan',
    role: 'Wedding Cinematographer',
    city: 'Chennai (T. Nagar)',
    gearSold: 'Sony Alpha 7 IV + FE 24-70mm f/2.8 GM',
    gearTypeLabel: 'Camera Gear Sold',
    amountReceived: '₹1,82,000',
    rating: 5,
    duration: '1:34',
    thumbnail: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800&auto=format&fit=crop',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    quote: 'Sold my wedding backup camera kit — full-frame body and fast zoom lens. Seamless doorstep pickup, digital laser sensor check, and direct bank transfer without any stress.',
    highlight: 'Same Day Pro Camera Valuation',
    verifiedBadge: 'Verified Sony Pro Seller',
    actionUrl: '/sell-device-get-quote?cat=cat-dslr',
    actionText: 'Sell Camera & Optics',
  },
  {
    id: 'rev-4',
    name: 'Ananya Roy',
    role: 'Digital Creator & Podcaster',
    city: 'Delhi NCR (Cyber City)',
    gearSold: 'iPhone 13 ➔ iPhone 15 Pro (1-Step Upgrade)',
    gearTypeLabel: 'Device Exchange',
    amountReceived: '+₹5,000 Trade Bonus',
    rating: 5,
    duration: '1:05',
    thumbnail: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?q=80&w=800&auto=format&fit=crop',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
    quote: 'The 1-step doorstep exchange was sheer brilliance! The technician brought my upgraded iPhone 15 Pro, inspected my old iPhone 13 right there, and I only paid the tiny difference.',
    highlight: 'Doorstep 1-Step Swap',
    verifiedBadge: 'Verified Exchange Customer',
    actionUrl: '/exchange-device',
    actionText: 'Calculate Exchange Bonus',
  },
  {
    id: 'rev-5',
    name: 'Vikramaditya Joshi',
    role: 'Product Lead & Freelancer',
    city: 'Pune (Kothrud)',
    gearSold: 'Dell XPS 15 9520 + Apple iPad Pro',
    gearTypeLabel: 'Tech Liquidated',
    amountReceived: '₹94,500',
    rating: 5,
    duration: '1:20',
    thumbnail: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=800&auto=format&fit=crop',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
    quote: 'Sold both my work laptop and iPad. The executive performed DoD data wipe in front of me, ensuring complete corporate compliance and privacy. Transferred funds via IMPS in 2 minutes flat!',
    highlight: 'Certified DoD Data Wipe',
    verifiedBadge: 'Verified Laptop & iPad Seller',
    actionUrl: '/sell-device-get-quote?cat=cat-laptop',
    actionText: 'Sell Laptop or Tablet',
  },
];

export default function CustomerVideoReviewsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlayingModal, setIsPlayingModal] = useState<VideoReview | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  // Auto slide every 5 seconds if not hovered or playing
  useEffect(() => {
    if (!isAutoPlaying || isPlayingModal) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, isPlayingModal]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? reviews.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 50) {
      handleNext();
    } else if (touchEndX.current - touchStartX.current > 50) {
      handlePrev();
    }
  };

  return (
    <section 
      className="py-10 lg:py-16 bg-gradient-to-b from-slate-50 via-white to-slate-50 overflow-hidden relative"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        {/* Header with Badges */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold uppercase tracking-wider mb-2.5">
              <Sparkles size={13} className="text-purple-600" />
              Real Stories from Verified Users
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Customer Video Reviews &amp; Stories
            </h2>
            <p className="text-slate-600 mt-2 text-sm sm:text-base max-w-2xl">
              Hear directly from creators, professionals, and users who sold, bought, or exchanged smartphones, MacBooks, DSLRs, and tablets on Camsik with instant bank payouts.
            </p>
          </div>

          {/* Navigation Controls & Counter */}
          <div className="flex items-center gap-3 self-start md:self-auto">
            <span className="text-sm font-semibold text-slate-500 mr-2">
              <strong className="text-slate-900">{currentIndex + 1}</strong> / {reviews.length}
            </span>
            <button
              onClick={handlePrev}
              className="w-11 h-11 rounded-full border border-slate-200 bg-white text-slate-800 hover:bg-slate-900 hover:text-white hover:border-slate-900 flex items-center justify-center transition-all duration-200 shadow-sm"
              aria-label="Previous review"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={handleNext}
              className="w-11 h-11 rounded-full border border-slate-200 bg-white text-slate-800 hover:bg-slate-900 hover:text-white hover:border-slate-900 flex items-center justify-center transition-all duration-200 shadow-sm"
              aria-label="Next review"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Carousel Slider */}
        <div 
          className="relative"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Active Card Showcase (Split 2-column on desktop) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden p-5 sm:p-7 lg:p-9 transition-all duration-500">
            {/* Left: Video Preview Card with Play Trigger */}
            <div className="lg:col-span-5 relative group">
              <div className="relative aspect-[4/3] sm:aspect-video lg:aspect-[4/3] rounded-2xl overflow-hidden shadow-inner bg-slate-900">
                <AppImage
                  src={reviews[currentIndex].thumbnail}
                  alt={`${reviews[currentIndex].name} tech review`}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />

                {/* Duration Badge */}
                <div className="absolute top-4 left-4 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md text-white text-xs font-medium tracking-wide">
                  ▶ {reviews[currentIndex].duration}
                </div>

                {/* Verified Tag */}
                <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold backdrop-blur-sm shadow-md">
                  <ShieldCheck size={14} />
                  {reviews[currentIndex].verifiedBadge}
                </div>

                {/* Play Button Overlay */}
                <button
                  onClick={() => setIsPlayingModal(reviews[currentIndex])}
                  className="absolute inset-0 m-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/95 text-emerald-600 shadow-2xl flex items-center justify-center hover:scale-110 hover:bg-emerald-600 hover:text-white transition-all duration-300 group-hover:ring-8 group-hover:ring-emerald-500/20"
                  aria-label="Play video review"
                >
                  <Play size={28} className="ml-1 fill-current" />
                </button>

                {/* Bottom Overlay Info on Video */}
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <p className="text-[11px] uppercase tracking-wider text-slate-300 font-bold mb-1">
                    {reviews[currentIndex].gearTypeLabel}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="font-extrabold text-sm sm:text-base truncate mr-2">
                      {reviews[currentIndex].gearSold}
                    </p>
                    <span className="text-xs sm:text-sm font-black bg-emerald-500/90 px-3 py-0.5 rounded-full text-white shrink-0">
                      {reviews[currentIndex].amountReceived}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Review Details & Quote */}
            <div className="lg:col-span-7 flex flex-col justify-between py-2 lg:px-4">
              <div>
                {/* Rating & Highlight Pill */}
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={18}
                        className={i < reviews[currentIndex].rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300 fill-slate-300'}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    ★ 5.0 Verified Experience
                  </span>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 size={13} />
                    {reviews[currentIndex].highlight}
                  </span>
                </div>

                {/* Quote */}
                <blockquote className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 leading-relaxed mb-6">
                  &ldquo;{reviews[currentIndex].quote}&rdquo;
                </blockquote>
              </div>

              {/* Author Info and City */}
              <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-slate-200 ring-2 ring-slate-100 shrink-0">
                    <AppImage
                      src={reviews[currentIndex].avatar}
                      alt={reviews[currentIndex].name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base leading-tight">
                      {reviews[currentIndex].name}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {reviews[currentIndex].role}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-slate-500 font-medium mt-0.5">
                      <MapPin size={12} className="text-purple-600" />
                      {reviews[currentIndex].city}
                    </div>
                  </div>
                </div>

                {/* Quick Action CTA */}
                <Link
                  href={reviews[currentIndex].actionUrl}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all duration-200"
                >
                  <span>{reviews[currentIndex].actionText}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Play Modal Mock */}
      {isPlayingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-700">
            <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                <span className="font-bold text-sm text-white">
                  Verified Video Story · {isPlayingModal.name} ({isPlayingModal.city})
                </span>
              </div>
              <button
                onClick={() => setIsPlayingModal(null)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>
            <div className="aspect-video relative bg-black flex items-center justify-center">
              <AppImage
                src={isPlayingModal.thumbnail}
                alt={isPlayingModal.name}
                fill
                className="object-cover opacity-60"
              />
              <div className="relative z-10 text-center p-6">
                <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <Play size={28} className="ml-1 fill-current" />
                </div>
                <p className="text-white font-extrabold text-lg sm:text-xl">
                  {isPlayingModal.gearSold}
                </p>
                <p className="text-emerald-400 font-bold text-sm mt-1">
                  {isPlayingModal.amountReceived} Instant Payout
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
