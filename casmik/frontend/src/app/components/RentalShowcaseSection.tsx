'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Camera,
  Video,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronRight,
  Star,
} from 'lucide-react';
import { RentalCamera, getRentalCameras } from '@/lib/rentalCatalog';

export default function RentalShowcaseSection() {
  const [cameras, setCameras] = useState<RentalCamera[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    setCameras(getRentalCameras());
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<RentalCamera[]>;
      if (customEvent.detail) {
        setCameras(customEvent.detail);
      } else {
        setCameras(getRentalCameras());
      }
    };
    window.addEventListener('casmik_rental_catalog_updated', handleUpdate);
    return () => window.removeEventListener('casmik_rental_catalog_updated', handleUpdate);
  }, []);

  const categories = [
    { id: 'all', label: 'All Rental Gear' },
    { id: 'Cinema Cameras', label: 'Cinema Cameras' },
    { id: 'Mirrorless', label: 'Mirrorless' },
    { id: 'Cinema Lenses', label: 'Cinema Lenses' },
    { id: 'Gimbals & Rigs', label: 'Gimbals & Rigs' },
  ];

  const displayedCameras = cameras
    .filter((c) => selectedCategory === 'all' || c.category === selectedCategory)
    .slice(0, 6);

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-b from-slate-900 to-slate-950 text-white relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 relative z-10">
        {/* Header Strip */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-[11px] font-black uppercase tracking-wider text-rose-400 mb-3">
              <Camera size={13} className="text-rose-400" />
              Camera &amp; Cinema Equipment Rental
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              Rent Pro Cinema &amp; Mirrorless Gear
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              Equip your shoot with calibrated Sony FX3, Canon R5, Nikon Z8, cinema glass &amp; gimbals. Delivered straight to your shoot location.
            </p>
          </div>

          <Link
            href="/rental-cameras"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs sm:text-sm font-extrabold transition-all group shrink-0"
          >
            <span>Explore All Rental Gear</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-lg shadow-rose-600/30'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/60'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Camera Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedCameras.map((cam) => (
            <div
              key={cam.id}
              className="group bg-slate-900/90 rounded-3xl border border-slate-800/80 hover:border-rose-500/50 p-5 shadow-lg hover:shadow-2xl hover:shadow-rose-500/10 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Image Container with Badges */}
                <div className="relative aspect-[4/3] rounded-2xl bg-slate-950/80 p-4 border border-slate-800/80 flex items-center justify-center overflow-hidden mb-4 group-hover:border-slate-700 transition-colors">
                  <img
                    src={cam.image}
                    alt={cam.model}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = '/assets/images/categories/dslr.png';
                    }}
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md border border-slate-700/80 text-[10px] font-black uppercase tracking-wider text-rose-400">
                    {cam.brand}
                  </span>
                  <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Available
                  </span>
                </div>

                {/* Title & Specs */}
                <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold mb-1">
                  <Star size={13} className="fill-amber-400" />
                  <span>{cam.rating.toFixed(1)}</span>
                  <span className="text-slate-500 font-normal">({cam.reviewsCount} verified shoots)</span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white group-hover:text-rose-400 transition-colors line-clamp-1">
                  {cam.model}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-1">{cam.sensor}</p>

                {/* Included Kit Highlight */}
                <div className="mt-3.5 pt-3 border-t border-slate-800/80 text-[11px] text-slate-300 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-rose-400 shrink-0" />
                    <span className="truncate">{cam.includedKit[0] || 'Complete Camera Kit'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-rose-400 shrink-0" />
                    <span className="truncate">{cam.includedKit[1] || 'Dual Bay Fast Charger'}</span>
                  </div>
                </div>
              </div>

              {/* Price & Action */}
              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg sm:text-xl font-black text-white">
                      ₹{cam.dailyPrice.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-slate-400">/day</span>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Deposit: ₹{cam.securityDeposit.toLocaleString('en-IN')} (Refundable)
                  </p>
                </div>

                <Link
                  href={`/rental-cameras?id=${cam.id}`}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white font-extrabold text-xs shadow-md shadow-rose-600/20 flex items-center gap-1.5 transition-all hover:scale-105 shrink-0"
                >
                  <span>Rent Now</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
